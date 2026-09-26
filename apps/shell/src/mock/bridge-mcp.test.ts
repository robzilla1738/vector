// @vitest-environment jsdom
import { webcrypto } from "node:crypto";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { AuxBridge } from "../bridge";
import { installMockBridge } from "./bridge";

let bridge: AuxBridge;
beforeEach(() => {
  vi.stubGlobal("crypto", webcrypto);
  const values = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  });
  installMockBridge(new URLSearchParams("scenario=start"));
  bridge = (window as unknown as { aux: AuxBridge }).aux;
});
afterEach(() => {
  vi.unstubAllGlobals();
});

it("requires source review before mock tool grants and revokes all grants with the server", async () => {
  const workspaceId = "workspace:space-personal";
  const source = { kind: "remote" as const, url: "https://tools.example/mcp", auth: "oauth" as const };
  const server = await bridge.invoke("mcp.servers.register", { workspaceId, name: "Research", source });
  expect(server.sourceDigest).toMatch(/^[a-f0-9]{64}$/);
  expect(server.state).toBe("pending");
  await expect(bridge.invoke("mcp.tools.list", { serverId: server.serverId })).rejects.toThrow(
    "Approve the server",
  );
  await expect(
    bridge.invoke("mcp.servers.approve", { serverId: server.serverId, expectedDigest: "0".repeat(64) }),
  ).rejects.toThrow("Server source changed");

  const approved = await bridge.invoke("mcp.servers.approve", {
    serverId: server.serverId,
    expectedDigest: server.sourceDigest,
  });
  expect(approved.state).toBe("approved");
  expect(
    (await bridge.invoke("mcp.tools.list", { serverId: server.serverId })).map((tool) => tool.name),
  ).toEqual(["search", "summarize"]);
  const grant = await bridge.invoke("mcp.grants.create", {
    serverId: server.serverId,
    toolName: "search",
    scope: { kind: "workspace", workspaceId },
    mode: "once",
    outputTokenLimit: 2000,
  });
  expect((await bridge.invoke("mcp.grants.list", { serverId: server.serverId }))[0]?.grantId).toBe(
    grant.grantId,
  );
  await bridge.invoke("mcp.servers.revoke", { serverId: server.serverId });
  expect((await bridge.invoke("mcp.grants.list", { serverId: server.serverId }))[0]?.revokedAt).toBeTypeOf(
    "number",
  );
  await expect(
    bridge.invoke("mcp.grants.create", {
      serverId: server.serverId,
      toolName: "search",
      scope: { kind: "workspace", workspaceId },
      mode: "once",
      outputTokenLimit: 2000,
    }),
  ).rejects.toThrow("Approve the server");
});

it("returns bounded bundle inspection fixture and rejects other suffixes", async () => {
  const result = await bridge.invoke("mcp.bundles.inspect", { path: "/tmp/research.mcpb" });
  expect(result).toMatchObject({ name: "Research bundle", format: "mcpb", sha256: "b".repeat(64) });
  await expect(bridge.invoke("mcp.bundles.inspect", { path: "/tmp/notes.txt" })).rejects.toThrow(
    "Choose a .mcpb or .dxt",
  );
});
