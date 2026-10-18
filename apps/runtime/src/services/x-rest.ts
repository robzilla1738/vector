import { createHash } from "node:crypto";
import { AuxError } from "@aux/contracts";
import { XArguments, X_OPERATIONS, type XAccount, type XOperation } from "@aux/contracts/x";
export type XRequest = {
  url: string;
  method: "GET" | "POST" | "DELETE";
  objectId: string;
  effect: "read" | "write" | "send";
  body?: string;
};
export const xSourceHash = (value: unknown): string =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
/** Fixed API routes: callers never supply a URL or an acting account ID. */
export function prepareXRequest(operation: XOperation, raw: unknown, account: XAccount): XRequest {
  const args = XArguments[operation].parse(raw) as Record<string, unknown>;
  let path: string,
    objectId = account.userId,
    method: XRequest["method"] = "GET",
    body: unknown;
  const query = new URLSearchParams();
  if (operation === "posts.read") {
    path = "/tweets";
    objectId = (args.postIds as string[]).join(",");
    query.set("ids", objectId);
  } else if (operation === "posts.search") {
    path = "/tweets/search/recent";
    query.set("query", String(args.query));
    if (args.startTime) query.set("start_time", String(args.startTime));
    if (args.endTime) query.set("end_time", String(args.endTime));
  } else if (operation === "posts.create" || operation === "posts.reply") {
    path = "/tweets";
    method = "POST";
    body = {
      text: args.text,
      ...(operation === "posts.reply" ? { reply: { in_reply_to_tweet_id: args.postId } } : {}),
    };
    if (operation === "posts.reply") objectId = String(args.postId);
  } else if (operation === "users.read") {
    path = "/users";
    objectId = (args.userIds as string[]).join(",");
    query.set("ids", objectId);
  } else if (operation.startsWith("bookmarks.")) {
    path = `/users/${account.userId}/bookmarks`;
    if (operation === "bookmarks.add") {
      method = "POST";
      body = { tweet_id: args.postId };
    }
    if (operation === "bookmarks.remove") {
      method = "DELETE";
      path += `/${args.postId}`;
    }
    if (args.postId) objectId = String(args.postId);
  } else if (operation === "follows.following" || operation === "follows.followers") {
    objectId = String(args.userId);
    path = `/users/${objectId}/${operation === "follows.following" ? "following" : "followers"}`;
  } else if (operation === "follows.add" || operation === "follows.remove") {
    objectId = String(args.targetUserId);
    path = `/users/${account.userId}/following`;
    if (operation === "follows.add") {
      method = "POST";
      body = { target_user_id: objectId };
    } else {
      method = "DELETE";
      path += `/${objectId}`;
    }
  } else if (operation === "messages.list") path = "/dm_events";
  else if (operation === "messages.conversation") {
    objectId = String(args.conversationId);
    path = `/dm_conversations/${objectId}/dm_events`;
  } else if (operation === "messages.send") {
    objectId = String(args.participantId);
    path = `/dm_conversations/with/${objectId}/messages`;
    method = "POST";
    body = { text: args.text };
  } else {
    objectId = String(args.conversationId);
    path = `/dm_conversations/${objectId}/messages`;
    method = "POST";
    body = { text: args.text };
  }
  if (typeof args.limit === "number") query.set("max_results", String(args.limit));
  if (args.pageToken)
    query.set(operation === "posts.search" ? "next_token" : "pagination_token", String(args.pageToken));
  if (operation === "posts.read" || operation === "posts.search" || operation === "bookmarks.list")
    query.set("tweet.fields", "author_id,created_at,conversation_id,referenced_tweets,entities");
  if (operation.startsWith("messages.") && method === "GET")
    query.set("dm_event.fields", "created_at,sender_id,dm_conversation_id,participant_ids");
  return {
    url: `https://api.x.com/2${path}${query.size ? `?${query}` : ""}`,
    method,
    objectId,
    effect: X_OPERATIONS[operation].effect,
    ...(body ? { body: JSON.stringify(body) } : {}),
  };
}
export async function xJsonResponse(
  response: Response,
  maximumBytes = 1_000_000,
): Promise<Record<string, unknown>> {
  const reader = response.body?.getReader();
  if (!reader) throw new AuxError("backend_unavailable", "X returned an empty response.");
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maximumBytes)
        throw new AuxError("backend_unavailable", "X response exceeds the bounded result limit.");
      chunks.push(value);
    }
  } finally {
    await reader.cancel().catch(() => undefined);
  }
  try {
    const value: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
  }
  throw new AuxError("backend_unavailable", "X returned invalid JSON data.");
}
