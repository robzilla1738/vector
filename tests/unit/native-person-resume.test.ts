import { afterEach, expect, it, vi } from "vitest";
import { EgressContextSchema, type EgressContext, type PageTarget } from "@aux/contracts";
import { EventBus, NullNativeBridge, openDb, Repo } from "@aux/runtime";
import { ControlAuthority } from "../../apps/runtime/src/services/pages/control.js";
import { PageRegistry } from "../../apps/runtime/src/services/pages/registry.js";
import { pagesMethods } from "../../apps/runtime/src/api/methods/pages.js";
import type { MethodCtx } from "../../apps/runtime/src/api/methods/context.js";
import { fixtureTurnMentions } from "../fixtures/turn-mentions.js";

const cleanups: Array<() => void> = [];
afterEach(() => {
  for (const close of cleanups.splice(0)) close();
});
function fixture() {
  const repo = new Repo(openDb(":memory:"));
  cleanups.push(() => repo.close());
  const events = new EventBus(repo),
    emit = vi.spyOn(events, "emit");
  const isolation = {
    isolationId: "isolation",
    runId: "run",
    taskId: "task",
    taskRevision: 3,
    mode: "session" as const,
    inMemory: false as const,
    cookies: "profile" as const,
  };
  const context: EgressContext = EgressContextSchema.parse({
    profileId: "profile",
    tabId: "page",
    frameId: "frame",
    documentToken: "native-document",
    sourceOrigin: "https://fixture.test",
    controlGeneration: "new-native-person-release",
    personControlled: false,
    isolation,
  });
  const native = Object.assign(new NullNativeBridge(), {
    egressResumePerson: vi.fn(async () => ({
      accepted: true as const,
      context,
      expiresAt: Date.now() + 8_000,
    })),
    egressContext: vi.fn(async () => context),
  });
  const registry = new PageRegistry({
    repo,
    events,
    native,
    profileId: "profile",
    turnMentions: fixtureTurnMentions((id) => repo.getPage(id)),
    drivers: () => ({ aux: null, chrome: null }),
  });
  const page: PageTarget = {
    pageId: "page",
    backend: "aux",
    targetId: "target",
    url: "https://fixture.test/task",
    title: "Task",
    documentEpoch: 4,
    sessionId: "original-driver",
    lastRevision: 0,
    viewStatus: "visible",
    controller: "human",
    controllerEpoch: 6,
    ownedByRuntime: true,
    createdAt: 1,
    lastActiveAt: 1,
    agentIsolation: isolation,
  };
  registry.addLive(page, null);
  return { registry, native, context, page, emit, control: new ControlAuthority(registry) };
}
function held() {
  let release!: () => void;
  const wait = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { wait, release };
}
it("publishes Return control only after original native one-use ACK and current document confirmation", async () => {
  const f = fixture(),
    gate = held();
  f.native.egressResumePerson.mockImplementationOnce(async () => {
    await gate.wait;
    return { accepted: true, context: f.context, expiresAt: Date.now() + 8_000 };
  });
  const pending = f.control.resume("page", "original-local-person-ticket");
  expect(f.page.controller).toBe("human");
  expect(f.native.egressContext).not.toHaveBeenCalled();
  gate.release();
  await expect(pending).resolves.toMatchObject({ controller: "none", controllerEpoch: 7 });
  expect(f.native.egressResumePerson).toHaveBeenCalledExactlyOnceWith({
    pageId: "page",
    ticketId: "original-local-person-ticket",
  });
  expect(f.native.egressContext).toHaveBeenCalledExactlyOnceWith({ tabId: "page", expectedUrl: f.page.url });
  await expect(f.control.resume("page", "original-local-person-ticket")).rejects.toMatchObject({
    code: "conflict",
  });
  expect(f.native.egressResumePerson).toHaveBeenCalledTimes(1);
});
it.each(["epoch", "replacement", "controller"])(
  "refuses original held release after %s changes during native ACK",
  async (change) => {
    const f = fixture(),
      gate = held();
    f.native.egressResumePerson.mockImplementationOnce(async () => {
      await gate.wait;
      return { accepted: true, context: f.context, expiresAt: Date.now() + 8_000 };
    });
    const refusal = f.control.resume("page", "original-local-person-ticket").catch((error) => error);
    if (change === "epoch") f.page.documentEpoch++;
    if (change === "controller") f.page.controllerEpoch++;
    if (change === "replacement") {
      f.registry.live.delete("page");
      f.registry.addLive({ ...f.page }, null);
    }
    gate.release();
    expect(await refusal).toMatchObject({ code: "ref_stale" });
    expect(f.registry.get("page").controller).toBe("human");
    expect(f.native.egressContext).not.toHaveBeenCalled();
    expect(f.emit.mock.calls.filter(([type]) => type === "page.takeover")).toHaveLength(0);
  },
);
it("refuses a delayed native person ACK whose original receipt expired", async () => {
  const f = fixture();
  f.native.egressResumePerson.mockResolvedValueOnce({
    accepted: true,
    context: f.context,
    expiresAt: Date.now() - 1,
  });
  await expect(f.control.resume("page", "original-local-person-ticket")).rejects.toMatchObject({
    code: "ref_stale",
  });
  expect(f.page.controller).toBe("human");
  expect(f.native.egressContext).not.toHaveBeenCalled();
});
it("refuses a missing original native person invocation without consuming or publishing", async () => {
  const f = fixture();
  await expect(f.control.resume("page")).rejects.toMatchObject({ code: "permission_denied" });
  expect(f.native.egressResumePerson).not.toHaveBeenCalled();
  expect(f.page.controller).toBe("human");
});
it("retains the held page on native refusal and on newer person input before final confirmation", async () => {
  const f = fixture();
  f.native.egressResumePerson.mockRejectedValueOnce(new Error("original receipt consumed"));
  await expect(f.control.resume("page", "original-local-person-ticket")).rejects.toThrow(
    "original receipt consumed",
  );
  expect(f.page.controller).toBe("human");
  f.native.egressContext.mockResolvedValueOnce({
    ...f.context,
    personControlled: true,
    controlGeneration: "newer-input",
  });
  await expect(f.control.resume("page", "original-local-person-ticket")).rejects.toMatchObject({
    code: "ref_stale",
  });
  expect(f.page.controller).toBe("human");
});
it.each([{ external: true }, { external: false, codeMode: true as const }])(
  "rejects $external external/code Return control before any native mutation",
  async (client) => {
    const resume = vi.fn();
    const handler = pagesMethods["pages.resume"]!;
    // Partial handler dependency fixture; no native authority is supplied.
    const ctx = { client, params: { pageId: "page" }, s: { pages: { resume } } } as unknown as MethodCtx;
    await expect(handler(ctx)).rejects.toMatchObject({ code: "permission_denied" });
    expect(resume).not.toHaveBeenCalled();
  },
);

