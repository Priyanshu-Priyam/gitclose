import { existsSync, readFileSync, statSync } from "fs";
import { join } from "path";
import { parse as parseYaml } from "yaml";

interface AuditEntry {
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

interface CloseYamlShape {
  entity_id?: string;
  entity?: string;
  period?: string;
}

function getCloseRepoRoot(): string {
  return join(process.cwd(), "close-repo");
}

function readCloseConfig(repoRoot: string): { entity: string; period: string } {
  const yamlPath = join(repoRoot, "close.yaml");
  if (!existsSync(yamlPath)) {
    return { entity: "Unknown entity", period: "—" };
  }
  try {
    const raw = readFileSync(yamlPath, "utf-8");
    const doc = parseYaml(raw) as CloseYamlShape;
    const entity =
      (typeof doc.entity_id === "string" && doc.entity_id) ||
      (typeof doc.entity === "string" && doc.entity) ||
      "Unknown entity";
    const period =
      typeof doc.period === "string" && doc.period.length > 0 ? doc.period : "—";
    return { entity, period };
  } catch {
    return { entity: "Unknown entity", period: "—" };
  }
}

function readAuditEntries(auditPath: string): AuditEntry[] {
  if (!existsSync(auditPath)) return [];
  const content = readFileSync(auditPath, "utf-8").trim();
  if (!content) return [];
  const out: AuditEntry[] = [];
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      out.push(JSON.parse(trimmed) as AuditEntry);
    } catch {
      /* skip malformed lines */
    }
  }
  return out;
}

function actionIcon(action: string): string {
  const map: Record<string, string> = {
    OPEN_CLOSE: "⧉",
    AGENT_START: "▶",
    TOOL_CALL: "⚙",
    TOOL_RESULT: "↩",
    COMMIT: "●",
    AGENT_COMPLETE: "✓",
    AGENT_FAILED: "✕",
    PR_APPROVED: "✓",
    PR_REJECTED: "⊗",
  };
  return map[action] ?? "◆";
}

function agentBadgeClass(agent: string): string {
  const a = agent.toLowerCase();
  if (a === "atlas") {
    return "bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/40";
  }
  if (a === "nova") {
    return "bg-purple-500/15 text-purple-300 ring-1 ring-purple-500/40";
  }
  if (a === "echo") {
    return "bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/40";
  }
  if (a === "system") {
    return "bg-gray-600/40 text-gray-300 ring-1 ring-gray-500/50";
  }
  return "bg-slate-600/30 text-slate-300 ring-1 ring-slate-500/40";
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(d);
}

function formatDetails(entry: AuditEntry): string {
  const parts: string[] = [];
  if (entry.tool) parts.push(entry.tool);
  if (entry.result_summary) parts.push(entry.result_summary);
  if (parts.length === 0) return "—";
  return parts.join(" — ");
}

function shortHash(hash: string | undefined): string {
  if (!hash || hash.length < 7) return "—";
  return hash.slice(0, 7);
}

function summarizeBreakdown(
  counts: Record<string, number>,
  emptyLabel: string
): { label: string; count: number }[] {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return [{ label: emptyLabel, count: 0 }];
  return entries.map(([label, count]) => ({ label, count }));
}

