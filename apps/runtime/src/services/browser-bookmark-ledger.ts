import { randomUUID } from "node:crypto";
import { AuxError, BookmarkSchema, type Bookmark } from "@aux/contracts";
import type { Repo } from "../store/repo.js";
import type { NativeBridge } from "../native.js";
import { PageClaimStore } from "../agent/durable.js";

export class BrowserBookmarkLedger {
  constructor(private repo: Repo, private native?: NativeBridge) {}

  async list(): Promise<Bookmark[]> {
    return this.native?.available() && this.native.bookmarksInvoke
      ? BookmarkSchema.array().parse(await this.native.bookmarksInvoke("bookmarks.list", {}))
      : this.repo.listBookmarks();
  }

  async save(runId: string, pageId: string, url: string, title: string): Promise<{ saved: boolean; stepId?: string }> {
    const run = this.repo.getRun(runId);
    const claims = new PageClaimStore(this.repo.db);
    const active = this.repo.db.prepare("SELECT COUNT(*) AS count FROM page_claims WHERE page_id=? AND status='active'")
      .get(pageId) as { count: number };
    const claim = claims.activeForPage(pageId);
    if (!run || run.status !== "running" || !run.pageIds.includes(pageId) ||
      active.count !== 1 || claim?.runId !== runId)
      throw new AuxError("permission_denied", "Bookmark attribution requires this run's active page claim.");
    const parsed = new URL(url);
    if (!["https:", "http:"].includes(parsed.protocol) || parsed.username || parsed.password)
      throw new AuxError("invalid_params", "Only web pages without URL credentials can be bookmarked.");
    const existing = await this.list();
    if (existing.some(item => item.url === url)) return { saved: false };
    const stepId = randomUUID(), startedAt = Date.now();
    const base = { stepId, runId, pageId, op: "bookmark.add", startedAt, inputs: { url },
      outcome: { stepId, op: "bookmark.add", status: "failed" as const, startedAt, durationMs: 0,
        effect: "dispatched" as const, before: { existed: false } } };
    this.repo.saveStep(base);
    try {
      if (this.native?.available() && this.native.bookmarksInvoke)
        await this.native.bookmarksInvoke("bookmarks.add", { url, title, forceNew: true });
      else this.repo.addBookmark(url, title);
      // A node id matches anywhere in the library. Without one, creation time only matches that URL.
      const added = (await this.list()).filter(item => item.url === url &&
        !existing.some(prior => prior.nodeId || item.nodeId
          ? prior.nodeId === item.nodeId
          : prior.url === item.url && prior.createdAt === item.createdAt));
      if (added.length !== 1) throw new AuxError("conflict", "Bookmark saved but its new identity could not be verified");
      const after = added[0]!;
      this.repo.saveStep({ ...base, outcome: { ...base.outcome, status: "ok", effect: "observed",
        durationMs: Date.now() - startedAt, after: { url: after.url, title: after.title,
          createdAt: after.createdAt, folderPath: after.folderPath ?? [],
          readingList: after.readingList === true,
          ...(after.nodeId ? { nodeId: after.nodeId } : {}) } } });
      return { saved: true, stepId };
    } catch (error) {
      this.repo.saveStep({ ...base, outcome: { ...base.outcome, durationMs: Date.now() - startedAt,
        detail: error instanceof Error ? error.message : String(error) } });
      throw error;
    }
  }

  async undo(step: { after: Record<string, unknown> }): Promise<void> {
    const { url, title, createdAt, nodeId, folderPath, readingList } = step.after;
    if (typeof url !== "string" || typeof title !== "string" || typeof createdAt !== "number")
      throw new AuxError("conflict", "The bookmark has no safe undo record");
    const current = (await this.list()).filter(item => item.url === url &&
      (typeof nodeId === "string" ? item.nodeId === nodeId : item.createdAt === createdAt));
    if (current.length !== 1 || current[0]!.title !== title ||
      JSON.stringify(current[0]!.folderPath ?? []) !== JSON.stringify(folderPath) ||
      (current[0]!.readingList === true) !== readingList)
      throw new AuxError("conflict", "The bookmark changed since this run; review it before undoing");
    if (this.native?.available() && this.native.bookmarksInvoke)
      await this.native.bookmarksInvoke("bookmarks.remove", { url, nodeId,
        expected: { title, createdAt, folderPath, readingList } });
    else if (!this.repo.removeBookmarkIfUnchanged(url, title, createdAt,
      Array.isArray(folderPath) ? folderPath as string[] : [], readingList === true))
      throw new AuxError("conflict", "The bookmark changed since this run");
  }
}
