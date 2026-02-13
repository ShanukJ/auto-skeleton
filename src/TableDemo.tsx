import { useEffect, useState } from 'react';
import { AutoSkeleton } from './lib';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
}

// Placeholder data for skeleton measurement (same structure, representative content)
const placeholderUsers: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active', lastLogin: '2024-01-15' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Editor', status: 'active', lastLogin: '2024-01-14' },
  { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'Viewer', status: 'inactive', lastLogin: '2024-01-10' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Editor', status: 'active', lastLogin: '2024-01-13' },
  { id: 5, name: 'Charlie Davis', email: 'charlie@example.com', role: 'Viewer', status: 'active', lastLogin: '2024-01-12' },
];

function StatusBadge({ status }: { status: 'active' | 'inactive' }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 500,
        backgroundColor: status === 'active' ? '#dcfce7' : '#fee2e2',
        color: status === 'active' ? '#166534' : '#991b1b',
      }}
    >
      {status === 'active' ? 'Active' : 'Inactive'}
    </span>
  );
}

function UserTable({ users }: { users: User[] }) {
  const tableStyles: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
  };

  const thStyles: React.CSSProperties = {
    textAlign: 'left',
    padding: '12px 16px',
    borderBottom: '2px solid #e5e7eb',
    fontWeight: 600,
    fontSize: 14,
    color: '#374151',
    backgroundColor: '#f9fafb',
  };

  const tdStyles: React.CSSProperties = {
    padding: '12px 16px',
    borderBottom: '1px solid #e5e7eb',
    fontSize: 14,
    color: '#4b5563',
  };

  return (
    <table style={tableStyles}>
      <thead>
        <tr>
          <th style={{ ...thStyles, width: '5%' }}>#</th>
          <th style={{ ...thStyles, width: '20%' }}>Name</th>
          <th style={{ ...thStyles, width: '25%' }}>Email</th>
          <th style={{ ...thStyles, width: '15%' }}>Role</th>
          <th style={{ ...thStyles, width: '15%' }}>Status</th>
          <th style={{ ...thStyles, width: '20%' }}>Last Login</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td style={tdStyles}>{user.id}</td>
            <td style={{ ...tdStyles, fontWeight: 500, color: '#111827' }}>{user.name}</td>
            <td style={tdStyles}>{user.email}</td>
            <td style={tdStyles}>{user.role}</td>
            <td style={tdStyles}>
              <StatusBadge status={user.status} />
            </td>
            <td style={tdStyles}>{user.lastLogin}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function TableDemo() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      setUsers([
        { id: 1, name: 'Emma Thompson', email: 'emma.t@company.com', role: 'Administrator', status: 'active', lastLogin: '2024-01-20 14:32' },
        { id: 2, name: 'Michael Chen', email: 'michael.chen@company.com', role: 'Editor', status: 'active', lastLogin: '2024-01-19 09:15' },
        { id: 3, name: 'Sarah Johnson', email: 'sarah.j@company.com', role: 'Viewer', status: 'inactive', lastLogin: '2024-01-15 16:45' },
        { id: 4, name: 'David Kim', email: 'david.kim@company.com', role: 'Editor', status: 'active', lastLogin: '2024-01-18 11:20' },
        { id: 5, name: 'Lisa Anderson', email: 'lisa.a@company.com', role: 'Viewer', status: 'active', lastLogin: '2024-01-17 08:55' },
      ]);
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Use placeholder data when loading for measurement, real data when loaded
  const displayUsers = loading ? placeholderUsers : users;

  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>User Management</h2>
        <button
          onClick={() => {
            setLoading(true);
            setTimeout(() => {
              setUsers(placeholderUsers);
              setLoading(false);
            }, 2000);
          }}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: '1px solid #d1d5db',
            background: 'white',
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          Refresh
        </button>
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
        <AutoSkeleton loading={loading}>
          <UserTable users={displayUsers} />
        </AutoSkeleton>
      </div>
    </div>
  );
}
