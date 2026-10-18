import { afterEach, describe, it, expect, vi } from "vitest";
import { RpcChannel, memoryTransportPair, AuxError, errorAdvice } from "@aux/contracts";

afterEach(() => vi.useRealTimers());

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

it("removes original call timers when transport.send rejects without pretending the socket closed", async () => {
  vi.useFakeTimers();
  const failure = new Error("Original bounded transport refused this frame");
  const channel = new RpcChannel({
    send() {
      throw failure;
    },
    onMessage() {},
  });
  expect(vi.getTimerCount()).toBe(0);
  await expect(channel.call("original.once")).rejects.toBe(failure);
  expect(vi.getTimerCount()).toBe(0);
  expect(channel.isClosed()).toBe(false);
});

it.each(["success", "handler failure", "unknown"] as const)(
  "never retries or leaks an asynchronous %s reply when the original transport retires",
  async (outcome) => {
    let receive!: (message: unknown) => void;
    let retire!: () => void;
    let finish!: (value: unknown) => void;
    const send = vi.fn((_frame: unknown) => {
      throw new Error("Original reply cannot be written");
    });
    const channel = new RpcChannel({
      send,
      onMessage(callback) {
        receive = callback;
      },
      onClose(callback) {
        retire = callback;
      },
    });
    if (outcome !== "unknown")
      channel.onMethod(
        "original",
        () =>
          new Promise((resolve, reject) => {
            finish = (value) => (outcome === "handler failure" ? reject(value) : resolve(value));
          }),
      );
    receive({ kind: "req", id: 41, method: "original" });
    if (outcome !== "unknown") {
      finish(
        outcome === "handler failure"
          ? new AuxError("conflict", "Original handler failed")
          : "original result",
      );
    }
    await new Promise<void>((resolve) => setImmediate(resolve));
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0]?.[0]).toMatchObject({ kind: "res", id: 41 });
    expect(channel.isClosed()).toBe(false);
    retire();
    expect(channel.isClosed()).toBe(true);
  },
);

it("does not send or dispatch after actual original close, including late awaited handler completion", async () => {
  let receive!: (message: unknown) => void;
  let retire!: () => void;
  let finish!: (value: unknown) => void;
  const send = vi.fn();
  const handler = vi.fn(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const channel = new RpcChannel({
    send,
    onMessage(callback) {
      receive = callback;
    },
    onClose(callback) {
      retire = callback;
    },
  });
  channel.onMethod("original", handler);
  receive({ kind: "req", id: 1, method: "original" });
  retire();
  finish("late result");
  receive({ kind: "req", id: 2, method: "original" });
  await new Promise<void>((resolve) => setImmediate(resolve));
  expect(handler).toHaveBeenCalledTimes(1);
  expect(send).not.toHaveBeenCalled();
});
