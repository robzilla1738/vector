import { fixturePage, fixtureTurnMentions } from "../fixtures/turn-mentions.js";
import { describe, it, expect, vi } from "vitest";
import { APICallError, JSONParseError, NoObjectGeneratedError, TypeValidationError } from "ai";
import { EventBus, openDb, Repo, RunCoordinator } from "@aux/runtime";
import type { ModelClient } from "@aux/runtime";
import type { Observation } from "@aux/contracts";
import {
  isStructuredOutputError,
} from "../../apps/runtime/src/agent/gateway-client.js";

const apiErr = (statusCode: number, message = "boom") =>
  new APICallError({ message, url: "https://gw.test", requestBodyValues: {}, statusCode });

describe("gateway fallback guard (P1-2 / retry amplification)", () => {
  it("falls back only on structured-output failures", async () => {
    expect(
      await isStructuredOutputError(
        new NoObjectGeneratedError({
          message: "no object",
          text: "x",
          response: { id: "r", timestamp: new Date(), modelId: "m" },
          usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
          finishReason: "stop",
        } as never),
      ),
    ).toBe(true);
    expect(
      await isStructuredOutputError(new TypeValidationError({ value: {}, cause: new Error("bad") })),
    ).toBe(true);
    expect(await isStructuredOutputError(new JSONParseError({ text: "{", cause: new Error("bad") }))).toBe(
      true,
    );
    expect(await isStructuredOutputError(apiErr(400, "response_format is not supported by this model"))).toBe(
      true,
    );
    expect(
      await isStructuredOutputError(
        new Error("Unsupported JSON schema fields in schema with keys: dict_keys(['oneOf'])."),
      ),
    ).toBe(true);
  });
  it("never retries auth, quota, server, network or abort errors", async () => {
    expect(await isStructuredOutputError(apiErr(401))).toBe(false);
    expect(await isStructuredOutputError(apiErr(403))).toBe(false);
    expect(await isStructuredOutputError(apiErr(429, "rate limit"))).toBe(false);
    expect(await isStructuredOutputError(apiErr(500))).toBe(false);
    expect(await isStructuredOutputError(apiErr(400, "invalid api key"))).toBe(false);
    expect(await isStructuredOutputError(new TypeError("fetch failed"))).toBe(false);
    expect(await isStructuredOutputError(new DOMException("aborted", "AbortError"))).toBe(false);
    expect(await isStructuredOutputError(new DOMException("timed out", "TimeoutError"))).toBe(false);
  });
});

const obs = (): Observation =>
  ({
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
      elements: Array.from({ length: 5 }, (_, i) => ({ ref: `r${i + 1}`, tag: "button", frame: "main" })),
      formFields: [],
      tables: [],
      links: [],
      dialogs: [],
      truncated: false,
      stats: { elementsTotal: 5, elementsShown: 5, textChars: 40, approxTokens: 10 },
    },
  }) as unknown as Observation;

function harness(model: ModelClient) {
  const repo = new Repo(openDb(":memory:"));
  const events = new EventBus(repo);
  const recorded: { role: string; error?: string }[] = [];
  const pages = {
    observe: vi.fn(async () => obs()),
    execute: vi.fn(async (program: { steps: { id: string; op: string }[] }) => ({
      status: "completed" as const,
      steps: program.steps.map((s) => ({
        stepId: s.id,
        op: s.op,
        status: "ok" as const,
        startedAt: Date.now(),
        durationMs: 1,
      })),
    })),
    capture: vi.fn(async () => ({ dataUrl: undefined, width: 0, height: 0, scale: 1 })),
    livePageIds: () => ["p1"],
    get: (fixturePageId: string): import("@aux/contracts").PageTarget => ({
      ...fixturePage(fixturePageId, "http://x.test/", 1),
      viewStatus: "visible",
    }),
  };
  const coordinator = new RunCoordinator({
    turnMentions: fixtureTurnMentions((pageId) => pages.get(pageId)),
    repo,
    events,
    pages: pages as never,
    model: () => model,
    defaultModel: () => "test/planner",
    recoveryModel: () => undefined,
    recordModelCall: (c) => {
      recorded.push({ role: c.role, error: c.error });
    },
    grants: ["effect:read", "effect:write", "effect:destructive", "effect:egress"],
  });
  return { repo, coordinator, recorded };
}

async function waitForRun(repo: Repo, runId: string, ms = 5000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const r = repo.getRun(runId);
    if (r && ["completed", "partially_completed", "failed", "cancelled", "interrupted"].includes(r.status))
      return r;
    await new Promise((r) => setTimeout(r, 15));
  }
  throw new Error(`run did not finish: ${repo.getRun(runId)?.status}`);
}

describe("run deadline as an abort signal", () => {
  it("interrupts a hung model call and settles the run as failed with a deadline error", async () => {
    let seen: AbortSignal | undefined;
    const model: ModelClient = {
      generateStructured: (o) =>
        new Promise((_res, rej) => {
          seen = o.signal;
          o.signal?.addEventListener("abort", () => rej(new DOMException("aborted", "AbortError")), {
            once: true,
          });
        }),
      generateText: async () => ({ text: "", durationMs: 0 }),
      listModels: async () => [],
    };
    const h = harness(model);
    const started = Date.now();
    const run = await h.coordinator.start({ goal: "g", pageIds: ["p1"], deadlineMs: 120 });
    const done = await waitForRun(h.repo, run.runId);
    expect(Date.now() - started).toBeLessThan(3000);
    expect(done.status).toBe("failed");
    expect(done.error).toMatch(/deadline exceeded/);
    expect(seen?.aborted).toBe(true);
    // the hung call was counted and recorded with its error
    expect(h.recorded.filter((c) => c.role === "planner" && c.error)).toHaveLength(1);
  });
});

describe("model call accounting", () => {
  it("retries a rate limit a bounded number of times, then stops and persists only safe recovery state", async () => {
    let attempts = 0;
    const model: ModelClient = {
      generateStructured: async () => {
        attempts++;
        throw apiErr(429, "rate limited: private provider response body");
      },
      generateText: async () => ({ text: "", durationMs: 0 }),
      listModels: async () => [],
    };
    const h = harness(model);
    const run = await h.coordinator.start({ goal: "g", pageIds: ["p1"], maxModelCalls: 10 });
    const done = await waitForRun(h.repo, run.runId);
    expect(done.status).toBe("failed");
    // one call plus two backed-off retries; never unbounded amplification
    expect(attempts).toBe(3);
    expect(h.recorded).toHaveLength(attempts);
    expect(h.recorded.every((c) => c.error)).toBe(true);
    expect(h.recorded.map((c) => c.role)).toEqual(["planner", "planner", "planner"]);
    expect(h.recorded[0]?.error).not.toContain("private provider response body");
    expect(done.error).not.toContain("private provider response body");
    expect(done.failure).toMatchObject({ category: "rate_limit", retryable: true, action: "retry" });
  });
});
