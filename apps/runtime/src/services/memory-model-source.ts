import type { z } from "zod";
import { createHash } from "node:crypto";
import { AuxError, EffectRequestSchema } from "@aux/contracts";
import {
  markModelUndispatched,
  withAttempts,
  type ModelAttempt,
  type ModelClient,
  type MemoryModelCallSource,
  type MemoryModelJob,
} from "../agent/model-client.js";
import { isLoopbackCompatibleEndpoint } from "../agent/direct-providers.js";
import type { SafetyDispatchGate } from "../safety/dispatch.js";

const admitted = new WeakMap<MemoryModelCallSource, () => void>();

/** Only the Memory pipeline may construct a job source; no window or run is borrowed. */
export function memoryModelSource(
  job: MemoryModelJob,
  deps: {
    profileId: string;
    checkCurrent(): void;
    modelGeneration(): string;
    safetyGate: Pick<SafetyDispatchGate, "checkTrustedEffect">;
  },
): MemoryModelCallSource {
  const identity = Object.freeze({ ...job });
  const current = () => {
    deps.checkCurrent();
    if (deps.modelGeneration() !== identity.modelGeneration)
      throw new AuxError("cancelled", "The original background Memory model changed.");
  };
  current();
  const source: MemoryModelCallSource = Object.freeze({
    ...identity,
    kind: "memory" as const,
    checkOriginal: current,
    authorizeDestination: async (origin: string) => {
      current();
      const destination = new URL(origin);
      if (
        (destination.protocol !== "https:" && !isLoopbackCompatibleEndpoint(origin)) ||
        destination.origin !== origin
      )
        throw new AuxError("permission_denied", "Memory requires its exact HTTPS or loopback model origin.");
      const scope = { kind: "workspace" as const, id: identity.workspaceId };
      await deps.safetyGate.checkTrustedEffect(
        EffectRequestSchema.parse({
          profileId: deps.profileId,
          scope,
          actor: "builtin_agent",
          effect: "egress",
          category: "external_tool",
          action: "agent.model.account",
          origin,
          destination: origin,
          provenance: "memory",
          invocationDigest: createHash("sha256")
            .update(JSON.stringify([identity, origin]))
            .digest("hex"),
          turnId: identity.operationId,
          threadId: identity.workspaceId,
          requestedAt: Date.now(),
        }),
        {
          profileId: deps.profileId,
          scope,
          actor: "builtin_agent",
          turnId: identity.operationId,
          threadId: identity.workspaceId,
          configuredModelDestination: origin,
          checkOwner: current,
        },
      );
      current();
    },
  });
  admitted.set(source, current);
  return source;
}

export function assertMemoryModelSource(source: MemoryModelCallSource): void {
  const current = admitted.get(source);
  if (!current)
    throw new AuxError("permission_denied", "Background Memory requires its original admitted job.");
  current();
}

/** The original job is checked at dispatch, every received chunk and final EOF. */
export function memoryModelFetch(source: MemoryModelCallSource, network: typeof fetch = fetch): typeof fetch {
  assertMemoryModelSource(source);
  return async (input, init) => {
    let dispatched = false;
    let response: Response | undefined;
    try {
      await source.checkOriginal();
      const url = new URL(input instanceof Request ? input.url : String(input));
      await source.authorizeDestination(url.origin);
      await source.checkOriginal();
      dispatched = true;
      response = await network(input, { ...init, redirect: "error" });
      await source.checkOriginal();
      if (!response.body) return response;
      return new Response(
        response.body.pipeThrough(
          new TransformStream<Uint8Array, Uint8Array>({
            async transform(chunk, controller) {
              await source.checkOriginal();
              controller.enqueue(chunk);
            },
            async flush() {
              await source.checkOriginal();
            },
          }),
        ),
        { status: response.status, statusText: response.statusText, headers: response.headers },
      );
    } catch (error) {
      await response?.body?.cancel().catch(() => {});
      throw dispatched ? error : markModelUndispatched(error);
    }
  };
}

/** Connection retirement aborts and joins the original request before removing its listener. */
export async function withMemoryModelJob<T>(
  job: MemoryModelJob,
  deps: Parameters<typeof memoryModelSource>[1] & {
    signal: AbortSignal;
    subscribeConnectionChanges(changed: () => void): () => void;
  },
  use: (source: MemoryModelCallSource, signal: AbortSignal) => Promise<T>,
): Promise<T> {
  const retirement = new AbortController();
  const unsubscribe = deps.subscribeConnectionChanges(() => retirement.abort());
  const signal = AbortSignal.any([deps.signal, retirement.signal]);
  try {
    const source = memoryModelSource(job, {
      ...deps,
      checkCurrent: () => {
        signal.throwIfAborted();
        deps.checkCurrent();
      },
    });
    return await use(source, signal);
  } finally {
    retirement.abort();
    unsubscribe();
  }
}

/** Financial admission follows the inference transport, including failed account/catalog preflight. */
export function memoryModelClient(
  source: MemoryModelCallSource,
  create: (network: typeof fetch) => ModelClient,
  network: typeof fetch = fetch,
): ModelClient {
  assertMemoryModelSource(source);
  async function call<T extends ModelAttempt & { retries?: ModelAttempt[] }>(
    options: { source?: import("../agent/model-client.js").ModelCallSource },
    use: (client: ModelClient) => Promise<T>,
  ): Promise<T> {
    let dispatched = false;
    let completed: T | undefined;
    try {
      if (options.source !== source)
        throw new AuxError("permission_denied", "Memory inference requires this exact original job.");
      await source.checkOriginal();
      const client = create(
        memoryModelFetch(source, async (input, init) => {
          dispatched = true;
          return network(input, init);
        }),
      );
      completed = await use(client);
      await source.checkOriginal();
      return completed;
    } catch (error) {
      if (completed) withAttempts(error, [...(completed.retries ?? []), completed]);
      throw dispatched ? error : markModelUndispatched(error);
    }
  }
  return {
    generateStructured: <T>(
      options: Parameters<ModelClient["generateStructured"]>[0] & { schema: z.ZodType<T> },
    ) => call(options, (client) => client.generateStructured<T>(options)),
    streamStructured: <T>(
      options: Parameters<NonNullable<ModelClient["streamStructured"]>>[0] & { schema: z.ZodType<T> },
    ) =>
      call(options, (client) => {
        if (!client.streamStructured)
          throw new AuxError("capability_unsupported", "This Memory model cannot stream structured output.");
        return client.streamStructured<T>(options);
      }),
    generateText: (options) => call(options, (client) => client.generateText(options)),
    listModels: async () => {
      await source.checkOriginal();
      return create(memoryModelFetch(source, network)).listModels();
    },
  };
}
