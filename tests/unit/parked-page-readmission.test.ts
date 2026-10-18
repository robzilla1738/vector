import { afterEach, expect, it, vi } from "vitest";
import type { BrowserDriver, DriverPage, DriverPageEvents } from "@aux/chromium-driver";
import { AuxError, PageTargetSchema, type AgentPageIsolation, type EgressLease } from "@aux/contracts";
import {
  EventBus,
  MockModelClient,
  NullNativeBridge,
  Repo,
  RunCoordinator,
  SetService,
  openDb,
} from "@aux/runtime";
import { BrowserEgress } from "../../apps/runtime/dist/safety/browser-egress.js";
import { PageRegistry } from "../../apps/runtime/dist/services/pages/registry.js";
import { PageOwnership } from "../../apps/runtime/dist/scheduler/page-ownership.js";
import { PageService } from "../../apps/runtime/dist/services/pages.js";
import { RunMessageQueue } from "../../apps/runtime/dist/services/run-messages.js";
import {
  assertSetMemberSource,
  setMemberSourceDigest,
} from "../../apps/runtime/dist/services/set-member-lineage.js";
import { TurnMentionService } from "../../apps/runtime/dist/services/turn-mention-service.js";

const cleanups: Array<() => void | Promise<void>> = [];
afterEach(async () => {
  for (const close of cleanups.splice(0)) await close();
});

async function expectParked(repo: Repo, coordinator: RunCoordinator) {
  await vi.waitFor(() => {
    expect(repo.getRun("run")?.error).toBeUndefined();
    expect(coordinator.controls.get("run")?.answerWaiter).toBeDefined();
  });
}

