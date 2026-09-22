import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { AuxError } from "@aux/contracts";
import type { Repo } from "../store/repo.js";
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

export interface ImportCategoryPreview {
  category: ImportCategory;
  available: boolean;
  count?: number;
  bytes?: number;
  blocker?: string;
}

export interface ImportSourcePreview {
  id: string;
  label: string;
  profiles: string[];
  categories: ImportCategoryPreview[];
}

export interface ImportCategoryResult {
  source: string;
  label: string;
  category: ImportCategory;
  state: "running" | "done" | "skipped" | "error";
  imported: number;
  skipped: number;
  detail?: string;
}

export interface ImportReport {
  jobId: string;
  cancelled: boolean;
  results: ImportCategoryResult[];
}

export interface ImportRunOptions {
  sources?: string[];
  categories?: ImportCategory[];
  profile?: string;
}

interface ImportJob {
  id: string;
  cancelled: boolean;
  done: boolean;
  progress: ImportCategoryResult[];
  report?: ImportReport;
}

const ATTACHED_TABS_SOURCE = "chrome-attached";
const HISTORY_FILES: Record<string, string[]> = {
  arc: ["History"],
  safari: ["History.db"],
  firefox: ["places.sqlite"],
};

export class BrowserImporter {
  private jobs = new Map<string, ImportJob>();

  constructor(private deps: {
    repo: Repo;
    emit: (type: string, payload: Record<string, unknown>) => void;
    /** Live tab list of the attached Chrome, when one is connected. */
    chromeTabs?: () => Promise<{ url: string; title: string; type: string }[]>;
    /** Opens an imported tab URL in Aux. */
    openTab?: (url: string, title: string) => Promise<void>;
    /** Source discovery — injectable so tests never scan the real filesystem. */
    sources?: () => ImportSource[];
  }) {}

