import { afterEach, expect, it, vi } from "vitest";
import type { DriverPage, DriverPageEvents } from "@aux/chromium-driver";
import type { PageTarget } from "@aux/contracts";
import { EventBus, NullNativeBridge, openDb, Repo } from "@aux/runtime";
import { PageRegistry } from "../../apps/runtime/src/services/pages/registry.js";
import { PageLanes } from "../../apps/runtime/src/services/pages/lanes.js";
import { ControlAuthority } from "../../apps/runtime/src/services/pages/control.js";
import { ObservationService } from "../../apps/runtime/src/services/pages/observation.js";
import { ProgramExecutor } from "../../apps/runtime/src/services/pages/executor.js";
import { fixtureTurnMentions } from "../fixtures/turn-mentions.js";

const repos: Repo[] = [];
afterEach(() => {
  for (const repo of repos.splice(0)) repo.close();
});
const url = "https://incarnation.test/page";
function driver() {
  let events: DriverPageEvents = {};
  const click = vi.fn(async () => {});
  const originForTarget = vi.fn(async () => new URL(url).origin);
  const page = {
    identity: { backend: "aux", pageId: "tab", targetId: "target" },
    isAttached: () => true,
    url: () => url,
    title: async () => "Incarnation",
    click,
    originForTarget,
    dispose: async () => {},
    setEvents: (value: DriverPageEvents) => {
      events = value;
    },
  } as unknown as DriverPage;
  return { page, click, originForTarget, events: () => events };
}
function fixture() {
  const repo = new Repo(openDb(":memory:"));
  repos.push(repo);
  const pages = new PageRegistry({
    repo,
    events: new EventBus(repo),
    native: new NullNativeBridge(),
    turnMentions: fixtureTurnMentions((id): PageTarget | undefined => pages.get(id)),
    drivers: () => ({ aux: null, chrome: null }),
  });
  const target: PageTarget = {
    pageId: "tab",
    backend: "aux",
    targetId: "target",
    url,
    title: "Incarnation",
    documentEpoch: 1,
    lastRevision: 0,
    viewStatus: "visible",
    controller: "none",
    controllerEpoch: 0,
    ownedByRuntime: true,
    createdAt: 1,
    lastActiveAt: 1,
  };
  const original = driver(),
    replacement = driver();
  const live = pages.addLive(target, original.page);
  const lanes = new PageLanes(pages);
  const control = new ControlAuthority(pages);
  const executor = new ProgramExecutor(pages, lanes, new ObservationService(pages, lanes), control);
  return {
    pages,
    live,
    original,
    replacement,
    control,
    execute: () => executor.execute({ pageId: "tab", steps: [{ id: "click", op: "click", target: "r1" }] }),
  };
}
function holdOrigin(f: ReturnType<typeof fixture>, dispatch: boolean) {
  let entered!: () => void, release!: () => void;
  const started = new Promise<void>((resolve) => {
    entered = resolve;
  });
  const waiting = new Promise<void>((resolve) => {
    release = resolve;
  });
  if (dispatch) f.original.originForTarget.mockResolvedValueOnce(new URL(url).origin);
  f.original.originForTarget.mockImplementationOnce(async () => {
    entered();
    await waiting;
    return new URL(url).origin;
  });
  return { started, release };
}
it("refuses replaced attachment during preflight despite identical URL and document epoch", async () => {
  const f = fixture(),
    held = holdOrigin(f, false);
  const originalSession = f.live.target.sessionId;
  const pending = f.execute();
  const failure = pending.catch((error) => error);
  await held.started;
  f.original.events().onDestroyed?.("closed");
  f.pages.installDriver(f.live, f.replacement.page);
  expect(f.live.target.sessionId).not.toBe(originalSession);
  expect(f.live.target.documentEpoch).toBe(1);
  held.release();
  expect(await failure).toMatchObject({ code: "ref_stale" });
  expect(f.original.click).not.toHaveBeenCalled();
  expect(f.replacement.click).not.toHaveBeenCalled();
});
it("never sends captured old driver input after dispatch authorization awaits replacement", async () => {
  const f = fixture(),
    held = holdOrigin(f, true);
  const pending = f.execute();
  await held.started;
  f.original.events().onDestroyed?.("closed");
  f.pages.installDriver(f.live, f.replacement.page);
  held.release();
  const result = await pending;
  expect(result.status).toBe("failed");
  expect(result.steps[0]).toMatchObject({ status: "failed", error: { code: "ref_stale" } });
  expect(f.original.click).not.toHaveBeenCalled();
  expect(f.replacement.click).not.toHaveBeenCalled();
});
it("refuses removed LivePage reused under the same catalog Page ID", async () => {
  const f = fixture(),
    held = holdOrigin(f, false);
  const pending = f.execute();
  const failure = pending.catch((error) => error);
  await held.started;
  const replacement = f.pages.addLive({ ...f.live.target }, f.replacement.page);
  expect(replacement.target.pageId).toBe(f.live.target.pageId);
  held.release();
  expect(await failure).toMatchObject({ code: "ref_stale" });
  expect(f.original.click).not.toHaveBeenCalled();
  expect(f.replacement.click).not.toHaveBeenCalled();
});
it("dispatches once on the unchanged real attachment", async () => {
  const f = fixture();
  const result = await f.execute();
  expect(result.status).toBe("completed");
  expect(f.original.click).toHaveBeenCalledTimes(1);
  expect(f.replacement.click).not.toHaveBeenCalled();
});

it("retains original person-control epoch across a held stage acquisition", async () => {
  const f = fixture();
  let entered!: () => void, release!: () => void;
  const started = new Promise<void>((resolve) => {
    entered = resolve;
  });
  const waiting = new Promise<void>((resolve) => {
    release = resolve;
  });
  Object.assign(f.pages.deps.native, {
    available: () => true,
    acquireStage: async () => {
      entered();
      await waiting;
      return { ok: true };
    },
    releaseStage: async () => ({ ok: true }),
  });
  const pending = f.execute();
  await started;
  await f.control.takeover("tab");
  release();
  const result = await pending;
  expect(result.status).toBe("failed");
  expect(result.steps[0]).toMatchObject({ status: "failed", error: { code: "conflict" } });
  expect(f.live.target.controller).toBe("human");
  expect(f.original.click).not.toHaveBeenCalled();
  expect(f.replacement.click).not.toHaveBeenCalled();
});
