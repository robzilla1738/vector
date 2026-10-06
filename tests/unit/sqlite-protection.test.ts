import { createHash, randomBytes } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it, vi } from "vitest";
import { EventBus, openDb, Repo, SpaceService, TaskEvidenceService, TaskService } from "@aux/runtime";
import type { SafetyAction } from "@aux/contracts";
import { ApprovalStore } from "../../apps/runtime/src/safety/approval.js";
import { SafetyAuditStore } from "../../apps/runtime/src/safety/audit.js";
import { SendJournal } from "../../apps/runtime/src/safety/send-journal.js";
import { compactProtectedSqlite, migrateSensitiveKv, migrateSensitiveTable, SENSITIVE_SQLITE_COLUMNS, SqliteColumnCipher } from
  "../../apps/runtime/src/store/sqlite-protection.js";
import { usageReport } from "../../apps/runtime/src/services/usage-report.js";

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
    f.db.prepare("INSERT INTO kv(key,value) VALUES(?,?)").run("meta:eventStreamId", "stream-id");
    f.db.prepare("INSERT INTO kv(key,value) VALUES(?,?)").run("counter:requests", "3");
    expect(() => migrateSensitiveTable(f.db, cipher, "kv")).toThrow(/filtered/);
    expect(migrateSensitiveKv(f.db, cipher)).toBe(2);
    const first = (f.db.prepare("SELECT value FROM kv WHERE key='one'").get() as { value: string }).value;
    expect(first).not.toContain("amber");
    expect(cipher.decrypt("kv", JSON.stringify(["one"]), "value", first)).toBe("private amber");
    expect(() => cipher.decrypt("kv", JSON.stringify(["two"]), "value", first)).toThrow();
    expect(migrateSensitiveKv(f.db, cipher)).toBe(0);
    expect(f.db.prepare("SELECT value FROM kv WHERE key='meta:eventStreamId'").get()).toMatchObject({ value: "stream-id" });
    expect(f.db.prepare("SELECT value FROM kv WHERE key='counter:requests'").get()).toMatchObject({ value: "3" });
    f.db.prepare("UPDATE kv SET value='plain again' WHERE key='one'").run();
    f.db.prepare("UPDATE kv SET value='auxenc:v1:bad' WHERE key='two'").run();
    expect(migrateSensitiveKv(f.db, cipher)).toBe(0);
    expect(() => cipher.decrypt("kv", JSON.stringify(["one"]), "value", "plain again")).toThrow(/plaintext/);
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
      mentions: [{ kind: "tab" as const, pageId: "page", url: "https://private-mention.example/maroon", title: "Private mention maroon", documentEpoch: 1, sessionId: "synthetic-message-attachment", access: "read" as const }],
      expectedRevision: 0, error: "private queue error maroon", createdAt: 1, updatedAt: 1 };
    legacy.insertRunMessage(old);
    db.prepare("VACUUM INTO ?").run(oldBackup);
    const cipher = await SqliteColumnCipher.create(secrets.secrets, "profile-one", false);
    expect(migrateSensitiveTable(db, cipher, "run_messages")).toBe(4);
    const protectedRepo = new Repo(db, cipher);
    expect(protectedRepo.nextRunMessage("run")?.text).toBe("private message maroon");
    expect(protectedRepo.getRunMessage("message-old")?.contextPageRefs[0]?.url)
      .toBe("https://private.example/maroon");
    expect(protectedRepo.getRunMessage("message-old")?.mentions?.[0]).toMatchObject({ title: "Private mention maroon", sessionId: "synthetic-message-attachment" });
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
      expect(!existsSync(path) || !readFileSync(path).includes("private-mention.example")).toBe(true);
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

