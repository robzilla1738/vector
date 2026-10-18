import { verifyGoogleValuesWrite } from "./google-values.js";
import {
  projectGoogleDocumentRange,
  prepareGoogleDocumentEdit,
  verifyGoogleDocumentEdit,
  verifiedGoogleDocumentFormatting,
  type GoogleDocumentEditExpectation,
} from "./google-documents.js";
import { projectGoogleGrid } from "./google-grid.js";
import { googleAttachmentMetadata, type InspectGoogleAttachment } from "./google-attachments.js";
import { isReadOnlyProfile } from "../agent/permissions.js";
import { createHash, randomUUID } from "node:crypto";
import { AuxError } from "@aux/contracts";
import {
  GOOGLE_OPERATIONS,
  GoogleOperationSchema,
  GoogleArguments,
  type GoogleOperation,
  type GoogleAccount,
} from "@aux/contracts/google";
import { googleMessageHash, googleRawMessageHash } from "./google-mail.js";
import type { Repo } from "../store/repo.js";
import type { DurableWriteLedger, WriteIntent } from "../agent/durable.js";
import type { GoogleAccountService } from "./google-accounts.js";
import type { GoogleGrantService } from "./google-grants.js";
import {
  prepareGoogleRequest,
  verifyGoogleGrid,
  prepareGoogleReply,
  googleValuesHash,
  type GoogleRequest,
} from "./google-rest.js";

export type GoogleInvoke = {
  runId: string;
  taskId: string;
  taskRevision: number;
  workspaceId: string;
  grantId: string;
  connectionId: string;
  accountRevision: string;
  operation: GoogleOperation;
  args: unknown;
  actionId: string;
};
export type GoogleDispatch = GoogleInvoke & {
  source: GoogleAccount;
  request: { url: string; method: string; objectId: string; body?: string; sha256: string };
  effect: "read" | "write" | "send";
};
const sha = (value: string) => createHash("sha256").update(value).digest("hex");
async function boundedObject(response: Response, limit: number): Promise<Record<string, unknown>> {
  const reader = response.body?.getReader();
  if (!reader) throw new AuxError("backend_unavailable", "Google returned an empty response.");
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    for (;;) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.length;
      if (size > limit)
        throw new AuxError("backend_unavailable", "Google response exceeds the admitted result limit.");
      chunks.push(part.value);
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
  let value: unknown;
  try {
    value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new AuxError("backend_unavailable", "Google returned invalid JSON.");
  }
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new AuxError("backend_unavailable", "Google returned invalid result data.");
  return value as Record<string, unknown>;
}

/** Sealed REST operations reuse account authority and the existing durable action
 * ledger. There is one send attempt; no transport or effect retry path exists.
 */
