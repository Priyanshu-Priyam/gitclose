import { randomUUID } from "crypto";

export type ExceptionType = "UNMATCHED" | "CUTOFF" | "THRESHOLD" | "SYSTEMIC" | "OTHER";

export interface ExceptionInput {
  exception_type: ExceptionType;
  amount: number;
  description: string;
  counterparty?: string;
  bank_ref?: string;
  assigned_to?: string;
  task_id?: string;
  memory_match?: {
    found: boolean;
    prior_instance?: string;
    prior_resolution?: string;
    prior_pr?: string;
    confidence?: string;
    suggestion?: string;
  };
}

export interface ExceptionRecord {
  exception_id: string;
  exception_type: ExceptionType;
  amount: number;
  description: string;
  counterparty: string | null;
  bank_ref: string | null;
  status: string;
  assigned_to: string | null;
  memory_match: boolean;
  created_at: string;
  memory_detail?: ExceptionInput["memory_match"];
}

export function createException(input: ExceptionInput): ExceptionRecord {
  let status = "OPEN";
  let assignedTo = input.assigned_to ?? null;

  if (Math.abs(input.amount) > 50000) {
    status = "ESCALATED";
    assignedTo = assignedTo ?? "james.wong@meridian.com.au";
  }

  if (
    input.exception_type === "UNMATCHED" &&
    input.amount > 0 &&
    Math.abs(input.amount) > 10000
  ) {
    status = "ESCALATED";
    assignedTo = assignedTo ?? "james.wong@meridian.com.au";
  }

  return {
    exception_id: `EXC-${randomUUID().split("-")[0].toUpperCase()}`,
    exception_type: input.exception_type,
    amount: input.amount,
    description: input.description,
    counterparty: input.counterparty ?? null,
    bank_ref: input.bank_ref ?? null,
    status,
    assigned_to: assignedTo,
    memory_match: !!input.memory_match?.found,
    created_at: new Date().toISOString(),
    memory_detail: input.memory_match,
  };
}

export function formatExceptionMarkdown(exc: ExceptionRecord): string {
  let md = `# Exception Report: ${exc.exception_id}\n\n`;
  md += `**Type:** ${exc.exception_type}\n`;
  md += `**Amount:** $${Math.abs(exc.amount).toLocaleString("en-AU", { minimumFractionDigits: 2 })}\n`;
  md += `**Status:** ${exc.status}\n`;
  md += `**Counterparty:** ${exc.counterparty ?? "Unknown"}\n`;
  if (exc.bank_ref) md += `**Bank Reference:** ${exc.bank_ref}\n`;
  if (exc.assigned_to) md += `**Assigned To:** ${exc.assigned_to}\n`;
  md += `**Created:** ${exc.created_at}\n\n`;
  md += `## Description\n\n${exc.description}\n\n`;

  if (exc.memory_match && exc.memory_detail) {
    md += `## Memory Match\n\n`;
    md += `🧠 A similar pattern was found in agent memory.\n\n`;
    md += `- **Prior instance:** ${exc.memory_detail.prior_instance}\n`;
    md += `- **Prior resolution:** ${exc.memory_detail.prior_resolution}\n`;
    md += `- **Approved in:** PR #${exc.memory_detail.prior_pr}\n`;
    md += `- **Confidence:** ${exc.memory_detail.confidence}\n\n`;
    md += `**Suggestion:** ${exc.memory_detail.suggestion}\n`;
  }

  return md;
}