async function fixture(kind?: "private" | "set") {
  const db = openDb(":memory:");
  const repo = new Repo(db);
  const events = new EventBus(repo);
  const ownership = new PageOwnership();
  const native = new NullNativeBridge();
  native.available = () => true;
  let documentToken = "original-native-document";
  let frameId = "original-frame";
  let profileId = "profile";
  let generation = "original-generation";
  let delayLeaseDetach = false;
  let sourceEligible = true;
  let isolation: AgentPageIsolation | undefined;
  let installed: EgressLease | undefined;
  let contextGate: Promise<void> | undefined;
  let attachGate: Promise<void> | undefined;
  const readers: Array<{
    page: DriverPage;
    events: DriverPageEvents;
    leaseId?: string;
    attached: boolean;
  }> = [];
  const target = PageTargetSchema.parse({
    pageId: "page",
    targetId: "original-target",
    backend: "aux",
    windowId: "original-window",
    url: "https://page.test/",
    title: "Original",
    documentEpoch: 1,
    lastRevision: 0,
    viewStatus: "visible",
    lifecycle: "live",
    controller: "none",
    controllerEpoch: 0,
    ownedByRuntime: false,
    createdAt: 1,
    lastActiveAt: 1,
  });
  const mentions = new TurnMentionService({
    page: (pageId): import("@aux/contracts").PageTarget | undefined => registry.live.get(pageId)?.target,
    organization: async () => ({ revision: 0, shared: null }),
    turnSourceContext: async (token) => {
      if (token !== "original-caller") throw new Error("The original caller token changed.");
      return { revision: 0, layout: null, windowId: "original-window", activePageId: "page" };
    },
    routine: () => undefined,
    connectors: () => ({ entries: [], access: [], bindings: {} }),
  });
  const attach = vi.fn(async (_targetId?: string, pageId = "page") => {
    await attachGate;
    const attachedTarget = registry.get(pageId);
    const reader = {
      page: undefined as unknown as DriverPage,
      events: {} as DriverPageEvents,
      leaseId: installed?.leaseId,
      attached: true,
    };
    reader.page = {
      isAttached: () => reader.attached,
      url: () => attachedTarget.url,
      setEvents: (value: DriverPageEvents) => {
        reader.events = value;
      },
      observe: vi.fn(async () => ({ text: `fresh read ${readers.indexOf(reader)}`, elements: [] })),
      dispose: vi.fn(async () => {
        if (!reader.attached) return;
        // Match actual PlaywrightDriverPage.dispose: remove the wrapper,
        // without synthesizing the browser's delayed close notification.
        reader.attached = false;
      }),
    } as unknown as DriverPage;
    readers.push(reader);
    return reader.page;
  });
  const registry = new PageRegistry({
    repo,
    events,
    native,
    turnMentions: mentions,
    drivers: () => ({ aux: { attach } as unknown as BrowserDriver, chrome: null }),
  });
  const live = registry.addLive(target, null);
  live.target.sessionId = "original-logical-session";
  const context = vi.fn(async (input?: { tabId: string }) => {
    await contextGate;
    const tabId = input?.tabId ?? "page";
    const current = registry.get(tabId);
    return {
      profileId,
      tabId,
      frameId: tabId === "page" ? frameId : `${frameId}:${tabId}`,
      documentToken: tabId === "page" ? documentToken : `${documentToken}:${tabId}:${current.documentEpoch}`,
      controlGeneration: generation,
      personControlled: false,
      sourceOrigin: current.url === "about:blank" ? "aux://blank" : new URL(current.url).origin,
      isolation: current.agentIsolation ?? isolation,
    };
  });
  const install = vi.fn(async ({ lease }: { lease: EgressLease }) => {
    installed = lease;
    return { accepted: true as const };
  });
  const revoke = vi.fn(async ({ lease }: { lease: EgressLease }) => {
    generation = "generation-after-revoke";
    for (const reader of readers) {
      if (delayLeaseDetach || reader.leaseId !== lease.leaseId || !reader.attached) continue;
      reader.attached = false;
      reader.events.onDestroyed?.("closed");
    }
    return { accepted: true as const };
  });
  Object.assign(native, {
    egressContext: context,
    egressInstall: install,
    egressRevoke: revoke,
    adoptSessionPage: async () => {
      isolation = {
        isolationId: "original-isolation",
        runId: "run",
        taskRevision: 0,
        mode: "session",
        inMemory: false,
        cookies: "profile",
      };
      return context();
    },
  });
  if (!kind)
    repo.saveRun({
      runId: "run",
      goal: "Read without replaying effects",
      status: "needs_input",
      pageIds: ["page"],
      createdAt: 1,
      config: { chatId: "chat", nativeTurnContext: "original-caller", messageRevision: 0 },
    });
  const egress = new BrowserEgress({
    profileId: "profile",
    native,
    runAncestry: (runId) => {
      const parent = kind === "set" ? assertSetMemberSource(repo, runId, true) : undefined;
      return parent ? [runId, parent] : [runId];
    },
    run: (id) => {
      const run = repo.getRun(id);
      return run && !["cancelled", "completed", "failed"].includes(run.status)
        ? {
            nativeTurnContext: run.config?.nativeTurnContext,
            threadId: "chat",
            taskRevision: 0,
            privateTask: !!run.config?.privateTask,
          }
        : null;
    },
    page: (id) => registry.get(id),
    ownsPage: (runId, id) => ownership.snapshot()[id]?.runId === runId,
    prepareSessionPage: async () => {},
    suspendSessionPage: (input) => registry.suspendSessionPage(input),
    admitSessionPage: (input) => registry.admitSessionPage(input),
    retireSessionPage: (id, original) => registry.retireSessionPage(id, original),
    approve: async () => false,
    audit: () => {},
  });
  const pages = new PageService({
    repo,
    events,
    native,
    turnMentions: mentions,
    drivers: () => ({ aux: null, chrome: null }),
  });
  vi.spyOn(pages, "get").mockImplementation((id) => registry.get(id));
  const model = new MockModelClient().scriptToolSteps([
    {
      toolCalls: [
        { toolCallId: "first-question", toolName: "ask_user_question", input: { question: "What next?" } },
      ],
    },
    {
      toolCalls: [
        {
          toolCallId: "second-question",
          toolName: "ask_user_question",
          input: { question: "Anything else?" },
        },
      ],
    },
  ]);
  const step = vi.spyOn(model, "toolCallStep");
  const coordinator = new RunCoordinator({
    repo,
    events,
    pages,
    pageOwnership: ownership,
    turnMentions: mentions,
    browserEgress: egress,
    model: () => (kind ? model : null),
    defaultModel: () => "fixture",
    contextAuthority: () => repo.getSetting("fixture:model-policy-generation") ?? "original-generation",
    agentLoop: {
      modelLimits: () => ({
        contextTokens: repo.getSetting<number>("fixture:model-context") ?? 128000,
        maxOutputTokens: 4096,
      }),
    },
    recordModelCall: () => {},
    checkRunSource: (runId) => {
      if (kind === "set") assertSetMemberSource(repo, runId, true);
      if (!sourceEligible) throw new AuxError("permission_denied", "The original source was forgotten.");
    },
  });
  let unregister: (() => void) | undefined;
  let setMember: import("@aux/contracts").SetMember | undefined;
  cleanups.push(async () => {
    await coordinator.close();
    egress.close();
    unregister?.();
    repo.flush();
    db.close();
  });
  if (kind) {
    const creation = Object.assign(native, {
      createAgentPage: vi.fn(async (scope: import("@aux/contracts").AgentPageCreate) => ({
        pageId: "copied-page",
        creationId: "original-copy-creation",
        targetId: "copied-target",
        source: scope.source,
        isolation: {
          isolationId: "copied-isolation",
          runId: scope.runId,
          taskId: scope.taskId,
          taskRevision: scope.taskRevision,
          ...(scope.mode === "private"
            ? { mode: "private" as const, inMemory: true as const, cookies: "empty" as const }
            : { mode: "session" as const, inMemory: false as const, cookies: "profile" as const }),
        },
      })),
    });
    vi.spyOn(pages, "open").mockImplementation(async (opts) => {
      if (!opts.agentScope) throw new Error("Expected original isolated creation scope.");
      const created = await creation.createAgentPage({
        ...opts.agentScope,
        windowId: "original-window",
        background: true,
      });
      const copy = registry.addLive(
        PageTargetSchema.parse({
          ...target,
          pageId: created.pageId,
          targetId: created.targetId,
          url: "about:blank",
          documentEpoch: 0,
          ownedByRuntime: true,
          viewStatus: "background",
          agentIsolation: created.isolation,
        }),
        null,
      );
      // Inject only native creation/navigation transport: its committed target
      // is followed by the real fresh lease check. Initial blank-page claim,
      // original Set receipt, reader retirement and first park stay real.
      await opts.beforeNavigate!(copy.target);
      copy.target.url = opts.url;
      copy.target.documentEpoch++;
      await egress.ensure(opts.agentScope.runId, copy.target.pageId);
      registry.installDriver(copy, await attach(copy.target.targetId, copy.target.pageId));
      return copy.target;
    });
    let setMemberSource: NonNullable<import("@aux/contracts").Run["config"]>["setMemberSource"];
    if (kind === "set") {
      repo.saveRun({
        runId: "parent",
        goal: "Read selected Set",
        status: "running",
        pageIds: [],
        createdAt: 1,
      });
      const sets = new SetService(repo, events, pages);
      const set = await sets.create({ name: "Selected source", source: "tabs", pageIds: ["page"] });
      setMember = sets.get(set.setId).members[0]!;
      const source = {
        parentRunId: "parent",
        setId: set.setId,
        memberId: setMember.memberId,
        url: target.url,
        memberUrl: setMember.url,
        pageId: setMember.pageId,
        sessionId: live.target.sessionId,
        documentEpoch: target.documentEpoch,
      };
      setMemberSource = { ...source, sourceDigest: setMemberSourceDigest(source) };
    }
    await coordinator.start({
      runId: "run",
      goal: "Read without replaying effects",
      chatId: "chat",
      pageIds: ["page"],
      privateTask: kind === "private",
      setMemberSource,
      nativeTurnContext: "original-caller",
    });
    await expectParked(repo, coordinator);
  } else {
    unregister = coordinator.registerBatch(repo.getRun("run")!);
    await mentions.begin("run", [], []);
    await coordinator.waitIfPaused(coordinator.controls.get("run")!, "run");
  }
  const control = coordinator.controls.get("run")!;

  return {
    repo,
    events,
    step,
    setMember,
    coordinator,
    control,
    egress,
    registry,
    live,
    readers,
    attach,
    install,
    context,
    revoke,
    park: () => coordinator.waitForAnswer(control, "run"),
    answer: () => coordinator.answer("run", "Not now; continue reading"),
    delayLeaseDetach: () => {
      delayLeaseDetach = true;
    },
    nativeDocument: (value: string) => {
      documentToken = value;
    },
    nativeFrame: (value: string) => {
      frameId = value;
    },
    nativeProfile: (value: string) => {
      profileId = value;
    },
    forget: () => {
      sourceEligible = false;
    },
    holdContext: (value: Promise<void>) => {
      contextGate = value;
    },
    holdAttach: (value: Promise<void>) => {
      attachGate = value;
    },
  };
}

