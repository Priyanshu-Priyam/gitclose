import type { VarianceResult, VarianceLine } from "./compute-variances.js";

export function generateVarianceCommentary(result: VarianceResult, memoryContext: string): string {
  const fmt = (n: number): string => {
    const abs = Math.abs(n);
    return `$${abs.toLocaleString("en-AU", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };
  const pct = (n: number): string => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;

  const s = result.summary;

  let md = `# P&L Variance Commentary\n\n`;
  md += `**Entity:** Meridian Engineering Pty Ltd\n`;
  md += `**Period:** ${result.period}\n`;
  md += `**Prepared by:** Echo (Variance Analysis Agent)\n`;
  md += `**Date:** ${new Date().toISOString().split("T")[0]}\n\n`;
  md += `---\n\n`;

  md += `## Executive Summary\n\n`;
  md += `| Metric | Budget | Actual | Variance |\n`;
  md += `|--------|-------:|-------:|---------:|\n`;
  md += `| Revenue | ${fmt(s.total_revenue_budget)} | ${fmt(s.total_revenue_actual)} | ${fmt(s.total_revenue_actual - s.total_revenue_budget)} |\n`;
  md += `| Cost of Sales | ${fmt(s.total_cogs_budget)} | ${fmt(s.total_cogs_actual)} | ${fmt(s.total_cogs_budget - s.total_cogs_actual)} |\n`;
  md += `| Gross Margin | ${fmt(s.gross_margin_budget)} | ${fmt(s.gross_margin_actual)} | ${fmt(s.gross_margin_actual - s.gross_margin_budget)} |\n`;
  md += `| Operating Expenses | ${fmt(s.total_opex_budget)} | ${fmt(s.total_opex_actual)} | ${fmt(s.total_opex_budget - s.total_opex_actual)} |\n`;
  md += `| **Operating Profit** | **${fmt(s.operating_profit_budget)}** | **${fmt(s.operating_profit_actual)}** | **${fmt(s.operating_profit_actual - s.operating_profit_budget)}** |\n\n`;

  const opDiff = s.operating_profit_actual - s.operating_profit_budget;
  md += opDiff >= 0
    ? `Operating profit is **${fmt(opDiff)} favorable** to budget.\n\n`
    : `Operating profit is **${fmt(Math.abs(opDiff))} unfavorable** to budget.\n\n`;

  md += `---\n\n`;

  md += `## Material Variances (${s.material_variances} items exceed threshold)\n\n`;
  md += `| Account | Budget | Actual | Variance ($) | Variance (%) | F/U |\n`;
  md += `|---------|-------:|-------:|-------------:|-------------:|:---:|\n`;

  const materialLines = result.lines.filter((l) => l.exceeds_threshold);
  for (const line of materialLines) {
    const flag = line.requires_detailed_analysis ? " ★★" : " ★";
    md += `| ${line.account_name} | ${fmt(line.display_budget)} | ${fmt(line.display_actual)} | ${fmt(line.variance_dollar)} | ${pct(line.variance_pct)} | ${line.is_favorable ? "F" : "U"}${flag} |\n`;
  }
  md += `\n★ = exceeds 5% threshold | ★★ = exceeds 10% threshold (detailed analysis required)\n\n`;

  md += `---\n\n`;

  md += `## Detailed Commentary\n\n`;

  for (const line of materialLines) {
    md += generateLineCommentary(line, memoryContext);
  }

  const nonMaterial = result.lines.filter((l) => !l.exceeds_threshold);
  if (nonMaterial.length > 0) {
    md += `## Non-Material Items\n\n`;
    md += `The following items are within tolerance (< 5% and < $50K):\n\n`;
    for (const line of nonMaterial) {
      md += `- **${line.account_name}**: ${fmt(line.display_actual)} vs budget ${fmt(line.display_budget)} (${pct(line.variance_pct)}, ${line.is_favorable ? "favorable" : "unfavorable"})\n`;
    }
    md += `\n`;
  }

  return md;
}

function generateLineCommentary(line: VarianceLine, memoryContext: string): string {
  const fmt = (n: number): string =>
    `$${Math.abs(n).toLocaleString("en-AU", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  const direction = line.is_favorable ? "favorable" : "unfavorable";

  let md = `### ${line.account_name} (${line.account_id})\n\n`;
  md += `**Variance:** ${fmt(line.variance_dollar)} ${direction} (${line.variance_pct >= 0 ? "+" : ""}${line.variance_pct.toFixed(1)}%)\n`;
  md += `**Budget:** ${fmt(line.display_budget)} | **Actual:** ${fmt(line.display_actual)}\n`;

  if (line.yoy_dollar !== undefined) {
    const yoyDir = line.yoy_dollar >= 0 ? "increase" : "decrease";
    md += `**YoY Change:** ${fmt(line.yoy_dollar)} ${yoyDir}\n`;
  }
  md += `\n`;

  const accountLower = line.account_name.toLowerCase();
  const memLower = memoryContext.toLowerCase();

  if (memLower.includes(line.account_id) || memLower.includes(accountLower.split(" ")[0])) {
    md += `*[source:memory] Explanation informed by agent memory — see memory entry for this account.*\n\n`;
  } else {
    md += `*[source:investigation] This variance requires investigation — no supporting context found in available data or memory.*\n\n`;
  }

  return md;
}
