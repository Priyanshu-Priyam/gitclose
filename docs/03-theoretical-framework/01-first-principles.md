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