it("preserves the existing attached-Chrome person row without manufacturing native authority", async () => {
  const f = fixture();
  f.page.backend = "chrome";
  delete f.page.agentIsolation;
  await expect(f.control.resume("page")).resolves.toMatchObject({ controller: "none", controllerEpoch: 7 });
  expect(f.native.egressResumePerson).not.toHaveBeenCalled();
  expect(f.native.egressContext).not.toHaveBeenCalled();
});

it.each(["taskRevision", "runId"] as const)(
  "refuses same-isolation-ID %s drift during either genuine native await",
  async (key) => {
    for (const boundary of ["resume", "confirmation"] as const) {
      const f = fixture(),
        gate = held();
      if (boundary === "resume")
        f.native.egressResumePerson.mockImplementationOnce(async () => {
          await gate.wait;
          return { accepted: true, context: f.context, expiresAt: Date.now() + 8_000 };
        });
      else
        f.native.egressContext.mockImplementationOnce(async () => {
          await gate.wait;
          return f.context;
        });
      const refusal = f.control.resume("page", "original-local-person-ticket").catch((error) => error);
      await vi.waitFor(() =>
        expect(
          boundary === "confirmation" ? f.native.egressContext : f.native.egressResumePerson,
        ).toHaveBeenCalledOnce(),
      );
      f.page.agentIsolation = {
        ...f.page.agentIsolation!,
        ...(key === "taskRevision" ? { taskRevision: 4 } : { runId: "replacement-run" }),
      };
      gate.release();
      expect(await refusal).toMatchObject({ code: "ref_stale" });
      expect(f.page.agentIsolation.isolationId).toBe("isolation");
      expect(f.page.controller).toBe("human");
      expect(f.emit.mock.calls.filter(([type]) => type === "page.takeover")).toHaveLength(0);
    }
  },
);
