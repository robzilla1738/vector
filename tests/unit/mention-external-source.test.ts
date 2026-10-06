import { afterEach, expect, it } from "vitest";
import { PageTargetSchema } from "@aux/contracts";
import { makeInvoker } from "../../apps/runtime/src/api/invoke.js";
import type { Services } from "../../apps/runtime/src/api/methods/context.js";
import { AgentConnectionService } from "../../apps/runtime/src/services/agent-connections.js";
import { ExternalSessionService } from "../../apps/runtime/src/services/external-sessions.js";
import { TaskService } from "../../apps/runtime/src/services/tasks.js";
import { TurnMentionService } from "../../apps/runtime/src/services/turn-mention-service.js";
import { PageService } from "../../apps/runtime/src/services/pages.js";
import { NullNativeBridge } from "../../apps/runtime/src/native.js";
import { SafetyDispatchGate } from "../../apps/runtime/src/safety/dispatch.js";
import { ApprovalStore } from "../../apps/runtime/src/safety/approval.js";
import { DecisionJournal } from "../../apps/runtime/src/safety/decide.js";
import { PageOwnership } from "../../apps/runtime/src/scheduler/page-ownership.js";
import { EventBus } from "../../apps/runtime/src/events.js";
import { Repo } from "../../apps/runtime/src/store/repo.js";
import { openDb } from "../../apps/runtime/src/store/db.js";
const cleanup: (() => void)[] = [];
afterEach(() =>
  cleanup
    .splice(0)
    .reverse()
    .forEach((fn) => fn()),
);
function fixture() {
  const db = openDb(":memory:");
  cleanup.push(() => db.close());
  const repo = new Repo(db),
    events = new EventBus(repo),
    tasks = new TaskService(repo, events);
  const workspace = tasks.createWorkspace("Fixture");
  const task = tasks.create({
    workspaceId: workspace.workspaceId,
    title: "Approved pages",
    objective: "Read approved resources",
    criteria: [{ criterionId: "read", description: "Read", verification: "manual" }],
    resources: ["a", "b"].map((pageId) => ({
      resourceId: pageId,
      kind: "page" as const,
      locator: pageId,
      label: pageId,
    })),
  });
  const page = PageTargetSchema.parse({
    pageId: "a",
    targetId: "a",
    backend: "aux",
    windowId: "main",
    url: "https://source.test/a",
    title: "A",
    documentEpoch: 1,
    sessionId: "fixture-attachment-a",
    lastRevision: 0,
    viewStatus: "visible",
    lifecycle: "live",
    controller: "none",
    controllerEpoch: 0,
    ownedByRuntime: false,
    createdAt: 1,
    lastActiveAt: 1,
  });
  const targets = new Map([
    ["a", page],
    [
      "b",
      {
        ...page,
        pageId: "b",
        targetId: "b",
        title: "B",
        url: "https://source.test/b",
        sessionId: "fixture-attachment-b",
      },
    ],
  ]);
  const turnMentions = new TurnMentionService({
    page: (id) => targets.get(id),
    organization: async () => ({ revision: 0, shared: null }),
    routine: () => undefined,
    connectors: () => ({ entries: [], access: [] }),
  });
  const externalSessions = new ExternalSessionService(repo, events, turnMentions);
  const agentConnections = new AgentConnectionService(repo);
  const connection = agentConnections.create({
    name: "Fixture agent",
    client: "codex",
    scope: { kind: "task", workspaceId: workspace.workspaceId, taskId: task.taskId },
    expiresAt: Date.now() + 60_000,
  }).connection;
  const client = { external: true as const, connectionId: connection.connectionId, scope: connection.scope };
  let captures = 0,
    executions = 0,
    duringCapture = () => {};
  const readPages = new PageService({
    repo,
    events,
    native: new NullNativeBridge(),
    drivers: () => ({ aux: null, chrome: null }),
    turnMentions,
    safetyGate: new SafetyDispatchGate({
      approvals: new ApprovalStore(db),
      journal: new DecisionJournal(db),
      managedRules: () => [],
      agentPolicy: () => ({ agentMode: "auto", agentPolicyRevision: 0, agentPolicies: [] }),
      audit: () => {},
    }),
  });
  const pages = {
    authorizeAgentRead: async (runId: string, pageId: string, action: string) => {
      repo.upsertPage(targets.get(pageId)!);
      return readPages.authorizeAgentRead(runId, pageId, action);
    },
    get: (id: string) => {
      const value = targets.get(id);
      if (!value) throw new Error("Missing fixture page");
      return value;
    },
    list: () => [...targets.values()],
    capture: async () => {
      captures++;
      duringCapture();
      return { dataUrl: "fixture-pixels" };
    },
    execute: async () => {
      executions++;
      return { status: "completed", steps: [] };
    },
  };
  const invoke = makeInvoker({
    repo,
    events,
    pages,
    turnMentions,
    externalSessions,
    agentConnections,
    runs: { pageOwnership: new PageOwnership() },
    settings: { agentPolicy: () => ({ agentMode: "auto", agentPolicyRevision: 0, agentPolicies: [] }) },
  } as unknown as Services);
  cleanup.push(() => {
    void invoke.dispose();
  });
  return {
    invoke,
    repo,
    task,
    tasks,
    client,
    externalSessions,
    turnMentions,
    targets,
    captures: () => captures,
    executions: () => executions,
    duringCapture: (hook: () => void) => {
      duringCapture = hook;
    },
    runId: () => repo.conversationRuns(`external:${connection.connectionId}`)[0]!.runId,
  };
}
it("first-class external sessions retain actual approved resources without empty mention grants", async () => {
  const f = fixture();
  expect(await f.invoke("pages.capture", { pageId: "a" }, f.client)).toEqual({ dataUrl: "fixture-pixels" });
  expect(f.captures()).toBe(1);
  expect(f.turnMentions.has(f.runId())).toBe(false);
  expect(f.turnMentions.ownedPages(f.runId())).toEqual([]);
  expect(await f.invoke("agent.tabs.list", { taskId: f.task.taskId, expectedRevision: 1 }, f.client)).toEqual(
    [
      { pageId: "a", title: "A", url: "https://source.test/a" },
      { pageId: "b", title: "B", url: "https://source.test/b" },
    ],
  );
});
it("current task revision changes withhold a pending resource capture", async () => {
  const f = fixture();
  f.duringCapture(() => {
    f.externalSessions.end(f.client.connectionId, "completed", "Person ended session");
    f.tasks.update({ taskId: f.task.taskId, expectedRevision: 1, title: "Changed approval" });
  });
  await expect(f.invoke("pages.capture", { pageId: "a" }, f.client)).rejects.toMatchObject({
    code: "permission_denied",
  });
  expect(f.captures()).toBe(1);
});
it("same-origin replacement documents and replacement attachments withhold resource captures", async () => {
  for (const change of ["document", "attachment"] as const) {
    const f = fixture();
    f.duringCapture(() => {
      const page = f.targets.get("a")!;
      f.targets.set(
        "a",
        change === "document" ? { ...page, documentEpoch: 2 } : { ...page, sessionId: "replacement" },
      );
    });
    await expect(f.invoke("pages.capture", { pageId: "a" }, f.client)).rejects.toMatchObject({
      code: "ref_stale",
    });
  }
});
it("a trusted person's explicit read mention narrows existing task resources and never promotes action access", async () => {
  const f = fixture();
  await f.invoke("pages.capture", { pageId: "a" }, f.client);
  const page = f.targets.get("a")!;
  const ref = {
    kind: "tab" as const,
    pageId: page.pageId,
    title: page.title,
    url: page.url,
    documentEpoch: page.documentEpoch,
    sessionId: page.sessionId!,
    access: "read" as const,
  };
  const runId = f.runId();
  f.repo.saveRun({ ...f.repo.getRun(runId)!, config: { ...f.repo.getRun(runId)!.config, mentions: [ref] } });
  await f.turnMentions.begin(runId, [ref], [], {
    workspaceId: f.task.workspaceId,
    taskId: f.task.taskId,
    taskRevision: 1,
  });
  await expect(f.invoke("pages.capture", { pageId: "b" }, f.client)).rejects.toMatchObject({
    code: "permission_denied",
  });
  await expect(
    f.invoke(
      "pages.execute",
      {
        program: { pageId: "a", steps: [{ id: "click", op: "click", target: "r1" }] },
        taskId: f.task.taskId,
        expectedRevision: 1,
      },
      f.client,
    ),
  ).rejects.toMatchObject({ code: "permission_denied" });
  expect(f.executions()).toBe(0);
  expect(f.captures()).toBe(1);
  f.turnMentions.end(runId);
  await expect(f.invoke("pages.capture", { pageId: "a" }, f.client)).rejects.toMatchObject({
    code: "permission_denied",
  });
});

it("ending the actual external session withholds its in-flight source result even without a task edit", async () => {
  const f = fixture();
  f.duringCapture(() => f.externalSessions.end(f.client.connectionId, "completed", "Person ended session"));
  await expect(f.invoke("pages.capture", { pageId: "a" }, f.client)).rejects.toMatchObject({
    code: "permission_denied",
  });
  expect(f.captures()).toBe(1);
});
