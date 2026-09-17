import { describe, it, expect, vi } from "vitest";
import { openDb, Repo, RunCoordinator } from "@vector/runtime";
import { EventBus } from "@vector/runtime";
import type { ModelClient } from "@vector/runtime";
import type { Observation, StepOutcome } from "@vector/contracts";

const obs = (): Observation => ({
  observationId: "o1",
  pageId: "p1",
  documentEpoch: 1,
  revision: 1,
  observedAt: Date.now(),
  scope: "full",
  content: {
    url: "http://x.test/",
    title: "x",
    viewport: { width: 1000, height: 800, scale: 1 },
    scroll: { x: 0, y: 0, maxY: 0 },
    frames: [],
    text: "a normal page with plenty of readable text content",
    headings: [],
    elements: [
      { ref: "r1", tag: "button", frame: "main", role: "button", name: "Go" },
    ] as Observation["content"]["elements"],
    formFields: [],
    tables: [],
    links: [],
    dialogs: [],
    truncated: false,
    stats: { elementsTotal: 1, elementsShown: 1, textChars: 40, approxTokens: 10 },
  },
});

function harness() {
  const repo = new Repo(openDb(":memory:"));
  const events = new EventBus(repo);
  const roles: string[] = [];
  const generateStructured = vi.fn(async (args: { modelId: string }) => {
    roles.push(args.modelId);
    return {
      object: {
        status: "continue",
        message: "retry",
        steps: [{ id: `s-${roles.length}`, op: "click", target: "r1" }],
      },
      durationMs: 5,
    };
  });
  const model = {
    generateStructured,
    generateText: vi.fn(async () => ({ text: "", durationMs: 1 })),
    listModels: vi.fn(async () => []),
  } as unknown as ModelClient;

  let executeCalls = 0;
  const pages = {
    observe: vi.fn(async () => obs()),
    execute: vi.fn(async () => {
      executeCalls += 1;
      return {
        status: "failed" as const,
        steps: [] as StepOutcome[],
        error: "locator not found",
      };
    }),
    capture: vi.fn(async () => ({ dataUrl: "data:image/png;base64,AAAA", width: 100, height: 100, scale: 1 })),
  };

  const coordinator = new RunCoordinator({
    repo,
    events,
    pages: pages as never,
    model: () => model,
    defaultModel: () => "test/planner",
    recoveryModel: () => "test/recovery",
    recordModelCall: () => {},
  });
  return { repo, coordinator, generateStructured, roles, get executeCalls() { return executeCalls; } };
}

async function waitForRun(repo: Repo, runId: string, ms = 5000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const r = repo.getRun(runId);
    if (r && ["completed", "partially_completed", "failed", "cancelled", "interrupted"].includes(r.status)) {
      return r;
    }
    await new Promise((r) => setTimeout(r, 25));
  }
  throw new Error("run did not finish");
}

describe("repair escalation", () => {
  it("invokes the recovery model exactly once after three consecutive failed chunks", async () => {
    const h = harness();
    const run = await h.coordinator.start({ goal: "click go", pageIds: ["p1"], maxModelCalls: 20, maxSteps: 40 });
    const final = await waitForRun(h.repo, run.runId);
    expect(final.status).toBe("failed");
    expect(h.roles.filter((id) => id === "test/recovery")).toHaveLength(1);
  });
});
