import { describe, expect, it } from "vitest";
import { markUnconfirmedWrites, verifyResultCitations } from "@aux/runtime";
import type { StepOutcome } from "@aux/contracts";

const outcome = (stepId: string, op = "click", extra: Partial<StepOutcome> = {}): StepOutcome => ({
  stepId,
  op,
  status: "ok",
  startedAt: 1,
  durationMs: 1,
  ...extra,
});

describe("SDK result evidence", () => {
  it("marks writes without post-state while preserving observed and uncertain receipts", () => {
    const bare = outcome("bare");
    const observed = outcome("observed", "click", { effect: "observed" });
    const remote = outcome("remote", "click", {
      receipt: { remoteConfirmed: true, uncertain: false, dispatchedBeforeTakeover: false },
    });
    const uncertain = outcome("uncertain", "click", {
      status: "failed",
      effect: "uncertain",
      receipt: { remoteConfirmed: false, uncertain: true, dispatchedBeforeTakeover: true },
    });
    const navigation = ["navigate", "back", "forward", "reload"].map((op) => outcome(op, op));
    expect(markUnconfirmedWrites([bare, observed, remote, uncertain, ...navigation])).toEqual(["bare"]);
    expect(bare.receipt).toMatchObject({ unconfirmed: true });
    expect(observed.receipt).toBeUndefined();
    expect(remote.receipt).toMatchObject({ remoteConfirmed: true });
    expect(uncertain.receipt).toMatchObject({ uncertain: true, dispatchedBeforeTakeover: true });
    expect(navigation.every((step) => !step.receipt)).toBe(true);
  });

  it("verifies quotes against their original snapshot and distinguishes missing evidence", () => {
    const snapshots = new Map([
      ["obs-original", "Visible page heading"],
      ["p1@2", "Updated page heading"],
      ["p1", "Latest page heading"],
    ]);
    expect(
      verifyResultCitations(
        [
          { observationId: "obs-original", pageId: "p1", quote: "visible   PAGE heading" },
          { pageId: "p1", revision: 2, quote: "Updated page heading" },
          { pageId: "p1", quote: "fabricated quote" },
          { observationId: "absent", pageId: "p1", quote: "Latest page heading" },
          { observationId: "obs-original", pageId: "p1", quote: "Latest page heading" },
          { pageId: "p1", revision: 99, quote: "Latest page heading" },
        ],
        snapshots,
      ),
    ).toEqual({ unverified: [2, 4], missing: [3, 5] });
  });
});
