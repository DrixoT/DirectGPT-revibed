import { useState } from 'react';
import { guessLanguage, looksLikeCode } from '../extract';
import { SAMPLES } from '../samples';
import type { Content, Kind } from '../types';

interface Props {
  onLoad: (content: Content) => void;
}

export function contentFromPaste(text: string, kind: Kind | 'auto'): Content {
  const value = text.replace(/\r\n/g, '\n').trim();
  let k: Kind = kind === 'auto' ? (value.includes('<svg') ? 'svg' : looksLikeCode(value) ? 'code' : 'text') : kind;
  if (k === 'svg' && !value.includes('<svg')) k = 'text';
  if (k === 'code') return { kind: 'code', value, language: guessLanguage(value) };
  return { kind: k, value };
}

/** Shown before an object of interest exists: generate one with a prompt, or paste content to edit. */
export default function EmptyState({ onLoad }: Props) {
  const [text, setText] = useState('');
  const [kind, setKind] = useState<Kind | 'auto'>('auto');
  return (
    <div className="empty-state">
      <p className="lead">
        Type a prompt below to generate text, code or an SVG image — or paste existing content here to edit it.
      </p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste text, code, or SVG markup…" rows={6} />
      <div className="empty-actions">
        <label>
          Treat as
          <select value={kind} onChange={(e) => setKind(e.target.value as Kind | 'auto')}>
            <option value="auto">auto-detect</option>
            <option value="text">text</option>
            <option value="code">code</option>
            <option value="svg">SVG image</option>
          </select>
        </label>
        <button type="button" className="primary" disabled={!text.trim()} onClick={() => onLoad(contentFromPaste(text, kind))}>
          Use this content
        </button>
      </div>
      <div className="samples">
        <span>Or start from a study sample:</span>
        {SAMPLES.map((s) => (
          <button key={s.id} type="button" onClick={() => onLoad(s.content)}>
            {s.name}
          </button>
        ))}
      </div>
    </div>
  );
}
