import { describe, expect, it } from "vitest";
import { guardCommandCompletion, reportCommandCompletionFailure } from "../command-completion";
import { constructAwaitedOperation, constructOperationChain } from "./owned-operation-construction";

type Handlers = {
  producer(): Promise<object>;
  completed(value: object): object;
  rejected(reason: unknown): never;
  finished(): void;
  current(): boolean;
};
function originalAwaited(h: Handlers) {
  return guardCommandCompletion(
    (async () => {
      try {
        const value = await h.producer();
        return h.completed(value);
      } catch (reason) {
        h.rejected(reason);
        throw reason;
      } finally {
        h.finished();
      }
    })(),
    h.current,
  );
}
function originalChain(h: Handlers) {
  let native: Promise<object>;
  try {
    native = h.producer();
  } catch (reason) {
    native = Promise.reject(reason);
  }
  return guardCommandCompletion(native.then(h.completed).catch(h.rejected).finally(h.finished), h.current);
}
async function observe(run: (handlers: Handlers) => Promise<object>, outcome: string) {
  const result = {},
    reason = new Error("original transport"),
    ledger: string[] = [];
  let current = true;
  const handlers: Handlers = {
    producer() {
      ledger.push("producer");
      if (outcome === "synchronous") throw reason;
      return outcome === "rejected" || outcome === "retired-rejected"
        ? Promise.reject(reason)
        : Promise.resolve(result);
    },
    completed(value) {
      ledger.push("completed");
      if (outcome === "publication") throw reason;
      return value;
    },
    rejected(error) {
      ledger.push("rejected");
      expect(error).toBe(reason);
      throw error;
    },
    finished() {
      ledger.push("finished");
      if (outcome === "cleanup") throw reason;
    },
    current: () => current,
  };
  const completion = run(handlers);
  ledger.push("returned");
  let observed: unknown;
  void completion.then(
    (value) => {
      observed = value;
      ledger.push("fulfilled");
    },
    (error) => {
      observed = error;
      ledger.push("failed");
      reportCommandCompletionFailure(completion, error, () => ledger.push("reported"));
    },
  );
  if (outcome === "retired" || outcome === "retired-rejected") current = false;
  for (let tick = 0; tick < 12; tick++) {
    await Promise.resolve();
    ledger.push(`tick${tick}`);
  }
  return {
    ledger,
    correctIdentity: observed === (outcome === "success" || outcome === "retired" ? result : reason),
  };
}

describe("original operation construction", () => {
  it("retains immediate await publication/cleanup/microtask and original ACK/rejection identity", async () => {
    for (const outcome of [
      "success",
      "rejected",
      "synchronous",
      "publication",
      "cleanup",
      "retired",
      "retired-rejected",
    ]) {
      const original = await observe(originalAwaited, outcome);
      const actual = await observe(
        (h) => constructAwaitedOperation(h.producer, h.completed, h.rejected, h.finished, h.current),
        outcome,
      );
      expect(actual).toEqual(original);
      expect(actual.correctIdentity).toBe(true);
    }
  });
  it("retains chained callbacks, cleanup and guarded notification timing", async () => {
    for (const outcome of [
      "success",
      "rejected",
      "synchronous",
      "publication",
      "cleanup",
      "retired",
      "retired-rejected",
    ]) {
      const original = await observe(originalChain, outcome);
      const actual = await observe(
        (h) => constructOperationChain(h.producer, h.completed, h.rejected, h.finished, h.current),
        outcome,
      );
      expect(actual).toEqual(original);
      expect(actual.correctIdentity).toBe(true);
    }
  });
  it("keeps the original asynchronous chain continuation before catch/finally", async () => {
    const ledger: string[] = [];
    let release!: () => void;
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    const ack = {};
    const completion = constructOperationChain(
      () => Promise.resolve(ack),
      async (value) => {
        ledger.push("refresh");
        await held;
        ledger.push("refreshed");
        return value;
      },
      (reason) => {
        throw reason;
      },
      () => ledger.push("finished"),
      () => true,
    );
    await Promise.resolve();
    expect(ledger).toEqual(["refresh"]);
    release();
    await expect(completion).resolves.toBe(ack);
    expect(ledger).toEqual(["refresh", "refreshed", "finished"]);
  });
});
