import { expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { RuntimeMethodPolicy } from "@aux/contracts/runtime-method-policy";
import { RuntimeWindowContextMethods } from "@aux/contracts/runtime-window-context";
import { GoogleMethodSchemas } from "@aux/contracts/google";
import { googleMethods } from "../../apps/runtime/src/api/methods/google.js";
import type { MethodCtx } from "../../apps/runtime/src/api/methods/context.js";
function fixture() {
  let windowId = "normal-window";
  const accounts = {
    list: vi.fn(() => ({ available: false, reason: "Registration required", connections: [] })),
    start: vi.fn(async (_input: unknown) => ({
      url: "https://accounts.google.com/o/oauth2/v2/auth",
      expiresAt: Date.now() + 1000,
    })),
    account: vi.fn(() => ({ revision: "a".repeat(64) })),
    revoke: vi.fn(async () => ({ ok: true, providerRevocation: "confirmed" })),
  };
  const ctx = {
    method: "google.accounts.list",
    params: {},
    client: { external: false, nativeTurnContext: randomUUID() },
    s: {
      nativeIdentity: Promise.resolve({ privateSession: false }),
      native: {
        turnSourceContext: vi.fn(async (token: string) => ({
          windowId: token === "other-run" ? "other-window" : windowId,
        })),
      },
      googleAccounts: accounts,
      googleGrants: { list: vi.fn(() => []), create: vi.fn(), revoke: vi.fn() },
      google: {},
      repo: { getRun: vi.fn(() => ({ config: { nativeTurnContext: "other-run" } })) },
      runs: { googleOperation: vi.fn() },
    },
  } as unknown as MethodCtx;
  const invoke = () => googleMethods[ctx.method as keyof typeof googleMethods]!(ctx);
  return { ctx, accounts, invoke, retire: () => (windowId = "new-window") };
}
it("registers every Google method with Aux-only auth and required native normal-window provenance", () => {
  for (const name of Object.keys(GoogleMethodSchemas) as (keyof typeof GoogleMethodSchemas)[]) {
    expect(RuntimeMethodPolicy[name].auth).toBe("aux-webui");
    expect(RuntimeWindowContextMethods).toContain(name);
  }
});
it("allows truthful unavailable metadata only from the original normal window", async () => {
  const f = fixture();
  await expect(f.invoke()).resolves.toMatchObject({ available: false, connections: [] });
  for (const client of [
    { external: true },
    { external: false, codeMode: true, nativeTurnContext: randomUUID() },
    { external: false },
  ]) {
    const f = fixture();
    Object.assign(f.ctx, { client });
    await expect(f.invoke()).rejects.toMatchObject({ code: "permission_denied" });
    expect(f.accounts.list).not.toHaveBeenCalled();
  }
  const privateWindow = fixture();
  privateWindow.ctx.s.nativeIdentity = Promise.resolve({
    buildId: "fixture",
    sourceCommit: "fixture",
    methods: [],
    privateSession: { id: "fixture-private" },
  });
  await expect(privateWindow.invoke()).rejects.toMatchObject({ code: "permission_denied" });
});
it("passes exact setup scopes and a recheck that rejects original window retirement", async () => {
  const f = fixture();
  f.ctx.method = "google.auth.start";
  f.ctx.params = { scopes: ["https://www.googleapis.com/auth/gmail.readonly"] };
  await f.invoke();
  const input = f.accounts.start.mock.calls[0]![0] as { scopes: string[]; checkOwner(): Promise<void> };
  expect(input.scopes).toEqual(f.ctx.params.scopes);
  await input.checkOwner();
  f.retire();
  await expect(input.checkOwner()).rejects.toMatchObject({ code: "permission_denied" });
});
it("refuses stale account revisions before disconnecting an account", async () => {
  const f = fixture();
  f.ctx.method = "google.accounts.revoke";
  f.ctx.params = { connectionId: randomUUID(), expectedRevision: "b".repeat(64) };
  await expect(f.invoke()).rejects.toMatchObject({ code: "conflict" });
  expect(f.accounts.revoke).not.toHaveBeenCalled();

});
