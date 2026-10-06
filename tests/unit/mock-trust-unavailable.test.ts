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
  await expect(bridge.invoke("safety.decisions.list", { limit: 50 })).rejects.toMatchObject({
    code: "capability_unsupported",
    message: expect.stringMatching(/require Aux desktop.*review or change access/),
  });
});
