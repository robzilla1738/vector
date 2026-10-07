import { BrowserImportSelections } from "./import-selection.js";
import { randomUUID } from "node:crypto";
import {
  AuxError,
  ImportExtensionReviewSchema,
  ImportSelectionSchema,
  type ImportExtensionReview,
  type BrowserExportSource,
  type BrowserExportFormat,
  type ImportOperation,
  type ImportSelection,
  type NativeBrowserImportDiscovery,
  type NativeBrowserImportReceipt,
} from "@aux/contracts";
import { loadImportReceipts, saveImportReceipts, type ImportJob } from "./import-receipts.js";
import type { Repo } from "../store/repo.js";
import type { NativeBridge } from "../native.js";

export interface ImportRunOptions {
  selections: ImportSelection[];
  acknowledgeInterruptedJobId?: string;
}

/** One human importer authority. Native code alone snapshots and writes browser data. */
export class BrowserImporter {
  private readonly jobs = new Map<string, ImportJob>();
  private readonly previews = new Map<string, NativeBrowserImportDiscovery>();
  private readonly inFlight = new Map<string, Promise<void>>();
  private closed = false;
  private readonly extensionReviews = new Map<
    string,
    { token: string; handle: string; review: ImportExtensionReview }
  >();
  private readonly selections: BrowserImportSelections;
  constructor(
    private readonly deps: {
      repo: Repo;
      native?: NativeBridge;
      emit(type: string, payload: Record<string, unknown>): void;
    },
  ) {
    this.selections = new BrowserImportSelections({
      native: deps.native,
      owner: (token) => this.owner(token),
      publish: (token, incoming) => this.publishSelection(token, incoming),
    });
    for (const job of loadImportReceipts(deps.repo).reverse()) this.jobs.set(job.jobId, job);
  }
  private bridge() {
    const n = this.deps.native;
    if (
      !n?.browserImportDiscover ||
      !n.browserImportBegin ||
      !n.browserImportPoll ||
      !n.browserImportCancel ||
      !n.turnSourceContext
    )
      throw new AuxError("backend_unavailable", "Browser import requires the native Aux Profile.");
    return {
      discover: n.browserImportDiscover.bind(n),
      begin: n.browserImportBegin.bind(n),
      poll: n.browserImportPoll.bind(n),
      cancel: n.browserImportCancel.bind(n),
      owner: n.turnSourceContext.bind(n),
    };
  }
  private async owner(token: string) {
    if (this.closed) throw new AuxError("cancelled", "Browser import is closing.");
    await this.bridge().owner(token);
    if (this.closed) throw new AuxError("cancelled", "Browser import closed during owner validation.");
  }
  private recentJobs() {
    return [...this.jobs.values()].reverse().slice(0, 5);
  }
  private job(jobId?: string) {
    const job = jobId ? this.jobs.get(jobId) : this.recentJobs()[0];
    if (!job) throw new AuxError("not_found", "No browser import with that identity.");
    return job;
  }
  private checkpoint(job: ImportJob) {
    job.updatedAt = Date.now();
    ++job.revision;
    saveImportReceipts(this.deps.repo, this.recentJobs());
    this.deps.emit("import.progress", structuredClone(job));
  }
  private publishSelection(token: string, incoming: NativeBrowserImportDiscovery) {
    const old = this.previews.get(token) ?? { sources: [], snapshots: [] };
    const pairs = new Set(incoming.snapshots.map((s) => `${s.sourceId}\0${s.profileId}`));
    const snapshots = [
      ...old.snapshots.filter((s) => !pairs.has(`${s.sourceId}\0${s.profileId}`)),
      ...incoming.snapshots,
    ];
    const sources = old.sources.filter((s) => !incoming.sources.some((i) => i.id === s.id));
    for (const source of incoming.sources) {
      const previous = old.sources.find((s) => s.id === source.id);
      const profileCategories = [
        ...(previous?.profileCategories ?? []).filter((p) => !source.profiles.includes(p.profileId)),
        ...source.profileCategories,
      ];
      sources.push({
        ...source,
        profiles: profileCategories.map((p) => p.profileId),
        profileCategories,
        categories: source.categories.map(
          (c) =>
            profileCategories
              .flatMap((p) => p.categories)
              .find((entry) => entry.category === c.category && entry.available) ?? c,
        ),
      });
    }
    const merged = { sources, snapshots };
    this.previews.set(token, merged);
    return merged;
  }
  async reviewExtensions(input: { sourceId: string; profileId: string }, token: string) {
    await this.owner(token);
    const preview = this.previews.get(token);
    const snapshot = preview?.snapshots.find(
      (s) => s.sourceId === input.sourceId && s.profileId === input.profileId,
    );
    const available = preview?.sources
      .find((s) => s.id === input.sourceId)
      ?.profileCategories.find((p) => p.profileId === input.profileId)
      ?.categories.some((c) => c.category === "extensions" && c.available && !c.blocker);
    const native = this.deps.native;
    if (!snapshot || !available)
      throw new AuxError("ref_stale", "Refresh the original extension source preview.");
    if (!native?.browserImportExtensionReview)
      throw new AuxError("backend_unavailable", "Extension review requires the native importer.");
    const review = ImportExtensionReviewSchema.parse(
      await native.browserImportExtensionReview({ token, sourceHandle: snapshot.sourceHandle }),
    );
    await this.owner(token);
    if (this.previews.get(token) !== preview)
      throw new AuxError("ref_stale", "The source preview changed during extension review.");
    for (const [id, old] of this.extensionReviews)
      if (old.token === token && old.handle === snapshot.sourceHandle) this.extensionReviews.delete(id);
    this.extensionReviews.set(review.reviewId, { token, handle: snapshot.sourceHandle, review });
    return review;
  }
  selectWindow(input: { sourceId: "safari" }, token: string) {
    return this.selections.selectWindow(input, token);
  }
  selectExport(input: { sourceId: BrowserExportSource; format: BrowserExportFormat }, token: string) {
    return this.selections.selectExport(input, token);
  }
  exportStatus(id: string, token: string) {
    return this.selections.status(id, token);
  }
  cancelExport(id: string, token: string) {
    return this.selections.status(id, token, true);
  }
  async preview(token: string) {
    await this.owner(token);
    for (const job of this.jobs.values()) if (!job.done && !job.acknowledged) await this.reconcile(job);
    const preview = await this.bridge().discover(token);
    if (this.closed) throw new AuxError("cancelled", "Browser preview closed.");
    // Source handles are ephemeral native authority, never persisted in receipts.
    this.previews.clear();
    this.extensionReviews.clear();
    this.previews.set(token, preview);
    return { sources: preview.sources, recentJobs: structuredClone(this.recentJobs()) };
  }
  async status(jobId: string | undefined, token: string) {
    await this.owner(token);
    const job = this.job(jobId);
    if (!job.done) await this.reconcile(job);
    return structuredClone(job);
  }
  async start(opts: ImportRunOptions, token: string): Promise<{ jobId: string }> {
    await this.owner(token);
    const preview = this.previews.get(token);
    if (!preview) throw new AuxError("ref_stale", "Refresh the browser preview in this Aux window.");
    let acknowledged: ImportJob | undefined;
    if (opts.acknowledgeInterruptedJobId) {
      await this.owner(token);
      const old = this.job(opts.acknowledgeInterruptedJobId);
      await this.reconcile(old);
      if (!old.interrupted || old.done || !old.nativeOperations?.some((op) => op.state === "unknown"))
        throw new AuxError("conflict", "Only the exact interrupted native receipt can be acknowledged.");
      acknowledged = old;
    }
    if ([...this.jobs.values()].some((job) => !job.done && !job.acknowledged && job !== acknowledged))
      throw new AuxError("conflict", "Join, cancel, or explicitly review the interrupted import first.");
    const identities = new Set<string>();
    const selected = opts.selections.map((raw) => {
      const choice = ImportSelectionSchema.parse(raw);
      const source = preview.sources.find((item) => item.id === choice.sourceId);
      const profileId = choice.profileId ?? (source?.profiles.length === 1 ? source.profiles[0] : undefined);
      const snapshot = preview.snapshots.find(
        (item) => item.sourceId === choice.sourceId && item.profileId === profileId,
      );
      const profile = source?.profileCategories.find((item) => item.profileId === profileId);
      if (
        !source ||
        !snapshot ||
        !profile ||
        !profileId ||
        choice.categories.some(
          (category) => !profile.categories.some((item) => item.category === category && item.available),
        )
      )
        throw new AuxError(
          "ref_stale",
          "Choose available categories from the original native browser preview.",
        );
      if (choice.categories.includes("extensions")) {
        const selectedReview = choice.extensionReview;
        const saved = selectedReview && this.extensionReviews.get(selectedReview.reviewId);
        if (
          !selectedReview ||
          !saved ||
          saved.token !== token ||
          saved.handle !== snapshot.sourceHandle ||
          selectedReview.choices.length !== saved.review.candidates.length ||
          selectedReview.choices.some(
            (c) => !saved.review.candidates.some((candidate) => candidate.candidateId === c.candidateId),
          )
        )
          throw new AuxError(
            "ref_stale",
            "Review every original extension, including skipped items, before import.",
          );
      }
      const key = JSON.stringify([choice.sourceId, profileId]);
      if (identities.has(key))
        throw new AuxError("invalid_params", "Choose each original browser data group once.");
      identities.add(key);
      return {
        choice: { ...choice, profileId },
        snapshot,
        label: profile.kind && profile.label ? profile.label : source.label,
      };
    });
    await this.owner(token);
    const now = Math.max(Date.now(), (this.recentJobs()[0]?.startedAt ?? 0) + 1);
    const job: ImportJob = {
      jobId: `imp_${randomUUID()}`,
      done: false,
      cancelled: false,
      selections: selected.map((item) => item.choice),
      startedAt: now,
      updatedAt: now,
      revision: 0,
      nativeOperations: selected.map(({ choice }) => ({
        operationId: randomUUID(),
        sourceId: choice.sourceId,
        profileId: choice.profileId,
        categories: choice.categories,
        state: "prepared",
      })),
      progress: selected.flatMap(({ choice, label }) =>
        choice.categories.map((category) => ({
          source: choice.sourceId,
          label,
          profileId: choice.profileId,
          category,
          state: "running" as const,
          imported: 0,
          skipped: 0,
        })),
      ),
    };
    const originalJobs = new Map(this.jobs);
    const previousAcknowledged = acknowledged?.acknowledged;
    if (acknowledged) acknowledged.acknowledged = true;
    for (const [id, old] of this.jobs) {
      if (this.jobs.size < 5) break;
      if (old.done || old.acknowledged) this.jobs.delete(id);
    }
    if (this.jobs.size >= 5) throw new AuxError("conflict", "Resolve the retained browser imports first.");
    this.jobs.set(job.jobId, job);
    try {
      this.checkpoint(job);
    } catch (error) {
      if (acknowledged) acknowledged.acknowledged = previousAcknowledged;
      this.jobs.clear();
      for (const [id, original] of originalJobs) this.jobs.set(id, original);
      throw error;
    }
    const work = this.execute(
      job,
      selected.map((item) => item.snapshot.sourceHandle),
      token,
    );
    this.inFlight.set(job.jobId, work);
    void work
      .finally(() => {
        if (this.inFlight.get(job.jobId) === work) this.inFlight.delete(job.jobId);
      })
      .catch(() => {});
    return { jobId: job.jobId };
  }
  private apply(job: ImportJob, op: ImportOperation, receipt: NativeBrowserImportReceipt) {
    if (receipt.operationId !== op.operationId)
      throw new AuxError("ref_stale", "Native import receipt identity changed.");
    if (receipt.unknown) {
      op.state = "unknown";
      job.interrupted = true;
      job.error =
        "The native import receipt is unavailable. Some accepted items may already be imported; review before starting another import.";
    } else {
      if (receipt.done === undefined || receipt.cancelled === undefined || !receipt.progress)
        throw new AuxError("conflict", "Native import completion was not confirmed.");
      if (
        receipt.progress.length !== op.categories.length ||
        new Set(receipt.progress.map((item) => item.category)).size !== op.categories.length
      )
        throw new AuxError("conflict", "Native import category completion was incomplete.");
      for (const result of receipt.progress) {
        if (
          result.source !== op.sourceId ||
          result.profileId !== op.profileId ||
          !op.categories.includes(result.category)
        )
          throw new AuxError("ref_stale", "Native import category identity changed.");
        const index = job.progress.findIndex(
          (item) =>
            item.source === result.source &&
            item.profileId === result.profileId &&
            item.category === result.category,
        );
        if (index < 0) throw new AuxError("ref_stale", "Unexpected native import category receipt.");
        // Counts and states come only from the joined native receipt. Keep the
        // original human-reviewed display label; labels never grant authority.
        job.progress[index] = { ...result, label: job.progress[index]!.label };
      }
      op.state = receipt.done ? "joined" : "dispatched";
      job.cancelled ||= receipt.cancelled;
      job.interrupted = job.nativeOperations?.some((item) => item.state === "unknown") ?? false;
      if (receipt.error) job.error = receipt.error;
    }
    this.finish(job);
    this.checkpoint(job);
  }
  private finish(job: ImportJob) {
    if (job.nativeOperations?.length && job.nativeOperations.every((op) => op.state === "joined")) {
      job.done = true;
      job.interrupted = false;
      job.report = { jobId: job.jobId, cancelled: job.cancelled, results: structuredClone(job.progress) };
    }
  }
  private retirePrepared(job: ImportJob, op: ImportOperation) {
    op.state = "joined";
    for (const result of job.progress)
      if (
        result.source === op.sourceId &&
        result.profileId === op.profileId &&
        op.categories.includes(result.category)
      ) {
        result.state = "skipped";
        result.detail = "Cancelled before native acceptance.";
      }
    this.finish(job);
    this.checkpoint(job);
  }
  private async join(job: ImportJob, op: ImportOperation, cancel: boolean) {
    this.apply(
      job,
      op,
      await (cancel ? this.bridge().cancel(op.operationId) : this.bridge().poll(op.operationId)),
    );
    while (op.state === "dispatched") {
      await new Promise<void>((resolve) => setTimeout(resolve, 100));
      this.apply(
        job,
        op,
        await (job.cancelled || this.closed
          ? this.bridge().cancel(op.operationId)
          : this.bridge().poll(op.operationId)),
      );
    }
  }
  private async execute(job: ImportJob, handles: string[], token: string) {
    try {
      for (const [index, op] of (job.nativeOperations ?? []).entries()) {
        if (job.cancelled || this.closed || job.interrupted) {
          this.retirePrepared(job, op);
          continue;
        }
        // Persist dispatch identity before the request; ambiguous responses never re-Begin.
        op.state = "dispatched";
        this.checkpoint(job);
        const sourceHandle = handles[index];
        if (!sourceHandle) throw new AuxError("ref_stale", "The original browser source handle was lost.");
        const receipt = await this.bridge().begin({
          token,
          operationId: op.operationId,
          sourceHandle,
          categories: op.categories,
          extensionReview: job.selections?.[index]?.extensionReview ?? {},
        });
        this.apply(job, op, receipt);
        if (op.state === "dispatched") await this.join(job, op, job.cancelled || this.closed);
      }
    } catch {
      job.interrupted = true;
      job.error =
        "Import completion was not confirmed. Retain this receipt and review its status before retrying.";
      this.checkpoint(job);
    }
  }
  private async reconcile(job: ImportJob) {
    for (const op of job.nativeOperations ?? []) {
      if (op.state === "dispatched" || op.state === "unknown")
        this.apply(job, op, await this.bridge().poll(op.operationId));
    }
  }
  private async signalCancellation(job: ImportJob) {
    // Send reduction immediately, including while an accepted operation is
    // sleeping between polls. The execution loop still owns its completion
    // join; this acknowledgement does not finish or roll back destination work.
    const results = await Promise.allSettled(
      (job.nativeOperations ?? [])
        .filter((op) => op.state === "dispatched" || op.state === "unknown")
        .map((op) => this.bridge().cancel(op.operationId)),
    );
    const errors = results.flatMap((result) => (result.status === "rejected" ? [result.reason] : []));
    if (errors.length) throw new AggregateError(errors, "Native import cancellation was not acknowledged.");
  }
  async cancel(jobId: string, token: string) {
    await this.owner(token);
    const job = this.job(jobId);
    if (job.done) return { ok: true };
    job.cancelled = true;
    this.checkpoint(job);
    await this.signalCancellation(job);
    await this.inFlight.get(jobId);
    for (const op of job.nativeOperations ?? []) {
      if (op.state === "prepared") this.retirePrepared(job, op);
      else if (op.state !== "joined") await this.join(job, op, true);
    }
    return { ok: job.done };
  }
  /** Reduction-only drain while the original authenticated native channel remains live. */
  async close(): Promise<void> {
    this.closed = true;
    this.previews.clear();
    this.extensionReviews.clear();
    const failures: unknown[] = [];
    try {
      await this.selections.close();
    } catch (error) {
      failures.push(error);
    }
    for (const job of this.jobs.values())
      if (!job.done && !job.acknowledged) {
        job.cancelled = true;
        try {
          this.checkpoint(job);
        } catch (error) {
          failures.push(error);
        }
      }
    for (const result of await Promise.allSettled(
      [...this.jobs.values()]
        .filter((job) => !job.done && !job.acknowledged)
        .map((job) => this.signalCancellation(job)),
    ))
      if (result.status === "rejected") failures.push(result.reason);
    for (const result of await Promise.allSettled(this.inFlight.values()))
      if (result.status === "rejected") failures.push(result.reason);
    for (const job of this.jobs.values())
      if (!job.done && !job.acknowledged) {
        for (const op of job.nativeOperations ?? []) {
          try {
            if (op.state === "prepared") this.retirePrepared(job, op);
            else if (op.state !== "joined") await this.join(job, op, true);
          } catch (error) {
            failures.push(error);
          }
        }
        if (!job.done)
          failures.push(
            new AuxError("needs_input", "An interrupted import retains unknown accepted effects."),
          );
      }
    if (failures.length)
      throw new AggregateError(failures, "Browser imports retain unknown accepted effects.");
  }
}
