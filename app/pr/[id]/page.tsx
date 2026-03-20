import { existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";

interface PullRequest {
  id: number;
  title: string;
  branch: string;
  agent: string;
  task_id: string;
  status: "OPEN" | "APPROVED" | "REJECTED" | "MERGED";
  summary: string;
  files_changed: string[];
  exceptions: string[];
  proposed_jes: string[];
  created_at: string;
  reviewer?: string;
  reviewed_at?: string;
  merged_at?: string;
  merge_commit?: string;
}

interface LoadedFile {
  relPath: string;
  data: Record<string, unknown> | null;
  rawText?: string;
  missing?: boolean;
}

const REPO = () => join(process.cwd(), "close-repo");

function readPR(id: string): PullRequest | null {
  const path = join(REPO(), ".gitclose", "prs", `${id}.json`);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf-8")) as PullRequest;
}

function tryParseJsonFile(fullPath: string): { data: Record<string, unknown> | null; rawText?: string } {
  if (!existsSync(fullPath)) return { data: null };
  const raw = readFileSync(fullPath, "utf-8");
  try {
    return { data: JSON.parse(raw) as Record<string, unknown> };
  } catch {
    return { data: null, rawText: raw };
  }
}

function loadMergedDirFiles(
  repo: string,
  prRefs: string[],
  subdir: string,
  extension: ".md" | ".json" = ".md"
): LoadedFile[] {
  const seen = new Set<string>();
  const out: LoadedFile[] = [];

  const push = (relPath: string) => {
    const full = join(repo, relPath);
    if (seen.has(full)) return;
    seen.add(full);
    if (!existsSync(full)) {
      out.push({ relPath, data: null, missing: true });
      return;
    }
    const { data, rawText } = tryParseJsonFile(full);
    out.push({ relPath, data, rawText });
  };

  for (const ref of prRefs) {
    const rel = ref.includes("/") ? ref : join(subdir, `${ref}${extension}`);
    push(rel);
  }

  const dir = join(repo, subdir);
  if (existsSync(dir)) {
    for (const name of readdirSync(dir).sort()) {
      if (!name.endsWith(".md") && !name.endsWith(".json")) continue;
      push(join(subdir, name));
    }
  }

  return out;
}

function readOutputFile(repo: string, rel: string): LoadedFile {
  const full = join(repo, rel);
  if (!existsSync(full)) return { relPath: rel, data: null, missing: true };
  const { data, rawText } = tryParseJsonFile(full);
  if (data) return { relPath: rel, data };
  const text = rawText ?? readFileSync(full, "utf-8");
  return { relPath: rel, data: null, rawText: text };
}

function statusBadgeClass(status: PullRequest["status"]): string {
  const base =
    "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase";
  switch (status) {
    case "OPEN":
      return `${base} border-blue-500/40 bg-blue-500/15 text-blue-300`;
    case "APPROVED":
      return `${base} border-emerald-500/40 bg-emerald-500/15 text-emerald-300`;
    case "REJECTED":
      return `${base} border-red-500/40 bg-red-500/15 text-red-300`;
    case "MERGED":
      return `${base} border-violet-500/40 bg-violet-500/15 text-violet-300`;
    default:
      return `${base} border-gray-600 bg-gray-800 text-gray-300`;
  }
}

function formatMoney(n: number): string {
  const abs = Math.abs(n);
  return `$${abs.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">{title}</h2>
      {children}
    </section>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const pr = readPR(id);
  if (!pr) return { title: "PR not found — GitClose" };
  return { title: `PR #${pr.id}: ${pr.title} — GitClose` };
}

export default async function PRReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pr = readPR(id);
  if (!pr) notFound();

  const repo = REPO();
  const exceptions = loadMergedDirFiles(repo, pr.exceptions, "exceptions");
  const proposedJes = loadMergedDirFiles(repo, pr.proposed_jes, "proposed-jes");
  const outputFiles = pr.files_changed.map((rel) => readOutputFile(repo, rel));

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/"
          className="text-sm text-gray-400 transition hover:text-white"
        >
          ← Back to dashboard
        </Link>
      </div>

      <header className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <span className="text-gray-500">#{pr.id}</span>
              <span className={statusBadgeClass(pr.status)}>{pr.status}</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">{pr.title}</h1>
          </div>
        </div>
        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-gray-500">Branch</dt>
            <dd className="mt-0.5 font-mono text-gray-200">{pr.branch}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Agent</dt>
            <dd className="mt-0.5 text-gray-200">{pr.agent}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Task</dt>
            <dd className="mt-0.5 font-mono text-sm text-gray-200">{pr.task_id}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Opened</dt>
            <dd className="mt-0.5 text-gray-200">{new Date(pr.created_at).toLocaleString("en-AU")}</dd>
          </div>
          {pr.reviewer && (
            <div>
              <dt className="text-gray-500">Reviewer</dt>
              <dd className="mt-0.5 text-gray-200">{pr.reviewer}</dd>
            </div>
          )}
          {pr.merged_at && (
            <div>
              <dt className="text-gray-500">Merged</dt>
              <dd className="mt-0.5 text-gray-200">{new Date(pr.merged_at).toLocaleString("en-AU")}</dd>
            </div>
          )}
        </dl>
      </header>

      <Card title="Summary">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">{pr.summary}</p>
      </Card>

      <Card title="Files changed">
        {pr.files_changed.length === 0 ? (
          <p className="text-sm text-gray-500">No files listed on this PR.</p>
        ) : (
          <ul className="space-y-2 font-mono text-sm text-gray-300">
            {pr.files_changed.map((f) => (
              <li
                key={f}
                className="rounded-lg border border-gray-800 bg-gray-950/60 px-3 py-2"
              >
                {f}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Workpapers & outputs">
        {outputFiles.length === 0 ? (
          <p className="text-sm text-gray-500">No output paths on this PR.</p>
        ) : (
          <ul className="space-y-4">
            {outputFiles.map((file) => (
              <li
                key={file.relPath}
                className="overflow-hidden rounded-lg border border-gray-800 bg-gray-950/40"
              >
                <div className="border-b border-gray-800 bg-gray-950/80 px-3 py-2 font-mono text-xs text-gray-400">
                  {file.relPath}
                  {file.missing && (
                    <span className="ml-2 text-amber-400">(file not found on disk)</span>
                  )}
                </div>
                {!file.missing && (
                  <pre className="max-h-72 overflow-auto p-3 text-xs leading-relaxed text-gray-400">
                    {file.data
                      ? JSON.stringify(file.data, null, 2)
                      : (file.rawText ?? "").slice(0, 12000)}
                    {file.rawText && file.rawText.length > 12000 ? "\n… truncated …" : ""}
                  </pre>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Exceptions">
        {exceptions.length === 0 ? (
          <p className="text-sm text-gray-500">No exception files in exceptions/.</p>
        ) : (
          <ul className="space-y-4">
            {exceptions.map((ex) => {
              const d = ex.data;
              const mem = d?.memory_detail as Record<string, unknown> | undefined;
              const hasMem = Boolean(d?.memory_match) || Boolean(mem);

              return (
                <li
                  key={ex.relPath}
                  className="rounded-lg border border-gray-800 bg-gray-950/50 p-4"
                >
                  <div className="mb-2 font-mono text-xs text-gray-500">{ex.relPath}</div>
                  {ex.missing ? (
                    <p className="text-sm text-amber-400">Missing on disk</p>
                  ) : !d ? (
                    <pre className="max-h-48 overflow-auto text-xs text-gray-400">{ex.rawText}</pre>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="text-lg font-semibold text-white">
                          {String(d.exception_id ?? "Exception")}
                        </span>
                        <span className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-300">
                          {String(d.exception_type ?? "—")}
                        </span>
                        <span className="text-emerald-400/90">{formatMoney(Number(d.amount) || 0)}</span>
                      </div>
                      <p className="mt-2 text-sm text-gray-400">
                        <span className="text-gray-500">Counterparty: </span>
                        {d.counterparty != null && d.counterparty !== ""
                          ? String(d.counterparty)
                          : "—"}
                      </p>
                      {d.description != null && String(d.description).trim() !== "" && (
                        <p className="mt-2 text-sm leading-relaxed text-gray-300">{String(d.description)}</p>
                      )}
                      {hasMem && (
                        <div className="mt-4 rounded-lg border border-indigo-500/25 bg-indigo-500/5 p-3">
                          <div className="text-xs font-semibold uppercase tracking-wide text-indigo-300/90">
                            Memory match
                          </div>
                          {mem ? (
                            <dl className="mt-2 space-y-1 text-sm text-gray-300">
                              {mem.prior_instance != null && (
                                <div>
                                  <dt className="inline text-gray-500">Prior instance: </dt>
                                  <dd className="inline">{String(mem.prior_instance)}</dd>
                                </div>
                              )}
                              {mem.prior_resolution != null && (
                                <div>
                                  <dt className="inline text-gray-500">Prior resolution: </dt>
                                  <dd className="inline">{String(mem.prior_resolution)}</dd>
                                </div>
                              )}
                              {mem.prior_pr != null && (
                                <div>
                                  <dt className="inline text-gray-500">Approved in: </dt>
                                  <dd className="inline">PR #{String(mem.prior_pr)}</dd>
                                </div>
                              )}
                              {mem.confidence != null && (
                                <div>
                                  <dt className="inline text-gray-500">Confidence: </dt>
                                  <dd className="inline">{String(mem.confidence)}</dd>
                                </div>
                              )}
                              {mem.suggestion != null && (
                                <div className="mt-2 border-t border-indigo-500/20 pt-2 text-gray-200">
                                  <span className="text-gray-500">Suggestion: </span>
                                  {String(mem.suggestion)}
                                </div>
                              )}
                            </dl>
                          ) : (
                            <p className="mt-1 text-sm text-gray-400">Similar pattern recorded in agent memory.</p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card title="Proposed journal entries">
        {proposedJes.length === 0 ? (
          <p className="text-sm text-gray-500">No proposed JE files in proposed-jes/.</p>
        ) : (
          <ul className="space-y-6">
            {proposedJes.map((jeFile) => {
              const d = jeFile.data;
              const lines = (d?.lines as Array<Record<string, unknown>> | undefined) ?? [];

              return (
                <li
                  key={jeFile.relPath}
                  className="overflow-hidden rounded-lg border border-gray-800 bg-gray-950/50"
                >
                  <div className="border-b border-gray-800 px-4 py-3">
                    <div className="font-mono text-xs text-gray-500">{jeFile.relPath}</div>
                    {jeFile.missing ? (
                      <p className="mt-2 text-sm text-amber-400">Missing on disk</p>
                    ) : !d ? (
                      <pre className="mt-2 max-h-48 overflow-auto text-xs text-gray-400">{jeFile.rawText}</pre>
                    ) : (
                      <>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="text-lg font-semibold text-white">{String(d.je_id ?? "JE")}</span>
                          {d.is_balanced === false ? (
                            <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs text-red-300">
                              Does not balance
                            </span>
                          ) : (
                            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">
                              Balanced
                            </span>
                          )}
                        </div>
                        {d.justification != null && String(d.justification).trim() !== "" && (
                          <p className="mt-2 text-sm text-gray-400">{String(d.justification)}</p>
                        )}
                      </>
                    )}
                  </div>
                  {d && lines.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[32rem] text-left text-sm">
                        <thead>
                          <tr className="border-b border-gray-800 text-xs uppercase tracking-wide text-gray-500">
                            <th className="px-4 py-2 font-medium">Account</th>
                            <th className="px-4 py-2 font-medium">Debit</th>
                            <th className="px-4 py-2 font-medium">Credit</th>
                            <th className="px-4 py-2 font-medium">Description</th>
                          </tr>
                        </thead>
                        <tbody className="text-gray-200">
                          {lines.map((line, i) => {
                            const amt = Number(line.amount) || 0;
                            const debit = amt > 0 ? formatMoney(amt) : "—";
                            const credit = amt < 0 ? formatMoney(amt) : "—";
                            const acct =
                              line.account_name != null && String(line.account_name)
                                ? `${line.account_id} — ${line.account_name}`
                                : String(line.account_id ?? "—");
                            return (
                              <tr
                                key={i}
                                className="border-b border-gray-800/80 last:border-0"
                              >
                                <td className="px-4 py-2 font-mono text-xs">{acct}</td>
                                <td className="px-4 py-2 font-mono text-emerald-300/90">{debit}</td>
                                <td className="px-4 py-2 font-mono text-sky-300/90">{credit}</td>
                                <td className="px-4 py-2 text-gray-400">{String(line.description ?? "")}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-gray-700 bg-gray-900/80 text-xs text-gray-400">
                            <td className="px-4 py-2 font-medium text-gray-300">Totals</td>
                            <td className="px-4 py-2 font-mono text-emerald-300/90">
                              {formatMoney(Number(d.total_debits) || 0)}
                            </td>
                            <td className="px-4 py-2 font-mono text-sky-300/90">
                              {formatMoney(Number(d.total_credits) || 0)}
                            </td>
                            <td className="px-4 py-2" />
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                  {d?.memory_reference != null && String(d.memory_reference).trim() !== "" && (
                    <div className="border-t border-gray-800 px-4 py-3 text-sm text-gray-400">
                      <span className="text-gray-500">Memory reference: </span>
                      {String(d.memory_reference)}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card title="Review actions">
        <p className="mb-4 text-sm text-gray-500">
          UI actions are not wired yet. Use the CLI from the repo root:
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
            title={`gitclose review --pr ${pr.id} --action approve --reviewer "Your Name"`}
          >
            Approve
          </button>
          <button
            type="button"
            className="rounded-lg border border-red-500/50 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-200 hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-400/40"
            title={`gitclose review --pr ${pr.id} --action reject --reviewer "Your Name"`}
          >
            Reject
          </button>
        </div>
        <pre className="mt-4 overflow-x-auto rounded-lg border border-gray-800 bg-gray-950 p-3 font-mono text-xs text-gray-400">
          {`gitclose review --pr ${pr.id} --action approve --reviewer "Jane Reviewer"`}
          {"\n"}
          {`gitclose review --pr ${pr.id} --action reject --reviewer "Jane Reviewer"`}
        </pre>
      </Card>
    </div>
  );
}
