import { afterEach, expect, it } from "vitest";
import { PageTargetSchema, type AgentPolicySettings } from "@aux/contracts";
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
const cleanup: Array<() => void> = [];
afterEach(() =>
  cleanup
    .splice(0)
    .reverse()
    .forEach((dispose) => dispose()),
);
function fixture() {
  const db = openDb(":memory:");
  cleanup.push(() => db.close());
  const repo = new Repo(db),
    events = new EventBus(repo),
    tasks = new TaskService(repo, events);
  const workspace = tasks.createWorkspace("Trusted task");
  const task = tasks.create({
    workspaceId: workspace.workspaceId,
    title: "Read",
    objective: "Read approved resource",
    criteria: [{ criterionId: "read", description: "Read", verification: "manual" }],
    resources: [{ resourceId: "approved-resource", kind: "page", locator: "a", label: "Approved page" }],
  });
  const turnMentions = new TurnMentionService({
    authorizeRead: (runId, pageId, taskRead): Promise<() => void> =>
      pages.authorizeAgentRead(runId, pageId, "page.read", taskRead),
    page: (id) => repo.getPage(id),
    organization: async () => ({ revision: 0, shared: null }),
    routine: () => undefined,
    connectors: () => ({ entries: [], access: [] }),
  });
  const externalSessions = new ExternalSessionService(repo, events, turnMentions);
  const agentConnections = new AgentConnectionService(repo);
  const connection = agentConnections.create({
    name: "Fixture",
    client: "codex",
    scope: { kind: "task", workspaceId: workspace.workspaceId, taskId: task.taskId },
    expiresAt: Date.now() + 60_000,
  }).connection;
  const client = { external: true as const, connectionId: connection.connectionId, scope: connection.scope };
  let rules: AgentPolicySettings["agentPolicies"] = [],
    duringCapture = () => {},
    captures = 0;
  const pages = new PageService({
    repo,
    events,
    turnMentions,
    native: new NullNativeBridge(),
    drivers: () => ({ aux: null, chrome: null }),
    safetyGate: new SafetyDispatchGate({
      approvals: new ApprovalStore(db),
      journal: new DecisionJournal(db),
      managedRules: () => [],
      agentPolicy: () => ({ agentMode: "auto", agentPolicyRevision: 0, agentPolicies: rules }),
      audit: () => {},
    }),
  });
  const page = PageTargetSchema.parse({
    pageId: "a",
    targetId: "target",
    backend: "aux",
    windowId: "main",
    url: "https://source.test/a",
    title: "Source",
    documentEpoch: 1,
    sessionId: "synthetic-source-attachment",
    lastRevision: 0,
    viewStatus: "visible",
    lifecycle: "live",
    controller: "none",
    controllerEpoch: 0,
    ownedByRuntime: false,
    createdAt: 1,
    lastActiveAt: 1,
  });
  repo.upsertPage(page);
  pages.capture = async () => {
    captures++;
    duringCapture();
    return {
      dataUrl: "data:image/png;base64,AA",
      width: 1,
      height: 1,
      scale: 1,
      documentEpoch: page.documentEpoch,
      url: page.url,
      capturedAt: Date.now(),
      viewport: { width: 1, height: 1, scale: 1 },
      imageWidth: 1,
      imageHeight: 1,
      artifactId: undefined,
    };
  };
  const invoke = makeInvoker({
    repo,
    events,
    pages,
    turnMentions,
    externalSessions,
    agentConnections,
    runs: { pageOwnership: new PageOwnership() },
    settings: { agentPolicy: () => ({ agentMode: "auto", agentPolicyRevision: 0, agentPolicies: rules }) },
  } as unknown as Services);
  cleanup.push(() => {
    void invoke.dispose();
  });
  return {
    db,
    repo,
    task,
    tasks,
    externalSessions,
    pages,
    page,
    invoke,
    client,
    turnMentions,
    captures: () => captures,
    during: (callback: () => void) => {
      duringCapture = callback;
    },
    rules: (value: AgentPolicySettings["agentPolicies"]) => {
      rules = value;
    },
  };
}
it("a validated external task read uses honest resource provenance with zero ambient grants or mention seeds", async () => {
  const f = fixture();
  await expect(f.invoke("pages.capture", { pageId: "a" }, f.client)).resolves.toMatchObject({
    dataUrl: expect.any(String),
  });
  const row = f.db.prepare("SELECT decision_json FROM safety_decisions ORDER BY at DESC LIMIT 1").get() as {
    decision_json: string;
  };
  expect(JSON.parse(row.decision_json)).toMatchObject({
    status: "allow",
    authorizedBy: {
      authorizedBy: "task_resource",
      taskId: f.task.taskId,
      taskRevision: 1,
      pageId: "a",
      sessionId: f.page.sessionId,
      documentEpoch: 1,
      source: { kind: "resource", resourceId: "approved-resource" },
    },
  });
  const run = f.repo.conversationRuns(`external:${f.client.connectionId}`)[0]!;
  expect(f.turnMentions.has(run.runId)).toBe(false);
  expect(f.turnMentions.ownedPages(run.runId)).toEqual([]);
});
it.each(["revision", "resource", "ask", "block", "attachment"])(
  "a %s change during task capture withholds the result",
  async (change) => {
    const f = fixture();
    f.during(() => {
      if (change === "revision" || change === "resource")
        f.externalSessions.end(f.client.connectionId, "completed", "Person revises approved task");
      if (change === "revision")
        f.tasks.update({ taskId: f.task.taskId, expectedRevision: 1, title: "Revised task" });
      if (change === "resource")
        f.tasks.update({ taskId: f.task.taskId, expectedRevision: 1, resources: [] });
      if (change === "ask") f.rules([{ category: "read", site: "https://source.test", access: "ask" }]);
      if (change === "block") f.rules([{ category: "read", site: "https://source.test", access: "block" }]);
      if (change === "attachment") f.repo.upsertPage({ ...f.page, sessionId: "replacement" });
    });
    await expect(f.invoke("pages.capture", { pageId: "a" }, f.client)).rejects.toMatchObject({
      code: "permission_denied",
    });
    expect(f.captures()).toBe(1);
  },
);
it.each(["ask", "block"] as const)(
  "an explicit %s policy cannot be overridden by an approved task resource",
  async (access) => {
    const f = fixture();
    f.rules([{ category: "read", site: "https://source.test", access }]);
    await expect(f.invoke("pages.capture", { pageId: "a" }, f.client)).rejects.toMatchObject({
      code: access === "ask" ? "needs_input" : "permission_denied",
    });
    expect(f.captures()).toBe(0);
  },
);
it("an unapproved page cannot borrow another task resource's read authority", async () => {
  const f = fixture();
  f.repo.upsertPage({ ...f.page, pageId: "b", targetId: "other", sessionId: "other" });
  await expect(f.invoke("pages.capture", { pageId: "b" }, f.client)).rejects.toMatchObject({
    code: "permission_denied",
  });
  expect(f.captures()).toBe(0);
});

