import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { mergeBranch, tagClose, getCloseRepoPath, switchToMain, commitAgentAction } from "../../git/repo.js";
import { listPullRequests, markPRMerged } from "../../git/pr.js";
import { appendAuditLog, readAuditLog } from "../../git/audit.js";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

export async function finalizeClose(): Promise<void> {
  console.log("\n🏁 Finalizing close cycle...\n");

  const prs = listPullRequests();
  const approvedPRs = prs.filter((pr) => pr.status === "APPROVED");
  const openPRs = prs.filter((pr) => pr.status === "OPEN");

  if (openPRs.length > 0) {
    console.log(`  ⚠️  ${openPRs.length} PRs still awaiting review:`);
    for (const pr of openPRs) {
      console.log(`     PR #${pr.id}: ${pr.title}`);
    }
    console.log(`\n  Approve them first, or they will not be included.\n`);
  }

  if (approvedPRs.length === 0) {
    console.log("  ❌ No approved PRs to merge. Nothing to finalize.");
    return;
  }

  await switchToMain();

  for (const pr of approvedPRs) {
    console.log(`  🔀 Merging PR #${pr.id}: ${pr.branch}...`);

    try {
      const mergeHash = await mergeBranch(pr.branch, pr.reviewer ?? "system");
      markPRMerged(pr.id, mergeHash);

      appendAuditLog({
        agent: "system",
        action: "PR_MERGED",
        pr_id: pr.id,
        reviewer: pr.reviewer,
        commit_hash: mergeHash,
        result_summary: `Merged ${pr.branch} by ${pr.reviewer}`,
      });

      console.log(`     ✅ Merged (${mergeHash.slice(0, 7)})`);
    } catch (err) {
      console.error(`     ❌ Merge failed: ${(err as Error).message}`);
    }
  }

  // Read close config and update status
  const configPath = join(getCloseRepoPath(), "close.yaml");
  const config = parseYaml(readFileSync(configPath, "utf-8")) as Record<string, unknown>;
  config.status = "CLOSED";
  config.closed_at = new Date().toISOString();
  writeFileSync(configPath, stringifyYaml(config), "utf-8");

  // Update checklist
  const checklistPath = join(getCloseRepoPath(), "CHECKLIST.md");
  let checklist = readFileSync(checklistPath, "utf-8");
  checklist = checklist.replace(/\[ \]/g, "[x]");
  writeFileSync(checklistPath, checklist, "utf-8");

  // Generate close summary
  const allPRs = listPullRequests();
  const auditEntries = readAuditLog();
  const summary = generateCloseSummary(config, allPRs, auditEntries);

  // Commit final state
  const files = new Map<string, string>();
  files.set("CHECKLIST.md", checklist);
  files.set("close.yaml", stringifyYaml(config));
  files.set("CLOSE_SUMMARY.md", summary);

  await commitAgentAction(
    "chore: finalize close cycle",
    files,
    "GitClose Platform"
  );

  // Tag
  const period = String(config.period ?? "unknown");
  await tagClose(period);

  appendAuditLog({
    agent: "system",
    action: "CLOSE_FINALIZED",
    result_summary: `Close cycle finalized. Tag: v${period}-close`,
  });

  console.log(`\n  🏷️  Tagged: v${period}-close`);
  console.log(`  📊 Close summary written to CLOSE_SUMMARY.md`);
  console.log(`\n  ✅ Close cycle complete!\n`);
}

function generateCloseSummary(
  config: Record<string, unknown>,
  prs: Array<{ id: number; title: string; agent: string; status: string; reviewer?: string; exceptions: string[]; proposed_jes: string[] }>,
  auditEntries: Array<{ timestamp: string; agent: string; action: string }>
): string {
  let md = `# Close Summary\n\n`;
  md += `**Entity:** ${config.entity_id}\n`;
  md += `**Period:** ${config.period}\n`;
  md += `**Opened:** ${config.opened_at}\n`;
  md += `**Closed:** ${config.closed_at}\n\n`;

  md += `## Pull Requests\n\n`;
  md += `| PR | Title | Agent | Status | Reviewer |\n`;
  md += `|----|-------|-------|--------|----------|\n`;
  for (const pr of prs) {
    md += `| #${pr.id} | ${pr.title} | ${pr.agent} | ${pr.status} | ${pr.reviewer ?? "—"} |\n`;
  }
  md += `\n`;

  const totalExceptions = prs.reduce((s, p) => s + p.exceptions.length, 0);
  const totalJEs = prs.reduce((s, p) => s + p.proposed_jes.length, 0);

  md += `## Statistics\n\n`;
  md += `- Total PRs: ${prs.length}\n`;
  md += `- Merged: ${prs.filter((p) => p.status === "MERGED").length}\n`;
  md += `- Exceptions raised: ${totalExceptions}\n`;
  md += `- Proposed journal entries: ${totalJEs}\n`;
  md += `- Audit log entries: ${auditEntries.length}\n`;

  return md;
}
