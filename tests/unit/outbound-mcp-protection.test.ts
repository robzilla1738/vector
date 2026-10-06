import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";
import { EventBus, openDb, OutboundMcpService, Repo, TaskService } from "@aux/runtime";
import { createRuntimeBackup } from "../../apps/runtime/src/services/runtime-backup.js";

it("preserves supervised MCP authority through restart and backup with ordinary metadata", async () => {
  const dataDir = mkdtempSync(join(tmpdir(), "aux-mcp-metadata-"));
  const dbPath = join(dataDir, "aux-state.sqlite");
  let repo = new Repo(openDb(dbPath));
  try {
    const workspaceId = new TaskService(repo, new EventBus(repo)).createWorkspace("MCP").workspaceId;
    let service = new OutboundMcpService(repo);
    const server = await service.register({
      workspaceId,
      name: "Synthetic MCP source",
      source: { kind: "local", command: "/bin/echo", args: ["synthetic-command"], cwd: "/tmp" },
    });
    service.approve(server.serverId, server.sourceDigest);
    const grant = service.grant({
      serverId: server.serverId,
      toolName: "read",
      scope: { kind: "workspace", workspaceId },
      mode: "once",
      outputTokenLimit: 100,
    });
    const raw = JSON.stringify(repo.db.prepare("SELECT body FROM outbound_mcp_servers").all());
    expect(raw).toContain("Synthetic MCP source");
    expect(raw).not.toContain("auxenc:");
    const backup = await createRuntimeBackup(repo, dataDir);
    expect(
      readFileSync(join(backup.path, "state.sqlite")).includes(Buffer.from("Synthetic MCP source")),
    ).toBe(true);
    repo.close();
    repo = new Repo(openDb(dbPath));
    service = new OutboundMcpService(repo);
    expect(service.get(server.serverId)).toMatchObject({ name: "Synthetic MCP source", state: "approved" });
    expect(service.getGrant(grant.grantId)).toMatchObject({ toolName: "read", mode: "once" });
    expect(service.grants(server.serverId).map((item) => item.grantId)).toContain(grant.grantId);
    expect(service.revokeGrant(grant.grantId).revokedAt).toBeDefined();
    expect(service.revoke(server.serverId).state).toBe("revoked");
  } finally {
    repo.close();
    rmSync(dataDir, { recursive: true, force: true });
  }
});
