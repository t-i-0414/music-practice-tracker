# Component: [ComponentName]

> Template for React components in Admin Dashboard (Next.js).

## Props Interface

```typescript
interface [ComponentName]Props {
  id: string;
  title: string;
  description?: string;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick?: (id: string) => void;
  onError?: (error: Error) => void;
  children?: React.ReactNode;
}
```

## Implementation

### Client Component

```tsx
'use client';

import React, { useCallback } from 'react';
import styles from './ComponentName.module.css';

export function ComponentName({
  id,
  title,
  description,
  isLoading = false,
  variant = 'primary',
  onClick,
  onError,
  children,
}: ComponentNameProps) {
  const handleClick = useCallback(() => {
    try {
      onClick?.(id);
    } catch (error) {
      onError?.(error as Error);
    }
  }, [id, onClick, onError]);

  if (isLoading) {
    return <div className={styles.skeleton}>Loading...</div>;
  }

  return (
    <div className={`${styles.container} ${styles[variant]}`}>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {onClick && (
        <button onClick={handleClick} type='button'>
          Action
        </button>
      )}
      {children}
    </div>
  );
}
```

### Server Component

```tsx
import { fetchData } from '@/lib/api';

export async function ServerComponentName({ id }: { id: string }) {
  const data = await fetchData(id);

  return (
    <div>
      <h2>{data.title}</h2>
      <p>{data.description}</p>
    </div>
  );
}
```

## CSS Module

```css
/* ComponentName.module.css */
.container {
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  background: var(--color-background);
}

.primary {
  background: var(--color-primary);
}
.secondary {
  background: var(--color-secondary);
}
.danger {
  background: var(--color-danger);
}

.skeleton {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  50% {
    opacity: 0.5;
  }
}
```

## Testing

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from '../ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName id='1' title='Test' />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles click', () => {
    const handleClick = vi.fn();
    render(<ComponentName id='1' title='Test' onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledWith('1');
  });
});
```

## Storybook

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './ComponentName';

const meta = {
  title: 'Components/ComponentName',
  component: ComponentName,
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: '1',
    title: 'Component Title',
    description: 'Description',
  },
};
```

## Checklist

- [ ] TypeScript props defined
- [ ] Client/Server component decision made
- [ ] Loading & error states handled
- [ ] CSS variables used (not hardcoded)
- [ ] Unit tests written
- [ ] Storybook story created
- [ ] Accessibility attributes added
