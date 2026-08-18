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
    if (window.confirm('Bạn có chắc muốn xóa TẤT CẢ dữ liệu? Hành động này không thể hoàn tác!')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="page-enter" style={{ maxWidth: 680 }}>
      <div className="mb-24">
        <h1 className="fs-24 fw-700 text-primary">⚙️ Settings</h1>
        <p className="text-secondary fs-13" style={{ marginTop: 4 }}>
          Cá nhân hóa trải nghiệm của bạn
        </p>
      </div>

      {/* User Profile */}
      <div className="card mb-16">
        <div className="fs-16 fw-700 mb-16">👤 Hồ sơ cá nhân</div>
        <form onSubmit={handleSaveUser}>
          <div className="form-group">
            <label className="form-label">Họ tên</label>
            <input className="form-input" value={userForm.name}
              onChange={e => setUser('name', e.target.value)}
              placeholder="Tên của bạn..." maxLength={50} />
          </div>
          <div className="form-group">
            <label className="form-label">Vai trò / Tiêu đề</label>
            <input className="form-input" value={userForm.role}
              onChange={e => setUser('role', e.target.value)}
              placeholder="Ví dụ: Developer, Student..." maxLength={50} />
          </div>
          <div className="form-group">
            <label className="form-label">Màu Avatar</label>
            <ColorPicker value={userForm.avatarColor || '#6C60E0'}
              onChange={c => setUser('avatarColor', c)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary">Lưu hồ sơ</button>
          </div>
        </form>
      </div>

      {/* Pomodoro Settings */}
      <div className="card mb-16">
        <div className="fs-16 fw-700 mb-16">🍅 Pomodoro Settings</div>
        <form onSubmit={handleSavePom}>
          {[
            { key: 'workDuration', label: 'Thời gian làm việc', min: 5, max: 90, unit: 'phút' },
            { key: 'shortBreak', label: 'Nghỉ ngắn', min: 1, max: 30, unit: 'phút' },
            { key: 'longBreak', label: 'Nghỉ dài', min: 5, max: 60, unit: 'phút' },
            { key: 'cyclesBeforeLong', label: 'Cycles trước nghỉ dài', min: 2, max: 8, unit: 'cycles' },
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
              { key: 'autoStartBreak', label: '⚡ Tự động bắt đầu nghỉ' },
              { key: 'autoStartWork', label: '🔄 Tự động bắt đầu làm' },
              { key: 'soundEnabled', label: '🔔 Âm thanh thông báo' },
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
            <button type="submit" className="btn btn-primary">Lưu cài đặt Pomodoro</button>
          </div>
        </form>
      </div>

      {/* About */}
      <div className="card mb-16">
        <div className="fs-16 fw-700 mb-12">ℹ️ Về Calendar Loo</div>
        <div className="fs-13 text-secondary" style={{ lineHeight: 1.8 }}>
          <p>📅 <strong>Calendar Loo</strong> — Personal Productivity Dashboard</p>
          <p>🛠️ Built with React + Vite + localStorage</p>
          <p>🎨 UI inspired by Modern Task Calendar Dashboard (Figma Freebie)</p>
          <p>🔒 Tất cả dữ liệu được lưu local trên trình duyệt của bạn</p>
          <p>🌐 Hosted on GitHub Pages</p>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card" style={{ border: '1px solid rgba(255,71,87,0.3)' }}>
        <div className="fs-16 fw-700 mb-4" style={{ color: '#FF4757' }}>⚠️ Danger Zone</div>
        <div className="fs-13 text-secondary mb-12">
          Xóa toàn bộ dữ liệu (tasks, events, sessions). Không thể hoàn tác!
        </div>
        <button
          onClick={handleClearData}
          className="btn"
          style={{ background: 'rgba(255,71,87,0.1)', color: '#FF4757', border: '1px solid rgba(255,71,87,0.3)' }}
          id="clear-data-btn"
        >
          🗑️ Xóa tất cả dữ liệu
        </button>
      </div>
    </div>
  );
}
