---
name: polish
description: Post-implementation refinement that simplifies code and verifies comments. Use after completing a coding task, before creating a PR, or when asked to "polish", "refine", or "clean up" recently written code.
---

# Post-Implementation Polish

Refine recently written code for clarity and maintainability after implementation is complete.

## Workflow

1. **Identify Recent Changes**
   - Run `git diff --name-only` to find modified files
   - Focus only on files changed in the current session

2. **Phase 1: Code Simplification**

   Run **code-simplifier** on the changed files:
   - Reduce unnecessary complexity and nesting
   - Eliminate redundant code and abstractions
   - Improve naming and readability
   - Apply project coding standards
   - Preserve all functionality

3. **Phase 2: Comment Verification**

   Run **comment-analyzer** on the same files:
   - Verify comment accuracy against actual code
   - Flag outdated or misleading comments
   - Identify missing documentation for complex logic
   - Recommend removals for obvious/redundant comments

4. **Summary**

   ```
   ## Polish Report

   ### Code Simplification
   - X simplifications applied
   - [list of changes with file:line]

   ### Comment Analysis
   - X issues found
   - [list of issues with file:line]

   ### Result
   Code refined and comments verified.
   ```

## Notes

- Code simplifier makes direct edits (with approval)
- Comment analyzer provides advisory feedback only
- Run `pre-commit` skill after polishing to verify no regressions
