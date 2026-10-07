import { CloudSetupUnavailable } from "./cloud-setup-unavailable.js";
import type { CloudExecutionContext, CloudReplExecutor } from "./cloud-execution.js";
import { readFile } from "node:fs/promises";
import { CloudReplClient } from "./cloud-repl-client.js";
import { CLOUD_REPL_BYTES } from "./cloud-repl-protocol.js";
import type { ReplHostDeps } from "../agent/loop/repl.js";
import type { LoopToolResult, LoopPark } from "../agent/loop/types.js";
import { createHash } from "node:crypto";
import { posix } from "node:path";
import { Writable } from "node:stream";
import { AuxError, type ResourceLimitsReview } from "@aux/contracts";
import { ResourceFundingUnavailable, ResourceLimitsUnavailable } from "./run-funding.js";
import type { Sandbox, Session } from "@vercel/sandbox";
import type { Repo } from "../store/repo.js";
import type { BashSeatbeltInput, BashSeatbeltResult } from "../agent/loop/bash.js";
import { ExecutionResourceLedger } from "./execution-resource-ledger.js";
import {
  cloudMeteredCost,
  cloudQuoteIdentity,
  CloudResourceQuoteSchema,
  type CloudResourceQuote,
  type CloudMeteredUsage,
} from "./cloud-resource-quote.js";

export interface CloudFunding {
  reserveResource(
    runId: string,
    input: { resourceId: string; estimatedCostUsd?: number },
  ): string | undefined;
  settleResource(runId: string, reservationId: string, resourceId: string): void;
  cancelResourceUnsent(runId: string, reservationId: string | undefined, resourceId: string): void;
}
export interface CloudConfiguration {
  token: string;
  teamId: string;
  projectId: string;
  quote: CloudResourceQuote;
}
interface LiveResource {
  resourceId: string;
  reservationId?: string;
  ctx: CloudExecutionContext;
  sandbox: Sandbox;
  session: Session;
  commands: Promise<unknown>;
  quote: CloudResourceQuote;
  quoteDigest: string;
  expiresAt: number;
  ready: boolean;
  contractualConfiguration: boolean;
  finalReceipt?: Awaited<ReturnType<Session["stop"]>>["session"];
  closing?: Promise<void>;
}
const OUTPUT_BYTES = 64 * 1024;
function boundedOutput() {
  let bytes = 0,
    truncated = false;
  const chunks: Buffer[] = [];
  const stream = new Writable({
    write(chunk: Buffer, _encoding, done) {
      const room = Math.max(0, OUTPUT_BYTES - bytes);
      if (room) chunks.push(Buffer.from(chunk.subarray(0, room)));
      bytes += chunk.length;
      if (bytes > OUTPUT_BYTES) truncated = true;
      done();
    },
  });
  return { stream, value: () => Buffer.concat(chunks).toString("utf8"), truncated: () => truncated };
}

/** One original-run VM; no Profile, local credentials, port exposure, snapshots or silent resume. */
export class VercelSandboxExecutor implements CloudReplExecutor {
  private readonly resources = new Map<string, Promise<LiveResource>>();
  private readonly live = new Map<string, LiveResource>();
  private readonly unsentReviews = new Map<
    string,
    {
      pending: Promise<LiveResource>;
    }
  >();
  private readonly repls = new Map<string, CloudReplClient>();
  private readonly ledger: ExecutionResourceLedger;
  private closed = false;
  constructor(
    private readonly deps: {
      repo: Repo;
      configuration(): Promise<CloudConfiguration>;
      funding: CloudFunding;
      /** Actual saved run, original native turn/source, live policy and money consent checks. */
      assertOwner(ctx: CloudExecutionContext, quote?: CloudResourceQuote): Promise<void>;
      /** Immutable original source remains valid while the exact family is parked. */
      assertOriginal(ctx: CloudExecutionContext, quote?: CloudResourceQuote): Promise<void>;
      resourceScopes(runId: string): ResourceLimitsReview["scopes"];
      pauseForResourceFunding(
        error: ResourceFundingUnavailable | ResourceLimitsUnavailable | CloudSetupUnavailable,
        current?: () => Promise<void>,
      ): Promise<void>;
      /** One actual money decision before creating a VM; existing-session checks never repeat it. */
      authorizeCreate(
        ctx: CloudExecutionContext,
        quote: CloudResourceQuote,
        quoteDigest: string,
      ): Promise<void>;
      /** Original Bash/network policy, including Ask-mode recipient decisions. */
      authorizeBash(
        ctx: CloudExecutionContext,
        input: BashSeatbeltInput,
      ): Promise<boolean | { park: LoopPark }>;
      /** Lazy public SDK factory; seam permits protocol-faithful local fixtures without paid calls. */
      create?: typeof Sandbox.create;
      workerAssets?: () => Promise<{ program: Buffer; wasm: Buffer; notices?: Buffer }>;
      now?: () => number;
    },
  ) {
    this.ledger = new ExecutionResourceLedger(deps.repo, deps.now);
  }
  private now() {
    return (this.deps.now ?? Date.now)();
  }

