import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_DIR = join(__dirname, "..", "..", "db");

import { resetDb } from "../../src/db/connection.js";

beforeAll(() => {
  const dbPath = join(DB_DIR, "meridian.db");
  process.env.GITCLOSE_DB_PATH = dbPath;

  const testDb = new Database(dbPath);
  const tables = testDb.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  if (tables.length === 0) {
    const schema = readFileSync(join(DB_DIR, "schema.sql"), "utf-8");
    testDb.exec(schema);
    const seed = readFileSync(join(DB_DIR, "seed.sql"), "utf-8");
    testDb.exec(seed);
  }
  testDb.close();
  resetDb();
});

afterAll(() => {
  resetDb();
});

describe("fetch_bank_statement", () => {
  it("returns 23 transactions with correct balances", async () => {
    const { fetchBankStatement } = await import(
      "../../src/tools/atlas/fetch-bank-statement.js"
    );
    const result = fetchBankStatement("MER-AU-ENG", "1000-001", "2025-01");

    expect(result.transaction_count).toBe(23);
    expect(result.statement.opening_balance).toBeCloseTo(2830241.56, 2);
    expect(result.statement.closing_balance).toBeCloseTo(4306216.44, 2);
    expect(result.computed_closing).toBeCloseTo(4306216.44, 2);
  });
});

describe("query_gl_balance", () => {
  it("returns $4,287,341.56 for 1000-001 Jan 2025", async () => {
    const { queryGLBalance } = await import("../../src/tools/shared/query-gl.js");
    const result = queryGLBalance("1000-001", "2025-01");

    expect(result.closing_balance).toBeCloseTo(4287341.56, 2);
    expect(result.opening_balance).toBeCloseTo(2830241.56, 2);
  });
});

describe("match_transactions", () => {
  it("matches BT-002 to JE-2025-0003 (exact amount match)", async () => {
    const { fetchBankStatement } = await import(
      "../../src/tools/atlas/fetch-bank-statement.js"
    );
    const { queryGLTransactions } = await import("../../src/tools/shared/query-gl.js");
    const { matchTransactions } = await import(
      "../../src/tools/atlas/match-transactions.js"
    );

    const bankData = fetchBankStatement("MER-AU-ENG", "1000-001", "2025-01");
    const glTxns = queryGLTransactions("1000-001", "2025-01");
    const result = matchTransactions(bankData.transactions, glTxns);

    const bt002Match = result.matched.find(
      (m) => m.bank_txn.transaction_id === "BT-002"
    );
    expect(bt002Match).toBeDefined();
    expect(bt002Match!.gl_txn.journal_id).toBe("JE-2025-0003");
  });

  it("matches BT-023 to JE-2025-0012 (reference match CHK-4891)", async () => {
    const { fetchBankStatement } = await import(
      "../../src/tools/atlas/fetch-bank-statement.js"
    );
    const { queryGLTransactions } = await import("../../src/tools/shared/query-gl.js");
    const { matchTransactions } = await import(
      "../../src/tools/atlas/match-transactions.js"
    );

    const bankData = fetchBankStatement("MER-AU-ENG", "1000-001", "2025-01");
    const glTxns = queryGLTransactions("1000-001", "2025-01");
    const result = matchTransactions(bankData.transactions, glTxns);

    const bt023Match = result.matched.find(
      (m) => m.bank_txn.transaction_id === "BT-023"
    );
    expect(bt023Match).toBeDefined();
    expect(bt023Match!.gl_txn.journal_id).toBe("JE-2025-0012");
    expect(bt023Match!.match_type).toBe("REFERENCE");
  });

  it("does NOT match BT-022 (Telstra — no GL counterpart)", async () => {
    const { fetchBankStatement } = await import(
      "../../src/tools/atlas/fetch-bank-statement.js"
    );
    const { queryGLTransactions } = await import("../../src/tools/shared/query-gl.js");
    const { matchTransactions } = await import(
      "../../src/tools/atlas/match-transactions.js"
    );

    const bankData = fetchBankStatement("MER-AU-ENG", "1000-001", "2025-01");
    const glTxns = queryGLTransactions("1000-001", "2025-01");
    const result = matchTransactions(bankData.transactions, glTxns);

    const bt022Match = result.matched.find(
      (m) => m.bank_txn.transaction_id === "BT-022"
    );
    expect(bt022Match).toBeUndefined();

    const bt022Unmatched = result.unmatched_bank.find(
      (bt) => bt.transaction_id === "BT-022"
    );
    expect(bt022Unmatched).toBeDefined();
    expect(bt022Unmatched!.counterparty).toBe("TELSTRA CORPORATION");
  });
});

describe("create_exception", () => {
  it("auto-escalates exceptions over $50K", async () => {
    const { createException } = await import(
      "../../src/tools/atlas/create-exception.js"
    );

    const exc = createException({
      exception_type: "UNMATCHED",
      amount: 75000,
      description: "Large unmatched credit",
      counterparty: "Unknown Corp",
    });

    expect(exc.status).toBe("ESCALATED");
    expect(exc.assigned_to).toBe("james.wong@meridian.com.au");
  });

  it("auto-escalates unidentified credits over $10K", async () => {
    const { createException } = await import(
      "../../src/tools/atlas/create-exception.js"
    );

    const exc = createException({
      exception_type: "UNMATCHED",
      amount: 14924.44,
      description: "Telstra credit",
      counterparty: "TELSTRA CORPORATION",
    });

    expect(exc.status).toBe("ESCALATED");
  });
});

describe("propose_journal_entry", () => {
  it("creates balanced JE proposal", async () => {
    const { proposeJournalEntry } = await import(
      "../../src/tools/atlas/propose-journal-entry.js"
    );

    const je = proposeJournalEntry(
      [
        { account_id: "7000-004", amount: 125.0, description: "Bank fee" },
        { account_id: "1000-001", amount: -125.0, description: "Bank fee" },
      ],
      "Monthly bank service fee per MEMORY.md pattern"
    );

    expect(je.is_balanced).toBe(true);
    expect(je.total_debits).toBeCloseTo(125.0, 2);
    expect(je.total_credits).toBeCloseTo(125.0, 2);
  });
});
