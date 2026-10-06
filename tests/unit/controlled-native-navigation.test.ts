import { afterEach, expect, it, vi } from "vitest";
import type { BrowserDriver, DriverPage, DriverPageEvents } from "@aux/chromium-driver";
import type { EgressLease, PageTarget, ProfileOrganizationSnapshot } from "@aux/contracts";
import { EventBus, NullNativeBridge, openDb, Repo } from "@aux/runtime";
import { BrowserEgress } from "../../apps/runtime/src/safety/browser-egress.js";
import { PageRegistry } from "../../apps/runtime/src/services/pages/registry.js";
import { TurnMentions } from "../../apps/runtime/src/agent/turn-mentions.js";
import { navigateControlledPage } from "../../apps/runtime/src/services/pages/controlled-navigation.js";
import { TurnMentionService } from "../../apps/runtime/src/services/turn-mention-service.js";
import { ProgramExecutor } from "../../apps/runtime/src/services/pages/executor.js";
import { PageLanes } from "../../apps/runtime/src/services/pages/lanes.js";
import { ControlAuthority } from "../../apps/runtime/src/services/pages/control.js";
import { ObservationService } from "../../apps/runtime/src/services/pages/observation.js";
import { PageOpener } from "../../apps/runtime/src/services/pages/opener.js";
import { ActivationPolicy } from "../../apps/runtime/src/services/pages/activation.js";
import { fixtureTurnMentions } from "../fixtures/turn-mentions.js";

const repos: Repo[] = [],
  services: BrowserEgress[] = [];
afterEach(() => {
  for (const service of services.splice(0)) service.close();
  for (const repo of repos.splice(0)) repo.close();
});
const pageId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
function fixture(retireOnReceipt = true, initialUrl = "https://continuation.test/start") {
  const repo = new Repo(openDb(":memory:"));
  repos.push(repo);
  const url = initialUrl;
  const driver = (currentUrl: string) => {
    let events: DriverPageEvents = {},
      attached = true;
    const click = vi.fn(async () => {});
    const dispose = vi.fn(async () => {
      attached = false;
      events.onDestroyed?.("closed");
    });
    const page = {
      identity: { pageId, targetId: "target", backend: "aux" },
      isAttached: () => attached,
      url: () => currentUrl,
      click,
      originForTarget: async () => new URL(currentUrl).origin,
      title: async () => "Fixture",
      setEvents: (value: DriverPageEvents) => {
        events = value;
      },
      dispose,
    } as unknown as DriverPage;
    return {
      page,
      click,
      dispose,
      retire: () => {
        attached = false;
        events.onDestroyed?.("closed");
      },
    };
  };
  const old = driver(url),
    next = driver("https://continuation.test/next");
  const isolation = {
    isolationId: "native-isolation",
    runId: "run",
    taskId: "task",
    taskRevision: 4,
    inMemory: true as const,
    cookies: "empty" as const,
  };
  let context = {
    profileId: "profile",
    tabId: pageId,
    frameId: "frame",
    documentToken: "native-old-document",
    controlGeneration: "native-old-control",
    personControlled: false,
    sourceOrigin: url === "about:blank" ? "aux://blank" : new URL(url).origin,
    isolation,
  };
  let latestLease: EgressLease | undefined;
  const native = Object.assign(new NullNativeBridge(), {
    available: () => true,
    egressContext: async () => context,
    egressInstall: vi.fn(async ({ lease }: { lease: EgressLease }) => {
      latestLease = lease;
      return { accepted: true as const };
    }),
    egressRevoke: vi.fn(async () => ({ accepted: true as const })),
    acquireStage: async () => ({ ok: true }),
    releaseStage: async () => ({ ok: true }),
  });
  const browser = {
    isConnected: () => true,
    attach: vi.fn(async () => next.page),
  } as unknown as BrowserDriver;
  const pages: PageRegistry = new PageRegistry({
    repo,
    events: new EventBus(repo),
    native,
    turnMentions: fixtureTurnMentions((id) => pages.get(id)),
    grants: ["effect:read", "effect:write"],
    drivers: () => ({ aux: browser, chrome: null }),
  });
  const target: PageTarget = {
    pageId,
    targetId: "target",
    backend: "aux",
    url,
    title: "Fixture",
    documentEpoch: 1,
    lastRevision: 0,
    createdAt: 1,
    lastActiveAt: 1,
    ownedByRuntime: true,
    controller: "agent",
    controllerEpoch: 0,
    viewStatus: "background",
    agentIsolation: isolation,
  };
  const live = pages.addLive(target, old.page);
  const egress = new BrowserEgress({
    runAncestry: (runId) => [runId],
    profileId: "profile",
    native,
    run: () => ({ taskId: "task", taskRevision: 4, threadId: "thread" }),
    page: (id) => pages.get(id),
    ownsPage: () => true,
    audit: () => {},
    approve: async () => false,
  });
  services.push(egress);
  const cdp = {
    navigationDeadline: vi.fn(() => Date.now() + 2000),
    navigateControlled: vi.fn(async (_pageId: string, _url: string, _signal: AbortSignal) => {
      const originalLease = latestLease!;
      if (retireOnReceipt) old.retire();
      context = {
        ...context,
        documentToken: "native-new-document",
        controlGeneration: "native-new-control",
        sourceOrigin: "https://continuation.test",
      };
      return {
        originalAttachmentId: "A".repeat(32),
        originalLeaseId: originalLease.leaseId,
        commandId: 9,
        navigationId: "12",
        navigationTransitionId: "B".repeat(32),
        url: "https://continuation.test/next",
        context,
      };
    }),
  };
  const check = vi.fn(() => {
    const run = repo.getRun("run");
    if (run && (run.status !== "running" || run.config?.taskId !== "task" || run.config?.taskRevision !== 4))
      throw new Error("Original task execution source changed");
  });
  const navigate = (mentionAuthority?: () => void) =>
    navigateControlledPage(
      {
        mentionAuthority,
        revalidateMentionSource: mentionAuthority ? async () => mentionAuthority() : undefined,
        runId: "run",
        pageId,
        url: "https://continuation.test/next",
        signal: new AbortController().signal,
        validateSource: check,
      },
      pages,
      egress,
      cdp,
    );
  return { repo, pages, live, egress, native, old, next, cdp, check, navigate, lease: () => latestLease! };
}

