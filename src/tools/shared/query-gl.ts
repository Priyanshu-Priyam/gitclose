import { getGLBalance, getGLTransactions, getAccountInfo } from "../../db/queries.js";
import type { GLTransaction } from "../../db/queries.js";

export interface GLBalanceResult {
  account_id: string;
  account_name: string;
  period: string;
  opening_balance: number;
  net_movement: number;
  closing_balance: number;
}

const KNOWN_OPENING_BALANCES: Record<string, number> = {
  "1000-001": 2830241.56,
  "2000-001": -750000.00,
};

export function queryGLBalance(accountId: string, period: string): GLBalanceResult {
  const account = getAccountInfo(accountId);
  if (!account) throw new Error(`Account ${accountId} not found`);

  const opening = KNOWN_OPENING_BALANCES[accountId] ?? 0;
  const result = getGLBalance(accountId, period, opening);

  return {
    account_id: accountId,
    account_name: account.account_name,
    period,
    ...result,
  };
}

export function queryGLTransactions(
  accountId: string,
  period: string,
  sourceFilter?: string
): GLTransaction[] {
  return getGLTransactions(accountId, period, sourceFilter);
}
