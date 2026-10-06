import { createHash, randomUUID } from "node:crypto";
import { createReadStream, lstatSync, realpathSync } from "node:fs";
import { lstat, mkdir, rename } from "node:fs/promises";
import { homedir, platform } from "node:os";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";
import { AuxError, type StepRecord } from "@aux/contracts";
import { PageClaimStore } from "../agent/durable.js";
import type { Repo } from "../store/repo.js";

type DownloadEvent = {
  id: string;
  sourceUrl?: string;
  filename: string;
  path: string;
  state?: string;
  size: number;
  startedAt: number;
  endedAt?: number;
};

const MAX_UNDO_BYTES = 64 * 1024 * 1024;

/** A native download is attributed only while one live run has claimed its tab. */
export class BrowserDownloadLedger {
  private claims: PageClaimStore;
  constructor(
    private repo: Repo,
    private downloadsDir?: string,
    private trashDir?: string,
  ) {
    this.claims = new PageClaimStore(repo.db);
  }

  started(pageId: string | undefined, info: DownloadEvent, controller?: string, downloadRoot?: string): void {
    if (!pageId || controller !== "agent" || this.repo.downloadStep(info.id)) return;
    const activeClaims = this.repo.db
      .prepare("SELECT COUNT(*) AS count FROM page_claims WHERE page_id=? AND status='active'")
      .get(pageId) as { count: number };
    if (activeClaims.count !== 1) return;
    const claim = this.claims.activeForPage(pageId);
    const run = claim && this.repo.getRun(claim.runId);
    if (
      !run ||
      run.status !== "running" ||
      !run.config?.taskId ||
      !run.config.taskRevision ||
      claim.createdAt > info.startedAt ||
      (run.startedAt ?? run.createdAt) > info.startedAt
    )
      return;
    let absent = false;
    const root = downloadRoot ?? this.downloadsDir;
    if (this.managedPath(info.path, root)) {
      try {
        lstatSync(info.path);
      } catch (error) {
        absent = (error as NodeJS.ErrnoException).code === "ENOENT";
      }
    }
    const stepId = randomUUID();
    this.repo.saveStep({
      stepId,
      runId: run.runId,
      pageId,
      op: "download",
      startedAt: info.startedAt,
      inputs: { downloadId: info.id, sourceUrl: info.sourceUrl, filename: info.filename },
      outcome: {
        stepId,
        op: "download",
        status: "failed",
        startedAt: info.startedAt,
        durationMs: 0,
        effect: "dispatched",
        before: absent ? { existed: false, path: info.path, root } : {},
        after: { state: "started", filename: info.filename },
      },
    });
  }

  async finished(info: DownloadEvent): Promise<void> {
    const step = this.repo.downloadStep(info.id);
    if (!step?.outcome || step.outcome.undoneAt) return;
    const completed = info.state === "completed";
    let fingerprint: Record<string, unknown> = {};
    if (
      completed &&
      step.outcome.before?.existed === false &&
      step.outcome.before.path === info.path &&
      this.managedPath(info.path, step.outcome.before.root as string | undefined)
    ) {
      try {
        fingerprint = await this.fingerprint(info.path, step.outcome.before.root as string | undefined);
      } catch {
        /* A completed download remains visible, without cleanup authority. */
      }
    }
    const after = {
      downloadId: info.id,
      state: info.state ?? "interrupted",
      filename: info.filename,
      path: info.path,
      size: info.size,
      ...fingerprint,
    };
    this.repo.saveStep({
      ...step,
      outcome: {
        ...step.outcome,
        status: completed ? "ok" : "failed",
        effect: completed ? "observed" : "uncertain",
        durationMs: Math.max(0, (info.endedAt ?? Date.now()) - step.startedAt),
        after,
      },
    });
  }