it("advances a mentioned attachment only through the completed one-use private continuation", async () => {
  const f = fixture();
  await f.egress.acquire("run", pageId);
  const oldSession = f.live.target.sessionId!;
  const turns = new TurnMentions(
    (id) => {
      const page = f.pages.get(id);
      return page.sessionId
        ? { pageId: id, url: page.url, documentEpoch: page.documentEpoch, sessionId: page.sessionId }
        : undefined;
    },
    { space: () => [], skill: () => false, connector: () => false },
  );
  turns.begin("run", [
    {
      kind: "tab",
      pageId,
      title: "Fixture",
      url: f.live.target.url,
      documentEpoch: 1,
      sessionId: oldSession,
      access: "act",
    },
  ]);
  const outcome = await turns.navigateAttachment("run", pageId, async (mentionAuthority) => {
    const readmission = await f.navigate(mentionAuthority);
    return { result: readmission.driver, receipt: readmission.receipt };
  });
  expect(outcome).toBe(f.next.page);
  expect(f.live.target.sessionId).not.toBe(oldSession);
  expect(f.live.driver).toBe(f.next.page);
  expect(turns.require("run", pageId, "act").status).toBe("available");
  expect(f.native.egressInstall).toHaveBeenCalledTimes(2);
  expect(f.native.egressRevoke).toHaveBeenCalledTimes(1);
});

