import { getAccountInfo } from "../../db/queries.js";
import type { BudgetLine, PriorPeriodActual } from "../../db/queries.js";

export interface VarianceLine {
  account_id: string;
  account_name: string;
  account_type: string;
  budget: number;
  actual: number;
  prior_year?: number;
  variance_dollar: number;
  variance_pct: number;
  yoy_dollar?: number;
  yoy_pct?: number;
  is_favorable: boolean;
  exceeds_threshold: boolean;
  requires_detailed_analysis: boolean;
  display_budget: number;
  display_actual: number;
  display_variance: number;
}

export interface VarianceResult {
  period: string;
  entity_id: string;
  lines: VarianceLine[];
  summary: {
    total_revenue_budget: number;
    total_revenue_actual: number;
    total_cogs_budget: number;
    total_cogs_actual: number;
    total_opex_budget: number;
    total_opex_actual: number;
    gross_margin_budget: number;
    gross_margin_actual: number;
    operating_profit_budget: number;
    operating_profit_actual: number;
    material_variances: number;
    detailed_analysis_required: number;
  };
}

/**
 * GL sign convention:
 * - Revenue/income: NEGATIVE (credit balance)
 * - Expenses: POSITIVE (debit balance)
 *
 * Management presentation:
 * - Revenue shown as POSITIVE
 * - Expenses shown as POSITIVE
 * - Favorable: expenses actual < budget, revenue |actual| > |budget|
 */
export function computeVariances(
  budgetLines: BudgetLine[],
  actuals: PriorPeriodActual[],
  priorYear?: PriorPeriodActual[],
  thresholdPct: number = 5,
  thresholdAmount: number = 50000,
  detailThresholdPct: number = 10
): VarianceResult {
  const actualMap = new Map(actuals.map((a) => [a.account_id, a.actual_amount]));
  const pyMap = priorYear ? new Map(priorYear.map((a) => [a.account_id, a.actual_amount])) : undefined;

  const lines: VarianceLine[] = [];

  for (const bl of budgetLines) {
    const account = getAccountInfo(bl.account_id);
    if (!account) continue;

    const budget = bl.budget_amount;
    const actual = actualMap.get(bl.account_id) ?? 0;
    const prior = pyMap?.get(bl.account_id);

    const isRevenueOrIncome = ["REVENUE", "OTHER_INCOME"].includes(account.account_type);

    // For management display: revenue shown positive, expenses shown positive
    const displayBudget = isRevenueOrIncome ? Math.abs(budget) : budget;
    const displayActual = isRevenueOrIncome ? Math.abs(actual) : actual;

    // Variance calculation for management presentation
    let varianceDollar: number;
    let isFavorable: boolean;

    if (isRevenueOrIncome) {
      // Revenue: favorable when actual exceeds budget (both negative in GL, compare absolutes)
      varianceDollar = Math.abs(actual) - Math.abs(budget);
      isFavorable = varianceDollar >= 0;
    } else {
      // Expense: favorable when actual is below budget
      varianceDollar = budget - actual;
      isFavorable = varianceDollar >= 0;
    }

    varianceDollar = Math.round(varianceDollar * 100) / 100;

    const variancePct =
      displayBudget !== 0
        ? Math.round((varianceDollar / displayBudget) * 10000) / 100
        : 0;

    const exceedsThreshold =
      Math.abs(variancePct) >= thresholdPct || Math.abs(varianceDollar) >= thresholdAmount;
    const requiresDetail =
      Math.abs(variancePct) >= detailThresholdPct || Math.abs(varianceDollar) >= 100000;

    let yoyDollar: number | undefined;
    let yoyPct: number | undefined;

    if (prior !== undefined) {
      const displayPrior = isRevenueOrIncome ? Math.abs(prior) : prior;
      if (isRevenueOrIncome) {
        yoyDollar = Math.abs(actual) - Math.abs(prior);
      } else {
        yoyDollar = actual - prior;
      }
      yoyDollar = Math.round(yoyDollar * 100) / 100;
      yoyPct = displayPrior !== 0
        ? Math.round((yoyDollar / displayPrior) * 10000) / 100
        : 0;
    }

    lines.push({
      account_id: bl.account_id,
      account_name: account.account_name,
      account_type: account.account_type,
      budget,
      actual,
      prior_year: prior,
      variance_dollar: varianceDollar,
      variance_pct: variancePct,
      yoy_dollar: yoyDollar,
      yoy_pct: yoyPct,
      is_favorable: isFavorable,
      exceeds_threshold: exceedsThreshold,
      requires_detailed_analysis: requiresDetail,
      display_budget: displayBudget,
      display_actual: displayActual,
      display_variance: varianceDollar,
    });
  }

  const revLines = lines.filter((l) => ["REVENUE", "OTHER_INCOME"].includes(l.account_type));
  const cogsLines = lines.filter((l) => l.account_type === "COS");
  const opexLines = lines.filter((l) => l.account_type === "OPEX");

  const sum = (arr: VarianceLine[], key: "display_budget" | "display_actual") =>
    Math.round(arr.reduce((s, l) => s + l[key], 0) * 100) / 100;

  const totalRevBudget = sum(revLines, "display_budget");
  const totalRevActual = sum(revLines, "display_actual");
  const totalCogsBudget = sum(cogsLines, "display_budget");
  const totalCogsActual = sum(cogsLines, "display_actual");
  const totalOpexBudget = sum(opexLines, "display_budget");
  const totalOpexActual = sum(opexLines, "display_actual");

  return {
    period: budgetLines[0]?.period ?? "",
    entity_id: budgetLines[0]?.entity_id ?? "",
    lines,
    summary: {
      total_revenue_budget: totalRevBudget,
      total_revenue_actual: totalRevActual,
      total_cogs_budget: totalCogsBudget,
      total_cogs_actual: totalCogsActual,
      total_opex_budget: totalOpexBudget,
      total_opex_actual: totalOpexActual,
      gross_margin_budget: totalRevBudget - totalCogsBudget,
      gross_margin_actual: totalRevActual - totalCogsActual,
      operating_profit_budget: totalRevBudget - totalCogsBudget - totalOpexBudget,
      operating_profit_actual: totalRevActual - totalCogsActual - totalOpexActual,
      material_variances: lines.filter((l) => l.exceeds_threshold).length,
      detailed_analysis_required: lines.filter((l) => l.requires_detailed_analysis).length,
    },
  };
}
