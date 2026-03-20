Part 1: Implementation Plan Review
Executive Summary
The implementation plan is architecturally sound, well-sequenced, and demonstrates genuine understanding of both the finance domain and the agent engineering required. The 8-phase structure correctly front-loads data integrity (the foundation everything depends on) and builds toward the demo as the culmination. The primary risks are scope creep in the agent runtime layer and insufficient attention to failure modes during the live demo.

Strengths
Data-first sequencing. Phase 1 (database) before Phase 2 (agent definitions) before Phase 3 (tools) is exactly right. You can't test agents without tools, can't test tools without data, can't trust data without verification queries. The dependency chain is correct.

Mathematically verified sample data. The reconciliation proof (both sides adjusting to $4,300,066.44) is genuine and checked. This is non-negotiable for a finance demo — if the math is wrong by a penny, credibility is destroyed. The review caught and corrected the opening balance error ($2,830,241.56, not $3,847,291.12) before it could propagate.

Real vs. Simulated distinction is honest. The table explicitly calling out what's real (LLM reasoning, git operations, memory, hooks) versus simulated (data, ERP integration, email) is critical for credibility. The claim is: "the architecture is real; the data is sample." This is defensible.

The "what is real" architectural choice is correct. Making the git workflow real (actual commits, actual branches, actual merge history) rather than simulated is the right call. The thesis depends on git being the compliance layer — if that's faked, the thesis collapses.

Phase 5 (Git Integration) is properly scoped. Using simple-git for MVP rather than building a custom git abstraction is pragmatic. The option to layer Gitea on top for real PR UI is a good escape hatch.

Demo script is narratively structured (Acts 1-6). This isn't a feature walkthrough — it's a story with a before/after. Act 1 (shared drive horror) establishes the problem viscerally before the solution appears.

Concerns / Gaps
High Severity
No error handling strategy for live demo. What happens when Claude returns an unexpected response? When a tool query returns empty? When the matching engine produces a false positive? The plan has no Phase for hardening against agent failures during a live walkthrough. If Atlas produces a reconciliation that doesn't balance during the demo, there is no recovery. Recommendation: Add a "demo hardening" sub-phase within Phase 8 that includes: (a) cached/deterministic fallback responses for each agent, (b) a replay mode that uses pre-recorded LLM outputs, (c) manual override capability at each step.

Agent loop implementation is underspecified. Phase 4 says "buildContext → callLLM → parseToolCall → executeHook → executeTool → feedResult → loop" but doesn't address: max iterations, context window management (what happens when conversation exceeds token limits), error recovery within the loop, or tool timeout handling. For Atlas processing 23 bank transactions, the context can grow large quickly. Recommendation: Specify max loop iterations (suggest 15), implement context window truncation strategy (summarize older tool results), and add a circuit breaker (if loop exceeds N iterations or M minutes, dump state and escalate).

Nova's full agent definitions are missing. Atlas is fully specified (agent.yaml, SOUL.md, RULES.md, DUTIES.md, hooks, memory). Nova and Echo have summaries only. Phase 2 says "expand to full files following Atlas's pattern" but this is non-trivial — Nova's matching logic (invoice-level vs. transaction-level), exception types (cutoff errors vs. missing postings), and memory patterns are structurally different from Atlas. This isn't copy-paste. Recommendation: Write Nova's full SOUL.md, RULES.md, and DUTIES.md before implementation begins. The rules for AP reconciliation (cutoff sensitivity, vendor-level matching, period boundary handling) need to be as precise as Atlas's rules for bank reconciliation.

Medium Severity
No testing strategy mentioned. The plan goes from implementation to demo polish without any testing phase. For a finance demo, correctness is binary — it either balances or it doesn't. Recommendation: Add verification tests at each phase boundary: Phase 1 verification queries (already mentioned, good), Phase 3 tool unit tests (does match_transactions correctly match BT-023/CHK-4891 by reference despite date difference?), Phase 4 integration test (does Atlas produce the exact reconciliation from Part 4.5?), Phase 5 git state verification (are commits in correct sequence, branches correct?).

Parallel agent execution isn't addressed. Phase 6 mentions gitclose run-all triggering agents in parallel, but the implementation doesn't discuss: concurrency control (do agents share a database connection?), ordering (what if Echo needs recon results before computing variances?), or conflict resolution (can two agents touch the same file?). Recommendation: For MVP, run agents sequentially (Atlas → Nova → Echo). The demo can still show them on separate branches. True parallelism is a v2 concern, and pretending it works when it doesn't is riskier than sequencing them.

Budget line signs are inverted relative to GL convention. Revenue budget amounts are negative ($-12,500,000) following the GL sign convention (credits = negative), but most FP&A teams think in absolute values. Echo's variance commentary presents revenues as positive numbers. The tool compute_variances needs to handle this sign flip, and it's not addressed. Recommendation: Add an explicit sign convention to Echo's SOUL.md: "Revenue and income accounts in the GL are negative (credit balance). When presenting to management, show as positive. Expenses are positive (debit balance). Favorable variance = actual < budget for expenses, actual > budget (absolute) for revenue."

No .gitignore for the close repo. If the demo creates temp files, OS artifacts (.DS_Store), or SQLite WAL files inside the close repo, they'll pollute the git history. Recommendation: Include a .gitignore in the initCloseRepo step.

Low Severity
Gitea vs. JSON PR metadata decision is deferred. The plan says "optionally integrate with local Gitea." For the demo, this matters: a real Gitea PR UI is vastly more impressive than a custom JSON-backed view. Recommendation: Commit to local Gitea for the demo. It takes 10 minutes to set up via Docker and provides a real, familiar PR review interface that finance people (surprisingly) find intuitive when framed as "review and approve, like Track Changes in Word."

The commander vs. yargs CLI choice doesn't matter. Both work. Pick commander and move on.

Phase timeline is missing. The MVP spec had a 6-week timeline. The implementation plan doesn't reference calendar time. Recommendation: Add estimated effort per phase: Phase 1 (2 days), Phase 2 (2 days), Phase 3 (4 days), Phase 4 (3 days), Phase 5 (2 days), Phase 6 (2 days), Phase 7 (4 days), Phase 8 (2 days). Total: ~21 working days / ~4 weeks.

Recommended Additions
Add a Phase 0: Project Bootstrap. Initialize the monorepo, configure TypeScript, set up the build pipeline, configure ESLint, create the initial package.json with all dependencies. This takes half a day but de-risks everything that follows.

Add a docs/ folder to the file structure (addressed in Part 2 below) that contains the theoretical framework, problem framing, and design documentation. This serves dual purpose: demo collateral and interview artifact.

Add a scripts/verify.ts file that runs all mathematical verification queries against the database and fails loudly if any number is wrong. Run this as a pre-commit hook and before every demo.

Add a scripts/demo-reset.ts file that tears down and rebuilds the close repo to pristine state in under 5 seconds. You will need to re-run the demo many times during development and during the actual presentation.

Consider recording a backup video of the demo. If anything goes wrong live (API rate limit, network issue, Claude hallucination), having a 25-minute pre-recorded walkthrough is insurance. Frame it as: "Let me show you exactly what happened when we ran this yesterday" — still credible, not a failure.

</part_1_review>

<part_2_documentation>

Part 2: Documentation — Full Content
What follows is the complete content for every file in the docs/ folder. This is the theoretical framework built from first principles, designed to be read sequentially or navigated by topic.

Updated File/Folder Structure
finance_agent/
  package.json
  tsconfig.json
  .env
  
  db/
    schema.sql
    seed.sql
    verify.sql                  # ← Added: verification queries
    meridian.db
  
  agents/
    atlas-cash-recon/
    nova-ap-recon/
    echo-variance/
  
  src/
    cli/
    runtime/
    tools/
    git/
    db/
  
  app/                          # Next.js UI
  
  scripts/
    verify.ts                   # ← Added: run verification queries
    demo-reset.ts               # ← Added: reset demo state
    seed-db.ts                  # ← Added: rebuild meridian.db
  
  demo/
    traditional-workflow/
    narration.md
  
  docs/                         # ← NEW
    README.md
    01-thesis/
      00-executive-summary.md
      01-the-problem.md
      02-the-insight.md
      03-the-solution.md
      04-implications.md
    02-problem-framing/
      00-overview.md
      01-current-state.md
      02-pain-points.md
      03-root-causes.md
      04-requirements.md
    03-theoretical-framework/
      00-overview.md
      01-first-principles.md
      02-git-as-accounting.md
      03-agents-as-accountants.md
      04-memory-and-learning.md
      05-verification-model.md
    04-design/
      00-overview.md
      01-architecture.md
      02-agent-model.md
      03-data-model.md
      04-git-workflow.md
      05-ui-design.md
      06-security-model.md
    05-implementation/
      00-overview.md
      implementation-plan.md
      technical-decisions.md
      testing-strategy.md
docs/README.md
# GitClose Documentation

> **GitClose** is a git-native monthly close platform where AI agents perform the
> mechanical work of financial close — reconciliation, journal preparation, variance
> commentary — with every action recorded as a git commit, every approval as a merged
> pull request, and every audit trail generated automatically.

