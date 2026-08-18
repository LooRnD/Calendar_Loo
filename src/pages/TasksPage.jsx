import React, { useState } from 'react';
import dayjs from 'dayjs';
import { useApp } from '../context/AppContext.jsx';
import { Modal, PriorityBadge, ProgressBar, ColorPicker } from '../components/shared.jsx';
import { getTodayStats, getStreakCount } from '../store.js';

const CATEGORY_COLORS = ['#6C60E0', '#4FD1C5', '#FF6B35', '#52C41A', '#FF4757', '#3B82F6'];

// Task Form Modal
function TaskModal({ isOpen, onClose, initialTask = null }) {
  const { createTask, editTask } = useApp();
  const [form, setForm] = useState(() => initialTask || {
    title: '', description: '', priority: 'medium', category: 'General',
    categoryColor: '#6C60E0', tags: [], dueDate: '', progress: 0, status: 'todo',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (initialTask) {
      editTask(initialTask.id, form);
    } else {
      createTask(form);
    }
    onClose();
  };

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialTask ? 'Edit Task' : 'Create New Task'}>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Task Name *</label>
          <input
            className="form-input"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            placeholder="Enter task name..."
            required
            autoFocus
            maxLength={200}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-input form-textarea"
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Detailed description..."
            maxLength={1000}
          />
        </div>
        <div className="flex gap-12 mb-16">
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label">Priority</label>
            <select className="form-input form-select" value={form.priority}
              onChange={e => set('priority', e.target.value)}>
              <option value="high">🔴 High</option>
              <option value="medium">🟠 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
          </div>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label">Status</label>
            <select className="form-input form-select" value={form.status}
              onChange={e => set('status', e.target.value)}>
              <option value="todo">📋 Todo</option>
              <option value="in_progress">⚡ In Progress</option>
              <option value="done">✅ Done</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Category</label>
          <input className="form-input" value={form.category}
            onChange={e => set('category', e.target.value)}
            placeholder="Category name..." maxLength={50} />
        </div>
        <div className="form-group">
          <label className="form-label">Category Color</label>
          <ColorPicker value={form.categoryColor}
            onChange={c => set('categoryColor', c)} />
        </div>
        <div className="form-group">
          <label className="form-label">Deadline</label>
          <input type="datetime-local" className="form-input"
            value={form.dueDate ? form.dueDate.slice(0, 16) : ''}
            onChange={e => set('dueDate', e.target.value ? new Date(e.target.value).toISOString() : '')} />
        </div>
        <div className="form-group">
          <label className="form-label">Progress: {form.progress}%</label>
          <input type="range" min="0" max="100" value={form.progress}
            onChange={e => set('progress', Number(e.target.value))}
            style={{ width: '100%', accentColor: '#6C60E0' }} />
        </div>
        <div className="flex gap-8" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">
            {initialTask ? 'Save changes' : '+ Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Single task row component
function TaskRow({ task, onEdit, onDelete, onToggle }) {
  const categoryIcons = {
    Design: '🎨', Development: '💻', Personal: '🌿', General: '📋',
    Education: '📚', Work: '💼', Health: '❤️',
  };
  const icon = categoryIcons[task.category] || '📌';

  return (
    <div className="task-item" onClick={() => onEdit(task)}>
      <div
        className="task-icon"
        style={{ background: (task.categoryColor || '#6C60E0') + '20', color: task.categoryColor || '#6C60E0' }}
      >
        <span style={{ fontSize: 16 }}>{icon}</span>
      </div>
      <div className="task-info">
        <div className="task-title" style={{ textDecoration: task.status === 'done' ? 'line-through' : 'none', opacity: task.status === 'done' ? 0.6 : 1 }}>
          {task.title}
        </div>
        <div className="task-meta">
          {task.category} · {task.status === 'done' ? 'Done' : task.status === 'in_progress' ? 'In Progress' : 'To Do'}
          {task.dueDate && ` · Due: ${dayjs(task.dueDate).format('DD/MM')}`}
        </div>
        {task.progress > 0 && task.status !== 'done' && (
          <div style={{ marginTop: 4 }}>
            <ProgressBar value={task.progress} color={task.categoryColor || '#6C60E0'} />
          </div>
        )}
      </div>
      <PriorityBadge priority={task.priority} />
      <button
        className="task-add-btn"
        onClick={e => { e.stopPropagation(); onDelete(task.id); }}
        title="Delete task"
        aria-label="Delete task"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}

export default function TasksPage() {
  const { tasks, removeTask, editTask } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchPriority = filterPriority === 'all' || t.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  const sorted = [...filtered].sort((a, b) => {
    const pOrder = { high: 0, medium: 1, low: 2 };
    return (pOrder[a.priority] || 1) - (pOrder[b.priority] || 1);
  });

  const groups = {
    in_progress: sorted.filter(t => t.status === 'in_progress'),
    todo: sorted.filter(t => t.status === 'todo'),
    done: sorted.filter(t => t.status === 'done'),
  };

  const handleEdit = (task) => {
    setEditTarget(task);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditTarget(null);
  };

  const todayStats = getTodayStats();
  const streak = getStreakCount();

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="section-header mb-20">
        <div>
          <h1 className="fs-24 fw-700 text-primary">Task Manager</h1>
          <p className="text-secondary fs-13" style={{ marginTop: 4 }}>
            {tasks.filter(t => t.status !== 'done').length} tasks left · {tasks.filter(t => t.status === 'done').length} completed
          </p>
        </div>
        <div className="section-actions">
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginRight: 8 }}>
            🔥 {streak} day streak
          </span>
          <button className="btn btn-ghost">Archive</button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)} id="add-task-btn">
            + New Task
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Done today', value: todayStats.tasksCompleted, icon: '✅', color: '#52C41A' },
          { label: 'In progress', value: tasks.filter(t => t.status === 'in_progress').length, icon: '⚡', color: '#6C60E0' },
          { label: 'New tasks this week', value: tasks.filter(t => {
            const d = new Date(t.createdAt);
            const now = new Date();
            return (now - d) < 7 * 24 * 60 * 60 * 1000;
          }).length, icon: '📋', color: '#FF6B35' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="stat-card">
            <div className="flex items-center justify-between">
              <span className="stat-icon">{icon}</span>
              <span style={{ fontSize: 24, fontWeight: 700, color }}>{value}</span>
            </div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex gap-8 mb-16" style={{ flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="search-input"
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            id="task-search"
          />
        </div>
        <select className="form-input form-select" style={{ width: 130 }}
          value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All</option>
          <option value="todo">Todo</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select className="form-input form-select" style={{ width: 130 }}
          value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="all">All levels</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Task Groups */}
      {['in_progress', 'todo', 'done'].map(status => {
        const list = groups[status];
        if (list.length === 0) return null;
        const labels = { in_progress: '⚡ In progress', todo: '📋 To Do', done: '✅ Done' };
        return (
          <div key={status} className="card mb-16">
            <div className="flex items-center justify-between mb-12">
              <h3 className="fs-14 fw-600 text-primary">{labels[status]}</h3>
              <span className="tag">{list.length}</span>
            </div>
            {list.map(task => (
              <TaskRow
                key={task.id}
                task={task}
                onEdit={handleEdit}
                onDelete={removeTask}
                onToggle={() => editTask(task.id, { status: task.status === 'done' ? 'todo' : 'done' })}
              />
            ))}
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <div className="fs-16 fw-600 mb-8">No tasks</div>
          <div className="fs-13">Create a new task to get started!</div>
          <button className="btn btn-primary" style={{ marginTop: 16 }}
            onClick={() => setShowModal(true)}>
            + Create First Task
          </button>
        </div>
      )}

      <TaskModal
        isOpen={showModal}
        onClose={handleClose}
        initialTask={editTarget}
      />
    </div>
  );
}
