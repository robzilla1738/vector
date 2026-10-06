import { z } from "zod";

/** Fixed own-shell observation, advertised only by an opted-in native test build. */
export const NativeAppearanceSnapshotSchema = z
  .object({
    producer: z.literal("aux-native-appearance-snapshot"),
    version: z.literal(1),
    pid: z.number().int().positive(),
    windowId: z.number().int().positive(),
    frame: z
      .object({
        x: z.number().finite(),
        y: z.number().finite(),
        width: z.number().finite().positive(),
        height: z.number().finite().positive(),
      })
      .strict(),
    observedAtUnixMs: z.number().finite().nonnegative(),
    windowKind: z.enum(["normal", "private", "quick-ask", "little"]),
    nativeTheme: z.enum(["light", "dark"]).nullable(),
    backing: z.enum(["solid", "liquid-glass", "visual-effect"]).nullable(),
    material: z.enum(["solid", "liquid-glass", "titlebar", "sidebar", "under-window"]).nullable(),
    shell: z
      .object({
        theme: z.enum(["light", "dark"]).nullable(),
        layout: z.enum(["vertical", "horizontal"]).nullable(),
        sidebarAppearance: z.enum(["translucent", "solid"]).nullable(),
        systemDark: z.boolean(),
        reduceMotion: z.boolean(),
        reduceTransparency: z.boolean(),
      })
      .strict(),
  })
  .strict();
