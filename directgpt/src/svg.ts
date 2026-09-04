import type { ElementRef } from './types';

const NON_SELECTABLE = new Set([
  'svg',
  'defs',
  'lineargradient',
  'radialgradient',
  'stop',
  'style',
  'title',
  'desc',
  'metadata',
  'clippath',
  'mask',
  'pattern',
  'filter',
  'marker',
  'symbol',
  'script',
]);

export function parseSvg(svg: string): SVGSVGElement | null {
  const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
  const err = doc.querySelector('parsererror');
  if (!err && doc.documentElement instanceof SVGSVGElement) return doc.documentElement;
  // Lenient fallback for slightly malformed markup.
  const html = new DOMParser().parseFromString(svg, 'text/html');
  const root = html.querySelector('svg');
  return root instanceof SVGSVGElement ? root : null;
}

/**
 * "DirectGPT makes sure all elements have a unique id. If not, or if the id is not unique,
 * the ids are modified." (Appendix A.1.3). Also strips scripts and event handlers.
 */
export function normalizeSvg(svg: string): string {
  const root = parseSvg(svg);
  if (!root) return svg;
  root.querySelectorAll('script, foreignObject').forEach((n) => n.remove());
  if (!root.getAttribute('xmlns')) root.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  const used = new Set<string>();
  const all = Array.from(root.querySelectorAll('*'));
  for (const el of all) {
    for (const attr of Array.from(el.attributes)) {
      if (/^on/i.test(attr.name)) el.removeAttribute(attr.name);
    }
  }
  for (const el of all) {
    const id = el.getAttribute('id');
    if (id && !used.has(id)) used.add(id);
  }
  let counter = 0;
  const seen = new Set<string>();
  for (const el of all) {
    const id = el.getAttribute('id');
    if (id && !seen.has(id)) {
      seen.add(id);
      continue;
    }
    let candidate = `c${counter++}`;
    while (used.has(candidate) || seen.has(candidate)) candidate = `c${counter++}`;
    el.setAttribute('id', candidate);
    seen.add(candidate);
  }
  return new XMLSerializer().serializeToString(root);
}

export function isSelectableSvgElement(el: Element | null): el is SVGGraphicsElement {
  if (!el || !(el instanceof SVGElement)) return false;
  if (NON_SELECTABLE.has(el.tagName.toLowerCase())) return false;
  if (el.closest('defs, clipPath, mask, pattern, marker, symbol')) return false;
  return true;
}

/** Thumbnail of an element, used to render its object-word (§3.2.2, fig. 3). */
export function elementThumb(svg: SVGSVGElement, el: SVGGraphicsElement): string {
  let b = { x: 0, y: 0, width: 10, height: 10 };
  try {
    const bb = el.getBBox();
    b = { x: bb.x, y: bb.y, width: bb.width, height: bb.height };
  } catch {
    /* not rendered */
  }
  const cs = getComputedStyle(el);
  const sw = parseFloat(cs.strokeWidth) || 0;
  const pad = Math.max(sw, Math.max(b.width, b.height) * 0.08, 1);
  const x = b.x - pad;
  const y = b.y - pad;
  const w = Math.max(b.width + 2 * pad, 1);
  const h = Math.max(b.height + 2 * pad, 1);
  const clone = el.cloneNode(true) as Element;
  clone.removeAttribute('id');
  clone.removeAttribute('transform');
  clone.removeAttribute('class');
  clone.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
  const inherit: Array<[string, string]> = [
    ['fill', 'fill'],
    ['stroke', 'stroke'],
    ['stroke-width', 'stroke-width'],
    ['opacity', 'opacity'],
    ['fill-opacity', 'fill-opacity'],
    ['stroke-opacity', 'stroke-opacity'],
  ];
  for (const [prop, attr] of inherit) {
    if (!clone.hasAttribute(attr)) {
      const v = cs.getPropertyValue(prop);
      if (v) clone.setAttribute(attr, v);
    }
  }
  const defs = Array.from(svg.querySelectorAll('defs'))
    .map((d) => new XMLSerializer().serializeToString(d))
    .join('');
  const body = new XMLSerializer().serializeToString(clone);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" width="18" height="18" preserveAspectRatio="xMidYMid meet">${defs}${body}</svg>`;
}

export function makeElementRef(svg: SVGSVGElement, el: SVGGraphicsElement): ElementRef {
  return { type: 'element', id: el.getAttribute('id') ?? '', thumb: elementThumb(svg, el), label: el.tagName.toLowerCase() };
}

/** Ids of elements that are new or whose markup changed between two SVGs. */
export function changedSvgIds(prev: string | null, next: string): string[] {
  const nextRoot = parseSvg(next);
  if (!nextRoot) return [];
  const prevRoot = prev ? parseSvg(prev) : null;
  const prevMap = new Map<string, string>();
  if (prevRoot) {
    prevRoot.querySelectorAll('[id]').forEach((el) => prevMap.set(el.getAttribute('id') ?? '', el.outerHTML.replace(/\s+/g, ' ')));
  }
  const out: string[] = [];
  nextRoot.querySelectorAll('[id]').forEach((el) => {
    if (!isSelectableSvgElement(el)) return;
    const id = el.getAttribute('id') ?? '';
    const html = el.outerHTML.replace(/\s+/g, ' ');
    if (prevMap.get(id) !== html) out.push(id);
  });
  return out;
}

/** Converts a client point into SVG user coordinates. */
export function clientToSvg(svg: SVGSVGElement, clientX: number, clientY: number): { x: number; y: number } | null {
  const ctm = svg.getScreenCTM();
  if (!ctm) return null;
  const pt = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
  return { x: Math.round(pt.x), y: Math.round(pt.y) };
}

export function svgToClient(svg: SVGSVGElement, x: number, y: number): { x: number; y: number } | null {
  const ctm = svg.getScreenCTM();
  if (!ctm) return null;
  const pt = new DOMPoint(x, y).matrixTransform(ctm);
  return { x: pt.x, y: pt.y };
}
