/**
 * Pre-tool-use hook for Nova AP reconciliation agent.
 * Runs BEFORE every tool invocation.
 * Returns { allow: true/false, reason?: string }
 *
 * Responsibilities:
 * - Block any tool that would modify GL or AP (read-only recon).
 * - Auto-escalate single-invoice exceptions over AUD 25,000 threshold.
 * - Enforce cutoff sensitivity: CUTOFF exceptions always assign to James Wong.
 */
export default function preToolUse({ tool, params, context }) {
  const GL_AP_WRITE_TOOLS = new Set([
    'post_journal_entry',
    'post_journal',
    'modify_gl',
    'delete_gl_transaction',
    'reverse_gl_entry',
    'modify_ap',
    'update_ap_invoice',
    'delete_ap_invoice',
    'approve_invoice',
    'approve_payment_batch',
    'release_payment',
    'void_ap_document',
  ]);

  if (GL_AP_WRITE_TOOLS.has(tool)) {
    return {
      allow: false,
      reason:
        'Nova operates read-only against GL and AP. Cannot post, approve, or mutate ' +
        'source transactions. Document findings via generate_recon_workpaper and ' +
        'create_exception; propose adjustments in narrative output for human posting.',
    };
  }

  if (tool === 'create_exception' && params && typeof params === 'object') {
    const raw = params.amount;
    const parsed =
      typeof raw === 'number' ? raw : parseFloat(String(raw).replace(/,/g, ''));
    const amount = Number.isFinite(parsed) ? Math.abs(parsed) : NaN;
    const overThreshold = amount > 25000;

    if (params.exception_type === 'CUTOFF') {
      params.assigned_to = 'james.wong@meridian.com.au';
      if (params.status !== 'CLOSED') {
        params.status = 'ESCALATED';
      }
    }

    if (overThreshold) {
      params.status = 'ESCALATED';
      params.assigned_to = 'james.wong@meridian.com.au';
      return {
        allow: true,
        reason: `Exception amount AUD ${amount.toFixed(2)} exceeds AUD 25,000 threshold — auto-escalated to James Wong.`,
      };
    }

    if (params.exception_type === 'CUTOFF' && params.status !== 'CLOSED') {
      return {
        allow: true,
        reason:
          'CUTOFF exception — assigned to James Wong per cutoff sensitivity policy (period-boundary review).',
      };
    }
  }

  return { allow: true };
}
