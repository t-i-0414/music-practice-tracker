---
name: fix-review
description: Address /review-pr findings automatically - fix Critical and Important issues, run quality gates, commit, push if PR exists, then re-run /review-pr. Use when asked to "fix review", "address review findings", "resolve review issues", or after receiving a /review-pr summary with actionable issues.
---

# Fix Review Findings

Address Critical and Important issues from a `/review-pr` summary, then verify the fixes.

## Workflow

1. **Identify Findings to Fix**
   - Parse the most recent `/review-pr` summary in conversation context
   - Collect all **Critical** and **Important** issues (skip Suggestions unless user requests)
   - Order: Critical first, then Important
   - If no review summary exists, ask the user to run `/review-pr` first

2. **Fix Each Issue**
   - Read the source file for each issue before editing
   - Apply the minimum change needed to resolve the issue
   - Do NOT refactor surrounding code or add unrelated improvements
   - Track all modified files

3. **Run Quality Gates**
   ```bash
   bun turbo lint:es:check type:check
   bun run lint:es:check:root
   bun run type:check:root
   bun run format:check
   ```
   - If any gate fails, fix the failure and re-run
   - Format with `bun run format:write` if only formatting issues remain

4. **Commit**
   - Stage only the files modified in step 2
   - Use commit message format: `refactor(<scope>): address review - <brief summary>`
   - Keep header under 100 chars (commitlint rule)

5. **Push (if PR exists)**
   - Check: `gh pr view --json state 2>/dev/null`
   - If PR is open and branch tracks remote, push with `git push`
   - If force push is needed (after rebase), ask user for confirmation
   - If no PR, skip this step

6. **Re-run /review-pr**
   - Invoke the `/review-pr` skill to verify fixes
   - Report the before/after comparison of issue counts

## Rules

- **Scope discipline**: Fix only what the review identified. No bonus improvements.
- **Pre-existing issues**: If a finding is flagged as "pre-existing" or outside the PR diff, note it in the commit message but do NOT fix it unless the user explicitly requests.
- **Suggestions**: Skip by default. Fix only if user passes `--include-suggestions` or explicitly requests.
- **Test assertions**: When fixing source code, update corresponding test assertions to match.
- **Ambiguous fixes**: If the correct fix is unclear, ask the user before proceeding.
