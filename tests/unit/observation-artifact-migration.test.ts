import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { afterEach, expect, it } from "vitest";
import { ArtifactStore, createRuntimeBackup, EventBus, openDb, Repo } from "@aux/runtime";
import { conversationSourceFromArtifact } from "../../apps/runtime/src/services/conversation-sources.js";
import { stageRuntimeRestore } from "../../apps/runtime/src/services/runtime-backup.js";
import { applyPendingRuntimeRestore } from "../../apps/desktop/main/runtime-restore.js";

const dirs: string[] = [];
afterEach(() => { for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true }); });
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
const oldBytes = Buffer.from(JSON.stringify(old));
const sha256 = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");

it("minimizes older run observations before making a portable backup", async () => {
  const dir = mkdtempSync(join(tmpdir(), "aux-old-observation-"));
  dirs.push(dir);
  const db = openDb(join(dir, "state.sqlite"));
  try {
    const repo = new Repo(db);
    const store = new ArtifactStore(join(dir, "artifacts"), repo, new EventBus(repo));
    repo.saveRun({ runId: "run-one", goal: "Read page", status: "completed", pageIds: ["page-one"], createdAt: 1 });
    const artifact = store.save({ runId: "run-one", pageId: "page-one", label: "observation-r1", mediaType: "application/json",
      buffer: oldBytes });
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

it("stages an older raw observation at a separate path and restores minimized source evidence", async () => {
  const dir = mkdtempSync(join(tmpdir(), "aux-old-restore-"));
  dirs.push(dir);
  const db = openDb(join(dir, "aux-state.sqlite"));
  const repo = new Repo(db);
  repo.saveRun({ runId: "run-one", goal: "Read page", status: "completed", pageIds: ["page-one"], createdAt: 1 });
  const artifact = new ArtifactStore(join(dir, "artifacts"), repo, new EventBus(repo)).save({
    runId: "run-one", pageId: "page-one", label: "observation-r1", mediaType: "application/json", buffer: oldBytes,
  });
  const backup = await createRuntimeBackup(repo, dir);
  const manifestPath = join(backup.path, "manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const originalRel = manifest.artifacts[0].relativePath as string;
  const backupArtifact = join(backup.path, "artifacts", originalRel);
  // Recreate a valid older backup and current profile that both retain the raw artifact.
  writeFileSync(backupArtifact, oldBytes);
  manifest.artifacts[0].bytes = oldBytes.length;
  manifest.artifacts[0].sha256 = sha256(oldBytes);
  const backupDbPath = join(backup.path, "state.sqlite");
  const backupDb = new DatabaseSync(backupDbPath);
  backupDb.prepare("UPDATE artifacts SET size=? WHERE artifact_id=?").run(oldBytes.length, artifact.artifactId);
  backupDb.close();
  manifest.database.bytes = statSync(backupDbPath).size;
  manifest.database.sha256 = sha256(readFileSync(backupDbPath));
  writeFileSync(manifestPath, JSON.stringify(manifest));
  writeFileSync(artifact.path, oldBytes);
  repo.db.prepare("UPDATE artifacts SET size=? WHERE artifact_id=?").run(oldBytes.length, artifact.artifactId);

  await stageRuntimeRestore(dir, backup.path);
  const marker = JSON.parse(readFileSync(join(dir, "pending-runtime-restore.json"), "utf8"));
  const stagedRel = marker.artifactFiles[0].relativePath as string;
  expect(stagedRel).not.toBe(originalRel);
  const stagedFile = join(dir, "pending-runtime-restore-artifacts", stagedRel);
  expect(readFileSync(stagedFile, "utf8")).not.toContain("private field value");
  const stagedDb = new DatabaseSync(join(dir, "pending-runtime-restore.sqlite"), { readOnly: true });
  expect(stagedDb.prepare("SELECT path,size FROM artifacts WHERE artifact_id=?").get(artifact.artifactId))
    .toEqual({ path: join(dir, "artifacts", stagedRel), size: statSync(stagedFile).size });
  stagedDb.close();

  db.close();
  applyPendingRuntimeRestore(dir);
  const restoredFile = join(dir, "artifacts", stagedRel);
  const restored = readFileSync(restoredFile, "utf8");
  expect(restored).not.toContain("private field value");
  expect(conversationSourceFromArtifact(artifact, restored)).toMatchObject({ url: "https://example.test/page", pageId: "page-one" });
  expect(readFileSync(artifact.path, "utf8")).toContain("private field value");
  expect(readFileSync(join(dir, "last-runtime-restore.json"), "utf8")).toContain("recoveryDirectory");
});
