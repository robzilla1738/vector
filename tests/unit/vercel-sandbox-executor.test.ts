import { afterEach, expect, it, vi } from "vitest";
import { AuxError, type CloudResourceQuote } from "@aux/contracts";
import { openDb, Repo, RunFundingService, resourceFundingAccounting } from "@aux/runtime";
import { VercelSandboxExecutor } from "../../apps/runtime/dist/services/vercel-sandbox-executor.js";
type Create = NonNullable<ConstructorParameters<typeof VercelSandboxExecutor>[0]["create"]>;
type Sandbox = Awaited<ReturnType<Create>>;
type Session = ReturnType<Sandbox["currentSession"]>;
const cleanup: (() => void)[] = [];
afterEach(() => {
  for (const close of cleanup.splice(0)) close();
});
function fixture() {
  const db = openDb(":memory:");
  cleanup.push(() => db.close());
  const repo = new Repo(db);
  const ctx = { runId: "cloud-run", threadId: "chat", turnId: "cloud-run" };
  repo.saveRun({
    runId: ctx.runId,
    goal: "Inspect the cloud workspace",
    pageIds: [],
    status: "running",
    createdAt: Date.now(),
    config: { chatId: "chat", executionTarget: "cloud" },
  });
  const quote: CloudResourceQuote = {
    revision: 1,
    accountDigest: "a".repeat(64),
    region: "iad1",
    vcpus: 2,
    timeoutMs: 60000,
    rateBasis: "account-contract",
    rateSource: "https://vercel.com/docs/sandbox/pricing",
    rates: { cpuUsdPerCoreHour: 1, memoryUsdPerGBHour: 1, outboundUsdPerGB: 1, creationUsd: 1 },
  };
  const order: string[] = [];
  const update = vi.fn(async () => {
    order.push("network-ack");
  });
  const runCommand = vi.fn(async () => {
    order.push("command");
    return { exitCode: 0, durationMs: 2 };
  });
  const final = {
    id: "original-session",
    status: "stopped",
    stoppedAt: Date.now(),
    activeCpuDurationMs: 3600000,
    duration: 60000,
    memory: 1024,
    region: quote.region,
    vcpus: quote.vcpus,
    networkTransfer: { ingress: 9e9, egress: 1e9 },
  };
  const stop = vi.fn(async () => ({ session: final }));
  // Protocol-faithful SDK seam: only these original public Session methods may dispatch.
  const session = {
    sessionId: "original-session",
    region: quote.region,
    vcpus: quote.vcpus,
    timeout: quote.timeoutMs,
    sourceSnapshotId: undefined,
    update,
    runCommand,
    stop,
  } as unknown as Session;
  const forbidden = vi.fn(() => {
    throw new Error("Sandbox autoResume method used");
  });
  const create = vi.fn(async (input: Parameters<Create>[0]) => {
    if (!input?.name) throw new Error("Fixture requires the actual reviewed SDK name");
    return {
      name: input.name,
      persistent: false,
      expiresAt: new Date(Date.now() + quote.timeoutMs),
      currentSession: () => session,
      runCommand: forbidden,
      stop: forbidden,
    } as unknown as Sandbox;
  });
  const authorizeCreate = vi.fn(async () => {});
  const deps = {
    repo,
    configuration: async () => ({
      token: "fixture-no-account-call",
      teamId: "team_fixture",
      projectId: "project_fixture",
      quote,
    }),
    funding: new RunFundingService(repo, resourceFundingAccounting(repo)),
    assertOwner: async () => {},
    assertOriginal: async () => {},
    resourceScopes: () => [],
    pauseForResourceFunding: vi.fn(async () => {}),
    authorizeCreate,
    authorizeBash: async () => false,
    create,
  };
  return { ctx, repo, create, stop, forbidden, order, authorizeCreate, deps, session, runCommand };
}
it("retires a provably unsent money park and admits the fresh original attempt", async () => {
  const f = fixture();
  f.authorizeCreate.mockRejectedValueOnce(new AuxError("needs_input", "Original money approval parked."));
  const executor = new VercelSandboxExecutor(f.deps);
  await expect(executor.bash({ command: "printf ready", network: false }, f.ctx)).rejects.toMatchObject({
    code: "needs_input",
  });
  expect(f.create).not.toHaveBeenCalled();
  expect(f.repo.db.prepare("SELECT state,started_at FROM execution_resources").get()).toMatchObject({
    state: "cancelled",
    started_at: null,
  });
  await expect(executor.bash({ command: "printf ready", network: false }, f.ctx)).resolves.toMatchObject({
    exitCode: 0,
  });
  expect(f.create).toHaveBeenCalledTimes(1);
  expect(f.authorizeCreate).toHaveBeenCalledTimes(2);
  await executor.close();
  expect(f.stop).toHaveBeenCalledTimes(1);
});
it("uses the captured Session, waits for offline ACK and retries its exact stop receipt", async () => {
  const f = fixture(),
    executor = new VercelSandboxExecutor(f.deps);
  await executor.bash({ command: "printf local", network: false }, f.ctx);
  expect(f.order).toEqual(["network-ack", "command"]);
  expect(f.forbidden).not.toHaveBeenCalled();
  f.stop.mockRejectedValueOnce(new Error("Original stop ACK unavailable"));
  await expect(executor.closeRun(f.ctx.runId)).rejects.toThrow("stop ACK unavailable");
  expect(f.repo.db.prepare("SELECT state,stop_ack FROM execution_resources").get()).toMatchObject({
    state: "running",
    stop_ack: 0,
  });
  await executor.closeRun(f.ctx.runId);
  expect(f.create).toHaveBeenCalledTimes(1);
  expect(f.stop).toHaveBeenCalledTimes(2);
  const row = f.repo.db
    .prepare("SELECT state,session_id,cost_usd,cost_estimated,stop_ack FROM execution_resources")
    .get();
  expect(row).toMatchObject({
    state: "settled",
    session_id: "original-session",
    cost_estimated: 0,
    stop_ack: 1,
  });
  expect(row?.cost_usd).toBeCloseTo(3 + 1 / 60); // Free internet ingress does not become billable outgoing traffic.
});
it("parks finite ordinary caps before consuming money approval or creating a VM", async () => {
  const f = fixture(),
    executor = new VercelSandboxExecutor({
      ...f.deps,
      resourceScopes: () => [{ scope: "run" as const, limitUsd: 5 }],
    });
  await expect(
    executor.bash({ command: "printf not-dispatched", network: false }, f.ctx),
  ).rejects.toMatchObject({ code: "cancelled" });
  expect(f.deps.pauseForResourceFunding).toHaveBeenCalledOnce();
  expect(f.authorizeCreate).not.toHaveBeenCalled();
  expect(f.create).not.toHaveBeenCalled();
  expect(f.repo.db.prepare("SELECT count(*) AS n FROM execution_resources").get()?.n).toBe(0);
});

