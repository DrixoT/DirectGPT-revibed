import type { Settings } from './types';

const KEY = 'directgpt.settings';

/** Model named by the paper (§3.3, §4): "gpt-3.5-turbo". */
export const DEFAULT_MODEL = 'gpt-3.5-turbo';

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Settings>;
      return { apiKey: parsed.apiKey ?? '', model: parsed.model || DEFAULT_MODEL };
    }
  } catch {
    /* ignore */
  }
  return { apiKey: '', model: DEFAULT_MODEL };
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}
