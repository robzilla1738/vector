import { createHash, randomBytes } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";
import { openDb, Repo } from "@aux/runtime";
import type { SafetyAction } from "@aux/contracts";
import { ApprovalStore } from "../../apps/runtime/src/safety/approval.js";
import { SafetyAuditStore } from "../../apps/runtime/src/safety/audit.js";
import { SendJournal } from "../../apps/runtime/src/safety/send-journal.js";
import { compactProtectedSqlite, migrateSensitiveTable, SENSITIVE_SQLITE_COLUMNS, SqliteColumnCipher } from
  "../../apps/runtime/src/store/sqlite-protection.js";

function fixture() {
  const db = openDb(":memory:");
  const saved = new Map<string, string>();
  const secrets = {
    async readSecret(name: string) { return { value: saved.get(name) }; },
    async storeSecret(name: string, value: string) { saved.set(name, value); return { ok: true as const }; },
    async profileStorageRoot() {
      const name = `aux_root_v1_${createHash("sha256").update("profile-one").digest("hex").slice(0, 24)}`;
      if (!saved.has(name)) saved.set(name, randomBytes(32).toString("base64"));
      return { value: saved.get(name)! };
    },
    async profileStorageFactor() {
      const name = `sqlite_factor_v1_${createHash("sha256").update("profile-one").digest("hex").slice(0, 24)}`;
      if (!saved.has(name)) saved.set(name, randomBytes(32).toString("base64"));
      return { value: saved.get(name)! };
    },
  };
  return { db, saved, secrets, close: () => db.close() };
}

it("registers only columns present in the canonical SQLite schema", () => {
  const f = fixture();
  try {
    for (const [table, columns] of Object.entries(SENSITIVE_SQLITE_COLUMNS)) {
      if (!f.db.prepare("SELECT 1 FROM sqlite_schema WHERE type='table' AND name=?").get(table)) continue;
      const actual = new Set((f.db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[])
        .map(column => column.name));
      expect(columns.filter(column => !actual.has(column))).toEqual([]);
    }
  } finally { f.close(); }
});

it("migrates a table atomically with stable AAD and refuses tampered or plaintext values", async () => {
  const f = fixture();
  try {
    const cipher = await SqliteColumnCipher.create(f.secrets, "profile-one", false);
    f.db.prepare("INSERT INTO kv(key,value) VALUES(?,?)").run("one", "private amber");
    f.db.prepare("INSERT INTO kv(key,value) VALUES(?,?)").run("two", "private violet");
    expect(migrateSensitiveTable(f.db, cipher, "kv")).toBe(2);
    const first = (f.db.prepare("SELECT value FROM kv WHERE key='one'").get() as { value: string }).value;
    expect(first).not.toContain("amber");
    expect(cipher.decrypt("kv", JSON.stringify(["one"]), "value", first)).toBe("private amber");
    expect(() => cipher.decrypt("kv", JSON.stringify(["two"]), "value", first)).toThrow();
    expect(migrateSensitiveTable(f.db, cipher, "kv")).toBe(0);
    f.db.prepare("UPDATE kv SET value='plain again' WHERE key='one'").run();
    f.db.prepare("UPDATE kv SET value='auxenc:v1:bad' WHERE key='two'").run();
    expect(() => migrateSensitiveTable(f.db, cipher, "kv")).toThrow();
    expect(f.db.prepare("SELECT value FROM kv WHERE key='one'").get()).toMatchObject({ value: "plain again" });
  } finally { f.close(); }
});

it("requires stable primary keys and adapted triggers before converting a table", async () => {
  const f = fixture();
  try {
    const cipher = await SqliteColumnCipher.create(f.secrets, "profile-one", false);
    expect(() => migrateSensitiveTable(f.db, cipher, "history")).toThrow(/primary keys/);
    expect(() => migrateSensitiveTable(f.db, cipher, "bookmark_articles")).toThrow(/primary keys/);
    expect(() => migrateSensitiveTable(f.db, cipher, "history_projection_staging")).toThrow(/primary keys/);
  } finally { f.close(); }
});