## Inspiration & Attribution

This project draws directly from the **GitAgent standard** and the architectural
thinking behind **GitClaw**, developed by **Shreyas Kapale** at **Lyzr**. The core
insight — that a git repository is a natural home for an AI agent's identity, memory,
and work product — originates from that work. GitClose extends this insight into
the finance domain, where the structural equivalence between git workflows and
financial controls creates a product opportunity that is not merely convenient but
architecturally inevitable.

This project was developed as part of an interview assignment for Lyzr. The
assignment asked: "Where should Lyzr build a B2B product for the CFO office?"
The answer, developed across these documents, is: not a product that automates
financial tasks, but a platform where the automation architecture *is* the
compliance framework.

## How to Read This Documentation

The documentation is structured in five layers, each building on the previous:

| Layer | What It Covers | Start Here If You Are... |
|---|---|---|
| **01 — Thesis** | The core insight in ~10 pages | An executive who wants the punchline |
| **02 — Problem Framing** | Why the CFO office is stuck today | A finance professional |
| **03 — Theoretical Framework** | First-principles reasoning | An architect or engineer |
| **04 — Design** | System architecture and decisions | A developer building this |
| **05 — Implementation** | Build plan, ADRs, testing | A developer starting today |

Each layer is self-contained but cross-references the others. If you read nothing
else, read `01-thesis/00-executive-summary.md`.

## Quick Links

- [Executive Summary](01-thesis/00-executive-summary.md) — 2 pages, the whole argument
- [Why Finance Is Broken](02-problem-framing/01-current-state.md) — James Wong's world
- [Git = Accounting](03-theoretical-framework/02-git-as-accounting.md) — the deep structural claim
- [Architecture](04-design/01-architecture.md) — system design with diagrams
- [Implementation Plan](05-implementation/implementation-plan.md) — build sequence
docs/01-thesis/00-executive-summary.md
# Executive Summary

## The Observation

Every CFO office performs three activities: recording financial events, verifying
that records match reality, and interpreting what the numbers mean. Across all
companies, industries, and geographies, roughly 80% of human labor goes to the
first two activities. The third — the work that actually drives decisions — gets
whatever time remains.

This is not because finance professionals are inefficient. It's because the
verification work is genuinely enormous and genuinely critical, and the systems
they use create a structural overhead: every piece of financial work must be
separately documented, reviewed, and evidenced for audit purposes. The work and
the proof that the work was done correctly are two different activities with two
different costs.

## The Insight

What if they weren't?

What if the act of doing financial work automatically generated the documentation?
What if the review process was structurally identical to the approval process?
What if the audit evidence was a property of the system's architecture rather than
an activity performed by humans?

This document argues that a **git-native AI agent platform** achieves exactly this.
Not through clever engineering, but through a structural equivalence that already
exists between financial controls and git workflows:

| Financial Control | Git Equivalent | Consequence |
|---|---|---|
| Maker prepares work | Author pushes a branch | Agent's work = a series of commits |
| Checker reviews and approves | Reviewer approves a pull request | Review = the compliance record |
| Work is posted to the GL | Branch is merged to main | Finalization is a merge event |
| Auditor verifies after the fact | Git log provides immutable history | Audit trail = `git log` |

When work, documentation, and proof collapse into the same action, the compliance
cost curve inverts: more automation produces *more* compliance evidence at *zero*
marginal cost.

## The Product

**GitClose** is a platform where AI agents perform the mechanical work of the
monthly financial close — bank reconciliation, sub-ledger reconciliation, variance
commentary — inside git repositories. Each agent works on a feature branch. Human
reviewers approve via pull requests. The merge to `main` finalizes the period.
The commit history is the complete audit trail.

Three agents demonstrate the concept for a fictional mid-market engineering firm:

- **Atlas** reconciles bank statements to GL cash balances. It matches 23
  transactions in 2 minutes, identifies one exception, and retrieves a matching
  pattern from its memory of a prior period — suggesting a resolution with a
  specific PR reference from October 2024.

- **Nova** reconciles the AP sub-ledger to the GL payables account. It detects
  a $5,200 posting date error that would have taken a human 90 minutes to trace
  through 47 invoices.

- **Echo** generates management commentary for P&L variances. Every explanation
  is attributed to a source — agent memory, data, or "requires investigation."
  No speculation is presented as fact.

## The Numbers

| Metric | Traditional Close | GitClose |
|---|---|---|
| Elapsed time | 3 days | 1 hour |
| Human effort (preparation) | 15 hours | 0 hours |
| Human effort (review) | 3 hours | 1 hour |
| Audit trail | Scattered across email, Excel, shared drives | Complete git history |
| Documentation overhead | 25–35% of close time | Zero marginal cost |

## Attribution

This project is built on the **GitAgent standard** and inspired by
**GitClaw**, developed by **Shreyas Kapale** at **Lyzr**. The architectural
insight — that git is a natural substrate for AI agent identity, memory, and
operations — originates from that work. GitClose extends it into a domain where
the structural fit is not just convenient but revelatory.
docs/01-thesis/01-the-problem.md
# The Problem: Why Financial Close Is Broken

## The Simplest Version

Companies must close their books every month. This process — gathering data,
reconciling accounts, investigating exceptions, writing commentary, getting
approvals, filing reports — takes 5 to 15 business days. The people doing it
spend roughly 85% of that time on mechanical work (pulling data, matching
numbers, formatting spreadsheets, writing memos, chasing approvals) and 15%
on actual thinking.

This ratio hasn't changed meaningfully in 20 years despite billions of dollars
invested in ERP systems, close management tools, and business intelligence
platforms.

## Why Existing Tools Haven't Solved It

The CFO office has technology. The problem isn't a lack of tools. It's that
the tools address the wrong layer.

### ERP Systems (SAP, Oracle, NetSuite)

ERPs automate *recording*. They capture transactions, maintain the general
ledger, and produce trial balances. They're excellent at this. But recording
is already the most automated layer (~30% of labor). ERPs don't help with
verification or interpretation, which consume the remaining ~70%.

### Close Management Tools (BlackLine, FloQast)

These tools automate *orchestration* — task assignment, status tracking,
checklist management, deadline monitoring. They answer "where are we in the
close?" but not "is the reconciliation correct?" They're project management
tools for accountants, not intelligence tools.

### Business Intelligence (Tableau, Power BI)

BI tools automate *visualization*. They can show you a variance chart in
seconds. But they can't tell you *why* revenue dropped 5.6% this month,
and they can't prepare the narrative memo the CFO needs for the board.

### What's Missing

None of these tools address the core problem: **the work and the proof that
the work was done correctly are separate activities.**

When James Wong reconciles a bank account, he does the reconciliation in Excel
(the work), then writes a memo in Word describing what he did (the documentation),
then saves both files plus a screenshot of Sarah's approval email to the audit
folder (the evidence). The documentation and evidence often take longer than
the reconciliation itself.

Every automation tool that speeds up the work *adds* to the documentation burden
("now document what the automation did"), creating a paradox: the more you
automate, the more compliance overhead you generate.

## The Three Laws

Three structural properties make this problem persistent:

**1. Conservation of Information.** Every economic event must be captured and
balanced. Double-entry bookkeeping is the enforcement mechanism. This creates
massive recording overhead that scales linearly with business activity.

**2. Entropy of Financial Data.** Systems drift apart over time. If you have
two systems that should agree (bank statement and GL), they *will* diverge
due to timing, classification, rounding, and complexity. Reconciliation is not
a one-time fix — it's a permanent, monthly activity.

**3. Latency of Insight.** A gap always exists between an event occurring and
the organization understanding its implications. The monthly close exists to
collapse this gap, but the mechanical work required to achieve collapse consumes
nearly all available time.

These laws hold everywhere. They are not best practices to be optimized. They
are structural constraints, like gravity for financial operations.
docs/01-thesis/02-the-insight.md
# The Insight: Work = Documentation = Proof

## The Hidden Tax

In every CFO office, there is a hidden cost layered on top of every piece of
financial work. We call it the **compliance overhead tax**.

It works like this:

Step 1: Do the work. (20 minutes) Step 2: Document what you did. (15 minutes) Step 3: Get it reviewed and approved. (30 minutes of waiting) Step 4: Save evidence for auditors. (10 minutes) Step 5: Prove to auditors it was done right. (during annual audit)

Steps 2-5 are not the work. They are the proof that the work was done correctly.
They often cost more than Step 1.

And here's the paradox: when you automate Step 1, Steps 2-5 don't disappear.
They *grow*. Because now you need to document what the automation did, prove
that a human reviewed the automation's output, and evidence that the automation
operated within approved parameters.

**Traditional automation shifts the work; it doesn't eliminate the overhead.**

## The Structural Equivalence

Git — the version control system used by every software team on earth — already
solves this exact problem for code:

- **The work** is writing code (commits)
- **The documentation** is the commit history (automatically generated)
- **The review** is the pull request (structurally enforced)
- **The proof** is the merge record (immutable, auditable)

