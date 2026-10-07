import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, expect, it } from "vitest";
import { createRequire } from "node:module";
import {
  AgentConnectionService,
  EventBus,
  installAgentClient,
  openDb,
  Repo,
  TaskService,
} from "@aux/runtime";
const { parse } = createRequire(new URL("../../apps/runtime/package.json", import.meta.url))("smol-toml") as {
  parse: (source: string) => Record<string, unknown>;
};

const cleanup: (() => void)[] = [];
afterEach(() => {
  for (const close of cleanup.splice(0).reverse()) close();
});
function fixture(client: "codex" | "claude" | "cursor") {
  const home = mkdtempSync(join(tmpdir(), "aux-client-install-"));
  cleanup.push(() => rmSync(home, { recursive: true, force: true }));
  const db = openDb(":memory:");
  cleanup.push(() => db.close());
  const repo = new Repo(db),
    connections = new AgentConnectionService(repo);
  const workspace = new TaskService(repo, new EventBus(repo)).createWorkspace("Client setup");
  const input = {
    name: "Aux connection",
    client,
    scope: { kind: "workspace" as const, workspaceId: workspace.workspaceId },
  };
  const options = {
    home,
    dataDir: join(home, "aux-profile"),
    connections,
    current: async () => {},
    configuration: (input: unknown) => {
      const created = connections.create(input);
      return {
        command: "/aux/node",
        args: ["/aux/mcp.js"],
        env: {
          AUX_DATA_DIR: join(home, "aux-profile"),
          AUX_MCP_TOKEN: created.token,
          AUX_MCP_SCOPE_KIND: created.connection.scope.kind,
        },
        connection: created.connection,
      };
    },
  };
  return { home, connections, input, options };
}
it("merges the three real client formats and replaces only its own live scoped connection", async () => {
  for (const client of ["codex", "claude", "cursor"] as const) {
    const f = fixture(client);
    const path =
      client === "claude"
        ? join(f.home, ".claude.json")
        : join(
            f.home,
            client === "codex" ? ".codex" : ".cursor",
            client === "codex" ? "config.toml" : "mcp.json",
          );
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(
      path,
      client === "codex"
        ? 'model = "chosen-model"\n[mcp_servers.other]\ncommand = "other"\n'
        : JSON.stringify({ preference: "preserved", mcpServers: { other: { command: "other" } } }),
    );
    const first = await installAgentClient(f.input, f.options);
    const config =
      client === "codex" ? parse(readFileSync(path, "utf8")) : JSON.parse(readFileSync(path, "utf8"));
    expect(client === "codex" ? config.model : config.preference).toBe(
      client === "codex" ? "chosen-model" : "preserved",
    );
    const servers = config[client === "codex" ? "mcp_servers" : "mcpServers"];
    expect(servers.other.command).toBe("other");
    const entry = Object.entries(servers).find(([key]) => key.startsWith("aux-browser-"))![1] as {
      env: { AUX_MCP_TOKEN: string };
    };
    expect(f.connections.authorize(entry.env.AUX_MCP_TOKEN)?.connectionId).toBe(
      first.connection.connectionId,
    );
    expect(readFileSync(first.skillPath, "utf8")).toContain("Read its live tool descriptions");
    const second = await installAgentClient(f.input, f.options);
    expect(second.replacedConnectionId).toBe(first.connection.connectionId);
    expect(f.connections.authorize(entry.env.AUX_MCP_TOKEN)).toBeNull();
    expect(f.connections.list().filter((item) => !item.revokedAt)).toHaveLength(1);
    f.connections.revoke(second.connection.connectionId);
    const third = await installAgentClient(f.input, f.options);
    expect(third.replacedConnectionId).toBe(second.connection.connectionId);
    expect(f.connections.list().filter((item) => !item.revokedAt)).toHaveLength(1);
  }
});
it("rolls back its exact saved files and revokes the new bearer when the original window retires", async () => {
  const f = fixture("claude"),
    path = join(f.home, ".claude.json");
  const original = '{"preference":"kept"}\n';
  writeFileSync(path, original);
  let checks = 0;
  await expect(
    installAgentClient(f.input, {
      ...f.options,
      current: async () => {
        if (++checks === 3) throw new Error("Original document retired");
      },
    }),
  ).rejects.toThrow(/retired/);
  expect(readFileSync(path, "utf8")).toBe(original);
  expect(f.connections.list().every((item) => item.revokedAt)).toBe(true);
});
it("preserves a concurrent client edit and refuses invalid existing configuration", async () => {
  const f = fixture("cursor"),
    path = join(f.home, ".cursor", "mcp.json");
  mkdirSync(dirname(path));
  writeFileSync(path, "{}\n");
  let checks = 0;
  await expect(
    installAgentClient(f.input, {
      ...f.options,
      current: async () => {
        if (++checks === 2) writeFileSync(path, '{"concurrent":"kept"}\n');
      },
    }),
  ).rejects.toThrow(/changed during setup/);
  expect(JSON.parse(readFileSync(path, "utf8"))).toEqual({ concurrent: "kept" });
  writeFileSync(path, "{broken");
  await expect(installAgentClient(f.input, f.options)).rejects.toThrow(/invalid/);
  expect(readFileSync(path, "utf8")).toBe("{broken");
  expect(f.connections.list().every((item) => item.revokedAt)).toBe(true);
});
