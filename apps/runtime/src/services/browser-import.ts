import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { AuxError, type ImportCategoryPreview, type ImportSourcePreview, type ImportCategoryResult, type ImportReport, type ImportSelection } from "@aux/contracts";
import { loadImportReceipts, saveImportReceipts, type ImportJob } from "./import-receipts.js";
import type { Repo } from "../store/repo.js";
import type { NativeBridge } from "../native.js";
import {
  listImportSources,
  readArcSidebar,
  readChromiumBookmarks,
  readChromiumHistory,
  readFirefoxBookmarks,
  readFirefoxHistory,
  readSafariBookmarks,
  readSafariHistory,
  sourceStoreSize,
  type ImportCategory,
  type ImportHistoryRow,
  type ImportProfileRef,
  type ImportSource,
} from "./import-sources.js";
import type { ImportedBookmark } from "./chrome-bookmarks.js";

/**
 * Browser-data import jobs. Preview lists what each installed source can
 * offer; run executes the selected categories with a per-category
 * partial-result report — a source that fails or is skipped never blocks the
 * others. History streams through snapshot-copied SQLite in batches so a large
 * import stays cancellable; cancellation is checked between batches.
 */

export interface ImportRunOptions {
  selections: ImportSelection[];
}

const HISTORY_FILES: Record<string, string[]> = {
  arc: ["History"],
  safari: ["History.db"],
  firefox: ["places.sqlite"],
};

function safeImportUrl(value: string): boolean {
  if (value.length > 8192) return false;
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && !url.username && !url.password;
  } catch {
    return false;
  }
}

export class BrowserImporter {
  private jobs = new Map<string, ImportJob>();

  constructor(private deps: {
    repo: Repo;
    native?: NativeBridge;
    emit: (type: string, payload: Record<string, unknown>) => void;
    /** Opens an imported tab URL in Aux. */
    openTab?: (url: string, title: string) => Promise<void>;
    /** Source discovery — injectable so tests never scan the real filesystem. */
    sources?: () => ImportSource[];
  }) {
    for (const job of loadImportReceipts(deps.repo).reverse()) this.jobs.set(job.jobId, job);
    if (this.jobs.size) this.persist();
  }

  private recentJobs() {
    return [...this.jobs.values()].reverse().slice(0, 5);
  }

  private persist() {
    saveImportReceipts(this.deps.repo, this.recentJobs());
  }

  private checkpoint(job: ImportJob, result?: ImportCategoryResult) {
    if (result) {
      const index = job.progress.findIndex(item => item.source === result.source &&
        item.profileId === result.profileId && item.category === result.category);
      if (index < 0) job.progress.push(result);
      else job.progress[index] = result;
    }
    job.updatedAt = Date.now();
    job.revision++;
    this.persist();
    this.deps.emit("import.progress", { ...result, ...this.status(job.jobId) });
  }

  private createJob(selections: ImportSelection[]): ImportJob {
    if ([...this.jobs.values()].some(job => !job.done))
      throw new AuxError("conflict", "An import is already running in this Profile. Review its progress or cancel it first.");
    const now = Math.max(Date.now(), (this.recentJobs()[0]?.startedAt ?? 0) + 1);
    const job: ImportJob = { jobId: `imp_${randomUUID().slice(0, 12)}`, cancelled: false, done: false,
      selections: structuredClone(selections), progress: [], startedAt: now, updatedAt: now, revision: 0 };
    this.jobs.set(job.jobId, job);
    for (const [id, stale] of this.jobs) {
      if (this.jobs.size <= 5) break;
      if (stale.done) this.jobs.delete(id);
    }
    try { this.checkpoint(job); }
    catch (error) { this.jobs.delete(job.jobId); throw error; }
    return job;
  }

  private bookmarkItems(source: ImportSource, profile: ImportProfileRef): { items: ImportedBookmark[]; skipped: number } {
    if (source.id === "safari") return { items: readSafariBookmarks(profile.dir), skipped: 0 };
    if (source.id === "firefox") return { items: readFirefoxBookmarks(profile.dir), skipped: 0 };
    const items = readChromiumBookmarks(profile.dir);
    if (source.id === "arc" && source.hasSidebarMetadata) {
      const sidebar = readArcSidebar(source.sidebarDir ?? profile.dir);
      const seen = new Set(items.map(i => i.url));
      return { items: [...items, ...sidebar.bookmarks.filter(i => !seen.has(i.url))], skipped: sidebar.skipped };
    }
    return { items, skipped: 0 };
  }

