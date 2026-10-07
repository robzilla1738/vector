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
  closeRun(runId: string): Promise<void>;
  recoverReview?(
    ctx: CloudExecutionContext,
    request: import("@aux/contracts").Suspension["request"],
    target: "local" | "cloud",
  ): Promise<void>;
}
