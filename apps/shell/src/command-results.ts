import { canonicalCommandUrl } from "@aux/contracts/command-ranking-url";
export { canonicalCommandUrl } from "@aux/contracts/command-ranking-url";
import type { CommandRankingSource } from "@aux/contracts";

export interface CommandCandidate {
  id: string;
  title: string;
  url?: string;
  section?: string;
  pinned?: boolean;
}

export type RankedCommandCandidate = CommandCandidate & { section: CommandRankingSource };
export interface CommandRank<T> {
  candidate: T;
  key: string;
  base: number;
  adjustment: number;
  score: number;
}

export function commandCandidateKey(candidate: RankedCommandCandidate): string {
  return canonicalCommandUrl(candidate.url) ?? `${candidate.section}\u0000${candidate.id}`;
}

export interface DroppedCommand {
  droppedId: string;
  keptId: string;
  key: string;
}

export const DEDUP_BY_TITLE_AND_HOST = new Set([
  "figma.com",
  "maps.google.com",
  "notion.so",
  "app.notion.com",
  "zoom.us",
  "opentable.com",
  "zillow.com",
  "github.com",
  "app.mode.com",
  "console.cloud.google.com",
]);

export function titleHostKey(candidate: CommandCandidate): string | null {
  if (!candidate.url) return null;
  try {
    const url = new URL(candidate.url);
    if (!DEDUP_BY_TITLE_AND_HOST.has(url.hostname.toLocaleLowerCase())) return null;
    const title = candidate.title.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase();
    return title ? `${title}\u0000${url.hostname.toLocaleLowerCase()}` : null;
  } catch {
    return null;
  }
}

/** Preserve Chromium relevance order, replacing a duplicate with its live tab.
 * Title aliases apply only to sites whose transient URLs are explicitly bundled. */
export function mergeCommandResults<T extends CommandCandidate>(
  host: T[],
  aux: T[],
): { rows: T[]; dropped: DroppedCommand[] } {
  type Group = { candidate: T; keys: Set<string>; index: number; live: boolean };
  const seen = new Map<string, Group>();
  const groups: Group[] = [];
  const dropped: DroppedCommand[] = [];
  for (const candidate of [...host, ...aux]) {
    const keys = [canonicalCommandUrl(candidate.url), titleHostKey(candidate)].filter(
      (key): key is string => !!key,
    );
    const matches = [...new Set(keys.flatMap((key) => (seen.has(key) ? [seen.get(key)!] : [])))].sort(
      (a, b) => a.index - b.index,
    );
    const group = matches[0];
    if (!group) {
      const created: Group = { candidate, keys: new Set(keys), index: groups.length, live: true };
      groups.push(created);
      for (const key of keys) seen.set(key, created);
      continue;
    }
    const options = [...matches.map((match) => match.candidate), candidate];
    const winner = options.find((option) => option.section === "tabs") ?? options[0]!;
    for (const option of options)
      if (option !== winner)
        dropped.push({ droppedId: option.id, keptId: winner.id, key: keys.find((key) => seen.has(key))! });
    group.candidate = winner;
    for (const match of matches) {
      if (match !== group) match.live = false;
      for (const key of match.keys) group.keys.add(key);
    }
    for (const key of keys) group.keys.add(key);
    for (const key of group.keys) seen.set(key, group);
  }
  return { rows: groups.filter((group) => group.live).map((group) => group.candidate), dropped };
}
