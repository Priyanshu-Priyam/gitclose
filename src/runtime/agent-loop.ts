import type { MessageParam, ToolResultBlockParam } from "@anthropic-ai/sdk/resources/messages";
import type { LoadedAgent } from "./agent-loader.js";
import type { LLMResponse, ToolDefinition } from "./llm-client.js";
import { LLMClient } from "./llm-client.js";
import { ResponseCache } from "./cache.js";
import { runPreToolHook, runOnExceptionHook } from "./hook-runner.js";
import { readMemory } from "./memory.js";
import type { ToolFunction } from "../tools/registry.js";

const MAX_ITERATIONS = 15;
const CIRCUIT_BREAKER_MS = 5 * 60 * 1000; // 5 minutes
const CONTEXT_TRUNCATION_THRESHOLD = 0.8;
const ESTIMATED_MAX_TOKENS = 200000;

export interface AgentLoopOptions {
  replay?: boolean;
  cacheDir?: string;
  taskDescription?: string;
  onIteration?: (iteration: number, text: string) => void;
  onToolCall?: (tool: string, params: Record<string, unknown>) => void;
  onToolResult?: (tool: string, result: unknown) => void;
  onComplete?: (finalText: string) => void;
  commitFn?: (message: string, files: Map<string, string>) => Promise<void>;
}

export interface AgentLoopResult {
  success: boolean;
  iterations: number;
  finalText: string;
  outputs: Map<string, string>;
  exceptions: Record<string, unknown>[];
  proposedJEs: Record<string, unknown>[];
  error?: string;
}

