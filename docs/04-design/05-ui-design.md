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
