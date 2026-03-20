import { approvePR, rejectPR, getPullRequest } from "../../git/pr.js";
import { appendAuditLog } from "../../git/audit.js";

export async function reviewPR(
  prId: number,
  action: string,
  reviewer: string
): Promise<void> {
  console.log(`\n🔍 Reviewing PR #${prId}...`);

  const pr = getPullRequest(prId);
  if (!pr) {
    console.error(`❌ PR #${prId} not found`);
    process.exit(1);
  }

  console.log(`  Title: ${pr.title}`);
  console.log(`  Branch: ${pr.branch}`);
  console.log(`  Agent: ${pr.agent}`);
  console.log(`  Files: ${pr.files_changed.length}`);
  console.log(`  Exceptions: ${pr.exceptions.length}`);
  console.log(`  Proposed JEs: ${pr.proposed_jes.length}`);

  if (action === "approve") {
    const approved = approvePR(prId, reviewer);
    appendAuditLog({
      agent: "system",
      action: "PR_APPROVED",
      pr_id: prId,
      reviewer,
      result_summary: `PR #${prId} approved by ${reviewer}`,
    });

    console.log(`\n  ✅ PR #${prId} approved by ${reviewer}`);
    console.log(`     Reviewed at: ${approved.reviewed_at}`);
    console.log(`\n  Run \`gitclose finalize\` to merge all approved PRs.`);
  } else if (action === "reject") {
    rejectPR(prId, reviewer);
    appendAuditLog({
      agent: "system",
      action: "PR_REJECTED",
      pr_id: prId,
      reviewer,
      result_summary: `PR #${prId} rejected by ${reviewer}`,
    });

    console.log(`\n  ❌ PR #${prId} rejected by ${reviewer}`);
  } else {
    console.error(`❌ Unknown action: ${action}. Use 'approve' or 'reject'.`);
    process.exit(1);
  }
}
