'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { Plus, Search, Filter, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function Tasks() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) fetchTasks();
  }, [user, filterStatus, filterPriority]);

  const fetchTasks = async () => {
    try {
      let url = '/tasks/';
      const params = [];
      if (filterStatus) params.push(`status=${filterStatus}`);
      if (filterPriority) params.push(`priority=${filterPriority}`);
      if (params.length) url += '?' + params.join('&');
      const response = await api.get(url);
      setTasks(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  if (!user) return null;

  return (
    <div style={{ display: 'flex' }}>
      <Navbar />
      <div style={{ marginLeft: '260px', flex: 1, padding: '32px', background: '#f8f9fa', minHeight: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a2e' }}>Tasks</h1>
            <p style={{ color: '#666', marginTop: '4px' }}>Manage and track your tasks</p>
          </div>
          <button
            onClick={() => router.push('/tasks/new')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#667eea', color: 'white', borderRadius: '8px', fontWeight: '600' }}
          >
            <Plus size={18} /> New Task
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
            />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}>
            <option value="">All Status</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}>
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          {filteredTasks.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#999' }}>
              <p>No tasks found. Create your first task!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => router.push(`/tasks/${task.id}`)}
                  style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid #f0f0f0',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                      <h3 style={{ fontWeight: '600', fontSize: '16px' }}>{task.title}</h3>
                      <PriorityBadge priority={task.priority} />
                      {task.is_shared && <span style={{ fontSize: '11px', padding: '2px 8px', background: '#dbeafe', color: '#2563eb', borderRadius: '10px' }}>Shared</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#999', fontSize: '13px' }}>
                      <span>By {task.created_by?.full_name}</span>
                      {task.assigned_to && <span>Assigned to {task.assigned_to?.full_name}</span>}
                      {task.due_date && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} /> {format(new Date(task.due_date), 'MMM dd, yyyy')}
                        </span>
                      )}
                      {task.comment_count > 0 && (
                        <span>{task.comment_count} comments</span>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PriorityBadge({ priority }) {
  const colors = {
    low: { bg: '#f3f4f6', color: '#6b7280' },
    medium: { bg: '#dbeafe', color: '#2563eb' },
    high: { bg: '#fef3c7', color: '#d97706' },
    urgent: { bg: '#fee2e2', color: '#dc2626' },
  };
  const style = colors[priority] || colors.low;
  return (
    <span style={{ padding: '2px 10px', borderRadius: '12px', background: style.bg, color: style.color, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>
      {priority}
    </span>
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
    <span style={{ padding: '6px 16px', borderRadius: '20px', background: style.bg, color: style.color, fontSize: '12px', fontWeight: '600', textTransform: 'capitalize' }}>
      {status.replace('_', ' ')}
    </span>
  );
}
