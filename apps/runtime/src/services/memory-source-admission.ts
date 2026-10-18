import { memorySourcePolicyAllows } from "./memory-source-policy.js";
import { setImmediate as yieldTurn } from "node:timers/promises";
import { AuxError, SubagentSchema, type Run } from "@aux/contracts";
import { TranscriptStore, closedTranscriptEntries } from "../agent/loop/transcript.js";
import { originalTask } from "../agent/loop/original-task-message.js";
import type { Repo } from "../store/repo.js";
import { protectedRunFamily } from "./run-lineage.js";
import {
  memoryToolNames,
  memorySearchInput,
  memoryReadInput,
  memoryEvidenceHash as hash,
  memoryEvidenceObject as object,
  originalMemoryCalls,
  canonicalMemoryNoContent,
} from "./memory-call-metadata.js";

const MAX_RUNS = 4096;
const MAX_ROWS = 4096;
const MAX_BYTES = 8 * 1024 * 1024;
type Entry = { seq: number; kind: "message" | "park"; value: unknown };
type Snapshot = {
  run: Run;
  metadata: string;
  rows: Entry[];
  fingerprint?: string;
  knownDerived: boolean;
  policyAllowed: boolean;
  copiedSources: string[];
};

/** Operation-local refusal evidence. Never a read grant, saved marker or global history scan. */
export class MemorySourceAdmission {
  private readonly transcript: TranscriptStore;
  private readonly snapshots = new Map<string, Snapshot>();
  private readonly families = new Map<string, string[]>();
  private readonly familyMembership = new Map<string, string[]>();
  private readonly decisions = new Map<string, boolean>();
  private readonly refusals = new Set<string>();
  private readonly ownerErrors = new Set<unknown>();
  private rows = 0;
  private bytes = 0;
  constructor(
    private readonly repo: Repo,
    private readonly workspaceId: string,
    private readonly owner: () => void,
  ) {
    this.transcript = new TranscriptStore(repo.db, repo.columnCipher);
  }

  private checkOwner() {
    try {
      this.owner();
    } catch (error) {
      this.ownerErrors.add(error);
      throw error;
    }
  }

  private budget(): never {
    throw new AuxError(
      "backend_unavailable",
      "Memory source independence exceeds its bounded inspection budget.",
    );
  }

  private metadata(runId: string, account = false) {
    const size = this.repo.db
      .prepare(
        "SELECT length(CAST(coalesce(config,'') AS BLOB))+length(CAST(goal AS BLOB))+length(CAST(page_ids AS BLOB))+length(CAST(coalesce(result,'') AS BLOB)) AS bytes FROM runs WHERE run_id=?",
      )
      .get(runId) as { bytes: number } | undefined;
    if (size && size.bytes > 1024 * 1024) this.budget();
    const run = this.repo.getRun(runId);
    const receipt = run?.config?.chatId
      ? this.repo.getSetting(`conversationBranch:${run.config.chatId}`)
      : undefined;
    const children = this.repo.db
      .prepare(
        "SELECT a.agent_id,a.body,a.group_id,g.parent_run_id,g.body AS group_body FROM subagents a JOIN subagent_groups g ON g.group_id=a.group_id WHERE a.run_id=? OR a.reserved_run_id=? ORDER BY a.agent_id",
      )
      .all(runId, runId);
    const sets = this.repo.db
      .prepare(
        "SELECT * FROM set_run_members WHERE child_run_id=? OR parent_run_id=? ORDER BY child_run_id LIMIT 4097",
      )
      .all(runId, runId);
    if (sets.length > MAX_RUNS) this.budget();
    const evidence = [run, originalMemoryCalls(this.repo, runId), receipt, children, sets];
    const bytes = Buffer.byteLength(JSON.stringify(evidence));
    if (bytes > 1024 * 1024) this.budget();
    if (account) {
      this.bytes += bytes;
      if (this.bytes > MAX_BYTES) this.budget();
    }
    return hash(evidence);
  }

