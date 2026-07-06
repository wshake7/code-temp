---
description: Build a feature using Research > Plan > Implement phases
argument-hint: <feature description>
---

# /develop - Multi-Phase Feature Development

Build features through structured phases with validation gates.

## Feature: $ARGUMENTS

### Phase 1: Research

Explore the codebase to understand the scope:

1. Find all relevant files and existing patterns
2. Check dependencies and constraints
3. Score confidence across 5 dimensions (0-100)

**Scoring:**
- Scope clarity (0-20): Know exactly what files change?
- Pattern familiarity (0-20): Similar patterns exist?
- Dependency awareness (0-20): Know what depends on changed code?
- Edge cases (0-20): Can identify the edge cases?
- Test strategy (0-20): Know how to verify?

**Decision:**
- Score >= 70 → Present research findings and enter Phase 2 (Grill Me Research)
- Score < 70 → Identify gaps, gather more context, re-score

### Phase 2: Grill Me (Research)

**STOP. Do not proceed to Phase 3 until the user answers your questions and explicitly confirms.**

Phase 1 has scored the research. Now enter the interview loop. **You** drive it:

1. Open with your **first** `AskUserQuestion` call probing the research direction (**one question per turn**: the `questions` array always has length = 1). Then stop and wait.
2. After the user replies, ask the next single question in a new turn. Always one question at a time — never batch.
3. Every `question` must put the recommended `option` first and label it with `(Recommended)`.
4. If a question can be answered by reading the codebase, **read the code yourself first**. Only ask the user what code cannot tell you.
5. Push through every branch of the decision tree. Do not stop after one or two soft questions. Do not advance to Phase 3 until the user gives an explicit close-out signal such as "proceed" / "approved" / "good" / "next".
6. When the user signals completion, write a one-paragraph summary of the shared understanding, then proceed to Phase 3.

**AskUserQuestion call conventions (Research phase)**:

- **One question per turn**: the `questions` array always has length = 1.
- **Carry a `notes` follow-up**: in your reply to the user, also append a short `notes:` free-text line capturing user preference and the key takeaway of this answer (add only after the user picks an option or types free text).
- **Carry a `preview`**: when options represent visual/UI, layout, configuration, or code style choices that benefit from side-by-side comparison, render them via `options[i].preview` as ASCII or code blocks. Previews are single-select only — do not use them with `multiSelect`.
- Each `question` carries 2–4 `options`; **put the recommended option first and label it `(Recommended)`**.
- Mutually exclusive decisions default to `multiSelect: false`.
- `header` ≤ 12 characters — used as the chip tag.
- Each `option.label` is 1–5 words; `description` explains the trade-off and impact.
- Do not hand-write an "Other" option — the tool appends one automatically.

Hard constraints while Phase 2 is active:
- Do NOT draft a plan, file list, or any implementation artifact.
- Do NOT advance to Phase 3 until the user explicitly confirms.

### Phase 3: Plan

Present a plan for approval:

```text
PLAN: [Feature Name]

Goal: [one sentence]

Files to modify:
1. path/file.ts - [what changes]

New files:
1. path/new.ts - [purpose]

Approach:
1. [step with rationale]

Risks:
- [potential issue and mitigation]

Test strategy:
- [how to verify]
```

### Phase 4: Grill Me (Plan)

**STOP. Do not proceed to Phase 5 until the user explicitly confirms.**

Phase 3 has presented the plan. Enter the interview loop. **You** drive it:

1. Open with your **first** `AskUserQuestion` call probing the implementation plan (**one question per turn**: the `questions` array always has length = 1). Then stop and wait.
2. After the user replies, ask the next single question in a new turn. Always one question at a time — never batch.
3. Every `question` must put the recommended `option` first and label it with `(Recommended)`.
4. If a question can be answered by reading the codebase, **read the code yourself first**. Only ask the user what code cannot tell you.
5. Walk every branch of the plan's decision tree, resolving dependencies one decision at a time. Use `AskUserQuestion` for trade-offs (library choice, scope boundaries, test depth, error UX, etc.) and plain text only for open-ended clarifications.
6. Push all the way through. Do not stop on a soft "looks good".
7. At close-out, write a one-paragraph shared-understanding summary and explicitly ask for approval to proceed to Phase 5.

**AskUserQuestion call conventions (Plan phase)**:

- **One question per turn**: the `questions` array always has length = 1.
- **Carry a `notes` follow-up**: in your reply to the user, also append a short `notes:` free-text line capturing user preference, the trade-off behind this answer, and any related open branch (add only after the user picks an option or types free text).
- **Carry a `preview`**: when options represent directory structure, API shape, file layout, or code snippets that benefit from side-by-side comparison, render them via `options[i].preview` as ASCII or code blocks. Previews are single-select only — do not use them with `multiSelect`.
- The recommended option stays at `options[0]` with the `(Recommended)` suffix.
- For "rollback / destructive / irreversible" decisions, tighten to single-select via `multiSelect: false`.
- Use `multiSelect: true` only when options are additive (e.g. "which test scenarios to cover").
- Constraints remain: `maxItems: 4`, `minItems: 2`, no hand-written "Other".

**Wait for "proceed" or "approved" before continuing.**

Hard constraints while Phase 4 is active:
- Do NOT write or modify any code, even to "prepare".
- Do NOT advance to Phase 5 until the user explicitly confirms.

### Phase 5: Implement

Execute the approved plan:

1. Make changes in plan order
2. Run tests after each file change
3. Pause for review every 5 edits
4. Run full quality gates at the end (lint, typecheck, test)

### Phase 6: Review & Commit

Self-review with verification — every finding must be confirmed by reading the code.

1. **Read every changed file** — re-read each modified file in full
2. **Verify, don't assume** — for each potential issue, quote the exact line. If you can't quote it, drop the finding.
3. **Grep for problems** — run `grep` for console.log, TODO, hardcoded secrets, debug statements. Report only what grep finds.
4. **Never report unverified findings** — don't say "ensure X" or "consider Y". Either it's a confirmed problem with a file:line citation, or it's not worth reporting.
5. Present verified summary for final approval
6. Commit with conventional message

### Learning Capture

After completing, ask:
- What corrections were made during implementation?
- Any patterns worth adding to LEARNED?
- Format: `[LEARN] Category: Rule`