export async function runAgentLoop(
  agent: LoadedAgent,
  tools: Record<string, ToolFunction>,
  options: AgentLoopOptions = {}
): Promise<AgentLoopResult> {
  const startTime = Date.now();
  const llmClient = new LLMClient();

  const cache = options.cacheDir
    ? new ResponseCache(options.cacheDir)
    : null;

  if (options.replay && cache) {
    cache.loadCachedResponses(agent.config.name);
  }

  if (cache && !options.replay) {
    cache.startRecording();
  }

  const toolDefs = buildToolDefinitions(agent, tools);
  const messages: MessageParam[] = [];
  const outputs = new Map<string, string>();
  const exceptions: Record<string, unknown>[] = [];
  const proposedJEs: Record<string, unknown>[] = [];

  // Initial user message with task description
  const taskMsg = options.taskDescription ??
    `Perform your assigned task for entity MER-AU-ENG, period 2025-01. ` +
    `Use your tools to complete the reconciliation/analysis, generate workpapers, ` +
    `create exceptions for any issues found, and propose journal entries where appropriate.`;

  messages.push({ role: "user", content: taskMsg });

  let iteration = 0;
  let finalText = "";

  while (iteration < MAX_ITERATIONS) {
    // Circuit breaker
    const elapsed = Date.now() - startTime;
    if (elapsed > CIRCUIT_BREAKER_MS) {
      console.warn(`⚠️  Circuit breaker: ${agent.config.name} exceeded ${CIRCUIT_BREAKER_MS / 1000}s`);
      return {
        success: false,
        iterations: iteration,
        finalText: `Agent timed out after ${Math.round(elapsed / 1000)}s. Partial work completed.`,
        outputs,
        exceptions,
        proposedJEs,
        error: "CIRCUIT_BREAKER_TIMEOUT",
      };
    }

    // Context window management
    if (estimateTokens(messages) > ESTIMATED_MAX_TOKENS * CONTEXT_TRUNCATION_THRESHOLD) {
      truncateContext(messages);
    }

    iteration++;
    options.onIteration?.(iteration, `Iteration ${iteration}/${MAX_ITERATIONS}`);

    let response: LLMResponse;

    try {
      if (options.replay && cache) {
        const cached = cache.getReplay(agent.config.name, iteration);
        if (cached) {
          response = cached;
        } else {
          console.warn(`⚠️  No cached response for ${agent.config.name} iteration ${iteration}, falling back to live`);
          response = await llmClient.complete(
            agent.systemPrompt,
            messages,
            toolDefs,
            {
              model: agent.config.model.name,
              temperature: agent.config.model.temperature,
              maxTokens: agent.config.model.max_tokens,
            }
          );
        }
      } else {
        response = await llmClient.complete(
          agent.systemPrompt,
          messages,
          toolDefs,
          {
            model: agent.config.model.name,
            temperature: agent.config.model.temperature,
            maxTokens: agent.config.model.max_tokens,
          }
        );
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);

      // API failure — try replay mode
      if (cache) {
        const cached = cache.getReplay(agent.config.name, iteration);
        if (cached) {
          console.warn(`⚠️  API error, using cached response: ${errMsg}`);
          response = cached;
        } else {
          return {
            success: false,
            iterations: iteration,
            finalText: `API error: ${errMsg}`,
            outputs,
            exceptions,
            proposedJEs,
            error: errMsg,
          };
        }
      } else {
        return {
          success: false,
          iterations: iteration,
          finalText: `API error: ${errMsg}`,
          outputs,
          exceptions,
          proposedJEs,
          error: errMsg,
        };
      }
    }

    // Record for future replay
    if (cache && !options.replay) {
      cache.record(
        agent.config.name,
        iteration,
        agent.systemPrompt,
        JSON.stringify(messages),
        response
      );
    }

    // Process response
    if (response.toolCalls.length === 0) {
      // No tool calls — agent is done or needs a nudge
      finalText = response.text;

      if (response.stopReason === "end_turn") {
        options.onComplete?.(finalText);
        break;
      }

      // Nudge the agent to continue
      messages.push({ role: "assistant", content: response.text });
      messages.push({
        role: "user",
        content: "Please continue with your task. If you are done, provide your final summary.",
      });
      continue;
    }

    // Build assistant message with tool use
    const assistantContent: Array<{ type: "text"; text: string } | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }> = [];

    if (response.text) {
      assistantContent.push({ type: "text", text: response.text });
    }

    for (const tc of response.toolCalls) {
      assistantContent.push({
        type: "tool_use",
        id: tc.id,
        name: tc.name,
        input: tc.input,
      });
    }

    messages.push({ role: "assistant", content: assistantContent });

    // Execute tool calls
    const toolResults: ToolResultBlockParam[] = [];

    for (const tc of response.toolCalls) {
      options.onToolCall?.(tc.name, tc.input);

      // Run pre-tool hook
      const hookResult = runPreToolHook({
        tool: tc.name,
        params: tc.input,
        agentDir: agent.agentDir,
        memoryContent: readMemory(agent.memoryPath),
      });

      if (!hookResult.allow) {
        toolResults.push({
          type: "tool_result",
          tool_use_id: tc.id,
          content: JSON.stringify({
            error: true,
            message: `Hook blocked: ${hookResult.reason}`,
          }),
        });
        continue;
      }

      const params = hookResult.modifiedParams ?? tc.input;

      // Execute the tool
      try {
        const toolFn = tools[tc.name];
        if (!toolFn) {
          toolResults.push({
            type: "tool_result",
            tool_use_id: tc.id,
            content: JSON.stringify({
              error: true,
              message: `Tool '${tc.name}' not found in registry`,
            }),
          });
          continue;
        }

        const result = toolFn(params);
        options.onToolResult?.(tc.name, result);

        // Track special outputs
        if (tc.name === "create_exception") {
          const enriched = runOnExceptionHook({
            exception: result as Record<string, unknown>,
            memoryContent: readMemory(agent.memoryPath),
          });
          exceptions.push(enriched);

          toolResults.push({
            type: "tool_result",
            tool_use_id: tc.id,
            content: JSON.stringify(enriched),
          });
        } else if (tc.name === "propose_journal_entry") {
          proposedJEs.push(result as Record<string, unknown>);
          toolResults.push({
            type: "tool_result",
            tool_use_id: tc.id,
            content: JSON.stringify(result),
          });
        } else if (tc.name === "commit_output") {
          const r = result as { path: string };
          if (r.path && params.content) {
            outputs.set(r.path, String(params.content));
          }
          toolResults.push({
            type: "tool_result",
            tool_use_id: tc.id,
            content: JSON.stringify(result),
          });
        } else if (tc.name === "generate_recon_workpaper" || tc.name === "generate_ap_workpaper") {
          const workpaper = typeof result === "string" ? result : JSON.stringify(result);
          outputs.set(`workpaper-${agent.config.name}.md`, workpaper);
          toolResults.push({
            type: "tool_result",
            tool_use_id: tc.id,
            content: typeof result === "string" ? result : JSON.stringify(result),
          });
        } else if (tc.name === "generate_commentary") {
          const commentary = typeof result === "string" ? result : JSON.stringify(result);
          outputs.set(`commentary-${agent.config.name}.md`, commentary);
          toolResults.push({
            type: "tool_result",
            tool_use_id: tc.id,
            content: typeof result === "string" ? result : JSON.stringify(result),
          });
        } else {
          const content = typeof result === "string" ? result : JSON.stringify(result);
          toolResults.push({
            type: "tool_result",
            tool_use_id: tc.id,
            content: content.length > 50000 ? content.slice(0, 50000) + "\n...[truncated]" : content,
          });
        }

        // Commit output if commitFn provided
        if (options.commitFn && (tc.name === "generate_recon_workpaper" || tc.name === "generate_ap_workpaper" || tc.name === "generate_commentary" || tc.name === "create_exception" || tc.name === "propose_journal_entry")) {
          try {
            const commitFiles = new Map<string, string>();
            const outputContent = typeof result === "string" ? result : JSON.stringify(result, null, 2);
            const fileName = tc.name === "create_exception"
              ? `exceptions/${(result as Record<string, unknown>).exception_id}.md`
              : tc.name === "propose_journal_entry"
              ? `proposed-jes/${(result as Record<string, unknown>).je_id}.md`
              : `output/${tc.name}.md`;
            commitFiles.set(fileName, outputContent);
            await options.commitFn(`${agent.config.identity.display_name}: ${tc.name}`, commitFiles);
          } catch {
            // Non-fatal — continue even if commit fails
          }
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        toolResults.push({
          type: "tool_result",
          tool_use_id: tc.id,
          content: JSON.stringify({
            error: true,
            message: `Tool '${tc.name}' failed: ${errMsg}`,
          }),
        });
      }
    }

    messages.push({ role: "user", content: toolResults });
  }

  if (iteration >= MAX_ITERATIONS) {
    console.warn(`⚠️  ${agent.config.name} hit max iterations (${MAX_ITERATIONS})`);
  }

  // Save recording
  if (cache && !options.replay) {
    cache.saveRecording(agent.config.name);
  }

  return {
    success: true,
    iterations: iteration,
    finalText,
    outputs,
    exceptions,
    proposedJEs,
  };
}

