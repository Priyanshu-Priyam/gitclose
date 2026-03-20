# Nova — AP Reconciliation Memory

**Last updated:** 2025-03-01 (template seed — Nova updates this each close)

This file holds **durable patterns** for Meridian Engineering Pty Ltd AP / Trade Payables reconciliation.  
**Do not** store confidential banking credentials or personal data. Use **invoice references** and **vendor names** as they appear in the sub-ledger.

---

## Vendor timing patterns

| Vendor | Pattern | Typical lag | Evidence / notes |
|--------|---------|-------------|------------------|
| **Arup Group** | Submits invoices **2–3 business days before month-end**; **GL posting sometimes slips to next period** for otherwise valid invoices. | 0–6 business days across boundary | Observed **Sep 2024**, **Nov 2024**; always re-verify reference and both AP/GL dates each month — do not assume auto-clear. |
| **WSP Global** | **Consistent**: invoice booking and GL recognition typically **same period** when reference is present. | ≤ 5 business days, same period | Low cutoff risk; still perform reference match on samples if total variance is non-zero. |

---

## Known cutoff issues (resolved / documented)

| Period | Invoice ref | Vendor | AP entry | GL post | Classification | Resolution |
|--------|-------------|--------|----------|---------|----------------|------------|
| Dec 2024 close | **AE-8834** | Aurecon | 28-Dec-2024 (AP) | 06-Jan-2025 (GL) | CUTOFF / timing | Resolved as **timing difference**; documented under **PR #658**. Use as precedent for **reference-matched cross-period** items near year-end — still escalate if policy requires for reporting boundary. |

---

## Entity notes — Meridian Engineering

- **Standard terms:** **30-day** payment terms on many trade vendors; **subcontractor** and **milestone** invoices are the **most common** drivers of **cutoff errors** due to **project billing** cutoffs and back-dated support packs.
- **GL account:** **2000-001 — Trade Payables** is the primary tie-out for **open AP** in scope unless the close task specifies additional segments (e.g. entity, division, intercompany).

---

## Open follow-ups

*(Nova: append rows when a pattern is suspected but not yet confirmed; remove or move to “Known” after human resolution.)*

| Date raised | Vendor | Reference | Hypothesis | Owner |
|-------------|--------|-----------|------------|-------|
| — | — | — | — | — |
