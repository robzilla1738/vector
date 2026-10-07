import { spawn, execFile } from "node:child_process";
import { promisify } from "node:util";
import { createHash, randomUUID } from "node:crypto";
import { mkdir, open } from "node:fs/promises";
import { join } from "node:path";
import { AuxError } from "@aux/contracts";
import type { BackgroundStart, CodingProcessReceipt } from "@aux/contracts/coding-processes";
import type { BashSeatbelt } from "../agent/loop/bash.js";
import type { Repo } from "../store/repo.js";
import type { ArtifactStore } from "./artifacts.js";
import type { BashSeatbeltInput, BashSeatbeltResult } from "../agent/loop/bash.js";
import { requireFilesystemPath } from "./filesystem-policy.js";

const execute = promisify(execFile);
const LOG_LIMIT = 8 * 1024 * 1024;
export interface CodingProcessContext {
  runId: string;
  threadId: string;
  turnId: string;
  actionId: string;
  signal?: AbortSignal;
}
type OwnedProcess = { runId: string; stopped: Promise<void>; stop: (reason?: "timeout") => void };

async function processIdentity(pid: number): Promise<string | undefined> {
  try {
    const result = await execute(
      "/bin/ps",
      ["-p", String(pid), "-o", "lstart=", "-o", "pgid=", "-o", "command="],
      { encoding: "utf8" },
    );
    return result.stdout.trim() || undefined;
  } catch (error) {
    if (typeof (error as NodeJS.ErrnoException).code === "number") return undefined;
    throw error;
  }
}

