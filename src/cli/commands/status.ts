import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { getCloseRepoPath } from "../../git/repo.js";
import { listPullRequests } from "../../git/pr.js";
import { getAuditSummary } from "../../git/audit.js";

export async function showStatus(): Promise<void> {
  const repoPath = getCloseRepoPath();

  if (!existsSync(repoPath)) {
    console.log("\n❌ No active close cycle. Run `gitclose open` first.\n");
    return;
  }

  const statusPath = join(repoPath, ".gitclose", "status.json");
  if (!existsSync(statusPath)) {
    console.log("\n❌ Status file not found.\n");
    return;
  }

  const status = JSON.parse(readFileSync(statusPath, "utf-8"));
  const prs = listPullRequests();
  const auditSummary = getAuditSummary();

  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  GitClose — Close Status Dashboard");
  console.log("═══════════════════════════════════════════════════════\n");

  console.log(`  Entity:  ${status.entity_id}`);
  console.log(`  Period:  ${status.period}`);
  console.log(`  Status:  ${status.status}`);
  console.log(`  Updated: ${status.updated_at ?? "—"}\n`);

  console.log("  Tasks:");
  console.log("  ┌─────────────────────────────────────────────┬────────┬──────┐");
  console.log("  │ Task                                        │ Agent  │ Status│");
  console.log("  ├─────────────────────────────────────────────┼────────┼──────┤");

  for (const task of status.tasks ?? []) {
    const pr = prs.find((p) => p.task_id === task.id);
    const taskStatus = pr ? `PR#${pr.id} ${pr.status}` : task.status;
    const name = task.name.padEnd(43);
    const agent = task.agent.padEnd(6);
    console.log(`  │ ${name} │ ${agent} │ ${taskStatus.padEnd(5)}│`);
  }

  console.log("  └─────────────────────────────────────────────┴────────┴──────┘\n");

  if (prs.length > 0) {
    console.log("  Pull Requests:");
    for (const pr of prs) {
      const icon = pr.status === "MERGED" ? "✅" : pr.status === "APPROVED" ? "👍" : pr.status === "OPEN" ? "📬" : "❌";
      console.log(`    ${icon} PR #${pr.id}: ${pr.title} [${pr.status}]`);
      if (pr.reviewer) console.log(`       Reviewer: ${pr.reviewer}`);
      if (pr.exceptions.length > 0) console.log(`       Exceptions: ${pr.exceptions.length}`);
    }
    console.log();
  }

  console.log(`  Audit Trail: ${auditSummary.total_entries} entries`);
  if (auditSummary.total_entries > 0) {
    for (const [agent, count] of Object.entries(auditSummary.by_agent)) {
      console.log(`    ${agent}: ${count} actions`);
    }
  }

  console.log("\n═══════════════════════════════════════════════════════\n");
}
