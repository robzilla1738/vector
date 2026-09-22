import type { Input } from "electron";
import { matchShortcut, SHORTCUTS, type ShortcutCommandDef } from "@aux/contracts";
import type { BrowserShortcut } from "./popup-commands.js";

let defs: readonly ShortcutCommandDef[] = SHORTCUTS;

/** The shell's effective table — defaults until the renderer pushes overrides. */
export function setPageShortcuts(next: readonly ShortcutCommandDef[]) { defs = next; }

/** Only browser commands leave the page; editing and macOS Control bindings stay. */
export function pageShortcut(input: Input, platform: NodeJS.Platform = process.platform): BrowserShortcut | null {
  if (!input.key || input.type !== "keyDown" || input.isComposing) return null;
  const def = matchShortcut(defs, {
    key: input.key, meta: input.meta, ctrl: input.control, shift: input.shift, alt: input.alt,
  }, { platform, forIntercept: true });
  return def
    ? { key: input.key, meta: input.meta || (input.control && platform !== "darwin"), shift: input.shift, alt: input.alt, ctrl: !!input.control, commandId: def.id }
    : null;
}