it("protects run and step content while retaining metadata lookups across restart", async () => {
  const directory = mkdtempSync(join(tmpdir(), "aux-protected-runs-"));
  const file = join(directory, "state.sqlite");
  const oldBackup = join(directory, "old.sqlite");
  const newBackup = join(directory, "new.sqlite");
  const secrets = fixture();
  let db = openDb(file);
  try {
    const legacy = new Repo(db);
    legacy.saveRun({ runId: "old", goal: "private goal amber", status: "completed", pageIds: [],
      config: { chatId: "chat", taskId: "task", context: "private context amber",
        contextImageArtifactIds: ["image"] }, statusMessage: "private status amber",
      result: { answer: "private answer amber" }, error: "private error amber",
      failure: { category: "unknown", message: "private failure amber", retryable: false, action: "none" },
      createdAt: 1 });
    legacy.saveStep({ stepId: "old-step", runId: "old", op: "download",
      inputs: { downloadId: "old-download", text: "private input amber" },
      expected: "private expected amber", outcome: { stepId: "old-step", op: "download",
        status: "ok", startedAt: 1, durationMs: 1, detail: "private outcome amber" }, startedAt: 1 });
    db.prepare("VACUUM INTO ?").run(oldBackup);
    const cipher = await SqliteColumnCipher.create(secrets.secrets, "profile-one", false);
    expect(migrateSensitiveTable(db, cipher, "runs")).toBe(6);
    expect(migrateSensitiveTable(db, cipher, "steps")).toBe(3);
    expect(migrateSensitiveTable(db, cipher, "conversations")).toBe(1);
    const protectedRepo = new Repo(db, cipher);
    expect(protectedRepo.getRun("old")?.result?.answer).toBe("private answer amber");
    expect(protectedRepo.listRuns(1, { query: "goal amber" })[0]?.runId).toBe("old");
    expect(protectedRepo.listConversations(1, { query: "answer amber" })[0]?.chatId).toBe("chat");
    expect(protectedRepo.downloadStep("old-download")?.expected).toBe("private expected amber");
    expect(db.prepare("SELECT run_id FROM run_lookup WHERE json_extract(config,'$.taskId')='task'").get())
      .toMatchObject({ run_id: "old" });
    protectedRepo.saveRun({ runId: "new", goal: "private goal coral", status: "running", pageIds: [],
      config: { chatId: "chat", taskId: "task", context: "private context coral" }, createdAt: 2 });
    protectedRepo.saveStep({ stepId: "new-step", runId: "new", op: "type",
      inputs: { value: "private input coral" }, startedAt: 2 });
    expect(protectedRepo.conversationRuns("chat").map(run => run.runId)).toEqual(["new", "old"]);
    const tasks = new TaskService(protectedRepo, new EventBus(protectedRepo));
    const workspace = tasks.createWorkspace("Fixture");
    const task = tasks.create({ workspaceId: workspace.workspaceId, title: "Fixture task",
      objective: "Check the run", criteria: [{ criterionId: "check", description: "Run checked",
        verification: "manual" }] });
    protectedRepo.saveRun({ runId: "task-run", goal: "private task goal jade", status: "completed",
      pageIds: [], config: { taskId: task.taskId, taskRevision: 1 }, createdAt: 3 });
    expect(tasks.details(task.taskId).runs[0]?.run.goal).toBe("private task goal jade");
    protectedRepo.saveModelCall({ callId: "call", runId: "task-run", role: "agent", modelId: "model",
      durationMs: 1, createdAt: 4 });
    expect(usageReport(db, { asOf: 4 }, 5, protectedRepo).byRun[0]?.title).toBe("private task goal jade");
    compactProtectedSqlite(db);
    db.prepare("VACUUM INTO ?").run(newBackup);
    expect(readFileSync(oldBackup).includes("private goal amber")).toBe(true);
    for (const path of [file, newBackup, `${file}-wal`]) {
      expect(!existsSync(path) || !readFileSync(path).includes("private goal amber")).toBe(true);
      expect(!existsSync(path) || !readFileSync(path).includes("private input amber")).toBe(true);
    }
    db.close();
    db = openDb(file);
    const reopened = new Repo(db, await SqliteColumnCipher.create(secrets.secrets, "profile-one", true));
    expect(reopened.getRun("new")?.config?.context).toBe("private context coral");
    expect(reopened.listSteps("old")[0]?.outcome?.detail).toBe("private outcome amber");
    db.prepare("UPDATE runs SET goal='tampered plaintext' WHERE run_id='old'").run();
    expect(() => reopened.getRun("old")).toThrow(/plaintext/);
    db.prepare("UPDATE steps SET inputs='tampered plaintext' WHERE step_id='old-step'").run();
    expect(() => reopened.listSteps("old")).toThrow(/plaintext/);
  } finally { db.close(); secrets.close(); rmSync(directory, { recursive: true, force: true }); }
});

