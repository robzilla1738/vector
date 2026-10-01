import type { z } from "zod";
import type { NightShiftSettingsSchema } from "./night-shift.js";

export const DEFAULT_NIGHT_SHIFT = { enabled: false, start: "00:00", end: "08:00", nightlyUsd: 2, perTaskUsd: 0.5, requireAC: true } satisfies z.infer<typeof NightShiftSettingsSchema>;
