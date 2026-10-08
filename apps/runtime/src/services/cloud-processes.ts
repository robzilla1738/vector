import { CLOUD_PROCESS_HEADER } from "./cloud-process-worker.js";
import { createHash, randomUUID } from "node:crypto";
import type { Command } from "@vercel/sandbox";
import { AuxError } from "@aux/contracts";
import {
  BackgroundStartSchema,
  CloudSupervisorSchema,
  type BackgroundStart,
  type CodingProcessReceipt,
} from "@aux/contracts/coding-processes";
import type { CloudCodingIdentity } from "@aux/contracts/coding-files";
import type { Repo } from "../store/repo.js";
import type { BashSeatbeltInput } from "../agent/loop/bash.js";
import type { CodingProcessContext } from "./coding-processes.js";
import { CodingProcessLedger } from "./coding-process-ledger.js";
import {
  appendProcessLog,
  PROCESS_LOG_CHUNK_BYTES,
  PROCESS_LOG_LIMIT,
  utf8PrefixLength,
} from "./coding-process-logs.js";
import { requireCloudFilePath } from "./cloud-files-protocol.js";

export interface CloudProcessAdmission {
  network: boolean;
  check(): void;
}
export interface CloudProcessTransport {
  current(signal?: AbortSignal): Promise<void>;
  launch(
    input: BackgroundStart,
    context: CodingProcessContext,
    processId: string,
    admission: CloudProcessAdmission,
    dispatched: () => void,
  ): Promise<Command>;
  command(commandId: string, signal?: AbortSignal): Promise<Command>;
  released(processId: string): void;
  retiring?(processId: string): Promise<void>;
}
const DISPLAY_LIMIT = 64 * 1024;
function boundedBytes(limit: number) {
  const buffer = Buffer.allocUnsafe(limit);
  let length = 0,
    truncated = false;
  return {
    append(bytes: Buffer) {
      if (truncated) return;
      const count = utf8PrefixLength(bytes, Math.min(bytes.length, limit - length));
      bytes.copy(buffer, length, 0, count);
      length += count;
      truncated ||= count < bytes.length;
    },
    bytes: () => buffer.subarray(0, length),
    truncated: () => truncated,
  };
}
type Owned = {
  command: Command;
  receipt: CodingProcessReceipt;
  finished: Promise<void>;
  ready: Promise<void>;
  stopping?: Promise<void>;
  cleanup(): void;
  flush(): void;
  requestStop(): void;
};

/** Captured Session commands share the local durable ledger; no provider lookup can resume a VM. */
export class CloudCodingProcesses extends CodingProcessLedger {
  private readonly owned = new Map<string, Owned>();
  private queue: Promise<unknown> = Promise.resolve();
  private closed = false;
  private retired = false;
  constructor(
    private readonly options: {
      repo: Repo;
      context: { runId: string; threadId: string; turnId: string };
      identity: CloudCodingIdentity;
      transport: CloudProcessTransport;
      authorize(
        input: BackgroundStart,
        context: CodingProcessContext,
        identity: CloudCodingIdentity,
      ): Promise<CloudProcessAdmission>;
      authorizeAccess(
        operation: "status" | "logs" | "stop" | "reconcile",
        processId: string,
        context: CodingProcessContext,
        identity: CloudCodingIdentity,
      ): Promise<() => void>;
    },
  ) {
    super(options.repo);
  }

