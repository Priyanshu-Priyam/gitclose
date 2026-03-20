# The Problem

## The CFO Office Has a Structural Problem

Every mid-market company — $20M to $500M in revenue — runs a monthly financial close. The process looks roughly the same everywhere: a team of accountants spends 5–10 business days at the end of each month reconciling accounts, investigating exceptions, reviewing variances, and documenting what they did for auditors.

The work itself isn't complicated. Most of it is mechanical — matching transactions, checking totals, writing commentary that says "revenue was up 12% because of the BHP contract." An experienced accountant can do most of it on autopilot.

What can't be automated is the compliance overhead. Not the work. The *proof* that the work was done correctly.

**25–35% of every monthly close is not financial work. It's evidence production.**

Writing memos documenting what was reconciled and how. Chasing email approvals because "Sarah needs to sign off on this before we book it." Filing screenshots for auditors who will ask, three months from now, "how do we know this number was checked?" Every action that happens in a spreadsheet or an inbox is invisible to the control framework — so it has to be re-documented in a separate layer.

This is the structural problem. Not that the work is hard. That the *proof* the work was done is generated manually, after the fact, as a separate activity from the work itself.

---

## Why Existing Tools Don't Fix It

Every tool that has tried to solve the close problem has made this overhead worse, not better.

**RPA and scripts** automate individual steps but produce no audit evidence. Now you have to document what the script did and prove it ran correctly.

**AI copilots / "chat with your data" tools** let accountants ask questions about their numbers. But the accountant still has to do the reconciliation, write the commentary, and produce the workpaper. The AI is advisory. The human is still the worker.

**ERP close modules** (Oracle, SAP) enforce workflows and produce some audit trail, but they don't perform the analytical work — they just route the manual work through a system. They're also expensive, rigid, and designed for enterprises 10x the size of the target market.

**The pattern across all of them:** automate the execution, add compliance overhead for the automation itself. The total burden goes up.

---

## The Root Cause

The root cause is simple: the tools that *do* the work (Excel, email, scripts) are invisible to the tools that *prove* the work (audit systems, compliance frameworks). They're separate layers, which means someone has to manually bridge them every single month.

There's a deeper structural reason this gap exists. Financial controls are built around human actions. Maker-checker assumes a human maker and a human checker. Audit trails are designed to capture what a human did. The moment you introduce automation, you've added a non-human actor that the control framework wasn't designed for — and you have to retrofit evidence around it.

This isn't solvable by adding more automation on top of the existing structure. The structure itself is the problem.

---

## What a Real Solution Requires

The requirements, stated plainly:

1. **The work and the evidence must be the same thing.** Not work first, documentation later. The act of doing the work must inherently produce the proof it was done correctly, with zero additional effort.

2. **Controls must be structural, not procedural.** Maker-checker shouldn't be enforced by a policy document. It should be enforced by the architecture — impossible to bypass, not just inadvisable to skip.

3. **The system must remember.** The same Telstra credit that appeared in October and took 24 hours to investigate should take 3 seconds the next time it appears. Institutional knowledge shouldn't walk out the door when an accountant leaves.

4. **The audit trail must be inherent.** Not exported, not generated, not filed. The audit trail should be an unavoidable byproduct of doing the work — complete, immutable, attributable.

---

## Why This Moment

Two things are true simultaneously that haven't been true before:

First, LLMs are now good enough at structured reasoning tasks — matching transactions, detecting anomalies, writing attributed explanations — to perform the mechanical work of a close without hallucinating numbers or fabricating evidence.

Second, git is now ubiquitous and its properties are well-understood: immutable history, attributable commits, reviewable diffs, branching, tagging. What's not obvious is that these properties are exactly what financial controls require.

Put these two things together: AI agents performing close work inside a version-controlled repository. The execution medium produces the audit evidence automatically. The review workflow enforces maker-checker by construction. The control framework isn't implemented on top of the system — it *is* the system.

That's what GitClose is.

---

## The Concrete Pain (James's World)

To make this tangible: here is what the January 2025 close looks like for James Wong, Senior Accountant at a fictional $50M engineering firm.

James opens his shared drive to find:
```
Bank Reconciliation/
  Westpac Operating Recon Jan 2025 v1.xlsx
  Westpac Operating Recon Jan 2025 v2 REVISED.xlsx
  Westpac Operating Recon Jan 2025 v3 FINAL.xlsx
  Westpac Operating Recon Jan 2025 v3 FINAL (2).xlsx   ← why does this exist
```

Halfway through the reconciliation, he finds an unidentified $14,924.44 credit from Telstra Corporation. He doesn't know what it is. He emails Sarah (the Controller). Sarah doesn't know. She emails the Telstra account manager. The account manager responds the next day. Total elapsed time: 26 hours. The actual answer — a telecom refund for an overpayment from August — takes 2 minutes to verify once they have the right person on the phone.

Next month, the same credit appears. James doesn't remember the October resolution. The whole 26-hour cycle repeats.

GitClose eliminates this loop. Atlas reconciles the same 23 transactions in 2 minutes. When it finds the Telstra credit, it searches its memory, finds the October pattern, and proposes the same resolution — citing the exact PR number where it was approved. The exception is flagged, attributed, and escalated to Sarah for 5-minute approval. Not 26 hours.

Every action Atlas took is a git commit. The PR merge is the approval record. The git history is the complete audit trail. No separate documentation. No filing evidence after the fact. No risk that someone will ask in three months "how do we know this was reviewed?" and the answer will be "I think we sent an email."

The work was the evidence. The evidence was the work.
