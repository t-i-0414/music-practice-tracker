# Component: [ComponentName]

## Overview

[Brief description of what this component does in the admin context]

## Visual Design

- [Figma Link](link-to-figma-design)
- [Screenshot/Mockup]

## Props Interface

```typescript
interface [ComponentName]Props {
  // Required props
  propName: Type;

  // Optional props
  optionalProp?: Type;

  // Event handlers
  onEvent?: (param: Type) => void;
}
```

## Component States

- **Default** - Initial render state
- **Loading** - While fetching data
- **Error** - When an error occurs
- **Success** - After successful action
- **Empty** - No data available

## Usage Example

```tsx
<ComponentName propName='value' onEvent={handleEvent} />
```

## Data Fetching

```typescript
// Server Component (if applicable)
const data = await fetchData();

// Client Component with React Query
const { data, isLoading, error } = useQuery({
  queryKey: ['resource'],
  queryFn: fetchResource,
});
```

## Styling

- CSS Modules: `ComponentName.module.css`
- Design tokens from globals.css
- Responsive breakpoints

## Accessibility

- ARIA labels: [Required labels]
- Keyboard navigation: [Support details]
- Screen reader: [How it's announced]
- Focus management: [Tab order]

## Testing Requirements

- Unit tests with Vitest
- Integration tests with Cypress
- E2E tests with Playwright
- MSW mocks for API calls

## Performance Considerations

- Use Next.js Image for images
- Implement virtual scrolling for long lists
- Code splitting with dynamic imports
- Memoization where appropriate

## Dependencies

- Internal: [List of internal dependencies]
- External: [List of external libraries]

## Related Components

- [List of related components]

## Storybook

- Story file: `ComponentName.stories.ts`
- [Link to Storybook]
