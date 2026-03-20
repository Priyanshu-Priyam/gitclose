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
