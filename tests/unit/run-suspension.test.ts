import { describe, expect, it, vi } from "vitest";
import { openDb, Repo } from "@aux/runtime";
import type { Run, Suspension } from "@aux/contracts";
import { assertRunAnswerable, currentRunSuspension } from "../../apps/runtime/src/services/run-suspension.js";
import { runsMethods } from "../../apps/runtime/src/api/methods/runs.js";
import type { MethodCtx } from "../../apps/runtime/src/api/methods/context.js";

const run = (patch: Partial<Run> = {}): Run => ({
  runId: "r1",
  goal: "Find a value",
  pageIds: [],
  status: "needs_input",
  createdAt: 1,
  ...patch,
});
const suspension = (patch: Partial<Suspension> = {}): Suspension => ({
  suspensionId: "s1",
  runId: "r1",
  threadId: "t1",
  turnId: "r1",
  kind: "ask-user-question",
  request: { kind: "ask-user-question", instruction: "Which account?", guidance: "Ask the person." },
  state: "pending",
  createdAt: 2,
  ...patch,
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
    expect(() => assertRunAnswerable(run(), suspension())).toThrow(/changed/);
    expect(() => assertRunAnswerable(run(), undefined)).toThrow(/changed/);
    expect(() => assertRunAnswerable(run({ status: "running" }), suspension(), "s1")).toThrow(/changed/);
    expect(() => assertRunAnswerable(run(), suspension({ turnId: "old-turn" }), "s1")).toThrow(/changed/);
    expect(() => assertRunAnswerable(run(), suspension({ kind: "approval" }), "s1")).toThrow(
      /approval prompt/,
    );
    expect(() => assertRunAnswerable(run(), suspension({ kind: "action-confirmation" }), "s1")).toThrow(
      /approval prompt/,
    );
  });

  it("includes the typed record in runs.get and refuses an unsafe answer before waking the coordinator", async () => {
    let record = suspension({
      kind: "approval",
      request: { kind: "approval", approvalId: "a1", instruction: "Approve?", guidance: "Review it." },
    });
    const db = openDb(":memory:"),
      repo = new Repo(db);
    repo.saveRun(run());
    const answer = vi.fn(
      async (_runId: string, _text: string, _mentions: unknown[], recheck: () => void): Promise<Run> => {
        recheck();
        return run({ status: "running" });
      },
    );
    const context = (
      params: Record<string, unknown>,
      client: Record<string, unknown> = { external: false },
    ) =>
      ({
        params,
        client,
        s: {
          runs: {
            coordinator: { get: () => run(), controls: new Map([["r1", {}]]), answerWithMentions: answer },
          },
          repo,
          artifacts: { list: () => [] },
        },
        suspensions: { pending: () => record },
      }) as unknown as MethodCtx;
    const detail = (await runsMethods["runs.get"]!(context({ runId: "r1" }))) as { suspension: Suspension };
    expect(detail.suspension.suspensionId).toBe("s1");
    await expect(
      runsMethods["runs.answer"]!(context({ runId: "r1", answer: "Yes", expectedSuspensionId: "s1" })),
    ).rejects.toThrow(/approval prompt/);
    expect(answer).not.toHaveBeenCalled();
    record = suspension();
    await expect(
      runsMethods["runs.answer"]!(
        context(
          { runId: "r1", answer: "Agent-authored answer", expectedSuspensionId: "s1" },
          { external: false, codeMode: true },
        ),
      ),
    ).rejects.toThrow(/Aux composer/);
    expect(answer).not.toHaveBeenCalled();
    record = suspension({
      kind: "handoff",
      request: {
        kind: "handoff",
        instruction: "Retry model setup",
        guidance: "Use the dedicated retry",
        modelLimits: {
          runId: "r1",
          modelId: "fixture-model",
          reasons: ["output-bound"],
          digest: "a".repeat(64),
        },
      },
    });
    await expect(
      runsMethods["runs.answer"]!(context({ runId: "r1", answer: "Ready", expectedSuspensionId: "s1" })),
    ).rejects.toThrow(/model setup/);
    expect(answer).not.toHaveBeenCalled();
    record = suspension({
      kind: "handoff",
      request: {
        kind: "handoff",
        instruction: "Retry cloud setup",
        guidance: "Use the dedicated retry",
        cloudSetup: { runId: "r1", originalDigest: "b".repeat(64) },
      },
    });
    await expect(
      runsMethods["runs.answer"]!(context({ runId: "r1", answer: "Ready", expectedSuspensionId: "s1" })),
    ).rejects.toThrow(/cloud setup/i);
    expect(answer).not.toHaveBeenCalled();
    record = suspension({ suspensionId: "s2" });
    await expect(
      runsMethods["runs.answer"]!(context({ runId: "r1", answer: "Work", expectedSuspensionId: "s1" })),
    ).rejects.toThrow(/changed/);
    expect(answer).not.toHaveBeenCalled();
    await expect(
      runsMethods["runs.answer"]!(context({ runId: "r1", answer: "Work", expectedSuspensionId: "s2" })),
    ).resolves.toMatchObject({ runId: "r1", status: "running" });
    expect(answer).toHaveBeenCalledExactlyOnceWith("r1", "Work", [], expect.any(Function));
    record = suspension({ suspensionId: "replacement" });
    expect(() => answer.mock.calls[0]![3]()).toThrow(/changed/);
    db.close();
  });
});

