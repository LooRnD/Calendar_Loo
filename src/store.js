// Storage keys
const KEYS = {
  TASKS: 'cloo_tasks',
  EVENTS: 'cloo_events',
  POMODORO_SESSIONS: 'cloo_pomodoro_sessions',
  POMODORO_SETTINGS: 'cloo_pomodoro_settings',
  DAILY_STATS: 'cloo_daily_stats',
  USER_SETTINGS: 'cloo_user_settings',
};

// Safe JSON parse
function safeParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

// Generic storage helpers
function getItem(key, fallback) {
  return safeParse(localStorage.getItem(key), fallback);
}

function setItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Safe UUID generator in case crypto.randomUUID is not available
function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/* ============ TASKS ============ */
export function getTasks() {
  return getItem(KEYS.TASKS, []);
}

export function saveTasks(tasks) {
  setItem(KEYS.TASKS, tasks);
}

export function addTask(task) {
  const tasks = getTasks();
  const newTask = {
    id: generateId(),
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    category: 'General',
    categoryColor: '#6C60E0',
    tags: [],
    dueDate: null,
    progress: 0,
    createdAt: new Date().toISOString(),
    ...task,
  };
  tasks.push(newTask);
  saveTasks(tasks);
  return newTask;
}

export function updateTask(id, updates) {
  const tasks = getTasks();
  const idx = tasks.findIndex(t => t.id === id);
  if (idx !== -1) {
    tasks[idx] = { ...tasks[idx], ...updates };
    saveTasks(tasks);
    return tasks[idx];
  }
  return null;
}

export function deleteTask(id) {
  const tasks = getTasks().filter(t => t.id !== id);
  saveTasks(tasks);
}

/* ============ EVENTS (Calendar) ============ */
export function getEvents() {
  return getItem(KEYS.EVENTS, getDefaultEvents());
}

export function saveEvents(events) {
  setItem(KEYS.EVENTS, events);
}

export function addEvent(event) {
  const events = getEvents();
  const newEvent = {
    id: generateId(),
    title: '',
    description: '',
    startDate: new Date().toISOString(),
    endDate: null,
    color: '#6C60E0',
    category: 'General',
    allDay: false,
    repeat: 'none', // 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
    ...event,
  };
  events.push(newEvent);
  saveEvents(events);
  return newEvent;
}

export function updateEvent(id, updates) {
  const events = getEvents();
  const idx = events.findIndex(e => e.id === id);
  if (idx !== -1) {
    events[idx] = { ...events[idx], ...updates };
    saveEvents(events);
    return events[idx];
  }
  return null;
}

export function deleteEvent(id) {
  const events = getEvents().filter(e => e.id !== id);
  saveEvents(events);
}

/* ============ POMODORO SETTINGS ============ */
const DEFAULT_POMODORO_SETTINGS = {
  workDuration: 25,
  shortBreak: 5,
  longBreak: 15,
  cyclesBeforeLong: 4,
  autoStartBreak: false,
  autoStartWork: false,
  soundEnabled: true,
  soundType: 'bell',
  musicUrl: 'jfKfPfyJRdk',
};

export function getPomodoroSettings() {
  return { ...DEFAULT_POMODORO_SETTINGS, ...getItem(KEYS.POMODORO_SETTINGS, {}) };
}

export function savePomodoroSettings(settings) {
  setItem(KEYS.POMODORO_SETTINGS, settings);
}

/* ============ POMODORO SESSIONS ============ */
export function getPomodoroSessions() {
  return getItem(KEYS.POMODORO_SESSIONS, []);
}

export function addPomodoroSession(session) {
  const sessions = getPomodoroSessions();
  const newSession = {
    id: generateId(),
    type: 'work', // 'work' | 'short_break' | 'long_break'
    durationMin: 25,
    taskId: null,
    taskTitle: null,
    startedAt: new Date().toISOString(),
    completedAt: null,
    completed: false,
    ...session,
  };
  sessions.push(newSession);
  setItem(KEYS.POMODORO_SESSIONS, sessions);
  return newSession;
}

/* ============ DAILY STATS ============ */
export function getDailyStats() {
  return getItem(KEYS.DAILY_STATS, []);
}

export function getTodayStats() {
  const today = new Date().toISOString().split('T')[0];
  const stats = getDailyStats();
  return stats.find(s => s.date === today) || {
    date: today,
    focusMinutes: 0,
    tasksCompleted: 0,
    pomodorosCompleted: 0,
    streakCount: 0,
  };
}

