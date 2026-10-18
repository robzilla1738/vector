import { mkdtempSync, mkdirSync, realpathSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it, vi } from "vitest";
import { execFile, spawn } from "node:child_process";
import { once } from "node:events";
import { createHash, randomUUID } from "node:crypto";
import { promisify } from "node:util";
import { openDb } from "../../apps/runtime/dist/store/db.js";
import { Repo } from "../../apps/runtime/dist/store/repo.js";
import { CodingProcesses } from "../../apps/runtime/dist/services/coding-processes.js";
import { BashSeatbelt } from "../../apps/runtime/dist/agent/loop/bash.js";
import { fixtureFilesystemPolicy } from "../fixtures/filesystem-policy.js";

const cleanup: (() => Promise<void>)[] = [];
afterEach(async () => {
  vi.restoreAllMocks();
  for (const dispose of cleanup.splice(0)) await dispose();
});
function fixture() {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "aux-processes-")));
  const project = join(root, "project");
  mkdirSync(project);
  const db = openDb(":memory:");
  const repo = new Repo(db);
  let admissions = 0;
  const service = new CodingProcesses({
    repo,
    directory: join(root, "logs"),
    seatbelt: new BashSeatbelt({
      filesystemPolicy: () => fixtureFilesystemPolicy([project]),
      scratchDir: project,
    }),
    authorize: async () => {
      admissions++;
    },
    checkOwner: () => {},
  });
  cleanup.push(async () => {
    await service.close();
    db.close();
    rmSync(root, { recursive: true, force: true });
  });
  return {
    service,
    repo,
    project,
    admissions: () => admissions,
    context: { runId: "run", threadId: "thread", turnId: "run", actionId: "command" },
  };
}
it.runIf(process.platform === "darwin")(
  "journals command execution and returns its original receipt without dispatching twice",
  async () => {
    const { service, project, context, admissions } = fixture();
    const input = { command: "echo once >> result.txt; echo complete", workdir: project, network: false };
    const first = await service.run(input, context);
    const second = await service.run(input, context);
    expect(first.exitCode).toBe(0);
    expect(second.processId).toBe(first.processId);
    expect(readFileSync(join(project, "result.txt"), "utf8")).toBe("once\n");
    expect(admissions()).toBe(1);
    await expect(service.start({ ...input, command: "echo different" }, context)).rejects.toMatchObject({
      code: "conflict",
    });
    const timeout = { command: "sleep 60", workdir: project, network: false, timeoutMs: 1000 };
    const timeoutContext = { ...context, actionId: "timeout" };
    const interrupted = await service.run(timeout, timeoutContext);
    expect(interrupted.timedOut).toBe(true);
    expect(interrupted).toMatchObject({
      command: "sleep 60",
      workdir: project,
      state: "stopped",
    });
    // The OS may acknowledge the killed shell before or after the Stop receipt.
    expect([null, 137]).toContain(interrupted.exitCode);
    expect(interrupted.exitCode === 137 || !!interrupted.signal).toBe(true);
    expect(await service.run(timeout, timeoutContext)).toEqual(interrupted);
  },
);
it.runIf(process.platform === "darwin")(
  "terminates an owned background process and preserves its log and cancellation receipt",
  async () => {
    const { service, repo, project, context } = fixture();
    const receipt = await service.start(
      { command: "echo started; sleep 60", workdir: project, network: false },
      context,
    );
    expect(receipt.pid).toBeGreaterThan(0);
    await expect
      .poll(async () => (await service.logs(receipt.processId, context.runId)).text)
      .toContain("started");
    const stopped = await service.stop(receipt.processId, context.runId);
    expect(stopped.state).toBe("stopped");
    expect(stopped.endedAt).toBeGreaterThanOrEqual(receipt.startedAt);
    expect((await service.logs(receipt.processId, context.runId)).text).toContain("started");
    await expect(service.stop(receipt.processId, "other")).rejects.toMatchObject({ code: "not_found" });
    // A restart can lose the exit callback while retaining the original PID and log.
    const lostOutcome = { ...stopped, state: "uncertain" };
    repo.db
      .prepare("UPDATE coding_process_receipts SET state='uncertain',receipt=? WHERE process_id=?")
      .run(
        repo.protectRecordField(
          "coding_process_receipts",
          [receipt.processId],
          "receipt",
          JSON.stringify(lostOutcome),
        ),
        receipt.processId,
      );
    await expect(service.stop(receipt.processId, context.runId)).rejects.toMatchObject({
      code: "operation_uncertain",
    });
    const reconciled = await service.reconcile(receipt.processId, { ...context, actionId: "reconcile" });
    expect(reconciled.state).toBe("interrupted");
    expect(reconciled.logDigest).toMatch(/^[a-f0-9]{64}$/);
    expect(reconciled.undoAvailable).toBe(false);
    expect(await service.reconcile(receipt.processId, { ...context, actionId: "reconcile" })).toEqual(
      reconciled,
    );
  },
);

