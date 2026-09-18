import { describe, expect, it, vi } from "vitest";
import { EventBus, openDb, Repo, RunCoordinator, verifyDoneAgainstObservation } from "@vector/runtime";
import type { ModelClient } from "@vector/runtime";
import type { Observation, PlanStep } from "@vector/contracts";

const obs = (text = "visible page heading"): Observation =>
  ({
    pageId: "p1",
    documentEpoch: 1,
    revision: 1,
    observedAt: Date.now(),
    scope: "full",
    content: {
      url: "http://x.test/",
      title: "x",
      viewport: { width: 1, height: 1, scale: 1 },
      scroll: { y: 0, maxY: 0 },
      frames: [],
      text,
      headings: ["visible page heading"],
      elements: [{ ref: "r1", tag: "button", frame: "main" }],
      formFields: [],
      tables: [],
      links: [],
      dialogs: [],
      truncated: false,
      stats: { elementsTotal: 1, elementsShown: 1 },
    },
  }) as unknown as Observation;

describe("verifyDoneAgainstObservation", () => {
  it("rejects long claims that are not on the page", () => {
    const v = verifyDoneAgainstObservation(
      { answer: "totally-fabricated-secret-xyz" },
      obs(),
      [],
    );
    expect(v.ok).toBe(false);
  });

  it("accepts grounded claims", () => {
    const v = verifyDoneAgainstObservation({ answer: "visible page heading" }, obs(), []);
    expect(v.ok).toBe(true);
  });
});

describe("lying model cannot complete a run", () => {
  it("finishes failed when done claims are ungrounded", async () => {
    const repo = new Repo(openDb(":memory:"));
    const events = new EventBus(repo);
    const model: ModelClient = {
      generateStructured: async (o) => ({
        object: o.schema.parse({ status: "done", message: "Done", result: { answer: "totally-fabricated-secret-xyz" } }),
        durationMs: 1,
      }),
      streamStructured: async (o) => {
        const text = '{"status":"done","message":"Done","result":{"answer":"totally-fabricated-secret-xyz"}}';
        o.onText?.(text);
        return { object: o.schema.parse(JSON.parse(text)), durationMs: 1 };
      },
      generateText: async () => ({ text: "", durationMs: 0 }),
      listModels: async () => [],
    };
    const coordinator = new RunCoordinator({
      repo,
      events,
      pages: {
        observe: vi.fn(async () => obs()),
        execute: vi.fn(async (_program: { steps: PlanStep[] }) => ({ status: "completed", steps: [] })),
        capture: vi.fn(),
        livePageIds: () => ["p1"],
        get: () => ({ viewStatus: "visible" }),
      } as never,
      model: () => model,
      defaultModel: () => "m",
      recoveryModel: () => undefined,
      recordModelCall: () => {},
    });
    const run = await coordinator.start({ goal: "find the secret", pageIds: ["p1"] });
    for (let i = 0; i < 200 && !["completed", "failed"].includes(repo.getRun(run.runId)!.status); i++) {
      await new Promise((r) => setTimeout(r, 10));
    }
    expect(repo.getRun(run.runId)!.status).toBe("failed");
  });
});
