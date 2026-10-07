import { BrowserEgress } from "../../apps/runtime/src/safety/browser-egress.js";
import { navigateControlledPage } from "../../apps/runtime/src/services/pages/controlled-navigation.js";
import { SafetyDispatchGate } from "../../apps/runtime/src/safety/dispatch.js";
import { ApprovalStore } from "../../apps/runtime/src/safety/approval.js";
import { DecisionJournal } from "../../apps/runtime/src/safety/decide.js";
import { fixturePage, fixtureTurnMentions } from "../fixtures/turn-mentions.js";
import { afterEach, expect, it, vi } from "vitest";
import {
  AgentConnectionService,
  EventBus,
  ExternalSessionService,
  makeInvoker,
  NullNativeBridge,
  openDb,
  PageService,
  Repo,
  TaskService,
  type Services,
} from "@aux/runtime";
import type { BrowserDriver, DriverPage, DriverPageEvents } from "@aux/chromium-driver";
import type { ObservationContent } from "@aux/contracts";
import { PageOwnership } from "../../apps/runtime/src/scheduler/page-ownership.js";

const cleanup: Array<() => void> = [];
afterEach(() => {
  for (const dispose of cleanup.splice(0)) dispose();
});
function repository() {
  const db = openDb(":memory:");
  const repo = new Repo(db);
  cleanup.push(() => {
    repo.flush();
    db.close();
  });
  return { repo, events: new EventBus(repo) };
}
function pageFixture(
  extra: {
    prepareAgentEgress?: (runId: string, pageId: string) => Promise<void>;
    grantsForRun?: () => readonly ["effect:read", "effect:write"];
  } = {},
) {
  const { repo, events } = repository();
  let url = "about:blank";
  let driverEvents: DriverPageEvents = {};
  const trace: string[] = [];
  const observe = vi.fn(
    async () =>
      ({
        url,
        title: "Fixture",
        text: "Source content has a concrete recipient boundary.",
        viewport: { width: 800, height: 600, scale: 1 },
        scroll: { x: 0, y: 0, maxY: 0 },
        frames: [],
        headings: [],
        elements: [],
        formFields: [],
        tables: [],
        links: [],
        dialogs: [],
        console: [],
        truncated: false,
        stats: { elementsTotal: 0, elementsShown: 0, textChars: 53, approxTokens: 12 },
      }) satisfies ObservationContent,
  );
  const dispose = vi.fn(async () => {});
  const nativeClose = vi.fn(async () => ({ status: "applied" }));
  let nativeDocument = "synthetic-blank-document",
    nativeControl = "synthetic-control";
  let installedLease: import("@aux/contracts").EgressLease | undefined;
  const native = Object.assign(new NullNativeBridge(), {
    available: () => true,
    egressContext: async ({ tabId }: { tabId: string }) => ({
      profileId: "profile",
      tabId,
      frameId: "synthetic-frame",
      documentToken: nativeDocument,
      controlGeneration: nativeControl,
      personControlled: false,
      sourceOrigin: url === "about:blank" ? "aux://blank" : new URL(url).origin,
      isolation: pages.get(tabId).agentIsolation,
    }),
    egressInstall: async ({ lease }: { lease: import("@aux/contracts").EgressLease }) => {
      installedLease = lease;
      return { accepted: true as const };
    },
    egressRevoke: async () => ({ accepted: true as const }),
    createAgentPage: vi.fn(async () => ({
      pageId: "native-minted-page",
      creationId: "synthetic-creation",
      targetId: "target",
      isolation: {
        isolationId: "native-minted-partition",
        runId: "run",
        taskRevision: 0,
        mode: "session" as const,
        inMemory: false as const,
        cookies: "profile" as const,
      },
    })),
    creatorCleanupProof: vi.fn(async ({ creationId, pageId }: { creationId: string; pageId: string }) => {
      const page = pages.get(pageId);
      return {
        creationId,
        receiptId: "synthetic-cleanup-receipt",
        phase: "creation" as const,
        profileId: "profile",
        pageId,
        documentToken: "synthetic-blank-document",
        runId: "run",
        taskRevision: 0,
        isolationId: page.agentIsolation!.isolationId,
        controlGeneration: "synthetic-control",
        connectionGeneration: 1,
        expiresAt: Date.now() + 8000,
      };
    }),
    closeCreatedPage: vi.fn(async () => {
      await nativeClose();
      return { closed: true as const };
    }),
    tabCommand: vi.fn(async (input: { command: { kind: string } }) => {
      if (input.command.kind === "close") return nativeClose();
      trace.push("native-blank");
      return { status: "applied", targetId: "target" };
    }),
  });
  const driverPage = {
    identity: { pageId: "page", targetId: "target", backend: "aux" },
    url: () => url,
    title: async () => "Fixture",
    isAttached: () => true,
    navigate: async (next: string) => {
      trace.push("navigate");
      url = next;
      driverEvents.onNavigated?.(next, 1);
    },
    waitFor: async () => ({ ok: true, timedOut: false }),
    click: async () => {
      trace.push("click");
    },
    setEvents: (value: DriverPageEvents) => {
      driverEvents = value;
    },
    dispose,
    observe,
    observeFingerprint: async () => "stable-content",
  } as unknown as DriverPage;
  const driver = {
    backend: "aux",
    isConnected: () => true,
    attach: vi.fn(async (_targetId: string, pageId: string) => ({
      ...driverPage,
      identity: { ...driverPage.identity, pageId },
    })),
  } as unknown as BrowserDriver;
  const record = vi.fn();
  const retireCreatedPage = vi.fn(async () => {});
  const pagesTurnMentions = fixtureTurnMentions(
    (pageId: string): import("@aux/contracts").PageTarget | undefined => pages.get(pageId),
  );
  repo.saveRun({
    runId: "run",
    goal: "Boundary fixture",
    status: "running",
    pageIds: [],
    createdAt: 1,
    config: { taskRevision: 0 },
  });
  const pages: PageService = new PageService({
    // This fixture verifies opener ordering; the real continuation/lease tests
    // are in controlled-native-navigation.test.ts.
    navigateControlled: async (input, registry) => {
      await egress.acquire(input.runId, input.pageId, input.url);
      return navigateControlledPage(input, registry, egress, {
        navigationDeadline: () => Date.now() + 2000,
        navigateControlled: async (_pageId, next) => {
          const originalLease = installedLease!;
          trace.push("navigate");
          url = next;
          nativeDocument = "synthetic-committed-document";
          nativeControl = "synthetic-committed-control";
          driverEvents.onDestroyed?.("detached");
          return {
            originalAttachmentId: "A".repeat(32),
            originalLeaseId: originalLease.leaseId,
            commandId: 1,
            navigationId: "1",
            navigationTransitionId: "B".repeat(32),
            url,
            context: await native.egressContext({ tabId: input.pageId }),
          };
        },
      });
    },
    retireCreatedPage,
    turnMentions: pagesTurnMentions,
    repo,
    events,
    native,
    drivers: () => ({ aux: driver, chrome: null }),
    recordAgentObservation: record,
    ...extra,
  });
  const egress = new BrowserEgress({
    runAncestry: (runId) => [runId],
    profileId: "profile",
    native,
    run: () => ({ taskRevision: 0, threadId: "run" }),
    page: (id) => pages.get(id),
    ownsPage: () => true,
    audit: () => {},
    approve: async () => false,
  });
  cleanup.push(() => egress.close());
  return {
    repo,
    pages,
    turnMentions: pagesTurnMentions,
    trace,
    record,
    observe,
    dispose,
    nativeClose,
    native,
    driverPage,
    driver,
    retireCreatedPage,
  };
}

