import { fixturePage, fixtureTurnMentions } from "../fixtures/turn-mentions.js";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ModelClient, Services } from "@aux/runtime";
import { EventBus, makeInvoker, openDb, Repo, RunCoordinator, steerMessage } from "@aux/runtime";
import type { Observation, PlanStep, Run } from "@aux/contracts";
import { RunMessageQueue } from "../../apps/runtime/src/services/run-messages.js";
import { PageOwnership } from "../../apps/runtime/src/scheduler/page-ownership.js";
import { userInstructions, type TurnState } from "../../apps/runtime/src/agent/coordinator-turn.js";

const databases: ReturnType<typeof openDb>[] = [];
afterEach(() => {
  for (const db of databases.splice(0)) db.close();
});

const observation = (): Observation =>
  ({
    observationId: "obs",
    pageId: "page",
    documentEpoch: 1,
    revision: 1,
    observedAt: Date.now(),
    scope: "full",
    content: {
      url: "https://example.test/",
      title: "Example",
      viewport: { width: 100, height: 100, scale: 1 },
      scroll: { x: 0, y: 0, maxY: 0 },
      frames: [],
      text: "Example result",
      headings: [],
      elements: [
        {
          ref: "r1",
          tag: "button",
          role: "button",
          name: "Apply",
          frame: "main",
          selector: { role: { role: "button", name: "Apply" } },
        },
      ],
      formFields: [],
      tables: [],
      links: [],
      dialogs: [],
      truncated: false,
      stats: { elementsTotal: 1, elementsShown: 1, textChars: 14, approxTokens: 4 },
    },
  }) as Observation;

function harness(
  model: ModelClient,
  execute = vi.fn(async () => ({ status: "completed" as const, steps: [] })),
) {
  const db = openDb(":memory:");
  databases.push(db);
  const repo = new Repo(db);
  const events = new EventBus(repo);
  const pageOwnership = new PageOwnership();
  const coordinatorFixturePages1 = {
    observe: vi.fn(async () => observation()),
    execute,
    livePageIds: () => ["page"],
    get: (fixturePageId: string): import("@aux/contracts").PageTarget => ({
      ...fixturePage(fixturePageId, "https://example.test/", 1),
      viewStatus: "visible",
    }),
  };
  const coordinator = new RunCoordinator({
    turnMentions: fixtureTurnMentions((pageId) => coordinatorFixturePages1.get(pageId)),
    repo,
    events,
    pages: coordinatorFixturePages1 as never,
    model: () => model,
    defaultModel: () => "fixture",
    recoveryModel: () => undefined,
    recordModelCall: () => {},
    grants: ["effect:read", "effect:write", "effect:destructive", "effect:egress"],
    pageOwnership,
  });
  const messages = new RunMessageQueue(
    repo,
    events,
    async () => {
      throw new Error("unexpected queue delivery");
    },
    (runId) => coordinator.controls.has(runId),
    (runId) => coordinator.steer(runId),
  );
  return { repo, coordinator, messages, pageOwnership };
}

const refs = [{ pageId: "page", url: "https://example.test/", documentEpoch: 1 }];
const steer = (runId: string) => ({
  messageId: "11111111-1111-4111-8111-111111111111",
  runId,
  chatId: "chat",
  text: "Use the updated requirement",
  pageIds: ["page"],
  contextPageRefs: refs,
  expectedRevision: 0,
});