it("refuses caller-shaped attachment metadata without advancing the original mention", async () => {
  const f = fixture();
  const turns = new TurnMentions(
    (id) => {
      const page = f.pages.get(id);
      return page.sessionId
        ? { pageId: id, url: page.url, documentEpoch: page.documentEpoch, sessionId: page.sessionId }
        : undefined;
    },
    { space: () => [], skill: () => false, connector: () => false },
  );
  turns.begin("run", [
    {
      kind: "tab",
      pageId,
      title: "Fixture",
      url: f.live.target.url,
      documentEpoch: 1,
      sessionId: f.live.target.sessionId!,
      access: "act",
    },
  ]);
  const outcome = await Reflect.apply(turns.navigateAttachment, turns, [
    "run",
    pageId,
    async () => ({
      result: "forged",
      receipt: { pageId, sessionId: "invented", documentEpoch: 2, url: f.live.target.url },
    }),
  ]);
  expect(outcome).toMatchObject({ status: "unavailable" });
  expect(f.live.driver).toBe(f.old.page);
  expect(turns.require("run", pageId, "act").status).toBe("available");
  expect(f.cdp.navigateControlled).not.toHaveBeenCalled();
});

it("routes the real program executor through native readmission before its next input", async () => {
  const f = fixture();
  const ref = {
    kind: "tab" as const,
    pageId,
    title: "Fixture",
    url: f.live.target.url,
    documentEpoch: 1,
    sessionId: f.live.target.sessionId!,
    access: "act" as const,
  };
  f.repo.saveRun({
    runId: "run",
    goal: "Navigate",
    status: "running",
    pageIds: [pageId],
    createdAt: 1,
    startedAt: 1,
    config: { taskId: "task", taskRevision: 4, mentions: [ref] },
  });
  await f.pages.deps.turnMentions.begin("run", [ref], []);
  f.pages.deps.prepareAgentEgress = (runId, id) => f.egress.ensure(runId, id);
  f.pages.deps.navigateControlled = (input, registry) =>
    navigateControlledPage(input, registry, f.egress, f.cdp);
  const lanes = new PageLanes(f.pages);
  const executor = new ProgramExecutor(
    f.pages,
    lanes,
    new ObservationService(f.pages, lanes),
    new ControlAuthority(f.pages),
  );
  const checkedSessions: (string | undefined)[] = [];
  const checkValid = () => {
    if (f.repo.getRun("run")?.status !== "running" || f.live.target.controller === "human")
      throw new Error("Original execution was cancelled or taken over");
    checkedSessions.push(f.live.target.sessionId);
  };
  const originalSession = f.live.target.sessionId;
  const result = await executor.execute(
    {
      pageId,
      steps: [
        { id: "navigate", op: "navigate", url: "https://continuation.test/next" },
        { id: "input", op: "click", target: "css:#next" },
      ],
    },
    { runId: "run", sourcePageCheck: f.check, checkValid, signal: new AbortController().signal },
  );
  expect(result.status).toBe("completed");
  expect(f.cdp.navigateControlled).toHaveBeenCalledTimes(1);
  expect(f.old.click).not.toHaveBeenCalled();
  expect(f.next.click).toHaveBeenCalledTimes(1);
  expect(checkedSessions).toContain(originalSession);
  expect(checkedSessions).toContain(f.live.target.sessionId);
  expect(f.check).toHaveBeenCalled();
  await expect(f.pages.deps.turnMentions.require("run", pageId, "act")).resolves.toEqual({
    status: "available",
  });
});

it("refuses native program navigation when the genuine continuation producer is absent", async () => {
  const f = fixture();
  f.repo.saveRun({
    runId: "run",
    goal: "Navigate",
    status: "running",
    pageIds: [pageId],
    createdAt: 1,
    startedAt: 1,
    config: { implementation: "external-agent", taskId: "task", taskRevision: 4 },
  });
  const lanes = new PageLanes(f.pages);
  const executor = new ProgramExecutor(
    f.pages,
    lanes,
    new ObservationService(f.pages, lanes),
    new ControlAuthority(f.pages),
  );
  const result = await executor.execute(
    { pageId, steps: [{ id: "navigate", op: "navigate", url: "https://continuation.test/next" }] },
    { runId: "run", sourcePageCheck: f.check },
  );
  expect(result.status).toBe("failed");
  expect(result.steps[0]?.error?.code).toBe("capability_unsupported");
  expect(f.cdp.navigateControlled).not.toHaveBeenCalled();
  expect(f.live.driver).toBe(f.old.page);
});

