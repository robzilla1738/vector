import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { afterEach, expect, it } from "vitest";
import { ArtifactStore, createRuntimeBackup, EventBus, openDb, Repo, TaskService } from "@aux/runtime";
import { deleteRuntimeBackup, listRuntimeBackups, stageRuntimeRestore } from "../../apps/runtime/src/services/runtime-backup.js";
import { applyPendingRuntimeRestore } from "../../apps/desktop/main/runtime-restore.js";

const cleanup: (() => void)[] = [];
afterEach(() => { for (const fn of cleanup.splice(0).reverse()) fn(); });

it("omits protected article content and grants from portable backups and strips them from older restores", async () => {
  const dir = mkdtempSync(join(tmpdir(), "aux-memory-backup-"));
  cleanup.push(() => rmSync(dir, { recursive: true, force: true }));
  const db = openDb(join(dir, "aux-state.sqlite"));
  let open = true;
  cleanup.push(() => { if (open) db.close(); });
  const repo = new Repo(db);
  const events = new EventBus(repo);
  const workspace = new TaskService(repo, new EventBus(repo)).createWorkspace("Research");
  const policyKey = `contentMemoryPolicy:${workspace.workspaceId}`;
  repo.setSetting(policyKey, { enabled: true, retentionDays: 30, allowedOrigins: ["https://example.com"] });
  const add = (target: DatabaseSync) => target.prepare(`INSERT INTO content_memory
    (memory_id,profile_id,workspace_id,source_key,origin,captured_at,expires_at,ciphertext)
    VALUES (?,?,?,?,?,?,?,?)`).run("memory-one", "profile-one", workspace.workspaceId, "source-one", "https://example.com", 1, 2, "v1:opaque-test");
  add(db);
  repo.saveRun({ runId: "run-memory", goal: "Use saved article", status: "completed", pageIds: [], createdAt: 1,
    config: { contextWorkspaceId: workspace.workspaceId, contextMemoryIds: ["memory-one"] },
    result: { answer: "Derived private answer" } });
  const report = new ArtifactStore(join(dir, "artifacts"), repo, events).save({ runId: "run-memory", label: "report.md",
    mediaType: "text/markdown", buffer: Buffer.from("Derived private report") });
  const backup = await createRuntimeBackup(repo, dir);
  const backupPath = join(backup.path, "state.sqlite");
  const saved = new DatabaseSync(backupPath);
  expect(saved.prepare("SELECT count(*) AS count FROM content_memory").get()).toEqual({ count: 0 });
  expect(saved.prepare("SELECT 1 FROM kv WHERE key=?").get(`setting:${policyKey}`)).toBeUndefined();
  expect(saved.prepare("SELECT result,status FROM runs WHERE run_id='run-memory'").get()).toEqual({ result: null, status: "cancelled" });
  expect(saved.prepare("SELECT 1 FROM artifacts WHERE artifact_id=?").get(report.artifactId)).toBeUndefined();
  expect(JSON.parse(readFileSync(join(backup.path, "manifest.json"), "utf8")).artifacts).toEqual([]);
  // Simulate a valid older portable backup that carried protected rows.
  add(saved);
  saved.exec("CREATE TABLE observations(observation_id TEXT PRIMARY KEY,json TEXT NOT NULL); INSERT INTO observations VALUES('legacy','ordinary private page text')");
  saved.prepare("UPDATE runs SET result=?,status='completed' WHERE run_id='run-memory'").run(JSON.stringify({ answer: "Derived private answer" }));
  saved.prepare("INSERT INTO kv(key,value) VALUES(?,?)").run(`setting:${policyKey}`, JSON.stringify({ enabled: true, retentionDays: 30, allowedOrigins: ["https://example.com"] }));
  saved.close();
  const manifestPath = join(backup.path, "manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const bytes = readFileSync(backupPath);
  manifest.database.bytes = statSync(backupPath).size;
  manifest.database.sha256 = createHash("sha256").update(bytes).digest("hex");
  writeFileSync(manifestPath, JSON.stringify(manifest));
  await stageRuntimeRestore(dir, backup.path);
  const staged = new DatabaseSync(join(dir, "pending-runtime-restore.sqlite"), { readOnly: true });
  try {
    expect(staged.prepare("SELECT count(*) AS count FROM content_memory").get()).toEqual({ count: 0 });
    expect(staged.prepare("SELECT name FROM sqlite_schema WHERE name='observations'").get()).toBeUndefined();
    expect(staged.prepare("SELECT 1 FROM kv WHERE key=?").get(`setting:${policyKey}`)).toBeUndefined();
    expect(staged.prepare("SELECT result,status FROM runs WHERE run_id='run-memory'").get()).toEqual({ result: null, status: "cancelled" });
    expect(db.prepare("SELECT count(*) AS count FROM content_memory").get()).toEqual({ count: 1 });
  } finally { staged.close(); }
  db.close(); open = false;
  applyPendingRuntimeRestore(dir);
  const last = JSON.parse(readFileSync(join(dir, "last-runtime-restore.json"), "utf8"));
  const recovery = new DatabaseSync(join(last.recoveryDirectory, "state.sqlite"), { readOnly: true });
  try {
    expect(recovery.prepare("SELECT count(*) AS count FROM content_memory").get()).toEqual({ count: 0 });
    expect(recovery.prepare("SELECT name FROM sqlite_schema WHERE name='observations'").get()).toBeUndefined();
    expect(recovery.prepare("SELECT 1 FROM kv WHERE key=?").get(`setting:${policyKey}`)).toBeUndefined();
    expect(recovery.prepare("SELECT result,status FROM runs WHERE run_id='run-memory'").get()).toEqual({ result: null, status: "cancelled" });
  } finally { recovery.close(); }
  await expect(deleteRuntimeBackup(dir, "../outside", manifest.database.sha256)).rejects.toThrow(/listed Aux backup/);
  await expect(deleteRuntimeBackup(dir, backup.path.split("/").at(-1)!, "0".repeat(64))).rejects.toThrow(/changed|no longer available/);
  expect(await deleteRuntimeBackup(dir, backup.path.split("/").at(-1)!, manifest.database.sha256)).toEqual({ deleted: true });
  expect(await listRuntimeBackups(dir)).toEqual([]);
});
