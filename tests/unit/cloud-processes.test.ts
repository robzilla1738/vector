import { CLOUD_PROCESS_HEADER } from "../../apps/runtime/dist/services/cloud-process-worker.js";
import { afterEach, expect, it, vi } from "vitest";
import type { CloudProcessTransport } from "../../apps/runtime/dist/services/cloud-processes.js";
type Command = Awaited<ReturnType<CloudProcessTransport["command"]>>;
import { AuxError } from "@aux/contracts";
import { openDb } from "../../apps/runtime/dist/store/db.js";
import { Repo } from "../../apps/runtime/dist/store/repo.js";
import { CloudCodingProcesses } from "../../apps/runtime/dist/services/cloud-processes.js";
import { CodingProcesses } from "../../apps/runtime/dist/services/coding-processes.js";

const cleanup: (() => void)[] = [];
afterEach(() => cleanup.splice(0).forEach((close) => close()));
function fixture(proofSession = "original-session") {
  const db = openDb(":memory:"),
    repo = new Repo(db);
  cleanup.push(() => db.close());
  const context = { runId: "run", threadId: "chat", turnId: "run", actionId: "start" };
  const identity = {
    backend: "cloud" as const,
    resourceId: "resource",
    sandboxName: "aux-resource",
    sessionId: "original-session",
    root: "/vercel/sandbox/project",
  };
  let complete!: (result: unknown) => void, fail!: (error: Error) => void;
  const done = new Promise((resolve, reject) => {
    complete = resolve;
    fail = reject;
  });
  let originalProcessId = "";
  const command = {
    cmdId: "original-command",
    cwd: identity.root,
    startedAt: Date.now(),
    exitCode: null as number | null,
    wait: vi.fn(() => done),
    kill: vi.fn(async () => {
      command.exitCode = 143;
      complete({ exitCode: 143 });
    }),
    logs: async function* () {
      yield {
        stream: "stdout",
        data:
          CLOUD_PROCESS_HEADER +
          JSON.stringify({
            processId: originalProcessId,
            sessionId: proofSession,
            supervisor: { pid: 10, startTicks: "1", groupPid: 11, groupStartTicks: "2" },
          }) +
          "\nready\n",
      };
      await done;
      yield { stream: "stderr", data: "finished\n" };
    },
  };
  const transport = {
    current: async (signal?: AbortSignal) => {
      if (signal?.aborted) throw new AuxError("cancelled", "Stopped");
    },
    launch: vi.fn<CloudProcessTransport["launch"]>(async (_input, _context, _id, _admission, dispatched) => {
      originalProcessId = _id;
      dispatched();
      return command as unknown as Command;
    }),
    command: vi.fn(async () => command as unknown as Command),
    released: vi.fn(),
  };
  const options = {
    repo,
    context,
    identity,
    transport,
    authorize: async () => ({ network: false, check: () => {} }),
    authorizeAccess: async () => () => {},
  };
  const service = new CloudCodingProcesses(options);
  return { repo, context, identity, command, complete, fail, transport, options, service };
}
it("retains original command identity, bounded logs and duplicate suppression through confirmed Stop", async () => {
  const f = fixture(),
    input = { command: "npm run dev", network: false };
  const receipt = await f.service.start(input, f.context);
  expect(receipt).toMatchObject({
    state: "running",
    execution: { commandId: "original-command", sessionId: "original-session" },
  });
  expect(receipt).not.toHaveProperty("pid");
  expect(receipt).not.toHaveProperty("logPath");
  expect(receipt).not.toHaveProperty("logText");
  await f.service.start(input, f.context);
  expect(f.transport.launch).toHaveBeenCalledTimes(1);
  const logs = await f.service.logs(receipt.processId, f.context.runId);
  expect(logs.text).toContain("ready");
  expect(logs.text).not.toContain(CLOUD_PROCESS_HEADER);
  expect((await f.service.stop(receipt.processId, f.context.runId)).state).toBe("stopped");
  expect(f.command.kill).toHaveBeenCalledWith("SIGTERM", { abortSignal: expect.any(AbortSignal) });
  expect(f.transport.released).toHaveBeenCalledWith(receipt.processId);
  expect(f.service.status(receipt.processId, f.context.runId).execution?.commandId).toBe("original-command");
});
it("retains uncertain cleanup for retry and never changes the original command identity", async () => {
  const f = fixture(),
    receipt = await f.service.start({ command: "sleep 10" }, f.context);
  f.command.kill.mockRejectedValueOnce(new Error("Provider did not acknowledge kill"));
  await expect(f.service.stop(receipt.processId, f.context.runId)).rejects.toThrow("acknowledge");
  expect(f.service.status(receipt.processId, f.context.runId).state).toBe("uncertain");
  expect(f.transport.released).not.toHaveBeenCalled();
  expect((await f.service.stop(receipt.processId, f.context.runId)).state).toBe("stopped");
  expect(f.command.kill).toHaveBeenCalledTimes(2);
  expect(f.transport.command).not.toHaveBeenCalled();
});
it("does not replay unlocated launches and accepts only VM retirement as cleanup proof", async () => {
  const f = fixture();
  f.transport.launch.mockImplementationOnce(async (_input, _context, _id, _admission, dispatched) => {
    dispatched();
    throw new Error("Lost launch acknowledgement");
  });
  await expect(f.service.start({ command: "possibly changed files" }, f.context)).rejects.toThrow(
    "Lost launch",
  );
  const receipt = f.service.list(f.context.runId)[0]!;
  expect(receipt).toMatchObject({ state: "uncertain", execution: { sessionId: "original-session" } });
  expect(receipt.execution?.commandId).toBeUndefined();
  await expect(f.service.start({ command: "possibly changed files" }, f.context)).rejects.toMatchObject({
    code: "operation_uncertain",
  });
  await expect(f.service.closeRun(f.context.runId)).rejects.toThrow("acknowledged");
  expect(f.transport.launch).toHaveBeenCalledTimes(1);
  f.service.sessionStopped();
  expect(f.service.status(receipt.processId, f.context.runId).state).toBe("interrupted");
});
it("keeps retirement evidence when an old wait fails and prevents local recovery touching remote receipts", async () => {
  const f = fixture(),
    receipt = await f.service.start({ command: "sleep 10" }, f.context);
  f.service.sessionStopped();
  f.fail(new Error("Stopped session closed its connection"));
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(f.service.status(receipt.processId, f.context.runId).state).toBe("interrupted");
  const local = new CodingProcesses({
    repo: f.repo,
    seatbelt: {} as never,
    directory: "/unused",
    authorize: async () => {},
    checkOwner: () => {},
  });
  await expect(local.reconcile(receipt.processId, f.context)).rejects.toMatchObject({ code: "ref_stale" });
  expect(local.remoteLogs(receipt.processId, f.context.runId).text).toContain("ready");
  expect(f.transport.command).not.toHaveBeenCalled();
  await local.close();
  expect(f.service.status(receipt.processId, f.context.runId).state).toBe("interrupted");
  const replacement = new CloudCodingProcesses({
    ...f.options,
    identity: { ...f.identity, sessionId: "replacement-session" },
  });
  await expect(replacement.stop(receipt.processId, f.context.runId)).rejects.toMatchObject({
    code: "ref_stale",
  });
});
it("settles a failed wait from a later exact command Stop acknowledgement", async () => {
  const f = fixture();
  f.command.wait.mockRejectedValueOnce(new Error("Lost wait response"));
  const receipt = await f.service.start({ command: "sleep 10" }, f.context);
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(f.service.status(receipt.processId, f.context.runId).state).toBe("uncertain");
  expect((await f.service.stop(receipt.processId, f.context.runId)).state).toBe("stopped");
  expect(f.transport.released).toHaveBeenCalledWith(receipt.processId);
});

