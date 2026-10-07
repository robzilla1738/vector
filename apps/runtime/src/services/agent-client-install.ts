import { createHash, randomUUID } from "node:crypto";
import { existsSync, lstatSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, relative, resolve, sep } from "node:path";
import { parse, stringify } from "smol-toml";
import { AgentConnectionCreateParams, AuxError, type AgentConnection } from "@aux/contracts";
import type { AgentConnectionService } from "./agent-connections.js";
import { nativeAgentConfig } from "./native-agent-connections.js";

type Config = ReturnType<typeof nativeAgentConfig>;
type Options = {
  connections: AgentConnectionService;
  dataDir: string;
  /** Revalidate the authenticated original window; never a renderer-supplied ID. */
  current: () => Promise<void>;
  home?: string;
  configuration?: (input: unknown) => Config;
};
type FileChange = { path: string; before: Buffer | undefined; after: Buffer; temporary?: string };

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new AuxError("invalid_params", "The client configuration must contain an object.");
  return value as Record<string, unknown>;
}

/** Never follow config/skill symlinks or replace a concurrently edited user file. */
function read(path: string, home: string): Buffer | undefined {
  const part = relative(home, path);
  if (!part || part.startsWith(`..${sep}`) || part === "..")
    throw new AuxError("permission_denied", "Client configuration is outside the user folder.");
  let directory = home;
  for (const component of part.split(sep)) {
    directory = join(directory, component);
    let stat: ReturnType<typeof lstatSync>;
    try {
      stat = lstatSync(directory);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") continue;
      throw error;
    }
    if (stat.isSymbolicLink() || (directory === path ? !stat.isFile() : !stat.isDirectory()))
      throw new AuxError("permission_denied", "Client configuration must use regular files and folders.");
    if (directory === path && stat.size > 4 * 1024 * 1024)
      throw new AuxError("invalid_params", "The client configuration is too large to update safely.");
  }
  return existsSync(path) ? readFileSync(path) : undefined;
}
function equal(a: Buffer | undefined, b: Buffer | undefined) {
  return a === undefined ? b === undefined : b !== undefined && a.equals(b);
}
function replace(change: FileChange, home: string, content: Buffer | undefined) {
  read(change.path, home);
  if (content === undefined) {
    rmSync(change.path);
    return;
  }
  mkdirSync(dirname(change.path), { recursive: true, mode: 0o700 });
  read(change.path, home);
  const temporary = `${change.path}.aux-${randomUUID()}.tmp`;
  change.temporary = temporary;
  writeFileSync(temporary, content, { flag: "wx", mode: 0o600 });
  renameSync(temporary, change.path);
  change.temporary = undefined;
}

/** Human Settings action: merge the actual client config and install its local skill pointer. */
export async function installAgentClient(input: unknown, options: Options) {
  const value = AgentConnectionCreateParams.parse(input);
  const home = resolve(options.home ?? homedir());
  const id = createHash("sha256")
    .update(options.dataDir)
    .update(JSON.stringify(value.scope))
    .digest("hex")
    .slice(0, 16);
  const server = `aux-browser-${id}`;
  const configPath =
    value.client === "claude"
      ? join(home, ".claude.json")
      : join(
          home,
          value.client === "codex" ? ".codex" : ".cursor",
          value.client === "codex" ? "config.toml" : "mcp.json",
        );
  const skillPath = join(
    home,
    value.client === "claude" ? ".claude" : value.client === "codex" ? ".agents" : ".cursor",
    "skills",
    server,
    "SKILL.md",
  );
  await options.current();
  const before = read(configPath, home),
    skillBefore = read(skillPath, home);
  let document: Record<string, unknown>;
  try {
    document = before
      ? object(
          value.client === "codex" ? parse(before.toString("utf8")) : JSON.parse(before.toString("utf8")),
        )
      : {};
  } catch {
    throw new AuxError(
      "invalid_params",
      "The existing client configuration is invalid. It was left unchanged.",
    );
  }
  const key = value.client === "codex" ? "mcp_servers" : "mcpServers";
  const servers = document[key] === undefined ? {} : object(document[key]);
  let previous: AgentConnection | undefined;
  if (servers[server] !== undefined) {
    const old = object(servers[server]),
      environment = object(old.env);
    const token = environment.AUX_MCP_TOKEN;
    const authorized = typeof token === "string"
      ? options.connections.authorize(token) ?? options.connections.closedClient(token) : null;
    previous = authorized
      ? options.connections.list().find((item) => item.connectionId === authorized.connectionId) : undefined;
    if (
      !previous ||
      previous.client !== value.client ||
      JSON.stringify(previous.scope) !== JSON.stringify(value.scope) ||
      environment.AUX_DATA_DIR !== options.dataDir
    )
      throw new AuxError("conflict", "An unrelated server already uses this configuration name.");
  }
  const marker = `<!-- Aux managed skill: ${server} -->`;
  if (skillBefore && !skillBefore.toString("utf8").includes(marker))
    throw new AuxError("conflict", "An existing skill uses this name. It was left unchanged.");
  const config = (
    options.configuration ?? ((params) => nativeAgentConfig(options.connections, params, options.dataDir))
  )(value);
  const changes: FileChange[] = [];
  const applied: FileChange[] = [];
  try {
    const entry = { command: config.command, args: config.args, env: config.env };
    servers[server] = value.client === "claude" ? { type: "stdio", ...entry } : entry;
    document[key] = servers;
    const encoded = value.client === "codex" ? stringify(document) : `${JSON.stringify(document, null, 2)}\n`;
    const skill = `---\nname: ${server}\ndescription: Use Aux to browse and work in the connected task or Space.\n---\n${marker}\n\nUse the configured ${server} MCP server for Aux browser work. Read its live tool descriptions and the selected task before acting. Actions follow the person's current Aux agent mode and file roots. Money and credentials follow that mode's confirmation policy. Keep work in this connection's scope; Stop and Take over remain available in Aux. Do not read or copy the MCP bearer token, change permissions, or claim a result without verifying it.\n`;
    changes.push(
      { path: configPath, before, after: Buffer.from(encoded) },
      { path: skillPath, before: skillBefore, after: Buffer.from(skill) },
    );
    await options.current();
    for (const change of changes) {
      if (!equal(read(change.path, home), change.before))
        throw new AuxError(
          "conflict",
          "The client configuration changed during setup. Retry the connection.",
        );
      replace(change, home, change.after);
      applied.push(change);
    }
    await options.current();
    if (previous && !previous.revokedAt) options.connections.revoke(previous.connectionId);
    return {
      connection: config.connection,
      configPath,
      skillPath,
      replacedConnectionId: previous?.connectionId,
    };
  } catch (error) {
    options.connections.revoke(config.connection.connectionId);
    for (const change of applied.reverse()) {
      if (equal(read(change.path, home), change.after)) replace(change, home, change.before);
    }
    throw error;
  } finally {
    for (const change of changes) if (change.temporary) rmSync(change.temporary, { force: true });
  }
}
