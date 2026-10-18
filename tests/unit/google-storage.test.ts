import { afterEach, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { openDb, SCHEMA_VERSION } from "@aux/runtime";
import { googleTablesForDatabase } from "../../apps/runtime/src/store/db.js";
import { encryptedFieldsForDatabase } from "../../apps/runtime/src/store/field-codec.js";
const directories: string[] = [];
afterEach(() => {
  for (const dir of directories.splice(0)) rmSync(dir, { recursive: true, force: true });
});
function path() {
  const dir = mkdtempSync(join(tmpdir(), "aux-google-schema-"));
  directories.push(dir);
  return join(dir, "state.sqlite");
}
it("migrates schema8 through current Google/document storage atomically while preserving owner records and historical encrypted inventories", () => {
  const file = path(),
    db = openDb(file);
  db.prepare("INSERT INTO kv VALUES('marker','retained')").run();
  db.exec("DROP TABLE x_task_grants; DROP TABLE x_accounts; DROP TABLE x_credential_jobs; DROP TABLE document_source_chunks");
  for (const table of googleTablesForDatabase(db)) db.exec(`DROP TABLE ${table}`);
  db.exec("PRAGMA user_version=8");
  expect(encryptedFieldsForDatabase(db)).not.toHaveProperty("google_task_grants");
  db.close();
  const upgraded = openDb(file);
  try {
    expect(upgraded.prepare("PRAGMA user_version").get()).toEqual({ user_version: SCHEMA_VERSION });
    expect(upgraded.prepare("SELECT value FROM kv WHERE key='marker'").get()).toEqual({ value: "retained" });
    expect(googleTablesForDatabase(upgraded)).toEqual(["google_task_grants"]);
    expect(encryptedFieldsForDatabase(upgraded).google_task_grants).toEqual(["body"]);
  } finally {
    upgraded.close();
  }
});
it("preserves a historical database with unexpected Google tables without applying migrations", () => {
  const file = path(),
    db = openDb(file);
  db.exec(
    "DROP TABLE x_task_grants;DROP TABLE x_accounts;DROP TABLE x_credential_jobs;DROP TABLE document_source_chunks;DROP TABLE google_task_grants;CREATE TABLE google_task_grants(sentinel TEXT);INSERT INTO google_task_grants VALUES('kept');PRAGMA user_version=8",
  );
  db.close();
  expect(() => openDb(file)).toThrow(/Google grant tables/);
  const preserved = new DatabaseSync(file);
  try {
    expect(preserved.prepare("PRAGMA user_version").get()).toEqual({ user_version: 8 });
    expect(preserved.prepare("SELECT * FROM google_task_grants").get()).toEqual({ sentinel: "kept" });
  } finally {
    preserved.close();
  }
});
it("refuses missing Google indexes or changed row identities instead of guessing authority", () => {
  for (const mutation of [
    "DROP INDEX idx_google_task_grants_task",
    "ALTER TABLE google_task_grants ADD COLUMN unexpected TEXT",
  ]) {
    const file = path(),
      db = openDb(file);
    db.exec(mutation);
    db.close();
    expect(() => openDb(file)).toThrow(/Protected Google grant/);
  }
});
