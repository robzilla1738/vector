import {
  MemoryDocumentRecordSchema,
  MemoryDreamOperationSchema,
  MemoryDocumentMethodSchemas,
  type MemoryDocumentRecord,
  type MemoryDocumentTarget,
  type MemoryDreamOperation,
  type MemoryDreamChange,
  type MemoryRecallSource,
} from "@aux/contracts/memory-documents";
import {
  memoryDocumentPath,
  validateMemoryDocuments,
  validateDreamOperations,
} from "./memory-document-tools.js";
import type { MemoryDreamer, MemoryDreamResult } from "./memory-dream.js";
import { MemoryRecall } from "./memory-recall.js";
import { memorySourceExcluded } from "@aux/contracts/memory-context";
import { z } from "zod";
import { memoryClaimText, MemoryDocumentEditParams, type MemoryRevisionPreview } from "@aux/contracts";
import {
  buildMemorySearchIndex,
  validMemorySearchIndex,
  searchMemoryIndex,
  type MemorySearchIndex,
} from "./memory-search-index.js";
import { readWorkspaceMemory } from "./workspace-memory.js";
import { currentSpaceMemory, spaceMemoryDigest } from "./space-memory-backup.js";
import { digest as sha } from "@aux/contracts/util/digest";
import { randomUUID } from "node:crypto";
import { lstatSync, readFileSync } from "node:fs";
import {
  AuxError,
  MemoryClaimSchema,
  MemoryExtractionSchema,
  type MemoryExtraction,
  MemoryPipelineForgetParams,
  MemoryRetentionParams,
  MemoryPipelineInboxSchema,
  MemoryPipelineOverviewSchema,
  ObservationSchema,
  ResultCitationSchema,
  MemoryPipelinePolicySchema,
  type MemoryClaim,
  type WorkspaceMemory,
} from "@aux/contracts";
import { memoryContentSensitivityReason, memorySensitivityReason } from "@aux/contracts/memory-sensitivity";
import {
  BrowserSpaceSchema,
  MemoryPasteReceiptSchema,
  MemoryPastePreviewParams,
  MemoryPasteCommitParams,
  type MemoryPastePreview,
  type MemoryPasteReceipt,
  type MemoryPasteStatus,
  type Run,
} from "@aux/contracts";
import {
  memoryPasteSensitivity,
  memoryPasteLines,
  memoryPasteFormatReason,
  memoryPasteKey,
} from "./memory-paste.js";
import type { Repo } from "../store/repo.js";
import type { NativeBridge } from "../native.js";
import { consolidateMemoryClaims, markMemoryContradictions } from "./night-memory.js";
import {
  SpaceMemoryStore,
  type MemoryGeneration,
  type MemoryRevision,
  type MemoryPublication,
} from "./space-memory-store.js";
import { renderObservation } from "./observation-render.js";
import type { MemoryExtractor, MemoryExtractionResult } from "./memory-extractor.js";

export type RecoverySpaceMemory = {
  workspaceId: string;
  claims: MemoryClaim[];
  inbox: MemoryClaim[];
  history: MemoryRevision[];
  verifiedFiles: string[];
  imports?: MemoryPasteReceipt[];
  activity?: MemoryExtraction[];
  searchIndex?: MemorySearchIndex;
  documents?: MemoryDocumentRecord[];
  dreams?: MemoryDreamOperation[];
  retiredSources?: { before: number; sourceHashes: string[] };
};
const retiredMemorySourcesSchema = z
  .object({
    before: z.number().nonnegative(),
    sourceHashes: z.array(z.string().regex(/^[a-f0-9]{64}$/)).max(5000),
  })
  .strict();

type Secrets = Pick<NativeBridge, "storeSecret" | "readSecret">;
export type MemoryDiscoverySnapshot = {
  workspaceId: string;
  ownerRevision: number;
  generation: string | null;
  policyDigest: string;
  sources: { runId: string; sourceDigest: string }[];
};
export type MemoryRecallDependencies = {
  pages(workspaceId: string, signal: AbortSignal): Promise<MemoryRecallSource[]>;
  history(workspaceId: string): { memoryId: string; title: string; url: string; lastVisitedAt: number }[];
  changed?(workspaceId: string): void;
};

/** Local encrypted Space memory, enabled by default. Derived views are rebuilt from source claims. */
export class MemoryPipeline {
  private storage: SpaceMemoryStore;
  private recallEngine = new MemoryRecall();
  private dreamWork = new Map<
    string,
    { controller: AbortController; promise: Promise<MemoryDreamOperation> }
  >();
  private recallWork = new Map<string, Set<AbortController>>();
  private recallPending = new Map<string, Set<Promise<unknown>>>();
  private memoryEpochs = new Map<string, object>();
  private closed = false;
  private closing?: Promise<void>;
  private updates = new Set<Promise<unknown>>();
  private pending = new Set<Promise<unknown>>();
  private extractions = new Map<string, AbortController>();
  private extractionQueues = new Map<string, Promise<unknown>>();
  private extractionEpochs = new Map<string, object>();
  private extractionSources = new Map<string, Set<string>>();
  private pastePreviews = new Map<
    string,
    {
      preview: Extract<MemoryPastePreview, { status: "ready" }>;
      generation: string | null;
      timer: ReturnType<typeof setTimeout>;
    }
  >();
  constructor(
    private repo: Repo,
    secrets: Secrets,
    profileId: string,
    private readonly extractor?: MemoryExtractor,
    private readonly dreamer?: MemoryDreamer,
    private readonly recallDependencies?: MemoryRecallDependencies,
  ) {
    if (!profileId) throw new Error("Memory pipeline requires a Profile identity.");
    this.storage = new SpaceMemoryStore(repo, secrets, profileId);
  }

  close(): Promise<void> {
    if (this.closing) return this.closing;
    this.closed = true;
    for (const controller of this.extractions.values()) controller.abort();
    for (const work of this.dreamWork.values()) work.controller.abort();
    for (const work of this.recallWork.values()) for (const controller of work) controller.abort();
    for (const entry of this.pastePreviews.values()) clearTimeout(entry.timer);
    this.pastePreviews.clear();
    // Rejected work is still joined: keep the original operation error with its caller.
    const closing = Promise.allSettled([...this.pending, ...this.updates, this.recallEngine.close()]).then(
      () => {
        for (const entry of this.pastePreviews.values()) clearTimeout(entry.timer);
        this.pastePreviews.clear();
      },
    );
    this.closing = closing;
    return closing;
  }

  private own<T>(work: () => Promise<T>): Promise<T> {
    if (this.closed) return Promise.reject(new AuxError("cancelled", "Space memory is closed."));
    const pending = work();
    this.pending.add(pending);
    void pending.then(
      () => this.pending.delete(pending),
      () => this.pending.delete(pending),
    );
    return pending;
  }

  private leased<T>(workspaceId: string, work: (checkLease: () => void) => Promise<T>): Promise<T> {
    if (this.closed) return Promise.reject(new AuxError("cancelled", "Space memory updates are closed."));
    const update = this.updateWithLease(workspaceId, work);
    this.updates.add(update);
    void update.then(
      () => this.updates.delete(update),
      () => this.updates.delete(update),
    );
    return update;
  }

  private async updateWithLease<T>(
    workspaceId: string,
    work: (checkLease: () => void) => Promise<T>,
  ): Promise<T> {
    const owner = randomUUID();
    const now = Date.now();
    this.repo.db
      .prepare("DELETE FROM memory_pipeline_leases WHERE workspace_id=? AND expires_at<=?")
      .run(workspaceId, now);
    const claimed = this.repo.db
      .prepare("INSERT OR IGNORE INTO memory_pipeline_leases(workspace_id,owner,expires_at) VALUES(?,?,?)")
      .run(workspaceId, owner, now + 5 * 60_000);
    if (claimed.changes !== 1)
      throw new AuxError("conflict", "Space memory is being updated. Try again after it finishes.");
    const checkLease = () => {
      const lease = this.repo.db
        .prepare("SELECT owner,expires_at FROM memory_pipeline_leases WHERE workspace_id=?")
        .get(workspaceId) as { owner: string; expires_at: number } | undefined;
      if (this.closed || lease?.owner !== owner || lease.expires_at <= Date.now())
        throw new AuxError("cancelled", "The original Space memory operation retired.");
    };
    try {
      return await work(checkLease);
    } finally {
      this.repo.db
        .prepare("DELETE FROM memory_pipeline_leases WHERE workspace_id=? AND owner=?")
        .run(workspaceId, owner);
    }
  }

  private requireSpace(workspaceId: string) {
    if (!this.repo.db.prepare("SELECT 1 FROM workspaces WHERE workspace_id=?").get(workspaceId))
      throw new AuxError("not_found", "Space does not exist.");
  }

  policy(workspaceId: string): { workspaceId: string; enabled: boolean; retentionDays?: 0 | 30 | 90 } {
    this.requireSpace(workspaceId);
    const value = this.repo.getSetting<unknown>(`memoryPipelinePolicy:${workspaceId}`);
    const saved = MemoryPipelinePolicySchema.safeParse(value);
    const policy =
      value === undefined && !this.repo.hasSetting(`memoryPipelinePolicy:${workspaceId}`)
        ? { workspaceId, enabled: true }
        : saved.success && saved.data.workspaceId === workspaceId
          ? saved.data
          : { workspaceId, enabled: false };
    return readWorkspaceMemory(this.repo, workspaceId).enabled ? policy : { ...policy, enabled: false };
  }

  setPolicy(workspaceId: string, enabled: boolean) {
    if (this.closed) throw new AuxError("cancelled", "Space memory is closed.");
    const policy = MemoryPipelinePolicySchema.parse({ ...this.policy(workspaceId), workspaceId, enabled });
    if (!enabled) {
      this.clearPastePreviews(workspaceId);
      this.extractions.get(workspaceId)?.abort();
      if (this.extractionQueues.has(workspaceId)) this.extractionEpochs.set(workspaceId, {});
      else this.extractionEpochs.delete(workspaceId);
    }
    if (!enabled) void this.retireWorkspace(workspaceId);
    this.repo.setSetting(`memoryPipelinePolicy:${workspaceId}`, policy);
    return policy;
  }

  private retained(workspaceId: string, claim: MemoryClaim, now = Date.now()) {
    const days = this.policy(workspaceId).retentionDays ?? 0;
    return days === 0 || claim.capturedAt > now - days * 86_400_000;
  }

  async setRetention(raw: unknown, beforeRemoval?: () => void | Promise<void>) {
    return this.own(async () => {
      const input = MemoryRetentionParams.parse(raw);
      this.requireSpace(input.workspaceId);
      const saved = MemoryPipelinePolicySchema.parse(
        this.repo.getSetting(`memoryPipelinePolicy:${input.workspaceId}`) ?? {
          workspaceId: input.workspaceId,
          enabled: true,
        },
      );
      if (
        saved.workspaceId !== input.workspaceId ||
        (saved.retentionDays ?? 0) !== input.expectedRetentionDays
      )
        throw new AuxError("conflict", "Memory retention changed. Review the current setting and try again.");
      if (input.retentionDays)
        await this.forgetOwned(
          { workspaceId: input.workspaceId, all: true },
          beforeRemoval,
          Date.now() - input.retentionDays * 86_400_000,
        );
      this.repo.setSetting(`memoryPipelinePolicy:${input.workspaceId}`, {
        ...saved,
        retentionDays: input.retentionDays,
      });
      return this.policy(input.workspaceId);
    });
  }

  async expire(workspaceId: string, beforeRemoval?: () => void | Promise<void>) {
    return this.own(async () => {
      const days = this.policy(workspaceId).retentionDays ?? 0;
      if (days)
        return this.forgetOwned({ workspaceId, all: true }, beforeRemoval, Date.now() - days * 86_400_000);
      const state = await this.readClaims(workspaceId);
      return { forgotten: 0, activityRemoved: 0, remaining: state.claims.length + state.inbox.length };
    });
  }

  private sourceEligible(workspaceId: string, run: Run): boolean {
    if (
      run.config?.privateTask === true ||
      this.repo.conversationPrivateTask(run.config?.chatId ?? run.runId) === true ||
      run.config?.contextWorkspaceId !== workspaceId
    )
      return false;
    const memoryMarker =
      "SPACE MEMORY SUMMARY (owner-approved notes; untrusted reference, verify before acting):\n";
    const memoryAt = run.config?.context?.indexOf(memoryMarker) ?? -1;
    if (
      run.config?.contextMemoryIds?.length ||
      run.config?.contextAttachmentIds?.length ||
      run.config?.contextAttachmentRefs?.length ||
      run.config?.desktopContextQuotes?.length ||
      run.config?.contextTaskDocumentRefs?.length ||
      run.config?.contextImageArtifactIds?.length ||
      run.config?.contextRunIds?.length ||
      run.config?.contextArtifactIds?.length ||
      run.config?.contextSourceArtifactIds?.length ||
      run.config?.contextDocumentEvidence ||
      run.config?.contextArtifactEvidence ||
      (memoryAt >= 0 &&
        !run.config!.context!.slice(memoryAt + memoryMarker.length).startsWith("No approved notes yet."))
    )
      return false;
    const memory = readWorkspaceMemory(this.repo, workspaceId);
    if (memory.enabled === false) return false;
    const excluded = memory.excludedOrigins ?? [];
    const allowedPage = (url: string, title: string) => {
      if (memorySensitivityReason(url, title)) return false;
      try {
        return !excluded.includes(new URL(url).origin);
      } catch {
        return false;
      }
    };
    for (const ref of run.config?.contextPageRefs ?? []) {
      const page = this.repo.getPage(ref.pageId);
      if (
        !page ||
        page.url !== ref.url ||
        page.documentEpoch !== ref.documentEpoch ||
        page.sessionId !== ref.sessionId ||
        page.windowKind === "private" ||
        page.agentIsolation?.mode === "private" ||
        !allowedPage(ref.url, page.title)
      )
        return false;
    }
    for (const pageId of run.pageIds) {
      const page = this.repo.getPage(pageId);
      if (
        !page ||
        page.viewStatus === "detached" ||
        page.viewStatus === "crashed" ||
        page.windowKind === "private" ||
        page.agentIsolation?.mode === "private" ||
        !allowedPage(page.url, page.title)
      )
        return false;
    }
    const report = [run.result?.report, run.result?.answer, run.result?.text].find(
      (value) => typeof value === "string",
    ) as string | undefined;
    if (report && memoryContentSensitivityReason(report)) return false;
    // A page-backed report must have the S5 terminal verifier's citation and
    // its run-owned observation. A report quote alone is not page evidence.
    if (run.pageIds.length && !this.verifiedPageEvidence(run)) return false;
    return true;
  }

