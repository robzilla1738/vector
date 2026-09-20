import { expect, it } from "vitest";
import { readConversationContexts, readConversationDrafts, readPendingConversation } from "./conversation-drafts";
it("restores exact reply text while ignoring malformed storage entries", () => {
  const original = "Draft\n\n日本語 and <literal markup>";
  expect(readConversationDrafts({ getItem: () => JSON.stringify({"new":"Fresh prompt","chat:one":original,"chat:two":12,"unrelated":"ignored"}) })).toEqual({"new":"Fresh prompt","chat:one":original});
  expect(readConversationDrafts({ getItem: () => "broken JSON" })).toEqual({});
  expect(readConversationDrafts({ getItem: () => { throw Error("Storage unavailable"); } })).toEqual({});
});

it("restores only a bounded opaque pending conversation id", () => {
  expect(readPendingConversation({ getItem: () => "chat-123" })).toBe("chat-123");
  expect(readPendingConversation({ getItem: () => "bad/id" })).toBeNull();
  expect(readPendingConversation({ getItem: () => "x".repeat(201) })).toBeNull();
});
it("restores bounded conversation context identifiers without storing page content",()=>{
  expect(readConversationContexts({getItem:()=>JSON.stringify({new:"page-1","chat:one":"page-2",other:"ignored","chat:long":"x".repeat(201)})})).toEqual({new:"page-1","chat:one":"page-2"});
  expect(readConversationContexts({getItem:()=>"broken"})).toEqual({});
});