it("binds restarted answers to native authority and rechecks the exact suspension before waking", async () => {
  let record = suspension();
  const native = { turnSourceContext: vi.fn(async (_token: string) => ({ windowId: "original-window" })) };
  const bind = vi.fn(
    async (_runId: string, _suspensionId: string, _token: string, owner: () => Promise<void>) => {
      await owner();
    },
  );
  const accepted = vi.fn();
  const answer = vi.fn(async (_runId: string, _answer: string, _mentions: unknown[], recheck: () => void) => {
    recheck();
    accepted();
    return run({ status: "running" });
  });
  const context = (client: Record<string, unknown> = { external: false, nativeTurnContext: "fresh-owner" }) =>
    ({
      params: { runId: "r1", answer: "Work account", expectedSuspensionId: "s1" },
      client,
      s: {
        native,
        runs: {
          coordinator: {
            get: () => run(),
            controls: new Map(),
            bindRestartOwner: bind,
            answerWithMentions: answer,
          },
        },
      },
      suspensions: { pending: () => record },
    }) as unknown as MethodCtx;
  await expect(runsMethods["runs.answer"]!(context({ external: false }))).rejects.toThrow(/Aux window/);
  await expect(
    runsMethods["runs.answer"]!(
      context({ external: false, codeMode: true, nativeTurnContext: "fresh-owner" }),
    ),
  ).rejects.toThrow(/Aux (window|composer)/);
  await expect(
    runsMethods["runs.answer"]!(context({ external: true, nativeTurnContext: "fresh-owner" })),
  ).rejects.toThrow(/Aux composer/);
  expect(bind).not.toHaveBeenCalled();
  expect(answer).not.toHaveBeenCalled();
  native.turnSourceContext.mockRejectedValueOnce(new Error("Original native source retired"));
  await expect(runsMethods["runs.answer"]!(context())).rejects.toThrow(/source retired/);
  expect(answer).not.toHaveBeenCalled();
  await runsMethods["runs.answer"]!(context());
  expect(bind).toHaveBeenLastCalledWith("r1", "s1", "fresh-owner", expect.any(Function));
  expect(native.turnSourceContext).toHaveBeenLastCalledWith("fresh-owner");
  expect(answer).toHaveBeenCalledExactlyOnceWith("r1", "Work account", [], expect.any(Function));
  expect(accepted).toHaveBeenCalledOnce();
  answer.mockClear();
  accepted.mockClear();
  bind.mockImplementationOnce(async (_runId, _suspensionId, _token, owner) => {
    await owner();
    record = suspension({ suspensionId: "replacement" });
  });
  await expect(runsMethods["runs.answer"]!(context())).rejects.toThrow(/changed/);
  // The coordinator's supplied commit guard rejects the replacement; no answer is accepted.
  expect(answer).toHaveBeenCalledOnce();
  expect(accepted).not.toHaveBeenCalled();
});