it("retires the fresh driver and authority when original mention source revalidation refuses", async () => {
  const f = fixture();
  await f.egress.acquire("run", pageId);
  const sourceError = new Error("Original Space revision changed");
  await expect(
    navigateControlledPage(
      {
        runId: "run",
        pageId,
        url: "https://continuation.test/next",
        signal: new AbortController().signal,
        validateSource: f.check,
        mentionAuthority: () => {},
        revalidateMentionSource: async () => {
          throw sourceError;
        },
      },
      f.pages,
      f.egress,
      f.cdp,
    ),
  ).rejects.toBe(sourceError);
  expect(f.next.dispose).toHaveBeenCalledTimes(1);
  expect(f.live.driver).toBeNull();
  expect(f.live.target.sessionId).toBeUndefined();
  expect(f.native.egressRevoke).toHaveBeenCalledTimes(2);
  expect(() => f.egress.captureCdpAuthority(pageId, f.lease())).toThrow();
});

it("does not let a different internal turn validator consume the navigation receipt", async () => {
  const f = fixture();
  await f.egress.acquire("run", pageId);
  const turns = new TurnMentions(
    (id) => {
      const page = f.pages.get(id);
      return page.sessionId
        ? { pageId: id, url: page.url, documentEpoch: page.documentEpoch, sessionId: page.sessionId }
        : undefined;
    },
    { space: () => [], skill: () => false, connector: () => false },
  );
  turns.begin("run", [
    {
      kind: "tab",
      pageId,
      title: "Fixture",
      url: f.live.target.url,
      documentEpoch: 1,
      sessionId: f.live.target.sessionId!,
      access: "act",
    },
  ]);
  const outcome = await turns.navigateAttachment("run", pageId, async () => {
    const readmission = await f.navigate(() => {});
    return { result: readmission.driver, receipt: readmission.receipt };
  });
  expect(outcome).toMatchObject({ status: "unavailable" });
  expect(turns.require("run", pageId, "act").status).toBe("unavailable");
});

it.each([
  { change: "end-turn", phase: 4 },
  { change: "task-revision", phase: 4 },
  { change: "end-turn", phase: 5 },
  { change: "task-revision", phase: 5 },
])("retires fresh publication on $change during Space refresh $phase", async ({ change, phase }) => {
  const f = fixture();
  f.repo.saveRun({
    runId: "run",
    goal: "Navigate",
    status: "running",
    pageIds: [pageId],
    createdAt: 1,
    config: { taskId: "task", taskRevision: 4 },
  });
  const organization: ProfileOrganizationSnapshot = {
    revision: 1,
    shared: {
      spaces: [{ id: "space", name: "Fixture", color: "blue", grain: 0, workspaceId: "workspace" }],
      archivedSpaces: [],
      pins: {},
      folders: [],
      tabSpace: { [pageId]: "space" },
      order: [pageId],
      tabFolder: {},
      tabNames: {},
      splitGroups: [],
    },
  };
  let refreshes = 0,
    entered!: () => void,
    release!: () => void;
  const held = new Promise<void>((resolve) => {
    entered = resolve;
  });
  const waiting = new Promise<void>((resolve) => {
    release = resolve;
  });
  const service = new TurnMentionService({
    page: (id) => f.pages.get(id),
    organization: async () => {
      refreshes++;
      // Begin, initial refresh, producer pre-publication refresh, then the
      // outer refresh after the producer returned its original receipt.
      if (refreshes === phase) {
        entered();
        await waiting;
      }
      return organization;
    },
    routine: () => undefined,
    connectors: () => ({ entries: [], access: [] }),
  });
  await service.begin(
    "run",
    [
      { kind: "space", spaceId: "space", workspaceId: "workspace", revision: 1 },
      {
        kind: "tab",
        pageId,
        title: "Fixture",
        url: f.live.target.url,
        documentEpoch: 1,
        sessionId: f.live.target.sessionId!,
        access: "act",
      },
    ],
    [],
  );
  await f.egress.acquire("run", pageId);
  const pending = service.navigateAttachmentUse(
    "run",
    pageId,
    async (mentionAuthority, revalidateMentionSource) => {
      const readmission = await navigateControlledPage(
        {
          runId: "run",
          pageId,
          url: "https://continuation.test/next",
          signal: new AbortController().signal,
          validateSource: f.check,
          mentionAuthority,
          revalidateMentionSource,
        },
        f.pages,
        f.egress,
        f.cdp,
      );
      return { result: readmission.driver, receipt: readmission.receipt };
    },
  );
  const failure = pending.catch((error) => error);
  await held;
  expect(f.live.driver).toBe(f.next.page);
  expect(f.native.egressInstall).toHaveBeenCalledTimes(2);
  if (change === "end-turn") service.end("run");
  else {
    const run = f.repo.getRun("run")!;
    f.repo.saveRun({ ...run, config: { ...run.config, taskRevision: 5 } });
  }
  release();
  const error = await failure;
  expect(error).toBeInstanceOf(Error);
  expect(f.live.driver).toBeNull();
  expect(f.live.target.sessionId).toBeUndefined();
  expect(f.next.dispose).toHaveBeenCalledTimes(1);
  expect(f.native.egressRevoke).toHaveBeenCalledTimes(2);
  await expect(service.require("run", pageId, "act")).resolves.toMatchObject({ status: "unavailable" });
});

