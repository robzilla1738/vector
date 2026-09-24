import { afterEach, describe, expect, it, vi } from "vitest";
import type { ModelClient } from "@aux/runtime";
import { EventBus, openDb, Repo, RunCoordinator } from "@aux/runtime";
import type { Observation, PlanStep } from "@aux/contracts";
import { RunMessageQueue } from "../../apps/runtime/src/services/run-messages.js";
import { PageOwnership } from "../../apps/runtime/src/scheduler/page-ownership.js";

const databases: ReturnType<typeof openDb>[] = [];
afterEach(() => { for (const db of databases.splice(0)) db.close(); });

const observation = (): Observation => ({
  observationId: "obs", pageId: "page", documentEpoch: 1, revision: 1, observedAt: Date.now(), scope: "full",
  content: { url: "https://example.test/", title: "Example", viewport: { width: 100, height: 100, scale: 1 },
    scroll: { x: 0, y: 0, maxY: 0 }, frames: [], text: "Example result", headings: [],
    elements: [{ ref: "r1", tag: "button", role: "button", name: "Apply", frame: "main", selector: { role: { role: "button", name: "Apply" } } }],
    formFields: [], tables: [], links: [], dialogs: [], truncated: false, stats: { elementsTotal: 1, elementsShown: 1, textChars: 14, approxTokens: 4 } },
}) as Observation;

function harness(model: ModelClient, execute = vi.fn(async () => ({ status: "completed" as const, steps: [] }))) {
  const db = openDb(":memory:"); databases.push(db);
  const repo = new Repo(db);
  const events = new EventBus(repo);
  const pageOwnership = new PageOwnership();
  const coordinator = new RunCoordinator({ repo, events,
    pages: { observe: vi.fn(async () => observation()), execute, livePageIds: () => ["page"], get: () => ({ viewStatus: "visible" }) } as never,
    model: () => model, defaultModel: () => "fixture", recoveryModel: () => undefined, recordModelCall: () => {},
    grants: ["effect:read", "effect:write", "effect:destructive", "effect:egress"],
    pageOwnership,
  });
  const messages = new RunMessageQueue(repo, events, async () => { throw new Error("unexpected queue delivery"); },
    runId => coordinator.controls.has(runId), runId => coordinator.steer(runId));
  return { repo, coordinator, messages, pageOwnership };
}

const refs = [{ pageId: "page", url: "https://example.test/", documentEpoch: 1 }];
const steer = (runId: string) => ({ messageId: "11111111-1111-4111-8111-111111111111", runId, chatId: "chat",
  text: "Use the updated requirement", pageIds: ["page"], contextPageRefs: refs, expectedRevision: 0 });

