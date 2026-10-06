import { errorMessage } from "../../error-message";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { bridge } from "../../bridge";
import { guardCommandCompletion } from "../../command-completion";
type Owner<T> = { active: boolean; identity: object; pending: boolean; sequence: number; value: T | null };
/** Measured Settings status only; callers retain admission, OS readiness and original producers. */
export function useSettingsStatusOwner<T>(
  identity: object,
  windowId: string,
  privateMode: boolean,
  admitted?: () => boolean,
) {
  const lifetime = useRef<Owner<T>>({ active: false, identity, pending: false, sequence: 0, value: null });
  useLayoutEffect(() => {
    const original: Owner<T> = { active: true, identity, pending: false, sequence: 0, value: null };
    lifetime.current = original;
    return () => {
      original.active = false;
    };
  }, [identity]);
  const current = useCallback(
    (original: Owner<T>) =>
      original.active &&
      original === lifetime.current &&
      original.identity === identity &&
      bridge.windowId === windowId &&
      bridge.privateMode === privateMode &&
      (!admitted || admitted()),
    [identity, windowId, privateMode, admitted],
  );
  const getOwner = useCallback(() => lifetime.current, []);
  const [measured, setMeasured] = useState<{ owner: Owner<T>; value: T } | null>(null);
  const [failure, setFailure] = useState<{ owner: Owner<T>; message: string } | null>(null);
  const [busyOwner, setBusyOwner] = useState<Owner<T> | null>(null);
  const value = measured?.owner.active && measured.owner.identity === identity ? measured.value : null;
  const error = failure?.owner.active && failure.owner.identity === identity ? failure.message : "";
  const busy = !!busyOwner && busyOwner.active && busyOwner.identity === identity;
  const accept = useCallback((original: Owner<T>, next: T) => {
    original.value = next;
    setMeasured({ owner: original, value: next });
  }, []);
  const fail = useCallback(
    (original: Owner<T>, message: string) => setFailure({ owner: original, message }),
    [],
  );
  const read = useCallback(
    <R>(original: Owner<T>, producer: () => Promise<R>, decode: (result: R) => T, reset = false) => {
      const sequence = ++original.sequence;
      if (reset) {
        original.value = null;
        setMeasured(null);
      }
      void (async () => {
        try {
          const result = await producer();
          if (current(original) && sequence === original.sequence) {
            accept(original, decode(result));
            if (reset) setFailure(null);
          }
        } catch (reason) {
          if (current(original) && sequence === original.sequence) fail(original, errorMessage(reason));
        }
      })();
    },
    [current, accept, fail],
  );
  const change = useCallback(
    <R>(original: Owner<T>, producer: () => Promise<R>, receive: (result: R, original: Owner<T>) => T) => {
      original.pending = true;
      ++original.sequence;
      setBusyOwner(original);
      setFailure(null);
      const completion = (async () => {
        try {
          const result = await producer();
          if (current(original)) accept(original, receive(result, original));
          return result;
        } catch (reason) {
          if (current(original)) fail(original, errorMessage(reason));
          throw reason;
        } finally {
          original.pending = false;
          setBusyOwner((value) => (value === original ? null : value));
        }
      })();
      return guardCommandCompletion(completion, () => current(original));
    },
    [current, accept, fail],
  );
  return [getOwner, current, value, busy, error, read, change, fail] as const;
}
