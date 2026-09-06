import { useEffect, useState } from 'react';

/**
 * Class names for a brand mark that glitches once on entry and then resolves.
 *
 * The entry pass is a class the hook drops when the animation is over, so the
 * `:hover` / `:focus-visible` rule can restart it later without the mark
 * re-firing every time the pointer leaves. See the `.glitch` block in
 * `styles.css` for why the effect is bounded rather than ambient.
 */
export function useGlitchIn(): string {
  const [entering, setEntering] = useState(true);
  useEffect(() => {
    const id = window.setTimeout(() => setEntering(false), 700);
    return () => window.clearTimeout(id);
  }, []);
  return entering ? 'glitch glitch-in' : 'glitch';
}
