import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import type { AgentConnectionService } from "./agent-connections.js";

type Client = "codex" | "claude" | "cursor";

function clientVersion(
  client: Client,
): Promise<{ client: Client; installed: boolean; version?: string; error?: string }> {
  return new Promise((resolve) => {
    const child = spawn(client, ["--version"], { shell: false, stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    let settled = false;
    const finish = (result: { client: Client; installed: boolean; version?: string; error?: string }) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(result);
    };
    const timer = setTimeout(() => {
      child.kill();
      finish({ client, installed: false, error: "Version check timed out" });
    }, 2_000);
    for (const stream of [child.stdout, child.stderr])
      stream.on("data", (chunk: Buffer) => {
        if (output.length < 512) output += chunk.toString("utf8").slice(0, 512 - output.length);
      });
    child.on("error", (error: NodeJS.ErrnoException) =>
      finish({
        client,
        installed: false,
        error: error.code === "ENOENT" ? undefined : "Version check failed",
      }),
    );
    child.on("close", (code) =>
      finish(
        code === 0
          ? { client, installed: true, version: output.trim().split("\n")[0]?.slice(0, 120) || undefined }
          : { client, installed: false, error: "Version check failed" },
      ),
    );
  });
}

export async function nativeAgentClients() {
  return Promise.all([clientVersion("codex"), clientVersion("claude"), clientVersion("cursor")]);
}

/** The one-time token stays in the response; only its hash persists in Aux. */
export function nativeAgentConfig(connections: AgentConnectionService, input: unknown, dataDir: string) {
  const entry = join(dirname(process.argv[1] ?? ""), "mcp.js");
  if (!existsSync(entry)) throw new Error("The Aux MCP server is missing from this build");
  const { connection, token } = connections.create(input);
  return {
    command: process.execPath,
    args: [entry],
    env: { AUX_DATA_DIR: dataDir, AUX_MCP_TOKEN: token, AUX_MCP_SCOPE_KIND: connection.scope.kind },
    connection,
  };
}