it("retains VM retirement when a previously pending launch finally returns its command ID", async () => {
  const f = fixture();
  let launch!: (command: Command) => void, sent!: () => void;
  const sentPromise = new Promise<void>((resolve) => {
    sent = resolve;
  });
  f.transport.launch.mockImplementationOnce(async (_input, _context, _id, _admission, dispatched) => {
    dispatched();
    sent();
    return await new Promise<Command>((resolve) => {
      launch = resolve;
    });
  });
  const pending = f.service.start({ command: "sleep 10" }, f.context);
  await sentPromise;
  f.service.sessionStopped();
  launch(f.command as unknown as Command);
  await expect(pending).rejects.toMatchObject({ code: "cancelled" });
  expect(f.service.list(f.context.runId)[0]).toMatchObject({
    state: "interrupted",
    execution: { commandId: "original-command" },
  });
  expect(f.command.wait).not.toHaveBeenCalled();
});

it("returns cancelled foreground work promptly while failed Stop cleanup remains owned", async () => {
  const f = fixture(),
    controller = new AbortController();
  f.command.kill.mockRejectedValueOnce(new Error("Provider unavailable"));
  const pending = f.service.run({ command: "sleep 10" }, { ...f.context, signal: controller.signal });
  await new Promise((resolve) => setTimeout(resolve, 0));
  controller.abort();
  await expect(pending).rejects.toMatchObject({ code: "cancelled" });
  expect(f.transport.released).not.toHaveBeenCalled();
  f.service.sessionStopped();
  f.complete({ exitCode: 143 });
  await new Promise((resolve) => setTimeout(resolve, 0));
});

it("rejects a different Session ownership header before admitting a running command", async () => {
  const f = fixture("another-session");
  await expect(f.service.start({ command: "dev" }, f.context)).rejects.toMatchObject({ code: "ref_stale" });
  expect(f.command.kill).toHaveBeenCalledTimes(1);
  const receipt = f.service.list(f.context.runId)[0]!;
  expect(receipt.execution?.supervisor).toBeUndefined();
  expect(f.service.remoteLogs(receipt.processId, f.context.runId).text).not.toContain(CLOUD_PROCESS_HEADER);
});
