# GitClose

**Git-native monthly close platform.** AI agents perform the mechanical work of a financial close — bank reconciliation, AP sub-ledger matching, P&L variance commentary — with every action recorded as a git commit, every approval as a merged pull request, and a complete audit trail generated automatically.

---

## The Core Idea

Financial controls and git workflows are structurally identical:

| Finance Control | Git Equivalent |
|---|---|
| Maker-checker approval | Pull request merge |
| Audit trail | `git log` |
| Segregation of duties | Branch protection |
| Control documentation | `RULES.md` |
| Point-in-time snapshot | `git tag v2025-01-close` |

An agent operating inside a git repo doesn't just *comply with* financial controls — it *is* the control framework, by construction. Compliance overhead drops to zero because it's a property of the architecture.

---

## What It Does

Three AI agents close the books for Meridian Engineering Pty Ltd (January 2025):

| Agent | Task | What It Does |
|---|---|---|
| **Atlas** | Cash reconciliation | Reconciles 23 bank transactions against the GL, finds the Telstra exception, retrieves the resolution from memory (PR #641, October 2024) |
| **Nova** | AP sub-ledger reconciliation | Traces every open AP invoice to a GL posting by reference, catches the $5,200 ARUP-7795 cutoff error in 27 seconds |
| **Echo** | Variance commentary | Computes budget vs. actuals for all P&L lines, generates sourced management commentary — every explanation attributed to data or memory |

All math is verified. The reconciliation balances to the cent. The git history is the complete audit trail.

---

## Quickstart

### Prerequisites

- Node.js 20+
- Git
- An Anthropic API key

```bash
# Install dependencies
npm install

# Copy env file and add your key
cp .env.example .env
# Edit .env: ANTHROPIC_API_KEY=sk-ant-...

# Seed the database
npm run seed

# Verify all math checks pass (10/10)
npm run verify
```

### Run the Full Close

```bash
# Open a close cycle
npx gitclose open --entity MER-AU-ENG --period 2025-01

# Run all three agents sequentially (Atlas → Nova → Echo)
npx gitclose run-all

# Check status
npx gitclose status

# Approve a PR
npx gitclose review --pr 1 --action approve --reviewer sarah.martinez

# Finalize — merge, tag, generate summary
npx gitclose finalize
```

### Run the Web UI

```bash
npm run ui:dev
# Open http://localhost:3000
```

Three views:
- `/` — Close Dashboard (task status, PRs, exceptions)
- `/pr/[id]` — PR review (workpaper, exceptions with memory match, proposed JEs)
- `/audit` — Complete audit trail (read-only)

### Demo Mode (API-free replay)

```bash
# First time: run live and record LLM responses
npm run demo:record

# Subsequent runs: replay cached responses deterministically
npx gitclose run-all --replay
```

### Reset to Pristine State

```bash
npm run demo:reset
# Deletes close-repo/, rebuilds meridian.db, runs all verifications
```

---

## Project Structure

```
finance_agent/
├── agents/
│   ├── atlas-cash-recon/       # agent.yaml, SOUL.md, RULES.md, DUTIES.md, memory/, hooks/, tools/
│   ├── nova-ap-recon/
│   └── echo-variance/
├── db/
│   ├── schema.sql              # Full DDL
│   ├── seed.sql                # Verified seed data (Meridian Engineering, Jan 2025)
│   └── verify.sql              # 10 mathematical verification queries
├── src/
│   ├── cli/                    # gitclose CLI (commander)
│   ├── runtime/                # Agent loop, LLM client, hooks, memory, cache
│   ├── tools/                  # TypeScript tool implementations (atlas/, nova/, echo/, shared/)
│   ├── git/                    # repo.ts, pr.ts, audit.ts
│   └── db/                     # connection.ts, queries.ts
├── app/                        # Next.js 15 UI
├── scripts/                    # seed-db.ts, verify.ts, demo-reset.ts, record-demo.ts
├── tests/                      # 16 unit tests, all passing
└── demo/
    ├── traditional-workflow/   # "James's world" — shared drive chaos for Act 1 of demo
    └── narration.md            # 25-minute demo script
```

---

## Running Tests

```bash
npm test
# 16 tests, 3 test files — all passing
```

Key tests:
- `fetch_bank_statement` returns 23 transactions with correct balances
- `match_transactions` matches BT-023 to JE-2025-0012 via reference (CHK-4891, different dates)
- `match_transactions` does NOT match BT-022 (Telstra — no GL counterpart)
- `compute_variances` correctly handles GL sign convention (revenue = negative in GL, positive in management reports)
- `compare_balances` detects the $5,200 AP-GL difference

---

## What Is Real vs. Simulated

| Component | Status | Notes |
|---|---|---|
| LLM reasoning | **Real** | Claude Sonnet reads data, matches transactions, reasons about exceptions |
| Git operations | **Real** | Real commits, branches, merge history, tags |
| Memory lookup | **Real** | Agent reads MEMORY.md and finds Telstra pattern from October 2024 |
| Hook execution | **Real** | preToolUse.js enforces materiality and escalation rules |
| Financial data | **Simulated** | SQLite with Meridian Engineering sample data (23 bank txns, not 23,000) |
| ERP integration | **Simulated** | Tools query SQLite, not a live NetSuite API |

**The architecture is real. The data is simulated.** In production, swap SQLite for ERP/bank feed connectors. Everything else stays the same.

---

## Key Technical Decisions

| Decision | Choice | Why |
|---|---|---|
| Database | SQLite (`better-sqlite3`) | Single-file, portable, no server required |
| LLM | Claude Sonnet (`@anthropic-ai/sdk`) | Best structured tool-use for finance tasks |
| Git ops | `simple-git` | Clean async API, no native compilation |
| Agent execution | Sequential (Atlas → Nova → Echo) | Simpler, more reliable, easier to demo |
| PR system | JSON files in `.gitclose/prs/` | Self-contained, no Docker dependency |
| Web UI | Next.js 15 + Tailwind CSS | Fast to build, server components for git data |

---

## Further Reading

- [`PROBLEM.md`](PROBLEM.md) — Why the CFO office has a structural problem no existing tool solves
- [`ARCHITECTURE.md`](ARCHITECTURE.md) — How the system works, from data layer to git layer to UI
