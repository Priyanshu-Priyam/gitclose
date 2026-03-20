# Architecture

## System Overview

┌─────────────────────────────────────────────────────────────────────┐ │ CUSTOMER ENVIRONMENT │ │ │ │ ┌─────────────────────────────────────────────────────────────┐ │ │ │ AGENT RUNTIME (Node.js) │ │ │ │ │ │ │ │ ┌──────────┐ ┌──────────┐ ┌──────────┐ │ │ │ │ │ Atlas │ │ Nova │ │ Echo │ Agent instances │ │ │ │ │ (cash) │ │ (AP) │ │ (var) │ │ │ │ │ └────┬─────┘ └────┬─────┘ └────┬─────┘ │ │ │ │ │ │ │ │ │ │ │ ▼ ▼ ▼ │ │ │ │ ┌──────────────────────────────────────┐ │ │ │ │ │ TOOL IMPLEMENTATIONS │ │ │ │ │ │ query_gl │ match_txns │ etc. │ │ │ │ │ └──────────────┬───────────────────────┘ │ │ │ │ │ │ │ │ │ ┌─────────┴─────────┐ │ │ │ │ │ │ │ │ │ │ ┌────▼─────┐ ┌──────▼──────┐ │ │ │ │ │ SQLite │ │ Git Repos │ │ │ │ │ │ (source │ │ (close │ │ │ │ │ │ data) │ │ output) │ │ │ │ │ └──────────┘ └─────────────┘ │ │ │ │ │ │ │ └──────────────────────────────────────────────────────────────┘ │ │ │ │ ┌──────────────────────────────────────────────────────────────┐ │ │ │ WEB UI (Next.js) │ │ │ │ Dashboard │ PR Review │ Auditor View │ │ │ └──────────────────────────────────────────────────────────────┘ │ │ │ │ ┌──────────────────────────────────────────────────────────────┐ │ │ │ CLAUDE API (external) │ │ │ │ Only API calls leave the environment. │ │ │ │ Financial data stays on-premise. │ │ │ └──────────────────────────────────────────────────────────────┘ │ └─────────────────────────────────────────────────────────────────────┘

## Key Architectural Decisions

### 1. Agent definitions are separate from close execution

Agent repos (what the agent *is*) are distinct from close repos (what the
agent *produces*). This mirrors the separation between an employee's job
description and their work product. The agent definition evolves slowly;
close repos are created fresh each month.

### 2. SQLite for source data, git for work products

Source data (GL, bank, AP, budget) lives in SQLite — optimized for queries.
Work products (reconciliations, commentary, exceptions) live in git — optimized
for traceability. These are different requirements served by different storage.

### 3. Sequential agent execution for MVP

Atlas runs first, then Nova, then Echo. This is simpler than parallel execution
and avoids concurrency issues. In production, agents can run in parallel since
they operate on separate branches and never modify the same files.

### 4. Read-only GL access

Agents can query the GL but cannot modify it. They propose journal entries
as CSV files in the close repo. A human posts approved entries to the ERP.
This is the safety boundary that makes the system trustworthy from day one.

### 5. Claude via API, not embedded

The LLM runs remotely (Anthropic API). Only the API calls leave the customer
environment — not the source data. The prompts contain account-level summaries,
not customer-identifiable data. For production deployments requiring full data
sovereignty, Azure OpenAI or on-premise models can be substituted by changing
`model.provider` in agent.yaml.
