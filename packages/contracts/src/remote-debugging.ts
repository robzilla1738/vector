import { z } from "zod";

/** Actual browser-owned loopback listener state; preferences alone are not an ACK. */
export const RemoteDebuggingStateSchema = z
  .object({
    available: z.boolean(),
    enabled: z.boolean(),
    managed: z.boolean(),
    allowed: z.boolean(),
    canChange: z.boolean(),
    state: z.enum(["unavailable", "managed-disabled", "off", "starting", "stopping", "listening", "failed"]),
    address: z.string().min(1).max(256).nullable(),
    port: z.number().int().min(1).max(65535).nullable(),
  })
  .strict()
  .superRefine((value, ctx) => {
    const listening = value.state === "listening";
    if (
      listening !== (value.address !== null && value.port !== null) ||
      (!listening && (value.address !== null || value.port !== null))
    )
      ctx.addIssue({ code: "custom", message: "Only an actual listening server has an address and port" });
  });
export type RemoteDebuggingState = z.infer<typeof RemoteDebuggingStateSchema>;
