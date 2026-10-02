import { AuxError, type RpcChannel } from "@aux/contracts";
import { z } from "zod";
import type { Repo } from "../store/repo.js";
import type { RunService } from "./runs.js";
import type { TaskService } from "./tasks.js";
import type { PageService } from "./pages.js";

/** Evidence from the actual paused coordinator boundary, not the pause RPC ACK. */
export function readNativeSubagentPreparation(deps: {
  repo: Repo;
  runs: RunService;
  tasks: TaskService;
  pages: PageService;
}) {
  const refused = () => ({ producer: "aux-runtime-subagent-preparation", version: 1, status: "refused" });
  const controls = [...deps.runs.coordinator.controls];
  if (controls.length > 64) return refused();
  const candidates = [];
  const owners = deps.runs.pageOwnership.snapshot();
  for (const [runId, control] of controls) {
    if (
      !control.paused ||
      control.abort.signal.aborted ||
      control.deadlineHit ||
      deps.runs.coordinator.ownsPages(runId)
    )
      continue;
    const run = deps.repo.getRun(runId);
    if (
      !run ||
      run.status !== "paused" ||
      !run.config?.taskId ||
      !run.config.taskRevision ||
      !run.config.contextWorkspaceId ||
      run.pageIds.length !== 5 ||
      run.config.isolatedPageSources?.length !== 5 ||
      run.config.maxTokens === undefined ||
      run.config.maxTokens < 250000 ||
      run.config.maxCostUsd === undefined ||
      run.config.maxCostUsd < 5 ||
      run.config.deadlineMs === undefined ||
      run.config.deadlineMs < 180000
    )
      continue;
    const deadlineAt = run.createdAt + run.config.deadlineMs;
    if (Date.now() >= deadlineAt || new Set(run.pageIds).size !== 5) continue;
    try {
      const task = deps.tasks.get(run.config.taskId);
      if (
        task.state !== "open" ||
        task.revision !== run.config.taskRevision ||
        task.workspaceId !== run.config.contextWorkspaceId
      )
        continue;
      const pages = run.config.isolatedPageSources.map((source) => {
        if (
          !run.pageIds.includes(source.pageId) ||
          owners[source.pageId] ||
          !task.resources.some(
            (resource) =>
              resource.kind === "page" &&
              resource.locator === source.sourcePageId &&
              resource.access === "read",
          )
        )
          throw new AuxError("conflict", "Parent source scope changed.");
        const page = deps.pages.get(source.pageId),
          human = deps.pages.get(source.sourcePageId);
        if (
          !page.ownedByRuntime ||
          human.ownedByRuntime ||
          !page.sessionId ||
          !human.sessionId ||
          page.url !== source.url ||
          human.url !== source.url ||
          !Number.isSafeInteger(page.documentEpoch) ||
          !Number.isSafeInteger(human.documentEpoch) ||
          !deps.pages.isAttached(page.pageId) ||
          !deps.pages.isAttached(human.pageId)
        )
          throw new AuxError("conflict", "Parent source attachment changed.");
        return {
          pageId: page.pageId,
          sessionId: page.sessionId,
          documentEpoch: page.documentEpoch,
          sourcePageId: human.pageId,
          sourceSessionId: human.sessionId,
          sourceDocumentEpoch: human.documentEpoch,
        };
      });
      if (
        new Set(pages.map((page) => page.pageId)).size !== 5 ||
        new Set(pages.map((page) => page.sourcePageId)).size !== 5
      )
        continue;
      candidates.push({
        parentRunId: runId,
        taskId: task.taskId,
        taskRevision: task.revision,
        workspaceId: task.workspaceId,
        deadlineAt,
        pages,
      });
    } catch (error) {
      if (!(error instanceof AuxError) || !["not_found", "conflict"].includes(error.code)) throw error;
    }
  }
  const observedAt = Date.now();
  if (candidates.length !== 1 || candidates[0]!.deadlineAt <= observedAt) return refused();
  return {
    producer: "aux-runtime-subagent-preparation",
    version: 1,
    status: "ready",
    observedAt,
    ...candidates[0]!,
  };
}

export function registerNativeSubagentPreparation(
  channel: RpcChannel,
  deps: Parameters<typeof readNativeSubagentPreparation>[0],
) {
  channel.onMethod("performance.subagentPreparation", (raw) => {
    z.object({}).strict().parse(raw);
    return readNativeSubagentPreparation(deps);
  });
}
