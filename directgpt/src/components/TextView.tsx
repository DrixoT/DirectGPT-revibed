import { useCallback, useMemo, useRef } from 'react';
import type React from 'react';
import { beginPotentialDrag } from '../dnd';
import { tokenizeLeaves } from '../prism';
import type { ObjectRef, Range, TextRef } from '../types';

interface Props {
  value: string;
  language: string | null;
  selection: TextRef[];
  pulse: ObjectRef[];
  changed: Range[];
  hover: ObjectRef | null;
  slotRefs: ObjectRef[];
  onSelectionComplete: (refs: TextRef[], additive: boolean) => void;
  onDragStart: (refs: TextRef[], ev: PointerEvent) => void;
}

interface Mark extends Range {
  cls: string;
}

const WORD_CHAR = /[\p{L}\p{N}_$]/u;

/** The word (or code token) containing an offset, used for click selection. */
export function wordAt(value: string, off: number): TextRef | null {
  const isWord = (c: string | undefined) => c !== undefined && WORD_CHAR.test(c);
  let start: number;
  let end: number;
  if (isWord(value[off])) {
    start = off;
    end = off;
    while (isWord(value[end])) end++;
    while (start > 0 && isWord(value[start - 1])) start--;
  } else if (isWord(value[off - 1])) {
    start = off;
    end = off;
    while (start > 0 && isWord(value[start - 1])) start--;
  } else {
    return null;
  }
  if (end <= start) return null;
  return { type: 'text', start, end, text: value.slice(start, end) };
}

/** Text offset (in the rendered content) of a DOM position. Works because the DOM text equals the content exactly. */
function offsetOf(container: HTMLElement, node: Node, offset: number): number | null {
  if (!container.contains(node)) return null;
  const r = document.createRange();
  r.setStart(container, 0);
  r.setEnd(node, offset);
  return r.toString().length;
}

function offsetFromPoint(container: HTMLElement, x: number, y: number): number | null {
  const doc = document as Document & {
    caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
    caretRangeFromPoint?: (x: number, y: number) => globalThis.Range | null;
  };
  if (doc.caretPositionFromPoint) {
    const p = doc.caretPositionFromPoint(x, y);
    return p ? offsetOf(container, p.offsetNode, p.offset) : null;
  }
  if (doc.caretRangeFromPoint) {
    const r = doc.caretRangeFromPoint(x, y);
    return r ? offsetOf(container, r.startContainer, r.startOffset) : null;
  }
  return null;
}

