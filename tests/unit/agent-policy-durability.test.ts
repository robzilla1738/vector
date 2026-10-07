import { afterEach, expect, it } from "vitest";
import { openDb, Repo, SettingsService } from "@aux/runtime";
const databases: ReturnType<typeof openDb>[] = [];
afterEach(() => {
  for (const db of databases.splice(0)) db.close();
});
function fixture() {
  const db = openDb(":memory:");
  databases.push(db);
  const repo = new Repo(db);
  return () => new SettingsService(repo, "/nonexistent/agent-policy-durability.json", {});
}
it("keeps one durable policy revision across windows and refuses stale overwrite atomically", async () => {
  const create = fixture(),
    a = create(),
    b = create();
  expect(a.agentPolicy()).toEqual({ agentMode: "ask", agentPolicyRevision: 0, agentPolicies: [] });
  const policies = [{ category: "send" as const, site: "https://example.test", access: "ask" as const }];
  await a.set({ agentPolicies: policies, agentPolicyRevision: 0 });
  await expect(b.set({ agentPolicies: [], agentPolicyRevision: 0 })).rejects.toMatchObject({
    code: "conflict",
  });
  expect(create().agentPolicy()).toEqual({
    agentMode: "ask",
    agentPolicyRevision: 1,
    agentPolicies: policies,
  });
  await b.set({ agentPolicies: [], agentPolicyRevision: 1 });
  expect(a.agentPolicy().agentPolicyRevision).toBe(2);
});
it("refuses malformed and duplicate site/category policies before changing durable state", async () => {
  const create = fixture(),
    settings = create();
  await expect(
    settings.set({
      agentPolicies: [{ category: "read", site: "https://example.test/path", access: "allow" }],
      agentPolicyRevision: 0,
    }),
  ).rejects.toThrow();
  const rule = { category: "read" as const, site: "https://example.test", access: "allow" as const };
  await expect(settings.set({ agentPolicies: [rule, rule], agentPolicyRevision: 0 })).rejects.toThrow();
  expect(settings.agentPolicy()).toEqual({ agentMode: "ask", agentPolicyRevision: 0, agentPolicies: [] });
});

it("remembers Skip confirmation across settings service recreation", async () => {
  const create = fixture();
  await create().set({ agentMode: "full", agentPolicyRevision: 0 });
  expect(create().agentPolicy().agentMode).toBe("full");
  await create().set({ agentMode: "ask", agentPolicyRevision: 1 });
  expect(create().agentPolicy().agentMode).toBe("ask");
});
