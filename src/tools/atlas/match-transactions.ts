import type { BankTransaction, GLTransaction } from "../../db/queries.js";

export interface MatchedPair {
  bank_txn: BankTransaction;
  gl_txn: GLTransaction;
  match_type: "EXACT" | "REFERENCE" | "FUZZY";
  confidence: "HIGH" | "MEDIUM";
}

export interface MatchResult {
  matched: MatchedPair[];
  timing_differences: BankTransaction[];
  unmatched_bank: BankTransaction[];
  unmatched_gl: GLTransaction[];
  summary: {
    total_bank: number;
    total_gl: number;
    matched_count: number;
    timing_count: number;
    unmatched_bank_count: number;
    unmatched_gl_count: number;
  };
}

function businessDaysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  let bizDays = 0;
  const start = d1 < d2 ? new Date(d1) : new Date(d2);
  for (let i = 0; i < diffDays; i++) {
    start.setDate(start.getDate() + 1);
    const day = start.getDay();
    if (day !== 0 && day !== 6) bizDays++;
  }
  return bizDays;
}

export function matchTransactions(
  bankTransactions: BankTransaction[],
  glTransactions: GLTransaction[],
  options: { dateWindowDays?: number; fuzzyThresholdPct?: number } = {}
): MatchResult {
  const dateWindow = options.dateWindowDays ?? 5;
  const fuzzyPct = options.fuzzyThresholdPct ?? 0.02;

  const matched: MatchedPair[] = [];
  const usedBankIds = new Set<string>();
  const usedGLIds = new Set<number>();

  // Pass 1: Reference match (highest priority)
  for (const bt of bankTransactions) {
    if (!bt.reference || usedBankIds.has(bt.transaction_id)) continue;
    for (const gl of glTransactions) {
      if (!gl.reference || usedGLIds.has(gl.id)) continue;
      if (bt.reference === gl.reference) {
        matched.push({
          bank_txn: bt,
          gl_txn: gl,
          match_type: "REFERENCE",
          confidence: "HIGH",
        });
        usedBankIds.add(bt.transaction_id);
        usedGLIds.add(gl.id);
        break;
      }
    }
  }

  // Pass 2: Exact amount match within date window
  for (const bt of bankTransactions) {
    if (usedBankIds.has(bt.transaction_id)) continue;
    for (const gl of glTransactions) {
      if (usedGLIds.has(gl.id)) continue;
      if (Math.abs(bt.amount - gl.amount) < 0.01) {
        const bizDays = businessDaysBetween(bt.transaction_date, gl.posting_date);
        if (bizDays <= dateWindow) {
          matched.push({
            bank_txn: bt,
            gl_txn: gl,
            match_type: "EXACT",
            confidence: "HIGH",
          });
          usedBankIds.add(bt.transaction_id);
          usedGLIds.add(gl.id);
          break;
        }
      }
    }
  }

  // Pass 3: Fuzzy match (amount within threshold + counterparty name overlap)
  for (const bt of bankTransactions) {
    if (usedBankIds.has(bt.transaction_id)) continue;
    if (!bt.counterparty) continue;
    for (const gl of glTransactions) {
      if (usedGLIds.has(gl.id)) continue;
      const amountDiff = Math.abs(bt.amount - gl.amount);
      const maxAmount = Math.max(Math.abs(bt.amount), Math.abs(gl.amount));
      if (maxAmount > 0 && amountDiff / maxAmount <= fuzzyPct) {
        const bizDays = businessDaysBetween(bt.transaction_date, gl.posting_date);
        const counterpartyLower = bt.counterparty.toLowerCase();
        const descLower = gl.description.toLowerCase();
        const hasCounterpartyOverlap =
          counterpartyLower.split(/\s+/).some((word) => word.length > 3 && descLower.includes(word));

        if (bizDays <= dateWindow * 2 && hasCounterpartyOverlap) {
          matched.push({
            bank_txn: bt,
            gl_txn: gl,
            match_type: "FUZZY",
            confidence: "MEDIUM",
          });
          usedBankIds.add(bt.transaction_id);
          usedGLIds.add(gl.id);
          break;
        }
      }
    }
  }

  const unmatchedBank = bankTransactions.filter((bt) => !usedBankIds.has(bt.transaction_id));
  const unmatchedGL = glTransactions.filter((gl) => !usedGLIds.has(gl.id));

  // Classify unmatched bank items: timing vs true unmatched
  const timingDifferences: BankTransaction[] = [];
  const trueUnmatchedBank: BankTransaction[] = [];

  for (const bt of unmatchedBank) {
    const lastDay = bt.transaction_date.endsWith("-31") ||
      bt.transaction_date.endsWith("-30") ||
      bt.transaction_date.endsWith("-28") ||
      bt.transaction_date.endsWith("-29");
    const isCheckOrEFT = bt.type === "CHECK" || bt.type === "EFT";

    if (lastDay && isCheckOrEFT) {
      timingDifferences.push(bt);
    } else {
      trueUnmatchedBank.push(bt);
    }
  }

  return {
    matched,
    timing_differences: timingDifferences,
    unmatched_bank: trueUnmatchedBank,
    unmatched_gl: unmatchedGL,
    summary: {
      total_bank: bankTransactions.length,
      total_gl: glTransactions.length,
      matched_count: matched.length,
      timing_count: timingDifferences.length,
      unmatched_bank_count: trueUnmatchedBank.length,
      unmatched_gl_count: unmatchedGL.length,
    },
  };
}
