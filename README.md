# AutoSkeleton Prototype

Automatic loading skeletons for React via DOM inspection.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open http://localhost:5173 in your browser.

## What This Demonstrates

- **DOM Traversal**: Measures and inspects rendered component structure
- **Leaf-Only Skeletons**: Preserves layout containers, replaces only visual leaf elements
- **Spacing Preservation**: Maintains margins, padding, gaps, line-height, and flex/grid properties
- **Role Inference**: Score-based heuristics classify elements (text, image, icon, button, input)
- **Layout Preservation**: Maintains flexbox/grid layouts, inline/block display types
- **Multi-line Text**: Detects and renders multiple skeleton lines for text blocks
- **Zero Manual Work**: No separate skeleton components needed for 70-80% of cases

## Architecture

**Key Strategy: Wrapper + Content Pattern**
- Wrapper preserves: display, margin, padding, flex properties, grid properties
- Inner skeleton: only visual properties (width, height, color, border-radius)
- Result: Exact spacing and layout with skeleton replacements

**Multi-line Text Detection:**
- Calculates lines from `height / line-height`
- Renders N skeleton bars with proper vertical spacing
- Last line is 70% width for natural appearance

**Decision Rules:**
```typescript
// KEEP as container (recurse into children):
- Has 2+ children
- Has flex/grid display
- Wrapper divs

// REPLACE with skeleton:
- <img>, <button>, <input>, <textarea>, <select>, <svg>
- Text elements with no children
- Single-child text containers
```

## Project Structure

```
src/
├── lib/
│   ├── AutoSkeleton.tsx       # Main component
│   ├── dom-traverser.ts       # DOM measurement logic
│   ├── role-inferencer.ts     # Heuristic-based classification
│   ├── skeleton-renderer.tsx  # Skeleton block renderer
│   ├── types.ts               # TypeScript interfaces
│   └── index.ts               # Public API exports
├── DemoComponents.tsx         # Example components
├── App.tsx                    # Demo app
└── main.tsx                   # Entry point
```

## Basic Usage

```tsx
import { AutoSkeleton } from './lib';

function MyComponent() {
  const [loading, setLoading] = useState(true);

  return (
    <AutoSkeleton loading={loading}>
      <UserProfile />
    </AutoSkeleton>
  );
}
```

## Escape Hatches

```tsx
// Ignore specific elements
<div data-skeleton-ignore>
  <SensitiveComponent />
</div>

// Force specific skeleton type
<img data-skeleton-role="image" />
<span data-skeleton-role="text" />
```

## Configuration

```tsx
<AutoSkeleton 
  loading={loading}
  config={{
    animation: 'pulse',
    baseColor: '#e0e0e0',
    borderRadius: 4,
    minTextHeight: 12,
    maxDepth: 10,
  }}
>
  <MyComponent />
</AutoSkeleton>
```

## Known Limitations

- Client-side measurement only (expects hydration flash in SSR)
- Heuristics may misclassify custom components
- Not suitable for virtualized lists (>500 nodes)
- Performance cost on every loading transition
- Cannot predict dynamic text length

## When to Use

✅ Standard CRUD forms, dashboards, profile pages  
✅ Prototyping and MVPs  
✅ Reducing 70-80% of manual skeleton work  

❌ Highly custom, pixel-perfect designs  
❌ Virtualized tables or infinite scrollers  
❌ Performance-critical views with frequent loading  

## Architecture Decisions

1. **Leaf-Only Replacement**: Preserves container structure, only replaces visual leaves
2. **Wrapper + Content Pattern**: Wrapper keeps spacing, inner div gets skeleton styling
3. **Preserved Properties**: display, margin, padding, line-height, flex/grid positioning
4. **Score-Based Inference**: Extensible heuristics avoid brittle if/else chains
5. **requestAnimationFrame**: Ensures DOM is painted before measurement
6. **No SSR Generation**: Accepts client-side flash to avoid build complexity
7. **Multi-line Text**: Auto-detects line count from height/line-height ratio

## Next Steps for Production

- Add debouncing (useMemo with smart deps)
- Implement shimmer animation (CSS gradient mask)
- Add image load detection (onLoad listeners)
- Improve performance monitoring
- Add error boundaries
- Create comprehensive test suite
- Publish to NPM

## License

MIT (Prototype for demonstration purposes)
