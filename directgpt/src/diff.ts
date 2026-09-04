import type { Range } from './types';

const TOKEN = /\s+|[\p{L}\p{N}_]+|[^\s\p{L}\p{N}_]/gu;

interface Tok {
  text: string;
  start: number;
  end: number;
}

function tokenize(s: string): Tok[] {
  const out: Tok[] = [];
  for (const m of s.matchAll(TOKEN)) out.push({ text: m[0], start: m.index ?? 0, end: (m.index ?? 0) + m[0].length });
  return out;
}

/**
 * Word-level ranges of `next` that differ from `prev`, so that modifications can be
 * highlighted once the new representation is shown (§3.2.1, fig. 2b).
 */
export function changedRanges(prev: string, next: string): Range[] {
  if (prev === next) return [];
  const a = tokenize(prev);
  const b = tokenize(next);
  let pre = 0;
  while (pre < a.length && pre < b.length && a[pre].text === b[pre].text) pre++;
  let suf = 0;
  while (suf < a.length - pre && suf < b.length - pre && a[a.length - 1 - suf].text === b[b.length - 1 - suf].text) suf++;
  const am = a.slice(pre, a.length - suf);
  const bm = b.slice(pre, b.length - suf);
  if (bm.length === 0) return [];
  const changed: boolean[] = new Array(bm.length).fill(true);
  if (am.length * bm.length <= 4_000_000 && am.length > 0) {
    // LCS on the middle part.
    const n = am.length;
    const m = bm.length;
    const dp = new Uint32Array((n + 1) * (m + 1));
    const W = m + 1;
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        dp[i * W + j] = am[i].text === bm[j].text ? dp[(i + 1) * W + j + 1] + 1 : Math.max(dp[(i + 1) * W + j], dp[i * W + j + 1]);
      }
    }
    let i = 0;
    let j = 0;
    while (i < n && j < m) {
      if (am[i].text === bm[j].text) {
        changed[j] = false;
        i++;
        j++;
      } else if (dp[(i + 1) * W + j] >= dp[i * W + j + 1]) i++;
      else j++;
    }
  }
  const ranges: Range[] = [];
  for (let j = 0; j < bm.length; j++) {
    if (!changed[j] || /^\s+$/.test(bm[j].text)) continue;
    const last = ranges[ranges.length - 1];
    if (last && next.slice(last.end, bm[j].start).trim() === '' && bm[j].start - last.end <= 1) last.end = bm[j].end;
    else ranges.push({ start: bm[j].start, end: bm[j].end });
  }
  return ranges;
}
