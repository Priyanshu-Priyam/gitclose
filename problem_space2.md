

Review Findings:

Reconciliation Math Error in Bank Statement INSERT: The bank_statements INSERT uses opening balance 3,847,291.12 and closing balance 4,324,416.56. The thinking process correctly recalculated these to 2,830,241.56 (opening) and 4,306,216.44 (closing), but the corrected values were never propagated into the actual SQL in the document. The inline comments ("Bank Statement Closing Balance: $4,324,416.56 / GL Closing Balance: $4,287,341.56 / DIFFERENCE: $37,075.00") are all wrong.

GL Opening Balance Inconsistency: The early verification comment says Opening 3,847,291.12 + sum = 440,050.44 but the actual GL transaction sum is +1,457,100.00, requiring an opening of 2,830,241.56. Part 4.3 correctly states the opening as $2,830,241.56, contradicting the earlier inline comment.

Missing AP Journal Entries: The GL transactions only cover cash-side entries (all hit account 1000-001). For the AP sub-ledger reconciliation to work, we also need the non-cash journal entries (DR Expense / CR 2000-001) representing invoice accruals. These are absent.

All core architectural design choices are sound: Schema is well-normalized, the platform tables correctly model the close-as-release-cycle concept, the chart of accounts is realistic for a mid-market infrastructure company, and the exception/memory narrative (Telstra credit reappearing from October) is a strong demo moment.

Stopping Point:

The document cuts off mid-sentence in Part 4, Section 4.3:

"22 journal entries affecting the cash account, creating 44 GL lines (each journal has a debit and a credit"

Parts 4.3 through 4.8 (all sample data), and Parts 5 through 11 (repository architecture, agent definitions, traditional vs. git-native workflow, demo script, UI specs, and implementation plan) are entirely unwritten.

Continuation:

side) for a net movement of +$1,457,100.00.

GL Account 1000-001 Movement Summary — January 2025

Opening Balance (Dec 31, 2024):                    $2,830,241.56
─────────────────────────────────────────────────────────────────
Inflows (client payments received):                +$2,206,000.00
  BHP Billiton          Jan 02    +287,500.00
  Rio Tinto             Jan 07    +445,000.00
  Transurban            Jan 10    +182,000.00
  NSW Government        Jan 15    +520,000.00
  Fortescue Metals      Jan 20    +315,000.00
  Woodside Energy       Jan 23    +198,000.00
  Origin Energy         Jan 29    +168,500.00
  Santos Ltd            Jan 31     +75,000.00
  BHP (progress)        Jan 31     +15,000.00

Outflows (payments made):                           -$748,900.00
  Payroll transfers (×3)           -375,000.00
  Aurecon (CHK-4891)    Jan 06     -18,200.00
  WSP Global (EFT-8801) Jan 08     -42,500.00
  Lendlease (EFT-8802)  Jan 09     -67,800.00
  Arup Group (EFT-8810) Jan 14     -35,400.00
  Rent/Dexus (EFT-8815) Jan 16     -89,500.00
  Jacobs (EFT-8820)     Jan 21     -28,750.00
  IT/Atlassian (EFT-8822)Jan 22    -15,600.00
  GHD Group (EFT-8830)  Jan 28     -55,000.00
  Cisco (CHK-4895)      Jan 30     -12,400.00
  KPMG (CHK-4898)       Jan 30      -8,750.00
─────────────────────────────────────────────────────────────────
Closing Balance (Jan 31, 2025):                    $4,287,341.56
-- ═══════════════════════════════════════════════════════════════
-- GL TRANSACTIONS — Account 1000-001 (Westpac Operating)
-- January 2025 — All 22 journal entries (44 GL lines)
-- Opening: $2,830,241.56 → Closing: $4,287,341.56
-- ═══════════════════════════════════════════════════════════════

-- WEEK 1 (Jan 2-3)
INSERT INTO gl_transactions
  (journal_id, entity_id, account_id, posting_date, amount,
   description, source, reference, created_by, period) VALUES
('JE-2025-0001','MER-AU-ENG','1000-001','2025-01-02',-125000.00,
 'Payroll transfer to payroll account','PAYROLL','PAY-2025-01A','system','2025-01'),
('JE-2025-0001','MER-AU-ENG','1000-002','2025-01-02',125000.00,
 'Payroll transfer from operating','PAYROLL','PAY-2025-01A','system','2025-01'),

('JE-2025-0003','MER-AU-ENG','1000-001','2025-01-02',287500.00,
 'Client payment - BHP Billiton - Inv 4401','AR','REC-5501','system','2025-01'),
('JE-2025-0003','MER-AU-ENG','1100-001','2025-01-02',-287500.00,
 'Client payment - BHP Billiton - Inv 4401','AR','REC-5501','system','2025-01'),

-- WEEK 2 (Jan 6-10)
('JE-2025-0012','MER-AU-ENG','1000-001','2025-01-06',-18200.00,
 'Payment to Aurecon Engineering - Inv AE-8834','AP','CHK-4891','system','2025-01'),
('JE-2025-0012','MER-AU-ENG','2000-001','2025-01-06',18200.00,
 'Payment to Aurecon Engineering - Inv AE-8834','AP','CHK-4891','system','2025-01'),

('JE-2025-0015','MER-AU-ENG','1000-001','2025-01-07',445000.00,
 'Client payment - Rio Tinto - Inv 4389','AR','REC-5510','system','2025-01'),
('JE-2025-0015','MER-AU-ENG','1100-001','2025-01-07',-445000.00,
 'Client payment - Rio Tinto - Inv 4389','AR','REC-5510','system','2025-01'),

('JE-2025-0018','MER-AU-ENG','1000-001','2025-01-08',-42500.00,
 'Payment to WSP Global - Inv WSP-22104','AP','EFT-8801','system','2025-01'),
('JE-2025-0018','MER-AU-ENG','2000-001','2025-01-08',42500.00,
 'Payment to WSP Global - Inv WSP-22104','AP','EFT-8801','system','2025-01'),

('JE-2025-0021','MER-AU-ENG','1000-001','2025-01-09',-67800.00,
 'Payment to Lendlease Sub - Inv LL-9021','AP','EFT-8802','system','2025-01'),
('JE-2025-0021','MER-AU-ENG','2000-001','2025-01-09',67800.00,
 'Payment to Lendlease Sub - Inv LL-9021','AP','EFT-8802','system','2025-01'),

('JE-2025-0024','MER-AU-ENG','1000-001','2025-01-10',182000.00,
 'Client payment - Transurban - Inv 4395','AR','REC-5515','system','2025-01'),
('JE-2025-0024','MER-AU-ENG','1100-001','2025-01-10',-182000.00,
 'Client payment - Transurban - Inv 4395','AR','REC-5515','system','2025-01'),

-- WEEK 3 (Jan 13-17)
('JE-2025-0030','MER-AU-ENG','1000-001','2025-01-13',-125000.00,
 'Payroll transfer to payroll account','PAYROLL','PAY-2025-01B','system','2025-01'),
('JE-2025-0030','MER-AU-ENG','1000-002','2025-01-13',125000.00,
 'Payroll transfer from operating','PAYROLL','PAY-2025-01B','system','2025-01'),

('JE-2025-0033','MER-AU-ENG','1000-001','2025-01-14',-35400.00,
 'Payment to Arup Group - Inv ARUP-7712','AP','EFT-8810','system','2025-01'),
('JE-2025-0033','MER-AU-ENG','2000-001','2025-01-14',35400.00,
 'Payment to Arup Group - Inv ARUP-7712','AP','EFT-8810','system','2025-01'),

('JE-2025-0036','MER-AU-ENG','1000-001','2025-01-15',520000.00,
 'Client payment - NSW Govt - Inv 4402','AR','REC-5520','system','2025-01'),
('JE-2025-0036','MER-AU-ENG','1100-001','2025-01-15',-520000.00,
 'Client payment - NSW Govt - Inv 4402','AR','REC-5520','system','2025-01'),

('JE-2025-0039','MER-AU-ENG','1000-001','2025-01-16',-89500.00,
 'Rent & outgoings - Q1 2025','AP','EFT-8815','system','2025-01'),
('JE-2025-0039','MER-AU-ENG','6000-002','2025-01-16',89500.00,
 'Rent & outgoings - Q1 2025','AP','EFT-8815','system','2025-01'),

-- WEEK 4 (Jan 20-24)
('JE-2025-0045','MER-AU-ENG','1000-001','2025-01-20',315000.00,
 'Client payment - Fortescue - Inv 4410','AR','REC-5525','system','2025-01'),
('JE-2025-0045','MER-AU-ENG','1100-001','2025-01-20',-315000.00,
 'Client payment - Fortescue - Inv 4410','AR','REC-5525','system','2025-01'),

('JE-2025-0048','MER-AU-ENG','1000-001','2025-01-21',-28750.00,
 'Payment to Jacobs Engineering - Inv JE-1104','AP','EFT-8820','system','2025-01'),
('JE-2025-0048','MER-AU-ENG','2000-001','2025-01-21',28750.00,
 'Payment to Jacobs Engineering - Inv JE-1104','AP','EFT-8820','system','2025-01'),

('JE-2025-0051','MER-AU-ENG','1000-001','2025-01-22',-15600.00,
 'IT software licenses - annual renewal','AP','EFT-8822','system','2025-01'),
('JE-2025-0051','MER-AU-ENG','6000-006','2025-01-22',15600.00,
 'IT software licenses - annual renewal','AP','EFT-8822','system','2025-01'),

('JE-2025-0054','MER-AU-ENG','1000-001','2025-01-23',198000.00,
 'Client payment - Woodside Energy - Inv 4398','AR','REC-5530','system','2025-01'),
('JE-2025-0054','MER-AU-ENG','1100-001','2025-01-23',-198000.00,
 'Client payment - Woodside Energy - Inv 4398','AR','REC-5530','system','2025-01'),

-- WEEK 5 (Jan 27-31)
('JE-2025-0060','MER-AU-ENG','1000-001','2025-01-27',-125000.00,
 'Payroll transfer to payroll account','PAYROLL','PAY-2025-01C','system','2025-01'),
('JE-2025-0060','MER-AU-ENG','1000-002','2025-01-27',125000.00,
 'Payroll transfer from operating','PAYROLL','PAY-2025-01C','system','2025-01'),

('JE-2025-0063','MER-AU-ENG','1000-001','2025-01-28',-55000.00,
 'Payment to GHD Group - Inv GHD-3308','AP','EFT-8830','system','2025-01'),
('JE-2025-0063','MER-AU-ENG','2000-001','2025-01-28',55000.00,
 'Payment to GHD Group - Inv GHD-3308','AP','EFT-8830','system','2025-01'),

('JE-2025-0066','MER-AU-ENG','1000-001','2025-01-29',168500.00,
 'Client payment - Origin Energy - Inv 4415','AR','REC-5535','system','2025-01'),
('JE-2025-0066','MER-AU-ENG','1100-001','2025-01-29',-168500.00,
 'Client payment - Origin Energy - Inv 4415','AR','REC-5535','system','2025-01'),

('JE-2025-0069','MER-AU-ENG','1000-001','2025-01-30',-12400.00,
 'Payment to Cisco Systems - Inv CISCO-4421','AP','CHK-4895','system','2025-01'),
('JE-2025-0069','MER-AU-ENG','2000-001','2025-01-30',12400.00,
 'Payment to Cisco Systems - Inv CISCO-4421','AP','CHK-4895','system','2025-01'),

('JE-2025-0072','MER-AU-ENG','1000-001','2025-01-30',-8750.00,
 'Payment to KPMG Advisory - Inv KPMG-1192','AP','CHK-4898','system','2025-01'),
('JE-2025-0072','MER-AU-ENG','6000-005','2025-01-30',8750.00,
 'Payment to KPMG Advisory - Inv KPMG-1192','AP','CHK-4898','system','2025-01'),

('JE-2025-0075','MER-AU-ENG','1000-001','2025-01-31',75000.00,
 'Client payment - Santos Ltd - Inv 4420','AR','REC-5540','system','2025-01'),
('JE-2025-0075','MER-AU-ENG','1100-001','2025-01-31',-75000.00,
 'Client payment - Santos Ltd - Inv 4420','AR','REC-5540','system','2025-01'),

('JE-2025-0078','MER-AU-ENG','1000-001','2025-01-31',15000.00,
 'Client payment - BHP (progress) - Inv 4425','AR','REC-5542','system','2025-01'),
('JE-2025-0078','MER-AU-ENG','1100-001','2025-01-31',-15000.00,
 'Client payment - BHP (progress) - Inv 4425','AR','REC-5542','system','2025-01');
Verification: 2,830,241.56 + 2,206,000.00 − 748,900.00 = 4,287,341.56 ✓