it("claims the actual blank document before first navigation and records even cached observations", async () => {
  const f = pageFixture();
  const page = await f.pages.open({
    url: "https://source.test/",
    background: true,
    ownedByRuntime: true,
    beforeNavigate: async (page) => {
      expect(f.pages.get(page.pageId).url).toBe("about:blank");
      f.trace.push("authority-installed");
    },
  });
  expect(f.trace).toEqual(["native-blank", "authority-installed", "navigate"]);
  await f.pages.observe(page.pageId, {});
  await f.pages.observe(page.pageId, {});
  expect(f.observe).toHaveBeenCalledTimes(1);
  expect(f.record).toHaveBeenCalledTimes(2);
  expect(f.record).toHaveBeenLastCalledWith(
    page.pageId,
    "https://source.test/",
    "Source content has a concrete recipient boundary.",
  );
});

it("reuses observations only when the fingerprint stayed stable throughout the authorized read", async () => {
  const f = pageFixture();
  const fingerprint = vi
    .fn()
    .mockResolvedValueOnce("before")
    .mockResolvedValueOnce("changed-during-read")
    .mockResolvedValue("before");
  f.driverPage.observeFingerprint = fingerprint;
  const page = await f.pages.open({ url: "https://source.test/", background: true, ownedByRuntime: true });

  const first = await f.pages.observe(page.pageId, {});
  const second = await f.pages.observe(page.pageId, {});
  const third = await f.pages.observe(page.pageId, {});

  expect(first.cached).not.toBe(true);
  expect(second.cached).not.toBe(true);
  expect(third.cached).toBe(true);
  expect(f.observe).toHaveBeenCalledTimes(2);
  expect(fingerprint).toHaveBeenCalledTimes(5);
  expect(f.record).toHaveBeenCalledTimes(3);
});