  private check(context: CodingProcessContext): void {
    if (this.closed || context.signal?.aborted)
      throw new AuxError("cancelled", "Cloud process execution stopped.");
    const original = this.options.context;
    if (
      context.runId !== original.runId ||
      context.threadId !== original.threadId ||
      context.turnId !== original.turnId
    )
      throw new AuxError("ref_stale", "Cloud processes belong to the original run and turn.");
  }
  private assertExecution(receipt: CodingProcessReceipt): void {
    const original = receipt.execution,
      current = this.options.identity;
    if (
      !original ||
      original.backend !== current.backend ||
      original.resourceId !== current.resourceId ||
      original.sessionId !== current.sessionId ||
      original.sandboxName !== current.sandboxName ||
      original.root !== current.root
    )
      throw new AuxError("ref_stale", "This process belongs to a different execution session.");
  }
  private original(processId: string, runId: string): CodingProcessReceipt {
    const receipt = super.status(processId, runId);
    this.assertExecution(receipt);
    if (runId !== this.options.context.runId) throw new AuxError("ref_stale", "Cloud process run changed.");
    return receipt;
  }
  async authorizeAccess(
    operation: "status" | "logs" | "stop" | "reconcile",
    processId: string,
    context: CodingProcessContext,
  ): Promise<() => void> {
    this.check(context);
    this.original(processId, context.runId);
    await this.options.transport.current(context.signal);
    const admission = await this.options.authorizeAccess(
      operation,
      processId,
      context,
      this.options.identity,
    );
    await this.options.transport.current(context.signal);
    const check = () => {
      this.check(context);
      admission();
    };
    check();
    return check;
  }
  async start(raw: BackgroundStart, context: CodingProcessContext): Promise<CodingProcessReceipt> {
    const pending = this.queue.then(async () => {
      this.check(context);
      const input = BackgroundStartSchema.parse(raw);
      const workdir = requireCloudFilePath(
        input.workdir ?? this.options.identity.root,
        this.options.identity.root,
      );
      const requestHash = createHash("sha256").update(JSON.stringify(input)).digest("hex");
      const existing = this.list(context.runId).find((receipt) => receipt.actionId === context.actionId);
      if (existing) {
        this.assertExecution(existing);
        if (existing.requestHash !== requestHash)
          throw new AuxError("conflict", "The original command request changed; prepare a new action.");
        if (["starting", "uncertain"].includes(existing.state))
          throw new AuxError("operation_uncertain", "Reconcile the original launch before retrying.");
        return this.status(existing.processId, context.runId);
      }
      await this.options.transport.current(context.signal);
      const admission = await this.options.authorize(input, context, this.options.identity);
      if (input.network === false && admission.network)
        throw new AuxError("permission_denied", "An offline command cannot receive network access.");
      await this.options.transport.current(context.signal);
      this.check(context);
      admission.check();
      const receipt: CodingProcessReceipt = {
        processId: randomUUID(),
        runId: context.runId,
        actionId: context.actionId,
        command: input.command,
        workdir,
        startedAt: Date.now(),
        state: "starting",
        requestHash,
        execution: { ...this.options.identity },
        undoAvailable: false,
      };
      this.save(receipt);
      let dispatched = false;
      try {
        const command = await this.options.transport.launch(
          { ...input, workdir },
          context,
          receipt.processId,
          admission,
          () => {
            dispatched = true;
          },
        );
        receipt.execution!.commandId = command.cmdId;
        if (this.retired) {
          receipt.state = "interrupted";
          receipt.endedAt = Date.now();
          this.save(receipt);
          throw new AuxError("cancelled", "The original VM stopped while its command launch was pending.");
        }
        if (!command.cmdId || command.cwd !== workdir)
          throw new AuxError(
            "operation_uncertain",
            "Provider command identity does not match its original launch.",
          );
        receipt.state = "running";
        this.save(receipt);
        const owned = this.watch(command, receipt, context, admission);
        this.owned.set(receipt.processId, owned);
        try {
          await this.waitForProof(owned, context.signal);
          await this.options.transport.current(context.signal);
          this.check(context);
          admission.check();
        } catch (error) {
          await this.stop(receipt.processId, context.runId);
          throw error;
        }
        return this.status(receipt.processId, context.runId);
      } catch (error) {
        if (receipt.state === "starting") {
          receipt.state = dispatched ? "uncertain" : "failed";
          this.save(receipt);
        }
        throw error;
      }
    });
    this.queue = pending.catch(() => {});
    return pending;
  }