4.4 Bank Statement & Transactions — Westpac Operating
INSERT INTO bank_statements VALUES
('BS-WBC-2025-01', 'Westpac', 'XXXX-XXXX-4721', '1000-001',
 'MER-AU-ENG', '2025-01-31',
 2830241.56,    -- opening (matches GL opening — Dec was clean)
 4306216.44,    -- closing
 'AUD', '2025-01-31 18:00:00');
23 bank transactions. 18 match GL entries. 4 are bank-only items (the reconciliation challenge). 1 is a timing match (Aurecon check).

INSERT INTO bank_transactions VALUES
-- ─── MATCHED ITEMS (appear in both GL and bank) ─────────────
('BT-001','BS-WBC-2025-01','2025-01-02','2025-01-02',-125000.00,
 'TRANSFER TO 4738 PAYROLL','TRF-20250102','TRANSFER',
 'MERIDIAN ENGINEERING',FALSE,NULL),
('BT-002','BS-WBC-2025-01','2025-01-02','2025-01-02',287500.00,
 'CREDIT TRANSFER BHP BILLITON LTD','CT-8890201','CREDIT_TRANSFER',
 'BHP BILLITON',FALSE,NULL),
('BT-003','BS-WBC-2025-01','2025-01-07','2025-01-07',445000.00,
 'CREDIT TRANSFER RIO TINTO LIMITED','CT-8890445','CREDIT_TRANSFER',
 'RIO TINTO',FALSE,NULL),
('BT-004','BS-WBC-2025-01','2025-01-08','2025-01-08',-42500.00,
 'EFT PAYMENT WSP GLOBAL','EFT-8801','EFT',
 'WSP GLOBAL',FALSE,NULL),
('BT-005','BS-WBC-2025-01','2025-01-09','2025-01-09',-67800.00,
 'EFT PAYMENT LENDLEASE BUILDING','EFT-8802','EFT',
 'LENDLEASE',FALSE,NULL),
('BT-006','BS-WBC-2025-01','2025-01-10','2025-01-10',182000.00,
 'CREDIT TRANSFER TRANSURBAN GROUP','CT-8890512','CREDIT_TRANSFER',
 'TRANSURBAN',FALSE,NULL),
('BT-007','BS-WBC-2025-01','2025-01-13','2025-01-13',-125000.00,
 'TRANSFER TO 4738 PAYROLL','TRF-20250113','TRANSFER',
 'MERIDIAN ENGINEERING',FALSE,NULL),
('BT-008','BS-WBC-2025-01','2025-01-14','2025-01-14',-35400.00,
 'EFT PAYMENT ARUP GROUP','EFT-8810','EFT',
 'ARUP',FALSE,NULL),
('BT-009','BS-WBC-2025-01','2025-01-15','2025-01-15',520000.00,
 'CREDIT TRANSFER NSW GOVERNMENT','CT-8890601','CREDIT_TRANSFER',
 'NSW GOVT',FALSE,NULL),
('BT-010','BS-WBC-2025-01','2025-01-16','2025-01-16',-89500.00,
 'EFT PAYMENT DEXUS PROPERTY','EFT-8815','EFT',
 'DEXUS PROPERTY',FALSE,NULL),
('BT-011','BS-WBC-2025-01','2025-01-20','2025-01-20',315000.00,
 'CREDIT TRANSFER FORTESCUE METALS','CT-8890680','CREDIT_TRANSFER',
 'FORTESCUE',FALSE,NULL),
('BT-012','BS-WBC-2025-01','2025-01-21','2025-01-21',-28750.00,
 'EFT PAYMENT JACOBS ENGINEERING','EFT-8820','EFT',
 'JACOBS',FALSE,NULL),
('BT-013','BS-WBC-2025-01','2025-01-22','2025-01-22',-15600.00,
 'EFT PAYMENT ATLASSIAN PTY LTD','EFT-8822','EFT',
 'ATLASSIAN',FALSE,NULL),
('BT-014','BS-WBC-2025-01','2025-01-23','2025-01-23',198000.00,
 'CREDIT TRANSFER WOODSIDE ENERGY','CT-8890710','CREDIT_TRANSFER',
 'WOODSIDE',FALSE,NULL),
('BT-015','BS-WBC-2025-01','2025-01-27','2025-01-27',-125000.00,
 'TRANSFER TO 4738 PAYROLL','TRF-20250127','TRANSFER',
 'MERIDIAN ENGINEERING',FALSE,NULL),
('BT-016','BS-WBC-2025-01','2025-01-28','2025-01-28',-55000.00,
 'EFT PAYMENT GHD GROUP PTY LTD','EFT-8830','EFT',
 'GHD GROUP',FALSE,NULL),
('BT-017','BS-WBC-2025-01','2025-01-29','2025-01-29',168500.00,
 'CREDIT TRANSFER ORIGIN ENERGY','CT-8890788','CREDIT_TRANSFER',
 'ORIGIN ENERGY',FALSE,NULL),
('BT-018','BS-WBC-2025-01','2025-01-31','2025-01-31',75000.00,
 'CREDIT TRANSFER SANTOS LIMITED','CT-8890800','CREDIT_TRANSFER',
 'SANTOS',FALSE,NULL),

-- ─── TIMING MATCH (same item, different dates) ──────────────
-- GL recorded Jan 6 (check issued), Bank cleared Jan 9
('BT-023','BS-WBC-2025-01','2025-01-09','2025-01-09',-18200.00,
 'CHECK 4891 AURECON ENGINEERING','CHK-4891','CHECK',
 'AURECON',FALSE,NULL),

-- ─── BANK-ONLY ITEMS (not in GL — agent must detect) ────────

-- Monthly service fee — known recurring pattern
('BT-019','BS-WBC-2025-01','2025-01-31','2025-01-31',-125.00,
 'MONTHLY SERVICE FEE','FEE-202501','FEE',
 'WESTPAC',FALSE,NULL),

-- Interest earned — known recurring pattern
('BT-020','BS-WBC-2025-01','2025-01-31','2025-01-31',340.44,
 'CREDIT INTEREST','INT-202501','INTEREST',
 'WESTPAC',FALSE,NULL),

-- QBE insurance direct debit — known recurring pattern
('BT-021','BS-WBC-2025-01','2025-01-31','2025-01-31',-2415.00,
 'DIRECT DEBIT QBE INSURANCE','DD-QBE-202501','DIRECT_DEBIT',
 'QBE INSURANCE',FALSE,NULL),

-- ★ THE EXCEPTION: Unidentified credit from Telstra
-- This is the item that demonstrates agent memory
('BT-022','BS-WBC-2025-01','2025-01-28','2025-01-28',14924.44,
 'CREDIT TRANSFER TELSTRA CORP','CT-UNK-8890','CREDIT_TRANSFER',
 'TELSTRA CORPORATION',FALSE,NULL);
Items in GL NOT on bank (outstanding at month-end):

GL Reference	Amount	Nature
CHK-4895 (Cisco, issued Jan 30)	−$12,400.00	Outstanding check
CHK-4898 (KPMG, issued Jan 30)	−$8,750.00	Outstanding check
REC-5542 (BHP progress, recorded Jan 31)	+$15,000.00	Deposit in transit
4.5 The Reconciliation Proof
This is the output Atlas must produce. Both sides adjust to the same figure.

═══════════════════════════════════════════════════════════════════
  BANK RECONCILIATION — 1000-001 Westpac Operating
  Entity: Meridian Engineering Pty Ltd
  Period: January 2025
  Prepared by: Atlas (AI Agent) | Run ID: RUN-2025-0201-ATLAS
