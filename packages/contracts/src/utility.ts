import { z } from "zod";

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
