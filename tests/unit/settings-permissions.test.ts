import { openDb, Repo } from "@aux/runtime";
import { expect, it, vi } from "vitest";
import { settingsMethods } from "../../apps/runtime/src/api/methods/settings.js";
import type { MethodCtx } from "../../apps/runtime/src/api/methods/context.js";

it.each(["originPolicies", "effectGrants", "safetyCeilings"])(
  "refuses external %s changes before mutation",
  async (key) => {
    const set = vi.fn();
    const ctx = {
      params: { [key]: [] },
      client: { external: true },
      s: { settings: { set } },
    } as unknown as MethodCtx;
    await expect(settingsMethods["settings.set"]!(ctx)).rejects.toMatchObject({ code: "permission_denied" });
    expect(set).not.toHaveBeenCalled();
  },
);

it("allows the person to update effect grants through the shell", async () => {
  const repo = new Repo(openDb(":memory:"));
  const patch = { effectGrants: ["effect:read"] };
  const set = vi.fn(async () => ({ ok: true }));
  const emit = vi.fn();
  const ctx = {
    params: patch,
    client: { external: false },
    s: {
      repo,
      settings: { set, all: () => patch },
      runs: { refreshPool: vi.fn() },
      events: { emit },
    },
  } as unknown as MethodCtx;
  await expect(settingsMethods["settings.set"]!(ctx)).resolves.toEqual({ ok: true });
  expect(set).toHaveBeenCalledWith(patch);
  expect(emit).toHaveBeenCalled();
  repo.close();
});

it("refuses unversioned site-rule updates from the shell before mutation", async () => {
  const set = vi.fn();
  const ctx = {
    params: { originPolicies: [] },
    client: { external: false },
    s: { settings: { set } },
  } as unknown as MethodCtx;
  await expect(settingsMethods["settings.set"]!(ctx)).rejects.toMatchObject({ code: "permission_denied" });
  expect(set).not.toHaveBeenCalled();
});