  private async acquire(ctx: CloudExecutionContext, signal?: AbortSignal): Promise<LiveResource> {
    if (this.closed || signal?.aborted) throw new AuxError("cancelled", "Cloud execution stopped.");
    let resource = this.live.get(ctx.runId);
    if (!resource) {
      let pending = this.resources.get(ctx.runId);
      if (!pending) {
        pending = this.create(ctx, signal);
        this.resources.set(ctx.runId, pending);
        const original = pending;
        void pending
          .catch(() => {
            if (this.resources.get(ctx.runId) !== original || this.live.has(ctx.runId)) return;
            const unsettled = this.deps.repo.db
              .prepare(
                "SELECT resource_id FROM execution_resources WHERE run_id=? AND state IN ('reserved','running') LIMIT 1",
              )
              .get(ctx.runId);
            if (!unsettled) this.resources.delete(ctx.runId);
          })
          .catch(() => {
            /* Failed durable proof retains the original uncertain admission. */
          });
      }
      resource = await pending;
    }
    if (!resource.ready)
      throw new AuxError("needs_input", "The original VM requires cleanup before further dispatch.");
    if (resource.ctx.threadId !== ctx.threadId || resource.ctx.turnId !== ctx.turnId)
      throw new AuxError("ref_stale", "This cloud session belongs to the original turn.");
    await this.deps.assertOwner(ctx, resource.quote);
    const configuration = await this.deps.configuration();
    if (cloudQuoteIdentity(configuration.quote).digest !== resource.quoteDigest)
      throw new AuxError("ref_stale", "The reviewed cloud account or resource quote changed.");
    if (this.closed || signal?.aborted || resource.closing || this.now() >= resource.expiresAt)
      throw new AuxError("cancelled", "The original cloud session expired or stopped.");
    return resource;
  }

