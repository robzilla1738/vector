/**
 * E2E: launch the real Electron app (built output), wait for the runtime
 * descriptor, drive the loopback API, confirm a native page view is created
 * and automation works end-to-end on the actual desktop surface.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { startFixturesIfNeeded, waitForFixtures } from "../../scripts/fixtures.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const desktopDir = join(root, "apps", "desktop");
const electronBin = join(desktopDir, "node_modules", ".bin", "electron");

let app: ChildProcess | null = null;
let fixtures: ChildProcess[] = [];
let dataDir = "";
let desc: { port: number; token: string; pid: number };

async function rpc<T>(method: string, params: unknown = {}): Promise<T> {
  const res = await fetch(`http://127.0.0.1:${desc.port}/rpc`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${desc.token}` },
    body: JSON.stringify({ method, params }),
  });
  const body = (await res.json()) as { result?: T; error?: { message: string } };
  if (body.error) throw new Error(body.error.message);
  return body.result as T;
}

beforeAll(async () => {
  // the app must be built: dist/main, dist/preload, dist/renderer
  if (!existsSync(join(desktopDir, "dist/main/index.js"))) {
    const b = spawnSync(join(desktopDir, "node_modules/.bin/tsc"), ["-b", "tsconfig.main.json", "tsconfig.preload.json"], { cwd: desktopDir, stdio: "inherit" });
    if (b.status !== 0) throw new Error("desktop main/preload build failed");
  }
  if (!existsSync(join(desktopDir, "dist/renderer/index.html"))) {
    const b = spawnSync(join(desktopDir, "node_modules/.bin/vite"), ["build"], { cwd: desktopDir, stdio: "inherit" });
    if (b.status !== 0) throw new Error("renderer build failed");
  }
  // runtime must be built for the forked child
  spawnSync(join(root, "node_modules/.bin/tsc"), ["-b", "tsconfig.json"], { cwd: root, stdio: "inherit" });

  fixtures = await startFixturesIfNeeded();
  await waitForFixtures();

  dataDir = mkdtempSync(join(tmpdir(), "vector-e2e-"));
  // ELECTRON_RUN_AS_NODE makes the binary boot as plain Node — never let it
  // leak in from the parent shell.
  const { ELECTRON_RUN_AS_NODE: _drop, ...parentEnv } = process.env;
  app = spawn(electronBin, ["."], {
    cwd: desktopDir,
    env: {
      ...parentEnv,
      VECTOR_DATA_DIR: dataDir,
      ELECTRON_ENABLE_LOGGING: "1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  app.stdout?.on("data", (d) => process.stdout.write(`[electron] ${d}`));
  app.stderr?.on("data", (d) => process.stderr.write(`[electron!] ${d}`));

  // wait for the runtime descriptor — written once the forked runtime is serving
  const descFile = join(dataDir, "runtime.json");
  const deadline = Date.now() + 60_000;
  while (!existsSync(descFile)) {
    if (app.exitCode !== null) throw new Error("electron exited early");
    if (Date.now() > deadline) throw new Error("runtime.json never appeared");
    await new Promise((r) => setTimeout(r, 300));
  }
  desc = JSON.parse(readFileSync(descFile, "utf8"));

  // wait for the vector CDP attach to settle
  const start = Date.now();
  for (;;) {
    const ws = await rpc<{ sessions: { backend: string; status: string }[] }>("workspace.get").catch(() => null);
    const v = ws?.sessions.find((s) => s.backend === "vector");
    if (v?.status === "connected") break;
    if (Date.now() - start > 45_000) throw new Error(`vector session never connected: ${JSON.stringify(ws?.sessions)}`);
    await new Promise((r) => setTimeout(r, 500));
  }
}, 150_000);

afterAll(async () => {
  app?.kill("SIGTERM");
  fixtures.forEach((p) => p.kill());
  if (dataDir) rmSync(dataDir, { recursive: true, force: true });
});

describe("desktop e2e", () => {
  it("drives a native Vector page through the loopback API", async () => {
    const page = await rpc<{ pageId: string; targetId: string; url: string }>("pages.open", {
      url: "http://127.0.0.1:4810/records",
      backend: "vector",
    });
    expect(page.pageId).toBeTruthy();
    expect(page.targetId).toMatch(/^vtab-/);

    // API-opened pages activate by default and surface in the workspace
    const ws = await rpc<{ activePageId: string | null }>("workspace.get");
    expect(ws.activePageId).toBe(page.pageId);

    // a background page must not steal activation
    const bg = await rpc<{ pageId: string }>("pages.open", {
      url: "http://127.0.0.1:4810/records",
      backend: "vector",
      background: true,
    });
    const ws2 = await rpc<{ activePageId: string | null }>("workspace.get");
    expect(ws2.activePageId).toBe(page.pageId);
    expect(ws2.activePageId).not.toBe(bg.pageId);

    const obs = await rpc<{ content: { url: string; elements: unknown[] } }>("pages.observe", { pageId: page.pageId });
    expect(obs.content.url).toContain("/records");
    expect(obs.content.elements.length).toBeGreaterThan(0);

    const res = await rpc<{ status: string; steps: { status: string }[] }>("pages.execute", {
      program: {
        pageId: page.pageId,
        steps: [{ id: "s1", op: "extract", fields: [{ name: "n", selector: "table#records-table" }] }],
      },
    });
    expect(res.status).toBe("completed");
  }, 90_000);

  it("two tabs with identical URLs get distinct identities", async () => {
    const url = "http://127.0.0.1:4810/records";
    const a = await rpc<{ pageId: string; targetId: string }>("pages.open", { url, backend: "vector" });
    const b = await rpc<{ pageId: string; targetId: string }>("pages.open", { url, backend: "vector" });
    expect(a.pageId).not.toBe(b.pageId);
    expect(a.targetId).not.toBe(b.targetId);
  }, 60_000);

  it("interactive programs run in parallel on background pages without flipping the focused tab (A8)", async () => {
    const front = await rpc<{ pageId: string }>("pages.open", { url: "http://127.0.0.1:4810/records", backend: "vector" });
    const bgA = await rpc<{ pageId: string }>("pages.open", { url: "http://127.0.0.1:4810/new", backend: "vector", background: true });
    const bgB = await rpc<{ pageId: string }>("pages.open", { url: "http://127.0.0.1:4810/new", backend: "vector", background: true });
    const program = (pageId: string, value: string) => ({
      pageId,
      steps: [
        { id: "f", op: "fill", target: "css:#n-title", value },
        { id: "c", op: "click", target: "css:#n-title" },
        { id: "p", op: "press", key: "End", target: "css:#n-title" },
      ],
    });
    const readTitle = (pageId: string) =>
      rpc<{ content: { formFields: { name?: string; label?: string; value?: string }[] } }>("pages.observe", { pageId, scope: "forms" }).then(
        (o) => o.content.formFields.find((f) => f.name === "title" || f.label === "Title")?.value,
      );
    const t0 = Date.now();
    const [a, b] = await Promise.all([
      rpc<{ status: string; error?: string }>("pages.execute", { program: program(bgA.pageId, "alpha") }),
      rpc<{ status: string; error?: string }>("pages.execute", { program: program(bgB.pageId, "bravo") }),
    ]);
    const wall = Date.now() - t0;
    expect(a.status, a.error).toBe("completed");
    expect(b.status, b.error).toBe("completed");
    expect(await readTitle(bgA.pageId)).toBe("alpha");
    expect(await readTitle(bgB.pageId)).toBe("bravo");
    // the human's tab stayed on the stage the whole time
    const ws = await rpc<{ activePageId: string | null }>("workspace.get");
    expect(ws.activePageId).toBe(front.pageId);
    // the pages ran at the same time (the sequential lease took turns);
    // generous bound so CI variance cannot flake it
    expect(wall).toBeLessThan(20_000);
    for (const p of [bgA, bgB]) await rpc("pages.close", { pageId: p.pageId });
  }, 90_000);

  it("native find and zoom round-trip through the API", async () => {
    const page = await rpc<{ pageId: string }>("pages.open", {
      url: "http://127.0.0.1:4810/records",
      backend: "vector",
    });
    await rpc("pages.observe", { pageId: page.pageId });
    const found = await rpc<{ matches: number }>("pages.find", {
      pageId: page.pageId,
      text: "records",
      forward: true,
      findNext: false,
    });
    expect(found.matches).toBeGreaterThan(0);

    // zoom levels persist per-origin in the persistent profile partition —
    // assert relative change, not an absolute level
    const before = await rpc<{ level: number }>("pages.zoom", { pageId: page.pageId });
    const z1 = await rpc<{ level: number }>("pages.zoom", { pageId: page.pageId, delta: 0.5 });
    expect(z1.level).toBe(before.level + 0.5);
    const z0 = await rpc<{ level: number }>("pages.zoom", { pageId: page.pageId, reset: true });
    expect(z0.level).toBe(0);
  }, 60_000);
});
