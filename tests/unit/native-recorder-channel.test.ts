import { expect, it } from "vitest";
import { AuxError, HostMethods, memoryTransportPair, RpcChannel } from "@aux/contracts";
import { ChannelNativeBridge } from "../../apps/runtime/dist/native.js";
const pageId = "15120a93-910a-451a-bbbd-e1daf3368f60";
const recorderId = "35120a93-910a-451a-bbbd-e1daf3368f60";
it("dispatches only fixed native recorder requests and validates every original channel response", async () => {
  const [runtimeTransport, hostTransport] = memoryTransportPair();
  const runtime = new RpcChannel(runtimeTransport),
    host = new RpcChannel(hostTransport);
  const seen: { method: string; input: unknown }[] = [];
  let drained: unknown = { recorderId, documentGeneration: "2", pending: true };
  host.onMethod("native.recorderStart", (input) => {
    seen.push({ method: "start", input });
    return { recorderId, documentGeneration: "1", producerSha256: "a".repeat(64) };
  });
  host.onMethod("native.recorderDrain", (input) => {
    seen.push({ method: "drain", input });
    return drained;
  });
  host.onMethod("native.recorderStop", (input) => {
    seen.push({ method: "stop", input });
    return { stopped: true };
  });
  const bridge = new ChannelNativeBridge(runtime);
  expect(await bridge.recorderStart({ pageId })).toEqual({
    recorderId,
    documentGeneration: "1",
    producerSha256: "a".repeat(64),
  });
  expect(await bridge.recorderDrain({ pageId, recorderId })).toEqual(drained);
  expect(await bridge.recorderStop({ pageId, recorderId })).toEqual({ stopped: true });
  expect(seen).toEqual([
    { method: "start", input: { pageId } },
    { method: "drain", input: { pageId, recorderId } },
    { method: "stop", input: { pageId, recorderId } },
  ]);
  for (const malformed of [
    { recorderId, documentGeneration: "0", events: [] },
    { recorderId, documentGeneration: "18446744073709551616", events: [] },
    { recorderId, documentGeneration: "2", pending: true, events: [] },
    {
      recorderId,
      documentGeneration: "2",
      events: [
        {
          kind: "credentialFill",
          secretType: "password",
          value: "synthetic-private",
          target: { candidates: [{ selector: "#secret", matches: 1 }] },
        },
      ],
    },
  ]) {
    drained = malformed;
    await expect(bridge.recorderDrain({ pageId, recorderId })).rejects.toThrow();
  }
  expect(
    HostMethods["native.recorderStart"].args.safeParse({ pageId, source: "caller-script" }).success,
  ).toBe(false);
  expect(
    HostMethods["native.recorderDrain"].args.safeParse({ pageId, recorderId, frame: "caller-frame" }).success,
  ).toBe(false);
  host.onMethod("native.recorderStop", () => {
    throw new AuxError("permission_denied", "Original recorder retired");
  });
  await expect(bridge.recorderStop({ pageId, recorderId })).rejects.toMatchObject({
    code: "permission_denied",
  });
});
