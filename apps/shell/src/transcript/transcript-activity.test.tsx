// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import type { Run, StepRecord } from "@aux/contracts";
import { projectRunTranscript } from "../../../runtime/src/services/run-transcript";
import { bridge } from "../bridge";
import { ErrorItem, ToolFold, WaitingItem } from "./TranscriptActivity";
import { RunTranscriptDetails } from "./RunTranscriptDetails";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const run = (patch: Partial<Run> = {}): Run => ({
  runId: "run-1", goal: "Prepare a note", status: "running", pageIds: [], createdAt: 1,
  config: { implementation: "agent-loop" }, ...patch,
});

describe("durable transcript activity", () => {
  it("projects a bounded waiting state and safe action summary without inputs or old step leakage", () => {
    const steps: StepRecord[] = Array.from({ length: 22 }, (_, index) => ({
      stepId: `s${index}`, runId: "run-1", op: index === 21 ? "secret.action" : "click",
      startedAt: index, inputs: { value: "private token value" },
      outcome: { stepId: `s${index}`, op: "click", startedAt: index, durationMs: 1, status: "ok" },
    }));
    steps.push({ stepId: "foreign", runId: "foreign", op: "click", startedAt: 23 });
    const projected = projectRunTranscript(run({ statusMessage: "page value should not become a waiting label" }), [], steps);
    expect(projected.items).toContainEqual({ kind: "waiting", state: "running", label: "Working on this request" });
    expect(projected.items).toContainEqual({ kind: "tool-summary", total: 22, omitted: 6 });
    expect(projected.items.filter((item) => item.kind === "tool")).toHaveLength(16);
    expect(projected.items).toContainEqual({ kind: "tool", op: "other", status: "ok" });
    expect(JSON.stringify(projected)).not.toMatch(/private token value|page value|foreign|secret.action/);
  });

  it("projects safe typed failure guidance and omits provider response bodies", () => {
    const projected = projectRunTranscript(run({ status: "failed", error: "raw provider body must stay private",
      failure: { category: "rate_limit", message: "Please wait before retrying", retryable: true, action: "retry" } }), []);
    expect(projected.items).toContainEqual({ kind: "error", category: "rate_limit", message: "Please wait before retrying",
      retryable: true, action: "retry" });
    expect(JSON.stringify(projected)).not.toContain("raw provider body");
    const long = projectRunTranscript(run({ status: "failed", failure: {
      category: "provider", message: "x".repeat(2_000), retryable: false, action: "none",
    } }), []);
    expect(long.items.find((item) => item.kind === "error")).toMatchObject({ message: "x".repeat(1_000) });
  });

  it("renders waiting, folded action counts and failure guidance accessibly", async () => {
    const host = document.createElement("div");
    const root = createRoot(host);
    try {
      await act(async () => root.render(<>
        <WaitingItem item={{ kind: "waiting", state: "running", label: "Working on this request" }} />
        <ToolFold tools={[{ kind: "tool", op: "click", status: "ok" }]}
          summary={{ kind: "tool-summary", total: 7, omitted: 6 }} />
        <ErrorItem item={{ kind: "error", category: "permission", message: "Permission needed",
          retryable: false, action: "permission_settings" }} />
      </>));
      expect(host.querySelector("output.transcript-waiting")?.textContent).toBe("Working on this request");
      expect(host.querySelector(".transcript-tools summary")?.textContent).toContain("7");
      expect(host.querySelector(".transcript-tools")?.textContent).toContain("6 earlier actions");
      expect(host.querySelector('[role="alert"]')?.textContent).toContain("Review the required permission in Settings");
      expect(host.querySelector('[role="alert"]')?.textContent).toContain("cannot be retried automatically");
    } finally { await act(async () => root.unmount()); }
  });

  it("rehydrates a failed run into one typed error card after missed deltas", async () => {
    const failed = run({ status: "failed", failure: {
      category: "network", message: "Connection interrupted", retryable: true, action: "retry",
    } });
    const projection = projectRunTranscript(failed, [], [{ stepId: "s1", runId: failed.runId,
      op: "click", startedAt: 1, outcome: { stepId: "s1", op: "click", startedAt: 1, durationMs: 1, status: "ok" } }]);
    const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
      if (method === "runs.get") return { run: failed, steps: [], modelCalls: 1, transcript: projection } as never;
      return {} as never;
    });
    const host = document.createElement("div");
    const root = createRoot(host);
    try {
      await act(async () => root.render(<RunTranscriptDetails run={failed} />));
      expect(invoke).toHaveBeenCalledWith("runs.get", { runId: failed.runId });
      expect(host.querySelectorAll(".transcript-error")).toHaveLength(1);
      expect(host.querySelector(".transcript-error")?.textContent).toContain("Connection interrupted");
      expect(host.querySelector(".transcript-tools summary")?.textContent).toContain("1");
      expect(host.querySelector(".run-failure")).toBeNull();
    } finally { await act(async () => root.unmount()); invoke.mockRestore(); }
  });
});