it.runIf(process.platform === "darwin")(
  "records stable ownership before delayed exec and reaps the original group after restart",
  async () => {
    const { service, repo, project, context } = fixture();
    const receipt = await service.start(
      { command: "/bin/sleep 0.2; exec /bin/sleep 60", workdir: project, network: false },
      context,
    );
    const execute = promisify(execFile);
    await new Promise((resolve) => setTimeout(resolve, 300));
    const command = (
      await execute("/bin/ps", ["-p", String(receipt.pid), "-o", "command="], { encoding: "utf8" })
    ).stdout.trim();
    const stable = (
      await execute("/bin/ps", ["-p", String(receipt.pid), "-o", "lstart=", "-o", "pgid="], {
        encoding: "utf8",
      })
    ).stdout.trim();
    expect(command).not.toContain(`aux-process:${receipt.processId}`);
    expect(stable).toBe(receipt.identity);
    const recovered = new CodingProcesses({
      repo,
      directory: join(project, "recovery-logs"),
      seatbelt: new BashSeatbelt({
        filesystemPolicy: () => fixtureFilesystemPolicy([project]),
        scratchDir: project,
      }),
      authorize: async () => {},
      checkOwner: () => {},
    });
    try {
      await recovered.authorizeAccess("status", receipt.processId, context);
      expect(recovered.status(receipt.processId, context.runId).state).toBe("uncertain");
      expect(() => process.kill(receipt.pid!, 0)).toThrow();
    } finally {
      await recovered.close();
    }
  },
);

it.runIf(process.platform === "darwin")(
  "does not signal a reaped group or replay its command after its empty OS witness",
  async () => {
    const { service, project, context } = fixture();
    const release = join(project, "release");
    const input = {
      command: `while [ ! -f "${release}" ]; do /bin/sleep 0.02; done; echo once >> result.txt`,
      workdir: project,
      network: false,
    };
    const receipt = await service.start(input, context);
    const originalKill = process.kill.bind(process);
    let rejectedSignals = 0;
    const kill = vi.spyOn(process, "kill").mockImplementation((pid, signal) => {
      if (pid === -receipt.pid! && signal === "SIGKILL") {
        rejectedSignals++;
        throw Object.assign(new Error("reaped macOS process group"), { code: "EPERM" });
      }
      return originalKill(pid, signal);
    });
    try {
      const completed = service.run(input, context);
      writeFileSync(release, "release");
      const result = await completed;
      expect(result.state).toBe("completed");
      expect(result.exitCode).toBe(0);
      expect(rejectedSignals).toBe(0);
      expect(readFileSync(join(project, "result.txt"), "utf8")).toBe("once\n");
      expect((await service.run(input, context)).processId).toBe(receipt.processId);
      expect(readFileSync(join(project, "result.txt"), "utf8")).toBe("once\n");
    } finally {
      kill.mockRestore();
    }
  },
);

