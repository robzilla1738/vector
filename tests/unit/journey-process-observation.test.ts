import { expect, it } from "vitest";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { observeJourneyProcess } from "../host/lib/app.mjs";

it("retains the actual owned child exit code before cleanup", async () => {
  const child = spawn(process.execPath, ["-e", "process.exit(7)"], { stdio: "ignore" });
  await once(child, "exit");
  expect(observeJourneyProcess({ child, externalPid: undefined, generation: 2, spawnError: undefined })).toMatchObject({
    pid: child.pid, generation: 2, launchKind: "child", exitCode: 7,
    signal: null, exitStatusAvailable: true,
  });
});
it("retains an owned child's actual signal and refuses to infer LaunchServices status", async () => {
  const child = spawn(process.execPath, ["-e", "setInterval(() => {}, 1000)"], { stdio: "ignore" });
  const exited = once(child, "exit");
  child.kill("SIGTERM");
  await exited;
  expect(observeJourneyProcess({ child, externalPid: undefined, generation: 3, spawnError: undefined })).toMatchObject({
    pid: child.pid, exitCode: null, signal: "SIGTERM", exitStatusAvailable: true,
  });
  expect(observeJourneyProcess({ child, externalPid: 100, generation: 4, spawnError: undefined })).toMatchObject({
    pid: 100, generation: 4, launchKind: "launch-services", exitCode: null,
    signal: null, exitStatusAvailable: false,
  });
});
