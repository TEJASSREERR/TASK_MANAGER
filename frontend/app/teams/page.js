'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Users, Mail, Copy, CheckCircle, X, UserPlus } from 'lucide-react';

export default function Teams() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [teams, setTeams] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: '', description: '' });
  const [inviteEmail, setInviteEmail] = useState('');
  const [activeTeam, setActiveTeam] = useState(null);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) fetchTeams();
  }, [user]);

  const fetchTeams = async () => {
    try {
      const res = await api.get('/teams/');
      setTeams(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/teams/', newTeam);
      toast.success('Team created successfully');
      setShowCreate(false);
      setNewTeam({ name: '', description: '' });
      fetchTeams();
    } catch (error) {
      toast.error('Failed to create team');
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail || !activeTeam) return;
    try {
      await api.post(`/teams/${activeTeam}/invite/`, { email: inviteEmail });
      toast.success('Invitation sent');
      setInviteEmail('');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send invitation');
    }
  };

  const fetchMembers = async (teamId) => {
    try {
      const res = await api.get(`/teams/${teamId}/members/`);
      setMembers(res.data);
      setActiveTeam(teamId);
    } catch (err) {
      console.error(err);
    }
  };

  const copyInviteCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Invite code copied');
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  if (!user) return null;

  return (
    <div style={{ display: 'flex' }}>
      <Navbar />
      <div style={{ marginLeft: '260px', flex: 1, padding: '32px', background: '#f8f9fa', minHeight: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a2e' }}>Teams</h1>
            <p style={{ color: '#666', marginTop: '4px' }}>Collaborate with your team members</p>
          </div>
          <button onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#667eea', color: 'white', borderRadius: '8px', fontWeight: '600' }}>
            <Plus size={18} /> Create Team
          </button>
        </div>

        {showCreate && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Create New Team</h3>
              <button onClick={() => setShowCreate(false)} style={{ background: 'none', color: '#999' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                placeholder="Team name"
                value={newTeam.name}
                onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                required
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
              />
              <textarea
                placeholder="Description (optional)"
                value={newTeam.description}
                onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                rows={3}
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', resize: 'vertical' }}
              />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" style={{ padding: '10px 24px', background: '#667eea', color: 'white', borderRadius: '8px', fontWeight: '600' }}>Create</button>
                <button type="button" onClick={() => setShowCreate(false)} style={{ padding: '10px 24px', background: '#f3f4f6', color: '#374151', borderRadius: '8px', fontWeight: '600' }}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {teams.map((team) => (
            <div key={team.id} style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#667eea', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '20px' }}>
                  {team.name.charAt(0)}
                </div>
                <button onClick={() => copyInviteCode(team.invite_code)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: '#f3f4f6', borderRadius: '6px', fontSize: '12px', color: '#374151' }}>
                  <Copy size={12} /> {team.invite_code}
                </button>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '6px' }}>{team.name}</h3>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>{team.description || 'No description'}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Users size={16} color="#999" />
                <span style={{ fontSize: '14px', color: '#666' }}>{team.member_count} members</span>
              </div>

              <button onClick={() => fetchMembers(team.id)} style={{ width: '100%', padding: '10px', background: '#f3f4f6', color: '#374151', borderRadius: '8px', fontWeight: '500', fontSize: '14px' }}>
                View Members
              </button>
            </div>
          ))}
        </div>

        {teams.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
            <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p>No teams yet. Create your first team to start collaborating!</p>
          </div>
        )}

        {/* Members Modal */}
        {activeTeam && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div style={{ background: 'white', borderRadius: '16px', padding: '32px', width: '90%', maxWidth: '500px', maxHeight: '80vh', overflow: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Team Members</h3>
                <button onClick={() => setActiveTeam(null)} style={{ background: 'none', color: '#999' }}><X size={24} /></button>
              </div>

              <form onSubmit={handleInvite} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <input
                  type="email"
                  placeholder="Enter email to invite"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
                />
                <button type="submit" style={{ padding: '10px 16px', background: '#667eea', color: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserPlus size={16} /> Invite
                </button>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {members.map((member) => (
                  <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8f9fa', borderRadius: '8px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#667eea', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
                      {member.user?.full_name?.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '500', fontSize: '14px' }}>{member.user?.full_name}</p>
                      <p style={{ fontSize: '12px', color: '#999' }}>{member.user?.email}</p>
                    </div>
                    <span style={{ padding: '4px 10px', borderRadius: '12px', background: member.role === 'admin' ? '#dbeafe' : '#f3f4f6', color: member.role === 'admin' ? '#2563eb' : '#6b7280', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize' }}>
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
