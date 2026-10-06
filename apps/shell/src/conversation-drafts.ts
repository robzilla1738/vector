import type { PreparedConversation, Run } from "@aux/contracts";
/** Drafts belong to durable chat IDs, including the run ID of legacy chats. */
export const DRAFTS_KEY = "aux.conversation-drafts.v1";
export const CONTEXTS_KEY = "aux.conversation-contexts.v1";
export const NEW_DRAFT_KEY = "new";
export const HOME_DRAFT_CHAT_KEY = "aux.home-draft-conversation.v1";
export const PENDING_CHAT_KEY = "aux.pending-conversation.v1";
export const draftKey = (id: string) => `chat:${id}`;
export function readPendingConversation(
  storage: Pick<Storage, "getItem"> | null,
  key = PENDING_CHAT_KEY,
): string | null {
  try {
    const value = storage?.getItem(key) ?? "";
    return value.length > 0 && value.length <= 200 && !/[\s/\\]/.test(value) ? value : null;
  } catch {
    return null;
  }
}
export function readConversationDrafts(storage: EntryStorage | null): Record<string, string> {
  try {
    const value: unknown = readLegacyMap(storage, DRAFTS_KEY);
    const legacy =
      value && typeof value === "object" && !Array.isArray(value)
        ? Object.fromEntries(
            Object.entries(value).filter(([key, draft]) => validKey(key) && typeof draft === "string"),
          )
        : {};
    return overlayEntries(storage, DRAFT_ENTRY_PREFIX, legacy, () => true);
  } catch {
    return {};
  }
}
export function readConversationContexts(storage: EntryStorage | null): Record<string, string> {
  try {
    const value: unknown = readLegacyMap(storage, CONTEXTS_KEY);
    const legacy =
      value && typeof value === "object" && !Array.isArray(value)
        ? Object.fromEntries(
            Object.entries(value).filter(
              ([key, pageId]) => validKey(key) && typeof pageId === "string" && pageId.length <= 200,
            ),
          )
        : {};
    return overlayEntries(storage, CONTEXT_ENTRY_PREFIX, legacy, (value) => value.length <= 200);
  } catch {
    return {};
  }
}

export const DRAFT_ENTRY_PREFIX = "aux.conversation-draft.v2:";
export const CONTEXT_ENTRY_PREFIX = "aux.conversation-context.v2:";
type EntryStorage = Pick<Storage, "getItem"> & Partial<Pick<Storage, "length" | "key">>;
const validKey = (key: string) => key === NEW_DRAFT_KEY || key.startsWith("chat:");

/** Per-conversation entries prevent unrelated windows from replacing a cached map. */
function overlayEntries(
  storage: EntryStorage | null,
  prefix: string,
  legacy: Record<string, string>,
  validate: (value: string) => boolean,
) {
  if (!storage?.key || typeof storage.length !== "number") return legacy;
  const values = { ...legacy };
  for (let index = 0; index < storage.length; index++) {
    const name: string | null = storage.key(index);
    if (!name?.startsWith(prefix)) continue;
    const key = name.slice(prefix.length),
      value = storage.getItem(name);
    if (!validKey(key) || value === null || !validate(value)) continue;
    if (value) values[key] = value;
    else delete values[key];
  }
  return values;
}
export function writeConversationEntry(
  storage: (Pick<Storage, "setItem"> & Partial<Pick<Storage, "getItem" | "removeItem">>) | null,
  kind: "draft" | "context",
  key: string,
  value: string,
) {
  if (!validKey(key)) throw new Error("Invalid conversation draft key.");
  const name = `${kind === "draft" ? DRAFT_ENTRY_PREFIX : CONTEXT_ENTRY_PREFIX}${key}`;
  // Empty entries are tombstones: old map data must not reappear after deletion.
  // Without a legacy value to shadow, the entry is simply removed.
  if (!value && storage?.getItem && storage.removeItem) {
    const legacy = readLegacyMap(
      storage as Pick<Storage, "getItem">,
      kind === "draft" ? DRAFTS_KEY : CONTEXTS_KEY,
    );
    if (!legacy || typeof legacy !== "object" || !Object.prototype.hasOwnProperty.call(legacy, key)) {
      storage.removeItem(name);
      return;
    }
  }
  storage?.setItem(name, value);
}