it("protects model call metadata across migration, new writes and a new repository", async () => {
  const f = fixture();
  try {
    const legacy = new Repo(f.db);
    legacy.saveModelCall({ callId: "old", runId: "run", role: "agent", modelId: "model",
      providerMetadata: { prompt: "private indigo" }, durationMs: 1, error: "private scarlet", createdAt: 1 });
    const cipher = await SqliteColumnCipher.create(f.secrets, "profile-one", false);
    expect(migrateSensitiveTable(f.db, cipher, "model_calls")).toBe(2);
    const protectedRepo = new Repo(f.db, cipher);
    expect(protectedRepo.listModelCalls("run")[0]).toMatchObject({
      providerMetadata: { prompt: "private indigo" }, error: "private scarlet",
    });
    protectedRepo.saveModelCall({ callId: "new", runId: "run", role: "agent", modelId: "model",
      providerMetadata: { prompt: "private teal" }, durationMs: 1, createdAt: 2 });
    const raw = f.db.prepare("SELECT provider_metadata,error FROM model_calls WHERE call_id='old'").get() as
      { provider_metadata: string; error: string };
    expect(JSON.stringify(raw)).not.toMatch(/indigo|scarlet/);
    const freshCipher = await SqliteColumnCipher.create(f.secrets, "profile-one", true);
    expect(new Repo(f.db, freshCipher).listModelCalls("run")).toHaveLength(2);
    f.db.prepare("UPDATE model_calls SET error='altered' WHERE call_id='old'").run();
    expect(() => protectedRepo.listModelCalls("run")).toThrow(/plaintext/);
  } finally { f.close(); }
});

it("rolls back a failed first migration without marking the table protected", async () => {
  const f = fixture();
  try {
    const cipher = await SqliteColumnCipher.create(f.secrets, "profile-one", false);
    f.db.prepare("INSERT INTO model_calls(call_id,role,model_id,provider_metadata,duration_ms,cost_estimated,error,created_at) VALUES(?,?,?,?,?,?,?,?)")
      .run("a", "agent", "model", "private blue", 1, 0, "private red", 1);
    f.db.prepare("INSERT INTO model_calls(call_id,role,model_id,provider_metadata,duration_ms,cost_estimated,error,created_at) VALUES(?,?,?,?,?,?,?,?)")
      .run("b", "agent", "model", "auxenc:v1:corrupt", 1, 0, null, 2);
    expect(() => migrateSensitiveTable(f.db, cipher, "model_calls")).toThrow();
    expect(f.db.prepare("SELECT provider_metadata FROM model_calls WHERE call_id='a'").get())
      .toMatchObject({ provider_metadata: "private blue" });
    expect(f.db.prepare("SELECT value FROM aux_meta WHERE key='protected_sqlite_v1:model_calls'").get())
      .toBeUndefined();
  } finally { f.close(); }
});

it("opens migrated model calls after an on-disk restart with the same Profile factor", async () => {
  const directory = mkdtempSync(join(tmpdir(), "aux-protected-sqlite-"));
  const file = join(directory, "state.sqlite");
  const oldBackup = join(directory, "old.sqlite");
  const newBackup = join(directory, "new.sqlite");
  const secrets = fixture();
  let db = openDb(file);
  try {
    const cipher = await SqliteColumnCipher.create(secrets.secrets, "profile-one", false);
    new Repo(db).saveModelCall({ callId: "legacy", runId: "run", role: "agent", modelId: "model",
      durationMs: 1, error: "legacy private error", createdAt: 0 });
    db.prepare("VACUUM INTO ?").run(oldBackup);
    migrateSensitiveTable(db, cipher, "model_calls");
    new Repo(db, cipher).saveModelCall({ callId: "durable", runId: "run", role: "agent", modelId: "model",
      durationMs: 1, error: "durable private error", createdAt: 1 });
    compactProtectedSqlite(db);
    db.prepare("VACUUM INTO ?").run(newBackup);
    expect(readFileSync(oldBackup).includes("legacy private error")).toBe(true);
    expect(readFileSync(newBackup).includes("legacy private error")).toBe(false);
    expect(readFileSync(file).includes("legacy private error")).toBe(false);
    expect(!existsSync(`${file}-wal`) || !readFileSync(`${file}-wal`).includes("legacy private error")).toBe(true);
    db.close();
    db = openDb(file);
    const reopened = await SqliteColumnCipher.create(secrets.secrets, "profile-one", true);
    expect(new Repo(db, reopened).listModelCalls("run").map(call => call.error))
      .toEqual(["legacy private error", "durable private error"]);
    const raw = db.prepare("SELECT error FROM model_calls WHERE call_id='durable'").get() as { error: string };
    expect(raw.error).not.toContain("private error");
  } finally { db.close(); secrets.close(); rmSync(directory, { recursive: true, force: true }); }
});

