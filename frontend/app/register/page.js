'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    password_confirm: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/register/', formData);
      const { user, tokens } = response.data;
      login(user, tokens);
      toast.success('Account created successfully!');
      router.push('/dashboard');
    } catch (error) {
      const msg = error.response?.data;
      if (typeof msg === 'object') {
        toast.error(Object.values(msg).flat().join(', '));
      } else {
        toast.error(msg?.detail || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await api.post('/auth/google/', {
        token: credentialResponse.credential,
      });
      const { user, tokens } = response.data;
      login(user, tokens);
      toast.success('Google signup successful!');
      router.push('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Google signup failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '40px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '8px', fontSize: '28px', fontWeight: 'bold' }}>Create Account</h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>Get started with Task Manager</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input
              type="text"
              name="full_name"
              placeholder="Full name"
              value={formData.full_name}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '12px 40px 12px 40px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', color: '#999' }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password_confirm"
              placeholder="Confirm password"
              value={formData.password_confirm}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              background: loading ? '#ccc' : '#667eea',
              color: 'white',
              fontWeight: '600',
              fontSize: '16px',
            }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ margin: '24px 0', textAlign: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: '#eee' }}></div>
          <span style={{ position: 'relative', background: 'white', padding: '0 16px', color: '#999', fontSize: '14px' }}>or</span>
        </div>

        {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google signup failed')}
            />
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '12px', background: '#fef3c7', borderRadius: '8px', color: '#92400e', fontSize: '14px' }}>
            Google Sign In not configured. Use email/password below.
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: '24px', color: '#666', fontSize: '14px' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#667eea', fontWeight: '600' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
