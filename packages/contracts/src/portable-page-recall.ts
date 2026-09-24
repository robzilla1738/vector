import type { DatabaseSync } from "node:sqlite";

/** Remove Profile-bound article recall and every saved output derived from it in a portable database copy. */
export function sanitizePortablePageRecall(db: DatabaseSync): Set<string> {
  const has = (table: string) => !!db.prepare("SELECT 1 FROM sqlite_schema WHERE type='table' AND name=?").get(table);
  const artifactIds = new Set<string>();
  db.exec("BEGIN");
  try {
    if (has("runs")) {
      const rows = db.prepare(`SELECT run_id AS runId, config FROM runs
        WHERE json_array_length(json_extract(CASE WHEN json_valid(config) THEN config ELSE '{}' END,'$.contextMemoryIds'))>0`)
        .all() as { runId: string; config: string | null }[];
      for (const row of rows) {
        for (const artifact of db.prepare("SELECT artifact_id AS artifactId FROM artifacts WHERE run_id=?").all(row.runId) as { artifactId: string }[])
          artifactIds.add(artifact.artifactId);
        for (const table of ["artifacts", "model_calls", "events", "steps", "results", "datasets", "spans"])
          if (has(table)) db.prepare(`DELETE FROM ${table} WHERE run_id=?`).run(row.runId);
        if (has("response_metadata")) db.prepare("UPDATE response_metadata SET body_artifact_id=NULL WHERE run_id=?").run(row.runId);
        const config = row.config ? JSON.parse(row.config) as Record<string, unknown> : {};
        db.prepare("UPDATE runs SET status='cancelled',result=NULL,status_message=?,error=?,config=? WHERE run_id=?")
          .run("Saved article unavailable after restore — generated answer removed", "Protected article context is not portable.",
            JSON.stringify({ ...config, contextMemoryRevoked: true }), row.runId);
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