  private verifiedPageEvidence(run: Run): boolean {
    if (run.config?.implementation !== "agent-loop" || !Array.isArray(run.result?.citations)) return false;
    const citations = ResultCitationSchema.array().max(32).safeParse(run.result.citations);
    if (!citations.success || !citations.data.length) return false;
    if (citations.data.some((citation) => memoryContentSensitivityReason(citation.quote))) return false;
    return citations.data.every((citation) => {
      if ("kind" in citation || !citation.observationId) return false;
      const artifact = this.repo.getArtifact(citation.observationId);
      if (
        !artifact ||
        artifact.runId !== run.runId ||
        !artifact.pageId ||
        !run.pageIds.includes(artifact.pageId) ||
        artifact.status !== "complete" ||
        artifact.mediaType !== "application/json"
      )
        return false;
      try {
        const info = lstatSync(artifact.path);
        if (!info.isFile() || info.isSymbolicLink() || info.size > 4 * 1024 * 1024) return false;
        const parsed = ObservationSchema.safeParse(JSON.parse(readFileSync(artifact.path, "utf8")));
        if (
          !parsed.success ||
          parsed.data.pageId !== artifact.pageId ||
          memoryContentSensitivityReason(parsed.data.content.text) ||
          memorySensitivityReason(parsed.data.content.url, parsed.data.content.title)
        )
          return false;
        const page = this.repo.getPage(artifact.pageId);
        return (
          !!page &&
          page.documentEpoch === parsed.data.documentEpoch &&
          page.url === parsed.data.content.url &&
          page.viewStatus !== "detached" &&
          renderObservation(parsed.data).includes(citation.quote)
        );
      } catch {
        return false;
      }
    });
  }

  private report(run: Run | undefined): string | undefined {
    return [run?.result?.report, run?.result?.answer, run?.result?.text].find(
      (value) => typeof value === "string",
    ) as string | undefined;
  }

  private eligibleForRecall(workspaceId: string, claim: MemoryClaim): boolean {
    if (claim.sourceRetired || !this.retained(workspaceId, claim)) return false;
    if (claim.source?.kind === "owner-paste")
      return (
        claim.source.verification === "unverified-owner-note" &&
        claim.sourceRunId === `paste:${claim.source.importId}` &&
        claim.source.quote === claim.text &&
        claim.source.quoteSha256 === sha(claim.text) &&
        !memoryPasteSensitivity(claim.text)
      );
    const run = this.repo.getRun(claim.sourceRunId);
    const report = run && this.report(run);
    return (
      !!run &&
      run.status === "completed" &&
      run.config?.contextWorkspaceId === workspaceId &&
      !!report &&
      this.sourceEligible(workspaceId, run) &&
      report.includes(claim.text) &&
      (!claim.source ||
        (claim.source.kind === "run-report" &&
          claim.source.quote === claim.text &&
          claim.source.quoteSha256 === sha(claim.source.quote)))
    );
  }

  async ordinaryRestoreMemory() {
    return this.own(() => this.ordinaryRestoreMemoryOwned());
  }

  private async ordinaryRestoreMemoryOwned() {
    const before = currentSpaceMemory(this.repo.db);
    await this.recoverySnapshot();
    if (spaceMemoryDigest(before) !== spaceMemoryDigest(currentSpaceMemory(this.repo.db)))
      throw new AuxError("conflict", "Space memory changed while restore was prepared.");
    return before;
  }

  currentStateDigest() {
    return spaceMemoryDigest(currentSpaceMemory(this.repo.db));
  }

  private async readClaims(workspaceId: string) {
    const state = await this.storage.read(workspaceId);
    if (!state.prior)
      return {
        ...state,
        claims: [] as MemoryClaim[],
        inbox: [] as MemoryClaim[],
        imports: [] as MemoryPasteReceipt[],
        activity: [] as MemoryExtraction[],
        documents: [] as MemoryDocumentRecord[],
        dreams: [] as MemoryDreamOperation[],
        retiredSources: { before: 0, sourceHashes: [] as string[] },
      };
    const parse = (name: string) => {
      const value = state.files.get(name);
      if (value === undefined) throw new Error(`Space memory file ${name} is missing.`);
      return JSON.parse(value) as unknown;
    };
    return {
      ...state,
      claims: MemoryClaimSchema.array().max(200).parse(parse("claims.json.enc")),
      inbox: MemoryPipelineInboxSchema.parse(parse("inbox.json.enc")),
      imports: MemoryPasteReceiptSchema.array().max(20).parse(parse("imports.json.enc")),
      retiredSources: retiredMemorySourcesSchema.parse(
        state.files.has("retired-sources.json.enc")
          ? parse("retired-sources.json.enc")
          : { before: 0, sourceHashes: [] },
      ),
      documents: validateMemoryDocuments(
        MemoryDocumentRecordSchema.array()
          .max(100)
          .parse(state.files.has("documents.json.enc") ? parse("documents.json.enc") : []),
      ),
      dreams: validateDreamOperations(
        MemoryDreamOperationSchema.array()
          .max(200)
          .parse(state.files.has("dream-operations.json.enc") ? parse("dream-operations.json.enc") : []),
      ),
      // Generations predating extraction activity have no operation records.
      activity: MemoryExtractionSchema.array()
        .max(200)
        .parse(state.files.has("activity.json.enc") ? parse("activity.json.enc") : []),
    };
  }

  /** Authenticate all logical files and indexed revisions before recovery. */
  async recoverySnapshot(): Promise<RecoverySpaceMemory[]> {
    return this.own(() => this.recoverySnapshotOwned());
  }

  private async recoverySnapshotOwned(): Promise<RecoverySpaceMemory[]> {
    const generationDigest = this.currentStateDigest();
    const workspaceIds = (
      this.repo.db.prepare("SELECT workspace_id FROM workspaces ORDER BY workspace_id").all() as {
        workspace_id: string;
      }[]
    ).map((row) => row.workspace_id);
    const expected = new Set(workspaceIds);
    if (this.storage.workspaceIds().some((id) => !expected.has(id)))
      throw new Error("Recovery found unaccounted Space memory.");
    let inspectedBytes = 0;
    const output: RecoverySpaceMemory[] = [];
    for (const workspaceId of workspaceIds) {
      const state = await this.readClaims(workspaceId);
      if (!state.prior) {
        if (
          this.repo.db
            .prepare("SELECT 1 FROM memory_pipeline_watermarks WHERE workspace_id=? LIMIT 1")
            .get(workspaceId)
        )
          throw new Error("Recovery is missing extracted Space memory.");
        continue;
      }
      inspectedBytes += state.inspectedBytes;
      if (inspectedBytes > 32 * 1024 * 1024)
        throw new Error("Recovery Space memory exceeds the 32 MB reviewed size cap. No export was created.");
      const derived = new Map<string, string>([
        ["summary.md.enc", this.summary(state.claims)],
        ["handbook.md.enc", this.handbook(state.claims)],
        ...state.claims.map(
          (claim) => [`rollouts/${claim.claimId}.json.enc`, JSON.stringify(claim)] as const,
        ),
      ]);
      const searchIndex = this.searchIndex(state.files, state.claims);
      if (state.files.has("search-index.json.enc") && !searchIndex)
        throw new Error("Recovery Space-memory search index differs from its claims.");
      const files = [
        "claims.json.enc",
        "inbox.json.enc",
        "history.json.enc",
        "imports.json.enc",
        ...(state.files.has("activity.json.enc") ? ["activity.json.enc"] : []),
        ...(state.files.has("documents.json.enc") ? ["documents.json.enc"] : []),
        ...(state.files.has("retired-sources.json.enc") ? ["retired-sources.json.enc"] : []),
        ...(state.files.has("dream-operations.json.enc") ? ["dream-operations.json.enc"] : []),
        ...(searchIndex ? ["search-index.json.enc"] : []),
        ...derived.keys(),
      ].sort();
      if (JSON.stringify([...state.files.keys()].sort()) !== JSON.stringify(files))
        throw new Error("Recovery found a missing or unaccounted Space memory file.");
      for (const [name, value] of derived)
        if (state.files.get(name) !== value)
          throw new Error("Recovery Space-memory derivative differs from its claims.");
      output.push({
        workspaceId,
        claims: state.claims,
        inbox: state.inbox,
        history: state.history,
        verifiedFiles: files,
        imports: state.imports,
        ...(searchIndex ? { searchIndex } : {}),
        ...(state.files.has("activity.json.enc") ? { activity: state.activity } : {}),
        ...(state.files.has("documents.json.enc") ? { documents: state.documents } : {}),
        ...(state.files.has("retired-sources.json.enc") ? { retiredSources: state.retiredSources } : {}),
        ...(state.files.has("dream-operations.json.enc") ? { dreams: state.dreams } : {}),
      });
    }
    if (this.currentStateDigest() !== generationDigest)
      throw new AuxError("conflict", "Space memory changed while recovery was prepared.");
    return output;
  }

  /** Reseal a reviewed generation under the destination Profile root and generation factor. */
  async importRecoverySnapshot(spaces: RecoverySpaceMemory[]): Promise<void> {
    return this.own(() => this.importRecoverySnapshotOwned(spaces));
  }

  private async importRecoverySnapshotOwned(spaces: RecoverySpaceMemory[]): Promise<void> {
    for (const space of spaces) {
      this.requireSpace(space.workspaceId);
      if (this.storage.workspaceIds().includes(space.workspaceId))
        throw new Error("Recovery destination already has Space memory.");
      const claims = MemoryClaimSchema.array().max(200).parse(space.claims);
      const inbox = MemoryPipelineInboxSchema.parse(space.inbox);
      const history = space.history.map((value) => ({
        revisionId: value.revisionId,
        capturedAt: value.capturedAt,
        claims: MemoryPipelineInboxSchema.parse(value.claims),
      }));
      const imports = MemoryPasteReceiptSchema.array()
        .max(20)
        .parse(space.imports ?? []);
      const expected = [
        "claims.json.enc",
        "inbox.json.enc",
        "history.json.enc",
        "summary.md.enc",
        "handbook.md.enc",
        ...(space.imports !== undefined ? ["imports.json.enc"] : []),
        ...(space.activity !== undefined ? ["activity.json.enc"] : []),
        ...(space.documents !== undefined ? ["documents.json.enc"] : []),
        ...(space.retiredSources !== undefined ? ["retired-sources.json.enc"] : []),
        ...(space.dreams !== undefined ? ["dream-operations.json.enc"] : []),
        ...(space.searchIndex !== undefined ? ["search-index.json.enc"] : []),
        ...claims.map((claim) => `rollouts/${claim.claimId}.json.enc`),
      ].sort();
      if (JSON.stringify(space.verifiedFiles) !== JSON.stringify(expected))
        throw new Error("Recovery Space memory inventory changed.");
      if (space.searchIndex !== undefined && !validMemorySearchIndex(space.searchIndex, claims))
        throw new Error("Recovery Space-memory search index differs from its claims.");
      const activity = MemoryExtractionSchema.array()
        .max(200)
        .parse(space.activity ?? []);
      await this.writeGeneration(
        space.workspaceId,
        claims,
        inbox,
        history,
        null,
        imports,
        activity,
        undefined,
        {
          documents: validateMemoryDocuments(
            MemoryDocumentRecordSchema.array()
              .max(100)
              .parse(space.documents ?? []),
          ),
          dreams: validateDreamOperations(
            MemoryDreamOperationSchema.array()
              .max(200)
              .parse(space.dreams ?? []),
          ),
          retiredSources: retiredMemorySourcesSchema.parse(
            space.retiredSources ?? { before: 0, sourceHashes: [] },
          ),
        },
      );
    }
  }

  private summary(claims: MemoryClaim[]): string {
    const latest = [...claims]
      .filter(
        (claim) =>
          !claim.sourceRetired &&
          !claim.contradictionIds?.length &&
          !memoryContentSensitivityReason(memoryClaimText(claim)),
      )
      .sort((a, b) => (b.ownerEdit?.updatedAt ?? b.capturedAt) - (a.ownerEdit?.updatedAt ?? a.capturedAt))
      .slice(0, 4);
    const lines: string[] = [];
    let bytes = 0;
    for (const claim of latest) {
      const text = memoryClaimText(claim);
      const line = claim.ownerEdit
        ? `- ${text.slice(0, 360)} [owner-edited, unverified; source:${claim.sourceRunId}]`
        : claim.source?.kind === "owner-paste"
          ? `- ${claim.text.slice(0, 360)} [owner-pasted, unverified; import:${claim.source.importId}]`
          : `- ${claim.text.slice(0, 360)} [run:${claim.sourceRunId}${claim.source ? `#${claim.source.quoteSha256.slice(0, 12)}` : ""}]`;
      const size = Buffer.byteLength(line, "utf8") + 1;
      if (bytes + size > 1700) break;
      lines.push(line);
      bytes += size;
    }
    return lines.join("\n");
  }

