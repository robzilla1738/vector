import { expect, it, vi } from "vitest";
import { AuxError } from "@aux/contracts";
import { memoryModelSource, memoryModelFetch } from "../../apps/runtime/dist/services/memory-model-source.js";
import { modelUndispatched } from "../../apps/runtime/dist/agent/model-client.js";
import { vercelModelClient } from "../../apps/runtime/dist/agent/vercel-model.js";
import { copilotModelClient } from "../../apps/runtime/dist/agent/copilot-model.js";
import type { SafetyDispatchGate } from "../../apps/runtime/src/safety/dispatch.js";
import { memoryTestJob } from "../fixtures/memory-model-job.js";

function fixture() {
  const job = memoryTestJob("dream");
  let generation = job.modelGeneration,
    current = true;
  const checkCurrent = () => {
    if (!current) throw new AuxError("cancelled", "Original Memory source retired.");
  };
  const safetyGate = {
    checkTrustedEffect: vi.fn<SafetyDispatchGate["checkTrustedEffect"]>(async () => undefined),
  };
  const source = memoryModelSource(job, {
    profileId: "actual-profile",
    checkCurrent,
    modelGeneration: () => generation,
    safetyGate,
  });
  return {
    job,
    source,
    safetyGate,
    retire: () => {
      current = false;
    },
    replaceModel: () => {
      generation = "replacement";
    },
  };
}
it("admits the original workspace job through governed egress without inventing a run or window", async () => {
  const f = fixture();
  await f.source.authorizeDestination("https://ai-gateway.vercel.sh");
  expect(f.source).not.toHaveProperty("runId");
  expect(f.source).not.toHaveProperty("nativeTurnContext");
  expect(f.safetyGate.checkTrustedEffect).toHaveBeenCalledWith(
    expect.objectContaining({
      profileId: "actual-profile",
      scope: { kind: "workspace", id: f.job.workspaceId },
      provenance: "memory",
      turnId: f.job.operationId,
      threadId: f.job.workspaceId,
      action: "agent.model.account",
      destination: "https://ai-gateway.vercel.sh",
    }),
    expect.objectContaining({ checkOwner: expect.any(Function) }),
  );
  expect(f.safetyGate.checkTrustedEffect.mock.calls[0]![0]).not.toHaveProperty("runId");
  f.replaceModel();
  await expect(f.source.authorizeDestination("https://ai-gateway.vercel.sh")).rejects.toThrow(
    "model changed",
  );
  expect(f.safetyGate.checkTrustedEffect).toHaveBeenCalledTimes(1);
});
it("fences source retirement during authorization and refuses nonlocal HTTP destinations", async () => {
  const f = fixture();
  f.safetyGate.checkTrustedEffect.mockImplementationOnce(async () => {
    f.retire();
    return undefined;
  });
  await expect(f.source.authorizeDestination("https://ai-gateway.vercel.sh")).rejects.toThrow(
    "source retired",
  );
  const live = fixture();
  await expect(live.source.authorizeDestination("http://remote.example")).rejects.toThrow(
    "HTTPS or loopback",
  );
  await live.source.authorizeDestination("http://127.0.0.1:1234");
  expect(live.safetyGate.checkTrustedEffect).toHaveBeenCalledTimes(1);
});
it("does not dispatch after Forget and retires an active response before exposing later bytes", async () => {
  const f = fixture();
  let stream: ReadableStreamDefaultController<Uint8Array>;
  const cancelled = vi.fn();
  const network = vi.fn<typeof fetch>(async (_input, init) => {
    expect(init?.redirect).toBe("error");
    return new Response(
      new ReadableStream<Uint8Array>({
        start(controller) {
          stream = controller;
        },
        cancel: cancelled,
      }),
    );
  });
  const transport = memoryModelFetch(f.source, network);
  const response = await transport("https://api.openai.com/v1/responses");
  const reader = response.body!.getReader();
  const pending = reader.read();
  f.retire();
  stream!.enqueue(new TextEncoder().encode("retired private content"));
  await expect(pending).rejects.toThrow("source retired");
  await Promise.resolve();
  expect(cancelled).toHaveBeenCalledOnce();
  const failure = await transport("https://api.openai.com/v1/responses").catch((error) => error);
  expect(modelUndispatched(failure)).toBe(true);
  expect(network).toHaveBeenCalledTimes(1);
});
it("requires an admitted job rather than a provider-supplied source object", () => {
  const f = fixture();
  expect(() => memoryModelFetch({ ...f.source })).toThrow("original admitted job");
});
it("uses Vercel's original account and checks the job after credential refresh", async () => {
  const f = fixture();
  const accessToken = vi.fn(async () => {
    f.retire();
    return "synthetic-secret";
  });
  const network = vi.fn<typeof fetch>();
  const model = vercelModelClient(
    async () => ({
      account: (id: string) => {
        expect(id).toBe("original-account");
        return { teamId: "actual-team" };
      },
      accessToken,
    }),
    "original-account",
    () => [{ id: "fixture-model", source: "configured" }],
    () => {},
    async (original) => {
      expect(original).toBe(f.source);
      await original.checkOriginal();
    },
    network,
  );
  const failure = await model
    .generateText({
      modelId: "fixture-model",
      prompt: "Owned Memory input",
      source: f.source,
      maxAttempts: 1,
    })
    .catch((error) => error);
  expect(failure).toBeInstanceOf(Error);
  expect(modelUndispatched(failure)).toBe(true);
  expect(accessToken).toHaveBeenCalledOnce();
  expect(network).not.toHaveBeenCalled();
});
it("refuses Copilot jobs before contacting its native run-owned helper", async () => {
  const f = fixture(),
    inference = vi.fn();
  const model = copilotModelClient(
    { inference },
    "account",
    () => [],
    async () => {},
  );
  const failure = await model
    .generateText({ modelId: "fixture-model", prompt: "Owned Memory input", source: f.source })
    .catch((error) => error);
  expect(failure).toMatchObject({ code: "capability_unsupported" });
  expect(modelUndispatched(failure)).toBe(true);
  expect(inference).not.toHaveBeenCalled();
});

