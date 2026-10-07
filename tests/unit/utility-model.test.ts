import { afterEach, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { z } from "zod";
import { AuxError } from "@aux/contracts";
import { DEFAULT_UTILITY_MODEL_ID } from "@aux/contracts/model-registry";
import {
  openDb,
  Repo,
  EventBus,
  SettingsService,
  RunFundingService,
  resourceFundingAccounting,
  accountableUtilityModel,
  BudgetsService,
} from "@aux/runtime";
import type { ModelClient } from "../../apps/runtime/src/agent/model-client.js";
import { budgetLineage } from "../fixtures/budget-lineage.js";

const cleanups: (() => void)[] = [];
afterEach(() => {
  for (const cleanup of cleanups.splice(0).reverse()) cleanup();
});
function fixture() {
  const dir = mkdtempSync(join(tmpdir(), "aux-utility-"));
  const repo = new Repo(openDb(":memory:"));
  const events = new EventBus(repo);
  const settings = new SettingsService(repo, join(dir, "settings.json"), {});
  repo.saveRun({
    runId: "original",
    goal: "Classify a committed request",
    status: "running",
    pageIds: [],
    createdAt: Date.now(),
  });
  cleanups.push(() => {
    repo.close();
    rmSync(dir, { recursive: true, force: true });
  });
  const dispatch = vi.fn();
  let fail = false;
  let known = true;
  const transport: ModelClient = {
    async generateStructured<T>(opts: { schema: z.ZodType<T>; beforeDispatch?: () => Promise<void> }) {
      await opts.beforeDispatch?.();
      dispatch();
      if (fail) throw new Error("Provider connection ended without a usage receipt");
      return {
        object: opts.schema.parse({ kind: "chat" }),
        durationMs: 2,
        inputTokens: 12,
        outputTokens: 3,
        ...(known ? { providerMetadata: { gateway: { cost: "0.003" } } } : {}),
      };
    },
    async generateText(opts) {
      await opts.beforeDispatch?.();
      dispatch();
      return { text: "Working", durationMs: 2 };
    },
    async listModels() {
      return [];
    },
  };
  const checkOwner = vi.fn(async () => {});
  const authorize = vi.fn(async () => {});
  const release = vi.fn();
  const continueSpend = vi.fn(async (error: AuxError) => {
    throw error;
  });
  const budgets = new BudgetsService(repo.db, () => settings.budgetLimits(), budgetLineage(repo));
  const model = accountableUtilityModel({
    repo,
    events,
    settings,
    budgets,
    funding: new RunFundingService(
      repo,
      resourceFundingAccounting(repo),
      async () => settings.registryModels(),
      (runId) => budgets.resourceFundingScopes(runId),
    ),
    pauseFunding: async (error) => {
      throw error;
    },
    runId: "original",
    route: {
      kind: "network",
      model: transport,
      modelId: DEFAULT_UTILITY_MODEL_ID,
      provider: "gateway",
      destination: "https://ai-gateway.vercel.sh",
    },
    signal: new AbortController().signal,
    checkOwner,
    authorize,
    reserveCall: async () => release,
    continueSpend,
  });
  const request = {
    modelId: DEFAULT_UTILITY_MODEL_ID,
    system: "Classify the committed input.",
    prompt: "Summarize this page",
    maxOutputTokens: 64,
    schema: z.object({ kind: z.enum(["search", "chat"]) }),
  };
  return {
    repo,
    settings,
    dispatch,
    checkOwner,
    release,
    continueSpend,
    request,
    model,
    fail: () => {
      fail = true;
    },
    unknown: () => {
      known = false;
    },
  };
}
it("settles one original reservation with actual provider cost and tokens", async () => {
  const f = fixture();
  await expect(f.model.generateStructured(f.request)).resolves.toMatchObject({ object: { kind: "chat" } });
  expect(f.dispatch).toHaveBeenCalledTimes(1);
  expect(f.repo.listModelCalls("original")).toEqual([
    expect.objectContaining({
      runId: "original",
      costUsd: 0.003,
      costEstimated: false,
      inputTokens: 12,
      outputTokens: 3,
      providerMetadata: {
        aux: { kind: "utility_generation", provider: "gateway", destination: "https://ai-gateway.vercel.sh" },
      },
    }),
  ]);
});
it("never dispatches or invents a billed call after original ownership is retired", async () => {
  const f = fixture();
  f.checkOwner.mockRejectedValue(new AuxError("cancelled", "Original document retired"));
  await expect(f.model.generateStructured(f.request)).rejects.toMatchObject({ code: "cancelled" });
  expect(f.dispatch).not.toHaveBeenCalled();
  expect(f.repo.listModelCalls("original")).toEqual([]);
});
it("keeps an unknown provider attempt charged at its real conservative reservation", async () => {
  const f = fixture();
  f.fail();
  await expect(f.model.generateStructured(f.request)).rejects.toThrow("Provider connection ended");
  const calls = f.repo.listModelCalls("original");
  expect(calls).toHaveLength(1);
  expect(calls[0]!.costUsd).toBeGreaterThan(0);
  expect(calls[0]).toMatchObject({
    costEstimated: true,
    error: expect.stringContaining("Provider connection ended"),
  });
});
it("checks actual user spend before dispatch and leaves no false reservation on rejection", async () => {
  const f = fixture();
  await f.settings.set({ budgets: { dayUsd: 0.00000001 } });
  await expect(f.model.generateStructured(f.request)).rejects.toMatchObject({ code: "permission_denied" });
  expect(f.dispatch).not.toHaveBeenCalled();
  expect(f.repo.listModelCalls("original")).toEqual([]);
  expect(f.continueSpend).toHaveBeenCalledTimes(1);
  expect(f.release).toHaveBeenCalledTimes(1);
});
