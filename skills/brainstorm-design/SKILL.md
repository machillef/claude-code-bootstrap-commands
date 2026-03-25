---
name: brainstorm-design
description: "Design exploration before implementation. Dialogue → 2-3 approaches → approved design doc. Invoked by bootstrap workflows, not directly."
---

# Brainstorming Ideas Into Designs

Help turn ideas into fully formed designs and specs through natural collaborative dialogue.

Start by understanding the current project context, then ask clarifying questions, stress-test every decision branch, and enumerate user stories — all before proposing any design. Present requirements (Part 1) for approval before drafting the design (Part 2). The checklist below is the authoritative sequence.

<HARD-GATE>
Do NOT invoke any implementation skill, write any code, scaffold any project, or take any implementation action until you have presented a design and the user has approved it. This applies to EVERY project regardless of perceived simplicity.
</HARD-GATE>

## Context Loading

Before starting, read all existing docs/ai/ files for this initiative:
- `docs/ai/<initiative>-requirements.md` (if exists — new-repo workflow)
- `docs/ai/<initiative>-scope-map.md` (if exists — existing-repo workflow)
- `docs/ai/<initiative>-decisions.md` (if exists)
- `CLAUDE.md` (project root, if exists)
- `UBIQUITOUS_LANGUAGE.md` (if exists — use canonical terms consistently throughout the design dialogue)

Use this context to ground your questions and avoid asking what's already documented.

## Anti-Pattern: "This Is Too Simple To Need A Design"

Every project goes through this process. A todo list, a single-function utility, a config change — all of them. "Simple" projects are where unexamined assumptions cause the most wasted work. The design can be short (a few sentences for truly simple projects), but you MUST present it and get approval.

## Checklist

You MUST complete these steps in order:

1. **Load initiative context** — read docs/ai/ files, CLAUDE.md, recent commits
2. **Offer visual companion** (if topic will involve visual questions) — this is its own message, not combined with a clarifying question. See the Visual Companion section below.
3. **Ask clarifying questions** — one at a time, understand purpose/constraints/success criteria
4. **Stress-test requirements** — enumerate every open decision branch, walk each to resolution with a recommendation, resolve inter-decision dependencies. Do not exit until ALL branches are resolved. See "Stress-testing requirements" below.
5. **Enumerate user stories** — draft an exhaustive numbered list of user stories using the template from `templates/user-stories-section.md`. Present to the user for review (some may be out of scope, some may be missing). Iterate until the user approves the story list.
6. **Propose 2-3 approaches** — with trade-offs and your recommendation
7. **Present design** — in sections scaled to their complexity, get user approval after each section
8. **Write design doc** — save to `docs/ai/<initiative>-design.md` and commit. Include a "User Stories" section using the format from `templates/user-stories-section.md`.
9. **Offer evaluation criteria** (if subjective quality dimensions detected) — offer to create `docs/ai/<initiative>-eval-criteria.md` with scoring thresholds for review-loop. See "Evaluation criteria" section below.
10. **Spec review loop** — dispatch spec-document-reviewer subagent with precisely crafted review context (never your session history); fix issues and re-dispatch until approved (max 5 iterations, then surface to human)
11. **User reviews written spec** — ask user to review the spec file before proceeding
12. **Return control** — hand back to the calling workflow skill (do NOT invoke implementation skills directly)

## Process Flow

```
Load context → Visual companion offer? → Clarifying questions (one at a time)
→ Stress-test requirements (enumerate branches → resolve each with recommendation)
  → Unresolved branches remain: keep walking the tree
  → All resolved: Enumerate user stories → User reviews story list
    → Missing/wrong stories: iterate until approved
    → Approved: Propose 2-3 approaches → Present design sections → User approves?
      → No: revise and re-present
      → Yes: Write design doc (incl. User Stories section) → Offer eval criteria? → Spec review loop → User reviews spec
        → Changes requested: update and re-review
        → Approved: Return control to calling workflow
```

