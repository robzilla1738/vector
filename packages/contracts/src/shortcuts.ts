import { z } from "zod";

/**
 * The one shortcut registry: menu accelerators, page-level interception and
 * renderer dispatch all resolve through these definitions, so a chord can
 * only ever mean one command. `command` is the browser's primary modifier —
 * Cmd on macOS, Ctrl elsewhere. `ctrl` is the macOS Control key specifically
 * (⌃Tab); it never matches on win/linux, where Control *is* command.
 */
export const ShortcutBindingSchema = z.object({
  /** Produced key normalized like input events: lowercase, no "arrow" prefix. */
  key: z.string().min(1).max(32),
  command: z.boolean().optional(),
  shift: z.boolean().optional(),
  alt: z.boolean().optional(),
  /** macOS Control only — not the win/linux Ctrl. */
  ctrl: z.boolean().optional(),
  /** Platforms whose page views intercept this chord; absent = all. */
  platforms: z.array(z.string().min(1).max(16)).min(1).max(4).optional(),
});
export type ShortcutBinding = z.infer<typeof ShortcutBindingSchema>;

export const ShortcutOverridesSchema = z.record(
  z.string().min(1).max(64),
  z.union([z.array(ShortcutBindingSchema).max(4), z.null()]),
);
/** commandId → replacement bindings; null disables the command's shortcuts. */
export type ShortcutOverrides = z.infer<typeof ShortcutOverridesSchema>;

export interface ShortcutCommandDef {
  id: string;
  label: string;
  /** First binding is the display binding — menus render it as the accelerator. */
  bindings: readonly ShortcutBinding[];
  /** Page views hand this chord to the browser instead of the page. */
  readonly intercept?: boolean;
}

const B = (key: string, options: Omit<ShortcutBinding, "key"> = {}): ShortcutBinding => ({ key, ...options });

export const SHORTCUTS: readonly ShortcutCommandDef[] = [
  { id: "new-tab", label: "New Tab", bindings: [B("t", { command: true })], intercept: true },
  { id: "new-window", label: "New Window", bindings: [B("n", { command: true })] },
  { id: "new-private-window", label: "New Private Window", bindings: [B("n", { command: true, shift: true })] },
  { id: "open-file", label: "Open File…", bindings: [B("o", { command: true })], intercept: true },
  { id: "reopen-closed-tab", label: "Reopen Closed Tab", bindings: [B("t", { command: true, shift: true })], intercept: true },
  { id: "close-tab", label: "Close Tab", bindings: [B("w", { command: true })], intercept: true },
  { id: "close-window", label: "Close Window", bindings: [B("w", { command: true, shift: true })], intercept: true },
  { id: "print", label: "Print…", bindings: [B("p", { command: true })], intercept: true },
  { id: "save-pdf", label: "Save Page as PDF…", bindings: [B("p", { command: true, shift: true })], intercept: true },
  { id: "quick-ask", label: "Quick Ask", bindings: [B(" ", { command: true, shift: true })] },
  { id: "find", label: "Find…", bindings: [B("f", { command: true })], intercept: true },
  { id: "find-next", label: "Find Next", bindings: [B("g", { command: true })], intercept: true },
  { id: "find-previous", label: "Find Previous", bindings: [B("g", { command: true, shift: true })], intercept: true },
  { id: "reload", label: "Reload", bindings: [B("r", { command: true })], intercept: true },
  { id: "hard-reload", label: "Hard Reload", bindings: [B("r", { command: true, shift: true })], intercept: true },
  { id: "actual-size", label: "Actual Size", bindings: [B("0", { command: true })], intercept: true },
  {
    id: "zoom-in", label: "Zoom In", intercept: true,
    // `+` is Shift+= on US layouts — the shifted variants are the same chord.
    bindings: [B("=", { command: true }), B("=", { command: true, shift: true }), B("+", { command: true }), B("+", { command: true, shift: true })],
  },
  {
    id: "zoom-out", label: "Zoom Out", intercept: true,
    bindings: [B("-", { command: true }), B("-", { command: true, shift: true }), B("_", { command: true }), B("_", { command: true, shift: true })],
  },
  { id: "reader", label: "Reader View", bindings: [B("r", { command: true, alt: true })], intercept: true },
  { id: "sidebar", label: "Toggle Sidebar", bindings: [B("s", { command: true })], intercept: true },
  { id: "overview", label: "Tab Overview", bindings: [B("o", { command: true, shift: true })], intercept: true },
  { id: "devtools", label: "Developer Tools", bindings: [B("i", { command: true, alt: true })], intercept: true },
  { id: "inspect-element", label: "Inspect Element", bindings: [B("c", { command: true, shift: true })], intercept: true },
  { id: "view-source", label: "View Source", bindings: [B("u", { command: true, alt: true })], intercept: true },
  { id: "back", label: "Back", bindings: [B("[", { command: true }), B("left", { alt: true, platforms: ["win32", "linux"] })], intercept: true },
  { id: "forward", label: "Forward", bindings: [B("]", { command: true }), B("right", { alt: true, platforms: ["win32", "linux"] })], intercept: true },
  { id: "open-address", label: "Open Address", bindings: [B("l", { command: true }), B("e", { command: true })], intercept: true },
  { id: "palette", label: "Command Palette", bindings: [B("k", { command: true })], intercept: true },
  { id: "settings", label: "Settings", bindings: [B(",", { command: true })], intercept: true },
  { id: "history", label: "History", bindings: [B("y", { command: true })], intercept: true },
  { id: "downloads", label: "Downloads", bindings: [B("j", { command: true, shift: true })], intercept: true },
  { id: "bookmark", label: "Bookmark This Page", bindings: [B("d", { command: true })], intercept: true },
  { id: "bookmark-all", label: "Bookmark All Tabs", bindings: [B("d", { command: true, shift: true })], intercept: true },
  { id: "agent-rail", label: "Toggle Agent Rail", bindings: [B("a", { command: true, shift: true })], intercept: true },
  { id: "clear-history", label: "Clear History", bindings: [B("backspace", { command: true, shift: true })], intercept: true },
  {
    id: "tab-next", label: "Next Tab", intercept: true,
    bindings: [
      B("right", { command: true, alt: true }),
      B("]", { command: true, shift: true }), B("}", { command: true, shift: true }),
      B("tab", { ctrl: true }), B("tab", { command: true }),
    ],
  },
  {
    id: "tab-previous", label: "Previous Tab", intercept: true,
    bindings: [
      B("left", { command: true, alt: true }),
      B("[", { command: true, shift: true }), B("{", { command: true, shift: true }),
      B("tab", { ctrl: true, shift: true }), B("tab", { command: true, shift: true }),
    ],
  },
  ...Array.from({ length: 9 }, (_, i): ShortcutCommandDef => ({
    id: `tab-${i + 1}`, label: i === 8 ? "Last Tab" : `Switch to Tab ${i + 1}`,
    bindings: [B(String(i + 1), { command: true })], intercept: true,
  })),
];

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
