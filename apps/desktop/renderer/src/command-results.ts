export interface CommandCandidate {
  id: string;
  title: string;
  url?: string;
}
export interface DroppedCommand {
  droppedId: string;
  keptId: string;
  key: string;
}

export function titleHostKey(candidate: CommandCandidate): string | null {
  if (!candidate.url) return null;
  try {
    const url = new URL(candidate.url);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    const title = candidate.title.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase();
    return title ? `${title}\u0000${url.hostname.toLocaleLowerCase()}` : null;
  } catch {
    return null;
  }
}

/** Chromium's supplied order wins; Aux rows follow their own rank. The first
 * title plus host pair is kept, so a duplicate from another provider cannot
 * displace the browser's top result. */
export function mergeCommandResults<T extends CommandCandidate>(
  host: T[],
  aux: T[],
): { rows: T[]; dropped: DroppedCommand[] } {
  const seen = new Map<string, string>();
  const rows: T[] = [];
  const dropped: DroppedCommand[] = [];
  for (const candidate of [...host, ...aux]) {
    const key = titleHostKey(candidate);
    const keptId = key ? seen.get(key) : undefined;
    if (key && keptId) {
      dropped.push({ droppedId: candidate.id, keptId, key });
      continue;
    }
    rows.push(candidate);
    if (key) seen.set(key, candidate.id);
  }
  return { rows, dropped };
}
