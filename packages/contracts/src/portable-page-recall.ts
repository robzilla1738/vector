import type { DatabaseSync } from "node:sqlite";
import { sanitizeOperationInputSamples } from "./operation-input-stats.js";
import { redactSettledRunInvocations } from "./forgotten-run-invocations.js";

type RecallConfig = {
  chatId?: string;
  contextMemoryIds?: string[]; contextMemoryRevoked?: boolean; contextRunIds?: string[];
  contextArtifactIds?: string[]; contextSourceArtifactIds?: string[]; contextImageArtifactIds?: string[];
  revokedArtifactIds?: string[];
  retryOfRunId?: string;
  context?: string; contextDocumentEvidence?: string; contextArtifactEvidence?: string;
};

/** The caller supplies the source Profile cipher for protected portable copies. */
export type PortableRecallCipher = {
  isEncrypted(value: string): boolean;
  decrypt(table: string, rowId: string, column: string, value: string): string;
  encrypt(table: string, rowId: string, column: string, value: string): string;
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
export function sanitizePortablePageRecall(db: DatabaseSync, cipher?: PortableRecallCipher): Set<string> {
  const has = (table: string) => !!db.prepare("SELECT 1 FROM sqlite_schema WHERE type='table' AND name=?").get(table);
  const protectedTable = (table: string) => !!db.prepare("SELECT 1 FROM aux_meta WHERE key=?").get(`protected_sqlite_v1:${table}`);
  const field = (table: string, id: string, column: string, value: string): string => {
    if (!protectedTable(table)) return value;
    if (!cipher) throw new Error("Protected portable data requires the source Profile key.");
    return cipher.decrypt(table, JSON.stringify([id]), column, value);
  };
  const sealed = (table: string, id: string, column: string, value: string): string =>
    protectedTable(table) ? cipher!.encrypt(table, JSON.stringify([id]), column, value) : value;
  const kvProtected = !!db.prepare("SELECT 1 FROM aux_meta WHERE key='protected_sqlite_v1:kv_filtered'").get();
  const kvValue = (key: string, value: string): string => {
    if (!kvProtected) return value;
    if (!cipher) throw new Error("Protected portable data requires the source Profile key.");
    return cipher.decrypt("kv", JSON.stringify([key]), "value", value);
  };
  const sealKv = (key: string, value: string): string =>
    kvProtected ? cipher!.encrypt("kv", JSON.stringify([key]), "value", value) : value;
  const artifactIds = new Set<string>();
  const affectedChats = new Set<string>();
  db.exec("BEGIN");
  try {
    // Startup has already scrubbed legacy input samples before protecting this table.
    // The sanitizer's SQL JSON scan cannot inspect ciphertext.
    if (!protectedTable("operation_implementations")) sanitizeOperationInputSamples(db);
    if (has("runs")) {
      const rows = db.prepare("SELECT run_id AS runId, config FROM runs")
        .all() as { runId: string; config: string | null }[];
      const parsed = rows.map(row => ({ runId: row.runId,
        config: row.config && JSON.parse(field("runs", row.runId, "config", row.config)) as RecallConfig || {} }));
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
        affectedChats.add(row.config.chatId??row.runId);
        if (has("run_messages")) db.prepare(`UPDATE run_messages SET status='cancelled'
          WHERE chat_id=? AND status IN ('accepted','delivering','needs_attention')`).run(
          row.config.chatId ?? row.runId);
        const owned = ownedArtifacts.get(row.runId) ?? [];
        for (const artifactId of owned) artifactIds.add(artifactId);
        if(has("result_versions"))for(const artifactId of owned)
          db.prepare("DELETE FROM result_versions WHERE artifact_id=? OR root_artifact_id=? OR parent_artifact_id=?")
            .run(artifactId,artifactId,artifactId);
        for (const table of ["artifacts", "model_calls", "events", "steps", "results", "datasets", "spans", "response_metadata"])
          if (has(table)) db.prepare(`DELETE FROM ${table} WHERE run_id=?`).run(row.runId);
        redactSettledRunInvocations(db, row.runId);
        db.prepare("UPDATE runs SET status='cancelled',result=NULL,status_message=?,error=?,config=? WHERE run_id=?")
          .run(sealed("runs", row.runId, "status_message", "Saved article unavailable after restore — generated answer removed"),
            sealed("runs", row.runId, "error", "Protected article context is not portable."),
            sealed("runs", row.runId, "config", JSON.stringify(redactedPageRecallConfig(row.config, owned))), row.runId);
        if (has("run_lookup")) db.prepare(`UPDATE run_lookup SET config=json_remove(
          json_set(config,'$.contextMemoryRevoked',json('true')),'$.contextImageArtifactIds') WHERE run_id=?`)
          .run(row.runId);
      }
    }
    if(has("kv")&&artifactIds.size){
      const entries=db.prepare("SELECT key,value FROM kv WHERE key LIKE 'setting:conversationAttachments:%'")
        .all() as {key:string;value:string}[];
      for(const {key,value} of entries){
        let records:unknown;
        try{records=JSON.parse(kvValue(key,value));}catch{
          if (kvProtected) throw new Error("Protected attachment metadata could not be authenticated.");
          if(affectedChats.has(key.slice("setting:conversationAttachments:".length)))db.prepare("DELETE FROM kv WHERE key=?").run(key);
          continue;
        }
        if(!Array.isArray(records))continue;
        const kept=records.filter(item=>!item||typeof item!=="object"||
          typeof item.sourceArtifactId!=="string"||!artifactIds.has(item.sourceArtifactId));
        if(kept.length!==records.length)db.prepare("UPDATE kv SET value=? WHERE key=?").run(sealKv(key,JSON.stringify(kept)),key);
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
