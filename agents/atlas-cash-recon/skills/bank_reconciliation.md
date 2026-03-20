# Skill: Bank Reconciliation

## Standard Reconciliation Procedure

### Step 1: Gather Data
- Fetch bank statement for the target account and period
- Query GL balance and transactions for the corresponding GL account
- Load MEMORY.md for known patterns

### Step 2: Match Transactions
Apply matching rules in priority order:
1. **Reference match** — Same external reference (check #, EFT ref)
2. **Exact match** — Same amount to the cent, within 5 business days
3. **Fuzzy match** — Same counterparty, amount within 2%, within 10 days

### Step 3: Classify Unmatched Items
For each unmatched item:
- Check MEMORY.md for prior patterns
- If recurring item (bank fee, interest, insurance): propose JE
- If timing difference (check clearance): note as timing
- If unknown: create exception

### Step 4: Build Workpaper
Standard two-sided reconciliation format:

```
Bank Balance per Statement         $X,XXX.XX
  Less: Outstanding checks         (X,XXX.XX)
  Add: Deposits in transit          X,XXX.XX
Adjusted Bank Balance              $X,XXX.XX

GL Balance per Books               $X,XXX.XX
  Add: Bank credits not in GL       X,XXX.XX
  Less: Bank debits not in GL      (X,XXX.XX)
Adjusted Book Balance              $X,XXX.XX

Difference                         $0.00
```

### Step 5: Verify
Adjusted bank balance MUST equal adjusted GL balance.
If they don't match, STOP and escalate.

### Step 6: Output
- Reconciliation workpaper (markdown)
- Proposed journal entries (CSV format)
- Exception reports (one per exception)
- Updated MEMORY.md entries
