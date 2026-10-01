import { expect, it } from "vitest";
import { COMMANDS, SHORTCUTS, matchShortcut, shortcutConflicts } from "@aux/contracts";

it("keeps the command-derived shortcut inventory unique and within the native row cap", () => {
  expect(new Set(COMMANDS.map(command => command.id)).size).toBe(COMMANDS.length);
  expect(shortcutConflicts(SHORTCUTS)).toEqual([]);
  expect(SHORTCUTS.reduce((count, command) => count + command.bindings.length, 0)).toBeLessThanOrEqual(512);
  expect(SHORTCUTS.map(command => command.id)).toEqual(COMMANDS.map(command => command.id));
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
