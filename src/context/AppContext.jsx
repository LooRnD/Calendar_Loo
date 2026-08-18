import React, { createContext, useContext, useState, useCallback } from 'react';
import * as store from '../store.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [tasks, setTasks] = useState(() => store.getTasks());
  const [events, setEvents] = useState(() => store.getEvents());
  const [pomodoroSettings, setPomodoroSettings] = useState(() => store.getPomodoroSettings());
  const [pomodoroSessions, setPomodoroSessions] = useState(() => store.getPomodoroSessions());
  const [userSettings, setUserSettings] = useState(() => store.getUserSettings());
  const [dailyStats, setDailyStats] = useState(() => store.getDailyStats());
  const [toasts, setToasts] = useState([]);

  // Toast notifications
  const addToast = useCallback((message, type = 'info') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  // Tasks
  const createTask = useCallback((task) => {
    const t = store.addTask(task);
    setTasks(store.getTasks());
    addToast('Task created!', 'success');
    return t;
  }, [addToast]);

  const editTask = useCallback((id, updates) => {
    store.updateTask(id, updates);
    setTasks(store.getTasks());
    if (updates.status === 'done') {
      store.updateTodayStats({ tasksCompleted: (store.getTodayStats().tasksCompleted || 0) + 1 });
      setDailyStats(store.getDailyStats());
    }
  }, []);

  const removeTask = useCallback((id) => {
    store.deleteTask(id);
    setTasks(store.getTasks());
    addToast('Task deleted', 'info');
  }, [addToast]);

  // Events
  const createEvent = useCallback((event) => {
    const e = store.addEvent(event);
    setEvents(store.getEvents());
    addToast('Event created!', 'success');
    return e;
  }, [addToast]);

  const editEvent = useCallback((id, updates) => {
    store.updateEvent(id, updates);
    setEvents(store.getEvents());
  }, []);

  const removeEvent = useCallback((id) => {
    store.deleteEvent(id);
    setEvents(store.getEvents());
    addToast('Event deleted', 'info');
  }, [addToast]);

  // Pomodoro
  const saveSettings = useCallback((settings) => {
    store.savePomodoroSettings(settings);
    setPomodoroSettings(store.getPomodoroSettings());
    addToast('Settings saved!', 'success');
  }, [addToast]);

  const logPomodoroSession = useCallback((session) => {
    store.addPomodoroSession(session);
    setPomodoroSessions(store.getPomodoroSessions());
    if (session.completed && session.type === 'work') {
      const today = store.getTodayStats();
      store.updateTodayStats({
        pomodorosCompleted: (today.pomodorosCompleted || 0) + 1,
        focusMinutes: (today.focusMinutes || 0) + session.durationMin,
      });
      setDailyStats(store.getDailyStats());
    }
  }, []);

  // User settings
  const saveUser = useCallback((settings) => {
    store.saveUserSettings(settings);
    setUserSettings(store.getUserSettings());
    addToast('Profile saved!', 'success');
  }, [addToast]);

  const value = {
    tasks, events, pomodoroSettings, pomodoroSessions, userSettings, dailyStats, toasts,
    createTask, editTask, removeTask,
    createEvent, editEvent, removeEvent,
    saveSettings, logPomodoroSession,
    saveUser, addToast,
    refreshStats: () => setDailyStats(store.getDailyStats()),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
