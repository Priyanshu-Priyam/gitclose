# Requirements: What a Solution Must Provide

## Functional Requirements

| # | Requirement | Rationale |
|---|---|---|
| F1 | Reconcile bank statements to GL balances automatically | Core close task — highest volume, highest pain |
| F2 | Reconcile sub-ledgers to GL control accounts | Second most common reconciliation task |
| F3 | Generate variance commentary from budget, actual, and context | Most time-consuming analytical task per close |
| F4 | Produce audit-quality workpapers | Output must meet auditor evidence standards |
| F5 | Track exceptions with investigation and resolution | Core workflow — not everything auto-resolves |
| F6 | Propose (not post) journal entries | Read-only GL access for safety |
| F7 | Learn from resolved exceptions | Knowledge must compound, not reset each month |

## Control Requirements

| # | Requirement | Rationale |
|---|---|---|
| C1 | Maker ≠ Checker (agent prepares, human approves) | Regulatory requirement — SOX, APRA, Basel |
| C2 | Complete audit trail for all material actions | Every action traceable to an actor and timestamp |
| C3 | Role-based access control | Agents cannot exceed their authority |
| C4 | Materiality-based escalation | Items above thresholds require human judgment |
| C5 | Immutable history | Records cannot be altered after the fact |

## Deployment Requirements

| # | Requirement | Rationale |
|---|---|---|
| D1 | Data never leaves customer environment | Non-negotiable for financial services |
| D2 | Model-agnostic (Claude, GPT, Azure, on-prem) | Customers have different data classification policies |
| D3 | No new UI for core workflow | Finance people live in Excel and Outlook |
| D4 | Zero-install demo capability | Sales weapon — CFO sees value before procurement |

## Non-Requirements (What We Explicitly Exclude)

| Exclusion | Why |
|---|---|
| Replace the ERP | ERPs work fine for recording; we're solving verification/interpretation |
| Eliminate human review | Humans must remain in the loop for governance; this is non-negotiable and desirable |
| Handle 100% of exceptions | Some exceptions require genuinely novel judgment; the agent escalates these |
| Real-time continuous close | Monthly cadence is the adoption path; continuous is a future state |
