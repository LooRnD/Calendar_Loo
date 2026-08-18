import React from 'react';
import dayjs from 'dayjs';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { useApp } from '../context/AppContext.jsx';
import { getStreakCount } from '../store.js';

const COLORS = ['#6C60E0', '#4FD1C5', '#FF6B35', '#52C41A', '#FF4757'];

export default function AnalyticsPage() {
  const { tasks, pomodoroSessions, dailyStats } = useApp();
  const streak = getStreakCount();

  // Last 7 days stats
  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const d = dayjs().subtract(6 - i, 'day');
    const key = d.format('YYYY-MM-DD');
    const stat = dailyStats.find(s => s.date === key) || { focusMinutes: 0, tasksCompleted: 0, pomodorosCompleted: 0 };
    return {
      day: d.format('ddd'),
      focus: stat.focusMinutes || 0,
      tasks: stat.tasksCompleted || 0,
      pomodoros: stat.pomodorosCompleted || 0,
    };
  });

  // Task completion by priority
  const priorityData = [
    { name: 'High', count: tasks.filter(t => t.priority === 'high' && t.status === 'done').length },
    { name: 'Medium', count: tasks.filter(t => t.priority === 'medium' && t.status === 'done').length },
    { name: 'Low', count: tasks.filter(t => t.priority === 'low' && t.status === 'done').length },
  ].filter(d => d.count > 0);

  // Category breakdown
  const catMap = {};
  tasks.forEach(t => {
    if (!catMap[t.category]) catMap[t.category] = { total: 0, done: 0, color: t.categoryColor || '#6C60E0' };
    catMap[t.category].total++;
    if (t.status === 'done') catMap[t.category].done++;
  });
  const categoryData = Object.entries(catMap).map(([name, { total, done, color }]) => ({ name, total, done, color }));

  // Total stats
  const totalFocusMin = pomodoroSessions.filter(s => s.type === 'work' && s.completed).reduce((a, s) => a + s.durationMin, 0);
  const totalSessions = pomodoroSessions.filter(s => s.type === 'work' && s.completed).length;
  const completionRate = tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0;

  // Heatmap: last 35 days
  const heatmapDays = Array.from({ length: 35 }).map((_, i) => {
    const d = dayjs().subtract(34 - i, 'day');
    const stat = dailyStats.find(s => s.date === d.format('YYYY-MM-DD'));
    const level = !stat ? 0
      : (stat.pomodorosCompleted || 0) >= 8 ? 4
      : (stat.pomodorosCompleted || 0) >= 5 ? 3
      : (stat.pomodorosCompleted || 0) >= 2 ? 2
      : (stat.pomodorosCompleted || 0) >= 1 ? 1 : 0;
    return { date: d.format('DD/MM'), level };
  });

  const customTooltipStyle = { background: '#1B1C35', border: 'none', borderRadius: 8, color: 'white', fontSize: 12 };

  return (
    <div className="page-enter">
      <div className="section-header mb-24">
        <div>
          <h1 className="fs-24 fw-700 text-primary">📊 Analytics</h1>
          <p className="text-secondary fs-13" style={{ marginTop: 4 }}>
            Personal productivity overview
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { icon: '🔥', label: 'Streak', value: `${streak} days`, color: '#FF6B35', sub: 'Consecutive' },
          { icon: '⏱️', label: 'Focus Time', value: `${Math.round(totalFocusMin / 60 * 10) / 10}h`, color: '#6C60E0', sub: 'Total' },
          { icon: '🍅', label: 'Pomodoros', value: totalSessions, color: '#FF4757', sub: 'Sessions' },
          { icon: '✅', label: 'Done', value: `${completionRate}%`, color: '#52C41A', sub: 'Task rate' },
        ].map(({ icon, label, value, color, sub }) => (
          <div key={label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>{label} · {sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Focus time bar chart */}
        <div className="card">
          <div className="fs-14 fw-600 mb-16">⏱️ Focus time (7 days)</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={last7} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF5" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#8892A4' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8892A4' }} axisLine={false} tickLine={false} unit="m" />
              <Tooltip contentStyle={customTooltipStyle} formatter={(v) => [`${v} minutes`, 'Focus']} />
              <Bar dataKey="focus" fill="#6C60E0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Task completion line chart */}
        <div className="card">
          <div className="fs-14 fw-600 mb-16">✅ Tasks completed (7 days)</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={last7}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF5" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#8892A4' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8892A4' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={customTooltipStyle} formatter={(v) => [`${v} tasks`, 'Completed']} />
              <Line type="monotone" dataKey="tasks" stroke="#52C41A" strokeWidth={2.5}
                dot={{ fill: '#52C41A', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Activity Heatmap */}
        <div className="card">
          <div className="flex items-center justify-between mb-16">
            <div className="fs-14 fw-600">📅 Activity Heatmap (5 weeks)</div>
            <div className="flex gap-4 items-center">
              <span className="fs-11 text-muted">Ít</span>
              {[0, 1, 2, 3, 4].map(l => (
                <div key={l} style={{
                  width: 12, height: 12, borderRadius: 2,
                  background: l === 0 ? 'var(--border)'
                    : l === 1 ? 'rgba(108,96,224,0.2)'
                    : l === 2 ? 'rgba(108,96,224,0.4)'
                    : l === 3 ? 'rgba(108,96,224,0.65)'
                    : '#6C60E0',
                }} />
              ))}
              <span className="fs-11 text-muted">Many</span>
            </div>
          </div>
          <div className="heatmap-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {heatmapDays.map((d, i) => (
              <div key={i} className={`heatmap-cell level-${d.level}`} title={`${d.date}: Level ${d.level}`} />
            ))}
          </div>
        </div>

        {/* Priority breakdown pie */}
        <div className="card">
          <div className="fs-14 fw-600 mb-16">🎯 Tasks theo Priority</div>
          {priorityData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={priorityData} dataKey="count" cx="50%" cy="50%" outerRadius={50} innerRadius={30}>
                    {priorityData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={customTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-col gap-4" style={{ marginTop: 8 }}>
                {priorityData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i] }} />
                      <span className="fs-12">{d.name}</span>
                    </div>
                    <span className="fs-12 fw-600">{d.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 13 }}>
              No completed tasks
            </div>
          )}
        </div>
      </div>

      {/* Category breakdown */}
      {categoryData.length > 0 && (
        <div className="card">
          <div className="fs-14 fw-600 mb-16">🗂️ Progress theo Category</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {categoryData.map(({ name, total, done, color }) => (
              <div key={name}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-6">
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                    <span className="fs-13 fw-500">{name}</span>
                  </div>
                  <span className="fs-12 text-secondary">{done}/{total}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${total ? Math.round(done / total * 100) : 0}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