it("waits for the exact old driver destruction after TAKE before installing fresh authority", async () => {
  const f = fixture(false);
  await f.egress.acquire("run", pageId);
  const originalSession = f.live.target.sessionId;
  const pending = f.navigate();
  await vi.waitFor(() => expect(f.cdp.navigationDeadline).toHaveBeenCalledTimes(1));
  expect(f.native.egressInstall).toHaveBeenCalledTimes(1);
  expect(f.live.driver).toBe(f.old.page);
  expect(f.live.target.sessionId).toBe(originalSession);
  f.old.retire();
  const outcome = await pending;
  expect(outcome.driver).toBe(f.next.page);
  expect(f.native.egressInstall).toHaveBeenCalledTimes(2);
  expect(f.live.target.sessionId).not.toBe(originalSession);
});

it("refuses takeover while the original SDK destruction is held without installing a replacement", async () => {
  const f = fixture(false);
  await f.egress.acquire("run", pageId);
  const pending = f.navigate().then(
    () => null,
    (error) => error,
  );
  await vi.waitFor(() => expect(f.cdp.navigationDeadline).toHaveBeenCalledTimes(1));
  f.live.target.controller = "human";
  f.live.target.controllerEpoch++;
  f.old.retire();
  expect(await pending).toMatchObject({ code: "ref_stale" });
  expect(f.native.egressInstall).toHaveBeenCalledTimes(1);
  expect(f.next.dispose).not.toHaveBeenCalled();
  expect(f.live.target.controller).toBe("human");
});

it("uses the original receipt deadline while waiting for SDK destruction", async () => {
  vi.useFakeTimers();
  const f = fixture(false);
  try {
    await f.egress.acquire("run", pageId);
    const deadline = Date.now() + 60;
    let entered!: () => void;
    const started = new Promise<void>((resolve) => {
      entered = resolve;
    });
    f.cdp.navigationDeadline.mockImplementation(() => {
      entered();
      return deadline;
    });
    const pending = f.navigate().then(
      () => null,
      (error) => error,
    );
    await started;
    expect(f.live.driver).toBe(f.old.page);
    expect(f.native.egressInstall).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(61);
    expect(await pending).toMatchObject({ code: "ref_stale" });
    expect(f.native.egressInstall).toHaveBeenCalledTimes(1);
    expect(f.live.driver).toBe(f.old.page);
    f.old.retire();
    expect(f.native.egressInstall).toHaveBeenCalledTimes(1);
  } finally {
    f.old.retire();
    vi.useRealTimers();
  }
});