it("closes the inert native blank and never navigates after authority installation fails", async () => {
  const f = pageFixture();
  await expect(
    f.pages.open({
      url: "https://recipient.test/",
      background: true,
      ownedByRuntime: true,
      beforeNavigate: async () => {
        throw new Error("authority denied");
      },
    }),
  ).rejects.toThrow("authority denied");
  expect(f.trace).toEqual(["native-blank"]);
  expect(f.nativeClose).toHaveBeenCalledTimes(1);
  expect(f.dispose).toHaveBeenCalledTimes(1);
  expect(f.pages.livePageIds()).toEqual([]);
});

function scopedDispatch() {
  const { repo, events } = repository();
  const tasks = new TaskService(repo, events);
  const workspace = tasks.createWorkspace("Scoped");
  const task = tasks.create({
    workspaceId: workspace.workspaceId,
    title: "Read",
    objective: "Read",
    criteria: [{ criterionId: "c", description: "Read", verification: "manual" }],
    resources: [{ resourceId: "page", kind: "page", locator: "p1", label: "Tab" }],
  });
  const agentConnections = new AgentConnectionService(repo);
  const connection = agentConnections.create({
    name: "Fixture",
    client: "codex",
    scope: { kind: "task", workspaceId: workspace.workspaceId, taskId: task.taskId },
  }).connection;
  const turnMentions = fixtureTurnMentions((pageId: string) => repo.getPage(pageId));
  const externalSessions = new ExternalSessionService(repo, events, turnMentions, async () => {});
  const pages = new PageService({
    repo,
    events,
    turnMentions,
    native: new NullNativeBridge(),
    drivers: () => ({ aux: null, chrome: null }),
    safetyGate: new SafetyDispatchGate({
      approvals: new ApprovalStore(repo.db),
      journal: new DecisionJournal(repo.db),
      managedRules: () => [],
      agentPolicy: () => ({ agentMode: "auto", agentPolicyRevision: 0, agentPolicies: [] }),
      audit: () => {},
    }),
  });
  repo.upsertPage(fixturePage("p1", "https://fixture.test/", 1));
  pages.execute = async () => {
    trace.push("dispatch");
    throw new Error("driver failed");
  };
  const pageOwnership = new PageOwnership();
  const trace: string[] = [];
  let boundRun: string | undefined;
  const revoke = vi.fn(() => {
    expect(pageOwnership.snapshot().p1).toBeDefined();
    trace.push("revoke");
  });
  const invoke = makeInvoker({
    repo,
    events,
    agentConnections,
    externalSessions,
    turnMentions,
    pages,
    runs: {
      pageOwnership,
      acquireBrowserEgress: async (runId: string) => {
        boundRun = runId;
        expect(pageOwnership.snapshot().p1).toMatchObject({ runId });
        trace.push("bind");
        return revoke;
      },
    },
    settings: { agentPolicy: () => ({ agentMode: "auto", agentPolicyRevision: 0, agentPolicies: [] }) },
  } as unknown as Services);
  const client = { external: true as const, connectionId: connection.connectionId, scope: connection.scope };
  return { repo, invoke, trace, pageOwnership, task, client, boundRun: () => boundRun };
}

it("binds a scoped external dispatch to its actual session run and revokes before releasing ownership", async () => {
  const { repo, invoke, trace, pageOwnership, task, client, boundRun } = scopedDispatch();
  await expect(
    invoke(
      "pages.execute",
      {
        taskId: task.taskId,
        expectedRevision: task.revision,
        program: { pageId: "p1", steps: [{ id: "go", op: "click", target: "r1" }] },
      },
      client,
    ),
  ).rejects.toThrow("driver failed");
  expect(trace).toEqual(["bind", "dispatch", "revoke"]);
  expect(repo.getRun(boundRun()!)?.config).toMatchObject({
    taskId: task.taskId,
    taskRevision: task.revision,
  });
  expect(pageOwnership.snapshot().p1).toBeUndefined();
});

