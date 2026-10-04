import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { bridge, inNativeHost } from "../bridge";
import { executeCommand } from "../commands";
import { errToast } from "../store";
import { guardCommandCompletion, reportCommandCompletionFailure } from "../command-completion";
import { registerScopedControl } from "../scoped-control-commands";

type Owner = {
  active: boolean;
  pending: boolean;
  readSequence: number;
  measuredDefault: boolean | null;
  identity: object;
};
/** Registers Aux as the http/https handler; reports the measured OS state. */
export function DefaultBrowserSetting() {
  const privateMode = bridge.privateMode,
    windowId = bridge.windowId;
  const identity = useMemo(() => ({ privateMode, windowId }), [privateMode, windowId]);
  const lifetime = useRef<Owner>({
    active: false,
    pending: false,
    readSequence: 0,
    measuredDefault: null,
    identity,
  });
  useLayoutEffect(() => {
    const owner = { active: true, pending: false, readSequence: 0, measuredDefault: null, identity };
    lifetime.current = owner;
    return () => {
      owner.active = false;
    };
  }, [identity]);
  const [measured, setMeasured] = useState<{ owner: Owner; isDefault: boolean } | null>(null);
  const [failure, setFailure] = useState<{ owner: Owner; message: string } | null>(null);
  const [busyOwner, setBusyOwner] = useState<Owner | null>(null);
  const isDefault =
    measured?.owner.active && measured.owner.identity === identity ? measured.isDefault : null;
  const error = failure?.owner.active && failure.owner.identity === identity ? failure.message : "";
  const busy = !!busyOwner && busyOwner.active && busyOwner.identity === identity;
  const current = useCallback(
    (original: Owner) =>
      original.active &&
      original === lifetime.current &&
      original.identity === identity &&
      inNativeHost &&
      !bridge.privateMode &&
      bridge.windowId === windowId,
    [identity, windowId],
  );
  useEffect(() => {
    const original = lifetime.current;
    if (!current(original)) return;
    const read = () => {
      if (!current(original)) return;
      const sequence = ++original.readSequence;
      original.measuredDefault = null;
      setMeasured(null);
      void bridge
        .defaultBrowser()
        .then((state) => {
          if (current(original) && sequence === original.readSequence) {
            original.measuredDefault = state.isDefault;
            setMeasured({ owner: original, isDefault: state.isDefault });
            setFailure(null);
          }
        })
        .catch((reason) => {
          if (current(original) && sequence === original.readSequence)
            setFailure({
              owner: original,
              message: reason instanceof Error ? reason.message : String(reason),
            });
        });
    };
    read();
    // The OS dialog completes outside this window — re-check on return.
    window.addEventListener("focus", read);
    return () => window.removeEventListener("focus", read);
  }, [current]);
  const change = useCallback(() => {
    const original = lifetime.current;
    if (!current(original) || original.pending || original.measuredDefault !== false || isDefault !== false)
      throw new Error("Choose the current default browser control.");
    original.pending = true;
    ++original.readSequence;
    setBusyOwner(original);
    setFailure(null);
    const completion = (async () => {
      try {
        const state = await bridge.setDefaultBrowser();
        if (current(original)) {
          ++original.readSequence;
          original.measuredDefault = state.isDefault;
          setMeasured({ owner: original, isDefault: state.isDefault });
          if (!state.isDefault)
            setFailure({
              owner: original,
              message:
                "The system did not confirm the change. Check your default browser setting in System Settings.",
            });
        }
        return state;
      } catch (reason) {
        if (current(original))
          setFailure({ owner: original, message: reason instanceof Error ? reason.message : String(reason) });
        throw reason;
      } finally {
        original.pending = false;
        setBusyOwner((value) => (value === original ? null : value));
      }
    })();
    return guardCommandCompletion(completion, () => current(original));
  }, [current, isDefault]);
  const unregister = useRef<(() => void) | undefined>(undefined);
  const controlRef = useCallback(
    (element: HTMLButtonElement | null) => {
      unregister.current?.();
      unregister.current = undefined;
      if (element)
        unregister.current = registerScopedControl(
          element,
          "set-default-browser",
          `${windowId}:default-browser`,
          change,
        );
    },
    [windowId, change],
  );
  if (!inNativeHost || privateMode) return null;
  return (
    <div className="row">
      {isDefault ? (
        <span className="hint ok">
          Aux is your default browser — links open here, in your most recently used profile.
        </span>
      ) : (
        <>
          <button
            ref={controlRef}
            className="btn sm"
            disabled={busy || isDefault === null}
            onClick={(event) => {
              const completion = executeCommand("set-default-browser", {
                nativeInputEvent: event.nativeEvent,
              });
              void completion.catch((reason) => reportCommandCompletionFailure(completion, reason, errToast));
            }}
          >
            {busy ? "Setting…" : "Make Aux the default browser"}
          </button>
          {isDefault === false && !error && (
            <span className="hint">Links from other apps currently open in a different browser.</span>
          )}
        </>
      )}
      {error && <span className="hint err">{error}</span>}
    </div>
  );
}