Software teams don't write memos about what code they changed. The git log *is*
the memo. They don't screenshot approval emails. The PR merge *is* the approval
record.

The insight is that financial controls are structurally identical to git workflows:

FINANCE GIT ───────────────── ───────────────── Maker prepares entry ≡ Author pushes branch Checker reviews ≡ Reviewer approves PR Entry is posted to GL ≡ Branch merged to main Auditor verifies ≡ Git log examined SOD enforcement ≡ CODEOWNERS rules

This is not a metaphor. These are the same control structures expressed in
different domains. The implication is that a **git-native** system for financial
work doesn't need to *add* compliance — it *is* compliance, by construction.

## The Inversion

Traditional architecture:

Compliance cost ∝ Volume of work (Linear: more work → more documentation → more review → more evidence)

Git-native architecture:

Compliance cost = Fixed (the architecture itself) Compliance evidence ∝ Volume of work (Inverted: more work → more commits → richer audit trail → LESS overhead)

This is a phase change, not an optimization. The more an agent does, the more
auditable the system becomes — for free.

## Credit Where It's Due

This insight builds on the **GitAgent standard** and the work behind **GitClaw**,
created by **Shreyas Kapale** at Lyzr. The idea that an AI agent's identity,
rules, memory, and work products should live in a git repository isn't just a
technical convenience — it's the architectural foundation that makes the
compliance inversion possible. Without git-native agents, there's no structural
equivalence to exploit. The insight is theirs; the application to finance is ours.
docs/01-thesis/03-the-solution.md
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
docs/01-thesis/04-implications.md
# Implications: What This Means

## For the CFO

The monthly close goes from 5-15 days to hours. Not by cutting corners, but by
eliminating the artificial separation between work and proof. The compliance
overhead that consumed 25-35% of close time becomes a property of the
architecture — free.

But the deeper implication is about the *kind* of work your team does. Today,
your best people spend most of their time pulling data and matching numbers.
With GitClose, they spend their time reviewing agent output, investigating
genuine exceptions, and interpreting what the numbers mean. The human role
shifts from *doing* to *governing*.

## For the Controller

Control documentation — the thing Big 4 firms charge millions to audit — becomes
code. The agent's RULES.md IS the control description. The hook that prevents
posting above a materiality threshold IS the control test. The PR approval
history IS the operating effectiveness evidence. Controls are never stale
because the documentation and the implementation are the same file.

## For the Auditor

This is perhaps the most counterintuitive implication: git-native agents make
the auditor's job *easier*, not harder. Instead of sampling 25 reconciliations
and testing each for evidence of review, the auditor reads the git log for the
complete population. Instead of requesting control documentation and hoping it
matches reality, they read the agent definition files that *are* reality.

The auditor shifts from "did you follow your process?" to "is your process
correctly defined?" — a more productive question.

## For the Industry

If a standard emerges for what a "finance agent" looks like (extending the
GitAgent standard), then the agent definitions become portable. A reconciliation
agent written for one company can be forked, customized, and deployed at another.
Institutional knowledge — the patterns in MEMORY.md — becomes a transferable
organizational asset rather than a fragile human dependency.

The long-term implication is a marketplace: base agent templates for common
tasks, industry packs for regulated sectors, and a platform that orchestrates
them. The agents are the content. The orchestration is the business.

## The Deepest Implication

The separation between "financial work" and "financial controls" is artificial.
It's a consequence of the tools we've used (spreadsheets, email, shared drives)
that don't inherently track who did what, when, and why. Git does. When your
work environment inherently tracks provenance, controls stop being overhead
and start being architecture.

GitClose doesn't add AI to finance. It reveals that **git was always the
missing control layer** — and AI agents are what make it operational.
docs/02-problem-framing/00-overview.md
# Problem Framing: Overview

This section maps the CFO office as a system — its functions, its constraints,
its failure modes. The analysis is demand-side: what hurts, how much, and why.

The theoretical framework (Section 03) provides the supply-side: what the
architecture makes possible. The design (Section 04) connects them.

## Contents

1. [Current State](01-current-state.md) — How the monthly close works today
2. [Pain Points](02-pain-points.md) — Quantified problems
3. [Root Causes](03-root-causes.md) — Why spreadsheets and email fail
4. [Requirements](04-requirements.md) — What a solution must satisfy
docs/02-problem-framing/01-current-state.md
# Current State: How Financial Close Works Today

## The Three Functions

Every CFO office performs exactly three functions:

| Function | What It Does | % of Labor | Value Created |
|---|---|---|---|
| **Record** | Capture economic events as structured entries | ~30% | Foundation — necessary but largely automated by ERP |
| **Verify** | Ensure records match reality across systems | ~50% | Defensive — prevents errors, satisfies regulators |
| **Interpret** | Transform verified data into decisions | ~20% | Offensive — drives strategy and capital allocation |

The misallocation is obvious: the highest-value activity gets the least time.

## The Monthly Close — What Actually Happens

The monthly close is a 5-15 day process that occurs after every month-end.
Its purpose is to produce a set of financial statements that management,
regulators, and auditors can rely on.

### A Day in James Wong's Life

James is a Senior Accountant at Meridian Engineering. He's competent,
experienced, and thoroughly exhausted during close. Here's his January close:

**Day 1:**
- Downloads bank statement from Westpac Business Online (CSV)
- Exports GL transactions from NetSuite (CSV)
- Opens last month's reconciliation Excel template, saves as new file
- Reformats date columns (Westpac: DD/MM/YYYY, NetSuite: MM/DD/YYYY)
- VLOOKUPs to match bank transactions to GL entries
- Investigates unmatched items — three are routine (bank fee, interest,
  insurance), two are outstanding checks, one is a mystery credit from Telstra
- Emails the Telstra account manager (waits for response)
- Writes reconciliation memo in Word
- Emails everything to Sarah (Controller) for review
- Repeats for the payroll bank account
- Starts AP sub-ledger reconciliation
- Finds a $5,200 discrepancy — traces through 47 invoices (90 minutes)
- Finds a posting date error — emails AP team to fix it

**Day 2:**
- Telstra account manager hasn't responded
- Sarah has two comments on the bank recon — fixes, re-saves, re-emails
- AP team fixes the posting date — re-exports, re-checks
- Starts variance analysis — exports budget vs. actual
- Emails project managers: "Why was revenue below budget?" (waits)
- Writes commentary for variances he can explain
- Leaves gaps for items awaiting response

**Day 3:**
- Telstra responds: "It's a refund, same as October"
- James searches his email for the October thread (30 minutes)
- Completes the bank recon
- Project managers respond with explanations
- Completes variance commentary
- Sarah reviews and approves
- Priya (FP&A) has edits — revises, re-sends
- Saves all files to shared drive in correct folder structure
- Updates the close checklist spreadsheet

**Total: 18 hours of James's time. 3 days elapsed. ~15 hours was mechanical.**

## The Tools James Uses

| Tool | Purpose | Limitation |
|---|---|---|
| NetSuite | GL, AP, AR data | Good at recording; no verification capability |
| Excel | Reconciliation, matching, analysis | No audit trail, no version control, error-prone |
| Word | Memos, commentary | Separate from the work — documentation is overhead |
| Email | Review, approval, communication | No structure, no tracking, evidence is in inboxes |
| Shared Drive | File storage for audit | Folder chaos, no version control, no provenance |

## The Multi-System Reality

No company runs on one system. Meridian Engineering has:
- NetSuite (ERP — GL, AP, AR)
- Westpac Business Online (banking)
- Workday (payroll)
- Salesforce (CRM / revenue pipeline)
- Confluence (documentation)
- Email (communication and approvals)
- Shared Drive (audit file storage)

Every month, James extracts data from 3-4 of these, reformats it into Excel,
and cross-references it manually. The reconciliation work exists because
*the systems don't agree with each other*, and the work of making them agree
falls to humans.
docs/02-problem-framing/02-pain-points.md
# Pain Points: Quantified

## Where Close Time Actually Goes

| Activity | % of Close | Nature | AI Leverage |
|---|---|---|---|
| Data gathering & assembly | 25–30% | Pull, format, normalize from multiple systems | High — automatable |
| Reconciliation & matching | 20–25% | Compare, match, investigate exceptions | Very High — rule-based with edge cases |
| Documentation & memo prep | 15–20% | Write findings, evidence, templates | **Eliminated** in git-native architecture |
| Review & approval cycles | 10–15% | Waiting for / performing reviews | Reduced — PRs are faster than email |
| Communication & follow-up | 10–15% | Chase responses, escalate, coordinate | Reduced — structured escalation |
| **Analysis & judgment** | **10–15%** | **Actual thinking** | Human — augmented by LLMs |

## The Compliance Overhead

Documentation (15-20%) plus Review (10-15%) equals **25-35% of close time**
spent on proving the work was done correctly — not on improving accuracy or
generating insight.

This overhead scales linearly with work volume in traditional architectures.
More entities → more reconciliations → more memos → more reviews → more
audit file management.

## Five Specific Pain Points

