---
name: plan
description: Plan a feature implementation with domain-aware context from relevant skills. Use when asked to "plan a feature", "design implementation", or before starting non-trivial feature work that spans backend (NestJS), admin (Next.js), mobile (React Native), or build system (Turborepo).
---

# Domain-Aware Feature Planning

Plan a feature implementation using the **planner** sub-agent enhanced with domain-specific knowledge from relevant skills.

## Workflow

1. **Classify the Feature Domain**

   Based on the feature description and target files, determine which domain(s) apply:

   | Domain                | Skill to consult                                             | Indicators                                        |
   | --------------------- | ------------------------------------------------------------ | ------------------------------------------------- |
   | Backend API / DDD     | `nestjs-best-practices`                                      | controller, service, module, API endpoint, Prisma  |
   | Admin dashboard       | `next-best-practices`, `next-cache-components`               | admin page, dashboard, Server Components           |
   | Mobile app            | `vercel-react-native-skills`                                 | screen, mobile component, Expo                     |
   | Shared React          | `vercel-react-best-practices`, `vercel-composition-patterns` | shared component, design system                    |
   | Build system          | `turborepo`                                                  | turbo.json, CI, caching, pipeline                  |

2. **Load Domain Knowledge**

   Read the `SKILL.md` and key reference files from the identified skill(s) to understand:
   - Required patterns and conventions
   - File structure expectations
   - Common pitfalls to avoid

3. **Run Planner**

   Invoke the **planner** sub-agent with:
   - The feature description
   - Domain-specific patterns and constraints from the skill(s)
   - Project architecture context from the rules

4. **Output**

   A structured implementation plan that includes:
   - Step-by-step implementation order
   - Files to create/modify
   - Domain patterns to follow
   - Testing strategy
   - Potential risks or gotchas
