# GitClose Demo Script — 25 Minutes

**Audience:** Live demo or recorded walkthrough  
**Tone:** Conversational; you’re walking a colleague through the product, not reading a spec.

---

## Setup Notes (before you go live)

Do this **before** the audience joins or before you hit record:

1. **Reset the demo environment**
   ```bash
   npm run demo:reset
   ```

2. **Open the close period**
   ```bash
   gitclose open --entity MER-AU-ENG --period 2025-01
   ```

3. **Browser:** have **http://localhost:3000** open (Next.js UI). You’ll use `/pr/1` and `/audit` later — bookmark or keep the base URL handy.

4. **Terminal:** large font, clear contrast; you’ll run several `gitclose` commands back-to-back.

5. **Finder / Explorer:** optionally open `demo/traditional-workflow/` in a second window so Act 1 isn’t a scavenger hunt.

**Optional comfort line if people are late:** “I’m going to spend the first few minutes on context — the pain GitClose is solving — then we’ll run the product live.”

---

## Time map (keep an eye on the clock)

| Segment        | Duration | Cumulative |
|----------------|----------|------------|
| Act 1 — Problem | 3 min   | ~0:00–3:00 |
| Act 2 — Atlas   | 8 min   | ~3:00–11:00 |
| Act 3 — PR      | 5 min   | ~11:00–16:00 |
| Act 4 — Nova    | 4 min   | ~16:00–20:00 |
| Act 5 — Echo    | 3 min   | ~20:00–23:00 |
| Act 6 — Evidence | 2 min  | ~23:00–25:00 |

If you’re running long, trim Act 1 anecdotes first; protect Act 2 (Atlas) and Act 3 (PR) — that’s the core story.

---

## Act 1: The Problem (~3 minutes) — **0:00 → ~3:00**

### What to show

The **traditional workflow** folder: `demo/traditional-workflow/`, especially:

`Finance Team/Monthly Close/2025-01 January/Bank Reconciliation/`

### Narration (say something like this)

“Before we touch GitClose, I want to show you what month-end still looks like for a lot of finance teams — not a straw man, literally this folder.”

**[Open the Bank Reconciliation folder.]**

“Look at the filenames: `Westpac Operating Recon Jan 2025 v1`, then `v2 REVISED`, then `v3 FINAL`, then `v3 FINAL (2)`. That last one is the real punch line — *FINAL* wasn’t final. Versioning chaos isn’t a discipline problem; it’s what happens when the system of record is a spreadsheet on a shared drive.”

**[Drill into `Unidentified Credits/`.]**

“Now the Telstra thread. Open the email chain — `Telstra credit query - Sarah to investigate`, the reply, then `FW RE Telstra credit query - RESOLVED`. Read the dates in the headers if your sample has them: this is hours and hours of ‘who owns this?’ — finance, AP, sometimes the vendor — before anyone could **file** the answer next to the recon.”

**[Optional: glance at `Telstra refund confirmation.pdf.txt` or the resolved message.]**

“Meridian Engineering — think roughly a **$50M revenue** business — and for *one* unidentified bank credit, **three people** burned **multiple days** across email, workbook versions, and chasing Telstra. The scary part isn’t the dollar amount of the credit; it’s that **the audit trail is in someone’s inbox**, not in a system you can query.”

**[Pause.]**

“So here’s the reframe we’re going to prove in the next twenty minutes: **what if doing the work was the documentation?** Not a separate step after the fact — the same commits that perform reconciliation, explain exceptions, and propose journals **are** the evidence trail.”

**[Switch to terminal + browser — GitClose already opened per setup.]**

“Okay — same period, same entity, different substrate: GitClose, period **2025-01**, entity **MER-AU-ENG**. Everything you’ll see is **git-backed**.”

---

## Act 2: Atlas Reconciles Cash (~8 minutes) — **~3:00 → ~11:00**

### What to show

Terminal: Atlas run, commits streaming (if your build shows them). Browser on `http://localhost:3000` as needed to reinforce “live” feel.

### Command (run when you start this act)

```bash
gitclose run --task cash-recon-westpac-operating --agent atlas
```

### Narration beats (weave while output appears)

**[~0:00 into Act 2 — Atlas starts]**

“I’m kicking off **Atlas** on the Westpac operating cash recon. In GitClose, an agent isn’t a chat window that forgets what it did yesterday — it has identity, tools, and **memory in the repo**.”

**[Bank statement / fetch moment]**

