import { createHash, randomUUID } from "node:crypto";
import { AuxError, type OutboundMcpCallResult, type Run } from "@aux/contracts";
import {
  ConnectorFileUploadInputSchema,
  ConnectorFileUploadResultSchema,
  type ConnectorFileTransferRecord,
  type ConnectorFileUploadInput,
  type ConnectorFileUploadResult,
} from "@aux/contracts/connector-file-upload";
import type { Repo } from "../store/repo.js";
import type { LoopPark } from "../agent/loop/types.js";
import type { DurableWriteLedger } from "../agent/durable.js";
import type { OutboundMcpService } from "./outbound-mcp.js";
import { officialMcpProvider } from "./official-mcp.js";
import { ConnectorUploadStore } from "./connector-upload-store.js";
import { withConnectorUploadSource } from "./connector-upload-sources.js";
import {
  allocationArguments,
  connectorUploadNotices,
  publicUploadNotices,
  allocationTool,
  connectorUploadDigest,
  decodedConnectorOutput,
  suggestedMarkdown,
  uploadInstruction,
} from "./connector-upload-provider.js";
import {
  prepareConnectorUpload,
  sendConnectorUpload,
  type ConnectorUploadSender,
} from "./connector-upload-network.js";

export type ConnectorUploadEffect = {
  job: ConnectorFileTransferRecord;
  digest: string;
  toolName?: string;
  arguments?: Record<string, unknown>;
  destination: string;
  requestBytes?: number;
};
export type ConnectorUploadAuthorization =
  | { state: "allowed"; checkCurrent(): void }
  | { state: "waiting"; approvalId: string; identity: string; park: LoopPark };
export type ConnectorUploadOwner = { identity: string; run: Run; signal: AbortSignal; checkCurrent(): void };
const terminal = new Set(["uploaded", "completed", "failed", "uncertain", "retired"]);

/** One original workflow: approval can resume a sealed phase, while a dispatched unknown phase cannot replay. */
export class ConnectorFileTransfers {
  private closed = false;
  private active = new Map<
    string,
    { runId: string; controller: AbortController; operation: Promise<unknown>; transferId?: string }
  >();
  readonly store: ConnectorUploadStore;
  constructor(
    private deps: {
      repo: Repo;
      documents: import("./document-snapshots.js").DocumentSnapshots;
      attachments: import("./conversation-documents.js").ConversationDocuments;
      mcp: OutboundMcpService;
      writes: DurableWriteLedger;
      owner(runId: string): ConnectorUploadOwner;
      checkConnector(runId: string, serverId: string, toolName: string): void;
      authorize(effect: ConnectorUploadEffect, signal: AbortSignal): Promise<ConnectorUploadAuthorization>;
      send?: ConnectorUploadSender;
    },
  ) {
    this.store = new ConnectorUploadStore(deps.repo);
  }

  invoke(
    runId: string,
    raw: ConnectorFileUploadInput,
  ): Promise<ConnectorFileUploadResult | { park: LoopPark }> {
    let input = ConnectorFileUploadInputSchema.parse(raw);
    const owner = this.deps.owner(runId);
    owner.checkCurrent();
    if (!/^[a-f0-9]{64}$/.test(owner.identity))
      throw new AuxError(
        "permission_denied",
        "The original upload controller has no valid private identity.",
      );
    if (this.closed) throw new AuxError("cancelled", "Connector file transfers are closed.");
    const inspectOnly = input.action === "inspect";
    if (input.action === "inspect") input = { action: "continue", transferId: input.transferId };
    if (input.action === "start") {
      const start = input;
      const prepared = this.store
        .list(runId)
        .find(
          (job) =>
            job.serverId === start.serverId &&
            JSON.stringify(job.source.reference) === JSON.stringify(start.reference) &&
            JSON.stringify(job.slack ?? null) === JSON.stringify(start.slack ?? null),
        );
      if (prepared) input = { action: "continue", transferId: prepared.transferId };
    }
    if (input.action === "continue") {
      const transferId = input.transferId;
      if ([...this.active.values()].some((active) => active.transferId === transferId))
        throw new AuxError("conflict", "The original connector transfer is still active.");
    }
    const key =
      input.action === "continue"
        ? input.transferId
        : `${runId}:${input.serverId}:${JSON.stringify(input.reference)}`;
    if (this.active.has(key))
      throw new AuxError("conflict", "The original connector transfer is still active.");
    const controller = new AbortController();
    const signal = AbortSignal.any([owner.signal, controller.signal]);
    const operation = this.execute(runId, input, owner, signal, inspectOnly, (transferId) => {
      const active = this.active.get(key);
      if (active) active.transferId = transferId;
    });
    this.active.set(key, {
      runId,
      controller,
      operation,
      ...(input.action === "continue" ? { transferId: input.transferId } : {}),
    });
    void operation.then(
      () => this.active.delete(key),
      () => this.active.delete(key),
    );
    return operation;
  }

