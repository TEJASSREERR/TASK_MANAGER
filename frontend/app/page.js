'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Users, Calendar, Shield } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px' }}>
        <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>Task Manager</h1>
        <div style={{ display: 'flex', gap: '15px' }}>
          <Link href="/login">
            <button style={{ padding: '10px 24px', borderRadius: '8px', background: 'transparent', color: 'white', border: '2px solid white', fontWeight: '600' }}>
              Login
            </button>
          </Link>
          <Link href="/register">
            <button style={{ padding: '10px 24px', borderRadius: '8px', background: 'white', color: '#667eea', fontWeight: '600' }}>
              Get Started
            </button>
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 20px', textAlign: 'center', color: 'white' }}>
        <h2 style={{ fontSize: '56px', fontWeight: 'bold', marginBottom: '20px' }}>
          Manage Tasks with Your Team
        </h2>
        <p style={{ fontSize: '20px', opacity: 0.9, maxWidth: '600px', margin: '0 auto 40px' }}>
          Create tasks, invite team members, track time, and collaborate efficiently. 
          All in one place.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', marginTop: '60px' }}>
          <FeatureCard icon={<CheckCircle size={40} />} title="Task Management" desc="Create, assign, and track tasks with priorities and deadlines." />
          <FeatureCard icon={<Users size={40} />} title="Team Collaboration" desc="Invite members, share tasks, and work together seamlessly." />
          <FeatureCard icon={<Calendar size={40} />} title="Calendar View" desc="Visualize tasks on a calendar with start and due dates." />
          <FeatureCard icon={<Shield size={40} />} title="Admin Controls" desc="Manage users, enable/disable features, and monitor activity." />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '30px', borderRadius: '16px', textAlign: 'center' }}>
      <div style={{ marginBottom: '15px' }}>{icon}</div>
      <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>{title}</h3>
      <p style={{ opacity: 0.8, fontSize: '14px' }}>{desc}</p>
    </div>
  );
}