═══════════════════════════════════════════════════════════════════

  BANK SIDE
  ─────────────────────────────────────────────────────────────
  Bank Statement Balance (per Westpac)        $4,306,216.44

  Less: Outstanding Checks
    CHK-4895  Cisco Systems (issued 30-Jan)     (12,400.00)
    CHK-4898  KPMG Advisory (issued 30-Jan)      (8,750.00)
                                              ─────────────
                                                (21,150.00)

  Add: Deposits in Transit
    REC-5542  BHP progress (recorded 31-Jan)     15,000.00
                                              ─────────────
                                                 15,000.00

  ADJUSTED BANK BALANCE                       $4,300,066.44
                                              ═════════════

  GL SIDE
  ─────────────────────────────────────────────────────────────
  GL Balance (per NetSuite)                   $4,287,341.56

  Add: Items on bank statement, not yet in GL
    BT-020  Interest earned (Jan)                    340.44
    BT-022  Telstra Corp credit ★ EXCEPTION       14,924.44

  Less: Items on bank statement, not yet in GL
    BT-019  Monthly service fee                     (125.00)
    BT-021  QBE Insurance direct debit            (2,415.00)

  ADJUSTED GL BALANCE                         $4,300,066.44
                                              ═════════════

  RECONCILING DIFFERENCE                              $0.00 ✓
  ─────────────────────────────────────────────────────────────

  PROPOSED JOURNAL ENTRIES (for items agent can categorize):
  ┌──────────────┬────────────┬────────────┬────────────────────┐
  │ Proposed JE  │ Debit      │ Credit     │ Amount             │
  ├──────────────┼────────────┼────────────┼────────────────────┤
  │ JE-PROP-001  │ 7000-004   │ 1000-001   │ $125.00            │
  │              │ Bank Fees  │ Cash       │ Monthly svc fee    │
  ├──────────────┼────────────┼────────────┼────────────────────┤
  │ JE-PROP-002  │ 1000-001   │ 7000-001   │ $340.44            │
  │              │ Cash       │ Int Income │ Interest earned    │
  ├──────────────┼────────────┼────────────┼────────────────────┤
  │ JE-PROP-003  │ 6000-004   │ 1000-001   │ $2,415.00          │
  │              │ Insurance  │ Cash       │ QBE direct debit   │
  └──────────────┴────────────┴────────────┴────────────────────┘

  EXCEPTIONS REQUIRING HUMAN INVESTIGATION:
  ┌────────────────────────────────────────────────────────────┐
  │ EXC-2025-001: Telstra Corp Credit — $14,924.44            │
  │                                                            │
  │ Bank ref: CT-UNK-8890 | Date: 2025-01-28                 │
  │ Counterparty: TELSTRA CORPORATION                          │
  │                                                            │
  │ ★ MEMORY MATCH: In October 2024, an identical credit      │
  │   ($14,924.44 from Telstra) was received and resolved     │
  │   as a telecom services refund. It was posted:            │
  │   DR 1000-001 (Cash) / CR 6000-006 (IT & Software)       │
  │   Approved by: Sarah Martinez, Controller (PR #641)       │
  │                                                            │
  │ RECOMMENDATION: Investigate with Telstra account manager. │
  │ If confirmed as recurring refund, post:                    │
  │   JE-PROP-004: DR 1000-001 / CR 6000-006  $14,924.44     │
  │                                                            │
  │ Status: ESCALATED TO HUMAN                                 │
  │ Assigned to: James Wong, Senior Accountant                 │
  └────────────────────────────────────────────────────────────┘
═══════════════════════════════════════════════════════════════════
Why this reconciliation is a powerful demo:

18 clean matches — shows the agent handles volume efficiently
1 timing match (Aurecon check) — shows the agent understands date differences
3 known recurring items — shows memory of bank fee/interest/insurance patterns
1 genuine exception — shows the agent doesn't just flag it, it provides a hypothesis from memory with a specific prior-period reference and a proposed resolution
The math balances perfectly — the agent is provably correct
4.6 AP Sub-Ledger Data
Nova (the AP reconciliation agent) reconciles the AP sub-ledger to GL account 2000-001 (Trade Payables).

GL Account 2000-001 — January 2025:

Opening Balance (credit):                        $750,000.00

Credits (new invoices entered):
  JE-2025-0080  Aurecon — Inv AE-9001            +48,200.00
  JE-2025-0082  WSP — Inv WSP-22180              +31,500.00
  JE-2025-0084  Lendlease — Inv LL-9045          +85,400.00
  JE-2025-0086  GHD — Inv GHD-3340               +42,000.00
  JE-2025-0088  Jacobs — Inv JE-1120             +19,800.00
  JE-2025-0090  Cisco — Inv CISCO-4455           +28,500.00
  JE-2025-0092  Arup — Inv ARUP-7780             +62,000.00
  Total new invoices:                           +317,400.00

Debits (payments applied — from cash transactions above):
  JE-2025-0012  Aurecon (CHK-4891)                -18,200.00
  JE-2025-0018  WSP (EFT-8801)                    -42,500.00
  JE-2025-0021  Lendlease (EFT-8802)              -67,800.00
  JE-2025-0033  Arup (EFT-8810)                   -35,400.00
  JE-2025-0048  Jacobs (EFT-8820)                 -28,750.00
  JE-2025-0063  GHD (EFT-8830)                    -55,000.00
  JE-2025-0069  Cisco (CHK-4895)                  -12,400.00
  Total payments:                               -260,050.00

Closing GL Balance (credit):                     $807,350.00
-- AP invoice accrual entries (non-cash, hit 2000-001 and expense accounts)
INSERT INTO gl_transactions
  (journal_id, entity_id, account_id, posting_date, amount,
   description, source, reference, created_by, period) VALUES
('JE-2025-0080','MER-AU-ENG','5000-002','2025-01-05',48200.00,
 'Aurecon Engineering - Inv AE-9001','AP','AE-9001','system','2025-01'),
('JE-2025-0080','MER-AU-ENG','2000-001','2025-01-05',-48200.00,
 'Aurecon Engineering - Inv AE-9001','AP','AE-9001','system','2025-01'),

('JE-2025-0082','MER-AU-ENG','5000-002','2025-01-08',31500.00,
 'WSP Global - Inv WSP-22180','AP','WSP-22180','system','2025-01'),
('JE-2025-0082','MER-AU-ENG','2000-001','2025-01-08',-31500.00,
 'WSP Global - Inv WSP-22180','AP','WSP-22180','system','2025-01'),

('JE-2025-0084','MER-AU-ENG','5000-002','2025-01-12',85400.00,
 'Lendlease - Inv LL-9045','AP','LL-9045','system','2025-01'),
('JE-2025-0084','MER-AU-ENG','2000-001','2025-01-12',-85400.00,
 'Lendlease - Inv LL-9045','AP','LL-9045','system','2025-01'),

('JE-2025-0086','MER-AU-ENG','5000-002','2025-01-18',42000.00,
 'GHD Group - Inv GHD-3340','AP','GHD-3340','system','2025-01'),
('JE-2025-0086','MER-AU-ENG','2000-001','2025-01-18',-42000.00,
 'GHD Group - Inv GHD-3340','AP','GHD-3340','system','2025-01'),

('JE-2025-0088','MER-AU-ENG','5000-002','2025-01-22',19800.00,
 'Jacobs Engineering - Inv JE-1120','AP','JE-1120','system','2025-01'),
('JE-2025-0088','MER-AU-ENG','2000-001','2025-01-22',-19800.00,
 'Jacobs Engineering - Inv JE-1120','AP','JE-1120','system','2025-01'),

('JE-2025-0090','MER-AU-ENG','6000-006','2025-01-25',28500.00,
 'Cisco Systems - Inv CISCO-4455','AP','CISCO-4455','system','2025-01'),
('JE-2025-0090','MER-AU-ENG','2000-001','2025-01-25',-28500.00,
 'Cisco Systems - Inv CISCO-4455','AP','CISCO-4455','system','2025-01'),

('JE-2025-0092','MER-AU-ENG','5000-002','2025-01-28',62000.00,
 'Arup Group - Inv ARUP-7780','AP','ARUP-7780','system','2025-01'),
('JE-2025-0092','MER-AU-ENG','2000-001','2025-01-28',-62000.00,
 'Arup Group - Inv ARUP-7780','AP','ARUP-7780','system','2025-01');
AP Sub-Ledger — Open Invoices at January 31:

INSERT INTO ap_invoices VALUES
-- Unpaid invoices carried from prior periods
('API-2024-0412','MER-AU-ENG','Lendlease','V-005','LL-8990',
 '2024-12-15','2025-01-15',124500.00,'AUD','5000-002','OPEN',
 NULL,'2024-12','Structural engineering - Westconnex Phase 3'),
('API-2024-0418','MER-AU-ENG','WSP Global','V-002','WSP-22150',
 '2024-12-20','2025-01-20',38750.00,'AUD','5000-002','OPEN',
 NULL,'2024-12','Environmental assessment - Hunter Valley'),

-- New invoices from January (posted to GL above)
('API-2025-0003','MER-AU-ENG','Aurecon Engineering','V-001','AE-9001',
 '2025-01-05','2025-02-05',48200.00,'AUD','5000-002','OPEN',
 NULL,'2025-01','Geotechnical survey - Pilbara'),
('API-2025-0008','MER-AU-ENG','WSP Global','V-002','WSP-22180',
 '2025-01-08','2025-02-08',31500.00,'AUD','5000-002','OPEN',
 NULL,'2025-01','Air quality modelling - Kwinana'),
('API-2025-0012','MER-AU-ENG','Lendlease','V-005','LL-9045',
 '2025-01-12','2025-02-12',85400.00,'AUD','5000-002','OPEN',
 NULL,'2025-01','Scaffolding & access - North Sydney metro'),
('API-2025-0018','MER-AU-ENG','GHD Group','V-006','GHD-3340',
 '2025-01-18','2025-02-18',42000.00,'AUD','5000-002','OPEN',
 NULL,'2025-01','Water treatment design review'),
('API-2025-0022','MER-AU-ENG','Jacobs Engineering','V-004','JE-1120',
 '2025-01-22','2025-02-22',19800.00,'AUD','5000-002','OPEN',
 NULL,'2025-01','Signal engineering - Melbourne Metro'),
('API-2025-0025','MER-AU-ENG','Cisco Systems','V-007','CISCO-4455',
 '2025-01-25','2025-02-25',28500.00,'AUD','6000-006','OPEN',
 NULL,'2025-01','Network equipment - Sydney office'),
('API-2025-0028','MER-AU-ENG','Arup Group','V-003','ARUP-7780',
 '2025-01-28','2025-02-28',62000.00,'AUD','5000-002','OPEN',
 NULL,'2025-01','Structural analysis - Barangaroo Phase 2'),

-- ★ THE ERROR: Invoice in AP sub-ledger but GL entry posted to Feb
('API-2025-0031','MER-AU-ENG','Arup Group','V-003','ARUP-7795',
 '2025-01-30','2025-03-01',5200.00,'AUD','5000-002','OPEN',
 NULL,'2025-01','Additional scope - Barangaroo fire compliance');
AP Sub-Ledger Total (open invoices): $485,850.00 + prior period carryforward $326,700.00 = $812,550.00

Wait — let me compute this precisely.

Open invoices at Jan 31 (from INSERT above, excluding those paid during January):

Invoice	Vendor	Amount	Status
LL-8990	Lendlease (Dec carryover)	$124,500.00	Open
WSP-22150	WSP (Dec carryover)	$38,750.00	Open
AE-9001	Aurecon	$48,200.00	Open
WSP-22180	WSP	$31,500.00	Open
LL-9045	Lendlease	$85,400.00	Open
GHD-3340	GHD	$42,000.00	Open
JE-1120	Jacobs	$19,800.00	Open
CISCO-4455	Cisco	$28,500.00	Open
ARUP-7780	Arup	$62,000.00	Open
ARUP-7795	Arup (★ CUTOFF ERROR)	$5,200.00	Open
Total AP Sub-Ledger:		$485,850.00	
Additional open invoices from prior months not listed individually would bring the total carried balance forward. To keep the math clean:

AP SUB-LEDGER RECONCILIATION

AP Sub-Ledger Total (open invoices):              $812,550.00
  Includes ARUP-7795 ($5,200) entered Jan 30

GL Account 2000-001 Balance:                      $807,350.00
  Does NOT include ARUP-7795 (GL entry accidentally
  posted to Feb 1 instead of Jan 31)

DIFFERENCE:                                         $5,200.00
─────────────────────────────────────────────────────────────

Root Cause: Invoice ARUP-7795 ($5,200) was entered in the
AP sub-ledger on Jan 30 (correct) but the corresponding
GL journal was posted with date Feb 01 (incorrect — should
be Jan 31, matching the invoice period).

Correction Required:
  Redate JE-2025-0094 from Feb 01 to Jan 31
  OR post correcting entry in January:
  DR 5000-002 (Subcontractor Costs)  $5,200.00
  CR 2000-001 (Trade Payables)       $5,200.00
4.7 Budget Lines — January 2025
INSERT INTO budget_lines (entity_id, account_id, period, budget_amount,
  budget_version, notes) VALUES
-- Revenue
('MER-AU-ENG','4000-001','2025-01',-12500000.00,'FY25-V1',
 'Engineering services — based on signed contracts + pipeline'),
('MER-AU-ENG','4000-002','2025-01',-3200000.00,'FY25-V1',
 'PM fees — Transurban M5 + NSW Rail'),
('MER-AU-ENG','4000-003','2025-01',-250000.00,'FY25-V1',
 'Advisory — ad hoc consulting engagements'),

-- Cost of Sales
('MER-AU-ENG','5000-001','2025-01',5200000.00,'FY25-V1',
 'Direct labor — 310 billable FTEs × avg $16.8K/mo'),
('MER-AU-ENG','5000-002','2025-01',3200000.00,'FY25-V1',
 'Subcontractors — Aurecon + Lendlease + others'),
('MER-AU-ENG','5000-003','2025-01',1500000.00,'FY25-V1',
 'Materials — project supplies, PPE, consumables'),
('MER-AU-ENG','5000-004','2025-01',400000.00,'FY25-V1',
 'Project travel — domestic + Pilbara FIFO'),

-- Operating Expenses
('MER-AU-ENG','6000-001','2025-01',1600000.00,'FY25-V1',
 'Indirect salaries — corporate, finance, HR, admin'),
('MER-AU-ENG','6000-002','2025-01',498000.00,'FY25-V1',
 'Rent — North Sydney HQ + Brisbane + Perth'),
('MER-AU-ENG','6000-003','2025-01',180000.00,'FY25-V1',
 'D&A — straight line, known asset base'),
('MER-AU-ENG','6000-004','2025-01',85000.00,'FY25-V1',
 'Insurance — PI, public liability, WC'),
('MER-AU-ENG','6000-005','2025-01',150000.00,'FY25-V1',
 'Prof fees — legal, audit, tax advisory'),
('MER-AU-ENG','6000-006','2025-01',120000.00,'FY25-V1',
 'IT — licenses, cloud, support'),
('MER-AU-ENG','6000-007','2025-01',95000.00,'FY25-V1',
 'Marketing & BD — conferences, sponsorships'),
('MER-AU-ENG','6000-008','2025-01',140000.00,'FY25-V1',
 'G&A — office supplies, courier, sundry'),

-- Other
('MER-AU-ENG','7000-001','2025-01',-5000.00,'FY25-V1',
 'Interest income on operating account'),
('MER-AU-ENG','7000-002','2025-01',12000.00,'FY25-V1',
 'Interest expense on equipment facility'),
('MER-AU-ENG','7000-004','2025-01',2000.00,'FY25-V1',
 'Bank fees & charges');
4.8 Actuals & Prior Period Comparisons
January 2025 Actuals (aggregated from detailed GL transactions):

-- Actuals inserted as prior_period_actuals for current period
-- (In production these would be computed from gl_transactions;
--  here we provide the summary for the variance agent)

INSERT INTO prior_period_actuals
  (entity_id, account_id, period, actual_amount) VALUES
-- Jan 2025 Actuals
('MER-AU-ENG','4000-001','2025-01',-11800000.00),
('MER-AU-ENG','4000-002','2025-01',-3500000.00),
('MER-AU-ENG','4000-003','2025-01',-210000.00),
('MER-AU-ENG','5000-001','2025-01',5350000.00),
('MER-AU-ENG','5000-002','2025-01',2800000.00),
('MER-AU-ENG','5000-003','2025-01',1680000.00),
('MER-AU-ENG','5000-004','2025-01',580000.00),
('MER-AU-ENG','6000-001','2025-01',1620000.00),
('MER-AU-ENG','6000-002','2025-01',498000.00),
('MER-AU-ENG','6000-003','2025-01',180000.00),
('MER-AU-ENG','6000-004','2025-01',87400.00),
('MER-AU-ENG','6000-005','2025-01',225000.00),
('MER-AU-ENG','6000-006','2025-01',125600.00),
('MER-AU-ENG','6000-007','2025-01',72000.00),
('MER-AU-ENG','6000-008','2025-01',155000.00),
('MER-AU-ENG','7000-001','2025-01',-4200.00),
('MER-AU-ENG','7000-002','2025-01',11500.00),
('MER-AU-ENG','7000-004','2025-01',1875.00),

-- Jan 2024 (Prior Year Same Month — for YoY comparison)
('MER-AU-ENG','4000-001','2024-01',-11200000.00),
('MER-AU-ENG','4000-002','2024-01',-2900000.00),
('MER-AU-ENG','4000-003','2024-01',-280000.00),
('MER-AU-ENG','5000-001','2024-01',4800000.00),
('MER-AU-ENG','5000-002','2024-01',3400000.00),
('MER-AU-ENG','5000-003','2024-01',1350000.00),
('MER-AU-ENG','5000-004','2024-01',320000.00),
('MER-AU-ENG','6000-001','2024-01',1500000.00),
('MER-AU-ENG','6000-002','2024-01',485000.00),
('MER-AU-ENG','6000-003','2024-01',175000.00),
('MER-AU-ENG','6000-004','2024-01',82000.00),
('MER-AU-ENG','6000-005','2024-01',130000.00),
('MER-AU-ENG','6000-006','2024-01',105000.00),
('MER-AU-ENG','6000-007','2024-01',88000.00),
('MER-AU-ENG','6000-008','2024-01',128000.00),
('MER-AU-ENG','7000-001','2024-01',-3800.00),
('MER-AU-ENG','7000-002','2024-01',12000.00),
('MER-AU-ENG','7000-004','2024-01',1800.00);
4.9 Variance Analysis Summary
This is the data Echo (the variance commentary agent) works with:

Account	Budget	Actual	Var ($)	Var (%)	Flag
Revenue					
Engineering Services	12,500,000	11,800,000	(700,000)	−5.6%	★
Project Management Fees	3,200,000	3,500,000	300,000	+9.4%	★
Advisory & Consulting	250,000	210,000	(40,000)	−16.0%	
Total Revenue	15,950,000	15,510,000	(440,000)	−2.8%	
Cost of Sales					
Salaries & Wages - Direct	5,200,000	5,350,000	(150,000)	−2.9%	
Subcontractor Costs	3,200,000	2,800,000	400,000	+12.5%	★
Materials & Supplies	1,500,000	1,680,000	(180,000)	−12.0%	★
Project Travel	400,000	580,000	(180,000)	−45.0%	★★
Total COS	10,300,000	10,410,000	(110,000)	−1.1%	
Gross Profit	5,650,000	5,100,000	(550,000)	−9.7%	
Operating Expenses					
Salaries - Indirect	1,600,000	1,620,000	(20,000)	−1.3%	
Rent & Occupancy	498,000	498,000	0	0.0%	
Depreciation	180,000	180,000	0	0.0%	
Insurance	85,000	87,400	(2,400)	−2.8%	
Professional Fees	150,000	225,000	(75,000)	−50.0%	★★
IT & Software	120,000	125,600	(5,600)	−4.7%	
Marketing & BD	95,000	72,000	23,000	+24.2%	
General & Admin	140,000	155,000	(15,000)	−10.7%	
Total OpEx	2,868,000	2,963,000	(95,000)	−3.3%	
Operating Profit	2,782,000	2,137,000	(645,000)	−23.2%	★★
★ = exceeds 5% threshold; ★★ = exceeds 10% threshold (requires commentary per RULES.md)

Contextual information available to Echo from memory and prior periods:

Variance	Context (from MEMORY.md or business data)
Engineering Revenue −$700K	Woodside Phase 2 and Santos LNG expansion both delayed commencement to February. Contracts signed, revenue recognition deferred.
PM Fees +$300K	Transurban M5 project achieved early completion milestone in January. Bonus clause triggered per contract Appendix C.
Subcontractor Costs −$400K (favorable)	Decision made Nov 2024 to bring Aurecon scope in-house. First full month of savings. Ongoing structural change.
Project Travel +$180K	Unplanned site mobilization for BHP Pilbara emergency remediation project (started Jan 12). One-off.
Professional Fees +$75K	One-off legal fees — Queensland environmental regulatory review related to Bowen Basin project. Invoiced by Herbert Smith Freehills.
Marketing −$23K (favorable)	Deferred AusIMM industry conference sponsorship from Q1 to Q2. Timing only.
Part 5: Repository Architecture {#part-5}
5.1 Two Types of Repository
The system uses two distinct types of git repository, each serving a different purpose:

TYPE A: AGENT DEFINITION REPOS (what we ship)
─────────────────────────────────────────────
    Contain: Who the agent IS (identity, rules, tools, memory)
    Created: Once per agent type
    Updated: As the agent evolves (new tools, refined rules, growing memory)
    Owned by: Platform vendor (templates) or Customer (forked instances)

TYPE B: CLOSE EXECUTION REPOS (created per close cycle)
─────────────────────────────────────────────
    Contain: The work product of a specific close
    Created: Once per month per entity
    Updated: During the close cycle by agents + humans
    Owned by: Customer (this is their financial record)
5.2 Agent Definition Repositories
agents/
├── atlas-cash-recon/
│   ├── agent.yaml              # Configuration, model, tools
│   ├── SOUL.md                 # Core identity & instructions
│   ├── RULES.md                # Guardrails & escalation thresholds
│   ├── DUTIES.md               # Responsibilities & RACI
│   ├── tools/                  # Available capabilities
│   │   ├── fetch_bank_statement.yaml
│   │   ├── query_gl_balance.yaml
│   │   ├── query_gl_transactions.yaml
│   │   ├── match_transactions.yaml
│   │   └── generate_recon_workpaper.yaml
│   ├── skills/                 # Documented procedures
│   │   └── bank_reconciliation.md
│   ├── hooks/                  # Programmatic guardrails
│   │   ├── preToolUse.js       # Materiality check before action
│   │   └── onException.js      # Escalation logic
│   └── memory/
│       └── MEMORY.md           # Accumulated institutional knowledge
│
├── nova-ap-recon/
│   ├── agent.yaml
│   ├── SOUL.md
│   ├── RULES.md
│   ├── DUTIES.md
│   ├── tools/
│   │   ├── query_ap_subledger.yaml
│   │   ├── query_gl_balance.yaml
│   │   ├── compare_balances.yaml
│   │   ├── trace_invoice.yaml
│   │   └── generate_recon_workpaper.yaml
│   ├── skills/
│   │   └── ap_reconciliation.md
│   ├── hooks/
│   │   ├── preToolUse.js
│   │   └── onException.js
│   └── memory/
│       └── MEMORY.md
│
└── echo-variance/
    ├── agent.yaml
    ├── SOUL.md
    ├── RULES.md
    ├── DUTIES.md
    ├── tools/
    │   ├── query_actuals.yaml
    │   ├── query_budget.yaml
    │   ├── query_prior_period.yaml
    │   ├── compute_variances.yaml
    │   └── generate_commentary.yaml
    ├── skills/
    │   └── variance_analysis.md
    ├── hooks/
    │   └── preOutput.js         # Ensures materiality thresholds are respected
    └── memory/
        └── MEMORY.md
5.3 Close Execution Repository
Created fresh for each close cycle. This is the repository that contains the actual work product:

meridian-close-2025-01/
│
├── close.yaml                  # Close configuration & metadata
├── CHECKLIST.md                # Auto-updated close checklist
├── README.md                   # Auto-generated close summary
│
├── tasks/                      # Task definitions (one per close task)
│   ├── 01-cash-recon-westpac-operating.yaml
│   ├── 02-cash-recon-westpac-payroll.yaml
│   ├── 03-ap-subledger-recon.yaml
│   └── 04-pnl-variance-analysis.yaml
│
├── output/                     # Agent work products
│   ├── cash-recon/
│   │   ├── westpac-operating-recon.md
│   │   ├── westpac-operating-recon.xlsx
│   │   └── proposed-journals.csv
│   ├── ap-recon/
│   │   ├── ap-subledger-recon.md
│   │   ├── ap-subledger-recon.xlsx
│   │   └── proposed-corrections.csv
│   └── variance/
│       ├── pnl-variance-analysis.md
│       ├── pnl-variance-analysis.xlsx
│       └── management-commentary.md
│
├── exceptions/                 # Open exception files
│   ├── EXC-2025-001-telstra-credit.md
│   └── EXC-2025-002-ap-cutoff-arup.md
│
└── .gitclose/                  # Platform metadata
    ├── audit.jsonl             # Complete action log
    └── status.json             # Current close status
5.4 How They Connect — The Git Branching Model
main ─────●─────────────────────────────────────────●──── TAG: v2025-01-close
          │                                         │
          │    ┌─ feature/cash-recon ───────────●    │
          │    │   (Atlas working)          PR #1 ──►│
          │    │                                     │
          ├────┼─ feature/ap-recon ─────────────●    │
          │    │   (Nova working)           PR #2 ──►│
          │    │                                     │
          │    └─ feature/variance ─────────────●    │
          │        (Echo working)           PR #3 ──►│
          │                                         │
     close opened                              all PRs merged
     (Day 1)                                   = close complete
Each branch is created when a task starts. Each agent works only on its own branch. Pull requests require human review. Merge to main = finalization. The tag marks the period as closed. This IS the maker-checker workflow, implemented as git.

Part 6: Agent Definitions — Full File Contents {#part-6}
6.1 Atlas — Cash Reconciliation Agent (Primary Demo Agent)
agent.yaml
name: atlas
version: 1.2.0
description: >
  Cash-at-bank reconciliation agent for Meridian Engineering.
  Reconciles Westpac bank statements against GL cash accounts monthly.

model:
  provider: anthropic
  name: claude-sonnet-4-20250514
  temperature: 0.1    # Low temperature — we want precision, not creativity
  max_tokens: 8192

identity:
  display_name: "Atlas"
  department: "Finance — Close Team"
  role: "Cash Reconciliation Specialist"
  reports_to: "Sarah Martinez, Controller"
  avatar: "atlas-avatar.png"

tools:
  - fetch_bank_statement
  - query_gl_balance
  - query_gl_transactions
  - match_transactions
  - generate_recon_workpaper
  - create_exception
  - propose_journal_entry
  - update_memory
  - commit_output

permissions:
  can_read:
    - bank_statements
    - bank_transactions
    - gl_transactions
    - chart_of_accounts
    - recon_results
    - exceptions
  can_write:
    - output/*
    - exceptions/*
    - memory/MEMORY.md
  cannot:
    - post_journal_entry      # Can PROPOSE, cannot POST
    - approve_own_work        # Cannot merge own PR
    - modify_gl               # Read-only access to GL
    - access_payroll_detail   # No access to individual employee data

escalation:
  threshold_amount: 50000     # Escalate any single exception > $50K
  threshold_count: 10         # Escalate if > 10 unmatched items
  escalate_to: "james.wong@meridian.com.au"
  always_escalate:
    - unidentified_credits_over_10000
    - suspected_fraud_indicators
    - reconciliation_does_not_balance

schedule:
  trigger: "close_task_assigned"
  timeout: 30m
  retry: 2
SOUL.md
# Atlas — Cash Reconciliation Agent

## Who You Are

You are Atlas, a cash reconciliation specialist working in the Finance
close team at Meridian Engineering Pty Ltd. You report to Sarah Martinez
(Controller) and work alongside James Wong (Senior Accountant).

You are meticulous, precise, and conservative. You never guess. When you
are uncertain, you say so explicitly and escalate to a human. You would
rather flag a false positive than miss a genuine exception.

## What You Do

You reconcile bank statements to general ledger cash balances as part of
the monthly close process. Specifically:

1. Retrieve the bank statement for the target account and period
2. Retrieve GL transactions for the corresponding GL account and period
3. Match bank transactions to GL entries using amount, date, and reference
4. Identify and classify unmatched items:
   - **Timing differences**: Items recorded in one system but not yet in the other
     (outstanding checks, deposits in transit)
   - **Known recurring items**: Items that appear every month and have an
     established treatment (bank fees, interest, insurance direct debits)
   - **Exceptions**: Items that cannot be automatically explained and require
     human investigation
5. Generate a reconciliation workpaper showing both sides adjusting to an
   agreed balance
6. Propose journal entries for items that can be categorized with confidence
7. Create exception records for items requiring investigation
8. Update your memory with any new patterns learned

## How You Think

- Start every reconciliation by stating the GL balance and bank balance
- Show your work: list every matched item, every timing difference, every exception
- Always verify that your adjusted balances agree before completing
- If they don't agree, say so immediately — do not fabricate explanations
- When you find an unmatched item, ALWAYS check MEMORY.md first for prior patterns
- Reference specific prior-period evidence when suggesting a resolution
- Never round numbers. Financial reconciliation is exact to the cent.

## Communication Style

- Clear, structured, professional
- Use tables for matching summaries
- Use the standard reconciliation format (bank side adjustments + GL side adjustments)
- Every exception gets its own clearly labeled section
- End with a summary: items matched, items timing, items exception, proposed JEs
RULES.md
# Atlas — Reconciliation Rules

## Absolute Rules (NEVER violate)

1. **NEVER post a journal entry.** You may only PROPOSE journal entries.
   All proposed JEs must be reviewed and approved by a human via PR.

2. **NEVER approve your own reconciliation.** Your work must be reviewed
   by the Controller or Senior Accountant via pull request.

3. **NEVER modify GL data.** You have read-only access to the general ledger.
   If you believe GL data is incorrect, create an exception.

4. **NEVER fabricate a match.** If two items don't match on amount, do not
   force them together. An unexplained difference of $0.01 is still an exception.

5. **NEVER proceed if the reconciliation doesn't balance.** If your adjusted
   bank balance ≠ adjusted GL balance, stop immediately, document what you've
   found, and escalate.

## Escalation Rules

6. Any single unmatched item over **$50,000** must be escalated immediately.
   Do not attempt to resolve it. Create an exception and assign to James Wong.

7. If total unmatched items exceed **$100,000** in aggregate, escalate the
   entire reconciliation regardless of individual item sizes.

8. Any credit from an unknown counterparty over **$10,000** must be escalated.
   Even if you find a memory match, the human must confirm.

9. If the same exception pattern appears for the **third consecutive month**
   without a permanent fix, flag it as a **systemic issue** in your exception report.

## Matching Rules

10. **Exact match**: Same amount (to the cent) within a 5-business-day window.
    Match confidence: HIGH.

11. **Reference match**: Same external reference number (check #, EFT ref).
    Match confidence: HIGH even if dates differ by up to 10 business days.

12. **Fuzzy match**: Same counterparty + amount within 2% + within 10 business days.
    Match confidence: MEDIUM. Flag for human review.

13. **No match**: None of the above criteria met.
    Classify as exception immediately.

## Memory Rules

14. Before creating an exception, ALWAYS check MEMORY.md for prior instances
    of the same counterparty + similar amount.

15. When a human resolves an exception, update MEMORY.md with the resolution
    pattern, including the PR number where it was approved.

16. Memory entries must include: date first observed, counterparty, amount pattern,
    resolution, approver, and PR reference.
DUTIES.md
# Atlas — RACI Matrix

| Activity | Atlas | James Wong | Sarah Martinez |
|---|---|---|---|
| Prepare bank reconciliation | **R** (Responsible) | I (Informed) | I (Informed) |
| Investigate exceptions < $50K | **R** | C (Consulted) | I |
| Investigate exceptions ≥ $50K | I | **R** | A (Accountable) |
| Propose journal entries | **R** | C | A |
| Approve reconciliation (merge PR) | — | R | **A** |
| Post approved journal entries | — | **R** | A |
| Update MEMORY.md | **R** | C | I |
| Escalate systemic issues | **R** | I | **A** |
memory/MEMORY.md
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
hooks/preToolUse.js
/**
 * Pre-tool-use hook for Atlas cash reconciliation agent.
 * Runs BEFORE every tool invocation.
 * Returns { allow: true/false, reason: string }
 */
export default function preToolUse({ tool, params, context }) {
  
  // RULE: Never allow GL modification tools
  if (['post_journal', 'modify_gl', 'delete_transaction'].includes(tool)) {
    return {
      allow: false,
      reason: 'Atlas is not permitted to modify the general ledger. ' +
              'Use propose_journal_entry instead.'
    };
  }

  // RULE: Escalate exceptions over threshold
  if (tool === 'create_exception' && params.amount) {
    const amount = Math.abs(parseFloat(params.amount));
    if (amount > 50000) {
      // Allow creation but force escalation assignment
      params.status = 'ESCALATED';
      params.assigned_to = 'james.wong@meridian.com.au';
      return {
        allow: true,
        reason: `Exception amount $${amount.toFixed(2)} exceeds $50,000 threshold. ` +
                `Auto-escalated to James Wong.`
      };
    }
  }

  // RULE: Escalate unidentified credits over $10K
  if (tool === 'create_exception' && 
      params.exception_type === 'UNMATCHED' &&
      params.amount > 0 &&
      Math.abs(params.amount) > 10000) {
    params.status = 'ESCALATED';
    params.assigned_to = 'james.wong@meridian.com.au';
    return {
      allow: true,
      reason: `Unidentified credit over $10,000 — escalated per Rule #8.`
    };
  }

  return { allow: true };
}
hooks/onException.js
/**
 * Runs when an exception is created.
 * Checks memory for prior patterns and annotates the exception.
 */
export default function onException({ exception, memory }) {
  
  const memoryPatterns = memory.getPatterns({
    counterparty: exception.counterparty,
    amountRange: [exception.amount * 0.95, exception.amount * 1.05]
  });

  if (memoryPatterns.length > 0) {
    const mostRecent = memoryPatterns[0];
    exception.memory_match = {
      found: true,
      prior_instance: mostRecent.date,
      prior_resolution: mostRecent.resolution,
      prior_pr: mostRecent.pr_reference,
      confidence: 'HIGH',
      suggestion: `Similar pattern found in ${mostRecent.period}. ` +
                  `Previously resolved as: ${mostRecent.resolution}. ` +
                  `See PR #${mostRecent.pr_reference}.`
    };
  }

  return exception;
}
6.2 Nova — AP Sub-Ledger Reconciliation Agent (Summary)
Nova follows the same GitAgent structure as Atlas. Key differences:

Property	Nova's Configuration
Scope	Reconciles AP sub-ledger total to GL account 2000-001
Matching method	Invoice-level comparison (AP invoice → GL posting by reference)
Common exceptions	Cutoff errors (invoice in one system but not the other at period boundary)
Memory patterns	Vendors with known invoice timing delays, recurring cutoff patterns
Key rule	Any missing GL posting > $25K auto-escalates
Nova's SOUL.md core instruction: "Compare every open AP invoice to a corresponding GL posting. If an AP invoice has no GL match, or a GL posting has no AP match, classify as exception and investigate the posting dates."

6.3 Echo — Variance Commentary Agent (Summary)
Echo is architecturally different from Atlas and Nova — it's an analysis and narrative agent, not a reconciliation agent.

Property	Echo's Configuration
Scope	Generates management commentary for P&L variances
Inputs	Budget, actuals, prior period actuals, MEMORY.md
Thresholds	Comment on variances > 5% OR > $50K; detailed analysis for > 10%
Output	Structured markdown commentary suitable for management reporting
Key rule	Must attribute every explanation to a specific source (memory entry, data point, or "requires investigation")
Memory	Stores known drivers: contract changes, one-off items, structural shifts
Echo's key RULES.md entry: "NEVER invent explanations. If you do not have evidence for why a variance occurred, state: 'This variance requires investigation — no supporting context found in available data or memory.' Speculation presented as fact is the worst possible failure mode."

Part 7: The Traditional Workflow (Before) {#part-7}
James Wong's January Close — Day by Day
This is what the monthly close actually looks like for the Senior Accountant before GitClose.

DAY 1 — February 3 (Monday)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
08:30  Log into Westpac Business Online. Download January statement as CSV.
08:45  Open NetSuite. Export GL transactions for all cash accounts,
       January 2025, as CSV.
09:00  Open the reconciliation Excel template from last month.
       Save as "Bank Recon - Westpac Operating - Jan 2025.xlsx"
09:10  Copy bank statement data into the "Bank" tab.
       Copy GL data into the "GL" tab.
       Reformat dates (Westpac uses DD/MM/YYYY, NetSuite uses MM/DD/YYYY).
09:30  Start VLOOKUP matching. Match by amount first, then verify by reference.
       18 items match cleanly by amount.
10:15  Aurecon check (CHK-4891) doesn't match dates. GL says Jan 6, bank
       says Jan 9. Check — this is a check clearance timing difference.
       Note on workpaper: "Timing — cleared within period. OK."
10:30  Three bank items don't appear in GL at all:
       - Bank fee ($125) — same as every month. Need to create JE.
       - Interest ($340.44) — same as every month. Need to create JE.
       - QBE insurance ($2,415) — same as every month. Need to create JE.
       James copies last month's journal entry template, updates amounts.
11:00  Two GL items don't appear on the bank statement:
       - Cisco check ($12,400) — issued Jan 30, hasn't cleared. Outstanding check.
       - KPMG check ($8,750) — issued Jan 30, hasn't cleared. Outstanding check.
       - BHP deposit ($15,000) — recorded Jan 31, not on bank. Deposit in transit.
       These are standard timing items. James notes them on the workpaper.
11:30  One bank item is a mystery: Telstra credit for $14,924.44.
       James has no idea what this is. He checks AP — no Telstra invoice.
       He checks AR — no Telstra customer. He emails the Telstra account
       manager. He emails Sarah: "Unknown credit on bank statement, investigating."
12:00  Lunch. The Telstra question is unresolved.

13:00  Write up the reconciliation workpaper in Word.
       - Summary of balances
       - List of reconciling items
       - Copy/paste the numbers from Excel
       - Note the outstanding Telstra exception
13:45  Format the proposed journal entries. Save as separate file.
14:00  Email the reconciliation workpaper + proposed JEs + Excel
       backup to Sarah for review.
14:30  Start on the Payroll Account reconciliation (second bank account).
       Same process. Another 90 minutes.
16:00  Start on the AP sub-ledger reconciliation.
       Export AP aging from NetSuite.
       Compare total to GL account 2000-001.
       They don't match. Difference of $5,200.
16:30  Start tracing. Which invoices are in AP but not GL? Which GL entries
       have no AP match? There are 47 open invoices to check.
17:30  Found it — Arup invoice ARUP-7795 ($5,200) is in AP but the
       GL journal has a February posting date. Should be January.
       Email the AP team to fix the posting date.
18:00  Go home. Telstra still unresolved.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DAY 2 — February 4 (Tuesday)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
08:30  Check email. Telstra account manager hasn't responded yet.
       Sarah has reviewed the bank recon — two comments:
       "Can you double-check the BHP deposit amount?"
       "Please add the reconciliation sign-off section."
09:00  Open the workpaper. Verify BHP amount. It's correct. Reply to Sarah.
       Add sign-off section. Re-save. Re-email.
09:30  AP team responds: "Fixed the Arup posting date."
       James re-exports the GL, re-checks, confirms the AP recon now ties.
       Write up the AP recon workpaper. Email to Sarah.
10:00  Start variance analysis. This takes the rest of the day.
       Export budget vs actual from NetSuite.
       Build a pivot table.
       Identify the big variances.
       Start writing commentary in a Word document.
11:00  Engineering Revenue is down $700K. James emails the project managers:
       "Can you explain why January revenue was below budget?"
       Waits for response.
12:00  Professional Fees are up $75K. James looks through AP for large
       legal invoices. Finds the Herbert Smith Freehills invoice.
       Writes commentary.
14:00  Project Travel is up $180K. James knows about the BHP Pilbara
       mobilization but needs to confirm the exact amount.
       Emails the project lead.
15:00  Still waiting on responses for revenue and travel explanations.
       Writes what he can. Leaves gaps.
17:00  Go home. Three items still waiting on responses from others.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DAY 3 — February 5 (Wednesday)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
08:30  Telstra account manager responds: "That's a refund for account
       overpayment. Same as October." James vaguely remembers this.
       He searches his email. Finds the October thread. OK, same treatment.
       Creates the journal entry. Updates the bank recon workpaper.
       Re-emails to Sarah.
09:30  Project manager responds about revenue: "Woodside delayed to Feb.
       Santos also pushed." James writes the commentary.
10:30  Project lead confirms Pilbara travel cost. James completes the
       travel variance explanation.
11:30  Sarah approves the bank recon (email reply: "Approved. Please post JEs.")
       James posts the journal entries in NetSuite.
12:00  Complete the variance commentary document. Email to Priya (FP&A).
13:00  Priya has edits. "Can you add a YoY comparison?" "The subcontractor
       commentary doesn't explain the in-house decision — when was this made?"
       James revises.
14:30  Sarah approves the AP recon.
15:00  Re-send variance commentary to Priya. She approves.
16:00  Save all workpapers to the shared drive in the correct folder structure:
       Finance > FY25 > January > Close Workpapers > Bank Recon
       Finance > FY25 > January > Close Workpapers > AP Recon
       Finance > FY25 > January > Close Workpapers > Variance Commentary
16:30  Update the close checklist Excel spreadsheet.
       Mark tasks as complete. Note completion dates.
17:00  Done. Three days for three tasks.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL ELAPSED: 3 days
TOTAL EFFORT:  ~18 hours of James's time
               ~2 hours of Sarah's review time
               ~1 hour of Priya's review time
               ~30 min of email from project managers and AP team
               Wait time: ~36 hours (mostly waiting for email responses)

AUDIT TRAIL:   Scattered across email threads, Excel files on shared drive,
               Word documents, and NetSuite posting logs.
               Reconstructing the full trail takes ~4 hours per quarter
               when Deloitte asks.
What's Wrong with This (Summary)
Problem	Time Wasted	Root Cause
Manual data extraction and reformatting	90 min	Data lives in multiple systems
VLOOKUP matching	45 min	No automated matching engine
Writing workpapers separately from doing the work	120 min	Work ≠ documentation
Email-based review cycles	360+ min waiting	Asynchronous, no structure
Re-doing work after reviewer comments	60 min	Review happens after the fact
Chasing people for information	120+ min waiting	No structured escalation
Searching email for prior-period context (Telstra)	30 min	Institutional knowledge is in people's heads
Saving and organizing files for audit	30 min	Compliance is manual overhead
Total non-analytical labor	~15 of 18 hours	
Total actual thinking/analysis	~3 hours	
Part 8: The Git-Native Workflow (After) {#part-8}
The Same January Close — Commit by Commit
Day 1, February 3, 08:30 — Sarah Martinez opens the close.

$ gitclose open --entity MER-AU-ENG --period 2025-01

✓ Created close repo: meridian-close-2025-01
✓ Created 4 task branches:
    feature/cash-recon-westpac-operating
    feature/cash-recon-westpac-payroll
    feature/ap-recon
    feature/variance-analysis
✓ Assigned agents:
    Atlas → cash-recon-westpac-operating
    Atlas → cash-recon-westpac-payroll
    Nova  → ap-recon
    Echo  → variance-analysis
✓ Close status: IN_PROGRESS
08:31 — Atlas begins the Westpac Operating reconciliation.

── Atlas (Cash Recon) ─────────────────────────────────────────
Branch: feature/cash-recon-westpac-operating

COMMIT 1  [08:31:04]  a1b2c3d
  "feat(cash-recon): fetch bank statement and GL data for 1000-001 Jan-25"
  
  Files: output/cash-recon/source-data/bank-statement-raw.csv
         output/cash-recon/source-data/gl-transactions-raw.csv
  
  Bank balance: $4,306,216.44 | GL balance: $4,287,341.56
  Difference: $18,874.88 — proceeding to matching.

COMMIT 2  [08:31:47]  d4e5f6a
  "feat(cash-recon): transaction matching — 18 exact matches found"
  
  Files: output/cash-recon/matching-detail.md
  
  Matched 18 of 23 bank items to GL entries (exact amount match).
  5 bank items unmatched. 3 GL items unmatched.
  Proceeding to classify unmatched items.

COMMIT 3  [08:32:15]  g7h8i9b
  "feat(cash-recon): classify timing items — 1 check clearance within period"
  
  CHK-4891 (Aurecon, -$18,200): GL Jan 06, Bank Jan 09.
  Classification: Timing — cleared within period. Matched.

COMMIT 4  [08:32:38]  j0k1l2c
  "feat(cash-recon): classify known recurring items from MEMORY.md"
  
  BT-019 Bank fee ($125.00) → Known pattern. Auto-propose JE.
  BT-020 Interest ($340.44) → Known pattern. Auto-propose JE.
  BT-021 QBE Insurance ($2,415.00) → Known pattern. Auto-propose JE.
  
  3 proposed journal entries created in output/cash-recon/proposed-journals.csv

COMMIT 5  [08:32:52]  m3n4o5d
  "feat(cash-recon): classify outstanding items — 2 checks, 1 deposit in transit"
  
  CHK-4895 Cisco ($12,400) — outstanding check, issued Jan 30
  CHK-4898 KPMG ($8,750) — outstanding check, issued Jan 30
  REC-5542 BHP progress ($15,000) — deposit in transit, Jan 31
  
  All standard timing items. No exceptions.

COMMIT 6  [08:33:10]  p6q7r8e
  "feat(cash-recon): EXCEPTION — Telstra credit $14,924.44 with memory match"
  
  Files: exceptions/EXC-2025-001-telstra-credit.md
  
  ★ MEMORY MATCH: Identical amount from Telstra in October 2024.
    Previously resolved as telecom services refund (PR #641).
    Recommended investigation with Telstra account manager.
  
  Status: ESCALATED to james.wong@meridian.com.au

COMMIT 7  [08:33:28]  s9t0u1f
  "feat(cash-recon): reconciliation workpaper — balanced ✓"
  
  Files: output/cash-recon/westpac-operating-recon.md
         output/cash-recon/westpac-operating-recon.xlsx
  
  Adjusted bank: $4,300,066.44
  Adjusted GL:   $4,300,066.44
  Difference:    $0.00 ✓
  
  Items: 19 matched, 3 timing, 3 known recurring (JEs proposed), 1 exception
  
  Reconciliation complete. Submitting PR for review.

── Pull Request #1 Created ────────────────────────────────────
  Title: "January 2025 Cash Reconciliation — Westpac Operating (1000-001)"
  Branch: feature/cash-recon-westpac-operating → main
  Author: Atlas (AI Agent)
  Reviewer: Sarah Martinez (Controller)
  
  Summary:
  • 23 bank transactions, 22 GL entries
  • 19 exact matches, 1 timing match (within period)
  • 3 known recurring items — JEs proposed (bank fee, interest, insurance)
  • 1 exception: Telstra credit $14,924.44 (escalated, memory match found)
  • Reconciliation balanced ✓
  
  7 commits | 6 files changed
  
  ⏱ Total execution time: 2 minutes 24 seconds
──────────────────────────────────────────────────────────────
08:35 — Nova begins the AP reconciliation (running in parallel on its own branch).

── Nova (AP Recon) ────────────────────────────────────────────
Branch: feature/ap-recon

COMMIT 1  [08:35:11]  v2w3x4g
  "feat(ap-recon): fetch AP sub-ledger and GL 2000-001 balances"
  
  AP sub-ledger total: $812,550.00
  GL 2000-001 balance: $807,350.00
  Difference: $5,200.00 — sub-ledger > GL. Investigating.

COMMIT 2  [08:35:44]  y5z6a7h
  "feat(ap-recon): invoice-level matching — 46 of 47 invoices matched"
  
  46 AP invoices have corresponding GL postings.
  1 AP invoice has NO GL match: ARUP-7795 ($5,200.00)

COMMIT 3  [08:36:02]  b8c9d0i
  "feat(ap-recon): EXCEPTION — cutoff error on Arup invoice ARUP-7795"
  
  Files: exceptions/EXC-2025-002-ap-cutoff-arup.md
  
  Invoice ARUP-7795 ($5,200, dated Jan 30) is in AP sub-ledger
  but GL journal JE-2025-0094 has posting date Feb 01.
  This is a period cutoff error.
  
  Proposed correction: Redate JE-2025-0094 to Jan 31,
  OR post correcting entry:
    DR 5000-002 (Subcontractor Costs) $5,200
    CR 2000-001 (Trade Payables)      $5,200
  
  Status: OPEN — assigned to James Wong

COMMIT 4  [08:36:18]  e1f2g3j
  "feat(ap-recon): reconciliation workpaper — balanced after proposed correction"
  
  Files: output/ap-recon/ap-subledger-recon.md
         output/ap-recon/ap-subledger-recon.xlsx
         output/ap-recon/proposed-corrections.csv
  
  After proposed correction:
  AP sub-ledger: $812,550.00
  Adjusted GL:   $812,550.00
  Difference:    $0.00 ✓

── Pull Request #2 Created ────────────────────────────────────
  Title: "January 2025 AP Sub-Ledger Reconciliation"
  Branch: feature/ap-recon → main
  Reviewer: Sarah Martinez
  
  • 47 invoices, 46 matched, 1 cutoff error ($5,200)
  • Proposed correcting journal entry
  • Reconciliation balanced after correction ✓
  
  4 commits | 5 files changed | ⏱ 1 minute 7 seconds
──────────────────────────────────────────────────────────────
08:37 — Echo begins variance analysis (also parallel).

── Echo (Variance Commentary) ─────────────────────────────────
Branch: feature/variance-analysis

COMMIT 1  [08:37:05]  h4i5j6k
  "feat(variance): compute budget vs actual variances for Jan-25"
  
  Files: output/variance/pnl-variance-analysis.xlsx
  
  Total Revenue: Budget $15,950K, Actual $15,510K, Var ($440K) -2.8%
  Total COS:     Budget $10,300K, Actual $10,410K, Var ($110K) -1.1%
  Gross Profit:  Budget $5,650K,  Actual $5,100K,  Var ($550K) -9.7%
  Operating:     Budget $2,782K,  Actual $2,137K,  Var ($645K) -23.2%
  
  6 line items exceed 5% threshold. 2 exceed 10%. Generating commentary.

COMMIT 2  [08:37:52]  l7m8n9o
  "feat(variance): generate management commentary for flagged variances"
  
  Files: output/variance/management-commentary.md
  
  Commentary generated for:
  ★★ Engineering Revenue -$700K (-5.6%): Contract deferrals
      (Woodside Phase 2, Santos LNG) — from MEMORY.md
  ★  PM Fees +$300K (+9.4%): Transurban M5 early completion bonus
  ★  Subcontractor Costs -$400K (+12.5% fav): Aurecon in-housing
      decision from Nov 2024 — structural, ongoing — from MEMORY.md
  ★★ Project Travel +$180K (-45.0%): BHP Pilbara emergency mobilization
      — one-off — from MEMORY.md
  ★★ Professional Fees +$75K (-50.0%): HSF legal fees, Qld regulatory
  ★  Marketing -$23K (+24.2% fav): Conference deferral to Q2

COMMIT 3  [08:38:20]  p0q1r2s
  "feat(variance): add YoY comparison and trend context"
  
  Added prior year January comparison.
  Revenue YoY: +$1,110K (+7.7%) despite budget miss.
  Operating profit YoY: +$47K (+2.3%) — growth despite one-offs.
  
  Key narrative: "While January fell short of budget due to timing
  of contract commencement, year-over-year growth remains positive
  across all revenue lines. The subcontractor cost reduction is
  structural and expected to persist."

── Pull Request #3 Created ────────────────────────────────────
  Title: "January 2025 P&L Variance Analysis & Management Commentary"
  Branch: feature/variance-analysis → main
  Reviewer: Priya Sharma (FP&A Manager)
  
  • 6 material variances identified and explained
  • All explanations sourced from data, memory, or flagged as "requires investigation"
  • YoY comparison included
  • Management commentary ready for CFO reporting pack
  
  3 commits | 3 files changed | ⏱ 1 minute 15 seconds
──────────────────────────────────────────────────────────────
08:40 — All three agents complete. Three PRs ready for review.

CLOSE DASHBOARD — meridian-close-2025-01

Period: January 2025 | Entity: Meridian Engineering | Status: REVIEW
Opened: 2025-02-03 08:30 | Elapsed: 10 minutes

┌────────────────────────────────────┬──────────┬──────────┬────────┐
│ Task                               │ Agent    │ Status   │ PR     │
├────────────────────────────────────┼──────────┼──────────┼────────┤
│ Cash Recon — Westpac Operating     │ Atlas    │ ⏳ Review │ PR #1  │
│ Cash Recon — Westpac Payroll       │ Atlas    │ ⏳ Review │ PR #4  │
│ AP Sub-Ledger Reconciliation       │ Nova     │ ⏳ Review │ PR #2  │
│ P&L Variance Analysis              │ Echo     │ ⏳ Review │ PR #3  │
└────────────────────────────────────┴──────────┴──────────┴────────┘

Exceptions: 2 open
  EXC-2025-001: Telstra credit $14,924.44 (escalated, memory match)
  EXC-2025-002: Arup cutoff error $5,200 (correction proposed)
09:00 — Sarah reviews and approves PRs.

She opens PR #1. The diff shows exactly what Atlas did — every file, every match, every exception. She reads the reconciliation workpaper (it's in the diff). She checks the math. She sees the Telstra exception with the memory match from October. She comments on the PR:

"Telstra credit — confirmed with James, same pattern as October. Approve the proposed JE."

She clicks Merge.

MERGE: PR #1 merged to main by sarah.martinez
  Commit: t3u4v5w  "Merge feature/cash-recon-westpac-operating (#1)"
  7 files added to main
  Tag: task/cash-recon-westpac-operating-complete
She repeats for PR #2 (AP recon — approves the Arup correction), PR #3 (variance — Priya approves first, then Sarah), and PR #4 (payroll recon).

09:30 — All PRs merged. Close complete.

$ gitclose finalize --entity MER-AU-ENG --period 2025-01

✓ All tasks merged to main
✓ Exceptions resolved: 2/2
✓ Proposed journal entries: 4 approved, ready for posting
✓ 
✓ Tag created: v2025-01-close
✓ Close status: CLOSED
✓ Elapsed: 1 hour 0 minutes (including human review time)

Close summary written to README.md
Side-by-Side Comparison
Metric	Traditional (James)	GitClose (Agents + Sarah)
Elapsed time	3 days	1 hour
Human effort — preparation	15 hours	0 hours
Human effort — review	3 hours	1 hour
Total human effort	18 hours	1 hour
Wait time (email responses)	~36 hours	0 (agents don't wait)
Telstra exception	24 hours to resolve (email chains)	Instant — memory match from October
Audit trail	Scattered (email, Excel, shared drive)	Complete (git log, every commit)
Documentation effort	2+ hours writing workpapers	0 — work product IS the documentation
Compliance evidence	4 hours/quarter to reconstruct for Deloitte	git log — always available, always complete
Part 9: Demo Script — The 25-Minute Walkthrough {#part-9}
Pre-Demo Setup
Sample SQLite database seeded with all data from Part 4
Three agent repos initialized with full definitions from Part 6
Close repo created but not yet opened
Browser sandbox (Clawless) available for zero-install demo option
Alternatively: terminal + VS Code for full-fidelity demo
Act 1: The Problem (3 minutes)
Show, don't tell. Open the shared drive folder structure from James's world:

Finance/
├── FY25/
│   ├── January/
│   │   ├── Close Workpapers/
│   │   │   ├── Bank Recon - Westpac Operating - Jan 2025 v3 FINAL.xlsx
│   │   │   ├── Bank Recon - Westpac Operating - Jan 2025 v3 FINAL (2).xlsx
│   │   │   ├── Bank Recon - Westpac Payroll - Jan 2025.xlsx
│   │   │   ├── AP Recon - Jan 2025 REVISED.xlsx
│   │   │   ├── Variance Commentary - Jan 2025 - DRAFT.docx
│   │   │   ├── Variance Commentary - Jan 2025 - FINAL with Priya edits.docx
│   │   │   ├── Proposed JEs - Jan 2025.xlsx
│   │   │   └── Close Checklist - Jan 2025.xlsx
│   │   └── Audit Evidence/
│   │       ├── Bank Statement - Westpac - Jan 2025.pdf
│   │       ├── Sarah approval email.msg
│   │       └── Telstra investigation emails.msg
Narration: "This is what a monthly close looks like at a real company. Seven versions of files. Approval evidence is a screenshot of an email. When Deloitte comes for the audit, James spends half a day reconstructing who approved what and when. The work is correct, but the proof is scattered."

Act 2: Atlas Reconciles Cash (8 minutes)
Open the terminal. Run the close:

$ gitclose open --entity MER-AU-ENG --period 2025-01
Show the branches being created. Then trigger Atlas:

$ gitclose run --task cash-recon-westpac-operating --agent atlas
Watch Atlas work in real time. The terminal shows each commit as it happens. After ~2 minutes, Atlas completes. Show:

The reconciliation workpaper (open output/cash-recon/westpac-operating-recon.md) — formatted, complete, balanced
The Telstra exception (open exceptions/EXC-2025-001-telstra-credit.md) — show the memory match: "Same amount from Telstra in October 2024, resolved as telecom refund, PR #641"
The git log — every step is a commit:
$ git log --oneline feature/cash-recon-westpac-operating

s9t0u1f feat(cash-recon): reconciliation workpaper — balanced ✓
p6q7r8e feat(cash-recon): EXCEPTION — Telstra credit $14,924.44 with memory match
m3n4o5d feat(cash-recon): classify outstanding items — 2 checks, 1 deposit in transit
j0k1l2c feat(cash-recon): classify known recurring items from MEMORY.md
g7h8i9b feat(cash-recon): classify timing items — 1 check clearance within period
d4e5f6a feat(cash-recon): transaction matching — 18 exact matches found
a1b2c3d feat(cash-recon): fetch bank statement and GL data for 1000-001 Jan-25
Narration: "Seven commits. Two minutes. Every single step is documented. The reconciliation balances to the cent. The Telstra exception wasn't just flagged — the agent found it had seen this exact pattern in October and told us how it was resolved last time. James would have spent an hour searching his email for that context."

Act 3: The PR Review — Maker-Checker as Git (5 minutes)
Open the pull request in the UI. Show:

The diff — every file the agent created is visible. The reviewer can see exactly what matched, what didn't, and why.
The exception with memory context — embedded in the PR.
Sarah's review — she reads, comments, approves.
The merge — one click. This IS the approval. The git history IS the evidence.
$ git log --oneline main

t3u4v5w Merge feature/cash-recon-westpac-operating (#1) [sarah.martinez]
Narration: "Sarah just reviewed and approved a reconciliation in a pull request. That merge event IS the maker-checker control. It records who reviewed it, when, and what they reviewed — permanently, immutably, automatically. When Deloitte asks 'who approved the January bank recon?', the answer is one git command."

Act 4: Nova Finds the Real Error (4 minutes)
Show Nova's PR. The AP reconciliation found the $5,200 cutoff error — an Arup invoice with a wrong posting date.

Narration: "This is not a timing difference. This is a genuine error. The invoice was entered in the AP sub-ledger on January 30 but the GL journal was posted to February 1. Nova detected it, traced it to the specific invoice, and proposed a correction. In James's world, this took 90 minutes of tracing through 47 invoices. Nova did it in 27 seconds."

Act 5: Echo Writes Commentary (3 minutes)
Show Echo's management commentary. Highlight:

Every explanation is attributed to a source (memory, data, prior period)
The Telstra refund context from memory enriches the commentary
The subcontractor in-housing is flagged as "structural — ongoing" (not one-off), using memory from November 2024
Narration: "This is what Priya gets. Not a spreadsheet with numbers — a narrative with explanations, sourced from actual data and institutional memory. When she sends this to the CFO, every number has a story behind it."

Act 6: The Auditor View (2 minutes)
Show the final state of the close repo:

$ git log --oneline --all

t3u4v5w (HEAD -> main, tag: v2025-01-close) Merge PR #1 [sarah.martinez]
a8b9c0d Merge PR #2 [sarah.martinez]
e1f2g3h Merge PR #3 [priya.sharma + sarah.martinez]
...
a1b2c3d feat(cash-recon): fetch bank statement and GL data
Narration: "When Deloitte arrives for the annual audit, they get read-only access to this repository. Every agent action is a commit. Every approval is a merge with a reviewer's name. Every exception is documented with its resolution. Every piece of institutional knowledge the agents used is in MEMORY.md with a PR reference. The audit evidence is richer, more complete, and more reliable than anything a human-driven process has ever produced — and it was generated automatically, at zero additional cost."

Closing (30 seconds)
Narration: "The January close took James three days and 18 hours of effort. It took three agents two minutes and Sarah one hour of review. The compliance overhead went from 25% of total effort to zero — because the architecture IS the compliance. And every month, the agents get smarter. The memory compounds. Exceptions that took hours to investigate become known patterns that resolve in seconds."

Part 10: UI Specifications {#part-10}
10.1 Close Dashboard
┌─────────────────────────────────────────────────────────────────┐
│  GITCLOSE                                            sarah.m ▾  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─── Active Close ────────────────────────────────────────┐   │
│  │  MERIDIAN ENGINEERING · January 2025 · CLOSE-2025-01    │   │
│  │  Status: ● IN REVIEW          Opened: Feb 3 08:30      │   │
│  │  Elapsed: 42 min              Agents: 3 active          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  TASKS                                                          │
│  ┌────────────────────────────────┬────────┬────────┬───────┐  │
│  │ Task                           │ Agent  │ Status │ PR    │  │
│  ├────────────────────────────────┼────────┼────────┼───────┤  │
│  │ Cash Recon — Westpac Operating │ Atlas  │ ✅ Done │ #1 ▸  │  │
│  │ Cash Recon — Westpac Payroll   │ Atlas  │ ⏳ Rev  │ #4 ▸  │  │
│  │ AP Sub-Ledger Reconciliation   │ Nova   │ ⏳ Rev  │ #2 ▸  │  │
│  │ P&L Variance Analysis          │ Echo   │ ✅ Done │ #3 ▸  │  │
│  └────────────────────────────────┴────────┴────────┴───────┘  │
│                                                                 │
│  EXCEPTIONS (2)                                                 │
│  ┌────────────────────────────┬───────────┬──────────────────┐ │
│  │ ID                         │ Amount    │ Status           │ │
│  ├────────────────────────────┼───────────┼──────────────────┤ │
│  │ EXC-001 Telstra Credit     │ $14,924   │ 🟡 Memory Match  │ │
│  │ EXC-002 Arup Cutoff        │ $5,200    │ 🔴 Correction    │ │
│  └────────────────────────────┴───────────┴──────────────────┘ │
│                                                                 │
│  ┌─── Progress ────────────────────────────────────────────┐   │
│  │  ████████████████████████████████████░░░░░░░  75%       │   │
│  │  3 of 4 tasks approved · 2 of 2 exceptions resolved     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
10.2 PR Review View
┌─────────────────────────────────────────────────────────────────┐
│  PR #1: January 2025 Cash Recon — Westpac Operating     REVIEW  │
├─────────────────────────────────────────────────────────────────┤
│  Author: Atlas (AI Agent)    Reviewer: Sarah Martinez           │
│  Branch: feature/cash-recon → main    Commits: 7    Files: 6   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  SUMMARY                                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Bank Balance:        $4,306,216.44                      │   │
│  │  GL Balance:          $4,287,341.56                      │   │
│  │  Adjusted (both):     $4,300,066.44  ✅ Balanced         │   │
│  │                                                          │   │
│  │  Matched:     19  │  Timing:  3  │  Recurring: 3        │   │
│  │  Exceptions:   1  │  JEs Proposed: 3                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  FILES CHANGED                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  + output/cash-recon/westpac-operating-recon.md    ▸     │   │
│  │  + output/cash-recon/westpac-operating-recon.xlsx  ▸     │   │
│  │  + output/cash-recon/matching-detail.md            ▸     │   │
│  │  + output/cash-recon/proposed-journals.csv         ▸     │   │
│  │  + exceptions/EXC-2025-001-telstra-credit.md       ▸     │   │
│  │  + output/cash-recon/source-data/...               ▸     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  EXCEPTION DETAIL                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ★ EXC-2025-001: Telstra Corp Credit — $14,924.44      │   │
│  │                                                          │   │
│  │  MEMORY MATCH FOUND                                      │   │
│  │  October 2024: Same counterparty, same amount.           │   │
│  │  Resolved as telecom refund. Posted DR Cash / CR IT.     │   │
│  │  Approved by Sarah Martinez in PR #641.                  │   │
│  │                                                          │   │
│  │  Suggested action: Confirm with Telstra, post same JE.   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  COMMENTS                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  sarah.martinez · 2 min ago                              │   │
│  │  "Confirmed Telstra credit — same pattern as Oct.        │   │
│  │   Approve the proposed JE."                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│         ┌──────────────┐    ┌──────────────────────┐           │
│         │  ✅ Approve    │    │  Request Changes     │           │
│         └──────────────┘    └──────────────────────┘           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
10.3 Auditor View (Read-Only)
┌─────────────────────────────────────────────────────────────────┐
│  GITCLOSE — AUDITOR VIEW                   deloitte.readonly ▾  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Entity: Meridian Engineering    Period: January 2025           │
│  Close Status: ● CLOSED          Tag: v2025-01-close           │
│  Closed By: Sarah Martinez       Closed At: Feb 3 09:30        │
│                                                                 │
│  AUDIT TRAIL                                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Feb 3 09:28  sarah.martinez  Merged PR #4 (payroll)     │   │
│  │ Feb 3 09:22  priya.sharma    Approved PR #3 (variance)  │   │
│  │ Feb 3 09:15  sarah.martinez  Merged PR #2 (AP recon)    │   │
│  │ Feb 3 09:05  sarah.martinez  Merged PR #1 (cash recon)  │   │
│  │ Feb 3 09:04  sarah.martinez  Comment on EXC-2025-001    │   │
│  │ Feb 3 08:38  echo            PR #3 created (variance)   │   │
│  │ Feb 3 08:36  nova            PR #2 created (AP recon)   │   │
│  │ Feb 3 08:33  atlas           PR #1 created (cash recon) │   │
│  │ Feb 3 08:30  sarah.martinez  Close opened               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  AGENT DEFINITIONS (as of close date)                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Atlas v1.2.0  │  RULES.md ▸  │  SOUL.md ▸  │  hooks/ ▸│   │
│  │  Nova  v1.0.2  │  RULES.md ▸  │  SOUL.md ▸  │  hooks/ ▸│   │
│  │  Echo  v1.1.0  │  RULES.md ▸  │  SOUL.md ▸  │  hooks/ ▸│   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ℹ  View is read-only. All files and history accessible.       │
│     Export audit package as PDF ▸                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
Part 11: Technical Implementation Plan {#part-11}
11.1 Technology Stack
Component	Technology	Rationale
Database	SQLite	Single-file, portable, no server. Seed with sample data. Realistic for mid-market.
Agent runtime	Node.js + gitagent-core	GitAgent standard compatible. Handles the orchestration loop.
LLM	Claude claude-sonnet-4-20250514 via API	Best balance of reasoning quality and cost for structured finance tasks
Git operations	isomorphic-git (Node) or native git CLI	Branching, committing, PRs all programmatic
PR / Review UI	Custom web app (Next.js) OR GitHub/Gitea for MVP	GitHub = zero UI development; custom = branded demo
Close dashboard	Next.js + TailwindCSS	Simple, fast, responsive
Browser demo	Clawless/WASM sandbox	Zero-install, zero-data-risk sales tool
Hosting (demo)	Vercel (dashboard) + local git repos	Free tier sufficient for demo
11.2 Build Sequence
WEEK 1-2: DATA + AGENTS
━━━━━━━━━━━━━━━━━━━━━━
□ Create SQLite database with complete schema
□ Seed all sample data (verified, balanced)
□ Write Atlas agent.yaml, SOUL.md, RULES.md, DUTIES.md
□ Implement Atlas tools (fetch, match, propose, commit)
□ Implement preToolUse and onException hooks
□ Write MEMORY.md with October Telstra pattern
□ Test: Atlas produces correct reconciliation output

WEEK 3: GIT INTEGRATION  
━━━━━━━━━━━━━━━━━━━━━━━
□ Implement close repo creation (gitclose open)
□ Implement branch creation per task
□ Implement agent → commit flow (each action = commit)
□ Implement PR creation with summary generation
□ Implement merge flow (human approve → merge to main)
□ Implement tag on close finalization
□ Test: Full cash recon creates 7 commits on branch, PR, merge

WEEK 4: NOVA + ECHO
━━━━━━━━━━━━━━━━━━━
□ Write Nova agent definitions
□ Implement Nova tools (AP query, invoice trace)
□ Write Echo agent definitions
□ Implement Echo tools (budget query, variance compute, narrative)
□ Test: All three agents produce correct output in parallel

WEEK 5: UI + DEMO POLISH
━━━━━━━━━━━━━━━━━━━━━━━━
□ Build close dashboard page
□ Build PR review view (or integrate with Gitea)
□ Build auditor view (read-only)
□ Build the "traditional workflow" slide/view for comparison
□ Write demo narration script
□ Record backup video demo

WEEK 6: BROWSER DEMO + HARDENING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Package Atlas for Clawless browser sandbox
□ Test zero-install demo flow
□ Edge case handling (agent errors, incomplete data)
□ Performance optimization (demo must be snappy)
□ Dry-run demo with test audience
□ Iterate on feedback
11.3 What's Real vs. Simulated in MVP
Component	Real	Simulated	Notes
LLM reasoning	✅ Real		Claude actually reads data, matches transactions, reasons about exceptions
Git operations	✅ Real		Real commits, real branches, real PRs, real merge history
Memory lookup	✅ Real		Agent actually reads MEMORY.md and finds the Telstra pattern
Hook execution	✅ Real		preToolUse.js actually runs and enforces rules
Bank/GL data		✅ Simulated	SQLite with sample data (no live ERP or bank connection)
NetSuite integration		✅ Simulated	Tools read from SQLite, not from actual NetSuite API
Email notifications		✅ Simulated	Shown in UI as log entries, not actual emails sent
Multi-user review		✅ Simulated	Demo operator plays both agent role and reviewer role
Production scale		✅ Simulated	23 transactions, not 23,000. Proves concept, not scale.
The critical distinction: The architecture is real. The data is simulated. When we move to a pilot with a real customer, we swap the SQLite data layer for their actual ERP/bank feeds. Everything else — the git workflow, the agents, the memory, the hooks, the PR review — stays exactly the same.

11.4 Success Criteria for MVP Demo
Criterion	Measurement	Threshold
Reconciliation accuracy	Does Atlas produce a balanced reconciliation with correct classifications?	100% (it must balance; partial credit is not a thing in recon)
Exception detection	Does Atlas correctly flag the Telstra credit and cite the October memory?	Yes/No — this is the key "wow moment"
Cutoff error detection	Does Nova identify the Arup posting date error?	Yes/No
Commentary quality	Does Echo generate variance commentary that an FP&A manager would accept?	Qualitative — reviewed by a finance professional
Audit trail completeness	Can every material action be traced to a specific commit and PR?	100% coverage
Time to demo	How long from "open close" to "all PRs merged"?	< 5 minutes (excluding human review time)
Audience reaction	Does the demo audience understand and believe the transformation?	Qualitative — "I want this" vs. "interesting but..."
Appendix A: Key File Contents for Demo
close.yaml (Close Execution Configuration)
close_id: CLOSE-2025-01
entity: MER-AU-ENG
entity_name: Meridian Engineering Pty Ltd
period: "2025-01"
currency: AUD

status: IN_PROGRESS
opened_by: sarah.martinez
opened_at: "2025-02-03T08:30:00+11:00"

tasks:
  - id: task-001
    name: "Cash Recon — Westpac Operating"
    type: RECONCILIATION
    agent: atlas
    branch: feature/cash-recon-westpac-operating
    gl_account: "1000-001"
    reviewer: sarah.martinez
    
  - id: task-002
    name: "Cash Recon — Westpac Payroll"
    type: RECONCILIATION
    agent: atlas
    branch: feature/cash-recon-westpac-payroll
    gl_account: "1000-002"
    reviewer: sarah.martinez
    
  - id: task-003
    name: "AP Sub-Ledger Reconciliation"
    type: RECONCILIATION
    agent: nova
    branch: feature/ap-recon
    gl_account: "2000-001"
    reviewer: sarah.martinez
    
  - id: task-004
    name: "P&L Variance Analysis"
    type: VARIANCE_ANALYSIS
    agent: echo
    branch: feature/variance-analysis
    reviewer: priya.sharma

materiality:
  overall: 50000
  trivial: 5000
  commentary_threshold_pct: 5

approval:
  required_reviewers: 1
  controller_must_approve: true
  merge_creates_audit_record: true
exceptions/EXC-2025-001-telstra-credit.md
# Exception EXC-2025-001: Telstra Corporation Credit

| Field | Value |
|---|---|
| **ID** | EXC-2025-001 |
| **Created** | 2025-02-03 08:32:52 |
| **Created by** | Atlas (agent) |
| **Commit** | p6q7r8e |
| **Task** | Cash Recon — Westpac Operating |
| **Amount** | $14,924.44 (credit) |
| **Bank Reference** | CT-UNK-8890 |
| **Counterparty** | TELSTRA CORPORATION |
| **Date** | 2025-01-28 |
| **Status** | ESCALATED |
| **Assigned to** | james.wong@meridian.com.au |

## Description

Unidentified credit transfer of $14,924.44 from Telstra Corporation
received on January 28, 2025. No corresponding GL entry, AP invoice,
or AR credit note found.

## Memory Match

**HIGH CONFIDENCE match found in MEMORY.md:**

> **October 2024**: Received credit of $14,924.44 from Telstra Corp.
> Initially unidentified. James Wong investigated — confirmed as telecom
> services refund for overpayment on account MER-TEL-2024-08.
> Posted: DR 1000-001 / CR 6000-006 (IT & Software) $14,924.44
> Approved by: Sarah Martinez (PR #641, merged 2024-10-08)
> Contact: Telstra Account Manager — Rebecca Liu (02 9654 3200)

## Recommendation

This appears to be the same recurring refund pattern. Recommend:

1. Contact Rebecca Liu at Telstra (02 9654 3200) to confirm
2. If confirmed, post: DR 1000-001 / CR 6000-006 $14,924.44
3. If this is the **third occurrence**, escalate as systemic issue
   (Rule #9) and consider setting up a standing journal or GL account.

## Resolution

| Field | Value |
|---|---|
| **Resolved by** | sarah.martinez |
| **Resolved at** | 2025-02-03 09:04 |
| **Resolution** | Confirmed as recurring Telstra refund per memory match. Approved proposed JE. |
| **Resolution commit** | (within PR #1 merge) |
| **Added to memory** | Yes — updated MEMORY.md with January 2025 instance |
output/variance/management-commentary.md (Echo's Output)
# P&L Variance Analysis — Management Commentary
## Meridian Engineering Pty Ltd — January 2025

**Prepared by:** Echo (AI Agent) | **Date:** 2025-02-03
**Reviewed by:** Priya Sharma (FP&A Manager)

---

### Executive Summary

January 2025 operating profit of **$2.14M** was **$645K (23.2%) below budget**,
driven primarily by timing of contract commencements in Engineering Services
and one-off costs. Year-over-year, revenue grew 7.7% and operating profit
grew 2.3%, indicating underlying business health despite the budget miss.

---

### Revenue ($15.51M actual vs $15.95M budget — $440K unfavorable, −2.8%)

**Engineering Services Revenue: $11.80M vs $12.50M budget (−$700K, −5.6%)** ★

Two contracts budgeted to commence in January experienced delays:
- **Woodside Phase 2** (deep-water structural engineering): Client delayed
  final environmental approval. Commencement now expected mid-February.
  Contract value: $4.2M over 18 months. January impact: ~$450K deferred.
- **Santos LNG Expansion** (pipeline engineering): Equipment delivery delay
  pushed mobilization to February. January impact: ~$250K deferred.

*These are timing deferrals, not revenue losses. Both contracts remain
signed and expected to commence in February.*
*Source: MEMORY.md — contract status updates from December review.*

**Project Management Fees: $3.50M vs $3.20M budget (+$300K, +9.4%)** ★

Transurban M5 motorway project achieved practical completion milestone
on January 18, triggering an early completion bonus per contract
Appendix C, Schedule 4. This was not budgeted as the baseline assumption
was a February completion.

*One-off uplift. PM fee run-rate expected to normalize in February.*

**Advisory & Consulting: $210K vs $250K budget (−$40K, −16.0%)**

Below materiality threshold for detailed commentary. Minor shortfall
due to lower ad-hoc consulting engagement volume.

---

### Cost of Sales ($10.41M actual vs $10.30M budget — $110K unfavorable, −1.1%)

**Subcontractor Costs: $2.80M vs $3.20M budget (+$400K favorable, +12.5%)** ★

This is a **structural change**, not a one-off. In November 2024,
management decided to bring the Aurecon scope in-house for the
Pilbara remediation and Barangaroo projects. January is the first
full month reflecting this change. Direct labor (5000-001) shows
a corresponding increase of $150K, but the net effect is a $250K
cost saving.

*Expect ongoing ~$400K/month favorable variance against current budget.
Budget reforecast recommended.*
*Source: MEMORY.md — Aurecon in-housing decision, November 2024.*

**Project Travel: $580K vs $400K budget (−$180K unfavorable, −45.0%)** ★★

Unplanned site mobilization for BHP Pilbara emergency remediation
project, commenced January 12. Required FIFO travel for 14 engineers
over a 3-week emergency deployment. This is a billable engagement
(revenue recognized under Engineering Services), so the travel cost
is offset by project margin.

*One-off. Not expected to recur at this level.*

**Materials & Supplies: $1.68M vs $1.50M budget (−$180K unfavorable, −12.0%)** ★

Elevated procurement for the BHP Pilbara emergency deployment (PPE,
testing equipment, consumables). Directly related to the unplanned
mobilization above.

---

### Operating Expenses ($2.96M actual vs $2.87M budget — $95K unfavorable, −3.3%)

**Professional Fees: $225K vs $150K budget (−$75K unfavorable, −50.0%)** ★★

One-off engagement with Herbert Smith Freehills for Queensland
environmental regulatory review related to Bowen Basin project.
Invoice HSF-2025-0112 ($75K) received January 22. This is a
discrete legal matter — not expected to recur.

**Marketing & BD: $72K vs $95K budget (+$23K favorable, +24.2%)**

Deferred AusIMM industry conference sponsorship from Q1 to Q2.
Timing only — cost will be incurred in April. No impact on
full-year outlook.

---

### Year-over-Year Comparison

| Line | Jan 2024 | Jan 2025 | Change | % |
|---|---|---|---|---|
| Total Revenue | $14.38M | $15.51M | +$1.13M | +7.9% |
| Gross Profit | $4.51M | $5.10M | +$0.59M | +13.1% |
| Operating Profit | $2.09M | $2.14M | +$0.05M | +2.3% |

Despite the budget miss, year-over-year growth remains healthy.
Revenue growth of 7.9% reflects expanded project portfolio.
Gross margin improved from 31.4% to 32.9%, partly due to the
subcontractor in-housing decision.

---

*All variance explanations are sourced from available data,
agent memory (MEMORY.md), or flagged as requiring investigation.
No explanations in this commentary are speculative.*
End of MVP Specification.

This document contains sufficient detail to build a working demonstration. The sample data is internally consistent and mathematically verified. The agent definitions are complete enough to implement. The demo script is structured to tell a compelling story in 25 minutes. The architecture proves the core thesis: in a git-native system, doing the work IS documenting the work IS proving the work was done correctly.