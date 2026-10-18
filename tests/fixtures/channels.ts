import { randomUUID } from "node:crypto";
import { ChannelConnectionSchema, type ChannelInbound } from "@aux/contracts/channels";
import { ChannelStore } from "../../apps/runtime/src/services/channel-store.js";
import type { Repo } from "../../apps/runtime/src/store/repo.js";

export function seedChannel(repo: Repo, workspaceId: string, taskId: string) {
  const store = new ChannelStore(repo),
    now = Date.now();
  const connection = ChannelConnectionSchema.parse({
    connectionId: randomUUID(),
    revision: randomUUID(),
    provider: "telegram",
    name: "Protected messenger connection",
    workspaceId,
    enabled: true,
    options: { audience: "paired", requireMentionsInThreads: true, followUp: "queue" },
    identity: { provider: "telegram", botId: "100", name: "Protected bot", username: "ProtectedBot" },
    createdAt: now,
    updatedAt: now,
  });
  store.save(connection, null);
  const message: ChannelInbound = {
    messageId: "300:400",
    peerId: "200",
    peerName: "Protected person",
    conversationId: "300",
    text: "Protected messenger request",
    direct: true,
    mentioned: false,
    inThread: false,
  };
  const peerKey = store.key(connection.connectionId, "peer", message.peerId);
  store.savePeer(connection.connectionId, {
    peerKey,
    providerUserId: message.peerId,
    name: message.peerName,
    state: "pending",
    requestId: randomUUID(),
    expiresAt: now + 600000,
    createdAt: now,
    updatedAt: now,
  });
  const threadKey = store.key(connection.connectionId, "thread", "300");
  store.saveThread(connection.connectionId, peerKey, threadKey, { taskId, conversationId: "300" });
  store.receive(connection, message, { provider: "telegram", offset: 5 });
  const savedMessage = store.messages(connection.connectionId, ["pending"])[0]!;
  store.saveMessage({ ...savedMessage, state: "completed" });
  const delivery = {
    deliveryId: randomUUID(),
    connectionId: connection.connectionId,
    revision: connection.revision,
    peerKey,
    conversationId: "300",
    text: "Protected messenger response",
    state: "delivered" as const,
    createdAt: now,
    updatedAt: now,
  };
  store.saveDelivery(delivery);
  return { store, connection, message, peerKey, threadKey, taskId, savedMessage, delivery };
}
