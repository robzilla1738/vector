/**
 * E2E: launch the real Electron app (built output), wait for the runtime
 * descriptor, drive the loopback API against vector-engine + EngineView.
 * Does not prove a human Mac .app / IME / VoiceOver / GPU session.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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
  if (!existsSync(join(desktopDir, "dist/main/index.js"))) {
    const b = spawnSync(join(desktopDir, "node_modules/.bin/tsc"), ["-b", "tsconfig.main.json", "tsconfig.preload.json"], { cwd: desktopDir, stdio: "inherit" });
    if (b.status !== 0) throw new Error("desktop main/preload build failed");
  }
  if (!existsSync(join(desktopDir, "dist/renderer/index.html"))) {
    const b = spawnSync(join(desktopDir, "node_modules/.bin/vite"), ["build"], { cwd: desktopDir, stdio: "inherit" });
    if (b.status !== 0) throw new Error("renderer build failed");
  }
  spawnSync(join(root, "node_modules/.bin/tsc"), ["-b", "tsconfig.json"], { cwd: root, stdio: "inherit" });

  fixtures = await startFixturesIfNeeded();
  await waitForFixtures();

  dataDir = mkdtempSync(join(tmpdir(), "vector-e2e-"));
  writeFileSync(
    join(dataDir, "settings.json"),
    JSON.stringify({ effectGrants: ["effect:read", "effect:write", "effect:destructive", "effect:egress"] }),
  );
  const { ELECTRON_RUN_AS_NODE: _drop, ...parentEnv } = process.env;
  app = spawn(electronBin, ["."], {
    cwd: desktopDir,
    env: {
      ...parentEnv,
      VECTOR_DATA_DIR: dataDir,
      VECTOR_ENGINE_MODE: parentEnv.VECTOR_ENGINE_MODE || "always",
      VECTOR_ENGINE_PROFILE: parentEnv.VECTOR_ENGINE_PROFILE || "production",
      ELECTRON_ENABLE_LOGGING: "1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  app.stdout?.on("data", (d) => process.stdout.write(`[electron] ${d}`));
  app.stderr?.on("data", (d) => process.stderr.write(`[electron!] ${d}`));

  const descFile = join(dataDir, "runtime.json");
  const deadline = Date.now() + 60_000;
  while (!existsSync(descFile)) {
    if (app.exitCode !== null) throw new Error("electron exited early");
    if (Date.now() > deadline) throw new Error("runtime.json never appeared");
    await new Promise((r) => setTimeout(r, 300));
  }
  desc = JSON.parse(readFileSync(descFile, "utf8"));

  const start = Date.now();
  for (;;) {
    const ws = await rpc<{ sessions: { backend: string; status: string; detail?: string }[] }>("workspace.get").catch(() => null);
    const engine = ws?.sessions.find((s) => s.backend === "vector-engine");
    if (engine?.status === "connected") break;
    if (Date.now() - start > 45_000) {
      throw new Error(`vector-engine never connected: ${JSON.stringify(ws?.sessions)}`);
    }
    await new Promise((r) => setTimeout(r, 500));
  }
}, 150_000);

afterAll(async () => {
  app?.kill("SIGTERM");
  fixtures.forEach((p) => p.kill());
  if (dataDir) rmSync(dataDir, { recursive: true, force: true });
});

describe("desktop e2e", () => {
  it("drives a Vector Engine page through the loopback API", async () => {
    const page = await rpc<{ pageId: string; targetId: string; url: string; backend: string }>("pages.open", {
      url: "http://127.0.0.1:4810/records",
    });
    expect(page.backend).toBe("vector-engine");
    expect(page.pageId).toBeTruthy();
    expect(page.targetId).toMatch(/^ve-\d+-\d+$/);

    const ws = await rpc<{ activePageId: string | null }>("workspace.get");
    expect(ws.activePageId).toBe(page.pageId);

    const bg = await rpc<{ pageId: string; backend: string }>("pages.open", {
      url: "http://127.0.0.1:4810/records",
      background: true,
    });
    expect(bg.backend).toBe("vector-engine");
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
    const a = await rpc<{ pageId: string; targetId: string; backend: string }>("pages.open", { url });
    const b = await rpc<{ pageId: string; targetId: string; backend: string }>("pages.open", { url });
    expect(a.backend).toBe("vector-engine");
    expect(b.backend).toBe("vector-engine");
    expect(a.pageId).not.toBe(b.pageId);
    expect(a.targetId).not.toBe(b.targetId);
    expect(a.targetId).toMatch(/^ve-\d+-\d+$/);
    expect(b.targetId).toMatch(/^ve-\d+-\d+$/);
  }, 60_000);

  it("interactive programs run in parallel on background engine pages without flipping the focused tab", async () => {
    const front = await rpc<{ pageId: string; backend: string }>("pages.open", { url: "http://127.0.0.1:4810/records" });
    expect(front.backend).toBe("vector-engine");
    const bgA = await rpc<{ pageId: string }>("pages.open", { url: "http://127.0.0.1:4810/new", background: true });
    const bgB = await rpc<{ pageId: string }>("pages.open", { url: "http://127.0.0.1:4810/new", background: true });
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
    const ws = await rpc<{ activePageId: string | null }>("workspace.get");
    expect(ws.activePageId).toBe(front.pageId);
    expect(wall).toBeLessThan(20_000);
    for (const p of [bgA, bgB]) await rpc("pages.close", { pageId: p.pageId });
  }, 90_000);

  it("takeover blocks dispatch on the live engine page", async () => {
    const page = await rpc<{ pageId: string; backend: string }>("pages.open", {
      url: "http://127.0.0.1:4810/records",
    });
    expect(page.backend).toBe("vector-engine");
    const obs = await rpc<{ content: { url: string; elements: unknown[] } }>("pages.observe", { pageId: page.pageId });
    expect(obs.content.elements.length).toBeGreaterThan(0);
    const taken = await rpc<{ controller?: string }>("pages.takeover", { pageId: page.pageId });
    expect(taken.controller).toBe("human");
    await expect(
      rpc("pages.execute", {
        program: { pageId: page.pageId, steps: [{ id: "x", op: "extract", fields: [{ name: "n", selector: "table#records-table" }] }] },
      }),
    ).rejects.toThrow(/human control|takeover|conflict/i);
    const resumed = await rpc<{ controller?: string }>("pages.resume", { pageId: page.pageId });
    expect(resumed.controller).not.toBe("human");
  }, 60_000);
});