export default function TextView({ value, language, selection, pulse, changed, hover, slotRefs, onSelectionComplete, onDragStart }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const draggingOut = useRef(false);

  const pieces = useMemo(() => {
    const marks: Mark[] = [];
    for (const s of selection) marks.push({ start: s.start, end: s.end, cls: 'sel' });
    for (const p of pulse) if (p.type === 'text') marks.push({ start: p.start, end: p.end, cls: 'pulse' });
    for (const c of changed) marks.push({ start: c.start, end: c.end, cls: 'changed' });
    for (const s of slotRefs) if (s.type === 'text') marks.push({ start: s.start, end: s.end, cls: 'slot' });
    if (hover && hover.type === 'text') marks.push({ start: hover.start, end: hover.end, cls: 'hover' });

    const leaves = tokenizeLeaves(value, language);
    const bounds = new Set<number>([0, value.length]);
    for (const m of marks) {
      bounds.add(Math.max(0, Math.min(value.length, m.start)));
      bounds.add(Math.max(0, Math.min(value.length, m.end)));
    }
    let off = 0;
    for (const l of leaves) {
      off += l.text.length;
      bounds.add(off);
    }
    const sorted = Array.from(bounds).sort((a, b) => a - b);
    const out: Array<{ start: number; end: number; text: string; cls: string }> = [];
    let leafIdx = 0;
    let leafStart = 0;
    for (let i = 0; i < sorted.length - 1; i++) {
      const start = sorted[i];
      const end = sorted[i + 1];
      if (end <= start) continue;
      while (leafIdx < leaves.length && leafStart + leaves[leafIdx].text.length <= start) {
        leafStart += leaves[leafIdx].text.length;
        leafIdx++;
      }
      const leafCls = leaves[leafIdx]?.cls ?? '';
      const markCls = marks.filter((m) => m.start <= start && m.end >= end).map((m) => 'm-' + m.cls);
      out.push({ start, end, text: value.slice(start, end), cls: [leafCls, ...markCls].join(' ').trim() });
    }
    return out;
  }, [value, language, selection, pulse, changed, hover, slotRefs]);

  const additiveKey = (e: { ctrlKey: boolean; metaKey: boolean }) => e.ctrlKey || e.metaKey;

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0 || !ref.current) return;
      const off = offsetFromPoint(ref.current, e.clientX, e.clientY);
      if (off === null) return;
      const additive = additiveKey(e);
      const hit = selection.find((s) => off >= s.start && off <= s.end);

      if (hit) {
        // Pointer down inside a selected span: drag it (and the other selected spans) instead of selecting anew.
        e.preventDefault();
        beginPotentialDrag(e, {
          onStart: (ev) => onDragStart(selection, ev),
          onClick: () => onSelectionComplete([hit], additive),
        });
        return;
      }

      // Not on a selection: let the native drag-selection run, but if the pointer leaves the
      // content panel (i.e. heads for the prompt field) turn the gesture into an object drag
      // of the word under the cursor, so a word can be dragged out without selecting it first.
      const word = wordAt(value, off);
      if (!word) return;
      const panel = ref.current.closest('.object-panel') ?? ref.current;
      const bounds = panel.getBoundingClientRect();
      const cleanup = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
      };
      const move = (ev: PointerEvent) => {
        const outside = ev.clientX < bounds.left || ev.clientX > bounds.right || ev.clientY < bounds.top || ev.clientY > bounds.bottom;
        if (!outside) return;
        cleanup();
        draggingOut.current = true;
        // Drag the word that was pressed; the browser's incidental drag-selection is discarded.
        // (A whole passage is dragged by selecting it first, then pressing inside the selection.)
        window.getSelection()?.removeAllRanges();
        onDragStart([word], ev);
      };
      const up = () => cleanup();
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
    },
    [selection, value, onDragStart, onSelectionComplete],
  );

  const onMouseUp = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.button !== 0 || !ref.current) return;
      if (draggingOut.current) {
        draggingOut.current = false;
        return;
      }
      const sel = window.getSelection();
      const additive = additiveKey(e);
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
        // A plain click selects the word (or code token) under the cursor (§3.2.2: "objects are selected with a click").
        const off = offsetFromPoint(ref.current, e.clientX, e.clientY);
        const word = off === null ? null : wordAt(value, off);
        if (word) onSelectionComplete([word], additive);
        else if (!additive) onSelectionComplete([], false);
        return;
      }
      const range = sel.getRangeAt(0);
      if (!ref.current.contains(range.commonAncestorContainer)) return;
      let start = offsetOf(ref.current, range.startContainer, range.startOffset);
      let end = offsetOf(ref.current, range.endContainer, range.endOffset);
      if (start === null || end === null) return;
      while (start < end && /\s/.test(value[start])) start++;
      while (end > start && /\s/.test(value[end - 1])) end--;
      sel.removeAllRanges();
      if (start >= end) {
        if (!additive) onSelectionComplete([], false);
        return;
      }
      onSelectionComplete([{ type: 'text', start, end, text: value.slice(start, end) }], additive);
    },
    [value, onSelectionComplete],
  );

  const className = `text-view ${language ? 'is-code' : 'is-text'}`;
  const body = pieces.map((p) => (
    <span key={p.start} className={p.cls || undefined}>
      {p.text}
    </span>
  ));

  return (
    <div className={className} ref={ref} onPointerDown={onPointerDown} onMouseUp={onMouseUp}>
      {language ? (
        <pre className={`language-${language}`}>
          <code className={`language-${language}`}>{body}</code>
        </pre>
      ) : (
        body
      )}
    </div>
  );
}
