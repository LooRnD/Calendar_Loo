import React, { useState, useEffect } from 'react';
import { usePomodoro } from '../hooks/usePomodoro.js';
import { useApp } from '../context/AppContext.jsx';

const RING_RADIUS = 80;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function PomodoroRing({ progress, color }) {
  const offset = RING_CIRCUMFERENCE * (1 - progress);
  return (
    <svg width="220" height="220" className="pomodoro-ring">
      <circle className="pomodoro-ring-bg" cx="110" cy="110" r={RING_RADIUS} />
      <circle
        className="pomodoro-ring-fill"
        cx="110" cy="110" r={RING_RADIUS}
        stroke={color}
        strokeDasharray={RING_CIRCUMFERENCE}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

function SettingsModal({ isOpen, onClose }) {
  const { pomodoroSettings, saveSettings } = useApp();
  const [form, setForm] = useState(pomodoroSettings);

  useEffect(() => { setForm(pomodoroSettings); }, [pomodoroSettings]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = (e) => {
    e.preventDefault();
    saveSettings(form);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="flex items-center justify-between mb-20">
          <h2 className="modal-title" style={{ margin: 0 }}>⚙️ Pomodoro Settings</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close" style={{ position: 'static' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <form onSubmit={handleSave}>
          {[
            { key: 'workDuration', label: '🍅 Work Duration (minutes)', min: 5, max: 90 },
            { key: 'shortBreak', label: '☕ Short Break (minutes)', min: 1, max: 30 },
            { key: 'longBreak', label: '🌴 Long Break (minutes)', min: 5, max: 60 },
            { key: 'cyclesBeforeLong', label: '🔄 Cycles before long break', min: 2, max: 8 },
          ].map(({ key, label, min, max }) => (
            <div className="form-group" key={key}>
              <label className="form-label">{label}: <strong>{form[key]}</strong></label>
              <input type="range" min={min} max={max} value={form[key]}
                onChange={e => set(key, Number(e.target.value))}
                style={{ width: '100%', accentColor: '#6C60E0' }} />
            </div>
          ))}

          <div className="form-group">
            <label className="form-label">🎧 Background Music (Youtube URL or ID)</label>
            <input className="form-input" value={form.musicUrl || ''} 
              onChange={e => set('musicUrl', e.target.value)}
              placeholder="e.g. jfKfPfyJRdk or https://youtu.be/..." />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {[
              { key: 'autoStartBreak', label: '⚡ Auto-start break' },
              { key: 'autoStartWork', label: '🔄 Auto-start work' },
              { key: 'soundEnabled', label: '🔔 Notification sound' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-8" style={{ cursor: 'pointer' }}>
                <input type="checkbox" checked={form[key]}
                  onChange={e => set(key, e.target.checked)}
                  style={{ accentColor: '#6C60E0', width: 16, height: 16 }} />
                <span className="fs-13">{label}</span>
              </label>
            ))}
          </div>

          <div className="flex gap-8" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save settings</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PomodoroPage() {
  const { tasks, pomodoroSettings, pomodoroSessions } = useApp();
  const [showSettings, setShowSettings] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  const getYoutubeId = (url) => {
    if (!url) return 'jfKfPfyJRdk';
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : url;
  };
  const videoId = getYoutubeId(pomodoroSettings?.musicUrl || 'jfKfPfyJRdk');

  const {
    phase, cycle, timeLeft, running, progress,
    linkedTask, setLinkedTask,
    start, pause, reset, skip,
    formatTime, phaseLabel, phaseColor, PHASES,
  } = usePomodoro();

  const activeTasks = tasks.filter(t => t.status !== 'done');
  const todaySessions = pomodoroSessions.filter(s => {
    const d = new Date(s.startedAt);
    const t = new Date();
    return d.toDateString() === t.toDateString();
  });
  const totalFocusMin = todaySessions
    .filter(s => s.type === 'work' && s.completed)
    .reduce((acc, s) => acc + s.durationMin, 0);
  const completedToday = todaySessions.filter(s => s.type === 'work' && s.completed).length;

  // Update document title when running
  useEffect(() => {
    if (running) {
      document.title = `${formatTime(timeLeft)} ${phaseLabel} — Calendar Loo`;
    } else {
      document.title = 'Calendar Loo — Personal Productivity';
    }
    return () => { document.title = 'Calendar Loo — Personal Productivity'; };
  }, [running, timeLeft, phaseLabel, formatTime]);

  const timerContent = (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 16, fontWeight: 600, color: phaseColor, marginBottom: 8 }}>
        {phaseLabel}
      </div>

      <div className="pomodoro-ring-container" style={{ marginBottom: 24 }}>
        <PomodoroRing progress={progress} color={phaseColor} />
        <div className="pomodoro-time-display">
          <div style={{ fontSize: 48, fontWeight: 700, color: focusMode ? 'white' : 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            {formatTime(timeLeft)}
          </div>
          <div style={{ fontSize: 13, color: focusMode ? 'rgba(255,255,255,0.6)' : 'var(--text-secondary)', marginTop: 4 }}>
            Cycle {cycle}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-12" style={{ justifyContent: 'center', marginBottom: 24 }}>
        <button className="btn btn-ghost" onClick={reset} style={{ borderRadius: '50%', width: 44, height: 44, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
          </svg>
        </button>
        <button
          onClick={running ? pause : start}
          style={{
            width: 64, height: 64, borderRadius: '50%', border: 'none',
            background: phaseColor, color: 'white', fontSize: 24,
            cursor: 'pointer', boxShadow: `0 6px 20px ${phaseColor}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          id="pomodoro-toggle-btn"
        >
          {running ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          )}
        </button>
        <button className="btn btn-ghost" onClick={skip} style={{ borderRadius: '50%', width: 44, height: 44, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/>
          </svg>
        </button>
      </div>

      {/* Phase indicators */}
      <div className="flex gap-8" style={{ justifyContent: 'center', marginBottom: 24 }}>
        {[PHASES.WORK, PHASES.SHORT_BREAK, PHASES.LONG_BREAK].map(p => (
          <div key={p} style={{
            width: 10, height: 10, borderRadius: '50%',
            background: phase === p ? phaseColor : 'var(--border)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Focus Mode Overlay */}
      <div className="focus-mode-overlay" style={{ display: focusMode ? 'flex' : 'none', zIndex: 100 }}>
        <button
          onClick={() => setFocusMode(false)}
          style={{ position: 'absolute', top: 24, right: 24, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}
        >
          ✕ Exit Focus Mode
        </button>
        {linkedTask && (
          <div style={{ marginBottom: 20, fontSize: 16, color: 'rgba(255,255,255,0.7)' }}>
            📌 {linkedTask.title}
          </div>
        )}
        {timerContent}
        <div style={{ marginTop: 16, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
          Press Space to Start/Pause
        </div>
      </div>

      {/* Main Page */}
      <div className="page-enter" style={{ display: focusMode ? 'none' : 'block' }}>
        <div className="section-header mb-24">
        <div>
          <h1 className="fs-24 fw-700 text-primary">🍅 Pomodoro Timer</h1>
          <p className="text-secondary fs-13" style={{ marginTop: 4 }}>
            {completedToday} sessions · {totalFocusMin} minutes focused today
          </p>
        </div>
        <div className="flex gap-8">
          <button className="btn btn-ghost" onClick={() => setFocusMode(true)} id="focus-mode-btn">
            🎯 Focus Mode
          </button>
          <button className="btn btn-ghost" onClick={() => setShowSettings(true)} id="pomodoro-settings-btn">
            ⚙️ Settings
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Timer Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 24px' }}>
          {timerContent}

          {/* Link Task */}
          <div style={{ width: '100%', borderTop: '1px solid var(--border)', paddingTop: 20 }}>
            <div className="form-label mb-8">📌 Current task</div>
            <select
              className="form-input form-select"
              value={linkedTask?.id || ''}
              onChange={e => {
                const found = activeTasks.find(t => t.id === e.target.value);
                setLinkedTask(found || null);
              }}
              id="pomodoro-task-select"
            >
              <option value="">— No linked task —</option>
              {activeTasks.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>

          {/* Background Music */}
          <div style={{ width: '100%', borderTop: '1px solid var(--border)', paddingTop: 20, marginTop: 20 }}>
            <div className="flex items-center justify-between mb-8">
              <div className="form-label mb-0">🎧 Background Music</div>
              <span className="fs-12 text-muted">Lofi Hip Hop</span>
            </div>
            <iframe 
              width="100%" 
              height="80" 
              src={`https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1`} 
              title="Background Music" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              style={{ borderRadius: 8, background: '#1e1e2e' }}
            ></iframe>
          </div>
        </div>

        {/* Right: Stats + Session History */}
        <div className="flex-col gap-16">
          {/* Stats */}
          <div className="card">
            <div className="fs-14 fw-600 mb-16">📊 Today</div>
            {[
              { label: '🍅 Sessions completed', value: completedToday },
              { label: '⏱️ Total focus', value: `${totalFocusMin} minutes` },
              { label: '☕ Short Break', value: todaySessions.filter(s => s.type === 'short_break').length },
              { label: '🌴 Long Break', value: todaySessions.filter(s => s.type === 'long_break').length },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span className="fs-13 text-secondary">{label}</span>
                <span className="fs-14 fw-600 text-primary">{value}</span>
              </div>
            ))}
          </div>

          {/* Recent sessions */}
          <div className="card" style={{ flex: 1 }}>
            <div className="fs-14 fw-600 mb-12">📋 History today</div>
            {todaySessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                No sessions yet
              </div>
            ) : (
              [...todaySessions].reverse().slice(0, 8).map(s => (
                <div key={s.id} className="flex items-center gap-8" style={{ padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 14 }}>
                    {s.type === 'work' ? '🍅' : s.type === 'short_break' ? '☕' : '🌴'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div className="fs-12 fw-500">
                      {s.type === 'work' ? 'Focus' : s.type === 'short_break' ? 'Short Break' : 'Long Break'}
                      {s.taskTitle && <span style={{ color: 'var(--text-muted)' }}> · {s.taskTitle}</span>}
                    </div>
                    <div className="fs-11 text-muted">{s.durationMin} minutes · {new Date(s.startedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  <span style={{ fontSize: 11, color: s.completed ? '#52C41A' : 'var(--text-muted)' }}>
                    {s.completed ? '✓' : '○'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
    </>
  );
}
