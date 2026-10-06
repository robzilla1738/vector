import { fakeTransport } from "../fixtures/mcp-transport.js";
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
    let service = new OutboundMcpService(repo, async () => fakeTransport([]));
    const server = await service.register({
      workspaceId,
      name: "Synthetic MCP source",
      source: { kind: "local", command: "/bin/echo", args: ["synthetic-command"], cwd: "/tmp" },
    });
    await service.listTools(server.serverId);
    const catalog = service.get(server.serverId);
    service.setEnabled({
      serverId: server.serverId,
      toolName: "read",
      enabled: false,
      expectedRevision: catalog.toolsRevision,
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
    expect(service.get(server.serverId)).toMatchObject({
      name: "Synthetic MCP source",
      state: "active",
      toolsRevision: 2,
      toolNames: ["read"],
      disabledTools: ["read"],
    });
    expect(() =>
      service.setEnabled({ serverId: server.serverId, toolName: "read", enabled: true, expectedRevision: 1 }),
    ).toThrow(/changed/);
    expect(
      service.setEnabled({ serverId: server.serverId, toolName: "read", enabled: true, expectedRevision: 2 })
        .disabledTools,
    ).toEqual([]);
    expect(service.revoke(server.serverId).state).toBe("revoked");
  } finally {
    repo.close();
    rmSync(dataDir, { recursive: true, force: true });
  }
});
