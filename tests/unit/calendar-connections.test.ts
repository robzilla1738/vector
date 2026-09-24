import { afterEach, describe, expect, it } from "vitest";
import { CalendarConnectionService } from "../../apps/runtime/src/services/calendar-connections.js";
import { openDb } from "../../apps/runtime/src/store/db.js";
import { Repo } from "../../apps/runtime/src/store/repo.js";
import { EventBus } from "../../apps/runtime/src/events.js";
import { TaskService } from "../../apps/runtime/src/services/tasks.js";
import { makeInvoker, type Services } from "../../apps/runtime/src/api/handlers.js";
import { RunCoordinator } from "../../apps/runtime/src/agent/coordinator.js";
import type { ModelClient } from "../../apps/runtime/src/agent/model-client.js";
import type { Observation } from "@aux/contracts";
import type { NativeBridge } from "../../apps/runtime/src/native.js";

const scope = "https://www.googleapis.com/auth/calendar.readonly";
const endpoints = { auth: "https://provider.test/auth", token: "https://provider.test/token", revoke: "https://provider.test/revoke", calendar: "https://provider.test/calendar" };
const databases: ReturnType<typeof openDb>[] = [];
afterEach(() => { for (const db of databases.splice(0)) db.close(); });

function fixture(options: { denied?: boolean; rateLimited?: boolean; partial?: boolean; offline?: boolean; onEvents?: (signal: AbortSignal | null | undefined) => Promise<Response>; onRefresh?: (signal: AbortSignal | null | undefined) => Promise<Response> } = {}) {
  const db = openDb(":memory:"); databases.push(db);
  const repo = new Repo(db);
  const events = new EventBus(repo);
  const tasks = new TaskService(repo, events);
  const secrets = new Map<string, string>();
  const native = { available: () => true, storeSecret: async (name: string, value: string) => { if (value) secrets.set(name, value); else secrets.delete(name); return { ok: true as const }; }, readSecret: async (name: string) => ({ value: secrets.get(name) }) } as NativeBridge;
  const calls: { url: URL; init?: RequestInit }[] = [];
  const http: typeof fetch = async (input, init) => {
    const url = new URL(String(input)); calls.push({ url, init });
    if (options.offline) throw new TypeError("offline");
    if (url.pathname === "/token") {
      const body = new URLSearchParams(init?.body as URLSearchParams);
      if (body.get("grant_type") === "refresh_token") return options.onRefresh?.(init?.signal) ?? Response.json({ access_token: `renewed-${body.get("refresh_token")}`, expires_in: 3600 });
      const account = body.get("code")!;
      return Response.json({ access_token: `access-${account}`, refresh_token: `refresh-${account}`, scope: options.partial ? "openid" : scope, expires_in: 3600 });
    }
    if (url.pathname === "/calendar/users/me/calendarList/primary") {
      if (options.denied) return Response.json({}, { status: 403 });
      const account = String((init?.headers as Record<string, string>).Authorization).replace("Bearer access-", "");
      return Response.json({ id: `${account}@example.test`, summary: `Calendar ${account}`, primary: true });
    }
    if (url.pathname === "/calendar/calendars/primary/events") {
      if (options.rateLimited) return Response.json({}, { status: 429 });
      if (options.onEvents) return options.onEvents(init?.signal);
      const account = String((init?.headers as Record<string, string>).Authorization).replace(/^Bearer (?:access-|renewed-refresh-)/, "");
      return Response.json({ items: [{ id: `event-${account}`, summary: `Meeting ${account}`, htmlLink: `https://calendar.google.com/calendar/event?eid=${account}`,
        start: { dateTime: "2026-09-25T10:00:00Z" }, end: { dateTime: "2026-09-25T11:00:00Z" } }], nextPageToken: url.searchParams.has("pageToken") ? undefined : "next" });
    }
    if (url.pathname === "/revoke") return Response.json({});
    throw new Error(`Unexpected request ${url}`);
  };
  const service = new CalendarConnectionService({ repo, native, clientId: "desktop-client", fetch: http, endpoints });
  return { db, repo, events, tasks, secrets, calls, service };
}

