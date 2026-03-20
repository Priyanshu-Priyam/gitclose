-- GitClose Database Schema
-- Meridian Engineering Pty Ltd — Sample Data for MVP Demo

PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

-- ═══════════════════════════════════════════════════════════
-- SOURCE DATA (simulates ERP + Bank)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS entities (
  entity_id     TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  country       TEXT NOT NULL,
  currency      TEXT NOT NULL DEFAULT 'AUD',
  fiscal_year   TEXT NOT NULL,
  erp_system    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS chart_of_accounts (
  account_id    TEXT PRIMARY KEY,
  account_name  TEXT NOT NULL,
  account_type  TEXT NOT NULL CHECK (account_type IN (
    'ASSET','LIABILITY','EQUITY','REVENUE','COS','OPEX','OTHER_INCOME','OTHER_EXPENSE'
  )),
  normal_balance TEXT NOT NULL CHECK (normal_balance IN ('DEBIT','CREDIT')),
  parent_id     TEXT,
  is_active     INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS gl_transactions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  journal_id    TEXT NOT NULL,
  entity_id     TEXT NOT NULL REFERENCES entities(entity_id),
  account_id    TEXT NOT NULL REFERENCES chart_of_accounts(account_id),
  posting_date  TEXT NOT NULL,
  amount        REAL NOT NULL,
  description   TEXT NOT NULL,
  source        TEXT NOT NULL,
  reference     TEXT,
  created_by    TEXT NOT NULL DEFAULT 'system',
  period        TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bank_statements (
  statement_id    TEXT PRIMARY KEY,
  bank_name       TEXT NOT NULL,
  account_number  TEXT NOT NULL,
  gl_account_id   TEXT NOT NULL REFERENCES chart_of_accounts(account_id),
  entity_id       TEXT NOT NULL REFERENCES entities(entity_id),
  statement_date  TEXT NOT NULL,
  opening_balance REAL NOT NULL,
  closing_balance REAL NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'AUD',
  downloaded_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bank_transactions (
  transaction_id  TEXT PRIMARY KEY,
  statement_id    TEXT NOT NULL REFERENCES bank_statements(statement_id),
  transaction_date TEXT NOT NULL,
  value_date      TEXT NOT NULL,
  amount          REAL NOT NULL,
  description     TEXT NOT NULL,
  reference       TEXT,
  type            TEXT NOT NULL,
  counterparty    TEXT,
  is_reconciled   INTEGER NOT NULL DEFAULT 0,
  matched_gl_id   TEXT
);

CREATE TABLE IF NOT EXISTS ap_invoices (
  invoice_id    TEXT PRIMARY KEY,
  entity_id     TEXT NOT NULL REFERENCES entities(entity_id),
  vendor_name   TEXT NOT NULL,
  vendor_id     TEXT NOT NULL,
  invoice_ref   TEXT NOT NULL,
  invoice_date  TEXT NOT NULL,
  due_date      TEXT NOT NULL,
  amount        REAL NOT NULL,
  currency      TEXT NOT NULL DEFAULT 'AUD',
  expense_account TEXT NOT NULL,
  status        TEXT NOT NULL CHECK (status IN ('OPEN','PAID','PARTIAL','VOID')),
  payment_ref   TEXT,
  period        TEXT NOT NULL,
  description   TEXT
);

CREATE TABLE IF NOT EXISTS budget_lines (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_id     TEXT NOT NULL REFERENCES entities(entity_id),
  account_id    TEXT NOT NULL REFERENCES chart_of_accounts(account_id),
  period        TEXT NOT NULL,
  budget_amount REAL NOT NULL,
  budget_version TEXT NOT NULL,
  notes         TEXT
);

CREATE TABLE IF NOT EXISTS prior_period_actuals (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_id     TEXT NOT NULL REFERENCES entities(entity_id),
  account_id    TEXT NOT NULL REFERENCES chart_of_accounts(account_id),
  period        TEXT NOT NULL,
  actual_amount REAL NOT NULL
);

-- ═══════════════════════════════════════════════════════════
-- PLATFORM DATA (GitClose operational)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS close_periods (
  close_id      TEXT PRIMARY KEY,
  entity_id     TEXT NOT NULL REFERENCES entities(entity_id),
  period        TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'NOT_STARTED' CHECK (status IN (
    'NOT_STARTED','IN_PROGRESS','REVIEW','CLOSED','AUDITABLE'
  )),
  opened_by     TEXT,
  opened_at     TEXT,
  closed_at     TEXT,
  repo_path     TEXT
);

CREATE TABLE IF NOT EXISTS close_tasks (
  task_id       TEXT PRIMARY KEY,
  close_id      TEXT NOT NULL REFERENCES close_periods(close_id),
  name          TEXT NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('RECONCILIATION','VARIANCE_ANALYSIS','JOURNAL_PREP')),
  agent         TEXT NOT NULL,
  branch        TEXT NOT NULL,
  gl_account    TEXT,
  reviewer      TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN (
    'PENDING','IN_PROGRESS','COMPLETED','REVIEW','APPROVED','REJECTED'
  )),
  pr_number     INTEGER,
  started_at    TEXT,
  completed_at  TEXT
);

CREATE TABLE IF NOT EXISTS recon_results (
  recon_id          TEXT PRIMARY KEY,
  task_id           TEXT NOT NULL REFERENCES close_tasks(task_id),
  recon_type        TEXT NOT NULL,
  source_balance    REAL NOT NULL,
  target_balance    REAL NOT NULL,
  adjusted_source   REAL NOT NULL,
  adjusted_target   REAL NOT NULL,
  difference        REAL NOT NULL,
  items_matched     INTEGER NOT NULL DEFAULT 0,
  items_timing      INTEGER NOT NULL DEFAULT 0,
  items_recurring   INTEGER NOT NULL DEFAULT 0,
  items_exception   INTEGER NOT NULL DEFAULT 0,
  is_balanced       INTEGER NOT NULL DEFAULT 0,
  completed_at      TEXT
);

CREATE TABLE IF NOT EXISTS exceptions (
  exception_id    TEXT PRIMARY KEY,
  task_id         TEXT REFERENCES close_tasks(task_id),
  recon_id        TEXT REFERENCES recon_results(recon_id),
  exception_type  TEXT NOT NULL CHECK (exception_type IN (
    'UNMATCHED','CUTOFF','THRESHOLD','SYSTEMIC','OTHER'
  )),
  amount          REAL NOT NULL,
  description     TEXT NOT NULL,
  counterparty    TEXT,
  bank_ref        TEXT,
  status          TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN (
    'OPEN','ESCALATED','INVESTIGATING','RESOLVED','DISMISSED'
  )),
  assigned_to     TEXT,
  memory_match    INTEGER NOT NULL DEFAULT 0,
  resolution      TEXT,
  resolved_by     TEXT,
  resolved_at     TEXT,
  created_at      TEXT NOT NULL,
  commit_hash     TEXT
);

CREATE TABLE IF NOT EXISTS agent_runs (
  run_id        TEXT PRIMARY KEY,
  task_id       TEXT NOT NULL REFERENCES close_tasks(task_id),
  agent         TEXT NOT NULL,
  started_at    TEXT NOT NULL,
  completed_at  TEXT,
  status        TEXT NOT NULL DEFAULT 'RUNNING' CHECK (status IN (
    'RUNNING','COMPLETED','FAILED','TIMEOUT'
  )),
  iterations    INTEGER NOT NULL DEFAULT 0,
  commits       INTEGER NOT NULL DEFAULT 0,
  error_message TEXT
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_gl_account_period ON gl_transactions(account_id, period);
CREATE INDEX IF NOT EXISTS idx_gl_journal ON gl_transactions(journal_id);
CREATE INDEX IF NOT EXISTS idx_bank_txn_statement ON bank_transactions(statement_id);
CREATE INDEX IF NOT EXISTS idx_ap_entity_period ON ap_invoices(entity_id, period);
CREATE INDEX IF NOT EXISTS idx_budget_entity_period ON budget_lines(entity_id, account_id, period);
CREATE INDEX IF NOT EXISTS idx_actuals_entity_period ON prior_period_actuals(entity_id, account_id, period);