  private async create(ctx: CloudExecutionContext, signal: AbortSignal | undefined): Promise<LiveResource> {
    // Establish the immutable original source before reading protected configuration.
    await this.deps.assertOwner(ctx);
    let configuration: CloudConfiguration;
    try {
      configuration = await this.deps.configuration();
    } catch (error) {
      if (!(error instanceof AuxError) || error.code !== "needs_input") throw error;
      await this.deps.assertOriginal(ctx);
      const pending = this.resources.get(ctx.runId);
      if (!pending) throw new AuxError("conflict", "Original cloud creation is unavailable.");
      const review = { pending };
      this.unsentReviews.set(ctx.runId, review);
      try {
        await this.deps.pauseForResourceFunding(
          new CloudSetupUnavailable(
            ctx.runId,
            {
              runId: ctx.runId,
              originalDigest: createHash("sha256").update(JSON.stringify(ctx)).digest("hex"),
            },
            async () => {
              await this.deps.assertOriginal(ctx);
              const reviewed = await this.deps.configuration();
              const digest = cloudQuoteIdentity(CloudResourceQuoteSchema.parse(reviewed.quote)).digest;
              await this.deps.assertOriginal(ctx);
              if (cloudQuoteIdentity((await this.deps.configuration()).quote).digest !== digest)
                throw new AuxError("ref_stale", "The reviewed Cloud account changed during retry.");
              await this.deps.assertOriginal(ctx);
            },
          ),
          () => this.deps.assertOriginal(ctx),
        );
      } finally {
        if (this.unsentReviews.get(ctx.runId) === review) this.unsentReviews.delete(ctx.runId);
      }
      throw new AuxError(
        "cancelled",
        "Cloud setup was reviewed. Observe the original turn before fresh admission.",
      );
    }
    const quote = CloudResourceQuoteSchema.parse(configuration.quote);
    await this.deps.assertOwner(ctx, quote);
    if (this.closed || signal?.aborted)
      throw new AuxError("cancelled", "Cloud execution stopped before admission.");
    const pending = this.deps.repo.db
      .prepare(
        `SELECT resource_id FROM execution_resources
      WHERE run_id=? AND state IN ('reserved','running') LIMIT 1`,
      )
      .get(ctx.runId);
    if (pending)
      throw new AuxError(
        "needs_input",
        "The original cloud resource needs reconciliation before another VM can be created.",
      );
    const { json, digest: quoteDigest } = cloudQuoteIdentity(quote);
    const originalDigest = createHash("sha256").update(JSON.stringify(ctx)).digest("hex");
    // Load the SDK and prove funding/capability before consuming a money decision.
    const create = this.deps.create ?? (await import("@vercel/sandbox")).Sandbox.create;
    await this.deps.assertOwner(ctx, quote);
    const scopes = this.deps.resourceScopes(ctx.runId);
    const current = async () => {
      await this.deps.assertOriginal(ctx, quote);
      if (
        cloudQuoteIdentity((await this.deps.configuration()).quote).digest !== quoteDigest ||
        JSON.stringify(this.deps.resourceScopes(ctx.runId)) !== JSON.stringify(scopes)
      )
        throw new AuxError("ref_stale", "The original cloud resource quote or usage limits changed.");
    };
    let admitted: { resourceId: string; reservationId?: string };
    try {
      admitted = this.deps.repo.transaction(() => {
        const resourceId = this.ledger.reserve({
          runId: ctx.runId,
          originalDigest,
          quoteDigest,
          quoteJson: json,
        });
        if (scopes.length)
          throw new ResourceLimitsUnavailable(ctx.runId, {
            runId: ctx.runId,
            scopes,
            originalDigest,
            quoteDigest,
          });
        const reservationId = this.deps.funding.reserveResource(ctx.runId, { resourceId });
        return { resourceId, reservationId };
      });
    } catch (error) {
      if (error instanceof ResourceFundingUnavailable || error instanceof ResourceLimitsUnavailable) {
        // This transaction rolled back before any provider request. Reduction-only
        // close must not await the same person-input promise that it will resolve.
        const pending = this.resources.get(ctx.runId);
        if (!pending) throw new AuxError("conflict", "The original cloud admission was lost.");
        const review = { pending };
        this.unsentReviews.set(ctx.runId, review);
        try {
          await this.deps.pauseForResourceFunding(error, current);
        } finally {
          if (this.unsentReviews.get(ctx.runId) === review) this.unsentReviews.delete(ctx.runId);
        }
        throw new AuxError(
          "cancelled",
          "Cloud funding was reviewed. Observe the original turn before fresh admission.",
        );
      }
      throw error;
    }
    const { resourceId, reservationId } = admitted;
    try {
      await this.deps.authorizeCreate(ctx, quote, quoteDigest);
      await this.deps.assertOwner(ctx, quote);
      if (this.closed || signal?.aborted)
        throw new AuxError("cancelled", "Cloud execution stopped before provider dispatch.");
    } catch (error) {
      this.deps.repo.transaction(() => {
        this.deps.funding.cancelResourceUnsent(ctx.runId, reservationId, resourceId);
        this.ledger.cancelUnsent(resourceId, ctx.runId);
      });
      throw error;
    }
    this.ledger.begin(resourceId, ctx.runId, originalDigest, quoteDigest);
    const sandbox = await create({
      token: configuration.token,
      teamId: configuration.teamId,
      projectId: configuration.projectId,
      name: `aux-${resourceId}`,
      image: "vercel/sandbox/node:24",
      region: quote.region,
      resources: { vcpus: quote.vcpus },
      timeout: quote.timeoutMs,
      persistent: false,
      ports: [],
      env: {},
      tags: { auxResourceId: resourceId },
      signal,
    });
    const session = sandbox.currentSession();
    const resource: LiveResource = {
      resourceId,
      reservationId,
      ctx: { ...ctx },
      sandbox,
      session,
      commands: Promise.resolve(),
      quote,
      quoteDigest,
      expiresAt: Math.min(this.now() + quote.timeoutMs, sandbox.expiresAt?.getTime() ?? Infinity),
      ready: false,
      contractualConfiguration:
        sandbox.name === `aux-${resourceId}` &&
        !sandbox.persistent &&
        session.region === quote.region &&
        session.vcpus === quote.vcpus &&
        session.timeout <= quote.timeoutMs &&
        !session.sourceSnapshotId,
    };
    // Keep the usable provider handle even when attachment, source checks or cleanup fail later.
    this.live.set(ctx.runId, resource);
    try {
      this.ledger.attach(resourceId, ctx.runId, sandbox.name, session.sessionId);
      if (!resource.contractualConfiguration || !Number.isFinite(resource.expiresAt))
        throw new AuxError(
          "permission_denied",
          "The provider did not create the original reviewed cloud configuration.",
        );
      await this.deps.assertOwner(ctx, quote);
    } catch (error) {
      await this.closeResource(resource);
      throw error;
    }
    if (this.closed || signal?.aborted) {
      await this.closeResource(resource);
      throw new AuxError("cancelled", "Cloud execution stopped during provider creation.");
    }
    resource.ready = true;
    return resource;
  }

