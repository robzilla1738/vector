import { afterEach, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { ArtifactStore, EventBus, openDb, Repo, RunService, SetService } from "@aux/runtime";
import type { PageService, SettingsService } from "@aux/runtime";
import type { Run } from "@aux/contracts";
import { runsMethods } from "../../apps/runtime/dist/api/methods/runs.js";
import type { MethodCtx } from "../../apps/runtime/dist/api/methods/context.js";
import { fixturePage, fixtureTurnMentions } from "../fixtures/turn-mentions.js";

const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const cleanup of cleanups.splice(0)) await cleanup();
});
const deferred = () => {
  let resolve!: () => void;
  return {
    promise: new Promise<void>((done) => {
      resolve = done;
    }),
    resolve: () => resolve(),
  };
};
function fixture() {
  const dir = mkdtempSync(join(tmpdir(), "aux-first-send-"));
  const repo = new Repo(openDb(join(dir, "state.sqlite"))),
    events = new EventBus(repo);
  const source = fixturePage("source", "https://example.test/", 1);
  source.windowId = "original-window";
  const pages = {
    get: (id: string) => {
      if (id !== source.pageId) throw new Error("Missing tab");
      return source;
    },
    list: () => [source],
  } as unknown as PageService;
  const settings = {
    maxWorkers: () => 1,
    perOrigin: () => 1,
    maxModelCalls: () => 1,
    agentPolicy: () => ({ agentMode: "ask" }),
    all: () => ({ dataDir: dir }),
    plannerModel: () => "none",
    recoveryModel: () => undefined,
    model: () => null,
  } as unknown as SettingsService;
  const turnMentions = fixtureTurnMentions(() => undefined);
  const makeRuns = () =>
    new RunService({
      repo,
      events,
      pages,
      settings,
      turnMentions,
      artifacts: new ArtifactStore(dir, repo, events),
      sets: new SetService(repo, events, pages),
      nativeAvailable: () => false,
      resolveCodingContext: async () => {
        await admission?.promise;
        return { auxPackages: [] };
      },
    });
  let admission: ReturnType<typeof deferred> | undefined;
  let runs = makeRuns();
  let windowId = "original-window";
  const native = {
    turnSourceContext: async (token: string) => {
      if (token !== "trusted-native-owner") throw new Error("Retired owner");
      return { windowId, activePageId: null, revision: 0, layout: null };
    },
  };
  const invoke = (
    method: "runs.start" | "runs.reconcileStart",
    params: Record<string, unknown>,
    external = false,
  ) =>
    runsMethods[method]!({
      params,
      client: { external, nativeTurnContext: "trusted-native-owner" },
      s: { runs, repo, pages, native },
    } as unknown as MethodCtx);
  cleanups.push(async () => {
    admission?.resolve();
    await runs.close();
    repo.close();
    rmSync(dir, { recursive: true, force: true });
  });
  return {
    repo,
    source,
    invoke,
    runs: () => runs,
    window: (id: string) => {
      windowId = id;
    },
    hold: () => (admission = deferred()),
    restart: async () => {
      await vi.waitFor(() => expect(runs.coordinator.activeRunIds()).toEqual([]));
      await runs.close();
      runs = makeRuns();
    },
    request: () => ({
      requestId: randomUUID(),
      chatId: randomUUID(),
      goal: "Summarize the plan",
      pageIds: [],
      contextPageRefs: [],
      privateTask: false,
      executionTarget: "local",
    }),
  };
}

it("joins concurrent originals and recovers a lost response after runtime/window restart without dispatching again", async () => {
  const f = fixture(),
    request = f.request(),
    gate = f.hold();
  const dispatched = vi.spyOn(f.runs().coordinator, "start");
  const first = f.invoke("runs.start", request),
    duplicate = f.invoke("runs.start", request);
  await vi.waitFor(() =>
    expect(f.repo.db.prepare("SELECT state FROM run_start_receipts").get()).toEqual({ state: "reserved" }),
  );
  gate.resolve();
  const [accepted, same] = (await Promise.all([first, duplicate])) as Run[];
  expect(same!.runId).toBe(accepted!.runId);
  expect(dispatched).toHaveBeenCalledOnce();
  await f.restart();
  f.window("restored-window");
  const afterRestart = vi.spyOn(f.runs().coordinator, "start");
  expect(await f.invoke("runs.reconcileStart", request)).toMatchObject({
    status: "accepted",
    run: { runId: accepted!.runId, config: { chatId: request.chatId } },
  });
  expect(afterRestart).not.toHaveBeenCalled();
  await expect(f.invoke("runs.start", request)).rejects.toMatchObject({ code: "conflict" });
  expect(f.repo.listRuns()).toHaveLength(1);
});