export function updateTodayStats(updates) {
  const today = new Date().toISOString().split('T')[0];
  const stats = getDailyStats();
  const idx = stats.findIndex(s => s.date === today);
  const current = idx !== -1 ? stats[idx] : {
    date: today, focusMinutes: 0, tasksCompleted: 0, pomodorosCompleted: 0, streakCount: 0,
  };
  const updated = { ...current, ...updates };
  if (idx !== -1) {
    stats[idx] = updated;
  } else {
    stats.push(updated);
  }
  setItem(KEYS.DAILY_STATS, stats);
  return updated;
}

export function getStreakCount() {
  const stats = getDailyStats();
  if (stats.length === 0) return 0;
  const sorted = [...stats].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  let current = new Date();
  current.setHours(0, 0, 0, 0);
  for (const s of sorted) {
    const d = new Date(s.date);
    d.setHours(0, 0, 0, 0);
    const diff = (current - d) / (1000 * 60 * 60 * 24);
    if (diff <= 1 && (s.pomodorosCompleted > 0 || s.tasksCompleted > 0)) {
      streak++;
      current = d;
    } else {
      break;
    }
  }
  return streak;
}

/* ============ USER SETTINGS ============ */
const DEFAULT_USER_SETTINGS = {
  name: 'Loo',
  role: 'Personal',
  avatarInitials: 'L',
  avatarColor: '#6C60E0',
};

export function getUserSettings() {
  const settings = { ...DEFAULT_USER_SETTINGS, ...getItem(KEYS.USER_SETTINGS, {}) };
  // Migrate from old default 'Your Name' to 'Loo'
  if (settings.name === 'Your Name') {
    settings.name = 'Loo';
    settings.avatarInitials = 'L';
    saveUserSettings(settings);
  }
  return settings;
}

export function saveUserSettings(settings) {
  setItem(KEYS.USER_SETTINGS, settings);
}

/* ============ SEED DATA ============ */
function getDefaultEvents() {
  const today = new Date();
  const fmt = (d) => d.toISOString();
  const addDays = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return d; };

  return [
    { id: generateId(), title: 'Morning Standup', category: 'Work', color: '#6C60E0', startDate: fmt(today), endDate: null, allDay: false, description: '' },
    { id: generateId(), title: 'Design Review', category: 'Design', color: '#FF6B35', startDate: fmt(addDays(1)), endDate: null, allDay: false, description: '' },
    { id: generateId(), title: 'Focus Session', category: 'Personal', color: '#52C41A', startDate: fmt(addDays(2)), endDate: null, allDay: false, description: '' },
    { id: generateId(), title: 'Team Meeting', category: 'Work', color: '#FF4757', startDate: fmt(addDays(3)), endDate: null, allDay: false, description: '' },
    { id: generateId(), title: 'Learning React', category: 'Education', color: '#4FD1C5', startDate: fmt(addDays(5)), endDate: null, allDay: true, description: '' },
  ];
}

/* ============ BACKUP / RESTORE ============ */
export function exportAllData() {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    tasks: getTasks(),
    events: getEvents(),
    pomodoroSettings: getPomodoroSettings(),
    pomodoroSessions: getPomodoroSessions(),
    dailyStats: getDailyStats(),
    userSettings: getUserSettings(),
  };
}

export function importAllData(data) {
  if (Array.isArray(data.tasks)) saveTasks(data.tasks);
  if (Array.isArray(data.events)) saveEvents(data.events);
  if (data.pomodoroSettings) savePomodoroSettings(data.pomodoroSettings);
  if (Array.isArray(data.pomodoroSessions)) setItem(KEYS.POMODORO_SESSIONS, data.pomodoroSessions);
  if (Array.isArray(data.dailyStats)) setItem(KEYS.DAILY_STATS, data.dailyStats);
  if (data.userSettings) saveUserSettings(data.userSettings);
}

export function seedDefaultTasks() {
  const existing = getTasks();
  if (existing.length > 0) return;
  const defaultTasks = [
    { title: 'Design app UI', priority: 'high', status: 'in_progress', category: 'Design', categoryColor: '#FF6B35', progress: 60, tags: ['UI', 'Design'], dueDate: new Date().toISOString() },
    { title: 'Review code pull request', priority: 'medium', status: 'todo', category: 'Development', categoryColor: '#6C60E0', progress: 20, tags: ['Dev', 'PR'] },
    { title: 'Write weekly report', priority: 'low', status: 'todo', category: 'Personal', categoryColor: '#52C41A', progress: 0, tags: ['Writing'] },
    { title: 'Update documentation', priority: 'low', status: 'done', category: 'Development', categoryColor: '#6C60E0', progress: 100, tags: ['Docs'] },
  ];
  defaultTasks.forEach(t => addTask(t));
}