it("lets a scoped read use the attached task page without transmission protection", async () => {
  const { invoke, trace, pageOwnership, task, client } = scopedDispatch();
  await expect(
    invoke(
      "pages.execute",
      {
        taskId: task.taskId,
        expectedRevision: task.revision,
        program: {
          pageId: "p1",
          steps: [
            {
              id: "wait",
              op: "waitFor",
              condition: { kind: "selector", selector: "#aux-trust-absent", state: "visible" },
            },
          ],
        },
      },
      client,
    ),
  ).rejects.toThrow("driver failed");
  expect(trace).toEqual(["dispatch"]);
  expect(pageOwnership.snapshot().p1).toBeUndefined();
});

it("installs transmission protection for a write program and not for a read", async () => {
  const prepare = vi.fn(async () => {});
  const f = pageFixture({
    prepareAgentEgress: prepare,
    grantsForRun: () => ["effect:read", "effect:write"],
  });
  Object.assign(f.native, {
    acquireStage: async () => ({ ok: true }),
    releaseStage: async () => {},
  });
  const page = await f.pages.open({
    url: "https://source.test/read",
    background: true,
    ownedByRuntime: true,
  });
  (f.driverPage.identity as { pageId: string }).pageId = page.pageId;
  for (const runId of ["run-read", "run-write"])
    await f.turnMentions.begin(
      runId,
      [
        {
          kind: "tab",
          pageId: page.pageId,
          title: page.title,
          url: page.url,
          documentEpoch: page.documentEpoch,
          sessionId: page.sessionId!,
          access: "act",
        },
      ],
      [],
    );
  await f.pages.execute(
    {
      pageId: page.pageId,
      steps: [
        { id: "wait", op: "waitFor", condition: { kind: "selector", selector: "#x", state: "visible" } },
      ],
    },
    { runId: "run-read" },
  );
  expect(prepare).not.toHaveBeenCalled();
  await f.pages.execute(
    {
      pageId: page.pageId,
      steps: [{ id: "go", op: "click", target: "r1" }],
    },
    { runId: "run-write" },
  );
  expect(prepare).toHaveBeenCalledTimes(1);
  expect(prepare).toHaveBeenCalledWith("run-write", page.pageId);
  expect(f.trace).toContain("click");
});

it("uses native-minted controlled identity before navigation and never falls back to ordinary open", async () => {
  const f = pageFixture();
  const target = await f.pages.open({
    url: "https://source.test/",
    background: true,
    ownedByRuntime: true,
    agentScope: { mode: "session", profileId: "profile", runId: "run", ancestry: ["run"], taskRevision: 0 },
    beforeNavigate: async (page) => {
      expect(page.agentIsolation?.isolationId).toBe("native-minted-partition");
      f.trace.push("authority-installed");
    },
  });
  expect(target.pageId).toBe("native-minted-page");
  expect(f.trace).toEqual(["authority-installed", "navigate"]);
  expect(f.native.createAgentPage).toHaveBeenCalledWith({
    mode: "session",
    profileId: "profile",
    runId: "run",
    ancestry: ["run"],
    taskRevision: 0,
    windowId: "main",
    background: true,
  });
  expect(f.native.tabCommand).not.toHaveBeenCalled();
});

it("keeps controlled creation inert when native isolation or source authority is substituted", async () => {
  const f = pageFixture();
  f.repo.saveRun({
    runId: "other-run",
    goal: "Current creation scope",
    status: "running",
    pageIds: [],
    createdAt: 1,
    config: { taskRevision: 0 },
  });
  await expect(
    f.pages.open({
      url: "https://source.test/",
      background: true,
      ownedByRuntime: true,
      agentScope: {
        mode: "session",
        profileId: "profile",
        runId: "other-run",
        ancestry: ["other-run"],
        taskRevision: 0,
      },
      beforeNavigate: vi.fn(),
    }),
  ).rejects.toThrow("did not match this run");
  expect(f.trace).toEqual([]);
  expect(f.native.tabCommand).not.toHaveBeenCalled();
  expect(f.native.createAgentPage).toHaveBeenCalledOnce();
  expect(f.pages.livePageIds()).toEqual([]);
});