  private handbook(claims: MemoryClaim[]): string {
    return claims
      .map(
        (claim) =>
          `## ${claim.claimId}\n${
            claim.source?.kind === "owner-paste"
              ? `Owner-pasted note (unverified), import: ${claim.source.importId}`
              : `Source run: ${claim.sourceRunId}`
          }${claim.sourceRetired ? "\nOriginal source retired; owner edit retained for inspection only, excluded from recall." : ""}${claim.ownerEdit ? "\nOwner-edited text (unverified):" : ""}\n${memoryClaimText(claim)}`,
      )
      .join("\n\n");
  }

  private snapshot(claims: MemoryClaim[]): MemoryRevision {
    return { revisionId: randomUUID(), capturedAt: Date.now(), claims };
  }

  private async writeGeneration(
    workspaceId: string,
    claims: MemoryClaim[],
    inbox: MemoryClaim[],
    history: MemoryRevision[],
    prior: MemoryGeneration | null,
    imports?: MemoryPasteReceipt[],
    activity?: MemoryExtraction[],
    beforeCommit?: () => void,
    extras?: {
      documents: MemoryDocumentRecord[];
      dreams: MemoryDreamOperation[];
      retiredSources?: { before: number; sourceHashes: string[] };
    },
    publication?: MemoryPublication,
  ) {
    const previous =
      imports === undefined || activity === undefined || !extras?.retiredSources
        ? await this.readClaims(workspaceId)
        : null;
    const receipts = imports ?? previous!.imports;
    const operations = activity ?? previous!.activity;
    const files = new Map<string, string>([
      [
        "retired-sources.json.enc",
        JSON.stringify(retiredMemorySourcesSchema.parse(extras?.retiredSources ?? previous!.retiredSources)),
      ],
      [
        "documents.json.enc",
        JSON.stringify(
          validateMemoryDocuments(
            MemoryDocumentRecordSchema.array()
              .max(100)
              .parse(extras?.documents ?? previous!.documents),
          ),
        ),
      ],
      [
        "dream-operations.json.enc",
        JSON.stringify(
          validateDreamOperations(
            MemoryDreamOperationSchema.array()
              .max(200)
              .parse(extras?.dreams ?? previous!.dreams),
          ),
        ),
      ],
      ["claims.json.enc", JSON.stringify(claims)],
      ["search-index.json.enc", JSON.stringify(buildMemorySearchIndex(claims))],
      ["inbox.json.enc", JSON.stringify(inbox)],
      ["imports.json.enc", JSON.stringify(receipts)],
      ["activity.json.enc", JSON.stringify(MemoryExtractionSchema.array().max(200).parse(operations))],
      ["summary.md.enc", this.summary(claims)],
      ["handbook.md.enc", this.handbook(claims)],
      ...claims.map((claim) => [`rollouts/${claim.claimId}.json.enc`, JSON.stringify(claim)] as const),
    ]);
    await this.storage.write(workspaceId, files, history, prior, beforeCommit, publication);
  }

  private clearPastePreviews(workspaceId: string) {
    for (const [id, entry] of this.pastePreviews)
      if (entry.preview.workspaceId === workspaceId) {
        clearTimeout(entry.timer);
        this.pastePreviews.delete(id);
      }
  }

  private requirePasteSpace(workspaceId: string) {
    this.requireSpace(workspaceId);
    const spaces = BrowserSpaceSchema.array().parse(this.repo.getSetting("browserSpaces") ?? []);
    if (spaces.some((space) => space.workspaceId === workspaceId && space.archived))
      throw new AuxError("conflict", "Restore this Space before importing notes.");
  }

  async previewPaste(raw: unknown): Promise<MemoryPastePreview> {
    return this.own(() => this.previewPasteOwned(raw));
  }

  private async previewPasteOwned(raw: unknown): Promise<MemoryPastePreview> {
    const { workspaceId, text } = MemoryPastePreviewParams.parse(raw);
    this.requirePasteSpace(workspaceId);
    const lines = memoryPasteLines(text);
    const reason = memoryPasteSensitivity(text) ?? memoryPasteFormatReason(lines);
    if (reason) return { status: "blocked", workspaceId, reason };
    const current = await this.readClaims(workspaceId);
    const known = new Set(
      [...current.claims, ...current.inbox, ...current.history.flatMap((item) => item.claims)].map((claim) =>
        memoryPasteKey(claim.text),
      ),
    );
    const preview: Extract<MemoryPastePreview, { status: "ready" }> = {
      status: "ready",
      workspaceId,
      previewId: randomUUID(),
      expiresAt: Date.now() + 10 * 60_000,
      candidates: lines.map((text) => {
        const key = memoryPasteKey(text),
          duplicate = known.has(key);
        known.add(key);
        return { candidateId: randomUUID(), text, duplicate };
      }),
    };
    while (this.pastePreviews.size >= 5) {
      const oldest = this.pastePreviews.keys().next().value!;
      clearTimeout(this.pastePreviews.get(oldest)!.timer);
      this.pastePreviews.delete(oldest);
    }
    const timer = setTimeout(() => this.pastePreviews.delete(preview.previewId), 10 * 60_000);
    timer.unref();
    this.pastePreviews.set(preview.previewId, {
      preview,
      generation: current.prior?.generation ?? null,
      timer,
    });
    return structuredClone(preview);
  }

  private pasteReceipt(
    receipt: MemoryPasteReceipt,
    state: { claims: MemoryClaim[]; inbox: MemoryClaim[]; history: MemoryRevision[] },
  ): MemoryPasteStatus {
    const fromImport = (claim: MemoryClaim) =>
      claim.source?.kind === "owner-paste" && claim.source.importId === receipt.importId;
    const approved = state.claims.filter(fromImport),
      pending = state.inbox.filter(fromImport);
    const visible = new Set([...approved, ...pending].map((claim) => claim.claimId));
    const history = new Set(
      state.history
        .flatMap((item) => item.claims)
        .filter(fromImport)
        .map((claim) => claim.claimId)
        .filter((id) => !visible.has(id)),
    );
    const { selectionDigest: _digest, ...metadata } = receipt;
    return {
      ...metadata,
      pending: pending.length,
      accepted: approved.length,
      restorable: history.size,
      removed: Math.max(0, receipt.added - visible.size - history.size),
    };
  }

  async pasteStatus(workspaceId: string): Promise<MemoryPasteStatus[]> {
    return this.own(() => this.pasteStatusOwned(workspaceId));
  }

  private async pasteStatusOwned(workspaceId: string): Promise<MemoryPasteStatus[]> {
    this.requireSpace(workspaceId);
    const state = await this.readClaims(workspaceId);
    return [...state.imports].reverse().map((receipt) => this.pasteReceipt(receipt, state));
  }

  async commitPaste(raw: unknown): Promise<MemoryPasteStatus> {
    return this.own(() => this.commitPasteOwned(raw));
  }

  private async commitPasteOwned(raw: unknown): Promise<MemoryPasteStatus> {
    const input = MemoryPasteCommitParams.parse(raw);
    this.requirePasteSpace(input.workspaceId);
    if (new Set(input.selectedIds).size !== input.selectedIds.length)
      throw new AuxError("invalid_params", "Review each selected note once.");
    const selectionDigest = sha([...input.selectedIds].sort().join("\n"));
    return this.leased(input.workspaceId, async () => {
      const state = await this.readClaims(input.workspaceId);
      const priorReceipt = state.imports.find((receipt) => receipt.importId === input.previewId);
      if (priorReceipt) {
        if (priorReceipt.selectionDigest !== selectionDigest)
          throw new AuxError(
            "conflict",
            "This import already committed a different selection. Review a fresh paste.",
          );
        return this.pasteReceipt(priorReceipt, state);
      }
      if (!this.policy(input.workspaceId).enabled)
        throw new AuxError(
          "permission_denied",
          "Enable memory for this Space before adding notes for review.",
        );
      const entry = this.pastePreviews.get(input.previewId);
      if (!entry || entry.preview.workspaceId !== input.workspaceId || entry.preview.expiresAt <= Date.now())
        throw new AuxError(
          "conflict",
          "This paste preview expired or Aux restarted. Paste and review it again; nothing is retried automatically.",
        );
      if (entry.generation !== (state.prior?.generation ?? null))
        throw new AuxError(
          "conflict",
          "Space memory changed after this preview. Review a fresh preview before importing.",
        );
      const selected = input.selectedIds.map((id) =>
        entry.preview.candidates.find((item) => item.candidateId === id),
      );
      if (selected.some((item) => !item))
        throw new AuxError("invalid_params", "The selected note does not belong to this preview.");
      const known = new Set(
        [...state.claims, ...state.inbox, ...state.history.flatMap((item) => item.claims)].map((claim) =>
          memoryPasteKey(claim.text),
        ),
      );
      const at = Date.now(),
        additions: MemoryClaim[] = [];
      for (const item of selected) {
        if (memoryPasteSensitivity(item!.text))
          throw new AuxError(
            "permission_denied",
            "This note no longer passes the sensitivity check. Review the paste again.",
          );
        const key = memoryPasteKey(item!.text);
        if (known.has(key)) continue;
        known.add(key);
        additions.push(
          MemoryClaimSchema.parse({
            claimId: randomUUID(),
            sourceRunId: `paste:${input.previewId}`,
            text: item!.text,
            capturedAt: at,
            source: {
              kind: "owner-paste",
              importId: input.previewId,
              quote: item!.text,
              quoteSha256: sha(item!.text),
              verification: "unverified-owner-note",
            },
          }),
        );
      }
      if (state.inbox.length + additions.length > 200)
        throw new AuxError(
          "conflict",
          "The review inbox is full. Accept or discard pending notes, then make a fresh preview. No notes were dropped.",
        );
      const receipt = MemoryPasteReceiptSchema.parse({
        importId: input.previewId,
        createdAt: at,
        selected: selected.length,
        added: additions.length,
        duplicates: selected.length - additions.length,
        selectionDigest,
      });
      const next = { ...state, inbox: [...state.inbox, ...additions] };
      this.requirePasteSpace(input.workspaceId);
      if (!this.policy(input.workspaceId).enabled)
        throw new AuxError("permission_denied", "Space memory was disabled. Review the paste again.");
      try {
        await this.writeGeneration(
          input.workspaceId,
          next.claims,
          next.inbox,
          next.history,
          state.prior,
          [...state.imports, receipt].slice(-20),
        );
      } catch (error) {
        const recovered = await this.readClaims(input.workspaceId);
        const committed = recovered.imports.find(
          (item) => item.importId === input.previewId && item.selectionDigest === selectionDigest,
        );
        if (committed) {
          clearTimeout(entry.timer);
          this.pastePreviews.delete(input.previewId);
          return this.pasteReceipt(committed, recovered);
        }
        throw error;
      }
      clearTimeout(entry.timer);
      this.pastePreviews.delete(input.previewId);
      return this.pasteReceipt(receipt, next);
    });
  }

  extractRun(workspaceId: string, runId: string, trigger: MemoryExtraction["trigger"] = "manual") {
    const previous = this.extractionQueues.get(workspaceId);
    const epoch = this.extractionEpochs.get(workspaceId) ?? {};
    this.extractionEpochs.set(workspaceId, epoch);
    const sources = this.extractionSources.get(workspaceId) ?? new Set<string>();
    sources.add(runId);
    this.extractionSources.set(workspaceId, sources);
    const pending = this.own(async () => {
      // A failed source keeps its own error; the next completed source must still run.
      await previous?.catch(() => {});
      if (this.extractionEpochs.get(workspaceId) !== epoch)
        throw new AuxError("cancelled", "The original memory extraction queue retired.");
      return this.extractRunOwned(workspaceId, runId, trigger);
    });
    this.extractionQueues.set(workspaceId, pending);
    const finish = () => {
      if (this.extractionQueues.get(workspaceId) === pending) {
        this.extractionQueues.delete(workspaceId);
        this.extractionSources.delete(workspaceId);
        this.extractionEpochs.delete(workspaceId);
      }
    };
    void pending.then(finish, finish);
    return pending;
  }

