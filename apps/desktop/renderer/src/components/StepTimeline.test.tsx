// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { StepRecord } from "@aux/contracts";
import { StepTimeline, fmtMs, isOpenablePath, nestSteps, opLabel, receiptKind, receiptLabel, redactedInputs, stepSummary } from "./StepTimeline";

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
    expect(rows[0]!.textContent).not.toContain("812 ms");
    act(() => rows[0]!.querySelector<HTMLButtonElement>(".tl-summary")!.click());
    expect(rows[0]!.textContent).toContain("812 ms");
    expect(rows[2]!.className).toContain("failed");
    expect(rows[2]!.textContent).toContain("r41 is off-screen");
    act(() => rows[2]!.querySelector<HTMLButtonElement>(".tl-summary")!.click());
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

  it("turns url and absolute-path artifacts into chips, keeping secrets out of the card", () => {
    const el = render(
      <StepTimeline
        live={false}
        steps={[
          step("s1", "navigate", { durationMs: 10, detail: "example.com" }, { url: "https://example.com/x" }),
          step("s2", "upload", { durationMs: 10 }, { path: "/tmp/report.pdf" }),
          step("s3", "fillCredential", { durationMs: 10 }, { credentialRef: "cref_hide", value: "s3cret-value" }),
        ]}
      />,
    );
    const summaries = el.querySelectorAll<HTMLButtonElement>(".tl-summary");
    act(() => summaries[0]!.click());
    act(() => summaries[1]!.click());
    const url = el.querySelector("a.tl-chip");
    expect(url?.getAttribute("href")).toBe("https://example.com/x");
    expect(url?.textContent).toBe("example.com/x");
    expect(el.querySelector("button.tl-chip")?.textContent).toBe("/tmp/report.pdf");
    expect(el.textContent).toContain("cref_hide");
    expect(el.textContent).not.toContain("s3cret-value");
  });

  it("never shows fillCredential secrets and nests those steps under the previous card", () => {
    const secret = step("s5", "fillCredential", { durationMs: 12 }, { credentialRef: "cref_abc", value: "s3cret-value", target: "r9" });
    expect(stepSummary(secret)).toBe("cref_abc");
    expect(stepSummary(secret)).not.toContain("s3cret");
    expect(redactedInputs(secret).value).toBe("[redacted]");
    expect(nestSteps([step("s1", "fill", { durationMs: 10 }, { target: "r1" }), secret]).map(group => [group.step.op, group.children.map(child => child.op)])).toEqual([["fill", ["fillCredential"]]]);
    const el = render(<StepTimeline live={false} steps={[step("s1", "fill", { durationMs: 10 }, { target: "r1" }), secret]} />);
    expect(el.querySelector(".tl-nest")?.textContent).toContain("Fill credential");
    expect(el.textContent).toContain("cref_abc");
    expect(el.textContent).not.toContain("s3cret-value");
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
    expect(opLabel("fillCredential")).toBe("Fill credential");
    expect(opLabel("frobnicate")).toBe("frobnicate");
  });

  it("labels receipts with takeover taking priority over confirmed", () => {
    expect(receiptKind(undefined)).toBe("");
    expect(receiptLabel(receiptKind({ remoteConfirmed: false, uncertain: true, dispatchedBeforeTakeover: false }))).toBe("Uncertain");
    expect(receiptLabel(receiptKind({ remoteConfirmed: true, uncertain: false, dispatchedBeforeTakeover: false }))).toBe("Confirmed");
    expect(receiptLabel(receiptKind({ remoteConfirmed: true, uncertain: true, dispatchedBeforeTakeover: true }))).toBe("Takeover-interrupted");
  });

  it("opens only absolute filesystem paths, not locators", () => {
    expect(isOpenablePath("/tmp/file.pdf")).toBe(true);
    expect(isOpenablePath("~/Notes.md")).toBe(true);
    expect(isOpenablePath("C:\\Users\\a\\file.txt")).toBe(true);
    expect(isOpenablePath("r18")).toBe(false);
    expect(isOpenablePath("report.pdf")).toBe(false);
  });

  it("summarises a step from outcome, expectation, or inputs in that order", () => {
    expect(stepSummary(step("a", "click", { detail: "button “Save”" }, { target: "r2" }))).toBe("button “Save”");
    expect(stepSummary({ ...step("b", "click", undefined, { target: "r2" }), expected: "dialog opens" })).toBe("dialog opens");
    expect(stepSummary(step("c", "navigate", undefined, { url: "https://a.com/x" }))).toBe("a.com/x");
    expect(stepSummary(step("d", "fill", undefined, { target: "r3", value: "hello" }))).toBe("r3");
    expect(stepSummary(step("e", "click", { status: "failed", error: { code: "x", message: "boom" } }))).toBe("boom");
  });
});

it("keeps uncertain outcomes visible while disclosing recorded identity and observation",()=>{
  const el=render(<StepTimeline live={false} steps={[step("receipt","click",{receipt:{observed:"Dispatch sent; confirmation unavailable",remoteConfirmed:false,uncertain:true,dispatchedBeforeTakeover:false,identity:{pageId:"page-2",documentEpoch:7,generation:3,target:"r4"}}})]}/>);
  expect(el.textContent).toContain("Uncertain");
  expect(el.textContent).not.toContain("page-2");
  act(()=>el.querySelector<HTMLButtonElement>(".tl-summary")!.click());
  expect(el.textContent).toContain("Dispatch sent; confirmation unavailable");
  expect(el.querySelector('.tl-identity')?.textContent).toContain("page-2Document7Generation3Targetr4");
});
