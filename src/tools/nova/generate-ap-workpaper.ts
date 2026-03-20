import type { InvoiceTraceResult } from "./trace-invoice.js";

export interface APWorkpaperInput {
  entity: string;
  period: string;
  ap_total: number;
  gl_balance: number;
  matched_invoices: InvoiceTraceResult[];
  cutoff_errors: InvoiceTraceResult[];
  missing_invoices: InvoiceTraceResult[];
  duplicate_warnings: InvoiceTraceResult[];
}

export function generateAPWorkpaper(input: APWorkpaperInput): string {
  const fmt = (n: number): string => {
    const abs = Math.abs(n);
    const formatted = abs.toLocaleString("en-AU", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return n < 0 ? `($${formatted})` : `$${formatted}`;
  };

  const glAbsolute = Math.abs(input.gl_balance);
  const difference = Math.round((input.ap_total - glAbsolute) * 100) / 100;

  let md = `# AP Sub-Ledger Reconciliation Workpaper\n\n`;
  md += `**Entity:** ${input.entity}\n`;
  md += `**Period:** ${input.period}\n`;
  md += `**GL Account:** 2000-001 (Trade Payables)\n`;
  md += `**Prepared by:** Nova (AP Reconciliation Agent)\n`;
  md += `**Date:** ${new Date().toISOString().split("T")[0]}\n\n`;
  md += `---\n\n`;

  md += `## Balance Comparison\n\n`;
  md += `| Source | Balance |\n`;
  md += `|--------|-------:|\n`;
  md += `| AP Sub-Ledger Total (open invoices) | ${fmt(input.ap_total)} |\n`;
  md += `| GL 2000-001 Balance | ${fmt(glAbsolute)} |\n`;
  md += `| **Difference** | **${fmt(difference)}** |\n\n`;

  if (Math.abs(difference) < 0.01) {
    md += `✅ **AP sub-ledger reconciles to GL**\n\n`;
  } else {
    md += `⚠️ **Difference of ${fmt(difference)} requires explanation**\n\n`;
  }

  md += `---\n\n`;

  md += `## Matched Invoices (${input.matched_invoices.length})\n\n`;
  md += `| Invoice Ref | Vendor | Amount | GL Match | Status |\n`;
  md += `|------------|--------|-------:|----------|--------|\n`;
  for (const m of input.matched_invoices) {
    md += `| ${m.invoice.invoice_ref} | ${m.invoice.vendor_name} | ${fmt(m.invoice.amount)} | ${m.gl_matches[0]?.journal_id ?? "—"} | ✅ Matched |\n`;
  }
  md += `\n`;

  if (input.cutoff_errors.length > 0) {
    md += `## Cutoff Errors (${input.cutoff_errors.length})\n\n`;
    for (const c of input.cutoff_errors) {
      md += `### ${c.invoice.invoice_ref} — ${c.invoice.vendor_name}\n\n`;
      md += `- **Invoice Amount:** ${fmt(c.invoice.amount)}\n`;
      md += `- **AP Period:** ${c.cutoff_detail?.ap_period}\n`;
      md += `- **GL Period:** ${c.cutoff_detail?.gl_period}\n`;
      md += `- **Days Difference:** ${c.cutoff_detail?.days_difference}\n`;
      md += `- **Notes:** ${c.notes}\n\n`;
    }
  }

  if (input.missing_invoices.length > 0) {
    md += `## Missing GL Postings (${input.missing_invoices.length})\n\n`;
    for (const m of input.missing_invoices) {
      md += `- **${m.invoice.invoice_ref}** (${m.invoice.vendor_name}): ${fmt(m.invoice.amount)} — ${m.notes}\n`;
    }
    md += `\n`;
  }

  if (input.duplicate_warnings.length > 0) {
    md += `## ⚠️ Duplicate Warnings (${input.duplicate_warnings.length})\n\n`;
    for (const d of input.duplicate_warnings) {
      md += `- **${d.invoice.invoice_ref}** (${d.invoice.vendor_name}): ${d.notes}\n`;
    }
    md += `\n`;
  }

  md += `---\n\n`;
  md += `## Summary\n\n`;
  md += `- Invoices matched: ${input.matched_invoices.length}\n`;
  md += `- Cutoff errors: ${input.cutoff_errors.length}\n`;
  md += `- Missing GL postings: ${input.missing_invoices.length}\n`;
  md += `- Duplicate warnings: ${input.duplicate_warnings.length}\n`;
  md += `- Total difference: ${fmt(difference)}\n`;

  return md;
}
