import { z } from "zod";
import { CloudProcessIdentitySchema, CloudSupervisorSchema } from "./coding-processes.js";
const id = z.string().uuid();
export const CloudListenerSchema = z
  .object({
    pid: z.number().int().positive(),
    startTicks: z
      .string()
      .max(20)
      .regex(/^[1-9][0-9]*$/),
    fd: z.number().int().nonnegative(),
    inode: z
      .string()
      .max(20)
      .regex(/^[1-9][0-9]*$/),
    port: z.number().int().min(1).max(65535),
  })
  .strict();
export const CloudPreviewBindingSchema = z
  .object({
    previewId: id,
    processId: id,
    execution: CloudProcessIdentitySchema.extend({
      commandId: z.string().min(1),
      supervisor: CloudSupervisorSchema,
    }).strict(),
    listener: CloudListenerSchema,
    url: z
      .string()
      .url()
      .refine((value) => {
        const url = new URL(value);
        return (
          url.protocol === "https:" &&
          !url.username &&
          !url.password &&
          !url.port &&
          url.pathname === "/" &&
          !url.search &&
          !url.hash
        );
      }),
  })
  .strict();

export type CloudListener = z.infer<typeof CloudListenerSchema>;
export type CloudPreviewBinding = z.infer<typeof CloudPreviewBindingSchema>;
export const NativeCloudPreviewParams = CloudPreviewBindingSchema.extend({ token: id }).strict();
export const NativeCloudPreviewCloseParams = z.object({ previewId: id, token: id }).strict();
export const CloudPreviewSchema = z
  .object({ previewId: id, processId: id, contentId: z.string().min(1).max(160), url: z.string().url() })
  .strict();