## The Process

**Understanding the idea:**

- Check out the current project state first (files, docs, recent commits, existing docs/ai/ files)
- Before asking detailed questions, assess scope: if the request describes multiple independent subsystems (e.g., "build a platform with chat, file storage, billing, and analytics"), flag this immediately. Don't spend questions refining details of a project that needs to be decomposed first.
- If the project is too large for a single spec, help the user decompose into sub-projects: what are the independent pieces, how do they relate, what order should they be built? Then brainstorm the first sub-project through the normal design flow.
- For appropriately-scoped projects, ask questions one at a time to refine the idea
- Prefer multiple choice questions when possible, but open-ended is fine too
- Only one question per message — if a topic needs more exploration, break it into multiple questions
- Focus on understanding: purpose, constraints, success criteria
- Do NOT move to approaches until you have stress-tested the requirements (see below)

**Stress-testing requirements:**

Once you have enough landscape understanding from clarifying questions, shift into adversarial stress-test mode. The goal: interview relentlessly about every aspect of the plan until you reach a shared understanding with zero ambiguity.

- **Enumerate branches:** List every open decision, assumption, or ambiguity as a numbered list. Present this list to the user: *"Before we move to approaches, here are the open decisions I see: [list]. Let's resolve each one."*
- **Walk each branch:** For each decision, state YOUR recommended answer with reasoning. The user evaluates a concrete recommendation, not an open-ended question. Example: *"For auth, I recommend JWT with refresh tokens because [reasons]. Does that match your thinking, or do you see it differently?"*
- **Resolve dependencies:** Some decisions depend on others. Identify and sequence them — resolve upstream decisions first, then revisit downstream ones that were blocked.
- **Exit gate:** Do not proceed to "Propose approaches" until every branch on the list is resolved. If new branches surface during resolution, add them to the list and resolve those too.

**Enumerating user stories:**

After all decision branches are resolved, draft an exhaustive set of user stories before proposing approaches. This grounds the design in concrete user interactions, not abstract requirements.

- Use the format from `templates/user-stories-section.md`: `N. As a <actor>, I want <feature>, so that <benefit>`
- Cover every actor and every interaction — be exhaustive, not selective
- Present the full numbered list to the user: *"Here are the user stories I've identified. Review them — some may be out of scope, and I may have missed some."*
- Iterate: remove stories the user marks as out of scope, add stories the user identifies as missing, refine wording until the user approves
- Do not proceed to approaches until the user approves the story list

**Exploring approaches:**

- Propose 2-3 different approaches with trade-offs
- Present options conversationally with your recommendation and reasoning
- Lead with your recommended option and explain why

**Presenting the design:**

Structure the design doc in two parts. Part 1 captures requirements (what), Part 2 captures design (how). Present and get approval on Part 1 BEFORE drafting Part 2. This prevents designing solutions before requirements are fully captured. See `templates/design-doc-structure.md` for the expected layout.

- **Part 1 — Requirements** (present first, get approval before continuing):
  - Problem statement — what problem are we solving, from the user's perspective
  - User stories — see `templates/user-stories-section.md` for format
  - Out of scope — what this initiative will NOT do
- **Part 2 — Design** (only after Part 1 is approved):
  - Architecture and components
  - Data flow
  - Error handling
  - Testing approach
- Scale each section to its complexity: a few sentences if straightforward, up to 200-300 words if nuanced
- Ask after each section whether it looks right so far
- Be ready to go back and clarify if something doesn't make sense

**Design for isolation and clarity:**

- Break the system into smaller units that each have one clear purpose, communicate through well-defined interfaces, and can be understood and tested independently
- Prefer deep modules over shallow ones — small interface hiding significant implementation (see [references/deep-modules.md](references/deep-modules.md))
- For each unit, you should be able to answer: what does it do, how do you use it, and what does it depend on?
- Can someone understand what a unit does without reading its internals? Can you change the internals without breaking consumers? If not, the boundaries need work.

