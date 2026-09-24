import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { afterEach, expect, it } from "vitest";
import { ArtifactStore, createRuntimeBackup, EventBus, openDb, Repo } from "@aux/runtime";
import { conversationSourceFromArtifact } from "../../apps/runtime/src/services/conversation-sources.js";

const dirs: string[] = [];
afterEach(() => { for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true }); });

it("minimizes older run observations before making a portable backup", async () => {
  const dir = mkdtempSync(join(tmpdir(), "aux-old-observation-"));
  dirs.push(dir);
  const db = openDb(join(dir, "state.sqlite"));
  try {
    const repo = new Repo(db);
    const store = new ArtifactStore(join(dir, "artifacts"), repo, new EventBus(repo));
    repo.saveRun({ runId: "run-one", goal: "Read page", status: "completed", pageIds: ["page-one"], createdAt: 1 });
    const old = {
      observationId: "obs-one", pageId: "page-one", documentEpoch: 2, revision: 1, observedAt: 3, scope: "full",
      content: {
        url: "https://example.test/page", title: "Source", viewport: { width: 800, height: 600, scale: 1 },
        scroll: { x: 0, y: 0, maxY: 0 }, frames: [], text: "Cited public prose", headings: [],
        elements: [{ ref: "r1", frame: "main", tag: "input", name: "Secret", value: "private field value", selector: { css: "#secret-field" } }],
        formFields: [{ ref: "r1", label: "Secret", value: "private field value" }], tables: [], links: [], dialogs: [],
        truncated: false, stats: { elementsTotal: 1, elementsShown: 1, textChars: 18, approxTokens: 4 },
      },
    };
    const artifact = store.save({ runId: "run-one", pageId: "page-one", label: "observation-r1", mediaType: "application/json",
      buffer: Buffer.from(JSON.stringify(old)) });
    const backup = await createRuntimeBackup(repo, dir);
    const copied = join(backup.path, "artifacts", "run-one", basename(artifact.path));
    for (const path of [artifact.path, copied]) {
      const saved = readFileSync(path, "utf8");
      expect(saved).toContain("Cited public prose");
      expect(saved).not.toContain("private field value");
      expect(saved).not.toContain("secret-field");
      expect(conversationSourceFromArtifact(artifact, saved)).toMatchObject({ pageId: "page-one", url: "https://example.test/page", documentEpoch: 2 });
    }
    expect(repo.getArtifact(artifact.artifactId)?.size).toBe(readFileSync(artifact.path).length);
  } finally { db.close(); }
});
