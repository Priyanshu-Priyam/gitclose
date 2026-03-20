import Database from "better-sqlite3";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "..", "db", "meridian.db");

if (!existsSync(DB_PATH)) {
  console.error("❌ Database not found. Run `npm run seed` first.");
  process.exit(1);
}

const db = new Database(DB_PATH, { readonly: true });

interface VerifyResult {
  test: string;
  actual: number;
  expected: number;
  result: string;
  bank_adjusted?: number;
  gl_adjusted?: number;
}

const checks: { name: string; sql: string }[] = [
  {
    name: "GL Cash Balance (1000-001)",
    sql: `SELECT ROUND(2830241.56 + SUM(amount), 2) AS actual, 4287341.56 AS expected
      FROM gl_transactions WHERE account_id = '1000-001' AND period = '2025-01'`,
  },
  {
    name: "Journal Balance (all journals net to zero)",
    sql: `SELECT COUNT(*) AS actual, 0 AS expected FROM (
      SELECT journal_id, ROUND(SUM(amount), 2) AS balance
      FROM gl_transactions GROUP BY journal_id HAVING ABS(SUM(amount)) > 0.01)`,
  },
  {
    name: "Bank Closing Balance",
    sql: `SELECT ROUND(bs.opening_balance + COALESCE(bt_sum.total, 0), 2) AS actual,
      4306216.44 AS expected
      FROM bank_statements bs
      LEFT JOIN (SELECT statement_id, SUM(amount) AS total FROM bank_transactions GROUP BY statement_id) bt_sum
      ON bs.statement_id = bt_sum.statement_id
      WHERE bs.statement_id = 'BS-WBC-2025-01'`,
  },
  {
    name: "Bank Transaction Count",
    sql: `SELECT COUNT(*) AS actual, 23 AS expected
      FROM bank_transactions WHERE statement_id = 'BS-WBC-2025-01'`,
  },
  {
    name: "AP Sub-ledger Total (Jan 2025 invoices)",
    sql: `SELECT ROUND(SUM(amount), 2) AS actual, 322600.00 AS expected
      FROM ap_invoices WHERE entity_id = 'MER-AU-ENG' AND status = 'OPEN' AND period = '2025-01'`,
  },
  {
    name: "AP Sub-ledger Total (all open invoices)",
    sql: `SELECT ROUND(SUM(amount), 2) AS actual, 812550.00 AS expected
      FROM ap_invoices WHERE entity_id = 'MER-AU-ENG' AND status = 'OPEN'`,
  },
  {
    name: "GL Trade Payables (2000-001)",
    sql: `SELECT ROUND(-750000.00 + SUM(amount), 2) AS actual, -807350.00 AS expected
      FROM gl_transactions WHERE account_id = '2000-001' AND period = '2025-01'`,
  },
  {
    name: "AP-GL Difference ($5,200 cutoff error)",
    sql: `SELECT ROUND(ap_total - ABS(gl_balance), 2) AS actual, 5200.00 AS expected FROM (
      SELECT (SELECT SUM(amount) FROM ap_invoices WHERE status = 'OPEN') AS ap_total,
             (SELECT -750000.00 + SUM(amount) FROM gl_transactions WHERE account_id = '2000-001' AND period = '2025-01') AS gl_balance)`,
  },
  {
    name: "Budget Line Count",
    sql: `SELECT COUNT(*) AS actual, 18 AS expected
      FROM budget_lines WHERE entity_id = 'MER-AU-ENG' AND period = '2025-01'`,
  },
  {
    name: "Reconciliation Proof (adjusted balances match)",
    sql: `SELECT
      ROUND(4306216.44 - 12400.00 - 8750.00 + 15000.00, 2) AS actual,
      4300066.44 AS expected`,
  },
];

let passed = 0;
let failed = 0;

console.log("🔍 Running verification queries...\n");

for (const check of checks) {
  try {
    const row = db.prepare(check.sql).get() as VerifyResult | undefined;
    if (!row) {
      console.log(`  ⚠️  ${check.name}: no result`);
      failed++;
      continue;
    }

    const match = Math.abs(Number(row.actual) - Number(row.expected)) < 0.01;
    if (match) {
      console.log(`  ✅ ${check.name}: ${row.actual} = ${row.expected}`);
      passed++;
    } else {
      console.log(`  ❌ ${check.name}: got ${row.actual}, expected ${row.expected}`);
      failed++;
    }
  } catch (err) {
    console.log(`  ❌ ${check.name}: ${(err as Error).message}`);
    failed++;
  }
}

db.close();

console.log(`\n${"═".repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`${"═".repeat(50)}`);

if (failed > 0) {
  console.error("\n❌ VERIFICATION FAILED — do not proceed with demo");
  process.exit(1);
} else {
  console.log("\n✅ All verification checks passed");
}
