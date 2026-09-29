import { afterEach, expect, it, vi } from "vitest";
import { AuxError, EventTypes, memoryTransportPair, RpcChannel, type PageTarget } from "@aux/contracts";
import { ApiServer, EventBus, openDb, Repo, RunService, SetService } from "@aux/runtime";
import type { ArtifactStore, PageService, SettingsService } from "@aux/runtime";
import type { NativeBridge } from "../../apps/runtime/src/native.js";
import type { HostSocketTransport } from "../../apps/runtime/src/host-socket.js";
import { startupHostChannel } from "../../apps/runtime/src/startup-host-channel.js";
import { registerNativeControlChannel } from "../../apps/runtime/src/services/native-control-channel.js";
import { ControlAuthority } from "../../apps/runtime/src/services/pages/control.js";
import { PageRegistry } from "../../apps/runtime/src/services/pages/registry.js";
import { handlePageTakeover } from "../../apps/runtime/src/services/page-takeover.js";

const repos: Repo[] = [];
afterEach(() => {
  for (const repo of repos.splice(0)) repo.close();
});

function fixture() {
  const repo = new Repo(openDb(":memory:")),
    events = new EventBus(repo);
  const registry = new PageRegistry({
    repo,
    events,
    native: { available: () => false } as NativeBridge,
    drivers: () => ({ aux: null, chrome: null }),
  });
  const target: PageTarget = {
    pageId: "controlled",
    windowId: "window",
    backend: "aux",
    targetId: "target",
    url: "https://fixture.test/task",
    title: "Task",
    documentEpoch: 1,
    lastRevision: 0,
    viewStatus: "visible",
    controller: "agent",
    controllerEpoch: 4,
    ownedByRuntime: true,
    createdAt: 1,
    lastActiveAt: 1,
  };
  registry.addLive(target, null);
  const control = new ControlAuthority(registry);
  control.programInflight.add(target.pageId);
  const pages = {
    get: registry.get.bind(registry),
    livePageIds: registry.livePageIds.bind(registry),
    takeover: control.takeover.bind(control),
  };
  const service = pages as PageService;
  const runs = new RunService({
    repo,
    events,
    pages: service,
    sets: new SetService(repo, events, service),
    settings: { maxWorkers: () => 1, perOrigin: () => 1 } as SettingsService,
    artifacts: {} as ArtifactStore,
    translateSteps: (_pageId, steps) => steps,
    nativeAvailable: () => false,
  });
  repo.saveRun({
    runId: "run",
    goal: "Wait then act",
    status: "running",
    pageIds: [target.pageId],
    config: { implementation: "program" },
    createdAt: 1,
    startedAt: 1,
  });
  const revoke = vi.fn();
  events.subscribe((event) => {
    if (event.type === EventTypes.PageTakeover) {
      revoke(event.payload.pageId);
      handlePageTakeover(String(event.payload.pageId), String(event.payload.controller), repo, runs);
    }
  });
  const [native, runtime] = memoryTransportPair();
  const caller = new RpcChannel(native),
    channel = new RpcChannel(runtime),
    noteError = vi.fn();
  registerNativeControlChannel(channel, pages, noteError);
  const result = { repo, events, registry, target, pages, runs, revoke, caller, noteError };
  repos.push(repo);
  return result;
}

it("accepts the native request frame after startup and interrupts the exact page's run before acknowledging", async () => {
  const f = fixture();
  let receive!: (frame: unknown) => void;
  const sent: unknown[] = [];
  const socket: HostSocketTransport = {
    send: (frame) => sent.push(frame),
    onMessage: (handler) => {
      receive = handler;
    },
    close() {},
  };
  const startup = startupHostChannel(socket);
  receive({ kind: "req", id: 31, method: "view.takeover", params: { pageId: "controlled" } });
  expect(f.target.controller).toBe("agent");
  registerNativeControlChannel(startup.channel, f.pages, f.noteError);
  startup.release();
  await vi.waitFor(() =>
    expect(sent).toContainEqual({
      kind: "res",
      id: 31,
      result: { accepted: true, pageId: "controlled", controller: "human", controllerEpoch: 5 },
    }),
  );
  expect(f.target.controllerEpoch).toBe(5);
  expect(f.revoke).toHaveBeenCalledExactlyOnceWith("controlled");
  expect(f.repo.getRun("run")).toMatchObject({
    status: "interrupted",
    config: {
      checkpoint: {
        planBoundary: "takeover",
        pageIdentity: { takenPageId: "controlled" },
      },
    },
  });
  expect(await f.caller.call("view.takeover", { pageId: "controlled" })).toEqual({
    accepted: true,
    pageId: "controlled",
    controller: "human",
    controllerEpoch: 5,
  });
  expect(f.revoke).toHaveBeenCalledTimes(1);
});