  private async extractRunOwned(workspaceId: string, runId: string, trigger: MemoryExtraction["trigger"]) {
    const started = performance.now();
    if (!this.policy(workspaceId).enabled)
      throw new AuxError("permission_denied", "Enable Space memory extraction first.");
    return this.leased(workspaceId, async (checkLease) => {
      const run = this.repo.getRun(runId);
      if (!run || run.status !== "completed" || run.config?.contextWorkspaceId !== workspaceId)
        throw new AuxError("conflict", "Only a completed run from this Space can be extracted.");
      if (!this.sourceEligible(workspaceId, run))
        throw new AuxError(
          "permission_denied",
          "This run includes a sensitive, excluded, or unverifiable source.",
        );
      if (
        this.repo.db
          .prepare("SELECT 1 FROM memory_pipeline_watermarks WHERE workspace_id=? AND run_id=?")
          .get(workspaceId, runId)
      )
        return { extracted: 0 };
      const sourceReport = this.report(run);
      const report = sourceReport ?? "";
      const { claims, inbox, history, prior, activity } = await this.readClaims(workspaceId);
      if (
        activity.some((entry) => entry.sourceRunId === runId && entry.status !== "failed") ||
        [...claims, ...inbox].some((claim) => claim.sourceRunId === runId)
      ) {
        this.repo.db
          .prepare(
            "INSERT OR IGNORE INTO memory_pipeline_watermarks(workspace_id,run_id,captured_at) VALUES(?,?,?)",
          )
          .run(workspaceId, runId, Date.now());
        return { extracted: 0 };
      }
      const controller = new AbortController();
      if (inbox.length >= 200)
        throw new AuxError(
          "conflict",
          "The review inbox is full. Review pending notes before extracting more; no notes were dropped.",
        );
      const modelGeneration = this.extractor?.generation();
      const operationId = randomUUID();
      const ownerRevision = readWorkspaceMemory(this.repo, workspaceId).revision;
      const policyDigest = sha(JSON.stringify(this.policy(workspaceId)));
      const checkCurrent = () => {
        controller.signal.throwIfAborted();
        checkLease();
        const current = this.repo.getRun(runId);
        if (
          !this.policy(workspaceId).enabled ||
          readWorkspaceMemory(this.repo, workspaceId).revision !== ownerRevision ||
          sha(JSON.stringify(this.policy(workspaceId))) !== policyDigest ||
          !current ||
          current.status !== "completed" ||
          current.config?.contextWorkspaceId !== workspaceId ||
          !this.sourceEligible(workspaceId, current) ||
          this.report(current) !== sourceReport ||
          this.extractor?.generation() !== modelGeneration
        )
          throw new AuxError("cancelled", "The original memory source or extraction setting changed.");
      };
      this.extractions.set(workspaceId, controller);
      try {
        const selection: MemoryExtractionResult = this.extractor
          ? await this.extractor.extract({
              report,
              signal: controller.signal,
              checkCurrent,
              job: {
                workspaceId,
                operationId,
                operation: "extraction",
                modelGeneration: modelGeneration!,
                memoryGeneration: prior?.generation ?? null,
                ownerRevision,
                policyDigest,
                sourceDigest: sha(JSON.stringify([runId, sourceReport])),
              },
            })
          : { quotes: [], status: "failed" as const, errorCode: "model_unavailable" as const };
        checkCurrent();
        const at = Date.now();
        if (
          selection.quotes.some(
            (quote) => !report.includes(quote) || quote.length < 20 || quote.length > 2000,
          )
        )
          throw new AuxError("invalid_params", "Memory extraction returned an unverified source quote.");
        const additions = selection.quotes.map((quote) => {
          return MemoryClaimSchema.parse({
            claimId: randomUUID(),
            sourceRunId: runId,
            text: quote,
            capturedAt: at,
            source: { kind: "run-report", quote, quoteSha256: sha(quote) },
          });
        });
        if (inbox.length + additions.length > 200)
          throw new AuxError(
            "conflict",
            "The review inbox is full. Review pending notes before extracting more; no notes were dropped.",
          );
        const operation = MemoryExtractionSchema.parse({
          activityId: operationId,
          sourceRunId: runId,
          capturedAt: at,
          durationMs: Math.max(0, performance.now() - started),
          trigger,
          candidateIds: additions.map((claim) => claim.claimId),
          ...selection,
        });
        await this.writeGeneration(
          workspaceId,
          claims,
          [...inbox, ...additions],
          history,
          prior,
          undefined,
          [...activity, operation].slice(-200),
          checkCurrent,
        );
        if (selection.status !== "failed")
          this.repo.db
            .prepare(
              "INSERT OR IGNORE INTO memory_pipeline_watermarks(workspace_id,run_id,captured_at) VALUES(?,?,?)",
            )
            .run(workspaceId, runId, at);
        return { extracted: additions.length };
      } finally {
        if (this.extractions.get(workspaceId) === controller) this.extractions.delete(workspaceId);
      }
    });
  }

  sources(workspaceId: string) {
    this.requireSpace(workspaceId);
    const sources: { runId: string; goal: string; endedAt: number }[] = [];
    let offset = 0;
    for (;;) {
      const candidates = this.repo.db
        .prepare(
          `SELECT run_id AS runId FROM runs
        WHERE status='completed' AND json_extract((SELECT config FROM run_lookup WHERE run_lookup.run_id=runs.run_id),'$.contextWorkspaceId')=?
        AND run_id NOT IN (SELECT run_id FROM memory_pipeline_watermarks WHERE workspace_id=?)
        ORDER BY ended_at DESC,run_id DESC LIMIT 100 OFFSET ?`,
        )
        .all(workspaceId, workspaceId, offset) as { runId: string }[];
      for (const candidate of candidates) {
        const run = this.repo.getRun(candidate.runId);
        if (
          run &&
          (run.result?.report || run.result?.answer || run.result?.text) &&
          this.sourceEligible(workspaceId, run)
        )
          sources.push({ runId: run.runId, goal: run.goal, endedAt: run.endedAt! });
        if (sources.length >= 20) return sources;
      }
      if (candidates.length < 100) return sources;
      offset += candidates.length;
    }
  }

  async inbox(workspaceId: string): Promise<MemoryClaim[]> {
    return this.own(() => this.inboxOwned(workspaceId));
  }

  private async inboxOwned(workspaceId: string): Promise<MemoryClaim[]> {
    if (!this.policy(workspaceId).enabled) return [];
    return (await this.readClaims(workspaceId)).inbox;
  }

  async claims(workspaceId: string): Promise<MemoryClaim[]> {
    return this.own(() => this.claimsOwned(workspaceId));
  }

  private async claimsOwned(workspaceId: string): Promise<MemoryClaim[]> {
    if (!this.policy(workspaceId).enabled) return [];
    return (await this.readClaims(workspaceId)).claims;
  }

  async activity(workspaceId: string) {
    return this.own(async () => {
      this.requireSpace(workspaceId);
      const { activity, claims, inbox } = await this.readClaims(workspaceId);
      const notes = new Map([...claims, ...inbox].map((claim) => [claim.claimId, claim]));
      const accepted = new Set(claims.map((claim) => claim.claimId));
      return [...activity].reverse().flatMap((entry) => {
        const run = this.repo.getRun(entry.sourceRunId);
        return run?.config?.contextWorkspaceId === workspaceId && this.sourceEligible(workspaceId, run)
          ? [
              {
                ...entry,
                title: run.goal,
                proposals: entry.candidateIds.flatMap((claimId) => {
                  const claim = notes.get(claimId);
                  return claim
                    ? [
                        {
                          claimId,
                          quote: claim.text,
                          state: accepted.has(claimId) ? ("accepted" as const) : ("pending" as const),
                        },
                      ]
                    : [];
                }),
              },
            ]
          : [];
      });
    });
  }

  async history(workspaceId: string) {
    return this.own(() => this.historyOwned(workspaceId));
  }

  private async historyOwned(workspaceId: string) {
    if (!this.policy(workspaceId).enabled) return [];
    const { history } = await this.readClaims(workspaceId);
    return [...history].reverse().map((revision) => ({
      revisionId: revision.revisionId,
      capturedAt: revision.capturedAt,
      claimCount: revision.claims.length,
      summary: this.summary(revision.claims),
      sourceRunIds: [...new Set(revision.claims.map((claim) => claim.sourceRunId))],
    }));
  }

  async consolidate(workspaceId: string) {
    return this.own(() => this.consolidateOwned(workspaceId));
  }

  private async consolidateOwned(workspaceId: string) {
    if (!this.policy(workspaceId).enabled)
      throw new AuxError("permission_denied", "Enable Space memory before consolidation.");
    return this.leased(workspaceId, async () => {
      const { claims, inbox, history, prior } = await this.readClaims(workspaceId);
      const consolidated = [
        ...claims.filter((claim) => claim.sourceRetired),
        ...consolidateMemoryClaims(
          claims.filter((claim) => !claim.sourceRetired),
          Date.now(),
          (claim) => this.eligibleForRecall(workspaceId, claim),
          Number.POSITIVE_INFINITY,
        ),
      ];
      const revision = this.snapshot(claims);
      await this.writeGeneration(workspaceId, consolidated, inbox, [...history, revision].slice(-10), prior);
      return {
        revisionId: revision.revisionId,
        before: claims.length,
        after: consolidated.length,
        contradictions: consolidated.filter((claim) => claim.contradictionIds?.length).length,
      };
    });
  }

  async documents(workspaceId: string) {
    return this.own(async () => {
      this.requireSpace(workspaceId);
      const state = await this.readClaims(workspaceId);
      return {
        generation: state.prior?.generation ?? null,
        documents: state.claims.map((claim) => ({
          path: `episodic/${new Date(claim.capturedAt).toISOString().slice(0, 10)}.md`,
          updatedAt: claim.ownerEdit?.updatedAt ?? claim.capturedAt,
          claim,
        })),
      };
    });
  }

  async editDocuments(raw: unknown) {
    return this.own(async () => {
      const input = MemoryDocumentEditParams.parse(raw);
      this.requireSpace(input.workspaceId);
      if (
        input.edits.some(
          (edit) => memoryPasteSensitivity(edit.text) || memoryContentSensitivityReason(edit.text),
        )
      )
        throw new AuxError(
          "permission_denied",
          "Remove sensitive details before saving this memory document.",
        );
      return this.leased(input.workspaceId, async () => {
        const { claims, inbox, history, prior } = await this.readClaims(input.workspaceId);
        if (prior?.generation !== input.expectedGeneration)
          throw new AuxError(
            "conflict",
            "Memory changed. Review the latest document before saving your draft.",
          );
        const edits = new Map(input.edits.map((edit) => [edit.claimId, edit.text]));
        if (input.edits.some((edit) => !claims.some((claim) => claim.claimId === edit.claimId)))
          throw new AuxError("not_found", "This memory document is no longer available.");
        const updatedAt = Date.now();
        const next = markMemoryContradictions(
          claims.map((original) => {
            const text = edits.get(original.claimId);
            return text === undefined
              ? original
              : MemoryClaimSchema.parse({
                  ...original,
                  ownerEdit: { text, revision: (original.ownerEdit?.revision ?? 0) + 1, updatedAt },
                });
          }),
        );
        await this.writeGeneration(
          input.workspaceId,
          next,
          inbox,
          [...history, this.snapshot(next)].slice(-10),
          prior,
        );
        return next.filter((claim) => edits.has(claim.claimId));
      });
    });
  }

  async reindex(workspaceId: string) {
    return this.own(() => this.reindexOwned(workspaceId));
  }

  private async reindexOwned(workspaceId: string) {
    if (!this.policy(workspaceId).enabled)
      throw new AuxError("permission_denied", "Enable Space memory before reindexing.");
    return this.leased(workspaceId, async () => {
      const { claims, inbox, history, prior } = await this.readClaims(workspaceId);
      // writeGeneration rebuilds encrypted summary, handbook and rollout projections from authoritative encrypted claims.
      await this.writeGeneration(workspaceId, claims, inbox, history, prior);
      return { indexed: buildMemorySearchIndex(claims).chunks.length };
    });
  }

  async previewRevision(workspaceId: string, revisionId: string): Promise<MemoryRevisionPreview> {
    return this.own(async () => {
      this.requireSpace(workspaceId);
      if (!this.policy(workspaceId).enabled)
        throw new AuxError("permission_denied", "Enable Space memory first.");
      const { claims, history, prior } = await this.readClaims(workspaceId);
      const selected = history.find((revision) => revision.revisionId === revisionId);
      if (!selected || !prior)
        throw new AuxError("not_found", "Memory revision is unavailable or was forgotten.");
      const before = new Map(claims.map((claim) => [claim.claimId, claim]));
      const after = new Map(selected.claims.map((claim) => [claim.claimId, claim]));
      const changes: MemoryRevisionPreview["changes"] = [];
      for (const claimId of new Set([...before.keys(), ...after.keys()])) {
        const original = before.get(claimId) ?? null;
        const restored = after.get(claimId) ?? null;
        if (JSON.stringify(original) === JSON.stringify(restored)) continue;
        const claim = restored ?? original!;
        changes.push({
          claimId,
          path: `episodic/${new Date(claim.capturedAt).toISOString().slice(0, 10)}.md`,
          before: original,
          after: restored,
        });
      }
      return { workspaceId, revisionId, expectedGeneration: prior.generation, changes };
    });
  }

  async revert(workspaceId: string, revisionId: string, expectedGeneration: string) {
    return this.own(() => this.revertOwned(workspaceId, revisionId, expectedGeneration));
  }

  private async revertOwned(workspaceId: string, revisionId: string, expectedGeneration: string) {
    if (!this.policy(workspaceId).enabled)
      throw new AuxError("permission_denied", "Enable Space memory first.");
    return this.leased(workspaceId, async (checkLease) => {
      const { claims: current, inbox, history, prior } = await this.readClaims(workspaceId);
      if (!prior || prior.generation !== expectedGeneration)
        throw new AuxError(
          "conflict",
          "Memory changed. Review a fresh restoration preview before continuing.",
        );
      const selected = history.find((revision) => revision.revisionId === revisionId);
      if (!selected) throw new AuxError("not_found", "Memory revision is unavailable or was forgotten.");
      const claims = [...selected.claims];
      await this.writeGeneration(
        workspaceId,
        claims,
        inbox,
        [...history, this.snapshot(current)].slice(-10),
        prior,
        undefined,
        undefined,
        () => {
          checkLease();
          if (!this.policy(workspaceId).enabled)
            throw new AuxError("cancelled", "Memory restoration paused before publication.");
        },
      );
      return this.overview(workspaceId);
    });
  }

  async review(workspaceId: string, claimId: string, decision: "accept" | "discard") {
    return this.own(() => this.reviewOwned(workspaceId, claimId, decision));
  }

  private async reviewOwned(workspaceId: string, claimId: string, decision: "accept" | "discard") {
    if (!this.policy(workspaceId).enabled)
      throw new AuxError("permission_denied", "Enable Space memory first.");
    return this.leased(workspaceId, async () => {
      const { claims, inbox, history, prior } = await this.readClaims(workspaceId);
      const note = inbox.find((item) => item.claimId === claimId);
      if (!note) throw new AuxError("not_found", "Pending memory note does not exist.");
      if (decision === "accept") {
        if (!this.eligibleForRecall(workspaceId, note))
          throw new AuxError(
            "conflict",
            "This note no longer meets its source and safety requirements for recall.",
          );
      }
      const remaining = inbox.filter((item) => item.claimId !== claimId);
      if (decision === "accept" && claims.length >= 200)
        throw new AuxError(
          "conflict",
          "Approved Memory is full. Review and explicitly forget an old note before accepting more.",
        );
      const accepted = decision === "accept" ? [...claims, note] : claims;
      await this.writeGeneration(
        workspaceId,
        accepted,
        remaining,
        decision === "accept" ? [...history, this.snapshot(accepted)].slice(-10) : history,
        prior,
      );
      return { accepted: decision === "accept", remaining: remaining.length };
    });
  }

