import { randomUUID } from "node:crypto";
import { setTimeout as sleep } from "node:timers/promises";
import { AuxError } from "@aux/contracts";
import {
  FOUNDATION_MODEL_ID,
  NativeFoundationReceiptSchema,
  NativeFoundationReadSchema,
  NativeFoundationStatusSchema,
  NativeFoundationStartParams,
} from "@aux/contracts/native-foundation-models";
import type { NativeBridge } from "../native.js";
import type { ModelClient, TextCallResult } from "../agent/model-client.js";
import type { ModelProvider } from "@aux/contracts";

export type NetworkUtilityRoute = {
  kind: "network";
  model: ModelClient;
  modelId: string;
  provider: ModelProvider;
  destination: string;
};
export type OnDeviceUtilityRoute = {
  kind: "on-device";
  model: ModelClient;
  modelId: typeof FOUNDATION_MODEL_ID;
};
export type UtilityRoute = NetworkUtilityRoute | OnDeviceUtilityRoute;
const methods = [
  "native.foundationModelsStatus",
  "native.foundationModelsStart",
  "native.foundationModelsRead",
  "native.foundationModelsCancel",
];

/** One original native bridge lifetime. Failures to join stay owned by this instance. */
export class FoundationModelsClient {
  private readonly closing = new AbortController();
  private readonly pending = new Set<Promise<unknown>>();
  private readonly cleanup = new Set<() => Promise<void>>();
  private closePromise?: Promise<void>;
  constructor(private readonly native: NativeBridge) {}
  async available(token: string): Promise<boolean> {
    this.closing.signal.throwIfAborted();
    if (
      !this.native.foundationModelsStatus ||
      !this.native.foundationModelsStart ||
      !this.native.foundationModelsRead ||
      !this.native.foundationModelsCancel ||
      !this.native.capabilities
    )
      return false;
    const capability = await this.native.capabilities();
    this.closing.signal.throwIfAborted();
    if (!methods.every((method) => capability.methods.includes(method))) return false;
    const status = NativeFoundationStatusSchema.parse(await this.native.foundationModelsStatus({ token }));
    this.closing.signal.throwIfAborted();
    return status.availability === "available";
  }
  route(token: string, checkOwner: () => void | Promise<void>): OnDeviceUtilityRoute {
    return {
      kind: "on-device",
      modelId: FOUNDATION_MODEL_ID,
      model: {
        generateText: (request) => this.track(this.generate(token, checkOwner, request)),
        generateStructured: async (request) => {
          if (request.imageDataUrls?.length)
            throw new AuxError("capability_unsupported", "The on-device utility model accepts text only.");
          // Schema conversion must complete BEFORE native admission. Validation of
          // the reply uses the original schema, including its refinements/transforms.
          const { z } = await import("zod");
          const schema = z.toJSONSchema(request.schema);
          const result = await this.track(
            this.generate(token, checkOwner, {
              ...request,
              system: `${request.system}\nReturn only valid JSON matching this schema: ${JSON.stringify(schema)}`,
            }),
          );
          return {
            ...result,
            object: request.schema.parse(JSON.parse(result.text)),
          };
        },
        listModels: async () => [{ id: FOUNDATION_MODEL_ID, name: "Apple on-device utility model" }],
      },
    };
  }
  private track<T>(operation: Promise<T>): Promise<T> {
    this.pending.add(operation);
    void operation.then(
      () => this.pending.delete(operation),
      () => this.pending.delete(operation),
    );
    return operation;
  }
  private async generate(
    token: string,
    checkOwner: () => void | Promise<void>,
    request: Parameters<ModelClient["generateText"]>[0],
  ): Promise<TextCallResult> {
    const signal = request.signal
      ? AbortSignal.any([request.signal, this.closing.signal])
      : this.closing.signal;
    signal.throwIfAborted();
    await checkOwner();
    signal.throwIfAborted();
    if (request.modelId !== FOUNDATION_MODEL_ID || request.imageDataUrl || request.imageDataUrls?.length)
      throw new AuxError(
        "capability_unsupported",
        "The on-device utility route accepts its original text model only.",
      );
    const maximum = request.maxOutputTokens ?? 128;
    if (!Number.isInteger(maximum) || maximum < 1 || maximum > 1_024)
      throw new AuxError("invalid_params", "The on-device response requires a bounded token limit.");
    const identity = { token, requestId: randomUUID() };
    let taskId: string | undefined;
    let prepareSent = false;
    const started = Date.now();
    let failure: unknown;
    let joining: Promise<void> | undefined;
    const join = (): Promise<void> => {
      if (!prepareSent) return Promise.resolve();
      let originalTaskId = taskId;
      return (joining ??= (async () => {
        try {
          while (true) {
            const receipt = NativeFoundationReceiptSchema.parse(
              await this.native.foundationModelsCancel!(
                originalTaskId ? { ...identity, taskId: originalTaskId } : { ...identity, prepare: true },
              ),
            );
            if (
              receipt.requestId !== identity.requestId ||
              (originalTaskId !== undefined && receipt.taskId !== originalTaskId) ||
              receipt.state !== "cancelled" ||
              (originalTaskId === undefined && !receipt.joined)
            )
              throw new AuxError(
                "permission_denied",
                "The original on-device cancellation receipt is unavailable.",
              );
            if (originalTaskId === undefined) originalTaskId = receipt.taskId;
            if (receipt.joined) {
              // Actual join is already proven. Lost reconciliation ACK cannot
              // become execution debt or adopt a different native handle.
              await this.native.foundationModelsCancel!({
                ...identity,
                taskId: originalTaskId,
                reconcile: true,
              }).catch(() => {});
              this.cleanup.delete(join);
              return;
            }
            await sleep(25);
          }
        } catch (error) {
          // Keep the original identity/closure, not merely its error. Only
          // this exact cleanup can retry after an uncertain cancellation ACK.
          joining = undefined;
          throw error;
        }
      })());
    };
    const reduce = () => {
      void join().catch(() => {});
    };
    try {
      prepareSent = true;
      this.cleanup.add(join);
      const prepared = NativeFoundationReceiptSchema.parse(
        await this.native.foundationModelsStart!({
          ...identity,
          prepare: true,
        }),
      );
      if (prepared.requestId !== identity.requestId || prepared.state !== "prepared" || !prepared.joined)
        throw new AuxError("permission_denied", "The original on-device reservation is unavailable.");
      taskId = prepared.taskId;
      signal.addEventListener("abort", reduce, { once: true });
      signal.throwIfAborted();
      await checkOwner();
      signal.throwIfAborted();
      const execution = NativeFoundationStartParams.parse({
        ...identity,
        taskId,
        instructions: request.system ?? "",
        prompt: request.prompt,
        maxResponseTokens: maximum,
      });
      await request.beforeDispatch?.();
      signal.throwIfAborted();
      await checkOwner();
      signal.throwIfAborted();
      const accepted = NativeFoundationReceiptSchema.parse(
        await this.native.foundationModelsStart!(execution),
      );
      if (
        accepted.requestId !== identity.requestId ||
        accepted.taskId !== taskId ||
        accepted.state !== "started"
      )
        throw new AuxError("permission_denied", "The original on-device acceptance is unavailable.");
      while (true) {
        signal.throwIfAborted();
        await checkOwner();
        signal.throwIfAborted();
        const result = NativeFoundationReadSchema.parse(
          await this.native.foundationModelsRead!({ ...identity, taskId }),
        );
        if (result.requestId !== identity.requestId || result.taskId !== taskId)
          throw new AuxError("permission_denied", "The on-device result belongs to another request.");
        await checkOwner();
        signal.throwIfAborted();
        if (result.state === "cancelled")
          throw new AuxError("cancelled", "The original on-device request retired.");
        if (result.state === "completed") {
          if (!result.joined || result.error || result.text === undefined)
            throw new AuxError(
              "backend_unavailable",
              "The on-device utility model could not complete this request.",
            );
          // Apple exposes no complete inference usage receipt here. Token
          // fields remain absent; tokenizer counts are not invented usage.
          return {
            text: result.text,
            durationMs: Date.now() - started,
            modelId: FOUNDATION_MODEL_ID,
          };
        }
        await sleep(25, undefined, { signal });
      }
    } catch (error) {
      failure = error;
      throw error;
    } finally {
      // A lost prepare ACK cannot execute, but its native reservation remains
      // owned. Reduce that exact request without a handle only while unexecuted;
      // executing tasks always retain their acknowledged original handle.
      try {
        await join();
      } catch (error) {
        throw new AggregateError(
          failure === undefined ? [error] : [failure, error],
          "The original on-device task join remains unresolved.",
        );
      } finally {
        signal.removeEventListener("abort", reduce);
      }
    }
  }
  close(): Promise<void> {
    if (this.closePromise) return this.closePromise;
    const closing = (async () => {
      this.closing.abort(new AuxError("cancelled", "The original on-device utility lifetime closed."));
      await Promise.allSettled(this.pending);
      const results = await Promise.allSettled(Array.from(this.cleanup, (join) => join()));
      const failures = results.flatMap((result) => (result.status === "rejected" ? [result.reason] : []));
      if (failures.length)
        throw new AggregateError(failures, "Original on-device cleanup remains unresolved.");
    })();
    this.closePromise = closing;
    void closing.catch(() => {
      // Closing remains aborted: only original cleanup can retry, never new work.
      if (this.closePromise === closing) this.closePromise = undefined;
    });
    return closing;
  }
}