describe("run steering", () => {
  it("releases a paused coordinator page after its active plan settles", async () => {
    let releasePlan!: () => void;
    const planGate = new Promise<void>((resolve) => {
      releasePlan = resolve;
    });
    let calls = 0;
    const model: ModelClient = {
      generateStructured: async (options) => {
        calls++;
        if (calls === 1) await planGate;
        return {
          object: options.schema.parse(
            calls === 1
              ? { status: "continue", message: "Looking again", observationRequest: { scope: "full" } }
              : { status: "done", message: "Done", result: { answer: "Example result" } },
          ),
          durationMs: 1,
        };
      },
      generateText: async () => ({ text: "", durationMs: 0 }),
      listModels: async () => [],
    };
    const { repo, coordinator, messages, pageOwnership } = harness(model);
    const run = await coordinator.start({ goal: "Find the result", pageIds: ["page"] });
    await vi.waitFor(() => expect(calls).toBe(1));
    expect(pageOwnership.snapshot().page).toMatchObject({ runId: run.runId });
    await coordinator.pause(run.runId);
    releasePlan();
    await vi.waitFor(() => expect(pageOwnership.snapshot().page).toBeUndefined());
    const releaseExternal = pageOwnership.tryAcquire({ pageId: "page", actor: "external" });
    await coordinator.resume(run.runId);
    await new Promise((resolve) => setTimeout(resolve, 140));
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
      generateStructured: async (options) => {
        calls++;
        return {
          object: options.schema.parse({ status: "done", result: { answer: "Example result" } }),
          durationMs: 1,
        };
      },
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
      generateStructured: async (options) => ({
        object: options.schema.parse(
          ++calls === 1
            ? { status: "needs_input", message: "Need detail", question: "Which version?" }
            : { status: "done", message: "Done", result: { answer: "Example result" } },
        ),
        durationMs: 1,
      }),
      generateText: async () => ({ text: "", durationMs: 0 }),
      listModels: async () => [],
    };
    const { repo, coordinator, messages, pageOwnership } = harness(model);
    const run = await coordinator.start({ goal: "Find the result", pageIds: ["page"] });
    await vi.waitFor(() => expect(repo.getRun(run.runId)?.status).toBe("needs_input"));
    expect(pageOwnership.snapshot().page).toBeUndefined();
    const releaseExternal = pageOwnership.tryAcquire({ pageId: "page", actor: "external" });
    await coordinator.answer(run.runId, "Latest");
    await new Promise((resolve) => setTimeout(resolve, 20));
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
      generateStructured: async (options) => {
        prompts.push(options.prompt);
        const value =
          prompts.length === 1
            ? { status: "needs_input", message: "Need the version", question: "Which version?" }
            : { status: "done", message: "Done", result: { answer: "Example result" } };
        return { object: options.schema.parse(value), durationMs: 1 };
      },
      generateText: async () => ({ text: "", durationMs: 0 }),
      listModels: async () => [],
    };
    const { repo, coordinator, messages } = harness(model);
    const run = await coordinator.start({
      goal: "Find the result",
      pageIds: ["page"],
      chatId: "chat",
      contextPageRefs: refs,
    });
    await vi.waitFor(() => expect(repo.getRun(run.runId)?.status).toBe("needs_input"));
    await messages.steer(steer(run.runId));
    await vi.waitFor(() => expect(repo.getRun(run.runId)?.status).toBe("completed"));
    expect(prompts[1]).toContain(
      "<interrupted_request>\nUser correction: Use the updated requirement\n</interrupted_request>",
    );
    expect(prompts[1]).not.toContain("Answer to your question");
    await messages.stop();
  });

  it("stops after an uncertain in-flight write instead of replaying it", async () => {
    let releaseWrite!: () => void;
    const writeGate = new Promise<void>((resolve) => {
      releaseWrite = resolve;
    });
    const execute = vi.fn(async (_program: { steps: PlanStep[] }) => {
      await writeGate;
      throw new Error("connection lost after dispatch");
    });
    let calls = 0;
    const model: ModelClient = {
      generateStructured: async (options) => ({
        object: options.schema.parse({ status: "done", result: { answer: "Example result" } }),
        durationMs: 1,
      }),
      streamStructured: async (options) => {
        calls++;
        options.onText('{"status":"continue","steps":[{"id":"s1","op":"click","target":"r1"}]}');
        if (!options.signal) throw new Error("planner signal missing");
        return await new Promise<never>((_resolve, reject) =>
          options.signal!.addEventListener("abort", () => reject(new Error("steered")), { once: true }),
        );
      },
      generateText: async () => ({ text: "", durationMs: 0 }),
      listModels: async () => [],
    };
    const { repo, coordinator, messages } = harness(model, execute as never);
    const run = await coordinator.start({
      goal: "Apply the change",
      pageIds: ["page"],
      chatId: "chat",
      contextPageRefs: refs,
    });
    await vi.waitFor(() => expect(execute).toHaveBeenCalledTimes(1));
    await messages.steer(steer(run.runId));
    releaseWrite();
    await vi.waitFor(() => expect(repo.getRun(run.runId)?.status).toBe("interrupted"));
    expect(calls).toBe(1);
    expect(execute).toHaveBeenCalledTimes(1);
    expect(repo.getRun(run.runId)?.error).toMatch(/uncertain/i);
    await messages.stop();
  });

  it("stops on an uncertain write even when no correction arrives", async () => {
    const execute = vi.fn(async () => {
      throw new Error("connection lost after click");
    });
    let plannerCalls = 0;
    const model: ModelClient = {
      generateStructured: async (options) => ({
        object: options.schema.parse({
          status: "done",
          message: "Done",
          result: { answer: "Example result" },
        }),
        durationMs: 1,
      }),
      streamStructured: async (options) => {
        plannerCalls++;
        const plan = {
          status: "continue",
          message: "Applying",
          steps: [{ id: "s1", op: "click", target: "r1" }],
        };
        options.onText(JSON.stringify(plan));
        return { object: options.schema.parse(plan), durationMs: 1 };
      },
      generateText: async () => ({ text: "", durationMs: 0 }),
      listModels: async () => [],
    };
    const { repo, coordinator, messages } = harness(model, execute as never);
    const run = await coordinator.start({
      goal: "Apply the change",
      pageIds: ["page"],
      chatId: "chat",
      contextPageRefs: refs,
    });
    await vi.waitFor(() => expect(repo.getRun(run.runId)?.status).toBe("interrupted"));
    expect(plannerCalls).toBe(1);
    expect(execute).toHaveBeenCalledTimes(1);
    expect(repo.getRun(run.runId)?.error).toMatch(/uncertain/i);
    await messages.stop();
  });
});