  private historyBatches(source: ImportSource, profile: ImportProfileRef): Generator<ImportHistoryRow[]> {
    if (source.id === "safari") return readSafariHistory(profile.dir);
    if (source.id === "firefox") return readFirefoxHistory(profile.dir);
    return readChromiumHistory(profile.dir);
  }

  private sources(): ImportSource[] {
    return this.deps.sources ? this.deps.sources() : listImportSources();
  }

  private previewCategories(source: ImportSource, profile: ImportProfileRef): ImportCategoryPreview[] {
      const categories: ImportCategoryPreview[] = [];
      const bookmarksFile = source.id === "safari" ? join(profile.dir, "Bookmarks.plist") : source.id === "firefox" ? join(profile.dir, "places.sqlite") : join(profile.dir, "Bookmarks");
      const bookmarkAvailable = existsSync(bookmarksFile) || !!source.hasSidebarMetadata;
      let bookmarkCount: number | undefined;
      if (bookmarkAvailable && source.id !== "firefox") {
        try {
          bookmarkCount = this.bookmarkItems(source, profile).items.length;
        } catch { /* count is a hint — availability still stands */ }
      }
      categories.push({
        category: "bookmarks",
        available: bookmarkAvailable,
        count: bookmarkCount,
        blocker: source.blocker,
      });
      const historyFiles = HISTORY_FILES[source.id] ?? ["History"];
      const historyAvailable = historyFiles.some(f => existsSync(join(profile.dir, f)));
      categories.push({
        category: "history",
        available: historyAvailable,
        bytes: historyAvailable ? sourceStoreSize(profile, historyFiles) : undefined,
        blocker: source.blocker,
      });
      return categories;
  }

  async preview(): Promise<{ sources: ImportSourcePreview[]; recentJobs: ImportJob[] }> {
    const sources: ImportSourcePreview[] = [];
    for (const source of this.sources()) {
      const profileCategories = source.profiles.map(profile => ({ profileId: profile.id, categories: this.previewCategories(source, profile) }));
      sources.push({ id: source.id, label: source.label, profiles: source.profiles.map(p => p.id),
        categories: profileCategories[0]?.categories ?? [], profileCategories });
    }
    return { sources, recentJobs: structuredClone(this.recentJobs()) };
  }

  private job(jobId: string): ImportJob {
    const job = this.jobs.get(jobId);
    if (!job) throw new AuxError("not_found", "No import with that id.");
    return job;
  }

  status(jobId?: string): ImportJob {
    const job = jobId ? this.job(jobId) : this.recentJobs()[0];
    if (!job) throw new AuxError("not_found", "No previous browser import in this Profile.");
    return structuredClone(job);
  }

  cancel(jobId: string) {
    const job = this.job(jobId);
    if (!job.done && !job.cancelled) {
      job.cancelled = true;
      this.checkpoint(job);
    }
    return { ok: true };
  }

  /** A receipt is saved before work starts; restart never resumes writes. */
  start(opts: ImportRunOptions): { jobId: string } {
    const selections = this.resolveSelections(opts);
    const job = this.createJob(opts.selections);
    void this.execute(job, selections).catch(error => {
      // A receipt-write failure stops further categories. The last durable
      // checkpoint will be interrupted after restart; keep this session honest.
      job.done = true;
      job.error = (error instanceof Error ? error.message : String(error)).slice(0, 1000);
      job.report = { jobId: job.jobId, cancelled: job.cancelled, results: job.progress };
      job.revision++;
      this.deps.emit("import.progress", this.status(job.jobId));
    });
    return { jobId: job.jobId };
  }

  async runNow(opts: ImportRunOptions): Promise<ImportReport> {
    const selections = this.resolveSelections(opts);
    const job = this.createJob(opts.selections);
    return this.execute(job, selections);
  }

  private resolveSelections(opts: ImportRunOptions): { source?: ImportSource; profile?: ImportProfileRef; categories: ImportCategory[] }[] {
    if (!opts.selections.length) throw new AuxError("invalid_params", "Choose at least one import source.");
    const sources = new Map<string, ImportSource>(this.sources().map(source => [source.id, source]));
    const seen = new Set<string>();
    return opts.selections.map(selection => {
      const key = `${selection.sourceId}:${selection.profileId ?? ""}`;
      if (seen.has(key)) throw new AuxError("invalid_params", "Each browser Profile can be selected only once.");
      seen.add(key);
      const source = sources.get(selection.sourceId);
      const profile = source?.profiles.find(item => item.id === selection.profileId);
      if (!source || !profile || source.blocker)
        throw new AuxError("invalid_params", "The selected browser Profile is unavailable. Refresh the import preview.");
      const available = this.previewCategories(source, profile);
      if (selection.categories.some(category => category === "tabs" || !available.some(item => item.category === category && item.available && !item.blocker)))
        throw new AuxError("invalid_params", "The selected import category is unavailable. Refresh the import preview.");
      return { source, profile, categories: selection.categories };
    });
  }

