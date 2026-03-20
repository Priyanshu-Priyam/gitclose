# Memory and Learning: How Agents Improve Over Time

## The Institutional Knowledge Problem

Every CFO office has a "Sarah" — the person who has been reconciling a specific
account for years and knows every recurring exception, every vendor quirk,
every seasonal pattern. When Sarah leaves, that knowledge walks out the door.
The replacement spends 6-12 months rebuilding it, making the same mistakes,
investigating the same known items.

This is not a technology problem in the traditional sense. It's a *storage*
problem: valuable operational knowledge exists only in human memory.

## Git-Native Memory

In the GitAgent standard (developed by Shreyas Kapale at Lyzr), an agent's
memory is a markdown file committed to a git repository: `memory/MEMORY.md`.

This is a deliberate design choice with profound consequences:

| Property | Description | Finance Value |
|---|---|---|
| **Persistent** | Committed to git, backed up to remote | Knowledge survives personnel changes |
| **Versioned** | Every update is a commit with a diff | "What did the agent learn in March?" = `git diff` |
| **Auditable** | Every memory entry has a PR reference | "Who authorized this auto-resolution rule?" = a merge event |
| **Branchable** | Fork the agent = fork the memory | Onboard a new entity by forking + adjusting |
| **Searchable** | Plain text, grep-friendly | Agent searches before flagging exceptions |
| **Human-readable** | Markdown, not database blobs | Auditors and managers can read it directly |

## How Memory Compounds

### Month 1 (Agent deployment)

Atlas encounters 5 unmatched bank items. All are escalated to a human.

- Bank fee: $125 → James says "post to bank fees, same every month"
- Interest: $340 → James says "post to interest income"
- QBE insurance: $2,415 → James says "post to insurance expense"
- Telstra credit: $14,924.44 → James investigates, confirms it's a refund
- Unknown debit: $89.50 → James investigates, it was a merchant error

Atlas resolves 0/5 independently. Memory updated with 5 entries.

### Month 2

Atlas encounters 4 unmatched items (one is new).

- Bank fee: $125 → **Memory match.** Auto-proposes JE. (No human needed.)
- Interest: $315 → **Memory match.** Auto-proposes JE.
- QBE insurance: $2,415 → **Memory match.** Auto-proposes JE.
- New: ATO direct debit: $42,800 → No memory match. Escalated to human.

Atlas resolves 3/4 independently. Human handles 1.

### Month 6

Atlas encounters 5 unmatched items. 4 are known patterns from memory.

- Bank fee, interest, QBE insurance, and ATO quarterly payment → all auto-resolved
- New: Telstra credit appears again ($14,924.44) → Memory match from Month 1.
  Agent proposes the same treatment with a reference to the original resolution.
  Human confirms in 30 seconds instead of investigating for an hour.

Atlas resolves 4/5 independently. 1 escalated but with a hypothesis.

### Month 12

Atlas has accumulated knowledge of every recurring bank item, every seasonal
pattern, every vendor quirk. Exception rate has dropped from 100% (Month 1)
to ~10% (only genuinely novel items). Total human time per reconciliation
has dropped from 90 minutes to 10 minutes.

EXCEPTION RATE OVER TIME

100% │● │ ● 80% │ ● │ ● 60% │ ● │ ● 40% │ ● │ ● ● 20% │ ● ● │ ● ● ● 0% │────────────────────────── M1 M2 M3 M4 M5 M6 ... M12

Each resolved exception becomes a known pattern.
 The agent gets smarter every month.
## Why This Matters Strategically

Traditional retention risk: "Sarah is leaving. We'll lose 6 years of knowledge."

Git-native agent memory: "Sarah's knowledge is in MEMORY.md. It was committed
when she resolved each exception, with PR references showing her approval.
The new agent instance (or the new human) inherits 6 years of patterns instantly."

This changes the economics of finance staffing. Institutional knowledge becomes
a **durable organizational asset** — version-controlled, auditable, transferable —
rather than a **fragile human dependency**.