  private async execute(
    runId: string,
    input: Exclude<ConnectorFileUploadInput, { action: "inspect" }>,
    owner: ConnectorUploadOwner,
    signal: AbortSignal,
    inspectOnly: boolean,
    onTransfer: (transferId: string) => void,
  ): Promise<ConnectorFileUploadResult | { park: LoopPark }> {
    let job = input.action === "continue" ? this.store.get(input.transferId) : undefined;
    if (job) onTransfer(job.transferId);
    if (job && (job.runId !== runId || job.ownerIdentity !== owner.identity))
      throw new AuxError("permission_denied", "This transfer belongs to another original run.");
    const serverId = job?.serverId ?? (input.action === "start" ? input.serverId : "");
    const provider = officialMcpProvider(this.deps.mcp.get(serverId).source);
    if (!provider)
      throw new AuxError(
        "capability_unsupported",
        "Only the returned official Notion or Slack file workflow is supported.",
      );
    const checkOwner = () => {
      signal.throwIfAborted();
      owner.checkCurrent();
      const currentOwner = this.deps.owner(runId);
      currentOwner.checkCurrent();
      if (currentOwner.identity !== owner.identity || (job && job.ownerIdentity !== owner.identity))
        throw new AuxError(
          "permission_denied",
          "The original upload control, message, source or model generation retired.",
        );
      const run = this.deps.repo.getRun(runId);
      if (
        this.closed ||
        !run ||
        run.status !== "running" ||
        run.config?.privateTask ||
        !run.config?.taskId ||
        !run.config.taskRevision ||
        !run.config.contextWorkspaceId ||
        run.config.taskId !== owner.run.config?.taskId ||
        run.config.taskRevision !== owner.run.config?.taskRevision ||
        run.config.contextWorkspaceId !== owner.run.config?.contextWorkspaceId
      )
        throw new AuxError("permission_denied", "The original upload run, task or Space retired.");
      if (
        job &&
        (run.config.taskId !== job.taskId ||
          run.config.taskRevision !== job.taskRevision ||
          run.config.contextWorkspaceId !== job.workspaceId)
      )
        throw new AuxError("permission_denied", "The sealed upload task or Space changed.");
      this.deps.checkConnector(runId, serverId, allocationTool(provider));
    };
    checkOwner();
    const context = {
      workspaceId: owner.run.config!.contextWorkspaceId!,
      taskId: owner.run.config!.taskId!,
      revision: owner.run.config!.taskRevision!,
    };
    const catalog = await this.deps.mcp.listTools(serverId, signal);
    checkOwner();
    const allocation = catalog.find((tool) => tool.name === allocationTool(provider) && tool.enabled);
    if (!allocation)
      throw new AuxError(
        "capability_unsupported",
        "The connected provider does not return an enabled local-file allocation tool.",
      );
    if (
      provider === "slack" &&
      !catalog.some((tool) => tool.name === "slack_complete_file_upload" && tool.enabled)
    )
      throw new AuxError(
        "capability_unsupported",
        "The connected Slack provider does not return upload completion.",
      );
    return this.deps.mcp.withAuthority(serverId, allocation.name, context, signal, async (authority) => {
      const check = () => {
        checkOwner();
        authority.checkCurrent();
        if (
          job &&
          (job.sourceDigest !== authority.server.sourceDigest ||
            job.toolsRevision !== authority.server.toolsRevision ||
            job.oauthEpoch !== authority.oauthEpoch)
        )
          throw new AuxError(
            "permission_denied",
            "The sealed upload connector or account generation retired.",
          );
      };
      check();
      return withConnectorUploadSource(
        this.deps,
        {
          reference:
            job?.source.reference ??
            (input.action === "start" ? input.reference : this.store.get(input.transferId).source.reference),
          ...(job ? { expected: job.source } : {}),
        },
        { run: owner.run, signal: authority.signal, checkCurrent: check },
        async (source, bytes, sourceSignal, checkSource) => {
          if (!job) {
            if (provider === "notion" && input.action === "start" && input.slack)
              throw new AuxError("invalid_params", "Slack sharing options do not apply to Notion.");
            allocationArguments(provider, allocation, source);
            const now = Date.now();
            job = {
              transferId: randomUUID(),
              runId,
              ownerIdentity: owner.identity,
              taskId: context.taskId,
              taskRevision: context.revision,
              workspaceId: context.workspaceId,
              serverId,
              provider,
              sourceDigest: authority.server.sourceDigest,
              toolsRevision: authority.server.toolsRevision,
              oauthEpoch: authority.oauthEpoch,
              source,
              ...(input.action === "start" && input.slack ? { slack: input.slack } : {}),
              phase: "allocation",
              state: "prepared",
              createdAt: now,
              updatedAt: now,
            };
            this.store.save(job);
            onTransfer(job.transferId);
          }
          const current = () => {
            checkSource();
            check();
          };
          try {
            while (!inspectOnly && !terminal.has(job.state)) {
              current();
              if (job.state === "running") {
                job = this.save(job, {
                  state: "uncertain",
                  error:
                    "The original dispatched phase has no confirmed result; inspect its receipt before a new action.",
                });
                break;
              }
              if (job.phase === "allocation") {
                const unresolved = this.deps.repo.db
                  .prepare(
                    "SELECT id,status FROM action_intents WHERE (run_id=? OR task_id=?) AND status IN ('pending','uncertain') ORDER BY created_at,id LIMIT 1",
                  )
                  .get(runId, job.taskId);
                if (unresolved)
                  throw new AuxError(
                    "conflict",
                    `Durable effect ${unresolved.id} is ${unresolved.status}; inspect or reconcile it before another connector write.`,
                  );
                const args = allocationArguments(provider, allocation, source);
                const decision = await this.authorize(
                  job,
                  {
                    toolName: allocation.name,
                    arguments: args,
                    destination: authority.server.source.kind === "remote" ? authority.server.source.url : "",
                  },
                  sourceSignal,
                );
                if ("park" in decision) return decision;
                current();
                decision.checkCurrent();
                const dispatched = await this.callPhase(
                  job,
                  allocation.name,
                  args,
                  context,
                  sourceSignal,
                  () => {
                    current();
                    decision.checkCurrent();
                  },
                  (value) => value.status === "completed" && !value.isError,
                );
                job = dispatched.job;
                const output = dispatched.output;
                job = this.save(job, {
                  allocation: { callId: output.callId, response: output.output },
                  notices: [...(job.notices ?? []), ...connectorUploadNotices(output)].slice(0, 50),
                  state: output.status === "uncertain" ? "uncertain" : output.isError ? "failed" : "prepared",
                });
                if (terminal.has(job.state)) break;
                current();
                const allocated = uploadInstruction(provider, output);
                job = this.save(job, {
                  allocation: { ...job.allocation!, ...allocated, expiresAt: Date.now() + 5 * 60_000 },
                  phase: "upload",
                  state: "prepared",
                });
                continue;
              }
              if (job.phase === "upload") {
                const allocation = job.allocation;
                if (!allocation?.instruction || !allocation.expiresAt || Date.now() >= allocation.expiresAt) {
                  job = this.save(job, {
                    state: "retired",
                    error:
                      "The original upload allocation expired or has no supported byte-transfer instruction. It was not regenerated.",
                  });
                  break;
                }
                const request = prepareConnectorUpload(allocation.instruction, bytes, source);
                try {
                  const decision = await this.authorize(
                    job,
                    {
                      destination: request.url.href,
                      url: request.url.href,
                      headers: request.headers,
                      bodySha256: createHash("sha256").update(request.body).digest("hex"),
                      requestBytes: request.body.length,
                    },
                    sourceSignal,
                  );
                  if ("park" in decision) return decision;
                  current();
                  decision.checkCurrent();
                  let intent: ReturnType<DurableWriteLedger["begin"]>["intent"] | undefined;
                  try {
                    const response = await (this.deps.send ?? sendConnectorUpload)(
                      request,
                      AbortSignal.any([sourceSignal, AbortSignal.timeout(30_000)]),
                      () => {
                        current();
                        decision.checkCurrent();
                      },
                      () => {
                        current();
                        decision.checkCurrent();
                        const begun = this.deps.writes.begin({
                          runId,
                          pageId: `connector:${serverId}`,
                          documentEpoch: 0,
                          signature: connectorUploadDigest(job!, {
                            url: request.url.href,
                            headers: request.headers,
                            bodySha256: createHash("sha256").update(request.body).digest("hex"),
                          }),
                          revision: context.revision,
                          logicalActionId: `connector-file:${job!.transferId}:upload`,
                          taskId: context.taskId,
                          taskRevision: context.revision,
                          summary: { ops: ["connector-file-upload"], beforeLineHashes: [source.sha256] },
                        });
                        if (begun.duplicate)
                          throw new AuxError(
                            "conflict",
                            "The original upload already has a durable receipt; it was not replayed.",
                          );
                        intent = begun.intent;
                        job = this.save(job!, {
                          state: "running",
                          approval: undefined,
                          intentIds: { ...job!.intentIds, upload: intent.id },
                        });
                      },
                    );
                    current();
                    if (!intent)
                      throw new AuxError(
                        "backend_unavailable",
                        "The upload transport did not record its original dispatch.",
                      );
                    if (Buffer.byteLength(response.body) > 65_536)
                      throw new AuxError(
                        "backend_unavailable",
                        "The upload response exceeds its bounded allowance.",
                      );
                    if (
                      provider === "slack"
                        ? response.status !== 200
                        : response.status < 200 || response.status >= 300
                    )
                      throw new AuxError(
                        "backend_unavailable",
                        "The byte POST was not confirmed; inspect the original allocation and upload receipt.",
                      );
                    if (provider === "notion") {
                      const parsed: unknown = JSON.parse(response.body);
                      if (
                        !parsed ||
                        typeof parsed !== "object" ||
                        !("suggested_markdown" in parsed) ||
                        typeof parsed.suggested_markdown !== "string" ||
                        !parsed.suggested_markdown ||
                        parsed.suggested_markdown.length > 20_000
                      )
                        throw new AuxError(
                          "backend_unavailable",
                          "Notion did not return a supported uploaded-file acknowledgement.",
                        );
                    }
                    this.deps.writes.confirm(
                      intent.id,
                      JSON.stringify({
                        transferId: job.transferId,
                        sourceSha256: source.sha256,
                        status: response.status,
                      }),
                    );
                    job = this.save(job, {
                      upload: { status: response.status, response: response.body, sha256: source.sha256 },
                      phase: provider === "slack" ? "completion" : "upload",
                      state: provider === "slack" ? "prepared" : "uploaded",
                    });
                  } catch (error) {
                    if (intent) {
                      this.deps.writes.fail(intent.id);
                      job = this.save(job!, {
                        state: "uncertain",
                        error: "The original byte POST may have completed. It was not retried.",
                      });
                    }
                    throw error;
                  }
                } finally {
                  request.body.fill(0);
                }
                continue;
              }
              if (!job.upload || !job.allocation?.fileId)
                throw new AuxError(
                  "conflict",
                  "Slack completion requires the original verified byte POST and file identity.",
                );
              const args = {
                files: [{ id: job.allocation.fileId, title: source.filename }],
                ...(job.slack?.channelId ? { channel_id: job.slack.channelId } : {}),
                ...(job.slack?.initialComment ? { initial_comment: job.slack.initialComment } : {}),
              };
              this.deps.checkConnector(runId, serverId, "slack_complete_file_upload");
              const decision = await this.authorize(
                job,
                {
                  destination: authority.server.source.kind === "remote" ? authority.server.source.url : "",
                  toolName: "slack_complete_file_upload",
                  arguments: args,
                },
                sourceSignal,
              );
              if ("park" in decision) return decision;
              current();
              decision.checkCurrent();
              const dispatched = await this.callPhase(
                job,
                "slack_complete_file_upload",
                args,
                context,
                sourceSignal,
                () => {
                  current();
                  decision.checkCurrent();
                },
                (value) => {
                  const result = decodedConnectorOutput(value);
                  return (
                    Array.isArray(result.files) &&
                    result.files.some(
                      (file) => file && typeof file === "object" && file.id === job!.allocation!.fileId,
                    )
                  );
                },
              );
              job = dispatched.job;
              const output = dispatched.output;
              job = this.save(job, {
                completion: { callId: output.callId, response: output.output },
                notices: [...(job.notices ?? []), ...connectorUploadNotices(output)].slice(0, 50),
                state: output.status === "uncertain" ? "uncertain" : output.isError ? "failed" : "prepared",
              });
              if (terminal.has(job.state)) break;
              current();
              const result = decodedConnectorOutput(output);
              if (
                !Array.isArray(result.files) ||
                !result.files.some(
                  (file) => file && typeof file === "object" && file.id === job!.allocation!.fileId,
                )
              ) {
                job = this.save(job, {
                  state: "uncertain",
                  error: "Slack completion did not confirm the original file identity. It was not repeated.",
                });
                break;
              }
              job = this.save(job, { state: "completed" });
            }
            current();
            return this.present(job);
          } catch (error) {
            job = this.store.get(job.transferId);
            // Confirmed remote outcomes remain recorded even when their original owner retires before publication.
            if (job.state === "uploaded" || job.state === "completed") throw error;
            job = this.save(job, {
              state: job.state === "running" || job.state === "uncertain" ? "uncertain" : "failed",
              error:
                error instanceof AuxError
                  ? error.message.slice(0, 2000)
                  : "The original connector file phase could not complete. Inspect its retained receipts.",
            });
            if (signal.aborted)
              throw new AuxError(
                "cancelled",
                "The original connector upload stopped; retained phase receipts require inspection.",
              );
            return this.present(job);
          }
        },
      );
    });
  }

