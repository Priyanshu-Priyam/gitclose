import { appendFileSync, existsSync, readFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { getCloseRepoPath } from "./repo.js";

export interface AuditEntry {
  timestamp: string;
  agent: string;
  action: string;
  tool?: string;
  params?: Record<string, unknown>;
  result_summary?: string;
  commit_hash?: string;
  pr_id?: number;
  reviewer?: string;
}

function getAuditPath(): string {
  const path = join(getCloseRepoPath(), ".gitclose", "audit.jsonl");
  const dir = dirname(path);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return path;
}

export function appendAuditLog(entry: Omit<AuditEntry, "timestamp">): void {
  const fullEntry: AuditEntry = {
    timestamp: new Date().toISOString(),
    ...entry,
  };

  const path = getAuditPath();
  appendFileSync(path, JSON.stringify(fullEntry) + "\n", "utf-8");
}

export function readAuditLog(): AuditEntry[] {
  const path = getAuditPath();
  if (!existsSync(path)) return [];

  const content = readFileSync(path, "utf-8").trim();
  if (!content) return [];

  return content.split("\n").map((line) => JSON.parse(line) as AuditEntry);
}

export function getAuditSummary(): {
  total_entries: number;
  by_agent: Record<string, number>;
  by_action: Record<string, number>;
  first_entry?: string;
  last_entry?: string;
} {
  const entries = readAuditLog();

  const byAgent: Record<string, number> = {};
  const byAction: Record<string, number> = {};

  for (const entry of entries) {
    byAgent[entry.agent] = (byAgent[entry.agent] ?? 0) + 1;
    byAction[entry.action] = (byAction[entry.action] ?? 0) + 1;
  }

  return {
    total_entries: entries.length,
    by_agent: byAgent,
    by_action: byAction,
    first_entry: entries[0]?.timestamp,
    last_entry: entries[entries.length - 1]?.timestamp,
  };
}
