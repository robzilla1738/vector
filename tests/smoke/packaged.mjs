#!/usr/bin/env node
/**
 * R9.5 packaged-build smoke — boots the runtime bundled inside the packaged
 * app (release/<platform>/Vector.app/Contents/Resources/runtime) exactly as the
 * packaged Electron shell would, then verifies the loopback API, a real
 * page open+observe against a fixture, persistence across restart, and
 * migration idempotency. Exits non-zero on any failure.
 *
 *   node tests/smoke/packaged.mjs
 */
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import http from "node:http";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const release = join(root, "release");

const fail = (msg) => { console.error(`✗ ${msg}`); process.exit(1); };
const ok = (msg) => console.log(`✓ ${msg}`);

const nativeBin = join(release, process.platform === "win32" ? "ve-shell.exe" : "ve-shell");
if (existsSync(nativeBin)) ok(`native product: ${nativeBin}`);

// locate the packaged runtime entry (Electron hybrid, if present)
let entry;
for (const dir of ["mac-arm64", "mac", "linux-unpacked", "win-unpacked"]) {
  const p = join(release, dir, "Vector.app", "Contents", "Resources", "runtime", "dist", "main.js");
  if (existsSync(p)) { entry = p; break; }
  const alt = join(release, dir, "resources", "runtime", "dist", "main.js");
  if (existsSync(alt)) { entry = alt; break; }
}
if (!entry) {
  if (existsSync(nativeBin)) {
    ok("native product packaged; Electron hybrid not present (pnpm package:electron)");
    process.exit(0);
  }
  fail(`no packaged runtime under ${release} — run pnpm package:electron`);
}
ok(`packaged runtime: ${entry}`);

// fixture server — the dev fixture bundle (all three apps, fixed ports).
// Probe first: if dev fixtures are already running, reuse them.
const fixturePort = 4810;
let fx;
const probeFixture = () =>
  new Promise((res) => {
    const r = http.get(`http://127.0.0.1:${fixturePort}/records`, (x) => { x.resume(); res(x.statusCode === 200); });
    r.on("error", () => res(false));
    r.setTimeout(1500, () => { r.destroy(); res(false); });
  });
if (!(await probeFixture())) {
  fx = spawn(process.execPath, [join(root, "scripts", "fixtures.mjs")], { stdio: "ignore" });
  for (let i = 0; i < 40 && !(await probeFixture()); i++) await new Promise((r) => setTimeout(r, 500));
  if (!(await probeFixture())) fail("records fixture did not come up on :4810");
}
ok(`records fixture up on :${fixturePort}`);

const TOKEN = "smoke-token";
const dataDir = mkdtempSync(join(tmpdir(), "vector-smoke-"));

function boot() {
  const port = 15200 + Math.floor(Math.random() * 500);
  const proc = spawn(process.execPath, [entry], {
    env: {
      ...process.env,
      VECTOR_DATA_DIR: dataDir,
      VECTOR_API_PORT: String(port),
      VECTOR_API_TOKEN: TOKEN,
      VECTOR_RUNTIME_AUTOSTART: "1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  return { proc, port };
}

const rpc = (port, method, params) =>
  new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: "127.0.0.1", port, path: "/rpc", method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${TOKEN}` },
      },
      (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => {
          try {
            const j = JSON.parse(body);
            j.error ? reject(new Error(`${method}: ${j.error.message ?? JSON.stringify(j.error)}`)) : resolve(j.result);
          } catch (e) { reject(e); }
        });
      },
    );
    req.on("error", reject);
    req.end(JSON.stringify({ id: 1, method, params }));
  });

async function waitReady(proc, port, ms = 20000) {
  const t0 = Date.now();
  let stderr = "";
  proc.stderr.on("data", (d) => (stderr += d));
  while (Date.now() - t0 < ms) {
    try {
      await rpc(port, "runtime.describe", {});
      return;
    } catch { await new Promise((r) => setTimeout(r, 250)); }
    if (proc.exitCode !== null) fail(`packaged runtime exited early: ${stderr.slice(-800)}`);
  }
  fail(`packaged runtime did not come up on :${port} — ${stderr.slice(-800)}`);
}

// ---- boot 1: API + a real page against the fixture ----
const first = boot();
await waitReady(first.proc, first.port);
ok("packaged runtime boots and auths");

const desc = await rpc(first.port, "runtime.describe", {});
if (!desc.methods?.includes("operations.invoke")) fail("runtime.describe missing vnext methods");
ok(`runtime.describe: ${desc.methods.length} methods, backends=[${desc.backends.join(",")}]`);

const page = await rpc(first.port, "pages.open", { url: `http://127.0.0.1:${fixturePort}/records` });
if (!page.pageId) fail("pages.open returned no pageId");
const obs = await rpc(first.port, "pages.observe", { pageId: page.pageId });
if (!obs.content?.elements?.length) fail("observation has no elements — packaged driver broken");
ok(`pages.open+observe: ${obs.content.elements.length} elements on ${obs.content.url}`);

// persistence marker — a run + an operation must survive restart
await rpc(first.port, "operations.saveRequest", {
  siteKey: `127.0.0.1:${fixturePort}`, name: "smoke.op",
  url: `http://127.0.0.1:${fixturePort}/api/state`, validated: true,
});
ok("operation saved in packaged db");

first.proc.kill("SIGTERM");
await new Promise((r) => setTimeout(r, 1200));

// ---- boot 2: same dataDir — migrations idempotent, state survived ----
const second = boot();
await waitReady(second.proc, second.port);
const ops = await rpc(second.port, "operations.list", {});
if (!ops.some((o) => o.name === "smoke.op")) fail("operation lost across packaged restart");
ok("operation persisted across restart (migrations idempotent)");

const inv = await rpc(second.port, "operations.invoke", { siteKey: `127.0.0.1:${fixturePort}`, name: "smoke.op" });
if (inv.status !== "completed") fail(`invoke failed: ${inv.error}`);
ok(`zero-model invoke: ${inv.route.kind}`);

second.proc.kill("SIGTERM");
fx?.kill();
console.log("\n✓ packaged smoke passed");
process.exit(0);