it("rechecks the original deadline after an early timer wake while SDK destruction is held", async () => {
  vi.useFakeTimers();
  const f = fixture(false);
  let clock: ReturnType<typeof vi.spyOn> | undefined;
  try {
    await f.egress.acquire("run", pageId);
    const deadline = Date.now() + 60;
    let entered!: () => void;
    const started = new Promise<void>((resolve) => {
      entered = resolve;
    });
    f.cdp.navigationDeadline.mockImplementation(() => {
      entered();
      return deadline;
    });
    let settled = false;
    const pending = f
      .navigate()
      .then(
        () => null,
        (error) => error,
      )
      .finally(() => {
        settled = true;
      });
    await started;
    // Deliver the original timer while the separate wall clock is one tick
    // before its deadline. The original SDK incarnation remains attached.
    clock = vi.spyOn(Date, "now").mockReturnValue(deadline - 1);
    await vi.advanceTimersByTimeAsync(60);
    expect(settled).toBe(false);
    expect(f.live.driver).toBe(f.old.page);
    expect(f.native.egressInstall).toHaveBeenCalledTimes(1);
    clock.mockRestore();
    await vi.advanceTimersByTimeAsync(1);
    expect(settled).toBe(true);
    expect(await pending).toMatchObject({ code: "ref_stale" });
    expect(f.live.driver).toBe(f.old.page);
    f.old.retire();
    expect(f.native.egressInstall).toHaveBeenCalledTimes(1);
  } finally {
    clock?.mockRestore();
    f.old.retire();
    vi.useRealTimers();
  }
});

it("retains the original command deadline while a fresh native install ACK is held", async () => {
  vi.useFakeTimers();
  const f = fixture();
  let release!: (value: { accepted: true }) => void;
  let entered!: () => void;
  const started = new Promise<void>((resolve) => {
    entered = resolve;
  });
  const held = new Promise<{ accepted: true }>((resolve) => {
    release = resolve;
  });
  try {
    await f.egress.acquire("run", pageId);
    const install = f.native.egressInstall.getMockImplementation()!;
    f.native.egressInstall.mockImplementationOnce(async (input) => {
      await install(input);
      entered();
      return held;
    });
    f.cdp.navigationDeadline.mockReturnValue(Date.now() + 1000);
    const pending = f.navigate().then(
      () => null,
      (error) => error,
    );
    await started;
    await vi.advanceTimersByTimeAsync(1001);
    release({ accepted: true });
    expect(await pending).toMatchObject({ code: "ref_stale" });
    expect(f.live.driver).toBeNull();
    expect(f.live.target.sessionId).toBeUndefined();
    expect(f.native.egressRevoke.mock.calls.length).toBeGreaterThanOrEqual(2);
  } finally {
    release?.({ accepted: true });
    vi.useRealTimers();
  }
});

it("never renews an unconsumed turn receipt or publishes it after its original deadline", async () => {
  vi.useFakeTimers();
  const f = fixture();
  try {
    await f.egress.acquire("run", pageId);
    const deadline = Date.now() + 1000;
    f.cdp.navigationDeadline.mockReturnValue(deadline);
    const turns = new TurnMentions(
      (id) => {
        const page = f.pages.get(id);
        return page.sessionId
          ? { pageId: id, url: page.url, documentEpoch: page.documentEpoch, sessionId: page.sessionId }
          : undefined;
      },
      { space: () => [], skill: () => false, connector: () => false },
    );
    turns.begin("run", [
      {
        kind: "tab",
        pageId,
        title: "Fixture",
        url: f.live.target.url,
        documentEpoch: 1,
        sessionId: f.live.target.sessionId!,
        access: "act",
      },
    ]);
    const outcome = await turns.navigateAttachment("run", pageId, async (mentionAuthority) => {
      const result = await f.navigate(mentionAuthority);
      expect(f.lease().expiresAt).toBe(deadline);
      await vi.advanceTimersByTimeAsync(1001);
      expect(f.native.egressInstall).toHaveBeenCalledTimes(2);
      return { result: result.driver, receipt: result.receipt };
    });
    expect(outcome).toMatchObject({ status: "unavailable" });
    expect(f.live.driver).toBeNull();
    expect(f.live.target.sessionId).toBeUndefined();
    expect(f.native.egressInstall).toHaveBeenCalledTimes(2);
  } finally {
    vi.useRealTimers();
  }
});

