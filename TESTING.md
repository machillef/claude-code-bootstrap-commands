# Testing the Bootstrap Workflow

Run this against a real existing repo to validate the workflow and capture what needs improving.
When done, paste this file into a new Claude Code session and say:
**"Read TESTING.md and improve the workflow based on the test results."**

Claude will read the capture sections and update the commands, skills, and agents accordingly.

---

## Setup

```bash
# 1. Clone this repo (if not already done)
git clone https://github.com/YOUR_USERNAME/claude-code-bootstrap-commands ~/path/to/claude-bootstrap
cd ~/path/to/claude-bootstrap && ./install.sh

# 2. Install ECC in the target repo
cd ~/path/to/your-test-repo
claude
# inside Claude Code: /plugin add everything-claude-code
```

---

## Test 1: Small change — `/quick-change`

Pick something real and small in the test repo. Examples:
- Add a missing field to a response
- Fix a validation rule
- Add auth check to one endpoint

**Run:**
```
/quick-change <your small task>
```

**Observe and fill in:**

```
Task given:


Did it correctly identify this as small (not try to bootstrap)?
[ ] Yes   [ ] No — it did:


Did it find the existing pattern before changing anything?
[ ] Yes   [ ] No — it did:


Was the change minimal (didn't touch unrelated code)?
[ ] Yes   [ ] No — it also changed:


Did it verify (run a test or build)?
[ ] Yes   [ ] No — it did:


Did it create the quick-changes-log.md entry?
[ ] Yes   [ ] No


Overall: did it feel fast and lightweight?
[ ] Yes   [ ] No — it felt:


What should have been different?

```

---

## Test 2: New project — `/bootstrap-new`

Pick something real to build from scratch. Examples:
- A REST API service
- A CLI tool
- A web dashboard

**Run:**
```
/bootstrap-new <your project name>
```

**Observe and fill in:**

```
Project given:


Did it ask 4 or fewer questions (not interrogate you)?
[ ] Yes   [ ] No — it asked:


Were all missing questions asked at once (not one at a time)?
[ ] Yes   [ ] No — it asked them one at a time


Did the stack-advisor make ONE confident recommendation (not a menu of options)?
[ ] Yes   [ ] No — it did:


Was the recommendation appropriate for what you described?
[ ] Yes   [ ] No — it recommended X but should have recommended Y because:


Did it present the stack recommendation and WAIT for explicit confirmation before scaffolding?
[ ] Yes   [ ] No — it proceeded immediately


Did it find a real scaffold (official CLI or maintained template) rather than writing from scratch?
[ ] Yes   [ ] No — it:


Did the scaffold actually build (no errors)?
[ ] Yes   [ ] No — error was:


Did it create all 5 docs/ai/ files (requirements, decisions, plan, slices, status)?
[ ] Yes   [ ] No — missing:


Was the decisions.md rationale useful (would it help explain the stack choice to someone else)?
[ ] Yes   [ ] No — because:


Was the status.md in execution-loop format (Slice 0: Bootstrap with structured sections)?
[ ] Yes   [ ] No — it used:


Was the first real slice well-defined (goal, touched area, tests, done criteria)?
[ ] Yes   [ ] No — what was wrong:


Did it try to implement features during bootstrap (it should NOT)?
[ ] No, stopped correctly   [ ] Yes — it started:


Did it check whether ECC was installed before referencing ECC agents?
[ ] Yes   [ ] No — it just referenced them


What should have been different?

```

---

## Test 3: Medium change — `/bootstrap-existing`

Pick a real feature or change that would take 1-3 days. Examples:
- Add OAuth / SSO to the app
- Add a new API resource end-to-end
- Replace a library or ORM

**Run:**
```
/bootstrap-existing <initiative-name>
```

**Observe and fill in:**

```
Initiative given:


Triage — did it correctly classify as medium (not small or large)?
[ ] Yes   [ ] No — it classified as:


Tech stack detection — did it find the right stack?
[ ] Yes   [ ] No — it missed:
[ ] Yes   [ ] No — it got wrong:


Scope map — was the in-scope / out-of-scope split correct?
[ ] Yes   [ ] No — it included things it shouldn't:
[ ] Yes   [ ] No — it missed things it should have:


docs/ai/ files created (list which ones):


Were the docs concise and useful, or too verbose / too thin?
[ ] About right
[ ] Too verbose — specifically:
[ ] Too thin — missing:


Was the first slice well-defined (clear goal, touched area, tests, done criteria)?
[ ] Yes   [ ] No — what was wrong:


Did it try to implement during bootstrap (it should NOT)?
[ ] No, stopped correctly   [ ] Yes — it started:


What should have been different?

```

---

## Test 4: Resume — `/continue-work`

Immediately after Test 3 bootstrap-existing (docs/ai/ files now exist):

**Run:**
```
/continue-work <same-initiative-name>
```

**Observe and fill in:**

```
Did it run a stale check (compare docs/ai/ dates against git log)?
[ ] Yes   [ ] No


Did it pick up the correct next slice?
[ ] Yes   [ ] No — it picked:


Did it reconfirm scope before editing?
[ ] Yes   [ ] No


Did it apply TDD / write a test first?
[ ] Yes   [ ] No — reason given:
[ ] Not applicable because:


Was the implementation narrow (only touched what it said it would)?
[ ] Yes   [ ] No — it also changed:


Did it update docs/ai/status.md after?
[ ] Yes   [ ] No


Did it stop cleanly with a clear next step?
[ ] Yes   [ ] No


What should have been different?

```

---

## Test 5 (optional): Large change — `/bootstrap-existing` with architecture-discovery

Only if you have a large migration or architectural change handy. Examples:
- Migrate backend framework
- Move from REST to GraphQL
- Split a monolith into services

**Run:**
```
/bootstrap-existing <migration-name>
```

**Observe and fill in:**

```
Initiative given:


Did it invoke the architecture-discovery agent?
[ ] Yes   [ ] No


Architecture discovery output — was it accurate?
[ ] Yes   [ ] No — it missed:
[ ] Yes   [ ] No — it got wrong:


Were all 7 docs/ai/ files created?
[ ] Yes   [ ] No — missing:


Was the migration risk map useful?
[ ] Yes   [ ] No — because:


What should have been different?

```

---

## Overall impressions

```
What felt most broken:


What felt surprisingly good:


Commands that need the most rework (rank):
1.
2.
3.

Any scenario not covered that you ran into:


Anything the workflow did that actively got in the way:

```

---

## How to use these results

Open a new Claude Code session in this repo and say:

> "Read TESTING.md. I've filled in the capture sections after testing the workflow on a real repo.
> Based on the results, update the commands, agents, and skills to fix what went wrong.
> Then re-run install.sh to deploy the fixes."

Claude will read your observations and update the relevant files directly.
