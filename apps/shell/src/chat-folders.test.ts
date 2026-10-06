import { beforeEach, expect, it } from "vitest";
import { readChatFolders, writeChatFolder, moveChatToFolder, removeChatFolder } from "./chat-folders";
const entries = new Map<string, string>();
const storage: Storage = {
  get length() {
    return entries.size;
  },
  key: (index) => [...entries.keys()][index] ?? null,
  getItem: (key) => entries.get(key) ?? null,
  setItem: (key, value) => {
    entries.set(key, value);
  },
  removeItem: (key) => {
    entries.delete(key);
  },
  clear: () => entries.clear(),
};
beforeEach(() => storage.clear());
it("persists projects and session membership independently across writes", () => {
  writeChatFolder(storage, { id: "a", name: "Research", collapsed: false });
  moveChatToFolder(storage, "one", "a");
  moveChatToFolder(storage, "two", "a");
  writeChatFolder(storage, { id: "a", name: "Reading", collapsed: true });
  expect(readChatFolders(storage)).toEqual({
    folders: [{ id: "a", name: "Reading", collapsed: true }],
    members: { one: "a", two: "a" },
  });
  moveChatToFolder(storage, "one", "");
  expect(readChatFolders(storage).members).toEqual({ two: "a" });
});
it("removes a folder without destroying session assignments and tolerates malformed folder data", () => {
  writeChatFolder(storage, { id: "a", name: "Research", collapsed: false });
  moveChatToFolder(storage, "one", "a");
  removeChatFolder(storage, "a");
  storage.setItem("aux.chat-folder.v1:broken", "{");
  expect(readChatFolders(storage)).toEqual({ folders: [], members: { one: "a" } });
});