  async overview(workspaceId: string) {
    return this.own(() => this.overviewOwned(workspaceId));
  }

  private searchIndex(files: Map<string, string>, claims: MemoryClaim[]) {
    try {
      const raw = files.get("search-index.json.enc");
      return raw ? validMemorySearchIndex(JSON.parse(raw), claims) : null;
    } catch {
      return null;
    }
  }

  private async overviewOwned(workspaceId: string) {
    const policy = this.policy(workspaceId);
    if (!policy.enabled)
      return MemoryPipelineOverviewSchema.parse({
        workspaceId,
        enabled: false,
        summary: "",
        claimCount: 0,
        sourceCount: 0,
      });
    const { claims, files, documents } = await this.readClaims(workspaceId);
    const index = this.searchIndex(files, claims);
    return MemoryPipelineOverviewSchema.parse({
      index: {
        status: index ? "ready" : files.has("search-index.json.enc") ? "needs-rebuild" : "not-built",
        updatedAt: index?.updatedAt ?? null,
        chunkCount: index?.chunks.length ?? 0,
      },
      workspaceId,
      enabled: true,
      summary: [
        this.summary(
          claims.filter(
            (claim) => !claim.contradictionIds?.length && this.eligibleForRecall(workspaceId, claim),
          ),
        ),
        ...documents
          .filter((document) => this.documentEligible(workspaceId, document, claims))
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .slice(0, 4)
          .map(
            (document) =>
              `[${document.authoredBy} ${document.target.kind} document:${document.documentId}@r${document.revision}; ${document.path}]\n${document.content.slice(0, 400)}`,
          ),
      ]
        .filter(Boolean)
        .join("\n\n"),
      claimCount: claims.length,
      sourceCount: new Set(claims.map((claim) => claim.sourceRunId)).size,
    });
  }

  async search(workspaceId: string, query: string) {
    return this.own(() => this.searchOwned(workspaceId, query));
  }

  private async searchOwned(workspaceId: string, query: string) {
    if (!this.policy(workspaceId).enabled) return [];
    const terms = query
      .toLocaleLowerCase()
      .split(/[^\p{L}\p{N}]+/u)
      .filter((term) => term.length > 1)
      .slice(0, 8);
    if (!terms.length) return [];
    const { claims, files } = await this.readClaims(workspaceId);
    const index = this.searchIndex(files, claims) ?? buildMemorySearchIndex(claims);
    const matchingIds = searchMemoryIndex(index, terms);
    return claims
      .filter(
        (claim) =>
          !claim.contradictionIds?.length &&
          this.eligibleForRecall(workspaceId, claim) &&
          !memoryContentSensitivityReason(memoryClaimText(claim)) &&
          matchingIds.has(claim.claimId),
      )
      .slice(-20)
      .reverse();
  }

  private liveMemorySpace(workspaceId: string) {
    this.requireSpace(workspaceId);
    const spaces = this.repo.getSetting<{ workspaceId: string; archived?: boolean }[]>("browserSpaces") ?? [];
    if (spaces.some((space) => space.workspaceId === workspaceId && space.archived))
      throw new AuxError("permission_denied", "Restore this Space before using its Memory.");
  }

  /** Retire original asynchronous work before an owner edit, pause, exclusion or Forget. */
  async retireWorkspace(workspaceId: string) {
    this.memoryEpochs.set(workspaceId, {});
    this.recallEngine.invalidate();
    for (const controller of this.recallWork.get(workspaceId) ?? []) controller.abort();
    await Promise.allSettled(this.recallPending.get(workspaceId) ?? []);
    const work = this.dreamWork.get(workspaceId);
    work?.controller.abort();
    if (work) await work.promise.catch(() => {});
  }

  async retireOwnerDerivatives(workspaceId: string) {
    return this.own(() =>
      this.leased(workspaceId, async (checkLease) => {
        const state = await this.readClaims(workspaceId);
        const documents = state.documents.filter((document) => document.authoredBy === "owner");
        if (!state.dreams.length && documents.length === state.documents.length) return;
        await this.writeGeneration(
          workspaceId,
          state.claims,
          state.inbox,
          state.history,
          state.prior,
          state.imports,
          state.activity,
          checkLease,
          { documents, dreams: [] },
        );
      }),
    );
  }

  async discoverySnapshot(workspaceId: string, runIds: string[]): Promise<MemoryDiscoverySnapshot> {
    if (this.closed) throw new AuxError("cancelled", "Memory discovery is closed.");
    this.liveMemorySpace(workspaceId);
    if (!this.policy(workspaceId).enabled)
      throw new AuxError("permission_denied", "Memory is paused in this Space.");
    if (runIds.length > 200 || new Set(runIds).size !== runIds.length)
      throw new AuxError("invalid_params", "Use up to 200 distinct completed sources.");
    const ownerRevision = readWorkspaceMemory(this.repo, workspaceId).revision;
    const policyDigest = sha(JSON.stringify(this.policy(workspaceId)));
    const generation = this.storage.generation(workspaceId)?.generation ?? null;
    const retired = (await this.readClaims(workspaceId)).retiredSources;
    if (
      (this.storage.generation(workspaceId)?.generation ?? null) !== generation ||
      readWorkspaceMemory(this.repo, workspaceId).revision !== ownerRevision ||
      sha(JSON.stringify(this.policy(workspaceId))) !== policyDigest
    )
      throw new AuxError("conflict", "Memory changed during discovery preparation.");
    const sources = runIds.map((runId) => {
      const run = this.repo.getRun(runId);
      if (
        !run ||
        run.status !== "completed" ||
        (run.endedAt ?? run.createdAt) <= retired.before ||
        retired.sourceHashes.includes(sha(runId)) ||
        !this.sourceEligible(workspaceId, run)
      )
        throw new AuxError(
          "permission_denied",
          "A completed source is no longer eligible for Memory discovery.",
        );
      return { runId, sourceDigest: sha(JSON.stringify(run)) };
    });
    return { workspaceId, ownerRevision, generation, policyDigest, sources };
  }

  async assertDiscoverySnapshot(snapshot: MemoryDiscoverySnapshot) {
    const current = await this.discoverySnapshot(
      snapshot.workspaceId,
      snapshot.sources.map((source) => source.runId),
    );
    if (JSON.stringify(current) !== JSON.stringify(snapshot))
      throw new AuxError("conflict", "Memory discovery sources changed. Discover fresh suggestions.");
  }

  private targetEligible(workspaceId: string, target: MemoryDocumentTarget) {
    if (target.kind === "site")
      return !memorySourceExcluded(readWorkspaceMemory(this.repo, workspaceId), target.origin);
    return !!this.repo.db
      .prepare(
        "SELECT 1 FROM routines WHERE routine_id=? AND workspace_id=? AND archived_at IS NULL AND paused=0 AND json_extract(json,'$.activationReview') IS NULL",
      )
      .get(target.routineId, workspaceId);
  }

  private sourceFence(workspaceId: string, claims: MemoryClaim[]) {
    const reports = new Map<string, string | undefined>();
    for (const claim of claims)
      if (claim.source?.kind !== "owner-paste" && !reports.has(claim.sourceRunId))
        reports.set(claim.sourceRunId, this.report(this.repo.getRun(claim.sourceRunId)));
    const check = () => {
      if (claims.some((claim) => !this.eligibleForRecall(workspaceId, claim)))
        throw new AuxError("cancelled", "The original Memory source eligibility changed.");
      for (const [runId, report] of reports) {
        const run = this.repo.getRun(runId);
        if (!run || this.report(run) !== report)
          throw new AuxError("cancelled", "The original Memory source report changed.");
      }
    };
    check();
    return {
      check,
      digest: sha(
        JSON.stringify([claims, [...reports].map(([runId, report]) => [runId, sha(report ?? "")])]),
      ),
    };
  }

  private ownerCommit(
    workspaceId: string,
    owner: WorkspaceMemory,
    changes: MemoryDreamChange[],
    applyOwner: (change: MemoryDreamChange, revision: number) => number,
  ) {
    return () => {
      const key = `workspaceMemory:${workspaceId}`;
      const previous = this.repo.getSetting<unknown>(key);
      if (JSON.stringify(readWorkspaceMemory(this.repo, workspaceId)) !== JSON.stringify(owner))
        throw new AuxError("conflict", "The owner Memory changed before publication.");
      let revision = owner.revision;
      for (const change of changes) {
        const next = applyOwner(change, revision);
        if (next !== revision + 1)
          throw new AuxError("conflict", "The owner Memory revision changed during publication.");
        revision = next;
      }
      const published = JSON.stringify(readWorkspaceMemory(this.repo, workspaceId));
      return () => {
        if (JSON.stringify(readWorkspaceMemory(this.repo, workspaceId)) !== published)
          throw new AuxError("conflict", "Later owner edits prevent rolling back this Memory publication.");
        if (previous === undefined) this.repo.deleteSetting(key);
        else this.repo.setSetting(key, previous);
      };
    };
  }

  private refsEligible(workspaceId: string, refs: MemoryDocumentRecord["sourceRefs"], claims: MemoryClaim[]) {
    return refs.every((ref) => {
      const claim = claims.find((item) => item.claimId === ref.claimId);
      return (
        !!claim &&
        claim.sourceRunId === ref.sourceRunId &&
        (claim.source?.quoteSha256 ?? sha(claim.text)) === ref.quoteSha256 &&
        ((ref.effectiveSha256 === undefined && ref.claimRevision === undefined && !claim.ownerEdit) ||
          (ref.effectiveSha256 === sha(memoryClaimText(claim)) &&
            ref.claimRevision === (claim.ownerEdit?.revision ?? 0))) &&
        this.eligibleForRecall(workspaceId, claim)
      );
    });
  }

  private documentEligible(workspaceId: string, document: MemoryDocumentRecord, claims: MemoryClaim[]) {
    return (
      !document.sourceRetired &&
      this.targetEligible(workspaceId, document.target) &&
      !memoryContentSensitivityReason(document.content) &&
      (document.authoredBy === "owner" ||
        (document.sourceRefs.length > 0 && this.refsEligible(workspaceId, document.sourceRefs, claims)))
    );
  }

  async documentList(workspaceId: string) {
    return this.own(async () => {
      this.liveMemorySpace(workspaceId);
      const state = await this.readClaims(workspaceId);
      return { generation: state.prior?.generation ?? null, documents: state.documents };
    });
  }

  async documentSet(raw: unknown, beforeRemoval?: () => void | Promise<void>) {
    const input = MemoryDocumentMethodSchemas["memory.pipeline.documentSet"].parse(raw);
    this.liveMemorySpace(input.workspaceId);
    memoryDocumentPath(input.target);
    if (!this.targetEligible(input.workspaceId, input.target))
      throw new AuxError(
        "permission_denied",
        "Choose an allowed site or an activated routine in this Space.",
      );
    if (
      input.content !== null &&
      (memoryPasteSensitivity(input.content) || memoryContentSensitivityReason(input.content))
    )
      throw new AuxError("permission_denied", "Remove sensitive details before saving Memory.");
    await this.retireWorkspace(input.workspaceId);
    return this.own(() =>
      this.leased(input.workspaceId, async (checkLease) => {
        const state = await this.readClaims(input.workspaceId);
        if ((state.prior?.generation ?? null) !== input.expectedGeneration)
          throw new AuxError("conflict", "Memory changed. Review the current document before saving.");
        const path = memoryDocumentPath(input.target);
        const old = state.documents.find((document) =>
          input.documentId ? document.documentId === input.documentId : document.path === path,
        );
        if (
          (input.documentId && !old) ||
          (old && old.revision !== input.expectedRevision) ||
          (!old && input.expectedRevision !== undefined) ||
          (old && old.path !== path)
        )
          throw new AuxError("conflict", "The Memory document identity or revision changed.");
        if (!old && input.content === null)
          throw new AuxError("not_found", "Memory document does not exist.");
        if (!old && state.documents.length >= 100)
          throw new AuxError("conflict", "This Space already has 100 site and routine documents.");
        const document: MemoryDocumentRecord | null =
          input.content === null
            ? null
            : {
                documentId: old?.documentId ?? randomUUID(),
                path,
                target: input.target,
                revision: (old?.revision ?? 0) + 1,
                content: input.content,
                contentSha256: sha(input.content),
                authoredBy: "owner",
                updatedAt: Date.now(),
                sourceRefs: [],
              };
        if (old && (input.content === null || !input.content.includes(old.content))) await beforeRemoval?.();
        // Retire retained generated drafts on owner replacement; restoring an old operation must not resurrect removed content.
        const dreams = old
          ? state.dreams.filter(
              (operation) => !operation.changes.some((change) => change.documentId === old.documentId),
            )
          : state.dreams;
        const documents = state.documents.filter((item) => item.documentId !== old?.documentId);
        if (document) documents.push(document);
        await this.writeGeneration(
          input.workspaceId,
          state.claims,
          state.inbox,
          state.history,
          state.prior,
          state.imports,
          state.activity,
          checkLease,
          { documents, dreams },
        );
        return { generation: this.storage.generation(input.workspaceId)!.generation, document };
      }),
    );
  }

