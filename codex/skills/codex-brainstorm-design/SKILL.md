---
name: codex-brainstorm-design
description: Collaborative design exploration before implementation. Stress-tests requirements, enumerates user stories, produces a two-part design doc in `docs/ai/`, and stops before code changes.
---

# Codex Brainstorm Design

Use this skill before bootstrapping substantial work.

Start by understanding the current project context, then ask clarifying questions, stress-test every decision branch, and enumerate user stories — all before proposing any design. Present requirements (Part 1) for approval before drafting the design (Part 2). The workflow below is the authoritative sequence.

## Hard Gate

Do not scaffold, implement, or modify production code until the design has been
presented, written down, and approved by the user.

## Context Loading

Read before starting:
- `docs/ai/<initiative>-requirements.md` (if exists)
- `docs/ai/<initiative>-scope-map.md` (if exists)
- `docs/ai/<initiative>-decisions.md` (if exists)
- Repo `AGENTS.md` (if exists)
- `UBIQUITOUS_LANGUAGE.md` (if exists — use canonical terms consistently)

## Workflow

1. **Load initiative context** from docs/ai/ and repo AGENTS.md.
2. **Ask clarifying questions** one at a time. Focus on purpose, constraints, success criteria. Do NOT move to approaches until requirements are stress-tested.
3. **Stress-test requirements** — enumerate every open decision, assumption, or ambiguity as a numbered list. Walk each branch: state YOUR recommended answer with reasoning (the user evaluates a recommendation, not an open-ended question). Resolve dependencies between decisions — upstream first. Do not proceed until every branch is resolved. If new branches surface, add and resolve them too.
4. **Enumerate user stories** — draft an exhaustive numbered list: `N. As a <actor>, I want <feature>, so that <benefit>`. Be exhaustive, be specific, one interaction per story. Present to the user. Iterate until approved.
5. **Propose 2-3 approaches** with trade-offs and a recommendation.
6. **Present design in two parts:**
   - **Part 1 — Requirements** (present first, get approval before Part 2): problem statement, user stories, out of scope
   - **Part 2 — Design** (only after Part 1 approved): architecture, components, data flow, error handling, testing approach
7. **Write `docs/ai/<initiative>-design.md`** using the two-part structure. Include the approved user stories.
8. **Run a sub-agent spec review** using `prompts/spec-reviewer.md`.
9. **Ask the user to approve** the written spec before returning control.

If the design discussion involved domain-specific terminology, suggest using `codex-ubiquitous-language` to formalize the terms.

## Design Principles

- **Deep modules over shallow ones.** A good module has a small, simple interface hiding significant implementation. If the caller must understand implementation details, the boundary is wrong. Fewer methods that each do more beats many fine-grained methods.
- **Isolation and clarity.** Each unit should have one purpose, communicate through well-defined interfaces, and be testable independently.
- **YAGNI ruthlessly.** Remove unnecessary features from all designs.
- **Existing codebases:** explore current structure first, follow existing patterns, only propose refactoring that serves the current goal.

## Rules

- One question per message.
- Keep the spec focused enough to drive a slice plan.
- Do not proceed from questions → approaches without stress-testing all decision branches.
- Do not proceed from Part 1 → Part 2 without user approval on requirements.
