import { z } from "zod";

/** A document-registered WebMCP tool, as the browser lists it. */
export const WebmcpToolSchema = z
  .object({
    name: z.string(),
    description: z.string(),
    title: z.string().optional(),
    readOnly: z.boolean(),
    consequential: z.boolean(),
  })
  .strict();
export type WebmcpTool = z.infer<typeof WebmcpToolSchema>;

export const WebmcpCallResultSchema = z
  .object({
    result: z.string().nullable(),
    success: z.boolean(),
  })
  .strict();
export type WebmcpCallResult = z.infer<typeof WebmcpCallResultSchema>;
