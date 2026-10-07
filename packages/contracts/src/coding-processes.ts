import { z } from "zod";

export const BackgroundStartSchema = z
  .object({
    command: z.string().trim().min(1).max(8192),
    workdir: z.string().min(1).max(4096).optional(),
    network: z.boolean().optional(),
  })
  .strict();
export type BackgroundStart = z.infer<typeof BackgroundStartSchema>;
export interface CodingProcessReceipt {
  processId: string;
  runId: string;
  actionId: string;
  requestHash: string;
  command: string;
  workdir: string;
  startedAt: number;
  state: "starting" | "running" | "completed" | "failed" | "stopped" | "uncertain" | "interrupted";
  reconciledAt?: number;
  logDigest?: string;
  pid?: number;
  identity?: string;
  endedAt?: number;
  exitCode?: number | null;
  signal?: string | null;
  stdout?: string;
  stderr?: string;
  outputTruncated?: boolean;
  timedOut?: boolean;
  logPath: string;
  artifactId?: string;
  undoAvailable: false;
}
