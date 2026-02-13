import { useState } from 'react';
import { AutoSkeleton } from './lib';
import { UserProfile, ProductCard, DashboardStats, FormExample } from './DemoComponents';
import { TableDemo } from './TableDemo';

function App() {
  const [loading, setLoading] = useState(true);
  const [selectedDemo, setSelectedDemo] = useState<'profile' | 'product' | 'dashboard' | 'form' | 'table'>('profile');

  const demos = {
    profile: <UserProfile />,
    product: <ProductCard />,
    dashboard: <DashboardStats />,
    form: <FormExample />,
    table: <TableDemo />,
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <div
        style={{
          background: '#0070f3',
          color: 'white',
          padding: '20px 40px',
          marginBottom: 40,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 28 }}>AutoSkeleton Prototype</h1>
        <p style={{ margin: '8px 0 0', opacity: 0.9 }}>
          Automatic loading skeletons via DOM inspection
        </p>
      </div>

      {/* Controls */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px' }}>
        <div
          style={{
            display: 'flex',
            gap: 16,
            marginBottom: 24,
            padding: 20,
            background: '#f5f5f5',
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <button
            onClick={() => setLoading(!loading)}
            style={{
              padding: '10px 24px',
              borderRadius: 6,
              border: 'none',
              background: loading ? '#10b981' : '#ef4444',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
              minWidth: 150,
            }}
          >
            {loading ? 'Show Content' : 'Show Skeleton'}
          </button>

          <div style={{ height: 24, width: 1, background: '#ddd' }} />

          <span style={{ fontWeight: 600, fontSize: 14 }}>Demo:</span>
          {(['profile', 'product', 'dashboard', 'form', 'table'] as const).map((demo) => (
            <button
              key={demo}
              onClick={() => setSelectedDemo(demo)}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                border: selectedDemo === demo ? '2px solid #0070f3' : '1px solid #ddd',
                background: selectedDemo === demo ? '#e6f2ff' : 'white',
                color: selectedDemo === demo ? '#0070f3' : '#666',
                cursor: 'pointer',
                fontWeight: selectedDemo === demo ? 600 : 400,
                fontSize: 14,
              }}
            >
              {demo.charAt(0).toUpperCase() + demo.slice(1)}
            </button>
          ))}
        </div>

        {/* Demo Container */}
        <div
          style={{
            background: 'white',
            borderRadius: 8,
            border: '1px solid #ddd',
            padding: 20,
            minHeight: 300,
          }}
        >
          <AutoSkeleton loading={loading} >
            {demos[selectedDemo]}
          </AutoSkeleton>
        </div>

        {/* Info */}
        <div
          style={{
            marginTop: 40,
            padding: 20,
            background: '#f9fafb',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
          }}
        >
          <h3 style={{ marginTop: 0 }}>How it works:</h3>
          <ol style={{ lineHeight: 1.8, color: '#666' }}>
            <li>When loading=true, the component renders invisibly</li>
            <li>DOM is traversed and measured (dimensions, styles, attributes)</li>
            <li>Heuristics classify elements as text, image, icon, button, input, or container</li>
            <li>Skeleton blocks are rendered matching the original layout</li>
            <li>When loading=false, the real content crossfades in</li>
          </ol>

          <h3 style={{ marginTop: 24 }}>Features:</h3>
          <ul style={{ lineHeight: 1.8, color: '#666' }}>
            <li>Zero manual skeleton creation for 70-80% of use cases</li>
            <li>Preserves flexbox/grid layouts automatically</li>
            <li>Escape hatches via data attributes for edge cases</li>
            <li>Scoring-based role detection (extensible)</li>
            <li>Client-side only (SSR safe, accepts hydration flash)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
