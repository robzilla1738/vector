import { originalTask as ownTask } from "../agent/loop/original-task-message.js";
import { createHash } from "node:crypto";
import { setImmediate as yieldTurn } from "node:timers/promises";
import { AuxError, SubagentSchema, SubagentGroupSchema, type Run } from "@aux/contracts";
import {
  MemoryDocumentMethodSchemas,
  MemoryDocumentResultSchemas,
  MemoryRecallQuerySchema,
  MemoryRecallResultSchema,
} from "@aux/contracts/memory-documents";
import type { Repo } from "../store/repo.js";
import { closedTranscriptEntries, type TranscriptStore } from "../agent/loop/transcript.js";
import type { ModelMessage } from "../agent/loop/types.js";
import { runAncestry } from "./run-lineage.js";

const MEMORY = new Set(["memory_search", "memory_read"]);
const searchInput = MemoryRecallQuerySchema.omit({ workspaceId: true });
const readInput = MemoryDocumentMethodSchemas["memory.pipeline.readSource"].omit({ workspaceId: true });
const MAX_RUNS = 4096;
const MAX_BYTES = 256 * 1024 * 1024;
const MAX_ROWS = 262144;
const hash = (value: unknown) =>
  createHash("sha256")
    .update(JSON.stringify(value) ?? "undefined")
    .digest("hex");
const object = (value: unknown): Record<string, unknown> | undefined =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
function unavailable(reason: string): never {
  throw new AuxError(
    "permission_denied",
    `Legacy Memory retirement is unavailable: ${reason}. No incomplete inspection is treated as clean.`,
  );
}
type Entry = { seq: number; kind: "message" | "park"; value: unknown };
type Snapshot = { run?: Run; entries: Entry[]; fingerprint: string; config: string };
export type LegacyArticleExposure = {
  runId: string;
  workspaceId: string;
  sequence: number;
  toolCallId: string;
  sourceId: string;
  revision: string;
  sha256: string;
};
export interface LegacyArticleInspection {
  readonly exposures: readonly LegacyArticleExposure[];
  readonly runIds: ReadonlySet<string>;
  dependentRunIds(originals: ReadonlySet<string>): ReadonlySet<string>;
  /** Exact original encrypted rows/configs, not a new source or model admission. */
  check(): void;
}