it("protects page sets and members across migration, writes, backups and restart", async () => {
  const directory = mkdtempSync(join(tmpdir(), "aux-protected-sets-"));
  const file = join(directory, "state.sqlite");
  const oldBackup = join(directory, "old.sqlite");
  const newBackup = join(directory, "new.sqlite");
  const secrets = fixture();
  let db = openDb(file);
  try {
    const legacy = new Repo(db);
    legacy.saveSet({ setId: "set-old", name: "private set saffron", source: "urls", memberIds: ["member-old"],
      resultSchema: [{ name: "private schema mauve" }], createdAt: 1 });
    legacy.saveMember({ memberId: "member-old", setId: "set-old", ordinal: 0,
      url: "https://private.example/iris", recordKey: "private key iris",
      label: "private label iris", status: "failed", error: "private error iris" });
    db.prepare("VACUUM INTO ?").run(oldBackup);
    const cipher = await SqliteColumnCipher.create(secrets.secrets, "profile-one", false);
    expect(migrateSensitiveTable(db, cipher, "page_sets")).toBe(2);
    expect(migrateSensitiveTable(db, cipher, "set_members")).toBe(4);
    const protectedRepo = new Repo(db, cipher);
    expect(protectedRepo.getSet("set-old")?.resultSchema?.[0]?.name).toBe("private schema mauve");
    expect(protectedRepo.listMembers("set-old")[0]?.url).toBe("https://private.example/iris");
    protectedRepo.saveSet({ setId: "set-new", name: "private set cobalt", source: "manual",
      memberIds: ["member-new"], createdAt: 2 });
    protectedRepo.saveMember({ memberId: "member-new", setId: "set-new", ordinal: 0,
      label: "private label cobalt", status: "queued" });
    expect(protectedRepo.listSets().map(set => set.name)).toEqual(["private set cobalt", "private set saffron"]);
    compactProtectedSqlite(db);
    db.prepare("VACUUM INTO ?").run(newBackup);
    expect(readFileSync(oldBackup).includes("private set saffron")).toBe(true);
    for (const path of [file, newBackup, `${file}-wal`]) {
      expect(!existsSync(path) || !readFileSync(path).includes("private set saffron")).toBe(true);
    }
    db.close();
    db = openDb(file);
    const reopened = new Repo(db, await SqliteColumnCipher.create(secrets.secrets, "profile-one", true));
    expect(reopened.getMember("member-old")?.error).toBe("private error iris");
    expect(reopened.getSet("set-new")?.name).toBe("private set cobalt");
    db.prepare("UPDATE set_members SET label='tampered plaintext' WHERE member_id='member-old'").run();
    expect(() => reopened.getMember("member-old")).toThrow(/plaintext/);
  } finally { db.close(); secrets.close(); rmSync(directory, { recursive: true, force: true }); }
});

