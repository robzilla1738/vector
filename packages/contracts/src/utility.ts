import { z } from "zod";

/** Only explicitly committed input reaches this classifier. */
export const UtilityIntentParamsSchema = z.object({ text: z.string().trim().min(1).max(4_000) }).strict();
export const UtilityIntentSchema = z.object({ kind: z.enum(["search", "chat"]) }).strict();
export const UtilityIntentResultSchema = z
  .object({
    kind: z.enum(["search", "chat"]).nullable(),
    source: z.enum(["preference", "model", "unavailable"]),
  })
  .strict();


/** Generated presentation text confers no action or source authority. */
export const WaitingPhraseSchema = z
  .string()
  .trim()
  .min(1)
  .max(96)
  .refine(
    (text) =>
      [...text].every((character) => {
        const code = character.codePointAt(0)!;
        return (
          code >= 32 &&
          code !== 127 &&
          !(code >= 0x202a && code <= 0x202e) &&
          !(code >= 0x2066 && code <= 0x2069)
        );
      }),
    "Use one plain text line.",
  );
