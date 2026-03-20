import { findGLByReference, findGLByReferenceAllPeriods } from "../../db/queries.js";
import type { GLTransaction, APInvoice } from "../../db/queries.js";

const AP_GL_ACCOUNT = "2000-001";

export interface InvoiceTraceResult {
  invoice: APInvoice;
  gl_matches: GLTransaction[];
  match_status: "MATCHED" | "CUTOFF" | "MISSING" | "DUPLICATE";
  cutoff_detail?: {
    ap_period: string;
    gl_period: string;
    days_difference: number;
  };
  notes: string;
}

export function traceInvoice(
  invoice: APInvoice,
  period: string
): InvoiceTraceResult {
  // First look in the same period, filtering to AP-relevant GL lines (2000-001 or expense accounts)
  const samePeriodAll = findGLByReference(invoice.invoice_ref, period);
  const samePeriodMatches = samePeriodAll.filter(
    (gl) => gl.account_id === AP_GL_ACCOUNT || gl.account_id === invoice.expense_account
  );

  if (samePeriodMatches.length === 1 || samePeriodMatches.length === 2) {
    return {
      invoice,
      gl_matches: samePeriodMatches,
      match_status: "MATCHED",
      notes: `GL posting found in period ${period} matching invoice ref ${invoice.invoice_ref}.`,
    };
  }

  if (samePeriodMatches.length > 2) {
    return {
      invoice,
      gl_matches: samePeriodMatches,
      match_status: "DUPLICATE",
      notes: `WARNING: Multiple GL postings found for invoice ref ${invoice.invoice_ref} in period ${period}. Potential duplicate.`,
    };
  }

  // Not found in same period — look across all periods for cutoff detection
  const allPeriodAll = findGLByReferenceAllPeriods(invoice.invoice_ref);
  const allPeriodMatches = allPeriodAll.filter(
    (gl) => gl.account_id === AP_GL_ACCOUNT || gl.account_id === invoice.expense_account
  );

  if (allPeriodMatches.length > 0) {
    const glEntry = allPeriodMatches[0];
    const apDate = new Date(invoice.invoice_date);
    const glDate = new Date(glEntry.posting_date);
    const daysDiff = Math.ceil(
      Math.abs(glDate.getTime() - apDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      invoice,
      gl_matches: allPeriodMatches,
      match_status: "CUTOFF",
      cutoff_detail: {
        ap_period: invoice.period,
        gl_period: glEntry.period,
        days_difference: daysDiff,
      },
      notes:
        `CUTOFF ERROR: AP invoice ${invoice.invoice_ref} is in period ${invoice.period} ` +
        `but GL posting is in period ${glEntry.period}. ` +
        `AP date: ${invoice.invoice_date}, GL date: ${glEntry.posting_date} (${daysDiff} days apart).`,
    };
  }

  // No GL posting found anywhere
  return {
    invoice,
    gl_matches: [],
    match_status: "MISSING",
    notes: `MISSING: No GL posting found for AP invoice ${invoice.invoice_ref} (${invoice.vendor_name}, $${invoice.amount.toFixed(2)}) in any period.`,
  };
}

export function compareBalances(
  apTotal: number,
  glBalance: number
): {
  ap_total: number;
  gl_balance: number;
  gl_balance_absolute: number;
  difference: number;
  is_reconciled: boolean;
  notes: string;
} {
  const glAbsolute = Math.abs(glBalance);
  const difference = Math.round((apTotal - glAbsolute) * 100) / 100;

  return {
    ap_total: apTotal,
    gl_balance: glBalance,
    gl_balance_absolute: glAbsolute,
    difference,
    is_reconciled: Math.abs(difference) < 0.01,
    notes: Math.abs(difference) < 0.01
      ? "AP sub-ledger and GL are in agreement."
      : `Difference of $${Math.abs(difference).toFixed(2)} — investigation required.`,
  };
}