it("resumes the real original answer waiter through fresh native proof and reader admission", async () => {
  const f = await fixture();
  const original = structuredClone(f.live.target);
  f.live.lastObservationId = "old-observation";
  const waiting = f.park();
  expect(f.readers[0]!.attached).toBe(false);
  expect(f.live.driver).toBeNull();
  expect(f.live.target.sessionId).toBe(original.sessionId);
  expect(f.live.target.viewStatus).toBe("visible");
  expect(f.live.lastObservationId).toBeUndefined();
  expect(f.coordinator.ownsPages("run")).toBe(false);
  await f.answer();
  await expect(waiting).resolves.toBe("Not now; continue reading");
  expect(f.coordinator.ownsPages("run")).toBe(true);
  expect(f.install).toHaveBeenCalledTimes(2);
  expect(f.attach).toHaveBeenCalledTimes(2);
  expect(f.install.mock.calls[1]![0].lease.leaseId).not.toBe(f.install.mock.calls[0]![0].lease.leaseId);
  expect(f.install.mock.calls[1]![0].lease.documentToken).toBe("original-native-document");
  expect(f.install.mock.calls[1]![0].lease.controlGeneration).toBe("generation-after-revoke");
  expect(f.live.target.sessionId).toBe(original.sessionId);
  expect(f.live.driver).toBe(f.readers[1]!.page);
  await expect(f.live.driver!.observe({})).resolves.toMatchObject({ text: "fresh read 1" });
  f.readers[0]!.events.onDestroyed?.("closed");
  expect(f.live.driver).toBe(f.readers[1]!.page);
  expect(f.live.target.viewStatus).toBe("visible");
});

