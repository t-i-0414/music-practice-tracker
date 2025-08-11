# Performance Optimization

## Overview

Performance optimization strategies and metrics for the Admin Dashboard to ensure fast, responsive user experience.

## Performance Targets

### Core Web Vitals

| Metric                         | Target  | Good    | Poor    |
| ------------------------------ | ------- | ------- | ------- |
| LCP (Largest Contentful Paint) | < 2.5s  | < 4s    | > 4s    |
| FID (First Input Delay)        | < 100ms | < 300ms | > 300ms |
| CLS (Cumulative Layout Shift)  | < 0.1   | < 0.25  | > 0.25  |
| TTFB (Time to First Byte)      | < 600ms | < 1s    | > 1s    |
| FCP (First Contentful Paint)   | < 1.8s  | < 3s    | > 3s    |

## Build Optimizations

### Next.js Configuration

```typescript
// next.config.ts
export default {
  // Enable SWC minification
  swcMinify: true,

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },

  // Enable compression
  compress: true,

  // Optimize fonts
  optimizeFonts: true,

  // Experimental features
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@mui/icons-material'],
  },
};
```

### Code Splitting

```typescript
// Dynamic imports for route-based splitting
const UserManagement = dynamic(
  () => import('@/modules/users'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);

// Component-level splitting
const HeavyChart = dynamic(
  () => import('@/components/Charts/HeavyChart'),
  { loading: () => <ChartSkeleton /> }
);
```

### Bundle Analysis

```bash
# Analyze bundle size
bun run build:analyze

# Check bundle composition
bun run bundle:stats
```

## Runtime Optimizations

### React Optimizations

#### Memoization

```typescript
// Memoize expensive computations
const expensiveValue = useMemo(() => computeExpensiveValue(data), [data]);

// Memoize callbacks
const handleClick = useCallback(
  (id: string) => {
    dispatch({ type: 'SELECT', id });
  },
  [dispatch],
);

// Memoize components
const MemoizedComponent = memo(Component, (prevProps, nextProps) => {
  return prevProps.id === nextProps.id;
});
```

#### Virtual Scrolling

```typescript
// For large lists
import { FixedSizeList } from 'react-window';

function VirtualList({ items }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <ListItem item={items[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}
```

### Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image';

function OptimizedImage() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero"
      width={1200}
      height={600}
      priority // For above-the-fold images
      placeholder="blur"
      blurDataURL={blurDataUrl}
    />
  );
}

// Lazy load images below the fold
<Image
  src="/feature.jpg"
  alt="Feature"
  loading="lazy"
  width={600}
  height={400}
/>
```

### Font Optimization

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Prevent FOIT
  preload: true,
  fallback: ['system-ui', 'arial'],
});
```

## Data Fetching Optimization

### Server-Side Optimization

```typescript
// Parallel data fetching
async function DashboardPage() {
  const [users, stats, logs] = await Promise.all([
    fetchUsers(),
    fetchStats(),
    fetchLogs(),
  ]);

  return <Dashboard users={users} stats={stats} logs={logs} />;
}
```

### Client-Side Caching

```typescript
// React Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache for 5 minutes
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,

      // Prefetch on hover
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
    },
  },
});

// Prefetch critical data
queryClient.prefetchQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
});
```

### Pagination & Infinite Scroll

```typescript
// Infinite query for large datasets
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
  queryKey: ['users'],
  queryFn: ({ pageParam = 0 }) => fetchUsers({ page: pageParam }),
  getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
});
```

## CSS Optimization

### Critical CSS

```typescript
// Extract critical CSS
// next.config.ts
export default {
  experimental: {
    optimizeCss: {
      inlineThreshold: 10 * 1024, // 10kb
    },
  },
};
```

### CSS Modules

```css
/* Use CSS Modules for scoped styles */
.container {
  /* Avoid expensive properties */
  will-change: auto; /* Only when needed */
  contain: layout; /* Containment for performance */
}

/* Prefer transforms over position changes */
.animated {
  transform: translateX(100px);
  /* Instead of: left: 100px; */
}
```

