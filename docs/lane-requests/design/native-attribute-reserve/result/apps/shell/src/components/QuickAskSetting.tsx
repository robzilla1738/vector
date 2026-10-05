import { staticFieldErrorProps } from "../ui/class-props";
import { staticHintProps } from "../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import { useScopedCommandControls } from "../scoped-command-controls";
import {
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { bridge, inNativeHost } from "../bridge";
import { useSettingsStatusOwner } from "../settings/sections/use-settings-status-owner";
import { useShortcutLabels } from "../use-shortcut-label";
import "./QuickAskSetting.css";
import { nativeCheckboxTypeProps, nativeAlertRoleProps } from "../ui/native-attribute-props";

type Status = { enabled: boolean; registered: boolean; error: string };
export function QuickAskSetting() {
  const key = useShortcutLabels(),
    windowId = bridge.windowId,
    privateMode = bridge.privateMode;
  const identity = useMemo(() => ([windowId, privateMode]), [windowId, privateMode]);
  const [getOwner, current, status, busy, error, read, perform] = useSettingsStatusOwner<Status>(identity, windowId, privateMode);
  useEffect(() => {
    read(getOwner(), () => bridge.quickAskShortcut(), (value) => value);
  }, [getOwner, read]);
  const change = useCallback(
    (enabled: boolean) => {
      const owner = getOwner();
      if (!inNativeHost || !current(owner) || owner.pending || owner.value !== status)
        throw new Error("Choose the current Quick Ask shortcut control.");
      return perform(owner, () => bridge.quickAskShortcut(enabled), (value) => value);
    },
    [getOwner, current, status, perform],
  );
  const toggle = useCallback(() => {
    if (!status) throw new Error("Wait for the Quick Ask shortcut status.");
    return change(!status.enabled);
  }, [change, status]);
  const retry = useCallback(() => {
    if (!error && !status?.error) throw new Error("Choose the current Quick Ask recovery control.");
    return change(true);
  }, [change, error, status]);
  const [publish, run] = useScopedCommandControls(`${windowId}:quick-ask`, (command) => {
    const owner = getOwner();
    if (!current(owner) || !inNativeHost || (command === "quick-ask" && privateMode)) return;
    return () => current(owner);
  });
  const toggleRef = useCallback(
    (node: HTMLInputElement | null) => publish("toggle-quick-ask-shortcut", "toggle-quick-ask-shortcut", node, toggle),
    [publish, toggle],
  );
  const retryRef = useCallback(
    (node: HTMLButtonElement | null) => publish("retry-quick-ask-shortcut", "retry-quick-ask-shortcut", node, retry),
    [publish, retry],
  );
  return (
    <div className="quick-ask-setting">
      <button
        {...smallButtonProps}
        disabled={!inNativeHost || privateMode}
        onClick={(event) => run("quick-ask", event)}
      >
        Open Quick Ask
      </button>
      <p {...staticHintProps}>
        A compact chat that expands into a full browser window. Your draft stays with it.
      </p>
      {status && (
        <label className="memory-use-toggle">
          <input
            ref={toggleRef}
            {...nativeCheckboxTypeProps}
            disabled={busy || !inNativeHost}
            checked={status.enabled}
            onChange={(event) => run("toggle-quick-ask-shortcut", event)}
          />
          <span>
            Open from any app with {key("quick-ask")}
            <small>
              Optional · available while Aux is running. Other apps and their contents are not captured.
            </small>
          </span>
        </label>
      )}
      {(error || status?.error) && (
        <p {...staticFieldErrorProps} {...nativeAlertRoleProps}>
          {error || status?.error}{" "}
          <button
            ref={retryRef}
            {...smallGhostButtonProps}
            disabled={busy || !inNativeHost}
            onClick={(event) => run("retry-quick-ask-shortcut", event)}
          >
            Try again
          </button>
        </p>
      )}
      {!inNativeHost && <p {...staticHintProps}>Available in the Aux desktop app.</p>}
      {inNativeHost && privateMode && <p {...staticHintProps}>Open Quick Ask from a regular window.</p>}
    </div>
  );
}
