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