  private async callPhase(
    original: ConnectorFileTransferRecord,
    toolName: string,
    args: Record<string, unknown>,
    context: { workspaceId: string; taskId: string; revision: number },
    signal: AbortSignal,
    checkCurrent: () => void,
    confirms: (output: OutboundMcpCallResult) => boolean,
  ) {
    let job = original;
    let intent: ReturnType<DurableWriteLedger["begin"]>["intent"] | undefined;
    try {
      const output = await this.deps.mcp.callTool(
        job.serverId,
        toolName,
        args,
        context,
        signal,
        async () => () => {
          checkCurrent();
          if (intent) return;
          const begun = this.deps.writes.begin({
            runId: job.runId,
            pageId: `connector:${job.serverId}`,
            documentEpoch: 0,
            signature: connectorUploadDigest(job, { toolName, arguments: args }),
            revision: context.revision,
            logicalActionId: `connector-file:${job.transferId}:${job.phase}`,
            taskId: job.taskId,
            taskRevision: job.taskRevision,
            summary: { ops: [`connector-file-${job.phase}`], beforeLineHashes: [job.source.sha256] },
          });
          if (begun.duplicate)
            throw new AuxError(
              "conflict",
              `Durable effect ${begun.intent.id} is ${begun.intent.status}; inspect or reconcile it before another connector write.`,
            );
          intent = begun.intent;
          job = this.save(job, {
            state: "running",
            approval: undefined,
            intentIds: { ...job.intentIds, [job.phase]: intent.id },
          });
        },
      );
      if (!intent)
        throw new AuxError(
          "backend_unavailable",
          "The original connector phase did not record its dispatch.",
        );
      let confirmed = false;
      try {
        confirmed = confirms(output);
      } catch {
        /* A response without the required identity is not confirmation. */
      }
      if (confirmed)
        this.deps.writes.confirm(
          intent.id,
          JSON.stringify({
            transferId: job.transferId,
            phase: job.phase,
            callId: output.callId,
            responseSha256: createHash("sha256").update(output.output).digest("hex"),
          }),
        );
      else this.deps.writes.fail(intent.id);
      return { job, output: confirmed ? output : { ...output, status: "uncertain" as const, isError: true } };
    } catch (error) {
      if (intent && this.deps.writes.getById(intent.id)?.status === "pending")
        this.deps.writes.fail(intent.id);
      throw error;
    }
  }

