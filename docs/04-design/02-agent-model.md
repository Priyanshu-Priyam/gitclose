# Agent Model

## The GitAgent Standard

GitClose agents follow the **GitAgent standard** developed by Shreyas Kapale
at Lyzr. An agent is a git repository containing definition files:

agent-name/ ├── agent.yaml # Configuration, model, tools, permissions ├── SOUL.md # Core identity and instructions ├── RULES.md # Guardrails and escalation thresholds ├── DUTIES.md # RACI matrix ├── tools/ # Available capabilities ├── skills/ # Documented procedures ├── hooks/ # Programmatic constraints └── memory/ └── MEMORY.md # Accumulated knowledge

## Design Philosophy: File = Control

Every file in an agent's definition maps to a financial control concept:

| File | Finance Control | Why This Mapping Matters |
|---|---|---|
| agent.yaml | Role definition, delegation of authority | Who this agent is and what it's authorized to do |
| SOUL.md | Accounting policy manual, job description | How the agent approaches its work |
| RULES.md | Control procedures, escalation policy | What the agent must and must not do |
| DUTIES.md | RACI matrix | Who is responsible, accountable, consulted, informed |
| hooks/ | Automated control tests | Programmatic enforcement of thresholds and rules |
| memory/ | Institutional knowledge base | Accumulated exception patterns and resolutions |

**The agent definition IS the control documentation.** When an auditor asks
"what controls govern this reconciliation process?", the answer is: read the
agent's RULES.md. When they ask "has the control changed since last year?",
the answer is: `git diff v2024-12 v2025-01 -- RULES.md`.

## The Three Agents

### Atlas (Cash Reconciliation)

**Purpose:** Reconcile bank statements to GL cash balances.
**Difficulty:** Medium — mostly rule-based matching with occasional exceptions.
**Memory value:** High — recurring bank items compound quickly.
**Key constraint:** MUST escalate unidentified credits > $10,000.

### Nova (AP Sub-Ledger Reconciliation)

**Purpose:** Reconcile AP sub-ledger to GL payables account.
**Difficulty:** Medium — invoice-level matching; cutoff errors are common.
**Memory value:** Medium — vendor-specific patterns emerge over time.
**Key constraint:** MUST detect period boundary errors (wrong posting date).

### Echo (Variance Commentary)

**Purpose:** Generate P&L management commentary with sourced explanations.
**Difficulty:** High — requires narrative generation with factual grounding.
**Memory value:** Very High — business context from prior periods is essential.
**Key constraint:** MUST attribute every explanation to a source. NEVER speculate.
