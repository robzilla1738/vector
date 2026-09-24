import type { DatabaseSync } from "node:sqlite";

type RecallConfig = {
  contextMemoryIds?: string[]; contextMemoryRevoked?: boolean; contextRunIds?: string[];
  contextArtifactIds?: string[]; contextSourceArtifactIds?: string[]; contextImageArtifactIds?: string[];
  revokedArtifactIds?: string[];
  retryOfRunId?: string;
  context?: string; contextDocumentEvidence?: string; contextArtifactEvidence?: string;
};

/** Follow every saved prompt dependency, including generated artifacts and retries. */
export function derivedPageRecallRunIds(
  runs: { runId: string; config: RecallConfig }[], seeds: Set<string>, artifactOwners: Map<string, string>,
): Set<string> {
  const affected = new Set(seeds);
  const dependents = new Map<string, string[]>();
  for (const run of runs) {
    const config = run.config;
    const sourceRuns = [...(config.contextRunIds ?? []), ...(config.retryOfRunId ? [config.retryOfRunId] : [])];
    const sourceArtifacts = [...(config.contextArtifactIds ?? []), ...(config.contextSourceArtifactIds ?? []), ...(config.contextImageArtifactIds ?? [])];
    for (const id of new Set([...sourceRuns, ...sourceArtifacts.map(id => artifactOwners.get(id)).filter((id): id is string => !!id)])) {
      const next = dependents.get(id) ?? [];
      next.push(run.runId);
      dependents.set(id, next);
    }
  }
  const queue = [...seeds];
  for (let i = 0; i < queue.length; i++) {
    for (const id of dependents.get(queue[i]!) ?? []) {
      if (affected.has(id)) continue;
      affected.add(id);
      queue.push(id);
    }
  }
  return affected;
}

/** A revoked turn keeps its human request and lineage, but no derived prompt text. */
export function redactedPageRecallConfig<T extends RecallConfig>(config: T, artifactIds: string[] = []): T {
  return { ...config, contextMemoryRevoked: true, context: undefined,
    revokedArtifactIds: [...new Set([...(config.revokedArtifactIds ?? []), ...artifactIds])],
    contextDocumentEvidence: undefined, contextArtifactEvidence: undefined,
    contextArtifactIds: undefined, contextSourceArtifactIds: undefined, contextImageArtifactIds: undefined };
}

/** Remove Profile-bound article recall and every saved output derived from it in a portable database copy. */
export function sanitizePortablePageRecall(db: DatabaseSync): Set<string> {
  const has = (table: string) => !!db.prepare("SELECT 1 FROM sqlite_schema WHERE type='table' AND name=?").get(table);
  const artifactIds = new Set<string>();
  db.exec("BEGIN");
  try {
    if (has("runs")) {
      const rows = db.prepare("SELECT run_id AS runId, config FROM runs")
        .all() as { runId: string; config: string | null }[];
      const parsed = rows.map(row => ({ runId: row.runId,
        config: row.config && JSON.parse(row.config) as RecallConfig || {} }));
      const owners = new Map((has("artifacts")
        ? db.prepare("SELECT artifact_id AS artifactId,run_id AS runId FROM artifacts").all() as { artifactId: string; runId: string }[]
        : []).map(row => [row.artifactId, row.runId]));
      for (const row of parsed) for (const artifactId of row.config.revokedArtifactIds ?? [])
        if (!owners.has(artifactId)) owners.set(artifactId, row.runId);
      const ownedArtifacts = new Map<string, string[]>();
      for (const [artifactId, runId] of owners) {
        const ids = ownedArtifacts.get(runId) ?? [];
        ids.push(artifactId);
        ownedArtifacts.set(runId, ids);
      }
      const seeds = new Set(parsed.filter(row => row.config.contextMemoryIds?.length || row.config.contextMemoryRevoked)
        .map(row => row.runId));
      const affected = derivedPageRecallRunIds(parsed, seeds, owners);
      for (const row of parsed) {
        if (!affected.has(row.runId)) continue;
        const owned = ownedArtifacts.get(row.runId) ?? [];
        for (const artifactId of owned) artifactIds.add(artifactId);
        for (const table of ["artifacts", "model_calls", "events", "steps", "results", "datasets", "spans", "response_metadata"])
          if (has(table)) db.prepare(`DELETE FROM ${table} WHERE run_id=?`).run(row.runId);
        db.prepare("UPDATE runs SET status='cancelled',result=NULL,status_message=?,error=?,config=? WHERE run_id=?")
          .run("Saved article unavailable after restore — generated answer removed", "Protected article context is not portable.",
            JSON.stringify(redactedPageRecallConfig(row.config, owned)), row.runId);
      }
    }
    if (has("content_memory")) db.prepare("DELETE FROM content_memory").run();
    // Older profiles saved every page observation, including ordinary browsing.
    // It is no longer part of the portable state contract.
    if (has("observations")) db.exec("DROP TABLE observations");
    if (has("kv")) db.prepare("DELETE FROM kv WHERE key LIKE 'setting:contentMemoryPolicy:%'").run();
    db.exec("COMMIT");
    return artifactIds;
  } catch (error) { db.exec("ROLLBACK"); throw error; }
}
