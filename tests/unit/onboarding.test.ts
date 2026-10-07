import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it, vi } from "vitest";
import { openDb, OnboardingService, Repo } from "@aux/runtime";
import {
  DEFAULT_BROWSER_COOLDOWN_MS,
  MethodSchemas,
  ONBOARDING_POSTCARDS,
  ONBOARDING_STEPS,
  ONBOARDING_STAGES,
  type PageTarget,
  type Run,
} from "@aux/contracts";
import { RuntimeMethodPolicy } from "@aux/contracts/runtime-method-policy";

const cleanup: (() => void)[] = [];
afterEach(() => {
  for (const action of cleanup.splice(0).reverse()) action();
});
const page: PageTarget = {
  pageId: "reviewed",
  backend: "aux",
  targetId: "atab-reviewed",
  url: "https://fixture.example/article",
  title: "Fixture article",
  documentEpoch: 2,
  lastRevision: 0,
  sessionId: "session",
  viewStatus: "visible",
  controller: "none",
  controllerEpoch: 0,
  ownedByRuntime: false,
  createdAt: 1,
  lastActiveAt: 1,
};
const ref = {
  pageId: page.pageId,
  url: page.url,
  documentEpoch: page.documentEpoch,
  sessionId: page.sessionId,
};
function fixture(path = ":memory:") {
  const db = openDb(path);
  cleanup.push(() => db.close());
  const repo = new Repo(db);
  let configured = true,
    now = 100,
    currentPage = { ...page };
  const start = vi.fn(
    async (input: Parameters<ConstructorParameters<typeof OnboardingService>[0]["start"]>[0]) => {
      const run: Run = {
        runId: input.deliveryRunId,
        goal: input.goal,
        status: "queued",
        pageIds: input.pageIds,
        config: { chatId: input.chatId },
        createdAt: now,
      };
      repo.saveRun(run);
      return run;
    },
  );
  const deps = {
    repo,
    configured: () => configured,
    page: () => currentPage,
    start,
    now: () => now,
    maxModelCalls: () => 2,
  };
  const service = new OnboardingService(deps);
  return {
    service,
    repo,
    start,
    deps,
    configure: (value: boolean) => {
      configured = value;
    },
    time: (value: number) => {
      now = value;
    },
    setPage: (patch: Partial<PageTarget>) => {
      currentPage = { ...page, ...patch };
    },
    navigate: () => {
      currentPage = { ...page, documentEpoch: 3 };
    },
  };
}
const acknowledge = (service: OnboardingService) =>
  service.update({ revision: service.get().revision, action: "disclosure" });
const source = { nativeTurnContext: "isolated-onboarding-owner", windowId: "isolated-setup-window", current: async () => {} };
const begin = (service: OnboardingService) =>
  service.start({ revision: service.get().revision, postcardId: "understand", page: ref }, source);

it("offers four optional setup screens before the first-chat and default-browser follow-ups", () => {
  const f = fixture();
  expect(ONBOARDING_STEPS).toEqual(["welcome", "import", "model", "appearance"]);
  for (const step of ONBOARDING_STEPS) {
    expect(f.service.get().step).toBe(step);
    f.service.update({ revision: f.service.get().revision, action: "skip" });
  }
  expect(f.service.get()).toMatchObject({ status: "active", step: "postcard" });
  f.service.update({ revision: f.service.get().revision, action: "skip" });
  expect(f.service.get()).toMatchObject({ status: "active", step: "default" });
  f.service.update({ revision: f.service.get().revision, action: "skip" });
  expect(f.service.get().status).toBe("complete");
  expect(f.start).not.toHaveBeenCalled();
});

it("persists every skip/replay in the Profile without importing or starting a run", () => {
  const dir = mkdtempSync(join(tmpdir(), "aux-onboarding-"));
  cleanup.push(() => rmSync(dir, { recursive: true, force: true }));
  const path = join(dir, "profile.sqlite"),
    f = fixture(path);
  for (const step of ONBOARDING_STAGES) {
    expect(f.service.get().step).toBe(step);
    f.service.update({ revision: f.service.get().revision, action: "skip" });
  }
  expect(f.service.get()).toMatchObject({ status: "complete", skipped: [...ONBOARDING_STAGES] });
  const restart = new OnboardingService({ ...f.deps, repo: fixture(path).repo });
  expect(restart.get()).toEqual(f.service.get());
  const replay = restart.update({ revision: restart.get().revision, action: "replay" });
  expect(replay).toMatchObject({ status: "active", step: "welcome", skipped: [...ONBOARDING_STAGES] });
  expect(f.start).not.toHaveBeenCalled();
  expect(fixture().service.get()).toMatchObject({ revision: 0, status: "new", skipped: [] });
});

