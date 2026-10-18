import { CodingProcessLedger } from "./coding-process-ledger.js";
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
    const result = await execute("/bin/ps", ["-p", String(pid), "-o", "lstart=", "-o", "pgid="], {
      encoding: "utf8",
    });
    return result.stdout.trim() || undefined;
  } catch (error) {
    if (typeof (error as NodeJS.ErrnoException).code === "number") return undefined;
    throw error;
  }
}

async function processHasMarker(pid: number, processId: string): Promise<boolean> {
  try {
    const result = await execute("/bin/ps", ["-p", String(pid), "-o", "command="], { encoding: "utf8" });
    return result.stdout.includes(`aux-process:${processId}`);
  } catch (error) {
    if (typeof (error as NodeJS.ErrnoException).code === "number") return false;
    throw error;
  }
}

/** Inventory witnesses absence; it never grants authority over a numeric PGID. */
async function retireProcessGroup(pid: number, signalOriginal: () => void): Promise<void> {
  const deadline = Date.now() + 2000;
  while (true) {
    // The closure can signal only its actual still-live ChildProcess, not a
    // reconstructed group after its leader was reaped.
    signalOriginal();
    const { stdout } = await execute("/bin/ps", ["-A", "-o", "pid=,pgid=,uid="], {
      timeout: 2000,
      maxBuffer: 4 * 1024 * 1024,
      encoding: "utf8",
    });
    let present = false;
    for (const line of stdout.split("\n")) {
      if (!line.trim()) continue;
      const fields = line.trim().split(/\s+/).map(Number);
      if (fields.length !== 3 || fields.some((value) => !Number.isSafeInteger(value) || value < 0))
        throw new AuxError("operation_uncertain", "Original process-group inventory is invalid.");
      present ||= fields[1] === pid;
    }
    if (!present) return;
    if (Date.now() >= deadline)
      throw new AuxError("operation_uncertain", "Original process-group termination is not acknowledged.");
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
}

/** Process ownership is an execution receipt, never permission to replay a command. */
export class CodingProcesses extends CodingProcessLedger {
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
    super(options.repo);
    this.ready = this.recover();
  }
  async authorizeAccess(
    operation: "status" | "logs" | "stop" | "reconcile",
    processId: string,
    context: CodingProcessContext,
  ): Promise<() => void> {
    await this.ready;
    this.check(context);
    this.assertLocal(this.status(processId, context.runId));
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
    this.assertLocal(receipt);
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
      this.assertLocal(existing);
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
      `IFS= read -r _aux_ready || exit 125\n[ "$_aux_ready" = "${processId}" ] || exit 125\n${input.command}\n_aux_status=$?\nexit "$_aux_status"`,
      `aux-process:${processId}`,
    ];
    const child = spawn(prepared.file, args, {
      cwd: prepared.options.cwd,
      env: prepared.options.env,
      detached: true,
      stdio: ["pipe", "pipe", "pipe"],
    });
    child.stdin?.on("error", () => {});
    let bytes = 0;
    let writing: Promise<unknown> = Promise.resolve();
    let logError: unknown;
    let launchError: Error | undefined;
    let childExited = false;
    let stopRequested = false;
    let workJoined = false;
    let attemptFailed = false;
    let completion: Promise<void> | undefined;
    let closingLog: Promise<void> | undefined;
    const makeWaiter = () => {
      let resolve!: () => void;
      let reject!: (error: unknown) => void;
      const promise = new Promise<void>((yes, no) => {
        resolve = yes;
        reject = no;
      });
      void promise.catch(() => {});
      return { promise, resolve, reject };
    };
    let waiter = makeWaiter();
    let resolveClosed!: () => void;
    const closed = new Promise<void>((resolve) => {
      resolveClosed = resolve;
    });
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
            beginRetirement();
          });
    };
    child.stdout?.on("data", (chunk: Buffer) => recordOutput("stdout", chunk));
    child.stderr?.on("data", (chunk: Buffer) => recordOutput("stderr", chunk));
    const saveFromCallback = () => {
      try {
        this.save(receipt);
      } catch (error) {
        logError ??= error;
      }
    };
    const signalOriginal = () => {
      if (!child.pid || childExited || child.exitCode !== null || child.signalCode !== null) return;
      try {
        process.kill(-child.pid, "SIGKILL");
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ESRCH") {
          receipt.state = "uncertain";
          saveFromCallback();
        }
      }
    };
    const joinLog = () => (closingLog ??= writing.then(() => log.close()));
    const waitClosed = async () => {
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        await Promise.race([
          closed,
          new Promise<never>((_resolve, reject) => {
            timer = setTimeout(
              () =>
                reject(
                  new AuxError(
                    "operation_uncertain",
                    "Original process pipes have not acknowledged closure.",
                  ),
                ),
              2000,
            );
          }),
        ]);
      } finally {
        clearTimeout(timer);
      }
    };
    const beginRetirement = () => {
      if (completion) return;
      const originalWaiter = waiter;
      // Publish the one original attempt before callbacks/signals can reenter.
      completion = Promise.resolve()
        .then(async () => {
          if (child.pid) await retireProcessGroup(child.pid, signalOriginal);
          await waitClosed();
          await joinLog();
          workJoined = true;
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
            } finally {
              await file.close();
            }
          }
          // A Stop during asynchronous artifact work remains uncertain until all
          // original work joins; terminal publication uses the latest stop intent.
          receipt.state = stopRequested ? "stopped" : receipt.exitCode === 0 ? "completed" : "failed";
          this.save(receipt);
          this.owned.delete(processId);
        })
        .then(originalWaiter.resolve, (error: unknown) => {
          clearInterval(monitor);
          attemptFailed = !workJoined;
          receipt.state = workJoined ? "failed" : "uncertain";
          if (workJoined) this.owned.delete(processId);
          let failure = error;
          try {
            this.save(receipt);
          } catch (saveError) {
            failure = new AggregateError(
              [error, saveError],
              "Original process cleanup and receipt publication failed.",
            );
          }
          originalWaiter.reject(failure);
        });
    };
    const abort = () => {
      stopRequested = true;
      receipt.state = "uncertain";
      saveFromCallback();
      beginRetirement();
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
    child.once("error", (error) => {
      launchError = error;
      receipt.state = "failed";
      saveFromCallback();
    });
    child.once("exit", () => {
      childExited = true;
      clearInterval(monitor);
      // Descendants may still hold pipes. Start bounded absence verification
      // now, independently of the later ChildProcess close event.
      beginRetirement();
    });
    child.once("close", (exitCode, signal) => {
      childExited = true;
      clearInterval(monitor);
      context.signal?.removeEventListener("abort", abort);
      receipt.exitCode = exitCode;
      receipt.signal = signal;
      receipt.endedAt = Date.now();
      receipt.stdout = output.stdout;
      receipt.stderr = output.stderr;
      receipt.outputTruncated = outputTruncated;
      resolveClosed();
      // Even after a refused attempt, the actual pipe owner closes its log.
      void joinLog().catch((error) => {
        logError ??= error;
      });
      beginRetirement();
    });
    this.owned.set(processId, {
      runId: context.runId,
      get stopped() {
        return waiter.promise;
      },
      stop: (reason) => {
        if (reason === "timeout") receipt.timedOut = true;
        if (attemptFailed) {
          attemptFailed = false;
          completion = undefined;
          waiter = makeWaiter();
        }
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
      if (!receipt.identity)
        throw new AuxError(
          "backend_unavailable",
          "Process ownership could not be recorded before command release.",
        );
      if (receipt.state === "starting") receipt.state = "running";
      this.save(receipt);
      this.check(context);
      prepared.check();
      checkAuthority?.();
      admissionFence?.();
      child.stdin?.end(`${processId}\n`);
      return receipt;
    } catch (error) {
      abort();
      await waiter.promise;
      throw error;
    }
  }
  async logs(
    processId: string,
    runId: string,
    cursor = 0,
  ): Promise<{ text: string; cursor: number; truncated: boolean }> {
    const receipt = this.status(processId, runId);
    this.assertLocal(receipt);
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
  ): Promise<
    BashSeatbeltResult & {
      processId: string;
      artifactId?: string;
      command: string;
      workdir: string;
      state: CodingProcessReceipt["state"];
      signal?: string | null;
    }
  > {
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
      command: current.command,
      workdir: current.workdir,
      state: current.state,
      signal: current.signal,
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
    this.assertLocal(this.status(processId, runId));
    const owned = this.owned.get(processId);
    if (owned) {
      owned.stop();
      await owned.stopped;
    }
    const receipt = this.status(processId, runId);
    if (["starting", "running", "uncertain"].includes(receipt.state))
      throw new AuxError("operation_uncertain", "Original process termination has not been reconciled.");
    return receipt;
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
  private assertLocal(
    receipt: CodingProcessReceipt,
  ): asserts receipt is CodingProcessReceipt & { logPath: string } {
    if (receipt.execution || !receipt.logPath)
      throw new AuxError("ref_stale", "This process belongs to its original cloud session.");
  }
  private check(context: CodingProcessContext): void {
    if (this.closed || context.signal?.aborted) throw new AuxError("cancelled", "Process execution stopped.");
    this.options.checkOwner(context);
  }
  private retainRecoveredDebt(receipt: CodingProcessReceipt, pid: number): void {
    const original = JSON.stringify(receipt);
    const check = () => {
      const row = this.options.repo.db
        .prepare("SELECT process_id,receipt FROM coding_process_receipts WHERE process_id=? AND run_id=?")
        .get(receipt.processId, receipt.runId) as { process_id: string; receipt: string } | undefined;
      if (!row || JSON.stringify(this.decode(row)) !== original)
        throw new AuxError("operation_uncertain", "Original recovered process receipt changed.");
    };
    let stopped: Promise<void> = Promise.reject(
      new AuxError("operation_uncertain", "Original recovered process retirement is not acknowledged."),
    );
    void stopped.catch(() => {});
    let attempt: Promise<void> | undefined;
    this.owned.set(receipt.processId, {
      runId: receipt.runId,
      get stopped() {
        return stopped;
      },
      stop: () => {
        if (attempt) return;
        // There is no live ChildProcess authority after recovery. An explicit
        // retry can witness absence only; it must never signal a numeric PGID.
        stopped = attempt = Promise.resolve()
          .then(async () => {
            check();
            await retireProcessGroup(pid, () => {});
            check();
            this.assertLocal(receipt);
            const log = await open(receipt.logPath, "r");
            let digest: string;
            try {
              digest = createHash("sha256")
                .update(await log.readFile())
                .digest("hex");
            } finally {
              await log.close();
            }
            check();
            const retired = {
              ...receipt,
              state: "interrupted" as const,
              logDigest: digest,
              reconciledAt: Date.now(),
              endedAt: receipt.endedAt ?? Date.now(),
            };
            this.save(retired);
            this.owned.delete(receipt.processId);
          })
          .finally(() => {
            attempt = undefined;
          });
        void stopped.catch(() => {});
      },
    });
  }
  private async recover(): Promise<void> {
    const rows = this.options.repo.db
      .prepare(
        "SELECT process_id,receipt FROM coding_process_receipts WHERE state IN ('starting','running','uncertain')",
      )
      .all() as unknown as { process_id: string; receipt: string }[];
    for (const row of rows) {
      const receipt = this.decode(row);
      if (receipt.execution) continue;
      if (!["starting", "running", "uncertain"].includes(receipt.state)) continue;
      let pid = receipt.pid;
      const actual = pid ? await processIdentity(pid) : undefined;
      const matchesRecorded = !!actual && !!receipt.identity && actual === receipt.identity;
      if (receipt.state === "uncertain") {
        if (pid) {
          // Only the existing exact known live leader check can justify one
          // initial recovery signal. Every later attempt is absence-only,
          // including when that leader has already gone but its group remains.
          if (matchesRecorded && (await processIdentity(pid)) === receipt.identity) {
            try {
              process.kill(-pid, "SIGKILL");
            } catch (error) {
              if (!["ESRCH", "EPERM"].includes((error as NodeJS.ErrnoException).code ?? "")) throw error;
            }
          }
          this.retainRecoveredDebt(receipt, pid);
        }
        continue;
      }
      if (!matchesRecorded && (!pid || !(await processHasMarker(pid, receipt.processId)))) {
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
          : await processHasMarker(pid, receipt.processId))
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
        const remaining = await processIdentity(pid);
        if (remaining && (remaining === receipt.identity || (await processHasMarker(pid, receipt.processId))))
          throw new AuxError("backend_unavailable", "Recovered process termination is not acknowledged.");
      }
      receipt.state = "uncertain";
      receipt.endedAt = Date.now();
      this.save(receipt);
    }
  }
}