it.runIf(process.platform === "darwin").each(["redirected", "inherited"] as const)(
  "refuses unprovable post-reap members with %s pipes without signaling the numeric group",
  async (pipes) => {
    const { service, project, context, admissions } = fixture();
    const release = join(project, "release");
    const input = {
      command: `while [ ! -f "${release}" ]; do /bin/sleep 0.02; done; /bin/sleep 60 ${pipes === "redirected" ? "</dev/null >/dev/null 2>&1" : ""} & echo $! > descendant.pid; echo once >> result.txt`,
      workdir: project,
      network: false,
    };
    const receipt = await service.start(input, context);
    const originalKill = process.kill.bind(process);
    let rejectedSignals = 0;
    const kill = vi.spyOn(process, "kill").mockImplementation((pid, signal) => {
      if (pid === -receipt.pid! && signal === "SIGKILL") {
        rejectedSignals++;
        throw Object.assign(new Error("original group is still live"), { code: "EPERM" });
      }
      return originalKill(pid, signal);
    });
    try {
      // Attach rejection ownership before letting the actual detached leader exit.
      const completion = service.run(input, context).then(
        (value) => ({ value, error: undefined }),
        (error: unknown) => ({ value: undefined, error }),
      );
      writeFileSync(release, "release");
      const result = await completion;
      expect(result.error).toMatchObject({ code: "operation_uncertain" });
      expect(result.value).toBeUndefined();
      expect(rejectedSignals).toBe(0);
      expect(service.status(receipt.processId, context.runId).state).toBe("uncertain");
      const descendant = Number(readFileSync(join(project, "descendant.pid"), "utf8").trim());
      expect(descendant).toBeGreaterThan(0);
      expect(originalKill(descendant, 0)).toBe(true);
      await expect(service.reconcile(receipt.processId, context)).rejects.toThrow("still has owned work");
      await expect(service.start(input, context)).rejects.toMatchObject({ code: "operation_uncertain" });
      expect(admissions()).toBe(1);
      expect(readFileSync(join(project, "result.txt"), "utf8")).toBe("once\n");
    } finally {
      kill.mockRestore();
      // The test retires only its actual synthetic child; this is not a
      // runtime grant to signal a numeric group after its leader was reaped.
      const descendant = Number(readFileSync(join(project, "descendant.pid"), "utf8").trim());
      try {
        originalKill(descendant, "SIGKILL");
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ESRCH") throw error;
      }
      const retired = await service.stop(receipt.processId, context.runId);
      expect(retired.state).toBe("stopped");
    }
    expect(admissions()).toBe(1);
    expect(readFileSync(join(project, "result.txt"), "utf8")).toBe("once\n");
  },
);

it.runIf(process.platform === "darwin")(
  "bounds a denied live Stop without a terminal receipt or automatic signal retries",
  async () => {
    const { service, project, context } = fixture();
    const receipt = await service.start(
      { command: "echo started; /bin/sleep 60", workdir: project, network: false },
      context,
    );
    const originalKill = process.kill.bind(process);
    let deniedSignals = 0;
    const kill = vi.spyOn(process, "kill").mockImplementation((pid, signal) => {
      if (pid === -receipt.pid! && signal === "SIGKILL") {
        deniedSignals++;
        throw Object.assign(new Error("live original signal denied"), { code: "EPERM" });
      }
      return originalKill(pid, signal);
    });
    try {
      let settled = false;
      const stopping = service.stop(receipt.processId, context.runId).then(
        (value) => {
          settled = true;
          return { value, error: undefined };
        },
        (error: unknown) => {
          settled = true;
          return { value: undefined, error };
        },
      );
      await expect.poll(() => service.status(receipt.processId, context.runId).state).toBe("uncertain");
      expect(settled).toBe(false);
      expect(originalKill(receipt.pid!, 0)).toBe(true);
      const outcome = await stopping;
      expect(outcome.error).toMatchObject({ code: "operation_uncertain" });
      expect(outcome.value).toBeUndefined();
      expect(deniedSignals).toBeGreaterThan(0);
      const endedSignals = deniedSignals;
      await new Promise((resolve) => setTimeout(resolve, 300));
      expect(deniedSignals).toBe(endedSignals);
      expect(service.status(receipt.processId, context.runId).state).toBe("uncertain");
    } finally {
      kill.mockRestore();
      await service.stop(receipt.processId, context.runId);
    }
    expect(service.status(receipt.processId, context.runId).state).toBe("stopped");
  },
);

