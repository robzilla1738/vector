import { createHash, randomBytes } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";
import { openDb, Repo } from "@aux/runtime";
import { CalendarConnectionService } from "../../apps/runtime/src/services/calendar-connections.js";
import type { NativeBridge } from "../../apps/runtime/src/native.js";
import { createRuntimeBackup } from "../../apps/runtime/src/services/runtime-backup.js";
import {
  compactProtectedSqlite,
  migrateCalendarConnections,
  SqliteColumnCipher,
} from "../../apps/runtime/src/store/sqlite-protection.js";

const scope = "https://www.googleapis.com/auth/calendar.readonly";
const LEGACY_ID = "00000000-0000-4000-8000-000000000001";
const endpoints = {
  auth: "https://provider.test/auth",
  token: "https://provider.test/token",
  revoke: "https://provider.test/revoke",
  calendar: "https://provider.test/calendar",
};

function nativeSecrets() {
  const saved = new Map<string, string>();
  const name = (prefix: string) =>
    `${prefix}_${createHash("sha256").update("profile-one").digest("hex").slice(0, 24)}`;
  return {
    available: () => true,
    async readSecret(key: string) {
      return { value: saved.get(key) };
    },
    async storeSecret(key: string, value: string) {
      saved.set(key, value);
      return { ok: true as const };
    },
    async profileStorageRoot() {
      const key = name("aux_root_v1");
      if (!saved.has(key)) saved.set(key, randomBytes(32).toString("base64"));
      return { value: saved.get(key)! };
    },
    async profileStorageFactor() {
      const key = name("sqlite_factor_v1");
      if (!saved.has(key)) saved.set(key, randomBytes(32).toString("base64"));
      return { value: saved.get(key)! };
    },
  };
}

function calendar(repo: Repo, native: ReturnType<typeof nativeSecrets>) {
  const http: typeof fetch = async (input, init) => {
    const url = new URL(String(input));
    if (url.pathname === "/token") {
      const account = new URLSearchParams(init?.body as URLSearchParams).get("code")!;
      return Response.json({
        access_token: `access-${account}`,
        refresh_token: `refresh-${account}`,
        scope,
        expires_in: 3600,
      });
    }
    if (url.pathname === "/calendar/users/me/calendarList/primary") {
      const account = String((init?.headers as Record<string, string> | undefined)?.Authorization).replace(
        "Bearer access-",
        "",
      );
      return Response.json({ id: `${account}@example.test`, summary: `Calendar ${account}`, primary: true });
    }
    throw new Error(`Unexpected Calendar test request ${url.pathname}`);
  };
  return new CalendarConnectionService({
    repo,
    native: native as unknown as NativeBridge,
    clientId: "desktop-client",
    fetch: http,
    endpoints,
  });
}

async function connect(service: CalendarConnectionService, account: string) {
  const auth = await service.start();
  const url = new URL(auth.url);
  const callback = new URL(url.searchParams.get("redirect_uri")!);
  callback.searchParams.set("state", url.searchParams.get("state")!);
  callback.searchParams.set("code", account);
  return (await fetch(callback)).status;
}

