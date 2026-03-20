import { readFileSync, writeFileSync, existsSync } from "fs";

export function readMemory(memoryPath: string): string {
  if (!existsSync(memoryPath)) return "";
  return readFileSync(memoryPath, "utf-8");
}

export function appendMemory(memoryPath: string, entry: string): void {
  const existing = readMemory(memoryPath);
  const updated = existing + "\n" + entry + "\n";
  writeFileSync(memoryPath, updated, "utf-8");
}

export interface MemoryPattern {
  counterparty: string;
  amount: number;
  date: string;
  resolution: string;
  period: string;
  pr_reference: string;
}

export function parseMemoryPatterns(memoryContent: string): MemoryPattern[] {
  const patterns: MemoryPattern[] = [];

  const telstraMatch = memoryContent.match(
    /Telstra.*?credit of \$([0-9,.]+).*?from Telstra/is
  );
  if (telstraMatch) {
    patterns.push({
      counterparty: "TELSTRA CORPORATION",
      amount: parseFloat(telstraMatch[1].replace(",", "")),
      date: "2024-10-08",
      resolution: "Telecom services refund for overpayment on account MER-TEL-2024-08",
      period: "October 2024",
      pr_reference: "641",
    });
  }

  const feeMatch = memoryContent.match(/Monthly Service Fee.*?~\$([0-9,.]+)/is);
  if (feeMatch) {
    patterns.push({
      counterparty: "WESTPAC",
      amount: parseFloat(feeMatch[1].replace(",", "")),
      date: "recurring",
      resolution: "Monthly bank service fee — DR 7000-004 / CR 1000-001",
      period: "recurring",
      pr_reference: "standing",
    });
  }

  const insuranceMatch = memoryContent.match(/QBE Insurance.*?\$([0-9,.]+)/is);
  if (insuranceMatch) {
    patterns.push({
      counterparty: "QBE INSURANCE",
      amount: parseFloat(insuranceMatch[1].replace(",", "")),
      date: "recurring",
      resolution: "Insurance direct debit — DR 6000-004 / CR 1000-001",
      period: "recurring",
      pr_reference: "standing",
    });
  }

  return patterns;
}

export function findMemoryMatch(
  patterns: MemoryPattern[],
  counterparty: string,
  amount: number,
  tolerance: number = 0.05
): MemoryPattern | null {
  const counterpartyLower = counterparty.toLowerCase();

  for (const pattern of patterns) {
    const patternLower = pattern.counterparty.toLowerCase();
    const nameMatch =
      patternLower.includes(counterpartyLower) ||
      counterpartyLower.includes(patternLower) ||
      counterpartyLower.split(/\s+/).some(
        (word) => word.length > 3 && patternLower.includes(word)
      );

    if (!nameMatch) continue;

    const amountDiff = Math.abs(amount - pattern.amount);
    const maxAmt = Math.max(Math.abs(amount), Math.abs(pattern.amount));
    if (maxAmt > 0 && amountDiff / maxAmt <= tolerance) {
      return pattern;
    }
  }

  return null;
}
