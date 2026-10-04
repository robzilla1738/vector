import { useCallback, useEffect, useMemo, useRef } from "react";
import { bridge, inNativeHost } from "../bridge";
import { executeCommand } from "../commands";
import { errToast } from "../store";
import { reportCommandCompletionFailure } from "../command-completion";
import { registerScopedControl } from "../scoped-control-commands";
import { useSettingsStatusOwner } from "../settings/sections/use-settings-status-owner";

/** Registers Aux as the http/https handler; reports the measured OS state. */
export function DefaultBrowserSetting() {
  const privateMode = bridge.privateMode,
    windowId = bridge.windowId;
  const identity = useMemo(() => ([privateMode, windowId]), [privateMode, windowId]);
  const admitted = useCallback(() => inNativeHost && !bridge.privateMode, []);
  const [getOwner, current, isDefault, busy, error, measure, perform, fail] = useSettingsStatusOwner<boolean>(identity, windowId, privateMode, admitted);
  useEffect(() => {
    const original = getOwner();
    if (!current(original)) return;
    const read = () => {
      if (!current(original)) return;
      measure(original, () => bridge.defaultBrowser(), (state) => state.isDefault, true);
    };
    read();
    // The OS dialog completes outside this window — re-check on return.
    window.addEventListener("focus", read);
    return () => window.removeEventListener("focus", read);
  }, [getOwner, current, measure]);
  const change = useCallback(() => {
    const original = getOwner();
    if (!current(original) || original.pending || original.value !== false || isDefault !== false)
      throw new Error("Choose the current default browser control.");
    return perform(original, () => bridge.setDefaultBrowser(), (state, original) => {
      ++original.sequence;
      if (!state.isDefault)
        fail(original, "The system did not confirm the change. Check your default browser setting in System Settings.");
      return state.isDefault;
    });
  }, [getOwner, current, isDefault, perform, fail]);
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
