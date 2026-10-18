import { randomUUID } from "node:crypto";
import { MemoryClaimSchema, MemoryExtractionSchema } from "@aux/contracts";
import { digest } from "@aux/contracts/util/digest";
import type { MemoryPipeline, Repo } from "@aux/runtime";

/** Canonical pre-admission-fix generation. Never ask fixed extraction to produce unsafe data. */
export async function seedHistoricalRunMemory(
  pipeline: MemoryPipeline,
  repo: Repo,
  workspaceId: string,
  sourceRunId: string,
  approved = false,
) {
  const run = repo.getRun(sourceRunId)!;
  const text = [run.result?.report, run.result?.answer, run.result?.text].find(
    (value) => typeof value === "string",
  ) as string;
  const capturedAt = Date.now();
  const claim = MemoryClaimSchema.parse({
    claimId: randomUUID(),
    sourceRunId,
    text,
    capturedAt,
    source: { kind: "run-report", quote: text, quoteSha256: digest(text) },
  });
  const claims = approved ? [claim] : [];
  const inbox = approved ? [] : [claim];
  await pipeline.importRecoverySnapshot([
    {
      workspaceId,
      claims,
      inbox,
      history: [],
      imports: [],
      documents: [],
      dreams: [],
      retiredSources: { before: 0, sourceHashes: [] },
      activity: [
        MemoryExtractionSchema.parse({
          activityId: randomUUID(),
          sourceRunId,
          capturedAt,
          durationMs: 0,
          trigger: "manual",
          candidateIds: [claim.claimId],
          quotes: [text],
          status: "completed",
          modelId: "historical-fixture-model",
        }),
      ],
      verifiedFiles: [
        "claims.json.enc",
        "inbox.json.enc",
        "history.json.enc",
        "summary.md.enc",
        "handbook.md.enc",
        "imports.json.enc",
        "activity.json.enc",
        "documents.json.enc",
        "dream-operations.json.enc",
        "retired-sources.json.enc",
        ...claims.map((value) => `rollouts/${value.claimId}.json.enc`),
      ].sort(),
    },
  ]);
  return claim;
}

/** Historical modern receiver shape from the frozen pre-fix real host producer.
 * This is retirement evidence only; it never qualifies a current read/extraction.
 */
export async function seedHistoricalEpisodicReceiver(
  repo: Repo,
  workspaceId: string,
  claim: import("@aux/contracts").MemoryClaim,
) {
  const { TranscriptStore } = await import("@aux/runtime");
  const { MemoryRecallResultSchema, MemoryDocumentResultSchemas } =
    await import("@aux/contracts/memory-documents");
  const runId = "recall-run";
  repo.saveRun({
    runId,
    goal: "Read the saved workshop record",
    pageIds: [],
    status: "completed",
    createdAt: Date.now(),
    endedAt: Date.now(),
    config: {
      implementation: "agent-loop",
      contextWorkspaceId: workspaceId,
      memoryRecallAdmissionVersion: 1,
    },
    result: { report: "Read the saved workshop record." },
  });
  const source = {
    sourceId: `claim:${claim.claimId}`,
    kind: "episodic" as const,
    path: `episodic/${new Date(claim.capturedAt).toISOString().slice(0, 10)}.md`,
    title: "Saved source note",
    text: claim.text,
    revision: "0",
    sha256: digest(claim.text),
    updatedAt: claim.capturedAt,
    sourceRefs: [
      {
        claimId: claim.claimId,
        sourceRunId: claim.sourceRunId,
        quoteSha256: claim.source!.quoteSha256,
        effectiveSha256: digest(claim.text),
        claimRevision: 0,
      },
    ],
  };
  const search = MemoryRecallResultSchema.parse({
    mode: "lexical",
    matches: [
      { ...source, chunkId: digest(JSON.stringify(source)), heading: "", startLine: 1, endLine: 1, score: 1 },
    ],
    nextCursor: null,
    total: 1,
  });
  const read = MemoryDocumentResultSchemas["memory.pipeline.readSource"].parse({
    ...source,
    startLine: 1,
    endLine: 1,
    nextLine: null,
  });
  const calls = [
    {
      toolCallId: "search",
      toolName: "memory_search",
      input: { queries: ["quartz workshop"], kinds: ["episodic"], mode: "lexical" },
    },
    {
      toolCallId: "read",
      toolName: "memory_read",
      input: {
        sourceId: source.sourceId,
        revision: source.revision,
        sha256: source.sha256,
        startLine: 1,
        limitLines: 20,
      },
    },
  ];
  const transcript = new TranscriptStore(repo.db, repo.columnCipher);
  transcript.append(runId, [{ role: "user", content: "Read the saved workshop record" }]);
  for (const [index, call] of calls.entries()) {
    repo.db
      .prepare("INSERT INTO run_tool_calls VALUES(?,?,?,?)")
      .run(runId, call.toolCallId, call.toolName, Date.now());
    transcript.append(runId, [
      { role: "assistant", content: [{ type: "tool-call", ...call }] },
      {
        role: "tool",
        content: [
          {
            type: "tool-result",
            toolCallId: call.toolCallId,
            toolName: call.toolName,
            output: { type: "json", value: (index === 0 ? search : read) as never },
          },
        ],
      },
    ]);
  }
}
