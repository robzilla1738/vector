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
  const releaseReceived = new Promise<void>((resolve) => {
    released = resolve;
  });
  native.onMethod("native.evidenceDocumentRead", (params) => {
    expect(params).toEqual(input);
    return new Promise((_, reject) => {
      rejectRead = reject;
    });
  });
  native.onMethod("native.evidenceDocumentsRelease", (params) => {
    expect(params).toEqual({ token: input.token, selectionId: input.selectionId });
    rejectRead(new AuxError("cancelled", "Original capture retired."));
    released();
    return new Promise((resolve) => {
      acknowledgeRelease = resolve;
    });
  });
  const controller = new AbortController();
  let settled = false;
  const read = new ChannelNativeBridge(caller).evidenceDocumentRead(input, controller.signal);
  const observed = read.then(
    () => {
      settled = true;
      return undefined;
    },
    (error: unknown) => {
      settled = true;
      return error;
    },
  );
  controller.abort();
  await releaseReceived;
  await Promise.resolve();
  expect(settled).toBe(false);
  acknowledgeRelease({ ok: true });
  await expect(observed).resolves.toMatchObject({ code: "cancelled" });
});

it("binds each original-byte read to the selected capture, exact source hash and offset", async () => {
  const [local, remote] = memoryTransportPair(),
    caller = new RpcChannel(local, "original-runtime"),
    native = new RpcChannel(remote, "original-native");
  const input = {
    token: randomUUID(),
    selectionId: randomUUID(),
    index: 0,
    snapshotId: randomUUID(),
    sourceSha256: "a".repeat(64),
    offset: 0,
  };
  const result = {
    snapshotId: input.snapshotId,
    sourceSha256: input.sourceSha256,
    sourceBytes: 6,
    offset: 0,
    nextOffset: 6,
    bytesBase64: Buffer.from("%PDF-x").toString("base64"),
  };
  native.onMethod("native.evidenceDocumentBytes", (params) => {
    expect(params).toEqual(input);
    return result;
  });
  await expect(new ChannelNativeBridge(caller).evidenceDocumentBytes(input)).resolves.toEqual(result);
});
it("joins original-byte capture release before a cancelled read settles", async () => {
  const [local, remote] = memoryTransportPair(),
    caller = new RpcChannel(local, "original-runtime-cancel"),
    native = new RpcChannel(remote, "original-native-cancel");
  const input = {
    token: randomUUID(),
    selectionId: randomUUID(),
    index: 0,
    snapshotId: randomUUID(),
    sourceSha256: "b".repeat(64),
    offset: 0,
  };
  let rejectRead!: (error: Error) => void, release!: () => void, acknowledge!: (result: { ok: true }) => void;
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });
  native.onMethod(
    "native.evidenceDocumentBytes",
    () =>
      new Promise((_, reject) => {
        rejectRead = reject;
      }),
  );
  native.onMethod("native.evidenceDocumentsRelease", (params) => {
    expect(params).toEqual({ token: input.token, selectionId: input.selectionId });
    rejectRead(new AuxError("cancelled", "Capture retired"));
    release();
    return new Promise((resolve) => {
      acknowledge = resolve;
    });
  });
  const controller = new AbortController();
  let settled = false;
  const observed = new ChannelNativeBridge(caller)
    .evidenceDocumentBytes(input, controller.signal)
    .catch((error: unknown) => error)
    .finally(() => {
      settled = true;
    });
  controller.abort();
  await released;
  await Promise.resolve();
  expect(settled).toBe(false);
  acknowledge({ ok: true });
  await expect(observed).resolves.toMatchObject({ code: "cancelled" });
});
