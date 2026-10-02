import { expect, it, vi } from "vitest";
import { EventBus, MockModelClient, openDb, Repo, RunCoordinator, TaskService } from "@aux/runtime";
import { PageOwnership } from "../../apps/runtime/dist/scheduler/page-ownership.js";
import {
  readNativeSubagentPreparation,
  registerNativeSubagentPreparation,
} from "../../apps/runtime/dist/services/native-subagent-preparation.js";
import { fixturePage, fixtureTurnMentions } from "../fixtures/turn-mentions.js";

it("refuses the actual pause ACK while model reply holds page leases, then observes the genuine paused boundary", async () => {
  const db = openDb(":memory:"),
    repo = new Repo(db),
    events = new EventBus(repo);
  const tasks = new TaskService(repo, events),
    workspace = tasks.createWorkspace("Disposable preparation");
  const sources = Array.from({ length: 5 }, (_, index) => ({
    sourcePageId: `human-${index}`,
    pageId: `protected-${index}`,
    url: `https://fixture.test/${index}`,
  }));
  const targets = sources.flatMap((source) => [
    {
      ...fixturePage(source.sourcePageId, source.url, 1),
      sessionId: `human-session-${source.sourcePageId}`,
      ownedByRuntime: false,
    },
    {
      ...fixturePage(source.pageId, source.url, 1),
      sessionId: `protected-session-${source.pageId}`,
      ownedByRuntime: true,
    },
  ]);
  const task = tasks.create({
    workspaceId: workspace.workspaceId,
    title: "Preparation task",
    objective: "Hold and pause",
    criteria: [{ criterionId: "one", description: "Release original page leases", verification: "test" }],
    resources: sources.map((source) => ({
      resourceId: source.sourcePageId,
      kind: "page",
      locator: source.sourcePageId,
      label: source.sourcePageId,
      access: "read",
    })),
  });
  const pages = {
    get: (pageId: string) => {
      const target = targets.find((page) => page.pageId === pageId);
      if (!target) throw new Error("unexpected fixture page");
      return target;
    },
    isAttached: () => true,
    livePageIds: () => targets.map((page) => page.pageId),
  };
  const ownership = new PageOwnership();
  let release!: () => void, entered!: () => void;
  const held = new Promise<void>((resolve) => {
      release = resolve;
    }),
    requested = new Promise<void>((resolve) => {
      entered = resolve;
    });
  const model = new MockModelClient().scriptToolSteps([{ text: "Held genuine model completion" }]);
  const next = model.toolCallStep.bind(model);
  model.toolCallStep = async (options) => {
    entered();
    await held;
    return next(options);
  };
  const coordinator = new RunCoordinator({
    repo,
    events,
    pages: pages as never,
    pageOwnership: ownership,
    turnMentions: fixtureTurnMentions((pageId) => pages.get(pageId)),
    model: () => model,
    defaultModel: () => "fixture",
    recoveryModel: () => undefined,
    recordModelCall: () => {},
  });
  const deps = {
    repo,
    tasks,
    pages,
    runs: { coordinator, pageOwnership: ownership },
  } as unknown as Parameters<typeof readNativeSubagentPreparation>[0];
  let runId: string | undefined;
  try {
    const run = await coordinator.start({
      goal: task.objective,
      pageIds: sources.map((source) => source.pageId),
      taskId: task.taskId,
      taskRevision: task.revision,
      contextWorkspaceId: workspace.workspaceId,
      engine: "agent-loop",
      maxTokens: 250000,
      maxCostUsd: 5,
      deadlineMs: 180000,
    });
    runId = run.runId;
    await requested;
    const current = repo.getRun(runId)!;
    current.config = { ...current.config, isolatedPageSources: sources };
    repo.saveRun(current);
    await coordinator.pause(runId);
    expect(repo.getRun(runId)?.status).toBe("paused");
    expect(coordinator.ownsPages(runId)).toBe(true);
    expect(readNativeSubagentPreparation(deps).status).toBe("refused");
    release();
    await vi.waitFor(() => expect(coordinator.ownsPages(runId!)).toBe(false));
    let handler!: (raw: unknown) => unknown;
    registerNativeSubagentPreparation(
      {
        onMethod: (_method: string, next: typeof handler) => {
          handler = next;
        },
      } as unknown as Parameters<typeof registerNativeSubagentPreparation>[0],
      deps,
    );
    expect(() => handler({ runId })).toThrow();
    expect(handler({})).toMatchObject({ status: "ready", parentRunId: runId });
    const ready = readNativeSubagentPreparation(deps);
    expect(ready.status).toBe("ready");
    expect(ready).toMatchObject({ parentRunId: runId, taskId: task.taskId, taskRevision: task.revision });
    const foreignRelease = ownership.tryAcquire({
      pageId: sources[0]!.pageId,
      actor: "external",
      runId: "foreign",
    });
    expect(readNativeSubagentPreparation(deps).status).toBe("refused");
    foreignRelease();
    const originalUrl = targets[0]!.url;
    targets[0]!.url = "https://changed.fixture.test/";
    expect(readNativeSubagentPreparation(deps).status).toBe("refused");
    targets[0]!.url = originalUrl;
    const originalSession = targets[0]!.sessionId;
    targets[0]!.sessionId = "";
    expect(readNativeSubagentPreparation(deps).status).toBe("refused");
    targets[0]!.sessionId = originalSession;
    expect(readNativeSubagentPreparation(deps).status).toBe("ready");
    const stale = repo.getRun(runId)!;
    stale.config = { ...stale.config, taskRevision: task.revision + 1 };
    repo.saveRun(stale);
    expect(readNativeSubagentPreparation(deps).status).toBe("refused");
    coordinator.controls.get(runId)!.abort.abort();
    expect(readNativeSubagentPreparation(deps).status).toBe("refused");
  } finally {
    release();
    if (runId) await coordinator.cancel(runId);
    db.close();
  }
});
