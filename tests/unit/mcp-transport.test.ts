import { createServer, type Server } from "node:http";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it, vi } from "vitest";
import { resetDescriptorCache, rpc } from "../../packages/mcp/src/client";

const servers: Server[] = [];
const directories: string[] = [];

afterEach(async () => {
  resetDescriptorCache();
  vi.unstubAllEnvs();
  for (const server of servers.splice(0)) {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
  for (const dir of directories.splice(0)) rmSync(dir, { recursive: true, force: true });
});

async function listen(server: Server): Promise<number> {
  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Expected loopback address");
  return address.port;
}

it("does not repeat a mutation after a lost response and discovers the restarted runtime on the next call", async () => {
  const dir = mkdtempSync(join(tmpdir(), "aux-mcp-transport-"));
  directories.push(dir);
  const path = join(dir, "runtime.json");
  vi.stubEnv("AUX_RUNTIME_FILE", path);
  vi.stubEnv("AUX_MCP_TOKEN", "scoped-token");
  resetDescriptorCache();
  let writes = 0;
  const port = await listen(createServer((request) => {
    request.resume();
    request.on("end", () => {
      writes++;
      // The server committed the mutation, but no response reached the caller.
      request.socket.destroy();
    });
  }));
  writeFileSync(path, JSON.stringify({ port, token: "first", pid: process.pid }));
  await expect(rpc("pages.navigate", { pageId: "page-1", url: "https://example.test/next" })).rejects.toThrow();
  expect(writes).toBe(1);

  let reads = 0;
  const restartedPort = await listen(createServer((request, response) => {
    expect(request.headers.authorization).toBe("Bearer scoped-token");
    reads++;
    response.setHeader("content-type", "application/json");
    response.end(JSON.stringify({ result: [] }));
  }));
  writeFileSync(path, JSON.stringify({ port: restartedPort, token: "restarted", pid: process.pid }));
  await expect(rpc("pages.list")).resolves.toEqual([]);
  expect(reads).toBe(1);
  expect(writes).toBe(1);
});

it("fails closed for Aux MCP configs that have no scoped bearer token", async () => {
  const dir = mkdtempSync(join(tmpdir(), "aux-mcp-legacy-"));
  directories.push(dir);
  const path = join(dir, "runtime.json");
  vi.stubEnv("AUX_RUNTIME_FILE", path);
  vi.stubEnv("AUX_MCP_TOKEN", "");
  writeFileSync(path, JSON.stringify({ port: 1, token: "broad-runtime-token", pid: process.pid }));
  resetDescriptorCache();
  await expect(rpc("pages.list")).rejects.toThrow(/scoped AUX_MCP_TOKEN/i);
});
