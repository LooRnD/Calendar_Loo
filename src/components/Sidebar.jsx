import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

const IconHome = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconTasks = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);
const IconPomodoro = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconAnalytics = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);
const IconSettings = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

const navItems = [
  { to: '/', label: 'Dashboard', icon: IconHome, exact: true },
  { to: '/calendar', label: 'Calendar', icon: IconCalendar },
  { to: '/tasks', label: 'Tasks', icon: IconTasks, badge: true },
  { to: '/pomodoro', label: 'Pomodoro', icon: IconPomodoro },
  { to: '/analytics', label: 'Analytics', icon: IconAnalytics },
];

export default function Sidebar() {
  const { tasks, userSettings } = useApp();
  const navigate = useNavigate();
  const pendingTasks = tasks.filter(t => t.status !== 'done').length;

  const initials = userSettings.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-avatar" style={{ background: userSettings.avatarColor || '#6C60E0' }}>
          {initials}
        </div>
        <div className="sidebar-user-name">{userSettings.name}</div>
        <div className="sidebar-user-role">{userSettings.role}</div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ to, label, icon: Icon, badge, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon />
            <span>{label}</span>
            {badge && pendingTasks > 0 && (
              <span className="nav-badge">{pendingTasks}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-divider" />

      <div className="sidebar-group">
        <div className="sidebar-group-header">
          <div className="sidebar-group-avatar"
            style={{ background: userSettings.avatarColor || '#6C60E0' }}>
            {initials}
          </div>
          <span>{userSettings.name}</span>
        </div>
        {['Workspace', 'Projects', 'Archive', 'Goals'].map(item => (
          <div key={item} className="sidebar-subitem">{item}</div>
        ))}
      </div>

      <div className="sidebar-footer">
        <button
          className="sidebar-add-btn"
          onClick={() => navigate('/tasks')}
          title="Create new task"
        >
          +
        </button>
        <NavLink to="/settings" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} style={{ marginBottom: 0 }}>
          <IconSettings />
          <span>Settings</span>
        </NavLink>
        <div className="sidebar-copyright">© 2025 Calendar Loo</div>
      </div>
    </aside>
  );
}