  private async load(runId: string, depth = 0): Promise<void> {
    if (this.snapshots.has(runId)) return;
    this.checkOwner();
    if (depth > 32 || this.snapshots.size >= MAX_RUNS) this.budget();
    const metadata = this.metadata(runId, true);
    const run = this.repo.getRun(runId);
    if (!run || run.config?.contextWorkspaceId !== this.workspaceId)
      throw new AuxError(
        "permission_denied",
        "An original Memory source family is unavailable in this Space.",
      );
    const policyAllowed = memorySourcePolicyAllows(this.repo, this.workspaceId, run);
    const knownDerived =
      !policyAllowed ||
      (run.config?.memoryRecallAdmissionVersion !== 1 &&
        originalMemoryCalls(this.repo, runId).some((row) => memoryToolNames.has(row.tool_name)));
    const snapshot: Snapshot = { run, metadata, rows: [], knownDerived, policyAllowed, copiedSources: [] };
    this.snapshots.set(runId, snapshot);
    // Proven excluded inputs or unsealed use need no transcript/article decryption.
    if (knownDerived) return;
    const capacity = MAX_ROWS - this.rows;
    const size = this.repo.db
      .prepare(
        `SELECT COUNT(*) AS rows,coalesce(SUM(bytes),0) AS bytes,coalesce(MAX(bytes),0) AS maximum FROM (SELECT length(CAST(coalesce(message,'') AS BLOB))+length(CAST(coalesce(park,'') AS BLOB)) AS bytes FROM run_transcript WHERE run_id=? ORDER BY seq LIMIT ?)`,
      )
      .get(runId, capacity + 1) as { rows: number; bytes: number; maximum: number };
    if (size.rows > capacity || size.maximum > 1024 * 1024 || size.bytes + this.bytes > MAX_BYTES)
      this.budget();
    let previousBytes = 0;
    for (const page of this.transcript.retirementPages(runId)) {
      this.rows += page.rows.length;
      this.bytes += page.bytes - previousBytes;
      previousBytes = page.bytes;
      if (this.rows > MAX_ROWS || this.bytes > MAX_BYTES) this.budget();
      snapshot.rows.push(...page.rows);
      snapshot.fingerprint = page.fingerprint;
      await yieldTurn();
      this.checkOwner();
      if (this.metadata(runId) !== metadata)
        throw new AuxError("cancelled", "The original Memory execution changed during inspection.");
    }
    const branch = run.config?.branchSourceRunIds?.length
      ? object(this.repo.getSetting(`conversationBranch:${run.config.chatId ?? ""}`))
      : undefined;
    if (run.config?.branchSourceRunIds?.length) {
      if (
        !branch ||
        typeof branch.sourceRunId !== "string" ||
        !Array.isArray(branch.sourceRunIds) ||
        !branch.sourceRunIds.every((id) => typeof id === "string") ||
        hash(run.config.branchSourceRunIds) !==
          hash([...new Set([...branch.sourceRunIds, branch.sourceRunId])])
      )
        throw new AuxError("permission_denied", "The original copied Memory source receipt is unavailable.");
      snapshot.copiedSources = [...new Set([...(branch.sourceRunIds as string[]), branch.sourceRunId])];
      for (const id of snapshot.copiedSources) await this.load(id, depth + 1);
    }
    const children = this.repo.db
      .prepare("SELECT agent_id,body FROM subagents WHERE run_id=? OR reserved_run_id=? LIMIT 2")
      .all(runId, runId) as { agent_id: string; body: string }[];
    if (children.length > 1)
      throw new AuxError("permission_denied", "The original child source is ambiguous.");
    if (children.length) {
      const agent = SubagentSchema.parse(
        JSON.parse(
          this.repo.revealRecordField("subagents", [children[0]!.agent_id], "body", children[0]!.body),
        ),
      );
      snapshot.copiedSources.push(agent.sourceRunId);
      await this.load(agent.sourceRunId, depth + 1);
    }
  }

  private messages(snapshot: Snapshot) {
    return snapshot.rows
      .filter((row) => row.kind === "message")
      .map((row) => {
        const value = object(row.value);
        if (!value || !["system", "user", "assistant", "tool"].includes(String(value.role)))
          throw new AuxError("permission_denied", "An original Memory message is malformed.");
        return { seq: row.seq, message: row.value as import("../agent/loop/types.js").ModelMessage };
      });
  }

