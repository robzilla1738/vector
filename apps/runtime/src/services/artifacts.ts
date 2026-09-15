import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { EventTypes, newArtifactId, type Artifact } from "@vector/contracts";
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
  constructor(
    private dir: string,
    private repo: Repo,
    private events: EventBus,
  ) {}

  private place(opts: ArtifactInput): { artifact: Artifact; dir: string } {
    const artifactId = newArtifactId();
    const group = opts.subdir ?? opts.runId ?? opts.pageId ?? "misc";
    const dir = join(this.dir, group);
    const safe = opts.label.replace(/[^A-Za-z0-9._-]+/g, "-").slice(0, 60) || "file";
    const ext = opts.mediaType === "image/png" ? ".png" : opts.mediaType.includes("json") ? ".json" : "";
    const filename = `${artifactId}-${safe}${ext}`;
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

  save(opts: ArtifactInput): Artifact {
    const { artifact, dir } = this.place(opts);
    mkdirSync(dir, { recursive: true });
    writeFileSync(artifact.path, opts.buffer);
    this.repo.saveArtifact(artifact);
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

  list(filter: { runId?: string; pageId?: string }): Artifact[] {
    return this.repo.listArtifacts(filter);
  }

  read(artifactId: string): { artifact: Artifact; dataBase64: string } {
    const artifact = this.repo.getArtifact(artifactId);
    if (!artifact) throw new Error(`no artifact ${artifactId}`);
    const data = readFileSync(artifact.path);
    return { artifact, dataBase64: data.toString("base64") };
  }

  static sha1(b: Buffer) {
    return createHash("sha1").update(b).digest("hex");
  }
}
