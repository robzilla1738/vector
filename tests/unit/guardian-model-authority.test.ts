import { expect, it, vi } from "vitest";
import type { SafetyAction } from "@aux/contracts";
import { AuxError } from "@aux/contracts";
import { createGuardianJudge } from "../../apps/runtime/src/safety/guardian-model.js";
import { reviewGuardian } from "../../apps/runtime/src/safety/guardian.js";
import { withAttempts, type ModelClient } from "../../apps/runtime/src/agent/model-client.js";
const action: SafetyAction = {
  profileId: "profile",
  scope: { kind: "task", id: "run" },
  effect: "external_tool",
  action: "send",
  invocationDigest: "a".repeat(64),
  origin: "https://fixture.test",
  turnId: "turn",
  threadId: "thread",
  requestedAt: 1,
};
function client(dispatch: () => void = () => {}): ModelClient {
  return {
    generateStructured: async (input) => {
      dispatch();
      return {
        object: input.schema.parse({ findings: [] }),
        durationMs: 7,
        inputTokens: 12,
        outputTokens: 3,
      };
    },
    generateText: async () => {
      throw new Error("Unexpected text call");
    },
    listModels: async () => [],
  };
}
it("forwards the actual run identity and prevents Guardian dispatch when the overnight pre-call gate refuses", async () => {
  const dispatch = vi.fn(),
    record = vi.fn();
  const gate = vi.fn(async (runId: string | undefined) => {
    expect(runId).toBe("real-run");
    throw new AuxError("permission_denied", "Window closed");
  });
  const result = await reviewGuardian({
    action,
    runId: "real-run",
    authorization: "high",
    judge: createGuardianJudge({
      model: () => client(dispatch),
      modelId: () => "fixture",
      beforeCall: gate,
      recordAttempt: record,
    }),
  });
  expect(result.status).toBe("deny");
  expect(gate).toHaveBeenCalledOnce();
  expect(dispatch).not.toHaveBeenCalled();
  expect(record).not.toHaveBeenCalled();
});
it("does not release a Guardian decision until actual accounting acknowledges retirement", async () => {
  let acknowledge!: () => void;
  let completed = false;
  const record = vi.fn(async (_attempt, _modelId, _error, runId) => {
    expect(runId).toBe("real-run");
    await new Promise<void>((resolve) => {
      acknowledge = resolve;
    });
  });
  const judge = createGuardianJudge({
    model: () => client(),
    modelId: () => "fixture",
    beforeCall: async () => {},
    recordAttempt: record,
  });
  const result = judge({ action, runId: "real-run", untrusted: [] }).then((value) => {
    completed = true;
    return value;
  });
  await vi.waitFor(() => expect(record).toHaveBeenCalledOnce());
  expect(completed).toBe(false);
  acknowledge();
  expect(await result).toEqual([]);
  expect(completed).toBe(true);
});
it("refuses an accounting failure without manufacturing another billed model attempt", async () => {
  const record = vi.fn(async () => {
    throw new AuxError("permission_denied", "Native retirement failed");
  });
  const dispatch = vi.fn();
  const judge = createGuardianJudge({
    model: () => client(dispatch),
    modelId: () => "fixture",
    beforeCall: async () => {},
    recordAttempt: record,
  });
  await expect(judge({ action, runId: "real-run", untrusted: [] })).rejects.toThrow(
    "Native retirement failed",
  );
  expect(record).toHaveBeenCalledOnce();
  expect(dispatch).toHaveBeenCalledOnce();
});
it("accounts failed provider attempts with the actual run and usage before refusal", async () => {
  const model = client();
  model.generateStructured = async () => {
    throw withAttempts(new Error("Provider failed"), [
      { modelId: "actual-provider", durationMs: 9, inputTokens: 42, outputTokens: 5 },
    ]);
  };
  const record = vi.fn(async () => {});
  const judge = createGuardianJudge({
    model: () => model,
    modelId: () => "requested",
    beforeCall: async () => {},
    recordAttempt: record,
  });
  await expect(judge({ action, runId: "real-run", untrusted: [] })).rejects.toThrow("Provider failed");
  expect(record).toHaveBeenCalledExactlyOnceWith(
    { modelId: "actual-provider", durationMs: 9, inputTokens: 42, outputTokens: 5 },
    "actual-provider",
    "guardian_model_failed",
    "real-run",
  );
});
