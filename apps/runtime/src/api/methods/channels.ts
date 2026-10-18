import { AuxError, MethodSchemas, type MethodName } from "@aux/contracts";
import type { MethodCtx, MethodHandler } from "./context.js";

async function original(ctx: MethodCtx) {
  const native = ctx.s.native,
    token = ctx.client.nativeTurnContext,
    read = native?.turnSourceContext;
  if (
    ctx.client.external ||
    ctx.client.codeMode ||
    !token ||
    !native ||
    !read ||
    !ctx.s.nativeIdentity ||
    (await ctx.s.nativeIdentity).privateSession
  )
    throw new AuxError("permission_denied", "Manage channels in the original normal Aux Settings window.");
  const source = await read.call(native, token);
  const owner = {
    current: async () => {
      const current = await read.call(native, token);
      if (current.windowId !== source.windowId)
        throw new AuxError("permission_denied", "The original Settings window changed.");
    },
  };
  if (!ctx.s.channels) throw new AuxError("backend_unavailable", "Channels are unavailable in this runtime.");
  return { service: ctx.s.channels, owner };
}
async function h_channels_list(ctx: MethodCtx) {
  const { service, owner } = await original(ctx);
  return service.list(owner);
}
async function h_channels_save(ctx: MethodCtx) {
  const { service, owner } = await original(ctx);
  return service.save(MethodSchemas["channels.save"].parse(ctx.params), owner);
}
async function h_channels_reconnect(ctx: MethodCtx) {
  const { service, owner } = await original(ctx),
    input = MethodSchemas["channels.reconnect"].parse(ctx.params);
  return service.reconnect(input.connectionId, input.expectedRevision, owner);
}
async function h_channels_remove(ctx: MethodCtx) {
  const { service, owner } = await original(ctx),
    input = MethodSchemas["channels.remove"].parse(ctx.params);
  return service.remove(input.connectionId, input.expectedRevision, owner);
}
async function h_channels_peers(ctx: MethodCtx) {
  const { service, owner } = await original(ctx),
    input = MethodSchemas["channels.peers"].parse(ctx.params);
  return service.peers(input.connectionId, input.expectedRevision, owner);
}
async function h_channels_peer(ctx: MethodCtx) {
  const { service, owner } = await original(ctx),
    input = MethodSchemas["channels.peer"].parse(ctx.params);
  return service.pair(
    input.connectionId,
    input.expectedRevision,
    input.peerKey,
    input.action,
    input.requestId,
    owner,
  );
}
async function h_channels_deliveries(ctx: MethodCtx) {
  const { service, owner } = await original(ctx),
    input = MethodSchemas["channels.deliveries"].parse(ctx.params);
  return service.deliveries(input.connectionId, input.expectedRevision, owner);
}
async function h_channels_retryDelivery(ctx: MethodCtx) {
  const { service, owner } = await original(ctx),
    input = MethodSchemas["channels.retryDelivery"].parse(ctx.params);
  return service.retryDelivery(input.connectionId, input.expectedRevision, input.deliveryId, owner);
}
export const channelsMethods: Partial<Record<MethodName, MethodHandler>> = {
  "channels.list": h_channels_list,
  "channels.save": h_channels_save,
  "channels.reconnect": h_channels_reconnect,
  "channels.remove": h_channels_remove,
  "channels.peers": h_channels_peers,
  "channels.peer": h_channels_peer,
  "channels.deliveries": h_channels_deliveries,
  "channels.retryDelivery": h_channels_retryDelivery,
};
