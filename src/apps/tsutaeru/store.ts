import type { HistoryEntry, Settings, Theme } from './types';
import { PRESET_THEMES } from './presets';

const THEMES_KEY = 'tsutaeru.themes.v1';
const HISTORY_KEY = 'tsutaeru.history.v1';
const SETTINGS_KEY = 'tsutaeru.settings.v1';

const DEFAULT_SETTINGS: Settings = { speech: true };

// Read + JSON.parse a key, returning `fallback` on missing or corrupted data.
// Corruption must never throw: a broken key silently reverts to defaults.
function read<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadThemes(): Theme[] {
  const raw = localStorage.getItem(THEMES_KEY);
  if (raw === null) return structuredClone(PRESET_THEMES);
  try {
    return JSON.parse(raw) as Theme[];
  } catch {
    return structuredClone(PRESET_THEMES);
  }
}

export function saveThemes(t: Theme[]): void {
  write(THEMES_KEY, t);
}

export function addHistory(e: HistoryEntry): void {
  const entries = listHistory();
  entries.unshift(e); // newest first
  write(HISTORY_KEY, entries);
}

export function listHistory(): HistoryEntry[] {
  return read<HistoryEntry[]>(HISTORY_KEY, []);
}

export function deleteHistory(id: string): void {
  const entries = listHistory().filter((e) => e.id !== id);
  write(HISTORY_KEY, entries);
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

export function loadSettings(): Settings {
  return read<Settings>(SETTINGS_KEY, DEFAULT_SETTINGS);
}

export function saveSettings(s: Settings): void {
  write(SETTINGS_KEY, s);
}

export function resetAll(): void {
  localStorage.removeItem(THEMES_KEY);
  localStorage.removeItem(HISTORY_KEY);
  localStorage.removeItem(SETTINGS_KEY);
}