async function connect(service: CalendarConnectionService, account: string) {
  const auth = await service.start();
  const url = new URL(auth.url);
  expect(url.searchParams.get("scope")).toBe(scope);
  expect(url.searchParams.get("code_challenge_method")).toBe("S256");
  expect(url.searchParams.get("code_challenge")).toBeTruthy();
  const callback = new URL(url.searchParams.get("redirect_uri")!);
  callback.searchParams.set("state", url.searchParams.get("state")!);
  callback.searchParams.set("code", account);
  return fetch(callback);
}

describe("outbound Google Calendar connection", () => {
  const makeTask = (tasks: TaskService, workspaceId: string, title: string) => tasks.create({ workspaceId, title,
    objective: `Prepare ${title}`, criteria: [{ criterionId: "brief", description: "Produce a sourced brief", verification: "manual" }] });
  it("isolates two accounts, paginates bounded reads, refreshes, and removes the revoked secret", async () => {
    const { db, secrets, calls, service } = fixture();
    try {
      expect((await connect(service, "alice")).status).toBe(200);
      expect((await connect(service, "bob")).status).toBe(200);
      const connections = service.list().connections;
      expect(connections.map(item => item.accountKey).sort()).toEqual(["alice@example.test", "bob@example.test"]);
      expect(JSON.stringify(db.prepare("SELECT * FROM calendar_connections").all())).not.toContain("refresh-alice");
      const alice = connections.find(item => item.accountKey === "alice@example.test")!;
      const query = { connectionId: alice.connectionId, timeMin: "2026-09-24T00:00:00Z", timeMax: "2026-09-30T00:00:00Z", limit: 25 };
      const first = await service.events(query);
      expect(first.events[0]?.title).toBe("Meeting alice");
      expect(first.events[0]?.source.accountKey).toBe("alice@example.test");
      expect(first.nextPageToken).toBe("next");
      expect((await service.events({ ...query, pageToken: first.nextPageToken })).nextPageToken).toBeUndefined();
      expect(calls.find(call => call.url.searchParams.get("pageToken") === "next")).toBeTruthy();
      const secretName = (db.prepare("SELECT secret_name FROM calendar_connections WHERE connection_id=?").get(alice.connectionId) as { secret_name: string }).secret_name;
      const secret = JSON.parse(secrets.get(secretName)!) as { accessToken: string; refreshToken: string; expiresAt: number };
      secrets.set(secretName, JSON.stringify({ ...secret, expiresAt: 0 }));
      expect((await service.events(query)).events[0]?.title).toBe("Meeting alice");
      expect(JSON.parse(secrets.get(secretName)!).accessToken).toBe("renewed-refresh-alice");
      expect(await service.revoke(alice.connectionId)).toEqual({ ok: true, providerRevocation: "confirmed" });
      expect(secrets.has(secretName)).toBe(false);
      await expect(service.events(query)).rejects.toThrow(/revoked/);
      expect(service.list().connections).toHaveLength(1);
    } finally { await service.close(); }
  });

  it("stops waiting for a shared token refresh when a task read is cancelled", async () => {
    let refreshStarted!: () => void, finishRefresh!: (response: Response) => void;
    const started = new Promise<void>(resolve => { refreshStarted = resolve; });
    const setup = fixture({ onRefresh: async () => { refreshStarted(); return new Promise<Response>(resolve => { finishRefresh = resolve; }); } });
    try {
      await connect(setup.service, "alice");
      const account = setup.service.list().connections[0]!;
      const secretName = (setup.db.prepare("SELECT secret_name FROM calendar_connections WHERE connection_id=?").get(account.connectionId) as { secret_name: string }).secret_name;
      const secret = JSON.parse(setup.secrets.get(secretName)!) as { accessToken: string; refreshToken: string; expiresAt: number };
      setup.secrets.set(secretName, JSON.stringify({ ...secret, expiresAt: 0 }));
      const abort = new AbortController();
      const read = setup.service.events({ connectionId: account.connectionId, timeMin: "2026-09-24T00:00:00Z", timeMax: "2026-09-30T00:00:00Z", limit: 10 }, undefined, abort.signal);
      await started;
      abort.abort();
      await expect(read).rejects.toMatchObject({ code: "cancelled" });
      expect(setup.calls.filter(call => call.url.pathname === "/calendar/calendars/primary/events")).toHaveLength(0);
      finishRefresh(Response.json({ access_token: "renewed-alice", expires_in: 3600 }));
    } finally { await setup.service.close(); }
  });

  it("rejects partial grants and organization denial without persisting credentials", async () => {
    for (const options of [{ partial: true }, { denied: true }]) {
      const { service, secrets } = fixture(options);
      try {
        expect((await connect(service, "alice")).status).toBe(400);
        expect(service.list().connections).toHaveLength(0);
        expect(secrets.size).toBe(0);
      } finally { await service.close(); }
    }
  });

  it("keeps account state intact on rate limit and offline failures", async () => {
    for (const option of ["rateLimited", "offline"] as const) {
      const faults: { rateLimited?: boolean; offline?: boolean } = {};
      const setup = fixture(faults);
      try {
        expect((await connect(setup.service, "alice")).status).toBe(200);
        const account = setup.service.list().connections[0]!;
        const query = { connectionId: account.connectionId, timeMin: "2026-09-24T00:00:00Z", timeMax: "2026-09-30T00:00:00Z", limit: 25 };
        faults[option] = true;
        await expect(setup.service.events(query)).rejects.toThrow();
        expect(setup.service.list().connections[0]?.state).toBe("active");
      } finally { await setup.service.close(); }
    }
  });

  it("cancels an in-flight read when its account is revoked", async () => {
    let reading!: () => void;
    const begun = new Promise<void>(resolve => { reading = resolve; });
    const setup = fixture({ onEvents: async signal => {
      reading();
      return new Promise<Response>((_resolve, reject) => signal?.addEventListener("abort", () => reject(new Error("aborted")), { once: true }));
    } });
    try {
      expect((await connect(setup.service, "alice")).status).toBe(200);
      const account = setup.service.list().connections[0]!;
      const read = setup.service.events({ connectionId: account.connectionId, timeMin: "2026-09-24T00:00:00Z", timeMax: "2026-09-30T00:00:00Z", limit: 25 });
      await begun;
      await setup.service.revoke(account.connectionId);
      await expect(read).rejects.toThrow(/cancelled/);
    } finally { await setup.service.close(); }
  });

  it("binds each account grant to exactly one saved task revision", async () => {
    const { service, tasks } = fixture();
    try {
      await connect(service, "alice"); await connect(service, "bob");
      const space = tasks.createWorkspace("Research");
      const firstTask = makeTask(tasks, space.workspaceId, "First meeting");
      const otherTask = makeTask(tasks, space.workspaceId, "Other meeting");
      const accounts = service.list().connections;
      const alice = accounts.find(item => item.accountKey === "alice@example.test")!;
      const bob = accounts.find(item => item.accountKey === "bob@example.test")!;
      const grant = service.grantTask(firstTask.taskId, firstTask.revision, alice.connectionId);
      expect(service.taskGrants(firstTask.taskId)).toEqual([grant]);
      const query = { taskId: firstTask.taskId, grantId: grant.grantId, timeMin: "2026-09-24T00:00:00Z", timeMax: "2026-09-30T00:00:00Z", limit: 25 };
      expect((await service.taskEvents(query)).events[0]?.source.accountKey).toBe("alice@example.test");
      await expect(service.taskEvents({ ...query, taskId: otherTask.taskId })).rejects.toThrow(/no active grant/);
      expect(() => service.grantTask(otherTask.taskId, 2, bob.connectionId)).toThrow(/revision/);
      tasks.update({ taskId: firstTask.taskId, expectedRevision: 1, objective: "Prepare a revised brief" });
      expect(service.taskGrants(firstTask.taskId)).toEqual([]);
      await expect(service.taskEvents(query)).rejects.toThrow(/no active grant/);
      const replacement = service.grantTask(firstTask.taskId, 2, bob.connectionId);
      expect((await service.taskEvents({ ...query, grantId: replacement.grantId })).events[0]?.source.accountKey).toBe("bob@example.test");
      expect(service.revokeTaskGrant(firstTask.taskId, replacement.grantId)).toEqual({ ok: true });
      await expect(service.taskEvents({ ...query, grantId: replacement.grantId })).rejects.toThrow(/no active grant/);
      const again = service.grantTask(firstTask.taskId, 2, bob.connectionId);
      await service.revoke(bob.connectionId);
      expect(service.taskGrants(firstTask.taskId)).toEqual([]);
      await expect(service.taskEvents({ ...query, grantId: again.grantId })).rejects.toThrow(/no active grant/);
    } finally { await service.close(); }
  });

  it("stops a task-scoped event read when its grant is revoked", async () => {
    let reading!: () => void;
    const begun = new Promise<void>(resolve => { reading = resolve; });
    const { service, tasks } = fixture({ onEvents: async signal => {
      reading();
      return new Promise<Response>((_resolve, reject) => signal?.addEventListener("abort", () => reject(new Error("aborted")), { once: true }));
    } });
    try {
      await connect(service, "alice");
      const space = tasks.createWorkspace("Research");
      const task = makeTask(tasks, space.workspaceId, "First meeting");
      const grant = service.grantTask(task.taskId, task.revision, service.list().connections[0]!.connectionId);
      const query = { taskId: task.taskId, grantId: grant.grantId, timeMin: "2026-09-24T00:00:00Z", timeMax: "2026-09-30T00:00:00Z", limit: 25 };
      const pending = service.taskEvents(query);
      await begun;
      service.revokeTaskGrant(task.taskId, grant.grantId);
      await expect(pending).rejects.toThrow(/cancelled/);
    } finally { await service.close(); }
  });

  it("exposes granted reads to a scoped agent but denies account management and unrelated tasks", async () => {
    const setup = fixture();
    try {
      await connect(setup.service, "alice"); await connect(setup.service, "bob");
      const space = setup.tasks.createWorkspace("Research");
      const task = makeTask(setup.tasks, space.workspaceId, "Authorized meeting");
      const other = makeTask(setup.tasks, space.workspaceId, "Unrelated meeting");
      const account = setup.service.list().connections.find(item => item.accountKey === "alice@example.test")!;
      const grant = setup.service.grantTask(task.taskId, task.revision, account.connectionId);
      const invoke = makeInvoker({ repo: setup.repo, events: setup.events, calendar: setup.service, pages: {} } as Services);
      const client = { external: true, connectionId: "external-client", scope: { kind: "task" as const, workspaceId: space.workspaceId, taskId: task.taskId } };
      expect(await invoke("calendar.taskGrants.list", { taskId: task.taskId }, client)).toEqual([grant]);
      const query = { taskId: task.taskId, grantId: grant.grantId, timeMin: "2026-09-24T00:00:00Z", timeMax: "2026-09-30T00:00:00Z", limit: 25 };
      expect((await invoke("calendar.taskEvents.list", query, client) as { events: { source: { accountKey: string } }[] }).events[0]?.source.accountKey).toBe("alice@example.test");
      await expect(invoke("calendar.taskEvents.list", { ...query, taskId: other.taskId }, client)).rejects.toMatchObject({ code: "permission_denied" });
      await expect(invoke("calendar.events.list", { connectionId: account.connectionId, timeMin: query.timeMin, timeMax: query.timeMax, limit: 25 }, client)).rejects.toMatchObject({ code: "permission_denied" });
      await expect(invoke("calendar.taskGrants.create", { taskId: task.taskId, expectedRevision: 1, connectionId: setup.service.list().connections.find(item => item.accountKey === "bob@example.test")!.connectionId }, client)).rejects.toMatchObject({ code: "permission_denied" });
    } finally { await setup.service.close(); }
  });

  it("lets the built-in planner read only its granted account and finish with a sourced brief", async () => {
    const setup = fixture();
    try {
      await connect(setup.service, "alice"); await connect(setup.service, "bob");
      const space = setup.tasks.createWorkspace("Research");
      const task = makeTask(setup.tasks, space.workspaceId, "Meeting brief");
      const grant = setup.service.grantTask(task.taskId, task.revision, setup.service.list().connections.find(item => item.accountKey === "alice@example.test")!.connectionId);
      const eventUrl = "https://calendar.google.com/calendar/event?eid=alice";
      const observation: Observation = { observationId: "o1", pageId: "p1", documentEpoch: 1, revision: 1, observedAt: Date.now(), scope: "full",
        content: { url: "https://notes.example.test/", title: "Notes", text: "Meeting brief", viewport: { width: 800, height: 600, scale: 1 },
          scroll: { x: 0, y: 0, maxY: 0 }, frames: [], headings: [], elements: [], formFields: [], tables: [], links: [], dialogs: [], truncated: false,
          stats: { elementsTotal: 0, elementsShown: 0, textChars: 13, approxTokens: 4 } } };
      const prompts: string[] = [];
      let calls = 0;
      const model: ModelClient = { generateStructured: async options => {
        prompts.push(options.prompt);
        const object = calls++ === 0
          ? { status: "source", message: "Reading Calendar", sourceRequest: { kind: "calendar.events.list", grantId: grant.grantId,
            timeMin: "2026-09-24T00:00:00Z", timeMax: "2026-09-30T00:00:00Z", limit: 10 } }
          : { status: "done", message: "Brief ready", result: { report: `- Meeting alice [source](${eventUrl})` } };
        return { object: options.schema.parse(object), durationMs: 1 };
      }, generateText: async () => ({ text: "", durationMs: 1 }), listModels: async () => [] };
      const coordinator = new RunCoordinator({ repo: setup.repo, events: setup.events, calendar: setup.service,
        pages: { observe: async () => observation } as never, model: () => model, defaultModel: () => "fixture",
        recoveryModel: () => undefined, recordModelCall: () => {} });
      const run = await coordinator.start({ goal: "Prepare a sourced meeting brief", pageIds: ["p1"], taskId: task.taskId, taskRevision: task.revision });
      for (let attempt = 0; attempt < 200 && !["completed", "failed", "partially_completed"].includes(setup.repo.getRun(run.runId)!.status); attempt++)
        await new Promise(resolve => setTimeout(resolve, 10));
      const result = setup.repo.getRun(run.runId)!;
      expect(result.status, result.error).toBe("completed");
      expect(result.result?.report).toContain(eventUrl);
      expect(prompts[0]).toContain(grant.grantId);
      expect(prompts[1]).toContain("Meeting alice");
      expect(prompts.join(" ")).not.toContain("Meeting bob");
      expect(setup.repo.listSteps(run.runId).map(step => step.op)).toContain("calendar.events.list");
    } finally { await setup.service.close(); }
  });

  it("stops a built-in Calendar source read when the task run is cancelled", async () => {
    let reading!: () => void, stopped!: () => void;
    const begun = new Promise<void>(resolve => { reading = resolve; });
    const aborted = new Promise<void>(resolve => { stopped = resolve; });
    const setup = fixture({ onEvents: async signal => {
      reading();
      return new Promise<Response>((_resolve, reject) => signal?.addEventListener("abort", () => { stopped(); reject(new Error("aborted")); }, { once: true }));
    } });
    try {
      await connect(setup.service, "alice");
      const space = setup.tasks.createWorkspace("Research");
      const task = makeTask(setup.tasks, space.workspaceId, "Meeting brief");
      const grant = setup.service.grantTask(task.taskId, task.revision, setup.service.list().connections[0]!.connectionId);
      const observation = { observationId: "o1", pageId: "p1", documentEpoch: 1, revision: 1, observedAt: Date.now(), scope: "full", content: {
        url: "https://notes.example.test/", title: "Notes", text: "Meeting brief", viewport: { width: 800, height: 600, scale: 1 },
        scroll: { x: 0, y: 0, maxY: 0 }, frames: [], headings: [], elements: [], formFields: [], tables: [], links: [], dialogs: [], truncated: false,
        stats: { elementsTotal: 0, elementsShown: 0, textChars: 13, approxTokens: 4 } } } as Observation;
      const model: ModelClient = { generateStructured: async options => ({ object: options.schema.parse({ status: "source", message: "Reading Calendar",
        sourceRequest: { kind: "calendar.events.list", grantId: grant.grantId, timeMin: "2026-09-24T00:00:00Z", timeMax: "2026-09-30T00:00:00Z" } }), durationMs: 1 }),
        generateText: async () => ({ text: "", durationMs: 1 }), listModels: async () => [] };
      const coordinator = new RunCoordinator({ repo: setup.repo, events: setup.events, calendar: setup.service,
        pages: { observe: async () => observation } as never, model: () => model, defaultModel: () => "fixture",
        recoveryModel: () => undefined, recordModelCall: () => {} });
      const run = await coordinator.start({ goal: "Read Calendar", pageIds: ["p1"], taskId: task.taskId, taskRevision: task.revision });
      await begun;
      coordinator.cancel(run.runId);
      await aborted;
      expect(setup.repo.getRun(run.runId)?.status).toBe("cancelled");
      expect(setup.repo.listSteps(run.runId)).toEqual([]);
    } finally { await setup.service.close(); }
  });
});
