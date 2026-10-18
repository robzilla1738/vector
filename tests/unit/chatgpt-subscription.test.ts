import type { EffectRequest } from "@aux/contracts";
import { afterEach, expect, it, vi } from "vitest";
import { MODEL_REGISTRY } from "@aux/contracts/model-registry";
import { budgetLineage } from "../fixtures/budget-lineage.js";
import { randomUUID } from "node:crypto";
import {
  ChatgptAccounts,
  chatgptAccountId,
  chatgptRequest,
  chatgptCompletionStream,
  chatgptModelClient,
  parseChatgptModels,
  modelCallCost,
  openDb,
  Repo,
  BudgetsService,
  summarizeModelUsage,
} from "@aux/runtime";

const cleanups: Array<() => Promise<void>> = [];
afterEach(async () => {
  for (const close of cleanups.splice(0)) await close();
});
const clientId = "oaiapp_aux_fixture",
  subject = "fixture-account",
  accountId = chatgptAccountId(clientId, subject);
function credentials(expiresAt = Date.now() + 3600000) {
  return {
    accountId,
    clientId,
    subject,
    email: "fixture@example.test",
    accessToken: "synthetic-access",
    refreshToken: "synthetic-refresh",
    idToken: "synthetic-id",
    expiresAt,
    scopes: ["chatgpt.tokens.use.direct", "resource.invoke"],
  };
}
async function accountsFixture(expiry?: number) {
  const hostId = randomUUID();
  let value =
    expiry === undefined
      ? undefined
      : JSON.stringify({ version: 1, hostId, selected: accountId, accounts: [credentials(expiry)] });
  const native = {
    readSecret: vi.fn(async () => ({ value })),
    storeSecret: vi.fn(async (_key: string, next: string) => {
      value = next;
      return { ok: true as const };
    }),
  };
  const accounts = new ChatgptAccounts(native, hostId);
  await accounts.initialize();
  cleanups.push(() => accounts.close());
  return { accounts, native, hostId, read: () => value };
}
it("projects only supported subscription options and preserves the account catalog order", () => {
  const projected = chatgptRequest({
    model: "account-model",
    input: [{ role: "system", content: "governed tools" }],
    store: true,
    stream: false,
    max_output_tokens: 8000,
    temperature: 0,
    metadata: { unsafe: "account" },
    previous_response_id: "old",
    tools: [{ type: "namespace", name: "aux", tools: [] }],
  });
  expect(projected).toEqual({
    model: "account-model",
    input: [{ role: "developer", content: "governed tools" }],
    store: false,
    stream: true,
    tools: [{ type: "namespace", name: "aux", tools: [] }],
  });
  expect(() => chatgptRequest({ model: "m", input: [], tools: [{ type: "image_generation" }] })).toThrow(
    /hosted tool/,
  );
  expect(
    parseChatgptModels({
      models: [
        { slug: "second", display_name: "Second", visibility: "list" },
        { slug: "hidden", visibility: "hidden" },
        { slug: "first", visibility: "list" },
      ],
    }).map((m) => m.id),
  ).toEqual(["second", "first"]);
});

it("requires response.completed after streamed text rather than accepting incomplete or interrupted output", async () => {
  const response = (events: unknown[]) =>
    new Response(events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join(""));
  const partial = { type: "response.output_text.delta", delta: "partial" };
  const good = response([partial, { type: "response.completed" }]);
  expect(await new Response(chatgptCompletionStream(good.body!)).text()).toContain("partial");
  const interrupted = response([partial]);
  await expect(new Response(chatgptCompletionStream(interrupted.body!)).text()).rejects.toThrow(
    /without a completed/,
  );
  const incomplete = response([partial, { type: "response.incomplete" }]);
  await expect(new Response(chatgptCompletionStream(incomplete.body!)).text()).rejects.toThrow(/incomplete/);
});

