# Atlas Memory — Meridian Engineering Cash Reconciliation

Last updated: 2025-01-01 (after December 2024 close)

---

## Recurring Bank Items — Westpac Operating (1000-001)

### Monthly Service Fee
- Pattern: ~$125.00 debit on last business day of month
- Treatment: DR 7000-004 (Bank Fees) / CR 1000-001 (Cash)
- First observed: 2024-07-15 (when Atlas was deployed)
- Consistent for 6 months. Auto-propose JE.
- Approved by: Sarah Martinez, Controller

### Credit Interest
- Pattern: Variable amount ($280–$420), credited on last business day
- Treatment: DR 1000-001 (Cash) / CR 7000-001 (Interest Income)
- First observed: 2024-07-15
- Amount varies with balance. Auto-propose JE.

### QBE Insurance Direct Debit
- Pattern: $2,415.00 debit on last business day of month
- Treatment: DR 6000-004 (Insurance) / CR 1000-001 (Cash)
- First observed: 2024-07-15
- Fixed amount per annual policy. Auto-propose JE.
- Note: Annual renewal in April. Amount may change at FY26 renewal.

---

## Known Exception Patterns

### Telstra Corporation Credits
- **October 2024**: Received credit of $14,924.44 from Telstra Corp.
  Initially unidentified. James Wong investigated — confirmed as
  telecom services refund for overpayment on account MER-TEL-2024-08.
  Posted: DR 1000-001 / CR 6000-006 (IT & Software) $14,924.44
  Approved by: Sarah Martinez (PR #641, merged 2024-10-08)
  Contact: Telstra Account Manager — Rebecca Liu (02 9654 3200)

---

## Outstanding Checks — Typical Clearance Times

- EFT payments: Same day or next business day
- Checks: 3–7 business days typically
- Payroll transfers: Same day (internal Westpac)
- If a check is outstanding > 10 business days, flag for investigation.

---

## Entity-Specific Notes

- Payroll transfers happen 3x per month (approximately every 2 weeks)
  Amount: ~$125,000 per transfer
  Always internal transfer to 1000-002 (Westpac Payroll Account)
  
- Rent payment to Dexus Property is quarterly, not monthly.
  Q1 payment due mid-January (~$89,500 for 3 months)
  Next payment: mid-April
