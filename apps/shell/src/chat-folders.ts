const FOLDER_PREFIX = "aux.chat-folder.v1:";
const MEMBER_PREFIX = "aux.chat-folder-member.v1:";
export type ChatFolder = { id: string; name: string; collapsed: boolean };
export function readChatFolders(storage: Storage): {
  folders: ChatFolder[];
  members: Record<string, string>;
} {
  const folders: ChatFolder[] = [],
    members: Record<string, string> = {};
  for (let index = 0; index < storage.length; index++) {
    const key = storage.key(index)!;
    if (key.startsWith(FOLDER_PREFIX)) {
      try {
        const value = JSON.parse(storage.getItem(key)!);
        if (typeof value.name === "string" && value.name.trim())
          folders.push({
            id: key.slice(FOLDER_PREFIX.length),
            name: value.name,
            collapsed: value.collapsed === true,
          });
      } catch {
        /* Ignore a damaged folder entry without hiding chats. */
      }
    } else if (key.startsWith(MEMBER_PREFIX))
      members[key.slice(MEMBER_PREFIX.length)] = storage.getItem(key)!;
  }
  return { folders: folders.sort((a, b) => a.name.localeCompare(b.name)), members };
}
export function writeChatFolder(storage: Storage, folder: ChatFolder) {
  storage.setItem(FOLDER_PREFIX + folder.id, JSON.stringify(folder));
}
export function removeChatFolder(storage: Storage, id: string) {
  // Membership pointing to a missing folder is displayed under Chats.
  storage.removeItem(FOLDER_PREFIX + id);
}
export function moveChatToFolder(storage: Storage, chatId: string, folderId: string) {
  if (folderId) storage.setItem(MEMBER_PREFIX + chatId, folderId);
  else storage.removeItem(MEMBER_PREFIX + chatId);
}
