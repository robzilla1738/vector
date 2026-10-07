import { afterEach, expect, it, vi } from "vitest";
import { PageOwnership } from "../../apps/runtime/src/scheduler/page-ownership.js";
import { PageTargetSchema } from "@aux/contracts";
import { RunCoordinator } from "../../apps/runtime/src/agent/coordinator.js";
import { TurnMentionService } from "../../apps/runtime/src/services/turn-mention-service.js";
import { PageService } from "../../apps/runtime/src/services/pages.js";
import { NullNativeBridge } from "../../apps/runtime/src/native.js";
import { openDb } from "../../apps/runtime/src/store/db.js";
import { Repo } from "../../apps/runtime/src/store/repo.js";
import { EventBus } from "../../apps/runtime/src/events.js";
const databases: ReturnType<typeof openDb>[] = [];
afterEach(() => {
  for (const db of databases.splice(0)) db.close();
});
function fixture() {
  const db = openDb(":memory:");
  databases.push(db);
  const repo = new Repo(db),
    events = new EventBus(repo);
  const page = PageTargetSchema.parse({
    pageId: "owned",
    backend: "aux",
    targetId: "target",
    windowId: "main",
    url: "https://owned.test/",
    title: "Owned",
    documentEpoch: 1,
    sessionId: "attached",
    lastRevision: 0,
    viewStatus: "visible",
    lifecycle: "live",
    controller: "agent",
    controllerEpoch: 0,
    ownedByRuntime: true,
    createdAt: 1,
    lastActiveAt: 1,
  });
  const targets = new Map([
    [page.pageId, page],
    [
      "b",
      { ...page, pageId: "b", url: "https://owned.test/b", sessionId: "b-attachment", ownedByRuntime: false },
    ],
  ]);
  const ownership = new PageOwnership();
  const mentions = new TurnMentionService({
    page: (id) => targets.get(id),
    organization: async () => ({ revision: 1, shared: null }),
    routine: () => undefined,
    connectors: () => ({ entries: [], access: [] }),
  });
  const pages = new PageService({
    repo,
    events,
    native: new NullNativeBridge(),
    drivers: () => ({ aux: null, chrome: null }),
    turnMentions: mentions,
  });
  vi.spyOn(pages, "get").mockImplementation((id) => {
    const target = targets.get(id);
    if (!target) throw new Error("Missing fixture target");
    return target;
  });
  const coordinator = new RunCoordinator({
    repo,
    events,
    pages,
    pageOwnership: ownership,
    turnMentions: mentions,
    model: () => null,
    defaultModel: () => "fixture",

    recordModelCall: () => {},
  });
  repo.saveRun({
    runId: "run",
    goal: "Read fixture",
    status: "needs_input",
    pageIds: [],
    createdAt: 1,
    config: { chatId: "chat" },
  });
  const ref = {
    kind: "tab" as const,
    pageId: page.pageId,
    title: page.title,
    url: page.url,
    documentEpoch: page.documentEpoch,
    sessionId: "attached",
    access: "read" as const,
  };
  return { coordinator, mentions, repo, ref, ownership, targets };
}
it("only actual created pages survive an acknowledged steer and final completion retires them", async () => {
  const { coordinator, mentions } = fixture();
  await mentions.begin("run", [], []);
  coordinator.ownPage("run", "owned");
  coordinator.steer("run");
  expect(mentions.has("run")).toBe(false);
  await mentions.begin("run", [], coordinator.ownedPages("run"));
  expect(await mentions.require("run", "owned", "act")).toEqual({ status: "available" });
  await coordinator.finish("run", "cancelled");
  expect(coordinator.ownedPages("run")).toEqual([]);
  expect(mentions.has("run")).toBe(false);
});
it("actual human answer saves validated refs and replaces the acknowledged generation", async () => {
  const { coordinator, mentions, repo, ref } = fixture();
  const retire = coordinator.registerBatch(repo.getRun("run")!);
  await mentions.begin("run", [], []);
  const old = mentions.capture("run");
  const answer = await coordinator.answerWithMentions("run", "Read this", [ref], () => {});
  expect(answer.status).toBe("running");
  expect(answer.config?.messageRevision).toBe(1);
  expect(repo.getRun("run")!.config!.mentions).toEqual([ref]);
  await expect(mentions.assert("run", "owned", "read", old)).rejects.toThrow("turn changed");
  expect(await mentions.require("run", "owned", "read")).toEqual({ status: "available" });
  expect(await mentions.require("run", "owned", "act")).toMatchObject({ status: "unavailable" });
  retire();
});
it("a changed suspension cannot acknowledge or persist a replacement answer", async () => {
  const { coordinator, mentions, repo, ref } = fixture();
  await mentions.begin("run", [], []);
  await expect(
    coordinator.answerWithMentions("run", "Read this", [ref], () => {
      throw new Error("Suspension changed");
    }),
  ).rejects.toThrow("Suspension changed");
  expect(repo.getRun("run")!.status).toBe("needs_input");
  expect(repo.getRun("run")!.config!.mentions).toBeUndefined();
  expect(coordinator.answers.has("run")).toBe(false);
  expect(mentions.has("run")).toBe(false);
});