it("keeps ordinary suspension and unexpected crashes detached, without a new reader grant", async () => {
  const f = await fixture();
  f.egress.suspendRun("run");
  expect(f.live.target.viewStatus).toBe("detached");
  await expect(f.coordinator.waitIfPaused(f.control, "run")).resolves.toBeUndefined();
  // Its original page claim remains held, so explicitly attempt acquisition too.
  await expect(f.egress.acquire("run", "page")).rejects.toMatchObject({ code: "permission_denied" });
  expect(f.attach).toHaveBeenCalledOnce();
});

it.each(["document", "frame", "profile", "window", "epoch", "forget", "crash"])(
  "refuses parked readmission after original %s changes",
  async (change) => {
    const f = await fixture();
    const waiting = f.park().catch((error: unknown) => error);
    if (change === "document") f.nativeDocument("different-same-URL-document");
    if (change === "frame") f.nativeFrame("different-frame");
    if (change === "profile") f.nativeProfile("different-profile");
    if (change === "window") f.live.target.windowId = "another-window";
    if (change === "epoch") f.live.target.documentEpoch++;
    if (change === "forget") f.forget();
    if (change === "crash") f.live.target.viewStatus = "crashed";
    await f.answer();
    const result = await waiting;
    expect(result).toBeInstanceOf(AuxError);
    expect(f.attach).toHaveBeenCalledOnce();
    expect(f.install).toHaveBeenCalledOnce();
  },
);

