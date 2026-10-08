import { mkdtempSync, mkdirSync, realpathSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it } from "vitest";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { openDb } from "../../apps/runtime/dist/store/db.js";
import { Repo } from "../../apps/runtime/dist/store/repo.js";
import { CodingProcesses } from "../../apps/runtime/dist/services/coding-processes.js";
import { BashSeatbelt } from "../../apps/runtime/dist/agent/loop/bash.js";
import { fixtureFilesystemPolicy } from "../fixtures/filesystem-policy.js";

const cleanup: (() => Promise<void>)[] = [];
afterEach(async () => {
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
