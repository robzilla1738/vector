import { createHash } from "node:crypto";
import { mkdir, open, rm } from "node:fs/promises";
import { statSync } from "node:fs";
import { join } from "node:path";
import { AuxError, newArtifactId, type Artifact } from "@aux/contracts";
import type { TaskReceiptExportResult } from "@aux/contracts/task-receipt-export";

type Prepared = Extract<TaskReceiptExportResult, { status: "prepared" }>;
type ActiveExport = {
  controller: AbortController;
  operation: Promise<Prepared>;
  artifact?: Artifact;
  sha256?: string;
  claimId?: string;
  expiresAt?: number;
  timer?: ReturnType<typeof setTimeout>;
  cleanup?: Promise<void>;
  retired: boolean;
  checkCurrent(): void;
};
type ExportOwner = { token: string; active?: ActiveExport };

/** Temporary exports are deliberately absent from durable artifact rows and their public APIs. */
export class ArtifactExports {
  private readonly directory: string;
  private readonly owners = new Map<string, ExportOwner>();
  private readonly artifacts = new Map<string, ExportOwner>();
  private ready?: Promise<void>;
  private closing?: Promise<void>;
  private closed = false;
  private cleanupFailures: unknown[] = [];

  constructor(artifactsDirectory: string) {
    this.directory = join(artifactsDirectory, "private.exports");
  }

  /** Called once at runtime startup; interrupted plaintext exports are never recovered. */
  initialize(): Promise<void> {
    return (this.ready ??= rm(this.directory, { recursive: true, force: true }).then(() =>
      mkdir(this.directory, { recursive: true, mode: 0o700 }).then(() => undefined),
    ));
  }

  prepare(input: {
    exportId: string;
    token: string;
    filename: string;
    signal: AbortSignal;
    chunks(signal: AbortSignal): AsyncIterable<string>;
    checkCurrent(): void;
    checkComplete(): void;
  }): Promise<Prepared> {
    if (this.closed) throw new AuxError("cancelled", "Receipt export is closed.");
    const prior = this.owners.get(input.exportId);
    if (prior) {
      this.checkOwner(prior, input.token);
      throw new AuxError(
        prior.active ? "conflict" : "cancelled",
        "This receipt export already finished or was retired.",
      );
    }
    const owner: ExportOwner = { token: input.token };
    const controller = new AbortController();
    const signal = AbortSignal.any([controller.signal, input.signal]);
    const artifactId = newArtifactId();
    const path = join(this.directory, `${artifactId}.md`);
    const check = () => {
      if (this.closed || signal.aborted) throw new AuxError("cancelled", "Receipt export was cancelled.");
      input.checkCurrent();
    };
    const operation = Promise.resolve().then(async () => {
      try {
        await this.initialize();
        check();
        const file = await open(path, "wx", 0o600);
        let size = 0;
        const hash = createHash("sha256");
        try {
          for await (const chunk of input.chunks(signal)) {
            check();
            const bytes = Buffer.from(chunk);
            await file.writeFile(bytes);
            check();
            size += bytes.length;
            hash.update(bytes);
          }
        } finally {
          await file.close();
        }
        check();
        input.checkComplete();
        const sha256 = hash.digest("hex");
        active.artifact = {
          artifactId,
          path,
          size,
          mediaType: "text/markdown",
          status: "complete",
          createdAt: Date.now(),
        };
        active.sha256 = sha256;
        this.artifacts.set(artifactId, owner);
        const expiresAt = Date.now() + 5 * 60_000;
        active.expiresAt = expiresAt;
        active.timer = setTimeout(() => {
          void this.retire(input.exportId, input.token).catch((error: unknown) =>
            this.cleanupFailures.push(error),
          );
        }, expiresAt - Date.now());
        active.timer.unref();
        return {
          status: "prepared" as const,
          exportId: input.exportId,
          artifactId,
          filename: input.filename,
          byteLength: size,
          sha256,
          expiresAt,
        };
      } catch (error) {
        try {
          await rm(path, { force: true });
        } finally {
          if (owner.active === active) owner.active = undefined;
        }
        throw error;
      }
    });
    const active: ActiveExport = { controller, operation, retired: false, checkCurrent: input.checkComplete };
    owner.active = active;
    this.owners.set(input.exportId, owner);
    return operation;
  }

