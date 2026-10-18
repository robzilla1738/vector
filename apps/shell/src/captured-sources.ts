import { CapturedSourceSelectionSchema, type CapturedSourceSelection } from "@aux/contracts/captured-source";

const PREFIX = "aux.captured-sources.v1:";
type StorageEntries = Pick<Storage, "getItem" | "setItem" | "removeItem" | "key" | "length">;
const validKey = (key: string) => key === "new" || (key.startsWith("chat:") && key.length <= 210);

export function capturedSourceEntry(name: string | null, value: string | null) {
  if (!name?.startsWith(PREFIX)) return null;
  const key = name.slice(PREFIX.length);
  if (!validKey(key)) return null;
  if (value === null) return { key, selection: null };
  try {
    const parsed = CapturedSourceSelectionSchema.safeParse(JSON.parse(value));
    return parsed.success ? { key, selection: parsed.data } : null;
  } catch {
    return null;
  }
}

export function readCapturedSources(storage: StorageEntries | null): Record<string, CapturedSourceSelection> {
  const result: Record<string, CapturedSourceSelection> = {};
  if (!storage) return result;
  try {
    for (let index = 0; index < storage.length; index++) {
      const name = storage.key(index);
      const entry = capturedSourceEntry(name, name ? storage.getItem(name) : null);
      if (entry?.selection) result[entry.key] = entry.selection;
    }
  } catch {
    /* An unavailable store cannot replace the in-memory selection. */
  }
  return result;
}

export function writeCapturedSources(
  storage: StorageEntries | null,
  key: string,
  selection: CapturedSourceSelection | null,
) {
  if (!validKey(key)) throw new Error("Invalid conversation source key.");
  if (selection?.sources.length)
    storage?.setItem(PREFIX + key, JSON.stringify(CapturedSourceSelectionSchema.parse(selection)));
  else storage?.removeItem(PREFIX + key);
}
