import type { Content } from './types';

const FENCE = /```([\w+#-]*)[ \t]*\r?\n([\s\S]*?)```/;

export function guessLanguage(code: string): string {
  if (/^\s*(def |class |import |from \S+ import |print\()/m.test(code) && !/[;{}]\s*$/m.test(code)) return 'python';
  if (/<\/?[a-z][\s\S]*>/i.test(code) && /<(html|div|body|head|p|span)\b/i.test(code)) return 'markup';
  if (/^\s*(#include|int main)/m.test(code)) return 'c';
  if (/^\s*(public|private|static)\s+\w+\s+\w+\s*\(/m.test(code) && /System\.out/.test(code)) return 'java';
  if (/^\s*[{[]/.test(code) && /"[^"]*"\s*:/.test(code)) return 'json';
  if (/:\s*(string|number|boolean)\b|\binterface\s+\w+\s*\{/.test(code)) return 'typescript';
  return 'javascript';
}

const FENCE_LANG: Record<string, string> = {
  js: 'javascript',
  javascript: 'javascript',
  ts: 'typescript',
  typescript: 'typescript',
  py: 'python',
  python: 'python',
  html: 'markup',
  xml: 'markup',
  svg: 'markup',
  markup: 'markup',
  css: 'css',
  json: 'json',
  java: 'java',
  c: 'c',
  cpp: 'cpp',
  'c++': 'cpp',
  sh: 'bash',
  bash: 'bash',
  shell: 'bash',
  sql: 'sql',
};

function extractSvg(s: string): string | null {
  const start = s.indexOf('<svg');
  if (start < 0) return null;
  const end = s.lastIndexOf('</svg>');
  return end > start ? s.slice(start, end + '</svg>'.length) : s.slice(start);
}

/** Heuristic used when the user pastes content without choosing its kind. */
export function looksLikeCode(s: string): boolean {
  const lines = s.split('\n');
  let hits = 0;
  for (const l of lines) {
    if (/[;{}]\s*$/.test(l) || /^\s*(function|const|let|var|def|class|import|return|for|while|if)\b/.test(l) || /=>|\(\)|\[\]/.test(l)) hits++;
  }
  return hits >= Math.max(2, lines.length * 0.3);
}

/**
 * Turns a model answer into the object of interest: an SVG if the answer contains one,
 * the first fenced code block if any, otherwise the answer text itself.
 */
export function extractObject(response: string, current: Content | null): Content {
  const fence = FENCE.exec(response);
  if (fence) {
    const body = fence[2].replace(/\s+$/, '');
    const svg = extractSvg(body);
    if (svg) return { kind: 'svg', value: svg };
    const lang = FENCE_LANG[fence[1].toLowerCase()] ?? (fence[1] ? fence[1].toLowerCase() : undefined);
    return { kind: 'code', value: body, language: lang ?? current?.language ?? guessLanguage(body) };
  }
  const svg = extractSvg(response);
  if (svg) return { kind: 'svg', value: svg };
  const text = response.trim();
  if (current?.kind === 'code') return { kind: 'code', value: text, language: current.language ?? guessLanguage(text) };
  if (!current && looksLikeCode(text)) return { kind: 'code', value: text, language: guessLanguage(text) };
  return { kind: 'text', value: text };
}

/** The answer to a localized prompt (A.1.1) is only the rewritten selection. */
export function extractLocalized(response: string): string {
  let s = response.trim();
  const fence = FENCE.exec(s);
  if (fence) s = fence[2].replace(/\s+$/, '');
  s = s.replace(/^<blank>\s*:\s*/i, '');
  return s.trim();
}
