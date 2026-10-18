import { randomUUID } from "node:crypto";
import { AuxError, TaskSchema, type RoutineCandidate, type Run, type Task } from "@aux/contracts";
import type { Repo } from "../../store/repo.js";
import { cosineSimilarity, LocalMemoryEmbeddings } from "../local-memory-embeddings.js";
import type { MemoryDiscoverySnapshot, MemoryPipeline } from "../memory-pipeline.js";

export type RoutineDiscoveryDependencies = {
  memory: Pick<MemoryPipeline, "discoverySnapshot" | "assertDiscoverySnapshot">;
  embeddingModelId?(workspaceId: string): string | undefined;
  request?: typeof fetch;
};
export type RoutineDiscoveryCandidate = { candidate: RoutineCandidate; snapshot: MemoryDiscoverySnapshot };
type Evidence = { task: Task; run: Run; text: string };
const words = (value: string) =>
  new Set(
    value
      .normalize("NFKC")
      .toLowerCase()
      .replace(/\b\d+\b/g, " ")
      .split(/[^\p{L}\p{N}]+/u)
      .filter(
        (word) =>
          word.length > 2 &&
          !["the", "and", "for", "with", "from", "this", "that", "please", "task"].includes(word),
      ),
  );
function lexicalSimilarity(a: string, b: string): number {
  const left = words(a),
    right = words(b),
    intersection = [...left].filter((word) => right.has(word)).length;
  return intersection >= 3 ? intersection / (left.size + right.size - intersection) : 0;
}

/** Installed local embeddings only; the scan never starts an agent or writes Memory. */
export async function scanRoutineCandidates(input: {
  repo: Repo;
  workspaceId: string;
  limit: number;
  deps: RoutineDiscoveryDependencies;
  embeddings: LocalMemoryEmbeddings;
  signal: AbortSignal;
}): Promise<RoutineDiscoveryCandidate[]> {
  const { repo, workspaceId, deps, signal } = input;
  const initial = await deps.memory.discoverySnapshot(workspaceId, []);
  signal.throwIfAborted();
  const existing = new Set(
    (
      repo.db
        .prepare(
          "SELECT json_extract(json,'$.sourceTaskId') AS task_id FROM routines WHERE workspace_id=? AND archived_at IS NULL",
        )
        .all(workspaceId) as { task_id: string | null }[]
    ).map((row) => row.task_id),
  );
  const tasks = new Map(
    (
      repo.db
        .prepare(
          "SELECT json FROM tasks WHERE workspace_id=? AND state='open' ORDER BY updated_at DESC LIMIT 200",
        )
        .all(workspaceId) as { json: string }[]
    )
      .map((row) => TaskSchema.parse(JSON.parse(row.json)))
      .filter((task) => !existing.has(task.taskId))
      .map((task) => [task.taskId, task]),
  );
  const rows = repo.db
    .prepare(
      "SELECT r.run_id FROM runs r JOIN run_lookup l ON l.run_id=r.run_id WHERE r.status='completed' AND json_extract(l.config,'$.contextWorkspaceId')=? ORDER BY coalesce(r.ended_at,r.created_at) DESC,r.run_id LIMIT 100",
    )
    .all(workspaceId) as { run_id: string }[];
  const evidence: Evidence[] = [];
  for (const row of rows) {
    signal.throwIfAborted();
    const run = repo.getRun(row.run_id),
      task = run?.config?.taskId ? tasks.get(run.config.taskId) : undefined;
    if (
      !run ||
      !task ||
      run.config?.taskRevision !== task.revision ||
      run.config.contextWorkspaceId !== workspaceId
    )
      continue;
    try {
      await deps.memory.discoverySnapshot(workspaceId, [run.runId]);
    } catch (error) {
      if (error instanceof AuxError && ["permission_denied", "not_found"].includes(error.code)) continue;
      throw error;
    }
    const report = [run.result?.report, run.result?.answer, run.result?.text].find(
      (value) => typeof value === "string",
    );
    evidence.push({
      task,
      run,
      text: [task.title, task.objective, run.goal, typeof report === "string" ? report.slice(0, 800) : ""]
        .join("\n")
        .slice(0, 2000),
    });
  }
  await deps.memory.assertDiscoverySnapshot(initial);
  if (evidence.length < 3) return [];
  const snapshot = await deps.memory.discoverySnapshot(
    workspaceId,
    evidence.map((item) => item.run.runId),
  );
  let vectors: number[][] | undefined;
  let method: RoutineCandidate["discoveryMethod"] = "lexical";
  const localSignal = AbortSignal.any([signal, AbortSignal.timeout(20_000)]);
  try {
    const available = await input.embeddings.discover(localSignal);
    const selected = deps.embeddingModelId?.(workspaceId),
      model = selected ? available.find((model) => model.modelId === selected) : available[0];
    if (model) {
      vectors = [];
      for (let start = 0; start < evidence.length; start += 8)
        vectors.push(
          ...(await input.embeddings.embedBatch(
            model,
            evidence.slice(start, start + 8).map((item) => item.text),
            localSignal,
          )),
        );
      method = "semantic";
    }
  } catch (error) {
    signal.throwIfAborted();
    if (
      !(error instanceof AuxError) &&
      !(error instanceof Error && ["TimeoutError", "AbortError"].includes(error.name))
    )
      throw error;
    vectors = undefined;
  }
  signal.throwIfAborted();
  await deps.memory.assertDiscoverySnapshot(snapshot);
  const clusters: number[][] = [];
  for (let index = 0; index < evidence.length; index++) {
    const cluster = clusters.find((group) =>
      vectors
        ? cosineSimilarity(vectors[index]!, vectors[group[0]!]!) >= 0.86
        : lexicalSimilarity(evidence[index]!.text, evidence[group[0]!]!.text) >= 0.6,
    );
    if (cluster) cluster.push(index);
    else clusters.push([index]);
  }
  const result = clusters
    .filter((group) => group.length >= 3)
    .sort((a, b) => b.length - a.length || a[0]! - b[0]!)
    .slice(0, Math.min(20, Math.max(1, input.limit)))
    .map((group) => {
      const first = evidence[group[0]!]!;
      const supportingRuns = group.map((index) => {
        const item = evidence[index]!;
        return {
          runId: item.run.runId,
          taskId: item.task.taskId,
          taskRevision: item.task.revision,
          sourceDigest: snapshot.sources.find((source) => source.runId === item.run.runId)!.sourceDigest,
        };
      });
      return {
        candidate: {
          candidateId: randomUUID(),
          expiresAt: Date.now() + 600_000,
          discoveryMethod: method,
          supportingRuns,
          taskId: first.task.taskId,
          taskRevision: first.task.revision,
          runId: first.run.runId,
          title: first.task.title,
          objective: first.task.objective,
          completedRuns: group.length,
          lastCompletedAt: first.run.endedAt ?? first.run.createdAt,
        },
        snapshot: {
          ...snapshot,
          sources: snapshot.sources.filter((source) =>
            supportingRuns.some((run) => run.runId === source.runId),
          ),
        },
      };
    });
  await deps.memory.assertDiscoverySnapshot(snapshot);
  return result;
}
