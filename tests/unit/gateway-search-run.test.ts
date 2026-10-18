import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it, vi } from "vitest";
import {
  ArtifactStore,
  EventBus,
  MockModelClient,
  openDb,
  Repo,
  RunService,
  SettingsService,
} from "@aux/runtime";
import { WebSearchInputSchema } from "@aux/contracts/web-search";
import { normalizeGatewaySearch } from "../../apps/runtime/src/agent/gateway-search.js";
import { SetService } from "../../apps/runtime/src/services/sets.js";
import type { PageService } from "../../apps/runtime/src/services/pages.js";
import { DocumentSnapshots } from "../../apps/runtime/src/services/document-snapshots.js";
import type { ModelClient } from "../../apps/runtime/src/agent/model-client.js";
import { fixtureTurnMentions } from "../fixtures/turn-mentions.js";

it("uses the actual running control and invoices search there, then rejects old account generation", async () => {
  const directory = mkdtempSync(join(tmpdir(), "aux-search-run-"));
  const repo = new Repo(openDb(":memory:"));
  const events = new EventBus(repo);
  const settings = new SettingsService(repo, join(directory, "settings.json"), {});
  let generation = "original-account";
  vi.spyOn(settings, "modelCacheGeneration").mockImplementation(() => generation);
  const model: ModelClient = new MockModelClient();
  let entered!: () => void;
  const started = new Promise<void>((resolve) => {
    entered = resolve;
  });
  model.toolCallStep = async ({ signal }) => {
    entered();
    await new Promise<void>((_, reject) => {
      if (signal?.aborted) reject(signal.reason);
      else signal?.addEventListener("abort", () => reject(signal.reason), { once: true });
    });
    throw new Error("Original loop retired");
  };
  const search = vi.fn(
    async (
      opts: Parameters<
        NonNullable<import("../../apps/runtime/src/agent/model-client.js").ModelClient["searchWeb"]>
      >[0],
    ) => {
      await opts.beforeDispatch?.();
      return {
        durationMs: 1,
        inputTokens: 9,
        outputTokens: 2,
        cachedInputTokens: 0,
        result: normalizeGatewaySearch({
          request: opts.request,
          executions: [
            {
              toolCallId: "actual-call",
              input: { query: opts.request.query },
              output: { requestId: "actual-request", costDollars: { total: 0 }, results: [] },
            },
          ],
          gatewayCost: "0",
        }),
        providerMetadata: {
          gateway: { cost: "0" },
          aux: {
            gatewaySearch: { providerSearchCostUsd: 0, searchCostIncludedInGatewayTotal: "not-verified" },
          },
        },
      };
    },
  );
  const searchModel = Object.assign(model, { searchWeb: search });
  vi.spyOn(settings, "model").mockReturnValue(searchModel);
  const pages = {} as PageService;
  const runs = new RunService({
    documentSnapshots: new DocumentSnapshots(repo),
    repo,
    events,
    settings,
    pages,
    turnMentions: fixtureTurnMentions(() => undefined),
    sets: new SetService(repo, events, pages),
    artifacts: new ArtifactStore(join(directory, "artifacts"), repo, events),
    nativeAvailable: () => false,
  });
  try {
    const run = await runs.coordinator.start({ goal: "Search actual admitted sources", pageIds: [] });
    await started;
    const authorize = vi.fn(async () => {});
    const input = {
      runId: run.runId,
      request: WebSearchInputSchema.parse({ query: "original query", provider: "exa" }),
      model: searchModel,
      modelGeneration: generation,
      signal: new AbortController().signal,
      checkOwner: () => {},
      authorize,
    };
    expect((await runs.searchWeb(input)).backend).toBe("gateway");
    expect(search).toHaveBeenCalledTimes(1);
    expect(authorize).toHaveBeenCalled();
    expect(repo.listModelCalls(run.runId)).toContainEqual(
      expect.objectContaining({
        runId: run.runId,
        inputTokens: 9,
        outputTokens: 2,
        costUsd: 0,
        providerMetadata: expect.objectContaining({ usage: { cachedInputTokens: 0 } }),
      }),
    );
    generation = "other-account";
    await expect(runs.searchWeb(input)).rejects.toThrow(/model, account or policy changed/);
    expect(search).toHaveBeenCalledTimes(1);
    await runs.cancel(run.runId);
    await expect(runs.searchWeb({ ...input, modelGeneration: generation })).rejects.toThrow(
      /execution retired/,
    );
    expect(search).toHaveBeenCalledTimes(1);
  } finally {
    await runs.close();
    repo.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
