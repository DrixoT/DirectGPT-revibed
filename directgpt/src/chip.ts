import type { ObjectRef } from './types';

export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function truncate(s: string, n: number): string {
  const t = s.replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n - 1) + '…' : t;
}

/**
 * Inner markup of an object-word: a thumbnail of the object, or a brief description,
 * "to reduce articulatory distance" (§3.2.2).
 */
export function chipInnerHTML(ref: ObjectRef): string {
  switch (ref.type) {
    case 'element':
      return `<span class="chip-thumb" title="${escapeHtml(ref.label)} ${escapeHtml(ref.id)}">${ref.thumb}</span>`;
    case 'location':
      return `<span class="chip-text">(${ref.x}, ${ref.y})</span>`;
    case 'text':
      return `<span class="chip-text" title="${escapeHtml(ref.text)}">${escapeHtml(truncate(ref.text, 24))}</span>`;
  }
}

export function createChipElement(ref: ObjectRef): HTMLSpanElement {
  const span = document.createElement('span');
  span.className = 'chip';
  span.setAttribute('contenteditable', 'false');
  span.setAttribute('draggable', 'false');
  span.dataset.ref = JSON.stringify(ref);
  span.innerHTML = chipInnerHTML(ref);
  return span;
}

export function refFromChip(el: Element): ObjectRef | null {
  const raw = (el as HTMLElement).dataset?.ref;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ObjectRef;
  } catch {
    return null;
  }
}
