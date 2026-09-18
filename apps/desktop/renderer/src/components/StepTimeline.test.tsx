// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { StepRecord } from "@vector/contracts";
import { StepTimeline, fmtMs, opLabel, receiptKind, receiptLabel, stepSummary } from "./StepTimeline";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let host: HTMLDivElement | null = null;

function render(ui: React.ReactElement) {
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
  act(() => root!.render(ui));
  return host;
}

afterEach(() => {
  if (root) act(() => root!.unmount());
  host?.remove();
  root = null;
  host = null;
});

const step = (id: string, op: string, outcome?: Partial<NonNullable<StepRecord["outcome"]>>, inputs?: Record<string, unknown>): StepRecord => ({
  stepId: id,
  runId: "run-1",
  op,
  inputs,
  startedAt: 1000,
  outcome: outcome ? { stepId: id, op, status: "ok", startedAt: 1000, durationMs: 100, ...outcome } : undefined,
});

describe("StepTimeline", () => {
  it("renders one row per step with outcome, human op label, and tabular duration", () => {
    const el = render(
      <StepTimeline
        live={false}
        steps={[
          step("s1", "navigate", { durationMs: 812, detail: "github.com/pull/3" }),
          step("s2", "click", { durationMs: 128, detail: "tab “Conversation”" }),
          step("s3", "click", { status: "failed", durationMs: 2004, error: { code: "not_visible", message: "r41 is off-screen" } }),
          step("s4", "screenshot", { status: "skipped", durationMs: 0, detail: "not needed" }),
        ]}
      />,
    );
    const rows = el.querySelectorAll("[data-testid=tl-step]");
    expect(rows).toHaveLength(4);
    expect(rows[0]!.className).toContain("ok");
    expect(rows[0]!.textContent).toContain("Open");
    expect(rows[0]!.textContent).toContain("812 ms");
    expect(rows[2]!.className).toContain("failed");
    expect(rows[2]!.textContent).toContain("r41 is off-screen");
    expect(rows[2]!.textContent).toContain("not_visible");
    expect(rows[2]!.textContent).toContain("2.0 s");
    expect(rows[3]!.className).toContain("skipped");
    // no "thinking" row when the run is finished
    expect(el.querySelectorAll("li[aria-current=step]")).toHaveLength(0);
  });

  it("marks the in-progress step while live and shows a thinking row after a finished step", () => {
    const el = render(<StepTimeline live steps={[step("s1", "navigate", { durationMs: 300 })]} />);
    const current = el.querySelectorAll("li[aria-current=step]");
    expect(current).toHaveLength(1);
    expect(current[0]!.textContent).toContain("Thinking");
    expect(current[0]!.querySelector(".live-dot")).not.toBeNull();
  });

  it("shows an observing placeholder when a live run has no steps yet, and nothing when idle", () => {
    const live = render(<StepTimeline live steps={[]} />);
    expect(live.textContent).toContain("Observing");
    act(() => root!.unmount());
    host?.remove();
    const idle = render(<StepTimeline live={false} steps={[]} />);
    expect(idle.querySelectorAll("li")).toHaveLength(0);
  });

  it("surfaces outcome receipts so effect state is inspectable", () => {
    const el = render(
      <StepTimeline
        live={false}
        steps={[
          step("s1", "click", { durationMs: 10, receipt: { observed: "tab", remoteConfirmed: false, uncertain: true, dispatchedBeforeTakeover: false } }),
          step("s2", "fill", { durationMs: 10, receipt: { observed: "saved", remoteConfirmed: true, uncertain: false, dispatchedBeforeTakeover: false } }),
          step("s3", "click", { durationMs: 10, receipt: { observed: "clicked", remoteConfirmed: false, uncertain: true, dispatchedBeforeTakeover: true } }),
          step("s4", "extract", { durationMs: 10 }),
        ]}
      />,
    );
    const receipts = el.querySelectorAll("[data-testid=tl-receipt]");
    expect(receipts).toHaveLength(3);
    expect(receipts[0]!.getAttribute("data-receipt")).toBe("uncertain");
    expect(receipts[0]!.textContent).toBe("Uncertain");
    expect(receipts[1]!.getAttribute("data-receipt")).toBe("confirmed");
    expect(receipts[1]!.textContent).toBe("Confirmed");
    expect(receipts[2]!.getAttribute("data-receipt")).toBe("takeover");
    expect(receipts[2]!.textContent).toBe("Takeover-interrupted");
    expect(el.querySelectorAll("[data-testid=tl-step]")[3]!.querySelector("[data-testid=tl-receipt]")).toBeNull();
  });

  it("offers an inspect button only for steps that carry an observation artifact", () => {
    const seen: string[] = [];
    const el = render(
      <StepTimeline
        live={false}
        onInspect={(id) => seen.push(id)}
        steps={[step("s1", "click", { durationMs: 10 }, { target: "r1", obsArtifactId: "art-1" }), step("s2", "scroll", { durationMs: 10 })]}
      />,
    );
    const buttons = el.querySelectorAll("button[aria-label='Inspect observation']");
    expect(buttons).toHaveLength(1);
    act(() => (buttons[0] as HTMLButtonElement).click());
    expect(seen).toEqual(["art-1"]);
  });
});

describe("timeline helpers", () => {
  it("formats durations with no more than three significant digits", () => {
    expect(fmtMs(0)).toBe("0 ms");
    expect(fmtMs(812)).toBe("812 ms");
    expect(fmtMs(2004)).toBe("2.0 s");
    expect(fmtMs(12_400)).toBe("12 s");
    expect(fmtMs(undefined)).toBe("");
  });

  it("labels ops as verbs and falls back to the raw op", () => {
    expect(opLabel("navigate")).toBe("Open");
    expect(opLabel("waitFor")).toBe("Wait");
    expect(opLabel("frobnicate")).toBe("frobnicate");
  });

  it("labels receipts with takeover taking priority over confirmed", () => {
    expect(receiptKind(undefined)).toBe("");
    expect(receiptLabel(receiptKind({ remoteConfirmed: false, uncertain: true, dispatchedBeforeTakeover: false }))).toBe("Uncertain");
    expect(receiptLabel(receiptKind({ remoteConfirmed: true, uncertain: false, dispatchedBeforeTakeover: false }))).toBe("Confirmed");
    expect(receiptLabel(receiptKind({ remoteConfirmed: true, uncertain: true, dispatchedBeforeTakeover: true }))).toBe("Takeover-interrupted");
  });

  it("summarises a step from outcome, expectation, or inputs in that order", () => {
    expect(stepSummary(step("a", "click", { detail: "button “Save”" }, { target: "r2" }))).toBe("button “Save”");
    expect(stepSummary({ ...step("b", "click", undefined, { target: "r2" }), expected: "dialog opens" })).toBe("dialog opens");
    expect(stepSummary(step("c", "navigate", undefined, { url: "https://a.com/x" }))).toBe("a.com/x");
    expect(stepSummary(step("d", "fill", undefined, { target: "r3", value: "hello" }))).toBe("r3");
    expect(stepSummary(step("e", "click", { status: "failed", error: { code: "x", message: "boom" } }))).toBe("boom");
  });
});
