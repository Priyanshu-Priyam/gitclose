import { getBankStatement, getBankTransactions } from "../../db/queries.js";
import type { BankStatement, BankTransaction } from "../../db/queries.js";

export interface FetchBankStatementResult {
  statement: BankStatement;
  transactions: BankTransaction[];
  transaction_count: number;
  computed_closing: number;
}

export function fetchBankStatement(
  entityId: string,
  glAccountId: string,
  period: string
): FetchBankStatementResult {
  const statement = getBankStatement(entityId, glAccountId, period);
  if (!statement) {
    throw new Error(`No bank statement found for ${entityId}, account ${glAccountId}, period ${period}`);
  }

  const transactions = getBankTransactions(statement.statement_id);

  const txnTotal = transactions.reduce((sum, t) => sum + t.amount, 0);
  const computedClosing = Math.round((statement.opening_balance + txnTotal) * 100) / 100;

  return {
    statement,
    transactions,
    transaction_count: transactions.length,
    computed_closing: computedClosing,
  };
}
