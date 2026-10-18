import { z } from "zod";

export const DownloadsRemoveParams = z.object({
  ids: z.array(z.string().min(1).max(200)).min(1).max(200),
});
