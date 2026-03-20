import { getAPInvoices, getAllOpenAPInvoices } from "../../db/queries.js";
import type { APInvoice } from "../../db/queries.js";

export interface APSubledgerResult {
  entity_id: string;
  invoices: APInvoice[];
  total_amount: number;
  invoice_count: number;
  by_vendor: Array<{
    vendor_name: string;
    vendor_id: string;
    count: number;
    total: number;
  }>;
}

export function queryAPSubledger(
  entityId: string,
  options?: { period?: string; status?: string; vendorId?: string }
): APSubledgerResult {
  const invoices = options?.period || options?.status || options?.vendorId
    ? getAPInvoices(entityId, options)
    : getAllOpenAPInvoices(entityId);

  const totalAmount = Math.round(invoices.reduce((s, inv) => s + inv.amount, 0) * 100) / 100;

  const vendorMap = new Map<string, { vendor_name: string; vendor_id: string; count: number; total: number }>();
  for (const inv of invoices) {
    const existing = vendorMap.get(inv.vendor_id);
    if (existing) {
      existing.count++;
      existing.total = Math.round((existing.total + inv.amount) * 100) / 100;
    } else {
      vendorMap.set(inv.vendor_id, {
        vendor_name: inv.vendor_name,
        vendor_id: inv.vendor_id,
        count: 1,
        total: inv.amount,
      });
    }
  }

  return {
    entity_id: entityId,
    invoices,
    total_amount: totalAmount,
    invoice_count: invoices.length,
    by_vendor: Array.from(vendorMap.values()).sort((a, b) => b.total - a.total),
  };
}
