import { staticFieldErrorProps } from "../../ui/class-props";
import { staticHintProps } from "../../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../../ui/button-props";
import { useScopedCommandControls } from "../../scoped-command-controls";
import { useCallback, useEffect, useMemo } from "react";
import { bridge, inNativeHost } from "../../bridge";
import { useSettingsStatusOwner } from "./use-settings-status-owner";
import { useShortcutLabels } from "../../use-shortcut-label";
import { SettingsField, SettingsSection } from "../primitives";
import { Switch } from "../../ui";
import { nativeAlertRoleProps } from "../../ui/native-attribute-props";
import type { ShortcutOverrides } from "@aux/contracts";
import { ShortcutsSetting } from "../../components/ShortcutsSetting";

type Status = { enabled: boolean; registered: boolean; error: string };
export function QuickAskSettings({
  active,
  settings,
  onSave,
}: {
  active: boolean;
  settings: Record<string, unknown>;
  onSave: (patch: Record<string, unknown>) => Promise<boolean>;
}) {
  const key = useShortcutLabels(),
    windowId = bridge.windowId,
    privateMode = bridge.privateMode;
  const identity = useMemo(() => [windowId, privateMode], [windowId, privateMode]);
  const [getOwner, current, status, busy, error, read, perform] = useSettingsStatusOwner<Status>(
    identity,
    windowId,
    privateMode,
  );
  useEffect(() => {
    read(
      getOwner(),
      () => bridge.quickAskShortcut(),
      (value) => value,
    );
  }, [getOwner, read]);
  const change = useCallback(
    (enabled: boolean) => {
      const owner = getOwner();
      if (!inNativeHost || !current(owner) || owner.pending || owner.value !== status)
        throw new Error("Choose the current Quick Ask shortcut control.");
      return perform(
        owner,
        () => bridge.quickAskShortcut(enabled),
        (value) => value,
      );
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
    (node: HTMLInputElement | null) =>
      publish("toggle-quick-ask-shortcut", "toggle-quick-ask-shortcut", node, toggle),
    [publish, toggle],
  );
  const retryRef = useCallback(
    (node: HTMLButtonElement | null) =>
      publish("retry-quick-ask-shortcut", "retry-quick-ask-shortcut", node, retry),
    [publish, retry],
  );
  return (
    <SettingsSection name="Quick Ask" hidden={!active}>
      <SettingsField
        compact
        label="Quick Ask window"
        hint="Open a compact chat, then expand it into a full browser window without losing the draft."
      >
        <button
          {...smallButtonProps}
          disabled={!inNativeHost || privateMode}
          onClick={(event) => run("quick-ask", event)}
        >
          Open Quick Ask
        </button>
      </SettingsField>
      {status && (
        <SettingsField
          compact
          label="Global shortcut"
          hint={
            <>
              Open from any app with <kbd>{key("quick-ask")}</kbd> while Aux is running. Other apps and their
              contents are not captured.
            </>
          }
          searchTerms={["keyboard", "shortcut", "hotkey"]}
        >
          <Switch
            controlRef={toggleRef}
            aria-label="Enable Quick Ask global shortcut"
            disabled={busy || !inNativeHost}
            checked={status.enabled}
            onChange={(event) => run("toggle-quick-ask-shortcut", event)}
          />
        </SettingsField>
      )}
      {status?.enabled && (
        <SettingsField compact label="Keyboard shortcut" hint="Set a global shortcut for Quick Ask.">
          <ShortcutsSetting
            active={active}
            commandId="quick-ask"
            disabled={busy || !inNativeHost || privateMode}
            value={(settings.shortcutOverrides ?? {}) as ShortcutOverrides}
            onSave={async (shortcutOverrides) => {
              const owner = getOwner();
              if (!current(owner) || !inNativeHost || privateMode) return false;
              if (!(await onSave({ shortcutOverrides }))) return false;
              if (!current(owner)) return true;
              read(
                owner,
                () => bridge.quickAskShortcut(),
                (value) => value,
              );
              return true;
            }}
          />
        </SettingsField>
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
    </SettingsSection>
  );
}