it("migrates legacy Calendar accounts, preserves unique reconnects, and protects backup and restart", async () => {
  const dataDir = mkdtempSync(join(tmpdir(), "aux-calendar-protected-"));
  const dbPath = join(dataDir, "aux-state.sqlite");
  const native = nativeSecrets();
  let repo = new Repo(openDb(dbPath));
  let service: CalendarConnectionService | undefined;
  try {
    repo.db
      .prepare(
        `INSERT INTO calendar_connections(connection_id,provider,account_key,label,secret_name,scopes,state,created_at,updated_at)
      VALUES(?,'google','alice@example.test','Calendar alice','calendar-legacy',?,'active',1,1)`,
      )
      .run(LEGACY_ID, JSON.stringify([scope]));
    repo.db.exec("DROP INDEX idx_calendar_account_active");
    repo.db.exec("ALTER TABLE calendar_connections DROP COLUMN account_key_lookup");
    repo.db.exec(
      "CREATE UNIQUE INDEX idx_calendar_account_active ON calendar_connections(provider,account_key) WHERE revoked_at IS NULL",
    );
    repo.db.exec("PRAGMA user_version=26");
    repo.close();

    const cipher = await SqliteColumnCipher.create(native, "profile-one", false);
    repo = new Repo(openDb(dbPath), cipher);
    expect(migrateCalendarConnections(repo.db, cipher)).toBe(3);
    compactProtectedSqlite(repo.db);
    service = calendar(repo, native);
    expect(service.list().connections[0]).toMatchObject({
      connectionId: LEGACY_ID,
      accountKey: "alice@example.test",
      label: "Calendar alice",
    });
    expect(await connect(service, "alice")).toBe(200);
    expect(service.list().connections).toHaveLength(1);
    expect(service.list().connections[0]?.connectionId).toBe(LEGACY_ID);
    expect(await connect(service, "bob")).toBe(200);
    expect(
      service
        .list()
        .connections.map((row) => row.accountKey)
        .sort(),
    ).toEqual(["alice@example.test", "bob@example.test"]);
    const raw = JSON.stringify(repo.db.prepare("SELECT * FROM calendar_connections").all());
    expect(raw).not.toContain("alice@example.test");
    expect(raw).not.toContain("bob@example.test");
    expect(raw).not.toContain("Calendar alice");
    expect(() =>
      repo.db
        .prepare(
          `INSERT INTO calendar_connections(connection_id,provider,account_key,account_key_lookup,label,secret_name,scopes,state,created_at,updated_at)
      VALUES('duplicate','google','arbitrary',?,'label','secret-duplicate','[]','active',1,1)`,
        )
        .run(repo.exactRecordLookup("calendar_connections", "account_key", "alice@example.test")),
    ).toThrow();
    const backup = await createRuntimeBackup(repo, dataDir);
    const bytes = readFileSync(join(backup.path, "state.sqlite"));
    expect(bytes.includes(Buffer.from("alice@example.test"))).toBe(false);
    expect(bytes.includes(Buffer.from("Calendar alice"))).toBe(false);
    await service.close();
    service = undefined;
    repo.close();

    const restartedCipher = await SqliteColumnCipher.create(native, "profile-one", true);
    repo = new Repo(openDb(dbPath), restartedCipher);
    expect(migrateCalendarConnections(repo.db, restartedCipher)).toBe(0);
    service = calendar(repo, native);
    expect(service.list().connections).toHaveLength(2);
    expect(
      existsSync(`${dbPath}-wal`)
        ? readFileSync(`${dbPath}-wal`).includes(Buffer.from("alice@example.test"))
        : false,
    ).toBe(false);
    const lookup = repo.exactRecordLookup("calendar_connections", "account_key", "alice@example.test");
    repo.db
      .prepare("UPDATE calendar_connections SET account_key_lookup='invalid' WHERE connection_id=?")
      .run(LEGACY_ID);
    expect(() => service!.list()).toThrow();
    expect(await connect(service, "alice")).toBe(400);
    expect((repo.db.prepare("SELECT count(*) AS n FROM calendar_connections").get() as { n: number }).n).toBe(
      2,
    );
    repo.db
      .prepare("UPDATE calendar_connections SET account_key_lookup=? WHERE connection_id=?")
      .run(lookup, LEGACY_ID);
    const other = repo.db
      .prepare("SELECT account_key FROM calendar_connections WHERE connection_id<>?")
      .get(LEGACY_ID) as { account_key: string };
    repo.db
      .prepare("UPDATE calendar_connections SET account_key=? WHERE connection_id=?")
      .run(other.account_key, LEGACY_ID);
    expect(() => service!.list()).toThrow();
  } finally {
    await service?.close();
    repo.close();
    rmSync(dataDir, { recursive: true, force: true });
  }
});

it("rolls back Calendar conversion on duplicate active lookup or wrong-row ciphertext", async () => {
  const repo = new Repo(openDb(":memory:"));
  try {
    const insert = repo.db
      .prepare(`INSERT INTO calendar_connections(connection_id,provider,account_key,label,secret_name,scopes,state,created_at,updated_at)
      VALUES(?,'google',?,?,?,'[]','active',1,1)`);
    insert.run("first", "alice@example.test", "private-first", "secret-first");
    insert.run("second", "bob@example.test", "private-second", "secret-second");
    const cipher = await SqliteColumnCipher.create(nativeSecrets(), "profile-one", false);
    repo.db
      .prepare("UPDATE calendar_connections SET label=? WHERE connection_id='second'")
      .run(cipher.encrypt("calendar_connections", JSON.stringify(["wrong"]), "label", "tampered"));
    expect(() => migrateCalendarConnections(repo.db, cipher)).toThrow();
    expect(
      (
        repo.db.prepare("SELECT label FROM calendar_connections WHERE connection_id='first'").get() as {
          label: string;
        }
      ).label,
    ).toBe("private-first");
    expect(
      repo.db
        .prepare("SELECT value FROM aux_meta WHERE key='protected_sqlite_v1:calendar_connections'")
        .get(),
    ).toBeUndefined();
    repo.db
      .prepare(
        "UPDATE calendar_connections SET label='private-second',account_key='alice@example.test' WHERE connection_id='second'",
      )
      .run();
    expect(() => migrateCalendarConnections(repo.db, cipher)).toThrow();
    expect(
      (
        repo.db.prepare("SELECT account_key FROM calendar_connections WHERE connection_id='first'").get() as {
          account_key: string;
        }
      ).account_key,
    ).toBe("alice@example.test");
  } finally {
    repo.close();
  }
});
