import { createHash } from "node:crypto";
import { ArtifactExports } from "./artifact-exports.js";
import { constants, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { mkdir, open, writeFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { AuxError, EventTypes, newArtifactId, type Artifact } from "@aux/contracts";
import {
  ARTIFACT_TEXT_PAGE_BYTES,
  ArtifactTextInputSchema,
  ArtifactTextResultSchema,
  type ArtifactTextInput,
  type ArtifactTextResult,
} from "@aux/contracts/artifact-text";
import { isTextResult, isTextResultContent, resultFilename } from "./text-result.js";
import type { EventBus } from "../events.js";
import type { Repo } from "../store/repo.js";

export interface ArtifactInput {
  runId?: string;
  pageId?: string;
  label: string;
  buffer: Buffer;
  mediaType: string;
  subdir?: string;
}

/** Files live on disk under artifacts/<run-or-page>/; SQLite keeps refs. */
export class ArtifactStore {
  readonly exports: ArtifactExports;
  constructor(
    private dir: string,
    private repo: Repo,
    private events: EventBus,
  ) {
    this.exports = new ArtifactExports(dir);
  }

  private place(opts: ArtifactInput): { artifact: Artifact; dir: string } {
    const artifactId = newArtifactId();
    const group = opts.subdir ?? opts.runId ?? opts.pageId ?? "misc";
    const dir = join(this.dir, group);
    const safe = opts.label.replace(/[^A-Za-z0-9._-]+/g, "-").slice(0, 60) || "file";
    const ext =
      opts.mediaType === "image/png"
        ? ".png"
        : opts.mediaType === "image/jpeg"
          ? ".jpg"
          : opts.mediaType === "image/webp"
            ? ".webp"
            : opts.mediaType.includes("json")
              ? ".json"
              : "";
    const filename = `${artifactId}-${safe}${ext && !safe.toLowerCase().endsWith(ext) ? ext : ""}`;
    return {
      dir,
      artifact: {
        artifactId,
        runId: opts.runId,
        pageId: opts.pageId,
        path: join(dir, filename),
        mediaType: opts.mediaType,
        size: opts.buffer.length,
        status: "complete",
        createdAt: Date.now(),
      },
    };
  }

  save(opts: ArtifactInput, onSaved?: (artifact: Artifact) => void): Artifact {
    const { artifact, dir } = this.place(opts);
    mkdirSync(dir, { recursive: true });
    writeFileSync(artifact.path, opts.buffer);
    try {
      this.repo.transaction(() => {
        this.repo.saveArtifact(artifact);
        onSaved?.(artifact);
      });
    } catch (error) {
      rmSync(artifact.path, { force: true });
      throw error;
    }
    this.events.emit(EventTypes.ArtifactAdded, { artifact }, opts.runId);
    return artifact;
  }

  /**
   * Batched, asynchronous variant for high-volume capture (response bodies):
   * files are written off the runtime's critical path with fs.promises, rows
   * land in one transaction, and NO per-artifact event is emitted — the
   * caller announces the batch. Items whose write failed are omitted.
   */
  async saveMany(items: ArtifactInput[]): Promise<(Artifact | undefined)[]> {
    if (!items.length) return [];
    const placed = items.map((it) => this.place(it));
    await Promise.all([...new Set(placed.map((p) => p.dir))].map((d) => mkdir(d, { recursive: true })));
    const written = await Promise.all(
      placed.map((p, i) =>
        writeFile(p.artifact.path, items[i]!.buffer)
          .then(() => p.artifact)
          .catch(() => undefined),
      ),
    );
    this.repo.transaction(() => {
      for (const a of written) if (a) this.repo.saveArtifact(a);
    });
    return written;
  }

  /** Writes every file before committing any row; a failed batch leaves no partial files. */
  async saveManyStrict(items: ArtifactInput[], beforeCommit?: () => void): Promise<Artifact[]> {
    if (!items.length) return [];
    const placed = items.map((item) => this.place(item));
    await Promise.all(
      [...new Set(placed.map((item) => item.dir))].map((dir) => mkdir(dir, { recursive: true })),
    );
    try {
      const writes = await Promise.allSettled(
        placed.map((item, index) => writeFile(item.artifact.path, items[index]!.buffer)),
      );
      const failed = writes.find((result) => result.status === "rejected");
      if (failed?.status === "rejected") throw failed.reason;
      beforeCommit?.();
      this.repo.transaction(() => {
        for (const item of placed) this.repo.saveArtifact(item.artifact);
      });
    } catch (error) {
      for (const item of placed) rmSync(item.artifact.path, { force: true });
      throw error;
    }
    for (const item of placed)
      this.events.emit(EventTypes.ArtifactAdded, { artifact: item.artifact }, item.artifact.runId);
    return placed.map((item) => item.artifact);
  }

  list(filter: { runId?: string; pageId?: string }): Artifact[] {
    return this.repo.listArtifacts(filter);
  }

  read(artifactId: string): { artifact: Artifact; dataBase64: string } {
    const artifact = this.repo.getArtifact(artifactId);
    if (!artifact) throw new Error(`no artifact ${artifactId}`);
    const data = readFileSync(artifact.path);
    return { artifact, dataBase64: data.toString("base64") };
  }

  /** Bounded text bytes from this captured run only, checked again before publication. */
  async readText(
    raw: ArtifactTextInput,
    owner: { runId: string; signal: AbortSignal; checkCurrent(): void },
  ): Promise<ArtifactTextResult> {
    const input = ArtifactTextInputSchema.parse(raw);
    const checkOwner = () => {
      owner.signal.throwIfAborted();
      owner.checkCurrent();
      const run = this.repo.getRun(owner.runId);
      if (!run || run.status !== "running" || run.config?.contextMemoryRevoked)
        throw new AuxError("permission_denied", "The original artifact run is no longer eligible.");
    };
    checkOwner();
    const artifact = this.repo.getArtifact(input.artifactId);
    if (
      !artifact ||
      artifact.runId !== owner.runId ||
      !Number.isSafeInteger(artifact.size) ||
      artifact.size < 0 ||
      !isTextResult(artifact)
    )
      throw new AuxError("permission_denied", "Choose a completed text artifact admitted to this run.");
    const within = relative(resolve(this.dir), resolve(artifact.path));
    if (!within || within.startsWith("..") || within.includes("../") || within.includes("..\\"))
      throw new AuxError("permission_denied", "The text artifact is outside its original store.");
    const identity = JSON.stringify(artifact);
    const artifactVersion = createHash("sha256").update(identity).digest("hex");
    const check = () => {
      checkOwner();
      if (JSON.stringify(this.repo.getArtifact(input.artifactId)) !== identity)
        throw new AuxError("ref_stale", "The original text artifact was removed or replaced.");
    };
    check();
    if (input.cursor && input.cursor.artifactVersion !== artifactVersion)
      throw new AuxError("ref_stale", "The text artifact changed since the previous page.");
    // Non-blocking, no-follow open refuses substituted symlinks and cannot wait on a FIFO.
    const file = await open(
      artifact.path,
      constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK,
    ).catch(() => {
      throw new AuxError("ref_stale", "The original text artifact is unavailable.");
    });
    const bytes = Buffer.alloc(artifact.size);
    try {
      check();
      const before = await file.stat();
      if (!before.isFile() || before.size !== bytes.length)
        throw new AuxError("ref_stale", "The original text artifact size changed.");
      let readOffset = 0;
      while (readOffset < bytes.length) {
        check();
        const read = await file.read(
          bytes,
          readOffset,
          Math.min(64 * 1024, bytes.length - readOffset),
          readOffset,
        );
        if (!read.bytesRead) throw new AuxError("ref_stale", "The original text artifact is incomplete.");
        readOffset += read.bytesRead;
      }
      const after = await file.stat();
      if (after.size !== before.size || after.mtimeMs !== before.mtimeMs || after.ctimeMs !== before.ctimeMs)
        throw new AuxError("ref_stale", "The original text artifact changed during its read.");
      check();
      let content: string;
      try {
        content = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
      } catch {
        throw new AuxError("invalid_params", "The artifact is not valid UTF-8 text.");
      }
      if (
        !isTextResultContent(artifact.mediaType, content) ||
        /[\u0001-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(content)
      )
        throw new AuxError(
          "invalid_params",
          "Binary or internal observation artifacts are not text results.",
        );
      const sha256 = createHash("sha256").update(bytes).digest("hex");
      if (input.cursor && input.cursor.sha256 !== sha256)
        throw new AuxError("ref_stale", "The text artifact bytes changed since the previous page.");
      const offset = input.cursor?.offset ?? 0;
      if (offset > bytes.length || (offset < bytes.length && (bytes[offset]! & 0xc0) === 0x80))
        throw new AuxError("invalid_params", "The text cursor must identify a UTF-8 character boundary.");
      let end = Math.min(bytes.length, offset + (input.maxBytes ?? ARTIFACT_TEXT_PAGE_BYTES));
      while (end < bytes.length && (bytes[end]! & 0xc0) === 0x80) end--;
      const result = ArtifactTextResultSchema.parse({
        source: "untrusted_artifact",
        artifact: {
          artifactId: artifact.artifactId,
          filename: resultFilename(artifact.artifactId, artifact.path),
          mediaType: artifact.mediaType,
          size: artifact.size,
          status: artifact.status,
        },
        sha256,
        offset,
        content: new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(
          bytes.subarray(offset, end),
        ),
        ...(end < bytes.length ? { nextCursor: { offset: end, sha256, artifactVersion } } : {}),
        eof: end === bytes.length,
      });
      check();
      return result;
    } catch (error) {
      if (error instanceof AuxError || owner.signal.aborted) throw error;
      throw new AuxError("ref_stale", "The original text artifact could not be read.");
    } finally {
      bytes.fill(0);
      await file.close();
      check();
    }
  }

  removeFiles(paths: string[]): void {
    const root = resolve(this.dir);
    for (const path of paths) {
      const target = resolve(path);
      const within = relative(root, target);
      if (!within || within.startsWith("..") || within.includes("../") || within.includes("..\\")) continue;
      rmSync(target, { force: true });
    }
  }

  static sha1(b: Buffer) {
    return createHash("sha1").update(b).digest("hex");
  }
}
