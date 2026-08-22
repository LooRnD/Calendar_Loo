import dayjs from 'dayjs';

const UNIT = { daily: 'day', weekly: 'week', monthly: 'month', yearly: 'year' };

// Whether a (possibly repeating) item anchored on `anchorISO` lands on `day`
export function occursOnDay(anchorISO, repeat, day) {
  if (!anchorISO) return false;
  const start = dayjs(anchorISO);
  if (day.isBefore(start, 'day')) return false;
  switch (repeat) {
    case 'daily': return true;
    case 'weekly': return day.day() === start.day();
    case 'monthly': return day.date() === start.date();
    case 'yearly': return day.date() === start.date() && day.month() === start.month();
    default: return day.isSame(start, 'day');
  }
}

// The next occurrence on/after `from` for a (possibly repeating) item
export function nextOccurrence(anchorISO, repeat, from) {
  if (!anchorISO) return null;
  const start = dayjs(anchorISO);
  const unit = UNIT[repeat];
  if (!unit || start.isAfter(from, 'day') || start.isSame(from, 'day')) return start;
  let occ = start;
  while (occ.isBefore(from, 'day')) occ = occ.add(1, unit);
  return occ;
}

// The occurrence right after the one due on/after `from` — used when completing
// a repeating task/event so it reschedules forward instead of staying done
export function advanceOccurrence(anchorISO, repeat, from) {
  const current = nextOccurrence(anchorISO, repeat, from);
  const unit = UNIT[repeat];
  return current && unit ? current.add(1, unit) : current;
}
