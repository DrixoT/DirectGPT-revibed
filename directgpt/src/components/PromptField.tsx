import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type React from 'react';
import { chipInnerHTML, createChipElement, refFromChip } from '../chip';
import { refreshElementRef } from '../svg';
import { refLabel } from '../types';
import type { Content, ObjectRef, PromptPart } from '../types';

export interface PromptFieldHandle {
  /** Re-renders object-words against the current object of interest (§3.2.2 thumbnails). */
  refreshRefs: (content: Content | null) => void;
  /** Called while dragging an object over the page. Returns true when the pointer is over the field. */
  dragOver: (x: number, y: number) => boolean;
  /** Drops object-words at the position computed by the last `dragOver`. */
  drop: (refs: ObjectRef[]) => void;
  dragEnd: () => void;
  clear: () => void;
  focus: () => void;
}

interface Props {
  generating: boolean;
  status: string | null;
  error: string | null;
  selectionCount: number;
  onSubmit: (parts: PromptPart[]) => void;
  onStop: () => void;
  onClearSelection: () => void;
  onHoverRef: (ref: ObjectRef | null) => void;
}

type DropSpec =
  | { kind: 'word'; node: Text; start: number; end: number }
  | { kind: 'chip'; node: HTMLElement }
  | { kind: 'caret'; node: Node; offset: number };

interface Indicator {
  kind: 'word' | 'chip' | 'caret';
  left: number;
  top: number;
  width: number;
  height: number;
}

function caretFromPoint(x: number, y: number): { node: Node; offset: number } | null {
  const doc = document as Document & {
    caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
    caretRangeFromPoint?: (x: number, y: number) => Range | null;
  };
  if (doc.caretPositionFromPoint) {
    const p = doc.caretPositionFromPoint(x, y);
    return p ? { node: p.offsetNode, offset: p.offset } : null;
  }
  if (doc.caretRangeFromPoint) {
    const r = doc.caretRangeFromPoint(x, y);
    return r ? { node: r.startContainer, offset: r.startOffset } : null;
  }
  return null;
}

function isChip(n: Node | null | undefined): boolean {
  return !!n && n instanceof HTMLElement && n.classList.contains('chip');
}

/** Character just before (-1) or after (+1) a collapsed range; 'x' stands for an atomic object-word. */
function charAround(node: Node, offset: number, dir: -1 | 1): string | null {
  const sibChar = (n: Node | null): string | null => {
    let cur = n;
    while (cur) {
      if (cur.nodeType === Node.TEXT_NODE) {
        const t = cur.textContent ?? '';
        if (t.length > 0) return dir < 0 ? t[t.length - 1] : t[0];
      } else if (cur instanceof HTMLElement) {
        if (cur.tagName === 'BR') return '\n';
        return 'x';
      }
      cur = dir < 0 ? cur.previousSibling : cur.nextSibling;
    }
    return null;
  };
  if (node.nodeType === Node.TEXT_NODE) {
    const t = node.textContent ?? '';
    if (dir < 0 && offset > 0) return t[offset - 1];
    if (dir > 0 && offset < t.length) return t[offset];
    return sibChar(dir < 0 ? node.previousSibling : node.nextSibling);
  }
  return sibChar(dir < 0 ? node.childNodes[offset - 1] ?? null : node.childNodes[offset] ?? null);
}

/** Serializes the editor content into words and object-words. */
export function readParts(root: HTMLElement): PromptPart[] {
  const raw: PromptPart[] = [];
  const walk = (node: Node) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        raw.push({ type: 'text', text: (child.textContent ?? '').replace(/ /g, ' ') });
      } else if (child instanceof HTMLElement) {
        if (isChip(child)) {
          const ref = refFromChip(child);
          if (ref) raw.push({ type: 'object', ref });
        } else if (child.tagName === 'BR') {
          raw.push({ type: 'text', text: '\n' });
        } else {
          if (child.tagName === 'DIV' || child.tagName === 'P') raw.push({ type: 'text', text: '\n' });
          walk(child);
        }
      }
    });
  };
  walk(root);
  const merged: PromptPart[] = [];
  for (const p of raw) {
    const last = merged[merged.length - 1];
    if (p.type === 'text' && last && last.type === 'text') last.text += p.text;
    else merged.push(p.type === 'text' ? { ...p } : p);
  }
  if (merged[0]?.type === 'text') merged[0] = { type: 'text', text: merged[0].text.replace(/^\s+/, '') };
  const l = merged.length - 1;
  if (l >= 0 && merged[l].type === 'text') merged[l] = { type: 'text', text: (merged[l] as { text: string }).text.replace(/\s+$/, '') };
  return merged.filter((p) => p.type === 'object' || p.text.length > 0);
}

