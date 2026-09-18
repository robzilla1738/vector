import { chmodSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import {
  browserServiceAddr,
  resolveVeShell,
  spawnVeShellService,
  BrowserServiceClient,
  VectorEngineDriver,
  parseEngineTargetId,
} from "@vector/browser-driver";
import { startRuntime } from "@vector/runtime";

function fakeShell(): string {
  const dir = mkdtempSync(join(tmpdir(), "ve-shell-"));
  const path = join(dir, "ve-shell.mjs");
  writeFileSync(
    path,
    `#!/usr/bin/env node
import { createServer } from "node:net";
const server = createServer((socket) => {
  let buf = "";
  socket.setEncoding("utf8");
  socket.on("data", (chunk) => {
    buf += chunk;
    for (;;) {
      const nl = buf.indexOf("\\n");
      if (nl < 0) break;
      const line = buf.slice(0, nl);
      buf = buf.slice(nl + 1);
      if (!line.trim()) continue;
      const req = JSON.parse(line);
      let result = { ok: true };
      if (req.method === "pages.open") {
        result = { ok: true, page: 1, url: req.params?.url ?? "about:blank", title: "shell" };
      } else if (req.method === "identity") {
        result = { engine: "vector-engine", service: "browser-service", chromium: false, controller: "none" };
      } else if (req.method === "pages.takeover") {
        result = { controller: "human", controllerEpoch: 1, service: "browser-service" };
      } else if (req.method === "pages.resume") {
        result = { controller: "none", controllerEpoch: 2, service: "browser-service" };
      } else if (req.method === "pages.execute") {
        result = { ok: true, status: "completed", steps: [] };
      }
      socket.write(JSON.stringify({ jsonrpc: "2.0", id: req.id, result }) + "\\n");
    }
  });
});
server.listen(0, "127.0.0.1", () => {
  const { port } = server.address();
  console.log(JSON.stringify({
    VECTOR_BROWSER_SERVICE: "127.0.0.1:" + port,
    backend: "vector-engine",
    chromium: false,
    service: "browser-service",
  }));
});
`,
  );
  chmodSync(path, 0o755);
  return path;
}

describe("Finding 1 browser service client", () => {
  it("reads VECTOR_BROWSER_SERVICE and ignores empty", () => {
    expect(browserServiceAddr({} as NodeJS.ProcessEnv)).toBeUndefined();
    expect(browserServiceAddr({ VECTOR_BROWSER_SERVICE: "  " } as NodeJS.ProcessEnv)).toBeUndefined();
    expect(browserServiceAddr({ VECTOR_BROWSER_SERVICE: "127.0.0.1:9876" } as NodeJS.ProcessEnv)).toBe(
      "127.0.0.1:9876",
    );
  });

  it("resolveVeShell prefers VECTOR_SHELL when the file exists", () => {
    const bin = fakeShell();
    expect(resolveVeShell({ VECTOR_SHELL: bin } as NodeJS.ProcessEnv)).toBe(bin);
  });

  it("resolveVeShell finds a packaged Mac Resources/engine/ve-shell", () => {
    const bin = fakeShell();
    const resources = mkdtempSync(join(tmpdir(), "vector-res-"));
    const engineDir = join(resources, "engine");
    mkdirSync(engineDir, { recursive: true });
    const staged = join(engineDir, "ve-shell");
    writeFileSync(staged, "#!/bin/sh\n");
    expect(
      resolveVeShell({ VECTOR_RESOURCES: resources } as NodeJS.ProcessEnv, "/no-such-cwd"),
    ).toBe(staged);
    expect(resolveVeShell({ VECTOR_SHELL: bin, VECTOR_RESOURCES: resources } as NodeJS.ProcessEnv)).toBe(bin);
  });

  it("spawns --service and Node attaches as a client", async () => {
    const bin = fakeShell();
    const owned = await spawnVeShellService(bin);
    expect(owned?.addr).toMatch(/^127\.0\.0\.1:\d+$/);
    const client = new BrowserServiceClient(owned!.addr);
    await client.connect();
    const opened = await client.call("pages.open", { url: "about:blank" });
    expect(opened).toMatchObject({ ok: true, page: 1, url: "about:blank" });
    const driver = new VectorEngineDriver({
      ownService: true,
      startService: async () => owned!,
    });
    await driver.connect();
    expect(driver.describe().capabilities?.service).toBe(true);
    const targetId = await driver.createTarget("https://share.test/");
    expect(parseEngineTargetId(targetId)).toEqual({ contextId: 1, page: 1 });
    await driver.disconnect();
  });

  it("live ve-shell --service: Node opens and observes one page", async () => {
    const bin = resolveVeShell();
    if (!bin) return;
    const owned = await spawnVeShellService(bin);
    expect(owned?.addr).toMatch(/^127\.0\.0\.1:\d+$/);
    const client = new BrowserServiceClient(owned!.addr);
    await client.connect();
    const opened = await client.call("pages.open", {
      url: "about:blank",
      html: "<title>svc</title><p>ok</p>",
    });
    expect(opened).toMatchObject({ ok: true, chromium: false, backend: "vector-engine" });
    const obs = await client.call("pages.observe", {});
    expect(obs.ok).toBe(true);
    expect(obs.chromium).toBe(false);
    owned!.shutdown();
    client.close();
  });

  it("live ve-shell --service: Node takeover blocks a second client execute", async () => {
    const bin = resolveVeShell();
    if (!bin) return;
    const owned = await spawnVeShellService(bin);
    expect(owned?.addr).toMatch(/^127\.0\.0\.1:\d+$/);
    const driver = new VectorEngineDriver({
      ownService: true,
      startService: async () => owned!,
    });
    await driver.connect();
    await driver.createTarget("about:blank");
    const peer = new BrowserServiceClient(owned!.addr);
    await peer.connect();
    await peer.call("pages.open", { url: "about:blank", html: "<input id=n>" });
    const taken = await driver.takeover();
    expect(taken.controller).toBe("human");
    await expect(
      peer.call("pages.execute", { program: [{ id: "x", op: "type", target: "css:#n", value: "blocked" }] }),
    ).rejects.toMatchObject({ code: "conflict" });
    const resumed = await driver.resume();
    expect(resumed.controller).not.toBe("human");
    await expect(
      peer.call("pages.execute", { program: [{ id: "y", op: "type", target: "css:#n", value: "ok" }] }),
    ).resolves.toBeTruthy();
    peer.close();
    await driver.disconnect();
  });

  it("pnpm dev path: runtime attaches to VECTOR_BROWSER_SERVICE and shares the page", async () => {
    const bin = resolveVeShell();
    if (!bin) return;
    const owned = await spawnVeShellService(bin);
    expect(owned?.addr).toMatch(/^127\.0\.0\.1:\d+$/);
    const dataDir = mkdtempSync(join(tmpdir(), "vector-dev-rt-"));
    const rt = await startRuntime({
      ...process.env,
      VECTOR_DATA_DIR: dataDir,
      VECTOR_BROWSER_SERVICE: owned!.addr,
      VECTOR_ENGINE_MODE: "always",
      VECTOR_ELECTRON_CDP: "",
      VECTOR_API_TOKEN: "dev-attach",
    });
    try {
      const page = (await rt.invoke("pages.open", {
        url: "about:blank",
        background: true,
      })) as { backend: string; pageId: string };
      expect(page.backend).toBe("vector-engine");
      const obs = (await rt.invoke("pages.observe", { pageId: page.pageId })) as {
        content?: { url?: string };
      };
      expect(obs.content?.url).toBeTruthy();
      const taken = (await rt.invoke("pages.takeover", { pageId: page.pageId })) as {
        controller?: string;
      };
      expect(taken.controller).toBe("human");
    } finally {
      await rt.close();
      owned!.shutdown();
    }
  }, 30_000);
});