it("aborts on connection retirement, joins original cleanup and removes the exact listener", async () => {
  const { withMemoryModelJob } = await import("../../apps/runtime/dist/services/memory-model-source.js");
  const f = fixture();
  let changed: () => void;
  let finish: () => void;
  let originalSignal: AbortSignal;
  let joined = false,
    settled = false;
  const unsubscribe = vi.fn();
  const cleanup = new Promise<void>((resolve) => {
    finish = resolve;
  });
  const work = withMemoryModelJob(
    f.job,
    {
      profileId: "actual-profile",
      signal: new AbortController().signal,
      checkCurrent: () => {},
      modelGeneration: () => f.job.modelGeneration,
      safetyGate: f.safetyGate,
      subscribeConnectionChanges: (callback) => {
        changed = callback;
        return unsubscribe;
      },
    },
    async (_source, signal) => {
      originalSignal = signal;
      await new Promise<void>((resolve) => signal.addEventListener("abort", () => resolve(), { once: true }));
      await cleanup;
      joined = true;
      signal.throwIfAborted();
    },
  );
  const outcome = work.then(
    () => {
      settled = true;
    },
    (error) => {
      settled = true;
      return error;
    },
  );
  changed!();
  expect(originalSignal!.aborted).toBe(true);
  await Promise.resolve();
  expect(settled).toBe(false);
  expect(unsubscribe).not.toHaveBeenCalled();
  finish!();
  expect(await outcome).toBeInstanceOf(DOMException);
  expect(joined).toBe(true);
  expect(unsubscribe).toHaveBeenCalledOnce();
});
it("retires job authority after completion even if a client retains the source", async () => {
  const { withMemoryModelJob } = await import("../../apps/runtime/dist/services/memory-model-source.js");
  const f = fixture();
  const unsubscribe = vi.fn();
  const source = await withMemoryModelJob(
    f.job,
    {
      profileId: "actual-profile",
      signal: new AbortController().signal,
      checkCurrent: () => {},
      modelGeneration: () => f.job.modelGeneration,
      safetyGate: f.safetyGate,
      subscribeConnectionChanges: () => unsubscribe,
    },
    async (original) => original,
  );
  expect(() => source.checkOriginal()).toThrow();
  await expect(source.authorizeDestination("https://api.openai.com")).rejects.toThrow();
  expect(f.safetyGate.checkTrustedEffect).not.toHaveBeenCalled();
  expect(unsubscribe).toHaveBeenCalledOnce();
});

it("keeps account preflight failures undispatched and preserves real completed usage before stale publication", async () => {
  const { memoryModelClient } = await import("../../apps/runtime/dist/services/memory-model-source.js");
  const { attemptsOf } = await import("../../apps/runtime/dist/agent/model-client.js");
  const f = fixture();
  const preflight = new AuxError("cancelled", "Account catalog ownership changed before inference.");
  const network = vi.fn<typeof fetch>(async () => Response.json({ ok: true }));
  const create = vi.fn((_transport: typeof fetch) => ({
    generateText: async () => {
      throw preflight;
    },
    generateStructured: async () => {
      throw preflight;
    },
    toolCallStep: async () => {
      throw preflight;
    },
    listModels: async () => [],
  }));
  const model = memoryModelClient(f.source, create, network);
  const denied = await model
    .generateText({ modelId: "fixture-model", source: f.source, prompt: "Owned Memory" })
    .catch((error) => error);
  expect(denied).toBe(preflight);
  expect(modelUndispatched(denied)).toBe(true);
  expect(network).not.toHaveBeenCalled();
  const completed = {
    text: "Private result",
    durationMs: 10,
    inputTokens: 120,
    outputTokens: 5,
    cachedInputTokens: 0,
  };
  const actual = memoryModelClient(
    f.source,
    (transport) => ({
      ...create(transport),
      generateText: async () => {
        await transport("https://api.openai.com/v1/responses", { method: "POST" });
        f.retire();
        return completed;
      },
    }),
    network,
  );
  const stale = await actual
    .generateText({ modelId: "fixture-model", source: f.source, prompt: "Owned Memory" })
    .catch((error) => error);
  expect(stale).toBeInstanceOf(Error);
  expect(modelUndispatched(stale)).toBe(false);
  expect(attemptsOf(stale)).toEqual([completed]);
  expect(network).toHaveBeenCalledOnce();
});
