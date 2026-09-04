/**
 * Distinguishes a click from the start of a drag: the drag starts once the pointer moved
 * more than a few pixels. Used to drag objects of the output into the prompt (§3.2.2).
 */
export function beginPotentialDrag(
  e: { clientX: number; clientY: number },
  opts: { onStart: (ev: PointerEvent) => void; onClick?: (ev: PointerEvent) => void; threshold?: number },
): void {
  const sx = e.clientX;
  const sy = e.clientY;
  const threshold = opts.threshold ?? 4;
  let started = false;
  const cleanup = () => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', up);
  };
  const move = (ev: PointerEvent) => {
    if (!started && Math.hypot(ev.clientX - sx, ev.clientY - sy) > threshold) {
      started = true;
      cleanup();
      opts.onStart(ev);
    }
  };
  const up = (ev: PointerEvent) => {
    cleanup();
    if (!started) opts.onClick?.(ev);
  };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
}