it("protects saved programs and their execution text across migration and restart", async () => {
  const directory = mkdtempSync(join(tmpdir(), "aux-protected-programs-"));
  const file = join(directory, "state.sqlite");
  const oldBackup = join(directory, "old.sqlite");
  const newBackup = join(directory, "new.sqlite");
  const secrets = fixture();
  let db = openDb(file);
  try {
    const legacy = new Repo(db);
    legacy.saveProgram({ programId: "old", name: "private name jade", description: "private description jade",
      version: 1, siteKey: "https://private.example/jade", parameters: ["private parameter jade"],
      stepsJson: '[{"op":"type","value":"private step jade"}]',
      preconditions: ["private precondition jade"], postconditions: ["private postcondition jade"],
      useCount: 0, createdAt: 1 });
    db.prepare("VACUUM INTO ?").run(oldBackup);
    const cipher = await SqliteColumnCipher.create(secrets.secrets, "profile-one", false);
    expect(migrateSensitiveTable(db, cipher, "programs")).toBe(7);
    const protectedRepo = new Repo(db, cipher);
    expect(protectedRepo.getProgram("old")?.stepsJson).toContain("private step jade");
    protectedRepo.saveProgram({ programId: "new", name: "private name coral", version: 1,
      siteKey: "https://private.example/coral", parameters: [], stepsJson: "[]", useCount: 0, createdAt: 2 });
    expect(protectedRepo.listPrograms().map(program => program.name)).toEqual(["private name coral", "private name jade"]);
    compactProtectedSqlite(db);
    db.prepare("VACUUM INTO ?").run(newBackup);
    expect(readFileSync(oldBackup).includes("private step jade")).toBe(true);
    for (const path of [file, newBackup, `${file}-wal`]) {
      expect(!existsSync(path) || !readFileSync(path).includes("private step jade")).toBe(true);
    }
    db.close();
    db = openDb(file);
    const reopened = new Repo(db, await SqliteColumnCipher.create(secrets.secrets, "profile-one", true));
    expect(reopened.getProgram("old")?.preconditions).toEqual(["private precondition jade"]);
    expect(reopened.getProgram("new")?.name).toBe("private name coral");
    db.prepare("UPDATE programs SET steps_json='tampered plaintext' WHERE program_id='old'").run();
    expect(() => reopened.getProgram("old")).toThrow(/plaintext/);
  } finally { db.close(); secrets.close(); rmSync(directory, { recursive: true, force: true }); }
});

it("protects response URLs while preserving paged URL search", async () => {
  const directory = mkdtempSync(join(tmpdir(), "aux-protected-responses-"));
  const file = join(directory, "state.sqlite");
  const oldBackup = join(directory, "old.sqlite");
  const newBackup = join(directory, "new.sqlite");
  const secrets = fixture();
  let db = openDb(file);
  try {
    const legacy = new Repo(db);
    for (let i = 0; i < 260; i++) legacy.saveResponse({ requestId: `other-${i}`, pageId: "page",
      url: `https://example.test/other-${i}`, method: "GET", startedAt: 1000 + i });
    legacy.saveResponse({ requestId: "target", pageId: "page", url: "https://private.example/needle-carmine",
      method: "POST", contentType: "private/type-carmine", startedAt: 1 });
    db.prepare("VACUUM INTO ?").run(oldBackup);
    const cipher = await SqliteColumnCipher.create(secrets.secrets, "profile-one", false);
    expect(migrateSensitiveTable(db, cipher, "response_metadata")).toBe(523);
    const protectedRepo = new Repo(db, cipher);
    expect(protectedRepo.listResponses("page", { urlIncludes: "NEEDLE-CARMINE", limit: 1 })[0]?.requestId)
      .toBe("target");
    expect(protectedRepo.getResponse("target")?.contentType).toBe("private/type-carmine");
    protectedRepo.saveResponse({ requestId: "new", pageId: "page", url: "https://private.example/needle-coral",
      method: "PUT", startedAt: 2000 });
    expect(protectedRepo.listResponses("page", { urlIncludes: "needle", limit: 2 }).map(row => row.requestId))
      .toEqual(["new", "target"]);
    compactProtectedSqlite(db);
    db.prepare("VACUUM INTO ?").run(newBackup);
    expect(readFileSync(oldBackup).includes("needle-carmine")).toBe(true);
    for (const path of [file, newBackup, `${file}-wal`]) {
      expect(!existsSync(path) || !readFileSync(path).includes("needle-carmine")).toBe(true);
    }
    db.close();
    db = openDb(file);
    const reopened = new Repo(db, await SqliteColumnCipher.create(secrets.secrets, "profile-one", true));
    expect(reopened.getResponse("target")?.method).toBe("POST");
    db.prepare("UPDATE response_metadata SET url='tampered plaintext' WHERE request_id='target'").run();
    expect(() => reopened.getResponse("target")).toThrow(/plaintext/);
  } finally { db.close(); secrets.close(); rmSync(directory, { recursive: true, force: true }); }
});

