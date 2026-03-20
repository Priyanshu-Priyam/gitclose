# Pain Points: Quantified

## Where Close Time Actually Goes

| Activity | % of Close | Nature | AI Leverage |
|---|---|---|---|
| Data gathering & assembly | 25–30% | Pull, format, normalize from multiple systems | High — automatable |
| Reconciliation & matching | 20–25% | Compare, match, investigate exceptions | Very High — rule-based with edge cases |
| Documentation & memo prep | 15–20% | Write findings, evidence, templates | **Eliminated** in git-native architecture |
| Review & approval cycles | 10–15% | Waiting for / performing reviews | Reduced — PRs are faster than email |
| Communication & follow-up | 10–15% | Chase responses, escalate, coordinate | Reduced — structured escalation |
| **Analysis & judgment** | **10–15%** | **Actual thinking** | Human — augmented by LLMs |

## The Compliance Overhead

Documentation (15-20%) plus Review (10-15%) equals **25-35% of close time**
spent on proving the work was done correctly — not on improving accuracy or
generating insight.

This overhead scales linearly with work volume in traditional architectures.
More entities → more reconciliations → more memos → more reviews → more
audit file management.

## Five Specific Pain Points

### 1. The Telstra Problem (Institutional Memory Loss)

When James encounters the mystery Telstra credit, he doesn't remember October.
He searches email for 30 minutes. If James had left the company, the new
accountant would have investigated from scratch — probably 2 hours of work
for a known, recurring item.

**Frequency:** Every close has 3-5 "I've seen this before but can't remember
the details" exceptions.
**Cost:** 2-4 hours per close per accountant.
**Root cause:** Knowledge lives in people's heads, not in systems.

### 2. The v3-FINAL-FINAL Problem (Version Chaos)

James's shared drive has:
Bank Recon - Westpac Operating - Jan 2025 v3 FINAL.xlsx Bank Recon - Westpac Operating - Jan 2025 v3 FINAL (2).xlsx

Which one did Sarah approve? Which one has the Telstra correction? Nobody knows
without opening both files and comparing.

**Frequency:** Every close.
**Cost:** 1-2 hours per close (finding and verifying correct versions).
**Root cause:** Shared drives have no version control.

### 3. The Email Approval Problem (Evidence Scatter)

Sarah's approval of the bank reconciliation is an email that says "Approved.
Please post JEs." This email exists in Sarah's Sent folder and James's inbox.
When Deloitte asks for approval evidence, someone must find this email, export
it as .msg, and save it to the audit folder.

**Frequency:** 3-5 approvals per close.
**Cost:** 30-60 minutes per close; 4-8 hours per quarter during audit.
**Root cause:** The approval mechanism (email) is separate from the work (Excel).

### 4. The 47-Invoice Problem (Manual Investigation)

Nova finds the Arup cutoff error in 27 seconds by systematically comparing
every AP invoice to its GL posting. James does the same thing in 90 minutes
because he's scanning a pivot table of 47 invoices, checking dates, and
cross-referencing to the GL manually.

**Frequency:** Sub-ledger reconciliations typically have 1-3 discrepancies per
close, each requiring investigation.
**Cost:** 1-3 hours per discrepancy.
**Root cause:** Investigation is sequential and manual.

### 5. The "Why Did Revenue Drop?" Problem (Commentary Burden)

Echo generates variance commentary in 75 seconds because it has access to
budget, actuals, prior period, and accumulated memory about contract changes,
one-off items, and structural decisions. James takes 6+ hours because he must
email project managers, wait for responses, and manually synthesize their
explanations into a coherent narrative.

**Frequency:** Every close.
**Cost:** 6-10 hours per close.
**Root cause:** The context needed to explain variances lives in different
people's heads. No system aggregates it.
