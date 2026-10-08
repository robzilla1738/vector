import { randomUUID } from "node:crypto";
import { afterEach, expect, it } from "vitest";
import { openDb, Repo, BudgetsService } from "@aux/runtime";
import { PrivateBudgetClient, PrivateBudgetOwner } from "../../apps/runtime/dist/services/private-budget.js";
import { budgetLineage } from "../fixtures/budget-lineage.js";
const cleanup: Array<() => void | Promise<void>> = [];
afterEach(async () => {
  for (const close of cleanup.splice(0).reverse()) await close();
});
function fixture(dayUsd = 1) {
  const db = openDb(":memory:"),
    repo = new Repo(db),
    limits = { dayUsd, monthUsd: 10 };
  const budgets = new BudgetsService(db, () => limits, budgetLineage(repo));
  const owner = new PrivateBudgetOwner(repo, budgets);
  cleanup.push(
    () => db.close(),
    () => owner.close(),
  );
  const requests: unknown[] = [];
  const client = (sessionId = randomUUID()) =>
    new PrivateBudgetClient(async (request) => {
      requests.push(request);
      return owner.request(sessionId, request);
    });
  return { db, repo, budgets, owner, client, requests, limits };
}
it("shares atomic normal/private totals, preserves Continue headroom, and stores no private identity", async () => {
  const f = fixture(),
    a = f.client(),
    b = f.client();
  f.repo.saveModelCall({
    callId: randomUUID(),
    role: "agent",
    modelId: "ordinary",
    durationMs: 1,
    costUsd: 0.4,
    createdAt: Date.now(),
  });
  await a.reserve("private-run-url-prompt-sentinel", "model", 0.5);
  expect(f.budgets.spentDayUsd()).toBeCloseTo(0.9);
  await expect(b.reserve("private-sibling", "model", 0.2)).rejects.toMatchObject({
    code: "permission_denied",
    detail: { scope: "day", requiredUsd: 0.2 },
  });
  expect(JSON.stringify(f.requests)).not.toContain("private-run-url-prompt-sentinel");
  expect(JSON.stringify(f.db.prepare("SELECT * FROM private_spend").all())).not.toContain("sentinel");
  f.limits.dayUsd = 2;
  await b.refresh();
  expect(b.snapshot().find((w) => w.scope === "day")?.limitUsd).toBe(2);
  await b.reserve("private-sibling", "model", 0.2);
  await a.settle("private-run-url-prompt-sentinel", { costUsd: 0.3, costEstimated: false });
  await b.cancel("private-sibling");
  expect(f.budgets.spentDayUsd()).toBeCloseTo(0.7);
});
it("keeps uncertain resource usage charged and permits only the original later exact receipt", async () => {
  const f = fixture(),
    session = randomUUID(),
    leaseId = randomUUID();
  f.owner.request(session, { operation: "reserve", leaseId, kind: "resource", amountUsd: 0.2 });
  expect(() => f.owner.request(randomUUID(), { operation: "cancel", leaseId })).toThrow(/unavailable/);
  f.owner.request(session, { operation: "settle", leaseId, costEstimated: true });
  expect(f.budgets.spentDayUsd()).toBe(0.2);
  await expect(f.client().reserve("later", "model", 0.1)).rejects.toMatchObject({ code: "needs_input" });
  f.owner.request(session, { operation: "settle", leaseId, costUsd: 0.25, costEstimated: false });
  expect(f.budgets.spentDayUsd()).toBe(0.25);
  await f.client().reserve("local-zero", "model", 0);
  await expect(f.client().reserve("unknown", "model", undefined)).rejects.toMatchObject({
    code: "needs_input",
  });
});
it("a private close during reservation releases only the still-undispatched lease", async () => {
  const f = fixture();
  let send!: () => void;
  const session = randomUUID(),
    client = new PrivateBudgetClient(
      (request) =>
        new Promise((resolve) => {
          send = () => resolve(f.owner.request(session, request));
        }),
    );
  const pending = client.reserve("never-dispatched", "model", 0.5);
  const failed = expect(pending).rejects.toMatchObject({ code: "cancelled" });
  const closing = client.close();
  send();
  await new Promise((resolve) => setImmediate(resolve));
  send();
  await Promise.all([closing, failed]);
  expect(f.budgets.spentDayUsd()).toBe(0);
});

it("atomically replaces normal in-flight holds with invoices without granting a private sibling extra headroom", async () => {
  const f = fixture(),
    normal = f.owner.client(),
    privateClient = f.client();
  await normal.reserve("normal", "model", 0.7);
  await expect(privateClient.reserve("private", "model", 0.4)).rejects.toMatchObject({
    code: "permission_denied",
  });
  const invoice = {
    callId: randomUUID(),
    role: "agent" as const,
    modelId: "ordinary",
    durationMs: 1,
    costUsd: 0.6,
    createdAt: Date.now(),
  };
  expect(() =>
    normal.record("normal", () => {
      f.repo.saveModelCall(invoice);
      throw new Error("rollback");
    }),
  ).toThrow("rollback");
  expect(f.budgets.spentDayUsd()).toBeCloseTo(0.7);
  normal.record("normal", () => f.repo.saveModelCall(invoice));
  await normal.settle("normal", { costUsd: 0.6, costEstimated: false });
  expect(f.budgets.spentDayUsd()).toBeCloseTo(0.6);
  expect(f.db.prepare("SELECT * FROM private_spend").all()).toHaveLength(0);
  await privateClient.reserve("private", "model", 0.4);
  await expect(normal.reserve("normal-next", "model", 0.01)).rejects.toMatchObject({
    code: "permission_denied",
  });
  await Promise.all([normal.close(), privateClient.close()]);
});
