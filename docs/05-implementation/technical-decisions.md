# Technical Decisions (Architecture Decision Records)

## ADR-001: SQLite for Source Data

**Decision:** Use SQLite (`better-sqlite3`) for all source financial data.

**Context:** We need a database that simulates ERP and bank data. Options
include PostgreSQL, MySQL, SQLite, or flat JSON files.

**Rationale:** SQLite is a single file (`meridian.db`), requires no server,
is portable across environments, and supports full SQL. For a demo with
<100 transactions, it's more than sufficient. `better-sqlite3` is synchronous
(simpler code) and the fastest SQLite binding for Node.js.

**Consequences:** Cannot demonstrate high-volume scenarios. Acceptable for MVP.

---

## ADR-002: Claude Sonnet for LLM

**Decision:** Use Claude claude-sonnet-4-20250514 via `@anthropic-ai/sdk`.

**Context:** The agents need strong reasoning for transaction matching,
exception classification, and narrative generation. Options: GPT-4o,
Claude Sonnet, Gemini Pro.

**Rationale:** Claude Sonnet offers the best balance of reasoning quality,
structured output, and cost. It handles long contexts well (important when
GL data is large). The structured tool-use format is clean. Temperature 0.1
for Atlas/Nova (precision); 0.3 for Echo (narrative).

**Consequences:** API dependency during demo. Mitigated by caching/replay mode.

---

## ADR-003: `simple-git` for Git Operations

**Decision:** Use `simple-git` npm package for all git operations.

**Context:** Need to programmatically init repos, create branches, commit
files, and (optionally) create PRs.

**Rationale:** `simple-git` wraps the native git CLI with a clean async API.
No native compilation required. Supports all operations we need. Alternative
(`isomorphic-git`) is pure JS but has gaps in branch management.

**Consequences:** Requires git installed on the host. Acceptable.

---

## ADR-004: Sequential Agent Execution for MVP

**Decision:** Run agents sequentially (Atlas → Nova → Echo) rather than
in parallel.

**Context:** The agents operate on separate branches and don't share files,
so parallelism is theoretically safe. However, concurrent SQLite reads, git
operations, and Claude API calls add complexity.

**Rationale:** Sequential execution is simpler, more reliable, and easier
to demo (you can watch each agent complete before the next starts). The
branches still exist in parallel — the *work products* look parallel even
if the execution was sequential.

**Consequences:** Demo takes ~5 minutes instead of ~2.5 minutes. Acceptable.

---

## ADR-005: PR Metadata as JSON (Not Gitea)

**Decision:** Store pull request metadata as JSON files in `.gitclose/prs/`
rather than using an external git hosting platform.

**Context:** Real PRs would use GitHub, GitLab, or Gitea. For a local demo,
external hosting adds infrastructure complexity.

**Rationale:** JSON-based PR metadata is self-contained and doesn't require
network connectivity or Docker. The web UI reads these JSON files and renders
a PR review interface. This is less polished than real Gitea but more reliable
for a demo scenario.

**Consequences:** The PR review experience is custom-built rather than
leveraging an existing platform. If time permits, Gitea via Docker is
a strictly better option.

---

## ADR-006: Next.js for Web UI

**Decision:** Use Next.js 14 with App Router and TailwindCSS.

**Context:** Need three web views (dashboard, PR review, auditor). Must
read from git repos and JSON files.

**Rationale:** Next.js provides file-based routing, server components (for
reading git data), and API routes. TailwindCSS enables fast UI development.
The combination is the fastest path to a polished demo UI.

**Consequences:** Standard choice. No surprises.
