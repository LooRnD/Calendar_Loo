import React, { useEffect } from 'react';

export function Modal({ isOpen, onClose, title, children, maxWidth = 480 }) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="modal" style={{ maxWidth, position: 'relative' }}>
        <div className="flex items-center justify-between mb-20">
          <h2 className="modal-title" style={{ margin: 0 }}>{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Đóng" style={{ position: 'static' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast ${toast.type}`}>
          <span>
            {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}
          </span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}

export function Badge({ children, color = '#6C60E0' }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '2px 8px',
      borderRadius: '999px', fontSize: '11px', fontWeight: 600,
      background: color + '20', color,
    }}>
      {children}
    </span>
  );
}

export function Avatar({ name, color = '#6C60E0', size = 28 }) {
  const initials = name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, color: 'white', flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

export function PriorityBadge({ priority }) {
  const map = {
    high: { label: '🔴 High', cls: 'priority-high' },
    medium: { label: '🟠 Medium', cls: 'priority-medium' },
    low: { label: '🟢 Low', cls: 'priority-low' },
  };
  const { label, cls } = map[priority] || map.medium;
  return <span className={`priority-badge ${cls}`}>{label}</span>;
}

export function ColorPicker({ value, onChange }) {
  const colors = ['#6C60E0', '#4FD1C5', '#FF6B35', '#52C41A', '#FF4757', '#3B82F6', '#FFD93D', '#EC4899'];
  return (
    <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
      {colors.map(c => (
        <div
          key={c}
          className={`color-swatch${value === c ? ' selected' : ''}`}
          style={{ background: c }}
          onClick={() => onChange(c)}
          role="button"
          aria-label={`Color ${c}`}
        />
      ))}
    </div>
  );
}

export function ProgressBar({ value, color = '#6C60E0', height = 4 }) {
  return (
    <div className="progress-bar" style={{ height }}>
      <div
        className="progress-fill"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }}
      />
    </div>
  );
}
