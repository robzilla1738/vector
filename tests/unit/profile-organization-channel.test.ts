import { expect, it } from "vitest";
import { AuxError, HostMethods, memoryTransportPair, RpcChannel } from "@aux/contracts";
import { ChannelNativeBridge } from "../../apps/runtime/src/native.js";

it("reads only the authenticated Profile organization and rejects foreign or malformed snapshots", async () => {
  const [runtimeTransport, hostTransport] = memoryTransportPair();
  const runtime = new RpcChannel(runtimeTransport),
    host = new RpcChannel(hostTransport);
  let snapshot: unknown = { revision: 0, shared: null };
  host.onMethod("native.organizationSnapshot", (input) => {
    expect(input).toEqual({});
    return snapshot;
  });
  const bridge = new ChannelNativeBridge(runtime);
  await expect(bridge.organizationSnapshot()).resolves.toEqual({ revision: 0, shared: null });
  snapshot = { revision: 1, shared: null, profileId: "foreign" };
  await expect(bridge.organizationSnapshot()).rejects.toThrow();
  snapshot = { revision: 1, shared: { spaces: [] } };
  await expect(bridge.organizationSnapshot()).rejects.toThrow();
  expect(HostMethods["native.organizationSnapshot"].args.safeParse({ profileId: "foreign" }).success).toBe(
    false,
  );
  host.onMethod("native.organizationSnapshot", () => {
    throw new AuxError("permission_denied", "Private Profile");
  });
  await expect(bridge.organizationSnapshot()).rejects.toMatchObject({ code: "permission_denied" });
});
