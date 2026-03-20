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
