/**
 * Post-processing when Nova creates an AP reconciliation exception.
 * Enriches the record using vendor-oriented patterns from memory.
 *
 * Expected `memory` adapter (implementation-specific):
 *   memory.getVendorPatterns({ vendor, invoiceRef?, amount?, amountBand? })
 *   → array of { period, invoice_refs[], pattern_type, resolution?, pr_reference?, notes? }
 */
export default function onException({ exception, memory }) {
  const vendor =
    exception.vendor ||
    exception.counterparty ||
    exception.supplier_name ||
    '';

  const invoiceRef = exception.invoice_ref || exception.ap_reference || '';

  const amount = typeof exception.amount === 'number' ? exception.amount : parseFloat(exception.amount);
  const safeAmount = Number.isNaN(amount) ? 0 : amount;

  let patterns = [];
  if (memory && typeof memory.getVendorPatterns === 'function') {
    patterns = memory.getVendorPatterns({
      vendor,
      invoiceRef,
      amount: safeAmount,
      amountBand: [safeAmount - 0.01, safeAmount + 0.01],
    });
  }

  // Fallback: lightweight scan if host injects raw MEMORY.md text
  if (patterns.length === 0 && memory && typeof memory.getText === 'function') {
    const text = memory.getText('memory/MEMORY.md') || '';
    if (vendor && text.includes(vendor)) {
      patterns.push({
        period: 'MEMORY.md',
        pattern_type: 'VENDOR_MENTION',
        notes: 'Vendor name found in MEMORY.md — manual review recommended for timing/cutoff notes.',
      });
    }
  }

  if (patterns.length > 0) {
    const top = patterns[0];
    exception.memory_match = {
      found: true,
      vendor,
      pattern_type: top.pattern_type || 'VENDOR_HISTORY',
      prior_period: top.period,
      prior_invoice_refs: top.invoice_refs || [],
      prior_resolution: top.resolution || null,
      prior_pr: top.pr_reference || null,
      confidence: top.pattern_type === 'VENDOR_MENTION' ? 'LOW' : 'MEDIUM',
      suggestion: buildSuggestion(top, vendor),
    };
  } else {
    exception.memory_match = {
      found: false,
      vendor,
      suggestion:
        'No vendor-specific pattern in memory — perform full reference trace and date/cutoff analysis.',
    };
  }

  return exception;
}

function buildSuggestion(top, vendor) {
  const parts = [];
  if (top.period) parts.push(`Pattern context: ${top.period}.`);
  if (top.resolution) parts.push(`Prior resolution: ${top.resolution}.`);
  if (top.pr_reference) parts.push(`PR #${top.pr_reference}.`);
  if (top.notes) parts.push(top.notes);
  if (parts.length === 0) {
    return `Review MEMORY.md for "${vendor}" timing and cutoff history before closing investigation.`;
  }
  return parts.join(' ');
}
