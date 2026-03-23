---
name: ap-reconciliation
description: "Standard procedure for reconciling AP sub-ledger open invoices against GL Trade Payables control account: invoice-level trace by reference, cutoff identification, exception classification, and workpaper generation."
license: proprietary
allowed-tools: query_ap_subledger query_gl_balance compare_balances trace_invoice create_exception generate_recon_workpaper update_memory
metadata:
  category: finance
  agent: nova-ap-recon
---

# Skill: AP Sub-Ledger to GL Trade Payables Reconciliation

**Agent:** Nova  
**Entity:** Meridian Engineering Pty Ltd  
**GL account:** `2000-001` — Trade Payables  
**Objective:** Prove that **open AP** per the sub-ledger is fairly stated and **traceable** to GL with **invoice-reference** integrity, including **cutoff** identification.

---

## When to use this skill

- Monthly (or task-triggered) **close_task_assigned** for AP reconciliation.
- Ad-hoc investigation when Controller requests a **vendor** or **period** deep-dive.
- After **ERP** or **interface** changes affecting AP → GL posting.

---

## Preconditions

- Confirmed **entity_id** (Meridian legal entity in ERP).
- **period** in `YYYY-MM` (or system-native period key per task).
- Scope: **open invoices** unless task specifies **all activity** or **cleared** cohorts.
- Read-only access: no posting or master-data edits.

---

## Procedure (step by step)

### Step 1 — Scope the AP population

1. Call **`query_ap_subledger`** with:
   - `entity_id`
   - `period`
   - `status_filter` (e.g. `OPEN`, `UNPAID`, or task-specific)
   - `vendor_filter` if the task limits to one vendor or cohort
2. Capture:
   - **Invoice reference** (primary key for all downstream steps)
   - **Vendor** name and vendor ID if returned
   - **Invoice amount** (functional currency)
   - **AP entry / booking date**
   - **Invoice date** and **due date** if available
3. Compute **AP control total** = sum of open invoice amounts in scope (exact cents).

### Step 2 — GL balance for Trade Payables

1. Call **`query_gl_balance`** with:
   - `account_id`: `2000-001` (or fully qualified coa key if your integration uses composite ids)
   - `period`: same as Step 1
2. Record **closing balance** (and opening + movement if provided) for tie-out narrative.

### Step 3 — First-pass totals comparison

1. Call **`compare_balances`** with:
   - `ap_total` from Step 1
   - `gl_balance` from Step 2 (use the balance definition your runbook specifies — typically closing Trade Payables)
2. State **variance** = AP total − GL balance (or defined convention — **be consistent** within one workpaper).
3. Decision:
   - **Zero variance** → still execute **Step 4** on **all material invoices** (or stratified sample if task allows — document sample basis).
   - **Non-zero variance** → **Step 4** for **every invoice** in scope until each line is classified.

### Step 4 — Invoice-level trace (reference mandatory)

For **each** invoice reference from Step 1:

1. Call **`trace_invoice`** with:
   - `invoice_ref`
   - `entity_id`
   - `period` (AP period of interest; widen only if task permits prior/next period for cutoff)
2. For each result row, capture:
   - **GL document id / journal** reference
   - **GL posting date** and **GL period**
   - **Posted amount** (must match invoice **to the cent**)
   - **GL reference / narration** fields used for matching
3. Classify:
   - **MATCHED** — exact reference + exact amount; AP and GL dates within **5 business days** **and** same accounting period.
   - **CUTOFF** — exact reference + exact amount, but **AP period ≠ GL period** (or dates cross month with matched reference).
   - **UNMATCHED_AP** — AP invoice exists, **no** satisfactory GL line.
   - **UNMATCHED_GL** — GL activity suggests payable but **no** AP open invoice (investigate accruals, reclasses, duplicates).
   - **POTENTIAL_DUPLICATE** — **multiple** GL lines with the same invoice reference and concerning amounts.

**Rule reminder:** Never classify **MATCHED** on amount alone.

