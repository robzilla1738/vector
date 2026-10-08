import type { PrivateBudgetClient } from "./private-budget.js";
import { CloudPreviews } from "./cloud-previews.js";
import { CloudListenerSchema, type CloudListener } from "@aux/contracts/cloud-preview";
import type { CodingProcessReceipt } from "@aux/contracts/coding-processes";
import type { NativeBridge } from "../native.js";
import { CloudCodingProcesses, type CloudProcessAdmission } from "./cloud-processes.js";
import type { CodingProcessContext } from "./coding-processes.js";
import type { BackgroundStart } from "@aux/contracts/coding-processes";
import { CloudFileBackend } from "./cloud-files.js";
import { CodingFilesService, type CodingFileAuthorization, type CodingFileContext } from "./coding-files.js";
import type { CloudCodingIdentity } from "@aux/contracts/coding-files";
import { CLOUD_PROJECT_ROOT, CLOUD_FILE_BYTES, CLOUD_FILE_PROGRAM_BYTES } from "./cloud-files-protocol.js";
import { CloudSetupUnavailable } from "./cloud-setup-unavailable.js";
import type { CloudExecutionContext, CloudReplExecutor } from "./cloud-execution.js";
import { readFile } from "node:fs/promises";
import { CloudReplClient } from "./cloud-repl-client.js";
import { CLOUD_REPL_BYTES } from "./cloud-repl-protocol.js";
import type { ReplHostDeps } from "../agent/loop/repl.js";
import type { LoopToolResult, LoopPark } from "../agent/loop/types.js";
import { createHash, randomUUID } from "node:crypto";
import { posix } from "node:path";
import { Writable } from "node:stream";
import { AuxError, type Suspension, type ResourceLimitsReview } from "@aux/contracts";
import { ResourceFundingUnavailable, ResourceLimitsUnavailable } from "./run-funding.js";
import type { Command, Sandbox, Session } from "@vercel/sandbox";
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
  assertResourceOwner?(error: ResourceFundingUnavailable): void;
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
  accountBudgetId?: string;
  receiptRecorded?: boolean;
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
  files?: CodingFilesService;
  processes?: CloudCodingProcesses;
  network?: boolean;
  networkLocks: Map<string, boolean>;
  previews?: CloudPreviews;
  exposedPorts: Set<number>;
  previewPorts: Promise<unknown>;
  source?: { token: string; windowId: string };
  replWorker?: Command;
  completion?: {
    phase: "preparing" | "retained";
    cancellation: AbortSignal;
    retire(): void;
    expiry?: ReturnType<typeof setTimeout>;
    checking?: Promise<void>;
  };
}
const OUTPUT_BYTES = 64 * 1024;
function boundedOutput(limit = OUTPUT_BYTES) {
  let bytes = 0,
    truncated = false;
  const chunks: Buffer[] = [];
  const stream = new Writable({
    write(chunk: Buffer, _encoding, done) {
      const room = Math.max(0, limit - bytes);
      if (room) chunks.push(Buffer.from(chunk.subarray(0, room)));
      bytes += chunk.length;
      if (bytes > limit) truncated = true;
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
  private retired = false;
  private processWorker?: Promise<string>;
  constructor(
    private readonly deps: {
      repo: Repo;
      configuration(): Promise<CloudConfiguration>;
      funding: CloudFunding;
      accountBudget?: PrivateBudgetClient;
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
      /** Exact remote identity joins the existing file effect decision and durable journal. */
      authorizeFiles?(
        request: CodingFileAuthorization,
        context: CodingFileContext,
        identity: CloudCodingIdentity,
      ): Promise<void | (() => void)>;
      fileWorkerProgram?: () => Promise<Buffer>;
      processWorkerProgram?: () => Promise<Buffer>;
      native?: Pick<NativeBridge, "cloudPreview" | "cloudPreviewClose" | "turnSourceContext">;
      authorizePreview?(
        input: { processId: string; port: number },
        context: CloudExecutionContext,
        process: CodingProcessReceipt,
        listener: CloudListener,
        token: string,
      ): Promise<() => void>;
      authorizeProcess?(
        input: BackgroundStart,
        context: CodingProcessContext,
        identity: CloudCodingIdentity,
      ): Promise<CloudProcessAdmission>;
      authorizeProcessAccess?(
        operation: "status" | "logs" | "stop" | "reconcile",
        processId: string,
        context: CodingProcessContext,
        identity: CloudCodingIdentity,
      ): Promise<() => void>;
      /** Lazy public SDK factory; seam permits protocol-faithful local fixtures without paid calls. */
      create?: typeof Sandbox.create;
      get?: typeof Sandbox.get;
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
    if (resource.completion)
      throw new AuxError("cancelled", "This cloud session has been handed to its original window.");
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
    const token = this.deps.repo.getRun(ctx.runId)?.config?.nativeTurnContext;
    const source =
      token && this.deps.native?.turnSourceContext
        ? { token, windowId: (await this.deps.native.turnSourceContext(token)).windowId }
        : undefined;
    // Load the SDK and prove funding/capability before consuming a money decision.
    const create = this.deps.create ?? (await import("@vercel/sandbox")).Sandbox.create;
    await this.deps.assertOwner(ctx, quote);
    await this.deps.accountBudget?.refresh();
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
      // The SDK cannot establish a finite upper bill before creation. Unknown is never free.
      await this.deps.accountBudget?.reserve(resourceId, "resource", undefined);
      await this.deps.authorizeCreate(ctx, quote, quoteDigest);
      await this.deps.assertOwner(ctx, quote);
      if (this.closed || signal?.aborted)
        throw new AuxError("cancelled", "Cloud execution stopped before provider dispatch.");
    } catch (error) {
      await this.deps.accountBudget?.cancel(resourceId);
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
      accountBudgetId: this.deps.accountBudget ? resourceId : undefined,
      ctx: { ...ctx },
      sandbox,
      session,
      commands: Promise.resolve(),
      networkLocks: new Map(),
      exposedPorts: new Set(),
      previewPorts: Promise.resolve(),
      quote,
      quoteDigest,
      source,
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
      await this.network(resource, network, input.signal);
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

  retainedFiles(runId: string): CodingFilesService | undefined {
    return this.live.get(runId)?.files;
  }
  retainedProcesses(runId: string): CloudCodingProcesses | undefined {
    return this.live.get(runId)?.processes;
  }

  async files(ctx: CloudExecutionContext, signal?: AbortSignal): Promise<CodingFilesService> {
    const authorize = this.deps.authorizeFiles;
    if (!authorize) throw new AuxError("capability_unsupported", "Cloud file authorization is unavailable.");
    const resource = await this.acquire(ctx, signal);
    if (resource.files) return resource.files;
    const identity: CloudCodingIdentity = {
      backend: "cloud",
      resourceId: resource.resourceId,
      sandboxName: resource.sandbox.name,
      sessionId: resource.session.sessionId,
      root: CLOUD_PROJECT_ROOT,
    };
    const backend = new CloudFileBackend(ctx.runId, identity, (request, context, beforeDispatch) =>
      this.queueCommand(resource, async () => {
        const commandSignal = context.signal;
        await this.assertFileAccess(resource, identity, context);
        const content = Buffer.from(JSON.stringify(request));
        if (content.length > CLOUD_FILE_BYTES)
          throw new AuxError(
            "invalid_params",
            "Use smaller cloud file batches; this request exceeds 32 MiB.",
          );
        const program = await (this.deps.fileWorkerProgram?.() ??
          readFile(new URL("../cloud-files/worker.mjs", import.meta.url)));
        if (program.length > CLOUD_FILE_PROGRAM_BYTES || program.includes(0))
          throw new AuxError(
            "permission_denied",
            "The packaged cloud file worker exceeds its reviewed bound.",
          );
        await this.assertFileAccess(resource, identity, context);
        const path = `/vercel/sandbox/.aux-files-${randomUUID()}.json`;
        await resource.session.writeFiles([{ path, content }], { signal: commandSignal });
        await this.assertFileAccess(resource, identity, context);
        const stdout = boundedOutput(CLOUD_FILE_BYTES),
          stderr = boundedOutput();
        beforeDispatch?.();
        const result = await resource.session.runCommand({
          cmd: "node",
          args: [
            "--input-type=module",
            "-e",
            program.toString("utf8"),
            "--",
            path,
            createHash("sha256").update(content).digest("hex"),
          ],
          cwd: "/vercel/sandbox",
          signal: commandSignal,
          timeoutMs: Math.max(1, Math.min(30_000, resource.expiresAt - this.now())),
          stdout: stdout.stream,
          stderr: stderr.stream,
        });
        await this.assertFileAccess(resource, identity, context);
        if (result.exitCode !== 0 || stdout.truncated())
          throw new AuxError(
            "conflict",
            stderr.value() || "Cloud file execution did not return a bounded result.",
          );
        return (JSON.parse(stdout.value()) as { value: unknown }).value;
      }),
    );
    resource.files = new CodingFilesService(this.deps.repo, backend, async (request, context) => {
      if (context.runId !== ctx.runId)
        throw new AuxError("ref_stale", "Cloud files belong to the original run.");
      await this.assertFileAccess(resource, identity, context);
      const fence = await authorize(request, context, { ...identity });
      await this.assertFileAccess(resource, identity, context);
      return fence;
    });
    return resource.files;
  }

  async processes(ctx: CloudExecutionContext, signal?: AbortSignal): Promise<CloudCodingProcesses> {
    const authorize = this.deps.authorizeProcess,
      authorizeAccess = this.deps.authorizeProcessAccess;
    if (!authorize || !authorizeAccess)
      throw new AuxError("capability_unsupported", "Cloud process authorization is unavailable.");
    const resource = await this.acquire(ctx, signal);
    if (resource.processes) return resource.processes;
    const identity: CloudCodingIdentity = {
      backend: "cloud",
      resourceId: resource.resourceId,
      sandboxName: resource.sandbox.name,
      sessionId: resource.session.sessionId,
      root: CLOUD_PROJECT_ROOT,
    };
    resource.processes = new CloudCodingProcesses({
      repo: this.deps.repo,
      context: ctx,
      identity,
      authorize,
      authorizeAccess,
      transport: {
        current: (signal) => this.assertLive(resource, signal),
        launch: (input, context, processId, admission, dispatched) =>
          this.command(resource, context.signal, async () => {
            await resource.session.mkDir(CLOUD_PROJECT_ROOT, { signal: context.signal });
            await this.network(resource, admission.network, context.signal);
            await this.assertLive(resource, context.signal);
            const program = await this.processProgram();
            await this.assertLive(resource, context.signal);
            admission.check();
            // A pending launch keeps its policy lock even if the provider loses its acknowledgement.
            resource.networkLocks.set(processId, admission.network);
            dispatched();
            return resource.session.runCommand({
              cmd: "node",
              args: [
                "--input-type=module",
                "-e",
                program,
                "--",
                JSON.stringify({
                  kind: "start",
                  command: input.command,
                  workdir: input.workdir,
                  processId,
                  sessionId: resource.session.sessionId,
                }),
              ],
              cwd: input.workdir!,
              detached: true,
              signal: context.signal,
              timeoutMs: Math.max(1, resource.expiresAt - this.now()),
            });
          }),
        command: (id, signal) => resource.session.getCommand(id, { signal }),
        retiring: (id) => resource.previews?.closeProcess(id) ?? Promise.resolve(),
        released: (id) => {
          resource.networkLocks.delete(id);
          void resource.previews?.closeProcess(id).catch(() => {
            /* Retained previews retry retirement with the original VM. */
          });
          if (resource.completion && !resource.processes?.hasRetainedServers()) resource.completion.retire();
        },
      },
    });
    return resource.processes;
  }

  async preview(
    ctx: CloudExecutionContext,
    input: { processId: string; port: number },
    token: string,
    signal?: AbortSignal,
  ) {
    const authorize = this.deps.authorizePreview,
      native = this.deps.native;
    if (!authorize || !native?.cloudPreview || !native.cloudPreviewClose || !native.turnSourceContext)
      throw new AuxError("capability_unsupported", "Native cloud Preview is unavailable.");
    // A Preview never provisions a new VM or resumes an old session.
    const resource = this.live.get(ctx.runId);
    if (!resource?.processes || resource.ctx.threadId !== ctx.threadId || resource.ctx.turnId !== ctx.turnId)
      throw new AuxError("ref_stale", "Start the original cloud command before opening its Preview.");
    const session = resource.session,
      sessionId = session.sessionId,
      sandboxName = resource.sandbox.name;
    const current = async (token: string, signal?: AbortSignal) => {
      const exactSession = () => {
        this.assertRetained(resource, signal);
        if (
          resource.session !== session ||
          session.sessionId !== sessionId ||
          resource.sandbox.name !== sandboxName
        )
          throw new AuxError("ref_stale", "The original cloud Preview session changed.");
      };
      exactSession();
      if (resource.completion) {
        if (token !== resource.source?.token)
          throw new AuxError("permission_denied", "Open this server from its original Aux window.");
        await this.assertCompletionOwner(resource, resource.completion);
      }
      await this.assertAccount(resource, signal);
      await native.turnSourceContext!(token);
      exactSession();
    };
    resource.previews ??= new CloudPreviews({
      context: resource.ctx,
      native,
      authorize,
      current,
      process: (id) => {
        const receipt = resource.processes!.status(id, ctx.runId);
        if (
          receipt.execution?.resourceId !== resource.resourceId ||
          receipt.execution.sessionId !== resource.session.sessionId
        )
          throw new AuxError("ref_stale", "The server belongs to a different cloud session.");
        return receipt;
      },
      listeners: async (process, port, token, signal) => {
        await current(token, signal);
        const listeners = await this.listeners(resource, process, port, signal);
        await current(token, signal);
        return listeners;
      },
      expose: (port, token, signal, fence) =>
        this.updatePreviewPort(resource, port, {
          kind: "expose",
          signal,
          fence,
          current: () => current(token, signal),
        }).then(() => new URL(resource.session.domain(port)).origin + "/"),
      hide: (port) => this.updatePreviewPort(resource, port, { kind: "hide" }),
    });
    return resource.previews.open(input, token, signal);
  }
  async admitPreview(previewId: string, token: string): Promise<boolean> {
    for (const resource of this.live.values())
      if (await resource.previews?.admit(previewId, token)) return true;
    return false;
  }
  async closePreview(
    ctx: CloudExecutionContext,
    previewId: string,
    token: string,
  ): Promise<{ closed: true }> {
    const resource = this.live.get(ctx.runId);
    if (!resource?.previews || resource.ctx.threadId !== ctx.threadId || resource.ctx.turnId !== ctx.turnId)
      throw new AuxError("ref_stale", "Original cloud Preview cleanup ownership is unavailable.");
    await resource.previews.close(previewId, token);
    return { closed: true };
  }
  private updatePreviewPort(
    resource: LiveResource,
    port: number,
    change:
      | { kind: "hide" }
      | { kind: "expose"; signal?: AbortSignal; fence?: () => void; current(): Promise<void> },
  ): Promise<void> {
    const work = resource.previewPorts.then(async () => {
      if (resource.finalReceipt) {
        resource.exposedPorts.delete(port);
        if (change.kind === "expose") throw new AuxError("cancelled", "The original cloud session stopped.");
        return;
      }
      if (change.kind === "expose") {
        await change.current();
        change.fence?.();
        resource.exposedPorts.add(port);
      }
      const ports = [...resource.exposedPorts].filter(
        (candidate) => change.kind === "expose" || candidate !== port,
      );
      // update({ports}) changes only routes on this retained Sandbox; it never starts/resumes a Session.
      await resource.sandbox.update(
        { ports },
        { signal: change.kind === "expose" ? change.signal : AbortSignal.timeout(30000) },
      );
      if (change.kind === "hide") resource.exposedPorts.delete(port);
      else await change.current();
    });
    resource.previewPorts = work.catch(() => {});
    return work;
  }

  private processProgram(): Promise<string> {
    this.processWorker ??= (async () => {
      const program = await (this.deps.processWorkerProgram?.() ??
        readFile(new URL("../cloud-process/worker.mjs", import.meta.url)));
      if (program.length > CLOUD_FILE_PROGRAM_BYTES || program.includes(0))
        throw new AuxError("permission_denied", "The packaged cloud process worker exceeds its bound.");
      return program.toString("utf8");
    })();
    return this.processWorker;
  }

  private async listeners(
    resource: LiveResource,
    process: CodingProcessReceipt,
    port?: number,
    signal?: AbortSignal,
  ): Promise<CloudListener[]> {
    if (!process.execution?.supervisor || !process.execution.commandId)
      throw new AuxError("ref_stale", "The server has no original process ownership proof.");
    const program = await this.processProgram();
    this.assertRetained(resource, signal);
    const stdout = boundedOutput(),
      stderr = boundedOutput();
    const result = await resource.session.runCommand({
      cmd: "node",
      args: [
        "--input-type=module",
        "-e",
        program,
        "--",
        JSON.stringify({ kind: "listeners", supervisor: process.execution.supervisor, port }),
      ],
      cwd: "/vercel/sandbox",
      signal,
      timeoutMs: Math.min(5000, Math.max(1, resource.expiresAt - this.now())),
      stdout: stdout.stream,
      stderr: stderr.stream,
    });
    this.assertRetained(resource, signal);
    if (result.exitCode !== 0 || stdout.truncated())
      throw new AuxError("ref_stale", stderr.value() || "The original cloud listener retired.");
    return CloudListenerSchema.array().max(256).parse(JSON.parse(stdout.value()));
  }
  private async network(resource: LiveResource, network: boolean, signal?: AbortSignal): Promise<void> {
    if ([...resource.networkLocks.values()].some((mode) => mode !== network))
      throw new AuxError(
        "conflict",
        "Stop the original background processes before changing this VM's network access.",
      );
    if (resource.network === network) return;
    await resource.session.update({ networkPolicy: network ? "allow-all" : "deny-all" }, { signal });
    resource.network = network;
    await this.assertLive(resource, signal);
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
                readFile(new URL("../chunks/emscripten-module.wasm", import.meta.url)),
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
            resource.replWorker = worker;
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
    return repl.eval(deps, code, opts);
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

  private assertRetained(resource: LiveResource, signal?: AbortSignal): void {
    if (
      this.closed ||
      signal?.aborted ||
      this.live.get(resource.ctx.runId) !== resource ||
      !resource.ready ||
      resource.closing ||
      resource.finalReceipt ||
      this.now() >= resource.expiresAt
    )
      throw new AuxError("cancelled", "The original cloud session expired or stopped.");
  }
  private async assertLive(resource: LiveResource, signal?: AbortSignal) {
    this.assertRetained(resource, signal);
    if (resource.completion)
      throw new AuxError("cancelled", "This cloud session has been handed to its original window.");
    await this.deps.assertOwner(resource.ctx, resource.quote);
    await this.assertAccount(resource, signal);
  }
  private async assertAccount(resource: LiveResource, signal?: AbortSignal): Promise<void> {
    this.assertRetained(resource, signal);
    if (cloudQuoteIdentity((await this.deps.configuration()).quote).digest !== resource.quoteDigest)
      throw new AuxError("ref_stale", "The original cloud account or quote changed.");
    this.assertRetained(resource, signal);
  }
  private async assertFileAccess(
    resource: LiveResource,
    identity: CloudCodingIdentity,
    context: CodingFileContext,
  ): Promise<void> {
    const current = () => {
      this.assertRetained(resource, context.signal);
      if (
        context.runId !== resource.ctx.runId ||
        identity.resourceId !== resource.resourceId ||
        identity.sessionId !== resource.session.sessionId ||
        identity.sandboxName !== resource.sandbox.name
      )
        throw new AuxError("ref_stale", "These files belong to a different cloud execution session.");
    };
    current();
    if (context.actor !== "user") {
      await this.assertLive(resource, context.signal);
      current();
      return;
    }
    if (!context.verifyOwner)
      throw new AuxError("permission_denied", "Undo cloud changes from their original Aux window.");
    await this.assertAccount(resource, context.signal);
    await context.verifyOwner();
    context.checkOwner?.();
    current();
  }
  private command<T>(
    resource: LiveResource,
    signal: AbortSignal | undefined,
    work: () => Promise<T>,
  ): Promise<T> {
    return this.queueCommand(resource, async () => {
      await this.assertLive(resource, signal);
      return work();
    });
  }
  private queueCommand<T>(resource: LiveResource, work: () => Promise<T>): Promise<T> {
    const result = resource.commands.then(work);
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
      if (resource.completion) {
        clearTimeout(resource.completion.expiry);
        resource.completion.cancellation.removeEventListener("abort", resource.completion.retire);
      }
      resource.replWorker = undefined;
      resource.processes?.sessionStopped();
      await resource.previews?.closeAll();
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
      const receipt = {
        costUsd: usage ? cloudMeteredCost(resource.quote, usage) : undefined,
        costEstimated:
          !usage ||
          !resource.contractualConfiguration ||
          final.region !== resource.quote.region ||
          final.vcpus !== resource.quote.vcpus ||
          resource.quote.rateBasis !== "account-contract",
      };
      if (!resource.receiptRecorded) {
        const writeReceipt = () =>
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
              this.deps.funding.settleResource(
                resource.ctx.runId,
                resource.reservationId,
                resource.resourceId,
              );
          });
        if (resource.accountBudgetId && this.deps.accountBudget)
          this.deps.accountBudget.record(resource.accountBudgetId, writeReceipt);
        else writeReceipt();
        resource.receiptRecorded = true;
      }
      if (resource.accountBudgetId) {
        await this.deps.accountBudget?.settle(resource.accountBudgetId, receipt);
        resource.accountBudgetId = undefined;
      }
    })().catch((error) => {
      if (resource.closing === closing) resource.closing = undefined;
      throw error;
    });
    resource.closing = closing;
    return closing;
  }
  async recoverReview(
    ctx: CloudExecutionContext,
    request: Suspension["request"],
    target: "local" | "cloud",
  ): Promise<void> {
    await this.deps.assertOriginal(ctx);
    if (request.resourceFunding) {
      if (!this.deps.funding.assertResourceOwner)
        throw new AuxError("capability_unsupported", "Original resource funding validation is unavailable.");
      this.deps.funding.assertResourceOwner(
        new ResourceFundingUnavailable(request.resourceFunding.runId, request.resourceFunding),
      );
    }
    const proof = request.cloudSetup ?? request.resourceLimits;
    if (proof) {
      const run = this.deps.repo.getRun(proof.runId);
      if (
        !run ||
        createHash("sha256")
          .update(
            JSON.stringify({
              runId: run.runId,
              threadId: run.config?.chatId ?? run.runId,
              turnId: run.runId,
            }),
          )
          .digest("hex") !== proof.originalDigest
      )
        throw new AuxError("ref_stale", "The original resource review identity changed.");
    }
    if (request.resourceLimits) {
      if (
        JSON.stringify(this.deps.resourceScopes(request.resourceLimits.runId)) !==
        JSON.stringify(request.resourceLimits.scopes)
      )
        throw new AuxError("ref_stale", "Original usage limits changed during recovery.");
    }
    if (target === "cloud") {
      if (!request.cloudSetup)
        throw new AuxError("permission_denied", "This review permits local execution only.");
      const quote = CloudResourceQuoteSchema.parse((await this.deps.configuration()).quote);
      const digest = cloudQuoteIdentity(quote).digest;
      await this.deps.assertOriginal(ctx);
      if (cloudQuoteIdentity((await this.deps.configuration()).quote).digest !== digest)
        throw new AuxError("ref_stale", "Cloud configuration changed during retry.");
    }
    await this.deps.assertOriginal(ctx);
  }

  private async recoverResources(runId: string): Promise<void> {
    const rows = this.deps.repo.db
      .prepare("SELECT * FROM execution_resources WHERE run_id=? AND state IN ('reserved','running')")
      .all(runId) as {
      resource_id: string;
      state: string;
      started_at: number | null;
      sandbox_id: string | null;
      session_id: string | null;
      quote_json: string;
      quote_digest: string;
    }[];
    for (const row of rows) {
      const reservation = this.deps.repo
        .settingKeys("fundingReservation:")
        .find((key) => {
          const hold = this.deps.repo.getSetting<{ runId: string; resourceId: string }>(key);
          return hold?.runId === runId && hold.resourceId === row.resource_id;
        })
        ?.slice("fundingReservation:".length);
      if (row.state === "reserved" && row.started_at === null && !row.sandbox_id) {
        await this.deps.accountBudget?.cancel(row.resource_id);
        this.deps.repo.transaction(() => {
          this.deps.funding.cancelResourceUnsent(runId, reservation, row.resource_id);
          this.ledger.cancelUnsent(row.resource_id, runId);
        });
        continue;
      }
      if (!row.sandbox_id || !row.session_id)
        throw new AuxError(
          "needs_input",
          "The provider outcome is unknown. Original resource funding remains held until an exact stop acknowledgement is available.",
          { resourceId: row.resource_id },
        );
      const configuration = await this.deps.configuration();
      const quote = CloudResourceQuoteSchema.parse(JSON.parse(row.quote_json));
      if (quote.accountDigest !== configuration.quote.accountDigest)
        throw new AuxError("needs_input", "Restore the original Cloud account to reconcile its resource.");
      const get = this.deps.get ?? (await import("@vercel/sandbox")).Sandbox.get;
      const sandbox = await get({
        name: row.sandbox_id,
        token: configuration.token,
        teamId: configuration.teamId,
        projectId: configuration.projectId,
        resume: false,
        signal: AbortSignal.timeout(30_000),
      });
      const session = sandbox.currentSession();
      if (session.sessionId !== row.session_id)
        throw new AuxError(
          "needs_input",
          "The provider session changed. An unrelated VM will not be stopped.",
          { resourceId: row.resource_id },
        );
      const run = this.deps.repo.getRun(runId)!;
      await this.closeResource({
        resourceId: row.resource_id,
        reservationId: reservation,
        ctx: { runId, threadId: run.config?.chatId ?? runId, turnId: runId },
        sandbox,
        session,
        commands: Promise.resolve(),
        networkLocks: new Map(),
        exposedPorts: new Set(),
        previewPorts: Promise.resolve(),
        quote,
        quoteDigest: row.quote_digest,
        expiresAt: 0,
        ready: false,
        contractualConfiguration: false,
      });
    }
  }

  /** Transfer only proven servers before coordinator.finish retires agent dispatch. */
  async prepareFinish(runId: string, cancellation: AbortSignal): Promise<void> {
    const resource = this.live.get(runId);
    if (!resource?.processes || !resource.source || resource.completion) return;
    await this.assertLive(resource, cancellation);
    const owner: NonNullable<LiveResource["completion"]> = {
      phase: "preparing",
      cancellation,
      retire: () => {
        void this.closeRun(runId).catch(() => {
          // The exact resource and its unsettled receipt remain owned for cleanup retry.
        });
      },
    };
    try {
      // The REPL has no human owner after completion. Its detached command must
      // retire even when independent, supervised background servers are retained.
      await resource.commands;
      if (resource.replWorker) {
        const worker = resource.replWorker;
        const signal = AbortSignal.timeout(5000);
        await worker.kill("SIGTERM", { abortSignal: signal });
        await worker.wait({ signal });
        resource.replWorker = undefined;
        this.repls.delete(runId);
      }
      const retained = await resource.processes.retainServers(
        async (receipt, checkPolicy) => {
          checkPolicy();
          await this.assertCompletionOwner(resource, owner);
          // This command interrogates kernel PID births, group membership and socket
          // ownership inside this exact captured Session; a receipt alone is not proof.
          if (!(await this.listeners(resource, receipt, undefined, cancellation)).length) return;
          const execution = JSON.stringify(receipt.execution);
          return async () => {
            try {
              checkPolicy();
              if (receipt.state !== "running" || JSON.stringify(receipt.execution) !== execution)
                throw new AuxError("ref_stale", "The original cloud server changed.");
              await this.assertCompletionOwner(resource, owner);
              checkPolicy();
            } catch (error) {
              owner.retire();
              throw error;
            }
          };
        },
        () => {
          this.checkCompletionOwner(resource, owner);
          resource.completion = owner;
          owner.expiry = setTimeout(owner.retire, Math.max(1, resource.expiresAt - this.now()));
          owner.expiry.unref();
          cancellation.addEventListener("abort", owner.retire, { once: true });
          return owner.retire;
        },
      );
      if (retained && !resource.processes.hasRetainedServers()) await this.closeRun(runId);
    } catch (error) {
      await this.closeRun(runId);
      throw error;
    }
  }

  private checkCompletionOwner(resource: LiveResource, owner: NonNullable<LiveResource["completion"]>): void {
    this.assertRetained(resource, owner.cancellation);
    const run = this.deps.repo.getRun(resource.ctx.runId);
    if (
      !resource.source ||
      !run ||
      run.config?.nativeTurnContext !== resource.source.token ||
      (run.config?.chatId ?? run.runId) !== resource.ctx.threadId ||
      !(owner.phase === "retained"
        ? run.status === "completed"
        : ["running", "planning", "completed"].includes(run.status)) ||
      this.deps.resourceScopes(resource.ctx.runId).length ||
      this.deps.accountBudget?.snapshot().some((window) => window.limitUsd !== undefined)
    )
      throw new AuxError("cancelled", "The original cloud server owner retired.");
  }

  private async assertCompletionOwner(
    resource: LiveResource,
    owner: NonNullable<LiveResource["completion"]>,
  ): Promise<void> {
    this.checkCompletionOwner(resource, owner);
    if (!owner.checking) {
      const proof = (async () => {
        await this.assertAccount(resource, owner.cancellation);
        await this.deps.accountBudget?.refresh();
        const source = resource.source;
        if (
          !source ||
          !this.deps.native?.turnSourceContext ||
          (await this.deps.native.turnSourceContext(source.token)).windowId !== source.windowId
        )
          throw new AuxError("permission_denied", "The original cloud server window retired.");
        this.checkCompletionOwner(resource, owner);
      })();
      owner.checking = proof;
      void proof
        .finally(() => {
          if (owner.checking === proof) owner.checking = undefined;
        })
        .catch(() => {});
    }
    await owner.checking;
    this.checkCompletionOwner(resource, owner);
  }

  /** A prepared handoff becomes human-owned only after durable successful completion. */
  async finishRun(runId: string): Promise<void> {
    const resource = this.live.get(runId),
      owner = resource?.completion;
    if (
      !resource ||
      !owner ||
      this.deps.repo.getRun(runId)?.status !== "completed" ||
      !resource.processes?.hasRetainedServers()
    ) {
      await this.closeRun(runId);
      return;
    }
    try {
      owner.phase = "retained";
      await this.assertCompletionOwner(resource, owner);
    } catch (error) {
      await this.closeRun(runId);
      throw error;
    }
  }

  async closeRun(runId: string): Promise<void> {
    const pending = this.resources.get(runId);
    const existing = this.live.get(runId);
    if (!pending && !existing) {
      if (this.retired) return;
      await this.recoverResources(runId);
      return;
    }
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
    if (this.retired) return;
    this.closed = true;
    const persisted = (
      this.deps.repo.db
        .prepare("SELECT DISTINCT run_id FROM execution_resources WHERE state IN ('reserved','running')")
        .all() as { run_id: string }[]
    ).map((row) => row.run_id);
    const results = await Promise.allSettled(
      [...new Set([...this.resources.keys(), ...this.live.keys(), ...persisted])].map((id) =>
        this.closeRun(id),
      ),
    );
    const failures = results.filter(
      (result): result is PromiseRejectedResult => result.status === "rejected",
    );
    if (failures.length)
      throw new AggregateError(
        failures.map((result) => result.reason),
        "Cloud resources retain uncertain cleanup receipts.",
      );
    this.retired = true;
  }
}
