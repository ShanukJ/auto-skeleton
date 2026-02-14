# auto-skeleton-react

![npm version](https://img.shields.io/npm/v/auto-skeleton-react)
![npm downloads](https://img.shields.io/npm/dm/auto-skeleton-react)
![license](https://img.shields.io/npm/l/auto-skeleton-react)

Auto-generate skeleton loading screens from your existing React DOM structure. Zero manual skeleton creation for 70-80% of use cases.

**[Live Demo](https://autoskeleton.shanukj.me)** | **[Documentation](https://autoskeleton.shanukj.me/docs)**

## Installation

```bash
npm install auto-skeleton-react
```

## Usage

```tsx
import { useState } from 'react';
import { AutoSkeleton } from 'auto-skeleton-react';

function MyComponent() {
  const [loading, setLoading] = useState(true);

  return (
    <AutoSkeleton loading={loading}>
      <UserProfile />
    </AutoSkeleton>
  );
}
```

## How It Works

1. When `loading={true}`, the component renders children invisibly
2. DOM is traversed and measured (dimensions, styles, attributes)
3. Heuristics classify elements as text, image, icon, button, input, or container
4. Skeleton blocks are rendered matching the original layout
5. When `loading={false}`, the real content fades in

## Features

- **Zero manual work** — wraps any React component, no separate skeleton needed
- **Layout preservation** — maintains flexbox, grid, margins, padding, gaps
- **Multi-line text** — auto-detects line count from element height
- **Table support** — preserves table structure (thead, tbody, tr, td)
- **Opt-out mechanism** — `data-no-skeleton` or `.no-skeleton` keeps elements visible during loading
- **Smooth transitions** — crossfade between skeleton and content
- **Configurable** — animation, colors, border radius, depth limits

## Configuration

```tsx
<AutoSkeleton
  loading={loading}
  config={{
    animation: 'pulse',      // 'pulse' | 'shimmer' | 'none'
    baseColor: '#e0e0e0',
    borderRadius: 4,
    minTextHeight: 12,
    maxDepth: 10,
  }}
>
  <MyComponent />
</AutoSkeleton>
```

## Opt-Out (No Skeleton)

Keep specific elements visible during loading:

```tsx
{/* Using data attribute */}
<div data-no-skeleton>
  <span>Always visible during loading</span>
</div>

{/* Using class name */}
<button className="no-skeleton">Cancel</button>
```

## Escape Hatches

```tsx
{/* Force a specific skeleton type */}
<img data-skeleton-role="image" />
<span data-skeleton-role="text" />

{/* Ignore specific elements */}
<div data-skeleton-ignore>
  <SensitiveComponent />
</div>
```

## Architecture

- **Leaf-only replacement** — preserves container structure, replaces only visual leaves
- **Wrapper + content pattern** — wrapper keeps spacing, inner div gets skeleton styling
- **Score-based inference** — extensible heuristics avoid brittle if/else chains
- **requestAnimationFrame** — ensures DOM is painted before measurement

## Project Structure

```
src/
├── AutoSkeleton.tsx       # Main component
├── dom-traverser.ts       # DOM measurement logic
├── role-inferencer.ts     # Heuristic-based classification
├── skeleton-renderer.tsx  # Skeleton block renderer
├── types.ts               # TypeScript interfaces
└── index.ts               # Public API exports
```

## Known Limitations

- Client-side measurement only (expects hydration flash in SSR)
- Heuristics may misclassify custom components
- Not suitable for virtualized lists (>500 nodes)
- Performance cost on every loading transition
- Cannot predict dynamic text length

## When to Use

- Standard CRUD forms, dashboards, profile pages
- Prototyping and MVPs
- Reducing 70-80% of manual skeleton work

## When Not to Use

- Highly custom, pixel-perfect designs
- Virtualized tables or infinite scrollers
- Performance-critical views with frequent loading

## Contributing

Found a bug or have a feature request? [Open an issue](https://github.com/ShanukJ/auto-skeleton/issues) on GitHub.

## License

MIT
