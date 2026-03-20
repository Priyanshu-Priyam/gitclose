import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from "fs";
import { join } from "path";
import { getCloseRepoPath } from "./repo.js";

export interface PullRequest {
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

function getPRDir(): string {
  const dir = join(getCloseRepoPath(), ".gitclose", "prs");
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function getNextPRId(): number {
  const dir = getPRDir();
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  if (files.length === 0) return 1;
  const ids = files.map((f) => parseInt(f.replace(".json", "")));
  return Math.max(...ids) + 1;
}

export function createPullRequest(
  branch: string,
  title: string,
  summary: string,
  agent: string,
  taskId: string,
  options?: {
    filesChanged?: string[];
    exceptions?: string[];
    proposedJEs?: string[];
  }
): PullRequest {
  const id = getNextPRId();

  const pr: PullRequest = {
    id,
    title,
    branch,
    agent,
    task_id: taskId,
    status: "OPEN",
    summary,
    files_changed: options?.filesChanged ?? [],
    exceptions: options?.exceptions ?? [],
    proposed_jes: options?.proposedJEs ?? [],
    created_at: new Date().toISOString(),
  };

  const filePath = join(getPRDir(), `${id}.json`);
  writeFileSync(filePath, JSON.stringify(pr, null, 2), "utf-8");

  return pr;
}

export function getPullRequest(id: number): PullRequest | null {
  const filePath = join(getPRDir(), `${id}.json`);
  if (!existsSync(filePath)) return null;
  return JSON.parse(readFileSync(filePath, "utf-8")) as PullRequest;
}

export function listPullRequests(): PullRequest[] {
  const dir = getPRDir();
  if (!existsSync(dir)) return [];
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  return files
    .map((f) => JSON.parse(readFileSync(join(dir, f), "utf-8")) as PullRequest)
    .sort((a, b) => a.id - b.id);
}

export function approvePR(id: number, reviewer: string): PullRequest {
  const pr = getPullRequest(id);
  if (!pr) throw new Error(`PR #${id} not found`);
  if (pr.status !== "OPEN") throw new Error(`PR #${id} is ${pr.status}, cannot approve`);

  pr.status = "APPROVED";
  pr.reviewer = reviewer;
  pr.reviewed_at = new Date().toISOString();

  const filePath = join(getPRDir(), `${id}.json`);
  writeFileSync(filePath, JSON.stringify(pr, null, 2), "utf-8");

  return pr;
}

export function rejectPR(id: number, reviewer: string): PullRequest {
  const pr = getPullRequest(id);
  if (!pr) throw new Error(`PR #${id} not found`);

  pr.status = "REJECTED";
  pr.reviewer = reviewer;
  pr.reviewed_at = new Date().toISOString();

  const filePath = join(getPRDir(), `${id}.json`);
  writeFileSync(filePath, JSON.stringify(pr, null, 2), "utf-8");

  return pr;
}

export function markPRMerged(id: number, mergeCommit: string): PullRequest {
  const pr = getPullRequest(id);
  if (!pr) throw new Error(`PR #${id} not found`);

  pr.status = "MERGED";
  pr.merged_at = new Date().toISOString();
  pr.merge_commit = mergeCommit;

  const filePath = join(getPRDir(), `${id}.json`);
  writeFileSync(filePath, JSON.stringify(pr, null, 2), "utf-8");

  return pr;
}
