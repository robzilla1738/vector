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
    config: { contextWorkspaceId: workspace.workspaceId, contextMemoryIds: ["memory-one"], context: "Private article excerpt" },
    result: { answer: "Derived private answer" } });
  const report = new ArtifactStore(join(dir, "artifacts"), repo, events).save({ runId: "run-memory", label: "report.md",
    mediaType: "text/markdown", buffer: Buffer.from("Derived private report") });
  const edited={attachmentId:"edited",filename:"edited-report.md",content:"Private edited report",createdAt:2,included:true,sourceArtifactId:report.artifactId};
  const independent={attachmentId:"independent",filename:"note.md",content:"Human note",createdAt:2,included:true};
  repo.setSetting("conversationAttachments:run-memory",[edited,independent]);
  repo.saveRun({ runId: "run-followup", goal: "Follow up", status: "completed", pageIds: [], createdAt: 2,
    config: { contextRunIds: ["run-memory"], context: "Derived private answer" }, result: { answer: "Followup private answer" } });
  repo.saveRun({ runId: "run-citation", goal: "Cite report", status: "completed", pageIds: [], createdAt: 3,
    config: { contextArtifactIds: [report.artifactId], contextArtifactEvidence: "Derived private report" },
    result: { answer: "Cited private answer" } });
  repo.db.prepare(`INSERT INTO response_metadata(request_id,page_id,url,method,started_at,run_id)
    VALUES('protected-response','page','https://example.com/?answer=private','GET',1,'run-followup')`).run();
  db.prepare(`INSERT INTO operations(operation_id,site_key,name,created_at,updated_at) VALUES('op','app.test','read',1,1)`).run();
  db.prepare(`INSERT INTO operation_implementations(impl_id,operation_id,kind,executable,stats,created_at,updated_at)
    VALUES('impl','op','request','{}',?,1,1)`).run(JSON.stringify({ successInputs: ['{"private":"article answer"}'] }));
  repo.saveInvocation({ invocationId: "protected-invocation", operationId: "op", runId: "run-followup",
    status: "completed", effectOutcome: "verified", startedAt: 1,
    inputs: { taskId: "task-one", privateText: "article answer" }, error: "article answer" });
  db.prepare(`INSERT INTO run_messages(message_id,chat_id,target_run_id,delivery_run_id,mode,status,text,created_at,updated_at)
    VALUES('queued-memory','run-memory','run-memory','queued-delivery','queue','accepted','Continue',1,1)`).run();
  const backup = await createRuntimeBackup(repo, dir);
  const backupPath = join(backup.path, "state.sqlite");
  const saved = new DatabaseSync(backupPath);
  expect(saved.prepare("SELECT count(*) AS count FROM content_memory").get()).toEqual({ count: 0 });
  expect(saved.prepare("SELECT 1 FROM kv WHERE key=?").get(`setting:${policyKey}`)).toBeUndefined();
  expect(saved.prepare("SELECT result,status FROM runs WHERE run_id='run-memory'").get()).toEqual({ result: null, status: "cancelled" });
  for (const id of ["run-memory", "run-followup", "run-citation"]) {
    const row = saved.prepare("SELECT result,status,config FROM runs WHERE run_id=?").get(id) as { result: string | null; status: string; config: string };
    expect(row.result).toBeNull();
    expect(row.status).toBe("cancelled");
    expect(JSON.parse(row.config).context).toBeUndefined();
    expect(JSON.parse(row.config).contextArtifactEvidence).toBeUndefined();
  }
  expect(saved.prepare("SELECT 1 FROM artifacts WHERE artifact_id=?").get(report.artifactId)).toBeUndefined();
  expect(repo.getSetting(`conversationAttachments:run-memory`)).toEqual([edited,independent]);
  expect(JSON.parse((saved.prepare("SELECT value FROM kv WHERE key='setting:conversationAttachments:run-memory'").get() as {value:string}).value))
    .toEqual([independent]);
  expect(JSON.parse((saved.prepare("SELECT config FROM runs WHERE run_id='run-memory'").get() as { config: string }).config).revokedArtifactIds)
    .toContain(report.artifactId);
  expect(saved.prepare("SELECT 1 FROM response_metadata WHERE request_id='protected-response'").get()).toBeUndefined();
  expect((saved.prepare("SELECT stats FROM operation_implementations WHERE impl_id='impl'").get() as { stats: string }).stats)
    .not.toContain("article answer");
  expect(saved.prepare("SELECT inputs,error FROM operation_invocations WHERE invocation_id='protected-invocation'").get())
    .toEqual({ inputs: JSON.stringify({ taskId: "task-one" }), error: null });
  expect(saved.prepare("SELECT status FROM run_messages WHERE message_id='queued-memory'").get()).toEqual({ status: "cancelled" });
  expect(JSON.parse(readFileSync(join(backup.path, "manifest.json"), "utf8")).artifacts).toEqual([]);
  // Simulate a valid older portable backup that carried protected rows.
  add(saved);
  saved.exec("CREATE TABLE observations(observation_id TEXT PRIMARY KEY,json TEXT NOT NULL); INSERT INTO observations VALUES('legacy','ordinary private page text')");
  saved.prepare("UPDATE runs SET result=?,status='completed' WHERE run_id='run-memory'").run(JSON.stringify({ answer: "Derived private answer" }));
  saved.prepare("UPDATE runs SET result=?,status='completed',config=? WHERE run_id='run-followup'")
    .run(JSON.stringify({ answer: "Followup private answer" }), JSON.stringify({ contextRunIds: ["run-memory"], context: "Derived private answer" }));
  saved.prepare("UPDATE runs SET result=?,status='completed',config=? WHERE run_id='run-citation'")
    .run(JSON.stringify({ answer: "Cited private answer" }), JSON.stringify({ contextRunIds: ["run-followup"], contextArtifactEvidence: "Derived private report" }));
  saved.prepare(`INSERT INTO runs(run_id,goal,status,page_ids,config,result,created_at) VALUES(?,?,?,?,?,?,?)`)
    .run("run-late-citation", "Cite removed report", "completed", "[]",
      JSON.stringify({ contextArtifactIds: [report.artifactId], context: "Derived private report" }),
      JSON.stringify({ answer: "Late private answer" }), 4);
  saved.prepare(`INSERT INTO response_metadata(request_id,page_id,url,method,started_at,run_id)
    VALUES('legacy-protected-response','page','https://example.com/?answer=private','GET',1,'run-followup')`).run();
  saved.prepare("UPDATE operation_implementations SET stats=? WHERE impl_id='impl'")
    .run(JSON.stringify({ successInputs: ['{"private":"article answer"}'] }));
  saved.prepare("UPDATE operation_invocations SET inputs=?,error=? WHERE invocation_id='protected-invocation'")
    .run(JSON.stringify({ taskId: "task-one", privateText: "article answer" }), "article answer");
  saved.prepare("UPDATE run_messages SET status='accepted' WHERE message_id='queued-memory'").run();
  saved.prepare("INSERT INTO kv(key,value) VALUES(?,?)").run(`setting:${policyKey}`, JSON.stringify({ enabled: true, retentionDays: 30, allowedOrigins: ["https://example.com"] }));
  saved.prepare("UPDATE kv SET value=? WHERE key='setting:conversationAttachments:run-memory'")
    .run(JSON.stringify([edited,independent]));
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
    expect(JSON.parse((staged.prepare("SELECT value FROM kv WHERE key='setting:conversationAttachments:run-memory'").get() as {value:string}).value))
      .toEqual([independent]);
    expect(staged.prepare("SELECT result,status FROM runs WHERE run_id='run-memory'").get()).toEqual({ result: null, status: "cancelled" });
    expect(staged.prepare("SELECT result FROM runs WHERE run_id='run-followup'").get()).toEqual({ result: null });
    expect(staged.prepare("SELECT result FROM runs WHERE run_id='run-citation'").get()).toEqual({ result: null });
    expect(staged.prepare("SELECT result FROM runs WHERE run_id='run-late-citation'").get()).toEqual({ result: null });
    expect(staged.prepare("SELECT 1 FROM response_metadata WHERE request_id='legacy-protected-response'").get()).toBeUndefined();
    expect((staged.prepare("SELECT stats FROM operation_implementations WHERE impl_id='impl'").get() as { stats: string }).stats)
      .not.toContain("article answer");
    expect(staged.prepare("SELECT inputs,error FROM operation_invocations WHERE invocation_id='protected-invocation'").get())
      .toEqual({ inputs: JSON.stringify({ taskId: "task-one" }), error: null });
    expect(staged.prepare("SELECT status FROM run_messages WHERE message_id='queued-memory'").get()).toEqual({ status: "cancelled" });
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
