import { expect, it } from "vitest";
import { COMMANDS, SHORTCUTS, effectiveShortcuts, matchShortcut, shortcutConflicts, ShortcutOverridesSchema, shortcutInventorySize, type ShortcutOverrides } from "@aux/contracts";

it("keeps the command-derived shortcut inventory unique and within the native row cap", () => {
  expect(new Set(COMMANDS.map(command => command.id)).size).toBe(COMMANDS.length);
  expect(shortcutConflicts(SHORTCUTS)).toEqual([]);
  expect(SHORTCUTS.reduce((count, command) => count + command.bindings.length, 0)).toBeLessThanOrEqual(512);
  expect(SHORTCUTS.map(command => command.id)).toEqual(COMMANDS.map(command => command.id));
});

it("refuses oversized shortcut settings before persistence while retaining four bindings per command", () => {
  const oversized: ShortcutOverrides = Object.fromEntries(COMMANDS.map(command => [command.id,
    Array.from({ length: 4 }, (_, index) => ({ key: `F${index + 1}`, ctrl: true }))]));
  expect(ShortcutOverridesSchema.safeParse(oversized).success).toBe(false);
  const bounded: ShortcutOverrides = Object.fromEntries(COMMANDS.map(command => [command.id, null]));
  const binding = { key: "F12", ctrl: true };
  for (const command of COMMANDS) {
    const rows = [];
    for (let index = 0; index < 4; index++) {
      rows.push(binding);
      bounded[command.id] = rows;
      if (!ShortcutOverridesSchema.safeParse(bounded).success) {
        rows.pop();
        break;
      }
    }
  }
  expect(ShortcutOverridesSchema.safeParse(bounded).success).toBe(true);
  expect(Math.max(...["darwin", "win32", "linux"].map(platform => shortcutInventorySize(bounded, platform)))).toBe(512);
  const available = COMMANDS.find(command => (bounded[command.id]?.length ?? 0) < 4)!;
  bounded[available.id] = [...(bounded[available.id] ?? []), binding];
  expect(ShortcutOverridesSchema.safeParse(bounded).success).toBe(false);
});

it("reserves macOS app switching while assigning the plan's browser chords", () => {
  const chord = (key: string, modifiers = {}) => matchShortcut(SHORTCUTS, { key, meta: true, shift: false, alt: false, ...modifiers }, { platform: "darwin" })?.id;
  expect(chord("tab")).toBeUndefined();
  expect(chord("c", { shift: true })).toBe("copy-url");
  expect(chord("c", { alt: true })).toBe("inspect-element");
  expect(chord("d", { shift: true })).toBe("pin-tab");
  expect(chord("b", { shift: true })).toBe("minimal-ui");
  expect(chord("2", { meta: false, ctrl: true, alt: true })).toBe("profile-2");
  expect(chord("2", { meta: false, ctrl: true })).toBe("space-2");
});

it("matches produced shifted split keys while removing all default aliases after a rebind", () => {
  const event = (key: string) => ({ key, meta: false, ctrl: true, shift: true, alt: false });
  for (const [base, produced, id] of [["=", "+", "split-add"], ["-", "_", "split-close"], ["]", "}", "split-next"], ["[", "{", "split-previous"], ["\\", "|", "split-swap"]]) {
    expect(matchShortcut(SHORTCUTS, event(base!), { platform: "darwin" })?.id).toBe(id);
    expect(matchShortcut(SHORTCUTS, event(produced!), { platform: "darwin" })?.id).toBe(id);
  }
  const rebound = effectiveShortcuts({ "split-add": [{ key: "F12", ctrl: true }] });
  expect(matchShortcut(rebound, event("+"), { platform: "darwin" })).toBeUndefined();
  expect(matchShortcut(rebound, event("="), { platform: "darwin" })).toBeUndefined();
});