it("protects result and dataset observations through migration and restart", async () => {
  const directory = mkdtempSync(join(tmpdir(), "aux-protected-observations-"));
  const file = join(directory, "state.sqlite");
  const oldBackup = join(directory, "old.sqlite");
  const newBackup = join(directory, "new.sqlite");
  const secrets = fixture();
  let db = openDb(file);
  try {
    const legacy = new Repo(db);
    legacy.saveResult({ resultId: "old-result", runId: "run", sourceUrl: "https://private.example/pearl",
      values: { note: "private result pearl" }, evidence: { observationId: "private evidence pearl" },
      observedAt: 1, status: "error", error: "private result error pearl" });
    legacy.saveDataset({ datasetId: "old-dataset", runId: "run", source: "private source garnet",
      schema: [{ name: "private schema garnet" }], rows: [{ value: "private row garnet" }],
      provenance: "private provenance garnet" });
    db.prepare("VACUUM INTO ?").run(oldBackup);
    const cipher = await SqliteColumnCipher.create(secrets.secrets, "profile-one", false);
    expect(migrateSensitiveTable(db, cipher, "results")).toBe(4);
    expect(migrateSensitiveTable(db, cipher, "datasets")).toBe(4);
    const protectedRepo = new Repo(db, cipher);
    expect(protectedRepo.getResult("old-result")?.values).toEqual({ note: "private result pearl" });
    expect(protectedRepo.listDatasets({ runId: "run" })[0]?.rows).toEqual([{ value: "private row garnet" }]);
    protectedRepo.saveResult({ resultId: "new-result", runId: "run", sourceUrl: "https://private.example/ruby",
      values: { note: "private result ruby" }, observedAt: 2, status: "ok" });
    protectedRepo.saveDataset({ datasetId: "new-dataset", runId: "run", source: "private source ruby",
      rows: [{ value: "private row ruby" }] });
    expect(protectedRepo.listResults({ runId: "run", status: "ok" })[0]?.resultId).toBe("new-result");
    compactProtectedSqlite(db);
    db.prepare("VACUUM INTO ?").run(newBackup);
    expect(readFileSync(oldBackup).includes("private result pearl")).toBe(true);
    for (const path of [file, newBackup, `${file}-wal`]) {
      expect(!existsSync(path) || !readFileSync(path).includes("private result pearl")).toBe(true);
      expect(!existsSync(path) || !readFileSync(path).includes("private row garnet")).toBe(true);
    }
    db.close();
    db = openDb(file);
    const reopened = new Repo(db, await SqliteColumnCipher.create(secrets.secrets, "profile-one", true));
    expect(reopened.getResult("old-result")?.error).toBe("private result error pearl");
    expect(reopened.getDataset("new-dataset")?.rows).toEqual([{ value: "private row ruby" }]);
    db.prepare("UPDATE datasets SET values_json='tampered plaintext' WHERE dataset_id='old-dataset'").run();
    expect(() => reopened.getDataset("old-dataset")).toThrow(/plaintext/);
  } finally { db.close(); secrets.close(); rmSync(directory, { recursive: true, force: true }); }
});

it("protects sequenced event payloads for immediate and deferred writes", async () => {
  const directory = mkdtempSync(join(tmpdir(), "aux-protected-events-"));
  const file = join(directory, "state.sqlite");
  const oldBackup = join(directory, "old.sqlite");
  const newBackup = join(directory, "new.sqlite");
  const secrets = fixture();
  let db = openDb(file);
  try {
    const legacy = new Repo(db);
    const oldSeq = legacy.appendEvent({ type: "private.event", payload: { text: "private event amber" }, ts: 1 });
    db.prepare("VACUUM INTO ?").run(oldBackup);
    const cipher = await SqliteColumnCipher.create(secrets.secrets, "profile-one", false);
    expect(migrateSensitiveTable(db, cipher, "events")).toBe(1);
    const protectedRepo = new Repo(db, cipher);
    const nextSeq = protectedRepo.appendEvent({ type: "private.event", payload: { text: "private event violet" }, ts: 2 });
    protectedRepo.queueEvent({ seq: nextSeq + 1, streamId: protectedRepo.streamId(),
      type: "private.event", payload: { text: "private event coral" }, ts: 3 });
    expect(protectedRepo.eventsSince(0).events.map(event => event.payload)).toEqual([
      { text: "private event amber" }, { text: "private event violet" }, { text: "private event coral" },
    ]);
    expect(oldSeq).toBeLessThan(nextSeq);
    compactProtectedSqlite(db);
    db.prepare("VACUUM INTO ?").run(newBackup);
    expect(readFileSync(oldBackup).includes("private event amber")).toBe(true);
    for (const path of [file, newBackup, `${file}-wal`]) {
      expect(!existsSync(path) || !readFileSync(path).includes("private event amber")).toBe(true);
    }
    db.close();
    db = openDb(file);
    const reopened = new Repo(db, await SqliteColumnCipher.create(secrets.secrets, "profile-one", true));
    expect(reopened.eventsSince(oldSeq).events.map(event => event.payload)).toEqual([
      { text: "private event violet" }, { text: "private event coral" },
    ]);
    db.prepare("UPDATE events SET payload='tampered plaintext' WHERE seq=?").run(oldSeq);
    expect(() => reopened.eventsSince(0)).toThrow(/plaintext/);
  } finally { db.close(); secrets.close(); rmSync(directory, { recursive: true, force: true }); }
});

