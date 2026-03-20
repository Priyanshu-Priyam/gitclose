import simpleGit, { SimpleGit } from "simple-git";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { join } from "path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

const DEFAULT_CLOSE_DIR = "close-repo";

export interface CloseConfig {
  entity_id: string;
  period: string;
  status: string;
  opened_at: string;
  opened_by: string;
  tasks: CloseTask[];
}

export interface CloseTask {
  id: string;
  name: string;
  agent: string;
  branch: string;
  status: string;
  pr_number?: number;
}

let closeRepoPath: string | null = null;

export function getCloseRepoPath(): string {
  if (!closeRepoPath) {
    closeRepoPath = join(process.cwd(), DEFAULT_CLOSE_DIR);
  }
  return closeRepoPath;
}

export function setCloseRepoPath(path: string): void {
  closeRepoPath = path;
}

function getGit(repoPath?: string): SimpleGit {
  const path = repoPath ?? getCloseRepoPath();
  return simpleGit(path);
}

export async function initCloseRepo(
  entityId: string,
  period: string,
  repoPath?: string
): Promise<string> {
  const path = repoPath ?? getCloseRepoPath();

  if (existsSync(path)) {
    const { rmSync } = await import("fs");
    rmSync(path, { recursive: true, force: true });
  }

  mkdirSync(path, { recursive: true });
  mkdirSync(join(path, ".gitclose", "prs"), { recursive: true });
  mkdirSync(join(path, "output"), { recursive: true });
  mkdirSync(join(path, "exceptions"), { recursive: true });
  mkdirSync(join(path, "proposed-jes"), { recursive: true });

  const closeConfig: CloseConfig = {
    entity_id: entityId,
    period,
    status: "IN_PROGRESS",
    opened_at: new Date().toISOString(),
    opened_by: "gitclose-cli",
    tasks: [
      {
        id: "cash-recon-westpac-operating",
        name: "Cash Reconciliation — Westpac Operating",
        agent: "atlas",
        branch: "feature/cash-recon-westpac-operating",
        status: "PENDING",
      },
      {
        id: "ap-recon",
        name: "AP Sub-Ledger Reconciliation",
        agent: "nova",
        branch: "feature/ap-recon",
        status: "PENDING",
      },
      {
        id: "variance-commentary",
        name: "P&L Variance Commentary",
        agent: "echo",
        branch: "feature/variance-commentary",
        status: "PENDING",
      },
    ],
  };

  writeFileSync(join(path, "close.yaml"), stringifyYaml(closeConfig), "utf-8");

  const checklist = `# Close Checklist — ${entityId} — ${period}\n\n` +
    `- [ ] Cash reconciliation (Atlas)\n` +
    `- [ ] AP sub-ledger reconciliation (Nova)\n` +
    `- [ ] P&L variance commentary (Echo)\n` +
    `- [ ] All PRs reviewed and merged\n` +
    `- [ ] Close tagged\n`;
  writeFileSync(join(path, "CHECKLIST.md"), checklist, "utf-8");

  const gitignore = `.DS_Store\n*.db\n*.db-wal\n*.db-shm\nnode_modules/\n.env\n`;
  writeFileSync(join(path, ".gitignore"), gitignore, "utf-8");

  const statusJson = {
    entity_id: entityId,
    period,
    status: "IN_PROGRESS",
    tasks: closeConfig.tasks,
    prs: [],
    exceptions: [],
    updated_at: new Date().toISOString(),
  };
  writeFileSync(
    join(path, ".gitclose", "status.json"),
    JSON.stringify(statusJson, null, 2),
    "utf-8"
  );

  writeFileSync(join(path, ".gitclose", "audit.jsonl"), "", "utf-8");

  const git = getGit(path);
  await git.init();
  await git.addConfig("user.email", "gitclose@meridian.com.au");
  await git.addConfig("user.name", "GitClose Platform");
  await git.add(".");
  await git.commit("chore: initialize close cycle for " + period);

  setCloseRepoPath(path);
  return path;
}

export async function createTaskBranch(taskName: string): Promise<string> {
  const git = getGit();
  const branchName = `feature/${taskName}`;
  await git.checkoutLocalBranch(branchName);
  return branchName;
}

export async function commitAgentAction(
  message: string,
  files: Map<string, string>,
  agentName?: string
): Promise<string> {
  const repoPath = getCloseRepoPath();
  const git = getGit();

  for (const [filePath, content] of files) {
    const fullPath = join(repoPath, filePath);
    const dir = join(fullPath, "..");
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(fullPath, content, "utf-8");
  }

  await git.add(".");

  const author = agentName
    ? `${agentName} <${agentName}@gitclose.agent>`
    : "GitClose <gitclose@meridian.com.au>";

  await git.commit(message, undefined, { "--author": author });

  const log = await git.log({ maxCount: 1 });
  return log.latest?.hash ?? "";
}

export async function switchToMain(): Promise<void> {
  const git = getGit();
  const branches = await git.branchLocal();
  const mainBranch = branches.all.includes("main") ? "main" : "master";
  await git.checkout(mainBranch);
}

export async function mergeBranch(
  branch: string,
  reviewer: string
): Promise<string> {
  const git = getGit();
  await switchToMain();

  await git.merge([branch, "--no-ff", "-m", `Merge ${branch} — approved by ${reviewer}`]);

  const log = await git.log({ maxCount: 1 });
  return log.latest?.hash ?? "";
}

export async function tagClose(period: string): Promise<void> {
  const git = getGit();
  await git.addTag(`v${period}-close`);
}

export async function getCommitLog(maxCount?: number): Promise<Array<{
  hash: string;
  date: string;
  message: string;
  author: string;
}>> {
  const git = getGit();
  const log = await git.log({ maxCount: maxCount ?? 50 });
  return log.all.map((entry) => ({
    hash: entry.hash,
    date: entry.date,
    message: entry.message,
    author: entry.author_name,
  }));
}

export async function getBranches(): Promise<string[]> {
  const git = getGit();
  const branches = await git.branchLocal();
  return branches.all;
}

export function updateCloseConfig(updates: Partial<CloseConfig>): void {
  const configPath = join(getCloseRepoPath(), "close.yaml");
  const existing = parseYaml(readFileSync(configPath, "utf-8")) as CloseConfig;
  const updated = { ...existing, ...updates };
  if (updates.tasks) {
    updated.tasks = updates.tasks;
  }
  writeFileSync(configPath, stringifyYaml(updated), "utf-8");
}

export function updateStatusJson(updates: Record<string, unknown>): void {
  const statusPath = join(getCloseRepoPath(), ".gitclose", "status.json");
  const existing = JSON.parse(readFileSync(statusPath, "utf-8"));
  const updated = { ...existing, ...updates, updated_at: new Date().toISOString() };
  writeFileSync(statusPath, JSON.stringify(updated, null, 2), "utf-8");
}
