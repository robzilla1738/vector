import { z } from "zod";
import type { ShortcutBinding, ShortcutOverrides } from "./shortcut-defs.js";
import { shortcutInventorySize } from "./shortcut-defs.js";

export * from "./shortcut-defs.js";

// Validation lives apart from the definitions: shortcut-defs.ts has no zod,
// so the renderer's startup chunk can match chords without it.
export const ShortcutBindingSchema: z.ZodType<ShortcutBinding> = z.object({
  key: z.string().min(1).max(32),
  command: z.boolean().optional(),
  shift: z.boolean().optional(),
  alt: z.boolean().optional(),
  ctrl: z.boolean().optional(),
  platforms: z.array(z.string().min(1).max(16)).min(1).max(4).optional(),
});

export const ShortcutOverridesSchema: z.ZodType<ShortcutOverrides> = z.record(
  z.string().min(1).max(64),
  z.union([z.array(ShortcutBindingSchema).max(4), z.null()]),
).refine(overrides => ["darwin", "win32", "linux"].every(platform => shortcutInventorySize(overrides, platform) <= 512),
  "Shortcuts exceed the native limit of 512 reserved and active bindings.");
