import { createHash, randomBytes } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";
import { EventBus, openDb, OutboundMcpService, Repo, TaskService } from "@aux/runtime";
import { createRuntimeBackup } from "../../apps/runtime/src/services/runtime-backup.js";
import { compactProtectedSqlite, migrateSensitiveTable, SqliteColumnCipher } from
  "../../apps/runtime/src/store/sqlite-protection.js";

function secrets() {
  const saved = new Map<string, string>();
  const name = (prefix: string) => `${prefix}_${createHash("sha256").update("profile-one").digest("hex").slice(0, 24)}`;
  return {
    async readSecret(key: string) { return { value: saved.get(key) }; },
    async storeSecret(key: string, value: string) { saved.set(key, value); return { ok: true as const }; },
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

it("migrates supervised MCP authority, protects fresh records, and survives restart and backup", async () => {
  const dataDir = mkdtempSync(join(tmpdir(), "aux-mcp-protected-"));
  const dbPath = join(dataDir, "aux-state.sqlite");
  const native = secrets();
  let repo = new Repo(openDb(dbPath));
  try {
    const workspaceId = new TaskService(repo, new EventBus(repo)).createWorkspace("MCP").workspaceId;
    let service = new OutboundMcpService(repo);
    const first = await service.register({ workspaceId, name: "Private MCP source",
      source: { kind: "local", command: "/bin/echo", args: ["internal-command"], cwd: "/tmp" } });
    service.approve(first.serverId, first.sourceDigest);
    const grant = service.grant({ serverId: first.serverId, toolName: "read",
      scope: { kind: "workspace", workspaceId }, mode: "once", outputTokenLimit: 100 });
    expect((repo.db.prepare("SELECT body FROM outbound_mcp_servers WHERE server_id=?").get(first.serverId) as { body: string }).body)
      .toContain("Private MCP source");
    repo.close();

    const cipher = await SqliteColumnCipher.create(native, "profile-one", false);
    repo = new Repo(openDb(dbPath), cipher);
    expect(migrateSensitiveTable(repo.db, cipher, "outbound_mcp_servers")).toBe(1);
    expect(migrateSensitiveTable(repo.db, cipher, "outbound_mcp_grants")).toBe(1);
    compactProtectedSqlite(repo.db);
    service = new OutboundMcpService(repo);
    expect(service.get(first.serverId)).toMatchObject({ name: "Private MCP source", state: "approved" });
    expect(service.getGrant(grant.grantId)).toMatchObject({ toolName: "read", mode: "once" });
    const next = await service.register({ workspaceId, name: "Fresh protected MCP source",
      source: { kind: "local", command: "/bin/echo", args: [], cwd: "/tmp" } });
    service.approve(next.serverId, next.sourceDigest);
    const nextGrant = service.grant({ serverId: next.serverId, toolName: "read",
      scope: { kind: "workspace", workspaceId }, mode: "standing", outputTokenLimit: 100 });
    expect(service.list(workspaceId).map(item => item.serverId)).toContain(next.serverId);
    expect(service.grants(next.serverId).map(item => item.grantId)).toContain(nextGrant.grantId);
    const raw = JSON.stringify(repo.db.prepare("SELECT body FROM outbound_mcp_servers").all())
      + JSON.stringify(repo.db.prepare("SELECT body FROM outbound_mcp_grants").all());
    expect(raw).not.toContain("Private MCP source");
    expect(raw).not.toContain("internal-command");
    expect(raw).not.toContain("Fresh protected MCP source");
    expect((repo.db.prepare("SELECT tool_name FROM outbound_mcp_grants WHERE grant_id=?").get(grant.grantId) as
      { tool_name: string }).tool_name).toBe("read");
    const backup = await createRuntimeBackup(repo, dataDir);
    const backupBytes = readFileSync(join(backup.path, "state.sqlite"));
    expect(backupBytes.includes(Buffer.from("Private MCP source"))).toBe(false);
    expect(backupBytes.includes(Buffer.from("internal-command"))).toBe(false);
    repo.close();

    const restartedCipher = await SqliteColumnCipher.create(native, "profile-one", true);
    repo = new Repo(openDb(dbPath), restartedCipher);
    expect(migrateSensitiveTable(repo.db, restartedCipher, "outbound_mcp_servers")).toBe(0);
    expect(migrateSensitiveTable(repo.db, restartedCipher, "outbound_mcp_grants")).toBe(0);
    const restarted = new OutboundMcpService(repo);
    expect(restarted.getGrant(nextGrant.grantId).serverId).toBe(next.serverId);
    expect(restarted.revokeGrant(grant.grantId).revokedAt).toBeDefined();
    expect(restarted.revoke(next.serverId).state).toBe("revoked");
    expect(existsSync(`${dbPath}-wal`) ? readFileSync(`${dbPath}-wal`).includes(Buffer.from("Private MCP source")) : false)
      .toBe(false);
    const otherBody = (repo.db.prepare("SELECT body FROM outbound_mcp_servers WHERE server_id=?").get(first.serverId) as
      { body: string }).body;
    repo.db.prepare("UPDATE outbound_mcp_servers SET body=? WHERE server_id=?").run(otherBody, next.serverId);
    expect(() => restarted.get(next.serverId)).toThrow();
  } finally { repo.close(); rmSync(dataDir, { recursive: true, force: true }); }
});

it("rolls back an outbound MCP family migration if an encrypted row has wrong identity", async () => {
  const repo = new Repo(openDb(":memory:"));
  try {
    const workspaceId = new TaskService(repo, new EventBus(repo)).createWorkspace("MCP").workspaceId;
    repo.db.prepare("INSERT INTO outbound_mcp_servers(server_id,workspace_id,state,body,created_at,updated_at) VALUES(?,?,?,?,?,?)")
      .run("first", workspaceId, "pending", '{"name":"legacy private"}', 1, 1);
    repo.db.prepare("INSERT INTO outbound_mcp_servers(server_id,workspace_id,state,body,created_at,updated_at) VALUES(?,?,?,?,?,?)")
      .run("second", workspaceId, "pending", '{"name":"second private"}', 2, 2);
    const cipher = await SqliteColumnCipher.create(secrets(), "profile-one", false);
    repo.db.prepare("UPDATE outbound_mcp_servers SET body=? WHERE server_id='second'")
      .run(cipher.encrypt("outbound_mcp_servers", JSON.stringify(["wrong"]), "body", "tampered"));
    expect(() => migrateSensitiveTable(repo.db, cipher, "outbound_mcp_servers")).toThrow();
    expect((repo.db.prepare("SELECT body FROM outbound_mcp_servers WHERE server_id='first'").get() as { body: string }).body)
      .toContain("legacy private");
    expect(repo.db.prepare("SELECT value FROM aux_meta WHERE key='protected_sqlite_v1:outbound_mcp_servers'").get())
      .toBeUndefined();
  } finally { repo.close(); }
});