it("protects queued and steered run messages while preserving queue status queries", async () => {
  const directory = mkdtempSync(join(tmpdir(), "aux-protected-run-messages-"));
  const file = join(directory, "state.sqlite");
  const oldBackup = join(directory, "old.sqlite");
  const newBackup = join(directory, "new.sqlite");
  const secrets = fixture();
  let db = openDb(file);
  try {
    const legacy = new Repo(db);
    legacy.saveRun({ runId: "run", goal: "fixture", status: "running", pageIds: [], createdAt: 1 });
    const old = { messageId: "message-old", chatId: "run", targetRunId: "run", deliveryRunId: "delivery-old",
      mode: "queue" as const, status: "accepted" as const, text: "private message maroon", pageIds: ["page"],
      contextPageRefs: [{ pageId: "page", url: "https://private.example/maroon", documentEpoch: 1 }],
      expectedRevision: 0, error: "private queue error maroon", createdAt: 1, updatedAt: 1 };
    legacy.insertRunMessage(old);
    db.prepare("VACUUM INTO ?").run(oldBackup);
    const cipher = await SqliteColumnCipher.create(secrets.secrets, "profile-one", false);
    expect(migrateSensitiveTable(db, cipher, "run_messages")).toBe(3);
    const protectedRepo = new Repo(db, cipher);
    expect(protectedRepo.nextRunMessage("run")?.text).toBe("private message maroon");
    expect(protectedRepo.getRunMessage("message-old")?.contextPageRefs[0]?.url)
      .toBe("https://private.example/maroon");
    const steered = protectedRepo.insertRunMessage({ ...old, messageId: "message-steer",
      deliveryRunId: "delivery-steer", mode: "steer", status: "delivered", text: "private steer silver",
      error: undefined, createdAt: 2, updatedAt: 2 });
    expect(steered.text).toBe("private steer silver");
    expect(protectedRepo.listRunSteers("run").map(message => message.messageId)).toEqual(["message-steer"]);
    expect(protectedRepo.pendingRunMessageCount("run")).toBe(1);
    expect(protectedRepo.updateRunMessage("message-old", "needs_attention", "private new error maroon").error)
      .toBe("private new error maroon");
    compactProtectedSqlite(db);
    db.prepare("VACUUM INTO ?").run(newBackup);
    expect(readFileSync(oldBackup).includes("private message maroon")).toBe(true);
    for (const path of [file, newBackup, `${file}-wal`]) {
      expect(!existsSync(path) || !readFileSync(path).includes("private message maroon")).toBe(true);
    }
    db.close();
    db = openDb(file);
    const reopened = new Repo(db, await SqliteColumnCipher.create(secrets.secrets, "profile-one", true));
    expect(reopened.listRunMessages("run").map(message => message.text))
      .toEqual(["private message maroon", "private steer silver"]);
    db.prepare("UPDATE run_messages SET text='tampered plaintext' WHERE message_id='message-old'").run();
    expect(() => reopened.getRunMessage("message-old")).toThrow(/plaintext/);
  } finally { db.close(); secrets.close(); rmSync(directory, { recursive: true, force: true }); }
});