## Network Optimization

### Request Optimization

```typescript
// Batch API requests
const batchRequest = async (ids: string[]) => {
  return fetch('/api/batch', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
};

// Debounce search requests
const debouncedSearch = useMemo(
  () =>
    debounce((query: string) => {
      searchAPI(query);
    }, 300),
  [],
);
```

### Compression

```typescript
// Enable gzip/brotli compression
// middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set('Content-Encoding', 'gzip');
  return response;
}
```

### Caching Headers

```typescript
// Set appropriate cache headers
export async function GET(request: Request) {
  return new Response(data, {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'CDN-Cache-Control': 'max-age=86400',
    },
  });
}
```

## Monitoring

### Performance Monitoring

```typescript
// Web Vitals tracking
export function reportWebVitals(metric: NextWebVitalsMetric) {
  // Send to analytics
  analytics.track('Web Vitals', {
    name: metric.name,
    value: Math.round(metric.value),
    label: metric.id,
  });

  // Log poor performance
  if (metric.name === 'LCP' && metric.value > 2500) {
    console.warn('Poor LCP:', metric.value);
  }
}
```

### Custom Performance Marks

```typescript
// Measure custom operations
performance.mark('myOperation-start');

// ... operation code ...

performance.mark('myOperation-end');
performance.measure('myOperation', 'myOperation-start', 'myOperation-end');

const measure = performance.getEntriesByName('myOperation')[0];
console.log(`Operation took ${measure.duration}ms`);
```

## Lighthouse CI

### Configuration

```yaml
# lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:8000/'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'interactive': ['error', { maxNumericValue: 3500 }],
      },
    },
  },
};
```

## Memory Management

### Prevent Memory Leaks

```typescript
// Clean up event listeners
useEffect(() => {
  const handler = (e: Event) => {
    /* ... */
  };
  window.addEventListener('resize', handler);

  return () => {
    window.removeEventListener('resize', handler);
  };
}, []);

// Cancel async operations
useEffect(() => {
  const controller = new AbortController();

  fetch('/api/data', { signal: controller.signal }).then(/* ... */);

  return () => {
    controller.abort();
  };
}, []);
```

### Garbage Collection

```typescript
// Clear large objects when not needed
let largeData = null;

// Weak references for caches
const cache = new WeakMap();
```

## Progressive Enhancement

### Progressive Loading

```typescript
// Load core functionality first
const CoreApp = lazy(() => import('./CoreApp'));

// Then enhance with features
const EnhancedFeatures = lazy(() =>
  import('./EnhancedFeatures')
);

function App() {
  return (
    <Suspense fallback={<BasicLayout />}>
      <CoreApp />
      <Suspense fallback={null}>
        <EnhancedFeatures />
      </Suspense>
    </Suspense>
  );
}
```

## Service Worker

### Caching Strategy

```javascript
// public/sw.js
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache-first strategy for assets
      if (response) {
        return response;
      }

      return fetch(event.request).then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open('v1').then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      });
    }),
  );
});
```

## Performance Budget

### Budget Configuration

```json
{
  "budgets": [
    {
      "resourceSizes": [
        {
          "resourceType": "script",
          "budget": 300
        },
        {
          "resourceType": "style",
          "budget": 100
        },
        {
          "resourceType": "total",
          "budget": 500
        }
      ],
      "resourceCounts": [
        {
          "resourceType": "third-party",
          "budget": 10
        }
      ]
    }
  ]
}
```

## Checklist

### Pre-deployment

- [ ] Run Lighthouse audit
- [ ] Check bundle size
- [ ] Verify lazy loading
- [ ] Test on slow network
- [ ] Check memory usage
- [ ] Validate caching headers
- [ ] Test error boundaries
- [ ] Verify image optimization

### Post-deployment

- [ ] Monitor Core Web Vitals
- [ ] Track error rates
- [ ] Analyze user sessions
- [ ] Review performance metrics
- [ ] Check CDN hit rates
