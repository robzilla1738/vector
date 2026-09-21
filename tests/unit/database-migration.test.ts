import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, readdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { openDb, Repo, EventBus, TaskService } from "@vector/runtime";

const directories: string[] = [];
const connections: DatabaseSync[] = [];
function fixture() {
  const directory = mkdtempSync(join(tmpdir(), "aux-migration-"));
  directories.push(directory);
  return { directory, path: join(directory, "state.sqlite") };
}
function track(db: DatabaseSync) { connections.push(db); return db; }
function version(db: DatabaseSync) { return db.prepare("PRAGMA user_version").get()?.user_version; }
afterEach(() => {
  for (const db of connections.splice(0)) db.close();
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true });
});

describe("versioned database upgrades", () => {
  it("upgrades version 10 bookmarks without losing saved pages", () => {
    const { path } = fixture();
    const prior = openDb(path);
    new Repo(prior).addBookmark("https://kept.test/", "Kept");
    prior.exec("ALTER TABLE bookmarks DROP COLUMN folder_path; DROP TABLE bookmark_folders; PRAGMA user_version=10");
    prior.close();
    const upgraded = track(openDb(path));
    const repo = new Repo(upgraded);
    expect(version(upgraded)).toBe(11);
    expect(repo.listBookmarks()).toMatchObject([{ url: "https://kept.test/", title: "Kept" }]);
    expect(repo.bookmarkFolders()).toEqual([]);
    repo.addBookmark("https://new.test/", "New", ["Research"]);
    expect(repo.bookmarkFolders()).toEqual([["Research"]]);
  });

  it("merges legacy task runs into one durable task conversation", () => {
    const { path } = fixture();
    const prior = openDb(path);
    const repo = new Repo(prior), tasks = new TaskService(repo, new EventBus(repo));
    const workspace = tasks.createWorkspace("Continuity workspace");
    const task = tasks.create({ workspaceId: workspace.workspaceId, title: "Weekly research", objective: "Review the sources", criteria: [{ criterionId: "c", description: "Sources reviewed", verification: "manual" }] });
    tasks.archive(task.taskId, 1, true);
    prior.prepare("INSERT INTO runs(run_id,goal,status,page_ids,config,result,created_at) VALUES(?,?,?,?,?,?,?)")
      .run("task-turn-one", "First revision", "completed", "[]", JSON.stringify({ taskId: task.taskId, taskRevision: 1 }), JSON.stringify({ answer: "First result" }), 10);
    prior.prepare("INSERT INTO runs(run_id,goal,status,page_ids,config,result,created_at) VALUES(?,?,?,?,?,?,?)")
      .run("task-turn-two", "Second revision", "completed", "[]", JSON.stringify({ taskId: task.taskId, taskRevision: 1, chatId: "legacy-task-chat" }), JSON.stringify({ answer: "Second result" }), 20);
    prior.prepare("INSERT INTO conversations VALUES(?,?,?,?,?)").run("task-turn-one", "First revision", 1, 10, 10);
    prior.prepare("INSERT INTO conversations VALUES(?,?,?,?,?)").run("legacy-task-chat", "Legacy title", 0, 20, 25);
    prior.prepare("INSERT INTO kv VALUES(?,?)").run("setting:conversationContext:legacy-task-chat", JSON.stringify({ historyEnabled: false, excludedRunIds: ["task-turn-one"] }));
    prior.exec("PRAGMA user_version=8");
    prior.close();

    const upgraded = track(openDb(path));
    const next = new Repo(upgraded);
    const chatId = `task:${task.taskId}`;
    expect(version(upgraded)).toBe(11);
    expect(next.listRuns(10, { chatId }).map(run => run.runId).sort()).toEqual(["task-turn-one", "task-turn-two"]);
    expect(next.getConversation(chatId)).toMatchObject({ chatId, taskId: task.taskId, title: "Weekly research", turnCount: 2, archived: true });
    expect(next.getSetting(`conversationContext:${chatId}`)).toEqual({ historyEnabled: false, excludedRunIds: ["task-turn-one"] });
    expect(upgraded.prepare("SELECT count(*) AS n FROM conversations WHERE chat_id IN ('task-turn-one','legacy-task-chat')").get()?.n).toBe(0);
    expect(new TaskService(next, new EventBus(next)).get(task.taskId).title).toBe("Weekly research");
  });

  it("adds durable conversation metadata to version 7 and keeps existing turns", () => {
    const { path } = fixture();
    const prior = openDb(path);
    prior.exec("DROP TABLE conversations; PRAGMA user_version=7");
    prior.prepare("INSERT INTO runs(run_id,goal,status,page_ids,config,created_at) VALUES(?,?,?,?,?,?)")
      .run("turn-one", "Original chat title", "completed", "[]", JSON.stringify({ chatId: "chat-one" }), 10);
    prior.prepare("INSERT INTO runs(run_id,goal,status,page_ids,config,created_at) VALUES(?,?,?,?,?,?)")
      .run("turn-two", "Follow-up", "completed", "[]", JSON.stringify({ chatId: "chat-one" }), 20);
    prior.close();
    const upgraded = track(openDb(path));
    const repo = new Repo(upgraded);
    expect(version(upgraded)).toBe(11);
    expect(repo.listConversations()).toMatchObject([{ chatId: "chat-one", title: "Original chat title", turnCount: 2, archived: false }]);
    expect(repo.listRuns(10, { chatId: "chat-one" })).toHaveLength(2);
  });

  it("adds persisted safe run failures to version 6", () => {
    const { path } = fixture();
    const prior = openDb(path);
    prior.exec("ALTER TABLE runs DROP COLUMN failure; PRAGMA user_version=6");
    prior.prepare("INSERT INTO runs(run_id,goal,status,page_ids,created_at) VALUES(?,?,?,?,?)").run("kept", "Keep this run", "failed", "[]", 1);
    prior.close();
    const upgraded = track(openDb(path));
    expect(version(upgraded)).toBe(11);
    const repo = new Repo(upgraded);
    const run = repo.getRun("kept")!;
    run.failure = { category: "network", message: "Aux couldn’t reach the model provider.", retryable: true, action: "retry" };
    repo.saveRun(run);
    expect(repo.getRun("kept")?.failure).toEqual(run.failure);
  });

  it("adds scoped external-agent connections to version 5", () => {
    const { path } = fixture();
    const prior = openDb(path);
    prior.exec("DROP TABLE agent_connections; PRAGMA user_version=5");
    prior.close();
    const upgraded = track(openDb(path));
    expect(version(upgraded)).toBe(11);
    expect(upgraded.prepare("SELECT count(*) AS n FROM agent_connections").get()?.n).toBe(0);
  });

  it("adds durable regular-window ownership to version 4 tabs", () => {
    const { path } = fixture();
    const prior = openDb(path);
    prior.prepare("INSERT INTO tabs(page_id,ordinal,url,title,backend,active,window_id) VALUES(?,?,?,?,?,?,?)")
      .run("page", 0, "https://example.test", "Preserved", "vector", 1, "main");
    prior.exec("ALTER TABLE tabs DROP COLUMN window_id; PRAGMA user_version=4");
    prior.close();
    const upgraded = track(openDb(path));
    expect(version(upgraded)).toBe(11);
    expect(upgraded.prepare("SELECT page_id,window_id FROM tabs").get()).toEqual({ page_id: "page", window_id: "main" });
    expect(upgraded.prepare("SELECT count(*) AS n FROM agent_connections").get()?.n).toBe(0);
  });

  it("adds receipts to version 3 while preserving task revisions", () => {
    const { path } = fixture();
    const prior = openDb(path), repo = new Repo(prior), tasks = new TaskService(repo, new EventBus(repo));
    const workspace = tasks.createWorkspace("Preserved project");
    const task = tasks.create({ workspaceId: workspace.workspaceId, title: "Preserved task", objective: "Check fixture", criteria: [{ criterionId: "c", description: "Fixture matches", verification: "manual" }] });
    tasks.update({ taskId: task.taskId, expectedRevision: 1, title: "Revised task" });
    prior.exec("DROP TABLE task_evidence; DROP TABLE criterion_reviews; PRAGMA user_version=3");
    prior.close();
    const upgraded = track(openDb(path)), next = new Repo(upgraded);
    const details = new TaskService(next, new EventBus(next)).details(task.taskId);
    expect(details.task.title).toBe("Revised task");
    expect(details.revisions).toHaveLength(2);
    expect(upgraded.prepare("SELECT count(*) AS n FROM task_evidence").get()?.n).toBe(0);
    expect(version(upgraded)).toBe(11);
  });

  it("adds tasks to version 2 without losing unresolved action intents", () => {
    const { path } = fixture();
    const prior = openDb(path);
    prior.exec("DROP TABLE task_evidence; DROP TABLE criterion_reviews; DROP INDEX idx_runs_task; DROP TABLE task_revisions; DROP TABLE tasks; DROP TABLE workspaces; PRAGMA user_version=2; INSERT INTO action_intents VALUES ('a','key','run','page',1,'uncertain',1,NULL)");
    prior.close();
    const upgraded = track(openDb(path));
    expect(version(upgraded)).toBe(11);
    expect(upgraded.prepare("SELECT status FROM action_intents WHERE id='a'").get()?.status).toBe("uncertain");
    expect(upgraded.prepare("SELECT count(*) AS n FROM tasks").get()?.n).toBe(0);
  });
  it("upgrades version 1 without recreating its baseline and keeps a version 1 snapshot", () => {
    const { directory, path } = fixture();
    const prior = openDb(path);
    prior.exec("DROP TABLE task_evidence; DROP TABLE criterion_reviews; DROP INDEX idx_runs_task; DROP TABLE task_revisions; DROP TABLE tasks; DROP TABLE workspaces; DROP TABLE action_intents; DROP TABLE action_transitions; DROP TABLE journal_imports; PRAGMA user_version=1; INSERT INTO kv VALUES ('retained','yes')");
    prior.close();
    const upgraded = track(openDb(path));
    expect(version(upgraded)).toBe(11);
    expect(upgraded.prepare("SELECT value FROM kv WHERE key='retained'").get()?.value).toBe("yes");
    expect(upgraded.prepare("SELECT count(*) AS n FROM action_intents").get()?.n).toBe(0);
    const backupDirectory = readdirSync(directory).find(name => name.includes("before-v11"))!;
    const backup = track(new DatabaseSync(join(directory, backupDirectory, "state.sqlite"), { readOnly: true }));
    expect(version(backup)).toBe(1);
    expect(backup.prepare("SELECT name FROM sqlite_schema WHERE name='action_intents'").get()).toBeUndefined();
  });
  it("initializes fresh databases once without creating backups", () => {
    const { directory, path } = fixture();
    const db = openDb(path);
    expect(version(db)).toBe(11);
    db.prepare("INSERT INTO kv VALUES (?, ?)").run("synthetic", "retained");
    db.close();
    const reopened = track(openDb(path));
    expect(reopened.prepare("SELECT value FROM kv").get()?.value).toBe("retained");
    expect(readdirSync(directory).filter(name => name.includes("before-v"))).toEqual([]);
  });

  it("backs up committed WAL data before changing the legacy schema", () => {
    const { directory, path } = fixture();
    const legacy = track(new DatabaseSync(path));
    legacy.exec("PRAGMA journal_mode=WAL; PRAGMA wal_autocheckpoint=0; CREATE TABLE kv(key TEXT PRIMARY KEY, value TEXT NOT NULL)");
    legacy.prepare("INSERT INTO kv VALUES (?, ?)").run("synthetic", "in-wal");
    expect(statSync(`${path}-wal`).size).toBeGreaterThan(0);
    const upgraded = track(openDb(path));
    expect(version(upgraded)).toBe(11);
    expect(upgraded.prepare("SELECT value FROM kv").get()?.value).toBe("in-wal");
    const backups = readdirSync(directory).filter(name => name.includes("before-v"));
    expect(backups).toHaveLength(1);
    const backupDirectory = join(directory, backups[0]!);
    const backupPath = join(backupDirectory, "state.sqlite");
    const backup = track(new DatabaseSync(backupPath, { readOnly: true }));
    expect(version(backup)).toBe(0);
    expect(backup.prepare("SELECT value FROM kv").get()?.value).toBe("in-wal");
    expect(backup.prepare("SELECT name FROM sqlite_schema WHERE name='pages'").get()).toBeUndefined();
    expect(backup.prepare("PRAGMA integrity_check").get()?.integrity_check).toBe("ok");
    if (process.platform !== "win32") {
      expect(statSync(backupDirectory).mode & 0o777).toBe(0o700);
      expect(statSync(backupPath).mode & 0o777).toBe(0o600);
    }
  });

  it("rolls back every schema change on failure and permits a repaired retry", () => {
    const { path } = fixture();
    const legacy = track(new DatabaseSync(path));
    // An incompatible old table forces failure after several CREATE statements.
    legacy.exec("CREATE TABLE set_members(synthetic TEXT); INSERT INTO set_members VALUES ('preserved')");
    expect(() => openDb(path)).toThrow(/column/);
    expect(version(legacy)).toBe(0);
    expect(legacy.prepare("SELECT synthetic FROM set_members").get()?.synthetic).toBe("preserved");
    expect(legacy.prepare("SELECT name FROM sqlite_schema WHERE name='kv'").get()).toBeUndefined();
    legacy.exec("ALTER TABLE set_members RENAME TO preserved_members");
    const repaired = track(openDb(path));
    expect(version(repaired)).toBe(11);
    expect(repaired.prepare("SELECT synthetic FROM preserved_members").get()?.synthetic).toBe("preserved");
  });

  it("refuses newer schemas without modifying their contents or creating backups", () => {
    const { directory, path } = fixture();
    const newer = track(new DatabaseSync(path));
    newer.exec("PRAGMA user_version=99; CREATE TABLE future(value TEXT); INSERT INTO future VALUES ('keep')");
    expect(() => openDb(path)).toThrow(/schema 99.*not supported/);
    expect(version(newer)).toBe(99);
    expect(newer.prepare("SELECT value FROM future").get()?.value).toBe("keep");
    expect(newer.prepare("SELECT name FROM sqlite_schema WHERE name='kv'").get()).toBeUndefined();
    expect(readdirSync(directory)).toEqual(["state.sqlite"]);
  });
});