it.runIf(process.platform === "darwin").each(["denied", "delayed", "applied"] as const)(
  "keeps %s recovered retirement receipt-local and requires an empty original witness",
  async (mode) => {
    const { service, repo, project, context } = fixture();
    const independent = await service.run(
      { command: "echo unrelated", workdir: project, network: false },
      { ...context, actionId: "unrelated" },
    );
    const child = spawn("/bin/sleep", ["60"], { detached: true, stdio: "ignore" });
    const closed = once(child, "close");
    let fixtureChildRetired = false;
    cleanup.unshift(async () => {
      if (fixtureChildRetired) return;
      if (child.exitCode === null && child.signalCode === null) process.kill(-child.pid!, "SIGKILL");
      await closed;
      fixtureChildRetired = true;
    });
    await once(child, "spawn");
    const input = { command: "/bin/sleep 60", workdir: project, network: false };
    const processId = randomUUID();
    const logPath = join(project, "recovery-debt.log");
    const bytes = "original uncertain command, never replay\n";
    writeFileSync(logPath, bytes);
    const identity = (
      await promisify(execFile)("/bin/ps", ["-p", String(child.pid), "-o", "lstart=", "-o", "pgid="], {
        encoding: "utf8",
      })
    ).stdout.trim();
    const receipt = {
      processId,
      runId: context.runId,
      actionId: context.actionId,
      command: input.command,
      workdir: project,
      startedAt: Date.now(),
      state: "uncertain",
      logPath,
      undoAvailable: false,
      pid: child.pid,
      identity,
      requestHash: createHash("sha256").update(JSON.stringify(input)).digest("hex"),
    };
    repo.db
      .prepare(
        "INSERT INTO coding_process_receipts(process_id,run_id,action_id,state,receipt) VALUES(?,?,?,?,?)",
      )
      .run(
        processId,
        context.runId,
        context.actionId,
        "uncertain",
        repo.protectRecordField("coding_process_receipts", [processId], "receipt", JSON.stringify(receipt)),
      );
    const originalKill = process.kill.bind(process);
    let denied = 0;
    const kill = vi.spyOn(process, "kill").mockImplementation((pid, signal) => {
      if (pid === -child.pid! && signal === "SIGKILL") {
        denied++;
        if (mode === "denied")
          throw Object.assign(new Error("recovery retirement denied"), { code: "EPERM" });
        if (mode === "delayed") return true;
      }
      return originalKill(pid, signal);
    });
    const authorize = vi.fn(async () => {});
    const recovered = new CodingProcesses({
      repo,
      directory: join(project, "recovered-logs"),
      seatbelt: new BashSeatbelt({
        filesystemPolicy: () => fixtureFilesystemPolicy([project]),
        scratchDir: project,
      }),
      authorize,
      checkOwner: () => {},
    });
    try {
      await recovered.authorizeAccess("status", independent.processId, context);
      expect(recovered.status(independent.processId, context.runId).state).toBe("completed");
      expect(denied).toBe(1);
      expect(recovered.status(processId, context.runId).state).toBe("uncertain");
      await expect(recovered.start(input, context)).rejects.toMatchObject({ code: "operation_uncertain" });
      const concurrent = await Promise.allSettled([
        recovered.stop(processId, context.runId),
        recovered.closeRun(context.runId),
      ]);
      const expected = mode === "applied" ? "fulfilled" : "rejected";
      expect(concurrent.map((result) => result.status)).toEqual([expected, expected]);
      const closeOutcome = await recovered.close().then(
        () => "fulfilled",
        () => "rejected",
      );
      expect(closeOutcome).toBe(expected);
      expect(denied).toBe(1);
      expect(child.exitCode === null && child.signalCode === null).toBe(mode !== "applied");
      expect(recovered.status(processId, context.runId).state).toBe(
        mode === "applied" ? "interrupted" : "uncertain",
      );
      expect(authorize).not.toHaveBeenCalled();
    } finally {
      kill.mockRestore();
      // The fixture owns this actual ChildProcess. Recovery has no such handle.
      if (child.exitCode === null && child.signalCode === null) originalKill(-child.pid!, "SIGKILL");
      await closed;
      fixtureChildRetired = true;
      await recovered.stop(processId, context.runId);
      await recovered.close();
    }
    expect(recovered.status(processId, context.runId)).toMatchObject({
      state: "interrupted",
      logDigest: createHash("sha256").update(bytes).digest("hex"),
      undoAvailable: false,
    });
    expect(recovered.status(independent.processId, context.runId).state).toBe("completed");
    expect(readFileSync(logPath, "utf8")).toBe(bytes);
  },
);

