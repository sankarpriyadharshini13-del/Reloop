'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { EMPTY_IMPACT, IMPACT_EVENT, STORAGE_KEY, parseImpact } from './impact';

function subscribe(callback) {
  window.addEventListener('storage', callback);
  window.addEventListener(IMPACT_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(IMPACT_EVENT, callback);
  };
}

function getSnapshot() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

const getServerSnapshot = () => '';

/**
 * Reads the Green Score from localStorage without hydration mismatches.
 * Server render and first client render both see the empty state, then it updates.
 */
export function useImpact() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => (raw ? parseImpact(raw) : EMPTY_IMPACT), [raw]);
}