  private async execute(job: ImportJob, selections: { source?: ImportSource; profile?: ImportProfileRef; categories: ImportCategory[] }[]): Promise<ImportReport> {
    try {
      for (const { source, profile, categories } of selections) {
        if (job.cancelled) break;
        if (!source || !profile) continue;
        for (const category of ["bookmarks", "history"] as const) {
          if (!categories.includes(category)) continue;
          const result = await this.runCategory(job, source, profile, category);
          this.checkpoint(job, result);
          if (job.cancelled) break;
        }
        if (job.cancelled) break;
      }

    } catch (error) {
      job.error = (error instanceof Error ? error.message : String(error)).slice(0, 1000);
    }
    job.done = true;
    job.report = { jobId: job.jobId, cancelled: job.cancelled, results: job.progress };
    this.checkpoint(job);
    return job.report;
  }

  private async runCategory(job: ImportJob, source: ImportSource, profile: ImportProfileRef, category: "bookmarks" | "history"): Promise<ImportCategoryResult> {
    const base = { source: source.id, label: `${source.label} (${profile.id})`, profileId: profile.id, category };
    let imported = 0, skipped = 0;
    const progress = () => this.checkpoint(job, { ...base, state: "running", imported, skipped });
    if (source.blocker) return { ...base, state: "error", imported: 0, skipped: 0, detail: source.blocker };
    try {
      progress();
      if (category === "bookmarks") {
        const read = this.bookmarkItems(source, profile);
        const items = read.items.filter(item => safeImportUrl(item.url));
        skipped = read.skipped + read.items.length - items.length;
        if (!items.length && !source.hasSidebarMetadata) {
          return { ...base, state: "skipped", imported: 0, skipped, detail: "Nothing to import." };
        }
        if (this.deps.native?.available()) {
          if (!this.deps.native.bookmarksInvoke)
            throw new AuxError("backend_unavailable", "Chromium bookmarks import is unavailable.");
          for (let offset = 0; offset < items.length; offset += 500) {
            if (job.cancelled) break;
            const result = await this.deps.native.bookmarksInvoke("bookmarks.import", { bookmarks: items.slice(offset, offset + 500) }) as { added: number; skipped: number };
            imported += result.added;
            skipped += result.skipped;
            progress();
          }
        } else {
          const result = this.deps.repo.importBookmarks(items.map(i => ({ url: i.url, title: i.title, folderPath: i.folderPath })));
          imported = result.added; skipped += result.skipped;
          progress();
          if (imported) this.deps.emit("bookmarks.changed", { bookmarks: this.deps.repo.listBookmarks() });
        }
        return { ...base, state: "done", imported, skipped,
          detail: job.cancelled ? "Stopped by cancel." : items.length ? `${items.length} found` : "Nothing found" };
      }
      for (const read of this.historyBatches(source, profile)) {
        if (job.cancelled) break;
        const batch = read.filter(row => safeImportUrl(row.url) && Number.isSafeInteger(row.visitedAt) &&
          row.visitedAt >= 0 && row.visitedAt <= Date.now() + 86_400_000)
          .map(row => ({ ...row, title: row.title.slice(0, 1000) }));
        skipped += read.length - batch.length;
        if (!batch.length) continue;
        let r: { added: number; skipped: number };
        if (this.deps.native?.available()) {
          if (!this.deps.native.historyImport)
            throw new AuxError("backend_unavailable", "Chromium history import is unavailable.");
          r = await this.deps.native.historyImport(batch);
        } else {
          r = this.deps.repo.importHistory(batch);
        }
        imported += r.added;
        skipped += r.skipped;
        progress();
        // Yield so cancel/status calls and other runtime work interleave —
        // without this a large history import would hold the event loop.
        await new Promise(resolve => setImmediate(resolve));
      }
      if (imported) this.deps.emit("history.changed", {});
      return { ...base, state: imported + skipped ? "done" : "skipped", imported, skipped, detail: job.cancelled ? "Stopped by cancel." : imported + skipped ? `${imported + skipped} visits read` : "No visits found" };
    } catch (error) {
      if (category === "history" && imported) this.deps.emit("history.changed", {});
      return { ...base, state: "error", imported, skipped, detail: (error instanceof Error ? error.message : String(error)).slice(0, 1000) };
    }
  }

}