“Atlas is pulling the **bank statement** for the period — in the demo you’ll see on the order of **23 transactions**. In the old world, that’s export-to-Excel, manual paste, pray nobody changed a formula.”

**[Matching wave]**

“Watch the match count climb — **18 items** clearing automatically. That’s the boring work humans shouldn’t be doing cell-by-cell. The point isn’t ‘AI is magic’; it’s **speed with receipts**: every match should land as something you can **diff**.”

**[Timing / clearance difference]**

“There’s a **timing difference** — classic **check clearance** or settlement lag. Atlas should surface it as a reconciling item with a clear explanation, not a red cell that says ‘???’.”

**[Telstra / MEMORY.md — the demo spike]**

“Here’s the moment I care about: an **unidentified credit** — the Telstra refund. Instead of a 24-hour email loop, Atlas searches **MEMORY.md** — institutional memory that lives **in git**, next to the task — and finds the **October 2024** pattern: same vendor behavior, same reference family.”

**[Say slowly, let it land:]**

“**Atlas found this in about three seconds. James took twenty-four hours.** Same company, same credit — different architecture.”

**[Journal proposals]**

“Atlas isn’t done at ‘matched.’ It proposes **journal entries** for the mechanical stuff people always forget until review — **bank fees**, **interest**, **insurance** — with amounts tied back to the statement lines.”

**[Workpaper + PR]**

“It generates the **workpaper** and opens a **pull request** — not a PDF emailed to Sarah, a **reviewable change set**. And critically: **every meaningful action is a git commit**. If you need to answer ‘what did we know, when?’ you don’t reconstruct it from Slack; you **read the graph**.”

**[If the UI shows run status, tab over briefly.]**

“On the Next.js side at **localhost:3000**, you’ll see the same run progressing — terminal for power users, UI for everyone else.”

---

## Act 3: PR Review — Maker-Checker (~5 minutes) — **~11:00 → ~16:00**

### What to show

1. Browser: **http://localhost:3000/pr/1**  
2. Terminal: approval via CLI (merges / records approval per your implementation)

### Command (after you’ve walked the PR in the browser)

```bash
gitclose review --pr 1 --action approve --reviewer sarah.martinez
```

### Narration

**[Browser: `/pr/1`]**

“This is **maker-checker** baked into **how work flows**, not a separate GRC module you pretend people use. The **preparer** is Atlas; the **checker** is Sarah Martinez — a human with sign-off authority.”

**[Scroll the PR: workpaper, exception detail, proposed JEs.]**

“You’re looking at the **workpaper**, the **exception narrative**, and the **proposed journal entries** in one place. For the **Telstra** item, you should see the **memory match** called out — and a pointer to **prior PR #641** from October, if your seed data includes that breadcrumb. That’s continuity: **last month’s resolution isn’t trapped in Sarah’s head**.”

**[Terminal: run the review command.]**

“I’m approving from the CLI so you see both surfaces — **Sarah approves by merging** in product terms: the **merge is the approval artifact**. Auditors love this — it’s **WORM-ish** without selling them a bespoke vault.”

**[After command succeeds.]**

“No separate ‘sign-off log’ spreadsheet. The **merge commit** is the control evidence.”

---

## Act 4: Nova Finds the Cutoff Error (~4 minutes) — **~16:00 → ~20:00**

### Command

```bash
gitclose run --task ap-recon --agent nova
```

### Narration

**[Nova starts]**

“**Nova** owns AP sub-ledger to GL. Different agent, same rules: **tools + memory + git**.”

**[Sub-ledger total]**

“Nova queries the **AP sub-ledger** — you should see a total around **$812,550** (demo figures).”

**[GL account]**

“Then it hits **GL 2000-001** — payables — and reads about **$807,350**.”

**[The gap]**

“So we’re staring at **$5,200** — not huge in isolation, but exactly the kind of **cutoff** noise that blows up a review call if nobody explains it.”

**[Trace]**

“Nova traces it to **ARUP-7795**: invoice landed in **January AP**, but the **GL posting** slipped to **February**. That’s not ‘Nova guessed’ — it’s **reference-linked tracing** you can show an auditor.”

**[Close the beat:]**

“**Nova surfaced this in on the order of half a minute** — call it **twenty-seven seconds** in the script. In a spreadsheet-driven close, this often **doesn’t surface for weeks** — or it surfaces when the external auditor asks a question nobody remembers the answer to.”

---

## Act 5: Echo Generates Commentary (~3 minutes) — **~20:00 → ~23:00**

### Command

```bash
gitclose run --task variance-commentary --agent echo
```

### Narration