it("protects conversation titles and KV text across search, restart, backups and tamper", async () => {
  const directory = mkdtempSync(join(tmpdir(), "aux-protected-conversations-"));
  const file = join(directory, "state.sqlite");
  const oldBackup = join(directory, "old.sqlite");
  const newBackup = join(directory, "new.sqlite");
  const secrets = fixture();
  let db = openDb(file);
  try {
    const legacy = new Repo(db);
    legacy.saveRun({ runId: "run", goal: "private goal violet", status: "completed", pageIds: [],
      config: { chatId: "chat" }, result: { answer: "private answer violet" }, createdAt: 1 });
    legacy.renameConversation("chat", "private title violet");
    legacy.setSetting("providerModels", { custom: "private provider violet" });
    legacy.setSetting("conversationWorkspace:chat", "workspace-violet");
    legacy.setSetting("conversationAttachments:draft", [{ filename: "private draft violet", createdAt: 3 }]);
    legacy.saveCheckpoint("page", "plan", { inputs: { text: "private checkpoint violet" } });
    db.prepare("INSERT INTO kv(key,value) VALUES(?,?)").run("meta:eventStreamId", "stream");
    db.prepare("INSERT INTO kv(key,value) VALUES(?,?)").run("counter:models", "7");
    db.prepare("VACUUM INTO ?").run(oldBackup);
    const cipher = await SqliteColumnCipher.create(secrets.secrets, "profile-one", false);
    expect(migrateSensitiveTable(db, cipher, "runs")).toBeGreaterThanOrEqual(2);
    expect(migrateSensitiveTable(db, cipher, "conversations")).toBe(1);
    expect(migrateSensitiveKv(db, cipher)).toBeGreaterThanOrEqual(4);
    const protectedRepo = new Repo(db, cipher);
    expect(protectedRepo.getConversation("chat")?.title).toBe("private title violet");
    expect(protectedRepo.listConversations(1, { query: "title violet" })[0]?.chatId).toBe("chat");
    expect(protectedRepo.listConversations(1, { workspaceId: "workspace-violet" })[0]?.chatId).toBe("chat");
    expect(protectedRepo.preparedConversations()[0]?.title).toBe("private draft violet");
    expect(protectedRepo.getSetting<{custom:string}>("providerModels")?.custom).toBe("private provider violet");
    expect(protectedRepo.loadCheckpoint("page", "plan")?.inputs?.text).toBe("private checkpoint violet");
    for (let i = 0; i < 260; i++) protectedRepo.saveRun({ runId: `other-${i}`,
      goal: `other conversation ${i}`, status: "completed", pageIds: [], createdAt: i + 10 });
    expect(protectedRepo.listConversations(1, { query: "title violet" })[0]?.chatId).toBe("chat");
    expect(protectedRepo.listConversations(1, { workspaceId: "workspace-violet" })[0]?.chatId).toBe("chat");
    protectedRepo.setSetting("providerModels", { custom: "private provider coral" });
    protectedRepo.renameConversation("chat", "private title coral");
    expect(db.prepare("SELECT value FROM kv WHERE key='counter:models'").get()).toMatchObject({ value: "7" });
    compactProtectedSqlite(db);
    db.prepare("VACUUM INTO ?").run(newBackup);
    expect(readFileSync(oldBackup).includes("private title violet")).toBe(true);
    for (const path of [file, newBackup, `${file}-wal`]) {
      expect(!existsSync(path) || !readFileSync(path).includes("private title violet")).toBe(true);
      expect(!existsSync(path) || !readFileSync(path).includes("private provider violet")).toBe(true);
      expect(!existsSync(path) || !readFileSync(path).includes("private checkpoint violet")).toBe(true);
    }
    db.close();
    db = openDb(file);
    const reopened = new Repo(db, await SqliteColumnCipher.create(secrets.secrets, "profile-one", true));
    expect(reopened.getConversation("chat")?.title).toBe("private title coral");
    expect(reopened.getSetting<{custom:string}>("providerModels")?.custom).toBe("private provider coral");
    db.prepare("UPDATE conversations SET title='tampered plaintext' WHERE chat_id='chat'").run();
    expect(() => reopened.getConversation("chat")).toThrow(/plaintext/);
    db.prepare("UPDATE kv SET value='tampered plaintext' WHERE key='setting:providerModels'").run();
    expect(() => reopened.getSetting("providerModels")).toThrow(/plaintext/);
    expect(migrateSensitiveKv(db, cipher)).toBe(0);
  } finally { db.close(); secrets.close(); rmSync(directory, { recursive: true, force: true }); }
});

