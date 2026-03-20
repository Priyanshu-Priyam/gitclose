-- GitClose Seed Data — Meridian Engineering Pty Ltd, January 2025
-- All balances mathematically verified (see verify.sql)

-- ═══════════════════════════════════════════════════════════
-- ENTITY
-- ═══════════════════════════════════════════════════════════
INSERT INTO entities VALUES
('MER-AU-ENG', 'Meridian Engineering Pty Ltd', 'AU', 'AUD', 'FY25', 'NetSuite');

-- ═══════════════════════════════════════════════════════════
-- CHART OF ACCOUNTS
-- ═══════════════════════════════════════════════════════════
INSERT INTO chart_of_accounts (account_id, account_name, account_type, normal_balance) VALUES
('1000-001', 'Westpac Operating Account',      'ASSET',         'DEBIT'),
('1000-002', 'Westpac Payroll Account',         'ASSET',         'DEBIT'),
('1100-001', 'Accounts Receivable',             'ASSET',         'DEBIT'),
('2000-001', 'Trade Payables',                  'LIABILITY',     'CREDIT'),
('4000-001', 'Engineering Services Revenue',    'REVENUE',       'CREDIT'),
('4000-002', 'Project Management Fees',         'REVENUE',       'CREDIT'),
('4000-003', 'Advisory & Consulting Revenue',   'REVENUE',       'CREDIT'),
('5000-001', 'Salaries & Wages - Direct',       'COS',           'DEBIT'),
('5000-002', 'Subcontractor Costs',             'COS',           'DEBIT'),
('5000-003', 'Materials & Supplies',            'COS',           'DEBIT'),
('5000-004', 'Project Travel',                  'COS',           'DEBIT'),
('6000-001', 'Salaries & Wages - Indirect',     'OPEX',          'DEBIT'),
('6000-002', 'Rent & Occupancy',                'OPEX',          'DEBIT'),
('6000-003', 'Depreciation & Amortisation',     'OPEX',          'DEBIT'),
('6000-004', 'Insurance',                       'OPEX',          'DEBIT'),
('6000-005', 'Professional Fees',               'OPEX',          'DEBIT'),
('6000-006', 'IT & Software',                   'OPEX',          'DEBIT'),
('6000-007', 'Marketing & BD',                  'OPEX',          'DEBIT'),
('6000-008', 'General & Admin',                 'OPEX',          'DEBIT'),
('7000-001', 'Interest Income',                 'OTHER_INCOME',  'CREDIT'),
('7000-002', 'Interest Expense',                'OTHER_EXPENSE', 'DEBIT'),
('7000-004', 'Bank Fees & Charges',             'OTHER_EXPENSE', 'DEBIT');

-- ═══════════════════════════════════════════════════════════
-- GL TRANSACTIONS — Account 1000-001 (Westpac Operating)
-- January 2025 — 22 journal entries (44 GL lines)
-- Opening: $2,830,241.56 → Closing: $4,287,341.56
-- ═══════════════════════════════════════════════════════════

-- WEEK 1 (Jan 2-3)
INSERT INTO gl_transactions
  (journal_id, entity_id, account_id, posting_date, amount, description, source, reference, created_by, period) VALUES
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

-- ═══════════════════════════════════════════════════════════
-- AP INVOICE ACCRUAL ENTRIES (non-cash, hit 2000-001 and expense)
-- ═══════════════════════════════════════════════════════════
INSERT INTO gl_transactions
  (journal_id, entity_id, account_id, posting_date, amount, description, source, reference, created_by, period) VALUES
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

-- ═══════════════════════════════════════════════════════════
-- BANK STATEMENT — Westpac Operating, January 2025
-- Opening: $2,830,241.56  Closing: $4,306,216.44
-- ═══════════════════════════════════════════════════════════
INSERT INTO bank_statements VALUES
('BS-WBC-2025-01', 'Westpac', 'XXXX-XXXX-4721', '1000-001',
 'MER-AU-ENG', '2025-01-31',
 2830241.56,
 4306216.44,
 'AUD', '2025-01-31 18:00:00');

