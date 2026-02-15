---
name: audit-types
description: Audit all type changes in the current branch for design quality using type-design-analyzer. Use when introducing new types, refactoring data models, during PR creation with type/interface/enum changes, or when asked to "audit types" or "check type design".
---

# Type Design Audit

Run **type-design-analyzer** across all new or modified types in the current branch.

## Workflow

1. **Find Type Changes**

   Compare against the base branch to identify type modifications:
   - `git diff develop --name-only -- '*.ts' '*.tsx'`
   - Filter to files containing type/interface/class/enum definitions
   - Exclude test files and generated files

2. **Extract Types**

   For each changed file, identify:
   - New type definitions (type, interface, class, enum)
   - Modified type definitions (changed fields, methods, constraints)
   - Skip unchanged types within modified files

3. **Run Type Design Analyzer**

   For each new/modified type, invoke **type-design-analyzer** to evaluate:
   - **Encapsulation** (1-10): Are internals properly hidden?
   - **Invariant Expression** (1-10): Are constraints clear from the type structure?
   - **Invariant Usefulness** (1-10): Do invariants prevent real bugs?
   - **Invariant Enforcement** (1-10): Are invariants enforced at construction/mutation?

4. **Summary Report**

   ```
   ## Type Audit Report

   Analyzed X types across Y files.

   ### Types Needing Attention (avg < 7)
   | Type | Encap | Express | Useful | Enforce | Avg |
   |------|-------|---------|--------|---------|-----|
   | Foo  | 5     | 6       | 8      | 4       | 5.8 |

   ### Well-Designed Types (avg >= 7)
   | Type | Encap | Express | Useful | Enforce | Avg |
   |------|-------|---------|--------|---------|-----|
   | Bar  | 8     | 9       | 8      | 7       | 8.0 |

   ### Top Recommendations
   1. [type]: [specific improvement]
   2. [type]: [specific improvement]
   ```
