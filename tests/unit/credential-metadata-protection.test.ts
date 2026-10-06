import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";
import { AgentConnectionService, openDb, Repo, TaskService, EventBus, VaultService } from "@aux/runtime";
import type { NativeBridge } from "../../apps/runtime/src/native.js";
import { createRuntimeBackup } from "../../apps/runtime/src/services/runtime-backup.js";

it("keeps credential secrets in Keychain while metadata and grants survive restart and backup", async () => {
  const dataDir = mkdtempSync(join(tmpdir(), "aux-credential-metadata-"));
  const dbPath = join(dataDir, "aux-state.sqlite");
  const saved = new Map<string, string>();
  const native = {
    available: () => true,
    readSecret: async (key: string) => ({ value: saved.get(key) }),
    storeSecret: async (key: string, value: string) => {
      saved.set(key, value);
      return { ok: true as const };
    },
  } as unknown as NativeBridge;
  let repo = new Repo(openDb(dbPath));
  try {
    const workspaceId = new TaskService(repo, new EventBus(repo)).createWorkspace("Connections").workspaceId;
    let connections = new AgentConnectionService(repo);
    const agent = connections.create({
      name: "Synthetic agent",
      client: "codex",
      scope: { kind: "workspace", workspaceId },
    });
    let vault = new VaultService(repo, native);
    vault.lock("fixture-passphrase");
    vault.unlock("fixture-passphrase");
    const item = await vault.save({
      label: "Synthetic account",
      username: "fixture-user",
      accountLabel: "fixture-account",
      origin: "https://fixture.example",
      secret: "keychain-only-fixture-secret",
    });
    const grant = vault.grant({ itemId: item.itemId, origin: "https://fixture.example" });
    const raw = ["agent_connections", "vault_items", "vault_grants", "vault_access"]
      .map((table) => JSON.stringify(repo.db.prepare(`SELECT * FROM ${table}`).all()))
      .join("");
    expect(raw).toContain("Synthetic account");
    expect(raw).not.toContain("keychain-only-fixture-secret");
    expect(raw).not.toContain(agent.token);
    const backup = await createRuntimeBackup(repo, dataDir);
    const bytes = readFileSync(join(backup.path, "state.sqlite"));
    expect(bytes.includes(Buffer.from("Synthetic account"))).toBe(true);
    expect(bytes.includes(Buffer.from("keychain-only-fixture-secret"))).toBe(false);
    expect(bytes.includes(Buffer.from(agent.token))).toBe(false);
    repo.close();
    repo = new Repo(openDb(dbPath));
    connections = new AgentConnectionService(repo);
    vault = new VaultService(repo, native);
    expect(connections.authorize(agent.token)?.connectionId).toBe(agent.connection.connectionId);
    expect(connections.list()[0]?.name).toBe("Synthetic agent");
    expect(vault.itemsForOrigin("https://fixture.example").map((record) => record.itemId)).toContain(
      item.itemId,
    );
    expect(
      vault.grants({ origin: "https://fixture.example", accountLabels: ["fixture-account"] })[0]?.grantId,
    ).toBe(grant.grantId);
    expect(vault.grants({ origin: "https://other.example" })).toEqual([]);
    await expect(
      vault.revealForFill(grant.credentialRef, { pageId: "page", origin: "https://other.example" }),
    ).rejects.toMatchObject({ code: "conflict" });
    expect(vault.history(item.itemId).some((record) => record.detail === "Synthetic account")).toBe(true);
    connections.revoke(agent.connection.connectionId);
    expect(connections.authorize(agent.token)).toBeNull();
  } finally {
    repo.close();
    rmSync(dataDir, { recursive: true, force: true });
  }
});
