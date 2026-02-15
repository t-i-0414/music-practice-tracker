---
name: revise-rules
description: Update CLAUDE.md with learnings from the current session. Use at the end of a session, when asked to "save learnings", "update rules", "revise rules", or when important patterns or gotchas were discovered during work.
---

# Revise Rules

Review this session for learnings about this codebase. Update `CLAUDE.md` with context that would help future AI agent sessions be more effective.

## Step 1: Reflect

What context was missing that would have helped the AI agent work more effectively?

- Bash commands that were used or discovered
- Code style patterns followed
- Testing approaches that worked
- Environment/configuration quirks
- Warnings or gotchas encountered

## Step 2: Draft Additions

**Keep it concise** - one line per concept. These rules are part of the prompt, so brevity matters.

Format: `<command or pattern>` - `<brief description>`

Avoid:

- Verbose explanations
- Obvious information
- One-off fixes unlikely to recur

## Step 3: Show Proposed Changes

For each addition:

```
### Update: CLAUDE.md

**Why:** [one-line reason]

\`\`\`diff
+ [the addition - keep it brief]
\`\`\`
```

## Step 4: Apply with Approval

Ask if the user wants to apply the changes. Only edit files they approve.
