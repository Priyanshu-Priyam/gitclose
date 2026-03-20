import type { MatchedPair } from "./match-transactions.js";
import type { BankTransaction } from "../../db/queries.js";

export interface ReconAdjustment {
  description: string;
  amount: number;
  type: "BANK_ADJUSTMENT" | "GL_ADJUSTMENT";
  reference?: string;
}

export interface WorkpaperInput {
  entity: string;
  period: string;
  gl_account: string;
  bank_balance: number;
  gl_balance: number;
  matched: MatchedPair[];
  timing: BankTransaction[];
  adjustments: ReconAdjustment[];
  exceptions: Array<{
    description: string;
    amount: number;
    counterparty?: string;
    memory_match?: boolean;
  }>;
}

export function generateReconWorkpaper(input: WorkpaperInput): string {
  const bankAdj = input.adjustments.filter((a) => a.type === "BANK_ADJUSTMENT");
  const glAdj = input.adjustments.filter((a) => a.type === "GL_ADJUSTMENT");

  const bankAdjTotal = bankAdj.reduce((s, a) => s + a.amount, 0);
  const glAdjTotal = glAdj.reduce((s, a) => s + a.amount, 0);

  const adjustedBank = Math.round((input.bank_balance + bankAdjTotal) * 100) / 100;
  const adjustedGL = Math.round((input.gl_balance + glAdjTotal) * 100) / 100;
  const difference = Math.round((adjustedBank - adjustedGL) * 100) / 100;

  const fmt = (n: number): string => {
    const abs = Math.abs(n);
    const formatted = abs.toLocaleString("en-AU", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return n < 0 ? `($${formatted})` : `$${formatted}`;
  };

  let md = `# Bank Reconciliation Workpaper\n\n`;
  md += `**Entity:** ${input.entity}\n`;
  md += `**Period:** ${input.period}\n`;
  md += `**GL Account:** ${input.gl_account}\n`;
  md += `**Prepared by:** Atlas (Cash Reconciliation Agent)\n`;
  md += `**Date:** ${new Date().toISOString().split("T")[0]}\n\n`;
  md += `---\n\n`;

  md += `## Reconciliation Summary\n\n`;

  md += `### Bank Side\n\n`;
  md += `| Item | Amount |\n`;
  md += `|------|-------:|\n`;
  md += `| Balance per bank statement | ${fmt(input.bank_balance)} |\n`;
  for (const adj of bankAdj) {
    md += `| ${adj.description} | ${fmt(adj.amount)} |\n`;
  }
  md += `| **Adjusted bank balance** | **${fmt(adjustedBank)}** |\n\n`;

  md += `### Book (GL) Side\n\n`;
  md += `| Item | Amount |\n`;
  md += `|------|-------:|\n`;
  md += `| Balance per GL | ${fmt(input.gl_balance)} |\n`;
  for (const adj of glAdj) {
    md += `| ${adj.description} | ${fmt(adj.amount)} |\n`;
  }
  md += `| **Adjusted book balance** | **${fmt(adjustedGL)}** |\n\n`;

  md += `### Difference: ${fmt(difference)}\n\n`;
  if (Math.abs(difference) < 0.01) {
    md += `✅ **Reconciliation BALANCED**\n\n`;
  } else {
    md += `❌ **RECONCILIATION DOES NOT BALANCE — ESCALATION REQUIRED**\n\n`;
  }

  md += `---\n\n`;

  md += `## Matched Items (${input.matched.length})\n\n`;
  md += `| # | Bank Txn | GL Journal | Amount | Match Type | Confidence |\n`;
  md += `|---|----------|-----------|-------:|-----------|------------|\n`;
  input.matched.forEach((m, i) => {
    md += `| ${i + 1} | ${m.bank_txn.transaction_id} | ${m.gl_txn.journal_id} | ${fmt(m.bank_txn.amount)} | ${m.match_type} | ${m.confidence} |\n`;
  });
  md += `\n`;

  if (input.timing.length > 0) {
    md += `## Timing Differences (${input.timing.length})\n\n`;
    md += `| Bank Txn | Date | Amount | Description |\n`;
    md += `|----------|------|-------:|-------------|\n`;
    for (const t of input.timing) {
      md += `| ${t.transaction_id} | ${t.transaction_date} | ${fmt(t.amount)} | ${t.description} |\n`;
    }
    md += `\n`;
  }

  if (input.exceptions.length > 0) {
    md += `## Exceptions (${input.exceptions.length})\n\n`;
    for (const exc of input.exceptions) {
      md += `### ${exc.counterparty ?? "Unknown"} — ${fmt(exc.amount)}\n\n`;
      md += `${exc.description}\n\n`;
      if (exc.memory_match) {
        md += `🧠 **Memory match found** — see exception detail for prior resolution.\n\n`;
      }
    }
  }

  return md;
}