  private async waitForProof(owned: Owned, signal?: AbortSignal): Promise<void> {
    let timer: ReturnType<typeof setTimeout> | undefined, abort: (() => void) | undefined;
    const deadline = new Promise<void>((_resolve, reject) => {
      timer = setTimeout(
        () =>
          reject(
            new AuxError(
              "backend_unavailable",
              "The original command did not publish its process ownership proof.",
            ),
          ),
        10000,
      );
      timer.unref();
      abort = () => reject(new AuxError("cancelled", "Cloud command stopped before ownership admission."));
      signal?.addEventListener("abort", abort, { once: true });
      if (signal?.aborted) abort();
    });
    try {
      await Promise.race([owned.ready, deadline]);
    } finally {
      clearTimeout(timer);
      if (abort) signal?.removeEventListener("abort", abort);
    }
  }
  private watch(
    command: Command,
    receipt: CodingProcessReceipt,
    context: CodingProcessContext,
    admission: CloudProcessAdmission,
  ): Owned {
    const controller = new AbortController();
    const log = Buffer.allocUnsafe(PROCESS_LOG_CHUNK_BYTES);
    const digest = createHash("sha256");
    let pendingBytes = 0,
      savedBytes = 0;
    const output = { stdout: boundedBytes(DISPLAY_LIMIT), stderr: boundedBytes(DISPLAY_LIMIT) };
    const flush = () => {
      if (this.retired) return;
      this.repo.transaction(() => {
        appendProcessLog(this.repo, receipt.processId, savedBytes, log.subarray(0, pendingBytes));
        this.save(receipt);
      });
      savedBytes += pendingBytes;
      pendingBytes = 0;
    };
    const append = (bytes: Buffer) => {
      if (this.retired || receipt.logTruncated) return;
      const length = utf8PrefixLength(
        bytes,
        Math.min(bytes.length, PROCESS_LOG_LIMIT - savedBytes - pendingBytes),
      );
      receipt.logTruncated = length < bytes.length;
      digest.update(bytes.subarray(0, length));
      for (let start = 0; start < length;) {
        const end = utf8PrefixLength(bytes, Math.min(length, start + log.length - pendingBytes));
        bytes.copy(log, pendingBytes, start, end);
        pendingBytes += end - start;
        start = end;
        if (start < length || pendingBytes === log.length) flush();
      }
    };
    let header = "",
      admitted = false,
      proofRejected = false,
      acceptProof!: () => void,
      rejectProof!: (error: unknown) => void;
    const ready = new Promise<void>((resolve, reject) => {
      acceptProof = resolve;
      rejectProof = reject;
    });
    const logs = (async () => {
      try {
        for await (const entry of command.logs({ signal: controller.signal })) {
          let data = entry.data;
          const channel = entry.stream === "stderr" ? "stderr" : "stdout";
          if (!admitted && channel === "stdout") {
            header += data;
            const newline = header.indexOf("\n");
            if (Buffer.byteLength(newline < 0 ? header : header.slice(0, newline)) > 8192)
              throw new AuxError("permission_denied", "Invalid cloud ownership header.");
            if (newline < 0) continue;
            const line = header.slice(0, newline);
            if (!line.startsWith(CLOUD_PROCESS_HEADER))
              throw new AuxError("permission_denied", "Missing cloud ownership header.");
            const proof = JSON.parse(line.slice(CLOUD_PROCESS_HEADER.length));
            if (proof.processId !== receipt.processId || proof.sessionId !== this.options.identity.sessionId)
              throw new AuxError("ref_stale", "Cloud ownership belongs to another command or Session.");
            receipt.execution!.supervisor = CloudSupervisorSchema.parse(proof.supervisor);
            this.save(receipt);
            admitted = true;
            acceptProof();
            data = header.slice(newline + 1);
            header = "";
          }
          const bytes = Buffer.from(data);
          append(bytes);
          output[channel].append(bytes);
          receipt.outputTruncated ||= receipt.logTruncated || output[channel].truncated();
        }
      } catch (error) {
        receipt.logTruncated = true;
        receipt.outputTruncated = true;
        if (!admitted) {
          proofRejected = true;
          rejectProof(error);
        }
      } finally {
        if (!admitted) {
          proofRejected = true;
          rejectProof(
            new AuxError("permission_denied", "The cloud command has no original process ownership proof."),
          );
        }
      }
    })();
    let checking = false,
      stopRequested = false;
    const monitor = setInterval(() => {
      if (checking) return;
      checking = true;
      void this.options.transport
        .current(context.signal)
        .then(() => {
          if (pendingBytes) flush();
          this.check(context);
          admission.check();
        })
        .catch(() => this.stop(receipt.processId, context.runId))
        .catch(() => {})
        .finally(() => {
          checking = false;
        });
    }, 250);
    monitor.unref();
    const abort = () => {
      void this.stop(receipt.processId, context.runId).catch(() => {});
    };
    context.signal?.addEventListener("abort", abort, { once: true });
    const cleanup = () => {
      clearInterval(monitor);
      controller.abort();
      context.signal?.removeEventListener("abort", abort);
    };
    const finished = command
      .wait()
      .then(async (result) => {
        const deadline = setTimeout(() => controller.abort(), 5000);
        deadline.unref();
        try {
          await logs;
        } finally {
          clearTimeout(deadline);
          cleanup();
        }
        if (this.retired || receipt.state === "interrupted") return;
        receipt.exitCode = result.exitCode;
        receipt.endedAt = Date.now();
        receipt.state = proofRejected
          ? "interrupted"
          : stopRequested
            ? "stopped"
            : result.exitCode === 0
              ? "completed"
              : "failed";
        receipt.stdout = output.stdout.bytes().toString("utf8");
        receipt.stderr = output.stderr.bytes().toString("utf8");
        receipt.logDigest = digest.digest("hex");
        flush();
        this.options.transport.released(receipt.processId);
        this.owned.delete(receipt.processId);
      })
      .catch((error) => {
        if (this.retired || receipt.state === "stopped" || receipt.state === "interrupted") return;
        receipt.state = "uncertain";
        cleanup();
        flush();
        throw error;
      });
    void finished.catch(() => {});
    return {
      command,
      receipt,
      finished,
      ready,
      cleanup,
      flush,
      requestStop: () => {
        stopRequested = true;
      },
    };
  }
  async logs(
    processId: string,
    runId: string,
    cursor = 0,
  ): Promise<{ text: string; cursor: number; truncated: boolean }> {
    this.original(processId, runId);
    this.owned.get(processId)?.flush();
    return this.remoteLogs(processId, runId, cursor);
  }