it("a person's narrower read mention retains the validated task read proof through the actual main hook", async () => {
  const f = fixture();
  await f.invoke("pages.capture", { pageId: "a" }, f.client);
  const run = f.repo.conversationRuns(`external:${f.client.connectionId}`)[0]!;
  const ref = {
    kind: "tab" as const,
    pageId: f.page.pageId,
    title: f.page.title,
    url: f.page.url,
    documentEpoch: f.page.documentEpoch,
    sessionId: f.page.sessionId!,
    access: "read" as const,
  };
  f.repo.saveRun({ ...run, config: { ...run.config, mentions: [ref] } });
  await f.turnMentions.begin(run.runId, [ref], [], {
    workspaceId: f.task.workspaceId,
    taskId: f.task.taskId,
    taskRevision: 1,
  });
  await expect(f.invoke("pages.capture", { pageId: "a" }, f.client)).resolves.toMatchObject({
    dataUrl: expect.any(String),
  });
  expect(f.captures()).toBe(2);
  expect(f.turnMentions.ownedPages(run.runId)).toEqual([]);
  await expect(
    f.invoke(
      "pages.execute",
      {
        taskId: f.task.taskId,
        expectedRevision: 1,
        program: { pageId: "a", steps: [{ id: "click", op: "click", target: "r1" }] },
      },
      f.client,
    ),
  ).rejects.toMatchObject({ code: "permission_denied" });
});

it.each([
  { pageId: "another-page", sessionId: "synthetic-source-attachment" },
  { pageId: "a", sessionId: "replacement-attachment" },
])("a per-step Gate cannot borrow a task read proof for $pageId/$sessionId", async (target) => {
  const f = fixture();
  const gate = new SafetyDispatchGate({
    approvals: new ApprovalStore(f.db),
    journal: new DecisionJournal(f.db),
    managedRules: () => [],
    agentPolicy: () => ({ agentMode: "auto", agentPolicyRevision: 0, agentPolicies: [] }),
    audit: () => {},
  });
  let checked = 0;
  await expect(
    gate.check({
      step: {
        id: "read",
        op: "waitFor",
        condition: { kind: "selector", selector: "#result", state: "visible" },
      },
      origin: new URL(f.page.url).origin,
      phase: "dispatch",
      context: {
        profileId: "default",
        scope: { kind: "task", id: f.task.taskId },
        actor: "external_token",
        turnId: "synthetic-turn",
        threadId: "synthetic-thread",
        ...target,
        taskRead: {
          provenance: {
            authorizedBy: "task_resource",
            taskId: f.task.taskId,
            taskRevision: f.task.revision,
            pageId: f.page.pageId,
            sessionId: f.page.sessionId!,
            documentEpoch: f.page.documentEpoch,
            source: { kind: "resource", resourceId: "approved-resource" },
          },
          check: () => {
            checked++;
          },
        },
      },
    }),
  ).rejects.toMatchObject({
    code: "permission_denied",
    message: expect.stringContaining("another step attachment"),
  });
  expect(checked).toBe(0);
  expect(f.db.prepare("SELECT COUNT(*) AS count FROM safety_decisions").get()?.count).toBe(0);
});