**Working in existing codebases:**

- Explore the current structure before proposing changes. Follow existing patterns.
- Where existing code has problems that affect the work (e.g., a file that's grown too large, unclear boundaries, tangled responsibilities), include targeted improvements as part of the design.
- Don't propose unrelated refactoring. Stay focused on what serves the current goal.

## After the Design

**Documentation:**

- Write the validated design to `docs/ai/<initiative>-design.md`
  - Include a "User Stories" section with the approved story list, using the format from `templates/user-stories-section.md`
  - (User preferences for spec location override this default)
- Commit the design document to git

**Evaluation criteria (optional — Step 9):**

After writing the design doc, assess whether this initiative has **subjective quality dimensions** — aspects where "does this work?" (testable) is not sufficient and "is this good?" (judgmental) matters. Examples: UI/UX design quality, content tone, visual aesthetics, product polish, API ergonomics.

If subjective dimensions are detected, ask the user:

> "This initiative has quality dimensions that can't be fully captured by pass/fail tests (e.g., [detected dimensions]). Want me to draft evaluation criteria with scoring thresholds? These would be used by the review-loop to score each review pass, catching 'technically correct but mediocre' outputs."

If the user agrees, create `docs/ai/<initiative>-eval-criteria.md` using this format:

```markdown
# Evaluation Criteria: <initiative>

## Scoring
- Each criterion scored 1-5
- Threshold: minimum score to pass (per criterion)
- Weight: relative importance (higher = more influence on overall verdict)
- Overall FAIL if ANY criterion falls below its threshold

## Criteria

### 1. <Criterion Name>
**Weight:** high | medium | low
**Threshold:** 3
**What good looks like:** <concrete description of quality>
**What fails:** <concrete anti-patterns to penalize>
```

Draft 3-5 criteria tailored to the initiative. Emphasize the dimensions where the model is weakest (typically design quality and originality over technical correctness). Present the draft to the user for approval before saving.

If the user declines or the initiative has no subjective dimensions, skip this step.

If eval-criteria was created, commit it alongside or immediately after the design doc.

**Spec Review Loop:**
After writing the spec document:

1. Dispatch spec-document-reviewer subagent (see Spec Document Reviewer section below)
2. If Issues Found: fix, re-dispatch, repeat until Approved
3. If loop exceeds 5 iterations, surface to human for guidance

**User Review Gate:**
After the spec review loop passes, ask the user to review the written spec before proceeding:

> "Spec written and committed to `<path>`. Please review it and let me know if you want to make any changes before we continue."

Wait for the user's response. If they request changes, make them and re-run the spec review loop. Only proceed once the user approves.

**Return Control:**
After user approves the spec, return control to the calling workflow. Do NOT invoke implementation skills directly. The workflow will continue with its next step (stack decision, slice definition, etc.).

If the design discussion involved domain-specific terminology, suggest the user run `/ubiquitous-language` to formalize the terms before implementation begins.

## Spec Document Reviewer

Dispatch as a subagent (Agent tool, general-purpose type) with this prompt:

```
You are a spec document reviewer. Verify this spec is complete and ready for planning.

**Spec to review:** [SPEC_FILE_PATH]

## What to Check

| Category | What to Look For |
|----------|------------------|
| Completeness | TODOs, placeholders, "TBD", incomplete sections |
| Coverage | Missing error handling, edge cases, integration points |
| User story coverage | Every user story in the User Stories section is addressed by the design. No story is left without a corresponding component, flow, or explicit out-of-scope note |
| Consistency | Internal contradictions, conflicting requirements |
| Clarity | Ambiguous requirements |
| YAGNI | Unrequested features, over-engineering |
| Scope | Focused enough for a single plan — not covering multiple independent subsystems |
| Architecture | Units with clear boundaries, well-defined interfaces, independently understandable and testable |

## CRITICAL

Look especially hard for:
- Any TODO markers or placeholder text
- Sections saying "to be defined later" or "will spec when X is done"
- Sections noticeably less detailed than others
- Units that lack clear boundaries or interfaces

## Output Format

## Spec Review

**Status:** Approved | Issues Found

**Issues (if any):**
- [Section X]: [specific issue] - [why it matters]

**Recommendations (advisory):**
- [suggestions that don't block approval]
```

## Key Principles

- **One question at a time** — Don't overwhelm with multiple questions
- **Multiple choice preferred** — Easier to answer than open-ended when possible
- **YAGNI ruthlessly** — Remove unnecessary features from all designs
- **Explore alternatives** — Always propose 2-3 approaches before settling
- **Incremental validation** — Present design, get approval before moving on
- **Be flexible** — Go back and clarify when something doesn't make sense

## Visual Companion

A browser-based companion for showing mockups, diagrams, and visual options during brainstorming. Available as a tool — not a mode. Accepting the companion means it's available for questions that benefit from visual treatment; it does NOT mean every question goes through the browser.

**Offering the companion:** When you anticipate that upcoming questions will involve visual content (mockups, layouts, diagrams), offer it once for consent:
> "Some of what we're working on might be easier to explain if I can show it to you in a web browser. I can put together mockups, diagrams, comparisons, and other visuals as we go. Want to try it? (Requires opening a local URL)"

**This offer MUST be its own message.** Do not combine it with clarifying questions, context summaries, or any other content. Wait for the user's response before continuing. If they decline, proceed with text-only brainstorming.

**Per-question decision:** Even after the user accepts, decide FOR EACH QUESTION whether to use the browser or the terminal. The test: **would the user understand this better by seeing it than reading it?**

- **Use the browser** for content that IS visual — mockups, wireframes, layout comparisons, architecture diagrams, side-by-side visual designs
- **Use the terminal** for content that is text — requirements questions, conceptual choices, tradeoff lists, A/B/C/D text options, scope decisions

### Starting the Visual Server

The visual companion server is bundled in `scripts/` within this skill directory. It is a zero-dependency Node.js WebSocket server that watches for HTML files and live-reloads a browser tab.

**To start:**
```bash
bash scripts/start-server.sh --project-dir "$(pwd)"
```
This returns JSON with `port`, `url`, and `screen_dir`. Open the URL in a browser.

**To push a screen:** Write an HTML fragment to the `screen_dir` returned above. The server auto-wraps fragments in `frame-template.html` (which provides dark/light theming, option selection UI, and WebSocket live-reload). Full HTML documents (starting with `<!DOCTYPE` or `<html>`) are served as-is.

**Available CSS classes in fragments:**
- `.options` / `.option[data-choice]` — A/B/C choice boxes (user clicks to select, event sent via WebSocket)
- `.cards` / `.card[data-choice]` — Card grid layouts for design comparisons
- `.mockup` / `.mockup-header` / `.mockup-body` — Container layouts for wireframes
- `.split` — Side-by-side comparison (2-column grid)
- `.pros-cons` / `.pros` / `.cons` — Pros/cons comparison
- `.mock-nav`, `.mock-sidebar`, `.mock-content`, `.mock-button`, `.mock-input` — Wireframe building blocks
- `h2`, `h3`, `.subtitle`, `.section`, `.label` — Typography helpers

**Reading user selections:** After pushing a screen with `[data-choice]` elements, read `<screen_dir>/.events` to see which options the user clicked (JSON lines with `type`, `choice`, `text`, `timestamp`).

**To stop:**
```bash
bash scripts/stop-server.sh "<screen_dir>"
```
The server also auto-exits after 30 minutes of inactivity.

**Persistent vs ephemeral:** When `--project-dir` is used, files persist under `.brainstorm/` for later review. Without it, files go to `/tmp` and are cleaned up on stop.