-- ═══════════════════════════════════════════════════════════
-- BANK TRANSACTIONS — 23 items total
-- 18 matched, 1 timing match, 4 bank-only
-- ═══════════════════════════════════════════════════════════
INSERT INTO bank_transactions VALUES
-- MATCHED ITEMS (18)
('BT-001','BS-WBC-2025-01','2025-01-02','2025-01-02',-125000.00,
 'TRANSFER TO 4738 PAYROLL','TRF-20250102','TRANSFER','MERIDIAN ENGINEERING',0,NULL),
('BT-002','BS-WBC-2025-01','2025-01-02','2025-01-02',287500.00,
 'CREDIT TRANSFER BHP BILLITON LTD','CT-8890201','CREDIT_TRANSFER','BHP BILLITON',0,NULL),
('BT-003','BS-WBC-2025-01','2025-01-07','2025-01-07',445000.00,
 'CREDIT TRANSFER RIO TINTO LIMITED','CT-8890445','CREDIT_TRANSFER','RIO TINTO',0,NULL),
('BT-004','BS-WBC-2025-01','2025-01-08','2025-01-08',-42500.00,
 'EFT PAYMENT WSP GLOBAL','EFT-8801','EFT','WSP GLOBAL',0,NULL),
('BT-005','BS-WBC-2025-01','2025-01-09','2025-01-09',-67800.00,
 'EFT PAYMENT LENDLEASE BUILDING','EFT-8802','EFT','LENDLEASE',0,NULL),
('BT-006','BS-WBC-2025-01','2025-01-10','2025-01-10',182000.00,
 'CREDIT TRANSFER TRANSURBAN GROUP','CT-8890512','CREDIT_TRANSFER','TRANSURBAN',0,NULL),
('BT-007','BS-WBC-2025-01','2025-01-13','2025-01-13',-125000.00,
 'TRANSFER TO 4738 PAYROLL','TRF-20250113','TRANSFER','MERIDIAN ENGINEERING',0,NULL),
('BT-008','BS-WBC-2025-01','2025-01-14','2025-01-14',-35400.00,
 'EFT PAYMENT ARUP GROUP','EFT-8810','EFT','ARUP',0,NULL),
('BT-009','BS-WBC-2025-01','2025-01-15','2025-01-15',520000.00,
 'CREDIT TRANSFER NSW GOVERNMENT','CT-8890601','CREDIT_TRANSFER','NSW GOVT',0,NULL),
('BT-010','BS-WBC-2025-01','2025-01-16','2025-01-16',-89500.00,
 'EFT PAYMENT DEXUS PROPERTY','EFT-8815','EFT','DEXUS PROPERTY',0,NULL),
('BT-011','BS-WBC-2025-01','2025-01-20','2025-01-20',315000.00,
 'CREDIT TRANSFER FORTESCUE METALS','CT-8890680','CREDIT_TRANSFER','FORTESCUE',0,NULL),
('BT-012','BS-WBC-2025-01','2025-01-21','2025-01-21',-28750.00,
 'EFT PAYMENT JACOBS ENGINEERING','EFT-8820','EFT','JACOBS',0,NULL),
('BT-013','BS-WBC-2025-01','2025-01-22','2025-01-22',-15600.00,
 'EFT PAYMENT ATLASSIAN PTY LTD','EFT-8822','EFT','ATLASSIAN',0,NULL),
('BT-014','BS-WBC-2025-01','2025-01-23','2025-01-23',198000.00,
 'CREDIT TRANSFER WOODSIDE ENERGY','CT-8890710','CREDIT_TRANSFER','WOODSIDE',0,NULL),
('BT-015','BS-WBC-2025-01','2025-01-27','2025-01-27',-125000.00,
 'TRANSFER TO 4738 PAYROLL','TRF-20250127','TRANSFER','MERIDIAN ENGINEERING',0,NULL),
('BT-016','BS-WBC-2025-01','2025-01-28','2025-01-28',-55000.00,
 'EFT PAYMENT GHD GROUP PTY LTD','EFT-8830','EFT','GHD GROUP',0,NULL),
('BT-017','BS-WBC-2025-01','2025-01-29','2025-01-29',168500.00,
 'CREDIT TRANSFER ORIGIN ENERGY','CT-8890788','CREDIT_TRANSFER','ORIGIN ENERGY',0,NULL),
