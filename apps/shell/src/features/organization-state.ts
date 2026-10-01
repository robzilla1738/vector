import { useSyncExternalStore } from "react";

type Editor = { kind: "archive" } | { kind: "live-folder"; folderId: string } | { kind: "archive-policy"; spaceId: string } | null;
let current: Editor = null;
const listeners = new Set<() => void>();
export function showOrganizationEditor(editor: Editor) { current = editor; for (const notify of listeners) notify(); }
export function useOrganizationEditor() {
  return useSyncExternalStore(notify => { listeners.add(notify); return () => listeners.delete(notify); }, () => current);
}
