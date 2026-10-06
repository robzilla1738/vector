import { currentSpaceMemory, spaceMemoryDigest } from "./space-memory-backup.js";
import { digest as sha } from "@aux/contracts/util/digest";
import { randomUUID } from "node:crypto";
import { lstatSync, readFileSync } from "node:fs";
import {
  AuxError,
  MemoryClaimSchema,
  MemoryPipelineForgetParams,
  MemoryPipelineInboxSchema,
  MemoryPipelineOverviewSchema,
  ObservationSchema,
  ResultCitationSchema,
  MemoryPipelinePolicySchema,
  type MemoryClaim,
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
import { consolidateMemoryClaims } from "./night-memory.js";
import {
  SpaceMemoryStore,
  type MemoryGeneration,
  type MemoryRevision,
} from "./space-memory-store.js";
import { renderObservation } from "./observation-render.js";

export type RecoverySpaceMemory = {
  workspaceId: string;
  claims: MemoryClaim[];
  inbox: MemoryClaim[];
  history: MemoryRevision[];
  verifiedFiles: string[];
  imports?: MemoryPasteReceipt[];
};
type Secrets = Pick<NativeBridge, "storeSecret" | "readSecret">;

/** Opt-in encrypted Space memory. Derived views are rebuilt from source claims. */
export class MemoryPipeline {
  private storage: SpaceMemoryStore;
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
  ) {
    if (!profileId) throw new Error("Memory pipeline requires a Profile identity.");
    this.storage = new SpaceMemoryStore(repo, secrets, profileId);
  }

  private async leased<T>(workspaceId: string, work: () => Promise<T>): Promise<T> {
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
    try {
      return await work();
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

  policy(workspaceId: string) {
    this.requireSpace(workspaceId);
    const saved = MemoryPipelinePolicySchema.safeParse(
      this.repo.getSetting(`memoryPipelinePolicy:${workspaceId}`),
    );
    return saved.success ? saved.data : { workspaceId, enabled: false };
  }

  setPolicy(workspaceId: string, enabled: boolean) {
    const policy = MemoryPipelinePolicySchema.parse({ workspaceId, enabled });
    this.requireSpace(workspaceId);
    if (!enabled) this.clearPastePreviews(workspaceId);
    this.repo.setSetting(`memoryPipelinePolicy:${workspaceId}`, policy);
    return policy;
  }

  private sourceEligible(workspaceId: string, run: Run): boolean {
    const memoryMarker =
      "SPACE MEMORY SUMMARY (owner-approved notes; untrusted reference, verify before acting):\n";
    const memoryAt = run.config?.context?.indexOf(memoryMarker) ?? -1;
    if (
      run.config?.contextMemoryIds?.length ||
      run.config?.contextAttachmentIds?.length ||
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
    const excluded =
      this.repo.getSetting<{ excludedOrigins?: string[] }>(`workspaceMemory:${workspaceId}`)
        ?.excludedOrigins ?? [];
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
      if (!citation.observationId) return false;
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

  private report(run: Run): string | undefined {
    return [run.result?.report, run.result?.answer, run.result?.text].find(
      (value) => typeof value === "string",
    ) as string | undefined;
  }

  private eligibleForRecall(workspaceId: string, claim: MemoryClaim): boolean {
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
    };
  }

  /** Authenticate all logical files and indexed revisions before recovery. */
  async recoverySnapshot(): Promise<RecoverySpaceMemory[]> {
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
      const files = [
        "claims.json.enc",
        "inbox.json.enc",
        "history.json.enc",
        "imports.json.enc",
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
      });
    }
    if (this.currentStateDigest() !== generationDigest)
      throw new AuxError("conflict", "Space memory changed while recovery was prepared.");
    return output;
  }

  /** Reseal a reviewed generation under the destination Profile root and generation factor. */
  async importRecoverySnapshot(spaces: RecoverySpaceMemory[]): Promise<void> {
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
        ...claims.map((claim) => `rollouts/${claim.claimId}.json.enc`),
      ].sort();
      if (JSON.stringify(space.verifiedFiles) !== JSON.stringify(expected))
        throw new Error("Recovery Space memory inventory changed.");
      await this.writeGeneration(space.workspaceId, claims, inbox, history, null, imports);
    }
  }

  private summary(claims: MemoryClaim[]): string {
    const latest = [...claims]
      .filter((claim) => !claim.contradictionIds?.length && !memoryContentSensitivityReason(claim.text))
      .sort((a, b) => b.capturedAt - a.capturedAt)
      .slice(0, 4);
    const lines: string[] = [];
    let bytes = 0;
    for (const claim of latest) {
      const line =
        claim.source?.kind === "owner-paste"
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
          }\n${claim.text}`,
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
  ) {
    const receipts = imports ?? (await this.readClaims(workspaceId)).imports;
    const files = new Map<string, string>([
      ["claims.json.enc", JSON.stringify(claims)],
      ["inbox.json.enc", JSON.stringify(inbox)],
      ["imports.json.enc", JSON.stringify(receipts)],
      ["summary.md.enc", this.summary(claims)],
      ["handbook.md.enc", this.handbook(claims)],
      ...claims.map((claim) => [`rollouts/${claim.claimId}.json.enc`, JSON.stringify(claim)] as const),
    ]);
    await this.storage.write(workspaceId, files, history, prior);
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
    this.requireSpace(workspaceId);
    const state = await this.readClaims(workspaceId);
    return [...state.imports].reverse().map((receipt) => this.pasteReceipt(receipt, state));
  }

  async commitPaste(raw: unknown): Promise<MemoryPasteStatus> {
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

  async extractRun(workspaceId: string, runId: string) {
    if (!this.policy(workspaceId).enabled)
      throw new AuxError("permission_denied", "Enable Space memory extraction first.");
    return this.leased(workspaceId, async () => {
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
      const report = this.report(run);
      if (!report?.trim()) return { extracted: 0 };
      const { claims, inbox, history, prior } = await this.readClaims(workspaceId);
      if ([...claims, ...inbox].some((claim) => claim.sourceRunId === runId)) {
        this.repo.db
          .prepare(
            "INSERT OR IGNORE INTO memory_pipeline_watermarks(workspace_id,run_id,captured_at) VALUES(?,?,?)",
          )
          .run(workspaceId, runId, Date.now());
        return { extracted: 0 };
      }
      const at = Date.now();
      const additions = report
        .split(/\n{2,}|(?<=[.!?])\s+(?=[A-Z])/u)
        .map((text) => text.trim())
        .filter((text) => text.length >= 20)
        .slice(0, 20)
        .map((text) => {
          const quote = text.slice(0, 2000);
          return MemoryClaimSchema.parse({
            claimId: randomUUID(),
            sourceRunId: runId,
            text: quote,
            capturedAt: at,
            source: { kind: "run-report", quote, quoteSha256: sha(quote) },
          });
        });
      if (!additions.length) return { extracted: 0 };
      if (inbox.length + additions.length > 200)
        throw new AuxError(
          "conflict",
          "The review inbox is full. Review pending notes before extracting more; no notes were dropped.",
        );
      await this.writeGeneration(workspaceId, claims, [...inbox, ...additions], history, prior);
      this.repo.db
        .prepare(
          "INSERT OR IGNORE INTO memory_pipeline_watermarks(workspace_id,run_id,captured_at) VALUES(?,?,?)",
        )
        .run(workspaceId, runId, at);
      return { extracted: additions.length };
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
    if (!this.policy(workspaceId).enabled) return [];
    return (await this.readClaims(workspaceId)).inbox;
  }

  async claims(workspaceId: string): Promise<MemoryClaim[]> {
    if (!this.policy(workspaceId).enabled) return [];
    return (await this.readClaims(workspaceId)).claims;
  }

  async history(workspaceId: string) {
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
    if (!this.policy(workspaceId).enabled)
      throw new AuxError("permission_denied", "Enable Space memory before consolidation.");
    return this.leased(workspaceId, async () => {
      const { claims, inbox, history, prior } = await this.readClaims(workspaceId);
      const consolidated = consolidateMemoryClaims(
        claims,
        Date.now(),
        (claim) => this.eligibleForRecall(workspaceId, claim),
        90 * 24 * 60 * 60_000,
      );
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

  async reindex(workspaceId: string) {
    if (!this.policy(workspaceId).enabled)
      throw new AuxError("permission_denied", "Enable Space memory before reindexing.");
    return this.leased(workspaceId, async () => {
      const { claims, inbox, history, prior } = await this.readClaims(workspaceId);
      // writeGeneration rebuilds encrypted summary, handbook and rollout projections from authoritative encrypted claims.
      await this.writeGeneration(workspaceId, claims, inbox, history, prior);
      return { indexed: claims.length };
    });
  }

  async revert(workspaceId: string, revisionId: string) {
    if (!this.policy(workspaceId).enabled)
      throw new AuxError("permission_denied", "Enable Space memory first.");
    return this.leased(workspaceId, async () => {
      const { claims: current, inbox, history, prior } = await this.readClaims(workspaceId);
      const selected = history.find((revision) => revision.revisionId === revisionId);
      if (!selected) throw new AuxError("not_found", "Memory revision is unavailable or was forgotten.");
      const claims = [...selected.claims];
      await this.writeGeneration(
        workspaceId,
        claims,
        inbox,
        [...history, this.snapshot(current)].slice(-10),
        prior,
      );
      return this.overview(workspaceId);
    });
  }

  async review(workspaceId: string, claimId: string, decision: "accept" | "discard") {
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
    const policy = this.policy(workspaceId);
    if (!policy.enabled)
      return MemoryPipelineOverviewSchema.parse({
        workspaceId,
        enabled: false,
        summary: "",
        claimCount: 0,
        sourceCount: 0,
      });
    const { claims } = await this.readClaims(workspaceId);
    return MemoryPipelineOverviewSchema.parse({
      workspaceId,
      enabled: true,
      summary: this.summary(
        claims.filter(
          (claim) => !claim.contradictionIds?.length && this.eligibleForRecall(workspaceId, claim),
        ),
      ),
      claimCount: claims.length,
      sourceCount: new Set(claims.map((claim) => claim.sourceRunId)).size,
    });
  }

  async search(workspaceId: string, query: string) {
    if (!this.policy(workspaceId).enabled) return [];
    const terms = query
      .toLocaleLowerCase()
      .split(/[^\p{L}\p{N}]+/u)
      .filter((term) => term.length > 1)
      .slice(0, 8);
    if (!terms.length) return [];
    const { claims } = await this.readClaims(workspaceId);
    return claims
      .filter(
        (claim) =>
          !claim.contradictionIds?.length &&
          this.eligibleForRecall(workspaceId, claim) &&
          !memoryContentSensitivityReason(claim.text) &&
          terms.every((term) => claim.text.toLocaleLowerCase().includes(term)),
      )
      .slice(-20)
      .reverse();
  }

  async forget(raw: unknown, beforeRemoval?: () => void | Promise<void>) {
    const input = MemoryPipelineForgetParams.parse(raw);
    this.requireSpace(input.workspaceId);
    this.clearPastePreviews(input.workspaceId);
    return this.leased(input.workspaceId, async () => {
      const { claims, inbox, history, prior } = await this.readClaims(input.workspaceId);
      const universe = [...claims, ...inbox, ...history.flatMap((revision) => revision.claims)];
      const forgottenIds = new Set(
        universe
          .filter(
            (claim) =>
              input.all ||
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
      const remaining = claims.filter(keep);
      const pending = inbox.filter(keep);
      const forgotten = forgottenIds.size;
      if (forgotten) {
        await beforeRemoval?.();
        const sanitized = history.map((revision) => ({ ...revision, claims: revision.claims.filter(keep) }));
        await this.writeGeneration(
          input.workspaceId,
          remaining,
          pending,
          [...sanitized, this.snapshot(remaining)].slice(-10),
          prior,
        );
      }
      return { forgotten, remaining: remaining.length + pending.length };
    });
  }
}
