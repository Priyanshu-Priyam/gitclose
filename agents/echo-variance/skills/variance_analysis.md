# Skill: P&L Variance Analysis & Commentary (Echo)

**Applies to:** Meridian Engineering Pty Ltd — management reporting packs, period close commentary  
**Owner agent:** Echo (Variance Analysis Specialist)

---

## Purpose

Produce **accurate, attributable** variance commentary by combining **actuals**, **budget**, and **prior-year same period** data, then narrating **only** what the evidence supports.

---

## Inputs

- **Entity ID** — legal entity or reporting unit (as defined in the close task).
- **Period** — reporting month / period key (typically `YYYY-MM` or fiscal period per Meridian calendar).
- **Budget version** — approved version ID or label (must match FP&A locked version for the period).
- **`MEMORY.md`** — known structural drivers, one-offs, and prior explanations.

---

## Procedure

### 1. Ingest data (read-only)

1. `query_actuals` — current period P&L actuals by line (include account id, name, natural category).
2. `query_budget` — same entity, period, and version.
3. `query_prior_period` — prior **year** same period for YoY movement.

### 2. Normalize for analysis

Apply **SOUL.md sign convention** before comparing:

- **Revenue / income:** store **management view** amounts as **positive**.
- **Expenses / COGS:** keep as **positive** debits for magnitude comparison.

Document normalization in the workpaper if raw extracts were signed.

### 3. Compute variances

Invoke `compute_variances` with:

- Parallel **actuals** and **budget** arrays (aligned keys),
- `threshold_pct` and `threshold_amount` consistent with **RULES.md** (commentary vs detail),
- Outputs should include **budget vs actual** $ and %, and optional **YoY** fields when prior-period actuals are joined.

**Formulas (management-normalized):**

- **Expense:** `variance_dollar = budget − actual` → positive **favorable**.
- **Revenue:** `variance_dollar = |actual| − |budget|` (on normalized positives) → positive **favorable**.

### 4. Apply commentary thresholds

| Condition | Action |
|-----------|--------|
| > 5% **or** > AUD 50K | **Comment** — at least short narrative + source tag |
| > 10% **or** > AUD 100K | **Detailed analysis** — drivers, data/memory citations, cross-line links if evidenced |
| Below both 5% and AUD 50K | **One line** unless trend break |

Flag `material_for_commentary` and `material_for_detail` on each variance record for **preOutput** validation.

### 5. Investigate material lines

For each flagged line:

1. Search **MEMORY.md** for known drivers (contract, headcount, advisory, FIFO programs).
2. Inspect tool drill-down fields (project, memo, cost centre) **as facts**.
3. If neither applies, use **`[source:investigation]`** and plain-language **“requires investigation”** wording.

**Never** fill gaps with industry clichés or assumed project outcomes.

### 6. Generate commentary

Call `generate_commentary` with:

- `variances` — enriched records (favorable/unfavorable labels, thresholds, YoY),
- `memory_context` — relevant excerpts you actually used,
- `format` — e.g. `management_markdown_v1`.

**Document structure (recommended):**

1. **Executive summary** — 5–8 bullets; quantified; no orphan numbers.
2. **Summary table** — revenue, COGS, gross margin, OpEx, operating profit — budget, actual, variance $, variance %.
3. **Material variances** — grouped by theme where possible.
4. **Appendix** — optional bridge tables or account-level detail.

### 7. Attribution tags (required)

Every substantive explanation must include an inline tag:

- `[source:memory — YYYY-MM-DD — brief pointer]`
- `[source:data — field: value]`
- `[source:calculation — formula with inputs]`
- `[source:investigation — no supporting context found]`

These tags satisfy **RULES.md** and **`hooks/preOutput.js`**.

### 8. Memory update

After commentary:

- Append **new** supported drivers to `memory/MEMORY.md`.
- Classify **structural** vs **one-off**.
- Add rows to **Open Items / Investigation Queue** for unresolved questions.

---

## Quality checklist (self-audit before commit)

- [ ] Revenue shown **positive** everywhere in management text.
- [ ] Every **material** variance has narrative **and** a **source** tag.
- [ ] No **speculation** framed as fact.
- [ ] **Favorable / unfavorable** language matches sign rules for revenue vs expense.
- [ ] **YoY** and **budget** narratives are distinguished (timing vs plan).

---

## Failure modes to avoid

- Treating raw GL **credit** balances as “lower revenue” without normalization.
- Blaming “market conditions” without a cited internal memo or external index **from approved data feeds** (generally: **do not** — use investigation instead).
- Omitting small lines that are **trend breaks** (RULES.md #8).
