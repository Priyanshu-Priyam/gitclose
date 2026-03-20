# Security Model

## Data Sovereignty

The core security property: **financial data never leaves the customer's
environment.**

The system architecture enforces this:

| Data Type | Where It Lives | What Leaves |
|---|---|---|
| GL transactions | Customer's SQLite / ERP | Never |
| Bank statements | Customer's files | Never |
| AP invoices | Customer's database | Never |
| Agent work products | Customer's git repos | Never |
| Agent memory | Customer's git repos | Never |
| LLM prompts | Sent to API | Account-level summaries, no PII |
| LLM responses | Received from API | Reasoning and outputs |

For customers requiring full air-gap (government, defense, some banks):
deploy an on-premise model and set `model.provider: local` in agent.yaml.

## Access Control Layers

### Layer 1: Agent Permissions (agent.yaml)

```yaml
permissions:
  can_read: [bank_statements, gl_transactions, ...]
  cannot: [post_journal_entry, approve_own_work, modify_gl, ...]
```

The agent literally cannot call tools that aren't in its permitted set.

### Layer 2: Hook-Based Enforcement (hooks/preToolUse.js)

Programmatic checks before every tool invocation. Enforces materiality
thresholds, escalation rules, and access boundaries.

### Layer 3: Git Branch Protection

Agents cannot merge their own branches. Only designated reviewers (defined
in close.yaml) can approve and merge PRs. This is structural SOD.

### Layer 4: Immutable History

Git's hash chain makes retroactive modification detectable. If anyone alters
a commit after the fact, the hash changes and the history breaks.

## Audit Logging

Every agent action generates an entry in `.gitclose/audit.jsonl`:

```json
{
  "timestamp": "2025-02-03T08:31:04+11:00",
  "agent": "atlas",
  "action": "tool_call",
  "tool": "fetch_bank_statement",
  "params": {"account": "1000-001", "period": "2025-01"},
  "result": "23 transactions fetched",
  "commit": "a1b2c3d",
  "hook_result": {"allow": true}
}
```

This log is committed to the close repo, making it part of the immutable git history.
