import { DocumentSnapshots } from "../../apps/runtime/src/services/document-snapshots.js";
import { fixtureTurnMentions } from "../fixtures/turn-mentions.js";
import { afterEach, expect, it, vi } from "vitest";
import {
  AuxError,
  EventTypes,
  memoryTransportPair,
  RpcChannel,
  type PageTarget,
  type EgressLease,
  NativePageTakeoverSchema,
} from "@aux/contracts";
import { ApiServer, EventBus, openDb, Repo, RunService, SetService } from "@aux/runtime";
import type { ArtifactStore, PageService, SettingsService } from "@aux/runtime";
import type { NativeBridge } from "../../apps/runtime/src/native.js";
import type { HostSocketTransport } from "../../apps/runtime/src/host-socket.js";
import { startupHostChannel } from "../../apps/runtime/src/startup-host-channel.js";
import { registerNativeControlChannel } from "../../apps/runtime/src/services/native-control-channel.js";
import { ControlAuthority } from "../../apps/runtime/src/services/pages/control.js";
import { PageRegistry } from "../../apps/runtime/src/services/pages/registry.js";
import { handlePageTakeover } from "../../apps/runtime/src/services/page-takeover.js";
import { applyNativePageTakeover } from "../../apps/runtime/src/services/native-page-takeover.js";
import { BrowserEgress } from "../../apps/runtime/src/safety/browser-egress.js";
import { NativePermissionController } from "../../apps/runtime/src/safety/native-permission.js";
import { ApprovalStore } from "../../apps/runtime/src/safety/approval.js";
import { DecisionJournal } from "../../apps/runtime/src/safety/decide.js";
import { SafetyDispatchGate } from "../../apps/runtime/src/safety/dispatch.js";
import { NullNativeBridge } from "../../apps/runtime/src/native.js";

const repos: Repo[] = [];
const cleanups: Array<() => void> = [];
afterEach(() => {
  for (const dispose of cleanups.splice(0)) dispose();
  for (const repo of repos.splice(0)) repo.close();
});

