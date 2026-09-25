import { AuxError, HistoryProjectDeltaParams, HistoryProjectSnapshotParams } from "@aux/contracts";
import type { z } from "zod";
import type { Repo } from "../store/repo.js";

type Snapshot = z.infer<typeof HistoryProjectSnapshotParams>;
type Delta = z.infer<typeof HistoryProjectDeltaParams>;
type Cursor = { profileId: string; sourceGeneration: string; sequence: number };
type Staging = Cursor & { nextBatchIndex: number };

const CURSOR_KEY = "historyProjection:cursor";
const STAGING_KEY = "historyProjection:staging";

/** SQLite/FTS is a disposable projection of Chromium HistoryService. */
export class HistoryProjection {
  constructor(private repo: Repo, private profileId: string) {}

  private requireProfile(profileId: string) {
    if (profileId !== this.profileId) throw new AuxError("permission_denied", "History projection belongs to another browser Profile.");
  }

  snapshot(input: Snapshot) {
    this.requireProfile(input.profileId);
    const cursor = this.repo.getSetting<Cursor>(CURSOR_KEY);
    if (cursor?.sourceGeneration === input.sourceGeneration && cursor.sequence >= input.sequence)
      return { accepted: false, committed: true, nextBatchIndex: input.batchIndex + 1 };
    return this.repo.transaction(() => {
      let staging = this.repo.getSetting<Staging>(STAGING_KEY);
      if (input.batchIndex === 0) {
        this.repo.db.prepare("DELETE FROM history_projection_staging").run();
        staging = { profileId: input.profileId, sourceGeneration: input.sourceGeneration, sequence: input.sequence, nextBatchIndex: 0 };
      }
      if (!staging || staging.profileId !== input.profileId || staging.sourceGeneration !== input.sourceGeneration || staging.sequence !== input.sequence)
        throw new AuxError("conflict", "History snapshot generation changed; restart at batch zero.");
      if (input.batchIndex !== staging.nextBatchIndex)
        throw new AuxError("conflict", `History snapshot expected batch ${staging.nextBatchIndex}; resend from that batch.`);
      const insert = this.repo.db.prepare("INSERT OR REPLACE INTO history_projection_staging(url,title,visited_at) VALUES(?,?,?)");
      for (const visit of input.visits) insert.run(visit.url, visit.title, visit.visitedAt);
      staging.nextBatchIndex += 1;
      if (input.complete) {
        this.repo.db.prepare("DELETE FROM history").run();
        this.repo.db.prepare("INSERT INTO history(url,title,page_id,visited_at) SELECT url,title,NULL,visited_at FROM history_projection_staging").run();
        this.repo.db.prepare("DELETE FROM history_projection_staging").run();
        this.repo.setSetting(CURSOR_KEY, { profileId: input.profileId, sourceGeneration: input.sourceGeneration, sequence: input.sequence } satisfies Cursor);
        this.repo.deleteSetting(STAGING_KEY);
      } else this.repo.setSetting(STAGING_KEY, staging);
      return { accepted: true, committed: input.complete, nextBatchIndex: staging.nextBatchIndex };
    });
  }

  delta(input: Delta) {
    this.requireProfile(input.profileId);
    const cursor = this.repo.getSetting<Cursor>(CURSOR_KEY);
    if (!cursor || cursor.profileId !== input.profileId || cursor.sourceGeneration !== input.sourceGeneration)
      throw new AuxError("conflict", "History source changed; send a full snapshot before deltas.");
    if (input.sequence <= cursor.sequence) return { accepted: false, sequence: cursor.sequence };
    if (input.sequence !== cursor.sequence + 1)
      throw new AuxError("conflict", `History delta gap after ${cursor.sequence}; send a full snapshot.`);
    return this.repo.transaction(() => {
      if (input.clearRange) {
        const { since, before } = input.clearRange;
        this.repo.clearHistory({ since, before });
      }
      const remove = this.repo.db.prepare("DELETE FROM history WHERE url=? AND visited_at=?");
      for (const visit of input.removals) remove.run(visit.url, visit.visitedAt);
      const insert = this.repo.db.prepare("INSERT INTO history(url,title,page_id,visited_at) VALUES(?,?,NULL,?) ON CONFLICT(url,visited_at) DO UPDATE SET title=excluded.title");
      for (const visit of input.upserts) insert.run(visit.url, visit.title, visit.visitedAt);
      this.repo.setSetting(CURSOR_KEY, { ...cursor, sequence: input.sequence });
      return { accepted: true, sequence: input.sequence };
    });
  }

  /** Once native history is authoritative, runtime navigation cannot create visits. */
  isAuthoritative() { return !!this.repo.getSetting<Cursor>(CURSOR_KEY); }
}