/** Process ownership is an execution receipt, never permission to replay a command. */
export class CodingProcesses {
  private readonly owned = new Map<string, OwnedProcess>();
  private readonly ready: Promise<void>;
  private closed = false;
  constructor(
    private readonly options: {
      repo: Repo;
      seatbelt: BashSeatbelt;
      directory: string;
      authorize(input: BackgroundStart, context: CodingProcessContext): Promise<void | (() => void)>;
      authorizeAccess?(
        operation: "status" | "logs" | "stop" | "reconcile",
        processId: string,
        context: CodingProcessContext,
      ): Promise<void | (() => void)>;
      checkOwner(context: CodingProcessContext): void;
      authorityFence?(context: CodingProcessContext): () => void;
      artifacts?: ArtifactStore;
    },
  ) {
    this.ready = this.recover();
  }
  private save(receipt: CodingProcessReceipt): void {
    const json = this.options.repo.protectRecordField(
      "coding_process_receipts",
      [receipt.processId],
      "receipt",
      JSON.stringify(receipt),
    );
    this.options.repo.db
      .prepare(
        "INSERT INTO coding_process_receipts(process_id,run_id,action_id,state,receipt) VALUES(?,?,?,?,?) ON CONFLICT(process_id) DO UPDATE SET state=excluded.state,receipt=excluded.receipt",
      )
      .run(receipt.processId, receipt.runId, receipt.actionId, receipt.state, json);
  }
  private decode(row: { process_id: string; receipt: string }): CodingProcessReceipt {
    return JSON.parse(
      this.options.repo.revealRecordField(
        "coding_process_receipts",
        [row.process_id],
        "receipt",
        row.receipt,
      ),
    ) as CodingProcessReceipt;
  }
  list(runId: string): CodingProcessReceipt[] {
    const rows = this.options.repo.db
      .prepare("SELECT process_id,receipt FROM coding_process_receipts WHERE run_id=? ORDER BY rowid")
      .all(runId) as unknown as { process_id: string; receipt: string }[];
    return rows.map((row) => this.decode(row));
  }
  recent(runId: string, limit = 12): CodingProcessReceipt[] {
    const rows = this.options.repo.db
      .prepare(
        "SELECT process_id,receipt FROM coding_process_receipts WHERE run_id=? ORDER BY rowid DESC LIMIT ?",
      )
      .all(runId, limit) as unknown as { process_id: string; receipt: string }[];
    return rows.reverse().map((row) => this.decode(row));
  }
  activity(runId: string): CodingProcessReceipt[] {
    const rows = this.options.repo.db
      .prepare(
        "SELECT process_id,receipt FROM coding_process_receipts WHERE run_id=? AND (state IN ('starting','running','uncertain') OR process_id IN (SELECT process_id FROM coding_process_receipts WHERE run_id=? ORDER BY rowid DESC LIMIT 12)) ORDER BY rowid",
      )
      .all(runId, runId) as unknown as { process_id: string; receipt: string }[];
    return rows.map((row) => this.decode(row));
  }
  unresolved(runId: string): CodingProcessReceipt[] {
    return this.withState(runId, ["starting", "uncertain"]);
  }
  interrupted(runId: string): CodingProcessReceipt[] {
    return this.withState(runId, ["interrupted"]);
  }
  private withState(runId: string, states: string[]): CodingProcessReceipt[] {
    const rows = this.options.repo.db
      .prepare(
        `SELECT process_id,receipt FROM coding_process_receipts WHERE run_id=? AND state IN (${states.map(() => "?").join(",")}) ORDER BY rowid`,
      )
      .all(runId, ...states) as unknown as { process_id: string; receipt: string }[];
    return rows.map((row) => this.decode(row));
  }
  receiptIds(runId: string): string[] {
    const rows = this.options.repo.db
      .prepare("SELECT process_id FROM coding_process_receipts WHERE run_id=? ORDER BY rowid")
      .all(runId) as unknown as { process_id: string }[];
    return rows.map((row) => row.process_id);
  }
  status(processId: string, runId: string): CodingProcessReceipt {
    const row = this.options.repo.db
      .prepare("SELECT process_id,receipt FROM coding_process_receipts WHERE process_id=? AND run_id=?")
      .get(processId, runId) as { process_id: string; receipt: string } | undefined;
    if (!row) throw new AuxError("not_found", "This process does not belong to the run.");
    return this.decode(row);
  }
  async authorizeAccess(
    operation: "status" | "logs" | "stop" | "reconcile",
    processId: string,
    context: CodingProcessContext,
  ): Promise<() => void> {
    await this.ready;
    this.check(context);
    this.status(processId, context.runId);
    const admission = await this.options.authorizeAccess?.(operation, processId, context);
    const authority = this.options.authorityFence?.(context);
    const check = () => {
      this.check(context);
      admission?.();
      authority?.();
    };
    check();
    return check;
  }
  async reconcile(processId: string, context: CodingProcessContext): Promise<CodingProcessReceipt> {
    const check = await this.authorizeAccess("reconcile", processId, context);
    const receipt = this.status(processId, context.runId);
    if (receipt.state !== "uncertain" && receipt.state !== "starting") return receipt;
    if (this.owned.has(processId))
      throw new AuxError("operation_uncertain", "The original command still has owned work to finish.");
    const processes = await execute("/bin/ps", ["-axo", "pid=,pgid=,command="], { encoding: "utf8" });
    check();
    const live = processes.stdout.split("\n").some((line) => {
      const match = line.trim().match(/^\d+\s+(\d+)\s/);
      return line.includes(`aux-process:${processId}`) || (receipt.pid && Number(match?.[1]) === receipt.pid);
    });
    if (live || !receipt.pid)
      throw new AuxError("operation_uncertain", "Original process termination cannot yet be verified.");
    const log = await open(receipt.logPath, "r");
    try {
      receipt.logDigest = createHash("sha256")
        .update(await log.readFile())
        .digest("hex");
    } finally {
      await log.close();
    }
    check();
    // Termination is observable; effects of an interrupted arbitrary command are not.
    receipt.state = "interrupted";
    receipt.reconciledAt = Date.now();
    receipt.endedAt ??= receipt.reconciledAt;
    this.save(receipt);
    return receipt;
  }
  async start(input: BackgroundStart, context: CodingProcessContext): Promise<CodingProcessReceipt> {
    await this.ready;
    this.check(context);
    const existingRow = this.options.repo.db
      .prepare("SELECT process_id,receipt FROM coding_process_receipts WHERE run_id=? AND action_id=?")
      .get(context.runId, context.actionId) as { process_id: string; receipt: string } | undefined;
    const existing = existingRow ? this.decode(existingRow) : undefined;
    if (existing) {
      const requestHash = createHash("sha256").update(JSON.stringify(input)).digest("hex");
      if (existing.requestHash !== requestHash)
        throw new AuxError("conflict", "The original command request changed; prepare a new action.");
      if (existing.state === "starting" || existing.state === "uncertain")
        throw new AuxError("operation_uncertain", "The original process launch has not been reconciled.");
      return existing;
    }
    const admissionFence = await this.options.authorize(input, context);
    const checkAuthority = this.options.authorityFence?.(context);
    const prepared = await this.options.seatbelt.prepare(input, context, "background_authorized");
    if ("park" in prepared) throw new AuxError("needs_input", prepared.park.instruction);
    this.check(context);
    const processId = randomUUID();
    const scratchDir = requireFilesystemPath(prepared.policy, prepared.options.env.TMPDIR, "write");
    await mkdir(scratchDir, { recursive: true, mode: 0o700 });
    await mkdir(this.options.directory, { recursive: true, mode: 0o700 });
    const logPath = join(this.options.directory, `${processId}.log`);
    const log = await open(logPath, "wx", 0o600);
    try {
      this.check(context);
      prepared.check();
      checkAuthority?.();
      admissionFence?.();
    } catch (error) {
      await log.close();
      throw error;
    }
    const receipt: CodingProcessReceipt = {
      processId,
      runId: context.runId,
      actionId: context.actionId,
      command: input.command,
      workdir: prepared.options.cwd,
      startedAt: Date.now(),
      state: "starting",
      logPath,
      undoAvailable: false,
      requestHash: createHash("sha256").update(JSON.stringify(input)).digest("hex"),
    };
    this.save(receipt);
    const args = [
      ...prepared.args.slice(0, -1),
      `${input.command}\n_aux_status=$?\nexit "$_aux_status"`,
      `aux-process:${processId}`,
    ];
    const child = spawn(prepared.file, args, {
      cwd: prepared.options.cwd,
      env: prepared.options.env,
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let bytes = 0;
    let writing: Promise<unknown> = Promise.resolve();
    let logError: unknown;
    let launchError: Error | undefined;
    const output = { stdout: "", stderr: "" };
    let outputTruncated = false;
    const recordOutput = (channel: "stdout" | "stderr", chunk: Buffer) => {
      const text = output[channel] + chunk.toString("utf8");
      const encoded = Buffer.from(text);
      outputTruncated ||= encoded.length > 65536;
      output[channel] =
        encoded.length > 65536
          ? encoded.subarray(0, 16384).toString("utf8") +
            "\n… output truncated …\n" +
            encoded.subarray(-32768).toString("utf8")
          : text;
      append(chunk);
    };
    const append = (chunk: Buffer) => {
      const clipped = chunk.subarray(0, Math.max(0, LOG_LIMIT - bytes));
      bytes += clipped.length;
      if (clipped.length)
        writing = writing
          .then(() => log.write(clipped))
          .catch((error) => {
            logError = error;
            kill();
          });
    };
    child.stdout?.on("data", (chunk: Buffer) => recordOutput("stdout", chunk));
    child.stderr?.on("data", (chunk: Buffer) => recordOutput("stderr", chunk));
    const kill = () => {
      if (!child.pid) return;
      try {
        process.kill(-child.pid, "SIGKILL");
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ESRCH") throw error;
      }
    };
    const abort = () => {
      receipt.state = "stopped";
      this.save(receipt);
      kill();
    };
    const monitor = setInterval(() => {
      try {
        this.check(context);
        prepared.check();
        checkAuthority?.();
        admissionFence?.();
      } catch {
        abort();
      }
    }, 250);
    monitor.unref();
    const stopped = new Promise<void>((resolve, reject) => {
      child.once("error", (error) => {
        launchError = error;
        receipt.state = "failed";
        this.save(receipt);
      });
      child.once("close", (exitCode, signal) => {
        clearInterval(monitor);
        // The leader can exit while its detached descendants are still running.
        kill();
        receipt.state = receipt.state === "stopped" ? "stopped" : exitCode === 0 ? "completed" : "failed";
        receipt.exitCode = exitCode;
        receipt.signal = signal;
        receipt.endedAt = Date.now();
        receipt.stdout = output.stdout;
        receipt.stderr = output.stderr;
        receipt.outputTruncated = outputTruncated;
        this.save(receipt);
        context.signal?.removeEventListener("abort", abort);
        void writing
          .then(async () => {
            await log.close();
            if (launchError) throw launchError;
            if (logError) throw logError;
            if (this.options.artifacts) {
              const file = await open(logPath, "r");
              try {
                const artifact = this.options.artifacts.save({
                  runId: context.runId,
                  label: `process-${processId}.log`,
                  mediaType: "text/plain",
                  buffer: await file.readFile(),
                });
                receipt.artifactId = artifact.artifactId;
                this.save(receipt);
              } finally {
                await file.close();
              }
            }
          })
          .then(
            () => {
              this.owned.delete(processId);
              resolve();
            },
            (error) => {
              receipt.state = "failed";
              this.save(receipt);
              this.owned.delete(processId);
              reject(error);
            },
          );
      });
    });
    // A background completion is retained for the caller even before it next waits.
    void stopped.catch(() => {});
    this.owned.set(processId, {
      runId: context.runId,
      stopped,
      stop: (reason) => {
        if (reason === "timeout") receipt.timedOut = true;
        abort();
      },
    });
    receipt.pid = child.pid;
    this.save(receipt);
    context.signal?.addEventListener("abort", abort, { once: true });
    try {
      await new Promise<void>((resolve, reject) => {
        child.once("spawn", resolve);
        child.once("error", reject);
      });
      receipt.pid = child.pid;
      receipt.identity = child.pid ? await processIdentity(child.pid) : undefined;
      if (receipt.state === "starting") receipt.state = "running";
      this.save(receipt);
      this.check(context);
      return receipt;
    } catch (error) {
      abort();
      await stopped;
      throw error;
    }
  }
  async logs(
    processId: string,
    runId: string,
    cursor = 0,
  ): Promise<{ text: string; cursor: number; truncated: boolean }> {
    const receipt = this.status(processId, runId);
    if (!Number.isSafeInteger(cursor) || cursor < 0)
      throw new AuxError("invalid_params", "Invalid log cursor.");
    const file = await open(receipt.logPath, "r");
    try {
      const buffer = Buffer.alloc(64 * 1024);
      const { bytesRead } = await file.read(buffer, 0, buffer.length, cursor);
      return {
        text: buffer.subarray(0, bytesRead).toString("utf8"),
        cursor: cursor + bytesRead,
        truncated: (await file.stat()).size >= LOG_LIMIT,
      };
    } finally {
      await file.close();
    }
  }
  async run(
    input: BashSeatbeltInput,
    context: CodingProcessContext,
  ): Promise<BashSeatbeltResult & { processId: string; artifactId?: string }> {
    const receipt = await this.start(
      { command: input.command, workdir: input.workdir, network: input.network },
      context,
    );
    const owned = this.owned.get(receipt.processId);
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (owned) {
      const timeout = Math.min(Math.max(1000, input.timeoutMs ?? 30000), 120000);
      timer = setTimeout(() => {
        owned.stop("timeout");
      }, timeout);
      try {
        await owned.stopped;
      } finally {
        clearTimeout(timer);
      }
    }
    const current = this.status(receipt.processId, context.runId);
    const logs = await this.logs(receipt.processId, context.runId);
    return {
      stdout: current.stdout ?? "",
      stderr: current.stderr ?? "",
      exitCode: current.exitCode ?? null,
      timedOut: current.timedOut === true,
      truncated: logs.truncated || current.outputTruncated === true,
      processId: current.processId,
      artifactId: current.artifactId,
    };
  }
  async stop(processId: string, runId: string): Promise<CodingProcessReceipt> {
    await this.ready;
    this.status(processId, runId);
    const owned = this.owned.get(processId);
    if (owned) {
      owned.stop();
      await owned.stopped;
    }
    return this.status(processId, runId);
  }
  async closeRun(runId: string): Promise<void> {
    await this.ready;
    const results = await Promise.allSettled(
      [...this.owned.entries()]
        .filter(([, owned]) => owned.runId === runId)
        .map(([processId]) => this.stop(processId, runId)),
    );
    const errors = results.flatMap((result) => (result.status === "rejected" ? [result.reason] : []));
    if (errors.length) throw new AggregateError(errors, "Owned processes have not acknowledged termination.");
  }
  async close(): Promise<void> {
    this.closed = true;
    await this.ready;
    const results = await Promise.allSettled(
      [...this.owned.values()].map(async (owned) => {
        owned.stop();
        await owned.stopped;
      }),
    );
    const errors = results.flatMap((result) => (result.status === "rejected" ? [result.reason] : []));
    if (errors.length) throw new AggregateError(errors, "Process cleanup has not completed.");
  }
  private check(context: CodingProcessContext): void {
    if (this.closed || context.signal?.aborted) throw new AuxError("cancelled", "Process execution stopped.");
    this.options.checkOwner(context);
  }
  private async recover(): Promise<void> {
    const rows = this.options.repo.db
      .prepare("SELECT process_id,receipt FROM coding_process_receipts")
      .all() as unknown as { process_id: string; receipt: string }[];
    for (const row of rows) {
      const receipt = this.decode(row);
      if (!["starting", "running"].includes(receipt.state)) continue;
      let pid = receipt.pid;
      const actual = pid ? await processIdentity(pid) : undefined;
      if (!actual || !actual.includes(`aux-process:${receipt.processId}`)) {
        const result = await execute("/bin/ps", ["-axo", "pid=,pgid=,command="], { encoding: "utf8" });
        const line = result.stdout
          .split("\n")
          .find((value) => value.includes(`aux-process:${receipt.processId}`));
        const ids = line?.trim().match(/^(\d+)\s+(\d+)\s/);
        pid = ids && ids[1] === ids[2] ? Number(ids[1]) : undefined;
      }
      if (
        pid &&
        (receipt.identity
          ? (await processIdentity(pid)) === receipt.identity
          : (await processIdentity(pid))?.includes(`aux-process:${receipt.processId}`))
      ) {
        try {
          process.kill(-pid, "SIGKILL");
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== "ESRCH") throw error;
        }
        for (let attempt = 0; attempt < 100; attempt++) {
          if (!(await processIdentity(pid))) break;
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
        if ((await processIdentity(pid))?.includes(`aux-process:${receipt.processId}`))
          throw new AuxError("backend_unavailable", "Recovered process termination is not acknowledged.");
      }
      receipt.state = "uncertain";
      receipt.endedAt = Date.now();
      this.save(receipt);
    }
  }
}