  private save(job: ConnectorFileTransferRecord, patch: Partial<ConnectorFileTransferRecord>) {
    const value = { ...job, ...patch, updatedAt: Date.now() };
    this.store.save(value);
    return value;
  }
  private async authorize(
    job: ConnectorFileTransferRecord,
    request: {
      destination: string;
      toolName?: string;
      arguments?: Record<string, unknown>;
      url?: string;
      headers?: Record<string, string>;
      bodySha256?: string;
      requestBytes?: number;
    },
    signal: AbortSignal,
  ): Promise<Extract<ConnectorUploadAuthorization, { state: "allowed" }> | { park: LoopPark }> {
    const digest = connectorUploadDigest(job, request);
    if (job.approval && job.approval.digest !== digest)
      throw new AuxError(
        "permission_denied",
        "The original approved file phase changed; a replacement cannot inherit approval.",
      );
    const decision = await this.deps.authorize({ job, ...request, digest }, signal);
    if (decision.state === "allowed") return decision;
    this.save(job, {
      state: "waiting",
      approval: { approvalId: decision.approvalId, identity: decision.identity, digest },
    });
    return {
      park: {
        ...decision.park,
        instruction: `${decision.park.instruction}\nContinue original file transfer ${job.transferId} after review; do not prepare another upload.`,
      },
    };
  }
  private present(job: ConnectorFileTransferRecord): ConnectorFileUploadResult {
    const { sourceIdentity: _identity, ...source } = job.source;
    return ConnectorFileUploadResultSchema.parse({
      transferId: job.transferId,
      provider: job.provider,
      phase: job.phase,
      state: job.state,
      source,
      receipts: Object.entries(job.intentIds ?? {}).flatMap(([phase, id]) => {
        const intent = id && this.deps.writes.getById(id);
        return intent ? [{ phase, intentId: intent.id, status: intent.status }] : [];
      }),
      ...(job.allocation
        ? {
            allocationCallId: job.allocation.callId,
            ...(job.allocation.fileId ? { fileId: job.allocation.fileId } : {}),
          }
        : {}),
      ...(job.completion ? { completionCallId: job.completion.callId } : {}),
      ...(suggestedMarkdown(job) ? { suggestedMarkdown: suggestedMarkdown(job) } : {}),
      ...(job.notices ? { notices: publicUploadNotices(job) } : {}),
      ...(job.error ? { error: job.error } : {}),
    });
  }
  async retire(runIds: readonly string[]): Promise<void> {
    const selected = [...this.active.values()].filter((active) => runIds.includes(active.runId));
    for (const active of selected) active.controller.abort();
    await Promise.allSettled(selected.map((active) => active.operation));
    for (const runId of runIds)
      for (const job of this.store.list(runId)) {
        if (!terminal.has(job.state))
          this.save(job, {
            state: job.state === "running" ? "uncertain" : "retired",
            approval: undefined,
            error: "The original transfer owner retired; no phase was replayed.",
          });
      }
  }
  async forget(runIds: readonly string[]): Promise<void> {
    const selected = [...this.active.values()].filter((active) => runIds.includes(active.runId));
    for (const active of selected) active.controller.abort();
    await Promise.allSettled(selected.map((active) => active.operation));
    for (const runId of runIds) this.store.remove(runId);
  }
  async close(): Promise<void> {
    this.closed = true;
    const selected = [...this.active.values()];
    for (const active of selected) active.controller.abort();
    await Promise.allSettled(selected.map((active) => active.operation));
    this.store.retireRestored();
  }
}
