'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Users, Shield, CheckCircle, XCircle, ToggleLeft, ToggleRight, BarChart3 } from 'lucide-react';

export default function AdminPortal() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total_users: 0, active_users: 0, admin_users: 0, google_users: 0 });
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (!loading && user && !user.is_admin) router.push('/dashboard');
  }, [user, loading, router]);

useEffect(() => {
  if (!user?.is_admin) {
    router.push("/dashboard");  // Redirect non-admins
  }
}, [user]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/admin/users/');
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to fetch users');
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/auth/admin/stats/');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleUserActive = async (userId, currentStatus) => {
    try {
      await api.patch(`/auth/admin/users/${userId}/`, { is_active: !currentStatus });
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update user');
    }
  };

  const toggleCanAddTasks = async (userId, currentStatus) => {
    try {
      await api.patch(`/auth/admin/users/${userId}/`, { can_add_tasks: !currentStatus });
      toast.success(`Task creation ${!currentStatus ? 'enabled' : 'disabled'}`);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update user');
    }
  };

  const toggleAdmin = async (userId, currentStatus) => {
    try {
      await api.patch(`/auth/admin/users/${userId}/`, { is_admin: !currentStatus });
      toast.success(`Admin ${!currentStatus ? 'granted' : 'removed'}`);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update user');
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  if (!user || !user.is_admin) return null;

  return (
    <div style={{ display: 'flex' }}>
      <Navbar />
      <div style={{ marginLeft: '260px', flex: 1, padding: '32px', background: '#f8f9fa', minHeight: '100vh' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a2e' }}>Admin Portal</h1>
          <p style={{ color: '#666', marginTop: '4px' }}>Manage users and monitor activity</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <StatCard icon={<Users size={24} color="#667eea" />} label="Total Users" value={stats.total_users} bg="#eef2ff" />
          <StatCard icon={<CheckCircle size={24} color="#10b981" />} label="Active Users" value={stats.active_users} bg="#ecfdf5" />
          <StatCard icon={<Shield size={24} color="#f59e0b" />} label="Admins" value={stats.admin_users} bg="#fffbeb" />
          <StatCard icon={<BarChart3 size={24} color="#8b5cf6" />} label="Google Users" value={stats.google_users} bg="#f5f3ff" />
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', borderBottom: '1px solid #eee', paddingBottom: '16px' }}>
            <button onClick={() => setActiveTab('users')} style={{ padding: '8px 16px', borderRadius: '8px', background: activeTab === 'users' ? '#667eea' : 'transparent', color: activeTab === 'users' ? 'white' : '#666', fontWeight: '600', fontSize: '14px' }}>
              All Users
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee' }}>
                  <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>User</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Email</th>
                  <th style={{ textAlign: 'center', padding: '12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Active</th>
                  <th style={{ textAlign: 'center', padding: '12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Admin</th>
                  <th style={{ textAlign: 'center', padding: '12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Can Add Tasks</th>
                  <th style={{ textAlign: 'center', padding: '12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Provider</th>
                  <th style={{ textAlign: 'center', padding: '12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#667eea', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
                          {u.full_name?.charAt(0)}
                        </div>
                        <span style={{ fontWeight: '500', fontSize: '14px' }}>{u.full_name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>{u.email}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button onClick={() => toggleUserActive(u.id, u.is_active)} style={{ background: 'none' }}>
                        {u.is_active ? <CheckCircle size={20} color="#10b981" /> : <XCircle size={20} color="#ef4444" />}
                      </button>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button onClick={() => toggleAdmin(u.id, u.is_admin)} style={{ background: 'none' }}>
                        {u.is_admin ? <ToggleRight size={24} color="#667eea" /> : <ToggleLeft size={24} color="#ccc" />}
                      </button>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button onClick={() => toggleCanAddTasks(u.id, u.can_add_tasks)} style={{ background: 'none' }}>
                        {u.can_add_tasks ? <ToggleRight size={24} color="#10b981" /> : <ToggleLeft size={24} color="#ccc" />}
                      </button>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '12px', background: u.auth_provider === 'google' ? '#dbeafe' : '#f3f4f6', color: u.auth_provider === 'google' ? '#2563eb' : '#6b7280', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize' }}>
                        {u.auth_provider}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#999' }}>Manage</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, bg }) {
  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e' }}>{value}</p>
        <p style={{ fontSize: '14px', color: '#666' }}>{label}</p>
      </div>
    </div>
  );
}
