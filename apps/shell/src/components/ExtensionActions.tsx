import { useCallback, useRef, useState } from "react";
import { bridge, hostKind, type BrowserExtension } from "../bridge";
import { useStore } from "../store";
import { I } from "./icons";
import { NativeMenu } from "./NativeDialog";
import { useFeature } from "../use-feature";

/** User-initiated extension actions are dispatched through Chromium's toolbar
 * model, which owns popup permissions and the extension process. */
export function ExtensionActions() {
  const available = useFeature("extensions");
  const anchor = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<BrowserExtension[]>([]);
  const [error, setError] = useState("");
  const close = useCallback(() => setOpen(false), []);
  if (hostKind !== "chromium" || bridge.privateMode || !available) return null;

  async function show() {
    setError("");
    setOpen(true);
    try {
      setItems((await bridge.extensions()).filter((item) => item.source === "store" && item.enabled));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  }

  return (
    <>
      <button
        ref={anchor}
        className="icon-btn"
        title="Extensions"
        aria-label="Extensions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => (open ? close() : void show())}
      >
        {I.extension}
      </button>
      {open && (
        <NativeMenu
          id="extension-actions-menu"
          label="Extension actions"
          anchor={anchor}
          returnFocus={anchor}
          onClose={close}
          className="menu ctx-menu extension-actions-menu"
        >
          {error && (
            <p className="menu-empty" role="alert">
              {error}
            </p>
          )}
          {!error && !items.length && <p className="menu-empty">No enabled Store extensions.</p>}
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              role="menuitem"
              className="menu-item"
              onClick={() => {
                close();
                void bridge.showExtensionAction(item.key).catch((reason) => {
                  useStore
                    .getState()
                    .toast(reason instanceof Error ? reason.message : String(reason), "error");
                });
              }}
            >
              {I.extension}
              <span>{item.name}</span>
            </button>
          ))}
          <button
            type="button"
            role="menuitem"
            className="menu-item"
            onClick={() => {
              close();
              useStore.getState().setOverlay("settings");
            }}
          >
            {I.gearSm}
            <span>Manage extensions…</span>
          </button>
        </NativeMenu>
      )}
    </>
  );
}
