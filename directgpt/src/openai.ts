import OpenAI from 'openai';
import { keyForProvider, openrouterKey, providerOf, resolveOpenRouterModel, setOpenRouterModels, type ModelInfo } from './models';
import type { Settings } from './types';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

function anthropicBase(): string {
  return import.meta.env.DEV ? '/anthropic' : 'https://api.anthropic.com';
}

function googleBase(): string {
  return import.meta.env.DEV ? '/google-ai' : 'https://generativelanguage.googleapis.com';
}

function openrouterBase(): string {
  if (!import.meta.env.DEV) return 'https://openrouter.ai/api';
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  return `${origin}/openrouter`;
}

async function errorFrom(res: Response): Promise<string> {
  const text = (await res.text()).trim();
  if (!text) return `${res.status} ${res.statusText}`;
  try {
    const json = JSON.parse(text) as { error?: { message?: string }; message?: string };
    return json.error?.message || json.message || text;
  } catch {
    return text;
  }
}

async function readSse(
  res: Response,
  onData: (event: string, data: string) => boolean | void,
): Promise<void> {
  if (!res.body) throw new Error('The model returned an empty body.');
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  let event = '';
  let stop = false;

  const consume = (chunk: string) => {
    buf += chunk;
    const lines = buf.split('\n');
    buf = lines.pop() ?? '';
    for (const raw of lines) {
      const line = raw.replace(/\r$/, '');
      if (line.startsWith('event:')) {
        event = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        const data = line.slice(5).trim();
        if (onData(event, data) === true) {
          stop = true;
          return;
        }
      } else if (line === '') {
        event = '';
      }
    }
  };

  while (!stop) {
    const { done, value } = await reader.read();
    if (done) {
      consume(decoder.decode());
      if (buf) consume('\n');
      break;
    }
    consume(decoder.decode(value, { stream: true }));
  }
}

function splitSystem(messages: ChatMessage[]): { system: string; rest: ChatMessage[] } {
  const systemParts: string[] = [];
  const rest: ChatMessage[] = [];
  for (const m of messages) {
    if (m.role === 'system') systemParts.push(m.content);
    else rest.push(m);
  }
  return { system: systemParts.join('\n\n'), rest };
}

function mergeTurns(messages: ChatMessage[]): ChatMessage[] {
  const out: ChatMessage[] = [];
  for (const m of messages) {
    const last = out[out.length - 1];
    if (last && last.role === m.role) last.content += '\n\n' + m.content;
    else out.push({ ...m });
  }
  return out;
}

type OpenRouterModel = {
  id?: string;
  name?: string;
  architecture?: { output_modalities?: string[] };
};

let fetchedKey = '';
let fetched: ModelInfo[] | null = null;
let inflight: Promise<ModelInfo[]> | null = null;
let inflightKey = '';

export async function fetchOpenRouterModels(apiKey: string, signal?: AbortSignal): Promise<ModelInfo[]> {
  const key = apiKey.trim();
  if (!key) {
    fetchedKey = '';
    fetched = [];
    inflight = null;
    inflightKey = '';
    setOpenRouterModels([]);
    return [];
  }
  if (fetched && fetchedKey === key) return fetched;
  if (inflight && inflightKey === key) return inflight;
  if (fetchedKey !== key) setOpenRouterModels([]);
  inflightKey = key;
  inflight = (async () => {
    const res = await fetch(`${openrouterBase()}/v1/models`, {
      headers: {
        Authorization: `Bearer ${key}`,
        'X-Title': 'DirectGPT',
      },
      signal,
    });
    if (!res.ok) throw new Error(await errorFrom(res));
    const json = (await res.json()) as { data?: OpenRouterModel[] };
    const list: ModelInfo[] = [];
    for (const m of json.data ?? []) {
      if (!m.id) continue;
      if (m.id.includes(':batch')) continue;
      const out = m.architecture?.output_modalities;
      if (out && !out.includes('text')) continue;
      list.push({
        id: m.id,
        label: m.name || m.id,
        provider: 'openrouter',
        providerLabel: 'OpenRouter',
      });
    }
    fetchedKey = key;
    fetched = list;
    setOpenRouterModels(list);
    return list;
  })();
  try {
    return await inflight;
  } finally {
    if (inflightKey === key) inflight = null;
  }
}