describe("steering v2", () => {
  it("rewrites the interrupting user turn as <interrupted_request> for both engines", () => {
    const loopMessage = steerMessage(["Focus the pricing page"]);
    expect(loopMessage.role).toBe("user");
    expect(loopMessage.content).toContain(
      "<interrupted_request>\nFocus the pricing page\n</interrupted_request>",
    );
    const s = {
      run: { config: {} },
      steers: ["Use the new requirement"],
      answers: [],
    } as unknown as TurnState;
    expect(userInstructions(s)).toContain(
      "<interrupted_request>\nUser correction: Use the new requirement\n</interrupted_request>",
    );
  });

  it("rejects mismatched clientUserMessageId and non-steerable subagent turns at the API boundary", async () => {
    const db = openDb(":memory:");
    databases.push(db);
    const repo = new Repo(db);
    const events = new EventBus(repo);
    const child: Run = {
      runId: "child-run",
      goal: "cell",
      status: "running",
      pageIds: ["page"],
      createdAt: 1,
      config: { chatId: "agent-1", subagentProfile: "default", messageRevision: 0 },
    };
    const parent: Run = {
      runId: "parent-run",
      goal: "task",
      status: "running",
      pageIds: ["page"],
      createdAt: 1,
      config: { chatId: "chat", messageRevision: 0 },
    };
    repo.saveRun(child);
    repo.saveRun(parent);
    const steer = vi.fn();
    const invoke = makeInvoker({ repo, events, runs: { messages: { steer } } } as unknown as Services);
    const params = (runId: string, extra: Record<string, unknown> = {}) => ({
      messageId: "11111111-1111-4111-8111-111111111111",
      runId,
      chatId: runId === "child-run" ? "agent-1" : "chat",
      text: "Adjust",
      pageIds: ["page"],
      contextPageRefs: refs,
      expectedRevision: 0,
      expectedTurnId: runId,
      ...extra,
    });
    const internal = { external: false };
    await expect(invoke("runs.steer", params("child-run"), internal)).rejects.toThrow(
      /subagents\.sendMessage/,
    );
    expect(steer).not.toHaveBeenCalled();
    await expect(
      invoke(
        "runs.steer",
        params("parent-run", { clientUserMessageId: "99999999-9999-4999-8999-999999999999" }),
        internal,
      ),
    ).rejects.toThrow(/clientUserMessageId/);
    expect(steer).not.toHaveBeenCalled();
    await invoke(
      "runs.steer",
      params("parent-run", { clientUserMessageId: "11111111-1111-4111-8111-111111111111" }),
      internal,
    );
    expect(steer).toHaveBeenCalledTimes(1);
    await invoke(
      "runs.steer",
      params("parent-run", { messageId: "22222222-2222-4222-8222-222222222222" }),
      internal,
    );
    expect(steer).toHaveBeenCalledTimes(2);
  });
});