it("rejects stale windows and persists a seven-day default-browser cooldown through replay", () => {
  const f = fixture(),
    initial = f.service.get();
  f.service.update({ revision: initial.revision, action: "default-prompt" });
  expect(() => f.service.update({ revision: initial.revision, action: "later" })).toThrow(/changed/);
  f.service.update({ revision: f.service.get().revision, action: "replay" });
  expect(() => f.service.update({ revision: f.service.get().revision, action: "default-prompt" })).toThrow(
    /cooldown/,
  );
  f.time(100 + DEFAULT_BROWSER_COOLDOWN_MS);
  expect(
    f.service.update({ revision: f.service.get().revision, action: "default-prompt" })
      .defaultBrowserPromptedAt,
  ).toBe(100 + DEFAULT_BROWSER_COOLDOWN_MS);
  expect(f.start).not.toHaveBeenCalled();
});

it("requires disclosure, a configured model and the exact reviewed live page before dispatch", async () => {
  const f = fixture();
  await expect(begin(f.service)).rejects.toThrow(/data/);
  acknowledge(f.service);
  f.configure(false);
  await expect(begin(f.service)).rejects.toThrow(/model connection/);
  f.configure(true);
  f.navigate();
  await expect(begin(f.service)).rejects.toThrow(/page changed/);
  expect(f.start).not.toHaveBeenCalled();
  expect(f.service.get().firstTask).toBeUndefined();
  for (const bad of ["about:blank", "file:///private/source", "https://user:pass@example.com"]) {
    const isolated = new OnboardingService({ ...f.deps, page: () => ({ ...page, url: bad }) });
    await expect(
      isolated.start({
        revision: isolated.get().revision,
        postcardId: "understand",
        page: { ...ref, url: bad },
      }, source),
    ).rejects.toThrow(/page changed/);
  }
});

it.each([
  { loading: true },
  { controller: "agent" as const },
  { controller: "external" as const },
  { ownedByRuntime: true },
])("refuses an unavailable source %j before reserving a first-chat identity", async (patch) => {
  const f = fixture();
  acknowledge(f.service);
  f.setPage(patch);
  await expect(begin(f.service)).rejects.toThrow(/page changed or is unavailable/);
  expect(f.start).not.toHaveBeenCalled();
  expect(f.service.get().firstTask).toBeUndefined();
});

it("rechecks source admission after receipt reservation and reuses that identity on reviewed retry", async () => {
  const f = fixture();
  acknowledge(f.service);
  const pending = begin(f.service);
  const firstId = f.service.get().firstTask!.runId;
  f.setPage({ controller: "agent" });
  await expect(pending).rejects.toThrow(/page changed or is unavailable/);
  expect(f.start).not.toHaveBeenCalled();
  expect(f.service.get().firstTask).toMatchObject({ runId: firstId, status: "failed" });
  f.setPage({});
  expect((await begin(f.service)).run?.runId).toBe(firstId);
  expect(f.start).toHaveBeenCalledOnce();
});

it("uses a durable server-owned delivery ID, honors the lower configured budget and reconciles a lost response", async () => {
  const f = fixture();
  acknowledge(f.service);
  const adapter = f.start.getMockImplementation()!;
  f.start.mockImplementation(async (input) => {
    await adapter(input);
    throw new Error("response lost");
  });
  const input = { revision: f.service.get().revision, postcardId: "understand" as const, page: ref };
  const [a, b] = await Promise.all([f.service.start(input, source), f.service.start(input, source)]);
  expect(a.run?.runId).toBe(b.run?.runId);
  expect(a.state).toMatchObject({ status: "active", step: "default" });
  expect(f.start).toHaveBeenCalledTimes(1);
  expect(f.start.mock.calls[0]?.[0]).toMatchObject({
    maxModelCalls: 2,
    nativeTurnContext: source.nativeTurnContext,
    privateTask: true,
    goal: ONBOARDING_POSTCARDS[0].prompt,
    contextPageRefs: [ref],
    deliveryRunId: a.state.firstTask?.runId,
  });
  const restart = new OnboardingService(f.deps);
  restart.update({ revision: restart.get().revision, action: "replay" });
  expect((await begin(restart)).run?.runId).toBe(a.run?.runId);
  expect(f.start).toHaveBeenCalledTimes(1);
  const receipt = JSON.stringify(f.repo.getSetting("onboarding.state.v1"));
  expect(receipt).not.toContain(page.url);
  expect(receipt).not.toContain(page.title);
  expect(receipt).not.toContain(ONBOARDING_POSTCARDS[0].prompt);
});

