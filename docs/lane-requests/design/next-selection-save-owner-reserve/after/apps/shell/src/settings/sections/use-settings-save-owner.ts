import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { bridge } from "../../bridge";
import { guardCommandCompletion } from "../../command-completion";
export type SettingsSaveOwner = { active: boolean; identity: object; pending: boolean };
/** Shared local save delivery; callers retain every original validation and native argument. */
export function useSettingsSaveOwner(identity: object, windowId: string, privateMode: boolean, admitted?: () => boolean, retireOnMismatch = false) {
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
  const current = useCallback((original: SettingsSaveOwner = owner.current) => {
    if (!original.active || owner.current !== original || original.identity !== identity) return false;
    if (bridge.windowId !== windowId || bridge.privateMode !== privateMode || (admitted && !admitted())) {
      if (retireOnMismatch) owner.current.active = false;
      return false;
    }
    return true;
  }, [identity, windowId, privateMode, admitted, retireOnMismatch]);
  const getOwner = useCallback(() => owner.current, []);
  const busy = !!busyOwner && busyOwner.active && busyOwner.identity === identity;
  const error = failure?.owner.active && failure.owner.identity === identity ? failure.message : "";
  const fail = useCallback(
    (original: SettingsSaveOwner, message: string) => setFailure({ owner: original, message }),
    [],
  );
  const clearFailure = useCallback(() => setFailure(null), []);
  const perform = useCallback(
    <D, R>(
      original: SettingsSaveOwner,
      savedDraft: D,
      draftRef: RefObject<D>,
      work: (present: () => boolean) => Promise<R>,
      saved: () => void,
      message: string,
      policy?: { accepted: (ack: R) => boolean; rejected: (reason: unknown) => string },
    ) => {
      original.pending = true;
      setBusyOwner(original);
      clearFailure();
      const delivering = () => current(original) && draftRef.current === savedDraft;
      const completion = (async () => {
        try {
          const ack = await work(delivering);
          if (delivering()) {
            if (!(policy ? policy.accepted(ack) : !!ack)) fail(original, message);
            else saved();
          }
          return ack;
        } catch (reason) {
          if (delivering()) fail(original, policy ? policy.rejected(reason) : message);
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