it("keeps ordinary owner browsing unheld and supports external-controlled native pages", async () => {
  const f = fixture();
  f.target.controller = "none";
  expect(await f.caller.call("view.takeover", { pageId: "controlled" })).toEqual({
    accepted: false,
    reason: "not_automated",
    pageId: "controlled",
    controller: "none",
    controllerEpoch: 4,
  });
  expect(f.revoke).not.toHaveBeenCalled();
  f.target.controller = "external";
  expect(await f.caller.call("view.takeover", { pageId: "controlled" })).toMatchObject({
    accepted: true,
    controller: "human",
    controllerEpoch: 5,
  });
});

it("preserves legacy notification takeover through the same dispatcher and reports invalid notes", async () => {
  const f = fixture();
  f.caller.notify("view.takeover", { pageId: "controlled" });
  await vi.waitFor(() => expect(f.target.controller).toBe("human"));
  expect(f.repo.getRun("run")?.status).toBe("interrupted");
  f.caller.notify("view.takeover", { pageId: "controlled", controller: "agent" });
  await vi.waitFor(() => expect(f.noteError).toHaveBeenCalledExactlyOnceWith("invalid_params"));
  expect(f.revoke).toHaveBeenCalledTimes(1);
});

it.each([null, {}, { pageId: 1 }, { pageId: " " }, { pageId: "controlled", controller: "human" }])(
  "refuses malformed identity %j before changing control",
  async (params) => {
    const f = fixture();
    await expect(f.caller.call("view.takeover", params)).rejects.toMatchObject({ code: "invalid_params" });
    expect(f.target.controller).toBe("agent");
    expect(f.revoke).not.toHaveBeenCalled();
  },
);

it("rejects closed, external-backend and detached pages without a successful receipt", async () => {
  const f = fixture();
  await expect(f.caller.call("view.takeover", { pageId: "closed" })).rejects.toMatchObject({
    code: "not_found",
  });
  f.target.backend = "chrome";
  await expect(f.caller.call("view.takeover", { pageId: "controlled" })).rejects.toMatchObject({
    code: "permission_denied",
  });
  f.target.backend = "aux";
  f.target.viewStatus = "detached";
  await expect(f.caller.call("view.takeover", { pageId: "controlled" })).rejects.toMatchObject({
    code: "conflict",
  });
  expect(f.revoke).not.toHaveBeenCalled();
});

it("returns the takeover failure instead of acknowledging fire-and-forget work", async () => {
  const f = fixture();
  vi.spyOn(f.pages, "takeover").mockRejectedValue(
    new AuxError("backend_unavailable", "Fixture store unavailable"),
  );
  await expect(f.caller.call("view.takeover", { pageId: "controlled" })).rejects.toMatchObject({
    code: "backend_unavailable",
  });
  expect(f.target.controller).toBe("agent");
  expect(f.revoke).not.toHaveBeenCalled();
});

it("refuses view.takeover on the public bearer RPC before invoking any handler", async () => {
  const f = fixture(),
    invoke = vi.fn();
  const server = new ApiServer({ token: "fixture-token", events: f.events, invoke });
  try {
    const port = await server.listen(0);
    server.setReady();
    const response = await fetch(`http://127.0.0.1:${port}/rpc`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer fixture-token" },
      body: JSON.stringify({
        id: 41,
        method: "view.takeover",
        params: { pageId: "controlled", desktopUser: true },
      }),
    });
    expect(await response.json()).toMatchObject({ error: { code: "not_found" } });
    expect(invoke).not.toHaveBeenCalled();
    expect(f.target.controller).toBe("agent");
  } finally {
    await server.close();
  }
});
