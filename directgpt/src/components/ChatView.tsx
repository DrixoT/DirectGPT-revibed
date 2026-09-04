import { marked } from 'marked';
import { useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';
import { streamChat } from '../openai';
import type { ChatMessage } from '../openai';
import Prism from '../prism';
import { normalizeSvg } from '../svg';
import type { Content, Settings } from '../types';

interface Props {
  settings: Settings;
  onNeedKey: () => void;
  onError: (msg: string) => void;
  seed: { content: Content; nonce: number } | null;
}

/** System prompt of ChatGPT (2023), as required for the replica used as baseline in §4. */
function chatgptSystemPrompt(): string {
  const today = new Date().toISOString().slice(0, 10);
  return `You are ChatGPT, a large language model trained by OpenAI, based on the GPT-3.5 architecture.\nKnowledge cutoff: 2021-09\nCurrent date: ${today}`;
}

function contentAsMessage(c: Content): string {
  if (c.kind === 'code') return '```' + (c.language ?? '') + '\n' + c.value + '\n```';
  return c.value;
}

function sanitize(root: ParentNode) {
  root.querySelectorAll('script, iframe, object, embed').forEach((n) => n.remove());
  root.querySelectorAll('*').forEach((el) => {
    for (const a of Array.from(el.attributes)) if (/^on/i.test(a.name) || (a.name === 'href' && /^javascript:/i.test(a.value))) el.removeAttribute(a.name);
  });
}

/** Markdown → HTML, with SVG code rendered as an image (the replica "rendered SVGs mentioned in the conversation", §4). */
function renderMarkdown(md: string): string {
  const html = marked.parse(md, { async: false }) as string;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  sanitize(doc.body);
  doc.querySelectorAll('pre > code').forEach((code) => {
    const text = code.textContent ?? '';
    if (text.includes('<svg') && text.includes('</svg>')) {
      const div = doc.createElement('div');
      div.className = 'svg-render';
      div.innerHTML = normalizeSvg(text.slice(text.indexOf('<svg'), text.lastIndexOf('</svg>') + 6));
      code.parentElement?.replaceWith(div);
    }
  });
  return doc.body.innerHTML;
}

export default function ChatView({ settings, onNeedKey, onError, seed }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (seed) setMessages([{ role: 'assistant', content: contentAsMessage(seed.content) }]);
  }, [seed]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    Prism.highlightAllUnder(el);
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || generating) return;
    if (!settings.apiKey) {
      onNeedKey();
      return;
    }
    const history: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages([...history, { role: 'assistant', content: '' }]);
    setInput('');
    setGenerating(true);
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      await streamChat(settings, [{ role: 'system', content: chatgptSystemPrompt() }, ...history], ac.signal, (_d, total) => {
        setMessages([...history, { role: 'assistant', content: total }]);
      });
    } catch (err) {
      if (!ac.signal.aborted) onError(err instanceof Error ? err.message : String(err));
    } finally {
      setGenerating(false);
      abortRef.current = null;
    }
  }, [input, generating, messages, settings, onNeedKey, onError]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  return (
    <div className="chat">
      <div className="chat-list" ref={listRef}>
        {messages.length === 0 && <div className="chat-empty">Baseline conversational interface (ChatGPT replica used in the study). Load a sample from the header or start a conversation.</div>}
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg ${m.role}`}>
            <div className="chat-role">{m.role === 'user' ? 'You' : 'ChatGPT'}</div>
            {m.role === 'assistant' ? (
              <div className="chat-body markdown" dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }} />
            ) : (
              <div className="chat-body">{m.content}</div>
            )}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKeyDown} placeholder="Send a message." rows={2} />
        {generating ? (
          <button type="button" onClick={() => abortRef.current?.abort()}>
            Stop
          </button>
        ) : (
          <button type="button" className="primary" onClick={() => void send()} disabled={!input.trim()}>
            Send
          </button>
        )}
      </div>
    </div>
  );
}