it("closes a newly minted controlled blank on denied install, without navigating or falling back", async () => {
  const f = pageFixture();
  await expect(
    f.pages.open({
      url: "https://source.test/",
      background: true,
      ownedByRuntime: true,
      agentScope: { mode: "session", profileId: "profile", runId: "run", ancestry: ["run"], taskRevision: 0 },
      beforeNavigate: async () => {
        throw new Error("denied native install");
      },
    }),
  ).rejects.toThrow("denied native install");
  expect(f.trace).toEqual([]);
  expect(f.nativeClose).toHaveBeenCalledOnce();
  expect(f.pages.livePageIds()).toEqual([]);
});

it("preserves isolation metadata when the native catalog announces the minted page before create returns", async () => {
  const f = pageFixture();
  const result = {
    pageId: "native-minted-page",
    creationId: "synthetic-creation",
    targetId: "target",
    isolation: {
      isolationId: "native-minted-partition",
      runId: "run",
      taskRevision: 0,
      mode: "session" as const,
      inMemory: false as const,
      cookies: "profile" as const,
    },
  };
  let announced!: ReturnType<PageService["registerExternal"]>;
  f.native.createAgentPage.mockImplementationOnce(async () => {
    announced = f.pages.registerExternal({
      pageId: result.pageId,
      marker: `atab-${result.pageId}`,
      cdpTargetId: result.targetId,
      url: "about:blank",
      backend: "aux",
      ownedByRuntime: true,
    });
    return result;
  });
  const page = await f.pages.open({
    url: "https://source.test/",
    background: true,
    ownedByRuntime: true,
    agentScope: { mode: "session", profileId: "profile", runId: "run", ancestry: ["run"], taskRevision: 0 },
    beforeNavigate: async () => {},
  });
  expect(await announced).toBe(page);
  expect(page.agentIsolation).toEqual(result.isolation);
  expect(f.pages.livePageIds()).toEqual([result.pageId]);
});

it("installs protected authority before driver initialization can emit CDP commands", async () => {
  const f = pageFixture();
  let installed = false;
  f.driver.attach = vi.fn(async (_targetId: string, pageId: string) => {
    expect(installed).toBe(true);
    return { ...f.driverPage, identity: { ...f.driverPage.identity, pageId } };
  });
  const target = await f.pages.open({
    url: "https://source.test/",
    background: true,
    ownedByRuntime: true,
    agentScope: { mode: "session", profileId: "profile", runId: "run", ancestry: ["run"], taskRevision: 0 },
    beforeNavigate: async (page) => {
      expect(f.pages.get(page.pageId).url).toBe("about:blank");
      expect(f.driver.attach).not.toHaveBeenCalled();
      expect(page.sessionId).toBeUndefined();
      installed = true;
    },
  });
  // The initial blank and committed document are distinct driver incarnations.
  expect(f.driver.attach).toHaveBeenCalledTimes(2);
  expect(await vi.mocked(f.driver.attach).mock.results[0]!.value).not.toBe(
    await vi.mocked(f.driver.attach).mock.results[1]!.value,
  );
  expect(target.sessionId).toEqual(expect.any(String));
  expect(f.trace).toEqual(["navigate"]);
});

it("does not attach a protected CDP driver while installation is pending or rejected", async () => {
  const f = pageFixture();
  let reject!: (reason: Error) => void;
  let entered!: () => void;
  const started = new Promise<void>((resolve) => {
    entered = resolve;
  });
  const install = new Promise<void>((_, fail) => {
    reject = fail;
  });
  const opening = f.pages.open({
    url: "https://source.test/",
    background: true,
    ownedByRuntime: true,
    agentScope: { mode: "session", profileId: "profile", runId: "run", ancestry: ["run"], taskRevision: 0 },
    beforeNavigate: () => {
      entered();
      return install;
    },
  });
  const refused = opening.then(
    () => undefined,
    (error) => error,
  );
  await started;
  expect(f.driver.attach).not.toHaveBeenCalled();
  expect(f.pages.get("native-minted-page").sessionId).toBeUndefined();
  reject(new Error("native install refused"));
  expect(await refused).toMatchObject({ message: "native install refused" });
  expect(f.driver.attach).not.toHaveBeenCalled();
  expect(f.nativeClose).toHaveBeenCalledOnce();
  expect(f.dispose).not.toHaveBeenCalled();
  expect(f.pages.livePageIds()).toEqual([]);
});