### Step 5 — Cutoff analysis

1. Filter all **CUTOFF** and **borderline timing** rows.
2. For each, tabulate:
   - Invoice ref  
   - Vendor  
   - AP date / period  
   - GL posting date / period  
   - **Reporting boundary** flag (month-end only vs **quarter-end** vs **year-end**)
3. Apply escalation policy:
   - **Quarter-end / year-end** boundary → escalate **regardless of amount** (hook assigns CUTOFF to James Wong).
4. Aggregate by **vendor** to detect **systematic** late posting.

### Step 6 — Vendor pattern aggregation

1. Build a **pivot-style** summary:
   - Vendor  
   - Count of exceptions by type  
   - Gross exception AUD  
2. Cross-check **`memory/MEMORY.md`**:
   - If vendor matches a **known timing pattern**, cite it and tailor follow-up (e.g. expect slip into next period for certain subcontractors).
3. If new **repeatable** behaviour is confirmed, schedule **`update_memory`** after human alignment if required by policy.

### Step 7 — Reconciliation workpaper

1. Call **`generate_recon_workpaper`** with:
   - `ap_balance` — control total from AP population
   - `gl_balance` — from Step 2
   - `matched` — array of matched invoice ↔ GL pairs (references, dates, amounts)
   - `cutoff_errors` — CUTOFF table with periods and reporting-boundary flags
   - `exceptions` — UNMATCHED / duplicate / other items with owners and status
2. Ensure the Markdown output includes:
   - **Scope** (entity, period, filters)
   - **Totals** and **variance**
   - **Exception summary** by vendor
   - **Escalations** list

### Step 8 — Exception records

1. For every **UNMATCHED**, **POTENTIAL_DUPLICATE**, and material **CUTOFF** (if policy requires ticket even when explained), call **`create_exception`** with:
   - `exception_type` (`UNMATCHED`, `CUTOFF`, `THRESHOLD`, `SYSTEMIC`, `OTHER` per taxonomy)
   - `amount`
   - `description` with **invoice reference** in first line
   - Vendor / counterparty fields as required by integration
2. Triggers:
   - Amount **> AUD 25,000** → auto-escalated in **`preToolUse`**
   - **CUTOFF** → always **James Wong** assignee in hook
3. **`onException`** will attach **memory_match** hints — incorporate into comments if useful.

### Step 9 — Memory update

1. Call **`update_memory`** to append:
   - New **vendor timing** observations
   - Confirmed **cutoff** resolutions with **PR** references when provided by humans
2. Keep entries **factual** and **reference-backed**.

### Step 10 — Commit outputs

1. Call **`commit_output`** to save workpaper and structured JSON/CSV attachments per platform convention.
2. Do **not** mark complete until **RULES.md** documentation requirements are satisfied.

---

## Quality checks (before handoff)

- [ ] Every open invoice in scope has a **classification** or open exception ID.  
- [ ] No **MATCHED** row lacks **invoice reference ↔ GL reference** evidence.  
- [ ] All amounts **exact to the cent**; no silent rounding.  
- [ ] **Cutoff** items near **Q** or **YE** are flagged for escalation.  
- [ ] **MEMORY.md** consulted before inventing new narratives for repeat vendors.

---

## Common failure modes

| Symptom | Likely cause | Action |
|--------|----------------|--------|
| AP total > GL | Unposted AP, interface delay, wrong account segment | Trace refs; check GL account mapping; widen period only per task |
| GL > AP | Manual GL accrual, duplicate posting, wrong vendor bill | Search GL for duplicate refs; investigate JE source |
| "Match" on amount only | Coincident amounts | Reject match; find reference-level proof |
| Many CUTOFF at month-end | Vendor billing / subcontractor milestones | Vendor aggregate + memory update |

---

## Canonical mantra

**Compare every open AP invoice to a corresponding GL posting. If an AP invoice has no GL match, or a GL posting has no AP match, classify as exception and investigate the posting dates.**
