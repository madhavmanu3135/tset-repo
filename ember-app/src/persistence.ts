// ─── Persistence Layer ───
// Abstracted so it can swap from localStorage to Supabase/Firebase
// without touching the store or components.

import type { EmberState } from './types';

const STORAGE_KEY = 'ember_game_state';

export interface PersistenceAdapter {
  load(): EmberState | null;
  save(state: EmberState): void;
  clear(): void;
}

// ─── localStorage adapter (MVP) ───
export const localStorageAdapter: PersistenceAdapter = {
  load(): EmberState | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as EmberState;
    } catch {
      console.warn('[EMBER] Failed to load state from localStorage');
      return null;
    }
  },

  save(state: EmberState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      console.warn('[EMBER] Failed to save state to localStorage');
    }
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};

// ─── Data Export / Import ───
// Allows students to backup and restore their data across devices.

export function exportData(): string {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return JSON.stringify({});
  return raw;
}

export function importData(json: string): EmberState | null {
  try {
    const parsed = JSON.parse(json);
    // Basic validation: check required top-level keys exist
    if (!parsed.player || !Array.isArray(parsed.quests) || !Array.isArray(parsed.questlines)) {
      console.warn('[EMBER] Invalid import data: missing required fields');
      return null;
    }
    // Validate player structure
    if (typeof parsed.player.momentumTotal !== 'number' || typeof parsed.player.level !== 'number') {
      console.warn('[EMBER] Invalid import data: malformed player');
      return null;
    }
    return parsed as EmberState;
  } catch {
    console.warn('[EMBER] Failed to parse import data');
    return null;
  }
}

export function downloadDataAsFile(): void {
  const data = exportData();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ember-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
