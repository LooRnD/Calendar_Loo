import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import * as store from '../store.js';
import * as sync from '../sync.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [tasks, setTasks] = useState(() => store.getTasks());
  const [events, setEvents] = useState(() => store.getEvents());
  const [pomodoroSettings, setPomodoroSettings] = useState(() => store.getPomodoroSettings());
  const [pomodoroSessions, setPomodoroSessions] = useState(() => store.getPomodoroSessions());
  const [userSettings, setUserSettings] = useState(() => store.getUserSettings());
  const [dailyStats, setDailyStats] = useState(() => store.getDailyStats());
  const [toasts, setToasts] = useState([]);
  const [syncCode, setSyncCodeState] = useState(() => sync.getSyncCode());
  const addToastRef = useRef(null);

  // Toast notifications
  const addToast = useCallback((message, type = 'info') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);
  addToastRef.current = addToast;

  // Pull in a freshly-synced snapshot from the cloud and refresh all local state
  const applyRemoteData = useCallback((data) => {
    store.importAllData(data);
    setTasks(store.getTasks());
    setEvents(store.getEvents());
    setPomodoroSettings(store.getPomodoroSettings());
    setPomodoroSessions(store.getPomodoroSessions());
    setUserSettings(store.getUserSettings());
    setDailyStats(store.getDailyStats());
  }, []);

  useEffect(() => {
    if (!syncCode || !sync.isSyncAvailable()) return;
    const unsubscribe = sync.subscribeToCloud(syncCode, (data) => {
      applyRemoteData(data);
      addToastRef.current?.('Synced from another device', 'info');
    });
    return unsubscribe;
  }, [syncCode, applyRemoteData]);

  const linkSync = useCallback(async (code) => {
    await sync.linkSyncCode(code);
    setSyncCodeState(code);
    applyRemoteData(store.exportAllData());
    addToast('Cloud sync linked!', 'success');
  }, [addToast, applyRemoteData]);

  const generateAndLinkSync = useCallback(async () => {
    const code = sync.generateSyncCode();
    await linkSync(code);
    return code;
  }, [linkSync]);

  const unlinkSync = useCallback(() => {
    sync.unlinkSyncCode();
    setSyncCodeState('');
    addToast('Cloud sync unlinked', 'info');
  }, [addToast]);

  // Tasks
  const createTask = useCallback((task) => {
    const t = store.addTask(task);
    setTasks(store.getTasks());
    addToast('Task created!', 'success');
    sync.schedulePush();
    return t;
  }, [addToast]);

  const editTask = useCallback((id, updates) => {
    store.updateTask(id, updates);
    setTasks(store.getTasks());
    if (updates.status === 'done') {
      store.updateTodayStats({ tasksCompleted: (store.getTodayStats().tasksCompleted || 0) + 1 });
      setDailyStats(store.getDailyStats());
    }
    sync.schedulePush();
  }, []);

  const removeTask = useCallback((id) => {
    store.deleteTask(id);
    setTasks(store.getTasks());
    addToast('Task deleted', 'info');
    sync.schedulePush();
  }, [addToast]);

  // Events
  const createEvent = useCallback((event) => {
    const e = store.addEvent(event);
    setEvents(store.getEvents());
    addToast('Event created!', 'success');
    sync.schedulePush();
    return e;
  }, [addToast]);

  const editEvent = useCallback((id, updates) => {
    store.updateEvent(id, updates);
    setEvents(store.getEvents());
    sync.schedulePush();
  }, []);

  const removeEvent = useCallback((id) => {
    store.deleteEvent(id);
    setEvents(store.getEvents());
    addToast('Event deleted', 'info');
    sync.schedulePush();
  }, [addToast]);

  // Pomodoro
  const saveSettings = useCallback((settings) => {
    store.savePomodoroSettings(settings);
    setPomodoroSettings(store.getPomodoroSettings());
    addToast('Settings saved!', 'success');
    sync.schedulePush();
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
    sync.schedulePush();
  }, []);

  // User settings
  const saveUser = useCallback((settings) => {
    store.saveUserSettings(settings);
    setUserSettings(store.getUserSettings());
    addToast('Profile saved!', 'success');
    sync.schedulePush();
  }, [addToast]);

  const value = {
    tasks, events, pomodoroSettings, pomodoroSessions, userSettings, dailyStats, toasts,
    createTask, editTask, removeTask,
    createEvent, editEvent, removeEvent,
    saveSettings, logPomodoroSession,
    saveUser, addToast,
    refreshStats: () => setDailyStats(store.getDailyStats()),
    syncCode, isSyncAvailable: sync.isSyncAvailable(),
    linkSync, generateAndLinkSync, unlinkSync,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
