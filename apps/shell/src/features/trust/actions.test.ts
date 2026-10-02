// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { bridge } from "../../bridge";
import { setSiteAccess, deleteSiteRule, DEFAULT_SITE_ACCESS } from "./actions";
afterEach(() => vi.restoreAllMocks());
it("changes one site effect while preserving the other defaults and the captured revision", async () => {
  const invoke = vi
    .spyOn(bridge, "invoke")
    .mockImplementation(async (method) =>
      method === "safety.originPolicies.list" ? { revision: 7, rules: [] } : { revision: 8, rules: [] },
    );
  await setSiteAccess({
    origin: "https://fixture.test/",
    effect: "write",
    access: "deny",
    expectedRevision: 7,
  });
  expect(invoke).toHaveBeenCalledWith("safety.originPolicies.set", {
    expectedRevision: 7,
    rules: [
      {
        origin: "https://fixture.test/",
        access: "allow",
        confirmation: "none",
        effects: { ...DEFAULT_SITE_ACCESS, write: "deny" },
      },
    ],
  });
});
it("refuses a stale site edit or deletion before making a mutation RPC", async () => {
  const invoke = vi.spyOn(bridge, "invoke").mockResolvedValue({ revision: 8, rules: [] });
  await expect(
    setSiteAccess({ origin: "https://fixture.test/", effect: "write", access: "allow", expectedRevision: 7 }),
  ).rejects.toThrow(/another window/);
  await expect(deleteSiteRule({ origin: "https://fixture.test/", expectedRevision: 7 })).rejects.toThrow(
    /another window/,
  );
  expect(invoke).toHaveBeenCalledTimes(2);
  expect(invoke.mock.calls.every(([method]) => method === "safety.originPolicies.list")).toBe(true);
});
it("keeps a site's stricter existing policy and the other origins when editing one effect", async () => {
  const rule = {
    origin: "https://fixture.test/",
    access: "ask" as const,
    confirmation: "handoff" as const,
    effects: { read: "deny" as const },
  };
  const other = { origin: "https://other.test/", access: "deny" as const };
  const invoke = vi
    .spyOn(bridge, "invoke")
    .mockImplementation(async (method) =>
      method === "safety.originPolicies.list"
        ? { revision: 7, rules: [rule, other] }
        : { revision: 8, rules: [] },
    );
  await setSiteAccess({ origin: rule.origin, effect: "write", access: "allow", expectedRevision: 7 });
  expect(invoke).toHaveBeenCalledWith("safety.originPolicies.set", {
    expectedRevision: 7,
    rules: [other, { ...rule, effects: { read: "deny", write: "allow" } }],
  });
});