### 1. The Telstra Problem (Institutional Memory Loss)

When James encounters the mystery Telstra credit, he doesn't remember October.
He searches email for 30 minutes. If James had left the company, the new
accountant would have investigated from scratch — probably 2 hours of work
for a known, recurring item.

**Frequency:** Every close has 3-5 "I've seen this before but can't remember
the details" exceptions.
**Cost:** 2-4 hours per close per accountant.
**Root cause:** Knowledge lives in people's heads, not in systems.

### 2. The v3-FINAL-FINAL Problem (Version Chaos)

James's shared drive has:
Bank Recon - Westpac Operating - Jan 2025 v3 FINAL.xlsx Bank Recon - Westpac Operating - Jan 2025 v3 FINAL (2).xlsx

Which one did Sarah approve? Which one has the Telstra correction? Nobody knows
without opening both files and comparing.

**Frequency:** Every close.
**Cost:** 1-2 hours per close (finding and verifying correct versions).
**Root cause:** Shared drives have no version control.

### 3. The Email Approval Problem (Evidence Scatter)

Sarah's approval of the bank reconciliation is an email that says "Approved.
Please post JEs." This email exists in Sarah's Sent folder and James's inbox.
When Deloitte asks for approval evidence, someone must find this email, export
it as .msg, and save it to the audit folder.

**Frequency:** 3-5 approvals per close.
**Cost:** 30-60 minutes per close; 4-8 hours per quarter during audit.
**Root cause:** The approval mechanism (email) is separate from the work (Excel).

### 4. The 47-Invoice Problem (Manual Investigation)

Nova finds the Arup cutoff error in 27 seconds by systematically comparing
every AP invoice to its GL posting. James does the same thing in 90 minutes
because he's scanning a pivot table of 47 invoices, checking dates, and
cross-referencing to the GL manually.

**Frequency:** Sub-ledger reconciliations typically have 1-3 discrepancies per
close, each requiring investigation.
**Cost:** 1-3 hours per discrepancy.
**Root cause:** Investigation is sequential and manual.

### 5. The "Why Did Revenue Drop?" Problem (Commentary Burden)

Echo generates variance commentary in 75 seconds because it has access to
budget, actuals, prior period, and accumulated memory about contract changes,
one-off items, and structural decisions. James takes 6+ hours because he must
email project managers, wait for responses, and manually synthesize their
explanations into a coherent narrative.

**Frequency:** Every close.
**Cost:** 6-10 hours per close.
**Root cause:** The context needed to explain variances lives in different
people's heads. No system aggregates it.
docs/02-problem-framing/03-root-causes.md
# Root Causes: Why the Status Quo Persists

## The Architecture Is Wrong

The root cause of every pain point above is the same: **the architecture of
current tools creates an artificial separation between doing financial work,
documenting that work, and proving it was done correctly.**

This separation is not inherent to accounting. It's an artifact of the tools:

| Tool | Creates Separation Because... |
|---|---|
| Excel | No built-in audit trail. No version control. No approval mechanism. The work product has no memory of how it was created. |
| Email | The approval mechanism is disconnected from the work product. Evidence is in inboxes, not attached to deliverables. |
| Shared Drive | File storage with no provenance. Who put this file here? Is it the approved version? Was it modified after approval? |
| ERP | Captures transactions but not the verification and interpretation layer. The close process happens *outside* the ERP. |

## Why Traditional Automation Makes It Worse

When companies automate a reconciliation (using RPA, scripts, or rule engines),
they reduce the time spent on Step 1 (doing the work). But they add a new
requirement: document what the automation did, verify it operated correctly,
and maintain the automation itself.

Before automation: Human does work (20 min) + Human documents work (15 min) = 35 min

After automation: Bot does work (2 min) + Human documents bot output (10 min) + Human reviews bot output (10 min) + Someone maintains bot (ongoing) = 22+ min

The savings are real but diminishing. The compliance overhead doesn't shrink
proportionally because it's rooted in the architecture, not the automation.

## What Would Fix It

A system where:

1. Every action automatically generates a record of what was done, when,
   and by whom (no separate documentation step)
2. The review mechanism is embedded in the workflow, not layered on top
   via email (no separate approval tracking)
3. The complete history is immutable and searchable (no file management
   for audit evidence)
4. Knowledge accumulates in the system, not in people's heads (no
   institutional memory loss)

This system already exists. It's called git. The question is: can it be
made operational for finance?
docs/02-problem-framing/04-requirements.md
# Requirements: What a Solution Must Provide

## Functional Requirements

| # | Requirement | Rationale |
|---|---|---|
| F1 | Reconcile bank statements to GL balances automatically | Core close task — highest volume, highest pain |
| F2 | Reconcile sub-ledgers to GL control accounts | Second most common reconciliation task |
| F3 | Generate variance commentary from budget, actual, and context | Most time-consuming analytical task per close |
| F4 | Produce audit-quality workpapers | Output must meet auditor evidence standards |
| F5 | Track exceptions with investigation and resolution | Core workflow — not everything auto-resolves |
| F6 | Propose (not post) journal entries | Read-only GL access for safety |
| F7 | Learn from resolved exceptions | Knowledge must compound, not reset each month |

## Control Requirements

| # | Requirement | Rationale |
|---|---|---|
| C1 | Maker ≠ Checker (agent prepares, human approves) | Regulatory requirement — SOX, APRA, Basel |
| C2 | Complete audit trail for all material actions | Every action traceable to an actor and timestamp |
| C3 | Role-based access control | Agents cannot exceed their authority |
| C4 | Materiality-based escalation | Items above thresholds require human judgment |
| C5 | Immutable history | Records cannot be altered after the fact |

## Deployment Requirements

| # | Requirement | Rationale |
|---|---|---|
| D1 | Data never leaves customer environment | Non-negotiable for financial services |
| D2 | Model-agnostic (Claude, GPT, Azure, on-prem) | Customers have different data classification policies |
| D3 | No new UI for core workflow | Finance people live in Excel and Outlook |
| D4 | Zero-install demo capability | Sales weapon — CFO sees value before procurement |

## Non-Requirements (What We Explicitly Exclude)

| Exclusion | Why |
|---|---|
| Replace the ERP | ERPs work fine for recording; we're solving verification/interpretation |
| Eliminate human review | Humans must remain in the loop for governance; this is non-negotiable and desirable |
| Handle 100% of exceptions | Some exceptions require genuinely novel judgment; the agent escalates these |
| Real-time continuous close | Monthly cadence is the adoption path; continuous is a future state |
docs/03-theoretical-framework/00-overview.md
# Theoretical Framework: Overview

This section builds the argument from first principles. It does not assume
familiarity with git, AI agents, or financial close processes — each concept
is developed from fundamentals.

## Contents

1. [First Principles](01-first-principles.md) — The irreducible truths about financial work
2. [Git as Accounting](02-git-as-accounting.md) — Why git's data model maps to double-entry
3. [Agents as Accountants](03-agents-as-accountants.md) — Where AI fits the "fuzzy middle"
4. [Memory and Learning](04-memory-and-learning.md) — How agents compound institutional knowledge
5. [The Verification Model](05-verification-model.md) — Maker-checker implemented as git workflow
docs/03-theoretical-framework/01-first-principles.md
# First Principles: The Irreducible Truths

## What Is a Financial Close?

Strip away the jargon, and a financial close answers one question: **"What is
the true financial state of this organization as of this date?"**

Answering this requires three things:
1. **Completeness** — have we captured everything that happened?
2. **Accuracy** — do our records match reality?
3. **Explanation** — do we understand what the numbers mean?

Everything in a CFO office — every reconciliation, journal entry, variance
analysis, management report, and regulatory filing — serves one of these three.

## The Six Invariants

These properties hold true across all companies, industries, and geographies.
They are not best practices. They are structural constraints.

### 1. Conservation of Information

Every economic event must be captured and balanced. This is double-entry
bookkeeping: for every debit, there must be an equal credit. The sum of all
entries must be zero.

**Implication:** Massive recording overhead. The volume of financial data is
directly proportional to economic activity. This creates the data foundation
that everything else operates on.

### 2. Entropy of Financial Data

Systems that should agree will drift apart without active maintenance. The bank
balance and the GL cash balance start the month in agreement and end the month
disagreeing — always. Not because of errors (usually), but because of timing,
classification, and the inherent complexity of financial flows.

**Implication:** Reconciliation is a permanent, recurring activity. It cannot
be solved once. It must be performed every period, for every account.

### 3. Latency of Insight

There is always a gap between an event occurring and the organization
understanding its financial impact. The monthly close exists to collapse this
gap to 5-15 days. The aspiration is to collapse it further.

**Implication:** Speed matters. But speed without accuracy is dangerous.
The constraint is not "go fast" — it's "go fast and be right."

### 4. Separation of Duties

The person who prepares financial work must not be the person who approves it.
This is regulatory law (SOX Section 302/404, APRA CPS 220, Basel III). It
exists because collusion requires two people, and the probability of error
decreases with independent review.

**Implication:** Every financial process has at least two roles — maker and
checker. Any automation must preserve this separation.

