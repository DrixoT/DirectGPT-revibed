import OpenAI from 'openai';
import type { Settings } from './types';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Executes a prompt with the official OpenAI library (§3.3) through the Chat API (§4),
 * streaming the answer so it can be displayed word-by-word and stopped mid-way (§3.2.4).
 * The key is provided by the user in the browser, hence `dangerouslyAllowBrowser`.
 */
export async function streamChat(
  settings: Settings,
  messages: ChatMessage[],
  signal: AbortSignal,
  onDelta?: (delta: string, total: string) => void,
): Promise<string> {
  const client = new OpenAI({ apiKey: settings.apiKey, dangerouslyAllowBrowser: true });
  const stream = await client.chat.completions.create(
    { model: settings.model, messages, stream: true },
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
