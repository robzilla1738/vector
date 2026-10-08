import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import type { ReplHostDeps } from "../../apps/runtime/dist/agent/loop/repl.js";
import { CLOUD_PROCESS_HEADER } from "../../apps/runtime/dist/services/cloud-process-worker.js";
import { afterEach, expect, it, vi } from "vitest";
import { AuxError, type CloudResourceQuote } from "@aux/contracts";
import { openDb, Repo, RunFundingService, resourceFundingAccounting } from "@aux/runtime";
import { VercelSandboxExecutor } from "../../apps/runtime/dist/services/vercel-sandbox-executor.js";
type Create = NonNullable<ConstructorParameters<typeof VercelSandboxExecutor>[0]["create"]>;
type Sandbox = Awaited<ReturnType<Create>>;
type Session = ReturnType<Sandbox["currentSession"]>;
const cleanup: (() => void)[] = [];
afterEach(() => {
  vi.useRealTimers();
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
it("keeps human Preview on the retained Session after dispatch pauses and preserves network cleanup", async () => {
  vi.useFakeTimers();
  const f = fixture();
  const token = randomUUID();
  let agentLive = true,
    nativeLive = true;
  const assertOwner = vi.fn(async () => {
    if (!agentLive) throw new AuxError("cancelled", "Run dispatch paused.");
  });
  const authorizePreview = vi.fn(async () => () => {});
  let complete!: (value: { exitCode: number }) => void;
  const finished = new Promise<{ exitCode: number }>((resolve) => {
    complete = resolve;
  });
  let processId = "";
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
      yield {
        stream: "stdout",
        data:
          CLOUD_PROCESS_HEADER +
          JSON.stringify({
            processId,
            sessionId: "original-session",
            supervisor: { pid: 10, startTicks: "1", groupPid: 11, groupStartTicks: "2" },
          }) +
          "\nready\n",
      };
      await finished;
    },
  };
  const dispatch = vi.fn(
    async (input: { detached?: boolean; args?: string[]; stdout?: { write(value: string): void } }) => {
      if (input.detached) {
        processId = JSON.parse(input.args!.at(-1)!).processId;
        return command;
      }
      if (input.args?.at(-1)?.includes('"kind":"listeners"'))
        input.stdout!.write(JSON.stringify([{ pid: 12, startTicks: "3", fd: 4, inode: "123", port: 3000 }]));
      return { exitCode: 0 };
    },
  );
  Object.assign(f.session, {
    domain: () => "https://original.vercel.run",
    mkDir: async () => {},
    runCommand: dispatch,
  });
  const executor = new VercelSandboxExecutor({
    ...f.deps,
    processWorkerProgram: async () => Buffer.from("// immutable process worker"),
    assertOwner,
    native: {
      turnSourceContext: async (value) => {
        if (!nativeLive || value !== token)
          throw new AuxError("permission_denied", "Native Preview source retired.");
        return { windowId: "original-window" } as never;
      },
      cloudPreview: async (binding) => ({
        previewId: binding.previewId,
        processId: binding.processId,
        url: binding.url,
        contentId: "native-content",
      }),
      cloudPreviewClose: async () => {
        f.order.push("native-preview-closed");
        return { closed: true };
      },
    },
    authorizePreview,
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
  expect(executor.retainedProcesses(f.ctx.runId)).toBe(processes);
  const sandbox = await f.create.mock.results[0]!.value;
  const ports = vi.fn(async (input: { ports: number[] }) => {
    f.order.push(`ports:${input.ports.join(",")}`);
  });
  Object.assign(sandbox, { update: ports });
  agentLive = false;
  assertOwner.mockClear();
  f.repo.saveRun({ ...f.repo.getRun(f.ctx.runId)!, status: "needs_input" });
  const preview = await executor.preview(f.ctx, { processId: receipt.processId, port: 3000 }, token);
  expect(await executor.admitPreview(preview.previewId, token)).toBe(true);
  expect(assertOwner).not.toHaveBeenCalled();
  expect(authorizePreview).toHaveBeenCalledWith(
    expect.anything(),
    f.ctx,
    expect.anything(),
    expect.anything(),
    token,
  );
  expect(f.create).toHaveBeenCalledOnce();
  nativeLive = false;
  expect(await executor.admitPreview(preview.previewId, token)).toBe(false);
  nativeLive = true;
  agentLive = true;
  expect(preview.url).toBe("https://original.vercel.run/");
  expect(ports).toHaveBeenCalledWith({ ports: [3000] }, expect.any(Object));
  await processes.stop(receipt.processId, f.ctx.runId);
  expect(f.order.slice(-2)).toEqual(["native-preview-closed", "ports:"]);
  await executor.bash({ command: "curl https://example.com", network: true }, f.ctx);
  expect(dispatch.mock.calls.filter(([input]) => input.detached)).toHaveLength(1);
  expect(f.order.filter((event) => event === "network-ack")).toHaveLength(2);
  expect(f.forbidden).not.toHaveBeenCalled();
  await executor.closeRun(f.ctx.runId);
  expect(executor.retainedProcesses(f.ctx.runId)).toBeUndefined();
});

async function retainedFileFixture() {
  const f = fixture();
  const envelopes = new Map<string, Record<string, unknown>>();
  const files = new Map<string, import("@aux/contracts/coding-files").CodingFileState>();
  const dispatches: string[] = [];
  let now = Date.now(),
    windowLive = true,
    beforeApply = () => {};
  Object.assign(f.session, {
    writeFiles: async (entries: { path: string; content: Buffer }[]) => {
      for (const entry of entries) {
        const request = JSON.parse(entry.content.toString());
        envelopes.set(entry.path, request);
        if (request.kind === "apply") beforeApply();
      }
    },
    runCommand: async (input: { args: string[]; stdout: { write(value: string): void } }) => {
      const request = envelopes.get(input.args.at(-2)!)!;
      dispatches.push(String(request.kind));
      let value: unknown = null;
      if (request.kind === "snapshots")
        value = (request.paths as string[]).map(
          (path) => files.get(path) ?? { path, version: null, content: null },
        );
      else if (request.kind === "apply") {
        for (const state of request.after as import("@aux/contracts/coding-files").CodingFileState[])
          files.set(state.path, state);
      } else throw new Error("Unexpected fixture request");
      input.stdout.write(JSON.stringify({ value }));
      return { exitCode: 0 };
    },
  });
  const assertOwner = vi.fn(async () => {});
  const verifyOwner = vi.fn(async () => {
    if (!windowLive) throw new AuxError("permission_denied", "The original native window retired.");
  });
  const get = vi.fn(() => {
    throw new Error("A retained file operation cannot look up or resume a VM.");
  });
  const executor = new VercelSandboxExecutor({
    ...f.deps,
    assertOwner,
    get,
    now: () => now,
    authorizeFiles: async () => () => {},
    authorizeProcess: async () => ({ network: false, check: () => {} }),
    authorizeProcessAccess: async () => () => {},
    workerAssets: async () => ({ program: Buffer.from("// reviewed REPL worker"), wasm: Buffer.alloc(1) }),
    fileWorkerProgram: async () => Buffer.from("// immutable reviewed program"),
  });
  const service = await executor.files(f.ctx);
  const path = "/vercel/sandbox/project/code.ts";
  const receipt = await service.applyChanges(
    { actionId: "write", changes: [{ kind: "create", path, content: "original edit" }] },
    { runId: f.ctx.runId },
  );
  assertOwner.mockRejectedValue(
    new AuxError("cancelled", "Run dispatch retired after budget, Needs Input or completion."),
  );
  const context = { runId: f.ctx.runId, actor: "user" as const, verifyOwner };
  return {
    ...f,
    executor,
    service,
    receipt,
    context,
    verifyOwner,
    assertOwner,
    get,
    files,
    path,
    dispatches,
    expire: () => {
      now += 120000;
    },
    beforeApply: (change: () => void) => {
      beforeApply = change;
    },
    retireWindow: () => {
      windowLive = false;
    },
  };
}

it("lets a person undo in the retained live Session after run authority retires, while agents stay stopped", async () => {
  const f = await retainedFileFixture();
  f.repo.saveRun({ ...f.repo.getRun(f.ctx.runId)!, status: "completed" });
  const retained = f.executor.retainedFiles(f.ctx.runId)!;
  expect(retained).toBe(f.service);
  await expect(
    retained.undo({ actionId: "agent-undo", receiptIds: [f.receipt.receiptId] }, { runId: f.ctx.runId }),
  ).rejects.toMatchObject({ code: "cancelled" });
  f.assertOwner.mockClear();
  const [undo] = await retained.undo(
    { actionId: "human-undo", receiptIds: [f.receipt.receiptId] },
    f.context,
  );
  expect(undo).toMatchObject({
    status: "confirmed",
    undoOf: f.receipt.receiptId,
    execution: f.receipt.execution,
  });
  expect(f.files.get(f.path)?.version).toBeNull();
  expect(f.assertOwner).not.toHaveBeenCalled();
  expect(f.verifyOwner).toHaveBeenCalled();
  expect(f.create).toHaveBeenCalledOnce();
  expect(f.get).not.toHaveBeenCalled();
  expect(f.forbidden).not.toHaveBeenCalled();
  await f.executor.closeRun(f.ctx.runId);
  expect(f.executor.retainedFiles(f.ctx.runId)).toBeUndefined();
});

it.each(["window", "session"] as const)(
  "rechecks the retained %s after Undo transport preparation",
  async (boundary) => {
    const f = await retainedFileFixture();
    f.beforeApply(() => {
      if (boundary === "window") f.retireWindow();
      else Object.assign(f.session, { sessionId: "replacement-session" });
    });
    const count = f.dispatches.filter((kind) => kind === "apply").length;
    await expect(
      f.service.undo({ actionId: "human-undo", receiptIds: [f.receipt.receiptId] }, f.context),
    ).rejects.toMatchObject({ code: "operation_uncertain" });
    expect(f.files.get(f.path)?.content).toBe("original edit");
    expect(f.dispatches.filter((kind) => kind === "apply")).toHaveLength(count);
    expect(f.service.changes(f.ctx.runId).at(-1)?.status).toBe("uncertain");
    expect(f.create).toHaveBeenCalledOnce();
    expect(f.get).not.toHaveBeenCalled();
    Object.assign(f.session, { sessionId: "original-session" });
    await f.executor.closeRun(f.ctx.runId);
  },
);

it("refuses missing native proof or an expired retained VM before creating an Undo receipt", async () => {
  const f = await retainedFileFixture(),
    count = f.dispatches.length;
  await expect(
    f.service.undo(
      { actionId: "missing-proof", receiptIds: [f.receipt.receiptId] },
      { runId: f.ctx.runId, actor: "user" },
    ),
  ).rejects.toMatchObject({ code: "permission_denied" });
  f.expire();
  await expect(
    f.service.undo({ actionId: "expired", receiptIds: [f.receipt.receiptId] }, f.context),
  ).rejects.toMatchObject({ code: "cancelled" });
  expect(f.dispatches).toHaveLength(count);
  expect(f.service.changes(f.ctx.runId)).toHaveLength(1);
  expect(f.files.get(f.path)?.content).toBe("original edit");
  expect(f.create).toHaveBeenCalledOnce();
  expect(f.get).not.toHaveBeenCalled();
  await f.executor.closeRun(f.ctx.runId);
});

it("routes cloud REPL file/process callbacks through their original governed backends and receipts", async () => {
  const f = await retainedFileFixture();
  f.assertOwner.mockResolvedValue();
  const processes = await f.executor.processes(f.ctx);
  const processId = randomUUID();
  const process = {
    processId,
    runId: f.ctx.runId,
    actionId: "earlier-command",
    requestHash: "hash",
    command: "build",
    workdir: f.receipt.execution!.root,
    startedAt: 1,
    state: "completed",
    undoAvailable: false,
    execution: { ...f.receipt.execution, commandId: "original-command" },
  };
  f.repo.db
    .prepare("INSERT INTO coding_process_receipts VALUES(?,?,?,?,?)")
    .run(processId, f.ctx.runId, process.actionId, process.state, JSON.stringify(process));
  const target = "/vercel/sandbox/project/from-repl.ts";
  const requests = [
    ["write_file", { path: target, content: "cloud content" }, 0],
    ["bg_status", { processId }, 1],
    ["write_file", { path: target, content: "cloud content" }, 0],
    ["write_file", { path: "/vercel/sandbox/project/denied.ts", content: "denied" }, 2],
  ];
  const transferred = new Map<string, Buffer>(),
    replies: { value?: unknown; error?: string }[] = [];
  const originalWrite = f.session.writeFiles.bind(f.session),
    originalCommand = f.session.runCommand.bind(f.session);
  let requestId = "",
    directory = "",
    sequence = 0;
  const publish = () => {
    transferred.set(
      `${directory}/rpc-${requestId}-${sequence}.json`,
      Buffer.from(
        JSON.stringify({ id: requestId, sequence, method: "codingTool", args: requests[sequence] }),
      ),
    );
  };
  Object.assign(f.session, {
    mkDir: async () => {},
    readFile: async ({ path }: { path: string }) =>
      transferred.has(path) ? Readable.from([transferred.get(path)!]) : null,
    writeFiles: async (files: { path: string; content: Buffer }[]) => {
      for (const file of files) {
        if (!file.path.includes("/.aux-repl-")) {
          await originalWrite([file]);
          continue;
        }
        transferred.set(file.path, file.content);
        if (file.path.includes("/request-") && file.path.endsWith(".payload")) {
          requestId = JSON.parse(file.content.toString()).id;
          directory = file.path.slice(0, file.path.lastIndexOf("/"));
          publish();
        }
        if (file.path.includes("/reply-") && file.path.endsWith(".payload"))
          replies.push(JSON.parse(file.content.toString()));
        if (file.path.includes("/reply-") && file.path.endsWith(".ready")) {
          if (++sequence < requests.length) publish();
          else
            transferred.set(
              `${directory}/result-${requestId}.json`,
              Buffer.from(JSON.stringify({ value: { output: "finished" } })),
            );
        }
      }
    },
    runCommand: async (input: Parameters<Session["runCommand"]>[0]) => {
      if (input.args?.[0]?.endsWith("/worker.mjs")) return { wait: () => new Promise(() => {}) };
      return originalCommand(input);
    },
  });
  const codingTool = vi.fn<NonNullable<ReplHostDeps["codingTool"]>>(async (name, raw, ordinal) => {
    if (name === "write_file") {
      const input = raw as { path: string; content: string };
      return {
        output: await f.service.applyChanges(
          { actionId: `repl:${ordinal}`, changes: [{ kind: "create", ...input }] },
          { runId: f.ctx.runId },
        ),
      };
    }
    if (name !== "bg_status") throw new Error("Unexpected coding callback");
    const fence = await processes.authorizeAccess("status", processId, {
      ...f.ctx,
      actionId: `repl:${ordinal}`,
    });
    const output = processes.status(processId, f.ctx.runId);
    fence();
    return { output };
  });
  const allowHostCall = vi.fn((name: string, params: string) => {
    expect(name).toBe("codingTool");
    if (JSON.parse(params)[1].path?.endsWith("/denied.ts"))
      throw new AuxError("permission_denied", "Profile denies this tool request.");
  });
  const result = await f.executor.eval(
    f.ctx,
    { runId: f.ctx.runId, codingTool, allowHostCall } as unknown as ReplHostDeps,
    "fs.writeFile('/vercel/sandbox/project/from-repl.ts','cloud content'); proc.status('original');",
  );
  expect(result).toEqual({ output: "finished" });
  expect(replies[0]).toMatchObject({
    value: { output: { status: "confirmed", execution: f.receipt.execution } },
  });
  expect(replies[1]).toMatchObject({
    value: { output: { processId, state: "completed", execution: process.execution } },
  });
  expect(replies[2]).toEqual(replies[0]);
  expect(replies[3]?.error).toContain("Profile denies");
  expect(codingTool).toHaveBeenCalledTimes(3);
  expect(allowHostCall).toHaveBeenCalledTimes(4);
  expect(f.files.get(target)?.content).toBe("cloud content");
  expect(f.service.changes(f.ctx.runId)).toHaveLength(2);
  expect(f.dispatches.filter((kind) => kind === "apply")).toHaveLength(2);
  expect(f.create).toHaveBeenCalledOnce();
  expect(f.get).not.toHaveBeenCalled();
  expect(f.forbidden).not.toHaveBeenCalled();
  await f.executor.closeRun(f.ctx.runId);
});
