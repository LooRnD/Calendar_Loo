import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { usePomodoro } from '../hooks/usePomodoro.js';
import { ProgressBar, PriorityBadge } from '../components/shared.jsx';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { getTodayStats, getStreakCount } from '../store.js';
import { nextOccurrence, advanceOccurrence } from '../recurrence.js';

function MiniPomodoro({ onNavigate }) {
  const { timeLeft, running, phase, start, pause, phaseLabel, phaseColor, formatTime, progress, PHASES } = usePomodoro();
  const RING = 36;
  const CIRC = 2 * Math.PI * RING;
  const offset = CIRC * (1 - progress);

  return (
    <div className="card" style={{ padding: '20px' }}>
      <div className="flex items-center justify-between mb-12">
        <div className="fs-14 fw-600">🍅 Pomodoro</div>
        <button className="fs-12 text-secondary" onClick={onNavigate}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Open →</button>
      </div>
      <div className="flex items-center gap-16">
        <div style={{ position: 'relative', width: 90, height: 90 }}>
          <svg width="90" height="90" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="45" cy="45" r={RING} fill="none" stroke="var(--border)" strokeWidth="6" />
            <circle cx="45" cy="45" r={RING} fill="none" stroke={phaseColor} strokeWidth="6"
              strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1s linear' }} />
          </svg>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{formatTime(timeLeft)}</div>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: phaseColor, fontWeight: 600, marginBottom: 6 }}>{phaseLabel}</div>
          <button
            onClick={running ? pause : start}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', background: phaseColor, boxShadow: 'none' }}
          >
            {running ? '⏸ Pause' : '▶ Start'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { tasks, events, userSettings, editTask } = useApp();
  const navigate = useNavigate();
  const today = dayjs();
  const todayStats = getTodayStats();
  const streak = getStreakCount();

  // Each event's next occurrence, so recurring events keep showing up after their first day
  const upcomingEvents = events
    .map(e => ({ ...e, occurrence: nextOccurrence(e.startDate, e.repeat, today) }))
    .filter(e => e.occurrence.isAfter(today.subtract(1, 'day'), 'day') || e.occurrence.isSame(today, 'day'))
    .sort((a, b) => a.occurrence.valueOf() - b.occurrence.valueOf())
    .slice(0, 5);

  const pendingTasks = tasks
    .filter(t => t.status !== 'done')
    .sort((a, b) => {
      const p = { high: 0, medium: 1, low: 2 };
      return p[a.priority] - p[b.priority];
    })
    .slice(0, 4);

  const completedToday = tasks.filter(t => t.status === 'done').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedToday / totalTasks) * 100) : 0;

  const projectCards = [
    { title: 'Create new task', subtitle: 'Start Date now!', color: 'teal', icon: '✅', action: () => navigate('/tasks') },
    { title: 'Pomodoro Timer', subtitle: "Let's focus!", color: 'purple', icon: '🍅', action: () => navigate('/pomodoro') },
  ];

  return (
    <div className="page-enter" style={{ display: 'flex', gap: 0, height: '100%' }}>
      {/* Main */}
      <div style={{ flex: 1, overflow: 'auto', paddingRight: 24 }}>
        {/* Header */}
        <div className="mb-24">
          <div className="flex items-center justify-between mb-4">
            <h1 className="fs-24 fw-700 text-primary">
              {today.format('DD MMMM YYYY')}
            </h1>
            <div className="flex items-center gap-8 fs-13 text-secondary">
              <span>{completedToday} of {totalTasks} completed</span>
              <div style={{ width: 100 }}>
                <ProgressBar value={completionRate} />
              </div>
            </div>
          </div>
          <p className="text-secondary fs-13">
            Good {today.hour() < 12 ? 'morning' : today.hour() < 18 ? 'afternoon' : 'evening'}, {userSettings.name.split(' ')[0]}! 👋
          </p>
        </div>

        {/* Project Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
          {projectCards.map(({ title, subtitle, color, icon, action }) => (
            <div key={title} className={`project-card ${color}`} onClick={action}>
              <div className="project-card-icon">{icon}</div>
              <div>
                <div className="project-card-title">{title}</div>
                <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>{subtitle}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Today's tasks */}
        <div className="section-header mb-12">
          <h2 className="section-title">Today's Tasks</h2>
          <div className="section-actions">
            <button className="btn btn-ghost" onClick={() => navigate('/tasks')}>Archive</button>
            <button className="btn btn-primary" onClick={() => navigate('/tasks')} id="dashboard-new-task-btn">+ New</button>
          </div>
        </div>

        <div className="search-bar mb-16">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input className="search-input" placeholder="Search tasks..." readOnly
            onClick={() => navigate('/tasks')} />
        </div>

        {pendingTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
            <div className="fs-14 fw-600">All tasks completed!</div>
          </div>
        ) : (
          pendingTasks.map((task) => {
            const icons = { Design: '🎨', Development: '💻', Personal: '🌿', General: '📋', Work: '💼' };
            const icon = icons[task.category] || '📌';
            return (
              <div key={task.id} className="task-item" onClick={() => navigate('/tasks')}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (task.status !== 'done' && task.repeat !== 'none' && task.dueDate) {
                      editTask(task.id, { status: 'done' });
                      const next = advanceOccurrence(task.dueDate, task.repeat, today);
                      editTask(task.id, { status: 'todo', dueDate: next.toISOString(), progress: 0 });
                    } else {
                      editTask(task.id, { status: task.status === 'done' ? 'todo' : 'done' });
                    }
                  }}
                  title={task.status === 'done' ? 'Mark as Todo' : 'Mark as Done'}
                  style={{
                    width: 22, height: 22, borderRadius: '50%', padding: 0,
                    border: `2px solid ${task.status === 'done' ? '#52C41A' : 'var(--border)'}`,
                    background: task.status === 'done' ? '#52C41A' : 'transparent',
                    marginRight: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', flexShrink: 0
                  }}
                >
                  {task.status === 'done' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                </button>
                <div className="task-icon"
                  style={{ background: (task.categoryColor || '#6C60E0') + '20', color: task.categoryColor || '#6C60E0', marginLeft: 0 }}>
                  <span style={{ fontSize: 16 }}>{icon}</span>
                </div>
                <div className="task-info">
                  <div className="task-title">{task.repeat !== 'none' && '🔁 '}{task.title}</div>
                  <div className="task-meta">
                    {task.category} · {task.status === 'in_progress' ? 'In Progress' : 'To Do'}
                    {task.dueDate && ` · ${nextOccurrence(task.dueDate, task.repeat, today).format('DD/MM')}`}
                  </div>
                </div>
                <PriorityBadge priority={task.priority} />
                <div className="task-avatar" style={{ background: task.categoryColor || '#6C60E0' }}>
                  {userSettings.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
              </div>
            );
          })
        )}

        {/* Bottom stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 24 }}>
          {[
            { label: 'Productivity Streak', value: streak, unit: 'days 🔥', color: '#FF6B35' },
            { label: 'Focus Time', value: todayStats.focusMinutes || 0, unit: 'minutes ⏱️', color: '#6C60E0' },
            { label: 'Completion Rate', value: `${completionRate}%`, unit: 'Tasks ✅', color: '#52C41A' },
          ].map(({ label, value, unit, color }) => (
            <div key={label} className="stat-card">
              <div style={{ fontSize: 26, fontWeight: 700, color }}>{value}</div>
              <div className="stat-label">{label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{unit}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ width: 260, borderLeft: '1px solid var(--border)', paddingLeft: 20, overflowY: 'auto' }}>
        <div className="flex items-center justify-between mb-16">
          <h2 className="fs-16 fw-700">Calendar</h2>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
        </div>

        {/* Mini Pomodoro */}
        <div style={{ marginBottom: 16 }}>
          <MiniPomodoro onNavigate={() => navigate('/pomodoro')} />
        </div>

        {/* Upcoming events */}
        {upcomingEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 13 }}>
            <div style={{ fontSize: 32, marginBottom: 6 }}>📅</div>
            No upcoming events
          </div>
        ) : (
          (() => {
            // Group by date
            const groups = {};
            upcomingEvents.forEach(ev => {
              const key = ev.occurrence.format('DD MMMM');
              if (!groups[key]) groups[key] = [];
              groups[key].push(ev);
            });
            return Object.entries(groups).map(([dateStr, evts]) => (
              <div key={dateStr}>
                <div className="date-group-header">
                  <span className="date-group-label">{dateStr}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    style={{ color: 'var(--text-muted)' }}>
                    <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
                  </svg>
                </div>
                {evts.map(ev => (
                  <div key={ev.id} className="calendar-event-item" onClick={() => navigate('/calendar')} style={{ cursor: 'pointer' }}>
                    <div className="event-time">
                      {ev.allDay ? 'All day' : dayjs(ev.startDate).format('HH:mm')}
                    </div>
                    <div className="event-bar" style={{ background: ev.color || '#6C60E0' }} />
                    <div className="event-info">
                      <div className="event-category">{ev.category}</div>
                      <div className="event-title">{ev.repeat !== 'none' && '🔁 '}{ev.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            ));
          })()
        )}
      </div>
    </div>
  );
}
