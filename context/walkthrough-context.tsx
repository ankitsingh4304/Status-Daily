import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { View } from 'react-native';

export type WalkRect = { x: number; y: number; width: number; height: number };
export type WalkStep = { id: string; title: string; text: string };

type WalkthroughContextValue = {
  registerTarget: (id: string, ref: React.RefObject<View | null>) => void;
  unregisterTarget: (id: string, ref: React.RefObject<View | null>) => void;
  measure: (id: string) => Promise<WalkRect | null>;
  active: boolean;
  step: WalkStep | null;
  index: number;
  total: number;
  isLast: boolean;
  start: (steps: WalkStep[]) => void;
  next: () => void;
  close: () => void;
};

const WalkthroughContext = createContext<WalkthroughContextValue | null>(null);

export function WalkthroughProvider({
  children,
  onFinish,
}: {
  children: React.ReactNode;
  onFinish?: () => void;
}) {
  const targets = useRef(new Map<string, React.RefObject<View | null>>());
  const [steps, setSteps] = useState<WalkStep[]>([]);
  const [index, setIndex] = useState(0);
  const [active, setActive] = useState(false);

  const registerTarget = useCallback((id: string, ref: React.RefObject<View | null>) => {
    targets.current.set(id, ref);
  }, []);

  // Only forget the target if the ref that's leaving is the one currently registered
  // (guards against a recycled component unmounting after a newer one registered).
  const unregisterTarget = useCallback((id: string, ref: React.RefObject<View | null>) => {
    if (targets.current.get(id) === ref) targets.current.delete(id);
  }, []);

  const measure = useCallback(
    (id: string) =>
      new Promise<WalkRect | null>((resolve) => {
        const node = targets.current.get(id)?.current;
        if (!node) return resolve(null);
        node.measureInWindow((x, y, width, height) =>
          resolve(width || height ? { x, y, width, height } : null)
        );
      }),
    []
  );

  const start = useCallback((s: WalkStep[]) => {
    if (s.length === 0) return;
    setSteps(s);
    setIndex(0);
    setActive(true);
  }, []);

  const finish = useCallback(() => {
    setActive(false);
    setSteps([]);
    setIndex(0);
    onFinish?.();
  }, [onFinish]);

  const next = useCallback(() => {
    setIndex((i) => {
      if (i + 1 >= steps.length) {
        finish();
        return 0;
      }
      return i + 1;
    });
  }, [steps.length, finish]);

  const value = useMemo<WalkthroughContextValue>(
    () => ({
      registerTarget,
      unregisterTarget,
      measure,
      active,
      step: active ? steps[index] ?? null : null,
      index,
      total: steps.length,
      isLast: index === steps.length - 1,
      start,
      next,
      close: finish,
    }),
    [registerTarget, unregisterTarget, measure, active, steps, index, start, next, finish]
  );

  return <WalkthroughContext.Provider value={value}>{children}</WalkthroughContext.Provider>;
}

export function useWalkthrough(): WalkthroughContextValue | null {
  return useContext(WalkthroughContext);
}

/** Returns a ref to attach to the element you want the tour to point at. Registration
 *  is gated by `enabled` so only the focused/visible instance owns a shared id. */
export function useWalkTarget(id: string, enabled = true) {
  const ctx = useContext(WalkthroughContext);
  const ref = useRef<View | null>(null);

  useEffect(() => {
    if (!ctx || !enabled) return;
    ctx.registerTarget(id, ref);
    return () => ctx.unregisterTarget(id, ref);
  }, [ctx, id, enabled]);

  return ref;
}