### 5. Auditability

Every material financial action must be traceable — who did it, when, what
they did, and on what basis. This is what auditors verify. It's what regulators
require. It's what investors rely on.

**Implication:** Evidence generation is not optional. It's as fundamental as
the work itself. Any system that doesn't generate evidence is useless for
regulated finance.

### 6. Materiality

Not everything requires the same level of scrutiny. A $50 bank fee and a
$5,000,000 revenue adjustment do not need the same investigation. Financial
work is risk-based: attention is allocated in proportion to the potential impact
of error.

**Implication:** Agents need materiality thresholds. They need to know when
to auto-resolve and when to escalate. This is configurable, not hard-coded.

## The Three Axes

The entire CFO problem space resolves along three independent dimensions:

### Axis 1: Process Determinism

Rule-Based Fuzzy Middle Judgment-Heavy ────────────────────────────────────────────────────────────────────► GL posting Reconciliation Capital allocation Recurring journals Exception investigation Scenario planning Standard calcs Variance commentary M&A analysis

◄── RPA territory ──►◄── AI AGENT SWEET SPOT ──►◄── Human only ──►

### Axis 2: Data Complexity

Single source ──► Multi-source ────────────────────────────────────────────────────────────────────► One ERP query Cross-system recon Contracts + emails + market data + context

◄── BI tools work ──►◄── AI AGENTS NEEDED ──►

### Axis 3: Frequency

One-off Periodic Continuous ────────────────────────────────────────────────────────────────────► M&A due diligence Monthly close Daily cash recon Board presentations Quarterly reporting Transaction monitoring

◄── HIGHEST ROI ──►
The sweet spot — where AI agents create the most value — is the intersection:
**fuzzy middle determinism × multi-source data × monthly frequency.** This is
reconciliation, variance commentary, and journal preparation.
docs/03-theoretical-framework/02-git-as-accounting.md
# Git as Accounting: Why the Model Fits

## What Git Actually Is

Git is a system for tracking changes to a collection of files over time. Every
change (a "commit") records:

- **What** changed (the diff)
- **Who** made the change (the author)
- **When** (the timestamp)
- **Why** (the commit message)
- **The parent state** (what the files looked like before the change)

Commits are cryptographically linked — each commit's identity is a hash of its
content plus its parent's hash. This makes the history tamper-evident. You
cannot alter a past commit without changing every subsequent commit's identity.

## What Double-Entry Bookkeeping Actually Is

Double-entry bookkeeping is a system for tracking changes to a collection of
accounts over time. Every change (a "journal entry") records:

- **What** changed (the debit and credit amounts)
- **Who** made the change (the preparer)
- **When** (the posting date)
- **Why** (the description / narration)
- **The parent state** (the account balances before the entry)

Journal entries must balance — debits must equal credits. This is a built-in
integrity constraint. If the books don't balance, something is wrong.

## The Structural Mapping

| Accounting Concept | Git Concept | Property Preserved |
|---|---|---|
| Journal entry | Commit | Atomic unit of change |
| Account balance | File state | Current state = sum of all changes |
| Trial balance | Working tree | Snapshot of all accounts at a point in time |
| Period close | Tag | Named point in history that cannot be modified |
| Audit trail | Git log | Immutable, ordered record of all changes |
| Balance check (debits = credits) | CI test / hook | Integrity constraint verified on each change |
| Maker-checker | PR review | Separation of author and approver |
| Reversal entry | Revert commit | Explicit undo that preserves history |
| Chart of accounts | Directory structure | Organizational hierarchy for data |

This is not a metaphor. These are isomorphic data structures — they model the
same kind of thing (a ledger of changes over time with integrity constraints).

## What Git Provides That Spreadsheets Don't

| Property | Git | Excel on Shared Drive |
|---|---|---|
| **Immutable history** | Yes — cryptographic hash chain | No — files can be overwritten, deleted, renamed |
| **Author attribution** | Yes — every commit has an author | No — "last modified by" is unreliable |
| **Branching** | Yes — parallel work without interference | No — one file, one person at a time (or merge hell) |
| **Diffing** | Yes — see exactly what changed between versions | No — manual comparison of cell values |
| **Reversal** | Yes — `git revert` creates a new commit that undoes a prior one | No — delete the row and hope |
| **Review process** | Yes — pull requests with structured approval | No — email with "looks good" |

## The Deeper Point

Git wasn't designed for accounting. But it was designed to solve the same
underlying problem: **how do you track a series of changes to a shared state,
made by multiple people, over time, with complete traceability and the ability
to detect unauthorized modifications?**

That this is the same problem accounting has been solving since 1494 (when
Luca Pacioli published the first description of double-entry bookkeeping)
is not a coincidence. It's convergent evolution. Two domains, separated by
500 years, arriving at isomorphic solutions because the underlying requirements
are identical.

GitClaw and the GitAgent standard, developed by Shreyas Kapale at Lyzr, made
the first move: put the AI agent's identity and memory inside git. GitClose
makes the second: put the agent's *work product* — financial reconciliations,
journal entries, commentary — inside git too. When you do both, the entire
system inherits git's properties: immutability, traceability, branching,
diffing, review. These aren't features you build. They're properties you inherit.
docs/03-theoretical-framework/03-agents-as-accountants.md
# Agents as Accountants: AI in the Fuzzy Middle

## What an AI Agent Is

An AI agent is a system that combines a language model (the "brain") with the
ability to take actions (the "hands") in a loop until a task is complete.

User gives instruction ↓ Build context (instructions + history + available tools) ↓ Call language model ↓ Did the model request a tool? ├── YES → run tool → feed result back → loop └── NO → return final answer → done

The loop is mechanical. It's the same in every agent framework. It is not
where differentiation occurs.

Differentiation occurs in four places:

1. **Identity** — who is this agent, what are its rules? (agent.yaml, SOUL.md, RULES.md)
2. **Tools** — what actions can it take? (query GL, match transactions, propose JEs)
3. **Memory** — what does it remember from prior sessions? (MEMORY.md)
4. **Guardrails** — what programmatic constraints limit its behavior? (hooks/)

## Why Finance Is Uniquely Suited to Agents

Most AI agent applications struggle with a fundamental problem: how do you
know if the agent is correct?

Finance has a built-in answer: **the books must balance.**

A bank reconciliation either produces matching adjusted balances or it doesn't.
A journal entry either has equal debits and credits or it doesn't. A sub-ledger
total either agrees with the GL control account or it doesn't. These are
binary, verifiable outcomes.

This means:
- The agent can self-verify much of its output
- Errors are detectable (not silently wrong)
- Confidence can be quantified (18/23 items matched = 78% auto-resolved)
- Human review can focus on exceptions rather than checking everything

## The Specialist Model

Macquarie Bank (Fortune 500 financial institution) has deployed AI agents in
finance under their "Project Nexus" initiative. Their design choices validate
the specialist approach:

| Macquarie Agent | Department | Specialty |
|---|---|---|
| Indy.ai | CFC SAF | Daily cash-at-bank reconciliation |
| Nico.ai | CGM Finance | Monthly lease reconciliation |
| Drew.ai | CFC LEC | Dividend upstreaming |
| Kai.ai | Treasury Finance | Month-end review, journal prep |
| Mica.ai | Balance Sheet | APRA regulatory returns |
| Finn.ai | Tax EMEA | Monthly tax accounting |

Every agent is narrowly specialized. Every agent has a name, a department,
and a job description. Every agent communicates via existing channels (email,
Teams). Every agent's output is reviewed by a human supervisor.

**The lesson:** Finance doesn't want a general-purpose AI. It wants a
competent, reliable, narrowly scoped junior accountant that never calls in
sick and never forgets what happened last month.

Atlas, Nova, and Echo follow this pattern. Each is a specialist. Each has
clear boundaries defined in RULES.md. Each produces output for human review.
None operates autonomously.

## Where Agents Add Value vs. Where Humans Must Remain

| Activity | Agent Capability | Human Required? |
|---|---|---|
| Data extraction and formatting | Excellent | No |
| Transaction matching (exact + fuzzy) | Excellent | For fuzzy matches above threshold |
| Pattern recognition from memory | Excellent | To confirm and approve |
| Exception classification | Good | For novel exceptions |
| Journal entry proposal | Good | To approve and post |
| Variance computation | Excellent | No |
| Variance commentary (with context) | Good | To verify accuracy of narrative |
| Novel judgment calls | Poor | Yes — always |
| Stakeholder communication | Moderate | For sensitive matters |

The honest assessment: agents handle 70-85% of close work autonomously. The
remaining 15-30% requires human judgment. But the human's role shifts from
*doing* mechanical work to *governing* agent output — reviewing, approving,
investigating genuine exceptions, and making judgment calls. This is a
fundamentally more satisfying and more valuable use of a Senior Accountant's
expertise.
docs/03-theoretical-framework/04-memory-and-learning.md
# Memory and Learning: How Agents Improve Over Time

## The Institutional Knowledge Problem

