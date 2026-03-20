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

describe("compute_variances", () => {
  it("produces correct $ and % variance for each P&L line", async () => {
    const { computeVariances } = await import(
      "../../src/tools/echo/compute-variances.js"
    );
    const { getBudgetLines, getActuals, getPriorYearActuals } = await import(
      "../../src/db/queries.js"
    );

    const budget = getBudgetLines("MER-AU-ENG", "2025-01");
    const actuals = getActuals("MER-AU-ENG", "2025-01");
    const priorYear = getPriorYearActuals("MER-AU-ENG", "2025-01");

    const result = computeVariances(budget, actuals, priorYear);

    expect(result.lines.length).toBe(18);

    // Engineering Services Revenue: budget -12.5M, actual -11.8M
    // Display: budget 12.5M, actual 11.8M
    // Revenue unfavorable: |11.8M| - |12.5M| = -700K
    const engRev = result.lines.find((l) => l.account_id === "4000-001");
    expect(engRev).toBeDefined();
    expect(engRev!.display_budget).toBeCloseTo(12500000, 0);
    expect(engRev!.display_actual).toBeCloseTo(11800000, 0);
    expect(engRev!.variance_dollar).toBeCloseTo(-700000, 0);
    expect(engRev!.is_favorable).toBe(false);

    // PM Fees: budget -3.2M, actual -3.5M
    // Revenue favorable: |3.5M| - |3.2M| = +300K
    const pmFees = result.lines.find((l) => l.account_id === "4000-002");
    expect(pmFees).toBeDefined();
    expect(pmFees!.variance_dollar).toBeCloseTo(300000, 0);
    expect(pmFees!.is_favorable).toBe(true);

    // Subcontractor Costs: budget 3.2M, actual 2.8M
    // Expense favorable: 3.2M - 2.8M = +400K
    const subcon = result.lines.find((l) => l.account_id === "5000-002");
    expect(subcon).toBeDefined();
    expect(subcon!.variance_dollar).toBeCloseTo(400000, 0);
    expect(subcon!.is_favorable).toBe(true);

    // Project Travel: budget 400K, actual 580K
    // Expense unfavorable: 400K - 580K = -180K
    const travel = result.lines.find((l) => l.account_id === "5000-004");
    expect(travel).toBeDefined();
    expect(travel!.variance_dollar).toBeCloseTo(-180000, 0);
    expect(travel!.is_favorable).toBe(false);
  });

  it("correctly flags material variances based on thresholds", async () => {
    const { computeVariances } = await import(
      "../../src/tools/echo/compute-variances.js"
    );
    const { getBudgetLines, getActuals } = await import("../../src/db/queries.js");

    const budget = getBudgetLines("MER-AU-ENG", "2025-01");
    const actuals = getActuals("MER-AU-ENG", "2025-01");

    const result = computeVariances(budget, actuals);

    expect(result.summary.material_variances).toBeGreaterThan(0);
    expect(result.summary.detailed_analysis_required).toBeGreaterThan(0);

    // Rent at exactly budget should not be material
    const rent = result.lines.find((l) => l.account_id === "6000-002");
    expect(rent).toBeDefined();
    expect(rent!.exceeds_threshold).toBe(false);
  });

  it("computes operating profit summary correctly", async () => {
    const { computeVariances } = await import(
      "../../src/tools/echo/compute-variances.js"
    );
    const { getBudgetLines, getActuals } = await import("../../src/db/queries.js");

    const budget = getBudgetLines("MER-AU-ENG", "2025-01");
    const actuals = getActuals("MER-AU-ENG", "2025-01");

    const result = computeVariances(budget, actuals);

    // Revenue budget: 12.5M + 3.2M + 0.25M = 15.95M, plus other income 5K = 15.955M
    // But 7000-001 (interest income) is OTHER_INCOME, 7000-002 and 7000-004 are OTHER_EXPENSE
    expect(result.summary.total_revenue_budget).toBeCloseTo(15955000, 0);
    expect(result.summary.operating_profit_budget).toBeGreaterThan(0);
  });
});
