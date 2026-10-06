import { createHash, randomBytes } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";
import { AgentConnectionService, openDb, Repo, TaskService, EventBus, VaultService } from "@aux/runtime";
import type { NativeBridge } from "../../apps/runtime/src/native.js";
import { createRuntimeBackup } from "../../apps/runtime/src/services/runtime-backup.js";
import {
  compactProtectedSqlite,
  migrateSensitiveKv,
  migrateSensitiveTable,
  SqliteColumnCipher,
} from "../../apps/runtime/src/store/sqlite-protection.js";

const TABLES = ["agent_connections", "vault_items", "vault_grants", "vault_access"] as const;

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

it("protects migrated and fresh connection/vault metadata through restart and backup", async () => {
  const dataDir = mkdtempSync(join(tmpdir(), "aux-credential-metadata-"));
  const dbPath = join(dataDir, "aux-state.sqlite");
  const native = nativeSecrets();
  let repo = new Repo(openDb(dbPath));
  try {
    const workspaceId = new TaskService(repo, new EventBus(repo)).createWorkspace("Connections").workspaceId;
    let connections = new AgentConnectionService(repo);
    const legacy = connections.create({
      name: "Private agent label",
      client: "codex",
      scope: { kind: "workspace", workspaceId },
    });
    let vault = new VaultService(repo, native as unknown as NativeBridge);
    vault.lock("vault-passphrase");
    vault.unlock("vault-passphrase");
    const item = await vault.save({
      label: "Private bank account",
      username: "sensitive-user",
      accountLabel: "sensitive-account",
      origin: "https://private.example",
      secret: "keychain-only-secret",
    });
    const grant = vault.grant({ itemId: item.itemId, origin: "https://private.example" });
    expect(vault.history(item.itemId).some((record) => record.detail === "Private bank account")).toBe(true);
    repo.close();

    const cipher = await SqliteColumnCipher.create(native, "profile-one", false);
    repo = new Repo(openDb(dbPath), cipher);
    migrateSensitiveKv(repo.db, cipher);
    for (const table of TABLES) expect(migrateSensitiveTable(repo.db, cipher, table)).toBeGreaterThan(0);
    compactProtectedSqlite(repo.db);
    connections = new AgentConnectionService(repo);
    vault = new VaultService(repo, native as unknown as NativeBridge);
    expect(connections.authorize(legacy.token)?.connectionId).toBe(legacy.connection.connectionId);
    expect(connections.list()[0]?.name).toBe("Private agent label");
    expect(vault.itemsForOrigin("https://private.example").map((record) => record.itemId)).toContain(
      item.itemId,
    );
    expect(
      vault.grants({ origin: "https://private.example", accountLabels: ["sensitive-account"] })[0]?.grantId,
    ).toBe(grant.grantId);
    expect(vault.grants({ origin: "https://other.example" })).toEqual([]);
    await expect(
      vault.revealForFill(grant.credentialRef, { pageId: "page", origin: "https://other.example" }),
    ).rejects.toMatchObject({ code: "conflict" });
    expect(vault.history(item.itemId).some((record) => record.detail === "Private bank account")).toBe(true);
    const fresh = connections.create({
      name: "Fresh private agent",
      client: "claude",
      scope: { kind: "workspace", workspaceId },
    });
    const freshItem = await vault.save({
      label: "Fresh private login",
      origin: "https://fresh.example",
      secret: "fresh-keychain-secret",
    });
    const freshGrant = vault.grant({ itemId: freshItem.itemId, origin: "https://fresh.example" });
    const raw = TABLES.map((table) => JSON.stringify(repo.db.prepare(`SELECT * FROM ${table}`).all())).join(
      "",
    );
    for (const secret of [
      "Private agent label",
      "Private bank account",
      "sensitive-user",
      "sensitive-account",
      "https://private.example",
      "Fresh private agent",
      "Fresh private login",
      "https://fresh.example",
      "keychain-only-secret",
    ])
      expect(raw).not.toContain(secret);
    const backup = await createRuntimeBackup(repo, dataDir);
    const backupBytes = readFileSync(join(backup.path, "state.sqlite"));
    expect(backupBytes.includes(Buffer.from("Private bank account"))).toBe(false);
    expect(backupBytes.includes(Buffer.from("https://private.example"))).toBe(false);
    repo.close();

    const restartedCipher = await SqliteColumnCipher.create(native, "profile-one", true);
    repo = new Repo(openDb(dbPath), restartedCipher);
    expect(migrateSensitiveKv(repo.db, restartedCipher)).toBe(0);
    for (const table of TABLES) expect(migrateSensitiveTable(repo.db, restartedCipher, table)).toBe(0);
    connections = new AgentConnectionService(repo);
    vault = new VaultService(repo, native as unknown as NativeBridge);
    expect(connections.authorize(fresh.token)?.connectionId).toBe(fresh.connection.connectionId);
    expect(vault.grants({ origin: "https://fresh.example" })[0]?.grantId).toBe(freshGrant.grantId);
    await expect(
      vault.revealForFill(freshGrant.credentialRef, { pageId: "page", origin: "https://other.example" }),
    ).rejects.toMatchObject({ code: "conflict" });
    expect(
      existsSync(`${dbPath}-wal`)
        ? readFileSync(`${dbPath}-wal`).includes(Buffer.from("Private bank account"))
        : false,
    ).toBe(false);
    const otherLabel = (
      repo.db.prepare("SELECT label FROM vault_items WHERE item_id=?").get(item.itemId) as { label: string }
    ).label;
    repo.db.prepare("UPDATE vault_items SET label=? WHERE item_id=?").run(otherLabel, freshItem.itemId);
    expect(() => vault.list()).toThrow();
  } finally {
    repo.close();
    rmSync(dataDir, { recursive: true, force: true });
  }
});

it("rolls back a credential metadata table migration on mismatched authenticated identity", async () => {
  const repo = new Repo(openDb(":memory:"));
  try {
    repo.db
      .prepare(
        "INSERT INTO vault_items(item_id,label,kind,origin,created_at,updated_at) VALUES('first','first-private','password','https://first.example',1,1)",
      )
      .run();
    repo.db
      .prepare(
        "INSERT INTO vault_items(item_id,label,kind,origin,created_at,updated_at) VALUES('second','second-private','password','https://second.example',1,1)",
      )
      .run();
    const cipher = await SqliteColumnCipher.create(nativeSecrets(), "profile-one", false);
    repo.db
      .prepare("UPDATE vault_items SET label=? WHERE item_id='second'")
      .run(cipher.encrypt("vault_items", JSON.stringify(["wrong"]), "label", "tampered"));
    expect(() => migrateSensitiveTable(repo.db, cipher, "vault_items")).toThrow();
    expect(
      (repo.db.prepare("SELECT label FROM vault_items WHERE item_id='first'").get() as { label: string })
        .label,
    ).toBe("first-private");
    expect(
      repo.db.prepare("SELECT value FROM aux_meta WHERE key='protected_sqlite_v1:vault_items'").get(),
    ).toBeUndefined();
  } finally {
    repo.close();
  }
});
