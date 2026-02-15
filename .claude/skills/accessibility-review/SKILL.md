---
name: accessibility-review
description: Review UI changes for accessibility compliance against web-design-guidelines. Use when asked to "review my UI", "check accessibility", "audit a11y", or after modifying frontend components in admin or mobile apps.
---

# Accessibility Review

Review UI changes against the **web-design-guidelines** skill for accessibility compliance.

## Workflow

1. **Identify UI Changes**

   Find changed frontend files:
   - `git diff --name-only -- '*.tsx' '*.jsx' '*.css' '*.scss'`
   - Filter to files in `packages/apps/admin/` and `packages/apps/mobile/`
   - Exclude test files, config files, and non-UI code

2. **Load Guidelines**

   Read the `web-design-guidelines` skill for the accessibility checklist and review criteria.

3. **Review Each Changed Component**

   For each UI file, check:

   **Semantic HTML & Structure**
   - Proper heading hierarchy
   - Landmark regions (nav, main, aside)
   - Semantic elements over divs where appropriate

   **Interactive Elements**
   - Keyboard navigability (focus management, tab order)
   - ARIA labels on non-text interactive elements
   - Focus indicators visible
   - Touch targets >= 44x44px (mobile)

   **Content & Visual**
   - Color contrast ratios (WCAG AA minimum)
   - Text alternatives for images
   - Responsive text sizing
   - Motion/animation respects prefers-reduced-motion

   **Forms & Inputs**
   - Labels associated with inputs
   - Error messages descriptive and accessible
   - Required fields indicated

4. **Summary Report**

   ```
   ## Accessibility Review

   Reviewed X UI files.

   ### Critical (WCAG A violations)
   - [issue] [file:line]

   ### Important (WCAG AA)
   - [issue] [file:line]

   ### Suggestions (best practices)
   - [suggestion] [file:line]

   ### Passing
   - [what's well-implemented]
   ```
