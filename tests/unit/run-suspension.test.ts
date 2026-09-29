import { describe, expect, it, vi } from "vitest";
import type { Run, Suspension } from "@aux/contracts";
import { assertRunAnswerable, currentRunSuspension } from "../../apps/runtime/src/services/run-suspension.js";
import { runsMethods } from "../../apps/runtime/src/api/methods/runs.js";
import type { MethodCtx } from "../../apps/runtime/src/api/methods/context.js";

const run = (patch: Partial<Run> = {}): Run => ({
  runId: "r1", goal: "Find a value", pageIds: [], status: "needs_input", createdAt: 1, ...patch,
});
const suspension = (patch: Partial<Suspension> = {}): Suspension => ({
  suspensionId: "s1", runId: "r1", threadId: "t1", turnId: "r1", kind: "ask-user-question",
  request: { kind: "ask-user-question", instruction: "Which account?", guidance: "Ask the person." },
  state: "pending", createdAt: 2, ...patch,
});

describe("durable run suspension view and answer guard", () => {
  it("projects only a pending record on the current parked turn", () => {
    expect(currentRunSuspension(run(), suspension())?.suspensionId).toBe("s1");
    expect(currentRunSuspension(run({ status: "running" }), suspension())).toBeNull();
    expect(currentRunSuspension(run(), suspension({ turnId: "old-turn" }))).toBeNull();
    expect(currentRunSuspension(run(), suspension({ state: "answered" }))).toBeNull();
  });

  it("accepts a fresh question or handoff once and rejects stale or unsafe answers", () => {
    expect(() => assertRunAnswerable(run(), suspension(), "s1")).not.toThrow();
    expect(() => assertRunAnswerable(run(), suspension({ kind: "handoff" }), "s1")).not.toThrow();
    expect(() => assertRunAnswerable(run(), suspension(), "old-id")).toThrow(/changed/);
    expect(() => assertRunAnswerable(run({ status: "running" }), suspension(), "s1")).toThrow(/changed/);
    expect(() => assertRunAnswerable(run(), suspension({ turnId: "old-turn" }), "s1")).toThrow(/changed/);
    expect(() => assertRunAnswerable(run(), suspension({ kind: "approval" }), "s1")).toThrow(/approval prompt/);
    expect(() => assertRunAnswerable(run(), suspension({ kind: "action-confirmation" }), "s1")).toThrow(/approval prompt/);
  });

  it("includes the typed record in runs.get and refuses an unsafe answer before waking the coordinator", async () => {
    let record = suspension({ kind: "approval", request: { kind: "approval", approvalId: "a1", instruction: "Approve?", guidance: "Review it." } });
    const answer = vi.fn();
    const context = (params: Record<string, unknown>) => ({ params,
      s: { runs: { coordinator: { get: () => run(), answer } }, repo: { listModelCalls: () => [], listSteps: () => [] }, artifacts: { list: () => [] } },
      suspensions: { pending: () => record },
    }) as unknown as MethodCtx;
    const detail = await runsMethods["runs.get"]!(context({ runId: "r1" })) as { suspension: Suspension };
    expect(detail.suspension.suspensionId).toBe("s1");
    await expect(runsMethods["runs.answer"]!(context({ runId: "r1", answer: "Yes", expectedSuspensionId: "s1" })))
      .rejects.toThrow(/approval prompt/);
    expect(answer).not.toHaveBeenCalled();
    record = suspension({ suspensionId: "s2" });
    await expect(runsMethods["runs.answer"]!(context({ runId: "r1", answer: "Work", expectedSuspensionId: "s1" })))
      .rejects.toThrow(/changed/);
    expect(answer).not.toHaveBeenCalled();
    await runsMethods["runs.answer"]!(context({ runId: "r1", answer: "Work", expectedSuspensionId: "s2" }));
    expect(answer).toHaveBeenCalledExactlyOnceWith("r1", "Work");
  });
});
