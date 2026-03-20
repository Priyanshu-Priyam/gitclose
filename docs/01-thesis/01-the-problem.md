# The Problem: Why Financial Close Is Broken

## The Simplest Version

Companies must close their books every month. This process — gathering data,
reconciling accounts, investigating exceptions, writing commentary, getting
approvals, filing reports — takes 5 to 15 business days. The people doing it
spend roughly 85% of that time on mechanical work (pulling data, matching
numbers, formatting spreadsheets, writing memos, chasing approvals) and 15%
on actual thinking.

This ratio hasn't changed meaningfully in 20 years despite billions of dollars
invested in ERP systems, close management tools, and business intelligence
platforms.

## Why Existing Tools Haven't Solved It

The CFO office has technology. The problem isn't a lack of tools. It's that
the tools address the wrong layer.

### ERP Systems (SAP, Oracle, NetSuite)

ERPs automate *recording*. They capture transactions, maintain the general
ledger, and produce trial balances. They're excellent at this. But recording
is already the most automated layer (~30% of labor). ERPs don't help with
verification or interpretation, which consume the remaining ~70%.

### Close Management Tools (BlackLine, FloQast)

These tools automate *orchestration* — task assignment, status tracking,
checklist management, deadline monitoring. They answer "where are we in the
close?" but not "is the reconciliation correct?" They're project management
tools for accountants, not intelligence tools.

### Business Intelligence (Tableau, Power BI)

BI tools automate *visualization*. They can show you a variance chart in
seconds. But they can't tell you *why* revenue dropped 5.6% this month,
and they can't prepare the narrative memo the CFO needs for the board.

### What's Missing

None of these tools address the core problem: **the work and the proof that
the work was done correctly are separate activities.**

When James Wong reconciles a bank account, he does the reconciliation in Excel
(the work), then writes a memo in Word describing what he did (the documentation),
then saves both files plus a screenshot of Sarah's approval email to the audit
folder (the evidence). The documentation and evidence often take longer than
the reconciliation itself.

Every automation tool that speeds up the work *adds* to the documentation burden
("now document what the automation did"), creating a paradox: the more you
automate, the more compliance overhead you generate.

## The Three Laws

Three structural properties make this problem persistent:

**1. Conservation of Information.** Every economic event must be captured and
balanced. Double-entry bookkeeping is the enforcement mechanism. This creates
massive recording overhead that scales linearly with business activity.

**2. Entropy of Financial Data.** Systems drift apart over time. If you have
two systems that should agree (bank statement and GL), they *will* diverge
due to timing, classification, rounding, and complexity. Reconciliation is not
a one-time fix — it's a permanent, monthly activity.

**3. Latency of Insight.** A gap always exists between an event occurring and
the organization understanding its implications. The monthly close exists to
collapse this gap, but the mechanical work required to achieve collapse consumes
nearly all available time.

These laws hold everywhere. They are not best practices to be optimized. They
are structural constraints, like gravity for financial operations.
