import type { Settings } from './types';

export type Provider = 'openai' | 'anthropic' | 'google' | 'openrouter';

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

let openrouterModels: ModelInfo[] = [];
let byId = new Map(BY_ID);

function rebuildById(): void {
  byId = new Map(BY_ID);
  for (const m of openrouterModels) byId.set(m.id, m);
}

export function allModels(): ModelInfo[] {
  return openrouterModels.length === 0 ? MODELS : [...MODELS, ...openrouterModels];
}

export function setOpenRouterModels(list: ModelInfo[]): void {
  openrouterModels = list;
  rebuildById();
}

export function modelInfo(id: string): ModelInfo | undefined {
  return byId.get(id);
}

export function modelLabel(id: string): string {
  return byId.get(id)?.label ?? id;
}

export function providerOf(modelId: string): Provider {
  const known = byId.get(modelId)?.provider;
  if (known) return known;
  return modelId.includes('/') ? 'openrouter' : 'openai';
}

export function openrouterKey(settings: Settings): string {
  const k = settings.openrouterApiKey.trim();
  if (k) return k;
  const openai = settings.openaiApiKey.trim();
  return openai.startsWith('sk-or-') ? openai : '';
}

export function keyForProvider(settings: Settings, provider: Provider): string {
  if (provider === 'anthropic') return settings.anthropicApiKey;
  if (provider === 'google') return settings.googleApiKey;
  if (provider === 'openrouter') return openrouterKey(settings);
  return settings.openaiApiKey.startsWith('sk-or-') ? '' : settings.openaiApiKey;
}

export function hasKeyFor(settings: Settings, modelId = settings.model): boolean {
  if (keyForProvider(settings, providerOf(modelId)).trim()) return true;
  return openrouterKey(settings).length > 0;
}

export function resolveOpenRouterModel(modelId: string): string {
  if (modelId.includes('/')) return modelId;
  const catalog = allModels().filter((m) => m.provider === 'openrouter' && !m.id.includes(':'));
  const provider = providerOf(modelId);
  const prefixed = provider === 'openai' ? `openai/${modelId}` : provider === 'anthropic' ? `anthropic/${modelId}` : `google/${modelId}`;
  const exact = catalog.find((m) => m.id === prefixed) || catalog.find((m) => m.id.endsWith('/' + modelId));
  if (exact) return exact.id;
  const slim = modelId.replace(/-latest$/, '').replace(/(\d)-(\d)/g, '$1.$2');
  const fuzzy = catalog.find((m) => m.id.endsWith('/' + slim));
  if (fuzzy) return fuzzy.id;
  if (provider === 'openai') return prefixed;
  return modelId;
}

export function demo(): void {
  const blank: Settings = {
    openaiApiKey: '',
    anthropicApiKey: '',
    googleApiKey: '',
    openrouterApiKey: '',
    model: 'gpt-3.5-turbo',
    favorites: [],
  };
  const or: Settings = { ...blank, openrouterApiKey: 'sk-or-test', model: 'openai/gpt-4o' };
  if (providerOf('openai/gpt-4o') !== 'openrouter') throw new Error('providerOf slash id');
  if (providerOf('gpt-4o') !== 'openai') throw new Error('providerOf openai');
  if (keyForProvider(or, 'openrouter') !== 'sk-or-test') throw new Error('keyForProvider');
  if (!hasKeyFor(or)) throw new Error('hasKeyFor');
  if (hasKeyFor(blank, 'openai/gpt-4o')) throw new Error('hasKeyFor empty');
  if (openrouterKey({ ...blank, openaiApiKey: 'sk-or-from-openai' }) !== 'sk-or-from-openai') throw new Error('openrouterKey openai field');
  if (!hasKeyFor({ ...blank, openrouterApiKey: 'sk-or-test' }, 'gpt-4o')) throw new Error('hasKeyFor fallback');
  setOpenRouterModels([{ id: 'openai/gpt-4o-mini', label: 'GPT-4o mini', provider: 'openrouter', providerLabel: 'OpenRouter' }]);
  if (resolveOpenRouterModel('gpt-4o-mini') !== 'openai/gpt-4o-mini') throw new Error('resolveOpenRouterModel');
  if (modelLabel('openai/gpt-4o-mini') !== 'GPT-4o mini') throw new Error('modelLabel');
  if (!allModels().some((m) => m.id === 'openai/gpt-4o-mini')) throw new Error('allModels');
  setOpenRouterModels([]);
}