function buildToolDefinitions(
  agent: LoadedAgent,
  tools: Record<string, ToolFunction>
): ToolDefinition[] {
  const defs: ToolDefinition[] = [];

  const toolSchemas: Record<string, { description: string; input_schema: Record<string, unknown> }> = {
    fetch_bank_statement: {
      description: "Fetch bank statement and transactions for a specific account and period",
      input_schema: {
        type: "object",
        properties: {
          entity_id: { type: "string", description: "Entity ID (e.g., MER-AU-ENG)" },
          gl_account_id: { type: "string", description: "GL account ID (e.g., 1000-001)" },
          period: { type: "string", description: "Period in YYYY-MM format" },
        },
        required: ["entity_id", "gl_account_id", "period"],
      },
    },
    query_gl_balance: {
      description: "Query the GL balance for a specific account and period. Returns opening balance, net movement, and closing balance.",
      input_schema: {
        type: "object",
        properties: {
          account_id: { type: "string", description: "GL account ID" },
          period: { type: "string", description: "Period in YYYY-MM format" },
        },
        required: ["account_id", "period"],
      },
    },
    query_gl_transactions: {
      description: "List all GL transactions for an account in a period",
      input_schema: {
        type: "object",
        properties: {
          account_id: { type: "string", description: "GL account ID" },
          period: { type: "string", description: "Period in YYYY-MM format" },
          source_filter: { type: "string", description: "Optional source filter (AR, AP, PAYROLL)" },
        },
        required: ["account_id", "period"],
      },
    },
    match_transactions: {
      description: "Match bank transactions to GL entries using amount, date, and reference matching",
      input_schema: {
        type: "object",
        properties: {
          bank_transactions: { type: "array", description: "Bank transaction objects" },
          gl_transactions: { type: "array", description: "GL transaction objects" },
          matching_rules: {
            type: "object",
            properties: {
              dateWindowDays: { type: "number" },
              fuzzyThresholdPct: { type: "number" },
            },
          },
        },
        required: ["bank_transactions", "gl_transactions"],
      },
    },
    generate_recon_workpaper: {
      description: "Generate a formatted bank reconciliation workpaper in markdown",
      input_schema: {
        type: "object",
        properties: {
          entity: { type: "string" },
          period: { type: "string" },
          gl_account: { type: "string" },
          bank_balance: { type: "number" },
          gl_balance: { type: "number" },
          matched: { type: "array" },
          timing: { type: "array" },
          adjustments: { type: "array" },
          exceptions: { type: "array" },
        },
        required: ["entity", "period", "gl_account", "bank_balance", "gl_balance", "matched", "timing", "adjustments", "exceptions"],
      },
    },
    create_exception: {
      description: "Create an exception record for an item that cannot be automatically explained",
      input_schema: {
        type: "object",
        properties: {
          exception_type: { type: "string", enum: ["UNMATCHED", "CUTOFF", "THRESHOLD", "SYSTEMIC", "OTHER"] },
          amount: { type: "number" },
          description: { type: "string" },
          counterparty: { type: "string" },
          bank_ref: { type: "string" },
          assigned_to: { type: "string" },
        },
        required: ["exception_type", "amount", "description"],
      },
    },
    propose_journal_entry: {
      description: "Propose a journal entry for human review. Cannot post — only propose.",
      input_schema: {
        type: "object",
        properties: {
          entries: {
            type: "array",
            items: {
              type: "object",
              properties: {
                account_id: { type: "string" },
                amount: { type: "number" },
                description: { type: "string" },
              },
            },
          },
          justification: { type: "string" },
          memory_reference: { type: "string" },
        },
        required: ["entries", "justification"],
      },
    },
    update_memory: {
      description: "Append a new entry to MEMORY.md",
      input_schema: {
        type: "object",
        properties: {
          memory_path: { type: "string" },
          entry: { type: "string" },
        },
        required: ["memory_path", "entry"],
      },
    },
    commit_output: {
      description: "Write output content to a file",
      input_schema: {
        type: "object",
        properties: {
          file_path: { type: "string" },
          content: { type: "string" },
        },
        required: ["file_path", "content"],
      },
    },
    read_memory: {
      description: "Read MEMORY.md content for known patterns",
      input_schema: {
        type: "object",
        properties: {
          memory_path: { type: "string" },
        },
        required: ["memory_path"],
      },
    },
    query_ap_subledger: {
      description: "Query AP sub-ledger for open invoices, with optional filters",
      input_schema: {
        type: "object",
        properties: {
          entity_id: { type: "string" },
          period: { type: "string" },
          status: { type: "string" },
          vendor_id: { type: "string" },
        },
        required: ["entity_id"],
      },
    },
    compare_balances: {
      description: "Compare AP sub-ledger total to GL payables balance",
      input_schema: {
        type: "object",
        properties: {
          ap_total: { type: "number" },
          gl_balance: { type: "number" },
        },
        required: ["ap_total", "gl_balance"],
      },
    },
    trace_invoice: {
      description: "Trace a specific AP invoice to its GL posting by reference number",
      input_schema: {
        type: "object",
        properties: {
          invoice: { type: "object", description: "AP invoice record" },
          period: { type: "string" },
        },
        required: ["invoice", "period"],
      },
    },
    generate_ap_workpaper: {
      description: "Generate AP reconciliation workpaper in markdown",
      input_schema: {
        type: "object",
        properties: {
          entity: { type: "string" },
          period: { type: "string" },
          ap_total: { type: "number" },
          gl_balance: { type: "number" },
          matched_invoices: { type: "array" },
          cutoff_errors: { type: "array" },
          missing_invoices: { type: "array" },
          duplicate_warnings: { type: "array" },
        },
        required: ["entity", "period", "ap_total", "gl_balance", "matched_invoices", "cutoff_errors", "missing_invoices", "duplicate_warnings"],
      },
    },
    query_actuals: {
      description: "Query current period actuals from prior_period_actuals table",
      input_schema: {
        type: "object",
        properties: {
          entity_id: { type: "string" },
          period: { type: "string" },
        },
        required: ["entity_id", "period"],
      },
    },
    query_budget: {
      description: "Query budget lines for entity and period",
      input_schema: {
        type: "object",
        properties: {
          entity_id: { type: "string" },
          period: { type: "string" },
          version: { type: "string" },
        },
        required: ["entity_id", "period"],
      },
    },
    query_prior_period: {
      description: "Query prior year same month actuals for YoY comparison",
      input_schema: {
        type: "object",
        properties: {
          entity_id: { type: "string" },
          period: { type: "string" },
        },
        required: ["entity_id", "period"],
      },
    },
    compute_variances: {
      description: "Compute budget vs actual variances with sign convention handling. Revenue (negative in GL) shown as positive. Favorable = actual < budget for expenses, actual > budget for revenue.",
      input_schema: {
        type: "object",
        properties: {
          budget: { type: "array" },
          actuals: { type: "array" },
          prior_year: { type: "array" },
          threshold_pct: { type: "number" },
          threshold_amount: { type: "number" },
        },
        required: ["budget", "actuals"],
      },
    },
    generate_commentary: {
      description: "Generate management variance commentary in markdown format",
      input_schema: {
        type: "object",
        properties: {
          variances: { type: "object", description: "VarianceResult from compute_variances" },
          memory_context: { type: "string", description: "Memory content for evidence-based explanations" },
        },
        required: ["variances", "memory_context"],
      },
    },
  };

  for (const toolName of agent.config.tools) {
    if (tools[toolName] && toolSchemas[toolName]) {
      defs.push({
        name: toolName,
        ...toolSchemas[toolName],
      });
    }
  }

  return defs;
}

function estimateTokens(messages: MessageParam[]): number {
  const json = JSON.stringify(messages);
  return Math.ceil(json.length / 4);
}

function truncateContext(messages: MessageParam[]): void {
  // Keep first message (task description) and last 6 messages (3 most recent tool interactions)
  if (messages.length <= 7) return;

  const first = messages[0];
  const recent = messages.slice(-6);

  const summary: MessageParam = {
    role: "user",
    content: "[Previous tool interactions have been summarized to fit context window. Continue with the task.]",
  };

  messages.length = 0;
  messages.push(first, summary, ...recent);
}