it("reconciles an interrupted start without automatic retry and reuses its identity on explicit retry", async () => {
  const f = fixture();
  acknowledge(f.service);
  f.start.mockRejectedValueOnce(new Error("before dispatch"));
  await expect(begin(f.service)).rejects.toThrow(/before dispatch/);
  const failed = f.service.get(),
    first = failed.firstTask!;
  // Crash at the persisted pending receipt, before RunCoordinator committed its row.
  f.repo.setSetting("onboarding.state.v1", { ...failed, firstTask: { ...first, status: "pending" } });
  const restart = new OnboardingService(f.deps);
  expect(restart.get().firstTask).toMatchObject({ status: "interrupted", runId: first.runId });
  expect(f.start).toHaveBeenCalledTimes(1);
  expect((await begin(restart)).run?.runId).toBe(first.runId);
  expect(f.start).toHaveBeenCalledTimes(2);
});

it("never recreates a removed first chat or substitutes a different postcard", async () => {
  const f = fixture();
  acknowledge(f.service);
  const first = await begin(f.service);
  await expect(
    f.service.start({ revision: f.service.get().revision, postcardId: "plan", page: ref }, source),
  ).rejects.toThrow(/already has/);
  f.repo.deleteConversation(first.state.firstTask!.chatId);
  expect(f.service.get().firstTask?.status).toBe("unavailable");
  await expect(begin(f.service)).rejects.toThrow(/removed/);
  expect(f.start).toHaveBeenCalledTimes(1);
});

it("does not reset malformed progress or accept a renderer-chosen run, prompt or authority", () => {
  const f = fixture();
  f.repo.setSetting("onboarding.state.v1", { version: 300 });
  expect(() => f.service.get()).toThrow(/could not be read/);
  expect(
    MethodSchemas["onboarding.start"].safeParse({
      revision: 0,
      postcardId: "plan",
      page: ref,
      runId: "override",
      goal: "send data",
    }).success,
  ).toBe(false);
  for (const method of ["onboarding.get", "onboarding.update", "onboarding.start"] as const)
    expect(RuntimeMethodPolicy[method].auth).toBe("aux-webui");
});

it("refuses unexpected run identity without creating another delivery on retry", async () => {
  const f = fixture();
  acknowledge(f.service);
  f.start.mockResolvedValueOnce({
    runId: "wrong-identity",
    goal: "Unexpected",
    status: "queued",
    pageIds: [],
    createdAt: 1,
  });
  await expect(begin(f.service)).rejects.toThrow(/unexpected identity/);
  expect(f.service.get().firstTask?.status).toBe("unavailable");
  await expect(begin(f.service)).rejects.toThrow(/removed/);
  expect(f.start).toHaveBeenCalledTimes(1);
});

it("refuses external callers at the handler before reading Profile setup", async () => {
  const { onboardingMethods } = await import("../../apps/runtime/dist/api/methods/onboarding.js");
  for (const method of ["onboarding.get", "onboarding.update", "onboarding.start"] as const) {
    await expect(
      onboardingMethods[method]!({ client: { external: true }, s: {}, params: {} } as never),
    ).rejects.toThrow(/own window/);
  }
});

it("checks staged recovery on the server even when the renderer's status is stale", async () => {
  const { onboardingMethods } = await import("../../apps/runtime/dist/api/methods/onboarding.js");
  const dir = mkdtempSync(join(tmpdir(), "aux-onboarding-restore-"));
  cleanup.push(() => rmSync(dir, { recursive: true, force: true }));
  writeFileSync(join(dir, "pending-runtime-restore.json"), "{}");
  const f = fixture();
  acknowledge(f.service);
  await expect(
    onboardingMethods["onboarding.start"]!({
      client: { external: false },
      params: {
        revision: f.service.get().revision,
        postcardId: "understand",
        page: ref,
      },
      s: {
        repo: f.repo,
        settings: { all: () => ({ dataDir: dir, modelConfigured: true }) },
        pages: { get: () => page },
        runs: { start: f.start },
      },
    } as never),
  ).rejects.toThrow(/Recovery is staged/);
  expect(f.start).not.toHaveBeenCalled();
});
