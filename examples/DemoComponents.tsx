export function UserProfile() {
  return (
    <div style={{ display: 'flex', gap: 16, padding: 20, maxWidth: 600 }}>
      <img
        src="https://i.pravatar.cc/80?img=12"
        style={{ width: 80, height: 80, borderRadius: '50%' }}
        alt="Avatar"
      />
      <div style={{ flex: 1 }}>
        <h2 style={{ margin: 0, marginBottom: 8, fontSize: 24 }}>John Doe</h2>
        <p style={{ margin: 0, color: '#666', marginBottom: 12 }}>
          Software Engineer at Acme Corp
        </p>
        <button
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: 'none',
            background: '#0070f3',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Follow
        </button>
      </div>
    </div>
  );
}

export function ProductCard() {
  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: 8,
        padding: 16,
        maxWidth: 300,
      }}
    >
      <img
        src="https://picsum.photos/300/200?random=1"
        style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 4 }}
        alt="Product"
      />
      <h3 style={{ marginTop: 12, marginBottom: 8 }}>Premium Headphones</h3>
      <p style={{ color: '#666', fontSize: 14, marginBottom: 12 }}>
        High-quality wireless headphones with active noise cancellation
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 24, fontWeight: 'bold' }}>$299</span>
        <button
          style={{
            padding: '8px 24px',
            borderRadius: 6,
            border: 'none',
            background: '#10b981',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export function DashboardStats() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, padding: 20 }}>
      <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
        <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>Total Users</div>
        <div style={{ fontSize: 32, fontWeight: 'bold' }}>12,345</div>
        <div style={{ fontSize: 12, color: '#10b981', marginTop: 8 }}>+12% from last month</div>
      </div>
      <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
        <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>Revenue</div>
        <div style={{ fontSize: 32, fontWeight: 'bold' }}>$45,678</div>
        <div style={{ fontSize: 12, color: '#10b981', marginTop: 8 }}>+8% from last month</div>
      </div>
      <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
        <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>Active Sessions</div>
        <div style={{ fontSize: 32, fontWeight: 'bold' }}>892</div>
        <div style={{ fontSize: 12, color: '#ef4444', marginTop: 8 }}>-3% from last month</div>
      </div>
    </div>
  );
}

export function FormExample() {
  return (
     <div style={{ padding: 16, maxWidth: 420 }}>
        <h3 style={{ margin: 0, marginBottom: 8 }}>Loading Profile</h3>
        <p style={{ margin: 0, color: '#666' }}>
          This text should skeletonize while loading.
        </p>
        <div
          data-no-skeleton
          style={{ marginTop: 12, fontSize: 12, color: '#0f766e' }}
        >
          data-no-skeleton: always visible
        </div>
      </div>
  );
}
