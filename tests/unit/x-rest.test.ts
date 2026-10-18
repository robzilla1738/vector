import { expect, it } from "vitest";
import {
  XMethodSchemas,
  X_OPERATIONS,
  XToolInputSchema,
  xOperationAvailable,
  type XAccount,
  type XOperation,
} from "@aux/contracts/x";
import { prepareXRequest, xJsonResponse } from "../../apps/runtime/src/services/x-rest.js";
const account: XAccount = {
  connectionId: "11111111-1111-4111-8111-111111111111",
  userId: "123",
  username: "fixture",
  label: "Fixture",
  revision: "a".repeat(64),
  scopes: [],
  operations: [],
  state: "active",
  createdAt: 1,
  updatedAt: 1,
};
it("maps supported reads, pagination and writes to exact account-scoped X v2 routes", () => {
  const cases: [XOperation, unknown, string, string, unknown?][] = [
    ["posts.read", { postIds: ["15", "16"] }, "GET", "/2/tweets"],
    ["posts.create", { text: "Exact post" }, "POST", "/2/tweets", { text: "Exact post" }],
    [
      "posts.reply",
      { postId: "15", expectedSourceSha256: "b".repeat(64), text: "Exact reply" },
      "POST",
      "/2/tweets",
      { text: "Exact reply", reply: { in_reply_to_tweet_id: "15" } },
    ],
    ["bookmarks.add", { postId: "15" }, "POST", "/2/users/123/bookmarks", { tweet_id: "15" }],
    ["bookmarks.remove", { postId: "15" }, "DELETE", "/2/users/123/bookmarks/15"],
    ["follows.add", { targetUserId: "17" }, "POST", "/2/users/123/following", { target_user_id: "17" }],
    ["follows.remove", { targetUserId: "17" }, "DELETE", "/2/users/123/following/17"],
    [
      "messages.send",
      { participantId: "17", text: "Exact message" },
      "POST",
      "/2/dm_conversations/with/17/messages",
      { text: "Exact message" },
    ],
    [
      "messages.reply",
      { conversationId: "17-123", text: "Exact reply" },
      "POST",
      "/2/dm_conversations/17-123/messages",
      { text: "Exact reply" },
    ],
  ];
  for (const [operation, args, method, path, body] of cases) {
    const request = prepareXRequest(operation, args, account),
      url = new URL(request.url);
    expect(url.origin).toBe("https://api.x.com");
    expect(url.pathname).toBe(path);
    expect(request.method).toBe(method);
    expect(request.body ? JSON.parse(request.body) : undefined).toEqual(body);
  }
  const search = new URL(
    prepareXRequest(
      "posts.search",
      { query: "from:fixture hello", pageToken: "opaque&token", limit: 25 },
      account,
    ).url,
  );
  expect(search.searchParams.get("query")).toBe("from:fixture hello");
  expect(search.searchParams.get("next_token")).toBe("opaque&token");
  const messages = new URL(prepareXRequest("messages.list", { limit: 25, pageToken: "next" }, account).url);
  expect(messages.searchParams.get("pagination_token")).toBe("next");
  expect(messages.searchParams.get("max_results")).toBe("25");
});
it("refuses caller account substitutions, path injection and unsupported operations at the typed boundary", () => {
  expect(() => prepareXRequest("follows.add", { targetUserId: "2", userId: "attacker" }, account)).toThrow();
  expect(() =>
    prepareXRequest("messages.reply", { conversationId: "../../token", text: "x" }, account),
  ).toThrow();
  expect(() =>
    XToolInputSchema.parse({
      grantId: account.connectionId,
      operation: "posts.create",
      args: { text: "x" },
      runId: "caller-run",
    }),
  ).toThrow();
  expect(XMethodSchemas).not.toHaveProperty("x.invoke");
  expect(Object.keys(X_OPERATIONS)).toHaveLength(16);
});
it("keeps reads, posting, bookmarks, relationships and messaging scopes distinct", () => {
  const base = ["tweet.read", "users.read"] as const;
  expect(xOperationAvailable(base, "posts.search")).toBe(true);
  for (const operation of ["posts.create", "bookmarks.add", "follows.add", "messages.send"] as const)
    expect(xOperationAvailable(base, operation)).toBe(false);
  expect(xOperationAvailable([...base, "dm.read"], "messages.list")).toBe(true);
  expect(xOperationAvailable([...base, "dm.read"], "messages.send")).toBe(false);
});
it("bounds response bytes and rejects malformed JSON while preserving explicit API partial failures", async () => {
  await expect(
    xJsonResponse(Response.json({ data: [{ id: "1" }], errors: [{ title: "Unavailable second source" }] })),
  ).resolves.toHaveProperty("errors");
  await expect(xJsonResponse(new Response("not json"))).rejects.toThrow(/invalid JSON/);
  await expect(xJsonResponse(Response.json({ text: "a".repeat(100) }), 10)).rejects.toThrow(/bounded/);
});
