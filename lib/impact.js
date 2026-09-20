// Shared helpers for the "Green Score" and CO2 math. Safe to import from server or client code.

export const STORAGE_KEY = 'reloop:impact:v1';
export const IMPACT_EVENT = 'reloop:impact';
export const POINTS_PER_SCAN = 10;

// Rule of thumb used across the app: 0.8 kg CO2 = 1 tree working for 8 days -> 0.1 kg per tree-day.
const KG_PER_TREE_DAY = 0.1;

export const EMPTY_IMPACT = Object.freeze({ score: 0, scans: 0, co2: 0 });

export function parseImpact(raw) {
  if (!raw) return EMPTY_IMPACT;
  try {
    const v = JSON.parse(raw);
    return {
      score: Number(v.score) || 0,
      scans: Number(v.scans) || 0,
      co2: Number(v.co2) || 0,
    };
  } catch {
    return EMPTY_IMPACT;
  }
}

export function addScan({ co2 }) {
  if (typeof window === 'undefined') return null;
  try {
    const current = parseImpact(window.localStorage.getItem(STORAGE_KEY));
    const next = {
      score: current.score + POINTS_PER_SCAN,
      scans: current.scans + 1,
      co2: Math.round((current.co2 + Number(co2 || 0)) * 100) / 100,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(IMPACT_EVENT));
    return next;
  } catch {
    // Storage can be blocked (private mode, strict settings). The app still works without it.
    return null;
  }
}

export function formatKg(value) {
  return (Math.round(Number(value) * 10) / 10).toFixed(1);
}

export function treeDaysFor(co2) {
  return Math.max(1, Math.round(Number(co2) / KG_PER_TREE_DAY));
}

export function formatTreeTime(days) {
  if (days >= 365) {
    const years = Math.round((days / 365) * 10) / 10;
    return `${years} ${years === 1 ? 'year' : 'years'}`;
  }
  if (days >= 90) {
    const months = Math.round(days / 30);
    return `${months} months`;
  }
  return `${days} ${days === 1 ? 'day' : 'days'}`;
}

const LEVELS = [
  { name: 'Seedling', min: 0 },
  { name: 'Sprout', min: 50 },
  { name: 'Sapling', min: 150 },
  { name: 'Forest Guardian', min: 300 },
  { name: 'Planet Hero', min: 600 },
];

export function getLevel(score) {
  let index = 0;
  LEVELS.forEach((level, i) => {
    if (score >= level.min) index = i;
  });
  const current = LEVELS[index];
  const next = LEVELS[index + 1];
  return {
    name: current.name,
    next: next ? next.name : null,
    toNext: next ? next.min - score : 0,
    progress: next ? (score - current.min) / (next.min - current.min) : 1,
  };
}
