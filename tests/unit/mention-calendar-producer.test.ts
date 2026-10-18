import { afterEach, expect, it } from "vitest";
import { CalendarConnectionService } from "../../apps/runtime/src/services/calendar-connections.js";
import { openDb } from "../../apps/runtime/src/store/db.js";
import { Repo } from "../../apps/runtime/src/store/repo.js";
import { EventBus } from "../../apps/runtime/src/events.js";
import { TaskService } from "../../apps/runtime/src/services/tasks.js";
import { OperationService } from "../../apps/runtime/src/services/operations.js";
import type { NativeBridge } from "../../apps/runtime/src/native.js";

const scope = "https://www.googleapis.com/auth/calendar.readonly";
const endpoints = {
  auth: "https://provider.test/auth",
  token: "https://provider.test/token",
  revoke: "https://provider.test/revoke",
  calendar: "https://provider.test/calendar",
};
const databases: ReturnType<typeof openDb>[] = [];
afterEach(() => {
  for (const db of databases.splice(0)) db.close();
});

function fixture(
  options: {
    denied?: boolean;
    rateLimited?: boolean;
    partial?: boolean;
    offline?: boolean;
    onEvents?: (signal: AbortSignal | null | undefined) => Promise<Response>;
    onRefresh?: (signal: AbortSignal | null | undefined) => Promise<Response>;
  } = {},
) {
  const db = openDb(":memory:");
  databases.push(db);
  const repo = new Repo(db);
  const events = new EventBus(repo);
  const tasks = new TaskService(repo, events);
  const secrets = new Map<string, string>();
  const native = {
    available: () => true,
    storeSecret: async (name: string, value: string) => {
      if (value) secrets.set(name, value);
      else secrets.delete(name);
      return { ok: true as const };
    },
    readSecret: async (name: string) => ({ value: secrets.get(name) }),
  } as NativeBridge;
  const calls: { url: URL; init?: RequestInit }[] = [];
  const http: typeof fetch = async (input, init) => {
    const url = new URL(String(input));
    calls.push({ url, init });
    if (options.offline) throw new TypeError("offline");
    if (url.pathname === "/token") {
      const body = new URLSearchParams(init?.body as URLSearchParams);
      if (body.get("grant_type") === "refresh_token")
        return (
          options.onRefresh?.(init?.signal) ??
          Response.json({ access_token: `renewed-${body.get("refresh_token")}`, expires_in: 3600 })
        );
      const account = body.get("code")!;
      return Response.json({
        access_token: `access-${account}`,
        refresh_token: `refresh-${account}`,
        scope: options.partial ? "openid" : scope,
        expires_in: 3600,
      });
    }
    if (url.pathname === "/calendar/users/me/calendarList/primary") {
      if (options.denied) return Response.json({}, { status: 403 });
      const account = String((init?.headers as Record<string, string> | undefined)?.Authorization).replace(
        "Bearer access-",
        "",
      );
      return Response.json({ id: `${account}@example.test`, summary: `Calendar ${account}`, primary: true });
    }
    if (url.pathname === "/calendar/calendars/primary/events") {
      if (options.rateLimited) return Response.json({}, { status: 429 });
      if (options.onEvents) return options.onEvents(init?.signal);
      const account = String((init?.headers as Record<string, string> | undefined)?.Authorization).replace(
        /^Bearer (?:access-|renewed-refresh-)/,
        "",
      );
      return Response.json({
        items: [
          {
            id: `event-${account}`,
            summary: `Meeting ${account}`,
            htmlLink: `https://calendar.google.com/calendar/event?eid=${account}`,
            start: { dateTime: "2026-09-25T10:00:00Z" },
            end: { dateTime: "2026-09-25T11:00:00Z" },
          },
        ],
        nextPageToken: url.searchParams.has("pageToken") ? undefined : "next",
      });
    }
    if (url.pathname === "/revoke") return Response.json({});
    throw new Error(`Unexpected request ${url}`);
  };
  const service = new CalendarConnectionService({
    repo,
    native,
    clientId: "desktop-client",
    profileId: "profile-fixture",
    fetch: http,
    endpoints,
  });
  const operations = new OperationService({ repo, events, pages: {} as never, calendar: service });
  return { db, repo, events, tasks, secrets, calls, native, http, service, operations };
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

import { TurnMentionService } from "../../apps/runtime/src/services/turn-mention-service.js";
import { ConnectorCatalogService } from "../../apps/runtime/src/services/connectors.js";
import { OutboundMcpService } from "../../apps/runtime/src/services/outbound-mcp.js";
import { SettingsService } from "../../apps/runtime/src/services/settings.js";
function taskFixture(f: ReturnType<typeof fixture>) {
  const workspace = f.tasks.createWorkspace("Connector fixture");
  const task = f.tasks.create({
    workspaceId: workspace.workspaceId,
    title: "Read approved Calendar",
    objective: "Read Calendar",
    criteria: [{ criterionId: "read", description: "Read", verification: "manual" }],
  });
  const catalog = new ConnectorCatalogService({
    repo: f.repo,
    tasks: f.tasks,
    settings: new SettingsService(f.repo, "fixture-unused-settings", {}),
    calendar: f.service,
    mcp: new OutboundMcpService(f.repo),
  });
  const mentions = new TurnMentionService({
    page: () => undefined,
    organization: async () => ({ revision: 0, shared: null }),
    routine: () => undefined,
    connectors: (context) =>
      catalog.list({
        workspaceId: workspace.workspaceId,
        taskId: context.taskId,
        expectedRevision: context.taskRevision,
      }),
  });
  const operations = new OperationService({
    repo: f.repo,
    events: f.events,
    pages: {} as never,
    calendar: f.service,
    authorizeConnector: (runId, id, tool, dispatch) => mentions.useConnector(runId, id, tool, dispatch),
  });
  f.repo.saveRun({
    runId: "run",
    goal: "Read",
    pageIds: [],
    status: "running",
    createdAt: 1,
    config: { taskId: task.taskId, taskRevision: 1, contextWorkspaceId: workspace.workspaceId },
  });
  return {
    workspace,
    task,
    mentions,
    operations,
    ref: (connectionId: string) => ({
      kind: "connector" as const,
      connectorId: `calendar:${connectionId}`,
      authorityDigest: catalog.list({
        workspaceId: workspace.workspaceId,
        taskId: task.taskId,
        expectedRevision: task.revision,
      }).bindings[`calendar:${connectionId}`]!,
    }),
  };
}
it("actual Calendar operation retains approved no-mention task reads and narrows only a trusted connector turn", async () => {
  const f = fixture();
  try {
    await connect(f.service, "alice");
    await connect(f.service, "bob");
    const t = taskFixture(f),
      [alice, bob] = f.service.list().connections;
    const a = f.service.grantTask(t.task.taskId, 1, alice!.connectionId),
      b = f.service.grantTask(t.task.taskId, 1, bob!.connectionId);
    const query = {
      taskId: t.task.taskId,
      grantId: b.grantId,
      timeMin: "2026-09-24T00:00:00Z",
      timeMax: "2026-09-30T00:00:00Z",
      limit: 25,
    };
    expect((await t.operations.invokeCalendarTaskEvents(query, { runId: "run" })).result.events).toHaveLength(
      1,
    );
    const ref = t.ref(alice!.connectionId);
    f.repo.saveRun({
      ...f.repo.getRun("run")!,
      config: { ...f.repo.getRun("run")!.config, mentions: [ref] },
    });
    await t.mentions.begin("run", [ref], [], {
      workspaceId: t.workspace.workspaceId,
      taskId: t.task.taskId,
      taskRevision: 1,
    });
    const before = f.calls.length;
    await expect(t.operations.invokeCalendarTaskEvents(query, { runId: "run" })).rejects.toMatchObject({
      code: "permission_denied",
    });
    expect(f.calls).toHaveLength(before);
    expect(
      (await t.operations.invokeCalendarTaskEvents({ ...query, grantId: a.grantId }, { runId: "run" })).result
        .events,
    ).toHaveLength(1);
    f.service.revokeTaskGrant(t.task.taskId, a.grantId);
    await expect(
      t.operations.invokeCalendarTaskEvents({ ...query, grantId: a.grantId }, { runId: "run" }),
    ).rejects.toThrow(/not granted/);
  } finally {
    await f.service.close();
  }
});
it("a Calendar mention cannot create its missing provider/task grant", async () => {
  const f = fixture();
  try {
    await connect(f.service, "alice");
    const t = taskFixture(f),
      account = f.service.list().connections[0]!;
    const ref = t.ref(account.connectionId);
    await t.mentions.begin("run", [ref], [], {
      workspaceId: t.workspace.workspaceId,
      taskId: t.task.taskId,
      taskRevision: 1,
    });
    expect(t.mentions.requireConnector("run", ref.connectorId, "events.list")).toMatchObject({
      status: "unavailable",
    });
    expect(f.service.taskGrants(t.task.taskId)).toEqual([]);
  } finally {
    await f.service.close();
  }
});
