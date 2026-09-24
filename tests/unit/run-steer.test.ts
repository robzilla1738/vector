import { afterEach, describe, expect, it, vi } from "vitest";
import type { ModelClient } from "@aux/runtime";
import { EventBus, openDb, Repo, RunCoordinator } from "@aux/runtime";
import type { Observation, PlanStep } from "@aux/contracts";
import { RunMessageQueue } from "../../apps/runtime/src/services/run-messages.js";

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
  const coordinator = new RunCoordinator({ repo, events,
    pages: { observe: vi.fn(async () => observation()), execute, livePageIds: () => ["page"], get: () => ({ viewStatus: "visible" }) } as never,
    model: () => model, defaultModel: () => "fixture", recoveryModel: () => undefined, recordModelCall: () => {},
    grants: ["effect:read", "effect:write", "effect:destructive", "effect:egress"],
  });
  const messages = new RunMessageQueue(repo, events, async () => { throw new Error("unexpected queue delivery"); },
    runId => coordinator.controls.has(runId), runId => coordinator.steer(runId));
  return { repo, coordinator, messages };
}

const refs = [{ pageId: "page", url: "https://example.test/", documentEpoch: 1 }];
const steer = (runId: string) => ({ messageId: "11111111-1111-4111-8111-111111111111", runId, chatId: "chat",
  text: "Use the updated requirement", pageIds: ["page"], contextPageRefs: refs, expectedRevision: 0 });

describe("run steering", () => {
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
});
