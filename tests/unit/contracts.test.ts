import { describe, it, expect } from "vitest";
import { ProgramSchema, StepSchema, MethodSchemas, EventSchema } from "@vector/contracts";

describe("StepSchema", () => {
  it("accepts every core op", () => {
    const steps = [
      { id: "s1", op: "navigate", url: "https://x.test" },
      { id: "s2", op: "click", target: "r1" },
      { id: "s3", op: "fill", target: "css:#q", value: "hello" },
      { id: "s4", op: "select", target: "r2", value: "approved" },
      { id: "s5", op: "waitFor", condition: { kind: "selector", selector: "#ok", state: "visible" } },
      { id: "s6", op: "extract", fields: [{ name: "title", selector: "h1" }] },
      { id: "s7", op: "press", key: "Enter" },
      { id: "s8", op: "scroll", direction: "down" },
      { id: "s9", op: "screenshot", fullPage: true },
      { id: "s10", op: "dialog", action: "accept" },
      { id: "s11", op: "back" },
      { id: "s12", op: "type", target: "r5", value: "abc", delayMs: 10 },
    ];
    for (const s of steps) {
      const r = StepSchema.safeParse(s);
      expect(r.success, `${s.op}: ${r.success ? "" : JSON.stringify(r.error.issues)}`).toBe(true);
    }
  });

  it("rejects unknown ops and missing required fields", () => {
    expect(StepSchema.safeParse({ id: "x", op: "teleport" }).success).toBe(false);
    expect(StepSchema.safeParse({ id: "x", op: "click" }).success).toBe(false); // no target
    expect(StepSchema.safeParse({ id: "x", op: "navigate", url: "not a url" }).success).toBe(false);
    expect(StepSchema.safeParse({ op: "click", target: "r1" }).success).toBe(false); // no id
  });

  it("press/scroll make target optional", () => {
    expect(StepSchema.safeParse({ id: "s", op: "press", key: "Tab" }).success).toBe(true);
    expect(StepSchema.safeParse({ id: "s", op: "scroll", direction: "top" }).success).toBe(true);
  });
});

describe("ProgramSchema", () => {
  it("requires pageId and bounded steps", () => {
    expect(
      ProgramSchema.safeParse({ pageId: "p1", steps: [{ id: "s1", op: "click", target: "r1" }] }).success,
    ).toBe(true);
    expect(ProgramSchema.safeParse({ steps: [] }).success).toBe(false);
    expect(ProgramSchema.safeParse({ pageId: "p1", steps: [] }).success).toBe(false);
    const huge = { pageId: "p1", steps: Array.from({ length: 201 }, (_, i) => ({ id: `s${i}`, op: "reload" })) };
    expect(ProgramSchema.safeParse(huge).success).toBe(false);
  });
});

describe("API schemas", () => {
  it("has all versioned methods from the roadmap", () => {
    for (const m of [
      "pages.list", "pages.open", "pages.observe", "pages.execute", "pages.capture",
      "sets.create", "sets.map", "sets.results",
      "runs.start", "runs.pause", "runs.resume", "runs.cancel", "runs.events",
      "artifacts.list", "artifacts.read",
    ]) {
      expect(MethodSchemas, m).toHaveProperty(m);
    }
  });

  it("validates events", () => {
    const e = EventSchema.safeParse({ seq: 3, type: "page.updated", payload: { a: 1 }, ts: Date.now() });
    expect(e.success).toBe(true);
    expect(EventSchema.safeParse({ seq: -1, type: "x", payload: {}, ts: 0 }).success).toBe(false);
  });
});
