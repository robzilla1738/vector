import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { bridge } from "../../bridge";
import { guardCommandCompletion } from "../../command-completion";
export type SettingsSaveOwner = { active: boolean; identity: object; pending: boolean };
/** Shared local save delivery; callers retain every original validation and native argument. */
export function useSettingsSaveOwner(identity: object, windowId: string, privateMode: boolean) {
  const owner = useRef<SettingsSaveOwner>({ active: false, identity, pending: false });
  useLayoutEffect(() => {
    const original = { active: true, identity, pending: false };
    owner.current = original;
    return () => {
      original.active = false;
    };
  }, [identity]);
  const [busyOwner, setBusyOwner] = useState<SettingsSaveOwner | null>(null);
  const [failure, setFailure] = useState<{ owner: SettingsSaveOwner; message: string } | null>(null);
  const current = useCallback(
    (original: SettingsSaveOwner) =>
      original.active &&
      owner.current === original &&
      original.identity === identity &&
      bridge.windowId === windowId &&
      bridge.privateMode === privateMode,
    [identity, windowId, privateMode],
  );
  const getOwner = useCallback(() => owner.current, []);
  const busy = !!busyOwner && busyOwner.active && busyOwner.identity === identity;
  const error = failure?.owner.active && failure.owner.identity === identity ? failure.message : "";
  const fail = useCallback(
    (original: SettingsSaveOwner, message: string) => setFailure({ owner: original, message }),
    [],
  );
  const clearFailure = useCallback(() => setFailure(null), []);
  const perform = useCallback(
    <D>(
      original: SettingsSaveOwner,
      savedDraft: D,
      draftRef: RefObject<D>,
      work: () => Promise<boolean>,
      saved: () => void,
      message: string,
    ) => {
      original.pending = true;
      setBusyOwner(original);
      clearFailure();
      const delivering = () => current(original) && draftRef.current === savedDraft;
      const completion = (async () => {
        try {
          const ack = await work();
          if (delivering()) {
            if (!ack) fail(original, message);
            else saved();
          }
          return ack;
        } catch (reason) {
          if (delivering()) fail(original, message);
          throw reason;
        } finally {
          original.pending = false;
          setBusyOwner((active) => (active === original ? null : active));
        }
      })();
      return guardCommandCompletion(completion, delivering);
    },
    [current, fail, clearFailure],
  );
  return [getOwner, current, busy, error, fail, clearFailure, perform] as const;
}
