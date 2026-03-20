# Data Model

## Design Rationale

The database serves two purposes:

1. **Simulate source data** that would normally come from ERP and banking systems
2. **Track platform state** — close lifecycle, tasks, exceptions, agent runs

These are kept in a single SQLite file for portability and simplicity.

## Schema Overview

SOURCE DATA (simulates ERP + Bank) ────────────────────────────────── entities ──► chart_of_accounts ──► gl_transactions ▲ bank_statements ──► bank_transactions

ap_invoices ──► ap_payments

budget_lines prior_period_actuals

PLATFORM DATA (GitClose operational) ──────────────────────────────────── close_periods ──► close_tasks ──► agent_runs │ ├──► recon_results └──► exceptions

## Key Design Decisions

### GL transactions use signed amounts

Positive = debit, negative = credit. This follows the accounting convention where:
- Assets and expenses have debit (positive) normal balances
- Liabilities, equity, and revenue have credit (negative) normal balances

Every journal entry has ≥2 lines that sum to zero. This is enforced by the
`double_entry_check` verification query.

### Bank transactions use banking convention

Positive = deposit (credit to customer account), negative = withdrawal (debit
to customer account). This matches how bank statements are presented. The
matching engine must handle the sign flip between GL convention and banking
convention.

### AP sub-ledger uses positive amounts for invoices

Invoice amounts are always positive (the amount owed). Payments are tracked
separately. The GL balance for payables is negative (credit balance) because
it's a liability. Nova's matching logic must reconcile these conventions.

### Exceptions reference both task and reconciliation

An exception can exist without a reconciliation (e.g., a variance commentary
flag). The `recon_id` is nullable. This allows Nova's AP exceptions and Echo's
variance flags to use the same table.

## Verification Queries

```sql
-- Verify GL balance for cash account
SELECT SUM(amount) + 2830241.56 AS closing_balance
FROM gl_transactions
WHERE account_id = '1000-001' AND period = '2025-01';
-- Expected: 4287341.56

-- Verify all journals balance (debits = credits)
SELECT journal_id, SUM(amount) AS balance
FROM gl_transactions
GROUP BY journal_id
HAVING ABS(SUM(amount)) > 0.01;
-- Expected: 0 rows (all journals balanced)

-- Verify bank statement closing
SELECT opening_balance + (
    SELECT SUM(amount) FROM bank_transactions 
    WHERE statement_id = 'BS-WBC-2025-01'
) AS computed_closing
FROM bank_statements
WHERE statement_id = 'BS-WBC-2025-01';
-- Expected: 4306216.44

-- Verify AP sub-ledger vs GL difference
-- AP total: sum of open invoices
-- GL 2000-001: sum of all postings
-- Difference should be $5,200 (the ARUP-7795 cutoff error)
```

These queries are embedded in scripts/verify.ts and run before every demo.
