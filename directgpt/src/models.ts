import type { Settings } from './types';

export type Provider = 'openai' | 'anthropic' | 'google';

export interface ModelInfo {
  id: string;
  label: string;
  provider: Provider;
  providerLabel: string;
}

export const MODELS: ModelInfo[] = [
  { id: 'gpt-4o-mini', label: 'GPT-4o mini', provider: 'openai', providerLabel: 'OpenAI' },
  { id: 'gpt-4o', label: 'GPT-4o', provider: 'openai', providerLabel: 'OpenAI' },
  { id: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', provider: 'openai', providerLabel: 'OpenAI' },
  { id: 'claude-3-5-haiku-latest', label: 'Claude 3.5 Haiku', provider: 'anthropic', providerLabel: 'Anthropic' },
  { id: 'claude-3-5-sonnet-latest', label: 'Claude 3.5 Sonnet', provider: 'anthropic', providerLabel: 'Anthropic' },
  { id: 'claude-3-opus-latest', label: 'Claude 3 Opus', provider: 'anthropic', providerLabel: 'Anthropic' },
  { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', provider: 'google', providerLabel: 'Google' },
  { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', provider: 'google', providerLabel: 'Google' },
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', provider: 'google', providerLabel: 'Google' },
];

const BY_ID = new Map(MODELS.map((m) => [m.id, m]));

export function modelInfo(id: string): ModelInfo | undefined {
  return BY_ID.get(id);
}

export function modelLabel(id: string): string {
  return BY_ID.get(id)?.label ?? id;
}

export function providerOf(modelId: string): Provider {
  return BY_ID.get(modelId)?.provider ?? 'openai';
}

export function keyForProvider(settings: Settings, provider: Provider): string {
  if (provider === 'anthropic') return settings.anthropicApiKey;
  if (provider === 'google') return settings.googleApiKey;
  return settings.openaiApiKey;
}

export function hasKeyFor(settings: Settings, modelId = settings.model): boolean {
  return keyForProvider(settings, providerOf(modelId)).trim().length > 0;
}
