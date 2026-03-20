# GitClose Documentation

> **GitClose** is a git-native monthly close platform where AI agents perform the
> mechanical work of financial close — reconciliation, journal preparation, variance
> commentary — with every action recorded as a git commit, every approval as a merged
> pull request, and every audit trail generated automatically.

## Inspiration & Attribution

This project draws directly from the **GitAgent standard** and the architectural
thinking behind **GitClaw**, developed by **Shreyas Kapale** at **Lyzr**. The core
insight — that a git repository is a natural home for an AI agent's identity, memory,
and work product — originates from that work. GitClose extends this insight into
the finance domain, where the structural equivalence between git workflows and
financial controls creates a product opportunity that is not merely convenient but
architecturally inevitable.

This project was developed as part of an interview assignment for Lyzr. The
assignment asked: "Where should Lyzr build a B2B product for the CFO office?"
The answer, developed across these documents, is: not a product that automates
financial tasks, but a platform where the automation architecture *is* the
compliance framework.

## How to Read This Documentation

The documentation is structured in five layers, each building on the previous:

| Layer | What It Covers | Start Here If You Are... |
|---|---|---|
| **01 — Thesis** | The core insight in ~10 pages | An executive who wants the punchline |
| **02 — Problem Framing** | Why the CFO office is stuck today | A finance professional |
| **03 — Theoretical Framework** | First-principles reasoning | An architect or engineer |
| **04 — Design** | System architecture and decisions | A developer building this |
| **05 — Implementation** | Build plan, ADRs, testing | A developer starting today |

Each layer is self-contained but cross-references the others. If you read nothing
else, read `01-thesis/00-executive-summary.md`.

## Quick Links

- [Executive Summary](01-thesis/00-executive-summary.md) — 2 pages, the whole argument
- [Why Finance Is Broken](02-problem-framing/01-current-state.md) — James Wong's world
- [Git = Accounting](03-theoretical-framework/02-git-as-accounting.md) — the deep structural claim
- [Architecture](04-design/01-architecture.md) — system design with diagrams
- [Implementation Plan](05-implementation/implementation-plan.md) — build sequence