  private eligibleDreamSessions(
    workspaceId: string,
    since: number,
    retired: { before: number; sourceHashes: string[] },
  ) {
    const cutoff = Math.max(since, retired.before, Date.now() - 14 * 86400000);
    const sessions: Run[] = [];
    let cursor = { endedAt: Number.MAX_SAFE_INTEGER, runId: "" };
    for (;;) {
      const rows = this.repo.db
        .prepare(
          `SELECT runs.run_id AS runId,runs.ended_at AS endedAt FROM runs
         JOIN run_lookup ON run_lookup.run_id=runs.run_id
         WHERE runs.status='completed' AND runs.ended_at>?
           AND json_extract(run_lookup.config,'$.contextWorkspaceId')=?
           AND (runs.ended_at<? OR (runs.ended_at=? AND runs.run_id>?))
         ORDER BY runs.ended_at DESC,runs.run_id ASC LIMIT 100`,
        )
        .all(cutoff, workspaceId, cursor.endedAt, cursor.endedAt, cursor.runId) as {
        runId: string;
        endedAt: number;
      }[];
      for (const row of rows) {
        const run = this.repo.getRun(row.runId);
        if (
          run &&
          this.report(run)?.trim() &&
          !retired.sourceHashes.includes(sha(row.runId)) &&
          this.sourceEligible(workspaceId, run)
        )
          sessions.push(run);
        if (sessions.length === 200) return sessions;
      }
      if (rows.length < 100) return sessions;
      cursor = rows[rows.length - 1]!;
    }
  }

  async dreamStatus(workspaceId: string) {
    return this.own(async () => {
      this.liveMemorySpace(workspaceId);
      const state = await this.readClaims(workspaceId);
      const active =
        state.dreams.findLast(
          (operation) => operation.status === "running" && this.dreamWork.has(workspaceId),
        ) ?? null;
      const last = state.dreams.findLast((operation) => operation.status !== "running");
      const sessions = this.eligibleDreamSessions(workspaceId, last?.startedAt ?? 0, state.retiredSources);
      const oldest = sessions.reduce((at, run) => Math.min(at, run.endedAt ?? Date.now()), Date.now());
      return {
        active,
        lastRunAt: last?.startedAt ?? null,
        eligibleSessions: sessions.length,
        due:
          this.policy(workspaceId).enabled &&
          !active &&
          sessions.length > 0 &&
          (sessions.length >= 5 || Date.now() - (last?.startedAt ?? oldest) >= 86400000),
      };
    });
  }

  async dreamIdle() {
    const changed: string[] = [];
    for (const { workspaceId } of this.repo.listWorkspaces()) {
      if (
        this.closed ||
        this.repo.db
          .prepare("SELECT 1 FROM runs WHERE status IN ('queued','planning','running') LIMIT 1")
          .get()
      )
        break;
      try {
        if (!(await this.dreamStatus(workspaceId)).due) continue;
        await this.dream(workspaceId, "idle");
        changed.push(workspaceId);
      } catch (error) {
        if (!(
          error instanceof AuxError && ["cancelled", "permission_denied", "conflict"].includes(error.code)
        ))
          process.stderr.write("[memory] idle consolidation unavailable\n");
      }
    }
    return changed;
  }

  async dreamActivity(workspaceId: string, cursor?: string, limit = 50) {
    return this.own(async () => {
      const state = await this.readClaims(workspaceId);
      const entries = [...state.dreams].reverse();
      const found = cursor ? entries.findIndex((operation) => operation.operationId === cursor) : -1;
      if (cursor && found < 0)
        throw new AuxError("conflict", "Dream activity changed. Refresh the first page.");
      const page = entries.slice(found + 1, found + 1 + limit);
      return {
        generation: state.prior?.generation ?? null,
        entries: page,
        nextCursor: found + 1 + page.length < entries.length ? page.at(-1)!.operationId : null,
      };
    });
  }

  dream(
    workspaceId: string,
    trigger: "manual" | "idle" = "manual",
    ownerCurrent?: () => Promise<void>,
  ): Promise<MemoryDreamOperation> {
    if (this.dreamWork.has(workspaceId))
      return Promise.reject(new AuxError("conflict", "Dream is already running in this Space."));
    const controller = new AbortController();
    const promise = this.own(() => this.dreamOwned(workspaceId, trigger, controller, ownerCurrent));
    this.dreamWork.set(workspaceId, { controller, promise });
    void promise
      .finally(() => {
        if (this.dreamWork.get(workspaceId)?.promise === promise) this.dreamWork.delete(workspaceId);
      })
      .catch(() => {});
    return promise;
  }

  private dreamTargets(workspaceId: string, documents: MemoryDocumentRecord[], claims: MemoryClaim[]) {
    const targets = new Map(
      documents
        .filter((document) => this.documentEligible(workspaceId, document, claims))
        .map((document) => [document.path, document.target]),
    );
    for (const claim of claims) {
      const run = this.repo.getRun(claim.sourceRunId);
      for (const pageId of run?.pageIds ?? []) {
        const page = this.repo.getPage(pageId);
        if (page) {
          const target = { kind: "site" as const, origin: new URL(page.url).origin };
          if (this.targetEligible(workspaceId, target)) targets.set(memoryDocumentPath(target), target);
        }
      }
      const routine = this.repo.db
        .prepare("SELECT routine_id AS routineId FROM routine_runs WHERE run_id=? LIMIT 1")
        .get(claim.sourceRunId) as { routineId: string } | undefined;
      if (routine) {
        const target = { kind: "routine" as const, routineId: routine.routineId };
        if (this.targetEligible(workspaceId, target)) targets.set(memoryDocumentPath(target), target);
      }
    }
    return targets;
  }

  private async dreamOwned(
    workspaceId: string,
    trigger: "manual" | "idle",
    controller: AbortController,
    ownerCurrent?: () => Promise<void>,
  ): Promise<MemoryDreamOperation> {
    this.liveMemorySpace(workspaceId);
    if (!this.policy(workspaceId).enabled)
      throw new AuxError("permission_denied", "Enable Memory before running Dream.");
    const owner = readWorkspaceMemory(this.repo, workspaceId);
    const modelGeneration = this.dreamer?.generation();
    const epoch = this.memoryEpochs.get(workspaceId);
    const policy = JSON.stringify(this.policy(workspaceId));
    let expectedGeneration: string | null = null;
    let operation: MemoryDreamOperation | undefined;
    let selection: MemoryDreamResult | undefined;
    let committedPublicationUncertain = false;
    let sources: ReturnType<MemoryPipeline["sourceFence"]> | undefined;
    const started = performance.now();
    const checkCurrent = () => {
      controller.signal.throwIfAborted();
      this.liveMemorySpace(workspaceId);
      if (
        this.closed ||
        this.memoryEpochs.get(workspaceId) !== epoch ||
        readWorkspaceMemory(this.repo, workspaceId).revision !== owner.revision ||
        JSON.stringify(this.policy(workspaceId)) !== policy ||
        !this.policy(workspaceId).enabled ||
        this.dreamer?.generation() !== modelGeneration ||
        (this.storage.generation(workspaceId)?.generation ?? null) !== expectedGeneration
      )
        throw new AuxError("cancelled", "The original Dream model, sources or Memory policy changed.");
      sources?.check();
    };
    try {
      const prepared = await this.leased(workspaceId, async (checkLease) => {
        const state = await this.readClaims(workspaceId);
        const claims = state.claims.filter(
          (claim) =>
            claim.capturedAt > Date.now() - 14 * 86400000 &&
            !claim.contradictionIds?.length &&
            this.eligibleForRecall(workspaceId, claim),
        );
        expectedGeneration = state.prior?.generation ?? null;
        sources = this.sourceFence(workspaceId, claims);
        checkCurrent();
        checkLease();
        operation = {
          operationId: randomUUID(),
          trigger,
          status: "running",
          startedAt: Date.now(),
          durationMs: 0,
          inputGeneration: expectedGeneration,
          ownerRevision: owner.revision,
          sourceDigest: sources.digest,
          sourceRunIds: [...new Set(claims.map((claim) => claim.sourceRunId))],
          changes: [],
        };
        await this.writeGeneration(
          workspaceId,
          state.claims,
          state.inbox,
          state.history,
          state.prior,
          state.imports,
          state.activity,
          () => {
            checkLease();
            checkCurrent();
          },
          {
            documents: state.documents,
            dreams: [
              ...state.dreams.map((entry) =>
                entry.status === "running"
                  ? {
                      ...entry,
                      status: "cancelled" as const,
                      errorCode: "interrupted" as const,
                      endedAt: Date.now(),
                    }
                  : entry,
              ),
              operation!,
            ].slice(-200),
          },
        );
        expectedGeneration = this.storage.generation(workspaceId)!.generation;
        this.recallDependencies?.changed?.(workspaceId);
        return { state, claims };
      });
      const targets = this.dreamTargets(workspaceId, prepared.state.documents, prepared.claims);
      const ownerDocuments = [{ path: "MEMORY.md", content: owner.content }, ...(owner.documents ?? [])];
      if (
        ownerDocuments.some(
          (document) =>
            memoryPasteSensitivity(document.content) || memoryContentSensitivityReason(document.content),
        )
      )
        throw new AuxError(
          "permission_denied",
          "Remove sensitive material from owner Memory before Dream can process it.",
        );
      const documents = [
        ...ownerDocuments,
        ...[...targets].map(([path]) => ({
          path,
          content:
            prepared.state.documents.find((document) => document.path === path && !document.sourceRetired)
              ?.content ?? "",
        })),
      ];
      const modelInputGeneration = expectedGeneration;
      const checkModelCurrent = () => {
        checkCurrent();
        if (
          this.dreamWork.get(workspaceId)?.controller !== controller ||
          (this.storage.generation(workspaceId)?.generation ?? null) !== modelInputGeneration
        )
          throw new AuxError("cancelled", "The original Dream model job retired.");
      };
      selection = this.dreamer
        ? await this.dreamer.consolidate({
            job: {
              workspaceId,
              operationId: operation!.operationId,
              operation: "dream",
              modelGeneration: modelGeneration!,
              memoryGeneration: expectedGeneration,
              ownerRevision: owner.revision,
              sourceDigest: operation!.sourceDigest,
              policyDigest: sha(policy),
            },
            documents,
            claims: prepared.claims.map((claim) => ({
              claimId: claim.claimId,
              text: `${claim.ownerEdit ? "[Owner-edited context; unverified] " : claim.source?.kind === "owner-paste" ? "[Owner-pasted context; unverified] " : ""}${memoryClaimText(claim)}`,
            })),
            signal: controller.signal,
            checkCurrent: checkModelCurrent,
          })
        : { changes: [], status: "failed", errorCode: "model_unavailable" };
      operation = {
        ...operation!,
        ...selection,
        changes: [],
        durationMs: Math.max(0, performance.now() - started),
        endedAt: Date.now(),
        status: selection.status === "failed" ? "failed" : "completed",
      };
      await ownerCurrent?.();
      checkCurrent();
      return await this.leased(workspaceId, async (checkLease) => {
        checkCurrent();
        const state = await this.readClaims(workspaceId);
        if (
          !this.refsEligible(
            workspaceId,
            prepared.claims.map((claim) => ({
              claimId: claim.claimId,
              sourceRunId: claim.sourceRunId,
              quoteSha256: claim.source?.quoteSha256 ?? sha(claim.text),
              effectiveSha256: sha(memoryClaimText(claim)),
              claimRevision: claim.ownerEdit?.revision ?? 0,
            })),
            state.claims,
          )
        )
          throw new AuxError("cancelled", "Dream source eligibility changed.");
        const next = [...state.documents];
        const changes: MemoryDreamChange[] = [];
        for (const change of selection!.status === "completed" ? selection!.changes : []) {
          if (memoryPasteSensitivity(change.content) || memoryContentSensitivityReason(change.content))
            throw new AuxError("invalid_params", "Dream returned sensitive material.");
          const sourceRefs = [...new Set(change.claimIds)].map((id) => {
            const claim = prepared.claims.find((claim) => claim.claimId === id);
            if (!claim) throw new AuxError("invalid_params", "Dream cited an unknown source.");
            return {
              claimId: id,
              sourceRunId: claim.sourceRunId,
              quoteSha256: claim.source?.quoteSha256 ?? sha(claim.text),
              effectiveSha256: sha(memoryClaimText(claim)),
              claimRevision: claim.ownerEdit?.revision ?? 0,
            };
          });
          if (!sourceRefs.length)
            throw new AuxError("invalid_params", "Dream changes need supporting sources.");
          const ownerDocument = ownerDocuments.find((document) => document.path === change.path);
          const previous = next.find((document) => document.path === change.path);
          const target = targets.get(change.path);
          if (!ownerDocument && !target)
            throw new AuxError("invalid_params", "Dream targeted an unapproved document.");
          const before = ownerDocument?.content ?? previous?.content ?? null;
          if (before === change.content) continue;
          const pending = !!ownerDocument || previous?.authoredBy === "owner";
          const documentId = previous?.documentId ?? (!ownerDocument ? randomUUID() : undefined);
          const revision = previous?.revision ?? (ownerDocument ? owner.revision : 0);
          changes.push({
            changeId: randomUUID(),
            path: change.path,
            documentId,
            target,
            ownerPath: ownerDocument ? (change.path as "MEMORY.md" | "USER.md" | "TAXONOMY.md") : undefined,
            before,
            after: change.content,
            beforeSha256: before === null ? null : sha(before),
            afterSha256: sha(change.content),
            beforeRevision: revision,
            beforeSourceRefs: previous?.sourceRefs,
            beforeAuthoredBy: previous?.authoredBy,
            resultingRevision: pending ? undefined : revision + 1,
            sourceRefs,
            state: pending ? "pending" : "applied",
          });
          if (!pending) {
            if (!previous && next.length >= 100)
              throw new AuxError("conflict", "Memory document capacity was reached.");
            const updated: MemoryDocumentRecord = {
              documentId: documentId!,
              path: change.path,
              target: target!,
              content: change.content,
              contentSha256: sha(change.content),
              revision: revision + 1,
              updatedAt: Date.now(),
              authoredBy: "generated",
              sourceRefs,
            };
            const index = next.findIndex((document) => document.documentId === documentId);
            if (index < 0) next.push(updated);
            else next[index] = updated;
          }
        }
        operation = {
          ...operation!,
          changes,
          status: selection!.status === "failed" ? "failed" : changes.length ? "completed" : "no-change",
        };
        let publicationGeneration: string | undefined;
        try {
          await this.writeGeneration(
            workspaceId,
            state.claims,
            state.inbox,
            state.history,
            state.prior,
            state.imports,
            state.activity,
            () => {
              checkLease();
              checkCurrent();
            },
            {
              documents: next,
              dreams: state.dreams.map((entry) =>
                entry.operationId === operation!.operationId ? operation! : entry,
              ),
            },
            {
              commit: () => {
                publicationGeneration = this.storage.generation(workspaceId)?.generation;
                // Keep this immutable identity even if a later SQLite rollback
                // aborts. Only the actual current generation proves restoration.
                return undefined;
              },
            },
          );
        } catch (error) {
          // Record this write's exact generation inside its publication
          // transaction. An expired lease and a competing writer must never
          // make a rejected preparation look like this operation committed.
          if (
            publicationGeneration &&
            this.storage.generation(workspaceId)?.generation !== state.prior?.generation
          ) {
            committedPublicationUncertain = true;
            throw new AuxError(
              "operation_uncertain",
              this.storage.generation(workspaceId)?.generation === publicationGeneration
                ? "The original Dream result was saved, but its generation key retirement could not be confirmed. Inspect the recorded operation before running Dream again."
                : "The original Dream publication could not be confirmed after Memory changed. Inspect current documents and activity before running Dream again.",
              { kind: "memory-dream-publication", operationId: operation.operationId },
            );
          }
          throw error;
        }
        this.recallDependencies?.changed?.(workspaceId);
        return operation!;
      });
    } catch (error) {
      if (!operation) throw error;
      if (committedPublicationUncertain) {
        if (!this.closed) this.recallDependencies?.changed?.(workspaceId);
        throw error;
      }
      operation = {
        ...operation,
        durationMs: Math.max(0, performance.now() - started),
        endedAt: Date.now(),
        changes: [],
        status:
          controller.signal.aborted || (error instanceof AuxError && error.code === "cancelled")
            ? "cancelled"
            : "failed",
        errorCode: controller.signal.aborted
          ? "interrupted"
          : error instanceof AuxError && error.code === "cancelled"
            ? "source_changed"
            : "invalid_output",
      };
      // This terminal record never publishes model content after cancellation or source change.
      if (!this.closed)
        await this.leased(workspaceId, async () => {
          const state = await this.readClaims(workspaceId);
          if (!state.dreams.some((entry) => entry.operationId === operation!.operationId)) return;
          await this.writeGeneration(
            workspaceId,
            state.claims,
            state.inbox,
            state.history,
            state.prior,
            state.imports,
            state.activity,
            undefined,
            {
              documents: state.documents,
              dreams: state.dreams.map((entry) =>
                entry.operationId === operation!.operationId ? operation! : entry,
              ),
            },
          );
        });
      this.recallDependencies?.changed?.(workspaceId);
      return operation;
    }
  }

