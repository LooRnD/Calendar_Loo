import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { getPomodoroSettings } from '../store.js';

const PHASES = {
  WORK: 'work',
  SHORT_BREAK: 'short_break',
  LONG_BREAK: 'long_break',
};

const PHASE_LABELS = {
  work: '🍅 Focus',
  short_break: '☕ Short Break',
  long_break: '🌴 Long Break',
};

const PHASE_COLORS = {
  work: '#6C60E0',
  short_break: '#52C41A',
  long_break: '#4FD1C5',
};

export function usePomodoro() {
  const { pomodoroSettings, logPomodoroSession, addToast } = useApp();
  const settings = pomodoroSettings;

  const [phase, setPhase] = useState(PHASES.WORK);
  const [cycle, setCycle] = useState(1);
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [totalTime, setTotalTime] = useState(settings.workDuration * 60);
  const [running, setRunning] = useState(false);
  const [linkedTask, setLinkedTask] = useState(null);
  const sessionStartRef = useRef(null);
  const timerRef = useRef(null);

  const getDuration = useCallback((p, s = settings) => {
    if (p === PHASES.WORK) return s.workDuration * 60;
    if (p === PHASES.SHORT_BREAK) return s.shortBreak * 60;
    return s.longBreak * 60;
  }, [settings]);

  // Sync when settings change
  useEffect(() => {
    if (!running) {
      const dur = getDuration(phase, settings);
      setTimeLeft(dur);
      setTotalTime(dur);
    }
  }, [settings, phase, running, getDuration]);

  const playSound = useCallback((type) => {
    if (!settings.soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      if (type === 'bell') {
        o.frequency.value = 880;
        o.type = 'sine';
        g.gain.setValueAtTime(0.4, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      } else if (type === 'done') {
        o.frequency.value = 660;
        o.type = 'triangle';
        g.gain.setValueAtTime(0.3, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      }
      o.start(ctx.currentTime);
      o.stop(ctx.currentTime + 1.5);
    } catch (_) {/* ignore audio errors */}
  }, [settings.soundEnabled]);

  const advance = useCallback(() => {
    // Log session
    if (sessionStartRef.current) {
      logPomodoroSession({
        type: phase,
        durationMin: Math.round(getDuration(phase) / 60),
        taskId: linkedTask?.id || null,
        taskTitle: linkedTask?.title || null,
        startedAt: sessionStartRef.current,
        completedAt: new Date().toISOString(),
        completed: true,
      });
    }

    playSound('done');

    let nextPhase;
    let nextCycle = cycle;
    if (phase === PHASES.WORK) {
      if (cycle % settings.cyclesBeforeLong === 0) {
        nextPhase = PHASES.LONG_BREAK;
      } else {
        nextPhase = PHASES.SHORT_BREAK;
      }
      nextCycle = cycle + 1;
    } else {
      nextPhase = PHASES.WORK;
    }

    const label = PHASE_LABELS[nextPhase];
    addToast(`${label} started!`, 'info');

    setPhase(nextPhase);
    setCycle(nextCycle);
    const dur = getDuration(nextPhase);
    setTimeLeft(dur);
    setTotalTime(dur);
    setRunning(settings.autoStartBreak && nextPhase !== PHASES.WORK ||
               settings.autoStartWork && nextPhase === PHASES.WORK);
    sessionStartRef.current = null;
  }, [phase, cycle, linkedTask, settings, getDuration, logPomodoroSession, playSound, addToast]);

  useEffect(() => {
    if (!running) {
      clearInterval(timerRef.current);
      return;
    }
    if (!sessionStartRef.current) {
      sessionStartRef.current = new Date().toISOString();
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          advance();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [running, advance]);

  const start = () => { setRunning(true); playSound('bell'); };
  const pause = () => setRunning(false);
  const reset = () => {
    setRunning(false);
    sessionStartRef.current = null;
    const dur = getDuration(phase);
    setTimeLeft(dur);
    setTotalTime(dur);
  };
  const skip = () => { setRunning(false); sessionStartRef.current = null; advance(); };

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const progress = totalTime > 0 ? (totalTime - timeLeft) / totalTime : 0;

  return {
    phase, cycle, timeLeft, totalTime, running, progress,
    linkedTask, setLinkedTask,
    start, pause, reset, skip,
    formatTime,
    phaseLabel: PHASE_LABELS[phase],
    phaseColor: PHASE_COLORS[phase],
    PHASES,
  };
}