Every CFO office has a "Sarah" — the person who has been reconciling a specific
account for years and knows every recurring exception, every vendor quirk,
every seasonal pattern. When Sarah leaves, that knowledge walks out the door.
The replacement spends 6-12 months rebuilding it, making the same mistakes,
investigating the same known items.

This is not a technology problem in the traditional sense. It's a *storage*
problem: valuable operational knowledge exists only in human memory.

## Git-Native Memory

In the GitAgent standard (developed by Shreyas Kapale at Lyzr), an agent's
memory is a markdown file committed to a git repository: `memory/MEMORY.md`.

This is a deliberate design choice with profound consequences:

| Property | Description | Finance Value |
|---|---|---|
| **Persistent** | Committed to git, backed up to remote | Knowledge survives personnel changes |
| **Versioned** | Every update is a commit with a diff | "What did the agent learn in March?" = `git diff` |
| **Auditable** | Every memory entry has a PR reference | "Who authorized this auto-resolution rule?" = a merge event |
| **Branchable** | Fork the agent = fork the memory | Onboard a new entity by forking + adjusting |
| **Searchable** | Plain text, grep-friendly | Agent searches before flagging exceptions |
| **Human-readable** | Markdown, not database blobs | Auditors and managers can read it directly |

## How Memory Compounds

### Month 1 (Agent deployment)

Atlas encounters 5 unmatched bank items. All are escalated to a human.

- Bank fee: $125 → James says "post to bank fees, same every month"
- Interest: $340 → James says "post to interest income"
- QBE insurance: $2,415 → James says "post to insurance expense"
- Telstra credit: $14,924.44 → James investigates, confirms it's a refund
- Unknown debit: $89.50 → James investigates, it was a merchant error

Atlas resolves 0/5 independently. Memory updated with 5 entries.

### Month 2

Atlas encounters 4 unmatched items (one is new).

- Bank fee: $125 → **Memory match.** Auto-proposes JE. (No human needed.)
- Interest: $315 → **Memory match.** Auto-proposes JE.
- QBE insurance: $2,415 → **Memory match.** Auto-proposes JE.
- New: ATO direct debit: $42,800 → No memory match. Escalated to human.

Atlas resolves 3/4 independently. Human handles 1.

### Month 6

Atlas encounters 5 unmatched items. 4 are known patterns from memory.

- Bank fee, interest, QBE insurance, and ATO quarterly payment → all auto-resolved
- New: Telstra credit appears again ($14,924.44) → Memory match from Month 1.
  Agent proposes the same treatment with a reference to the original resolution.
  Human confirms in 30 seconds instead of investigating for an hour.

Atlas resolves 4/5 independently. 1 escalated but with a hypothesis.

### Month 12

Atlas has accumulated knowledge of every recurring bank item, every seasonal
pattern, every vendor quirk. Exception rate has dropped from 100% (Month 1)
to ~10% (only genuinely novel items). Total human time per reconciliation
has dropped from 90 minutes to 10 minutes.

EXCEPTION RATE OVER TIME

100% │● │ ● 80% │ ● │ ● 60% │ ● │ ● 40% │ ● │ ● ● 20% │ ● ● │ ● ● ● 0% │────────────────────────── M1 M2 M3 M4 M5 M6 ... M12

Each resolved exception becomes a known pattern.
 The agent gets smarter every month.
## Why This Matters Strategically

Traditional retention risk: "Sarah is leaving. We'll lose 6 years of knowledge."

Git-native agent memory: "Sarah's knowledge is in MEMORY.md. It was committed
when she resolved each exception, with PR references showing her approval.
The new agent instance (or the new human) inherits 6 years of patterns instantly."

This changes the economics of finance staffing. Institutional knowledge becomes
a **durable organizational asset** — version-controlled, auditable, transferable —
rather than a **fragile human dependency**.
docs/03-theoretical-framework/05-verification-model.md
# The Verification Model: Maker-Checker as Git Workflow

## The Regulatory Requirement

In every regulated financial environment, a fundamental control exists: the
person who prepares work must not be the same person who approves it. This is
variously called:

- **Maker-Checker** (banking)
- **Segregation of Duties / SOD** (SOX compliance)
- **Dual Control** (payments and treasury)
- **Four-Eyes Principle** (European regulation)

The purpose is simple: errors and fraud are harder when two independent people
are involved. The preparer might make a mistake; the reviewer catches it. The
preparer might act improperly; the reviewer blocks it.

## How It Works in Git

Git's pull request workflow implements this natively:

BRANCH PROTECTION RULES:

Authors cannot approve their own PRs
PRs require at least 1 approved review before merge
Merge to main requires reviewer from designated list (CODEOWNERS)
All commits on the branch are visible in the review
Merge creates an immutable record of who approved and when
Translated to finance:

GitClose configuration:

