import { staticIconButtonProps, staticMenuItemProps } from "../ui/class-props";
import { useCallback, useRef, useState, type RefObject } from "react";
import type { HostMethodResult } from "@aux/contracts";
import { bridge, inNativeHost } from "../bridge";
import { executeCommand, runCommand } from "../commands";
import { errToast } from "../store";
import { shellIconExtension, shellIconGearSm, shellIconDownloadSm, shellIconPin } from "../ui/icons";
import { Dialog, Menu } from "../ui";
import { deferNamedSurface } from "./DeferredSurface";
import { useFeature } from "../use-feature";
import { useExtensionActions } from "../features/extensions/use-extension-actions";
import { extensionActionAnchor } from "../features/extensions/action-anchor";
import "../features/extensions/extensions.css";
import "../settings/SettingsDialogControl.css";
import { nativeButtonTypeProps as auxNativeButtonTypeProps } from "../ui/native-attribute-props";
import { nativeAlertRoleProps, nativeMenuItemRoleProps } from "../ui/native-attribute-props";

type Action = HostMethodResult<"extensionActions">[number];
function ActionIcon({ action }: { action: Action }) {
  // Chromium's action icon already contains its native badge and attention
  // state; adding another badge here would draw it twice.
  return action.iconPng ? (
    <img className="extension-action-icon" src={action.iconPng} alt="" />
  ) : (
    shellIconExtension
  );
}
export function ExtensionActions() {
  const available = useFeature("extensions");
  const enabled = inNativeHost && !bridge.privateMode && bridge.windowKind === "normal" && available;
  const { items, error } = useExtensionActions(enabled);
  const anchor = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [pinning, setPinning] = useState<string | null>(null);
  const pending = useRef(false);
  const close = useCallback(() => setOpen(false), []);
  const pin = async (item: Action) => {
    if (pending.current) return;
    pending.current = true;
    setPinning(item.id);
    try {
      await executeCommand("pin-extension-action", {
        payload: { extensionId: item.id, pinned: !item.pinned },
      });
    } catch (reason) {
      errToast(reason);
    } finally {
      pending.current = false;
      setPinning(null);
    }
  };
  if (!enabled) return null;
  const invoke = (item: Action, button: HTMLButtonElement) => {
    close();
    runCommand("extension-action", {
      payload: { extensionId: item.id, anchor: extensionActionAnchor(button) },
    });
  };
  return (
    <fieldset className="extension-toolbar-actions" aria-label="Extension actions">
      {items
        .filter((item) => item.pinned)
        .map((item) => (
          <button
            key={item.id}
            {...auxNativeButtonTypeProps}
            {...staticIconButtonProps}
            aria-label={`${item.name}${item.badgeText ? ` · ${item.badgeText}` : ""}`}
            title={item.name}
            disabled={!item.enabled}
            data-command-id="extension-action"
            onClick={(event) => invoke(item, event.currentTarget)}
          >
            <ActionIcon action={item} />
          </button>
        ))}
      <button
        ref={anchor}
        {...auxNativeButtonTypeProps}
        {...staticIconButtonProps}
        title="Extensions"
        aria-label="Extensions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {shellIconExtension}
      </button>
      {open && (
        <Menu
          id="extension-actions-menu"
          label="Extension actions"
          anchor={anchor}
          returnFocus={anchor}
          onClose={close}
          className="menu ctx-menu extension-actions-menu"
        >
          <button
            {...auxNativeButtonTypeProps}
            {...nativeMenuItemRoleProps}
            {...staticMenuItemProps}
            data-command-id="show-extensions"
            onClick={() => {
              close();
              runCommand("show-extensions");
            }}
          >
            {shellIconGearSm}
            <span>Manage all extensions</span>
          </button>
          <button
            {...auxNativeButtonTypeProps}
            {...nativeMenuItemRoleProps}
            {...staticMenuItemProps}
            onClick={() => {
              close();
              setImportOpen(true);
            }}
          >
            {shellIconDownloadSm}
            <span>Import extensions</span>
          </button>
          <hr />
          <p className="extension-menu-label">Installed extensions</p>
          {error && (
            <p className="menu-empty" {...nativeAlertRoleProps}>
              {error}
            </p>
          )}
          {!error && !items.length && <p className="menu-empty">No extensions installed.</p>}
          {items.map((item) => (
            <fieldset key={item.id} className="extension-menu-row" aria-label={item.name}>
              <button
                {...auxNativeButtonTypeProps}
                {...nativeMenuItemRoleProps}
                {...staticMenuItemProps}
                disabled={!item.enabled}
                data-command-id="extension-action"
                onClick={(event) => invoke(item, event.currentTarget)}
              >
                <ActionIcon action={item} />
                <span>
                  {item.name}
                  {item.badgeText ? ` · ${item.badgeText}` : ""}
                </span>
              </button>
              <button
                {...auxNativeButtonTypeProps}
                role="menuitemcheckbox"
                aria-checked={item.pinned}
                aria-label={`${item.pinned ? "Unpin" : "Pin"} ${item.name}`}
                className="menu-item extension-pin"
                title={`${item.pinned ? "Unpin" : "Pin"} ${item.name}`}
                disabled={pinning !== null}
                data-command-id="pin-extension-action"
                onClick={() => void pin(item)}
              >
                {shellIconPin}
              </button>
            </fieldset>
          ))}
        </Menu>
      )}
      {importOpen && <ImportExtensionsDialog anchor={anchor} onClose={() => setImportOpen(false)} />}
    </fieldset>
  );
}

function ImportExtensionsDialog({
  anchor,
  onClose,
}: {
  anchor: RefObject<HTMLButtonElement | null>;
  onClose(): void;
}) {
  const [Editor] = useState(() =>
    deferNamedSurface(
      () => import("./ImportDataSetting"),
      "ImportDataSetting",
      "Extension import",
      true,
      false,
      onClose,
    ),
  );
  return (
    <Dialog
      label="Import extensions"
      className="aux-dialog-surface settings-preference-dialog settings-preference-dialog-wide"
      returnFocus={anchor}
      onClose={onClose}
    >
      <header>
        <h3>Import extensions</h3>
      </header>
      <Editor extensionsOnly />
      <footer>
        <button type="button" className="btn sm" onClick={onClose}>
          Done
        </button>
      </footer>
    </Dialog>
  );
}
