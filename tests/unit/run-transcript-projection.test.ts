import { describe, expect, it } from "vitest";
import type { Artifact, Run, StepRecord } from "@aux/contracts";
import { projectRunTranscript } from "../../apps/runtime/src/services/run-transcript.js";

const run = (patch: Partial<Run> = {}): Run => ({
  runId: "run-1",
  goal: "Find the reference",
  status: "completed",
  pageIds: [],
  createdAt: 1,
  config: { implementation: "agent-loop" },
  result: {
    report: "Reference is rec-15",
    citations: [{ observationId: "art-1", quote: "Internal ref rec-15." }],
  },
  ...patch,
});
const artifact = (patch: Partial<Artifact> = {}): Artifact => ({
  artifactId: "art-1",
  runId: "run-1",
  path: "/private/secret/path",
  mediaType: "text/plain",
  size: 28,
  status: "complete",
  createdAt: 2,
  ...patch,
});

describe("run transcript projection", () => {
  it("rehydrates terminal answer, verified citation and run-scoped artifact without exposing a path", () => {
    const projected = projectRunTranscript(run(), [
      artifact(),
      artifact({ artifactId: "other", runId: "run-2" }),
    ]);
    expect(projected.items).toContainEqual({ kind: "answer", text: "Reference is rec-15", terminal: true });
    expect(projected.items).toContainEqual({
      kind: "citation",
      observationId: "art-1",
      quote: "Internal ref rec-15.",
      artifactId: "art-1",
    });
    expect(projected.items).toContainEqual({
      kind: "artifact",
      artifactId: "art-1",
      mediaType: "text/plain",
      size: 28,
      status: "complete",
    });
    expect(JSON.stringify(projected)).not.toContain("/private/secret/path");
    expect(JSON.stringify(projected)).not.toContain("other");
  });

  it("does not grant citation trust to an unfinished or legacy run", () => {
    expect(
      projectRunTranscript(run({ status: "running" }), [artifact()]).items.some(
        (item) => item.kind === "citation",
      ),
    ).toBe(false);
    expect(
      projectRunTranscript(run({ config: { implementation: "agent" } }), [artifact()]).items.some(
        (item) => item.kind === "citation",
      ),
    ).toBe(false);
  });

  it("shows honest recovery without turning uncertainty into a retry", () => {
    const projected = projectRunTranscript(
      run({ status: "interrupted", result: undefined, statusMessage: "Stopped with an uncertain outcome" }),
      [],
    );
    expect(projected.items).toContainEqual({
      kind: "recovery",
      state: "interrupted",
      description: "Stopped with an uncertain outcome",
      action: "inspect",
    });
  });

  it("projects only a valid completed loop proposal for reviewed insertion", () => {
    const textProposal = "A concise note for the page.";
    expect(
      projectRunTranscript(run({ result: { report: "Draft ready", textProposal } }), []).items,
    ).toContainEqual({ kind: "text-proposal", text: textProposal, terminal: true });
    expect(
      projectRunTranscript(run({ status: "running", result: { textProposal } }), []).items.some(
        (item) => item.kind === "text-proposal",
      ),
    ).toBe(false);
    expect(
      projectRunTranscript(
        run({ config: { implementation: "agent" }, result: { textProposal } }),
        [],
      ).items.some((item) => item.kind === "text-proposal"),
    ).toBe(false);
    expect(
      projectRunTranscript(run({ result: { textProposal: "x".repeat(12_001) } }), []).items.some(
        (item) => item.kind === "text-proposal",
      ),
    ).toBe(false);
  });

  it("bounds citation presentation even when a persisted result is malformed", () => {
    const citations = Array.from({ length: 40 }, (_, index) => ({
      observationId: `obs-${index}`,
      quote: "cited",
    }));
    citations[0] = { observationId: "oversize", quote: "x".repeat(4_001) };
    const items = projectRunTranscript(run({ result: { report: "Done", citations } }), []).items;
    expect(items.filter((item) => item.kind === "citation")).toHaveLength(31);
    expect(JSON.stringify(items)).not.toContain("oversize");
  });

  it("presents a bounded action rail without step inputs or page values", () => {
    const steps: StepRecord[] = Array.from({ length: 25 }, (_, index) => ({
      stepId: `s${index}`,
      runId: "run-1",
      op: "click",
      inputs: { value: "private field value" },
      startedAt: index,
      outcome: { stepId: `s${index}`, op: "click", startedAt: index, status: "ok", durationMs: 1 },
    }));
    steps.push({ stepId: "foreign", runId: "other-run", op: "click", startedAt: 30 });
    const items = projectRunTranscript(run(), [], steps).items.filter((item) => item.kind === "tool");
    expect(items).toHaveLength(16);
    expect(items[0]).toEqual({ kind: "tool", op: "click", status: "ok" });
    expect(JSON.stringify(items)).not.toContain("private field value");
  });
});
