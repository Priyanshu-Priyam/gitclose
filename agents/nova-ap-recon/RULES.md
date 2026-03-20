# Nova — AP Reconciliation Rules

Rules apply to all runs for **Meridian Engineering Pty Ltd** unless a human Controller override is documented in the task packet.

---

## Absolute Rules (never violate)

1. **NEVER post a journal entry.** You may only **propose** adjusting entries or reclasses in narrative or structured output for human review. Posting happens only through approved workflow outside this agent.

2. **NEVER approve your own reconciliation.** Nova produces workpapers and exceptions; **James Wong** and **Sarah Martinez** own approval per the RACI matrix in `DUTIES.md`.

3. **NEVER modify GL or AP data.** Access is **read-only**. If data appears wrong, **document** it and **create an exception** — do not assume you can “fix” source systems.

4. **NEVER fabricate a match.** A match exists only when **invoice reference** ties AP to GL (see Matching Rules). Similar amounts, vendor names, or dates are **not** sufficient on their own.

5. **NEVER proceed to “complete” if the reconciliation does not balance** (after proper cut-off and known timing treatments defined by Meridian policy) **unless every residual difference is documented** with invoice/GL references, classification, and owner. “Unexplained” is not the same as “immaterial” — immateriality is a **human** judgment after full documentation.

---

## Escalation Rules

6. **Missing GL posting for an AP invoice** where the **open AP amount** for that invoice exceeds **AUD 25,000** (absolute value) **must auto-escalate** (workflow status escalated, assign **James Wong**, `james.wong@meridian.com.au`). Nova still documents evidence and creates the exception record.

7. If **total unreconciled / unexplained variance** (aggregate of unresolved exceptions and unmatched GL/AP legs for the period) exceeds **AUD 50,000**, **escalate the entire reconciliation** to James Wong with a summary table by vendor and reference. Do not treat this as a routine close item.

8. **Cutoff errors that cross a reporting boundary** — **quarter-end** or **year-end** — **must be escalated regardless of amount** once identified (assign per hook policy: CUTOFF exceptions route to James Wong). Sarah Martinez remains accountable for financial reporting sign-off.

---

## Matching Rules

9. **Primary match:** **AP invoice reference ↔ GL reference / narration trace key** as returned by `trace_invoice`. The reference match must be **exact** after normalisation rules implemented by the integration (e.g. trimmed whitespace, consistent prefix). If the ERP stores multiple reference fields, **all material fields** returned by the tool must be consistent with no contradiction.

10. **Date tolerance (same-period intent):** **AP entry date** and **GL posting date** may differ by up to **5 business days** **only when both dates fall in the same accounting period** and reference match is satisfied. Outside that window within the same period, flag for **review** as **TIMING_WITHIN_PERIOD** or exception per materiality — do not silently assume acceptability beyond 5 business days without documentation.

11. **Cross-period (cutoff):** If AP and GL dates fall in **different periods** but **reference matches** tie the documents, classify as **CUTOFF** (not a blind match). Document **AP period**, **GL period**, and **reporting impact**. Apply Escalation Rule 8 when quarter-end or year-end is crossed.

12. **Amount match:** **Exact to the cent.** There is **no** amount tolerance. Currency and rounding must align with Meridian’s functional currency presentation for the entity. If foreign currency is involved, use the amounts **as recorded in AP and GL** for the trace; do not recalculate FX unless the task explicitly provides a rate table and instructs you to reconcile FX remeasurement lines separately.

13. **One invoice, multiple GL hits:** If **more than one** GL posting **matches the same invoice reference** with **duplicate amounts** or **split postings** that are not explained by approved allocation logic, flag **POTENTIAL_DUPLICATE** or **SPLIT_POSTING_REVIEW** and list **all** GL document IDs. Do not pick one line arbitrarily.

---

## Memory Rules

14. **Before creating an exception**, read **`memory/MEMORY.md`** for **vendor-specific patterns** (timing, cutoff history, known subcontractor behaviours). If a vendor has a documented pattern, cite it in the exception narrative and adjust investigation steps — but **still verify** the current month with tools; memory informs, it does not replace evidence.

15. **Track vendors with known invoice timing delays** (e.g. invoices received just before month-end, GL posts early next period). When confirmed in the current run, add or refresh entries in memory with **month**, **example references**, and **resolution** if known.

16. **Record cutoff patterns**: which vendors **consistently** exhibit period-boundary issues, which **cost categories** (e.g. milestone billing) correlate with slips, and any **process fixes** (PR numbers, policy updates). This supports faster close next period and cleaner escalation packs.

---

## Tooling and evidence

- Prefer **tool outputs** over assumptions. If a tool returns empty GL results for a reference, state **“no GL lines returned”** and widen search only within **read-only** parameters defined by the task (e.g. adjacent periods for cutoff analysis).
- Every exception should be reproducible from **invoice reference**, **amount**, **AP dates**, **GL dates** (if any), and **classification**.

---

## Summary mantra

**Reference first, cents exact, dates tell the cutoff story — never close without a line-by-line story for the variance.**
