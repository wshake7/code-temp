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

1. Open with your **first** probing question about the research direction (one question only, with your recommended answer). Then stop and wait.
2. After the user replies, ask the next single question. Never batch. Never list multiple questions at once.
3. Every question must come with your recommended answer up front.
4. If a question can be answered by reading the codebase, **read the code yourself first**. Only ask the user what code cannot tell you.
5. Push through every branch of the decision tree. Do not stop after one or two soft questions. Do not move on until the user says "proceed", "approved", "good", "next", or otherwise signals we are done.
6. When the user signals completion, write a one-paragraph summary of the shared understanding of the research direction, then proceed to Phase 3.

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

1. Open with your **first** probing question about the implementation plan (one question only, with your recommended answer). Then stop and wait.
2. After the user replies, ask the next single question. Never batch. Never list multiple questions at once.
3. Every question must come with your recommended answer up front.
4. If a question can be answered by reading the codebase, **read the code yourself first**. Only ask the user what code cannot tell you.
5. Walk each branch of the plan's decision tree; resolve dependencies between decisions one by one.
6. Push until every branch is resolved. Do not stop early on a soft "looks good".
7. When the loop ends, write a one-paragraph summary of the shared understanding of the implementation approach, then ask for explicit approval to proceed to Phase 5.

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
