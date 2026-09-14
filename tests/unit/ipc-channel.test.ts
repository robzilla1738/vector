import { describe, it, expect } from "vitest";
import { RpcChannel, memoryTransportPair, VectorError } from "@vector/contracts";

describe("RpcChannel", () => {
  it("round-trips calls both directions", async () => {
    const [ta, tb] = memoryTransportPair();
    const a = new RpcChannel(ta, "a");
    const b = new RpcChannel(tb, "b");
    b.onMethod("double", (p) => (p as { n: number }).n * 2);
    a.onMethod("hello", () => "hi from a");
    expect(await a.call("double", { n: 21 })).toBe(42);
    expect(await b.call("hello")).toBe("hi from a");
  });

  it("propagates typed errors", async () => {
    const [ta, tb] = memoryTransportPair();
    const a = new RpcChannel(ta, "a");
    const b = new RpcChannel(tb, "b");
    b.onMethod("boom", () => {
      throw new VectorError("not_found", "thing missing", { id: 7 });
    });
    await expect(a.call("boom")).rejects.toMatchObject({ code: "not_found", message: "thing missing" });
  });

  it("delivers notifications", async () => {
    const [ta, tb] = memoryTransportPair();
    const a = new RpcChannel(ta, "a");
    const b = new RpcChannel(tb, "b");
    const got: string[] = [];
    b.onNotify((type, payload) => got.push(`${type}:${JSON.stringify(payload)}`));
    a.notify("ping", { n: 1 });
    await new Promise((r) => setTimeout(r, 10));
    expect(got).toEqual(['ping:{"n":1}']);
  });
});