export class GoogleOperationService {
  private active = new Map<string, Set<AbortController>>();
  private pending = new Set<Promise<unknown>>();
  private closed = false;
  private unsubscribe: () => void;
  constructor(
    private deps: {
      repo: Repo;
      accounts: GoogleAccountService;
      grants: GoogleGrantService;
      writes: DurableWriteLedger;
      authorize(input: GoogleDispatch, signal: AbortSignal): Promise<() => void>;
      fetch?: typeof fetch;
      inspectAttachment?: InspectGoogleAttachment;
      saveAttachment?(input: {
        runId: string;
        bytes: Buffer;
        sha256: string;
        filename: string;
        mediaType: string;
        checkCurrent(): void;
      }): {
        artifactId: string;
        mediaType: string;
        size: number;
      };
    },
  ) {
    this.unsubscribe = deps.grants.onRetire((grantId) => this.retireGrant(grantId));
  }
  invoke(
    input: GoogleInvoke,
    signal: AbortSignal,
  ): Promise<{
    invocationId: string;
    result: Record<string, unknown>;
    source: {
      connectionId: string;
      accountRevision: string;
      accountKey: string;
      operation: GoogleOperation;
      objectId: string;
      fetchedAt: number;
    };
    receiptId?: string;
  }> {
    const task = this.invokeOwned(input, signal);
    this.pending.add(task);
    void task.then(
      () => this.pending.delete(task),
      () => this.pending.delete(task),
    );
    return task;
  }
  private async invokeOwned(raw: GoogleInvoke, signal: AbortSignal) {
    // Capture exact immutable data before an approval or credential refresh.
    const serializedInput = JSON.stringify(raw);
    if (Buffer.byteLength(serializedInput) > 350_000)
      throw new AuxError("invalid_params", "Google operation arguments are too large.");
    const input = JSON.parse(serializedInput) as GoogleInvoke;
    GoogleOperationSchema.parse(input.operation);
    if (!/^[A-Za-z0-9_-]{1,100}$/.test(input.actionId))
      throw new AuxError("invalid_params", "Choose a valid original action identity.");
    let request = prepareGoogleRequest(input.operation, input.args, input.actionId);
    const requestHash = () =>
      sha(
        JSON.stringify([
          input.runId,
          input.taskId,
          input.taskRevision,
          input.workspaceId,
          input.grantId,
          input.actionId,
          input.args,
          input.connectionId,
          input.accountRevision,
          input.operation,
          request.method,
          request.url,
          request.objectId,
          request.body ?? null,
        ]),
      );
    let requestDigest = requestHash();
    const controller = new AbortController(),
      joined = AbortSignal.any([signal, controller.signal]);
    const active = this.active.get(input.grantId) ?? new Set<AbortController>();
    active.add(controller);
    this.active.set(input.grantId, active);
    const check = () => {
      joined.throwIfAborted();
      if (this.closed) throw new AuxError("cancelled", "Google operations are closed.");
      this.deps.grants.require(input);
      const run = this.deps.repo.getRun(input.runId);
      if (
        !run ||
        !["running", "planning"].includes(run.status) ||
        run.config?.privateTask ||
        (isReadOnlyProfile(run.config?.subagentProfile) && request.effect !== "read") ||
        (run.config?.agentProfile?.tools &&
          !run.config.agentProfile.tools.includes("*") &&
          !run.config.agentProfile.tools.includes("google_operation")) ||
        run.config?.taskId !== input.taskId ||
        run.config.taskRevision !== input.taskRevision ||
        (run.config.contextWorkspaceId && run.config.contextWorkspaceId !== input.workspaceId)
      )
        throw new AuxError("permission_denied", "The Google operation's original run or task retired.");
    };
    const invocationId = randomUUID(),
      startedAt = Date.now();
    let intent: WriteIntent | undefined,
      dispatched = false,
      completed = false,
      recordStarted = false;
    let expectedDocument: GoogleDocumentEditExpectation | undefined,
      verificationSha256: string | undefined,
      verificationRevision: string | undefined,
      verificationFormatting: ReturnType<typeof verifiedGoogleDocumentFormatting> | undefined;
    const operationId = `aux-google-${input.operation.replaceAll(".", "-")}`;
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
          requestDigest,
        },
        status,
        effectOutcome,
        startedAt,
        ...(status !== "running" ? { endedAt: Date.now() } : {}),
        ...(error ? { error } : {}),
      });
    try {
      check();
      const registered = this.deps.repo.getOperation("aux.connector.google", input.operation);
      if (
        registered &&
        (registered.operationId !== operationId ||
          registered.effectClass !== (request.effect === "read" ? "read" : "write"))
      )
        throw new AuxError("permission_denied", "The reserved Google operation registration changed.");
      if (!registered)
        this.deps.repo.saveOperation({
          operationId,
          siteKey: "aux.connector.google",
          name: input.operation,
          description: "Scoped Google REST operation",
          effectClass: request.effect === "read" ? "read" : "write",
        });
      record("running", "not-applicable");
      recordStarted = true;
      const result = await this.deps.accounts.withAccess(
        input.connectionId,
        input.accountRevision,
        GOOGLE_OPERATIONS[input.operation].scopes,
        joined,
        async (access) => {
          const current = () => {
            check();
            access.checkCurrent();
          };
          current();
          const deadline = AbortSignal.any([access.signal, AbortSignal.timeout(30_000)]);
          const read = async (spec: GoogleRequest, original = false) => {
            current();
            if (!original) {
              const recheck = await this.deps.authorize(
                {
                  ...input,
                  source: access.source,
                  effect: "read",
                  request: {
                    url: spec.url,
                    method: spec.method,
                    objectId: spec.objectId,
                    ...(spec.body ? { body: spec.body } : {}),
                    sha256: sha(
                      JSON.stringify([
                        input.runId,
                        input.taskId,
                        input.taskRevision,
                        input.workspaceId,
                        input.grantId,
                        input.actionId,
                        input.connectionId,
                        input.accountRevision,
                        spec.method,
                        spec.url,
                        spec.body ?? null,
                      ]),
                    ),
                  },
                },
                access.signal,
              );
              current();
              recheck();
            }
            current();
            if (original) dispatched = true;
            const response = await (this.deps.fetch ?? fetch)(spec.url, {
              method: spec.method,
              redirect: "error",
              signal: deadline,
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
                `Google request failed (${response.status}).`,
              );
            const value = await boundedObject(response, spec.limitBytes);
            current();
            return value;
          };
          const checkPreflight = async () => {
            if (!request.preflight) return;
            const value = await read(request.preflight);
            const observed =
              request.preflight.operation === "docs.read"
                ? value.revisionId
                : request.preflight.operation === "gmail.draft.read"
                  ? googleRawMessageHash(value)
                  : googleValuesHash(value.values ?? []);
            if (observed !== (request.expectedRevisionId ?? request.expectedPreflightHash))
              throw new AuxError(
                "conflict",
                "The original Google object changed. Read it again before editing or sending.",
              );
            return value;
          };
          const originalDocument = await checkPreflight();
          if (input.operation === "docs.edit")
            expectedDocument = prepareGoogleDocumentEdit(originalDocument!, input.args);
          if (input.operation === "gmail.reply" || input.operation === "gmail.replyAll") {
            const source = await read(
              prepareGoogleRequest(
                "gmail.message",
                { messageId: (input.args as { messageId: string }).messageId },
                input.actionId,
              ),
            );
            if (
              googleMessageHash(source) !==
              (input.args as { expectedSourceSha256: string }).expectedSourceSha256
            )
              throw new AuxError("conflict", "The original reply source changed. Read the message again.");
            request = prepareGoogleReply(
              input.operation,
              input.args,
              source,
              access.source.accountKey,
              input.actionId,
            );
            requestDigest = requestHash();
          }
          if (input.operation === "people.search") {
            const warmup = new URL(request.url);
            warmup.searchParams.set("query", "");
            await read({ ...request, url: warmup.href });
          }
          const authorization = await this.deps.authorize(
            {
              ...input,
              source: access.source,
              effect: request.effect,
              request: {
                url: request.url,
                method: request.method,
                objectId: request.objectId,
                ...(request.body ? { body: request.body } : {}),
                sha256: requestDigest,
              },
            },
            access.signal,
          );
          current();
          authorization();
          if (request.effect !== "read") {
            const begun = this.deps.writes.begin({
              runId: input.runId,
              pageId: `google:${input.connectionId}:${sha(request.objectId)}`,
              documentEpoch: 0,
              signature: requestDigest,
              revision: input.taskRevision,
              logicalActionId: `google:${input.runId}:${input.actionId}`,
              taskId: input.taskId,
              taskRevision: input.taskRevision,
              summary: {
                ops: [input.operation],
                beforeLineHashes: [requestDigest],
              },
            });
            if (begun.duplicate)
              throw new AuxError(
                "conflict",
                begun.intent.status === "pending" || begun.intent.status === "uncertain"
                  ? "The original Google write may have completed. Inspect its receipt before another action."
                  : "The original Google action already has a durable receipt.",
              );
            intent = begun.intent;
          }
          current();
          authorization();
          await checkPreflight();
          current();
          authorization();
          const value = await read(request, true);
          if (request.verify) {
            const observed = await read(request.verify);
            if (
              expectedDocument
                ? !verifyGoogleDocumentEdit(observed, expectedDocument)
                : input.operation === "sheets.write"
                  ? !verifyGoogleValuesWrite(
                      GoogleArguments["sheets.write"].parse(input.args),
                      value,
                      observed,
                    )
                  : request.expectedGrid
                    ? !verifyGoogleGrid(observed, request.expectedGrid)
                    : googleValuesHash(observed.values ?? []) !== googleValuesHash(request.expectedValues)
            )
              throw new AuxError(
                "conflict",
                "Google write was sent, but the resulting range could not be verified. Inspect the original receipt.",
              );
            if (expectedDocument)
              verificationFormatting = verifiedGoogleDocumentFormatting(observed, expectedDocument);
            verificationSha256 = sha(JSON.stringify(observed));
            if (typeof observed.revisionId === "string") verificationRevision = observed.revisionId;
          }
          if (request.effect !== "read") {
            const idRequired = input.operation.startsWith("gmail.") || input.operation === "docs.comment";
            const documentRequired = input.operation === "docs.edit";
            if (
              (idRequired && (typeof value.id !== "string" || !value.id)) ||
              (documentRequired && value.documentId !== (input.args as { documentId: string }).documentId)
            )
              throw new AuxError(
                "backend_unavailable",
                "Google did not confirm the original operation identity. Inspect its durable receipt.",
              );
          }
          if (intent)
            this.deps.writes.confirm(
              intent.id,
              JSON.stringify({
                operation: input.operation,
                requestDigest,
                providerObjectId: typeof value.id === "string" ? value.id : request.objectId,
                ...(verificationSha256 ? { verificationSha256 } : {}),
              }),
            );
          completed = true;
          current();
          authorization();
          let projected: Record<string, unknown> = { ...value };
          if (input.operation === "docs.read")
            projected = projectGoogleDocumentRange(value, GoogleArguments["docs.read"].parse(input.args));
          if (input.operation === "sheets.grid.read")
            projected = projectGoogleGrid(value, GoogleArguments["sheets.grid.read"].parse(input.args));
          if (expectedDocument)
            projected.verification = {
              scope: "api-body-ranges",
              sha256: verificationSha256,
              revisionId: verificationRevision,
              tabIds: [...expectedDocument.bodies.keys()],
              ...(verificationFormatting ? { formatting: verificationFormatting } : {}),
            };
          if (input.operation === "gmail.attachment") {
            if (!this.deps.saveAttachment)
              throw new AuxError("capability_unsupported", "Attachment artifact storage is unavailable.");
            if (typeof value.data !== "string" || !/^[A-Za-z0-9_-]*={0,2}$/.test(value.data))
              throw new AuxError("backend_unavailable", "Google returned invalid attachment bytes.");
            const bytes = Buffer.from(value.data, "base64url");
            if (
              bytes.length > 6_000_000 ||
              bytes.toString("base64url") !== value.data.replace(/=+$/, "") ||
              !Number.isSafeInteger(value.size) ||
              value.size !== bytes.length
            )
              throw new AuxError(
                "backend_unavailable",
                "Google attachment byte size or encoding could not be verified.",
              );
            const digest = createHash("sha256").update(bytes).digest("hex");
            let filename = `attachment-${digest.slice(0, 8)}.bin`,
              mediaType = "application/octet-stream";
            let admission: {
              status: "verified" | "unsupported";
              reason?: string;
            } = {
              status: "unsupported",
              reason: "Native attachment inspection is unavailable; original bytes retained.",
            };
            try {
              const metadata = await read(
                prepareGoogleRequest(
                  "gmail.message",
                  {
                    messageId: (input.args as { messageId: string }).messageId,
                  },
                  input.actionId,
                ),
              );
              const original = googleAttachmentMetadata(
                metadata,
                (input.args as { messageId: string }).messageId,
                (input.args as { attachmentId: string }).attachmentId,
              );
              filename = original.filename;
              if (original.size !== bytes.length)
                throw new AuxError(
                  "capability_unsupported",
                  "The provider attachment size did not match its original bytes.",
                );
              if (this.deps.inspectAttachment) {
                const inspected = await this.deps.inspectAttachment({
                  bytes: Buffer.from(bytes),
                  filename,
                  mediaType: original.mediaType,
                  sha256: digest,
                  signal: deadline,
                  checkCurrent: current,
                });
                current();
                if (
                  inspected.sourceSha256 !== digest ||
                  ![
                    "application/pdf",
                    "image/png",
                    "image/jpeg",
                    "image/webp",
                    "text/plain",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                  ].includes(inspected.mediaType)
                )
                  throw new AuxError(
                    "capability_unsupported",
                    "Native inspection did not verify the original attachment identity.",
                  );
                mediaType = inspected.mediaType;
                admission = { status: "verified" };
              }
            } catch (error) {
              current();
              admission = {
                status: "unsupported",
                reason:
                  error instanceof AuxError && error.code === "capability_unsupported"
                    ? error.message
                    : "Attachment metadata or native inspection was not verified; original bytes retained.",
              };
            }
            current();
            authorization();
            const artifact = this.deps.saveAttachment({
              runId: input.runId,
              bytes,
              sha256: digest,
              filename,
              mediaType,
              checkCurrent: () => {
                current();
                authorization();
              },
            });
            current();
            authorization();
            if (artifact.mediaType !== mediaType || artifact.size !== bytes.length)
              throw new AuxError(
                "backend_unavailable",
                "The saved attachment identity did not match its original bytes.",
              );
            projected = { ...artifact, sha256: digest, filename, admission };
          }
          if (input.operation === "gmail.draft.read") projected.messageSha256 = googleRawMessageHash(value);
          if (input.operation === "gmail.message") projected.sourceSha256 = googleMessageHash(value);
          if (input.operation === "sheets.read")
            projected.valuesSha256 = googleValuesHash(value.values ?? []);
          return {
            result: projected,
            source: {
              connectionId: input.connectionId,
              accountRevision: input.accountRevision,
              accountKey: access.source.accountKey,
              operation: input.operation,
              objectId: request.objectId,
              fetchedAt: Date.now(),
            },
          };
        },
      );
      record("completed", request.effect === "read" ? "observed" : "applied");
      return {
        invocationId,
        ...result,
        ...(intent ? { receiptId: intent.id } : {}),
      };
    } catch (error) {
      if (intent && !completed) {
        if (dispatched) this.deps.writes.fail(intent.id);
        else this.deps.writes.abortUndispatched(intent.id, "The original Google request did not dispatch.");
      }
      const failure =
        error instanceof AuxError
          ? error
          : new AuxError(
              joined.aborted ? "cancelled" : "backend_unavailable",
              dispatched && request.effect !== "read"
                ? "The Google write may have completed. Inspect the original receipt; it was not retried."
                : "The Google operation could not complete.",
            );
      if (recordStarted)
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
  retireGrant(grantId: string): void {
    for (const controller of this.active.get(grantId) ?? []) controller.abort();
  }
  async close(): Promise<void> {
    this.closed = true;
    this.unsubscribe();
    for (const controllers of this.active.values()) for (const controller of controllers) controller.abort();
    await Promise.allSettled(this.pending);
  }
}
