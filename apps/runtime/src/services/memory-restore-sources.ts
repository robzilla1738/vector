import { digest } from "@aux/contracts/util/digest";
import { derivedPageRecallRunIds } from "@aux/contracts/portable-page-recall";
import type { Repo } from "../store/repo.js";
import { protectedRunFamily } from "./run-lineage.js";
import { inspectLegacyArticleHistory } from "./legacy-memory-retirement.js";
import { TranscriptStore } from "../agent/loop/transcript.js";

/** Retirement evidence only; never grants a historical read or model admission. */
export async function memoryRestoreSources(repo: Repo, checkOwner: () => void) {
  const assertBounded = () => {
    const tables = [
      ["run_lookup", "run_id,config", 4096],
      ["artifacts", "artifact_id,run_id", 10000],
      ["set_run_members", "child_run_id,parent_run_id,set_id,member_id,source_digest", 4096],
      ["subagents", "agent_id,group_id,run_id,reserved_run_id,body", 4096],
      ["subagent_groups", "group_id,parent_run_id,body", 4096],
    ] as const;
    let bytes = 0;
    for (const [table, columns, limit] of tables) {
      const size = columns
        .split(",")
        .map((column) => `coalesce(length(CAST(${column} AS BLOB)),0)`)
        .join("+");
      const row = repo.db
        .prepare(`SELECT COUNT(*) AS count,coalesce(SUM(${size}),0) AS bytes FROM ${table}`)
        .get() as { count: number; bytes: number };
      bytes += row.bytes;
      if (row.count > limit || bytes > 32 * 1024 * 1024)
        throw new Error("Restore Memory source metadata exceeds its inspection budget.");
    }
  };
  const fingerprint = () => {
    assertBounded();
    return digest(
      JSON.stringify([
        repo.db.prepare("SELECT run_id,config FROM run_lookup ORDER BY run_id").all(),
        repo.db.prepare("SELECT artifact_id,run_id FROM artifacts ORDER BY artifact_id").all(),
        repo.db.prepare("SELECT * FROM set_run_members ORDER BY child_run_id").all(),
        repo.db.prepare("SELECT * FROM subagents ORDER BY agent_id").all(),
        repo.db.prepare("SELECT * FROM subagent_groups ORDER BY group_id").all(),
      ]),
    );
  };
  const ids = repo.db.prepare("SELECT run_id FROM runs ORDER BY run_id LIMIT 4097").all() as {
    run_id: string;
  }[];
  if (ids.length > 4096) throw new Error("Restore Memory source closure exceeds its run budget.");
  const original = fingerprint();
  const runs = ids.map(({ run_id }) => {
    const run = repo.getRun(run_id);
    if (!run) throw new Error("An original restore Memory source disappeared.");
    return { runId: run_id, config: run.config ?? {} };
  });
  const owners = new Map(
    (
      repo.db.prepare("SELECT artifact_id,run_id FROM artifacts ORDER BY artifact_id").all() as {
        artifact_id: string;
        run_id: string;
      }[]
    ).map((row) => [row.artifact_id, row.run_id]),
  );
  for (const run of runs)
    for (const id of run.config.revokedArtifactIds ?? []) if (!owners.has(id)) owners.set(id, run.runId);
  const legacy = await inspectLegacyArticleHistory(
    repo,
    new TranscriptStore(repo.db, repo.columnCipher),
    {},
    checkOwner,
  );
  let affected = new Set([
    ...legacy.runIds,
    ...runs
      .filter((run) => run.config.contextMemoryIds?.length || run.config.contextMemoryRefs?.length)
      .map((run) => run.runId),
  ]);
  for (;;) {
    if (affected.size > 4096) throw new Error("Restore Memory dependency closure exceeds its run budget.");
    const before = affected.size;
    affected = derivedPageRecallRunIds(
      runs,
      new Set([...affected, ...legacy.dependentRunIds(affected)]),
      owners,
    );
    if (affected.size)
      affected = derivedPageRecallRunIds(
        runs,
        new Set([...affected, ...protectedRunFamily(repo, affected)]),
        owners,
      );
    if (affected.size === before) break;
  }
  const check = () => {
    checkOwner();
    legacy.check();
    if (fingerprint() !== original) throw new Error("Original restore Memory source membership changed.");
  };
  check();
  return { affected, runs, check, digest: digest(JSON.stringify([original, [...affected].sort()])) };
}
