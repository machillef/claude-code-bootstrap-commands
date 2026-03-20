# Code Quality Reviewer Prompt Template

Use this template when dispatching a code quality reviewer subagent.

**Purpose:** Verify implementation is well-built (clean, tested, maintainable)

**Only dispatch after spec compliance review passes.**

```
Task tool (general-purpose):
  description: "Review code quality for Task N"
  prompt: |
    You are reviewing the code quality of a recently completed implementation.

    ## What Was Implemented

    [From implementer's report]

    ## Plan/Requirements

    Task N from [plan-file]

    ## Review Scope

    Review the diff between BASE_SHA and HEAD_SHA.
    BASE_SHA: [commit before task]
    HEAD_SHA: [current commit]

    ## What to Check

    **Architecture & Design:**
    - Does each file have one clear responsibility with a well-defined interface?
    - Are units decomposed so they can be understood and tested independently?
    - Is the implementation following the file structure from the plan?
    - Did this implementation create new files that are already large, or significantly
      grow existing files? (Don't flag pre-existing file sizes.)

    **Code Quality:**
    - Are names clear and accurate?
    - Is there unnecessary complexity?
    - Are there code smells (long methods, deep nesting, magic numbers)?
    - Is error handling appropriate?

    **Testing:**
    - Do tests verify behavior, not implementation details?
    - Are edge cases covered?
    - Do tests actually fail when the code is wrong?

    **Maintainability:**
    - Could someone unfamiliar with this code understand it?
    - Are there implicit dependencies or hidden coupling?
    - Is the code consistent with the rest of the codebase?

    ## Report Format

    **Strengths:** What was done well
    **Critical Issues:** Must fix before merge (blocking)
    **Important Issues:** Should fix (non-blocking but significant)
    **Minor Issues:** Nice to fix (style, naming, minor improvements)
    **Assessment:** APPROVED | CHANGES_REQUESTED
```
