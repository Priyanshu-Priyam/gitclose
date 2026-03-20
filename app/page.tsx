import Link from "next/link";
import { existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";
import { parse as parseYaml } from "yaml";

type CloseStatus = "IN_PROGRESS" | "CLOSED" | string;

interface CloseTaskRow {
  id: string;
  name: string;
  agent: string;
  status: string;
  pr_number?: number;
}

interface PullRequestRecord {
  id: number;
  title: string;
  branch: string;
  agent: string;
  task_id: string;
  status: "OPEN" | "APPROVED" | "REJECTED" | "MERGED";
  summary?: string;
  exceptions?: string[];
  created_at?: string;
}

interface AuditEntry {
  timestamp: string;
  agent: string;
  action: string;
  tool?: string;
  result_summary?: string;
  commit_hash?: string;
  pr_id?: number;
  reviewer?: string;
}

interface StatusJson {
  entity_id?: string;
  entity_name?: string;
  period?: string;
  status?: string;
  tasks?: CloseTaskRow[];
  exceptions?: unknown[];
  updated_at?: string;
}

function closeRepoRoot(): string {
  return join(process.cwd(), "close-repo");
}

function readCloseYaml(repo: string): Record<string, unknown> | null {
  try {
    const p = join(repo, "close.yaml");
    if (!existsSync(p)) return null;
    return parseYaml(readFileSync(p, "utf-8")) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function readStatusJson(repo: string): StatusJson | null {
  try {
    const p = join(repo, ".gitclose", "status.json");
    if (!existsSync(p)) return null;
    return JSON.parse(readFileSync(p, "utf-8")) as StatusJson;
  } catch {
    return null;
  }
}

function readPullRequests(repo: string): PullRequestRecord[] {
  try {
    const dir = join(repo, ".gitclose", "prs");
    if (!existsSync(dir)) return [];
    const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
    const prs: PullRequestRecord[] = [];
    for (const f of files) {
      try {
        prs.push(
          JSON.parse(readFileSync(join(dir, f), "utf-8")) as PullRequestRecord
        );
      } catch {
        /* skip corrupt file */
      }
    }
    return prs.sort((a, b) => a.id - b.id);
  } catch {
    return [];
  }
}

function readRecentAudit(repo: string, limit: number): AuditEntry[] {
  try {
    const p = join(repo, ".gitclose", "audit.jsonl");
    if (!existsSync(p)) return [];
    const content = readFileSync(p, "utf-8").trim();
    if (!content) return [];
    const lines = content.split("\n").filter((l) => l.trim().length > 0);
    const entries: AuditEntry[] = [];
    for (const line of lines) {
      try {
        entries.push(JSON.parse(line) as AuditEntry);
      } catch {
        /* skip bad line */
      }
    }
    return entries.slice(-limit).reverse();
  } catch {
    return [];
  }
}

function tasksFromSources(
  yaml: Record<string, unknown> | null,
  status: StatusJson | null
): CloseTaskRow[] {
  const fromYaml = yaml?.tasks;
  if (Array.isArray(fromYaml) && fromYaml.length > 0) {
    return fromYaml.map((t) => {
      const row = t as Record<string, unknown>;
      return {
        id: String(row.id ?? ""),
        name: String(row.name ?? row.id ?? "Task"),
        agent: String(row.agent ?? "—"),
        status: String(row.status ?? "UNKNOWN"),
        pr_number:
          typeof row.pr_number === "number" ? row.pr_number : undefined,
      };
    });
  }
  const st = status?.tasks;
  if (Array.isArray(st) && st.length > 0) {
    return st.map((t) => ({
      id: t.id,
      name: t.name ?? t.id,
      agent: t.agent,
      status: t.status,
      pr_number: t.pr_number,
    }));
  }
  return [];
}

function entityLabel(
  yaml: Record<string, unknown> | null,
  status: StatusJson | null
): string {
  const y = yaml ?? {};
  const name =
    (y.entity_name as string) ||
    (y.entity as string) ||
    (y.entity_id as string) ||
    status?.entity_name ||
    status?.entity_id;
  return name?.trim() || "Close cycle";
}

function periodLabel(
  yaml: Record<string, unknown> | null,
  status: StatusJson | null
): string {
  const y = yaml ?? {};
  const p = (y.period as string) || status?.period;
  return p?.trim() || "—";
}

function closeStatusBadge(
  yaml: Record<string, unknown> | null,
  status: StatusJson | null
): CloseStatus {
  return (status?.status ?? yaml?.status ?? "UNKNOWN") as CloseStatus;
}

function CloseStatusBadge({ status }: { status: CloseStatus }) {
  const normalized = String(status).toUpperCase();
  const isClosed = normalized === "CLOSED" || normalized === "AUDITABLE";
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border";
  if (isClosed) {
    return (
      <span
        className={`${base} bg-emerald-500/15 text-emerald-400 border-emerald-500/30`}
      >
        {status}
      </span>
    );
  }
  if (normalized === "IN_PROGRESS") {
    return (
      <span
        className={`${base} bg-amber-500/15 text-amber-300 border-amber-500/35`}
      >
        IN_PROGRESS
      </span>
    );
  }
  return (
    <span
      className={`${base} bg-gray-500/15 text-gray-300 border-gray-600/40`}
    >
      {status}
    </span>
  );
}

function PRStatusBadge({ status }: { status: PullRequestRecord["status"] }) {
  const base =
    "inline-flex rounded-full px-3 py-1 text-xs font-medium border";
  const map: Record<
    PullRequestRecord["status"],
    string
  > = {
    OPEN: "bg-sky-500/15 text-sky-300 border-sky-500/35",
    APPROVED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    MERGED: "bg-violet-500/15 text-violet-300 border-violet-500/35",
    REJECTED: "bg-red-500/15 text-red-400 border-red-500/35",
  };
  return (
    <span className={`${base} ${map[status]}`}>{status}</span>
  );
}

function TaskStatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  const base =
    "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium border";
  let cls = "bg-gray-500/15 text-gray-300 border-gray-600/40";
  if (s === "COMPLETED" || s === "APPROVED") {
    cls = "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  } else if (s === "IN_PROGRESS") {
    cls = "bg-amber-500/15 text-amber-300 border-amber-500/35";
  } else if (s === "REJECTED" || s === "FAILED") {
    cls = "bg-red-500/15 text-red-400 border-red-500/35";
  } else if (s === "REVIEW" || s === "PENDING") {
    cls = "bg-sky-500/15 text-sky-300 border-sky-500/35";
  }
  return <span className={`${base} ${cls}`}>{status}</span>;
}

function collectExceptionSummary(
  status: StatusJson | null,
  prs: PullRequestRecord[]
): { ids: string[]; fromStatus: string[]; prTotal: number } {
  const fromPrs: string[] = [];
  for (const pr of prs) {
    for (const ex of pr.exceptions ?? []) {
      const id = String(ex).trim();
      if (id) fromPrs.push(id);
    }
  }
  const fromStatus: string[] = [];
  for (const ex of status?.exceptions ?? []) {
    if (typeof ex === "string" && ex.trim()) fromStatus.push(ex.trim());
    else if (ex && typeof ex === "object" && "id" in ex) {
      fromStatus.push(String((ex as { id: unknown }).id));
    }
  }
  const unique = Array.from(new Set([...fromStatus, ...fromPrs]));
  return {
    ids: unique,
    fromStatus,
    prTotal: fromPrs.length,
  };
}

export default function CloseDashboardPage() {
  const repo = closeRepoRoot();

  if (!existsSync(repo)) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-12 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-800 text-2xl text-gray-500">
          ◇
        </div>
        <h1 className="text-xl font-semibold text-white">
          No active close cycle
        </h1>
        <p className="mt-2 max-w-md mx-auto text-sm text-gray-400 leading-relaxed">
          The close repository was not found at{" "}
          <code className="rounded bg-gray-950 px-1.5 py-0.5 text-gray-300">
            close-repo
          </code>
          . Run{" "}
          <code className="rounded bg-gray-950 px-1.5 py-0.5 text-gray-300">
            gitclose open
          </code>{" "}
          to initialize a period before using this dashboard.
        </p>
      </div>
    );
  }

  let yaml: Record<string, unknown> | null = null;
  let status: StatusJson | null = null;
  let prs: PullRequestRecord[] = [];
  let audit: AuditEntry[] = [];
  let loadError: string | null = null;

  try {
    yaml = readCloseYaml(repo);
    status = readStatusJson(repo);
    prs = readPullRequests(repo);
    audit = readRecentAudit(repo, 10);
  } catch (e) {
    loadError = e instanceof Error ? e.message : String(e);
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-8">
        <h1 className="text-lg font-semibold text-red-200">
          Could not load close data
        </h1>
        <p className="mt-2 text-sm text-red-300/90">{loadError}</p>
      </div>
    );
  }

  const tasks = tasksFromSources(yaml, status);
  const entity = entityLabel(yaml, status);
  const period = periodLabel(yaml, status);
  const closeStatus = closeStatusBadge(yaml, status);
  const exc = collectExceptionSummary(status, prs);

  const prByTaskId = new Map<string, PullRequestRecord>();
  for (const pr of prs) {
    if (!prByTaskId.has(pr.task_id)) prByTaskId.set(pr.task_id, pr);
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 p-8 md:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Monthly close
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              {entity}
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Period{" "}
              <span className="font-mono text-gray-200">{period}</span>
              {status?.updated_at ? (
                <>
                  {" "}
                  · Updated{" "}
                  <time
                    className="text-gray-300"
                    dateTime={status.updated_at}
                  >
                    {new Date(status.updated_at).toLocaleString()}
                  </time>
                </>
              ) : null}
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 md:items-end">
            <span className="text-xs text-gray-500">Close status</span>
            <CloseStatusBadge status={closeStatus} />
          </div>
        </div>
      </section>

      {/* Tasks */}
      <section className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
        <div className="border-b border-gray-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Tasks</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Reconciliation and commentary workstreams by agent
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/80 text-xs uppercase tracking-wide text-gray-500">
                <th className="px-6 py-3 font-medium">Task</th>
                <th className="px-6 py-3 font-medium">Agent</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Pull request</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {tasks.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No tasks defined in{" "}
                    <code className="text-gray-400">close.yaml</code> or{" "}
                    <code className="text-gray-400">status.json</code>
                  </td>
                </tr>
              ) : (
                tasks.map((task) => {
                  const pr =
                    (task.pr_number
                      ? prs.find((p) => p.id === task.pr_number)
                      : undefined) ?? prByTaskId.get(task.id);
                  return (
                    <tr
                      key={task.id}
                      className="transition-colors hover:bg-gray-800/40"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-100">
                          {task.name}
                        </div>
                        <div className="mt-0.5 font-mono text-xs text-gray-500">
                          {task.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300 capitalize">
                        {task.agent}
                      </td>
                      <td className="px-6 py-4">
                        <TaskStatusBadge status={task.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        {pr ? (
                          <Link
                            href={`/pr/${pr.id}`}
                            className="font-mono text-sm text-emerald-400 hover:text-emerald-300 underline-offset-2 hover:underline"
                          >
                            PR #{pr.id}
                          </Link>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* PRs */}
        <section className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
          <div className="border-b border-gray-800 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">
              Pull requests
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">
              Review queue and merge state
            </p>
          </div>
          <ul className="divide-y divide-gray-800">
            {prs.length === 0 ? (
              <li className="px-6 py-8 text-center text-sm text-gray-500">
                No pull requests in{" "}
                <code className="text-gray-400">.gitclose/prs</code>
              </li>
            ) : (
              prs.map((pr) => (
                <li
                  key={pr.id}
                  className="px-6 py-4 transition-colors hover:bg-gray-800/40"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/pr/${pr.id}`}
                        className="font-medium text-white hover:text-emerald-400 transition-colors"
                      >
                        #{pr.id} — {pr.title}
                      </Link>
                      <p className="mt-1 text-xs text-gray-500 capitalize">
                        {pr.agent} ·{" "}
                        <span className="font-mono text-gray-600">
                          {pr.branch}
                        </span>
                      </p>
                    </div>
                    <PRStatusBadge status={pr.status} />
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>

        {/* Exceptions */}
        <section className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
          <div className="border-b border-gray-800 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">
              Exception summary
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">
              References from status and open PRs
            </p>
          </div>
          <div className="p-6">
            {exc.ids.length === 0 ? (
              <p className="text-sm text-gray-500">
                No exception IDs recorded on PRs or in status.
              </p>
            ) : (
              <ul className="space-y-2">
                {exc.ids.map((id) => (
                  <li
                    key={id}
                    className="flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-950/50 px-3 py-2 text-sm text-gray-300"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                    <span className="font-mono text-xs">{id}</span>
                  </li>
                ))}
              </ul>
            )}
            {exc.prTotal > 0 && (
              <p className="mt-4 text-xs text-gray-600">
                {exc.prTotal} exception reference
                {exc.prTotal === 1 ? "" : "s"} across PR payloads
              </p>
            )}
          </div>
        </section>
      </div>

      {/* Audit */}
      <section className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
        <div className="border-b border-gray-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">
            Recent audit activity
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Last 10 entries from{" "}
            <code className="text-gray-400">.gitclose/audit.jsonl</code>
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/80 text-xs uppercase tracking-wide text-gray-500">
                <th className="px-6 py-3 font-medium">Time</th>
                <th className="px-6 py-3 font-medium">Agent</th>
                <th className="px-6 py-3 font-medium">Action</th>
                <th className="px-6 py-3 font-medium">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {audit.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No audit entries yet
                  </td>
                </tr>
              ) : (
                audit.map((entry, i) => (
                  <tr
                    key={`${entry.timestamp}-${i}`}
                    className="transition-colors hover:bg-gray-800/40"
                  >
                    <td className="whitespace-nowrap px-6 py-3 font-mono text-xs text-gray-400">
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-3 capitalize text-gray-300">
                      {entry.agent}
                    </td>
                    <td className="px-6 py-3">
                      <span className="rounded-md bg-gray-800 px-2 py-0.5 font-mono text-xs text-gray-200">
                        {entry.action}
                      </span>
                    </td>
                    <td className="max-w-md px-6 py-3 text-gray-400">
                      <div className="line-clamp-2 text-xs">
                        {entry.result_summary ??
                          (entry.tool
                            ? `tool: ${entry.tool}`
                            : "—")}
                      </div>
                      {entry.pr_id != null ? (
                        <Link
                          href={`/pr/${entry.pr_id}`}
                          className="mt-1 inline-block text-xs text-emerald-500/90 hover:text-emerald-400"
                        >
                          PR #{entry.pr_id}
                        </Link>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
