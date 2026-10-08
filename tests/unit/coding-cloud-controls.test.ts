import { expect, it, vi } from "vitest";
import { codingMethods } from "../../apps/runtime/dist/api/methods/coding.js";
import type { MethodCtx } from "../../apps/runtime/src/api/methods/context.js";
const execution = {
  backend: "cloud",
  resourceId: "resource",
  sandboxName: "sandbox",
  sessionId: "session",
  root: "/vercel/sandbox/project",
  commandId: "command",
} as const;
const receipt = {
  processId: "process",
  runId: "run",
  actionId: "start",
  command: "npm run dev",
  workdir: execution.root,
  startedAt: 1,
  state: "running",
  execution,
  logText: "private process output",
} as const;
function context(services: unknown, params = {}, client = {}) {
  return {
    s: services,
    params: { runId: "run", processId: "process", cursor: 0, ...params },
    client: { external: false, ...client },
  } as MethodCtx;
}
it("reads encrypted cloud log history after VM retirement without invoking a provider or local log file", async () => {
  const logs = vi.fn(),
    retainedProcesses = vi.fn(),
    remoteLogs = vi.fn(() => ({ text: "saved output", cursor: 12, truncated: false }));
  const s = {
    repo: { getRun: () => ({ runId: "run" }) },
    codingProcesses: { status: () => receipt, logs, remoteLogs },
    cloudCoding: { retainedProcesses },
  };
  expect(await codingMethods["coding.logs"]!(context(s))).toEqual({
    text: "saved output",
    cursor: 12,
    truncated: false,
  });
  expect(logs).not.toHaveBeenCalled();
  expect(retainedProcesses).not.toHaveBeenCalled();
});
it("stops only the retained original cloud command and exposes its identity without its log body", async () => {
  const localStop = vi.fn(),
    stop = vi.fn(async () => ({ ...receipt, state: "stopped" }));
  let retained: { stop: typeof stop } | undefined = { stop };
  const s = {
    repo: { getRun: () => ({ runId: "run" }) },
    codingProcesses: { status: () => receipt, stop: localStop },
    cloudCoding: { retainedProcesses: () => retained },
  };
  const result = await codingMethods["coding.stop"]!(context(s));
  expect(result).toMatchObject({ state: "stopped", execution });
  expect(result).not.toHaveProperty("logText");
  expect(stop).toHaveBeenCalledWith("process", "run");
  retained = undefined;
  await expect(codingMethods["coding.stop"]!(context(s))).rejects.toMatchObject({
    code: "operation_uncertain",
  });
  expect(localStop).not.toHaveBeenCalled();
});
it("refuses cloud Undo after the original VM ends and never redirects its receipts to local files", async () => {
  const undo = vi.fn();
  const s = {
    repo: { getRun: () => ({ runId: "run" }) },
    codingFiles: { get: () => ({ execution }), undo },
    cloudCoding: { retainedFiles: () => undefined },
  };
  await expect(
    codingMethods["coding.undo"]!(
      context(s, { receiptIds: ["receipt"], actionId: "undo" }, { nativeTurnContext: "original" }),
    ),
  ).rejects.toMatchObject({ code: "ref_stale" });
  expect(undo).not.toHaveBeenCalled();
});