it("renews a short continuation only after real service turn publication", async () => {
  vi.useFakeTimers();
  const f = fixture();
  try {
    await f.egress.acquire("run", pageId);
    const deadline = Date.now() + 1000;
    f.cdp.navigationDeadline.mockReturnValue(deadline);
    const service = f.pages.deps.turnMentions;
    await service.begin(
      "run",
      [
        {
          kind: "tab",
          pageId,
          title: "Fixture",
          url: f.live.target.url,
          documentEpoch: 1,
          sessionId: f.live.target.sessionId!,
          access: "act",
        },
      ],
      [],
    );
    const result = await service.navigateAttachmentUse(
      "run",
      pageId,
      async (mentionAuthority, revalidateMentionSource) => {
        const outcome = await navigateControlledPage(
          {
            runId: "run",
            pageId,
            url: "https://continuation.test/next",
            signal: new AbortController().signal,
            validateSource: f.check,
            mentionAuthority,
            revalidateMentionSource,
          },
          f.pages,
          f.egress,
          f.cdp,
        );
        return { result: outcome.driver, receipt: outcome.receipt };
      },
    );
    expect(result).toBe(f.next.page);
    expect(f.lease().expiresAt).toBe(deadline);
    await vi.advanceTimersByTimeAsync(501);
    expect(f.native.egressInstall).toHaveBeenCalledTimes(3);
    expect(f.lease().expiresAt).toBeGreaterThan(deadline);
    await expect(service.require("run", pageId, "act")).resolves.toMatchObject({ status: "available" });
  } finally {
    vi.useRealTimers();
  }
});

it("readmits the first real blank-to-website document using original native retirement authority", async () => {
  const f = fixture(true, "about:blank");
  await f.egress.acquire("run", pageId, "https://continuation.test/next");
  const session = f.live.target.sessionId;
  const outcome = await navigateControlledPage(
    { runId: "run", pageId, url: "https://continuation.test/next", validateSource: f.check },
    f.pages,
    f.egress,
    f.cdp,
  );
  expect(outcome.driver).toBe(f.next.page);
  expect(f.live.target.url).toBe("https://continuation.test/next");
  expect(f.live.target.sessionId).not.toBe(session);
  expect(f.cdp.navigateControlled.mock.calls[0]?.[2].aborted).toBe(false);
  expect(f.native.egressInstall).toHaveBeenCalledTimes(2);
  expect(f.native.egressRevoke).toHaveBeenCalledTimes(1);
});

it.each(["stop", "takeover", "policy"] as const)(
  "synchronously cancels %s during the original retirement ACK gap",
  async (cause) => {
    const f = fixture(true, "about:blank");
    await f.egress.acquire("run", pageId, "https://continuation.test/next");
    let entered!: () => void, release!: () => void;
    const waiting = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    f.native.egressRevoke.mockImplementationOnce(async () => {
      entered();
      await held;
      return { accepted: true };
    });
    const pending = navigateControlledPage(
      { runId: "run", pageId, url: "https://continuation.test/next", validateSource: f.check },
      f.pages,
      f.egress,
      f.cdp,
    );
    // Attach the refusal handler before releasing any asynchronous producer.
    const refused = pending.catch((error: unknown) => error);
    try {
      await Promise.race([
        waiting,
        pending.then(() => {
          throw new Error("Navigation completed before its original retirement ACK was held");
        }),
      ]);
      const signal = f.cdp.navigateControlled.mock.calls[0]?.[2];
      expect(signal?.aborted).toBe(false);
      const actions = {
        stop: () => f.egress.suspendRun("run"),
        takeover: () => {
          f.live.target.controller = "human";
          f.egress.revokePage(pageId, "run");
        },
        policy: () => {
          void f.egress.invalidateAuthority((run) => run === "run");
        },
      };
      actions[cause]();
      expect(signal?.aborted).toBe(true);
      release();
      expect(await refused).toMatchObject({ code: "ref_stale" });
      expect(f.native.egressInstall).toHaveBeenCalledTimes(1);
      expect(f.next.dispose).not.toHaveBeenCalled();
      expect(f.pages.driverFor("aux")?.attach).not.toHaveBeenCalled();
    } finally {
      release();
      await pending.catch(() => {});
    }
  },
);

