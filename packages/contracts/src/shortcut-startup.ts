import { STARTUP_COMMANDS, type StartupCommandDef } from "./command-routing.generated.js";
import { effectiveBindings, type ShortcutOverrides } from "./shortcut-bindings.js";

/** Synchronous original-order routing, including remaps for initially unbound commands. */
export function effectiveShortcutBindings(overrides?: ShortcutOverrides | null): StartupCommandDef[] {
  return effectiveBindings<StartupCommandDef>(STARTUP_COMMANDS, overrides);
}