export function partsAreEmpty(parts: PromptPart[]): boolean {
  return !parts.some((p) => p.type === 'object' || p.text.trim().length > 0);
}

const PromptField = forwardRef<PromptFieldHandle, Props>(function PromptField(
  { generating, status, error, selectionCount, onSubmit, onStop, onClearSelection, onHoverRef },
  ref,
) {
  const wrapper = useRef<HTMLDivElement>(null);
  const editor = useRef<HTMLDivElement>(null);
  const spec = useRef<DropSpec | null>(null);
  const [indicator, setIndicator] = useState<Indicator | null>(null);
  const [empty, setEmpty] = useState(true);

  const syncEmpty = useCallback(() => {
    const ed = editor.current;
    if (!ed) return;
    setEmpty((ed.textContent ?? '').trim() === '' && !ed.querySelector('.chip'));
  }, []);

  const placeCaretAfter = (node: Node) => {
    const sel = window.getSelection();
    if (!sel) return;
    const r = document.createRange();
    r.setStartAfter(node);
    r.collapse(true);
    sel.removeAllRanges();
    sel.addRange(r);
  };

  /** Inserts words/object-words at a collapsed range, adding spaces so that object-words behave like single words. */
  const insertPartsAt = useCallback(
    (range: Range, parts: PromptPart[]) => {
      const ed = editor.current;
      if (!ed) return;
      const before = charAround(range.startContainer, range.startOffset, -1);
      const after = charAround(range.startContainer, range.startOffset, 1);
      const frag = document.createDocumentFragment();
      const first = parts[0];
      if (before !== null && !/\s/.test(before) && !(first?.type === 'text' && /^\s/.test(first.text))) frag.append(' ');
      let lastNode: Node | null = null;
      for (const p of parts) {
        const n: Node = p.type === 'text' ? document.createTextNode(p.text) : createChipElement(p.ref);
        frag.append(n);
        lastNode = n;
      }
      const last = parts[parts.length - 1];
      if (!(last?.type === 'text' && /\s$/.test(last.text)) && (after === null || !/\s/.test(after))) {
        const sp = document.createTextNode(' ');
        frag.append(sp);
        lastNode = sp;
      }
      range.insertNode(frag);
      ed.focus();
      if (lastNode) placeCaretAfter(lastNode);
      syncEmpty();
    },
    [syncEmpty],
  );

  /** Makes sure the caret is inside the editor (the selection may point at nodes removed by `clear`). */
  const ensureCaret = useCallback(() => {
    const ed = editor.current;
    const sel = window.getSelection();
    if (!ed || !sel) return;
    if (sel.rangeCount > 0 && ed.contains(sel.anchorNode) && sel.anchorNode?.isConnected) return;
    const r = document.createRange();
    r.selectNodeContents(ed);
    r.collapse(false);
    sel.removeAllRanges();
    sel.addRange(r);
  }, []);

  // Interactions on the output can move the document selection out of the focused editor
  // (e.g. a click on the rendered SVG); bring the caret back so typing goes to the prompt.
  useEffect(() => {
    const onSelectionChange = () => {
      const ed = editor.current;
      if (!ed || document.activeElement !== ed) return;
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || !ed.contains(sel.anchorNode)) ensureCaret();
    };
    document.addEventListener('selectionchange', onSelectionChange);
    return () => document.removeEventListener('selectionchange', onSelectionChange);
  }, [ensureCaret]);

  const clearIndicator = () => {
    spec.current = null;
    setIndicator(null);
  };

  useImperativeHandle(
    ref,
    () => ({
      dragOver: (x, y) => {
        const ed = editor.current;
        const wrap = wrapper.current;
        if (!ed || !wrap) return false;
        const wrect = wrap.getBoundingClientRect();
        const over = x >= wrect.left && x <= wrect.right && y >= wrect.top && y <= wrect.bottom;
        if (!over) {
          clearIndicator();
          return false;
        }
        let pos = caretFromPoint(x, y);
        if (!pos || !ed.contains(pos.node)) pos = { node: ed, offset: ed.childNodes.length };
        // Dropping onto an existing object-word replaces it, like dropping onto a typed word.
        const hovered = document.elementFromPoint(x, y);
        const chip =
          (hovered instanceof Element ? hovered.closest('.chip') : null) ??
          (pos.node instanceof Element ? pos.node : pos.node.parentElement)?.closest('.chip') ??
          null;
        let next: DropSpec | null = chip instanceof HTMLElement && ed.contains(chip) ? { kind: 'chip', node: chip } : null;
        if (next === null) next = { kind: 'caret', node: pos.node, offset: pos.offset };
        if (next.kind === 'caret' && pos.node.nodeType === Node.TEXT_NODE) {
          const t = pos.node.textContent ?? '';
          const o = pos.offset;
          const isW = (c: string | undefined) => c !== undefined && /\S/.test(c);
          if (o > 0 && o < t.length && isW(t[o - 1]) && isW(t[o])) {
            let s = o;
            let e = o;
            while (s > 0 && isW(t[s - 1])) s--;
            while (e < t.length && isW(t[e])) e++;
            next = { kind: 'word', node: pos.node as Text, start: s, end: e };
          }
        }
        spec.current = next;
        let rect: DOMRect;
        const r = document.createRange();
        if (next.kind === 'chip') {
          rect = next.node.getBoundingClientRect();
        } else if (next.kind === 'word') {
          r.setStart(next.node, next.start);
          r.setEnd(next.node, next.end);
          rect = (r.getClientRects()[0] ?? r.getBoundingClientRect()) as DOMRect;
        } else {
          r.setStart(next.node, next.offset);
          r.collapse(true);
          rect = (r.getClientRects()[0] ?? r.getBoundingClientRect()) as DOMRect;
        }
        if (next.kind === 'caret' && rect.width === 0 && rect.height === 0) {
          const prev = next.node.childNodes[next.offset - 1];
          const nxt = next.node.childNodes[next.offset];
          const anchor = prev instanceof Element ? prev : nxt instanceof Element ? nxt : null;
          if (anchor) {
            const ar = anchor.getBoundingClientRect();
            rect = new DOMRect(prev instanceof Element ? ar.right : ar.left, ar.top, 0, ar.height);
          } else {
            const er = ed.getBoundingClientRect();
            rect = new DOMRect(er.left + 12, er.top + 8, 0, er.height - 16);
          }
        }
        setIndicator({
          kind: next.kind,
          left: rect.left - wrect.left,
          top: rect.top - wrect.top,
          width: next.kind === 'caret' ? 2 : rect.width,
          height: rect.height || 20,
        });
        return true;
      },
      drop: (refs) => {
        const s = spec.current;
        const ed = editor.current;
        if (!s || !ed) return;
        const range = document.createRange();
        if (s.kind === 'chip') {
          range.setStartBefore(s.node);
          range.setEndAfter(s.node);
          range.deleteContents();
        } else if (s.kind === 'word') {
          range.setStart(s.node, s.start);
          range.setEnd(s.node, s.end);
          range.deleteContents();
        } else {
          range.setStart(s.node, s.offset);
          range.collapse(true);
        }
        const parts: PromptPart[] = [];
        refs.forEach((r, i) => {
          if (i > 0) parts.push({ type: 'text', text: ' ' });
          parts.push({ type: 'object', ref: r });
        });
        insertPartsAt(range, parts);
        clearIndicator();
      },
      dragEnd: () => clearIndicator(),
      refreshRefs: (content) => {
        const ed = editor.current;
        if (!ed) return;
        ed.querySelectorAll('.chip').forEach((node) => {
          const chip = node as HTMLElement;
          const ref = refFromChip(chip);
          if (!ref) return;
          let fresh: ObjectRef | null = ref;
          if (ref.type === 'element') fresh = content?.kind === 'svg' ? refreshElementRef(ref) : null;
          else if (ref.type === 'text') fresh = content && content.kind !== 'svg' && content.value.includes(ref.text) ? ref : null;
          if (!fresh) {
            chip.classList.add('broken');
            chip.title = 'This object is no longer in the content';
            return;
          }
          chip.classList.remove('broken');
          chip.removeAttribute('title');
          if (fresh !== ref) {
            chip.dataset.ref = JSON.stringify(fresh);
            chip.innerHTML = chipInnerHTML(fresh);
          }
        });
      },
      clear: () => {
        if (editor.current) editor.current.innerHTML = '';
        setEmpty(true);
        if (document.activeElement === editor.current) ensureCaret();
      },
      focus: () => {
        editor.current?.focus();
        ensureCaret();
      },
    }),
    [insertPartsAt, ensureCaret],
  );

  const submit = useCallback(() => {
    const ed = editor.current;
    if (!ed || generating) return;
    const parts = readParts(ed);
    if (partsAreEmpty(parts)) return;
    onSubmit(parts);
  }, [generating, onSubmit]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submit();
        return;
      }
      if (e.key === 'Backspace' || e.key === 'Delete') {
        const sel = window.getSelection();
        if (!sel || !sel.isCollapsed || sel.rangeCount === 0) return;
        const r = sel.getRangeAt(0);
        const dir = e.key === 'Backspace' ? -1 : 1;
        let node: Node | null = null;
        if (r.startContainer.nodeType === Node.TEXT_NODE) {
          const t = r.startContainer.textContent ?? '';
          if (dir < 0 && r.startOffset === 0) node = r.startContainer.previousSibling;
          if (dir > 0 && r.startOffset === t.length) node = r.startContainer.nextSibling;
        } else {
          node = dir < 0 ? r.startContainer.childNodes[r.startOffset - 1] ?? null : r.startContainer.childNodes[r.startOffset] ?? null;
        }
        if (node && isChip(node)) {
          e.preventDefault();
          const parent = node.parentNode;
          const prev = node.previousSibling;
          (node as ChildNode).remove();
          if (parent && prev) placeCaretAfter(prev);
          syncEmpty();
        }
      }
    },
    [submit, syncEmpty],
  );

  /** Object-words are copied as markup so they can be pasted back as references, "like single words". */
  const onCopy = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>, cut: boolean) => {
      const sel = window.getSelection();
      const ed = editor.current;
      if (!ed || !sel || sel.rangeCount === 0 || sel.isCollapsed) return;
      const range = sel.getRangeAt(0);
      if (!ed.contains(range.commonAncestorContainer)) return;
      const frag = range.cloneContents();
      const holder = document.createElement('div');
      holder.append(frag);
      if (!holder.querySelector('.chip')) return; // plain text: let the browser handle it
      e.preventDefault();
      e.clipboardData.setData('text/html', holder.innerHTML);
      e.clipboardData.setData('text/plain', readParts(holder).map((p) => (p.type === 'text' ? p.text : refLabel(p.ref))).join(''));
      if (cut) {
        range.deleteContents();
        syncEmpty();
      }
    },
    [syncEmpty],
  );

  const onPaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      e.preventDefault();
      const html = e.clipboardData.getData('text/html');
      const text = e.clipboardData.getData('text/plain');
      let parts: PromptPart[] = [{ type: 'text', text }];
      if (html && html.includes('data-ref=')) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const p = readParts(doc.body);
        if (p.length > 0) parts = p;
      }
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || !editor.current) return;
      const range = sel.getRangeAt(0);
      if (!editor.current.contains(range.commonAncestorContainer)) return;
      range.deleteContents();
      insertPartsAt(range, parts);
    },
    [insertPartsAt],
  );

  const onMouseOver = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const chip = (e.target as Element).closest?.('.chip');
      onHoverRef(chip ? refFromChip(chip) : null);
    },
    [onHoverRef],
  );

  return (
    <div className="prompt-area">
      <div className={`prompt-box ${indicator ? 'drop-hover' : ''}`} ref={wrapper}>
        <div
          className="prompt-editor"
          ref={editor}
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
          data-placeholder="Type your prompt here."
          data-empty={empty ? 'true' : 'false'}
          onInput={syncEmpty}
          onFocus={ensureCaret}
          onKeyDown={onKeyDown}
          onCopy={(e) => onCopy(e, false)}
          onCut={(e) => onCopy(e, true)}
          onPaste={onPaste}
          onMouseOver={onMouseOver}
          onMouseLeave={() => onHoverRef(null)}
        />
        {indicator && (
          <div
            className={`drop-indicator ${indicator.kind}`}
            style={{ left: indicator.left, top: indicator.top, width: indicator.width, height: indicator.height }}
          />
        )}
        {generating ? (
          <button className="send stop" onClick={onStop} title="Stop generation" type="button">
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
              <rect x="3" y="3" width="10" height="10" rx="1.5" fill="currentColor" />
            </svg>
          </button>
        ) : (
          <button className="send" onClick={submit} disabled={empty} title="Execute prompt (Enter)" type="button">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M3 11.5 21 3l-8.5 18-2.5-7.5L3 11.5z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
      <div className="prompt-status">
        {error ? <div className="gen-status is-error">{error}</div> : <div className="gen-status">{status ?? ''}</div>}
        {selectionCount > 0 && (
          <div className="apply-chip">
            <button type="button" onClick={onClearSelection} title="Clear selection (Esc)">
              ✕
            </button>
            <span>
              | Apply to {selectionCount} selected element{selectionCount > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

export default PromptField;
