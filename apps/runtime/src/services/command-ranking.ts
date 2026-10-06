import {
  CommandRankingEntrySchema,
  type CommandRankingEntry,
  type CommandRankingSource,
} from "@aux/contracts";
import { normalizeCommandRankingQuery } from "@aux/contracts/command-ranking-query";
import type { Repo } from "../store/repo.js";

const MAX_ENTRIES = 400;
const MAX_AGE_MS = 180 * 86_400_000;

/** A bounded, Profile-owned selection history. It records choices, not page content. */
export class CommandRankingStore {
  private readonly key: string;

  constructor(
    private readonly repo: Repo,
    profileId: string,
    private readonly now = Date.now,
  ) {
    if (!profileId) throw new Error("Command ranking requires a browser Profile identity.");
    this.key = `commandRanking.v1:${profileId}`;
  }

  list(): CommandRankingEntry[] {
    const raw = this.repo.getSetting<unknown>(this.key);
    if (!Array.isArray(raw)) return [];
    const cutoff = this.now() - MAX_AGE_MS;
    return raw
      .flatMap((item) => {
        const parsed = CommandRankingEntrySchema.safeParse(item);
        return parsed.success && parsed.data.lastUsedAt >= cutoff ? [parsed.data] : [];
      })
      .sort((a, b) => b.lastUsedAt - a.lastUsedAt)
      .slice(0, MAX_ENTRIES);
  }

  record(
    query: string,
    candidateKey: string,
    source: CommandRankingSource,
    pickOrigin: "typed" | "bar" | "link" = "bar",
  ): CommandRankingEntry {
    const normalizedQuery = normalizeCommandRankingQuery(query);
    const current = this.list();
    const prior = current.find((item) => item.candidateKey === candidateKey);
    const entry = CommandRankingEntrySchema.parse({
      query: normalizedQuery,
      candidateKey,
      source,
      frequency: Math.min(
        10000,
        (prior?.frequency ?? prior?.uses ?? 0) *
          Math.pow(0.5, Math.max(0, this.now() - (prior?.lastUsedAt ?? this.now())) / (7 * 86_400_000)) +
          { typed: 2, bar: 1.5, link: 1 }[pickOrigin],
      ),
      uses: Math.min(1000, (prior?.uses ?? 0) + 1),
      lastUsedAt: this.now(),
    });
    this.repo.setSetting(
      this.key,
      [entry, ...current.filter((item) => item.candidateKey !== candidateKey)].slice(0, MAX_ENTRIES),
    );
    return entry;
  }

  clear(): { removed: number } {
    const removed = this.list().length;
    this.repo.deleteSetting(this.key);
    return { removed };
  }
}
