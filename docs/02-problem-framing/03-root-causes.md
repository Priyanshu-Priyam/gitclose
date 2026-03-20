# Root Causes: Why the Status Quo Persists

## The Architecture Is Wrong

The root cause of every pain point above is the same: **the architecture of
current tools creates an artificial separation between doing financial work,
documenting that work, and proving it was done correctly.**

This separation is not inherent to accounting. It's an artifact of the tools:

| Tool | Creates Separation Because... |
|---|---|
| Excel | No built-in audit trail. No version control. No approval mechanism. The work product has no memory of how it was created. |
| Email | The approval mechanism is disconnected from the work product. Evidence is in inboxes, not attached to deliverables. |
| Shared Drive | File storage with no provenance. Who put this file here? Is it the approved version? Was it modified after approval? |
| ERP | Captures transactions but not the verification and interpretation layer. The close process happens *outside* the ERP. |

## Why Traditional Automation Makes It Worse

When companies automate a reconciliation (using RPA, scripts, or rule engines),
they reduce the time spent on Step 1 (doing the work). But they add a new
requirement: document what the automation did, verify it operated correctly,
and maintain the automation itself.

Before automation: Human does work (20 min) + Human documents work (15 min) = 35 min

After automation: Bot does work (2 min) + Human documents bot output (10 min) + Human reviews bot output (10 min) + Someone maintains bot (ongoing) = 22+ min

The savings are real but diminishing. The compliance overhead doesn't shrink
proportionally because it's rooted in the architecture, not the automation.

## What Would Fix It

A system where:

1. Every action automatically generates a record of what was done, when,
   and by whom (no separate documentation step)
2. The review mechanism is embedded in the workflow, not layered on top
   via email (no separate approval tracking)
3. The complete history is immutable and searchable (no file management
   for audit evidence)
4. Knowledge accumulates in the system, not in people's heads (no
   institutional memory loss)

This system already exists. It's called git. The question is: can it be
made operational for finance?