it("reconciles the persisted original VM after executor restart without creating or resuming another session", async () => {
  const f = fixture();
  const original = new VercelSandboxExecutor(f.deps);
  await original.bash({ command: "printf local", network: false }, f.ctx);
  const sandbox = await f.create.mock.results[0]!.value;
  const get = vi.fn(async () => sandbox);
  const recovered = new VercelSandboxExecutor({ ...f.deps, get });
  f.stop.mockRejectedValueOnce(new Error("Provider ACK unavailable"));
  await expect(recovered.closeRun(f.ctx.runId)).rejects.toThrow("ACK unavailable");
  expect(f.repo.db.prepare("SELECT state FROM execution_resources").get()?.state).toBe("running");
  await recovered.closeRun(f.ctx.runId);
  expect(get).toHaveBeenCalledWith(expect.objectContaining({ name: sandbox.name, resume: false }));
  expect(f.create).toHaveBeenCalledOnce();
  expect(f.forbidden).not.toHaveBeenCalled();
  expect(f.repo.db.prepare("SELECT state,stop_ack FROM execution_resources").get()).toMatchObject({
    state: "settled",
    stop_ack: 1,
  });
});

it("requires file governance before acquiring a paid VM", async () => {
  const f = fixture(),
    executor = new VercelSandboxExecutor(f.deps);
  await expect(executor.files(f.ctx)).rejects.toMatchObject({ code: "capability_unsupported" });
  expect(f.create).not.toHaveBeenCalled();
});
it("binds governed files to the captured Session and rechecks the effect fence after transport preparation", async () => {
  const f = fixture();
  const envelopes = new Map<string, Record<string, unknown>>();
  let retired = false;
  const calls: Record<string, unknown>[] = [];
  Object.assign(f.session, {
    writeFiles: async (files: { path: string; content: Buffer }[]) => {
      for (const file of files) {
        const request = JSON.parse(file.content.toString());
        envelopes.set(file.path, request);
        if (request.kind === "apply") retired = true;
      }
    },
    runCommand: async (input: { args: string[]; stdout: { write(value: string): void } }) => {
      const request = envelopes.get(input.args.at(-2)!)!;
      calls.push(request);
      expect(input.args.slice(0, 3)).toEqual(["--input-type=module", "-e", "// immutable reviewed program"]);
      const value =
        request.kind === "snapshots"
          ? (request.paths as string[]).map((path) => ({ path, version: null, content: null }))
          : null;
      input.stdout.write(JSON.stringify({ value }));
      return { exitCode: 0 };
    },
  });
  const authorizeFiles = vi.fn(async (..._args: unknown[]) => () => {
    if (retired) throw new AuxError("ref_stale", "Source retired");
  });
  const executor = new VercelSandboxExecutor({
    ...f.deps,
    authorizeFiles,
    fileWorkerProgram: async () => Buffer.from("// immutable reviewed program"),
  });
  const files = await executor.files(f.ctx);
  await expect(
    files.applyChanges(
      {
        actionId: "write",
        changes: [{ kind: "create", path: "/vercel/sandbox/project/code.ts", content: "new" }],
      },
      { runId: f.ctx.runId },
    ),
  ).rejects.toMatchObject({ code: "operation_uncertain" });
  expect(calls.map((call) => call.kind)).toEqual(["snapshots", "snapshots"]);
  expect(files.changes(f.ctx.runId)[0]).toMatchObject({
    status: "uncertain",
    execution: { sessionId: "original-session", backend: "cloud" },
  });
  expect(authorizeFiles.mock.calls[0]?.[2]).toMatchObject({
    backend: "cloud",
    sessionId: "original-session",
    root: "/vercel/sandbox/project",
  });
  expect(f.forbidden).not.toHaveBeenCalled();
  await executor.closeRun(f.ctx.runId);
});
it("keeps the VM network mode fixed until its original background command acknowledges exit", async () => {
  const f = fixture();
  let complete!: (value: { exitCode: number }) => void;
  const finished = new Promise<{ exitCode: number }>((resolve) => {
    complete = resolve;
  });
  const command = {
    cmdId: "original-command",
    cwd: "/vercel/sandbox/project",
    startedAt: Date.now(),
    exitCode: null,
    wait: () => finished,
    kill: vi.fn(async () => {
      complete({ exitCode: 143 });
    }),
    logs: async function* () {
      yield { stream: "stdout", data: "ready\n" };
      await finished;
    },
  };
  const dispatch = vi.fn(async (input: { detached?: boolean }) =>
    input.detached ? command : { exitCode: 0 },
  );
  Object.assign(f.session, { mkDir: async () => {}, runCommand: dispatch });
  const executor = new VercelSandboxExecutor({
    ...f.deps,
    authorizeBash: async () => true,
    authorizeProcess: async () => ({ network: false, check: () => {} }),
    authorizeProcessAccess: async () => () => {},
  });
  const processes = await executor.processes(f.ctx);
  const receipt = await processes.start(
    { command: "npm run dev", network: false },
    { ...f.ctx, actionId: "server" },
  );
  await expect(
    executor.bash({ command: "curl https://example.com", network: true }, f.ctx),
  ).rejects.toMatchObject({ code: "conflict" });
  expect(dispatch).toHaveBeenCalledTimes(1);
  expect(f.order.filter((event) => event === "network-ack")).toHaveLength(1);
  await processes.stop(receipt.processId, f.ctx.runId);
  await executor.bash({ command: "curl https://example.com", network: true }, f.ctx);
  expect(dispatch).toHaveBeenCalledTimes(2);
  expect(f.order.filter((event) => event === "network-ack")).toHaveLength(2);
  expect(f.forbidden).not.toHaveBeenCalled();
  await executor.closeRun(f.ctx.runId);
});