async function streamOpenAI(
  settings: Settings,
  messages: ChatMessage[],
  signal: AbortSignal,
  onDelta: ((delta: string, total: string) => void) | undefined,
  opts: { openrouter: boolean; model: string },
): Promise<string> {
  const client = new OpenAI({
    apiKey: opts.openrouter ? openrouterKey(settings) : settings.openaiApiKey,
    baseURL: opts.openrouter ? `${openrouterBase()}/v1` : undefined,
    defaultHeaders: opts.openrouter ? { 'X-Title': 'DirectGPT' } : undefined,
    dangerouslyAllowBrowser: true,
  });
  const stream = await client.chat.completions.create(
    { model: opts.model, messages, stream: true },
    { signal },
  );
  let total = '';
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content ?? '';
    if (delta) {
      total += delta;
      onDelta?.(delta, total);
    }
  }
  return total;
}

async function streamAnthropic(
  settings: Settings,
  messages: ChatMessage[],
  signal: AbortSignal,
  onDelta?: (delta: string, total: string) => void,
): Promise<string> {
  const { system, rest } = splitSystem(messages);
  let turns = mergeTurns(rest.filter((m) => m.role === 'user' || m.role === 'assistant'));
  if (turns[0]?.role === 'assistant') turns = [{ role: 'user', content: '(continue)' }, ...turns];
  const res = await fetch(`${anthropicBase()}/v1/messages`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': settings.anthropicApiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: settings.model,
      max_tokens: 4096,
      stream: true,
      system: system || undefined,
      messages: turns.map((m) => ({ role: m.role, content: m.content })),
    }),
    signal,
  });
  if (!res.ok) throw new Error(await errorFrom(res));
  let total = '';
  await readSse(res, (_event, data) => {
    if (!data || data === '[DONE]') return;
    let json: { type?: string; delta?: { text?: string }; error?: { message?: string } };
    try {
      json = JSON.parse(data);
    } catch {
      return;
    }
    if (json.type === 'error') throw new Error(json.error?.message || 'Anthropic error');
    const delta = json.delta?.text ?? '';
    if (delta) {
      total += delta;
      onDelta?.(delta, total);
    }
  });
  return total;
}

async function streamGoogle(
  settings: Settings,
  messages: ChatMessage[],
  signal: AbortSignal,
  onDelta?: (delta: string, total: string) => void,
): Promise<string> {
  const { system, rest } = splitSystem(messages);
  let turns = mergeTurns(rest.filter((m) => m.role === 'user' || m.role === 'assistant'));
  if (turns[0]?.role === 'assistant') turns = [{ role: 'user', content: '(continue)' }, ...turns];
  const contents = turns.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
  const url = `${googleBase()}/v1beta/models/${encodeURIComponent(settings.model)}:streamGenerateContent?alt=sse`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-goog-api-key': settings.googleApiKey,
    },
    body: JSON.stringify({
      contents,
      systemInstruction: system ? { parts: [{ text: system }] } : undefined,
    }),
    signal,
  });
  if (!res.ok) throw new Error(await errorFrom(res));
  let total = '';
  await readSse(res, (_event, data) => {
    if (!data || data === '[DONE]') return;
    let json: { error?: { message?: string }; candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    try {
      json = JSON.parse(data);
    } catch {
      return;
    }
    if (json.error?.message) throw new Error(json.error.message);
    const delta = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
    if (delta) {
      total += delta;
      onDelta?.(delta, total);
    }
  });
  return total;
}

/**
 * Executes a prompt through the selected provider, streaming the answer so it
 * can be displayed word-by-word and stopped mid-way (§3.2.4).
 * OpenAI uses the official SDK (`dangerouslyAllowBrowser`). OpenRouter uses the
 * same SDK against its OpenAI-compatible base URL. Anthropic and Google
 * are fetched from the Vite proxy in development.
 */
export async function streamChat(
  settings: Settings,
  messages: ChatMessage[],
  signal: AbortSignal,
  onDelta?: (delta: string, total: string) => void,
): Promise<string> {
  const provider = providerOf(settings.model);
  const native = keyForProvider(settings, provider).trim();
  const or = openrouterKey(settings);
  if (!native && !or) throw new Error('No API key set for this model.');
  if (native && provider === 'anthropic') return streamAnthropic(settings, messages, signal, onDelta);
  if (native && provider === 'google') return streamGoogle(settings, messages, signal, onDelta);
  if (native && provider === 'openai') return streamOpenAI(settings, messages, signal, onDelta, { openrouter: false, model: settings.model });
  const model = resolveOpenRouterModel(settings.model);
  if (!model.includes('/')) {
    throw new Error('This model is not available on OpenRouter. Open the model picker and choose an OpenRouter model.');
  }
  return streamOpenAI(settings, messages, signal, onDelta, { openrouter: true, model });
}