it("protects Space and Task text with evidence while retaining task binding", async () => {
  const directory = mkdtempSync(join(tmpdir(), "aux-protected-tasks-"));
  const file = join(directory, "state.sqlite");
  const oldBackup = join(directory, "old.sqlite");
  const newBackup = join(directory, "new.sqlite");
  const secrets = fixture();
  let db = openDb(file);
  try {
    const legacy = new Repo(db);
    const events = new EventBus(legacy);
    const tasks = new TaskService(legacy, events);
    const evidence = new TaskEvidenceService(legacy, events);
    const workspace = tasks.createWorkspace("private Space umber");
    legacy.saveRun({ runId: "prior", goal: "private run umber", status: "completed", pageIds: [],
      config: { chatId: "chat" }, createdAt: 1 });
    const task = tasks.promote({ chatId: "chat", expectedRunId: "prior", workspaceId: workspace.workspaceId,
      title: "private task umber", objective: "private objective umber",
      criteria: [{ criterionId: "check", description: "private criterion umber", verification: "manual" }] });
    const base = { taskId: task.taskId, expectedRevision: 1, criterionId: "check" };
    const note = evidence.recordNote({ ...base, summary: "private evidence umber" }, "desktop_user");
    evidence.review({ ...base, evidenceIds: [note.evidenceId], outcome: "accepted",
      note: "private review umber" });
    evidence.verifyCriterion(base);
    db.prepare("VACUUM INTO ?").run(oldBackup);
    const cipher = await SqliteColumnCipher.create(secrets.secrets, "profile-one", false);
    for (const table of ["runs", "conversations", "kv", "events"]) {
      if (table === "kv") migrateSensitiveKv(db, cipher);
      else migrateSensitiveTable(db, cipher, table);
    }
    for (const table of ["workspaces", "tasks", "task_revisions", "task_evidence", "criterion_reviews", "criterion_verifications"])
      expect(migrateSensitiveTable(db, cipher, table)).toBeGreaterThan(0);
    const protectedRepo = new Repo(db, cipher);
    const protectedTasks = new TaskService(protectedRepo, new EventBus(protectedRepo));
    const protectedEvidence = new TaskEvidenceService(protectedRepo, new EventBus(protectedRepo));
    expect(protectedTasks.workspaces()[0]?.name).toBe("private Space umber");
    const spaces = new SpaceService(protectedRepo, new EventBus(protectedRepo));
    const createdSpace = spaces.create("private Space teal", "blue").find(space => space.name === "private Space teal")!;
    spaces.update(createdSpace.id, { name: "private Space coral" });
    expect(spaces.list().find(space => space.id === createdSpace.id)?.name).toBe("private Space coral");
    expect(protectedTasks.get(task.taskId).objective).toBe("private objective umber");
    expect(protectedTasks.details(task.taskId).revisions[0]?.criteria[0]?.description).toBe("private criterion umber");
    expect(protectedRepo.taskForConversation("chat")).toBe(task.taskId);
    expect(protectedEvidence.receipt(task.taskId).criteria[0]?.review?.note).toBe("private review umber");
    expect(protectedEvidence.receipt(task.taskId).verifications[0]?.verificationId).toBeTruthy();
    const updated = protectedTasks.update({ taskId: task.taskId, expectedRevision: 1,
      title: "private task coral", objective: "private objective coral" });
    expect(updated.revision).toBe(2);
    expect(protectedTasks.list({ query: "objective coral" })[0]?.taskId).toBe(task.taskId);
    compactProtectedSqlite(db);
    db.prepare("VACUUM INTO ?").run(newBackup);
    expect(readFileSync(oldBackup).includes("private objective umber")).toBe(true);
    for (const path of [file, newBackup, `${file}-wal`]) {
      expect(!existsSync(path) || !readFileSync(path).includes("private objective umber")).toBe(true);
      expect(!existsSync(path) || !readFileSync(path).includes("private evidence umber")).toBe(true);
      expect(!existsSync(path) || !readFileSync(path).includes("private review umber")).toBe(true);
    }
    db.close();
    db = openDb(file);
    const reopened = new Repo(db, await SqliteColumnCipher.create(secrets.secrets, "profile-one", true));
    const restartedTasks = new TaskService(reopened, new EventBus(reopened));
    const restartedEvidence = new TaskEvidenceService(reopened, new EventBus(reopened));
    expect(restartedTasks.get(task.taskId).objective).toBe("private objective coral");
    expect(restartedEvidence.receipt(task.taskId, 1).criteria[0]?.evidence[0]?.record.summary)
      .toBe("private evidence umber");
    const rawEvidence = (db.prepare("SELECT json FROM task_evidence WHERE evidence_id=?").get(note.evidenceId) as { json: string }).json;
    expect(JSON.parse(cipher.decrypt("task_evidence", JSON.stringify([note.evidenceId]), "json", rawEvidence)).summary)
      .toBe("private evidence umber");
    expect(() => cipher.decrypt("task_evidence", JSON.stringify(["other-evidence"]), "json", rawEvidence)).toThrow();
    db.prepare("UPDATE tasks SET json='tampered plaintext' WHERE task_id=?").run(task.taskId);
    expect(() => restartedTasks.get(task.taskId)).toThrow(/plaintext/);
    db.prepare("UPDATE criterion_reviews SET json='tampered plaintext' WHERE task_id=?").run(task.taskId);
    expect(migrateSensitiveTable(db, cipher, "criterion_reviews")).toBe(0);
    expect(() => restartedEvidence.receipt(task.taskId, 1)).toThrow(/plaintext/);
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

it("protects operation implementations and reconciliation notes", async () => {
  const directory = mkdtempSync(join(tmpdir(), "aux-protected-operations-"));
  const file = join(directory, "state.sqlite");
  const oldBackup = join(directory, "old.sqlite");
  const newBackup = join(directory, "new.sqlite");
  const secrets = fixture();
  let db = openDb(file);
  try {
    const legacy = new Repo(db);
    legacy.saveOperation({ operationId: "operation", siteKey: "example.test", name: "fill" });
    legacy.saveImplementation({ implId: "old-impl", operationId: "operation", kind: "program",
      executable: "private executable teal", evidence: [{ note: "private evidence teal" }],
      stats: { note: "private stats teal" } });
    legacy.saveInvocation({ invocationId: "old-invocation", operationId: "operation", status: "running", startedAt: 1 });
    legacy.saveOperationReconciliation({ invocationId: "old-invocation", taskId: "task", taskRevision: 1,
      outcome: "applied", evidenceId: "evidence", note: "private reconciliation teal", recordedAt: 2 });
    db.prepare("VACUUM INTO ?").run(oldBackup);
    const cipher = await SqliteColumnCipher.create(secrets.secrets, "profile-one", false);
    expect(migrateSensitiveTable(db, cipher, "operation_implementations")).toBe(3);
    expect(migrateSensitiveTable(db, cipher, "operation_reconciliations")).toBe(1);
    const protectedRepo = new Repo(db, cipher);
    expect(protectedRepo.listImplementations("operation")[0]?.executable).toBe("private executable teal");
    protectedRepo.setImplState("old-impl", "validated", [{ note: "private updated evidence teal" }]);
    protectedRepo.saveImplementation({ implId: "new-impl", operationId: "operation", kind: "program",
      executable: "private executable coral", evidence: [], stats: { score: 1 } });
    protectedRepo.saveInvocation({ invocationId: "new-invocation", operationId: "operation", status: "running", startedAt: 3 });
    protectedRepo.saveOperationReconciliation({ invocationId: "new-invocation", taskId: "task", taskRevision: 1,
      outcome: "not_applied", evidenceId: "evidence", note: "private reconciliation coral", recordedAt: 4 });
    expect(protectedRepo.listImplementations("operation", "validated")[0]?.evidence)
      .toEqual([{ note: "private updated evidence teal" }]);
    compactProtectedSqlite(db);
    db.prepare("VACUUM INTO ?").run(newBackup);
    expect(readFileSync(oldBackup).includes("private executable teal")).toBe(true);
    for (const path of [file, newBackup, `${file}-wal`]) {
      expect(!existsSync(path) || !readFileSync(path).includes("private executable teal")).toBe(true);
      expect(!existsSync(path) || !readFileSync(path).includes("private reconciliation teal")).toBe(true);
    }
    db.close();
    db = openDb(file);
    const reopenedCipher = await SqliteColumnCipher.create(secrets.secrets, "profile-one", true);
    const reopened = new Repo(db, reopenedCipher);
    expect(reopened.listImplementations("operation").map(implementation => implementation.executable).sort())
      .toEqual(["private executable coral", "private executable teal"]);
    const note = db.prepare("SELECT note FROM operation_reconciliations WHERE invocation_id='new-invocation'").get() as
      { note: string };
    expect(reopenedCipher.decrypt("operation_reconciliations", JSON.stringify(["new-invocation"]), "note", note.note))
      .toBe("private reconciliation coral");
    db.prepare("UPDATE operation_implementations SET executable='tampered plaintext' WHERE impl_id='old-impl'").run();
    expect(() => reopened.listImplementations("operation")).toThrow(/plaintext/);
  } finally { db.close(); secrets.close(); rmSync(directory, { recursive: true, force: true }); }
});

it("protects step inputs and preserves paged download lookup", async () => {
  const directory = mkdtempSync(join(tmpdir(), "aux-protected-steps-"));
  const file = join(directory, "state.sqlite");
  const oldBackup = join(directory, "old.sqlite");
  const newBackup = join(directory, "new.sqlite");
  const secrets = fixture();
  let db = openDb(file);
  try {
    const legacy = new Repo(db);
    legacy.saveStep({ stepId: "target", runId: "run", op: "download",
      inputs: { downloadId: "private-download-amber" }, expected: "private expected amber",
      outcome: { stepId: "target", op: "download", status: "ok", startedAt: 1, durationMs: 1,
        after: { note: "private outcome amber" } }, startedAt: 1 });
    for (let i = 0; i < 260; i++) legacy.saveStep({ stepId: `other-${i}`, runId: "run", op: "download",
      inputs: { downloadId: `other-${i}` }, startedAt: 2 + i });
    db.prepare("VACUUM INTO ?").run(oldBackup);
    const cipher = await SqliteColumnCipher.create(secrets.secrets, "profile-one", false);
    expect(migrateSensitiveTable(db, cipher, "steps")).toBe(263);
    const protectedRepo = new Repo(db, cipher);
    expect(protectedRepo.downloadStep("private-download-amber")?.expected).toBe("private expected amber");
    protectedRepo.saveStep({ stepId: "new", runId: "run", op: "download",
      inputs: { downloadId: "private-download-coral" }, startedAt: 300 });
    expect(protectedRepo.downloadStep("private-download-coral")?.stepId).toBe("new");
    expect(protectedRepo.listStepsByOpForRuns(["run"], "download")).toHaveLength(262);
    compactProtectedSqlite(db);
    db.prepare("VACUUM INTO ?").run(newBackup);
    expect(readFileSync(oldBackup).includes("private-download-amber")).toBe(true);
    for (const path of [file, newBackup, `${file}-wal`]) {
      expect(!existsSync(path) || !readFileSync(path).includes("private-download-amber")).toBe(true);
    }
    db.close();
    db = openDb(file);
    const reopened = new Repo(db, await SqliteColumnCipher.create(secrets.secrets, "profile-one", true));
    expect(reopened.downloadStep("private-download-amber")?.stepId).toBe("target");
    db.prepare("UPDATE steps SET inputs='tampered plaintext' WHERE step_id='target'").run();
    expect(() => reopened.downloadStep("private-download-amber")).toThrow(/plaintext/);
  } finally { db.close(); secrets.close(); rmSync(directory, { recursive: true, force: true }); }
});


it("skips protected table and KV rows on matching markers and rejects changed inventories", async () => {
  const f = fixture();
  try {
    const cipher = await SqliteColumnCipher.create(f.secrets, "profile-one", false);
    const repo = new Repo(f.db);
    repo.saveModelCall({ callId: "row", role: "agent", modelId: "model", durationMs: 1,
      error: "private", createdAt: 1 });
    repo.setSetting("sample", "private");
    migrateSensitiveTable(f.db, cipher, "model_calls");
    migrateSensitiveKv(f.db, cipher);
    const decrypt = vi.spyOn(cipher, "decrypt").mockImplementation(() => { throw new Error("boot scan"); });
    const changes = f.db.prepare("SELECT total_changes() AS n").get();
    expect(migrateSensitiveTable(f.db, cipher, "model_calls")).toBe(0);
    expect(migrateSensitiveKv(f.db, cipher)).toBe(0);
    expect(decrypt).not.toHaveBeenCalled();
    expect(f.db.prepare("SELECT total_changes() AS n").get()).toEqual(changes);
    f.db.prepare("UPDATE aux_meta SET value='changed' WHERE key='protected_sqlite_v1:model_calls'").run();
    expect(() => migrateSensitiveTable(f.db, cipher, "model_calls")).toThrow(/inventory changed/);
    f.db.prepare("UPDATE aux_meta SET value='changed' WHERE key='protected_sqlite_v1:kv_filtered'").run();
    expect(() => migrateSensitiveKv(f.db, cipher)).toThrow(/inventory changed/);
    decrypt.mockRestore();
  } finally { f.close(); }
});
