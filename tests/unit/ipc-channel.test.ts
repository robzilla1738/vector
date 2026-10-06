import { describe, it, expect } from "vitest";
import { RpcChannel, memoryTransportPair, AuxError, errorAdvice } from "@aux/contracts";

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
      throw new AuxError("not_found", "thing missing", { id: 7 });
    });
    await expect(a.call("boom")).rejects.toMatchObject({
      code: "not_found",
      message: "The requested item was not found.",
    });
  });

  it("refuses an unknown native fault as a serializable internal error", async () => {
    const [local, native] = memoryTransportPair();
    const caller = new RpcChannel(local, "native");
    native.onMessage((message) => {
      const { id } = message as { id: number };
      native.send({ kind: "res", id, error: { code: "forbidden", message: "Original owner retired" } });
    });
    const fault = await caller.call("native.originalOwner").catch((error: unknown) => error);
    expect(fault).toBeInstanceOf(AuxError);
    expect(() => (fault as AuxError).toJSON()).not.toThrow();
    expect((fault as AuxError).toJSON()).toMatchObject({ code: "internal" });
  });

  it("preserves unconfirmed native completion without advising a repeat", async () => {
    const [local, native] = memoryTransportPair();
    const caller = new RpcChannel(local, "native");
    native.onMessage((message) => {
      const { id } = message as { id: number };
      native.send({
        kind: "res",
        id,
        error: { code: "operation_uncertain", message: "Native acknowledgement was lost" },
      });
    });
    const fault = await caller.call("native.acceptedOperation").catch((error: unknown) => error);
    expect(fault).toBeInstanceOf(AuxError);
    expect((fault as AuxError).toJSON()).toMatchObject({
      code: "operation_uncertain",
      errorId: "AUX-E6003",
      message: "The operation was sent, but its completion is unconfirmed.",
    });
    expect(errorAdvice((fault as AuxError).code)).toEqual({
      retryable: false,
      hint: "reconcile the original operation; do not repeat the request",
    });
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
