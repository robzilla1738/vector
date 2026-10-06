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

it("models adding consent, exact catalog revisions, disabled tools and server revocation", async () => {
  const workspaceId = "workspace:space-personal";
  const source = { kind: "remote" as const, url: "https://tools.example/mcp", auth: "none" as const };
  const server = await bridge.invoke("mcp.servers.register", { workspaceId, name: "Research", source });
  expect(server.sourceDigest).toMatch(/^[a-f0-9]{64}$/);
  expect(server.state).toBe("active");
  expect(
    (await bridge.invoke("mcp.tools.list", { serverId: server.serverId })).map((tool) => tool.name),
  ).toEqual(["search", "summarize"]);
  const current = (await bridge.invoke("mcp.servers.list", { workspaceId })).find(
    (item) => item.serverId === server.serverId,
  )!;
  await expect(
    bridge.invoke("mcp.tools.setEnabled", {
      serverId: server.serverId,
      toolName: "search",
      enabled: false,
      expectedRevision: server.toolsRevision,
    }),
  ).rejects.toThrow("changed");
  const disabled = await bridge.invoke("mcp.tools.setEnabled", {
    serverId: server.serverId,
    toolName: "search",
    enabled: false,
    expectedRevision: current.toolsRevision,
  });
  expect(disabled.disabledTools).toEqual(["search"]);
  await expect(
    bridge.invoke("mcp.tools.call", {
      serverId: server.serverId,
      toolName: "search",
      arguments: {},
      context: { workspaceId },
    }),
  ).rejects.toThrow("unavailable");
  await bridge.invoke("mcp.servers.revoke", { serverId: server.serverId });
  await expect(bridge.invoke("mcp.tools.list", { serverId: server.serverId })).rejects.toThrow(
    "disconnected",
  );
});

it("returns bounded bundle inspection fixture and rejects other suffixes", async () => {
  const result = await bridge.invoke("mcp.bundles.inspect", { path: "/tmp/research.mcpb" });
  expect(result).toMatchObject({ name: "Research bundle", format: "mcpb", sha256: "b".repeat(64) });
  await expect(bridge.invoke("mcp.bundles.inspect", { path: "/tmp/notes.txt" })).rejects.toThrow(
    "Choose a .mcpb or .dxt",
  );
});
