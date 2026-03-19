# Gotcha: Never Skip Step 9 Re-Assessment

**Source:** Extracted from real session failure (2026-03-13)

Step 9 is the only step that catches **systemic gaps** — issues spanning multiple files that aren't detectable by targeted tests.

## The Trap

When working through a list of small fixes, the natural shortcut is:
`Write test → Implement → Tests pass → Commit → Next fix`

This skips re-assessment. The urge to skip is STRONGEST when fixes feel small — that's precisely when it's most needed.

## Real Example

5 UI review fixes completed with full TDD. All 429 tests passed. But dark mode CSS coverage was missing across 15+ files because:
- JSDOM doesn't render CSS, so `dark:` class gaps are invisible to unit tests
- Step 9's Pass 1 (Completeness) would have caught this by comparing the diff against the original report

## Rule

If your instinct says "this is too small for re-assessment" — that IS your trigger to run it.

Always run both passes:
- **Pass 1 (Completeness):** Re-read task definition. Re-read the diff. Does the diff fully address the task?
- **Pass 2 (Risk):** For each changed file — what happens under the OTHER state? (dark mode, mobile, offline, error, empty data)