  async dreamCancel(workspaceId: string, operationId: string) {
    const work = this.dreamWork.get(workspaceId);
    const state = await this.readClaims(workspaceId);
    const operation = state.dreams.find((entry) => entry.operationId === operationId);
    if (!operation) throw new AuxError("not_found", "Dream operation is unavailable.");
    if (operation.status === "running" && work) {
      work.controller.abort();
      return work.promise;
    }
    return operation;
  }

  async dreamReview(
    raw: unknown,
    applyOwner?: (change: MemoryDreamChange, expectedRevision: number) => number,
    beforeRemoval?: () => void | Promise<void>,
    checkOwner?: () => Promise<void>,
  ) {
    const input = MemoryDocumentMethodSchemas["memory.pipeline.dreamReview"].parse(raw);
    await this.retireWorkspace(input.workspaceId);
    return this.own(() =>
      this.leased(input.workspaceId, async (checkLease) => {
        const state = await this.readClaims(input.workspaceId);
        if (state.prior?.generation !== input.expectedGeneration)
          throw new AuxError("conflict", "Memory changed. Review the current proposal.");
        const operation = state.dreams.find((entry) => entry.operationId === input.operationId);
        const change = operation?.changes.find((entry) => entry.changeId === input.changeId);
        if (!operation || !change || change.state !== "pending")
          throw new AuxError("conflict", "This Dream proposal is no longer pending.");
        const updated = { ...change };
        const documents = [...state.documents];
        let sources: ReturnType<MemoryPipeline["sourceFence"]> | undefined;
        let commitEffect: (() => () => void) | undefined;
        if (input.decision === "reject") updated.state = "rejected";
        else {
          this.liveMemorySpace(input.workspaceId);
          if (
            !this.policy(input.workspaceId).enabled ||
            !this.refsEligible(input.workspaceId, change.sourceRefs, state.claims)
          )
            throw new AuxError("permission_denied", "This proposal no longer has eligible Memory sources.");
          sources = this.sourceFence(
            input.workspaceId,
            state.claims.filter((claim) => change.sourceRefs.some((ref) => ref.claimId === claim.claimId)),
          );
          if (change.ownerPath) {
            const owner = readWorkspaceMemory(this.repo, input.workspaceId);
            const text =
              change.ownerPath === "MEMORY.md"
                ? owner.content
                : (owner.documents?.find((document) => document.path === change.ownerPath)?.content ?? "");
            if (
              !applyOwner ||
              input.expectedOwnerRevision !== owner.revision ||
              owner.revision !== change.beforeRevision ||
              sha(text) !== change.beforeSha256
            )
              throw new AuxError(
                "conflict",
                "The owner document changed. Preserve the newer edits and run Dream again.",
              );
            await beforeRemoval?.();
            checkLease();
            updated.resultingRevision = owner.revision + 1;
            commitEffect = this.ownerCommit(input.workspaceId, owner, [change], applyOwner);
          } else {
            const document = documents.find((document) => document.documentId === change.documentId);
            if (
              !document ||
              document.revision !== change.beforeRevision ||
              document.contentSha256 !== change.beforeSha256 ||
              !this.targetEligible(input.workspaceId, document.target)
            )
              throw new AuxError("conflict", "The Memory document changed after this proposal.");
            await beforeRemoval?.();
            checkLease();
            updated.resultingRevision = document.revision + 1;
            documents[documents.indexOf(document)] = {
              ...document,
              revision: updated.resultingRevision,
              content: change.after,
              contentSha256: change.afterSha256,
              authoredBy: "owner",
              sourceRefs: [],
              updatedAt: Date.now(),
            };
          }
          updated.state = "accepted";
        }
        const next = {
          ...operation,
          changes: operation.changes.map((entry) => (entry.changeId === updated.changeId ? updated : entry)),
        };
        await this.writeGeneration(
          input.workspaceId,
          state.claims,
          state.inbox,
          state.history,
          state.prior,
          state.imports,
          state.activity,
          () => {
            checkLease();
            if (input.decision === "accept") {
              this.liveMemorySpace(input.workspaceId);
              if (!this.policy(input.workspaceId).enabled)
                throw new AuxError("cancelled", "Memory paused before proposal publication.");
              const target = documents.find((document) => document.documentId === change.documentId)?.target;
              if (target && !this.targetEligible(input.workspaceId, target))
                throw new AuxError("cancelled", "The Memory document target retired.");
            }
            sources?.check();
          },
          {
            documents,
            dreams: state.dreams.map((entry) => (entry.operationId === next.operationId ? next : entry)),
          },
          { checkOwner, commit: commitEffect },
        );
        return next;
      }),
    );
  }

  async dreamRevert(
    raw: unknown,
    applyOwner?: (change: MemoryDreamChange, expectedRevision: number) => number,
    beforeRemoval?: () => void | Promise<void>,
    checkOwner?: () => Promise<void>,
  ) {
    const input = MemoryDocumentMethodSchemas["memory.pipeline.dreamRevert"].parse(raw);
    await this.retireWorkspace(input.workspaceId);
    return this.own(() =>
      this.leased(input.workspaceId, async (checkLease) => {
        this.liveMemorySpace(input.workspaceId);
        if (!this.policy(input.workspaceId).enabled)
          throw new AuxError("permission_denied", "Enable Memory before reverting Dream changes.");
        const state = await this.readClaims(input.workspaceId);
        if (state.prior?.generation !== input.expectedGeneration)
          throw new AuxError("conflict", "Memory changed. Review fresh diffs before reverting.");
        const operation = state.dreams.find((entry) => entry.operationId === input.operationId);
        if (!operation) throw new AuxError("not_found", "Dream operation is unavailable or was forgotten.");
        const changes = operation.changes.filter((change) => ["applied", "accepted"].includes(change.state));
        if (!changes.length)
          throw new AuxError("conflict", "This Dream operation has no applied changes to revert.");
        const owner = readWorkspaceMemory(this.repo, input.workspaceId);
        for (const change of changes) {
          if (
            !this.refsEligible(input.workspaceId, change.sourceRefs, state.claims) ||
            (change.beforeSourceRefs &&
              !this.refsEligible(input.workspaceId, change.beforeSourceRefs, state.claims))
          )
            throw new AuxError(
              "conflict",
              "A Dream source was edited or retired. Revert cannot restore stale synthesis.",
            );
          if (change.ownerPath) {
            const content =
              change.ownerPath === "MEMORY.md"
                ? owner.content
                : (owner.documents?.find((document) => document.path === change.ownerPath)?.content ?? "");
            if (
              !applyOwner ||
              owner.revision !== change.resultingRevision ||
              sha(content) !== change.afterSha256
            )
              throw new AuxError(
                "conflict",
                "The owner document has later edits. Revert cannot replace them.",
              );
          } else {
            const document = state.documents.find((entry) => entry.documentId === change.documentId);
            if (
              !document ||
              document.revision !== change.resultingRevision ||
              document.contentSha256 !== change.afterSha256
            )
              throw new AuxError("conflict", "A document has later edits. Revert cannot replace them.");
          }
        }
        const refs = changes.flatMap((change) => [...change.sourceRefs, ...(change.beforeSourceRefs ?? [])]);
        const sources = this.sourceFence(
          input.workspaceId,
          state.claims.filter((claim) => refs.some((ref) => ref.claimId === claim.claimId)),
        );
        const ownerChanges = changes
          .filter((change) => change.ownerPath)
          .map((change) => ({ ...change, after: change.before ?? "" }));
        const commitEffect = ownerChanges.length
          ? this.ownerCommit(input.workspaceId, owner, ownerChanges, applyOwner!)
          : undefined;
        await beforeRemoval?.();
        checkLease();
        const documents = [...state.documents];
        for (const change of changes) {
          if (!change.ownerPath) {
            const index = documents.findIndex((document) => document.documentId === change.documentId);
            if (change.before === null) documents.splice(index, 1);
            else
              documents[index] = {
                ...documents[index]!,
                content: change.before,
                contentSha256: change.beforeSha256!,
                revision: documents[index]!.revision + 1,
                updatedAt: Date.now(),
                sourceRefs: change.beforeSourceRefs ?? change.sourceRefs,
                authoredBy: change.beforeAuthoredBy ?? documents[index]!.authoredBy,
              };
          }
        }
        const next = {
          ...operation,
          changes: operation.changes.map((change) =>
            changes.includes(change) ? { ...change, state: "reverted" as const } : change,
          ),
        };
        await this.writeGeneration(
          input.workspaceId,
          state.claims,
          state.inbox,
          state.history,
          state.prior,
          state.imports,
          state.activity,
          () => {
            checkLease();
            this.liveMemorySpace(input.workspaceId);
            if (
              !this.policy(input.workspaceId).enabled ||
              documents.some(
                (document) =>
                  changes.some((change) => change.documentId === document.documentId) &&
                  !this.targetEligible(input.workspaceId, document.target),
              )
            )
              throw new AuxError(
                "cancelled",
                "Memory or a document target retired before revert publication.",
              );
            sources.check();
          },
          {
            documents,
            dreams: state.dreams.map((entry) => (entry.operationId === next.operationId ? next : entry)),
          },
          { checkOwner, commit: commitEffect },
        );
        return next;
      }),
    );
  }

