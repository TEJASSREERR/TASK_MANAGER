'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export default function CalendarPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayTasks, setDayTasks] = useState([]);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) fetchTasks();
  }, [user, currentDate]);

  const fetchTasks = async () => {
    try {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const res = await api.get(`/tasks/calendar/?month=${month}&year=${year}`);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const getTasksForDay = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter(t => {
      if (!t.start_date) return false;
      const taskDate = new Date(t.start_date).toISOString().split('T')[0];
      return taskDate === dateStr;
    });
  };

  const handleDayClick = (day) => {
    const dayTasksList = getTasksForDay(day);
    setSelectedDate(day);
    setDayTasks(dayTasksList);
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  if (!user) return null;

  const days = [];
  for (let i = 0; i < startingDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div style={{ display: 'flex' }}>
      <Navbar />
      <div style={{ marginLeft: '260px', flex: 1, padding: '32px', background: '#f8f9fa', minHeight: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a2e' }}>Calendar</h1>
            <p style={{ color: '#666', marginTop: '4px' }}>View your tasks by date</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={prevMonth} style={{ padding: '8px', borderRadius: '8px', background: 'white', border: '1px solid #ddd' }}>
              <ChevronLeft size={20} />
            </button>
            <h2 style={{ fontSize: '20px', fontWeight: '600', minWidth: '200px', textAlign: 'center' }}>{monthName}</h2>
            <button onClick={nextMonth} style={{ padding: '8px', borderRadius: '8px', background: 'white', border: '1px solid #ddd' }}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '12px' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} style={{ textAlign: 'center', fontWeight: '600', color: '#666', fontSize: '14px', padding: '8px' }}>
                  {day}
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
              {days.map((day, idx) => {
                if (!day) return <div key={idx} style={{ minHeight: '100px' }} />;
                const dayTaskList = getTasksForDay(day);
                const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
                const isSelected = selectedDate === day;
                return (
                  <div
                    key={idx}
                    onClick={() => handleDayClick(day)}
                    style={{
                      minHeight: '100px',
                      padding: '8px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #667eea' : '1px solid #eee',
                      background: isToday ? '#eef2ff' : 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <span style={{ fontWeight: '600', fontSize: '14px', color: isToday ? '#667eea' : '#1a1a2e' }}>{day}</span>
                    {dayTaskList.slice(0, 2).map((task, tidx) => (
                      <div key={tidx} style={{ padding: '2px 6px', borderRadius: '4px', background: '#dbeafe', fontSize: '11px', color: '#2563eb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {task.title}
                      </div>
                    ))}
                    {dayTaskList.length > 2 && (
                      <span style={{ fontSize: '11px', color: '#999' }}>+{dayTaskList.length - 2} more</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', height: 'fit-content' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarIcon size={20} />
              {selectedDate ? `Tasks for ${currentDate.toLocaleString('default', { month: 'short' })} ${selectedDate}` : 'Select a date'}
            </h3>
            {dayTasks.length === 0 ? (
              <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>No tasks for this day</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {dayTasks.map((task) => (
                  <div key={task.id} onClick={() => router.push(`/tasks/${task.id}`)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #eee', cursor: 'pointer' }}>
                    <h4 style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{task.title}</h4>
                    <span style={{ fontSize: '12px', color: '#999' }}>{task.status} • {task.priority}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
