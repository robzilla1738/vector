import { describe, expect, it } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { projectedModelCostUsd, SpendLedger } from "@aux/runtime";
import { MockLanguageModelV4 } from "../../apps/runtime/node_modules/ai/dist/test/index.js";
import { GatewayModelClient } from "../../apps/runtime/src/agent/gateway-client.js";

describe("AI Gateway program spend", () => {
  it("persists reservations across readers and stops before the cumulative $50 cap", () => {
    const path = join(mkdtempSync(join(tmpdir(), "aux-spend-test-")), "ledger.sqlite");
    const first = new SpendLedger(path);
    const second = new SpendLedger(path);
    const reservation = first.reserve("smoke", "meta/muse-spark-1.3-contributor", 49.5);
    expect(second.summary().reservedUsd).toBe(49.5);
    expect(() => second.reserve("bench", "meta/muse-spark-1.3-contributor", 0.51)).toThrow(/program cap/);
    first.settle(reservation, 0.25);
    expect(second.summary()).toMatchObject({ committedUsd: 0.25, reservedUsd: 0, remainingUsd: 49.75 });
    const secondReservation = second.reserve("bench", "meta/muse-spark-1.3-contributor", 49.75);
    second.settle(secondReservation);
    expect(first.summary().remainingUsd).toBe(0);
    expect(() => first.reserve("smoke", "meta/muse-spark-1.3-contributor", 0.000001)).toThrow(/program cap/);
    first.close();
    second.close();
    const reopened = new SpendLedger(path);
    expect(reopened.summary().committedUsd).toBe(50);
    reopened.close();
  });

  it("requires known prices and a bounded output before allowing a Gateway call", () => {
    expect(projectedModelCostUsd("meta/muse-spark-1.3-contributor", 2048)).toBeGreaterThan(0.2);
    expect(() => projectedModelCostUsd("unknown/model", 2048)).toThrow(/projection unavailable/);
    expect(() => projectedModelCostUsd("meta/muse-spark-1.3-contributor", 0)).toThrow(/maxOutputTokens/);
  });

  it("blocks the model SDK before a call when the remaining program cap is too small", async () => {
    const path = join(mkdtempSync(join(tmpdir(), "aux-spend-gateway-")), "ledger.sqlite");
    const ledger = new SpendLedger(path);
    ledger.reserve("other-run", "meta/muse-spark-1.3-contributor", 49.9);
    const model = new MockLanguageModelV4({ doGenerate: {
      content: [{ type: "text", text: "hello" }],
      finishReason: { unified: "stop", raw: "stop" },
      usage: { inputTokens: { total: 10, noCache: 10, cacheRead: 0, cacheWrite: 0 }, outputTokens: { total: 2, text: 2, reasoning: 0 } },
      warnings: [],
    } });
    const client = new GatewayModelClient("fixture-only", { model: () => model, spendLedger: ledger });
    await expect(client.generateText({ modelId: "meta/muse-spark-1.3-contributor", prompt: "hello", maxOutputTokens: 32 }))
      .rejects.toThrow(/program cap/);
    expect(model.doGenerateCalls).toHaveLength(0);
    ledger.close();
  });
});
