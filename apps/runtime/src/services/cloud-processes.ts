import { createHash, randomUUID } from "node:crypto";
import type { Command } from "@vercel/sandbox";
import { AuxError } from "@aux/contracts";
import {
  BackgroundStartSchema,
  type BackgroundStart,
  type CodingProcessReceipt,
} from "@aux/contracts/coding-processes";
import type { CloudCodingIdentity } from "@aux/contracts/coding-files";
import type { Repo } from "../store/repo.js";
import type { BashSeatbeltInput } from "../agent/loop/bash.js";
import type { CodingProcessContext } from "./coding-processes.js";
import { CodingProcessLedger } from "./coding-process-ledger.js";
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
}
const LOG_LIMIT = 8 * 1024 * 1024;
const DISPLAY_LIMIT = 64 * 1024;
function boundedBytes(limit: number) {
  let buffer = Buffer.allocUnsafe(Math.min(limit, 64 * 1024)),
    length = 0,
    truncated = false;
  return {
    append(bytes: Buffer) {
      const count = Math.min(bytes.length, limit - length);
      if (length + count > buffer.length) {
        const grown = Buffer.allocUnsafe(Math.min(limit, Math.max(buffer.length * 2, length + count)));
        buffer.copy(grown, 0, 0, length);
        buffer = grown;
      }
      bytes.copy(buffer, length, 0, count);
      length += count;
      truncated ||= count < bytes.length;
    },
    bytes: () => buffer.subarray(0, length),
    size: () => length,
    truncated: () => truncated,
  };
}
type Owned = {
  command: Command;
  receipt: CodingProcessReceipt;
  finished: Promise<void>;
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
  override status(processId: string, runId: string): CodingProcessReceipt {
    const { logText: _logText, ...receipt } = super.status(processId, runId);
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
        logText: "",
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

  private watch(
    command: Command,
    receipt: CodingProcessReceipt,
    context: CodingProcessContext,
    admission: CloudProcessAdmission,
  ): Owned {
    const controller = new AbortController();
    const log = boundedBytes(LOG_LIMIT);
    log.append(Buffer.from(receipt.logText ?? ""));
    let savedBytes = log.size();
    const output = { stdout: boundedBytes(DISPLAY_LIMIT), stderr: boundedBytes(DISPLAY_LIMIT) };
    const flush = () => {
      receipt.logText = log.bytes().toString("utf8");
      if (!this.retired) this.save(receipt);
      delete receipt.logText;
      savedBytes = log.size();
    };
    const logs = (async () => {
      try {
        for await (const entry of command.logs({ signal: controller.signal })) {
          const bytes = Buffer.from(entry.data),
            channel = entry.stream === "stderr" ? "stderr" : "stdout";
          log.append(bytes);
          output[channel].append(bytes);
          receipt.outputTruncated ||= log.truncated() || output[channel].truncated();
          if (log.size() - savedBytes >= 1024 * 1024) flush();
        }
      } catch {
        receipt.outputTruncated = true;
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
        receipt.state = stopRequested ? "stopped" : result.exitCode === 0 ? "completed" : "failed";
        receipt.stdout = output.stdout.bytes().toString("utf8");
        receipt.stderr = output.stderr.bytes().toString("utf8");
        receipt.logDigest = createHash("sha256").update(log.bytes()).digest("hex");
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
    if (!Number.isSafeInteger(cursor) || cursor < 0)
      throw new AuxError("invalid_params", "Invalid log cursor.");
    this.original(processId, runId);
    this.owned.get(processId)?.flush();
    const receipt = super.status(processId, runId),
      bytes = Buffer.from(receipt.logText ?? "");
    const part = bytes.subarray(cursor, cursor + 64 * 1024);
    return {
      text: part.toString("utf8"),
      cursor: cursor + part.length,
      truncated: receipt.outputTruncated === true,
    };
  }
  async stop(processId: string, runId: string): Promise<CodingProcessReceipt> {
    const receipt = this.original(processId, runId),
      owned = this.owned.get(processId);
    if (!["starting", "running", "uncertain"].includes(receipt.state)) return this.status(processId, runId);
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
    const stopping = (async () => {
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
    })();
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
