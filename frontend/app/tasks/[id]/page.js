'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Send, Trash2, Edit2, CheckCircle, Clock, Calendar, User, MessageSquare, Paperclip } from 'lucide-react';
import { format } from 'date-fns';

export default function TaskDetail() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const taskId = params.id;

  const [task, setTask] = useState(null);
  const [comment, setComment] = useState('');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user && taskId) fetchTask();
  }, [user, taskId]);

  const fetchTask = async () => {
    try {
      const res = await api.get(`/tasks/${taskId}/`);
      setTask(res.data);
      setEditForm(res.data);
    } catch (error) {
      toast.error('Task not found');
      router.push('/tasks');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      await api.post(`/tasks/${taskId}/comments/`, { content: comment });
      setComment('');
      fetchTask();
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}/`);
      toast.success('Task deleted');
      router.push('/tasks');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: editForm.title,
        description: editForm.description,
        priority: editForm.priority,
        status: editForm.status,
        start_date: editForm.start_date,
        due_date: editForm.due_date,
        estimated_hours: editForm.estimated_hours,
        actual_hours: editForm.actual_hours,
        is_shared: editForm.is_shared,
      };
      await api.patch(`/tasks/${taskId}/`, payload);
      toast.success('Task updated');
      setEditing(false);
      fetchTask();
    } catch (error) {
      toast.error('Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  if (!user || !task) return null;

  const isOwner = task.created_by?.id === user.id;

  return (
    <div style={{ display: 'flex' }}>
      <Navbar />
      <div style={{ marginLeft: '260px', flex: 1, padding: '32px', background: '#f8f9fa', minHeight: '100vh' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <button onClick={() => router.push('/tasks')} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#667eea', background: 'none', marginBottom: '24px', fontWeight: '500' }}>
            <ArrowLeft size={18} /> Back to Tasks
          </button>

          <div style={{ background: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                {editing ? (
                  <input
                    type="text"
                    value={editForm.title || ''}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    style={{ width: '100%', padding: '10px', fontSize: '20px', fontWeight: 'bold', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '12px' }}
                  />
                ) : (
                  <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '12px' }}>{task.title}</h1>
                )}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <PriorityBadge priority={task.priority} />
                  <StatusBadge status={task.status} />
                  {task.is_shared && <span style={{ padding: '4px 12px', borderRadius: '20px', background: '#dbeafe', color: '#2563eb', fontSize: '12px', fontWeight: '600' }}>Shared</span>}
                </div>
              </div>
              {isOwner && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setEditing(!editing)} style={{ padding: '8px', borderRadius: '8px', background: '#f3f4f6', color: '#374151' }}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={handleDelete} style={{ padding: '8px', borderRadius: '8px', background: '#fee2e2', color: '#dc2626' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <textarea
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={4}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <select value={editForm.priority} onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                  <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}>
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" disabled={saving} style={{ padding: '10px 24px', background: '#667eea', color: 'white', borderRadius: '8px', fontWeight: '600' }}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" onClick={() => setEditing(false)} style={{ padding: '10px 24px', background: '#f3f4f6', color: '#374151', borderRadius: '8px', fontWeight: '600' }}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <p style={{ color: '#4b5563', lineHeight: '1.6', marginBottom: '24px' }}>{task.description || 'No description provided.'}</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  <InfoItem icon={<User size={16} />} label="Created By" value={task.created_by?.full_name} />
                  <InfoItem icon={<User size={16} />} label="Assigned To" value={task.assigned_to?.full_name || 'Unassigned'} />
                  <InfoItem icon={<Calendar size={16} />} label="Start Date" value={task.start_date ? format(new Date(task.start_date), 'MMM dd, yyyy HH:mm') : 'Not set'} />
                  <InfoItem icon={<Calendar size={16} />} label="Due Date" value={task.due_date ? format(new Date(task.due_date), 'MMM dd, yyyy HH:mm') : 'Not set'} />
                  <InfoItem icon={<Clock size={16} />} label="Estimated" value={`${task.estimated_hours}h`} />
                  <InfoItem icon={<CheckCircle size={16} />} label="Actual" value={`${task.actual_hours}h`} />
                </div>

                {task.duration_display && (
                  <div style={{ padding: '12px 16px', background: '#f0fdf4', borderRadius: '8px', marginBottom: '24px' }}>
                    <span style={{ fontSize: '14px', color: '#166534', fontWeight: '500' }}>Duration: {task.duration_display}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Comments Section */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={20} /> Comments ({task.comments?.length || 0})
            </h3>

            <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
              />
              <button type="submit" style={{ padding: '12px 20px', background: '#667eea', color: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Send size={16} /> Post
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {task.comments?.length === 0 ? (
                <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>No comments yet. Be the first to comment!</p>
              ) : (
                task.comments?.map((c) => (
                  <div key={c.id} style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '600', fontSize: '14px' }}>{c.user?.full_name}</span>
                      <span style={{ fontSize: '12px', color: '#999' }}>{format(new Date(c.created_at), 'MMM dd, yyyy HH:mm')}</span>
                    </div>
                    <p style={{ color: '#4b5563', fontSize: '14px' }}>{c.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: '#f8f9fa', borderRadius: '8px' }}>
      <div style={{ color: '#667eea' }}>{icon}</div>
      <div>
        <p style={{ fontSize: '12px', color: '#999' }}>{label}</p>
        <p style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e' }}>{value}</p>
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
  return <span style={{ padding: '4px 12px', borderRadius: '12px', background: style.bg, color: style.color, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>{priority}</span>;
}

function StatusBadge({ status }) {
  const colors = {
    todo: { bg: '#f3f4f6', color: '#6b7280' },
    in_progress: { bg: '#fef3c7', color: '#d97706' },
    review: { bg: '#dbeafe', color: '#2563eb' },
    done: { bg: '#d1fae5', color: '#059669' },
  };
  const style = colors[status] || colors.todo;
  return <span style={{ padding: '4px 12px', borderRadius: '12px', background: style.bg, color: style.color, fontSize: '12px', fontWeight: '600', textTransform: 'capitalize' }}>{status.replace('_', ' ')}</span>;
}
