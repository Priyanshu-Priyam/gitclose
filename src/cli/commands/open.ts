import { initCloseRepo } from "../../git/repo.js";
import { appendAuditLog } from "../../git/audit.js";

export async function openClose(entityId: string, period: string): Promise<void> {
  console.log(`\n📂 Opening close cycle for ${entityId}, period ${period}...`);

  const repoPath = await initCloseRepo(entityId, period);

  appendAuditLog({
    agent: "system",
    action: "OPEN_CLOSE",
    result_summary: `Close cycle opened for ${entityId}, period ${period}`,
  });

  console.log(`  ✅ Close repo initialized at ${repoPath}`);
  console.log(`  📋 Tasks assigned:`);
  console.log(`     1. Cash Reconciliation (Atlas)`);
  console.log(`     2. AP Sub-Ledger Reconciliation (Nova)`);
  console.log(`     3. P&L Variance Commentary (Echo)`);
  console.log(`\n  Run \`gitclose run-all\` to execute all agents sequentially.`);
}
