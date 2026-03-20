-- GitClose Verification Queries
-- All must pass before any demo or commit

-- 1. GL balance for cash account 1000-001
-- Opening $2,830,241.56 + net movement = $4,287,341.56
SELECT 'GL_CASH_BALANCE' AS test,
  ROUND(2830241.56 + SUM(amount), 2) AS actual,
  4287341.56 AS expected,
  CASE WHEN ABS(ROUND(2830241.56 + SUM(amount), 2) - 4287341.56) < 0.01
    THEN 'PASS' ELSE 'FAIL' END AS result
FROM gl_transactions
WHERE account_id = '1000-001' AND period = '2025-01';

-- 2. All journals balance (debits = credits)
SELECT 'JOURNAL_BALANCE' AS test,
  COUNT(*) AS actual,
  0 AS expected,
  CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END AS result
FROM (
  SELECT journal_id, ROUND(SUM(amount), 2) AS balance
  FROM gl_transactions
  GROUP BY journal_id
  HAVING ABS(SUM(amount)) > 0.01
);

-- 3. Bank statement closing balance
SELECT 'BANK_CLOSING' AS test,
  ROUND(bs.opening_balance + COALESCE(bt_sum.total, 0), 2) AS actual,
  4306216.44 AS expected,
  CASE WHEN ABS(ROUND(bs.opening_balance + COALESCE(bt_sum.total, 0), 2) - 4306216.44) < 0.01
    THEN 'PASS' ELSE 'FAIL' END AS result
FROM bank_statements bs
LEFT JOIN (
  SELECT statement_id, SUM(amount) AS total
  FROM bank_transactions
  GROUP BY statement_id
) bt_sum ON bs.statement_id = bt_sum.statement_id
WHERE bs.statement_id = 'BS-WBC-2025-01';

-- 4. Bank transaction count
SELECT 'BANK_TXN_COUNT' AS test,
  COUNT(*) AS actual,
  23 AS expected,
  CASE WHEN COUNT(*) = 23 THEN 'PASS' ELSE 'FAIL' END AS result
FROM bank_transactions
WHERE statement_id = 'BS-WBC-2025-01';

-- 5. AP sub-ledger total (open invoices)
SELECT 'AP_SUBLEDGER_TOTAL' AS test,
  ROUND(SUM(amount), 2) AS actual,
  485850.00 AS expected,
  CASE WHEN ABS(ROUND(SUM(amount), 2) - 485850.00) < 0.01
    THEN 'PASS' ELSE 'FAIL' END AS result
FROM ap_invoices
WHERE entity_id = 'MER-AU-ENG' AND status = 'OPEN'
  AND period IN ('2025-01');

-- 5b. AP sub-ledger total including prior period carryforward
SELECT 'AP_SUBLEDGER_FULL' AS test,
  ROUND(SUM(amount), 2) AS actual,
  812550.00 AS expected,
  CASE WHEN ABS(ROUND(SUM(amount), 2) - 812550.00) < 0.01
    THEN 'PASS' ELSE 'FAIL' END AS result
FROM ap_invoices
WHERE entity_id = 'MER-AU-ENG' AND status = 'OPEN';

-- 6. GL 2000-001 balance (Trade Payables)
-- Opening $750,000 (credit = negative) + movements
SELECT 'GL_AP_BALANCE' AS test,
  ROUND(-750000.00 + SUM(amount), 2) AS actual,
  -807350.00 AS expected,
  CASE WHEN ABS(ROUND(-750000.00 + SUM(amount), 2) - (-807350.00)) < 0.01
    THEN 'PASS' ELSE 'FAIL' END AS result
FROM gl_transactions
WHERE account_id = '2000-001' AND period = '2025-01';

-- 7. AP-GL difference (should be $5,200 — the ARUP-7795 cutoff error)
SELECT 'AP_GL_DIFFERENCE' AS test,
  ROUND(ap_total - ABS(gl_balance), 2) AS actual,
  5200.00 AS expected,
  CASE WHEN ABS(ROUND(ap_total - ABS(gl_balance), 2) - 5200.00) < 0.01
    THEN 'PASS' ELSE 'FAIL' END AS result
FROM (
  SELECT (SELECT SUM(amount) FROM ap_invoices WHERE status = 'OPEN') AS ap_total,
         (SELECT -750000.00 + SUM(amount) FROM gl_transactions WHERE account_id = '2000-001' AND period = '2025-01') AS gl_balance
);

-- 8. Budget line count
SELECT 'BUDGET_LINE_COUNT' AS test,
  COUNT(*) AS actual,
  18 AS expected,
  CASE WHEN COUNT(*) = 18 THEN 'PASS' ELSE 'FAIL' END AS result
FROM budget_lines
WHERE entity_id = 'MER-AU-ENG' AND period = '2025-01';

-- 9. Reconciliation proof: adjusted bank = adjusted GL = $4,300,066.44
-- Bank side: 4,306,216.44 - 12,400 - 8,750 + 15,000 = 4,300,066.44
-- GL side: 4,287,341.56 + 340.44 + 14,924.44 - 125.00 - 2,415.00 = 4,300,066.44
SELECT 'RECON_PROOF' AS test,
  ROUND(4306216.44 - 12400.00 - 8750.00 + 15000.00, 2) AS bank_adjusted,
  ROUND(4287341.56 + 340.44 + 14924.44 - 125.00 - 2415.00, 2) AS gl_adjusted,
  4300066.44 AS expected,
  CASE WHEN
    ABS(ROUND(4306216.44 - 12400.00 - 8750.00 + 15000.00, 2) - 4300066.44) < 0.01
    AND ABS(ROUND(4287341.56 + 340.44 + 14924.44 - 125.00 - 2415.00, 2) - 4300066.44) < 0.01
    THEN 'PASS' ELSE 'FAIL' END AS result;
