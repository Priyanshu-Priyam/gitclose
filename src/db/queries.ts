import { getDb } from "./connection.js";

export interface BankStatement {
  statement_id: string;
  bank_name: string;
  account_number: string;
  gl_account_id: string;
  entity_id: string;
  statement_date: string;
  opening_balance: number;
  closing_balance: number;
  currency: string;
}

export interface BankTransaction {
  transaction_id: string;
  statement_id: string;
  transaction_date: string;
  value_date: string;
  amount: number;
  description: string;
  reference: string | null;
  type: string;
  counterparty: string | null;
  is_reconciled: number;
  matched_gl_id: string | null;
}

export interface GLTransaction {
  id: number;
  journal_id: string;
  entity_id: string;
  account_id: string;
  posting_date: string;
  amount: number;
  description: string;
  source: string;
  reference: string | null;
  created_by: string;
  period: string;
}

export interface APInvoice {
  invoice_id: string;
  entity_id: string;
  vendor_name: string;
  vendor_id: string;
  invoice_ref: string;
  invoice_date: string;
  due_date: string;
  amount: number;
  currency: string;
  expense_account: string;
  status: string;
  payment_ref: string | null;
  period: string;
  description: string | null;
}

export interface BudgetLine {
  id: number;
  entity_id: string;
  account_id: string;
  period: string;
  budget_amount: number;
  budget_version: string;
  notes: string | null;
}

export interface PriorPeriodActual {
  id: number;
  entity_id: string;
  account_id: string;
  period: string;
  actual_amount: number;
}

export interface AccountInfo {
  account_id: string;
  account_name: string;
  account_type: string;
  normal_balance: string;
}

export function getBankStatement(entityId: string, glAccountId: string, period: string): BankStatement | undefined {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM bank_statements
    WHERE entity_id = ? AND gl_account_id = ? AND statement_date LIKE ?
  `).get(entityId, glAccountId, `${period}%`) as BankStatement | undefined;
}

export function getBankTransactions(statementId: string): BankTransaction[] {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM bank_transactions
    WHERE statement_id = ?
    ORDER BY transaction_date, transaction_id
  `).all(statementId) as BankTransaction[];
}

export function getGLBalance(accountId: string, period: string, openingBalance: number): {
  opening_balance: number;
  net_movement: number;
  closing_balance: number;
} {
  const db = getDb();
  const row = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) AS net_movement
    FROM gl_transactions
    WHERE account_id = ? AND period = ?
  `).get(accountId, period) as { net_movement: number };

  return {
    opening_balance: openingBalance,
    net_movement: row.net_movement,
    closing_balance: Math.round((openingBalance + row.net_movement) * 100) / 100,
  };
}

export function getGLTransactions(accountId: string, period: string, sourceFilter?: string): GLTransaction[] {
  const db = getDb();
  if (sourceFilter) {
    return db.prepare(`
      SELECT * FROM gl_transactions
      WHERE account_id = ? AND period = ? AND source = ?
      ORDER BY posting_date, journal_id
    `).all(accountId, period, sourceFilter) as GLTransaction[];
  }
  return db.prepare(`
    SELECT * FROM gl_transactions
    WHERE account_id = ? AND period = ?
    ORDER BY posting_date, journal_id
  `).all(accountId, period) as GLTransaction[];
}

export function getAPInvoices(entityId: string, options?: {
  period?: string;
  status?: string;
  vendorId?: string;
}): APInvoice[] {
  const db = getDb();
  let sql = `SELECT * FROM ap_invoices WHERE entity_id = ?`;
  const params: unknown[] = [entityId];

  if (options?.status) {
    sql += ` AND status = ?`;
    params.push(options.status);
  }
  if (options?.period) {
    sql += ` AND period = ?`;
    params.push(options.period);
  }
  if (options?.vendorId) {
    sql += ` AND vendor_id = ?`;
    params.push(options.vendorId);
  }
  sql += ` ORDER BY invoice_date, invoice_id`;
  return db.prepare(sql).all(...params) as APInvoice[];
}

export function getAllOpenAPInvoices(entityId: string): APInvoice[] {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM ap_invoices
    WHERE entity_id = ? AND status = 'OPEN'
    ORDER BY vendor_name, invoice_date
  `).all(entityId) as APInvoice[];
}

export function getBudgetLines(entityId: string, period: string, version?: string): BudgetLine[] {
  const db = getDb();
  if (version) {
    return db.prepare(`
      SELECT * FROM budget_lines
      WHERE entity_id = ? AND period = ? AND budget_version = ?
      ORDER BY account_id
    `).all(entityId, period, version) as BudgetLine[];
  }
  return db.prepare(`
    SELECT * FROM budget_lines
    WHERE entity_id = ? AND period = ?
    ORDER BY account_id
  `).all(entityId, period) as BudgetLine[];
}

export function getActuals(entityId: string, period: string): PriorPeriodActual[] {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM prior_period_actuals
    WHERE entity_id = ? AND period = ?
    ORDER BY account_id
  `).all(entityId, period) as PriorPeriodActual[];
}

export function getPriorYearActuals(entityId: string, period: string): PriorPeriodActual[] {
  const year = parseInt(period.split("-")[0]);
  const month = period.split("-")[1];
  const priorPeriod = `${year - 1}-${month}`;
  return getActuals(entityId, priorPeriod);
}

export function getAccountInfo(accountId: string): AccountInfo | undefined {
  const db = getDb();
  return db.prepare(`
    SELECT account_id, account_name, account_type, normal_balance
    FROM chart_of_accounts WHERE account_id = ?
  `).get(accountId) as AccountInfo | undefined;
}

export function getAllAccounts(): AccountInfo[] {
  const db = getDb();
  return db.prepare(`
    SELECT account_id, account_name, account_type, normal_balance
    FROM chart_of_accounts ORDER BY account_id
  `).all() as AccountInfo[];
}

export function findGLByReference(reference: string, period: string): GLTransaction[] {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM gl_transactions
    WHERE reference = ? AND period = ?
    ORDER BY posting_date
  `).all(reference, period) as GLTransaction[];
}

export function findGLByReferenceAllPeriods(reference: string): GLTransaction[] {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM gl_transactions
    WHERE reference = ?
    ORDER BY posting_date
  `).all(reference) as GLTransaction[];
}
