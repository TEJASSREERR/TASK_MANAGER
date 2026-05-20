'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Save, LogOut } from 'lucide-react';

export default function Profile() {
  const { user, loading, logout, updateUser } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({ full_name: '', email: '' });
  const [passwordData, setPasswordData] = useState({ old_password: '', new_password: '' });
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setFormData({ full_name: user.full_name || '', email: user.email || '' });
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.patch('/auth/profile/', formData);
      updateUser(res.data);
      toast.success('Profile updated');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/password-change/', passwordData);
      toast.success('Password changed successfully');
      setPasswordData({ old_password: '', new_password: '' });
      setChangingPassword(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to change password');
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  if (!user) return null;

  return (
    <div style={{ display: 'flex' }}>
      <Navbar />
      <div style={{ marginLeft: '260px', flex: 1, padding: '32px', background: '#f8f9fa', minHeight: '100vh' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '8px' }}>Profile</h1>
          <p style={{ color: '#666', marginBottom: '32px' }}>Manage your account settings</p>

          <div style={{ background: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#667eea', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '32px' }}>
                {user.full_name?.charAt(0)}
              </div>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '600' }}>{user.full_name}</h2>
                <p style={{ color: '#666', fontSize: '14px' }}>{user.email}</p>
                <span style={{ display: 'inline-block', marginTop: '6px', padding: '4px 12px', borderRadius: '12px', background: user.is_admin ? '#dbeafe' : '#f3f4f6', color: user.is_admin ? '#2563eb' : '#6b7280', fontSize: '12px', fontWeight: '600' }}>
                  {user.is_admin ? 'Administrator' : 'Member'}
                </span>
              </div>
            </div>

            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#374151' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#374151' }}>Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', background: '#f3f4f6', color: '#999' }}
                  />
                </div>
              </div>
              <button type="submit" disabled={saving} style={{ padding: '12px', background: '#667eea', color: 'white', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Security</h3>
            {!changingPassword ? (
              <button onClick={() => setChangingPassword(true)} style={{ padding: '12px 24px', background: '#f3f4f6', color: '#374151', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={18} /> Change Password
              </button>
            ) : (
              <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="password"
                  placeholder="Current password"
                  value={passwordData.old_password}
                  onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                  required
                  style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
                />
                <input
                  type="password"
                  placeholder="New password"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  required
                  style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
                />
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" style={{ padding: '10px 24px', background: '#667eea', color: 'white', borderRadius: '8px', fontWeight: '600' }}>Update Password</button>
                  <button type="button" onClick={() => setChangingPassword(false)} style={{ padding: '10px 24px', background: '#f3f4f6', color: '#374151', borderRadius: '8px', fontWeight: '600' }}>Cancel</button>
                </div>
              </form>
            )}
          </div>

          <button onClick={logout} style={{ width: '100%', padding: '12px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}
