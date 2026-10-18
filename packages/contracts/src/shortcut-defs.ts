import { COMMANDS, type CommandDef } from "./commands.js";

import { effectiveBindings, type ShortcutBinding, type ShortcutOverrides } from "./shortcut-bindings.js";
export * from "./shortcut-bindings.js";

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
  id: command.id,
  label: command.label,
  bindings: command.bindings,
  ...(command.intercept ? { intercept: true } : {}),
  ...(command.focusShell ? { focusShell: true } : {}),
}));

export const shortcutById = (id: string, defs: readonly ShortcutCommandDef[] = SHORTCUTS) =>
  defs.find((def) => def.id === id);

/** Defaults layered with the person's saved overrides. */
export function effectiveShortcuts(overrides?: ShortcutOverrides | null): ShortcutCommandDef[] {
  return effectiveBindings(SHORTCUTS, overrides);
}

/** Native reserves default chords before installing the effective replacement inventory. */
export function shortcutInventorySize(overrides: ShortcutOverrides, platform: string): number {
  return [...SHORTCUTS, ...effectiveShortcuts(overrides)].reduce(
    (count, command) =>
      count +
      command.bindings.filter((binding) => !binding.platforms || binding.platforms.includes(platform)).length,
    0,
  );
}
