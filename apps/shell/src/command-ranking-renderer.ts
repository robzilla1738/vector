import type { CommandRankingEntry, CommandRankingSource } from "@aux/contracts";
import { normalizeCommandRankingQuery } from "@aux/contracts/command-ranking-query";
import { commandCandidateKey, type CommandRank, type RankedCommandCandidate } from "./command-results";
import { queryMatcher } from "./suggest";

const SOURCE_BIAS: Record<CommandRankingSource, number> = {
  browser: 0,
  suggest: 6,
  tabs: 20,
  domains: 14,
  bookmarks: 12,
  closed: 10,
  history: 8,
  extensions: 8,
  recent: 8,
  programs: 0,
  runs: 0,
  results: 0,
  skills: 0,
  chats: 0,
  tasks: 0,
  memory: 0,
  sets: 0,
};

const cachedFrecency = new WeakMap<CommandRankingEntry[], { now: number; values: Map<string, number> }>();
export function prepareCommandFrecency(entries: CommandRankingEntry[], now: number): Map<string, number> {
  const cached = cachedFrecency.get(entries);
  if (cached?.now === now) return cached.values;
  const values = new Map(
    entries.map((entry) => [
      entry.candidateKey,
      Math.min(
        30,
        12 *
          Math.log2(
            1 +
              (entry.frequency ?? entry.uses) *
                Math.pow(0.5, Math.max(0, now - entry.lastUsedAt) / (7 * 86_400_000)),
          ),
      ),
    ]),
  );
  cachedFrecency.set(entries, { now, values });
  return values;
}

/** Chromium keeps its supplied order; only Aux candidates enter this sorter. */
export function rankAuxCommandResults<T extends RankedCommandCandidate>(
  query: string,
  candidates: T[],
  entries: CommandRankingEntry[],
  now = Date.now(),
): CommandRank<T>[] {
  const normalized = normalizeCommandRankingQuery(query);
  const frecency = prepareCommandFrecency(entries, now);
  const match = queryMatcher(normalized);
  return candidates
    .map((candidate, index) => {
      const key = commandCandidateKey(candidate);
      const adjustment = frecency.get(key) ?? 0;
      const base =
        Math.max(0, match(candidate.title, candidate.url, candidate)) +
        SOURCE_BIAS[candidate.section] +
        (candidate.pinned ? 25 : 0);
      return { candidate, key, base, adjustment, score: base + adjustment, index };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ index: _index, ...rank }) => rank);
}
