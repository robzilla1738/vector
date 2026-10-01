import { describe, expect, it } from "vitest";
import { HostEvents, HostMethods } from "@aux/contracts/host-methods";
import { createHostClient, type HostPort } from "../../apps/shell/src/host/client.generated";

const browserIds = Object.entries(HostMethods).filter(([, method]) => method.owner === "browser").map(([id]) => id);
const port = (request: HostPort["request"]): HostPort => ({ request, subscribe: () => () => {} });

describe("authoritative host client inventory", () => {
  it("exposes every browser method and event, excluding every runtime method", () => {
    const client = createHostClient(port(async () => undefined));
    expect(Object.keys(client)).toEqual([...browserIds, ...Object.keys(HostEvents)]);
    for (const [id, method] of Object.entries(HostMethods)) {
      expect(Object.hasOwn(client, id)).toBe(method.owner === "browser");
      expect(typeof client[id as keyof typeof client]).toBe(method.owner === "browser" ? "function" : "undefined");
    }
  });

  it("validates arguments before transport and the actual result after transport", async () => {
    const calls: { method: string; args: unknown[] }[] = [];
    let result: unknown = { isDefault: true };
    const client = createHostClient(port(async (method, args) => { calls.push({ method, args }); return result; }));
    expect(await client.setDefaultBrowser()).toEqual({ isDefault: true });
    expect(calls).toEqual([{ method: "setDefaultBrowser", args: [] }]);
    await expect((client.setDefaultBrowser as (...args: unknown[]) => Promise<unknown>)(1)).rejects.toThrow();
    expect(calls).toHaveLength(1);
    result = { isDefault: "invalid" };
    await expect(client.setDefaultBrowser()).rejects.toThrow();
    expect(calls).toHaveLength(2);
  });

  it("keeps pending and refused native acknowledgments and native rejection intact", async () => {
    let acknowledge!: (value: unknown) => void;
    let completed = false;
    const client = createHostClient(port(() => new Promise(resolve => { acknowledge = resolve; })));
    const pending = client.setDefaultBrowser().then(result => { completed = true; return result; });
    await Promise.resolve();
    expect(completed).toBe(false);
    acknowledge({ isDefault: false });
    expect(await pending).toEqual({ isDefault: false });
    const refusal = new Error("Native operation refused");
    const rejected = createHostClient(port(async () => { throw refusal; }));
    await expect(rejected.setDefaultBrowser()).rejects.toBe(refusal);
  });

  it("refuses a disabled feature before invoking the native transport", async () => {
    let called = false;
    const client = createHostClient({ ...port(async () => { called = true; return true; }), featureStages: { quickAsk: "off" } });
    await expect(client.quickAsk("open")).rejects.toThrow();
    expect(called).toBe(false);
  });

  it("validates real event payloads and preserves the port unsubscribe", () => {
    let deliver!: (payload: unknown) => void;
    let unsubscribed = false;
    let payload: unknown;
    const client = createHostClient({ ...port(async () => undefined), subscribe: (event, callback) => {
      expect(event).toBe("onShortcut"); deliver = callback; return () => { unsubscribed = true; };
    } });
    const stop = client.onShortcut(value => { payload = value; });
    const valid = { key: " ", meta: true, shift: true, alt: false };
    deliver(valid);
    expect(payload).toEqual(valid);
    payload = undefined;
    expect(() => deliver({ key: 5 })).toThrow();
    expect(payload).toBeUndefined();
    stop();
    expect(unsubscribed).toBe(true);
  });
});
