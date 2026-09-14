import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { EventTypes, newArtifactId, type Artifact } from "@vector/contracts";
import type { EventBus } from "../events.js";
import type { Repo } from "../store/repo.js";

/** Files live on disk under artifacts/<run-or-page>/; SQLite keeps refs. */
export class ArtifactStore {
  constructor(
    private dir: string,
    private repo: Repo,
    private events: EventBus,
  ) {}

  save(opts: {
    runId?: string;
    pageId?: string;
    label: string;
    buffer: Buffer;
    mediaType: string;
    subdir?: string;
  }): Artifact {
    const artifactId = newArtifactId();
    const group = opts.subdir ?? opts.runId ?? opts.pageId ?? "misc";
    const dir = join(this.dir, group);
    mkdirSync(dir, { recursive: true });
    const safe = opts.label.replace(/[^A-Za-z0-9._-]+/g, "-").slice(0, 60) || "file";
    const ext = opts.mediaType === "image/png" ? ".png" : opts.mediaType.includes("json") ? ".json" : "";
    const filename = `${artifactId}-${safe}${ext}`;
    const path = join(dir, filename);
    writeFileSync(path, opts.buffer);
    const artifact: Artifact = {
      artifactId,
      runId: opts.runId,
      pageId: opts.pageId,
      path,
      mediaType: opts.mediaType,
      size: opts.buffer.length,
      status: "complete",
      createdAt: Date.now(),
    };
    this.repo.saveArtifact(artifact);
    this.events.emit(EventTypes.ArtifactAdded, { artifact }, opts.runId);
    return artifact;
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