  private async recallSources(workspaceId: string, signal: AbortSignal) {
    this.liveMemorySpace(workspaceId);
    if (!this.policy(workspaceId).enabled) return [];
    const owner = readWorkspaceMemory(this.repo, workspaceId);
    const state = await this.readClaims(workspaceId);
    signal.throwIfAborted();
    const sources: MemoryRecallSource[] = [];
    const add = (source: Omit<MemoryRecallSource, "sha256">) => {
      if (source.text && !memoryContentSensitivityReason(source.text))
        sources.push({ ...source, sha256: sha(source.text) });
    };
    for (const document of [
      {
        path: "MEMORY.md",
        content: owner.content,
        updatedAt: owner.contentUpdatedAt ?? owner.updatedAt ?? 0,
      },
      ...(owner.documents ?? []),
    ])
      add({
        sourceId: `owner:${document.path}`,
        kind: "owner",
        path: document.path,
        title: document.path,
        text: document.content,
        revision: String(owner.revision),
        updatedAt: document.updatedAt,
        sourceRefs: [],
      });
    for (const item of owner.items ?? [])
      if (
        (!item.expiresAt || item.expiresAt > Date.now()) &&
        (!item.sourceUrl || !memorySourceExcluded(owner, item.sourceUrl))
      )
        add({
          sourceId: `owner-item:${item.itemId}`,
          kind: "owner",
          path: `notes/${item.itemId}`,
          title: "Owner note",
          text: item.content,
          revision: String(owner.revision),
          updatedAt: item.updatedAt,
          url: item.sourceUrl,
          sourceRefs: [],
        });
    for (const claim of state.claims)
      if (!claim.contradictionIds?.length && this.eligibleForRecall(workspaceId, claim))
        add({
          sourceId: `claim:${claim.claimId}`,
          kind: "episodic",
          path: `episodic/${new Date(claim.capturedAt).toISOString().slice(0, 10)}.md`,
          title: "Saved source note",
          text: memoryClaimText(claim),
          revision: String(claim.ownerEdit?.revision ?? 0),
          updatedAt: claim.ownerEdit?.updatedAt ?? claim.capturedAt,
          sourceRefs: [
            {
              claimId: claim.claimId,
              sourceRunId: claim.sourceRunId,
              quoteSha256: claim.source?.quoteSha256 ?? sha(claim.text),
              effectiveSha256: sha(memoryClaimText(claim)),
              claimRevision: claim.ownerEdit?.revision ?? 0,
            },
          ],
        });
    for (const document of state.documents)
      if (this.documentEligible(workspaceId, document, state.claims))
        add({
          sourceId: `document:${document.documentId}`,
          kind: document.target.kind,
          path: document.path,
          title: document.path,
          text: document.content,
          revision: String(document.revision),
          updatedAt: document.updatedAt,
          sourceRefs: document.sourceRefs,
          url: document.target.kind === "site" ? document.target.origin : undefined,
        });
    for (const page of (await this.recallDependencies?.pages(workspaceId, signal)) ?? [])
      if (!page.url || !memorySourceExcluded(owner, page.url)) add(page);
    for (const entry of this.recallDependencies?.history(workspaceId) ?? [])
      if (!memorySourceExcluded(owner, entry.url))
        add({
          sourceId: `history:${entry.memoryId}`,
          kind: "history",
          path: entry.url,
          title: entry.title.slice(0, 500),
          text: `${entry.title}\n${entry.url}`,
          revision: String(entry.lastVisitedAt),
          updatedAt: entry.lastVisitedAt,
          url: entry.url,
          sourceRefs: [],
        });
    return sources;
  }

  private ownRecall<T>(
    workspaceId: string,
    externalSignal: AbortSignal | undefined,
    checkOwner: (() => void) | undefined,
    work: (signal: AbortSignal, check: () => void) => Promise<T>,
  ): Promise<T> {
    return this.own(async () => {
      const controller = new AbortController();
      const signal = externalSignal
        ? AbortSignal.any([externalSignal, controller.signal])
        : controller.signal;
      let controllers = this.recallWork.get(workspaceId);
      if (!controllers) {
        controllers = new Set();
        this.recallWork.set(workspaceId, controllers);
      }
      controllers.add(controller);
      let pending = this.recallPending.get(workspaceId);
      if (!pending) {
        pending = new Set();
        this.recallPending.set(workspaceId, pending);
      }
      const epoch = this.memoryEpochs.get(workspaceId);
      const ownerRevision = readWorkspaceMemory(this.repo, workspaceId).revision;
      const generation = this.storage.generation(workspaceId)?.generation;
      const policy = JSON.stringify(this.policy(workspaceId));
      const check = () => {
        signal.throwIfAborted();
        checkOwner?.();
        this.liveMemorySpace(workspaceId);
        if (
          this.closed ||
          this.memoryEpochs.get(workspaceId) !== epoch ||
          readWorkspaceMemory(this.repo, workspaceId).revision !== ownerRevision ||
          this.storage.generation(workspaceId)?.generation !== generation ||
          JSON.stringify(this.policy(workspaceId)) !== policy
        )
          throw new AuxError("cancelled", "The original Memory read sources changed.");
      };
      let original: Promise<T> | undefined;
      try {
        check();
        original = work(signal, check);
        pending.add(original);
        return await original;
      } finally {
        if (original) pending.delete(original);
        if (!pending.size) this.recallPending.delete(workspaceId);
        controllers.delete(controller);
        if (!controllers.size) this.recallWork.delete(workspaceId);
      }
    });
  }

  async recall(raw: unknown, signal?: AbortSignal, checkOwner?: () => void) {
    const input = MemoryDocumentMethodSchemas["memory.pipeline.recall"].parse(raw);
    return this.ownRecall(input.workspaceId, signal, checkOwner, async (signal, check) => {
      const sources = await this.recallSources(input.workspaceId, signal);
      check();
      const result = await this.recallEngine.search(sources, input, signal, check);
      const current = await this.recallSources(input.workspaceId, signal);
      check();
      const identity = (sources: MemoryRecallSource[]) =>
        sha(JSON.stringify(sources.map((source) => [source.sourceId, source.revision, source.sha256])));
      if (identity(sources) !== identity(current))
        throw new AuxError("cancelled", "Memory eligibility or retention changed during search.");
      return result;
    });
  }

  async readSource(raw: unknown, signal?: AbortSignal, checkOwner?: () => void) {
    const input = MemoryDocumentMethodSchemas["memory.pipeline.readSource"].parse(raw);
    return this.ownRecall(input.workspaceId, signal, checkOwner, async (signal, check) => {
      const sources = await this.recallSources(input.workspaceId, signal);
      check();
      const source = sources.find((source) => source.sourceId === input.sourceId);
      if (!source || source.revision !== input.revision || source.sha256 !== input.sha256)
        throw new AuxError("conflict", "This Memory source changed or is no longer eligible. Search again.");
      const lines = source.text.split("\n");
      if (input.startLine > lines.length)
        throw new AuxError("invalid_params", "The requested line is outside this source.");
      const selected: string[] = [];
      let bytes = 0;
      for (const line of lines.slice(input.startLine - 1, input.startLine - 1 + input.limitLines)) {
        if (bytes + Buffer.byteLength(line) > 65536) break;
        selected.push(line);
        bytes += Buffer.byteLength(line) + 1;
      }
      const current = (await this.recallSources(input.workspaceId, signal)).find(
        (entry) => entry.sourceId === input.sourceId,
      );
      check();
      if (!current || current.revision !== source.revision || current.sha256 !== source.sha256)
        throw new AuxError("cancelled", "The source changed while reading.");
      const endLine = input.startLine + selected.length - 1;
      return {
        ...source,
        text: selected.join("\n"),
        startLine: input.startLine,
        endLine,
        nextLine: endLine < lines.length ? endLine + 1 : null,
      };
    });
  }

  async forget(raw: unknown, beforeRemoval?: () => void | Promise<void>, retiredSource = false) {
    return this.own(() => this.forgetOwned(raw, beforeRemoval, undefined, retiredSource));
  }

  private async forgetOwned(
    raw: unknown,
    beforeRemoval?: () => void | Promise<void>,
    expiredBefore?: number,
    retiredSource = false,
  ) {
    const input = MemoryPipelineForgetParams.parse(raw);
    this.requireSpace(input.workspaceId);
    this.clearPastePreviews(input.workspaceId);
    const interruptedSources =
      expiredBefore !== undefined
        ? []
        : input.all
          ? [...(this.extractionSources.get(input.workspaceId) ?? [])]
          : retiredSource &&
              input.sourceRunId &&
              this.extractionSources.get(input.workspaceId)?.has(input.sourceRunId)
            ? [input.sourceRunId]
            : [];
    if (interruptedSources.length) {
      this.extractionEpochs.set(input.workspaceId, {});
      this.extractions.get(input.workspaceId)?.abort();
    }
    await this.retireWorkspace(input.workspaceId);
    // Abort synchronously, then join original extraction/key writes before taking the generation lease.
    if (interruptedSources.length) await this.extractionQueues.get(input.workspaceId)?.catch(() => {});
    const forgetAll = input.all && expiredBefore === undefined;
    return this.leased(input.workspaceId, async () => {
      const {
        claims,
        inbox,
        history,
        prior,
        activity,
        documents,
        dreams,
        retiredSources: retirement,
      } = await this.readClaims(input.workspaceId);
      const universe = [...claims, ...inbox, ...history.flatMap((revision) => revision.claims)];
      const forgottenIds = new Set(
        universe
          .filter((claim) =>
            expiredBefore !== undefined
              ? claim.capturedAt <= expiredBefore
              : input.all ||
                (input.claimId ? claim.claimId === input.claimId : claim.sourceRunId === input.sourceRunId),
          )
          .map((claim) => claim.claimId),
      );
      // Older generations could contain claims extracted from a later turn's
      // inherited context. Remove those descendants in the same generation,
      // including revisions, so restoring history cannot revive the source.
      let expanded = true;
      while (expanded) {
        expanded = false;
        const forgottenSources = universe.filter((claim) => forgottenIds.has(claim.claimId));
        for (const claim of universe) {
          if (forgottenIds.has(claim.claimId)) continue;
          const run = this.repo.getRun(claim.sourceRunId);
          const context = run?.config?.context ?? "";
          const parents = run?.config?.contextRunIds ?? [];
          if (
            forgottenSources.some(
              (source) =>
                parents.includes(source.sourceRunId) ||
                (source.source?.kind === "owner-paste"
                  ? context.includes(`[owner-pasted, unverified; import:${source.source.importId}]`)
                  : context.includes(
                      `[run:${source.sourceRunId}#${source.source?.quoteSha256.slice(0, 12) ?? ""}]`,
                    )),
            )
          ) {
            forgottenIds.add(claim.claimId);
            expanded = true;
          }
        }
      }
      const keep = (claim: MemoryClaim) => !forgottenIds.has(claim.claimId);
      const retiredAt = Date.now();
      const preservedOwnerEdits = retiredSource
        ? [...claims, ...inbox]
            .filter((claim) => forgottenIds.has(claim.claimId) && claim.ownerEdit)
            .map((claim) =>
              MemoryClaimSchema.parse({
                ...claim,
                text: "Original source retired.",
                source: undefined,
                sourceRetired: { at: retiredAt },
                contradictionIds: undefined,
                mergedClaimIds: undefined,
              }),
            )
        : [];
      const remaining = [...claims.filter(keep), ...preservedOwnerEdits];
      if (remaining.length > 200)
        throw new AuxError(
          "conflict",
          "Retained owner edits exceed the inspection document limit; no source retirement was committed.",
        );
      const pending = inbox.filter(keep);
      const forgotten = forgottenIds.size;
      const retainedActivity = activity.filter(
        (entry) =>
          (expiredBefore !== undefined ? entry.capturedAt > expiredBefore : !input.all) &&
          entry.sourceRunId !== input.sourceRunId &&
          !entry.candidateIds.some((id) => forgottenIds.has(id) || id === input.claimId),
      );
      const keptDocuments = documents.flatMap((document) => {
        const affected = document.sourceRefs.some(
          (ref) => forgottenIds.has(ref.claimId) || ref.sourceRunId === input.sourceRunId,
        );
        if (retiredSource && document.authoredBy === "owner")
          return [affected ? { ...document, sourceRefs: [], sourceRetired: { at: retiredAt } } : document];
        return !forgetAll && !affected ? [document] : [];
      });
      const forgottenRunIds = new Set(
        universe.filter((claim) => forgottenIds.has(claim.claimId)).map((claim) => claim.sourceRunId),
      );
      if (input.sourceRunId) forgottenRunIds.add(input.sourceRunId);
      const keptDreams = dreams.filter(
        (operation) =>
          !forgetAll &&
          (expiredBefore === undefined || operation.startedAt > expiredBefore) &&
          !operation.sourceRunIds.some((runId) => forgottenRunIds.has(runId)) &&
          !operation.changes.some((change) =>
            change.sourceRefs.some(
              (ref) => forgottenIds.has(ref.claimId) || forgottenRunIds.has(ref.sourceRunId),
            ),
          ),
      );
      const activityRemoved =
        activity.length -
        retainedActivity.length +
        documents.length -
        keptDocuments.length +
        dreams.length -
        keptDreams.length;
      const retiredIds = [
        ...new Set([...retirement.sourceHashes, ...[...forgottenRunIds, ...interruptedSources].map(sha)]),
      ];
      const retirementNeeded =
        expiredBefore === undefined &&
        (forgetAll
          ? this.eligibleDreamSessions(input.workspaceId, retirement.before, retirement).length > 0
          : !!input.sourceRunId && !retirement.sourceHashes.includes(sha(input.sourceRunId)));
      const nextRetirement = {
        before: forgetAll || retiredIds.length > 5000 ? Date.now() : retirement.before,
        sourceHashes: retiredIds.length > 5000 ? [] : retiredIds,
      };
      if (forgotten || activityRemoved || interruptedSources.length || retirementNeeded) {
        await beforeRemoval?.();
        const sanitized = history.map((revision) => ({ ...revision, claims: revision.claims.filter(keep) }));
        await this.writeGeneration(
          input.workspaceId,
          remaining,
          pending,
          [...sanitized, this.snapshot(remaining)].slice(-10),
          prior,
          undefined,
          retainedActivity,
          undefined,
          { documents: keptDocuments, dreams: keptDreams, retiredSources: nextRetirement },
        );
        const retiredSources = new Set(interruptedSources);
        if (input.all && expiredBefore === undefined)
          for (const entry of activity) retiredSources.add(entry.sourceRunId);
        if (input.sourceRunId) retiredSources.add(input.sourceRunId);
        for (const runId of retiredSources)
          this.repo.db
            .prepare(
              "INSERT OR IGNORE INTO memory_pipeline_watermarks(workspace_id,run_id,captured_at) VALUES(?,?,?)",
            )
            .run(input.workspaceId, runId, Date.now());
      }
      return { forgotten, activityRemoved, remaining: remaining.length + pending.length };
    });
  }
}
