import { fetchBankStatement } from "./atlas/fetch-bank-statement.js";
import { matchTransactions } from "./atlas/match-transactions.js";
import { generateReconWorkpaper } from "./atlas/generate-workpaper.js";
import { createException, formatExceptionMarkdown } from "./atlas/create-exception.js";
import { proposeJournalEntry } from "./atlas/propose-journal-entry.js";
import { queryGLBalance, queryGLTransactions } from "./shared/query-gl.js";
import { queryAPSubledger } from "./nova/query-ap-subledger.js";
import { traceInvoice, compareBalances } from "./nova/trace-invoice.js";
import { generateAPWorkpaper } from "./nova/generate-ap-workpaper.js";
import { computeVariances } from "./echo/compute-variances.js";
import { generateVarianceCommentary } from "./echo/generate-commentary.js";
import { getBudgetLines, getActuals, getPriorYearActuals } from "../db/queries.js";
import { readFileSync, writeFileSync, appendFileSync } from "fs";

export type ToolFunction = (params: Record<string, unknown>) => unknown;

function buildToolRegistry(): Record<string, ToolFunction> {
  return {
    fetch_bank_statement: (params) => {
      return fetchBankStatement(
        params.entity_id as string,
        params.gl_account_id as string,
        params.period as string
      );
    },

    query_gl_balance: (params) => {
      return queryGLBalance(params.account_id as string, params.period as string);
    },

    query_gl_transactions: (params) => {
      return queryGLTransactions(
        params.account_id as string,
        params.period as string,
        params.source_filter as string | undefined
      );
    },

    match_transactions: (params) => {
      return matchTransactions(
        params.bank_transactions as Parameters<typeof matchTransactions>[0],
        params.gl_transactions as Parameters<typeof matchTransactions>[1],
        params.matching_rules as Parameters<typeof matchTransactions>[2]
      );
    },

    generate_recon_workpaper: (params) => {
      return generateReconWorkpaper(
        params as unknown as Parameters<typeof generateReconWorkpaper>[0]
      );
    },

    create_exception: (params) => {
      const exc = createException(params as unknown as Parameters<typeof createException>[0]);
      return { ...exc, markdown: formatExceptionMarkdown(exc) };
    },

    propose_journal_entry: (params) => {
      return proposeJournalEntry(
        params.entries as Parameters<typeof proposeJournalEntry>[0],
        params.justification as string,
        params.memory_reference as string | undefined
      );
    },

    query_ap_subledger: (params) => {
      return queryAPSubledger(params.entity_id as string, {
        period: params.period as string | undefined,
        status: params.status as string | undefined,
        vendorId: params.vendor_id as string | undefined,
      });
    },

    compare_balances: (params) => {
      return compareBalances(params.ap_total as number, params.gl_balance as number);
    },

    trace_invoice: (params) => {
      return traceInvoice(
        params.invoice as Parameters<typeof traceInvoice>[0],
        params.period as string
      );
    },

    generate_ap_workpaper: (params) => {
      return generateAPWorkpaper(
        params as unknown as Parameters<typeof generateAPWorkpaper>[0]
      );
    },

    query_actuals: (params) => {
      return getActuals(params.entity_id as string, params.period as string);
    },

    query_budget: (params) => {
      return getBudgetLines(
        params.entity_id as string,
        params.period as string,
        params.version as string | undefined
      );
    },

    query_prior_period: (params) => {
      return getPriorYearActuals(params.entity_id as string, params.period as string);
    },

    compute_variances: (params) => {
      return computeVariances(
        params.budget as Parameters<typeof computeVariances>[0],
        params.actuals as Parameters<typeof computeVariances>[1],
        params.prior_year as Parameters<typeof computeVariances>[2],
        params.threshold_pct as number | undefined,
        params.threshold_amount as number | undefined
      );
    },

    generate_commentary: (params) => {
      return generateVarianceCommentary(
        params.variances as Parameters<typeof generateVarianceCommentary>[0],
        params.memory_context as string
      );
    },

    update_memory: (params) => {
      const memoryPath = params.memory_path as string;
      const entry = params.entry as string;
      appendFileSync(memoryPath, `\n${entry}\n`);
      return { success: true, path: memoryPath };
    },

    commit_output: (params) => {
      const filePath = params.file_path as string;
      const content = params.content as string;
      writeFileSync(filePath, content, "utf-8");
      return { success: true, path: filePath };
    },

    read_memory: (params) => {
      const memoryPath = params.memory_path as string;
      try {
        return { content: readFileSync(memoryPath, "utf-8") };
      } catch {
        return { content: "", error: "Memory file not found" };
      }
    },
  };
}

let registry: Record<string, ToolFunction> | null = null;

export function getToolRegistry(): Record<string, ToolFunction> {
  if (!registry) {
    registry = buildToolRegistry();
  }
  return registry;
}

export function getToolsForAgent(agentTools: string[]): Record<string, ToolFunction> {
  const fullRegistry = getToolRegistry();
  const agentRegistry: Record<string, ToolFunction> = {};
  for (const toolName of agentTools) {
    if (fullRegistry[toolName]) {
      agentRegistry[toolName] = fullRegistry[toolName];
    }
  }
  return agentRegistry;
}
