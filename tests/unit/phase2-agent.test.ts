import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { EventTypes, type Observation } from "@aux/contracts";
import {
  clampOutputTokens,
  modelAcceptsImages,
  modelCapabilities,
  registryCostUsd,
} from "@aux/contracts/model-registry";
import {
  classifyStep,
  isConsequential,
  looksLikeSecret,
  modelCallCost,
  portableSkillSteps,
  rebindSteps,
  redactForModel,
} from "@aux/runtime";
import { AnswerDeltaEmitter, ANSWER_DELTA_PREVIEW_CHARS } from "../../apps/runtime/src/agent/answer-delta.js";
import { attemptsOf, usageFields, withAttempts } from "../../apps/runtime/src/agent/model-client.js";
import { downloadExtract } from "../../apps/runtime/src/execution/executor.js";
import { budgetSections } from "../../apps/runtime/src/services/runs.js";

const obs = (text = "Order page", extra: Partial<Observation["content"]> = {}): Observation =>
  ({
    pageId: "p1",
    documentEpoch: 1,
    revision: 1,
    observedAt: Date.now(),
    scope: "full",
    content: {
      url: "http://x.test/order",
      title: "Order",
      viewport: { width: 1, height: 1, scale: 1 },
      scroll: { y: 0, maxY: 0 },
      frames: [],
      text,
      headings: [],
      elements: [{ ref: "r1", tag: "button", role: "button", name: "Save", frame: "main" }],
      formFields: [],
      tables: [],
      links: [],
      dialogs: [],
      truncated: false,
      stats: { elementsTotal: 1, elementsShown: 1 },
      ...extra,
    },
  }) as unknown as Observation;