function storedRunIds(repo: Repo): string[] {
  const rows = repo.db
    .prepare(`SELECT run_id FROM runs UNION SELECT run_id FROM run_transcript ORDER BY run_id LIMIT ?`)
    .all(MAX_RUNS + 1) as { run_id: string }[];
  if (rows.length > MAX_RUNS) unavailable("history exceeds its run limit");
  for (const { run_id } of rows) {
    const size = repo.db
      .prepare(
        "SELECT length(CAST(coalesce(config,'') AS BLOB))+length(CAST(goal AS BLOB))+length(CAST(page_ids AS BLOB)) AS bytes FROM runs WHERE run_id=?",
      )
      .get(run_id) as { bytes: number } | undefined;
    if (size && size.bytes > 1024 * 1024) unavailable("an original run exceeds its scope size limit");
  }
  return rows.map((row) => row.run_id);
}
function originalMemoryCalls(repo: Repo, id: string) {
  const rows = repo.db
    .prepare(
      "SELECT tool_call_id,tool_name,started_at FROM run_tool_calls WHERE run_id=? ORDER BY tool_call_id LIMIT 16385",
    )
    .all(id);
  if (rows.length > 16384 || Buffer.byteLength(JSON.stringify(rows)) > 1024 * 1024)
    unavailable("original execution receipts exceed their inspection budget");
  return rows as { tool_call_id: string; tool_name: string; started_at: number }[];
}
function authorityFingerprint(repo: Repo, id: string): string {
  const run = repo.getRun(id);
  const draft = id.startsWith("conversation-branch:")
    ? id.slice("conversation-branch:".length)
    : run?.config?.chatId;
  const { contextCompaction: _compaction, ...authority } = run?.config ?? {};
  const children = repo.db
    .prepare(
      "SELECT a.agent_id,a.body,a.group_id,g.parent_run_id,g.body AS group_body FROM subagents a JOIN subagent_groups g ON g.group_id=a.group_id WHERE a.run_id=? OR a.reserved_run_id=? ORDER BY a.agent_id",
    )
    .all(id, id) as {
    agent_id: string;
    body: string;
    group_id: string;
    parent_run_id: string;
    group_body: string;
  }[];
  const lineage = children.map((row) => {
    const {
      state: _state,
      endedAt: _endedAt,
      ...agent
    } = SubagentSchema.parse(
      JSON.parse(repo.revealRecordField("subagents", [row.agent_id], "body", row.body)),
    );
    const { state: _groupState, ...group } = SubagentGroupSchema.parse(JSON.parse(row.group_body));
    return [row.agent_id, row.group_id, row.parent_run_id, agent, group];
  });
  return hash([
    run?.goal,
    run?.pageIds,
    authority,
    originalMemoryCalls(repo, id),
    draft ? repo.getSetting(`conversationBranch:${draft}`) : undefined,
    lineage,
  ]);
}
function messages(snapshot: Snapshot): { seq: number; message: ModelMessage }[] {
  return snapshot.entries
    .filter((entry) => entry.kind === "message")
    .map((entry) => {
      const value = object(entry.value);
      if (!value || !["system", "user", "assistant", "tool"].includes(String(value.role)))
        unavailable("a stored message is malformed");
      return { seq: entry.seq, message: entry.value as ModelMessage };
    });
}
/** Only explicit Forget/portable-copy owners call this. Never used as a read/model grant. */
export async function inspectLegacyArticleHistory(
  repo: Repo,
  transcript: TranscriptStore,
  scope: { workspaceId?: string; memoryId?: string } = {},
  checkOwner: () => void = () => {},
): Promise<LegacyArticleInspection> {
  const snapshots = new Map<string, Snapshot>();
  let totalBytes = 0,
    totalRows = 0;
  const relevant = (id: string) => {
    const run = repo.getRun(id);
    let workspaceId = run?.config?.contextWorkspaceId;
    if (!run && id.startsWith("conversation-branch:")) {
      const receipt = object(
        repo.getSetting(`conversationBranch:${id.slice("conversation-branch:".length)}`),
      );
      if (typeof receipt?.sourceRunId === "string")
        workspaceId = repo.getRun(receipt.sourceRunId)?.config?.contextWorkspaceId;
    }
    return !scope.workspaceId || !workspaceId || workspaceId === scope.workspaceId;
  };
  const originalIds = storedRunIds(repo).filter(relevant);
  for (const id of originalIds) {
    checkOwner();
    const run = repo.getRun(id),
      originalAuthority = authorityFingerprint(repo, id),
      entries: Entry[] = [];
    let fingerprint = hash([]),
      previous = 0;
    for (const page of transcript.retirementPages(id)) {
      totalBytes += page.bytes - previous;
      previous = page.bytes;
      totalRows += page.rows.length;
      if (totalBytes > MAX_BYTES || totalRows > MAX_ROWS)
        unavailable("history exceeds its inspection budget");
      entries.push(...page.rows);
      fingerprint = page.fingerprint;
      await yieldTurn();
      checkOwner();
    }
    if (authorityFingerprint(repo, id) !== originalAuthority)
      unavailable("an original run scope changed during transcript paging");
    snapshots.set(id, { run, entries, fingerprint, config: originalAuthority });
  }
  const exposureByRun = new Map<string, LegacyArticleExposure[]>(),
    visiting = new Set<string>();
  const callOwners = new Map<string, Map<string, string>>();
  const dependencies = new Map<string, Set<string>>();
  let dependencyCount = 0;
  const classify = (id: string, depth = 0): LegacyArticleExposure[] => {
    const cached = exposureByRun.get(id);
    if (cached) return cached;
    if (visiting.has(id) || depth > 32) unavailable("copied history is cyclic or too deep");
    const snapshot = snapshots.get(id);
    if (!snapshot) unavailable("the original copied history is missing");
    const closedRetired =
      snapshot.run?.config?.contextMemoryRevoked &&
      !snapshot.entries.length &&
      !snapshot.run.result &&
      ["completed", "failed", "cancelled"].includes(snapshot.run.status) &&
      !repo.listArtifacts({ runId: id }).length;
    if (closedRetired) {
      callOwners.set(id, new Map());
      exposureByRun.set(id, []);
      return [];
    }
    if (
      snapshot.run?.config?.contextMemoryRevoked &&
      snapshot.run.config.branchSourceRunIds?.length &&
      snapshot.entries.length
    )
      unavailable("a partially retired branch history is unprovable");
    const modern = snapshot.run?.config?.memoryRecallAdmissionVersion === 1;
    const ownCalls = new Map(
      originalMemoryCalls(repo, id)
        .filter((row) => MEMORY.has(row.tool_name))
        .map((row) => [row.tool_call_id, row.tool_name]),
    );
    visiting.add(id);
    const entries = messages(snapshot),
      origins = new Map<number, string>();
    const draft = id.startsWith("conversation-branch:") ? id.slice("conversation-branch:".length) : undefined;
    const branch = repo.getSetting<{ sourceRunId: string; sourceRunIds: string[] }>(
      `conversationBranch:${draft ?? snapshot.run?.config?.chatId ?? ""}`,
    );
    if (draft && (branch as { revoked?: boolean } | undefined)?.revoked && snapshot.entries.length)
      unavailable("a retired draft retains unprovable copied history");
    if (!modern && (draft || snapshot.run?.config?.branchSourceRunIds?.length)) {
      if (
        !branch ||
        !Array.isArray(branch.sourceRunIds) ||
        !branch.sourceRunIds.every((value) => typeof value === "string") ||
        typeof branch.sourceRunId !== "string"
      )
        unavailable("the original branch receipt is missing");
      if (
        snapshot.run &&
        hash(snapshot.run.config?.branchSourceRunIds) !==
          hash([...new Set([...branch.sourceRunIds, branch.sourceRunId])])
      )
        unavailable("the original branch receipt changed");
      let offset = 0;
      for (const sourceId of branch.sourceRunIds) {
        classify(sourceId, depth + 1);
        const prefix = closedTranscriptEntries(messages(snapshots.get(sourceId)!));
        for (const [index, entry] of prefix.entries()) {
          if (hash(entries[offset + index]?.message) !== hash(entry.message))
            unavailable("the copied branch prefix changed");
          origins.set(entries[offset + index]!.seq, sourceId);
        }
        offset += prefix.length;
      }
      if (
        draft
          ? offset !== entries.length
          : !snapshot.run || hash(entries[offset]?.message) !== hash(ownTask(snapshot.run))
      )
        unavailable("the original branch boundary changed");
    } else if (!modern && snapshot.run) {
      const child = repo.db
        .prepare("SELECT agent_id,body FROM subagents WHERE run_id=? OR reserved_run_id=? LIMIT 2")
        .all(id, id) as { agent_id: string; body: string }[];
      if (child.length > 1) unavailable("the child history is ambiguous");
      if (child.length) {
        runAncestry(repo, id);
        const agent = SubagentSchema.parse(
          JSON.parse(repo.revealRecordField("subagents", [child[0]!.agent_id], "body", child[0]!.body)),
        );
        classify(agent.sourceRunId, depth + 1);
        const prefix = closedTranscriptEntries(messages(snapshots.get(agent.sourceRunId)!));
        let common = 0;
        while (common < prefix.length && hash(entries[common]?.message) === hash(prefix[common]!.message))
          common++;
        const boundary = entries.findIndex(
          (entry, index) =>
            index > 0 && index <= common && hash(entry.message) === hash(ownTask(snapshot.run!)),
        );
        if (boundary < 0) unavailable("the original child prefix boundary is unavailable");
        for (let index = 0; index < boundary; index++) origins.set(entries[index]!.seq, agent.sourceRunId);
      }
    }
    const calls = new Map<string, { name: string; input: Record<string, unknown>; origin: string }>();
    const seen = new Map<string, { hash: string; park: boolean }>(),
      found: LegacyArticleExposure[] = [];
    const accept = (part: Record<string, unknown>, sequence: number, park: boolean) => {
      if (!MEMORY.has(String(part.toolName))) return;
      const callId = part.toolCallId;
      if (typeof callId !== "string") unavailable("a result has no original call ID");
      if (modern && !ownCalls.has(callId)) return;
      const call = calls.get(callId);
      if (!call || call.name !== part.toolName) unavailable("an original Memory call/result pair is missing");
      const output = object(part.output),
        encoded = hash(part.output),
        prior = seen.get(callId);
      if (prior) {
        if (!prior.park || park || prior.hash !== encoded)
          unavailable("a Memory result was duplicated or replaced");
        seen.set(callId, { hash: encoded, park: false });
        return;
      }
      seen.set(callId, { hash: encoded, park });
      // Copied modern history adds no new execution or retrospective admission.
      if (
        call.origin !== id &&
        snapshots.get(call.origin)?.run?.config?.memoryRecallAdmissionVersion === 1 &&
        !originalMemoryCalls(repo, call.origin).some((row) => row.tool_call_id === callId)
      )
        return;
      const ledger = repo.db
        .prepare("SELECT tool_name FROM run_tool_calls WHERE run_id=? AND tool_call_id=?")
        .get(call.origin, callId) as { tool_name: string } | undefined;
      if (ledger?.tool_name !== call.name) unavailable("an original Memory execution receipt is missing");
      if (output?.type === "error-text") return;
      if (!repo.columnCipher) unavailable("the original Memory transcript is not authenticated");
      if (output?.type !== "json") unavailable("an old successful Memory output is untyped or truncated");
      const parsed =
        call.name === "memory_search"
          ? MemoryRecallResultSchema.safeParse(output.value)
          : MemoryDocumentResultSchemas["memory.pipeline.readSource"].safeParse(output.value);
      if (!parsed.success) unavailable("a successful Memory result is malformed");
      const original = snapshots.get(call.origin)?.run;
      const workspaceId = original?.config?.contextWorkspaceId;
      if (!workspaceId) unavailable("the original Memory Space is missing");
      const sources = "matches" in parsed.data ? parsed.data.matches : [parsed.data];
      for (const source of sources) {
        if (
          call.name === "memory_read" &&
          ["sourceId", "revision", "sha256"].some(
            (key) => call.input[key] !== source[key as "sourceId" | "revision" | "sha256"],
          )
        )
          unavailable("the read result differs from its exact original request");
        if (["episodic", "site", "routine"].includes(source.kind)) {
          for (const reference of source.sourceRefs) {
            const sourceSpace = snapshots.get(reference.sourceRunId)?.run?.config?.contextWorkspaceId;
            if (sourceSpace && sourceSpace !== workspaceId)
              unavailable("a derived Memory result differs from its original Space");
            const key = JSON.stringify([workspaceId, reference.sourceRunId]);
            const receivers = dependencies.get(key) ?? new Set<string>();
            if (!receivers.has(call.origin) && ++dependencyCount > MAX_ROWS)
              unavailable("derived Memory dependencies exceed their inspection budget");
            receivers.add(call.origin);
            dependencies.set(key, receivers);
          }
        }
        if (source.kind !== "page") continue;
        if (!source.sourceId.startsWith("page:") || !source.sourceId.slice(5))
          unavailable("a page identity is malformed");

        if (
          (!scope.workspaceId || workspaceId === scope.workspaceId) &&
          (!scope.memoryId || source.sourceId === `page:${scope.memoryId}`)
        )
          found.push({
            runId: call.origin,
            workspaceId,
            sequence,
            toolCallId: callId,
            sourceId: source.sourceId,
            revision: source.revision,
            sha256: source.sha256,
          });
      }
    };
    for (const entry of snapshot.entries) {
      const value = object(entry.value);
      if (!value) unavailable("a stored transcript row is malformed");
      if (Array.isArray(value.content) && value.content.length > 256)
        unavailable("a stored message exceeds its bounded part limit");
      if (entry.kind === "message" && value.role === "tool" && !Array.isArray(value.content))
        unavailable("a stored tool result is untyped or truncated");
      if (
        entry.kind === "message" &&
        ["assistant", "tool"].includes(String(value.role)) &&
        typeof value.content !== "string" &&
        !Array.isArray(value.content)
      )
        unavailable("a stored tool message is malformed");
      if (entry.kind === "park") {
        if (!Array.isArray(value.pendingResults) || value.pendingResults.length > 256)
          unavailable("parked Memory outputs are malformed");
        for (const raw of value.pendingResults) {
          const part = object(raw);
          if (!part) unavailable("a parked result is malformed");
          if (typeof part.toolName !== "string" || typeof part.toolCallId !== "string")
            unavailable("a parked result identity is malformed");
          if (part.parked === true) continue;
          accept(
            {
              ...part,
              output:
                typeof part.output === "string"
                  ? { type: "text", value: part.output }
                  : { type: "json", value: part.output },
            },
            entry.seq,
            true,
          );
        }
      } else if (value.role === "assistant" && Array.isArray(value.content)) {
        for (const raw of value.content) {
          const part = object(raw);
          if (part?.type === "tool-call" && typeof part.toolName !== "string")
            unavailable("a stored tool call identity is malformed");
          if (MEMORY.has(String(part?.toolName)) && part?.type !== "tool-call")
            unavailable("a stored Memory call is malformed");
          if (part?.type !== "tool-call" || !MEMORY.has(String(part.toolName))) continue;
          if (typeof part.toolCallId !== "string" || calls.has(part.toolCallId) || !object(part.input))
            unavailable("a Memory call identity is malformed or reused");
          if (modern && !ownCalls.has(part.toolCallId)) continue;
          const copied = origins.get(entry.seq);
          const origin = copied ? callOwners.get(copied)?.get(part.toolCallId) : id;
          if (!origin) unavailable("the copied call has no original execution owner");
          const parsedInput = (part.toolName === "memory_search" ? searchInput : readInput).safeParse(
            part.input,
          );
          if (!parsedInput.success) unavailable("an original Memory request is malformed");
          calls.set(part.toolCallId, { name: String(part.toolName), input: parsedInput.data, origin });
        }
      } else if (value.role === "tool" && Array.isArray(value.content)) {
        for (const raw of value.content) {
          const part = object(raw);
          if (
            !part ||
            part.type !== "tool-result" ||
            typeof part.toolName !== "string" ||
            typeof part.toolCallId !== "string"
          )
            unavailable("a stored tool result identity is malformed");
          accept(part, entry.seq, false);
        }
      }
    }
    const originalCalls = originalMemoryCalls(repo, id).filter((row) => MEMORY.has(row.tool_name));
    const alreadyRetired =
      snapshot.run?.config?.contextMemoryRevoked &&
      snapshot.run.config.desktopContextRetired &&
      snapshot.run.config.contextMemoryIds?.length &&
      !snapshot.run.result &&
      snapshot.entries.every((entry) => entry.kind === "message" && object(entry.value)?.role === "user");
    const knownArticle =
      modern &&
      snapshot.run?.config?.contextMemoryIds?.some(
        (memoryId) => !scope.memoryId || memoryId === scope.memoryId,
      ) &&
      (!scope.workspaceId || snapshot.run.config.contextWorkspaceId === scope.workspaceId);
    if (
      !alreadyRetired &&
      !knownArticle &&
      (originalCalls.some(
        (row) =>
          calls.get(row.tool_call_id)?.origin !== id || calls.get(row.tool_call_id)?.name !== row.tool_name,
      ) ||
        [...calls.keys()].some((callId) => !seen.has(callId)))
    )
      unavailable("a Memory execution has no provable original call and stored outcome");
    const owners = new Map([...calls].map(([callId, call]) => [callId, call.origin]));
    if (modern)
      for (const { message } of entries)
        if (message.role === "assistant" && Array.isArray(message.content))
          for (const part of message.content)
            if (part.type === "tool-call" && MEMORY.has(part.toolName)) owners.set(part.toolCallId, id);
    callOwners.set(id, owners);
    visiting.delete(id);
    exposureByRun.set(id, found);
    return found;
  };
  for (const id of originalIds) {
    classify(id);
    checkOwner();
    await yieldTurn();
  }
  const exposures = [...exposureByRun.values()].flat();
  const check = () => {
    checkOwner();
    if (hash(storedRunIds(repo).filter(relevant)) !== hash(originalIds))
      unavailable("the original history set changed");
    for (const [id, snapshot] of snapshots) {
      if (authorityFingerprint(repo, id) !== snapshot.config) unavailable("an original run scope changed");
      let fingerprint = hash([]);
      for (const page of transcript.retirementPages(id)) fingerprint = page.fingerprint;
      if (fingerprint !== snapshot.fingerprint) unavailable("an original encrypted transcript changed");
    }
  };
  const dependentRunIds = (originals: ReadonlySet<string>) => {
    const result = new Set(originals),
      queue = [...originals];
    for (let index = 0; index < queue.length; index++) {
      const sourceRunId = queue[index]!,
        workspaceId = snapshots.get(sourceRunId)?.run?.config?.contextWorkspaceId;
      if (!workspaceId) continue;
      for (const receiver of dependencies.get(JSON.stringify([workspaceId, sourceRunId])) ?? [])
        if (!result.has(receiver)) {
          result.add(receiver);
          queue.push(receiver);
        }
    }
    return result;
  };
  check();
  return {
    exposures,
    runIds: dependentRunIds(
      new Set([
        ...exposures.map((source) => source.runId),
        ...[...snapshots].flatMap(([id, snapshot]) =>
          snapshot.run?.config?.contextMemoryIds?.some(
            (memoryId) => !scope.memoryId || memoryId === scope.memoryId,
          ) &&
          (!scope.workspaceId || snapshot.run.config.contextWorkspaceId === scope.workspaceId)
            ? [id]
            : [],
        ),
      ]),
    ),
    dependentRunIds,
    check,
  };
}

