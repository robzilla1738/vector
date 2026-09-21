import { create } from "zustand";
import { bridge } from "./bridge";

type Draft = { content: string; revision: number };
const key = `aux.space-memory-drafts.v1:${bridge.windowId}`;
function read(): Record<string, Draft> {
  if (bridge.privateMode) return {};
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, Draft] => {
      const draft = entry[1] as Draft | null;
      return !!draft && typeof draft.content === "string" && draft.content.length <= (entry[0].startsWith("item:") ? 80_000 : 16_000)
        && Number.isInteger(draft.revision) && draft.revision >= 0;
    }));
  } catch { return {}; }
}

export const useMemoryDrafts = create<{
  drafts: Record<string, Draft>;
  storageError: boolean;
  write(workspaceId: string, draft: Draft | null): void;
}>((set, get) => ({
  drafts: read(), storageError: false,
  write(workspaceId, draft) {
    const drafts = { ...get().drafts };
    if (draft) drafts[workspaceId] = draft;
    else delete drafts[workspaceId];
    let storageError = false;
    if (!bridge.privateMode) {
      try { localStorage.setItem(key, JSON.stringify(drafts)); }
      catch { storageError = true; }
    }
    set({ drafts, storageError });
  },
}));
