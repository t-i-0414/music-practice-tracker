# Component: [ComponentName]

## Overview

[Brief description of what this component does and why it exists]

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

## Usage Example

```tsx
<ComponentName propName='value' onEvent={handleEvent} />
```

## Accessibility

- ARIA labels: [Required labels]
- Keyboard navigation: [Support details]
- Screen reader: [How it's announced]

## Testing Requirements

- Render test: Component renders without crashing
- Props test: Props are handled correctly
- Event test: Event handlers are called
- Accessibility test: ARIA compliance

## Performance Considerations

- Use React.memo if expensive to render
- Lazy load if not immediately visible
- Optimize images and assets

## Dependencies

- Internal: [List of internal dependencies]
- External: [List of external libraries]

## Related Components

- [List of related components]

## Storybook

- Story file: `ComponentName.stories.tsx`
- [Link to Storybook]