  async undo(step: StepRecord): Promise<void> {
    const before = step.outcome?.before,
      after = step.outcome?.after;
    if (
      step.op !== "download" ||
      step.outcome?.status !== "ok" ||
      before?.existed !== false ||
      typeof after?.path !== "string" ||
      typeof after.sha256 !== "string" ||
      typeof after.size !== "number" ||
      typeof after.mtimeMs !== "number" ||
      typeof after.dev !== "number" ||
      typeof after.ino !== "number" ||
      before.path !== after.path ||
      !this.managedPath(after.path, before.root as string | undefined)
    )
      throw new AuxError("conflict", "This download has no safe cleanup record");
    if (platform() !== "darwin" && !this.trashDir)
      throw new AuxError("backend_unavailable", "Recoverable download cleanup requires macOS Trash");
    const trash = this.trashDir ?? join(homedir(), ".Trash");
    await mkdir(trash, { recursive: true, mode: 0o700 });
    const destination = join(trash, `${basename(after.path)}.aux-${step.stepId}`);
    const pending = after.cleanupDestination;
    if (pending && pending !== destination)
      throw new AuxError("conflict", "The download cleanup destination changed");
    let sourcePresent = true;
    try {
      await lstat(after.path);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      sourcePresent = false;
    }
    if (!sourcePresent && pending === destination) {
      const moved = await this.fingerprintAt(destination);
      if (this.sameFile(moved, after)) return;
    }
    if (!sourcePresent) throw new AuxError("conflict", "The downloaded file is missing");
    const current = await this.fingerprint(after.path, before.root as string | undefined);
    if (!this.sameFile(current, after))
      throw new AuxError("conflict", "The downloaded file changed; review it before cleanup");
    try {
      await lstat(destination);
      throw new AuxError("conflict", "A Trash item already has this cleanup identity");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    this.repo.saveStep({
      ...step,
      outcome: { ...step.outcome!, after: { ...after, cleanupDestination: destination } },
    });
    await rename(after.path, destination);
  }

  private managedPath(path: string, rootPath = this.downloadsDir): boolean {
    if (!rootPath || !path || !isAbsolute(path)) return false;
    try {
      const root = realpathSync(rootPath);
      const parent = realpathSync(dirname(path));
      const within = relative(root, parent);
      return (
        within !== ".." &&
        !within.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`) &&
        !isAbsolute(within) &&
        resolve(path) !== root
      );
    } catch {
      return false;
    }
  }

  private async fingerprint(path: string, root?: string): Promise<Record<string, number | string>> {
    if (!this.managedPath(path, root)) throw new AuxError("conflict", "Download left the selected folder");
    return this.fingerprintAt(path);
  }

  private sameFile(actual: Record<string, unknown>, expected: Record<string, unknown>): boolean {
    return (
      actual.sha256 === expected.sha256 &&
      actual.size === expected.size &&
      actual.mtimeMs === expected.mtimeMs &&
      actual.dev === expected.dev &&
      actual.ino === expected.ino
    );
  }

  private async fingerprintAt(path: string): Promise<Record<string, number | string>> {
    const first = await lstat(path);
    if (!first.isFile() || first.isSymbolicLink() || first.size > MAX_UNDO_BYTES)
      throw new AuxError("conflict", "Download cannot be cleaned up automatically");
    const digest = createHash("sha256");
    for await (const chunk of createReadStream(path, { end: Math.max(0, first.size - 1) }))
      digest.update(chunk);
    const second = await lstat(path);
    if (
      first.dev !== second.dev ||
      first.ino !== second.ino ||
      first.size !== second.size ||
      first.mtimeMs !== second.mtimeMs ||
      realpathSync(path) !== join(realpathSync(dirname(path)), basename(path))
    )
      throw new AuxError("conflict", "Download changed during verification");
    return {
      sha256: digest.digest("hex"),
      size: first.size,
      mtimeMs: first.mtimeMs,
      dev: first.dev,
      ino: first.ino,
    };
  }
}