  async stop(processId: string, runId: string): Promise<CodingProcessReceipt> {
    const receipt = this.original(processId, runId),
      owned = this.owned.get(processId);
    const previews = this.options.transport.retiring?.(processId) ?? Promise.resolve();
    void previews.catch(() => {});
    if (!["starting", "running", "uncertain"].includes(receipt.state)) {
      await previews;
      return this.status(processId, runId);
    }
    if (!receipt.execution?.commandId)
      throw new AuxError(
        "operation_uncertain",
        "The provider did not return an original command identity; retire its VM to confirm cleanup.",
      );
    if (owned?.stopping) {
      await owned.stopping;
      return this.status(processId, runId);
    }
    owned?.requestStop();
    const stopping = Promise.all([
      previews,
      (async () => {
        const signal = AbortSignal.timeout(30_000);
        const command =
          owned?.command ?? (await this.options.transport.command(receipt.execution!.commandId!, signal));
        if (command.cmdId !== receipt.execution!.commandId)
          throw new AuxError("ref_stale", "Provider command identity changed.");
        await command.kill("SIGTERM", { abortSignal: signal });
        const result = await command.wait({ signal });
        // A fresh kill+wait acknowledgement settles an earlier failed wait.
        if (this.retired) return;
        const current = owned?.receipt ?? super.status(processId, runId);
        current.state = "stopped";
        current.exitCode = result.exitCode;
        current.endedAt = Date.now();
        if (owned) {
          owned.cleanup();
          owned.flush();
        } else this.save(current);
        this.options.transport.released(processId);
        this.owned.delete(processId);
      })(),
    ]).then(() => {});
    if (owned) owned.stopping = stopping;
    try {
      await stopping;
    } catch (error) {
      const current = super.status(processId, runId);
      if (["starting", "running", "uncertain"].includes(current.state)) {
        current.state = "uncertain";
        this.save(current);
      }
      if (owned) owned.stopping = undefined;
      throw error;
    }
    return this.status(processId, runId);
  }
  async reconcile(processId: string, context: CodingProcessContext): Promise<CodingProcessReceipt> {
    const fence = await this.authorizeAccess("reconcile", processId, context);
    const receipt = this.original(processId, context.runId);
    if (!["uncertain", "starting"].includes(receipt.state)) return this.status(processId, context.runId);
    if (!receipt.execution?.commandId)
      throw new AuxError(
        "operation_uncertain",
        "The original launch cannot be located; retire the VM without replaying the command.",
      );
    const command = await this.options.transport.command(receipt.execution.commandId, context.signal);
    fence();
    if (command.cmdId !== receipt.execution.commandId)
      throw new AuxError("ref_stale", "Provider command identity changed.");
    if (command.exitCode === null) return this.status(processId, context.runId);
    receipt.state = "interrupted";
    receipt.exitCode = command.exitCode;
    receipt.endedAt = Date.now();
    receipt.reconciledAt = Date.now();
    const owned = this.owned.get(processId);
    if (owned) {
      owned.receipt.state = "interrupted";
      owned.cleanup();
      owned.flush();
    }
    this.save(receipt);
    this.options.transport.released(processId);
    this.owned.delete(processId);
    return this.status(processId, context.runId);
  }
  async run(input: BashSeatbeltInput, context: CodingProcessContext) {
    const receipt = await this.start(
      { command: input.command, workdir: input.workdir, network: input.network },
      context,
    );
    const owned = this.owned.get(receipt.processId);
    if (owned) {
      let timer: ReturnType<typeof setTimeout> | undefined, abort: (() => void) | undefined;
      const deadline = new Promise<void>((resolve, reject) => {
        timer = setTimeout(
          () => {
            owned.receipt.timedOut = true;
            void this.stop(receipt.processId, context.runId).then(() => resolve(), reject);
          },
          Math.min(Math.max(input.timeoutMs ?? 30000, 1000), 120000),
        );
        timer.unref();
        abort = () =>
          reject(new AuxError("cancelled", "Cloud command stopped; original cleanup remains owned."));
        context.signal?.addEventListener("abort", abort, { once: true });
        if (context.signal?.aborted) abort();
      });
      try {
        await Promise.race([owned.finished, deadline]);
      } finally {
        clearTimeout(timer);
        if (abort) context.signal?.removeEventListener("abort", abort);
      }
    }
    const current = this.status(receipt.processId, context.runId);
    return {
      processId: current.processId,
      command: current.command,
      workdir: current.workdir,
      state: current.state,
      stdout: current.stdout ?? "",
      stderr: current.stderr ?? "",
      exitCode: current.exitCode ?? null,
      timedOut: current.timedOut === true,
      truncated: current.outputTruncated === true,
      signal: current.signal,
    };
  }
  async closeRun(runId: string): Promise<void> {
    if (runId !== this.options.context.runId) return;
    await this.queue;
    const results = await Promise.allSettled([...this.owned.keys()].map((id) => this.stop(id, runId)));
    const errors = results.flatMap((result) => (result.status === "rejected" ? [result.reason] : []));
    if (
      this.list(runId).some(
        (receipt) =>
          receipt.execution?.resourceId === this.options.identity.resourceId &&
          ["starting", "running", "uncertain"].includes(receipt.state),
      )
    )
      errors.push(
        new AuxError(
          "operation_uncertain",
          "Retire the original VM to confirm all unlocated commands stopped.",
        ),
      );
    if (errors.length)
      throw new AggregateError(errors, "Original cloud processes have not acknowledged termination.");
  }
  async close(): Promise<void> {
    this.closed = true;
    await this.closeRun(this.options.context.runId);
  }
  /** Only the provider's matching stopped Session receipt establishes cleanup for an unlocated launch. */
  sessionStopped(): void {
    this.closed = true;
    for (const owned of this.owned.values()) owned.flush();
    this.retired = true;
    for (const receipt of this.list(this.options.context.runId)) {
      if (
        receipt.execution?.resourceId !== this.options.identity.resourceId ||
        receipt.execution.sessionId !== this.options.identity.sessionId
      )
        continue;
      if (["starting", "running", "uncertain"].includes(receipt.state)) {
        receipt.state = "interrupted";
        receipt.endedAt = Date.now();
        this.save(receipt);
      }
      this.options.transport.released(receipt.processId);
    }
    for (const owned of this.owned.values()) owned.cleanup();
    this.owned.clear();
  }
}
