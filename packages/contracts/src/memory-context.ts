import type { WorkspaceMemory } from "./tasks.js";
import { textContextShares } from "./text-context.js";

export function memoryOrigin(value: string): string {
  const url = new URL(value.trim());
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password)
    throw new Error("Use a web address without credentials.");
  return url.origin;
}

export function memorySourceExcluded(memory: WorkspaceMemory, sourceUrl?: string): boolean {
  if (!sourceUrl) return false;
  try {
    return (memory.excludedOrigins ?? []).includes(memoryOrigin(sourceUrl));
  } catch {
    return true;
  }
}

/** Future runs only: saved run context remains an immutable historical snapshot. */
export function workspaceMemoryText(
  memory: WorkspaceMemory | null | undefined,
  budget = 4000,
  now = Date.now(),
): string {
  if (!memory || memory.enabled === false) return "";
  const notes = [
    memory.content,
    ...(memory.items ?? [])
      .filter(
        (item) =>
          item.enabled &&
          !memorySourceExcluded(memory, item.sourceUrl) &&
          (item.expiresAt === undefined || item.expiresAt > now),
      )
      .map((item) => `${item.content}${item.sourceUrl ? `\nSource: ${item.sourceUrl}` : ""}`),
  ].filter(Boolean);
  const shares = textContextShares(
    notes.map((note) => note.length),
    Math.max(0, budget - Math.max(0, notes.length - 1) * 2),
  );
  return notes
    .map((note, index) => note.slice(0, shares[index]))
    .filter(Boolean)
    .join("\n\n");
}
