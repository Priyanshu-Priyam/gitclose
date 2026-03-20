import { randomUUID } from "crypto";

export interface JournalEntryLine {
  account_id: string;
  account_name?: string;
  amount: number;
  description: string;
}

export interface ProposedJE {
  je_id: string;
  lines: JournalEntryLine[];
  justification: string;
  memory_reference?: string;
  total_debits: number;
  total_credits: number;
  is_balanced: boolean;
  csv_output: string;
  markdown: string;
}

export function proposeJournalEntry(
  lines: JournalEntryLine[],
  justification: string,
  memoryReference?: string
): ProposedJE {
  const jeId = `PJE-${randomUUID().split("-")[0].toUpperCase()}`;

  const totalDebits = lines
    .filter((l) => l.amount > 0)
    .reduce((s, l) => s + l.amount, 0);
  const totalCredits = Math.abs(
    lines.filter((l) => l.amount < 0).reduce((s, l) => s + l.amount, 0)
  );
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  const csvLines = [
    "Account,Amount,Description",
    ...lines.map(
      (l) =>
        `${l.account_id},${l.amount.toFixed(2)},"${l.description.replace(/"/g, '""')}"`
    ),
  ];

  const fmt = (n: number): string =>
    `$${Math.abs(n).toLocaleString("en-AU", { minimumFractionDigits: 2 })}`;

  let md = `# Proposed Journal Entry: ${jeId}\n\n`;
  md += `**Status:** PROPOSED (requires human approval via PR)\n\n`;
  md += `| Account | Debit | Credit | Description |\n`;
  md += `|---------|------:|-------:|-------------|\n`;
  for (const line of lines) {
    const debit = line.amount > 0 ? fmt(line.amount) : "";
    const credit = line.amount < 0 ? fmt(line.amount) : "";
    md += `| ${line.account_id} | ${debit} | ${credit} | ${line.description} |\n`;
  }
  md += `\n**Total Debits:** ${fmt(totalDebits)} | **Total Credits:** ${fmt(totalCredits)}\n`;
  md += isBalanced ? "\n✅ Entry is balanced\n" : "\n❌ **ENTRY DOES NOT BALANCE**\n";
  md += `\n## Justification\n\n${justification}\n`;
  if (memoryReference) {
    md += `\n## Memory Reference\n\n${memoryReference}\n`;
  }

  return {
    je_id: jeId,
    lines,
    justification,
    memory_reference: memoryReference,
    total_debits: totalDebits,
    total_credits: totalCredits,
    is_balanced: isBalanced,
    csv_output: csvLines.join("\n"),
    markdown: md,
  };
}
