import { staticIconButtonProps, staticMenuItemProps } from "../ui/class-props";
import { useCallback, useRef, useState } from "react";
import type { HostMethodResult } from "@aux/contracts";
import { bridge, inNativeHost } from "../bridge";
import { runCommand } from "../commands";
import { shellIconExtension, shellIconGearSm } from "../ui/icons";
import { Menu } from "../ui";
import { useFeature } from "../use-feature";
import { useExtensionActions } from "../features/extensions/use-extension-actions";
import { extensionActionAnchor } from "../features/extensions/action-anchor";
import "../features/extensions/extensions.css";
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
  const close = useCallback(() => setOpen(false), []);
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
          {error && (
            <p className="menu-empty" {...nativeAlertRoleProps}>
              {error}
            </p>
          )}
          {!error && !items.length && (
            <p className="menu-empty">No extension actions. Install an extension in Settings.</p>
          )}
          {items.map((item) => (
            <fieldset key={item.id} aria-label={item.name}>
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
                data-command-id="pin-extension-action"
                onClick={() =>
                  runCommand("pin-extension-action", {
                    payload: { extensionId: item.id, pinned: !item.pinned },
                  })
                }
              >
                {item.pinned ? "Unpin from toolbar" : "Pin to toolbar"}
              </button>
            </fieldset>
          ))}
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
            <span>Manage extensions…</span>
          </button>
        </Menu>
      )}
    </fieldset>
  );
}