  async bash(
    input: BashSeatbeltInput,
    ctx: CloudExecutionContext,
  ): Promise<BashSeatbeltResult | { park: LoopPark }> {
    if (!input.command.trim() || Buffer.byteLength(input.command) > 8192)
      throw new AuxError("invalid_params", "Enter a shell command within the supported size.");
    const network = await this.deps.authorizeBash(ctx, input);
    if (typeof network !== "boolean") return network;
    if (input.network === false && network)
      throw new AuxError("permission_denied", "An offline command cannot be dispatched with network access.");
    const resource = await this.acquire(ctx, input.signal);
    return this.command(resource, input.signal, async () => {
      const cwd = input.workdir ?? "/vercel/sandbox";
      if (
        !posix.isAbsolute(cwd) ||
        (cwd !== "/vercel/sandbox" && !cwd.startsWith("/vercel/sandbox/")) ||
        posix.normalize(cwd) !== cwd
      )
        throw new AuxError("permission_denied", "Cloud commands use the original VM workspace.");
      const requested = input.timeoutMs ?? 30_000;
      if (!Number.isSafeInteger(requested) || requested < 1)
        throw new AuxError("invalid_params", "Choose a positive command timeout.");
      await resource.session.update(
        { networkPolicy: network ? "allow-all" : "deny-all" },
        { signal: input.signal },
      );
      await this.assertLive(resource, input.signal);
      const timeoutMs = Math.min(requested, resource.expiresAt - this.now());
      if (timeoutMs <= 0) throw new AuxError("cancelled", "The original cloud session expired.");
      const stdout = boundedOutput(),
        stderr = boundedOutput();
      const result = await resource.session.runCommand({
        cmd: "/bin/bash",
        args: ["-lc", input.command],
        cwd,
        timeoutMs,
        signal: input.signal,
        stdout: stdout.stream,
        stderr: stderr.stream,
      });
      await this.assertLive(resource, input.signal);
      return {
        stdout: stdout.value(),
        stderr: stderr.value(),
        exitCode: result.exitCode,
        timedOut:
          result.exitCode === 137 && result.durationMs !== undefined && result.durationMs >= timeoutMs,
        truncated: stdout.truncated() || stderr.truncated(),
      };
    });
  }

