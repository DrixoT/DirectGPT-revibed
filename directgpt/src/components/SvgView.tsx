import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type React from 'react';
import { beginPotentialDrag } from '../dnd';
import { clientToSvg, isSelectableSvgElement, makeElementRef, svgToClient } from '../svg';
import { sameRef } from '../types';
import type { ElementRef, LocationRef, ObjectRef } from '../types';

interface Props {
  value: string;
  selection: ObjectRef[];
  pulse: ObjectRef[];
  changed: string[];
  hover: ObjectRef | null;
  slotRefs: ObjectRef[];
  onSelectionComplete: (refs: Array<ElementRef | LocationRef>, additive: boolean) => void;
  onDragStart: (refs: Array<ElementRef | LocationRef>, ev: PointerEvent) => void;
}

interface Box {
  key: string;
  x: number;
  y: number;
  w: number;
  h: number;
  cls: string;
}

export default function SvgView({ value, selection, pulse, changed, hover, slotRefs, onSelectionComplete, onDragStart }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const [boxes, setBoxes] = useState<Box[]>([]);

  const computeBoxes = useCallback(() => {
    const c = container.current;
    const svg = host.current?.querySelector('svg');
    if (!c || !svg) {
      setBoxes([]);
      return;
    }
    const crect = c.getBoundingClientRect();
    const out: Box[] = [];
    const add = (ref: ObjectRef, cls: string, key: string) => {
      if (ref.type === 'element') {
        const el = svg.querySelector(`[id="${CSS.escape(ref.id)}"]`);
        if (!el) return;
        const r = el.getBoundingClientRect();
        out.push({ key, x: r.left - crect.left - 3, y: r.top - crect.top - 3, w: r.width + 6, h: r.height + 6, cls });
      } else if (ref.type === 'location') {
        const p = svgToClient(svg, ref.x, ref.y);
        if (!p) return;
        out.push({ key, x: p.x - crect.left - 5, y: p.y - crect.top - 5, w: 10, h: 10, cls: cls + ' loc' });
      }
    };
    selection.forEach((s, i) => add(s, 'sel', `sel-${i}`));
    slotRefs.forEach((s, i) => add(s, 'slot', `slot-${i}`));
    pulse.forEach((s, i) => add(s, 'pulse', `pulse-${i}`));
    changed.forEach((id, i) => add({ type: 'element', id, thumb: '', label: '' }, 'changed', `changed-${i}`));
    if (hover) add(hover, 'hover', 'hover');
    setBoxes(out);
  }, [selection, slotRefs, pulse, changed, hover]);

  // Pulse the SVG elements themselves (a looping fade-in-fade-out, §3.2.4).
  useLayoutEffect(() => {
    const svg = host.current?.querySelector('svg');
    if (!svg) return;
    svg.querySelectorAll('.dgpt-pulse').forEach((el) => el.classList.remove('dgpt-pulse'));
    for (const p of pulse) {
      if (p.type !== 'element') continue;
      svg.querySelector(`[id="${CSS.escape(p.id)}"]`)?.classList.add('dgpt-pulse');
    }
  }, [value, pulse]);

  useLayoutEffect(() => {
    computeBoxes();
    const c = container.current;
    if (!c) return;
    const ro = new ResizeObserver(() => computeBoxes());
    ro.observe(c);
    return () => ro.disconnect();
  }, [value, computeBoxes]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      const svg = host.current?.querySelector('svg');
      if (!svg) return;
      const target = e.target instanceof Element ? e.target : null;
      const additive = e.ctrlKey || e.metaKey;
      e.preventDefault();

      if (target && target !== svg && svg.contains(target) && isSelectableSvgElement(target)) {
        const ref = makeElementRef(svg, target);
        const alreadySelected = selection.some((s) => sameRef(s, ref));
        beginPotentialDrag(e, {
          onStart: (ev) => {
            const refs = alreadySelected ? selection.filter((s): s is ElementRef | LocationRef => s.type !== 'text') : [ref];
            onDragStart(refs, ev);
          },
          onClick: () => onSelectionComplete([ref], additive),
        });
        return;
      }

      const pt = clientToSvg(svg, e.clientX, e.clientY);
      if (!pt) return;
      const loc: LocationRef = { type: 'location', x: pt.x, y: pt.y };
      beginPotentialDrag(e, {
        onStart: (ev) => onDragStart([loc], ev),
        onClick: () => onSelectionComplete([loc], additive),
      });
    },
    [selection, onDragStart, onSelectionComplete],
  );

  return (
    <div className="svg-view" ref={container} onPointerDown={onPointerDown}>
      <div className="svg-host" ref={host} dangerouslySetInnerHTML={{ __html: value }} />
      <div className="svg-overlay">
        {boxes.map((b) => (
          <div key={b.key} className={`box ${b.cls}`} style={{ left: b.x, top: b.y, width: b.w, height: b.h }} />
        ))}
      </div>
    </div>
  );
}