it("rechecks the original waiter after native Context awaits, before issuing a replacement lease", async () => {
  const f = await fixture();
  const waiting = f.park().catch((error: unknown) => error);
  let release!: () => void;
  f.holdContext(
    new Promise<void>((done) => {
      release = done;
    }),
  );
  const calls = f.context.mock.calls.length;
  await f.answer();
  await vi.waitFor(() => expect(f.context.mock.calls.length).toBe(calls + 1));
  f.forget();
  release();
  expect(await waiting).toMatchObject({ code: "permission_denied" });
  expect(f.attach).toHaveBeenCalledOnce();
  expect(f.install).toHaveBeenCalledOnce();
});

it("joins and disposes a held fresh attachment after Stop, without publishing or replaying it", async () => {
  const f = await fixture();
  const waiting = f.park().catch((error: unknown) => error);
  let release!: () => void;
  f.holdAttach(
    new Promise<void>((done) => {
      release = done;
    }),
  );
  await f.answer();
  await vi.waitFor(() => expect(f.attach).toHaveBeenCalledTimes(2));
  f.control.abort.abort();
  f.egress.revokeRun("run");
  release();
  expect(await waiting).toBeInstanceOf(AuxError);
  expect(f.readers[1]!.page.dispose).toHaveBeenCalledOnce();
  expect(f.live.driver).toBeNull();
  expect(f.readers[0]!.page.observe).not.toHaveBeenCalled();
  expect(f.readers[1]!.page.observe).not.toHaveBeenCalled();
});

it("never adopts a replacement driver or restores a failed parked witness on a later retry", async () => {
  const f = await fixture();
  const waiting = f.park().catch((error: unknown) => error);
  const replacement = {
    isAttached: () => true,
    setEvents: vi.fn(),
    dispose: vi.fn(async () => {}),
  } as unknown as DriverPage;
  f.registry.installDriver(f.live, replacement);
  const replacementSession = f.live.target.sessionId;
  await f.answer();
  expect(await waiting).toBeInstanceOf(AuxError);
  expect(f.live.driver).toBe(replacement);
  expect(f.live.target.sessionId).toBe(replacementSession);
  expect(replacement.dispose).not.toHaveBeenCalled();
  expect(f.attach).toHaveBeenCalledOnce();
});

it("expires the parked incarnation after a native proof mismatch instead of permitting a later retry", async () => {
  const f = await fixture();
  const waiting = f.park().catch((error: unknown) => error);
  f.nativeDocument("different-same-URL-document");
  await f.answer();
  expect(await waiting).toBeInstanceOf(AuxError);
  expect(f.live.target.sessionId).toBeUndefined();
  expect(f.live.target.viewStatus).toBe("detached");
  f.nativeDocument("original-native-document");
  await expect(f.egress.acquire("run", "page")).rejects.toMatchObject({ code: "permission_denied" });
  expect(f.attach).toHaveBeenCalledOnce();
});

