import { createHash, randomBytes } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";
import { openDb, Repo } from "@aux/runtime";
import { CalendarConnectionService } from "../../apps/runtime/src/services/calendar-connections.js";
import type { NativeBridge } from "../../apps/runtime/src/native.js";
import { createRuntimeBackup } from "../../apps/runtime/src/services/runtime-backup.js";
import { initializeFieldCodec } from "../../apps/runtime/src/store/field-codec.js";

const scope = "https://www.googleapis.com/auth/calendar.readonly";
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

it("encrypts Calendar metadata at write time and preserves unique reconnects, backup and restart", async () => {
  const dataDir = mkdtempSync(join(tmpdir(), "aux-calendar-protected-"));
  const dbPath = join(dataDir, "aux-state.sqlite");
  const native = nativeSecrets();
  const db = openDb(dbPath);
  let repo = new Repo(db, await initializeFieldCodec(db, native as unknown as NativeBridge, "profile-one"));
  let service: CalendarConnectionService | undefined;
  try {
    service = calendar(repo, native);
    expect(await connect(service, "alice")).toBe(200);
    const connectionId = service.list().connections[0]!.connectionId;
    expect(service.list().connections[0]).toMatchObject({
      connectionId: connectionId,
      accountKey: "alice@example.test",
      label: "Calendar alice",
    });
    expect(await connect(service, "alice")).toBe(200);
    expect(service.list().connections).toHaveLength(1);
    expect(service.list().connections[0]?.connectionId).toBe(connectionId);
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

    const restarted = openDb(dbPath);
    repo = new Repo(
      restarted,
      await initializeFieldCodec(restarted, native as unknown as NativeBridge, "profile-one"),
    );
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
      .run(connectionId);
    expect(() => service!.list()).toThrow();
    expect(await connect(service, "alice")).toBe(400);
    expect((repo.db.prepare("SELECT count(*) AS n FROM calendar_connections").get() as { n: number }).n).toBe(
      2,
    );
    repo.db
      .prepare("UPDATE calendar_connections SET account_key_lookup=? WHERE connection_id=?")
      .run(lookup, connectionId);
    const other = repo.db
      .prepare("SELECT account_key FROM calendar_connections WHERE connection_id<>?")
      .get(connectionId) as { account_key: string };
    repo.db
      .prepare("UPDATE calendar_connections SET account_key=? WHERE connection_id=?")
      .run(other.account_key, connectionId);
    expect(() => service!.list()).toThrow();
  } finally {
    await service?.close();
    repo.close();
    rmSync(dataDir, { recursive: true, force: true });
  }
});

it("rejects wrong-row Calendar metadata without changing another account", async () => {
  const db = openDb(":memory:");
  const native = nativeSecrets();
  const codec = await initializeFieldCodec(db, native as unknown as NativeBridge, "profile-one");
  const repo = new Repo(db, codec);
  const service = calendar(repo, native);
  try {
    expect(await connect(service, "alice")).toBe(200);
    expect(await connect(service, "bob")).toBe(200);
    const first = service.list().connections.find((item) => item.accountKey === "alice@example.test")!;
    const second = service.list().connections.find((item) => item.accountKey === "bob@example.test")!;
    db.prepare("UPDATE calendar_connections SET label=? WHERE connection_id=?").run(
      codec.encrypt("calendar_connections", JSON.stringify([first.connectionId]), "label", "wrong row"),
      second.connectionId,
    );
    expect(() => service.list()).toThrow();
    const raw = db
      .prepare("SELECT label FROM calendar_connections WHERE connection_id=?")
      .get(first.connectionId) as { label: string };
    expect(
      codec.decrypt("calendar_connections", JSON.stringify([first.connectionId]), "label", raw.label),
    ).toBe("Calendar alice");
  } finally {
    await service.close();
    repo.close();
  }
});
