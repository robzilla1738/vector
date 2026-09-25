import type { CommandRankingEntry, CommandRankingSource } from "@aux/contracts";
import { normalizeCommandRankingQuery } from "@aux/contracts/command-ranking-query";
import { commandCandidateKey, type CommandRank, type RankedCommandCandidate } from "./command-results";
import { matchScore } from "./suggest";

const SOURCE_BIAS: Record<CommandRankingSource, number> = {
  browser: 0,
  suggest: 6,
  tabs: 20,
  domains: 14,
  bookmarks: 12,
  recent: 8,
  programs: 0,
  runs: 0,
  results: 0,
  skills: 0,
  chats: 0,
};

/** Chromium keeps its supplied order; only Aux candidates enter this sorter. */
export function rankAuxCommandResults<T extends RankedCommandCandidate>(
  query: string,
  candidates: T[],
  entries: CommandRankingEntry[],
  now = Date.now(),
): CommandRank<T>[] {
  const normalized = normalizeCommandRankingQuery(query);
  const choices = new Map(
    entries.filter((entry) => entry.query === normalized).map((entry) => [entry.candidateKey, entry]),
  );
  return candidates
    .map((candidate, index) => {
      const key = commandCandidateKey(candidate);
      const choice = choices.get(key);
      const age = choice ? Math.max(0, now - choice.lastUsedAt) : 0;
      const adjustment = choice
        ? Math.round(Math.min(12, 3 * Math.log2(choice.uses + 1)) * Math.max(0, 1 - age / (90 * 86_400_000)))
        : 0;
      const base =
        Math.max(0, matchScore(normalized, candidate.title, candidate.url)) + SOURCE_BIAS[candidate.section];
      return { candidate, key, base, adjustment, score: base + adjustment, index };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ index: _index, ...rank }) => rank);
}