  private bookmarkItems(source: ImportSource, profile: ImportProfileRef): { items: ImportedBookmark[]; skipped: number } {
    if (source.id === "safari") return { items: readSafariBookmarks(profile.dir), skipped: 0 };
    if (source.id === "firefox") return { items: readFirefoxBookmarks(profile.dir), skipped: 0 };
    const items = readChromiumBookmarks(profile.dir);
    if (source.id === "arc" && source.hasSidebarMetadata) {
      const sidebar = readArcSidebar(profile.dir);
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

  async preview(): Promise<{ sources: ImportSourcePreview[] }> {
    const sources: ImportSourcePreview[] = [];
    for (const source of this.sources()) {
      const profile = source.profiles[0];
      const categories: ImportCategoryPreview[] = [];
      const bookmarksFile = profile && (source.id === "safari" ? join(profile.dir, "Bookmarks.plist") : source.id === "firefox" ? join(profile.dir, "places.sqlite") : join(profile.dir, "Bookmarks"));
      const bookmarkAvailable = !!profile && (source.id === "firefox" ? existsSync(bookmarksFile!) : existsSync(bookmarksFile!) || !!source.hasSidebarMetadata);
      let bookmarkCount: number | undefined;
      if (bookmarkAvailable && profile && source.id !== "firefox") {
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
      const historyAvailable = !!profile && historyFiles.some(f => existsSync(join(profile.dir, f)));
      categories.push({
        category: "history",
        available: historyAvailable,
        bytes: historyAvailable ? sourceStoreSize(profile!, historyFiles) : undefined,
        blocker: source.blocker,
      });
      sources.push({ id: source.id, label: source.label, profiles: source.profiles.map(p => p.id), categories });
    }
    const liveTabs = this.deps.chromeTabs ? await this.deps.chromeTabs().catch(() => []) : [];
    const pages = liveTabs.filter(t => t.type === "page" && /^https?:\/\//.test(t.url));
    sources.push({
      id: ATTACHED_TABS_SOURCE,
      label: "Attached Chrome",
      profiles: [],
      categories: [{
        category: "tabs",
        available: pages.length > 0,
        count: pages.length || undefined,
        blocker: pages.length ? undefined : "Attach Chrome over CDP (⌘⇧P → Attach Chrome) so its live tabs can be opened here.",
      }],
    });
    return { sources };
  }

  private job(jobId: string): ImportJob {
    const job = this.jobs.get(jobId);
    if (!job) throw new AuxError("not_found", "No import with that id.");
    return job;
  }

  status(jobId: string) {
    const job = this.job(jobId);
    return { jobId, done: job.done, cancelled: job.cancelled, progress: job.progress, report: job.report };
  }

  cancel(jobId: string) {
    const job = this.job(jobId);
    job.cancelled = true;
    return { ok: true };
  }

  /** Start an import in the background; progress flows as import.progress events. */
  start(opts: ImportRunOptions): { jobId: string } {
    const job: ImportJob = { id: `imp_${randomUUID().slice(0, 12)}`, cancelled: false, done: false, progress: [] };
    this.jobs.set(job.id, job);
    if (this.jobs.size > 20) {
      for (const [id, stale] of this.jobs) {
        if (id === job.id || !stale.done) continue;
        this.jobs.delete(id);
        if (this.jobs.size <= 20) break;
      }
    }
    void this.execute(job, opts).catch(error => {
      job.done = true;
      job.report = { jobId: job.id, cancelled: job.cancelled, results: job.progress };
      this.deps.emit("import.progress", { jobId: job.id, done: true, error: error instanceof Error ? error.message : String(error) });
    });
    return { jobId: job.id };
  }

  /** Run a full import and return its report — the synchronous path tests use. */
  async runNow(opts: ImportRunOptions): Promise<ImportReport> {
    const job: ImportJob = { id: `imp_${randomUUID().slice(0, 12)}`, cancelled: false, done: false, progress: [] };
    this.jobs.set(job.id, job);
    return this.execute(job, opts);
  }

  private async execute(job: ImportJob, opts: ImportRunOptions): Promise<ImportReport> {
    const categories = new Set(opts.categories ?? ["bookmarks", "history", "tabs"]);
    const sources = this.sources().filter(source => !opts.sources?.length || opts.sources.includes(source.id));

    for (const source of sources) {
      const profile = (opts.profile ? source.profiles.find(p => p.id === opts.profile) : undefined) ?? source.profiles[0];
      for (const category of ["bookmarks", "history"] as const) {
        if (!categories.has(category) || !profile) continue;
        const result = await this.runCategory(job, source, profile, category);
        job.progress.push(result);
        this.deps.emit("import.progress", { jobId: job.id, ...result });
        if (job.cancelled) break;
      }
      if (job.cancelled) break;
    }

    if (categories.has("tabs") && !job.cancelled && (!opts.sources?.length || opts.sources.includes(ATTACHED_TABS_SOURCE))) {
      const result = await this.importAttachedTabs();
      job.progress.push(result);
      this.deps.emit("import.progress", { jobId: job.id, ...result });
    }

    job.done = true;
    job.report = { jobId: job.id, cancelled: job.cancelled, results: job.progress };
    this.deps.emit("import.progress", { jobId: job.id, done: true, cancelled: job.cancelled });
    return job.report;
  }

  private async runCategory(job: ImportJob, source: ImportSource, profile: ImportProfileRef, category: "bookmarks" | "history"): Promise<ImportCategoryResult> {
    const base = { source: source.id, label: `${source.label} (${profile.id})`, category };
    if (source.blocker) return { ...base, state: "error", imported: 0, skipped: 0, detail: source.blocker };
    try {
      if (category === "bookmarks") {
        const { items, skipped } = this.bookmarkItems(source, profile);
        if (!items.length && !source.hasSidebarMetadata) {
          return { ...base, state: "skipped", imported: 0, skipped, detail: "Nothing to import." };
        }
        const result = this.deps.repo.importBookmarks(items.map(i => ({ url: i.url, title: i.title, folderPath: i.folderPath })));
        if (result.added) this.deps.emit("bookmarks.changed", { bookmarks: this.deps.repo.listBookmarks() });
        return { ...base, state: "done", imported: result.added, skipped: result.skipped + skipped, detail: items.length ? `${items.length} found` : "Nothing found" };
      }
      let imported = 0;
      let skipped = 0;
      let batches = 0;
      for (const batch of this.historyBatches(source, profile)) {
        if (job.cancelled) return { ...base, state: "done", imported, skipped, detail: "Stopped by cancel." };
        const r = this.deps.repo.importHistory(batch);
        imported += r.added;
        skipped += r.skipped;
        batches++;
        if (batches % 4 === 0) this.deps.emit("import.progress", { jobId: job.id, source: source.id, label: base.label, category, state: "running", imported, skipped });
        // Yield so cancel/status calls and other runtime work interleave —
        // without this a large history import would hold the event loop.
        await new Promise(resolve => setImmediate(resolve));
      }
      if (imported) this.deps.emit("history.changed", {});
      return { ...base, state: imported + skipped ? "done" : "skipped", imported, skipped, detail: imported + skipped ? `${imported + skipped} visits read` : "No visits found" };
    } catch (error) {
      return { ...base, state: "error", imported: 0, skipped: 0, detail: error instanceof Error ? error.message : String(error) };
    }
  }

  private async importAttachedTabs(): Promise<ImportCategoryResult> {
    const base = { source: ATTACHED_TABS_SOURCE, label: "Attached Chrome", category: "tabs" as const };
    if (!this.deps.chromeTabs || !this.deps.openTab) {
      return { ...base, state: "skipped", imported: 0, skipped: 0, detail: "No Chrome is attached." };
    }
    const targets = await this.deps.chromeTabs();
    const pages = targets.filter(t => t.type === "page" && /^https?:\/\//.test(t.url));
    if (!pages.length) {
      return { ...base, state: targets.length ? "done" : "skipped", imported: 0, skipped: 0, detail: targets.length ? "No http(s) tabs to open." : "No Chrome is attached." };
    }
    let imported = 0;
    for (const page of pages.slice(0, 50)) {
      try {
        await this.deps.openTab(page.url, page.title);
        imported++;
      } catch { /* keep going — partial results are the point */ }
    }
    return { ...base, state: "done", imported, skipped: pages.length - imported, detail: `${pages.length} live tab${pages.length === 1 ? "" : "s"}` };
  }
}