it.runIf(process.platform === "darwin")(
  "retains absence-only recovered debt for an already-reaped leader with a surviving original child",
  async () => {
    const { repo, project, context } = fixture();
    const release = join(project, "release-orphan");
    const childPath = join(project, "orphan.pid");
    const leader = spawn(
      "/bin/bash",
      [
        "-c",
        `/bin/sleep 60 >/dev/null 2>&1 & echo $! > "${childPath}"; while [ ! -f "${release}" ]; do /bin/sleep 0.02; done`,
      ],
      { detached: true, stdio: "ignore" },
    );
    const closed = once(leader, "close");
    let fixtureFamilyRetired = false;
    cleanup.unshift(async () => {
      if (fixtureFamilyRetired) return;
      if (leader.exitCode === null && leader.signalCode === null) {
        process.kill(-leader.pid!, "SIGKILL");
      } else {
        // This fixed fixture writes its actual child before releasing its leader.
        const pid = Number(readFileSync(childPath, "utf8"));
        try {
          process.kill(pid, "SIGKILL");
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== "ESRCH") throw error;
        }
      }
      await closed;
      fixtureFamilyRetired = true;
    });
    await once(leader, "spawn");
    const identity = (
      await promisify(execFile)("/bin/ps", ["-p", String(leader.pid), "-o", "lstart=", "-o", "pgid="], {
        encoding: "utf8",
      })
    ).stdout.trim();
    const processId = randomUUID();
    const logPath = join(project, "orphan.log");
    writeFileSync(logPath, "historical orphan, no replay\n");
    const receipt = {
      processId,
      runId: context.runId,
      actionId: context.actionId,
      command: "original historical fixture",
      workdir: project,
      startedAt: Date.now(),
      state: "uncertain",
      logPath,
      undoAvailable: false,
      pid: leader.pid,
      identity,
    };
    repo.db
      .prepare(
        "INSERT INTO coding_process_receipts(process_id,run_id,action_id,state,receipt) VALUES(?,?,?,?,?)",
      )
      .run(
        processId,
        context.runId,
        context.actionId,
        "uncertain",
        repo.protectRecordField("coding_process_receipts", [processId], "receipt", JSON.stringify(receipt)),
      );
    await expect
      .poll(() => {
        try {
          return Number(readFileSync(childPath, "utf8"));
        } catch {
          return 0;
        }
      })
      .toBeGreaterThan(0);
    const descendant = Number(readFileSync(childPath, "utf8"));
    writeFileSync(release, "release");
    await closed;
    const originalKill = process.kill.bind(process);
    let forbidden = 0;
    const kill = vi.spyOn(process, "kill").mockImplementation((pid, signal) => {
      if (pid === -leader.pid! && signal === "SIGKILL") {
        forbidden++;
        throw Object.assign(new Error("no original live leader"), { code: "EPERM" });
      }
      return originalKill(pid, signal);
    });
    const recovered = new CodingProcesses({
      repo,
      directory: join(project, "orphan-recovered"),
      seatbelt: new BashSeatbelt({
        filesystemPolicy: () => fixtureFilesystemPolicy([project]),
        scratchDir: project,
      }),
      authorize: async () => {},
      checkOwner: () => {},
    });
    try {
      await recovered.authorizeAccess("status", processId, context);
      await expect(recovered.close()).rejects.toThrow("cleanup has not completed");
      expect(forbidden).toBe(0);
      expect(originalKill(descendant, 0)).toBe(true);
      expect(recovered.status(processId, context.runId).state).toBe("uncertain");
    } finally {
      kill.mockRestore();
      originalKill(descendant, "SIGKILL");
      fixtureFamilyRetired = true;
      await recovered.stop(processId, context.runId);
      await recovered.close();
    }
    expect(recovered.status(processId, context.runId)).toMatchObject({
      state: "interrupted",
      logDigest: createHash("sha256").update("historical orphan, no replay\n").digest("hex"),
    });
    expect(forbidden).toBe(0);
  },
);
