// Same 8 colors offered by the ColorPicker (src/components/shared.jsx)
const COLOR_PALETTE = ['#6C60E0', '#4FD1C5', '#FF6B35', '#52C41A', '#FF4757', '#3B82F6', '#FFD93D', '#EC4899'];

const FIXED_CATEGORY_COLORS = {
  General: '#6C60E0',
  Work: '#3B82F6',
  Personal: '#52C41A',
  Design: '#FF6B35',
  Development: '#4FD1C5',
  Education: '#FFD93D',
  Health: '#FF4757',
};

// Deterministic color per category name — known categories get a fixed color,
// anything else is hashed onto the same palette so it stays consistent across uses.
export function colorForCategory(category) {
  const name = (category || '').trim();
  if (!name) return FIXED_CATEGORY_COLORS.General;
  if (FIXED_CATEGORY_COLORS[name]) return FIXED_CATEGORY_COLORS[name];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return COLOR_PALETTE[hash % COLOR_PALETTE.length];
}