it("protects safety approvals, send journal and audit records across restart", async () => {
  const directory = mkdtempSync(join(tmpdir(), "aux-protected-safety-"));
  const file = join(directory, "state.sqlite");
  const oldBackup = join(directory, "old.sqlite");
  const newBackup = join(directory, "new.sqlite");
  const secrets = fixture();
  let db = openDb(file);
  const action: SafetyAction = { profileId: "profile-one", scope: { kind: "task", id: "task" },
    effect: "write", action: "submit", invocationDigest: "a".repeat(64),
    origin: "https://safety-amber.private.example", turnId: "turn", threadId: "thread", requestedAt: 100 };
  try {
    const oldApproval = new ApprovalStore(db).issue(action, "turn", 100);
    const oldJournal = new SendJournal(db);
    oldJournal.queue({ nonce: "old-send", threadId: "thread", turnId: "turn", text: "private send amber" }, 100);
    oldJournal.fail("old-send", "private error amber", 101);
    new SafetyAuditStore(db).record({ kind: "authorization_decision", origin: "https://safety-amber.private.example", at: 102 });
    db.prepare("VACUUM INTO ?").run(oldBackup);
    const cipher = await SqliteColumnCipher.create(secrets.secrets, "profile-one", false);
    expect(migrateSensitiveTable(db, cipher, "safety_approval_requests")).toBe(1);
    expect(migrateSensitiveTable(db, cipher, "safety_send_journal")).toBe(3);
    expect(migrateSensitiveTable(db, cipher, "safety_audit")).toBe(1);
    const approvals = new ApprovalStore(db, () => {}, cipher);
    const journal = new SendJournal(db, cipher);
    const audit = new SafetyAuditStore(db, cipher);
    expect(approvals.pending("thread", 103).map(row => row.approvalId)).toEqual([oldApproval]);
    expect(journal.messageStatus("old-send")?.errorCode).toBe("private error amber");
    expect(journal.queue({ nonce: "old-send", threadId: "thread", turnId: "turn", text: "private send amber" }).state)
      .toBe("failed");
    expect(() => journal.queue({ nonce: "old-send", threadId: "thread", turnId: "turn", text: "changed" }))
      .toThrow(/different message/);
    const newApproval = approvals.issue({ ...action, turnId: "turn-new" }, "turn", 104);
    approvals.decideLocal({ approvalId: newApproval, decision: "accept" }, "turn-new", 105);
    expect(approvals.authorize({ action: { ...action, turnId: "turn-new" },
      policy: { access: "allow", confirmation: "action", approvalLifetime: "turn", grantLifetime: "session",
        source: "user", reason: "matched_rule", origin: "https://private.example", effect: "write" },
      ceiling: "ask", approvalId: newApproval, now: 106 }).status).toBe("authorized");
    journal.queue({ nonce: "new-send", threadId: "thread", turnId: "turn-new", text: "private send coral" }, 107);
    expect(journal.draft("new-send")?.text).toBe("private send coral");
    audit.record({ kind: "authorization_decision", origin: "https://safety-coral.private.example", at: 108 });
    compactProtectedSqlite(db);
    db.prepare("VACUUM INTO ?").run(newBackup);
    expect(readFileSync(oldBackup).includes("private send amber")).toBe(true);
    for (const path of [file, newBackup, `${file}-wal`]) {
      expect(!existsSync(path) || !readFileSync(path).includes("private send amber")).toBe(true);
      expect(!existsSync(path) || !readFileSync(path).includes("safety-amber")).toBe(true);
    }
    db.close();
    db = openDb(file);
    const reopenedCipher = await SqliteColumnCipher.create(secrets.secrets, "profile-one", true);
    expect(new SendJournal(db, reopenedCipher).draft("new-send")?.text).toBe("private send coral");
    expect(new SendJournal(db, reopenedCipher).list("thread").map(record => record.text))
      .toEqual(["private send amber", "private send coral"]);
    expect(new ApprovalStore(db, () => {}, reopenedCipher).pending("thread", 103)[0]?.action.origin)
      .toBe("https://safety-amber.private.example");
    const savedAudit = db.prepare("SELECT seq,payload FROM safety_audit ORDER BY seq LIMIT 1").get() as
      { seq: number; payload: string };
    expect(JSON.parse(reopenedCipher.decrypt("safety_audit", JSON.stringify([savedAudit.seq]), "payload", savedAudit.payload)))
      .toMatchObject({ origin: "https://safety-amber.private.example" });
    db.prepare("UPDATE safety_approval_requests SET action_json='tampered plaintext' WHERE approval_id=?").run(oldApproval);
    expect(() => new ApprovalStore(db, () => {}, reopenedCipher).pending("thread", 103)).toThrow(/plaintext/);
  } finally { db.close(); secrets.close(); rmSync(directory, { recursive: true, force: true }); }
});