describe("redaction by value shape", () => {
  it("keeps prose that mentions credentials and redacts credential-shaped values", () => {
    expect(redactForModel("Forgot password?")).toBe("Forgot password?");
    expect(redactForModel({ link: "Reset your password or secret question" })).toEqual({
      link: "Reset your password or secret question",
    });
    for (const secret of [
      "sk-proj-abcdefghijklmnopqrstuvwxyz012345",
      "ghp_abcdefghijklmnopqrstuvwxyz0123456789",
      "xoxb-1234567890-abcdefghij",
      "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U",
      "Bearer abcdefghijklmnop",
      "Q2hhbmdlTWVQbGVhc2UxMjM0NTY3ODkwQWJjRGVmR2hp",
    ])
      expect({ secret, redacted: looksLikeSecret(secret) }).toEqual({ secret, redacted: true });
    expect(looksLikeSecret("3f786850e387550fdab836ed7e6dc881de23001b")).toBe(false);
    expect(looksLikeSecret("123e4567-e89b-12d3-a456-426614174000")).toBe(false);
  });

  it("redacts exact sensitive key names only", () => {
    const out = redactForModel({
      password: "hunter2",
      api_key: "k",
      forgotPasswordLink: "/reset",
      tokens: 12,
    }) as Record<string, unknown>;
    expect(out.password).toMatch(/^\{handle:/);
    expect(out.api_key).toMatch(/^\{handle:/);
    expect(out.forgotPasswordLink).toBe("/reset");
    expect(out.tokens).toBe(12);
  });
});

describe("single step classification", () => {
  it("executor, durable writes and verification agree", () => {
    expect(
      ["click", "dblclick", "clickPoint", "dragTo", "upload", "dialog", "navigate", "reload", "fill"].filter(
        (op) => !isConsequential(op),
      ),
    ).toEqual([]);
    expect(
      ["hover", "scroll", "stop", "extract", "waitFor", "screenshot", "collectScroll"].filter(
        isConsequential,
      ),
    ).toEqual([]);
    expect(classifyStep("hover")).toBe("write");
  });
});

describe("session context budgets", () => {
  it("truncates lowest-priority sections first and keeps display order", () => {
    const out = budgetSections(
      [
        { text: "B".repeat(50), priority: 5 },
        { text: "T".repeat(50), priority: 2 },
        { text: "C".repeat(50), priority: 0 },
      ],
      120,
    )!;
    expect(out.indexOf("T")).toBeLessThan(out.indexOf("C"));
    expect(out).toContain("C".repeat(50));
    expect(out).toContain("T".repeat(50));
    expect(out).not.toContain("B".repeat(20));
  });
});

describe("model registry capabilities", () => {
  it("drives vision gating, output clamps and pricing", () => {
    expect(
      modelAcceptsImages("fixture/text-only", [
        { id: "fixture/text-only", modalities: ["text"], source: "configured" },
      ]),
    ).toBe(false);
    expect(modelAcceptsImages("openai/gpt-6-luna-fast")).toBe(true);
    expect(modelAcceptsImages("vendor/unknown")).toBe(true);
    expect(modelCapabilities("openai/gpt-6-luna-fast")?.reasoning).toBe("supported");
    const custom = [
      {
        id: "m",
        maxOutputTokens: 1000,
        inputUsdPerMTok: 1,
        outputUsdPerMTok: 2,
        source: "configured" as const,
      },
    ];
    expect(clampOutputTokens("m", 8192, custom)).toBe(1000);
    expect(clampOutputTokens("other", 8192, custom)).toBe(8192);
    expect(registryCostUsd("m", { inputTokens: 1_000_000, outputTokens: 500_000 }, custom)).toBe(2);
  });

  it("prefers the gateway-reported cost", () => {
    expect(
      modelCallCost("alibaba/qwen3.8-27b", {
        inputTokens: 10,
        providerMetadata: { gateway: { cost: "0.0012" } },
      }),
    ).toEqual({ costUsd: 0.0012, costEstimated: false });
    expect(modelCallCost("fixture/unknown", { inputTokens: 10 })).toEqual({});
  });

  it("normalizes cached-token usage and carries attempts on errors", () => {
    expect(
      usageFields({ inputTokens: 100, outputTokens: 5, inputTokenDetails: { cacheReadTokens: 80 } }),
    ).toEqual({ inputTokens: 100, outputTokens: 5, cachedInputTokens: 80 });
    const e = withAttempts(new Error("x"), [{ durationMs: 1, inputTokens: 3 }]);
    expect(attemptsOf(e)).toEqual([{ durationMs: 1, inputTokens: 3 }]);
  });
});

describe("streamed answer deltas", () => {
  it("reads the partial message and throttles events", async () => {
    const emitted: Record<string, unknown>[] = [];
    const d = new AnswerDeltaEmitter(
      {
        emit: (type: string, payload: Record<string, unknown>) => {
          expect(type).toBe(EventTypes.RunAnswerDelta);
          emitted.push(payload);
        },
      } as never,
      "run1",
      50,
    );
    d.push("A");
    d.push("AB");
    d.push("ABC");
    expect(emitted).toHaveLength(1);
    await new Promise((r) => setTimeout(r, 80));
    expect(emitted).toHaveLength(2);
    d.push("ABCD");
    d.flush();
    expect(emitted.at(-1)).toMatchObject({ runId: "run1", text: "ABCD", delta: "D", seq: 3 });
    d.push("x".repeat(ANSWER_DELTA_PREVIEW_CHARS + 100));
    d.flush();
    expect(String(emitted.at(-1)?.text)).toContain("Live preview limited to 32,000 characters");
    expect(String(emitted.at(-1)?.text).length).toBeLessThan(ANSWER_DELTA_PREVIEW_CHARS + 100);
  });
});

describe("skill replay binds by role/name", () => {
  it("compiles refs to role locators and refuses refs without role+name", () => {
    const content = obs().content;
    expect(portableSkillSteps([{ id: "c", op: "click", target: "r1" }], content)).toEqual([
      { id: "c", op: "click", target: "role=button[name=Save]" },
    ]);
    const bare = {
      ...content,
      elements: [{ ref: "r1", tag: "div", frame: "main" }],
    } as unknown as Observation["content"];
    expect(portableSkillSteps([{ id: "c", op: "click", target: "r1" }], bare)).toBeUndefined();
  });

  it("does not retarget a missing ref to the first element via an origin-only guard", () => {
    const content = obs().content;
    const steps = rebindSteps([{ id: "c", op: "click", target: "r7" }], content, [
      { exactOrigin: "http://x.test" },
    ]);
    expect(steps[0]).toMatchObject({ target: "r7" });
  });
});

describe("download preview", () => {
  it("inlines small text downloads only", async () => {
    const dir = mkdtempSync(join(tmpdir(), "aux-dl-"));
    try {
      writeFileSync(join(dir, "a.csv"), "a,b\n1,2\n");
      writeFileSync(join(dir, "b.bin"), "zz");
      writeFileSync(join(dir, "big.txt"), "x".repeat(70 * 1024));
      expect(await downloadExtract("a.csv", join(dir, "a.csv"))).toEqual({
        downloaded: "a.csv",
        path: join(dir, "a.csv"),
        text: "a,b\n1,2\n",
      });
      expect(await downloadExtract("b.bin", join(dir, "b.bin"))).not.toHaveProperty("text");
      expect(await downloadExtract("big.txt", join(dir, "big.txt"))).not.toHaveProperty("text");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
