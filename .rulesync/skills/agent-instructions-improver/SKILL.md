---
name: agent-instructions-improver
description: Audit and improve agent instruction files (e.g., CLAUDE.md, .cursorrules) in repositories. Use when asked to check, audit, update, improve, or fix instruction files. Scans for all instruction files, evaluates quality against templates, outputs quality report, then makes targeted updates. Also use when the user mentions "instruction file maintenance" or "project memory optimization".
targets:
  - '*'
---

# Agent Instructions Improver

Audit, evaluate, and improve agent instruction files across a codebase to ensure AI coding agents have optimal project context.

**This skill can write to instruction files.** After presenting a quality report and getting user approval, it updates instruction files with targeted improvements.

## Workflow

### Phase 1: Discovery

Find all agent instruction files in the repository (e.g., CLAUDE.md, .cursorrules, copilot-instructions.md).

**File Types & Locations:**

| Type             | Examples                                     | Purpose                                  |
| ---------------- | -------------------------------------------- | ---------------------------------------- |
| Project root     | `./CLAUDE.md`, `./.cursorrules`              | Primary project context (shared)         |
| Local overrides  | `./.claude.local.md`                         | Personal/local settings (gitignored)     |
| Global defaults  | `~/.claude/CLAUDE.md`, `~/.cursor/rules`     | User-wide defaults across all projects   |
| Package-specific | `./packages/*/CLAUDE.md`                     | Module-level context in monorepos        |
| Subdirectory     | Any nested location                          | Feature/domain-specific context          |

### Phase 2: Quality Assessment

For each instruction file, evaluate against quality criteria. See [references/quality-criteria.md](references/quality-criteria.md) for detailed rubrics.

**Quick Assessment Checklist:**

| Criterion                     | Weight | Check                                         |
| ----------------------------- | ------ | --------------------------------------------- |
| Commands/workflows documented | High   | Are build/test/deploy commands present?       |
| Architecture clarity          | High   | Can the agent understand the codebase structure? |
| Non-obvious patterns          | Medium | Are gotchas and quirks documented?            |
| Conciseness                   | Medium | No verbose explanations or obvious info?      |
| Currency                      | High   | Does it reflect current codebase state?       |
| Actionability                 | High   | Are instructions executable, not vague?       |

**Quality Scores:**

- **A (90-100)**: Comprehensive, current, actionable
- **B (70-89)**: Good coverage, minor gaps
- **C (50-69)**: Basic info, missing key sections
- **D (30-49)**: Sparse or outdated
- **F (0-29)**: Missing or severely outdated

### Phase 3: Quality Report Output

**ALWAYS output the quality report BEFORE making any updates.**

### Phase 4: Targeted Updates

After outputting the quality report, ask user for confirmation before updating.

**Update Guidelines (Critical):**

1. **Propose targeted additions only** - Focus on genuinely useful info
2. **Keep it minimal** - Avoid restating what's obvious from the code
3. **Show diffs** - For each change, show which file, the specific addition, and why

### Phase 5: Apply Updates

After user approval, apply changes. Preserve existing content structure.

## Templates

See [references/templates.md](references/templates.md) for instruction file templates by project type.

## Common Issues to Flag

1. **Stale commands**: Build commands that no longer work
2. **Missing dependencies**: Required tools not mentioned
3. **Outdated architecture**: File structure that's changed
4. **Missing environment setup**: Required env vars or config
5. **Broken test commands**: Test scripts that have changed
6. **Undocumented gotchas**: Non-obvious patterns not captured

## What Makes a Great Instruction File

**Key principles:**

- Concise and human-readable
- Actionable commands that can be copy-pasted
- Project-specific patterns, not generic advice
- Non-obvious gotchas and warnings

**Recommended sections** (use only what's relevant):

- Commands (build, test, dev, lint)
- Architecture (directory structure)
- Key Files (entry points, config)
- Code Style (project conventions)
- Environment (required vars, setup)
- Testing (commands, patterns)
- Gotchas (quirks, common mistakes)
- Workflow (when to do what)
