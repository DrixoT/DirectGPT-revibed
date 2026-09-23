import type { Settings } from './types';

const KEY = 'directgpt.settings';

/** Model named by the paper (§3.3, §4): "gpt-3.5-turbo". */
export const DEFAULT_MODEL = 'gpt-3.5-turbo';

type Stored = Partial<Settings> & { apiKey?: string };

function asString(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function emptySettings(): Settings {
  return {
    openaiApiKey: '',
    anthropicApiKey: '',
    googleApiKey: '',
    openrouterApiKey: '',
    model: DEFAULT_MODEL,
    favorites: [],
  };
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Stored;
      const favorites = Array.isArray(parsed.favorites)
        ? parsed.favorites.filter((id): id is string => typeof id === 'string')
        : [];
      return {
        openaiApiKey: asString(parsed.openaiApiKey) || asString(parsed.apiKey),
        anthropicApiKey: asString(parsed.anthropicApiKey),
        googleApiKey: asString(parsed.googleApiKey),
        openrouterApiKey: asString(parsed.openrouterApiKey),
        model: asString(parsed.model) || DEFAULT_MODEL,
        favorites,
      };
    }
  } catch {
    /* ignore */
  }
  return emptySettings();
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}