export default async function AuditPage() {
  const repoRoot = getCloseRepoRoot();
  let repoOk = false;
  try {
    repoOk = existsSync(repoRoot) && statSync(repoRoot).isDirectory();
  } catch {
    repoOk = false;
  }

  if (!repoOk) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-12 text-center shadow-xl shadow-black/20">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-gray-700 bg-gray-950 text-2xl text-gray-500">
          ⧾
        </div>
        <h1 className="text-xl font-semibold text-white">Audit Trail</h1>
        <p className="mt-2 text-sm text-gray-400">No audit data available</p>
        <p className="mx-auto mt-4 max-w-md text-xs leading-relaxed text-gray-500">
          Initialize a close repository at <code className="text-gray-400">close-repo</code>{" "}
          (e.g. via <code className="text-gray-400">gitclose open</code>) to populate{" "}
          <code className="text-gray-400">.gitclose/audit.jsonl</code>.
        </p>
      </div>
    );
  }

  const { entity, period } = readCloseConfig(repoRoot);
  const auditPath = join(repoRoot, ".gitclose", "audit.jsonl");
  const entries = readAuditEntries(auditPath);

  const byAgent: Record<string, number> = {};
  const byAction: Record<string, number> = {};
  for (const e of entries) {
    byAgent[e.agent] = (byAgent[e.agent] ?? 0) + 1;
    byAction[e.action] = (byAction[e.action] ?? 0) + 1;
  }

  const agentRows = summarizeBreakdown(byAgent, "No agents yet");
  const actionRows = summarizeBreakdown(byAction, "No actions yet");

  return (
    <div className="space-y-8">
      <header className="border-b border-gray-800 pb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-emerald-500/90">
          Compliance
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
          Audit Trail — {entity} — {period}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-400">
          Read-only view of all agent actions and approvals
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 shadow-lg shadow-black/20">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Total entries
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-white">
            {entries.length.toLocaleString()}
          </p>
          <p className="mt-3 text-xs text-gray-500">All logged events in this close cycle</p>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 shadow-lg shadow-black/20">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            By agent
          </p>
          <ul className="mt-3 space-y-2">
            {agentRows.map(({ label, count }) => (
              <li
                key={label}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="truncate text-gray-300">{label}</span>
                <span className="shrink-0 tabular-nums text-gray-500">{count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 shadow-lg shadow-black/20">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            By action type
          </p>
          <ul className="mt-3 max-h-40 space-y-2 overflow-y-auto pr-1">
            {actionRows.map(({ label, count }) => (
              <li
                key={label}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="truncate font-mono text-xs text-gray-400">{label}</span>
                <span className="shrink-0 tabular-nums text-gray-500">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-xl border border-gray-800 bg-gray-900 shadow-xl shadow-black/25">
        <div className="flex flex-col gap-1 border-b border-gray-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Complete audit trail</h2>
            <p className="text-xs text-gray-500">
              Immutable log sourced from <code className="text-gray-400">.gitclose/audit.jsonl</code>
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-950/50 text-xs uppercase tracking-wide text-gray-500">
                <th className="px-5 py-3 font-medium">Timestamp</th>
                <th className="px-5 py-3 font-medium">Agent</th>
                <th className="px-5 py-3 font-medium">Action</th>
                <th className="px-5 py-3 font-medium">Details</th>
                <th className="px-5 py-3 font-medium">Commit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/80">
              {entries.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-sm text-gray-500"
                  >
                    No entries recorded yet for this close.
                  </td>
                </tr>
              ) : (
                entries.map((entry, i) => (
                  <tr
                    key={`${entry.timestamp}-${i}`}
                    className="hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-gray-400">
                      {formatTimestamp(entry.timestamp)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize ${agentBadgeClass(entry.agent)}`}
                      >
                        {entry.agent}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3">
                      <span className="inline-flex items-center gap-2 text-gray-200">
                        <span className="text-base leading-none text-gray-500" aria-hidden>
                          {actionIcon(entry.action)}
                        </span>
                        <span className="font-mono text-xs">{entry.action}</span>
                      </span>
                    </td>
                    <td className="max-w-md px-5 py-3 text-gray-300">
                      <span className="line-clamp-2 text-xs leading-relaxed">
                        {formatDetails(entry)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-emerald-400/90">
                      {shortHash(entry.commit_hash)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-800 px-5 py-4">
          <p className="text-xs leading-relaxed text-gray-500">
            In production, this view supports filtering by date range, agent, task type, and
            exception status.
          </p>
        </div>
      </section>
    </div>
  );
}
