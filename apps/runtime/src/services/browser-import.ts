import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { AuxError, type ImportSelection } from "@aux/contracts";
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
  profileCategories: { profileId: string; categories: ImportCategoryPreview[] }[];
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
  selections: ImportSelection[];
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

  async preview(): Promise<{ sources: ImportSourcePreview[] }> {
    const sources: ImportSourcePreview[] = [];
    for (const source of this.sources()) {
      const profileCategories = source.profiles.map(profile => ({ profileId: profile.id, categories: this.previewCategories(source, profile) }));
      sources.push({ id: source.id, label: source.label, profiles: source.profiles.map(p => p.id),
        categories: profileCategories[0]?.categories ?? [], profileCategories });
    }
    const liveTabs = this.deps.chromeTabs ? await this.deps.chromeTabs().catch(() => []) : [];
    const pages = liveTabs.filter(t => t.type === "page" && safeImportUrl(t.url));
    sources.push({
      id: ATTACHED_TABS_SOURCE,
      label: "Attached Chrome",
      profiles: [],
      profileCategories: [],
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
    const selections = this.resolveSelections(opts);
    const job: ImportJob = { id: `imp_${randomUUID().slice(0, 12)}`, cancelled: false, done: false, progress: [] };
    this.jobs.set(job.id, job);
    if (this.jobs.size > 20) {
      for (const [id, stale] of this.jobs) {
        if (id === job.id || !stale.done) continue;
        this.jobs.delete(id);
        if (this.jobs.size <= 20) break;
      }
    }
    void this.execute(job, selections).catch(error => {
      job.done = true;
      job.report = { jobId: job.id, cancelled: job.cancelled, results: job.progress };
      this.deps.emit("import.progress", { jobId: job.id, done: true, error: error instanceof Error ? error.message : String(error) });
    });
    return { jobId: job.id };
  }

  /** Run a full import and return its report — the synchronous path tests use. */
  async runNow(opts: ImportRunOptions): Promise<ImportReport> {
    const selections = this.resolveSelections(opts);
    const job: ImportJob = { id: `imp_${randomUUID().slice(0, 12)}`, cancelled: false, done: false, progress: [] };
    this.jobs.set(job.id, job);
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
      if (selection.sourceId === ATTACHED_TABS_SOURCE) {
        if (selection.profileId || selection.categories.length !== 1 || selection.categories[0] !== "tabs")
          throw new AuxError("invalid_params", "Attached Chrome can import live tabs only.");
        return { categories: ["tabs" as const] };
      }
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
    for (const { source, profile, categories } of selections) {
      if (!source || !profile) continue;
      for (const category of ["bookmarks", "history"] as const) {
        if (!categories.includes(category)) continue;
        const result = await this.runCategory(job, source, profile, category);
        job.progress.push(result);
        this.deps.emit("import.progress", { jobId: job.id, ...result });
        if (job.cancelled) break;
      }
      if (job.cancelled) break;
    }

    if (selections.some(selection => selection.categories.includes("tabs")) && !job.cancelled) {
      const result = await this.importAttachedTabs(job);
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
        const read = this.bookmarkItems(source, profile);
        const items = read.items.filter(item => safeImportUrl(item.url));
        const skipped = read.skipped + read.items.length - items.length;
        if (!items.length && !source.hasSidebarMetadata) {
          return { ...base, state: "skipped", imported: 0, skipped, detail: "Nothing to import." };
        }
        let added = 0, duplicates = 0;
        if (this.deps.native?.available()) {
          if (!this.deps.native.bookmarksInvoke)
            throw new AuxError("backend_unavailable", "Chromium bookmarks import is unavailable.");
          for (let offset = 0; offset < items.length; offset += 500) {
            if (job.cancelled) break;
            const result = await this.deps.native.bookmarksInvoke("bookmarks.import", { bookmarks: items.slice(offset, offset + 500) }) as { added: number; skipped: number };
            added += result.added;
            duplicates += result.skipped;
          }
        } else {
          const result = this.deps.repo.importBookmarks(items.map(i => ({ url: i.url, title: i.title, folderPath: i.folderPath })));
          added = result.added; duplicates = result.skipped;
          if (added) this.deps.emit("bookmarks.changed", { bookmarks: this.deps.repo.listBookmarks() });
        }
        return { ...base, state: "done", imported: added, skipped: duplicates + skipped, detail: items.length ? `${items.length} found` : "Nothing found" };
      }
      let imported = 0;
      let skipped = 0;
      let batches = 0;
      for (const read of this.historyBatches(source, profile)) {
        if (job.cancelled) return { ...base, state: "done", imported, skipped, detail: "Stopped by cancel." };
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

  private async importAttachedTabs(job: ImportJob): Promise<ImportCategoryResult> {
    const base = { source: ATTACHED_TABS_SOURCE, label: "Attached Chrome", category: "tabs" as const };
    if (!this.deps.chromeTabs || !this.deps.openTab) {
      return { ...base, state: "skipped", imported: 0, skipped: 0, detail: "No Chrome is attached." };
    }
    const targets = await this.deps.chromeTabs();
    const pages = targets.filter(t => t.type === "page" && safeImportUrl(t.url));
    if (!pages.length) {
      return { ...base, state: targets.length ? "done" : "skipped", imported: 0, skipped: 0, detail: targets.length ? "No http(s) tabs to open." : "No Chrome is attached." };
    }
    let imported = 0;
    for (const page of pages.slice(0, 50)) {
      if (job.cancelled) break;
      try {
        await this.deps.openTab(page.url, page.title);
        imported++;
      } catch { /* keep going — partial results are the point */ }
    }
    return { ...base, state: "done", imported, skipped: pages.length - imported, detail: `${pages.length} live tab${pages.length === 1 ? "" : "s"}` };
  }
}