async function fixture() {
  const repo = new Repo(openDb(":memory:")),
    events = new EventBus(repo);
  const registry = new PageRegistry({
    turnMentions: fixtureTurnMentions((pageId) => repo.getPage(pageId)),
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
    takeoverFromNative: control.takeoverFromNative.bind(control),
  };
  const service = pages as PageService;
  const runs = new RunService({
    documentSnapshots: new DocumentSnapshots(repo),
    turnMentions: fixtureTurnMentions((pageId: string): import("@aux/contracts").PageTarget | undefined =>
      service.get(pageId),
    ),
    repo,
    events,
    pages: service,
    sets: new SetService(repo, events, service),
    settings: { maxWorkers: () => 1, perOrigin: () => 1 } as SettingsService,
    artifacts: {} as ArtifactStore,
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
    if (event.type === EventTypes.PageTakeover && typeof event.payload.nativeRunId !== "string") {
      revoke(event.payload.pageId);
      handlePageTakeover(String(event.payload.pageId), String(event.payload.controller), repo, runs);
    }
  });
  const [native, runtime] = memoryTransportPair();
  const caller = new RpcChannel(native),
    channel = new RpcChannel(runtime),
    noteError = vi.fn();
  let personControlled = false,
    controlGeneration = "native-generation";
  let isolation: import("@aux/contracts").AgentPageIsolation | undefined = {
    isolationId: "native-isolation",
    runId: "run",
    taskRevision: 0,
    mode: "session",
    inMemory: false,
    cookies: "profile",
  };
  target.agentIsolation = isolation;
  const leases: EgressLease[] = [];
  const nativeBridge = Object.assign(new NullNativeBridge(), {
    egressContext: vi.fn(async () => ({
      profileId: "profile",
      tabId: target.pageId,
      frameId: "frame",
      documentToken: "native-doc",
      sourceOrigin: "https://fixture.test",
      controlGeneration,
      personControlled,
      isolation,
    })),
    egressInstall: async ({ lease }: { lease: EgressLease }) => {
      leases.push(lease);
      return { accepted: true as const };
    },
    egressRevoke: vi.fn(async () => ({ accepted: true as const })),
  });
  const egress = new BrowserEgress({
    runAncestry: (runId) => [runId],
    profileId: "profile",
    native: nativeBridge,
    run: (runId) => {
      const run = repo.getRun(runId);
      return run ? { threadId: "run", taskRevision: 0 } : null;
    },
    page: pages.get,
    ownsPage: (runId, pageId) => runId === "run" && pageId === target.pageId,
    audit: () => {},
    approve: async () => false,
  });
  cleanups.push(() => egress.close());
  await egress.acquire("run", target.pageId);
  const approvals = new ApprovalStore(repo.db);
  const permissions = new NativePermissionController({
    profileId: "profile",
    approvals,
    egress,
    gate: new SafetyDispatchGate({
      approvals,
      journal: new DecisionJournal(repo.db),
      managedRules: () => [],
      agentPolicy: () => ({
        agentMode: "ask",
        agentPolicyRevision: 0,
        agentPolicies: [{ category: "click", access: "ask" }],
      }),
      audit: () => {},
    }),
    mentions: fixtureTurnMentions((id) => registry.get(id)),
    page: pages.get,
    run: (id) => repo.getRun(id),
    sourceCheck: () => () => {},
    standingOnly: () => false,
    requiresTurn: () => true,
    assertDispatch: async () => {},
    overnightAuthority: () => null,
    retireReservation: async () => ({ accepted: true }),
  });
  const apply = (input: import("@aux/contracts").NativePageTakeover) =>
    applyNativePageTakeover(input, {
      egress,
      permissions,
      page: pages.get,
      takeover: (pageId, runId) => pages.takeoverFromNative(pageId, runId),
      interrupt: async (pageId, runId) => {
        revoke(pageId);
        await handlePageTakeover(pageId, "human", repo, runs, runId);
      },
    });
  const input = NativePageTakeoverSchema.parse({
    phase: "installed",
    lease: leases[0],
    scope: {
      profileId: "profile",
      tabId: target.pageId,
      frameId: "frame",
      documentToken: "native-doc",
      sourceOrigin: "https://fixture.test",
      isolationId: "native-isolation",
      runId: "run",
      taskRevision: 0,
      controlGeneration,
      retiredControlGeneration: "person-generation",
    },
  });
  personControlled = true;
  controlGeneration = "person-generation";
  registerNativeControlChannel(channel, apply, noteError);
  const result = {
    repo,
    events,
    registry,
    target,
    pages,
    runs,
    revoke,
    caller,
    noteError,
    input,
    apply,
    nativeBridge,
    permissions,
    ordinary: () => {
      isolation = undefined;
      personControlled = false;
    },
  };
  repos.push(repo);
  return result;
}

it("accepts the native request frame after startup and interrupts the exact page's run before acknowledging", async () => {
  const f = await fixture();
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
  receive({ kind: "req", id: 31, method: "view.takeover", params: f.input });
  expect(f.target.controller).toBe("agent");
  registerNativeControlChannel(startup.channel, f.apply, f.noteError);
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
  await expect(f.caller.call("view.takeover", f.input)).rejects.toMatchObject({ code: "ref_stale" });
  expect(f.revoke).toHaveBeenCalledTimes(1);
});

it("keeps genuine ordinary owner browsing unheld and supports scoped external-controlled native pages", async () => {
  const ordinary = await fixture();
  ordinary.target.controller = "none";
  ordinary.ordinary();
  await expect(ordinary.caller.call("view.takeover", ordinary.input)).rejects.toMatchObject({
    code: "ref_stale",
  });
  expect(ordinary.target.controller).toBe("none");
  expect(ordinary.revoke).not.toHaveBeenCalled();
  const external = await fixture();
  external.target.controller = "external";
  expect(await external.caller.call("view.takeover", external.input)).toMatchObject({
    accepted: true,
    controller: "human",
    controllerEpoch: 5,
  });
});

it("uses the same exact-scope notification takeover through the same dispatcher and reports invalid notes", async () => {
  const f = await fixture();
  f.caller.notify("view.takeover", f.input);
  await vi.waitFor(() => expect(f.target.controller).toBe("human"));
  expect(f.repo.getRun("run")?.status).toBe("interrupted");
  f.caller.notify("view.takeover", { pageId: "controlled", controller: "agent" });
  await vi.waitFor(() => expect(f.noteError).toHaveBeenCalledExactlyOnceWith("invalid_params"));
  expect(f.revoke).toHaveBeenCalledTimes(1);
});

it.each([
  null,
  {},
  { pageId: "controlled" },
  { pageId: 1 },
  { pageId: " " },
  { pageId: "controlled", controller: "human" },
])("refuses malformed identity %j before changing control", async (params) => {
  const f = await fixture();
  await expect(f.caller.call("view.takeover", params)).rejects.toMatchObject({ code: "invalid_params" });
  expect(f.target.controller).toBe("agent");
  expect(f.revoke).not.toHaveBeenCalled();
});

it("rejects closed, external-backend and detached pages without a successful receipt", async () => {
  const f = await fixture();
  await expect(
    f.caller.call("view.takeover", {
      ...f.input,
      scope: { ...f.input.scope, tabId: "closed" },
      ...(f.input.phase === "installed" ? { lease: { ...f.input.lease, tabId: "closed" } } : {}),
    }),
  ).rejects.toMatchObject({
    code: "not_found",
  });
  f.target.backend = "chrome";
  await expect(f.caller.call("view.takeover", f.input)).rejects.toMatchObject({
    code: "permission_denied",
  });
  f.target.backend = "aux";
  f.target.viewStatus = "detached";
  await expect(f.caller.call("view.takeover", f.input)).rejects.toMatchObject({
    code: "ref_stale",
  });
  expect(f.revoke).not.toHaveBeenCalled();
});

it("returns the takeover failure instead of acknowledging fire-and-forget work", async () => {
  const f = await fixture();
  vi.spyOn(f.pages, "takeoverFromNative").mockRejectedValue(
    new AuxError("backend_unavailable", "Fixture store unavailable"),
  );
  await expect(f.caller.call("view.takeover", f.input)).rejects.toMatchObject({
    code: "backend_unavailable",
  });
  expect(f.target.controller).toBe("agent");
  expect(f.revoke).not.toHaveBeenCalled();
});

it("refuses view.takeover on the public bearer RPC before invoking any handler", async () => {
  const f = await fixture(),
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

it("interrupts only the original lease owner rather than another run that remembers the same page", async () => {
  const f = await fixture();
  f.repo.saveRun({
    runId: "other-run",
    goal: "Another conversation",
    status: "running",
    pageIds: ["controlled"],
    createdAt: 2,
  });
  await expect(f.caller.call("view.takeover", f.input)).resolves.toMatchObject({ accepted: true });
  expect(f.repo.getRun("run")?.status).toBe("interrupted");
  expect(f.repo.getRun("other-run")?.status).toBe("running");
  expect(f.revoke).toHaveBeenCalledExactlyOnceWith("controlled");
});

it("rejects a queued native receipt after same-URL document replacement without retiring its replacement", async () => {
  const f = await fixture();
  let release!: () => void, entered!: () => void;
  const started = new Promise<void>((resolve) => {
    entered = resolve;
  });
  const hold = new Promise<void>((resolve) => {
    release = resolve;
  });
  const earlier = f.permissions.withAuthorityMutation(
    (id) => id === "unrelated",
    async () => {
      entered();
      await hold;
    },
  );
  await started;
  let captured!: () => void;
  const contextRead = new Promise<void>((resolve) => {
    captured = resolve;
  });
  const current = f.nativeBridge.egressContext.getMockImplementation()!;
  f.nativeBridge.egressContext.mockImplementationOnce(async () => {
    const result = await current();
    captured();
    return result;
  });
  const receipt = f.caller.call("view.takeover", f.input).catch((error) => error);
  await contextRead;
  f.target.documentEpoch++;
  release();
  await earlier;
  await expect(receipt).resolves.toMatchObject({ code: "ref_stale" });
  expect(f.target.controller).toBe("agent");
  expect(f.nativeBridge.egressRevoke).not.toHaveBeenCalled();
  expect(f.revoke).not.toHaveBeenCalled();
  expect(f.repo.getRun("run")?.status).toBe("running");
});
