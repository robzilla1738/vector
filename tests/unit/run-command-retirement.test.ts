import { afterEach, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ inventories: [] as string[], current: "", pid: 90123 }));
vi.mock("node:child_process", async () => {
  const { EventEmitter } = await import("node:events");
  const { promisify } = await import("node:util");
  const execFile = vi.fn();
  Object.defineProperty(execFile, promisify.custom, {
    value: async () => ({ stdout: state.inventories.shift() ?? state.current, stderr: "" }),
  });
  return {
    execFile,
    spawn: () => {
      const child = Object.assign(new EventEmitter(), { pid: state.pid, kill: vi.fn() });
      queueMicrotask(() => child.emit("exit", 0, null));
      return child;
    },
  };
});
import { runCommand } from "../../scripts/lib/run-command.mjs";
afterEach(() => vi.restoreAllMocks());

it("joins the actual empty original group before reporting its retained EPERM", async () => {
  const uid = process.getuid!();
  state.current = "";
  state.inventories = [`90124 ${state.pid} ${uid}\n`, ""];
  const error = Object.assign(new Error("kill EPERM"), { code: "EPERM" });
  const kill = vi.spyOn(process, "kill").mockImplementation(() => {
    throw error;
  });
  vi.spyOn(console, "error").mockImplementation(() => {});
  await expect(runCommand("disposable-child", [])).rejects.toBe(error);
  expect(kill).toHaveBeenCalledExactlyOnceWith(-state.pid, "SIGTERM");
});

it("keeps launcher lock and Profile cleanup pending until the original live descendant retires", async () => {
  const uid = process.getuid!();
  state.current = `90124 ${state.pid} ${uid}\n`;
  state.inventories = [];
  const error = Object.assign(new Error("kill EPERM"), { code: "EPERM" });
  let observedTermination: (() => void) | undefined;
  const termination = new Promise<void>((resolve) => {
    observedTermination = resolve;
  });
  vi.spyOn(process, "kill").mockImplementation(() => {
    observedTermination?.();
    throw error;
  });
  vi.spyOn(console, "error").mockImplementation(() => {});
  const removeProfile = vi.fn();
  const releaseLock = vi.fn();
  const owner = async () => {
    try {
      await runCommand("disposable-child", []);
    } finally {
      removeProfile();
      releaseLock();
    }
  };
  const completion = owner().then(
    () => undefined,
    (failure: unknown) => failure,
  );
  await termination;
  await Promise.resolve();
  expect(removeProfile).not.toHaveBeenCalled();
  expect(releaseLock).not.toHaveBeenCalled();
  state.current = "";
  expect(await completion).toBe(error);
  expect(removeProfile).toHaveBeenCalledOnce();
  expect(releaseLock).toHaveBeenCalledOnce();
});
