# Current State: How Financial Close Works Today

## The Three Functions

Every CFO office performs exactly three functions:

| Function | What It Does | % of Labor | Value Created |
|---|---|---|---|
| **Record** | Capture economic events as structured entries | ~30% | Foundation — necessary but largely automated by ERP |
| **Verify** | Ensure records match reality across systems | ~50% | Defensive — prevents errors, satisfies regulators |
| **Interpret** | Transform verified data into decisions | ~20% | Offensive — drives strategy and capital allocation |

The misallocation is obvious: the highest-value activity gets the least time.

## The Monthly Close — What Actually Happens

The monthly close is a 5-15 day process that occurs after every month-end.
Its purpose is to produce a set of financial statements that management,
regulators, and auditors can rely on.

### A Day in James Wong's Life

James is a Senior Accountant at Meridian Engineering. He's competent,
experienced, and thoroughly exhausted during close. Here's his January close:

**Day 1:**
- Downloads bank statement from Westpac Business Online (CSV)
- Exports GL transactions from NetSuite (CSV)
- Opens last month's reconciliation Excel template, saves as new file
- Reformats date columns (Westpac: DD/MM/YYYY, NetSuite: MM/DD/YYYY)
- VLOOKUPs to match bank transactions to GL entries
- Investigates unmatched items — three are routine (bank fee, interest,
  insurance), two are outstanding checks, one is a mystery credit from Telstra
- Emails the Telstra account manager (waits for response)
- Writes reconciliation memo in Word
- Emails everything to Sarah (Controller) for review
- Repeats for the payroll bank account
- Starts AP sub-ledger reconciliation
- Finds a $5,200 discrepancy — traces through 47 invoices (90 minutes)
- Finds a posting date error — emails AP team to fix it

**Day 2:**
- Telstra account manager hasn't responded
- Sarah has two comments on the bank recon — fixes, re-saves, re-emails
- AP team fixes the posting date — re-exports, re-checks
- Starts variance analysis — exports budget vs. actual
- Emails project managers: "Why was revenue below budget?" (waits)
- Writes commentary for variances he can explain
- Leaves gaps for items awaiting response

**Day 3:**
- Telstra responds: "It's a refund, same as October"
- James searches his email for the October thread (30 minutes)
- Completes the bank recon
- Project managers respond with explanations
- Completes variance commentary
- Sarah reviews and approves
- Priya (FP&A) has edits — revises, re-sends
- Saves all files to shared drive in correct folder structure
- Updates the close checklist spreadsheet

**Total: 18 hours of James's time. 3 days elapsed. ~15 hours was mechanical.**

## The Tools James Uses

| Tool | Purpose | Limitation |
|---|---|---|
| NetSuite | GL, AP, AR data | Good at recording; no verification capability |
| Excel | Reconciliation, matching, analysis | No audit trail, no version control, error-prone |
| Word | Memos, commentary | Separate from the work — documentation is overhead |
| Email | Review, approval, communication | No structure, no tracking, evidence is in inboxes |
| Shared Drive | File storage for audit | Folder chaos, no version control, no provenance |

## The Multi-System Reality

No company runs on one system. Meridian Engineering has:
- NetSuite (ERP — GL, AP, AR)
- Westpac Business Online (banking)
- Workday (payroll)
- Salesforce (CRM / revenue pipeline)
- Confluence (documentation)
- Email (communication and approvals)
- Shared Drive (audit file storage)

Every month, James extracts data from 3-4 of these, reformats it into Excel,
and cross-references it manually. The reconciliation work exists because
*the systems don't agree with each other*, and the work of making them agree
falls to humans.