**[Echo starts]**

“**Echo** does management commentary on **P&L variances** — the doc that usually gets written at **11 p.m.** in a Word file with more opinion than evidence.”

**[Variances]**

“It computes **budget vs actual** across the board, then **flags material** movements — for example **revenue down ~$700K**, **subcontractors down ~$400K** (that’s **favorable** — say that out loud so the room doesn’t misread it), **travel up ~$180K**.”

**[Sources / memory]**

“Watch the citations. You should see language like **‘Per memory, BHP Pilbara expansion contract…’** — tying narrative to **stored context**, not vibes.”

**[Anti-speculation]**

“Where Echo **doesn’t** have evidence, it should **explicitly flag** ‘requires investigation’ — **no hallucinated CFO letter**. That’s the product philosophy: **speculation is opt-in for humans**, not auto-generated by the model.”

**[Line:]**

“**No more making up explanations in a Word doc at 11 p.m.** The commentary draft is versioned, attributable, and **linked to sources**.”

---

## Act 6: The Evidence (~2 minutes) — **~23:00 → ~25:00**

### Commands / URLs

```bash
gitclose finalize
```

Then browser: **http://localhost:3000/audit**

### Narration

**[Terminal: finalize]**

“I’m running **finalize** — this is ‘close the close’: reconcile state, tag the period, emit the summary your stakeholders expect.”

**[After output settles]**

“**Git log** from the close repo should read like a film reel: **every action by every agent**, human merges in order, no missing scenes.”

**[Browser: `/audit`]**

“The **audit view** is not a separate portal nobody updates. **Agent definitions are snapshotted at close** — you can say honestly: **these were the rules in effect on close date**.”

**[Tag]**

“We tag something like **`v2025-01-close`** — point-in-time, immutable marker. Roll forward next month; **diff** if governance changes.”

**[One-liner:]**

“**The auditor’s interface is the git history.** Not metaphorically — literally: blame, log, tag, merge parents.”

---

## Closing: Side-by-Side Comparison (say this; show on slide or split screen)

“Let me put the old world and GitClose next to each other.”

| Metric | Traditional close | GitClose |
|--------|---------------------|----------|
| **Elapsed time** | ~3 days | ~1 hour |
| **Human effort — preparation** | ~15 hours | ~0 (agents execute) |
| **Human effort — review** | ~3 hours | ~1 hour |
| **Total human effort** | ~18 hours | ~1 hour |
| **Wait time (email / chasing)** | ~36 hours | ~0 — agents don’t wait |
| **Telstra-type exception** | ~24 hours (inbox chain) | Seconds — memory match in repo |
| **Audit trail** | Email, Excel, shared drives | Complete **git log** + UI |
| **Documentation overhead** | Often **25–35%** of close time; separate workpapers | **Marginal cost ~0** — work product **is** documentation |
| **Quarterly evidence pack** | Hours reconstructing “what did we do?” | **Always reconstructible** from history |

*(Optional verbal add-on for enterprise buyers: “Compliance teams stop being archaeologists.”)*

“Thanks — happy to go deeper on agent definitions, on-prem, or auditor conversations.”

---

## Recovery Notes (keep this tab open during the demo)

| Symptom | What to do |
|--------|------------|
| **API / model flake** | Re-run with **`--replay`** (cached responses) so the narrative doesn’t depend on live inference. |
| **Agent hang or runaway** | **Ctrl+C**, then use **cached responses** or replay mode if your build supports it; don’t improvise new numbers on stage. |
| **Something looks wrong / wrong period** | **`npm run demo:reset`**, re-run **`gitclose open --entity MER-AU-ENG --period 2025-01`**, restart from **Act 1** or **Act 2** as time allows. |
| **UI blank** | Confirm **Next.js** on **:3000**; hard refresh; check the terminal where `npm run dev` (or equivalent) is running. |
| **PR 1 missing** | Ensure Atlas act completed PR creation; re-run Act 2 or reset. |

---

## Presenter cheatsheet (one screen)

```bash
npm run demo:reset
gitclose open --entity MER-AU-ENG --period 2025-01
# UI: http://localhost:3000

gitclose run --task cash-recon-westpac-operating --agent atlas
# http://localhost:3000/pr/1
gitclose review --pr 1 --action approve --reviewer sarah.martinez

gitclose run --task ap-recon --agent nova
gitclose run --task variance-commentary --agent echo

gitclose finalize
# http://localhost:3000/audit
```

**Folder for pain story:** `demo/traditional-workflow/`

---

*End of script.*
