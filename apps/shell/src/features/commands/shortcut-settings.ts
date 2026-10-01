import {
  COMMANDS,
  effectiveShortcuts,
  bindingLabel,
  ShortcutOverridesSchema,
  type ShortcutBinding,
  type ShortcutOverrides,
} from "@aux/contracts";

const sameChord = (a: ShortcutBinding, b: ShortcutBinding) =>
  a.key === b.key &&
  !!a.command === !!b.command &&
  !!a.ctrl === !!b.ctrl &&
  !!a.shift === !!b.shift &&
  !!a.alt === !!b.alt;
const RESERVED: readonly [ShortcutBinding, string][] = [
  [{ key: "q", command: true }, "Quit"],
  [{ key: "h", command: true }, "Hide"],
  [{ key: "h", command: true, alt: true }, "Hide Other Apps"],
  [{ key: "m", command: true }, "Minimize"],
  [{ key: "tab", command: true }, "Switch Apps"],
  [{ key: " ", command: true }, "Spotlight"],
  [{ key: "f", command: true, ctrl: true }, "Full Screen"],
  [{ key: "d", command: true, alt: true }, "Show Dock"],
  [{ key: "`", command: true }, "Switch Windows"],
  ...["3", "4", "5"].map(
    (key) => [{ key, command: true, shift: true }, "Screenshots"] as [ShortcutBinding, string],
  ),
];
export function reservedShortcut(binding: ShortcutBinding, platform: string): string | undefined {
  const match = platform === "darwin" ? RESERVED.find(([chord]) => sameChord(chord, binding)) : undefined;
  return match ? `macOS uses ${bindingLabel(binding, platform)} for ${match[1]}.` : undefined;
}
export function shortcutWarning(binding: ShortcutBinding, platform: string) {
  return platform === "darwin" &&
    binding.ctrl &&
    !binding.command &&
    !binding.alt &&
    !binding.shift &&
    /^[0-9]$/.test(binding.key)
    ? "Mission Control may use this shortcut. Change its binding in macOS System Settings if Aux cannot receive it."
    : undefined;
}
export function platformConflicts(overrides: ShortcutOverrides, platform: string) {
  const occupied = new Map<string, { binding: ShortcutBinding; ids: string[] }>();
  for (const command of effectiveShortcuts(overrides))
    for (const binding of command.bindings) {
      if (binding.platforms && !binding.platforms.includes(platform)) continue;
      const key = `${!!binding.command}:${!!binding.ctrl}:${!!binding.shift}:${!!binding.alt}:${binding.key}`;
      const entry = occupied.get(key);
      if (entry) {
        if (!entry.ids.includes(command.id)) entry.ids.push(command.id);
      } else occupied.set(key, { binding, ids: [command.id] });
    }
  return [...occupied.values()].filter((entry) => entry.ids.length > 1);
}
export function importShortcuts(text: string, platform: string): ShortcutOverrides {
  if (text.length > 128 * 1024) throw new Error("Shortcut file is too large.");
  const input: unknown = JSON.parse(text);
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("Choose an Aux shortcut JSON file.");
  const record = input as Record<string, unknown>;
  if (
    record.schema !== 1 ||
    !record.overrides ||
    typeof record.overrides !== "object" ||
    Array.isArray(record.overrides)
  )
    throw new Error("Choose an Aux shortcut JSON file (schema 1).");
  const ids = new Set(COMMANDS.map((command) => command.id));
  const result: ShortcutOverrides = {};
  for (const [id, value] of Object.entries(record.overrides)) {
    if (!ids.has(id as (typeof COMMANDS)[number]["id"])) throw new Error(`Unknown command: ${id}`);
    if (value === null) {
      result[id] = null;
      continue;
    }
    if (!Array.isArray(value) || value.length > 4) throw new Error(`Invalid shortcuts for ${id}.`);
    result[id] = value.map((raw) => {
      if (!raw || typeof raw !== "object" || Array.isArray(raw))
        throw new Error(`Invalid shortcut for ${id}.`);
      const binding = raw as ShortcutBinding;
      if (
        Object.keys(raw).some(
          (key) => !["key", "command", "ctrl", "alt", "shift", "platforms"].includes(key),
        ) ||
        typeof binding.key !== "string" ||
        !binding.key.length ||
        binding.key.length > 32 ||
        binding.key !== binding.key.toLowerCase() ||
        ["command", "ctrl", "alt", "shift"].some((key) => key in raw && typeof raw[key] !== "boolean") ||
        (binding.platforms &&
          (!Array.isArray(binding.platforms) ||
            !binding.platforms.length ||
            binding.platforms.some((p) => !["darwin", "win32", "linux"].includes(p))))
      )
        throw new Error(`Invalid shortcut for ${id}.`);
      if (!binding.command && !binding.ctrl && !binding.alt && !/^f([1-9]|1[0-9]|2[0-4])$/.test(binding.key))
        throw new Error("Shortcuts must use a modifier or function key.");
      const reserved = reservedShortcut(binding, platform);
      if (reserved) throw new Error(reserved);
      return { ...binding };
    });
  }
  ShortcutOverridesSchema.parse(result);
  if (platformConflicts(result, platform).length)
    throw new Error(
      "The file assigns the same shortcut to multiple commands. Resolve conflicts before importing.",
    );
  return result;
}
export const exportShortcuts = (overrides: ShortcutOverrides) =>
  JSON.stringify({ schema: 1, overrides }, null, 2) + "\n";

const MODIFIER_KEYS = new Set(["meta", "control", "shift", "alt"]);

/** A recorded keydown → registry binding. Bare letters stay null so typing can't be shadowed. */
export function bindingFromKeydown(
  event: Pick<KeyboardEvent, "key" | "metaKey" | "ctrlKey" | "shiftKey" | "altKey">,
  platform: string,
): ShortcutBinding | null {
  const key = event.key.toLowerCase().replace(/^arrow/, "");
  if (MODIFIER_KEYS.has(key)) return null;
  const command = event.metaKey || (event.ctrlKey && platform !== "darwin");
  const ctrl = event.ctrlKey && platform === "darwin";
  if (!command && !ctrl && !event.altKey && !/^f([1-9]|1[0-9]|2[0-4])$/.test(key)) return null;
  return {
    key,
    ...(command ? { command: true } : {}),
    ...(ctrl ? { ctrl: true } : {}),
    ...(event.shiftKey ? { shift: true } : {}),
    ...(event.altKey ? { alt: true } : {}),
  };
}
