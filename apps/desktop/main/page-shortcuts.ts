import type { Input } from "electron";
import type { BrowserShortcut } from "./popup-commands.js";

/** Only browser commands leave the page; editing and macOS Control bindings stay. */
export function pageShortcut(input: Input, platform: NodeJS.Platform = process.platform): BrowserShortcut | null {
  if (!input.key || input.type !== "keyDown" || input.isComposing) return null;
  const meta = input.meta || (input.control && platform !== "darwin");
  const key = input.key.toLowerCase().replace(/^arrow/, "");
  const command = meta && (
    ["l", "t", "w", "k", "f", "r", "d", "y", ",", "s", "g", "o", "p", "e",
      "[", "]", "{", "}", "=", "+", "-", "_", "0",
      "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(key) ||
    (input.shift && ["a", "j", "c", "backspace"].includes(key)) ||
    (input.alt && ["u", "i", "left", "right"].includes(key))
  );
  const cycle = input.control && key === "tab";
  const navigate = platform !== "darwin" && input.alt && ["left", "right"].includes(key);
  return command || cycle || navigate
    ? { key: input.key, meta, shift: input.shift, alt: input.alt, ctrl: !!input.control }
    : null;
}
