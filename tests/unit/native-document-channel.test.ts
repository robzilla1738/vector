import { randomUUID } from "node:crypto";
import { expect, it } from "vitest";
import { AuxError, memoryTransportPair, RpcChannel } from "@aux/contracts";
import { ChannelNativeBridge } from "../../apps/runtime/dist/native.js";

it("releases the original capture during a pending read and joins its retirement acknowledgement", async () => {
  const [local, remote] = memoryTransportPair();
  const caller = new RpcChannel(local, "document-runtime");
  const native = new RpcChannel(remote, "document-native");
  const input = { token: randomUUID(), selectionId: randomUUID(), index: 2 };
  let rejectRead!: (error: Error) => void;
  let acknowledgeRelease!: (result: { ok: true }) => void;
  let released!: () => void;
  const releaseReceived = new Promise<void>((resolve) => { released = resolve; });
  native.onMethod("native.evidenceDocumentRead", (params) => {
    expect(params).toEqual(input);
    return new Promise((_, reject) => { rejectRead = reject; });
  });
  native.onMethod("native.evidenceDocumentsRelease", (params) => {
    expect(params).toEqual({ token: input.token, selectionId: input.selectionId });
    rejectRead(new AuxError("cancelled", "Original capture retired."));
    released();
    return new Promise((resolve) => { acknowledgeRelease = resolve; });
  });
  const controller = new AbortController();
  let settled = false;
  const read = new ChannelNativeBridge(caller).evidenceDocumentRead(input, controller.signal);
  const observed = read.then(
    () => { settled = true; return undefined; },
    (error: unknown) => { settled = true; return error; },
  );
  controller.abort();
  await releaseReceived;
  await Promise.resolve();
  expect(settled).toBe(false);
  acknowledgeRelease({ ok: true });
  await expect(observed).resolves.toMatchObject({ code: "cancelled" });
});
