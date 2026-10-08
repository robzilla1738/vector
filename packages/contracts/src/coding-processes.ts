import { z } from "zod";
import { CloudCodingIdentitySchema } from "./coding-files.js";
export const CloudSupervisorSchema = z
  .object({
    pid: z.number().int().positive(),
    startTicks: z
      .string()
      .max(20)
      .regex(/^[1-9][0-9]*$/),
    groupPid: z.number().int().positive(),
    groupStartTicks: z
      .string()
      .max(20)
      .regex(/^[1-9][0-9]*$/),
  })
  .strict();
export type CloudSupervisor = z.infer<typeof CloudSupervisorSchema>;
export const CloudProcessIdentitySchema = CloudCodingIdentitySchema.extend({
  commandId: z.string().min(1).optional(),
  supervisor: CloudSupervisorSchema.optional(),
}).strict();
export type CloudProcessIdentity = z.infer<typeof CloudProcessIdentitySchema>;

export const BackgroundStartSchema = z
  .object({
    command: z.string().trim().min(1).max(8192),
    workdir: z.string().min(1).max(4096).optional(),
    network: z.boolean().optional(),
  })
  .strict();
export type BackgroundStart = z.infer<typeof BackgroundStartSchema>;
export interface CodingProcessReceipt {
  execution?: CloudProcessIdentity;
  /** Bounded remote output, protected with the receipt rather than a local plaintext log. */
  logText?: string;
  logTruncated?: boolean;
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
  logPath?: string;
  artifactId?: string;
  undoAvailable: false;
}