it("a person selecting B retires A's actual lease before the next read, retaining read-only B scope", async () => {
  const { coordinator, mentions, repo, ref, ownership, targets } = fixture();
  coordinator.controls.set("run", { abort: new AbortController(), paused: false });
  repo.saveRun({ ...repo.getRun("run")!, config: { chatId: "chat", mentions: [ref] } });
  await mentions.begin("run", [ref], []);
  await coordinator.refreshPageSelection("run");
  expect(ownership.snapshot().owned?.runId).toBe("run");
  const b = targets.get("b")!;
  const next = { ...ref, pageId: b.pageId, url: b.url, sessionId: b.sessionId! };
  repo.saveRun({ ...repo.getRun("run")!, config: { chatId: "chat", messageRevision: 1, mentions: [next] } });
  coordinator.steer("run");
  await mentions.begin("run", [next], []);
  expect(await coordinator.refreshPageSelection("run")).toEqual(["b"]);
  expect(ownership.snapshot().owned).toBeUndefined();
  expect(ownership.snapshot().b?.runId).toBe("run");
  await expect(coordinator.usePage("run", "owned", "read", async () => "old content")).rejects.toThrow();
  expect(await coordinator.usePage("run", "b", "read", async () => "B content")).toBe("B content");
  await expect(coordinator.usePage("run", "b", "act", async () => undefined)).rejects.toThrow();
  await coordinator.finish("run", "cancelled");
  expect(mentions.has("run")).toBe(false);
  await expect(coordinator.usePage("run", "b", "read", async () => "late result")).rejects.toThrow();
});
it("a new turn ending while B's real lease is queued cannot retain the late-acquired lease", async () => {
  const { coordinator, mentions, repo, ref, ownership, targets } = fixture();
  coordinator.controls.set("run", { abort: new AbortController(), paused: false });
  const b = targets.get("b")!;
  const next = { ...ref, pageId: b.pageId, url: b.url, sessionId: b.sessionId! };
  repo.saveRun({ ...repo.getRun("run")!, config: { chatId: "chat", mentions: [next] } });
  const release = ownership.tryAcquire({ pageId: "b", actor: "external", connectionId: "holder" });
  await mentions.begin("run", [next], []);
  const pending = coordinator.refreshPageSelection("run");
  coordinator.steer("run");
  release();
  await expect(pending).rejects.toThrow(/turn changed/);
  expect(ownership.snapshot()).toEqual({});
  expect(mentions.has("run")).toBe(false);
});

it("actual running-loop termination releases its page lease and turn authority", async () => {
  const { coordinator, mentions, ownership, ref, repo } = fixture();
  const run = await coordinator.start({
    runId: "live-run",
    goal: "Read fixture",
    pageIds: [ref.pageId],
    mentions: [ref],
  });
  await vi.waitFor(() => {
    expect(repo.getRun(run.runId)?.status).toBe("failed");
    expect(ownership.snapshot()).toEqual({});
    expect(mentions.has(run.runId)).toBe(false);
  });
});
