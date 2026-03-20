/**
 * Pre-tool-use hook for Atlas cash reconciliation agent.
 * Runs BEFORE every tool invocation.
 * Returns { allow: true/false, reason: string }
 */
export default function preToolUse({ tool, params, context }) {
  
  // RULE: Never allow GL modification tools
  if (['post_journal', 'modify_gl', 'delete_transaction'].includes(tool)) {
    return {
      allow: false,
      reason: 'Atlas is not permitted to modify the general ledger. ' +
              'Use propose_journal_entry instead.'
    };
  }

  // RULE: Escalate exceptions over threshold
  if (tool === 'create_exception' && params.amount) {
    const amount = Math.abs(parseFloat(params.amount));
    if (amount > 50000) {
      params.status = 'ESCALATED';
      params.assigned_to = 'james.wong@meridian.com.au';
      return {
        allow: true,
        reason: `Exception amount $${amount.toFixed(2)} exceeds $50,000 threshold. ` +
                `Auto-escalated to James Wong.`
      };
    }
  }

  // RULE: Escalate unidentified credits over $10K
  if (tool === 'create_exception' && 
      params.exception_type === 'UNMATCHED' &&
      params.amount > 0 &&
      Math.abs(params.amount) > 10000) {
    params.status = 'ESCALATED';
    params.assigned_to = 'james.wong@meridian.com.au';
    return {
      allow: true,
      reason: `Unidentified credit over $10,000 — escalated per Rule #8.`
    };
  }

  return { allow: true };
}
