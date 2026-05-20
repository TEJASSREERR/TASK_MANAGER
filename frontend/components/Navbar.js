'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CheckSquare, Users, Calendar, Shield, User, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/tasks', label: 'Tasks', icon: CheckSquare },
    { href: '/teams', label: 'Teams', icon: Users },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
  ];

  const isActive = (href) => pathname === href;

  return (
    <div style={{ 
      width: '260px', 
      minHeight: '100vh', 
      backgroundColor: '#1a1a2e', 
      color: 'white', 
      position: 'fixed', 
      left: 0, 
      top: 0,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '24px 20px', 
        borderBottom: '1px solid rgba(255,255,255,0.1)' 
      }}>
        <h2 style={{ 
          fontSize: '22px', 
          fontWeight: 'bold', 
          color: '#667eea',
          margin: 0 
        }}>
          Task Manager
        </h2>
      </div>

      {/* Navigation Links */}
      <div style={{ flex: 1, padding: '16px 0' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 24px',
                textDecoration: 'none',
                color: active ? 'white' : 'rgba(255,255,255,0.7)',
                backgroundColor: active ? '#4f46e5' : 'transparent',
                transition: 'all 0.2s',
                fontSize: '14px',
                fontWeight: 500
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Icon size={18} style={{ marginRight: '12px' }} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Admin Link */}
        {user?.is_admin && (
          <Link
            href="/admin"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 24px',
              textDecoration: 'none',
              color: isActive('/admin') ? 'white' : 'rgba(255,255,255,0.7)',
              backgroundColor: isActive('/admin') ? '#4f46e5' : 'transparent',
              transition: 'all 0.2s',
              fontSize: '14px',
              fontWeight: 500
            }}
            onMouseEnter={(e) => {
              if (!isActive('/admin')) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
            }}
            onMouseLeave={(e) => {
              if (!isActive('/admin')) e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Shield size={18} style={{ marginRight: '12px' }} />
            <span>Admin</span>
          </Link>
        )}
      </div>

      {/* Bottom Section */}
      <div style={{ 
        borderTop: '1px solid rgba(255,255,255,0.1)', 
        padding: '16px 0' 
      }}>
        <Link
          href="/profile"
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 24px',
            textDecoration: 'none',
            color: isActive('/profile') ? 'white' : 'rgba(255,255,255,0.7)',
            backgroundColor: isActive('/profile') ? '#4f46e5' : 'transparent',
            transition: 'all 0.2s',
            fontSize: '14px',
            fontWeight: 500
          }}
          onMouseEnter={(e) => {
            if (!isActive('/profile')) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
          }}
          onMouseLeave={(e) => {
            if (!isActive('/profile')) e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <User size={18} style={{ marginRight: '12px' }} />
          <span>Profile</span>
        </Link>

        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 24px',
            width: '100%',
            border: 'none',
            background: 'transparent',
            color: '#ef4444',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <LogOut size={18} style={{ marginRight: '12px' }} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}