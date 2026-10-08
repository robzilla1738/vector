import type { ReplHostDeps } from "../agent/loop/repl.js";
import type { LoopToolResult } from "../agent/loop/types.js";

/** Immutable identity shared by the actual original-run executor and SDK host. */
export interface CloudExecutionContext {
  runId: string;
  threadId: string;
  turnId: string;
}

/** The real cloud REPL boundary; VercelSandboxExecutor implements this contract. */
export interface CloudReplExecutor {
  preview?(
    ctx: CloudExecutionContext,
    input: { processId: string; port: number },
    token: string,
    signal?: AbortSignal,
  ): Promise<import("zod").infer<typeof import("@aux/contracts/cloud-preview").CloudPreviewSchema>>;
  closePreview?(ctx: CloudExecutionContext, previewId: string, token: string): Promise<{ closed: true }>;
  admitPreview?(previewId: string, token: string): Promise<boolean>;
  processes?(
    ctx: CloudExecutionContext,
    signal?: AbortSignal,
  ): Promise<import("./cloud-processes.js").CloudCodingProcesses>;
  files?(
    ctx: CloudExecutionContext,
    signal?: AbortSignal,
  ): Promise<import("./coding-files.js").CodingFilesService>;
  eval(
    ctx: CloudExecutionContext,
    deps: ReplHostDeps,
    code: string,
    opts?: { pageId?: string; deadlineMs?: number; yieldTimeMs?: number },
  ): Promise<LoopToolResult>;
  wait(
    ctx: CloudExecutionContext,
    cellId: string,
    yieldTimeMs?: number,
    terminate?: boolean,
  ): Promise<LoopToolResult>;
  hasOpen(runId: string): boolean;
  prepareFinish(runId: string, cancellation: AbortSignal): Promise<void>;
  finishRun(runId: string): Promise<void>;
  closeRun(runId: string): Promise<void>;
  recoverReview?(
    ctx: CloudExecutionContext,
    request: import("@aux/contracts").Suspension["request"],
    target: "local" | "cloud",
  ): Promise<void>;
}
