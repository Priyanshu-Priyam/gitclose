# Architecture

## System Overview

GitClose is a multi-layer system. From bottom to top:

```
┌─────────────────────────────────────────────────────────┐
│  Next.js Web UI  (Dashboard · PR Review · Audit View)   │
├─────────────────────────────────────────────────────────┤
│  gitclose CLI  (open · run · review · finalize)         │
├─────────────────────────────────────────────────────────┤
│  Agent Orchestration  (agent-loop.ts)                   │
│    ├── Atlas (cash recon)                               │
│    ├── Nova  (AP sub-ledger)                            │
│    └── Echo  (variance commentary)                      │
├─────────────────────────────────────────────────────────┤
│  Git Layer  (repo.ts · pr.ts · audit.ts)                │
├─────────────────────────────────────────────────────────┤
│  Data Layer  (SQLite · meridian.db)                     │
└─────────────────────────────────────────────────────────┘
```

---

## The Git Layer Is the Control Framework

This is the central architectural decision. Every other design choice follows from it.

The close cycle is modeled as a git release cycle:

```
main branch (production books)
  │
  └── close/2025-01               ← git checkout -b close/2025-01
        │
        ├── atlas/cash-recon       ← agent works on its own branch
        │     ├── commit: "Fetched 23 bank transactions"
        │     ├── commit: "Matched 22 transactions — 1 exception"
        │     └── commit: "EXCEPTION: Telstra $14,924.44 — resolved via memory"
        │     └── PR #1 → close/2025-01
        │
        ├── nova/ap-recon
        │     ├── commit: "AP sub-ledger queried — 47 open invoices"
        │     └── commit: "EXCEPTION: ARUP-7795 $5,200 cutoff error flagged"
        │     └── PR #2 → close/2025-01
        │
        └── echo/variance
              ├── commit: "Variance analysis: 11 lines computed"
              └── commit: "Commentary generated — all sourced"
              └── PR #3 → close/2025-01

After all PRs approved:
  close/2025-01 → merge → main
  git tag v2025-01-close
```

**Why this is compliance by construction:**

- An agent cannot act without its branch existing (separation of duties)
- Every action is a commit — immutable, timestamped, attributable
- Every result requires a PR — that's the maker-checker gate
- The reviewer approves against the diff — they see exactly what changed and why
- The tag on main is the signed-off close — the moment the books are locked
- `audit.jsonl` captures every tool call and its arguments — complete evidence of what every agent did

No memo. No email chain. No "filing evidence after the fact." The git log *is* the audit.

---

## Agent Architecture

