'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { CheckCircle, Clock, AlertTriangle, ListTodo, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ total: 0, completed: 0, in_progress: 0, overdue: 0 });
  const [recentTasks, setRecentTasks] = useState([]);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, tasksRes, teamsRes] = await Promise.all([
        api.get('/tasks/stats/'),
        api.get('/tasks/?limit=5'),
        api.get('/teams/'),
      ]);
      setStats(statsRes.data);
      setRecentTasks(tasksRes.data.results || tasksRes.data);
      setTeams(teamsRes.data.results || teamsRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  if (!user) return null;

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div style={{ display: 'flex' }}>
      <Navbar />
      <div style={{ marginLeft: '260px', flex: 1, padding: '32px', background: '#f8f9fa', minHeight: '100vh' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a2e' }}>Dashboard</h1>
          <p style={{ color: '#666', marginTop: '4px' }}>Welcome back, {user.full_name}!</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <StatCard icon={<ListTodo size={24} color="#667eea" />} label="Total Tasks" value={stats.total} bg="#eef2ff" />
          <StatCard icon={<CheckCircle size={24} color="#10b981" />} label="Completed" value={stats.completed} bg="#ecfdf5" />
          <StatCard icon={<Clock size={24} color="#f59e0b" />} label="In Progress" value={stats.in_progress} bg="#fffbeb" />
          <StatCard icon={<AlertTriangle size={24} color="#ef4444" />} label="Overdue" value={stats.overdue} bg="#fef2f2" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Recent Tasks</h3>
              <button onClick={() => router.push('/tasks')} style={{ color: '#667eea', fontSize: '14px', fontWeight: '500', background: 'none' }}>
                View All
              </button>
            </div>
            {recentTasks.length === 0 ? (
              <p style={{ color: '#999', textAlign: 'center', padding: '40px' }}>No tasks yet. Create your first task!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentTasks.map((task) => (
                  <div key={task.id} onClick={() => router.push(`/tasks/${task.id}`)} style={{ padding: '16px', borderRadius: '8px', border: '1px solid #eee', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontWeight: '600', marginBottom: '4px' }}>{task.title}</h4>
                      <span style={{ fontSize: '12px', color: '#999' }}>{task.status} • {task.priority}</span>
                    </div>
                    <StatusBadge status={task.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Completion Rate</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: `conic-gradient(#667eea ${completionRate * 3.6}deg, #e5e7eb 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px' }}>
                    {completionRate}%
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: '14px', color: '#666' }}>{stats.completed} of {stats.total} tasks done</p>
                </div>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>My Teams</h3>
              {teams.length === 0 ? (
                <p style={{ color: '#999', fontSize: '14px' }}>No teams yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {teams.slice(0, 4).map((team) => (
                    <div key={team.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '6px', background: '#f8f9fa' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#667eea', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
                        {team.name.charAt(0)}
                      </div>
                      <div>
                        <p style={{ fontWeight: '500', fontSize: '14px' }}>{team.name}</p>
                        <p style={{ fontSize: '12px', color: '#999' }}>{team.member_count} members</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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

function StatusBadge({ status }) {
  const colors = {
    todo: { bg: '#f3f4f6', color: '#6b7280' },
    in_progress: { bg: '#fef3c7', color: '#d97706' },
    review: { bg: '#dbeafe', color: '#2563eb' },
    done: { bg: '#d1fae5', color: '#059669' },
  };
  const style = colors[status] || colors.todo;
  return (
    <span style={{ padding: '4px 12px', borderRadius: '20px', background: style.bg, color: style.color, fontSize: '12px', fontWeight: '500', textTransform: 'capitalize' }}>
      {status.replace('_', ' ')}
    </span>
  );
}
