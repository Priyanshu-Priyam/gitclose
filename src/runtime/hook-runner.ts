import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { parseMemoryPatterns, findMemoryMatch } from "./memory.js";

export interface HookContext {
  tool: string;
  params: Record<string, unknown>;
  agentDir: string;
  memoryContent: string;
}

export interface HookResult {
  allow: boolean;
  reason?: string;
  modifiedParams?: Record<string, unknown>;
}

export interface ExceptionHookContext {
  exception: Record<string, unknown>;
  memoryContent: string;
}

export function runPreToolHook(context: HookContext): HookResult {
  const hookPath = join(context.agentDir, "hooks", "preToolUse.js");
  if (!existsSync(hookPath)) {
    return { allow: true };
  }

  // Inline hook logic rather than dynamic import (more reliable for MVP)
  const blockedTools = ["post_journal", "modify_gl", "delete_transaction", "modify_ap"];
  if (blockedTools.includes(context.tool)) {
    return {
      allow: false,
      reason: `Tool '${context.tool}' is not permitted for this agent.`,
    };
  }

  if (context.tool === "create_exception" && context.params.amount) {
    const amount = Math.abs(parseFloat(String(context.params.amount)));

    if (amount > 50000) {
      context.params.status = "ESCALATED";
      context.params.assigned_to = "james.wong@meridian.com.au";
      return {
        allow: true,
        reason: `Exception amount $${amount.toFixed(2)} exceeds $50,000 threshold. Auto-escalated.`,
        modifiedParams: context.params,
      };
    }

    if (
      context.params.exception_type === "UNMATCHED" &&
      Number(context.params.amount) > 0 &&
      amount > 10000
    ) {
      context.params.status = "ESCALATED";
      context.params.assigned_to = "james.wong@meridian.com.au";
      return {
        allow: true,
        reason: `Unidentified credit over $10,000 — escalated.`,
        modifiedParams: context.params,
      };
    }

    if (context.params.exception_type === "CUTOFF") {
      context.params.status = "ESCALATED";
      context.params.assigned_to = "james.wong@meridian.com.au";
      return {
        allow: true,
        reason: `Cutoff error — always escalated for review.`,
        modifiedParams: context.params,
      };
    }
  }

  return { allow: true };
}

export function runOnExceptionHook(context: ExceptionHookContext): Record<string, unknown> {
  const exception = { ...context.exception };
  const patterns = parseMemoryPatterns(context.memoryContent);

  if (exception.counterparty && exception.amount) {
    const match = findMemoryMatch(
      patterns,
      String(exception.counterparty),
      Number(exception.amount)
    );

    if (match) {
      exception.memory_match = {
        found: true,
        prior_instance: match.date,
        prior_resolution: match.resolution,
        prior_pr: match.pr_reference,
        confidence: "HIGH",
        suggestion:
          `Similar pattern found in ${match.period}. ` +
          `Previously resolved as: ${match.resolution}. ` +
          `See PR #${match.pr_reference}.`,
      };
    }
  }

  return exception;
}
