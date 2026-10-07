import { randomUUID } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import { AuxError } from "@aux/contracts";
import type { ReplHostDeps } from "../agent/loop/repl.js";
import type { LoopToolResult } from "../agent/loop/types.js";
import { CLOUD_REPL_BYTES, CloudReplCalls, CloudReplRpc, CloudReplRequest } from "./cloud-repl-protocol.js";
export interface CloudReplTransport {
  initialize(directory: string): Promise<void>;
  write(path: string, content: Buffer, signal?: AbortSignal): Promise<void>;
  read(path: string, signal?: AbortSignal): Promise<Buffer | null>;
  current(signal?: AbortSignal): Promise<void>;
}
interface Cell {
  id: string;
  runId: string;
  completion: Promise<LoopToolResult>;
  terminated: boolean;
  directory: string;
  transport: CloudReplTransport;
  signal?: AbortSignal;
}
/** VM bytes are untrusted: only original guarded host callbacks can produce park/finish authority. */
export class CloudReplClient {
  private cells = new Map<string, Cell>();
  private initialized?: Promise<void>;
  readonly directory = `/vercel/sandbox/.aux-repl-${randomUUID()}`;
  constructor(private readonly transport: CloudReplTransport) {}
  hasOpen(runId: string) {
    return [...this.cells.values()].some((cell) => cell.runId === runId);
  }
  async eval(
    deps: ReplHostDeps,
    code: string,
    opts?: { pageId?: string; deadlineMs?: number; yieldTimeMs?: number },
  ): Promise<LoopToolResult> {
    if (this.hasOpen(deps.runId))
      throw new AuxError("conflict", "A cloud cell is open; use repl_wait first.");
    const request = CloudReplRequest.parse({
      id: randomUUID(),
      runId: deps.runId,
      code,
      pageId: opts?.pageId,
      deadlineMs: opts?.deadlineMs,
    });
    const cell: Cell = {
      id: request.id,
      runId: deps.runId,
      terminated: false,
      directory: this.directory,
      transport: this.transport,
      signal: deps.signal,
      completion: Promise.resolve({ output: null }),
    };
    this.cells.set(cell.id, cell);
    cell.completion = this.execute(cell, deps, request);
    // Yielded errors remain observable by wait without an unhandled rejection.
    void cell.completion.catch(() => {});
    if (opts?.yieldTimeMs === undefined) {
      try {
        return await cell.completion;
      } finally {
        this.cells.delete(cell.id);
      }
    }
    return this.wait(deps.runId, cell.id, opts.yieldTimeMs);
  }
  async wait(runId: string, id: string, yieldTimeMs = 30_000, terminate = false): Promise<LoopToolResult> {
    const cell = this.cells.get(id);
    if (!cell || cell.runId !== runId)
      throw new AuxError("not_found", "The cloud cell does not belong to this run.");
    await cell.transport.current(cell.signal);
    if (terminate && !cell.terminated) {
      cell.terminated = true;
      await cell.transport.write(`${cell.directory}/cancel-${id}`, Buffer.from("cancel"), cell.signal);
    }
    const result = await Promise.race([
      cell.completion.then((value) => ({ value })),
      delay(Math.max(0, Math.min(yieldTimeMs, 120000))).then(() => undefined),
    ]);
    if (!result)
      return { output: { cellId: id, ...(cell.terminated ? { terminated: true } : { running: true }) } };
    this.cells.delete(id);
    return cell.terminated ? { output: { cellId: id, terminated: true } } : result.value;
  }
  private async execute(
    cell: Cell,
    deps: ReplHostDeps,
    request: ReturnType<typeof CloudReplRequest.parse>,
  ): Promise<LoopToolResult> {
    this.initialized ??= this.transport.initialize(this.directory);
    await this.initialized;
    await this.transport.current(cell.signal);
    await this.transport.write(
      `${cell.directory}/request-${cell.id}.payload`,
      Buffer.from(JSON.stringify(request)),
      cell.signal,
    );
    await this.transport.write(`${cell.directory}/request-${cell.id}.ready`, Buffer.alloc(0), cell.signal);
    let sequence = 0;
    let trusted: LoopToolResult | undefined;
    const expires = Date.now() + (request.deadlineMs ?? 120000) + 30000;
    const parse = (bytes: Buffer): unknown => {
      if (bytes.length > CLOUD_REPL_BYTES)
        throw new AuxError("permission_denied", "Cloud message exceeded its bound.");
      return JSON.parse(bytes.toString("utf8")) as unknown;
    };
    while (Date.now() < expires) {
      await this.transport.current(cell.signal);
      const rpcBytes = await this.transport.read(
        `${cell.directory}/rpc-${cell.id}-${sequence}.json`,
        cell.signal,
      );
      if (rpcBytes) {
        const rpc = CloudReplRpc.parse(parse(rpcBytes));
        if (rpc.id !== cell.id || rpc.sequence !== sequence)
          throw new AuxError("permission_denied", "Cloud callback identity changed.");
        const args = CloudReplCalls[rpc.method].parse(rpc.args);
        let response: { value?: unknown; error?: string };
        try {
          deps.allowHostCall?.(rpc.method, JSON.stringify(args));
          const method = deps[rpc.method];
          if (typeof method !== "function")
            throw new AuxError("permission_denied", "This original run has no such callback.");
          const value = await Reflect.apply(method, deps, args);
          await this.transport.current(cell.signal);
          if (value && typeof value === "object") {
            if ("park" in value) trusted = { park: value.park } as LoopToolResult;
            if (rpc.method === "submitResult" && "ok" in value && value.ok === true && "result" in value)
              trusted = { finish: { result: value.result } } as LoopToolResult;
          }
          response = { value };
        } catch (error) {
          if (error instanceof AuxError && ["cancelled", "ref_stale"].includes(error.code)) throw error;
          response = { error: error instanceof Error ? error.message : "Original callback failed" };
        }
        const bytes = Buffer.from(JSON.stringify(response));
        if (bytes.length > CLOUD_REPL_BYTES)
          throw new AuxError("permission_denied", "Original callback output exceeded its bound.");
        await this.transport.write(
          `${cell.directory}/reply-${cell.id}-${sequence}.payload`,
          bytes,
          cell.signal,
        );
        await this.transport.write(
          `${cell.directory}/reply-${cell.id}-${sequence}.ready`,
          Buffer.alloc(0),
          cell.signal,
        );
        sequence++;
      }
      const resultBytes = await this.transport.read(`${cell.directory}/result-${cell.id}.json`, cell.signal);
      if (resultBytes) {
        const envelope = parse(resultBytes);
        if (!envelope || typeof envelope !== "object")
          throw new AuxError("permission_denied", "Invalid cloud response.");
        if ("error" in envelope)
          throw new AuxError(
            "invalid_params",
            typeof envelope.error === "string" ? envelope.error.slice(0, 1000) : "Cloud REPL failed.",
          );
        if (!("value" in envelope) || !envelope.value || typeof envelope.value !== "object")
          throw new AuxError("permission_denied", "Invalid cloud result.");
        const value = envelope.value;
        if ("park" in value || "finish" in value) {
          if (!trusted || JSON.stringify(value) !== JSON.stringify(trusted))
            throw new AuxError(
              "permission_denied",
              "The VM cannot manufacture approval or completion authority.",
            );
          return trusted;
        }
        if (!("output" in value)) throw new AuxError("permission_denied", "Cloud REPL returned no output.");
        return { output: value.output };
      }
      await delay(100, undefined, { signal: cell.signal });
    }
    throw new AuxError("cancelled", "The original cloud REPL deadline elapsed.");
  }
}
