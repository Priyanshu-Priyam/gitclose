# The Solution: Git-Native Financial Operations

## What GitClose Is

GitClose is a platform where AI agents perform the mechanical work of the monthly
financial close inside git repositories. The platform has three components:

### 1. Agent Definitions (What the agents are)

Each agent is a git repository containing:

| File | Purpose | Finance Equivalent |
|---|---|---|
| `agent.yaml` | Configuration, permissions, tools | Role definition, delegation of authority |
| `SOUL.md` | Core instructions and personality | Job description, accounting policy manual |
| `RULES.md` | Guardrails and escalation thresholds | Control procedures, SOD policy |
| `DUTIES.md` | RACI matrix | Responsibility assignment |
| `hooks/` | Programmatic constraints | Automated control tests |
| `memory/MEMORY.md` | Accumulated knowledge | Institutional memory (the "Sarah knows..." knowledge) |

**The agent definition IS the control documentation.** It's never stale because
it's literally the code that runs. Testing a control = reading the file.

### 2. Close Execution (What the agents produce)

Each monthly close creates a new git repository. Each task is a branch. Each
agent works on its own branch. The workflow:

main ─────●───────────────────────────────●──── TAG: v2025-01-close │ │ ├── feature/cash-recon ────● PR #1 approved ──►│ ├── feature/ap-recon ─────● PR #2 approved ──►│ └── feature/variance ─────● PR #3 approved ──►│

Close opened                    All merged = Close complete
### 3. Human Review Layer (Where humans govern)

Humans don't do the mechanical work. They govern:

- **Reviewing PRs:** Each agent's output is a pull request. The Controller reads
  the diff, sees every match, every exception, every proposed journal entry.
  Approval = merge. This IS the maker-checker control.

- **Resolving exceptions:** When an agent flags something it can't resolve (a
  genuinely unknown credit, a suspected error), a human investigates. The
  resolution is committed to the repo and to the agent's memory.

- **Opening and closing periods:** The Controller decides when to start the close
  and when to finalize it. These are explicit actions with timestamps.

## How the Three Agents Work

### Atlas (Cash Reconciliation)

Reconciles bank statements to GL cash balances. For January 2025:

1. Fetches Westpac bank statement (23 transactions) and GL data (22 entries)
2. Matches 19 transactions by amount and reference
3. Classifies 3 known recurring items (bank fee, interest, insurance) using MEMORY.md
4. Classifies 3 timing items (2 outstanding checks, 1 deposit in transit)
5. Flags 1 exception — a Telstra credit of $14,924.44 — and retrieves a matching
   pattern from October 2024 in its memory, complete with the PR number where it
   was previously resolved
6. Produces a balanced reconciliation workpaper ($4,300,066.44 = $4,300,066.44)
7. Proposes 3 journal entries for the recurring items
8. Creates all output as commits on `feature/cash-recon`
9. Opens a pull request for Sarah to review

**Time: 2 minutes 24 seconds. 7 commits. Complete audit trail.**

### Nova (AP Sub-Ledger Reconciliation)

Reconciles the AP sub-ledger to GL account 2000-001:

1. Queries AP sub-ledger ($812,550) and GL balance ($807,350)
2. Identifies $5,200 difference
3. Traces to a specific invoice (ARUP-7795) where the GL journal was posted
   with a February date instead of January — a genuine cutoff error
4. Proposes a correcting entry
5. 4 commits, 67 seconds

### Echo (Variance Commentary)

Generates P&L management commentary:

1. Computes budget vs. actual variances for all P&L accounts
2. Identifies 6 material variances (exceeding 5% or $50K thresholds)
3. Generates narrative commentary for each, sourcing explanations from
   memory (Aurecon in-housing, Woodside delay) and flagging where
   investigation is needed
4. Adds year-over-year comparison with trend narrative
5. 3 commits, 75 seconds
6. Every explanation is attributed — never speculative

## What the Auditor Sees

When Deloitte arrives for the annual audit, they receive read-only access to
the close repository. One command shows them everything:

$ git log --oneline --all

t3u4v5w (HEAD -> main, tag: v2025-01-close) Merge PR #1 [sarah.martinez] a8b9c0d Merge PR #2 [sarah.martinez] e1f2g3h Merge PR #3 [priya.sharma + sarah.martinez] ... a1b2c3d feat(cash-recon): fetch bank statement and GL data

Every agent action is a commit. Every approval is a merge with a name. Every
exception is documented with its resolution. The audit evidence is richer,
more complete, and more reliable than anything a manual process has ever
produced — and it was generated at zero additional cost.