Each agent follows the [GitAgent Standard](https://lyzr.ai/gitclaw):

```
agents/atlas-cash-recon/
├── agent.yaml         # Name, model, tools, memory_path, max_iterations
├── SOUL.md            # Identity, principles, communication style
├── RULES.md           # Hard guardrails (never fabricate, always cite sources)
├── DUTIES.md          # RACI — what Atlas is responsible for
├── memory/
│   └── MEMORY.md      # Persistent memory — patterns, exceptions, past resolutions
├── hooks/
│   ├── preToolUse.js  # Runs before every tool call (materiality check, escalation)
│   └── onException.js # Handles tool failures
├── skills/
│   └── bank_reconciliation.md  # Domain knowledge injected into system prompt
└── tools/
    ├── fetch_bank_statement.yaml
    ├── match_transactions.yaml
    ├── generate_workpaper.yaml
    ├── create_exception.yaml
    ├── propose_journal_entry.yaml
    ├── query_gl.yaml
    └── search_memory.yaml
```

**How the system prompt is assembled (agent-loader.ts):**

```
[SOUL.md content]
[RULES.md content]
[DUTIES.md content]
[MEMORY.md content — last N lines if long]
[skills/*.md content]
[Tool schemas — each tool as a JSON tool definition]
```

The agent enters the loop knowing who it is, what it's allowed to do, what it remembers, and what tools it has. It doesn't need to be told any of this at runtime.

---

## The Agent Loop

The core loop is a standard think/act/observe cycle with financial-close-specific hardening:

```
while iterations < max_iterations:

    1. THINK: Send messages + tools to Claude
       → LLM returns either a text response or a tool_use block

    2. ACT: If tool_use:
       a. Run preToolUse hook (materiality check, policy enforcement)
       b. If hook aborts → create_exception, notify
       c. Execute the tool implementation (TypeScript function)
       d. Record to audit.jsonl (tool name, args, result, timestamp)
       e. git commit (message = tool name + summary of result)
       f. If tool raises → run onException hook → retry or escalate

    3. OBSERVE: Add tool_result to messages, continue loop

    4. DONE: If LLM returns text with no tool_use → agent is finished
       a. Write final workpaper to git
       b. Create PR with metadata (findings, exceptions, proposed JEs)
       c. Update MEMORY.md with new patterns
```

**Hardening layers:**

| Risk | Mitigation |
|---|---|
| Runaway loop | `max_iterations` hard cap (default 15); stops with partial output |
| Context window overflow | Token estimation after each round; oldest tool results truncated first |
| LLM returns malformed tool call | Validation on tool name and required args before execution |
| Tool throws | Caught, logged to audit, added to context as error result, agent decides next action |
| Anthropic API failure | Exponential backoff (3 retries); after 3 failures, circuit breaker trips |
| Demo instability | `--replay` mode: all LLM responses cached on first run, replayed deterministically |

---

## The Three Agents

### Atlas — Cash Reconciliation

**What it does:** Compares the bank statement (23 transactions, $482,750.44 net) against the GL cash account (2025-001). Matches by reference number and amount within ±$0.01. Flags unmatched items as exceptions. Retrieves prior resolutions from memory.

**Tools:**
- `fetch_bank_statement` — returns all transactions for the period
- `match_transactions` — fuzzy match bank txn to GL entry (reference, amount, date window, counterparty)
- `query_gl` — filter GL by account, date range
- `create_exception` — writes exception record, commits to git
- `propose_journal_entry` — constructs a draft JE for review
- `generate_workpaper` — assembles the final reconciliation workpaper
- `search_memory` — searches MEMORY.md for patterns matching an exception

**Key finding in demo:** BT-022 (Telstra $14,924.44) has no GL counterpart. Memory search finds: *"Pattern: Telstra credits in Oct–Jan are typically telecom refunds. Prior occurrence October 2024 — resolved as overpayment refund, PR #641 approved by sarah.martinez. Booking: DR 2025-001, CR 6010-001 (Telecom Expense)."*

### Nova — AP Sub-ledger Reconciliation

**What it does:** Traces every open AP invoice to a GL posting by invoice reference. Computes the AP sub-ledger total and compares it to the AP control account (2000-001). Flags the difference if material.

**Tools:**
- `query_ap_subledger` — returns all open invoices
- `trace_invoice` — for a single invoice, finds the matching GL entry by reference
- `compare_balances` — AP sub-ledger total vs. GL AP account balance
- `create_exception` — flags cutoff errors, duplicate postings
- `generate_ap_workpaper` — final AP reconciliation output

**Key finding in demo:** Invoice ARUP-7795 ($5,200, dated Feb 1, 2025) was posted into January. The GL reflects it; the AP sub-ledger doesn't. Nova flags this as a cutoff error, proposes a reversing journal entry.

### Echo — Variance Commentary

**What it does:** Computes actual vs. budget for every P&L line. Calculates variance in dollar amount and percentage. Generates management commentary — each line explained by data or memory, never speculative.

**Tools:**
- `compute_variances` — returns all P&L lines with budget, actual, variance, variance %
- `search_memory` — finds explanations for recurring patterns
- `generate_commentary` — generates management commentary for material variances
- `query_gl` — drill into specific GL accounts for detail
- `generate_variance_workpaper` — final variance report

**GL sign convention note:** Revenue accounts carry negative balances in the GL (credit = negative). `compute_variances` converts all values to management-report convention (revenue positive, expense positive) before computing variances. This is tested explicitly.

---

## Data Layer

Single SQLite file: `meridian.db`. Seeded via `npm run seed`.

**Key tables:**

| Table | Rows | Description |
|---|---|---|
| `gl_transactions` | 47 | All January 2025 GL postings |
| `bank_statements` | 23 | Westpac Operating Account transactions |
| `ap_invoices` | 47 | Open AP invoices (Jan 2025 + prior period carryforward) |
| `budget_lines` | 11 | January 2025 budget |
| `prior_period_actuals` | 11 | December 2024 actuals (for commentary) |
| `chart_of_accounts` | 24 | Full COA |

**Math is verified.** `npm run verify` runs 10 checks:
- GL debit/credit balance (should net to zero)
- Bank transactions sum to expected net position
- AP sub-ledger total matches AP control account (± $5,200 cutoff)
- Budget totals are internally consistent
- No orphaned transactions (all account IDs exist in COA)

---

## API Reference: CLI Commands

```bash
gitclose open   --entity <id> --period <YYYY-MM>
# Creates the close cycle: initializes close-repo/, opens close/YYYY-MM branch

gitclose run    --agent <atlas|nova|echo>
# Runs a single agent. Creates agent branch, runs loop, opens PR when done.

gitclose run-all
# Runs Atlas → Nova → Echo in sequence.
# Add --replay to use cached LLM responses (demo mode).

gitclose status
# Shows all PRs: open/approved, exceptions, material findings summary

gitclose review --pr <n> --action <approve|reject> --reviewer <name>
# Records approval/rejection on a PR

gitclose finalize
# Merges all approved PRs into close branch, merges close branch to main,
# creates git tag v{period}-close, generates close summary

gitclose demo:reset
# Deletes close-repo/, recreates meridian.db, runs verification, ready to demo
```

---

## UI Views

Three pages, all server-side rendered from git and SQLite data:

**Dashboard (`/`)** — active close cycle, PR list, exception summary, open action items

**PR Review (`/pr/[id]`)** — full workpaper content, exception detail with memory context, proposed journal entries, approve/reject action

**Audit View (`/audit`)** — complete `audit.jsonl` rendered as a chronological event log, read-only, each entry shows: timestamp, agent, tool, arguments, result

---

## Extension Points

This MVP uses SQLite and a single entity. Extending to production:

| Component | MVP | Production |
|---|---|---|
| Data source | SQLite seed data | ERP connector (NetSuite, Xero, SAP) |
| Bank feed | SQL queries | Bank feed API (Yodlee, Plaid, direct) |
| Entity scope | Single entity | Multi-entity (per-entity agent branches) |
| Approval workflow | CLI + JSON files | GitHub/GitLab PR integration |
| Memory | Per-agent MEMORY.md | Shared memory store with entity-scoped namespaces |
| Deployment | Local | Agent runs on customer compute (data sovereignty) |

The git layer, agent standard, and control framework don't change. Only the connectors do.