('BT-018','BS-WBC-2025-01','2025-01-31','2025-01-31',75000.00,
 'CREDIT TRANSFER SANTOS LIMITED','CT-8890800','CREDIT_TRANSFER','SANTOS',0,NULL),

-- TIMING MATCH (GL Jan 6, Bank Jan 9 — check clearance)
('BT-023','BS-WBC-2025-01','2025-01-09','2025-01-09',-18200.00,
 'CHECK 4891 AURECON ENGINEERING','CHK-4891','CHECK','AURECON',0,NULL),

-- BANK-ONLY ITEMS (4) — agent must detect these
('BT-019','BS-WBC-2025-01','2025-01-31','2025-01-31',-125.00,
 'MONTHLY SERVICE FEE','FEE-202501','FEE','WESTPAC',0,NULL),
('BT-020','BS-WBC-2025-01','2025-01-31','2025-01-31',340.44,
 'CREDIT INTEREST','INT-202501','INTEREST','WESTPAC',0,NULL),
('BT-021','BS-WBC-2025-01','2025-01-31','2025-01-31',-2415.00,
 'DIRECT DEBIT QBE INSURANCE','DD-QBE-202501','DIRECT_DEBIT','QBE INSURANCE',0,NULL),
-- THE EXCEPTION: Unidentified Telstra credit (demonstrates agent memory)
('BT-022','BS-WBC-2025-01','2025-01-28','2025-01-28',14924.44,
 'CREDIT TRANSFER TELSTRA CORP','CT-UNK-8890','CREDIT_TRANSFER','TELSTRA CORPORATION',0,NULL);

