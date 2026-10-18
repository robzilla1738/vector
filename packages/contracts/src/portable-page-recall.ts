import { documentBodyKey, documentBodyPrefix } from "./document-storage.js";
import type { DatabaseSync } from "node:sqlite";
import { sanitizeOperationInputSamples } from "./operation-input-stats.js";
import { redactSettledRunInvocations } from "./forgotten-run-invocations.js";

type RecallConfig = {
  chatId?: string;
  contextMemoryIds?: string[];
  contextMemoryRefs?: { memoryId: string }[];
  contextMemoryRevoked?: boolean;
  desktopContextRetired?: boolean;
  desktopContextQuotes?: unknown[];
  contextRunIds?: string[];
  branchSourceRunIds?: string[];
  contextArtifactIds?: string[];
  contextSourceArtifactIds?: string[];
  contextImageArtifactIds?: string[];
  revokedArtifactIds?: string[];
  retryOfRunId?: string;
  context?: string;
  contextDocumentEvidence?: string;
  contextAttachmentRefs?: { chatId: string; attachmentId: string; sha256: string }[];
  contextTaskDocumentRefs?: { taskId: string; taskRevision: number; evidenceId: string; sha256: string }[];
  contextArtifactEvidence?: string;
};

/** The caller supplies the source Profile cipher for protected portable copies. */
export type PortableRecallCipher = {
  isEncrypted(value: string): boolean;
  protects(table: string, column: string): boolean;
  decrypt(table: string, rowId: string, column: string, value: string): string;
  encrypt(table: string, rowId: string, column: string, value: string): string;
};

