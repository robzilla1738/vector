import { COMMANDS, type CommandDef } from "./commands.js";

/**
 * The one shortcut registry: menu accelerators, page-level interception and
 * renderer dispatch all resolve through these definitions, so a chord can
 * only ever mean one command. `command` is the browser's primary modifier —
 * Cmd on macOS, Ctrl elsewhere. `ctrl` is the macOS Control key specifically
 * (⌃Tab); it never matches on win/linux, where Control *is* command.
 */
export interface ShortcutBinding {
  /** Produced key normalized like input events: lowercase, no "arrow" prefix. */
  key: string;
  command?: boolean;
  shift?: boolean;
  alt?: boolean;
  /** macOS Control only — not the win/linux Ctrl. */
  ctrl?: boolean;
  /** Platforms whose page views intercept this chord; absent = all. */
  platforms?: string[];
}

/** commandId → replacement bindings; null disables the command's shortcuts. */
export type ShortcutOverrides = Record<string, ShortcutBinding[] | null>;

export interface ShortcutCommandDef {
  id: string;
  label: string;
  /** First binding is the display binding — menus render it as the accelerator. */
  bindings: readonly ShortcutBinding[];
  /** Page views hand this chord to the browser instead of the page. */
  readonly intercept?: boolean;
  readonly focusShell?: boolean;
}

export const SHORTCUTS: readonly ShortcutCommandDef[] = COMMANDS.map((command: CommandDef) => ({
  id: command.id, label: command.label, bindings: command.bindings,
  ...(command.intercept ? { intercept: true } : {}),
  ...(command.focusShell ? { focusShell: true } : {}),
}));

export const shortcutById = (id: string, defs: readonly ShortcutCommandDef[] = SHORTCUTS) => defs.find(def => def.id === id);

/** Defaults layered with the person's saved overrides. */
export function effectiveShortcuts(overrides?: ShortcutOverrides | null): ShortcutCommandDef[] {
  if (!overrides) return [...SHORTCUTS];
  return SHORTCUTS.map(def => {
    const next = overrides[def.id];
    if (next === undefined) return def;
    return { ...def, bindings: next ?? [] };
  });
}

export interface ShortcutInput { key: string; meta: boolean; shift: boolean; alt: boolean; ctrl?: boolean }

/** Exact-chord match: every modifier is required iff the binding asks for it. */
export function matchShortcut(
  defs: readonly ShortcutCommandDef[],
  input: ShortcutInput,
  options?: { platform?: string; forIntercept?: boolean },
): ShortcutCommandDef | undefined {
  const platform = options?.platform ?? "darwin";
  const key = input.key.toLowerCase().replace(/^arrow/, "");
  const command = input.meta || (!!input.ctrl && platform !== "darwin");
  const ctrl = !!input.ctrl && platform === "darwin";
  for (const def of defs) {
    if (options?.forIntercept && !def.intercept) continue;
    for (const b of def.bindings) {
      if (b.platforms && !b.platforms.includes(platform)) continue;
      if (b.key === key && !!b.command === command && !!b.shift === input.shift && !!b.alt === input.alt && !!b.ctrl === ctrl) return def;
    }
  }
  return undefined;
}

/** The chord a binding occupies — used to explain conflicts in Settings. */
export const bindingKey = (b: ShortcutBinding): string =>
  `${b.command ? "1" : "0"}${b.ctrl ? "1" : "0"}${b.shift ? "1" : "0"}${b.alt ? "1" : "0"}:${b.platforms?.join(",") ?? "*"}:${b.key}`;

/** Commands whose bindings collide on the same chord (same modifier map). */
export function shortcutConflicts(defs: readonly ShortcutCommandDef[]): { binding: ShortcutBinding; commands: ShortcutCommandDef[] }[] {
  const byChord = new Map<string, { binding: ShortcutBinding; commands: ShortcutCommandDef[] }>();
  for (const def of defs) {
    for (const b of def.bindings) {
      const chord = bindingKey(b);
      const entry = byChord.get(chord);
      if (entry) entry.commands.push(def); else byChord.set(chord, { binding: b, commands: [def] });
    }
  }
  return [...byChord.values()].filter(entry => entry.commands.length > 1);
}

const DISPLAY_KEYS: Record<string, string> = {
  " ": "Space", "left": "Left", "right": "Right", "up": "Up", "down": "Down",
  "{": "[", "}": "]", "_": "-", "+": "=", "backspace": "Backspace", "tab": "Tab",
};

/** Electron accelerator string for a binding ("CmdOrCtrl+Shift+T"). */
export function acceleratorFor(b: ShortcutBinding): string {
  const parts = [b.command && "CmdOrCtrl", b.ctrl && "Ctrl", b.shift && "Shift", b.alt && "Alt"].filter(Boolean);
  const key = DISPLAY_KEYS[b.key] ?? (b.key.length === 1 ? b.key.toUpperCase() : b.key);
  return [...parts, key].join("+");
}

/** Human-readable chord for Settings rows ("⌘⇧T" on macOS). */
export function bindingLabel(b: ShortcutBinding, platform = "darwin"): string {
  const mac = platform === "darwin";
  return [b.command ? (mac ? "⌘" : "Ctrl+") : "", b.ctrl ? "⌃" : "", b.alt ? (mac ? "⌥" : "Alt+") : "", b.shift ? (mac ? "⇧" : "Shift+") : "", DISPLAY_KEYS[b.key] ?? b.key.toUpperCase()].join("");
}
