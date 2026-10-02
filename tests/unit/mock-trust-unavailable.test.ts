// @vitest-environment jsdom
import { webcrypto } from "node:crypto";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { AuxBridge } from "../../apps/shell/src/bridge";
import { installMockBridge } from "../../apps/shell/src/mock/bridge";

let bridge: AuxBridge;
beforeEach(() => {
  vi.stubGlobal("crypto", webcrypto);
  const values = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  });
  installMockBridge(new URLSearchParams("scenario=start"));
  bridge = (window as unknown as { aux: AuxBridge }).aux;
});
afterEach(() => vi.unstubAllGlobals());

it("refuses trust reads and mutations without advertising fabricated native permissions", async () => {
  const requests = [
    bridge.invoke("safety.grants.list", { profileId: "profile" }),
    bridge.invoke("safety.grants.revoke", { profileId: "profile", grantId: "grant" }),
    bridge.invoke("safety.originPolicies.list", {}),
    bridge.invoke("safety.originPolicies.set", { expectedRevision: 0, rules: [] }),
  ];
  const settled = await Promise.allSettled(requests);
  for (const result of settled) {
    expect(result.status).toBe("rejected");
    if (result.status !== "rejected") throw new Error("Preview fabricated native trust success");
    expect(result.reason).toMatchObject({ code: "capability_unsupported" });
    expect(result.reason.message).toMatch(/require Aux desktop.*review or change access/);
  }
  await expect(bridge.invoke("safety.grants.list", { profileId: "profile" })).rejects.toMatchObject({
    code: "capability_unsupported",
  });
});