  private independent(runId: string, visiting = new Set<string>()): boolean {
    const cached = this.decisions.get(runId);
    if (cached !== undefined) return cached;
    if (visiting.has(runId) || visiting.size >= 32) return false;
    visiting.add(runId);
    const snapshot = this.snapshots.get(runId);
    if (!snapshot || snapshot.knownDerived || snapshot.run.config?.contextMemoryRevoked) return false;
    const entries = this.messages(snapshot);
    let boundary = 0;
    const branch = snapshot.run.config?.branchSourceRunIds?.length
      ? object(this.repo.getSetting(`conversationBranch:${snapshot.run.config.chatId ?? ""}`))
      : undefined;
    if (branch) {
      if (!this.independent(String(branch.sourceRunId), new Set(visiting))) return false;
      for (const id of branch.sourceRunIds as string[]) {
        if (!this.independent(id, new Set(visiting))) return false;
        const prefix = closedTranscriptEntries(this.messages(this.snapshots.get(id)!));
        if (prefix.some((entry, index) => hash(entry.message) !== hash(entries[boundary + index]?.message)))
          return false;
        boundary += prefix.length;
      }
      if (hash(entries[boundary]?.message) !== hash(originalTask(snapshot.run))) return false;
    } else {
      const child = this.repo.db
        .prepare("SELECT agent_id,body FROM subagents WHERE run_id=? OR reserved_run_id=? LIMIT 1")
        .get(runId, runId) as { agent_id: string; body: string } | undefined;
      if (child) {
        const agent = SubagentSchema.parse(
          JSON.parse(this.repo.revealRecordField("subagents", [child.agent_id], "body", child.body)),
        );
        if (!this.independent(agent.sourceRunId, new Set(visiting))) return false;
        if (
          snapshot.run.config?.memoryRecallAdmissionVersion === 1 &&
          entries[0]?.seq === 0 &&
          hash(entries[0]?.message) === hash(originalTask(snapshot.run))
        ) {
          boundary = 0;
        } else {
          const prefix = closedTranscriptEntries(this.messages(this.snapshots.get(agent.sourceRunId)!));
          let common = 0;
          while (common < prefix.length && hash(entries[common]?.message) === hash(prefix[common]!.message))
            common++;
          boundary = entries.findIndex(
            (entry, index) =>
              index > 0 && index <= common && hash(entry.message) === hash(originalTask(snapshot.run)),
          );
          if (boundary < 0) return false;
        }
      }
    }
    const ownEntries = new Set(entries.slice(boundary).map((entry) => entry.seq));
    const ledger = new Map(
      originalMemoryCalls(this.repo, runId)
        .filter((row) => memoryToolNames.has(row.tool_name))
        .map((row) => [row.tool_call_id, row.tool_name]),
    );
    const calls = new Map<string, { name: string; input: Record<string, unknown> }>();
    const results = new Map<string, { hash: string; park: boolean }>();
    const modern = snapshot.run.config?.memoryRecallAdmissionVersion === 1;
    const result = (part: Record<string, unknown>, park: boolean): boolean => {
      if (!memoryToolNames.has(String(part.toolName))) return true;
      if (!modern || typeof part.toolCallId !== "string") return false;
      const call = calls.get(part.toolCallId);
      if (!call || call.name !== part.toolName || ledger.get(part.toolCallId) !== part.toolName) return false;
      const prior = results.get(part.toolCallId),
        fingerprint = hash(part.output);
      if (prior) {
        if (!prior.park || park || prior.hash !== fingerprint) return false;
        results.set(part.toolCallId, { hash: fingerprint, park: false });
        return true;
      }
      if (!canonicalMemoryNoContent(call.name, call.input, part.output)) return false;
      results.set(part.toolCallId, { hash: fingerprint, park });
      return true;
    };
    for (const row of snapshot.rows) {
      const value = object(row.value);
      if (!value) return false;
      if (row.kind === "message" && !ownEntries.has(row.seq)) continue;
      if (row.kind === "park") {
        if (!Array.isArray(value.pendingResults) || value.pendingResults.length > 256) return false;
        for (const raw of value.pendingResults) {
          const part = object(raw);
          if (!part || typeof part.toolName !== "string" || typeof part.toolCallId !== "string") return false;
          if (!memoryToolNames.has(part.toolName)) continue;
          if (part.parked === true) return false;
          if (
            !result(
              {
                ...part,
                output:
                  typeof part.output === "string"
                    ? { type: "text", value: part.output }
                    : { type: "json", value: part.output },
              },
              true,
            )
          )
            return false;
        }
      } else if (["assistant", "tool"].includes(String(value.role))) {
        if (typeof value.content === "string") {
          if (value.role === "tool") return false;
          continue;
        }
        if (!Array.isArray(value.content) || value.content.length > 256) return false;
        for (const raw of value.content) {
          const part = object(raw);
          if (!part) return false;
          if (
            ["tool-call", "tool-result"].includes(String(part.type)) &&
            (typeof part.toolName !== "string" || typeof part.toolCallId !== "string")
          )
            return false;
          if (!memoryToolNames.has(String(part.toolName))) continue;
          if (!modern || !this.repo.columnCipher || typeof part.toolCallId !== "string") return false;
          if (value.role === "assistant") {
            if (
              part.type !== "tool-call" ||
              calls.has(part.toolCallId) ||
              ledger.get(part.toolCallId) !== part.toolName
            )
              return false;
            const input = (part.toolName === "memory_search" ? memorySearchInput : memoryReadInput).safeParse(
              part.input,
            );
            if (!input.success) return false;
            calls.set(part.toolCallId, { name: String(part.toolName), input: input.data });
          } else if (part.type !== "tool-result" || !result(part, false)) return false;
        }
      }
    }
    const allowed =
      [...ledger.keys()].every((id) => calls.has(id) && results.has(id)) &&
      [...calls.keys()].every((id) => results.has(id));
    this.decisions.set(runId, allowed);
    return allowed;
  }