-- ═══════════════════════════════════════════════════════════
-- AP INVOICES — Open at January 31
-- ═══════════════════════════════════════════════════════════
INSERT INTO ap_invoices VALUES
-- Prior period carryforward (open invoices from earlier periods that haven't been paid)
('API-2024-0380','MER-AU-ENG','Lendlease','V-005','LL-8910',
 '2024-11-10','2024-12-10',95000.00,'AUD','5000-002','OPEN',NULL,'2024-11',
 'Earthworks - M12 Motorway stage 2'),
('API-2024-0385','MER-AU-ENG','Aurecon Engineering','V-001','AE-8890',
 '2024-11-15','2024-12-15',72000.00,'AUD','5000-002','OPEN',NULL,'2024-11',
 'Survey & mapping - Inland Rail corridor'),
('API-2024-0390','MER-AU-ENG','WSP Global','V-002','WSP-22080',
 '2024-11-20','2024-12-20',55200.00,'AUD','5000-002','OPEN',NULL,'2024-11',
 'Traffic impact study - Cross River Rail'),
('API-2024-0395','MER-AU-ENG','Arup Group','V-003','ARUP-7650',
 '2024-12-05','2025-01-05',48500.00,'AUD','5000-002','OPEN',NULL,'2024-12',
 'Wind loading analysis - 55 Pitt Street'),
('API-2024-0400','MER-AU-ENG','GHD Group','V-006','GHD-3290',
 '2024-12-10','2025-01-10',35000.00,'AUD','5000-002','OPEN',NULL,'2024-12',
 'Stormwater drainage design - Parramatta'),
('API-2024-0405','MER-AU-ENG','Jacobs Engineering','V-004','JE-1085',
 '2024-12-12','2025-01-12',21000.00,'AUD','5000-002','OPEN',NULL,'2024-12',
 'Signalling assessment - Sydney Metro West'),
('API-2024-0412','MER-AU-ENG','Lendlease','V-005','LL-8990',
 '2024-12-15','2025-01-15',124500.00,'AUD','5000-002','OPEN',NULL,'2024-12',
 'Structural engineering - Westconnex Phase 3'),
('API-2024-0418','MER-AU-ENG','WSP Global','V-002','WSP-22150',
 '2024-12-20','2025-01-20',38750.00,'AUD','5000-002','OPEN',NULL,'2024-12',
 'Environmental assessment - Hunter Valley'),

-- January 2025 invoices (posted to GL above)
('API-2025-0003','MER-AU-ENG','Aurecon Engineering','V-001','AE-9001',
 '2025-01-05','2025-02-05',48200.00,'AUD','5000-002','OPEN',NULL,'2025-01',
 'Geotechnical survey - Pilbara'),
('API-2025-0008','MER-AU-ENG','WSP Global','V-002','WSP-22180',
 '2025-01-08','2025-02-08',31500.00,'AUD','5000-002','OPEN',NULL,'2025-01',
 'Air quality modelling - Kwinana'),
('API-2025-0012','MER-AU-ENG','Lendlease','V-005','LL-9045',
 '2025-01-12','2025-02-12',85400.00,'AUD','5000-002','OPEN',NULL,'2025-01',
 'Scaffolding & access - North Sydney metro'),
('API-2025-0018','MER-AU-ENG','GHD Group','V-006','GHD-3340',
 '2025-01-18','2025-02-18',42000.00,'AUD','5000-002','OPEN',NULL,'2025-01',
 'Water treatment design review'),
('API-2025-0022','MER-AU-ENG','Jacobs Engineering','V-004','JE-1120',
 '2025-01-22','2025-02-22',19800.00,'AUD','5000-002','OPEN',NULL,'2025-01',
 'Signal engineering - Melbourne Metro'),
('API-2025-0025','MER-AU-ENG','Cisco Systems','V-007','CISCO-4455',
 '2025-01-25','2025-02-25',28500.00,'AUD','6000-006','OPEN',NULL,'2025-01',
 'Network equipment - Sydney office'),
('API-2025-0028','MER-AU-ENG','Arup Group','V-003','ARUP-7780',
 '2025-01-28','2025-02-28',62000.00,'AUD','5000-002','OPEN',NULL,'2025-01',
 'Structural analysis - Barangaroo Phase 2'),

-- THE CUTOFF ERROR: Invoice in AP sub-ledger but GL entry posted to Feb
('API-2025-0031','MER-AU-ENG','Arup Group','V-003','ARUP-7795',
 '2025-01-30','2025-03-01',5200.00,'AUD','5000-002','OPEN',NULL,'2025-01',
 'Additional scope - Barangaroo fire compliance');

-- ═══════════════════════════════════════════════════════════
-- BUDGET LINES — January 2025
-- ═══════════════════════════════════════════════════════════
INSERT INTO budget_lines (entity_id, account_id, period, budget_amount, budget_version, notes) VALUES
('MER-AU-ENG','4000-001','2025-01',-12500000.00,'FY25-V1',
 'Engineering services — based on signed contracts + pipeline'),
('MER-AU-ENG','4000-002','2025-01',-3200000.00,'FY25-V1',
 'PM fees — Transurban M5 + NSW Rail'),
('MER-AU-ENG','4000-003','2025-01',-250000.00,'FY25-V1',
 'Advisory — ad hoc consulting engagements'),
('MER-AU-ENG','5000-001','2025-01',5200000.00,'FY25-V1',
 'Direct labor — 310 billable FTEs x avg $16.8K/mo'),
('MER-AU-ENG','5000-002','2025-01',3200000.00,'FY25-V1',
 'Subcontractors — Aurecon + Lendlease + others'),
('MER-AU-ENG','5000-003','2025-01',1500000.00,'FY25-V1',
 'Materials — project supplies, PPE, consumables'),
('MER-AU-ENG','5000-004','2025-01',400000.00,'FY25-V1',
 'Project travel — domestic + Pilbara FIFO'),
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
('MER-AU-ENG','7000-001','2025-01',-5000.00,'FY25-V1',
 'Interest income on operating account'),
('MER-AU-ENG','7000-002','2025-01',12000.00,'FY25-V1',
 'Interest expense on equipment facility'),
('MER-AU-ENG','7000-004','2025-01',2000.00,'FY25-V1',
 'Bank fees & charges');

-- ═══════════════════════════════════════════════════════════
-- PRIOR PERIOD ACTUALS — Jan 2025 + Jan 2024 (YoY)
-- ═══════════════════════════════════════════════════════════
INSERT INTO prior_period_actuals (entity_id, account_id, period, actual_amount) VALUES
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