it("retains both install and native cleanup refusal without falling back to generic close", async () => {
  const f = pageFixture();
  const primary = new Error("actual install refused");
  const cleanup = new Error("actual creator close refused");
  f.native.closeCreatedPage.mockRejectedValueOnce(cleanup);
  let failure: unknown;
  try {
    await f.pages.open({
      url: "https://source.test/",
      background: true,
      ownedByRuntime: true,
      agentScope: { mode: "session", profileId: "profile", runId: "run", ancestry: ["run"], taskRevision: 0 },
      beforeNavigate: async () => {
        throw primary;
      },
    });
  } catch (error) {
    failure = error;
  }
  expect(failure).toBeInstanceOf(AggregateError);
  expect((failure as AggregateError).errors).toEqual([primary, cleanup]);
  expect(f.native.closeCreatedPage).toHaveBeenCalledOnce();
  expect(f.native.tabCommand).not.toHaveBeenCalled();
  expect(f.driver.attach).not.toHaveBeenCalled();
  expect(f.pages.get("native-minted-page").viewStatus).not.toBe("detached");
});

it("refuses substituted native creation proof before the final cleanup RPC", async () => {
  const f = pageFixture();
  const originalProof = f.native.creatorCleanupProof.getMockImplementation()!;
  f.native.creatorCleanupProof.mockImplementationOnce(async (input) => ({
    ...(await originalProof(input)),
    creationId: "foreign-creation",
  }));
  const primary = new Error("actual install refused");
  let failure: unknown;
  try {
    await f.pages.open({
      url: "https://source.test/",
      background: true,
      ownedByRuntime: true,
      agentScope: { mode: "session", profileId: "profile", runId: "run", ancestry: ["run"], taskRevision: 0 },
      beforeNavigate: async () => {
        throw primary;
      },
    });
  } catch (error) {
    failure = error;
  }
  expect(failure).toBeInstanceOf(AggregateError);
  expect((failure as AggregateError).errors[0]).toBe(primary);
  expect((failure as AggregateError).errors[1]).toMatchObject({ code: "permission_denied" });
  expect(f.native.closeCreatedPage).not.toHaveBeenCalled();
  expect(f.native.tabCommand).not.toHaveBeenCalled();
  expect(f.pages.livePageIds()).toEqual(["native-minted-page"]);
});

it.each([
  { phase: "retirement", proofCalls: 0 },
  { phase: "native proof", proofCalls: 1 },
])(
  "refuses same-URL document drift held during creator $phase and retains both failures",
  async ({ phase, proofCalls }) => {
    const f = pageFixture();
    const primary = new Error("actual installation failure");
    let entered!: () => void, release!: () => void;
    const started = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    if (phase === "retirement") {
      f.retireCreatedPage.mockImplementationOnce(async () => {
        entered();
        await held;
      });
    } else {
      const originalProof = f.native.creatorCleanupProof.getMockImplementation()!;
      f.native.creatorCleanupProof.mockImplementationOnce(async (input) => {
        const original = await originalProof(input);
        entered();
        await held;
        return original;
      });
    }
    const opening = f.pages.open({
      url: "https://source.test/",
      background: true,
      ownedByRuntime: true,
      agentScope: { mode: "session", profileId: "profile", runId: "run", ancestry: ["run"], taskRevision: 0 },
      beforeNavigate: async () => {
        throw primary;
      },
    });
    const failure = opening.then(
      () => undefined,
      (error) => error,
    );
    await started;
    const row = f.pages.get("native-minted-page");
    const originalUrl = row.url;
    row.documentEpoch = (row.documentEpoch ?? 0) + 1;
    release();
    const error = await failure;
    expect(error).toBeInstanceOf(AggregateError);
    expect(error.errors[0]).toBe(primary);
    expect(error.errors[1]).toMatchObject({ code: "ref_stale" });
    expect(f.native.creatorCleanupProof).toHaveBeenCalledTimes(proofCalls);
    expect(f.native.closeCreatedPage).not.toHaveBeenCalled();
    expect(f.native.tabCommand).not.toHaveBeenCalled();
    expect(f.driver.attach).not.toHaveBeenCalled();
    expect(f.pages.get(row.pageId).url).toBe(originalUrl);
    expect(f.pages.livePageIds()).toEqual([row.pageId]);
  },
);