it("checks actual turn selection again before publishing an attached parked reader", async () => {
  const f = await fixture();
  const waiting = f.park().catch((error: unknown) => error);
  let release!: () => void;
  f.holdAttach(
    new Promise<void>((done) => {
      release = done;
    }),
  );
  await f.answer();
  await vi.waitFor(() => expect(f.attach).toHaveBeenCalledTimes(2));
  f.coordinator.deps.turnMentions.end("run");
  release();
  expect(await waiting).toBeInstanceOf(Error);
  expect(f.readers[1]!.page.dispose).toHaveBeenCalledOnce();
  expect(f.live.driver).toBeNull();
});

it("joins the original attachment even when native retirement ACK precedes its delayed detach event", async () => {
  const f = await fixture();
  f.delayLeaseDetach();
  const waiting = f.park();
  expect(f.readers[0]!.attached).toBe(true);
  await f.answer();
  await expect(waiting).resolves.toBe("Not now; continue reading");
  expect(f.readers[0]!.page.dispose).toHaveBeenCalledOnce();
  expect(f.live.driver).toBe(f.readers[1]!.page);
  f.readers[0]!.events.onDestroyed?.("closed");
  expect(f.live.driver).toBe(f.readers[1]!.page);
  expect(f.live.target.sessionId).toBe("original-logical-session");
});

it("does not turn an unexpected actual driver crash into an intentional answer suspension", async () => {
  const f = await fixture();
  f.readers[0]!.attached = false;
  f.readers[0]!.events.onDestroyed?.("crashed");
  const waiting = f.park().catch((error: unknown) => error);
  expect(f.live.target.viewStatus).toBe("crashed");
  await f.answer();
  expect(await waiting).toBeInstanceOf(AuxError);
  expect(f.attach).toHaveBeenCalledOnce();
});

it("returns the actual takeover interruption without readmitting the parked document", async () => {
  const f = await fixture();
  const waiting = f.park();
  f.live.target.controller = "human";
  f.live.target.controllerEpoch++;
  f.coordinator.interruptForTakeover("run");
  await expect(waiting).resolves.toBe("Page control changed; the pending action was cancelled.");
  expect(f.control.dispatchAbort!.signal.aborted).toBe(true);
  expect(f.live.target.sessionId).toBeUndefined();
  expect(f.attach).toHaveBeenCalledOnce();
  expect(f.install).toHaveBeenCalledOnce();
});

it("returns a genuine steering interruption without granting the old pending action a new reader", async () => {
  const f = await fixture();
  const waiting = f.park();
  f.coordinator.steer("run");
  await expect(waiting).resolves.toBe("");
  expect(f.control.dispatchAbort!.signal.aborted).toBe(true);
  expect(f.live.target.sessionId).toBeUndefined();
  expect(f.attach).toHaveBeenCalledOnce();
  expect(f.install).toHaveBeenCalledOnce();
});

it.each(["private", "set"] as const)(
  "resumes the actual first %s copied-page park without revoking its witness",
  async (kind) => {
    const f = await fixture(kind);
    const copy = f.registry.live.get("copied-page")!;
    const original = structuredClone(copy.target);
    expect(f.repo.getRun("run")?.config?.isolatedPageSources).toEqual([
      { sourcePageId: "page", pageId: "copied-page", url: "https://page.test/" },
    ]);
    expect(f.step).toHaveBeenCalledOnce();
    expect(copy.driver).toBeNull();
    expect(copy.target.sessionId).toBeDefined();
    expect(f.coordinator.ownsPages("run")).toBe(false);
    await f.answer();
    await vi.waitFor(() => {
      expect(f.repo.getRun("run")?.error).toBeUndefined();
      expect(f.step).toHaveBeenCalledTimes(2);
      expect(f.coordinator.suspensions.pending("run")?.request.instruction).toBe("Anything else?");
    });
    expect(f.attach).toHaveBeenCalledTimes(2);
    expect(copy.target.sessionId).toBe(original.sessionId);
    expect(f.install).toHaveBeenCalledTimes(3);
    expect(f.live.target).toMatchObject({ pageId: "page", ownedByRuntime: false, viewStatus: "visible" });
  },
);

