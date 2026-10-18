import { setImmediate } from "node:timers/promises";
import { EventTypes, type Run } from "@aux/contracts";
import { derivedPageRecallRunIds, redactedPageRecallConfig } from "@aux/contracts/portable-page-recall";
import type { Repo } from "../store/repo.js";
import { withSecureDelete } from "../store/db.js";
import { TranscriptStore } from "../agent/loop/transcript.js";
import { taskMessage } from "../agent/loop/task-message.js";
import type { ArtifactStore } from "./artifacts.js";
import type { ConversationDocuments } from "./conversation-documents.js";
import type { EventBus } from "../events.js";
export type DesktopContextRemoval = { workspaceId: string; appBundleIds?: readonly string[] };
/** Cancel first. Never recreate tool results or replay effects while retiring source-derived work. */
export async function retireDesktopContextOutputs(
  deps: {
    repo: Repo;
    events: EventBus;
    artifacts: ArtifactStore;
    documents: ConversationDocuments;
    cancel(runId: string): Promise<void>;
    retireCompactions(chatId: string): Promise<void>;
    cancelQueue(chatId: string): void;
    purgeBranches(): void;
  },
  scope: DesktopContextRemoval,
  options: { cancelOnly?: boolean } = {},
) {
  const rows = deps.repo.db.prepare("SELECT run_id FROM runs ORDER BY rowid").all() as { run_id: string }[];
  const runs: Run[] = [];
  for (let i = 0; i < rows.length; i++) {
    const run = deps.repo.getRun(rows[i]!.run_id);
    if (run) runs.push(run);
    if (i % 100 === 99) await setImmediate();
  }
  const seeds = new Set(
    runs
      .filter((run) =>
        run.config?.desktopContextQuotes?.some(
          (quote) =>
            quote.workspaceId === scope.workspaceId &&
            (!scope.appBundleIds || scope.appBundleIds.includes(quote.appBundleId)),
        ),
      )
      .map((run) => run.runId),
  );
  if (!seeds.size) return 0;
  const owners = new Map(
    (
      deps.repo.db.prepare("SELECT artifact_id,run_id FROM artifacts WHERE run_id IS NOT NULL").all() as {
        artifact_id: string;
        run_id: string;
      }[]
    ).map((row) => [row.artifact_id, row.run_id]),
  );
  const configs = runs.map((run) => ({
    runId: run.runId,
    config: {
      ...run.config,
      contextRunIds: [
        ...(run.config?.contextRunIds ?? []),
        ...(run.config?.branchSourceRunIds ?? []),
        ...(run.config?.setMemberSource ? [run.config.setMemberSource.parentRunId] : []),
      ],
    },
  }));
  const children = deps.repo.db
    .prepare(
      "SELECT g.parent_run_id,a.run_id,a.reserved_run_id FROM subagents a JOIN subagent_groups g ON g.group_id=a.group_id",
    )
    .all() as { parent_run_id: string; run_id: string | null; reserved_run_id: string }[];
  for (const child of children) {
    const row = configs.find((run) => run.runId === (child.run_id ?? child.reserved_run_id));
    row?.config.contextRunIds.push(child.parent_run_id);
  }
  const affected = derivedPageRecallRunIds(configs, seeds, owners),
    chats = new Set(
      runs.filter((run) => affected.has(run.runId)).map((run) => run.config?.chatId ?? run.runId),
    );
  // Mark every descendant unavailable before yielding into native/provider cancellation.
  if (!options.cancelOnly)
    deps.repo.transaction(() => {
      for (const run of runs)
        if (affected.has(run.runId))
          deps.repo.saveRun({ ...run, config: { ...run.config, contextMemoryRevoked: true } });
    });
  for (const chatId of chats) {
    deps.cancelQueue(chatId);
    await deps.retireCompactions(chatId);
  }
  for (const run of runs)
    if (
      affected.has(run.runId) &&
      !["completed", "partially_completed", "failed", "cancelled", "interrupted"].includes(run.status)
    )
      await deps.cancel(run.runId);
  if (options.cancelOnly) return affected.size;
  const revoked = new Set<string>();
  for (const runId of affected)
    for (const artifact of deps.repo.listArtifacts({ runId })) revoked.add(artifact.artifactId);
  for (const chatId of chats) deps.documents.forgetDerived(chatId, revoked);
  const transcript = new TranscriptStore(deps.repo.db, deps.repo.columnCipher);
  const generatedChildren = new Set(children.map((child) => child.run_id ?? child.reserved_run_id));
  for (const runId of affected) {
    const current = deps.repo.getRun(runId);
    if (!current) continue;
    const artifacts = deps.repo.listArtifacts({ runId });
    deps.artifacts.removeFiles(artifacts.map((artifact) => artifact.path));
    const entries = transcript.entries(runId);
    deps.repo.transaction(() =>
      withSecureDelete(deps.repo.db, () => {
        // Captured quotes were ephemeral. Remove generated messages/answers, retain real
        // user follow-ups, and rebuild the initial runtime task without inherited context.
        for (const entry of entries) {
          if (entry.message.role !== "user") {
            deps.repo.db.prepare("DELETE FROM run_transcript WHERE run_id=? AND seq=?").run(runId, entry.seq);
            continue;
          }
          if (entry.seq === 0) {
            const original = runs.find((run) => run.runId === runId)!;
            const projected = taskMessage({
              ...original,
              ...(generatedChildren.has(runId) || original.config?.setMemberSource
                ? { goal: "Desktop-source-derived task retired" }
                : {}),
              config: {
                ...original.config,
                context: undefined,
                contextDocumentEvidence: undefined,
                contextArtifactEvidence: undefined,
              },
            });
            deps.repo.db
              .prepare("UPDATE run_transcript SET message=? WHERE run_id=? AND seq=?")
              .run(
                deps.repo.protectRecordField(
                  "run_transcript",
                  [runId, entry.seq],
                  "message",
                  JSON.stringify(projected),
                ),
                runId,
                entry.seq,
              );
          }
        }
        deps.repo.db.prepare("DELETE FROM run_transcript WHERE run_id=? AND kind='park'").run(runId);
        for (const artifact of artifacts)
          deps.repo.db
            .prepare(
              "DELETE FROM result_versions WHERE artifact_id=? OR root_artifact_id=? OR parent_artifact_id=?",
            )
            .run(artifact.artifactId, artifact.artifactId, artifact.artifactId);
        for (const table of [
          "artifacts",
          "events",
          "results",
          "datasets",
          "spans",
          "response_metadata",
          "coding_repl_calls",
          "coding_repl_cells",
        ])
          deps.repo.db.prepare(`DELETE FROM ${table} WHERE run_id=?`).run(runId);
        deps.repo.db
          .prepare("DELETE FROM kv WHERE substr(key,1,length(?))=?")
          .run(`ckpt:run:${runId}:`, `ckpt:run:${runId}:`);
        // Billing, action intents, transitions, steps, operation receipts and undo data
        // remain authoritative audit records, including uncertain effects.
        deps.repo.saveRun({
          ...current,
          ...(generatedChildren.has(runId) || current.config?.setMemberSource
            ? { goal: "Desktop-source-derived task retired" }
            : {}),
          status: "cancelled",
          statusMessage: "Desktop source forgotten — generated answer removed",
          result: undefined,
          error: "Desktop context source retired. Inspect durable effects before repeating work.",
          config: {
            ...redactedPageRecallConfig(
              current.config ?? {},
              artifacts.map((artifact) => artifact.artifactId),
            ),
            desktopContextQuotes: undefined,
            desktopContextRetired: true,
          },
        });
      }),
    );
    deps.events.emit(EventTypes.RunUpdated, { run: deps.repo.getRun(runId)! }, runId);
    if (artifacts.length)
      deps.events.emit(
        "results.revoked",
        { artifactIds: artifacts.map((artifact) => artifact.artifactId) },
        runId,
      );
    deps.events.emit("conversation.context.changed", { chatId: current.config?.chatId ?? runId });
    await setImmediate();
  }
  deps.purgeBranches();
  return affected.size;
}