  /** An authenticated native call claims the path before opening its own read-only descriptor. */
  claim(input: { artifactId: string; token: string; claimId: string }) {
    const owner = this.artifacts.get(input.artifactId);
    if (!owner) return undefined;
    this.checkOwner(owner, input.token);
    const active = owner.active;
    if (
      this.closed ||
      !active?.artifact ||
      active.retired ||
      (!active.claimId && Date.now() >= active.expiresAt!)
    )
      throw new AuxError("ref_stale", "The prepared receipt was retired. Export it again.");
    if (active.claimId && active.claimId !== input.claimId)
      throw new AuxError("conflict", "This receipt is already being saved.");
    active.checkCurrent();
    const artifact = active.artifact;
    const info = statSync(artifact.path);
    if (!info.isFile() || info.size !== artifact.size)
      throw new AuxError("ref_stale", "The prepared receipt changed. Export it again.");
    active.claimId = input.claimId;
    clearTimeout(active.timer);
    return { path: artifact.path, size: artifact.size, sha256: active.sha256!, claimId: input.claimId };
  }

  async release(input: { artifactId: string; token: string; claimId: string }): Promise<{ ok: true }> {
    const owner = this.artifacts.get(input.artifactId);
    if (!owner) return { ok: true };
    this.checkOwner(owner, input.token);
    const active = owner.active;
    if (!active) return { ok: true };
    if (active.claimId !== input.claimId)
      throw new AuxError("permission_denied", "This native save does not own the receipt export.");
    await this.remove(owner, active);
    return { ok: true };
  }

  async retire(exportId: string, token: string): Promise<void> {
    const owner = this.owners.get(exportId);
    if (!owner) {
      this.owners.set(exportId, { token });
      return;
    }
    this.checkOwner(owner, token);
    const active = owner.active;
    if (!active) return;
    active.retired = true;
    active.controller.abort();
    clearTimeout(active.timer);
    await Promise.allSettled([active.operation]);
    // An accepted native chooser/copy owns the file until its exact release ACK.
    if (!active.claimId) await this.remove(owner, active);
  }

  close(): Promise<void> {
    if (this.closing) return this.closing;
    this.closed = true;
    const active = [...this.owners.values()].flatMap((owner) => (owner.active ? [owner.active] : []));
    for (const entry of active) {
      entry.controller.abort();
      clearTimeout(entry.timer);
    }
    this.closing = Promise.allSettled([
      this.ready,
      ...active.flatMap((entry) => [entry.operation, entry.cleanup]),
    ]).then(async () => {
      // Native holds an open FD for accepted saves, so unlinking cannot break its pending copy.
      await rm(this.directory, { recursive: true, force: true });
      this.artifacts.clear();
      this.owners.clear();
      if (this.cleanupFailures.length)
        throw new AggregateError(this.cleanupFailures, "Temporary receipt exports could not be removed.");
    });
    return this.closing;
  }

  private checkOwner(owner: ExportOwner, token: string) {
    if (owner.token !== token)
      throw new AuxError("permission_denied", "Use the original Aux window to save this receipt.");
  }

  private remove(owner: ExportOwner, active: ActiveExport): Promise<void> {
    return (active.cleanup ??= (async () => {
      clearTimeout(active.timer);
      active.retired = true;
      active.controller.abort();
      if (active.artifact) {
        await rm(active.artifact.path, { force: true });
        this.artifacts.delete(active.artifact.artifactId);
      }
      if (owner.active === active) owner.active = undefined;
    })());
  }
}
