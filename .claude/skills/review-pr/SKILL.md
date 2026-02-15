---
name: review-pr
description: Comprehensive PR review using specialized sub-agents for comments, tests, types, errors, code quality, and simplification. Use when asked to "review PR", "review pull request", "check my PR", or before merging code changes.
---

# Comprehensive PR Review

Run a comprehensive pull request review using multiple specialized sub-agents, each focusing on a different aspect of code quality.

## Review Aspects

- **comments** - Analyze code comment accuracy and maintainability
- **tests** - Review test coverage quality and completeness
- **errors** - Check error handling for silent failures
- **types** - Analyze type design and invariants (if new types added)
- **code** - General code review for project guidelines
- **simplify** - Simplify code for clarity and maintainability
- **all** - Run all applicable reviews (default)

## Workflow

1. **Determine Review Scope**
   - Check git status to identify changed files
   - Parse arguments to see if user requested specific review aspects
   - Default: Run all applicable reviews

2. **Identify Changed Files**
   - Run `git diff --name-only` to see modified files
   - Check if PR already exists: `gh pr view`
   - Identify file types and what reviews apply

3. **Determine Applicable Reviews**

   Based on changes:
   - **Always applicable**: code-reviewer (general quality)
   - **If test files changed**: pr-test-analyzer
   - **If comments/docs added**: comment-analyzer
   - **If error handling changed**: silent-failure-hunter
   - **If types added/modified**: type-design-analyzer
   - **After passing review**: code-simplifier (polish and refine)

4. **Launch Review Sub-Agents**

   **Sequential approach** (default):
   - Easier to understand and act on
   - Each report is complete before next

   **Parallel approach** (on request):
   - Launch all sub-agents simultaneously
   - Faster for comprehensive review

5. **Aggregate Results**

   ```markdown
   # PR Review Summary

   ## Critical Issues (X found)
   - [agent-name]: Issue description [file:line]

   ## Important Issues (X found)
   - [agent-name]: Issue description [file:line]

   ## Suggestions (X found)
   - [agent-name]: Suggestion [file:line]

   ## Strengths
   - What's well-done in this PR

   ## Recommended Action
   1. Fix critical issues first
   2. Address important issues
   3. Consider suggestions
   4. Re-run review after fixes
   ```

## Sub-Agent Descriptions

| Sub-Agent | Focus |
|-----------|-------|
| **comment-analyzer** | Comment accuracy, comment rot, documentation completeness |
| **pr-test-analyzer** | Behavioral test coverage, critical gaps, test quality |
| **silent-failure-hunter** | Silent failures, catch blocks, error logging |
| **type-design-analyzer** | Type encapsulation, invariant expression, design quality |
| **code-reviewer** | Project guideline compliance, bugs, general quality |
| **code-simplifier** | Complexity reduction, clarity, readability |
