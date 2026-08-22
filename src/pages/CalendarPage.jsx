import React, { useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import { useApp } from '../context/AppContext.jsx';
import { Modal, ColorPicker } from '../components/shared.jsx';

dayjs.locale('en');

const COLORS = { '#6C60E0': 'purple', '#4FD1C5': 'teal', '#FF6B35': 'orange', '#52C41A': 'green', '#FF4757': 'red', '#3B82F6': 'blue' };
const DOW = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const REPEAT_OPTIONS = [
  { value: 'none', label: 'Does not repeat' },
  { value: 'daily', label: 'Every day' },
  { value: 'weekly', label: 'Every week' },
  { value: 'monthly', label: 'Every month' },
  { value: 'yearly', label: 'Every year' },
];

// Whether a recurring event lands on the given day
function eventOccursOnDay(event, day) {
  const start = dayjs(event.startDate);
  if (day.isBefore(start, 'day')) return false;
  switch (event.repeat) {
    case 'daily': return true;
    case 'weekly': return day.day() === start.day();
    case 'monthly': return day.date() === start.date();
    case 'yearly': return day.date() === start.date() && day.month() === start.month();
    default: return day.isSame(start, 'day');
  }
}

// Next occurrence on/after `from` for a (possibly recurring) event
function nextOccurrence(event, from) {
  const start = dayjs(event.startDate);
  if (!event.repeat || event.repeat === 'none') return start;
  if (start.isAfter(from, 'day')) return start;
  const unit = { daily: 'day', weekly: 'week', monthly: 'month', yearly: 'year' }[event.repeat];
  if (!unit) return start;
  let occ = start;
  while (occ.isBefore(from, 'day')) occ = occ.add(1, unit);
  return occ;
}

function EventModal({ isOpen, onClose, event = null, defaultDate = null }) {
  const { createEvent, editEvent, removeEvent } = useApp();
  const [form, setForm] = useState(() => event || {
    title: '', description: '', category: 'General',
    color: '#6C60E0', allDay: false,
    startDate: defaultDate ? defaultDate.toISOString() : new Date().toISOString(),
    endDate: null,
    repeat: 'none',
  });

  React.useEffect(() => {
    if (event) setForm(event);
    else setForm(p => ({
      ...p,
      startDate: defaultDate ? defaultDate.toISOString() : new Date().toISOString(),
    }));
  }, [event, defaultDate]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const setStartTime = (time) => {
    if (!form.startDate || !time) return;
    set('startDate', `${form.startDate.slice(0, 11)}${time}:00.000Z`);
  };

  // Only lock the date for an *existing* recurring event — a brand new event still needs a start date picker
  const isRepeating = Boolean(event) && form.repeat && form.repeat !== 'none';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (event) editEvent(event.id, form);
    else createEvent(form);
    onClose();
  };

  const handleDelete = () => {
    if (event) { removeEvent(event.id); onClose(); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={event ? 'Edit Event' : 'Add Event'}>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Event Name *</label>
          <input className="form-input" value={form.title}
            onChange={e => set('title', e.target.value)}
            placeholder="Event Name..." required autoFocus maxLength={200} />
        </div>
        <div className="form-group">
          <label className="form-label">Category</label>
          <input className="form-input" value={form.category}
            onChange={e => set('category', e.target.value)}
            placeholder="Category..." maxLength={50} />
        </div>
        <div className="form-group">
          <label className="form-label">Color</label>
          <ColorPicker value={form.color} onChange={c => set('color', c)} />
        </div>
        {isRepeating ? (
          <div className="form-group">
            <label className="form-label">Start Date</label>
            <div className="fs-13 text-secondary mb-8">
              🔁 This is a repeating series — it started on <strong>{dayjs(form.startDate).format('DD/MM/YYYY')}</strong>.
              Editing here changes the whole series, not just the day you opened.
            </div>
            <input type="time" className="form-input" style={{ maxWidth: 160 }}
              value={form.startDate ? form.startDate.slice(11, 16) : ''}
              onChange={e => setStartTime(e.target.value)} disabled={form.allDay} />
          </div>
        ) : (
          <div className="flex gap-12 mb-16">
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Start Date</label>
              <input type="datetime-local" className="form-input"
                value={form.startDate ? form.startDate.slice(0, 16) : ''}
                onChange={e => set('startDate', e.target.value ? new Date(e.target.value).toISOString() : '')} />
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">End Date</label>
              <input type="datetime-local" className="form-input"
                value={form.endDate ? form.endDate.slice(0, 16) : ''}
                onChange={e => set('endDate', e.target.value ? new Date(e.target.value).toISOString() : '')} />
            </div>
          </div>
        )}
        <div className="form-group flex items-center gap-8">
          <input type="checkbox" id="all-day" checked={form.allDay}
            onChange={e => set('allDay', e.target.checked)}
            style={{ accentColor: '#6C60E0', width: 16, height: 16 }} />
          <label htmlFor="all-day" className="form-label" style={{ marginBottom: 0 }}>All day</label>
        </div>
        <div className="form-group">
          <label className="form-label">Repeat</label>
          <select className="form-input form-select" value={form.repeat || 'none'}
            onChange={e => set('repeat', e.target.value)}>
            {REPEAT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Note</label>
          <textarea className="form-input form-textarea" value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Note..." maxLength={500} />
        </div>
        <div className="flex gap-8" style={{ justifyContent: 'space-between', marginTop: 8 }}>
          <div>
            {event && (
              <button type="button" className="btn" style={{ background: '#FF475720', color: '#FF4757' }}
                onClick={handleDelete}>Delete</button>
            )}
          </div>
          <div className="flex gap-8">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {event ? 'Save' : '+ Add'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default function CalendarPage() {
  const { events } = useApp();
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [view, setView] = useState('month'); // 'month' | 'week'

  const startOfMonth = currentDate.startOf('month');
  const endOfMonth = currentDate.endOf('month');
  const startDate = startOfMonth.startOf('week');
  const endDate = endOfMonth.endOf('week');

  // Build calendar grid
  const days = [];
  let d = startDate;
  while (d.isBefore(endDate) || d.isSame(endDate, 'day')) {
    days.push(d);
    d = d.add(1, 'day');
  }

  const getEventsForDay = (day) =>
    events.filter(e => eventOccursOnDay(e, day));

  const handleDayClick = (day) => {
    setSelectedDate(day.toDate());
    setSelectedEvent(null);
    setShowModal(true);
  };

  const handleEventClick = (e, ev) => {
    e.stopPropagation();
    setSelectedEvent(ev);
    setSelectedDate(null);
    setShowModal(true);
  };

  // Group upcoming events (using each event's next occurrence for recurring ones)
  const today = dayjs();
  const upcoming = events
    .map(e => ({ ...e, occurrence: nextOccurrence(e, today) }))
    .filter(e => e.occurrence.isAfter(today.subtract(1, 'day'), 'day') || e.occurrence.isSame(today, 'day'))
    .sort((a, b) => a.occurrence.valueOf() - b.occurrence.valueOf())
    .slice(0, 8);

  const groupByDate = (evts) => {
    const groups = {};
    evts.forEach(ev => {
      const key = ev.occurrence.format('DD MMMM');
      if (!groups[key]) groups[key] = [];
      groups[key].push(ev);
    });
    return groups;
  };

  const grouped = groupByDate(upcoming);

  return (
    <div className="page-enter" style={{ display: 'flex', gap: 0, height: '100%' }}>
      {/* Calendar Main */}
      <div style={{ flex: 1, overflow: 'auto', paddingRight: 24 }}>
        {/* Header */}
        <div className="section-header mb-20">
          <div className="flex items-center gap-12">
            <h1 className="fs-24 fw-700 text-primary">
              {currentDate.format('MMMM YYYY')}
            </h1>
            <div className="flex gap-4">
              <button className="btn-icon" onClick={() => setCurrentDate(c => c.subtract(1, 'month'))} aria-label="Previous month">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
              <button className="btn btn-ghost" onClick={() => setCurrentDate(dayjs())} style={{ padding: '6px 12px', fontSize: 12 }}>Today</button>
              <button className="btn-icon" onClick={() => setCurrentDate(c => c.add(1, 'month'))} aria-label="Next month">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => { setSelectedDate(new Date()); setSelectedEvent(null); setShowModal(true); }} id="add-event-btn">
            + Event
          </button>
        </div>

        {/* Day headers */}
        <div className="cal-grid mb-4">
          {DOW.map(d => <div key={d} className="cal-day-header">{d}</div>)}
        </div>

        {/* Day cells */}
        <div className="cal-grid">
          {days.map((day, i) => {
            const isToday = day.isSame(today, 'day');
            const isOther = !day.isSame(currentDate, 'month');
            const dayEvents = getEventsForDay(day);

            return (
              <div
                key={i}
                className={`cal-day${isToday ? ' today' : ''}${isOther ? ' other-month' : ''}`}
                onClick={() => handleDayClick(day)}
              >
                <div className="cal-day-num">{day.date()}</div>
                {dayEvents.slice(0, 3).map(ev => (
                  <div
                    key={ev.id}
                    className="cal-event-dot"
                    style={{ background: ev.color || '#6C60E0' }}
                    onClick={(e) => handleEventClick(e, ev)}
                    title={ev.title}
                  >
                    {ev.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>+{dayEvents.length - 3}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Upcoming events */}
      <div style={{ width: 260, borderLeft: '1px solid var(--border)', paddingLeft: 20, overflowY: 'auto' }}>
        <div className="flex items-center justify-between mb-16">
          <h2 className="fs-16 fw-700 text-primary">Upcoming calendar</h2>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
        </div>

        {Object.keys(grouped).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📅</div>
            <div className="fs-13">No upcoming events</div>
          </div>
        ) : (
          Object.entries(grouped).map(([dateStr, evts]) => (
            <div key={dateStr}>
              <div className="date-group-header">
                <span className="date-group-label">{dateStr}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)' }}>
                  <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
                </svg>
              </div>
              {evts.map(ev => (
                <div key={ev.id} className="calendar-event-item"
                  onClick={() => { setSelectedEvent(ev); setSelectedDate(null); setShowModal(true); }}
                  style={{ cursor: 'pointer' }}>
                  <div className="event-time">
                    {ev.allDay ? 'All day' : dayjs(ev.startDate).format('HH:mm')}
                  </div>
                  <div className="event-bar" style={{ background: ev.color || '#6C60E0' }} />
                  <div className="event-info">
                    <div className="event-category">{ev.category}</div>
                    <div className="event-title">{ev.repeat !== 'none' && '🔁 '}{ev.title}</div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      <EventModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setSelectedEvent(null); setSelectedDate(null); }}
        event={selectedEvent}
        defaultDate={selectedDate}
      />
    </div>
  );
}
