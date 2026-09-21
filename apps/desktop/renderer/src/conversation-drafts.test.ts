import { expect, it } from "vitest";
import { readConversationContexts, readConversationDrafts, readPendingConversation, writeConversationEntry, DRAFTS_KEY, CONTEXTS_KEY, DRAFT_ENTRY_PREFIX, conversationEntryChange } from "./conversation-drafts";
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

function storageFixture() {
  const values=new Map<string,string>();
  return {get length(){return values.size;},key:(index:number)=>[...values.keys()][index]??null,getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>{values.set(key,value);}};
}
it("keeps edits from separate windows and overlays tombstones over legacy drafts",()=>{
  const storage=storageFixture();
  storage.setItem(DRAFTS_KEY,JSON.stringify({"chat:old":"Legacy draft","chat:deleted":"Remove me"}));
  const firstWindow=readConversationDrafts(storage), secondWindow=readConversationDrafts(storage);
  expect(firstWindow).toEqual(secondWindow);
  writeConversationEntry(storage,"draft","chat:first","First window reply");
  writeConversationEntry(storage,"draft","chat:second","Second window reply");
  writeConversationEntry(storage,"draft","chat:deleted","");
  expect(readConversationDrafts(storage)).toEqual({"chat:old":"Legacy draft","chat:first":"First window reply","chat:second":"Second window reply"});
  storage.setItem(DRAFTS_KEY,"malformed");
  expect(readConversationDrafts(storage)).toEqual({"chat:first":"First window reply","chat:second":"Second window reply"});
});
it("updates context independently and identifies cross-window changes without accepting unrelated keys",()=>{
  const storage=storageFixture();
  storage.setItem(CONTEXTS_KEY,JSON.stringify({"chat:first":"page-old","chat:second":"page-2"}));
  writeConversationEntry(storage,"context","chat:first","");
  expect(readConversationContexts(storage)).toEqual({"chat:second":"page-2"});
  expect(conversationEntryChange(`${DRAFT_ENTRY_PREFIX}chat:first`,"新しい draft")).toEqual({kind:"draft",key:"chat:first",value:"新しい draft"});
  expect(conversationEntryChange("unrelated","value")).toBeNull();
  expect(conversationEntryChange(`${DRAFT_ENTRY_PREFIX}not-a-chat`,"value")).toBeNull();
});
it("retains selected page context and newer draft edits across a simulated restart",()=>{
  const storage=storageFixture();
  writeConversationEntry(storage,"context","chat:ask","page-selected");
  writeConversationEntry(storage,"draft","chat:ask","Ask about the selection");
  writeConversationEntry(storage,"draft","chat:ask","Ask about the selection, with a later edit");
  const restarted={getItem:(key:string)=>storage.getItem(key),length:storage.length,key:(index:number)=>storage.key(index)};
  expect(readConversationContexts(restarted)).toEqual({"chat:ask":"page-selected"});
  expect(readConversationDrafts(restarted)["chat:ask"]).toBe("Ask about the selection, with a later edit");
});
