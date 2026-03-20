import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { resetDb } from "../../src/db/connection.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_DIR = join(__dirname, "..", "..", "db");

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

describe("query_ap_subledger", () => {
  it("returns correct count and total for all open invoices", async () => {
    const { queryAPSubledger } = await import(
      "../../src/tools/nova/query-ap-subledger.js"
    );
    const result = queryAPSubledger("MER-AU-ENG");

    expect(result.total_amount).toBeCloseTo(812550.0, 2);
    expect(result.invoice_count).toBe(16);
  });

  it("groups invoices by vendor", async () => {
    const { queryAPSubledger } = await import(
      "../../src/tools/nova/query-ap-subledger.js"
    );
    const result = queryAPSubledger("MER-AU-ENG");

    expect(result.by_vendor.length).toBeGreaterThan(0);
    const lendlease = result.by_vendor.find((v) => v.vendor_name === "Lendlease");
    expect(lendlease).toBeDefined();
  });
});

describe("compare_balances", () => {
  it("detects $5,200 AP-GL difference", async () => {
    const { compareBalances } = await import("../../src/tools/nova/trace-invoice.js");

    const result = compareBalances(812550.0, -807350.0);
    expect(result.difference).toBeCloseTo(5200.0, 2);
    expect(result.is_reconciled).toBe(false);
  });
});

describe("trace_invoice", () => {
  it("finds cutoff error for ARUP-7795", async () => {
    const { traceInvoice } = await import("../../src/tools/nova/trace-invoice.js");
    const { getAPInvoices } = await import("../../src/db/queries.js");

    const invoices = getAPInvoices("MER-AU-ENG", { status: "OPEN" });
    const arup7795 = invoices.find((inv) => inv.invoice_ref === "ARUP-7795");
    expect(arup7795).toBeDefined();

    const result = traceInvoice(arup7795!, "2025-01");
    expect(result.match_status).toBe("MISSING");
  });

  it("matches normal invoices correctly", async () => {
    const { traceInvoice } = await import("../../src/tools/nova/trace-invoice.js");
    const { getAPInvoices } = await import("../../src/db/queries.js");

    const invoices = getAPInvoices("MER-AU-ENG", { status: "OPEN", period: "2025-01" });
    const ae9001 = invoices.find((inv) => inv.invoice_ref === "AE-9001");
    expect(ae9001).toBeDefined();

    const result = traceInvoice(ae9001!, "2025-01");
    expect(result.match_status).toBe("MATCHED");
  });
});
