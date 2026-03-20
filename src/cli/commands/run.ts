import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { loadAgent } from "../../runtime/agent-loader.js";
import { runAgentLoop } from "../../runtime/agent-loop.js";
import { getToolsForAgent } from "../../tools/registry.js";
import { createTaskBranch, commitAgentAction, switchToMain, getCloseRepoPath } from "../../git/repo.js";
import { createPullRequest } from "../../git/pr.js";
import { appendAuditLog } from "../../git/audit.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const AGENTS_DIR = join(__dirname, "..", "..", "..", "agents");

const AGENT_DIR_MAP: Record<string, string> = {
  atlas: "atlas-cash-recon",
  nova: "nova-ap-recon",
  echo: "echo-variance",
};

const TASK_DESCRIPTIONS: Record<string, string> = {
  atlas: `You are performing the cash reconciliation for Meridian Engineering Pty Ltd (MER-AU-ENG) for January 2025.
Your target is GL account 1000-001 (Westpac Operating Account).

Steps:
1. Fetch the bank statement for entity MER-AU-ENG, GL account 1000-001, period 2025-01
2. Query the GL balance for account 1000-001, period 2025-01
3. Query all GL transactions for account 1000-001, period 2025-01
4. Match bank transactions to GL entries
5. For any unmatched items, check your memory for known patterns
6. Generate a reconciliation workpaper
7. Create exceptions for items that cannot be explained
8. Propose journal entries for items with known treatments (bank fees, interest, insurance)

Remember: The opening balance for 1000-001 is $2,830,241.56.`,

  nova: `You are performing the AP sub-ledger reconciliation for Meridian Engineering Pty Ltd (MER-AU-ENG) for January 2025.
Your target is GL account 2000-001 (Trade Payables).

Steps:
1. Query all open AP invoices for entity MER-AU-ENG
2. Query the GL balance for account 2000-001, period 2025-01
3. Compare the AP sub-ledger total to the GL balance
4. For each AP invoice, trace it to a GL posting by reference
5. Identify any cutoff errors (invoice in AP but GL posting in different period)
6. Generate a reconciliation workpaper
7. Create exceptions for any discrepancies found

Remember: Check for period boundary issues — invoices dated near month-end.`,

  echo: `You are generating P&L variance commentary for Meridian Engineering Pty Ltd (MER-AU-ENG) for January 2025.

Steps:
1. Query budget lines for entity MER-AU-ENG, period 2025-01
2. Query current period actuals for entity MER-AU-ENG, period 2025-01
3. Query prior year same period actuals for YoY comparison
4. Compute variances between budget and actuals
5. Generate management commentary for material variances

Remember: Revenue in GL is negative (credit balance). Present as positive in commentary.
Favorable variance: actual < budget for expenses, actual > budget (absolute) for revenue.
NEVER invent explanations. Cite evidence from memory or data.`,
};

export async function runTask(
  taskName: string,
  agentName: string,
  opts: { replay?: boolean } = {}
): Promise<void> {
  console.log(`\n🤖 Running ${agentName} on task: ${taskName}`);
  console.log(`   Mode: ${opts.replay ? "REPLAY (cached responses)" : "LIVE"}`);

  const agentDirName = AGENT_DIR_MAP[agentName];
  if (!agentDirName) {
    console.error(`❌ Unknown agent: ${agentName}`);
    process.exit(1);
  }

  const agentDir = join(AGENTS_DIR, agentDirName);
  const agent = loadAgent(agentDir);
  const tools = getToolsForAgent(agent.config.tools);

  // Create feature branch
  const branchName = await createTaskBranch(taskName);
  console.log(`   📌 Branch: ${branchName}`);

  appendAuditLog({
    agent: agentName,
    action: "AGENT_START",
    result_summary: `Started ${agentName} on branch ${branchName}`,
  });

  const startTime = Date.now();

  const result = await runAgentLoop(agent, tools, {
    replay: opts.replay,
    cacheDir: join(process.cwd(), "demo", "cached-responses"),
    taskDescription: TASK_DESCRIPTIONS[agentName],
    onIteration: (iter, msg) => {
      console.log(`   🔄 ${msg}`);
    },
    onToolCall: (tool, params) => {
      const paramSummary = Object.keys(params).slice(0, 3).join(", ");
      console.log(`   🔧 Tool: ${tool}(${paramSummary})`);

      appendAuditLog({
        agent: agentName,
        action: "TOOL_CALL",
        tool,
        params: Object.fromEntries(
          Object.entries(params).map(([k, v]) => [k, typeof v === "string" ? v : "[object]"])
        ),
      });
    },
    onToolResult: (tool, _result) => {
      appendAuditLog({
        agent: agentName,
        action: "TOOL_RESULT",
        tool,
        result_summary: typeof _result === "string" ? _result.slice(0, 200) : "ok",
      });
    },
    commitFn: async (message: string, files: Map<string, string>) => {
      const hash = await commitAgentAction(
        `feat(${agentName}): ${message}`,
        files,
        agent.config.identity.display_name
      );

      appendAuditLog({
        agent: agentName,
        action: "COMMIT",
        result_summary: message,
        commit_hash: hash,
      });

      console.log(`   📝 Commit: ${hash.slice(0, 7)} — ${message}`);
    },
  });

  const elapsed = Math.round((Date.now() - startTime) / 1000);

  if (result.success) {
    // Commit any remaining outputs
    if (result.outputs.size > 0) {
      const hash = await commitAgentAction(
        `feat(${agentName}): complete ${taskName}`,
        result.outputs,
        agent.config.identity.display_name
      );
      console.log(`   📝 Final commit: ${hash.slice(0, 7)}`);
    }

    // Create PR
    const pr = createPullRequest(
      branchName,
      `[${agent.config.identity.display_name}] ${taskName}`,
      result.finalText.slice(0, 1000),
      agentName,
      taskName,
      {
        filesChanged: Array.from(result.outputs.keys()),
        exceptions: result.exceptions.map((e) => String((e as Record<string, unknown>).exception_id ?? "")),
        proposedJEs: result.proposedJEs.map((j) => String((j as Record<string, unknown>).je_id ?? "")),
      }
    );

    // Switch back to main
    await switchToMain();

    appendAuditLog({
      agent: agentName,
      action: "AGENT_COMPLETE",
      pr_id: pr.id,
      result_summary: `Completed in ${result.iterations} iterations, ${elapsed}s. PR #${pr.id} created.`,
    });

    console.log(`\n   ✅ ${agentName} completed in ${result.iterations} iterations (${elapsed}s)`);
    console.log(`   📬 PR #${pr.id} created: "${pr.title}"`);
    console.log(`   📊 ${result.exceptions.length} exceptions, ${result.proposedJEs.length} proposed JEs`);
  } else {
    await switchToMain();

    appendAuditLog({
      agent: agentName,
      action: "AGENT_FAILED",
      result_summary: `Failed after ${result.iterations} iterations: ${result.error}`,
    });

    console.error(`\n   ❌ ${agentName} failed after ${result.iterations} iterations (${elapsed}s)`);
    console.error(`   Error: ${result.error}`);
  }
}