describe("run steering", () => {
  it("releases a paused coordinator page after its active plan settles", async () => {
    let releasePlan!: () => void;
    const planGate = new Promise<void>(resolve => { releasePlan = resolve; });
    let calls = 0;
    const model: ModelClient = {
      generateStructured: async options => {
        calls++;
        if (calls === 1) await planGate;
        return { object: options.schema.parse(calls === 1
          ? { status: "continue", message: "Looking again", observationRequest: { scope: "full" } }
          : { status: "done", message: "Done", result: { answer: "Example result" } }), durationMs: 1 };
      },
      generateText: async () => ({ text: "", durationMs: 0 }),
      listModels: async () => [],
    };
    const { repo, coordinator, messages, pageOwnership } = harness(model);
    const run = await coordinator.start({ goal: "Find the result", pageIds: ["page"] });
    await vi.waitFor(() => expect(calls).toBe(1));
    expect(pageOwnership.snapshot().page).toMatchObject({ runId: run.runId });
    coordinator.pause(run.runId);
    releasePlan();
    await vi.waitFor(() => expect(pageOwnership.snapshot().page).toBeUndefined());
    const releaseExternal = pageOwnership.tryAcquire({ pageId: "page", actor: "external" });
    coordinator.resume(run.runId);
    await new Promise(resolve => setTimeout(resolve, 140));
    expect(calls).toBe(1);
    releaseExternal();
    await vi.waitFor(() => expect(pageOwnership.snapshot().page).toMatchObject({ actor: "coordinator" }));
    await vi.waitFor(() => expect(calls).toBeGreaterThan(1));
    await vi.waitFor(() => expect(repo.getRun(run.runId)?.status).toBe("completed"));
    expect(pageOwnership.snapshot().page).toBeUndefined();
    await messages.stop();
  });

  it("counts page wait against the run deadline without starting a model call", async () => {
    let calls = 0;
    const model: ModelClient = {
      generateStructured: async options => { calls++; return { object: options.schema.parse({ status: "done", result: { answer: "Example result" } }), durationMs: 1 }; },
      generateText: async () => ({ text: "", durationMs: 0 }),
      listModels: async () => [],
    };
    const { repo, coordinator, messages, pageOwnership } = harness(model);
    const release = pageOwnership.tryAcquire({ pageId: "page", actor: "set_member", runId: "set-run" });
    const run = await coordinator.start({ goal: "Find the result", pageIds: ["page"], deadlineMs: 40 });
    await vi.waitFor(() => expect(repo.getRun(run.runId)?.status).toBe("failed"));
    expect(repo.getRun(run.runId)?.error).toMatch(/deadline exceeded/);
    expect(calls).toBe(0);
    release();
    expect(pageOwnership.snapshot().page).toBeUndefined();
    await messages.stop();
  });

  it("releases a page while awaiting input and reacquires it before continuing", async () => {
    let calls = 0;
    const model: ModelClient = {
      generateStructured: async options => ({ object: options.schema.parse(++calls === 1
        ? { status: "needs_input", message: "Need detail", question: "Which version?" }
        : { status: "done", message: "Done", result: { answer: "Example result" } }), durationMs: 1 }),
      generateText: async () => ({ text: "", durationMs: 0 }),
      listModels: async () => [],
    };
    const { repo, coordinator, messages, pageOwnership } = harness(model);
    const run = await coordinator.start({ goal: "Find the result", pageIds: ["page"] });
    await vi.waitFor(() => expect(repo.getRun(run.runId)?.status).toBe("needs_input"));
    expect(pageOwnership.snapshot().page).toBeUndefined();
    const releaseExternal = pageOwnership.tryAcquire({ pageId: "page", actor: "external" });
    coordinator.answer(run.runId, "Latest");
    await new Promise(resolve => setTimeout(resolve, 20));
    expect(calls).toBe(1);
    releaseExternal();
    await vi.waitFor(() => expect(repo.getRun(run.runId)?.status).toBe("completed"));
    expect(calls).toBe(2);
    expect(pageOwnership.snapshot().page).toBeUndefined();
    await messages.stop();
  });

  it("wakes needs-input without treating the correction as an answer", async () => {
    const prompts: string[] = [];
    const model: ModelClient = {
      generateStructured: async options => {
        prompts.push(options.prompt);
        const value = prompts.length === 1
          ? { status: "needs_input", message: "Need the version", question: "Which version?" }
          : { status: "done", message: "Done", result: { answer: "Example result" } };
        return { object: options.schema.parse(value), durationMs: 1 };
      },
      generateText: async () => ({ text: "", durationMs: 0 }),
      listModels: async () => [],
    };
    const { repo, coordinator, messages } = harness(model);
    const run = await coordinator.start({ goal: "Find the result", pageIds: ["page"], chatId: "chat", contextPageRefs: refs });
    await vi.waitFor(() => expect(repo.getRun(run.runId)?.status).toBe("needs_input"));
    messages.steer(steer(run.runId));
    await vi.waitFor(() => expect(repo.getRun(run.runId)?.status).toBe("completed"));
    expect(prompts[1]).toContain("User correction 1: Use the updated requirement");
    expect(prompts[1]).not.toContain("Answer to your question");
    await messages.stop();
  });

  it("stops after an uncertain in-flight write instead of replaying it", async () => {
    let releaseWrite!: () => void;
    const writeGate = new Promise<void>(resolve => { releaseWrite = resolve; });
    const execute = vi.fn(async (_program: { steps: PlanStep[] }) => { await writeGate; throw new Error("connection lost after dispatch"); });
    let calls = 0;
    const model: ModelClient = {
      generateStructured: async options => ({ object: options.schema.parse({ status: "done", result: { answer: "Example result" } }), durationMs: 1 }),
      streamStructured: async options => {
        calls++;
        options.onText('{"status":"continue","steps":[{"id":"s1","op":"click","target":"r1"}]}');
        if (!options.signal) throw new Error("planner signal missing");
        return await new Promise<never>((_resolve, reject) => options.signal!.addEventListener("abort", () => reject(new Error("steered")), { once: true }));
      },
      generateText: async () => ({ text: "", durationMs: 0 }),
      listModels: async () => [],
    };
    const { repo, coordinator, messages } = harness(model, execute as never);
    const run = await coordinator.start({ goal: "Apply the change", pageIds: ["page"], chatId: "chat", contextPageRefs: refs });
    await vi.waitFor(() => expect(execute).toHaveBeenCalledTimes(1));
    messages.steer(steer(run.runId));
    releaseWrite();
    await vi.waitFor(() => expect(repo.getRun(run.runId)?.status).toBe("interrupted"));
    expect(calls).toBe(1);
    expect(execute).toHaveBeenCalledTimes(1);
    expect(repo.getRun(run.runId)?.error).toMatch(/uncertain/i);
    await messages.stop();
  });

  it("stops on an uncertain write even when no correction arrives", async () => {
    const execute = vi.fn(async () => { throw new Error("connection lost after click"); });
    let plannerCalls = 0;
    const model: ModelClient = {
      generateStructured: async options => ({ object: options.schema.parse({ status: "done", message: "Done", result: { answer: "Example result" } }), durationMs: 1 }),
      streamStructured: async options => {
        plannerCalls++;
        const plan = { status: "continue", message: "Applying", steps: [{ id: "s1", op: "click", target: "r1" }] };
        options.onText(JSON.stringify(plan));
        return { object: options.schema.parse(plan), durationMs: 1 };
      },
      generateText: async () => ({ text: "", durationMs: 0 }),
      listModels: async () => [],
    };
    const { repo, coordinator, messages } = harness(model, execute as never);
    const run = await coordinator.start({ goal: "Apply the change", pageIds: ["page"], chatId: "chat", contextPageRefs: refs });
    await vi.waitFor(() => expect(repo.getRun(run.runId)?.status).toBe("interrupted"));
    expect(plannerCalls).toBe(1);
    expect(execute).toHaveBeenCalledTimes(1);
    expect(repo.getRun(run.runId)?.error).toMatch(/uncertain/i);
    await messages.stop();
  });
});