Agents cannot merge their own branches (structural: they don't have permission)
PRs require Controller or Senior Accountant approval
Only designated reviewers can merge to main (close.yaml)
Every commit the agent made is visible in the PR diff
Merge timestamp and reviewer name are permanent in git history
No additional mechanism is needed. The git workflow IS the maker-checker control.

## What the Auditor Verifies

Today, auditors verify maker-checker by:
1. Selecting a sample of reconciliations
2. Checking for a preparer signature and a reviewer signature
3. Verifying the two people are different
4. Verifying the reviewer is authorized
5. Checking the date (was the review timely?)

With git-native close:
1. `git log` shows every action and every merge
2. Author ≠ Merger is enforced by branch protection
3. CODEOWNERS or close.yaml defines authorized reviewers
4. Timestamps are cryptographically embedded in commit hashes

The auditor doesn't need to sample. They verify the branch protection rules
once and then trust the system for the entire population. This is **full
population testing** rather than sample-based testing — more rigorous, faster,
and less expensive for everyone.

## The Access Control Model

┌─────────────────────────────────────────────────────────┐ │ PERMISSIONS MATRIX │ │ │ │ Agent Sr Acct Controller Auditor │ │ (Atlas) (James) (Sarah) (Ext) │ │ ─────────────────────────────────────────────────────── │ │ Read GL data ✅ ✅ ✅ ✅ │ │ Create branch ✅ ✅ ✅ ❌ │ │ Commit to branch ✅ ✅ ✅ ❌ │ │ Open PR ✅ ✅ ✅ ❌ │ │ Review PR ❌ ✅ ✅ ❌ │ │ Approve PR ❌ ❌* ✅ ❌ │ │ Merge to main ❌ ❌* ✅ ❌ │ │ Tag close ❌ ❌ ✅ ❌ │ │ Read history ✅ ✅ ✅ ✅ │ │ Modify history ❌ ❌ ❌ ❌ │ │ │ │ * James can review but not approve his own work │ │ or the agent's work on tasks assigned to him │ └─────────────────────────────────────────────────────────┘

This matrix is enforceable through git's native access control mechanisms.
No additional permission system is required.
docs/04-design/00-overview.md
# Design: Overview

This section translates the theoretical framework into concrete system design
decisions. Each document corresponds to a design layer.

## Contents

1. [Architecture](01-architecture.md) — System architecture with diagrams
2. [Agent Model](02-agent-model.md) — How agents are defined and managed
3. [Data Model](03-data-model.md) — Database schema rationale
4. [Git Workflow](04-git-workflow.md) — Close lifecycle as release cycle
5. [UI Design](05-ui-design.md) — Interface design principles
6. [Security Model](06-security-model.md) — Access control and audit
docs/04-design/01-architecture.md
# Architecture

## System Overview

┌─────────────────────────────────────────────────────────────────────┐ │ CUSTOMER ENVIRONMENT │ │ │ │ ┌─────────────────────────────────────────────────────────────┐ │ │ │ AGENT RUNTIME (Node.js) │ │ │ │ │ │ │ │ ┌──────────┐ ┌──────────┐ ┌──────────┐ │ │ │ │ │ Atlas │ │ Nova │ │ Echo │ Agent instances │ │ │ │ │ (cash) │ │ (AP) │ │ (var) │ │ │ │ │ └────┬─────┘ └────┬─────┘ └────┬─────┘ │ │ │ │ │ │ │ │ │ │ │ ▼ ▼ ▼ │ │ │ │ ┌──────────────────────────────────────┐ │ │ │ │ │ TOOL IMPLEMENTATIONS │ │ │ │ │ │ query_gl │ match_txns │ etc. │ │ │ │ │ └──────────────┬───────────────────────┘ │ │ │ │ │ │ │ │ │ ┌─────────┴─────────┐ │ │ │ │ │ │ │ │ │ │ ┌────▼─────┐ ┌──────▼──────┐ │ │ │ │ │ SQLite │ │ Git Repos │ │ │ │ │ │ (source │ │ (close │ │ │ │ │ │ data) │ │ output) │ │ │ │ │ └──────────┘ └─────────────┘ │ │ │ │ │ │ │ └──────────────────────────────────────────────────────────────┘ │ │ │ │ ┌──────────────────────────────────────────────────────────────┐ │ │ │ WEB UI (Next.js) │ │ │ │ Dashboard │ PR Review │ Auditor View │ │ │ └──────────────────────────────────────────────────────────────┘ │ │ │ │ ┌──────────────────────────────────────────────────────────────┐ │ │ │ CLAUDE API (external) │ │ │ │ Only API calls leave the environment. │ │ │ │ Financial data stays on-premise. │ │ │ └──────────────────────────────────────────────────────────────┘ │ └─────────────────────────────────────────────────────────────────────┘

## Key Architectural Decisions

### 1. Agent definitions are separate from close execution

Agent repos (what the agent *is*) are distinct from close repos (what the
agent *produces*). This mirrors the separation between an employee's job
description and their work product. The agent definition evolves slowly;
close repos are created fresh each month.

### 2. SQLite for source data, git for work products

Source data (GL, bank, AP, budget) lives in SQLite — optimized for queries.
Work products (reconciliations, commentary, exceptions) live in git — optimized
for traceability. These are different requirements served by different storage.

### 3. Sequential agent execution for MVP

Atlas runs first, then Nova, then Echo. This is simpler than parallel execution
and avoids concurrency issues. In production, agents can run in parallel since
they operate on separate branches and never modify the same files.

### 4. Read-only GL access

Agents can query the GL but cannot modify it. They propose journal entries
as CSV files in the close repo. A human posts approved entries to the ERP.
This is the safety boundary that makes the system trustworthy from day one.

### 5. Claude via API, not embedded

The LLM runs remotely (Anthropic API). Only the API calls leave the customer
environment — not the source data. The prompts contain account-level summaries,
not customer-identifiable data. For production deployments requiring full data
sovereignty, Azure OpenAI or on-premise models can be substituted by changing
`model.provider` in agent.yaml.
docs/04-design/02-agent-model.md
# Agent Model

## The GitAgent Standard

GitClose agents follow the **GitAgent standard** developed by Shreyas Kapale
at Lyzr. An agent is a git repository containing definition files:

agent-name/ ├── agent.yaml # Configuration, model, tools, permissions ├── SOUL.md # Core identity and instructions ├── RULES.md # Guardrails and escalation thresholds ├── DUTIES.md # RACI matrix ├── tools/ # Available capabilities ├── skills/ # Documented procedures ├── hooks/ # Programmatic constraints └── memory/ └── MEMORY.md # Accumulated knowledge

## Design Philosophy: File = Control

Every file in an agent's definition maps to a financial control concept:

| File | Finance Control | Why This Mapping Matters |
|---|---|---|
| agent.yaml | Role definition, delegation of authority | Who this agent is and what it's authorized to do |
| SOUL.md | Accounting policy manual, job description | How the agent approaches its work |
| RULES.md | Control procedures, escalation policy | What the agent must and must not do |
| DUTIES.md | RACI matrix | Who is responsible, accountable, consulted, informed |
| hooks/ | Automated control tests | Programmatic enforcement of thresholds and rules |
| memory/ | Institutional knowledge base | Accumulated exception patterns and resolutions |

**The agent definition IS the control documentation.** When an auditor asks
"what controls govern this reconciliation process?", the answer is: read the
agent's RULES.md. When they ask "has the control changed since last year?",
the answer is: `git diff v2024-12 v2025-01 -- RULES.md`.

## The Three Agents

### Atlas (Cash Reconciliation)

**Purpose:** Reconcile bank statements to GL cash balances.
**Difficulty:** Medium — mostly rule-based matching with occasional exceptions.
**Memory value:** High — recurring bank items compound quickly.
**Key constraint:** MUST escalate unidentified credits > $10,000.

### Nova (AP Sub-Ledger Reconciliation)

**Purpose:** Reconcile AP sub-ledger to GL payables account.
**Difficulty:** Medium — invoice-level matching; cutoff errors are common.
**Memory value:** Medium — vendor-specific patterns emerge over time.
**Key constraint:** MUST detect period boundary errors (wrong posting date).

### Echo (Variance Commentary)

**Purpose:** Generate P&L management commentary with sourced explanations.
**Difficulty:** High — requires narrative generation with factual grounding.
**Memory value:** Very High — business context from prior periods is essential.
**Key constraint:** MUST attribute every explanation to a source. NEVER speculate.
docs/04-design/03-data-model.md
# Data Model

## Design Rationale

The database serves two purposes:

1. **Simulate source data** that would normally come from ERP and banking systems
2. **Track platform state** — close lifecycle, tasks, exceptions, agent runs

These are kept in a single SQLite file for portability and simplicity.

## Schema Overview

SOURCE DATA (simulates ERP + Bank) ────────────────────────────────── entities ──► chart_of_accounts ──► gl_transactions ▲ bank_statements ──► bank_transactions

ap_invoices ──► ap_payments

budget_lines prior_period_actuals

PLATFORM DATA (GitClose operational) ──────────────────────────────────── close_periods ──► close_tasks ──► agent_runs │ ├──► recon_results └──► exceptions

## Key Design Decisions

### GL transactions use signed amounts

Positive = debit, negative = credit. This follows the accounting convention where:
- Assets and expenses have debit (positive) normal balances
- Liabilities, equity, and revenue have credit (negative) normal balances

Every journal entry has ≥2 lines that sum to zero. This is enforced by the
`double_entry_check` verification query.

### Bank transactions use banking convention

Positive = deposit (credit to customer account), negative = withdrawal (debit
to customer account). This matches how bank statements are presented. The
matching engine must handle the sign flip between GL convention and banking
convention.

### AP sub-ledger uses positive amounts for invoices

Invoice amounts are always positive (the amount owed). Payments are tracked
separately. The GL balance for payables is negative (credit balance) because
it's a liability. Nova's matching logic must reconcile these conventions.

### Exceptions reference both task and reconciliation

An exception can exist without a reconciliation (e.g., a variance commentary
flag). The `recon_id` is nullable. This allows Nova's AP exceptions and Echo's
variance flags to use the same table.

## Verification Queries

```sql
-- Verify GL balance for cash account
SELECT SUM(amount) + 2830241.56 AS closing_balance
FROM gl_transactions
WHERE account_id = '1000-001' AND period = '2025-01';
-- Expected: 4287341.56

-- Verify all journals balance (debits = credits)
SELECT journal_id, SUM(amount) AS balance
FROM gl_transactions
GROUP BY journal_id
HAVING ABS(SUM(amount)) > 0.01;
-- Expected: 0 rows (all journals balanced)

-- Verify bank statement closing
SELECT opening_balance + (
    SELECT SUM(amount) FROM bank_transactions 
    WHERE statement_id = 'BS-WBC-2025-01'
) AS computed_closing
FROM bank_statements
WHERE statement_id = 'BS-WBC-2025-01';
-- Expected: 4306216.44

-- Verify AP sub-ledger vs GL difference
-- AP total: sum of open invoices
-- GL 2000-001: sum of all postings
-- Difference should be $5,200 (the ARUP-7795 cutoff error)
These queries are embedded in scripts/verify.ts and run before every demo.

---

# `docs/04-design/04-git-workflow.md`

```markdown
# Git Workflow: Close as Release Cycle

## The Mapping

| Close Step | Git Operation | CLI Command |
|---|---|---|
| Open the close | Initialize repo, create branches | `gitclose open` |
| Agent performs task | Commits on feature branch | `gitclose run` |
| Submit for review | Open pull request | Automatic on task completion |
| Reviewer approves | Merge PR to main | `gitclose review --approve` |
| Finalize close | Tag the release | `gitclose finalize` |

## Branch Naming Convention

main # Merged, approved work = "the books" feature/cash-recon-westpac-operating # Atlas task feature/cash-recon-westpac-payroll # Atlas task feature/ap-recon # Nova task feature/variance-analysis # Echo task

## Commit Message Convention

type(scope): description

type: feat (new output), fix (correction), docs (documentation update) scope: cash-recon, ap-recon, variance, exception, memory description: what this commit does

Examples: feat(cash-recon): transaction matching — 18 exact matches found feat(cash-recon): EXCEPTION — Telstra credit $14,924.44 with memory match fix(ap-recon): corrected Arup posting date cutoff error feat(variance): generate management commentary for flagged variances

## The Close Lifecycle

State: NOT_STARTED │ │ gitclose open ▼ State: IN_PROGRESS │ │ Agents work on branches │ Commits accumulate │ PRs are created ▼ State: REVIEW │ │ Humans review PRs │ Exceptions investigated │ PRs approved or changes requested ▼ State: CLOSED │ │ All PRs merged │ git tag v2025-01-close │ README.md auto-generated with summary ▼ State: AUDITABLE │ │ Auditor receives read-only access │ Complete history available via git log

## What a Complete Close Repo Looks Like

$ git log --oneline --graph

t3u4v5w (HEAD -> main, tag: v2025-01-close) Merge PR #4 (payroll recon) |
| * ... feat(cash-recon): payroll account reconciliation |/
a8b9c0d Merge PR #3 (variance analysis) |
| * p0q1r2s feat(variance): add YoY comparison | * l7m8n9o feat(variance): generate management commentary | * h4i5j6k feat(variance): compute budget vs actual variances |/
e1f2g3h Merge PR #2 (AP sub-ledger recon) |
| * e1f2g3j feat(ap-recon): reconciliation workpaper — balanced ✓ | * b8c9d0i feat(ap-recon): EXCEPTION — cutoff error on ARUP-7795 | * y5z6a7h feat(ap-recon): invoice-level matching — 46 of 47 matched | * v2w3x4g feat(ap-recon): fetch AP sub-ledger and GL balances |/
x1y2z3a Merge PR #1 (cash recon - Westpac operating) |
| * s9t0u1f feat(cash-recon): reconciliation workpaper — balanced ✓ | * p6q7r8e feat(cash-recon): EXCEPTION — Telstra credit with memory match | * m3n4o5d feat(cash-recon): classify outstanding items | * j0k1l2c feat(cash-recon): classify known recurring items from MEMORY.md | * g7h8i9b feat(cash-recon): classify timing items | * d4e5f6a feat(cash-recon): transaction matching — 18 exact matches | * a1b2c3d feat(cash-recon): fetch bank statement and GL data |/
initial Close opened: MER-AU-ENG January 2025
19 commits. Complete audit trail. Zero documentation overhead.

docs/04-design/05-ui-design.md
# UI Design

## Design Principle: The Agent's Interface Is Its Work Product

Finance professionals will not adopt a new tool that requires them to change
how they work. The primary "interface" is not a web dashboard — it's the
artifacts the agents produce:

- Excel workbooks (reconciliations)
- Markdown documents (commentary, memos)
- CSV files (proposed journal entries)
- Email-like notifications (exception alerts)

The web dashboard exists for orchestration and review — not for daily work.

## Three Views

### 1. Close Dashboard

**Purpose:** Where the Controller monitors close progress.
**Shows:** Tasks and their status, exception counts, progress bar, elapsed time.
**Actions:** Open close, trigger agent runs, view PRs.

### 2. PR Review View

**Purpose:** Where reviewers approve or reject agent work.
**Shows:** Reconciliation summary, file diff, exception detail with memory
context, proposed journal entries.
**Actions:** Comment, approve, request changes, merge.
**Key feature:** The Telstra exception displays the memory match inline,
showing the October 2024 resolution and its PR reference.

### 3. Auditor View

**Purpose:** Read-only access for external auditors.
**Shows:** Complete audit trail (git log), agent definition snapshots,
exception resolution history.
**Actions:** Read, filter, export as PDF.
**Key feature:** Auditor can filter by date range, agent, task type,
or exception status.

## Why Not a Chat Interface

Most AI agent demos use a chat window. We deliberately don't. Reasons:

1. Finance work produces *artifacts* (workpapers, memos, JEs), not conversations
2. Chat implies open-ended interaction; close tasks are structured and bounded
3. The review mechanism (PR) is richer than chat — it shows diffs, not messages
4. Auditors need evidence in file form, not conversation transcripts

The agent "speaks" through its commits and work products. The human "responds"
through PR comments and merge decisions. This is a more natural model for
governed, evidence-producing work.
docs/04-design/06-security-model.md
# Security Model

## Data Sovereignty

The core security property: **financial data never leaves the customer's
environment.**

The system architecture enforces this:

| Data Type | Where It Lives | What Leaves |
|---|---|---|
| GL transactions | Customer's SQLite / ERP | Never |
| Bank statements | Customer's files | Never |
| AP invoices | Customer's database | Never |
| Agent work products | Customer's git repos | Never |
| Agent memory | Customer's git repos | Never |
| LLM prompts | Sent to API | Account-level summaries, no PII |
| LLM responses | Received from API | Reasoning and outputs |

For customers requiring full air-gap (government, defense, some banks):
deploy an on-premise model and set `model.provider: local` in agent.yaml.

## Access Control Layers

### Layer 1: Agent Permissions (agent.yaml)

```yaml
permissions:
  can_read: [bank_statements, gl_transactions, ...]
  cannot: [post_journal_entry, approve_own_work, modify_gl, ...]
The agent literally cannot call tools that aren't in its permitted set.

Layer 2: Hook-Based Enforcement (hooks/preToolUse.js)
Programmatic checks before every tool invocation. Enforces materiality thresholds, escalation rules, and access boundaries.

Layer 3: Git Branch Protection
Agents cannot merge their own branches. Only designated reviewers (defined in close.yaml) can approve and merge PRs. This is structural SOD.

Layer 4: Immutable History
Git's hash chain makes retroactive modification detectable. If anyone alters a commit after the fact, the hash changes and the history breaks.

Audit Logging
Every agent action generates an entry in .gitclose/audit.jsonl:

{
  "timestamp": "2025-02-03T08:31:04+11:00",
  "agent": "atlas",
  "action": "tool_call",
  "tool": "fetch_bank_statement",
  "params": {"account": "1000-001", "period": "2025-01"},
  "result": "23 transactions fetched",
  "commit": "a1b2c3d",
  "hook_result": {"allow": true}
}
This log is committed to the close repo, making it part of the immutable git history.

---

# `docs/05-implementation/00-overview.md`

```markdown
# Implementation: Overview

## Contents

1. [Implementation Plan](implementation-plan.md) — The detailed 8-phase build plan
2. [Technical Decisions](technical-decisions.md) — Architecture Decision Records (ADRs)
3. [Testing Strategy](testing-strategy.md) — Verification at every layer

## Context

This project is built as a demonstration for **Lyzr**, whose GitClaw platform
(developed by Shreyas Kapale) provides the foundational agent architecture.
The implementation extends GitClaw's GitAgent standard into the finance domain,
proving that git-native AI agents are a natural fit for the CFO office.

The MVP is not a production system. It's a working demonstration with real
agent reasoning, real git operations, and sample financial data — designed
to prove the core thesis in 25 minutes.
docs/05-implementation/technical-decisions.md
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
docs/05-implementation/testing-strategy.md
# Testing Strategy

## Philosophy

Financial work is binary: it either balances or it doesn't. There is no
"mostly correct" bank reconciliation. Testing must verify mathematical
correctness at every layer.

## Layer 1: Data Integrity (scripts/verify.ts)

Run against `meridian.db` after every seed:

✓ GL balance for 1000-001: $4,287,341.56 (expected: $4,287,341.56) ✓ All 22 journals balance to $0.00 ✓ Bank statement closing: $4,306,216.44 (expected: $4,306,216.44) ✓ Bank transaction count: 23 (expected: 23) ✓ AP sub-ledger total: $812,550.00 (expected: $812,550.00) ✓ GL 2000-001 balance: $807,350.00 (expected: $807,350.00) ✓ AP-GL difference: $5,200.00 (expected: $5,200.00 — ARUP-7795 cutoff) ✓ Budget line count: 18 (expected: 18) ✓ Reconciliation proof: bank adj = GL adj = $4,300,066.44

**This runs as a pre-commit hook and before every demo.**

## Layer 2: Tool Unit Tests

Each tool function is tested in isolation:

| Tool | Test |
|---|---|
| `fetch_bank_statement` | Returns correct number of transactions, correct balances |
| `query_gl_balance` | Returns $4,287,341.56 for 1000-001, Jan 2025 |
| `match_transactions` | Matches BT-002 to JE-2025-0003 (exact match on amount) |
| `match_transactions` | Matches BT-023 to JE-2025-0012 (reference match, different dates) |
| `match_transactions` | Does NOT match BT-022 (Telstra — no GL counterpart) |
| `query_ap_subledger` | Returns correct count and total for open invoices |
| `compute_variances` | Produces correct $ and % variance for each P&L line |

## Layer 3: Agent Integration Tests

End-to-end test for each agent against sample data:

| Agent | Verification |
|---|---|
| Atlas | Produces reconciliation where adjusted bank = adjusted GL = $4,300,066.44 |
| Atlas | Flags Telstra credit as exception with memory match reference |
| Atlas | Proposes exactly 3 journal entries (bank fee, interest, insurance) |
| Atlas | Creates exactly 7 commits on the feature branch |
| Nova | Identifies $5,200 AP-GL difference |
| Nova | Traces difference to ARUP-7795 cutoff error |
| Echo | Generates commentary for all 6 flagged variances |
| Echo | Does not fabricate explanations (all attributed to sources) |

## Layer 4: Git State Tests

After a full close cycle:

✓ Close repo has 4 merged branches ✓ Main branch has 4 merge commits ✓ Tag v2025-01-close exists ✓ Every merge commit has a different author than branch commits ✓ audit.jsonl has entries for every tool call ✓ No files outside output/ and exceptions/ are modified by agents

## Layer 5: Demo Rehearsal

Run the complete demo 3 times before the real presentation:
1. First run: identify failures, fix them
2. Second run: time each section, adjust narration
3. Third run: record as backup video
This completes the full documentation suite. Every file is self-contained but cross-references the others. The thesis builds from first principles through theory to design to implementation. The attribution to Shreyas Kapale and Lyzr's GitClaw is woven throughout — not as a footnote but as the architectural foundation the entire argument depends on.

</part_2_documentation>