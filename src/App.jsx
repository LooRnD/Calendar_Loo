import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import { ToastContainer } from './components/shared.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import CalendarPage from './pages/CalendarPage.jsx';
import TasksPage from './pages/TasksPage.jsx';
import PomodoroPage from './pages/PomodoroPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import { seedDefaultTasks } from './store.js';
import './index.css';

function AppShell() {
  const { toasts } = useApp();

  useEffect(() => {
    seedDefaultTasks();
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/pomodoro" element={<PomodoroPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </div>
      <ToastContainer toasts={toasts} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/Calendar_Loo">
      <AppProvider>
        <AppShell />
      </AppProvider>
    </BrowserRouter>
  );
}
