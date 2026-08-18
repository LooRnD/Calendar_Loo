import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { ColorPicker } from '../components/shared.jsx';

export default function SettingsPage() {
  const { userSettings, saveUser, pomodoroSettings, saveSettings } = useApp();
  const [userForm, setUserForm] = useState(userSettings);
  const [pomForm, setPomForm] = useState(pomodoroSettings);

  useEffect(() => { setUserForm(userSettings); }, [userSettings]);
  useEffect(() => { setPomForm(pomodoroSettings); }, [pomodoroSettings]);

  const setUser = (k, v) => setUserForm(p => ({ ...p, [k]: v }));
  const setPom = (k, v) => setPomForm(p => ({ ...p, [k]: v }));

  const handleSaveUser = (e) => { e.preventDefault(); saveUser(userForm); };
  const handleSavePom = (e) => { e.preventDefault(); saveSettings(pomForm); };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to delete ALL data? This action cannot be undone!')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="page-enter" style={{ maxWidth: 680 }}>
      <div className="mb-24">
        <h1 className="fs-24 fw-700 text-primary">⚙️ Settings</h1>
        <p className="text-secondary fs-13" style={{ marginTop: 4 }}>
          Personalize your experience
        </p>
      </div>

      {/* User Profile */}
      <div className="card mb-16">
        <div className="fs-16 fw-700 mb-16">👤 Personal Profile</div>
        <form onSubmit={handleSaveUser}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" value={userForm.name}
              onChange={e => setUser('name', e.target.value)}
              placeholder="Your name..." maxLength={50} />
          </div>
          <div className="form-group">
            <label className="form-label">Role / Title</label>
            <input className="form-input" value={userForm.role}
              onChange={e => setUser('role', e.target.value)}
              placeholder="E.g., Developer, Student..." maxLength={50} />
          </div>
          <div className="form-group">
            <label className="form-label">Avatar Color</label>
            <ColorPicker value={userForm.avatarColor || '#6C60E0'}
              onChange={c => setUser('avatarColor', c)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary">Save profile</button>
          </div>
        </form>
      </div>

      {/* Pomodoro Settings */}
      <div className="card mb-16">
        <div className="fs-16 fw-700 mb-16">🍅 Pomodoro Settings</div>
        <form onSubmit={handleSavePom}>
          {[
            { key: 'workDuration', label: 'Work Duration', min: 5, max: 90, unit: 'minutes' },
            { key: 'shortBreak', label: 'Short Break', min: 1, max: 30, unit: 'minutes' },
            { key: 'longBreak', label: 'Long Break', min: 5, max: 60, unit: 'minutes' },
            { key: 'cyclesBeforeLong', label: 'Cycles before long break', min: 2, max: 8, unit: 'cycles' },
          ].map(({ key, label, min, max, unit }) => (
            <div className="form-group" key={key}>
              <label className="form-label">{label}: <strong>{pomForm[key]} {unit}</strong></label>
              <input type="range" min={min} max={max} value={pomForm[key]}
                onChange={e => setPom(key, Number(e.target.value))}
                style={{ width: '100%', accentColor: '#6C60E0' }} />
            </div>
          ))}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {[
              { key: 'autoStartBreak', label: '⚡ Auto-start break' },
              { key: 'autoStartWork', label: '🔄 Auto-start work' },
              { key: 'soundEnabled', label: '🔔 Notification sound' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-8" style={{ cursor: 'pointer' }}>
                <input type="checkbox" checked={pomForm[key]}
                  onChange={e => setPom(key, e.target.checked)}
                  style={{ accentColor: '#6C60E0', width: 16, height: 16 }} />
                <span className="fs-13">{label}</span>
              </label>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary">Save settings Pomodoro</button>
          </div>
        </form>
      </div>

      {/* About */}
      <div className="card mb-16">
        <div className="fs-16 fw-700 mb-12">ℹ️ About Calendar Loo</div>
        <div className="fs-13 text-secondary" style={{ lineHeight: 1.8 }}>
          <p>📅 <strong>Calendar Loo</strong> — Personal Productivity Dashboard</p>
          <p>🛠️ Built with React + Vite + localStorage</p>
          <p>🎨 UI inspired by Modern Task Calendar Dashboard (Figma Freebie)</p>
          <p>🔒 All data is stored locally in your browser</p>
          <p>🌐 Hosted on GitHub Pages</p>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card" style={{ border: '1px solid rgba(255,71,87,0.3)' }}>
        <div className="fs-16 fw-700 mb-4" style={{ color: '#FF4757' }}>⚠️ Danger Zone</div>
        <div className="fs-13 text-secondary mb-12">
          Delete all data (tasks, events, sessions). Cannot be undone!
        </div>
        <button
          onClick={handleClearData}
          className="btn"
          style={{ background: 'rgba(255,71,87,0.1)', color: '#FF4757', border: '1px solid rgba(255,71,87,0.3)' }}
          id="clear-data-btn"
        >
          🗑️ Delete all data
        </button>
      </div>
    </div>
  );
}