  async prepare(runIds: Iterable<string>): Promise<this> {
    for (const id of runIds) {
      this.checkOwner();
      if (this.families.has(id) || this.refusals.has(id)) continue;
      if (this.families.size + this.refusals.size >= MAX_RUNS) this.budget();
      const before = new Set(this.snapshots.keys());
      const beforeMembership = new Set(this.familyMembership.keys());
      try {
        const closure = new Set<string>();
        const includeFamily = (source: string) => {
          const family =
            this.familyMembership.get(source) ?? [...protectedRunFamily(this.repo, new Set([source]))].sort();
          for (const member of family) {
            this.familyMembership.set(member, family);
            closure.add(member);
            if (closure.size > MAX_RUNS) this.budget();
          }
        };
        includeFamily(id);
        // A copied source retains its whole authenticated effect family, not only the copied row.
        for (const member of closure) {
          await this.load(member);
          for (const source of this.snapshots.get(member)!.copiedSources) includeFamily(source);
        }
        const family = [...closure].sort();
        this.families.set(id, family);
        const allowed = family.every((member) => this.independent(member));
        this.decisions.set(id, allowed);
      } catch (error) {
        if (
          this.ownerErrors.has(error) ||
          (error instanceof AuxError && ["cancelled", "backend_unavailable"].includes(error.code))
        )
          throw error;
        this.checkOwner();
        // Canonical lineage ceilings are operation-wide failures, never truncated proof.
        if (
          error instanceof Error &&
          [
            "Run lineage exceeds its depth limit.",
            "Run descendants exceed their bounded authority limit.",
            "Run descendants exceed their depth limit.",
            "Protected run families exceed their bounded authority limit.",
          ].includes(error.message)
        )
          this.budget();
        this.families.delete(id);
        this.refusals.add(id);
        for (const member of this.snapshots.keys())
          if (!before.has(member)) {
            this.snapshots.delete(member);
            this.decisions.delete(member);
            this.familyMembership.delete(member);
          }
        for (const member of this.familyMembership.keys())
          if (!beforeMembership.has(member)) this.familyMembership.delete(member);
        this.decisions.set(id, false);
      }
    }
    this.check();
    return this;
  }

  has(runId: string): boolean {
    return this.families.has(runId) || this.refusals.has(runId);
  }
  allows(runId: string): boolean {
    return this.families.has(runId) && this.decisions.get(runId) === true;
  }
  digest(): string {
    return hash([...this.snapshots].map(([id, snapshot]) => [id, snapshot.metadata, snapshot.fingerprint]));
  }
  check(): void {
    this.checkOwner();
    for (const family of new Set(this.familyMembership.values()))
      if (hash([...protectedRunFamily(this.repo, new Set([family[0]!]))].sort()) !== hash(family))
        throw new AuxError("cancelled", "The original Memory source family changed.");
    let rows = 0,
      bytes = 0;
    for (const [id, snapshot] of this.snapshots) {
      if (this.metadata(id) !== snapshot.metadata)
        throw new AuxError("cancelled", "The original Memory source execution changed.");
      if (
        memorySourcePolicyAllows(this.repo, this.workspaceId, this.repo.getRun(id)!) !==
        snapshot.policyAllowed
      )
        throw new AuxError("cancelled", "The original Memory source policy eligibility changed.");
      if (snapshot.fingerprint !== undefined) {
        let fingerprint: string | undefined;
        let priorBytes = 0;
        for (const page of this.transcript.retirementPages(id, false)) {
          rows += page.rows.length;
          bytes += page.bytes - priorBytes;
          priorBytes = page.bytes;
          if (rows > MAX_ROWS || bytes > MAX_BYTES) this.budget();
          fingerprint = page.fingerprint;
        }
        if (fingerprint !== snapshot.fingerprint)
          throw new AuxError("cancelled", "The original Memory source transcript changed.");
      } else if (
        !snapshot.knownDerived &&
        this.repo.db.prepare("SELECT 1 FROM run_transcript WHERE run_id=? LIMIT 1").get(id)
      )
        throw new AuxError("cancelled", "The original empty Memory source history changed.");
    }
  }
}
