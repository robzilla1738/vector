import { afterEach, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { openDb, SCHEMA_VERSION } from "@aux/runtime";
import { xTablesForDatabase } from "../../apps/runtime/src/store/db.js";
import { encryptedFieldsForDatabase } from "../../apps/runtime/src/store/field-codec.js";
const paths: string[] = [];
afterEach(() => {
  for (const dir of paths.splice(0)) rmSync(dir, { recursive: true, force: true });
});
function path() {
  const dir = mkdtempSync(join(tmpdir(), "aux-x-schema-"));
  paths.push(dir);
  return join(dir, "state.sqlite");
}
it("migrates schema10 preserving Google and source documents while adding only encrypted X authority", () => {
  const file = path(),
    old = openDb(file);
  old.exec(
    "DROP TABLE x_task_grants;DROP TABLE x_accounts;DROP TABLE x_credential_jobs;PRAGMA user_version=10;INSERT INTO kv VALUES('marker','kept')",
  );
  expect(encryptedFieldsForDatabase(old)).not.toHaveProperty("x_accounts");
  old.close();
  const next = openDb(file);
  try {
    expect(next.prepare("PRAGMA user_version").get()).toEqual({ user_version: SCHEMA_VERSION });
    expect(next.prepare("SELECT value FROM kv WHERE key='marker'").get()).toEqual({ value: "kept" });
    expect(xTablesForDatabase(next)).toEqual(["x_accounts", "x_credential_jobs", "x_task_grants"]);
    expect(encryptedFieldsForDatabase(next)).toMatchObject({
      x_accounts: ["body"],
      x_task_grants: ["body"],
      x_credential_jobs: ["body"],
    });
  } finally {
    next.close();
  }
});
it("rejects unexpected historical X tables before mutation", () => {
  const file = path(),
    db = openDb(file);
  db.exec(
    "DROP TABLE x_task_grants;DROP TABLE x_accounts;DROP TABLE x_credential_jobs;CREATE TABLE x_accounts(sentinel TEXT);INSERT INTO x_accounts VALUES('kept');PRAGMA user_version=10",
  );
  db.close();
  expect(() => openDb(file)).toThrow(/historical database schema/);
  const preserved = new DatabaseSync(file);
  try {
    expect(preserved.prepare("PRAGMA user_version").get()).toEqual({ user_version: 10 });
    expect(preserved.prepare("SELECT * FROM x_accounts").get()).toEqual({ sentinel: "kept" });
  } finally {
    preserved.close();
  }
});
it("refuses missing grant indexes and changed protected identities", () => {
  for (const mutation of [
    "DROP INDEX idx_x_task_grants_task",
    "ALTER TABLE x_accounts ADD COLUMN unexpected TEXT",
    "DROP TABLE x_credential_jobs",
  ]) {
    const file = path(),
      db = openDb(file);
    db.exec(mutation);
    db.close();
    expect(() => openDb(file)).toThrow(/Protected X/);
  }
});
