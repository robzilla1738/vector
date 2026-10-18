import { randomUUID } from "node:crypto";
import { AuxError } from "@aux/contracts";
import { XInvokeParamsSchema, X_OPERATIONS, type XInvoke, type XAccount } from "@aux/contracts/x";
import { isReadOnlyProfile } from "../agent/permissions.js";
import type { DurableWriteLedger, WriteIntent } from "../agent/durable.js";
import type { Repo } from "../store/repo.js";
import type { XAccountService } from "./x-accounts.js";
import type { XGrantService } from "./x-grants.js";
import { prepareXRequest, xJsonResponse, xSourceHash, type XRequest } from "./x-rest.js";
export type XDispatch = XInvoke & {
  source: XAccount;
  effect: "read" | "write" | "send";
  request: XRequest & { sha256: string };
};
/** Original requests are joined and single-attempt; persisted uncertainty never authorizes replay. */
export class XOperationService {
  private closed = false;
  private active = new Map<string, Set<AbortController>>();
  private pending = new Set<Promise<unknown>>();
  private unsubscribe: () => void;
  constructor(
    private deps: {
      repo: Repo;
      accounts: XAccountService;
      grants: XGrantService;
      writes: DurableWriteLedger;
      authorize(input: XDispatch, signal: AbortSignal): Promise<() => void>;
      fetch?: typeof fetch;
    },
  ) {
    this.unsubscribe = deps.grants.onRetire((grantId) => {
      for (const controller of this.active.get(grantId) ?? []) controller.abort();
    });
  }
  invoke(input: XInvoke, signal: AbortSignal) {
    const original = this.invokeOwned(input, signal);
    this.pending.add(original);
    void original.then(
      () => this.pending.delete(original),
      () => this.pending.delete(original),
    );
    return original;
  }
  private async invokeOwned(raw: XInvoke, signal: AbortSignal) {
    const serialized = JSON.stringify(raw);
    if (Buffer.byteLength(serialized) > 100_000)
      throw new AuxError("invalid_params", "X operation arguments exceed the bounded limit.");
    const input = XInvokeParamsSchema.parse(JSON.parse(serialized)),
      controller = new AbortController(),
      joined = AbortSignal.any([signal, controller.signal]);
    const active = this.active.get(input.grantId) ?? new Set<AbortController>();
    active.add(controller);
    this.active.set(input.grantId, active);
    const check = () => {
      joined.throwIfAborted();
      if (this.closed) throw new AuxError("cancelled", "X operations are closed.");
      this.deps.grants.require(input);
      const run = this.deps.repo.getRun(input.runId);
      if (
        !run ||
        run.status !== "running" ||
        run.config?.privateTask ||
        run.config?.taskId !== input.taskId ||
        run.config.taskRevision !== input.taskRevision ||
        run.config.contextWorkspaceId !== input.workspaceId ||
        (isReadOnlyProfile(run.config.subagentProfile) && X_OPERATIONS[input.operation].effect !== "read") ||
        (run.config.agentProfile?.tools &&
          !run.config.agentProfile.tools.includes("*") &&
          !run.config.agentProfile.tools.includes("x_operation"))
      )
        throw new AuxError("permission_denied", "The X request's original run, task or Space retired.");
    };
    const invocationId = randomUUID(),
      operationId = `aux-x-${input.operation.replaceAll(".", "-")}`,
      startedAt = Date.now();
    let intent: WriteIntent | undefined,
      dispatched = false,
      completed = false,
      recorded = false,
      digest = "";
    const record = (status: string, effectOutcome: string, error?: string) =>
      this.deps.repo.saveInvocation({
        invocationId,
        operationId,
        runId: input.runId,
        requestKey: input.actionId,
        inputs: {
          connectionId: input.connectionId,
          accountRevision: input.accountRevision,
          operation: input.operation,
          requestDigest: digest,
        },
        status,
        effectOutcome,
        startedAt,
        ...(status !== "running" ? { endedAt: Date.now() } : {}),
        ...(error ? { error } : {}),
      });
    try {
      check();
      const registration = this.deps.repo.getOperation("aux.connector.x", input.operation),
        effectClass = X_OPERATIONS[input.operation].effect === "read" ? "read" : "write";
      if (
        registration &&
        (registration.operationId !== operationId || registration.effectClass !== effectClass)
      )
        throw new AuxError("permission_denied", "The reserved X operation registration changed.");
      if (!registration)
        this.deps.repo.saveOperation({
          operationId,
          siteKey: "aux.connector.x",
          name: input.operation,
          description: "Scoped X REST operation",
          effectClass,
        });
      const result = await this.deps.accounts.withAccess(
        input.connectionId,
        input.accountRevision,
        X_OPERATIONS[input.operation].scopes,
        joined,
        async (access) => {
          const current = () => {
            check();
            access.checkCurrent();
          };
          current();
          const request = prepareXRequest(input.operation, input.args, access.source);
          const requestDigest = (spec: XRequest) =>
            xSourceHash([
              input.runId,
              input.taskId,
              input.taskRevision,
              input.workspaceId,
              input.grantId,
              input.actionId,
              input.connectionId,
              input.accountRevision,
              input.operation,
              spec.method,
              spec.url,
              spec.objectId,
              spec.body ?? null,
            ]);
          digest = requestDigest(request);
          record("running", "not-applicable");
          recorded = true;
          const authorize = async (spec: XRequest, effect: XDispatch["effect"]) => {
            current();
            const fence = await this.deps.authorize(
              { ...input, source: access.source, effect, request: { ...spec, sha256: requestDigest(spec) } },
              access.signal,
            );
            current();
            fence();
            return fence;
          };
          const dispatch = async (spec: XRequest, original = false) => {
            current();
            if (original) dispatched = true;
            const response = await (this.deps.fetch ?? fetch)(spec.url, {
              method: spec.method,
              redirect: "error",
              signal: AbortSignal.any([access.signal, AbortSignal.timeout(30_000)]),
              headers: {
                Authorization: `Bearer ${access.token}`,
                Accept: "application/json",
                ...(spec.body ? { "content-type": "application/json" } : {}),
              },
              ...(spec.body ? { body: spec.body } : {}),
            });
            if (!response.ok)
              throw new AuxError(
                response.status === 401
                  ? "needs_input"
                  : response.status === 403
                    ? "permission_denied"
                    : "backend_unavailable",
                `X refused this account request (${response.status}); its product access, scopes or current rate limit may not permit the operation. It was not retried.`,
              );
            const value = await xJsonResponse(response);
            current();
            return value;
          };
          const preflight = async () => {
            if (input.operation !== "posts.reply") return;
            const args = input.args as { postId: string; expectedSourceSha256: string },
              spec = prepareXRequest("posts.read", { postIds: [args.postId] }, access.source);
            const fence = await authorize(spec, "read");
            current();
            fence();
            const value = await dispatch(spec);
            const source = Array.isArray(value.data)
              ? value.data.find((post) => post && typeof post === "object" && post.id === args.postId)
              : undefined;
            if (!source || xSourceHash(source) !== args.expectedSourceSha256)
              throw new AuxError(
                "conflict",
                "The original X reply source changed or is unavailable. Read it again before replying.",
              );
          };
          await preflight();
          const fence = await authorize(request, request.effect);
          current();
          fence();
          if (request.effect !== "read") {
            const begun = this.deps.writes.begin({
              runId: input.runId,
              pageId: `x:${input.connectionId}:${xSourceHash(request.objectId)}`,
              documentEpoch: 0,
              signature: digest,
              revision: input.taskRevision,
              logicalActionId: `x:${input.runId}:${input.actionId}`,
              taskId: input.taskId,
              taskRevision: input.taskRevision,
              summary: { ops: [input.operation], beforeLineHashes: [digest] },
            });
            if (begun.duplicate)
              throw new AuxError(
                "conflict",
                "The original X action already has a durable receipt or unresolved effect. Inspect it before a new action; it was not replayed.",
              );
            intent = begun.intent;
          }
          current();
          fence();
          await preflight();
          current();
          fence();
          const value = await dispatch(request, true);
          if (request.effect !== "read") {
            const data =
              value.data && typeof value.data === "object" && !Array.isArray(value.data)
                ? (value.data as Record<string, unknown>)
                : undefined;
            const errors = Array.isArray(value.errors) && value.errors.length > 0;
            let confirmed = false;
            if (input.operation === "posts.create" || input.operation === "posts.reply")
              confirmed = typeof data?.id === "string" && /^[0-9]{1,19}$/.test(data.id);
            if (input.operation === "bookmarks.add") confirmed = data?.bookmarked === true;
            if (input.operation === "bookmarks.remove") confirmed = data?.bookmarked === false;
            if (input.operation === "follows.add")
              confirmed = data?.following === true || data?.pending_follow === true;
            if (input.operation === "follows.remove") confirmed = data?.following === false;
            if (input.operation === "messages.send" || input.operation === "messages.reply")
              confirmed =
                typeof data?.dm_event_id === "string" &&
                /^[0-9]{1,19}$/.test(data.dm_event_id) &&
                typeof data.dm_conversation_id === "string" &&
                (input.operation === "messages.send" || data.dm_conversation_id === request.objectId);
            if (!confirmed || errors)
              throw new AuxError(
                "backend_unavailable",
                "X did not confirm the complete original write result. Inspect the durable receipt; it was not retried.",
              );
            this.deps.writes.confirm(
              intent!.id,
              JSON.stringify({
                requestDigest: digest,
                providerResultHash: xSourceHash(value),
                objectId: request.objectId,
              }),
            );
            completed = true;
          }
          current();
          fence();
          const projected = { ...value };
          if (
            (input.operation === "posts.read" || input.operation === "posts.search") &&
            Array.isArray(value.data)
          )
            projected.postSources = value.data.flatMap((post) =>
              post && typeof post === "object" && typeof post.id === "string"
                ? [{ postId: post.id, sha256: xSourceHash(post) }]
                : [],
            );
          return {
            result: projected,
            source: {
              connectionId: input.connectionId,
              accountRevision: input.accountRevision,
              userId: access.source.userId,
              username: access.source.username,
              operation: input.operation,
              objectId: request.objectId,
              fetchedAt: Date.now(),
            },
          };
        },
      );
      record("completed", X_OPERATIONS[input.operation].effect === "read" ? "observed" : "applied");
      return { invocationId, ...result, ...(intent ? { receiptId: intent.id } : {}) };
    } catch (error) {
      if (intent && !completed) {
        if (dispatched) this.deps.writes.fail(intent.id);
        else this.deps.writes.abortUndispatched(intent.id, "The original X request did not dispatch.");
      }
      const failure =
        error instanceof AuxError
          ? error
          : new AuxError(
              joined.aborted ? "cancelled" : "backend_unavailable",
              dispatched && intent
                ? "The original X write may have completed. Inspect its durable receipt; it was not retried."
                : "The X request could not complete.",
            );
      if (recorded)
        record(
          failure.code === "cancelled" ? "interrupted" : "failed",
          intent ? (completed ? "applied" : dispatched ? "unknown" : "not-applied") : "not-applicable",
          failure.message,
        );
      throw failure;
    } finally {
      active.delete(controller);
      if (!active.size) this.active.delete(input.grantId);
    }
  }
  async close(): Promise<void> {
    this.closed = true;
    this.unsubscribe();
    for (const group of this.active.values()) for (const controller of group) controller.abort();
    await Promise.allSettled(this.pending);
  }
}
