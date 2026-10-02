import { AuxError, type RpcChannel } from "@aux/contracts";
import { z } from "zod";
import {
  currentPerformanceExecutions,
  observePerformanceExecutions,
} from "../agent/loop/performance-executions.js";
import type { Repo } from "../store/repo.js";
import type { RunService } from "./runs.js";
import type { SubagentService } from "./subagents.js";
import type { TaskService } from "./tasks.js";
import type { PageService } from "./pages.js";

/** Zero-selector native-host evidence. Never registered in the public API. */
export function readNativeSubagentWorkload(deps: {
  repo: Repo;
  runs: RunService;
  subagents: SubagentService;
  tasks: TaskService;
  pages: PageService;
}) {
  const refused = () => ({ producer: "aux-runtime-subagent-workload", version: 1, status: "refused" });
  const observed = observePerformanceExecutions();
  if (!observed) return refused();
  if (observed.length === 0) {
    // A refused/partial workload is never idle. Consult current durable work as
    // well as real coordinator controls before attesting an empty VM inventory.
    if (
      deps.repo.db
        .prepare("SELECT 1 FROM runs WHERE status IN ('queued','planning','running','needs_input') LIMIT 1")
        .get()
    )
      return refused();
    const controls = [...deps.runs.coordinator.controls];
    if (
      controls.length > 64 ||
      controls.some(
        ([runId, control]) =>
          !control.paused ||
          control.abort.signal.aborted ||
          control.deadlineHit ||
          deps.runs.coordinator.ownsPages(runId) ||
          deps.repo.getRun(runId)?.status !== "paused",
      )
    )
      return refused();
    return {
      producer: "aux-runtime-subagent-workload",
      version: 1,
      status: "idle",
      observedAt: Date.now(),
      activeExecutions: 0,
    };
  }
  const cells = currentPerformanceExecutions();
  if (!cells) return refused();
  try {
    const agents = cells.map((cell) => {
      const row = deps.repo.db.prepare("SELECT agent_id FROM subagents WHERE run_id=?").get(cell.runId) as
        { agent_id: string } | undefined;
      return row ? deps.subagents.get(row.agent_id) : undefined;
    });
    if (agents.some((agent) => !agent || agent.state !== "running" || agent.pageIds.length !== 1))
      return refused();
    const first = agents[0]!;
    if (agents.some((agent) => agent!.groupId !== first.groupId)) return refused();
    const view = deps.subagents.view(first.groupId);
    const parent = deps.repo.getRun(view.group.parentRunId);
    const now = Date.now();
    if (
      !parent ||
      parent.status !== "paused" ||
      deps.runs.coordinator.ownsPages(parent.runId) ||
      view.group.state !== "active" ||
      view.group.deadlineAt <= now ||
      view.reservedTokens + view.usedTokens > view.group.tokenBudget ||
      view.reservedCostUsd + view.usedCostUsd > view.group.costBudgetUsd ||
      !parent.config?.taskId ||
      !parent.config.taskRevision ||
      parent.config.contextWorkspaceId !== view.group.workspaceId ||
      view.agents.filter((agent) => agent.state === "running" || agent.state === "starting").length !== 5
    )
      return refused();
    const task = deps.tasks.get(parent.config.taskId);
    if (
      task.state !== "open" ||
      task.revision !== parent.config.taskRevision ||
      task.workspaceId !== view.group.workspaceId
    )
      return refused();
    const owners = deps.runs.pageOwnership.snapshot();
    const children = cells.map((cell, index) => {
      const agent = agents[index]!;
      const run = deps.repo.getRun(cell.runId);
      const requestedPageId = agent.pageIds[0]!;
      const source = parent.config?.isolatedPageSources?.find((source) => source.pageId === requestedPageId);
      const isolated = run?.config?.isolatedPageSources;
      const copy = isolated?.length === 1 ? isolated[0] : undefined;
      if (
        !run ||
        !source ||
        !copy ||
        copy.sourcePageId !== requestedPageId ||
        !["running", "planning"].includes(run.status) ||
        agent.runId !== cell.runId ||
        agent.sourceRunId !== parent.runId ||
        run.config?.contextWorkspaceId !== view.group.workspaceId ||
        run.pageIds.length !== 1 ||
        run.pageIds[0] !== copy.pageId ||
        !parent.pageIds.includes(requestedPageId) ||
        !task.resources.some(
          (resource) =>
            resource.kind === "page" &&
            resource.locator === source.sourcePageId &&
            resource.access === "read",
        )
      )
        throw new AuxError("conflict", "Subagent source lineage changed.");
      const pageId = copy.pageId;
      const page = deps.pages.get(pageId),
        requested = deps.pages.get(requestedPageId),
        human = deps.pages.get(source.sourcePageId);
      if (
        !page.ownedByRuntime ||
        !requested.ownedByRuntime ||
        human.ownedByRuntime ||
        page.url !== copy.url ||
        requested.url !== source.url ||
        human.url !== source.url ||
        owners[pageId]?.runId !== cell.runId ||
        owners[pageId]?.actor !== "coordinator" ||
        !page.sessionId ||
        !requested.sessionId ||
        !human.sessionId ||
        typeof page.documentEpoch !== "number" ||
        !Number.isSafeInteger(page.documentEpoch) ||
        page.documentEpoch < 0 ||
        typeof requested.documentEpoch !== "number" ||
        !Number.isSafeInteger(requested.documentEpoch) ||
        requested.documentEpoch < 0 ||
        typeof human.documentEpoch !== "number" ||
        !Number.isSafeInteger(human.documentEpoch) ||
        human.documentEpoch < 0 ||
        !deps.pages.isAttached(pageId) ||
        !deps.pages.isAttached(requestedPageId) ||
        !deps.pages.isAttached(human.pageId) ||
        cell.deadlineAt <= now
      )
        throw new AuxError("conflict", "Subagent workload authority changed.");
      return {
        ...cell,
        agentId: agent.agentId,
        sourceRunId: parent.runId,
        sourcePageId: human.pageId,
        sourceSessionId: human.sessionId,
        sourceDocumentEpoch: human.documentEpoch,
        requestedPageId,
        requestedSessionId: requested.sessionId,
        requestedDocumentEpoch: requested.documentEpoch,
        pageId,
        sessionId: page.sessionId,
        documentEpoch: page.documentEpoch,
      };
    });
    const observedAt = Date.now();
    if (
      new Set(children.map((child) => child.pageId)).size !== 5 ||
      children.some((child) => child.deadlineAt <= observedAt) ||
      view.group.deadlineAt <= observedAt
    )
      return refused();
    return {
      producer: "aux-runtime-subagent-workload",
      version: 1,
      status: "executing",
      observedAt,
      parentRunId: parent.runId,
      workspaceId: view.group.workspaceId,
      groupId: view.group.groupId,
      children,
    };
  } catch (error) {
    if (error instanceof AuxError && ["not_found", "conflict"].includes(error.code)) return refused();
    throw error;
  }
}

export function registerNativeSubagentWorkload(
  channel: RpcChannel,
  deps: Parameters<typeof readNativeSubagentWorkload>[0],
): void {
  channel.onMethod("performance.subagentWorkload", (raw) => {
    z.object({}).strict().parse(raw);
    return readNativeSubagentWorkload(deps);
  });
}
