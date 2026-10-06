import { useCallback } from "react";
import { bindingLabel, effectiveShortcuts, type ShortcutOverrides } from "@aux/contracts/shortcut-defs";
import { bridge } from "./bridge";
import { useStore } from "./store";

/** Display chord for a command after the person's remaps; "" when it has no binding on this platform. */
export function shortcutLabel(
  commandId: string,
  overrides?: ShortcutOverrides | null,
  platform = bridge.platform,
): string {
  const def = effectiveShortcuts(overrides).find((item) => item.id === commandId);
  const binding = def?.bindings.find((b) => !b.platforms || b.platforms.includes(platform));
  return binding ? bindingLabel(binding, platform) : "";
}

const useOverrides = () => useStore((s) => s.settings?.shortcutOverrides as ShortcutOverrides | undefined);

export function useShortcutLabel(commandId: string): string {
  return shortcutLabel(commandId, useOverrides());
}

/** For lists built in one pass (palette commands, menus). */
export function useShortcutLabels(): (commandId: string) => string {
  const overrides = useOverrides();
  return useCallback((commandId: string) => shortcutLabel(commandId, overrides), [overrides]);
}

/** "Label (⌘K)", or just the label when the command is unbound. */
export const withShortcut = (label: string, chord: string) => (chord ? `${label} (${chord})` : label);
