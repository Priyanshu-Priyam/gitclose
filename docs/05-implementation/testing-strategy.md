# Testing Strategy

## Philosophy

Financial work is binary: it either balances or it doesn't. There is no
"mostly correct" bank reconciliation. Testing must verify mathematical
correctness at every layer.

## Layer 1: Data Integrity (scripts/verify.ts)

Run against `meridian.db` after every seed:

✓ GL balance for 1000-001: $4,287,341.56 (expected: $4,287,341.56) ✓ All 22 journals balance to $0.00 ✓ Bank statement closing: $4,306,216.44 (expected: $4,306,216.44) ✓ Bank transaction count: 23 (expected: 23) ✓ AP sub-ledger total: $812,550.00 (expected: $812,550.00) ✓ GL 2000-001 balance: $807,350.00 (expected: $807,350.00) ✓ AP-GL difference: $5,200.00 (expected: $5,200.00 — ARUP-7795 cutoff) ✓ Budget line count: 18 (expected: 18) ✓ Reconciliation proof: bank adj = GL adj = $4,300,066.44

**This runs as a pre-commit hook and before every demo.**

## Layer 2: Tool Unit Tests

Each tool function is tested in isolation:

| Tool | Test |
|---|---|
| `fetch_bank_statement` | Returns correct number of transactions, correct balances |
| `query_gl_balance` | Returns $4,287,341.56 for 1000-001, Jan 2025 |
| `match_transactions` | Matches BT-002 to JE-2025-0003 (exact match on amount) |
| `match_transactions` | Matches BT-023 to JE-2025-0012 (reference match, different dates) |
| `match_transactions` | Does NOT match BT-022 (Telstra — no GL counterpart) |
| `query_ap_subledger` | Returns correct count and total for open invoices |
| `compute_variances` | Produces correct $ and % variance for each P&L line |

## Layer 3: Agent Integration Tests

End-to-end test for each agent against sample data:

| Agent | Verification |
|---|---|
| Atlas | Produces reconciliation where adjusted bank = adjusted GL = $4,300,066.44 |
| Atlas | Flags Telstra credit as exception with memory match reference |
| Atlas | Proposes exactly 3 journal entries (bank fee, interest, insurance) |
| Atlas | Creates exactly 7 commits on the feature branch |
| Nova | Identifies $5,200 AP-GL difference |
| Nova | Traces difference to ARUP-7795 cutoff error |
| Echo | Generates commentary for all 6 flagged variances |
| Echo | Does not fabricate explanations (all attributed to sources) |

## Layer 4: Git State Tests

After a full close cycle:

✓ Close repo has 4 merged branches ✓ Main branch has 4 merge commits ✓ Tag v2025-01-close exists ✓ Every merge commit has a different author than branch commits ✓ audit.jsonl has entries for every tool call ✓ No files outside output/ and exceptions/ are modified by agents

## Layer 5: Demo Rehearsal

Run the complete demo 3 times before the real presentation:
1. First run: identify failures, fix them
2. Second run: time each section, adjust narration
3. Third run: record as backup video
