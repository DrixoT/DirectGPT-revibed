import { useCallback, useState } from 'react';

/** Linear undo/redo history (§3.2.5): one entry per user-level operation. */
export function useHistory<T>(initial: T) {
  const [state, setState] = useState<{ stack: T[]; index: number }>({ stack: [initial], index: 0 });

  const push = useCallback((value: T) => {
    setState((s) => {
      const stack = s.stack.slice(0, s.index + 1);
      stack.push(value);
      return { stack, index: stack.length - 1 };
    });
  }, []);

  const undo = useCallback(() => {
    setState((s) => (s.index > 0 ? { ...s, index: s.index - 1 } : s));
  }, []);

  const redo = useCallback(() => {
    setState((s) => (s.index < s.stack.length - 1 ? { ...s, index: s.index + 1 } : s));
  }, []);

  const reset = useCallback((value: T) => {
    setState({ stack: [value], index: 0 });
  }, []);

  return {
    current: state.stack[state.index],
    push,
    undo,
    redo,
    reset,
    canUndo: state.index > 0,
    canRedo: state.index < state.stack.length - 1,
  };
}
