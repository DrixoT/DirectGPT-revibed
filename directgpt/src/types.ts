/** Representation kinds supported by DirectGPT (§3.3: "all text-based representations such as text and code" + SVG images). */
export type Kind = 'text' | 'code' | 'svg';

/** The object of interest, continuously represented at a fixed position (§3.2.1). */
export interface Content {
  kind: Kind;
  value: string;
  /** Prism.js language id for code. */
  language?: string;
}

/** A span of the text/code representation (offsets into Content.value). */
export interface TextRef {
  type: 'text';
  start: number;
  end: number;
  text: string;
}

/** An element of the rendered SVG, identified by its unique id (Appendix A.1.3). */
export interface ElementRef {
  type: 'element';
  id: string;
  /** Standalone SVG markup used as the thumbnail of the object-word. */
  thumb: string;
  label: string;
}

/** A pixel location in SVG user coordinates (fig. 3a). */
export interface LocationRef {
  type: 'location';
  x: number;
  y: number;
}

export type ObjectRef = TextRef | ElementRef | LocationRef;

/** A prompt is a sequence of typed words and dropped object-words (§3.2.2). */
export type PromptPart = { type: 'text'; text: string } | { type: 'object'; ref: ObjectRef };

/** A prompt abstracted into a tool: object-words become slots shown as "?" (§3.2.3). */
export type TemplatePart = { type: 'text'; text: string } | { type: 'slot' };

export interface Tool {
  id: string;
  template: TemplatePart[];
  slots: number;
  signature: string;
}

export interface ActiveTool {
  id: string;
  filled: ObjectRef[];
}

export interface Range {
  start: number;
  end: number;
}

export interface Settings {
  apiKey: string;
  model: string;
}

export function sameRef(a: ObjectRef, b: ObjectRef): boolean {
  if (a.type !== b.type) return false;
  if (a.type === 'text' && b.type === 'text') return a.start === b.start && a.end === b.end;
  if (a.type === 'element' && b.type === 'element') return a.id === b.id;
  if (a.type === 'location' && b.type === 'location') return a.x === b.x && a.y === b.y;
  return false;
}

export function refLabel(ref: ObjectRef): string {
  switch (ref.type) {
    case 'text':
      return ref.text;
    case 'element':
      return ref.label;
    case 'location':
      return `(${ref.x}, ${ref.y})`;
  }
}
