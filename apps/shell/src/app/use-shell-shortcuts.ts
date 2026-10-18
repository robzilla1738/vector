import { useEffect, useRef, type RefObject } from "react";
import type { ShortcutOverrides } from "@aux/contracts";
import { effectiveShortcutBindings } from "@aux/contracts/shortcut-startup";
import { matchShortcut } from "@aux/contracts/shortcut-bindings";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { dispatchShortcut as dispatchCommandShortcut } from "../commands";
import { createTabSwitcher } from "../tab-switcher";
import { finishTabPreview } from "../tab-switcher-state";
import { nativePickerOpen } from "../ui/focus";

type Shortcut = {
  key: string;
  meta: boolean;
  shift: boolean;
  alt: boolean;
  ctrl?: boolean;
  commandId?: string;
};

export function useShellShortcuts(findInput: RefObject<HTMLInputElement | null>) {
  const tabSwitcher = useRef(createTabSwitcher());
  const setOverlay = useStore((state) => state.setOverlay);
  const dispatchShortcut = (shortcut: Shortcut) =>
    dispatchCommandShortcut(shortcut, { findInput, tabSwitcher: tabSwitcher.current });

  useEffect(
    () =>
      bridge.onShortcut((shortcut) => {
        // A browser-handled Ctrl-Tab can suppress DOM keyup on its original host.
        // The native window forwards only its owned physical Control release.
        if (
          shortcut.key === "Control" &&
          shortcut.ctrl === false &&
          shortcut.commandId === undefined &&
          shortcut.websitePassThrough === undefined &&
          !shortcut.meta &&
          !shortcut.alt &&
          !shortcut.shift
        ) {
          finishTabPreview(true);
          return;
        }
        dispatchShortcut(shortcut);
      }),
    [],
  );

  // renderer-side keys (when the shell itself has focus)
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.isComposing || nativePickerOpen(e.target)) return;
      if (e.metaKey || e.ctrlKey) {
        const st = useStore.getState();
        const def = matchShortcut(
          effectiveShortcutBindings(st.settings?.shortcutOverrides as ShortcutOverrides | undefined),
          {
            key: e.key,
            meta: e.metaKey,
            ctrl: e.ctrlKey,
            shift: e.shiftKey,
            alt: e.altKey,
          },
          { platform: bridge.platform },
        );
        if (def) {
          e.preventDefault();
          dispatchShortcut({
            key: e.key,
            meta: e.metaKey,
            shift: e.shiftKey,
            alt: e.altKey,
            ctrl: e.ctrlKey,
            commandId: def.id,
          });
        }
        return;
      }
      if (e.key === "Escape" && !e.defaultPrevented && useStore.getState().overlay) setOverlay(null);
    };
    const release = (event: KeyboardEvent) => {
      if (event.key === "Control" && !event.ctrlKey) finishTabPreview(true);
    };
    const cancel = () => finishTabPreview(false);
    window.addEventListener("keydown", h);
    window.addEventListener("keyup", release);
    window.addEventListener("blur", cancel);
    return () => {
      window.removeEventListener("keydown", h);
      window.removeEventListener("keyup", release);
      window.removeEventListener("blur", cancel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