/** Follow every saved prompt dependency, including generated artifacts and retries. */
export function derivedPageRecallRunIds(
  runs: { runId: string; config: RecallConfig }[],
  seeds: Set<string>,
  artifactOwners: Map<string, string>,
): Set<string> {
  const affected = new Set(seeds);
  const dependents = new Map<string, string[]>();
  for (const run of runs) {
    const config = run.config;
    const sourceRuns = [
      ...(config.contextRunIds ?? []),
      ...(config.branchSourceRunIds ?? []),
      ...(config.retryOfRunId ? [config.retryOfRunId] : []),
    ];
    const sourceArtifacts = [
      ...(config.contextArtifactIds ?? []),
      ...(config.contextSourceArtifactIds ?? []),
      ...(config.contextImageArtifactIds ?? []),
    ];
    for (const id of new Set([
      ...sourceRuns,
      ...sourceArtifacts.map((id) => artifactOwners.get(id)).filter((id): id is string => !!id),
    ])) {
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
  return {
    ...config,
    contextMemoryRevoked: true,
    contextMemoryRefs: undefined,
    desktopContextQuotes: undefined,
    context: undefined,
    revokedArtifactIds: [...new Set([...(config.revokedArtifactIds ?? []), ...artifactIds])],
    contextDocumentEvidence: undefined,
    contextAttachmentRefs: undefined,
    contextTaskDocumentRefs: undefined,
    documentAdmissions: undefined,
    contextCompaction: undefined,
    queuedMessageContexts: undefined,
    contextArtifactEvidence: undefined,
    contextArtifactIds: undefined,
    contextSourceArtifactIds: undefined,
    contextImageArtifactIds: undefined,
  };
}

/** Remove Profile-bound article recall and every saved output derived from it in a portable database copy. */
export function sanitizePortablePageRecall(
  db: DatabaseSync,
  cipher?: PortableRecallCipher,
  protectedFamily?: (runIds: ReadonlySet<string>) => ReadonlySet<string>,
  retireGeneratedTask?: (runId: string, source: "article" | "desktop") => void,
  legacyArticleSources?: () => ReadonlySet<string>,
  legacyArticleDependents?: (originals: ReadonlySet<string>) => ReadonlySet<string>,
): Set<string> {
  const has = (table: string) =>
    !!db.prepare("SELECT 1 FROM sqlite_schema WHERE type='table' AND name=?").get(table);
  if (db.prepare("SELECT 1 FROM aux_meta WHERE key='field_codec_v3'").get() && !cipher)
    throw new Error("Encrypted portable data requires the source Profile key.");
  const field = (table: string, id: string, column: string, value: string): string =>
    cipher?.protects(table, column) ? cipher.decrypt(table, JSON.stringify([id]), column, value) : value;
  const sealed = (table: string, id: string, column: string, value: string): string =>
    cipher?.protects(table, column) ? cipher.encrypt(table, JSON.stringify([id]), column, value) : value;
  const artifactIds = new Set<string>();
  const affectedChats = new Set<string>();
  db.exec("BEGIN");
  try {
    const legacySources = legacyArticleSources?.() ?? new Set<string>();
    sanitizeOperationInputSamples(db);
    if (has("runs")) {
      const rows = db.prepare("SELECT run_id AS runId, config FROM runs").all() as {
        runId: string;
        config: string | null;
      }[];
      const parsed = rows.map((row) => ({
        runId: row.runId,
        config:
          (row.config && (JSON.parse(field("runs", row.runId, "config", row.config)) as RecallConfig)) || {},
      }));
      const owners = new Map(
        (has("artifacts")
          ? (db.prepare("SELECT artifact_id AS artifactId,run_id AS runId FROM artifacts").all() as {
              artifactId: string;
              runId: string;
            }[])
          : []
        ).map((row) => [row.artifactId, row.runId]),
      );
      for (const row of parsed)
        for (const artifactId of row.config.revokedArtifactIds ?? [])
          if (!owners.has(artifactId)) owners.set(artifactId, row.runId);
      const ownedArtifacts = new Map<string, string[]>();
      for (const [artifactId, runId] of owners) {
        const ids = ownedArtifacts.get(runId) ?? [];
        ids.push(artifactId);
        ownedArtifacts.set(runId, ids);
      }
      const seeds = new Set(
        parsed
          .filter(
            (row) =>
              row.config.contextMemoryRefs?.length ||
              row.config.contextMemoryIds?.length ||
              row.config.desktopContextQuotes?.length ||
              row.config.desktopContextRetired ||
              row.config.contextMemoryRevoked,
          )
          .map((row) => row.runId),
      );
      for (const runId of legacySources) seeds.add(runId);
      const expand = (seeds: Set<string>) => {
        let affected = derivedPageRecallRunIds(parsed, seeds, owners);
        for (;;) {
          if (affected.size > 4096)
            throw new Error("Portable source retirement dependency closure exceeds its run budget.");
          const previous = affected;
          affected = derivedPageRecallRunIds(
            parsed,
            new Set([...affected, ...(legacyArticleDependents?.(affected) ?? [])]),
            owners,
          );
          if (!protectedFamily) {
            for (const id of affected) {
              const setReceipt =
                has("set_run_members") &&
                db
                  .prepare("SELECT 1 FROM set_run_members WHERE child_run_id=? OR parent_run_id=? LIMIT 1")
                  .get(id, id);
              const childReceipt =
                has("subagents") &&
                has("subagent_groups") &&
                db
                  .prepare(
                    "SELECT 1 FROM subagents a JOIN subagent_groups g ON g.group_id=a.group_id WHERE a.run_id=? OR a.reserved_run_id=? OR g.parent_run_id=? LIMIT 1",
                  )
                  .get(id, id, id);
              if (setReceipt || childReceipt)
                throw new Error(
                  "Protected run families require authenticated runtime lineage for portable cleanup.",
                );
            }
            if (affected.size === previous.size) break;
            continue;
          }
          const family = protectedFamily(affected);
          const expanded = derivedPageRecallRunIds(parsed, new Set([...affected, ...family]), owners);
          if (expanded.size === previous.size) break;
          affected = expanded;
        }
        return affected;
      };
      const articleAffected = expand(
        new Set([
          ...legacySources,
          ...parsed
            .filter((row) => row.config.contextMemoryRefs?.length || row.config.contextMemoryIds?.length)
            .map((row) => row.runId),
        ]),
      );
      const desktopAffected = expand(
        new Set(
          parsed
            .filter((row) => row.config.desktopContextQuotes?.length || row.config.desktopContextRetired)
            .map((row) => row.runId),
        ),
      );
      const affected = expand(seeds);
      if (!legacyArticleSources && has("run_transcript")) {
        const histories = db.prepare("SELECT DISTINCT run_id FROM run_transcript").all() as {
          run_id: string;
        }[];
        if (histories.some((row) => !affected.has(row.run_id)))
          throw new Error(
            "Uninspected legacy transcripts require authenticated runtime retirement inspection before portable publication.",
          );
      }
      for (const row of parsed) {
        if (!affected.has(row.runId)) continue;
        const desktopRetired = desktopAffected.has(row.runId);
        if (desktopRetired && !row.config.desktopContextRetired && !retireGeneratedTask)
          throw new Error("Desktop source omission requires authenticated runtime transcript retirement.");
        if (articleAffected.has(row.runId) || desktopRetired) {
          const generated =
            (has("set_run_members") &&
              db.prepare("SELECT 1 FROM set_run_members WHERE child_run_id=?").get(row.runId)) ||
            (has("subagents") &&
              db
                .prepare("SELECT 1 FROM subagents WHERE run_id=? OR reserved_run_id=?")
                .get(row.runId, row.runId));
          if (generated && !retireGeneratedTask)
            throw new Error(
              "Generated protected tasks require authenticated runtime retirement for portable cleanup.",
            );
          retireGeneratedTask?.(row.runId, articleAffected.has(row.runId) ? "article" : "desktop");
        }
        affectedChats.add(row.config.chatId ?? row.runId);
        if (has("run_messages"))
          db.prepare(
            `UPDATE run_messages SET status='cancelled'
          WHERE chat_id=? AND status IN ('accepted','delivering','needs_attention')`,
          ).run(row.config.chatId ?? row.runId);
        const owned = ownedArtifacts.get(row.runId) ?? [];
        for (const artifactId of owned) artifactIds.add(artifactId);
        if (has("result_versions"))
          for (const artifactId of owned)
            db.prepare(
              "DELETE FROM result_versions WHERE artifact_id=? OR root_artifact_id=? OR parent_artifact_id=?",
            ).run(artifactId, artifactId, artifactId);
        for (const table of [
          "run_transcript",
          "artifacts",
          "model_calls",
          "events",
          "steps",
          "results",
          "datasets",
          "spans",
          "response_metadata",
        ])
          if (
            has(table) &&
            !(
              desktopRetired &&
              (table === "model_calls" ||
                table === "steps" ||
                (table === "run_transcript" && !articleAffected.has(row.runId)))
            )
          )
            db.prepare(`DELETE FROM ${table} WHERE run_id=?`).run(row.runId);
        if (!desktopRetired) redactSettledRunInvocations(db, row.runId);
        db.prepare(
          "UPDATE runs SET status='cancelled',result=NULL,status_message=?,error=?,config=? WHERE run_id=?",
        ).run(
          sealed(
            "runs",
            row.runId,
            "status_message",
            desktopRetired
              ? "Desktop source retired — generated answer removed"
              : "Saved article unavailable after restore — generated answer removed",
          ),
          sealed(
            "runs",
            row.runId,
            "error",
            desktopRetired
              ? "Desktop source retired; durable effects and invoices are preserved."
              : "Protected article context is not portable.",
          ),
          sealed(
            "runs",
            row.runId,
            "config",
            JSON.stringify({
              ...redactedPageRecallConfig(row.config, owned),
              ...(desktopRetired ? { desktopContextRetired: true } : {}),
            }),
          ),
          row.runId,
        );
        if (has("run_lookup"))
          db.prepare(
            `UPDATE run_lookup SET config=json_remove(
          json_set(config,'$.contextMemoryRevoked',json('true')),'$.contextImageArtifactIds','$.contextAttachmentRefs') WHERE run_id=?`,
          ).run(row.runId);
      }
    }
    if (has("kv") && artifactIds.size) {
      const removeDocument = (chatId: string, attachmentId?: string) => {
        if (!has("document_snapshots")) return;
        const clause =
          attachmentId === undefined
            ? "owner_kind='conversation' AND owner_id=?"
            : "owner_kind='conversation' AND owner_id=? AND document_id=?";
        const params = attachmentId === undefined ? [chatId] : [chatId, attachmentId];
        // Portable copies can have foreign_keys disabled; remove protected children explicitly.
        if (has("document_source_chunks"))
          db.prepare(`DELETE FROM document_source_chunks WHERE ${clause}`).run(...params);
        db.prepare(`DELETE FROM document_segments WHERE ${clause}`).run(...params);
        db.prepare(`DELETE FROM document_snapshots WHERE ${clause}`).run(...params);
      };
      const entries = db
        .prepare("SELECT key,value FROM kv WHERE key LIKE 'setting:conversationAttachments:%'")
        .all() as { key: string; value: string }[];
      for (const { key, value } of entries) {
        const chatId = key.slice("setting:conversationAttachments:".length);
        let records: unknown;
        let protectedMetadata = false;
        try {
          records = JSON.parse(value);
          if (typeof records === "string") {
            protectedMetadata = true;
            records = JSON.parse(
              cipher ? cipher.decrypt("kv", JSON.stringify([key]), "value", records) : records,
            );
          }
        } catch (error) {
          // Authentication failures are not malformed historical JSON and must fail closed.
          if (protectedMetadata) throw error;
          if (affectedChats.has(chatId)) {
            db.prepare("DELETE FROM kv WHERE key=?").run(key);
            const prefix = `setting:${documentBodyPrefix(chatId)}`;
            db.prepare("DELETE FROM kv WHERE substr(key,1,length(?))=?").run(prefix, prefix);
            removeDocument(chatId);
          }
          continue;
        }
        if (!Array.isArray(records)) continue;
        const kept = records.filter(
          (item) =>
            !item ||
            typeof item !== "object" ||
            typeof item.sourceArtifactId !== "string" ||
            !artifactIds.has(item.sourceArtifactId),
        );
        if (kept.length !== records.length) {
          for (const item of records) {
            if (!kept.includes(item) && typeof item?.attachmentId === "string") {
              db.prepare("DELETE FROM kv WHERE key=?").run(
                `setting:${documentBodyKey(chatId, item.attachmentId)}`,
              );
              removeDocument(chatId, item.attachmentId);
            }
          }
          const text = JSON.stringify(kept);
          const next = protectedMetadata
            ? JSON.stringify(cipher ? cipher.encrypt("kv", JSON.stringify([key]), "value", text) : text)
            : text;
          db.prepare("UPDATE kv SET value=? WHERE key=?").run(next, key);
        }
      }
    }
    if (has("content_memory")) db.prepare("DELETE FROM content_memory").run();
    // Older profiles saved every page observation, including ordinary browsing.
    // It is no longer part of the portable state contract.
    if (has("observations")) db.exec("DROP TABLE observations");
    if (has("kv")) db.prepare("DELETE FROM kv WHERE key LIKE 'setting:contentMemoryPolicy:%'").run();
    db.exec("COMMIT");
    return artifactIds;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
