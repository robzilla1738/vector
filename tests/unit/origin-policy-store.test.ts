import { afterEach, expect, it } from "vitest";
import { openDb } from "../../apps/runtime/src/store/db.js";
import { Repo } from "../../apps/runtime/src/store/repo.js";
import { OriginPolicyStore } from "../../apps/runtime/src/safety/origin-policy-store.js";
const databases: ReturnType<typeof openDb>[] = [];
afterEach(() => {
  for (const db of databases.splice(0)) db.close();
});
it("keeps one durable revision across windows and refuses stale overwrite atomically", () => {
  const db = openDb(":memory:");
  databases.push(db);
  const repo = new Repo(db),
    a = new OriginPolicyStore(repo),
    b = new OriginPolicyStore(repo);
  expect(a.list()).toEqual({ revision: 0, rules: [] });
  const rules = [{ origin: "https://example.test/", access: "ask" as const }];
  expect(a.set({ expectedRevision: 0, rules })).toEqual({ revision: 1, rules });
  expect(() => b.set({ expectedRevision: 0, rules: [] })).toThrow("changed in another window");
  expect(new OriginPolicyStore(repo).list()).toEqual({ revision: 1, rules });
  expect(b.set({ expectedRevision: 1, rules: [] })).toEqual({ revision: 2, rules: [] });
});
it("refuses malformed and duplicate origins before changing durable state", () => {
  const db = openDb(":memory:");
  databases.push(db);
  const store = new OriginPolicyStore(new Repo(db));
  expect(() =>
    store.set({ expectedRevision: 0, rules: [{ origin: "https://example.test/path", access: "allow" }] }),
  ).toThrow();
  const rule = { origin: "https://example.test/", access: "allow" };
  expect(() => store.set({ expectedRevision: 0, rules: [rule, rule] })).toThrow();
  expect(store.list()).toEqual({ revision: 0, rules: [] });
});