  async eval(
    ctx: CloudExecutionContext,
    deps: ReplHostDeps,
    code: string,
    opts?: { pageId?: string; deadlineMs?: number; yieldTimeMs?: number },
  ): Promise<LoopToolResult> {
    if (deps.runId !== ctx.runId)
      throw new AuxError("permission_denied", "Cloud REPL source does not match its original run.");
    const resource = await this.acquire(ctx, deps.signal);
    let repl = this.repls.get(ctx.runId);
    if (!repl) {
      const current = (signal?: AbortSignal) => this.assertLive(resource, signal);
      let workerFailure: unknown;
      repl = new CloudReplClient({
        current: async (signal) => {
          await current(signal);
          if (workerFailure)
            throw new AuxError(
              "needs_input",
              "The original cloud worker stopped; clean up its session before continuing.",
            );
        },
        initialize: async (directory) =>
          this.command(resource, deps.signal, async () => {
            const assets = await (this.deps.workerAssets?.() ??
              Promise.all([
                readFile(new URL("../cloud-repl/worker.mjs", import.meta.url)),
                readFile(new URL("../cloud-repl/emscripten-module.wasm", import.meta.url)),
                readFile(new URL("../cloud-repl/THIRD-PARTY-NOTICES.txt", import.meta.url)),
              ]).then(([program, wasm, notices]) => ({ program: program!, wasm: wasm!, notices: notices! })));
            if (assets.program.length > 8 * 1024 * 1024 || assets.wasm.length > 8 * 1024 * 1024)
              throw new AuxError(
                "permission_denied",
                "The packaged cloud worker exceeds its reviewed bound.",
              );
            await current(deps.signal);
            await resource.session.mkDir(directory, { signal: deps.signal });
            await resource.session.writeFiles(
              [
                { path: `${directory}/worker.mjs`, content: assets.program },
                { path: `${directory}/emscripten-module.wasm`, content: assets.wasm },
                ...(assets.notices
                  ? [{ path: `${directory}/THIRD-PARTY-NOTICES.txt`, content: assets.notices }]
                  : []),
              ],
              { signal: deps.signal },
            );
            await current(deps.signal);
            const worker = await resource.session.runCommand({
              cmd: "node",
              args: [`${directory}/worker.mjs`, directory],
              cwd: "/vercel/sandbox",
              detached: true,
              timeoutMs: Math.max(1, resource.expiresAt - this.now()),
              signal: deps.signal,
            });
            void worker.wait().then(
              () => {
                workerFailure = true;
              },
              (error) => {
                workerFailure = error;
              },
            );
            await current(deps.signal);
          }),
        write: (path, content, signal) =>
          this.command(resource, signal, async () => {
            await resource.session.writeFiles([{ path, content }], { signal });
            await current(signal);
          }),
        read: (path, signal) =>
          this.command(resource, signal, async () => {
            const stream = await resource.session.readFile({ path }, { signal });
            if (!stream) return null;
            const chunks: Buffer[] = [];
            let bytes = 0;
            try {
              for await (const chunk of stream) {
                const part = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
                bytes += part.length;
                if (bytes > CLOUD_REPL_BYTES)
                  throw new AuxError("permission_denied", "Cloud worker output exceeded its bound.");
                chunks.push(part);
              }
            } finally {
              if ("destroy" in stream && typeof stream.destroy === "function") stream.destroy();
            }
            await current(signal);
            return Buffer.concat(chunks);
          }),
      });
      this.repls.set(ctx.runId, repl);
    }
    const cloudDeps: ReplHostDeps = {
      ...deps,
      codingTool: async () => {
        throw new AuxError(
          "capability_unsupported",
          "Governed coding tools currently require local execution. Choose On this Mac for this coding run.",
        );
      },
    };
    return repl.eval(cloudDeps, code, opts);
  }
  async wait(
    ctx: CloudExecutionContext,
    cellId: string,
    yieldTimeMs?: number,
    terminate?: boolean,
  ): Promise<LoopToolResult> {
    await this.acquire(ctx);
    const repl = this.repls.get(ctx.runId);
    if (!repl) throw new AuxError("not_found", "The original run has no cloud REPL.");
    return repl.wait(ctx.runId, cellId, yieldTimeMs, terminate);
  }
  hasOpen(runId: string): boolean {
    return this.repls.get(runId)?.hasOpen(runId) ?? false;
  }

  private async assertLive(resource: LiveResource, signal?: AbortSignal) {
    if (
      this.closed ||
      signal?.aborted ||
      resource.closing ||
      resource.finalReceipt ||
      this.now() >= resource.expiresAt
    )
      throw new AuxError("cancelled", "The original cloud session expired or stopped.");
    await this.deps.assertOwner(resource.ctx, resource.quote);
    if (cloudQuoteIdentity((await this.deps.configuration()).quote).digest !== resource.quoteDigest)
      throw new AuxError("ref_stale", "The original cloud account or quote changed.");
    if (
      this.closed ||
      signal?.aborted ||
      resource.closing ||
      resource.finalReceipt ||
      this.now() >= resource.expiresAt
    )
      throw new AuxError("cancelled", "The original cloud session retired during authorization.");
  }
  private command<T>(
    resource: LiveResource,
    signal: AbortSignal | undefined,
    work: () => Promise<T>,
  ): Promise<T> {
    const result = resource.commands.then(async () => {
      await this.assertLive(resource, signal);
      return work();
    });
    resource.commands = result.then(
      () => {},
      () => {},
    );
    return result;
  }