it("expires the original continuation while its retirement acknowledgement remains held", async () => {
  vi.useFakeTimers();
  const f = fixture(true, "about:blank");
  let release: (() => void) | undefined;
  let pending: ReturnType<typeof navigateControlledPage> | undefined;
  try {
    await f.egress.acquire("run", pageId, "https://continuation.test/next");
    const expiry = f.lease().expiresAt;
    let entered!: () => void;
    const waiting = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    f.native.egressRevoke.mockImplementationOnce(async () => {
      entered();
      await held;
      return { accepted: true };
    });
    pending = navigateControlledPage(
      { runId: "run", pageId, url: "https://continuation.test/next", validateSource: f.check },
      f.pages,
      f.egress,
      f.cdp,
    );
    const refused = pending.catch((error: unknown) => error);
    await Promise.race([
      waiting,
      pending.then(() => {
        throw new Error("Navigation completed before its original retirement ACK was held");
      }),
    ]);
    const signal = f.cdp.navigateControlled.mock.calls[0]?.[2];
    expect(signal?.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(expiry - Date.now());
    expect(signal?.aborted).toBe(true);
    release!();
    expect(await refused).toMatchObject({ code: "ref_stale" });
    expect(f.native.egressInstall).toHaveBeenCalledTimes(1);
    expect(f.pages.driverFor("aux")?.attach).not.toHaveBeenCalled();
  } finally {
    release?.();
    await pending?.catch(() => {});
    vi.useRealTimers();
  }
});

it("routes a genuinely created protected page first load through the same native continuation", async () => {
  const f = fixture(true, "about:blank");
  const isolation = f.live.target.agentIsolation!;
  f.repo.saveRun({
    runId: "run",
    goal: "Open website",
    status: "running",
    pageIds: [],
    createdAt: 1,
    config: { taskId: "task", taskRevision: 4 },
  });
  f.pages.live.delete(pageId);
  Object.assign(f.native, {
    createAgentPage: async () => ({
      pageId,
      creationId: "synthetic-creation",
      targetId: "target",
      isolation,
    }),
  });
  const browser = f.pages.driverFor("aux")!;
  Object.assign(browser, { isConnected: () => true });
  vi.mocked(browser.attach).mockImplementationOnce(async () => f.old.page);
  f.pages.deps.navigateControlled = (input, registry) =>
    navigateControlledPage(input, registry, f.egress, f.cdp);
  const opener = new PageOpener(f.pages, new ActivationPolicy(f.pages));
  const result = await opener.open({
    url: "https://continuation.test/next",
    background: true,
    ownedByRuntime: true,
    agentScope: { profileId: "profile", runId: "run", ancestry: ["run"], taskId: "task", taskRevision: 4 },
    beforeNavigate: (target) =>
      f.egress.acquire("run", target.pageId, "https://continuation.test/next").then(() => {}),
  });
  expect(result.pageId).toBe(pageId);
  expect(result.url).toBe("https://continuation.test/next");
  expect(f.pages.live.get(pageId)?.driver).toBe(f.next.page);
  expect(f.cdp.navigateControlled).toHaveBeenCalledTimes(1);
  expect(browser.attach).toHaveBeenCalledTimes(2);
  expect(f.native.egressInstall).toHaveBeenCalledTimes(2);
});