function resetContext(): never {
  throw new AuxError(
    "conflict",
    "This older chat has Memory context whose original admission cannot be verified. Use New Chat and explicitly choose current sources; original history and action receipts remain available.",
    { contextResetRequired: true },
  );
}

/** This is a refusal gate only. Historical retirement evidence can never backfill admission. */
export function assertLegacyMemoryContext(
  repo: Repo,
  transcript: TranscriptStore,
  runId: string,
  messages: ModelMessage[],
): void {
  const pending = [runId],
    seen = new Set<string>();
  while (pending.length) {
    const id = pending.pop()!;
    if (seen.has(id)) continue;
    seen.add(id);
    if (seen.size > MAX_RUNS) resetContext();
    if (id.startsWith("conversation-branch:")) {
      const receipt = object(
        repo.getSetting(`conversationBranch:${id.slice("conversation-branch:".length)}`),
      );
      if (
        !receipt ||
        typeof receipt.sourceRunId !== "string" ||
        !Array.isArray(receipt.sourceRunIds) ||
        !receipt.sourceRunIds.every((value) => typeof value === "string")
      )
        resetContext();
      const prefix = (receipt.sourceRunIds as string[]).flatMap((sourceId) =>
        transcript.forkEntries(sourceId).map((entry) => entry.message),
      );
      const copied = id === runId ? messages : transcript.load(id);
      if (hash(prefix) !== hash(copied)) resetContext();
      pending.push(...(receipt.sourceRunIds as string[]), receipt.sourceRunId);
      continue;
    }
    const run = repo.getRun(id);
    if (run?.config?.contextMemoryRevoked) resetContext();
    const legacy = run?.config?.memoryRecallAdmissionVersion !== 1;
    if (legacy) {
      const ledger = repo.db
        .prepare(
          "SELECT 1 FROM run_tool_calls WHERE run_id=? AND tool_name IN ('memory_search','memory_read') LIMIT 1",
        )
        .get(id);
      if (ledger) resetContext();
      const values = id === runId ? messages : transcript.retirementPages(id);
      const memoryMessage = (message: unknown) => {
        const value = object(message);
        return (
          ["assistant", "tool"].includes(String(value?.role)) &&
          Array.isArray(value?.content) &&
          value.content.some((raw) => {
            const part = object(raw);
            return (
              part &&
              MEMORY.has(String(part.toolName)) &&
              ["tool-call", "tool-result"].includes(String(part.type))
            );
          })
        );
      };
      let contains = !!ledger;
      if (Array.isArray(values)) contains ||= values.some(memoryMessage);
      else
        for (const page of values)
          for (const row of page.rows) {
            contains ||=
              row.kind === "message"
                ? memoryMessage(row.value)
                : object(row.value)?.pendingResults instanceof Array &&
                  (object(row.value)!.pendingResults as unknown[]).some((raw) =>
                    MEMORY.has(String(object(raw)?.toolName)),
                  );
          }
      if (contains) resetContext();
    }
    pending.push(...(run?.config?.branchSourceRunIds ?? []), ...(run?.config?.contextRunIds ?? []));
    for (const ancestor of run ? runAncestry(repo, id) : []) if (ancestor !== id) pending.push(ancestor);
  }
}