  private closeResource(resource: LiveResource): Promise<void> {
    if (resource.closing) return resource.closing;
    const closing: Promise<void> = (async () => {
      // Cleanup has its own deadline; original cancellation never suppresses the stop ACK.
      const final =
        resource.finalReceipt ??
        (await resource.session.stop({ signal: AbortSignal.timeout(30_000) })).session;
      const current = resource.session;
      if (final.id !== current.sessionId || !["stopped", "aborted", "failed"].includes(final.status))
        throw new AuxError("needs_input", "The provider did not acknowledge the original VM stopped.");
      const stoppedAt = final.stoppedAt ?? final.abortedAt;
      if (stoppedAt === undefined)
        throw new AuxError("needs_input", "The original VM stop receipt is incomplete.");
      resource.finalReceipt = final;
      let usage: CloudMeteredUsage | undefined;
      if (
        final.activeCpuDurationMs !== undefined &&
        final.duration !== undefined &&
        final.networkTransfer !== undefined
      )
        usage = {
          activeCpuMs: final.activeCpuDurationMs,
          durationMs: final.duration,
          memoryMB: final.memory,
          outboundBytes: final.networkTransfer.egress,
        };
      this.deps.repo.transaction(() => {
        // Attachment can be retried after a late provider response failed its first local write.
        this.ledger.attach(resource.resourceId, resource.ctx.runId, resource.sandbox.name, final.id);
        this.ledger.settle({
          resourceId: resource.resourceId,
          runId: resource.ctx.runId,
          sandboxId: resource.sandbox.name,
          sessionId: final.id,
          stoppedAt,
          ...(usage
            ? { usageJson: JSON.stringify(usage), costUsd: cloudMeteredCost(resource.quote, usage) }
            : {}),
          costEstimated:
            !usage ||
            !resource.contractualConfiguration ||
            final.region !== resource.quote.region ||
            final.vcpus !== resource.quote.vcpus ||
            resource.quote.rateBasis !== "account-contract",
        });
        if (resource.reservationId)
          this.deps.funding.settleResource(resource.ctx.runId, resource.reservationId, resource.resourceId);
      });
    })().catch((error) => {
      if (resource.closing === closing) resource.closing = undefined;
      throw error;
    });
    resource.closing = closing;
    return closing;
  }
  async closeRun(runId: string): Promise<void> {
    const pending = this.resources.get(runId);
    const existing = this.live.get(runId);
    if (!pending && !existing) return;
    const review = this.unsentReviews.get(runId);
    const unsettled = () =>
      this.deps.repo.db
        .prepare(
          "SELECT resource_id FROM execution_resources WHERE run_id=? AND state IN ('reserved','running') LIMIT 1",
        )
        .get(runId);
    if (!existing && review && review.pending === pending && !unsettled()) {
      // The saved creation remains parked and will always throw before dispatch.
      // No VM exists, no unknown provider request qualifies, and the original
      // promise is retained until the actual handoff finishes.
      return;
    }
    let resource = existing;
    if (!resource) {
      try {
        resource = await pending!;
      } catch (error) {
        if (this.live.has(runId) || unsettled()) throw error;
        if (this.resources.get(runId) === pending) this.resources.delete(runId);
        return;
      }
    }
    await this.closeResource(resource);
    this.repls.delete(runId);
    this.resources.delete(runId);
    this.live.delete(runId);
  }
  async close(): Promise<void> {
    this.closed = true;
    const results = await Promise.allSettled(
      [...new Set([...this.resources.keys(), ...this.live.keys()])].map((id) => this.closeRun(id)),
    );
    const failures = results.filter(
      (result): result is PromiseRejectedResult => result.status === "rejected",
    );
    if (failures.length)
      throw new AggregateError(
        failures.map((result) => result.reason),
        "Cloud resources retain uncertain cleanup receipts.",
      );
  }
}
