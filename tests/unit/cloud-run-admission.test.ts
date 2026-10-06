import { afterEach, expect, it, vi } from "vitest";
import { Repo, openDb } from "@aux/runtime";
import type { NativeBridge } from "@aux/runtime";
import type { TurnMentionService } from "../../apps/runtime/dist/services/turn-mention-service.js";
import { CloudRunAdmission } from "../../apps/runtime/dist/services/cloud-run-admission.js";
import { cloudQuoteIdentity } from "../../apps/runtime/dist/services/cloud-resource-quote.js";
import type { CloudResourceQuote, EffectRequest } from "@aux/contracts";

const cleanup: (() => void)[] = [];
afterEach(() => {
  for (const close of cleanup.splice(0)) close();
});
const quote: CloudResourceQuote = {
  revision: 1,
  accountDigest: "a".repeat(64),
  region: "iad1",
  vcpus: 1,
  timeoutMs: 60_000,
  rates: {
    creationUsd: 0.0000006,
    cpuUsdPerCoreHour: 0.128,
    memoryUsdPerGBHour: 0.0212,
    outboundUsdPerGB: 0.15,
  },
  rateBasis: "public-estimate",
  rateSource: "https://vercel.com/docs/sandbox/pricing",
};
function fixture() {
  const db = openDb(":memory:");
  cleanup.push(() => db.close());
  const repo = new Repo(db);
  repo.saveRun({
    runId: "cloud-run",
    goal: "Original cloud turn",
    status: "running",
    pageIds: [],
    createdAt: Date.now(),
    config: { executionTarget: "cloud", nativeTurnContext: "source-token", chatId: "original-chat" },
  });
  let sourceToken = Symbol("original-turn");
  const readSource = vi.fn(async () => ({ windowId: "original-window", activePageId: null }));
  const money = vi.fn(async (_request: EffectRequest) => {});
  const admission = new CloudRunAdmission({
    repo,
    native: { turnSourceContext: readSource } as unknown as NativeBridge,
    turns: { capture: () => sourceToken } as unknown as TurnMentionService,
    profileId: "disposable",
    taskRevision: () => 0,
    checkMoney: money,
  });
  const ctx = { runId: "cloud-run", threadId: "original-chat", turnId: "cloud-run" };
  return {
    repo,
    admission,
    ctx,
    money,
    readSource,
    retire: () => {
      sourceToken = Symbol("replacement-turn");
    },
  };
}
it("rejects source retirement during native admission without consuming money authorization", async () => {
  const f = fixture();
  f.readSource.mockImplementationOnce(async () => {
    f.retire();
    return { windowId: "original-window", activePageId: null };
  });
  await expect(
    f.admission.authorizeCreate(f.ctx, quote, cloudQuoteIdentity(quote).digest),
  ).rejects.toMatchObject({ code: "ref_stale" });
  expect(f.money).not.toHaveBeenCalled();
});
it("binds money approval to the reviewed quote and original window across a parked review", async () => {
  const f = fixture();
  await f.admission.assertOwner(f.ctx);
  await expect(f.admission.authorizeCreate(f.ctx, quote, "b".repeat(64))).rejects.toMatchObject({
    code: "ref_stale",
  });
  expect(f.money).not.toHaveBeenCalled();
  const original = f.repo.getRun(f.ctx.runId)!;
  f.repo.saveRun({ ...original, status: "needs_input" });
  await expect(f.admission.assertOriginal(f.ctx)).resolves.toBeUndefined();
  await expect(f.admission.assertOwner(f.ctx)).rejects.toMatchObject({ code: "cancelled" });
  f.repo.saveRun(original);
  f.money.mockImplementationOnce(async () => {
    f.readSource.mockResolvedValue({ windowId: "replacement-window", activePageId: null });
  });
  await expect(
    f.admission.authorizeCreate(f.ctx, quote, cloudQuoteIdentity(quote).digest),
  ).rejects.toMatchObject({ code: "ref_stale" });
  expect(f.money).toHaveBeenCalledOnce();
  expect(f.money.mock.calls[0]?.[0]).toMatchObject({
    category: "purchase",
    action: "agent.cloud.create",
    runId: f.ctx.runId,
    threadId: f.ctx.threadId,
  });
});
