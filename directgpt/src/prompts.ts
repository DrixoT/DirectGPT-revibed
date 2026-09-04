import type { ChatMessage } from './openai';
import type { Content, ObjectRef, PromptPart, TextRef } from './types';

/**
 * Engineered prompts generated from physical actions (§3.3, Appendix A.1).
 *
 * - A.1.1 Localizing the effect of a prompt (text/code): the whole passage is sent with the
 *   selection replaced by "<blank>", and only the blank is rewritten.
 * - A.1.2 Referring to textual objects: the passage is copied with "0]...0]" style delimiters
 *   around the referred text, and object-words become "text delimited by 0]".
 * - A.1.3 Referring to vector objects: every SVG element carries a unique id and object-words
 *   become `element with id "c0"`.
 */

export interface BuiltPrompt {
  messages: ChatMessage[];
  /** 'replace-target': the answer replaces `target` in the current content. 'whole': the answer is the new content. */
  apply: 'replace-target' | 'whole';
  target?: TextRef;
}

/* System prompts used only where the paper does not print an engineered prompt (see DECISIONS.md). */
export const GENERATION_SYSTEM_PROMPT =
  'You are a helpful assistant. When asked to draw, create or generate an image, icon, diagram or drawing, reply with SVG code. When asked for code, reply with the code in a fenced code block.';

export function editSystemPrompt(kind: Content['kind']): string {
  if (kind === 'code') {
    return 'The user gives you code followed by an instruction. Reply with the complete modified code only, in a fenced code block, without explanation.';
  }
  return 'The user gives you a text followed by an instruction. Reply with the complete modified text only, without explanation.';
}

export function plainPromptText(parts: PromptPart[]): string {
  return parts
    .map((p) => (p.type === 'text' ? p.text : p.ref.type === 'text' ? p.ref.text : p.ref.type === 'location' ? `(${p.ref.x}, ${p.ref.y})` : p.ref.label))
    .join('')
    .trim();
}

function refsInParts(parts: PromptPart[]): ObjectRef[] {
  const out: ObjectRef[] = [];
  for (const p of parts) if (p.type === 'object') out.push(p.ref);
  return out;
}

/** Unique text refs in prompt order, so that the first dropped word is "0]", the second "1]", etc. (A.1.2). */
function indexTextRefs(parts: PromptPart[]): TextRef[] {
  const out: TextRef[] = [];
  for (const r of refsInParts(parts)) {
    if (r.type !== 'text') continue;
    if (!out.some((o) => o.start === r.start && o.end === r.end)) out.push(r);
  }
  return out;
}

function overlaps(a: { start: number; end: number }, b: { start: number; end: number }): boolean {
  return a.start < b.end && b.start < a.end;
}

/**
 * Copies the passage adding delimiters around referred text (A.1.2) and, optionally,
 * replacing the localized selection by "<blank>" (A.1.1).
 */
function annotatePassage(value: string, refs: TextRef[], blank: TextRef | null): string {
  type Edit = { pos: number; insert: string; remove: number; order: number };
  const edits: Edit[] = [];
  refs.forEach((r, i) => {
    if (blank && overlaps(r, blank)) return;
    edits.push({ pos: r.start, insert: `${i}]`, remove: 0, order: 1 });
    edits.push({ pos: r.end, insert: `${i}]`, remove: 0, order: 0 });
  });
  if (blank) edits.push({ pos: blank.start, insert: '<blank>', remove: blank.end - blank.start, order: 2 });
  // Apply from the end so that earlier offsets stay valid.
  edits.sort((a, b) => b.pos - a.pos || b.order - a.order);
  let out = value;
  for (const e of edits) out = out.slice(0, e.pos) + e.insert + out.slice(e.pos + e.remove);
  return out;
}

function textInstruction(parts: PromptPart[], indexed: TextRef[]): string {
  return parts
    .map((p) => {
      if (p.type === 'text') return p.text;
      const r = p.ref;
      if (r.type === 'text') {
        const i = indexed.findIndex((o) => o.start === r.start && o.end === r.end);
        return i >= 0 ? `text delimited by ${i}]` : r.text;
      }
      if (r.type === 'location') return `(${r.x}, ${r.y})`;
      return r.label;
    })
    .join('')
    .trim();
}

function svgPhrase(r: ObjectRef): string {
  if (r.type === 'element') return `element with id "${r.id}"`;
  if (r.type === 'location') return `location (${r.x}, ${r.y})`;
  return r.text;
}

function svgInstruction(parts: PromptPart[]): string {
  return parts.map((p) => (p.type === 'text' ? p.text : svgPhrase(p.ref))).join('').trim();
}

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
}

/**
 * Converts a prompt made of words, object-words and a selection into engineered prompts.
 * Several prompts are returned only for a localized text prompt with several selected
 * spans: each span is rewritten by its own A.1.1 prompt (one undoable operation overall).
 */
export function buildPrompts(content: Content | null, parts: PromptPart[], targets: ObjectRef[]): BuiltPrompt[] {
  if (!content) {
    return [
      {
        messages: [
          { role: 'system', content: GENERATION_SYSTEM_PROMPT },
          { role: 'user', content: plainPromptText(parts) },
        ],
        apply: 'whole',
      },
    ];
  }

  if (content.kind === 'svg') {
    const instruction = svgInstruction(parts);
    const targetPhrases = targets.filter((t) => t.type !== 'text').map(svgPhrase);
    let user = `${content.value}\n\nReturn modified SVG code to ${instruction}`;
    if (targetPhrases.length > 0) {
      user += `\nApply this only to ${joinList(targetPhrases)}. Keep everything else in the SVG identical.`;
    }
    return [{ messages: [{ role: 'user', content: user }], apply: 'whole' }];
  }

  // text and code
  const indexed = indexTextRefs(parts);
  const instruction = textInstruction(parts, indexed);
  const textTargets = targets.filter((t): t is TextRef => t.type === 'text');

  if (textTargets.length > 0) {
    // A.1.1 — one prompt per selected span.
    return textTargets.map((target) => {
      const passage = annotatePassage(content.value, indexed, target);
      const user = `${passage}\n\n<blank>: ${target.text}\n\nINSTRUCTION: ${instruction}\nRewrite <blank>. Follow INSTRUCTION\n\n<blank>:`;
      return { messages: [{ role: 'user', content: user }], apply: 'replace-target', target };
    });
  }

  if (indexed.length > 0) {
    // A.1.2
    const passage = annotatePassage(content.value, indexed, null);
    const user = `${passage}\n\n${instruction}\nKeep rest of the text identical`;
    return [{ messages: [{ role: 'user', content: user }], apply: 'whole' }];
  }

  // Global prompt: applies to the whole content, like ChatGPT (§3.2.2).
  return [
    {
      messages: [
        { role: 'system', content: editSystemPrompt(content.kind) },
        { role: 'user', content: `${content.value}\n\n${instruction}` },
      ],
      apply: 'whole',
    },
  ];
}