/**
 * Coalesces keystroke-rate draft writes: each key stores its latest value once
 * the typing pauses (and before the window unloads), so other windows see one
 * storage event per pause rather than one per character.
 */
export function createEntryWriter(
  storage: Parameters<typeof writeConversationEntry>[0],
  onError: (error: unknown) => void,
  delayMs = 300,
) {
  const pending = new Map<string, { kind: "draft" | "context"; key: string; value: string }>();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const flush = () => {
    clearTimeout(timer);
    timer = undefined;
    const entries = [...pending.values()];
    pending.clear();
    for (const entry of entries) {
      try {
        writeConversationEntry(storage, entry.kind, entry.key, entry.value);
      } catch (error) {
        onError(error);
      }
    }
  };
  return {
    write(kind: "draft" | "context", key: string, value: string) {
      if (!validKey(key)) throw new Error("Invalid conversation draft key.");
      pending.set(`${kind}:${key}`, { kind, key, value });
      timer ??= setTimeout(flush, delayMs);
    },
    flush,
  };
}
export function conversationEntryChange(
  name: string | null,
  value: string | null,
): { kind: "draft" | "context"; key: string; value: string } | null {
  const kind: "draft" | "context" | null = name?.startsWith(DRAFT_ENTRY_PREFIX)
    ? "draft"
    : name?.startsWith(CONTEXT_ENTRY_PREFIX)
      ? "context"
      : null;
  if (!kind || !name) return null;
  const key = name.slice((kind === "draft" ? DRAFT_ENTRY_PREFIX : CONTEXT_ENTRY_PREFIX).length);
  if (!validKey(key) || (kind === "context" && (value?.length ?? 0) > 200)) return null;
  return { kind, key, value: value ?? "" };
}

/** Apply another window’s storage event without replacing unrelated drafts. */
export function applyConversationStorageChange<
  T extends {
    conversationDrafts: Record<string, string>;
    conversationContexts: Record<string, string>;
    agentDraft?: string;
  },
>(state: T, change: { kind: "draft" | "context"; key: string; value: string }): Partial<T> {
  const field = change.kind === "draft" ? "conversationDrafts" : "conversationContexts";
  const values = { ...state[field] };
  if (change.value) values[change.key] = change.value;
  else delete values[change.key];
  return {
    [field]: values,
    ...(change.kind === "draft" && change.key === NEW_DRAFT_KEY ? { agentDraft: change.value } : {}),
  } as Partial<T>;
}

function readLegacyMap(storage: Pick<Storage, "getItem"> | null, key: string): unknown {
  try {
    return JSON.parse(storage?.getItem(key) ?? "{}");
  } catch {
    return {};
  }
}

/** One identity for a text draft and any snapshots prepared for the same chat. */
export function conversationDraftEntries(
  drafts: Record<string, string>,
  runs: Run[],
  prepared: PreparedConversation[],
) {
  const snapshots = new Map(prepared.map((item) => [item.chatId, item]));
  const keys = [
    ...new Set([...Object.keys(drafts).reverse(), ...prepared.map((item) => draftKey(item.chatId))]),
  ];
  return keys
    .filter((key) => key === NEW_DRAFT_KEY || key.startsWith("chat:"))
    .map((key) => {
      const id = key === NEW_DRAFT_KEY ? null : key.slice(5);
      const text = drafts[key] ?? "";
      const run = runs.find((run) => (run.config?.chatId ?? run.runId) === id);
      const saved = id ? snapshots.get(id) : undefined;
      return {
        key,
        id,
        text,
        count: saved?.attachmentCount ?? 0,
        title:
          run?.goal || text.split("\n").find((line) => line.trim()) || saved?.title || "New conversation",
      };
    })
    .filter((item) => item.text.trim() || item.count);
}
