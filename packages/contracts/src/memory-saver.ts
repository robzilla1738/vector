import { z } from "zod";

export const MemorySaverMinutesSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(15),
  z.literal(30),
  z.literal(60),
]);
export const MemorySaverSettingsSchema = z
  .object({
    minutes: MemorySaverMinutesSchema,
    managed: z.boolean(),
  })
  .strict();
export type MemorySaverSettings = z.infer<typeof MemorySaverSettingsSchema>;
