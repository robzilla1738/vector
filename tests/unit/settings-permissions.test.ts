import { openDb, Repo } from "@aux/runtime";
import { expect, it, vi } from "vitest";
import { settingsMethods } from "../../apps/runtime/src/api/methods/settings.js";
import type { MethodCtx } from "../../apps/runtime/src/api/methods/context.js";

it.each(["agentMode", "agentPolicies", "fileAccessMode"])(
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

it("allows the person to update agent mode through Settings", async () => {
  const repo = new Repo(openDb(":memory:"));
  const patch = { agentMode: "auto", agentPolicyRevision: 0 };
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

it("refuses permission revisions from code mode before mutation", async () => {
  const set = vi.fn();
  const ctx = {
    params: { agentPolicyRevision: 1 },
    client: { external: false, codeMode: true },
    s: { settings: { set } },
  } as unknown as MethodCtx;
  await expect(settingsMethods["settings.set"]!(ctx)).rejects.toMatchObject({ code: "permission_denied" });
  expect(set).not.toHaveBeenCalled();
});