it.each(["private", "set"] as const)(
  "refuses changed native source on the actual first %s copied-page answer",
  async (kind) => {
    const f = await fixture(kind);
    f.nativeDocument("replacement-native-document");
    await f.answer();
    await vi.waitFor(() => expect(f.repo.getRun("run")?.status).toBe("failed"));
    expect(f.step).toHaveBeenCalledOnce();
    expect(f.attach).toHaveBeenCalledOnce();
    expect(f.install).toHaveBeenCalledTimes(2);
  },
);

it.each(["private", "set"] as const)(
  "Stop retires the actual first %s copied-page waiter without readmission",
  async (kind) => {
    const f = await fixture(kind);
    await f.coordinator.cancel("run");
    await vi.waitFor(() => expect(f.coordinator.controls.has("run")).toBe(false));
    expect(f.attach).toHaveBeenCalledOnce();
    expect(f.install).toHaveBeenCalledTimes(2);
    expect(f.step).toHaveBeenCalledOnce();
  },
);

it("preserves the original parked source across an actual queued follow-up", async () => {
  const f = await fixture();
  const waiting = f.park();
  const start = vi.fn(async () => {
    throw new Error("The queued follow-up cannot start during this original turn.");
  });
  const queue = new RunMessageQueue(
    f.repo,
    f.events,
    start,
    () => true,
    () => {},
  );
  try {
    const message = queue.queue({
      messageId: "11111111-1111-4111-8111-111111111111",
      runId: "run",
      chatId: "chat",
      text: "Follow up later",
      pageIds: ["page"],
      contextPageRefs: [],
      expectedRevision: 0,
    });
    expect(f.repo.getRun("run")?.config?.queuedMessageContexts?.[message.messageId]).toBeDefined();
    await f.answer();
    await expect(waiting).resolves.toBe("Not now; continue reading");
    expect(f.attach).toHaveBeenCalledTimes(2);
    expect(queue.list("chat")[0]?.status).toBe("accepted");
    expect(start).not.toHaveBeenCalled();
  } finally {
    await queue.stop();
  }
});

it.each(["model", "model-policy", "model-limits", "space", "source", "revision"])(
  "still refuses genuine parked %s authority changes",
  async (change) => {
    const f = await fixture();
    const waiting = f.park().catch((error: unknown) => error);
    const run = f.repo.getRun("run")!;
    if (change === "model") run.config!.modelId = "another-model";
    if (change === "model-policy") f.repo.setSetting("fixture:model-policy-generation", "new-generation");
    if (change === "model-limits") f.repo.setSetting("fixture:model-context", 16000);
    if (change === "source") run.config!.contextRunIds = ["different-original-source"];
    if (change === "revision") run.config!.messageRevision = 1;
    if (change === "space") f.repo.setSetting("conversationWorkspace:chat", "another-space");
    else f.repo.saveRun(run);
    await f.answer();
    expect(await waiting).toBeInstanceOf(AuxError);
    expect(f.attach).toHaveBeenCalledOnce();
    expect(f.install).toHaveBeenCalledOnce();
  },
);

it("refuses an actual Set member source change while its copied-page question is parked", async () => {
  const f = await fixture("set");
  expect(assertSetMemberSource(f.repo, "run", true)).toBe("parent");
  expect(f.repo.db.prepare("SELECT state FROM set_run_members WHERE child_run_id=?").get("run")).toEqual({
    state: "running",
  });
  f.repo.saveMember({ ...f.setMember!, pageId: "a-different-page" });
  await f.answer();
  await vi.waitFor(() => expect(f.repo.getRun("run")?.status).toBe("failed"));
  expect(f.step).toHaveBeenCalledOnce();
  expect(f.attach).toHaveBeenCalledOnce();
  expect(f.install).toHaveBeenCalledTimes(2);
});