it("keeps subscription utility USD unresolved while preserving real tokens and blocking later finite spend", () => {
  const db = openDb(":memory:");
  try {
    const repo = new Repo(db),
      runId = "original-subscription-run";
    repo.saveRun({
      runId,
      goal: "Original subscription work",
      status: "running",
      pageIds: [],
      createdAt: Date.now(),
    });
    repo.saveModelCall({
      callId: "original-call",
      runId,
      role: "agent",
      modelId: "subscription-model",
      durationMs: 0,
      costUsd: 1,
      costEstimated: true,
      createdAt: Date.now(),
    });
    repo.settleModelCall("original-call", runId, {
      costEstimated: true,
      durationMs: 2,
      inputTokens: 4,
      outputTokens: 5,
    });
    expect(repo.listModelCalls(runId)[0]).toMatchObject({
      inputTokens: 4,
      outputTokens: 5,
      costEstimated: true,
    });
    expect(repo.listModelCalls(runId)[0]?.costUsd).toBeUndefined();
    expect(summarizeModelUsage(repo.listModelCalls(runId))).toMatchObject({
      knownCostUsd: 0,
      costComplete: false,
      inputTokens: 4,
      outputTokens: 5,
    });
    const budgets = new BudgetsService(db, () => ({ runUsd: 5 }), budgetLineage(repo));
    expect(() => budgets.assertWithin({ runId })).toThrow(/unresolved|unknown/);
  } finally {
    db.close();
  }
});

it.each(["ordinary", "memory"] as const)(
  "uses actual streamed Responses for %s and a selected protected account through the installed SDK",
  async (kind) => {
    const f = await accountsFixture(Date.now() + 3600000);
    const priced = MODEL_REGISTRY.find(
      (model) =>
        model.id.startsWith("openai/") &&
        model.inputUsdPerMTok !== undefined &&
        model.outputUsdPerMTok !== undefined,
    );
    if (!priced) throw new Error("Fixture requires a genuine priced API snapshot entry.");
    const modelId = priced.id;
    expect(
      modelCallCost(modelId, {
        inputTokens: 4,
        outputTokens: 5,
        providerMetadata: { aux: { billing: "chatgpt-plan" } },
      }).costUsd,
    ).toBeGreaterThan(0);
    const events = [
      { type: "response.created", response: { id: "response", created_at: 1, model: modelId } },
      { type: "response.output_item.added", output_index: 0, item: { type: "message", id: "message" } },
      { type: "response.output_text.delta", item_id: "message", output_index: 0, delta: '{"ok":true}' },
      {
        type: "response.output_item.done",
        output_index: 0,
        item: {
          type: "message",
          id: "message",
          role: "assistant",
          content: [{ type: "output_text", text: '{"ok":true}', annotations: [] }],
        },
      },
      {
        type: "response.completed",
        response: {
          incomplete_details: null,
          usage: {
            input_tokens: 4,
            output_tokens: 5,
            input_tokens_details: { cached_tokens: 0 },
            output_tokens_details: { reasoning_tokens: 0 },
          },
        },
      },
    ];
    const network = vi.fn<typeof fetch>(async (input, init) => {
      expect(String(input)).toBe("https://api.openai.com/v1/responses");
      expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer synthetic-access");
      const body = JSON.parse(String(init?.body));
      expect(body.store).toBe(false);
      expect(body.stream).toBe(true);
      expect(body).not.toHaveProperty("max_output_tokens");
      return new Response(events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join(""), {
        headers: { "content-type": "text/event-stream" },
      });
    });
    const { memoryModelSource, memoryModelFetch } =
      await import("../../apps/runtime/dist/services/memory-model-source.js");
    const { memoryTestJob } = await import("../fixtures/memory-model-job.js");
    const job = memoryTestJob("dream");
    const gate = vi.fn(async (_request: EffectRequest) => undefined);
    const source =
      kind === "memory"
        ? memoryModelSource(job, {
            profileId: "actual-profile",
            modelGeneration: () => job.modelGeneration,
            checkCurrent: () => {},
            safetyGate: { checkTrustedEffect: gate },
          })
        : undefined;
    const model = chatgptModelClient(
      f.accounts,
      accountId,
      () => [{ id: modelId, source: "catalog" }],
      async () => {},
      () => {},
      source ? memoryModelFetch(source, network) : network,
    );
    const { z } = await import("zod");
    const result = await model.generateStructured({
      modelId: modelId,
      source,
      system: "Return JSON",
      prompt: "Return ok true",
      schema: z.object({ ok: z.boolean() }),
    });
    expect(result.object).toEqual({ ok: true });
    expect(result.cachedInputTokens).toBe(0);
    const admissions = gate.mock.calls.map(([request]) => ({
      provenance: request.provenance,
      turnId: request.turnId,
      destination: request.destination,
    }));
    expect(admissions).toEqual(
      source
        ? [
            {
              provenance: "memory",
              turnId: job.operationId,
              destination: "https://api.openai.com",
            },
          ]
        : [],
    );
    expect(modelCallCost(result.resolvedModelId ?? modelId, result)).toEqual({});
    expect(network).toHaveBeenCalledOnce();
  },
);