it("waits for in-flight admission before reconciling, and permanently fences a never-started late RPC", async () => {
  const f = fixture(),
    request = f.request(),
    gate = f.hold();
  const first = f.invoke("runs.start", request);
  await vi.waitFor(() =>
    expect(f.repo.db.prepare("SELECT state FROM run_start_receipts").get()).toEqual({ state: "reserved" }),
  );
  let answered = false;
  const recovered = f.invoke("runs.reconcileStart", request).then((value) => {
    answered = true;
    return value;
  });
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(answered).toBe(false);
  gate.resolve();
  const accepted = (await first) as Run;
  expect(await recovered).toMatchObject({ status: "accepted", run: { runId: accepted.runId } });
  const late = f.request();
  f.window("restored-window");
  expect(await f.invoke("runs.reconcileStart", late)).toEqual({ status: "not_started", run: null });
  f.window("original-window");
  await expect(f.invoke("runs.start", late)).rejects.toMatchObject({ code: "conflict" });
  f.window("restored-window");
  await expect(f.invoke("runs.start", late)).rejects.toMatchObject({ code: "cancelled" });
  expect(f.repo.listRuns()).toHaveLength(1);
});

it("binds the original goal, chat, options and sources, and cannot recreate a deleted accepted chat", async () => {
  const f = fixture(),
    request = f.request();
  const accepted = (await f.invoke("runs.start", request)) as Run;
  await f.restart();
  for (const changed of [
    { goal: "Different task" },
    { chatId: randomUUID() },
    { agentMode: "auto" },
    {
      pageIds: ["new-tab"],
      contextPageRefs: [{ pageId: "new-tab", documentEpoch: 1, url: "https://example.test/" }],
    },
  ]) {
    await expect(f.invoke("runs.reconcileStart", { ...request, ...changed })).rejects.toMatchObject({
      code: "conflict",
    });
  }
  await expect(f.invoke("runs.reconcileStart", request, true)).rejects.toMatchObject({
    code: "permission_denied",
  });
  f.repo.deleteConversation(request.chatId);
  expect(await f.invoke("runs.reconcileStart", request)).toEqual({ status: "removed", run: null });
  await expect(f.invoke("runs.start", request)).rejects.toMatchObject({ code: "not_found" });
  expect(f.repo.getRun(accepted.runId)).toBeUndefined();
});

it("accepts the receipt in the same transaction as its run and rolls both back on failure", async () => {
  const f = fixture(),
    request = f.request();
  const gate = f.hold();
  const pending = f.invoke("runs.start", request);
  await vi.waitFor(() =>
    expect(f.repo.db.prepare("SELECT state FROM run_start_receipts").get()).toEqual({ state: "reserved" }),
  );
  f.repo.db.exec(
    "CREATE TRIGGER reject_first_send BEFORE INSERT ON runs BEGIN SELECT RAISE(ABORT, 'injected save failure'); END",
  );
  gate.resolve();
  await expect(pending).rejects.toThrow("injected save failure");
  expect(f.repo.db.prepare("SELECT state FROM run_start_receipts").get()).toEqual({ state: "reserved" });
  expect(f.repo.listRuns()).toEqual([]);
  expect(await f.invoke("runs.reconcileStart", request)).toEqual({ status: "not_started", run: null });
  const row = f.repo.db.prepare("SELECT run_id FROM run_start_receipts").get() as { run_id: string };
  f.repo.db.exec("DROP TRIGGER reject_first_send");
  expect(() =>
    f.repo.saveRun({
      runId: row.run_id,
      goal: request.goal,
      status: "queued",
      pageIds: [],
      createdAt: 1,
      config: { chatId: request.chatId },
    }),
  ).toThrow(/abandoned/);
});

it("keeps temporary request receipts in memory and does not pretend to know their outcome after restart", async () => {
  const f = fixture(),
    request = { ...f.request(), privateTask: true };
  const run = (await f.invoke("runs.start", request)) as Run;
  expect(await f.invoke("runs.reconcileStart", request)).toMatchObject({
    status: "accepted",
    run: { runId: run.runId },
  });
  expect(f.repo.db.prepare("SELECT count(*) AS n FROM run_start_receipts").get()).toEqual({ n: 0 });
  await f.restart();
  await expect(f.invoke("runs.reconcileStart", request)).rejects.toThrow(/temporary send/);
  await expect(f.invoke("runs.start", request)).rejects.toThrow(/temporary send/);
  expect(f.repo.db.prepare("SELECT count(*) AS n FROM run_start_receipts").get()).toEqual({ n: 0 });
});

it("rechecks exact native page ownership and document identity after asynchronous admission", async () => {
  const f = fixture(),
    gate = f.hold();
  const request = {
    ...f.request(),
    pageIds: [f.source.pageId],
    contextPageRefs: [
      {
        pageId: f.source.pageId,
        url: f.source.url,
        documentEpoch: f.source.documentEpoch,
        sessionId: f.source.sessionId,
      },
    ],
  };
  const dispatched = vi.spyOn(f.runs().coordinator, "start");
  const pending = f.invoke("runs.start", request);
  await vi.waitFor(() =>
    expect(f.repo.db.prepare("SELECT state FROM run_start_receipts").get()).toEqual({ state: "reserved" }),
  );
  f.source.documentEpoch++;
  gate.resolve();
  await expect(pending).rejects.toMatchObject({ code: "conflict" });
  expect(dispatched).not.toHaveBeenCalled();
  expect(await f.invoke("runs.reconcileStart", request)).toEqual({ status: "not_started", run: null });
  await expect(f.invoke("runs.start", { ...f.request(), pageIds: [f.source.pageId] })).rejects.toMatchObject({
    code: "invalid_params",
  });
});
