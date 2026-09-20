#!/usr/bin/env node
/**
 * `pnpm dev` starts the Aux desktop with Chromium-backed browsing.
 * `pnpm dev:native-engine` starts the specialized engine development harness.
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { startFixturesIfNeeded, waitForFixtures } from "./fixtures.mjs";
import { consumeBrowserServiceStdout } from "./browser-service-announce.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const electron = (process.env.AUX_ELECTRON || process.env.VECTOR_ELECTRON) === "1" || process.argv.includes("--electron");

const procs = [];
const stop = () => procs.forEach((p) => p.kill());
process.on("SIGINT", () => { stop(); process.exit(0); });
process.on("SIGTERM", () => { stop(); process.exit(0); });

if (electron) {
  const tsc = join(root, "node_modules", ".bin", "tsc");
  console.log("▸ build workspace (Electron hybrid)");
  const b = spawnSync(tsc, ["-b", "tsconfig.json"], { cwd: root, stdio: "inherit" });
  if (b.status !== 0) process.exit(b.status ?? 1);
  // Desktop builds overwrite tsc output with self-contained entrypoints. Always
  // regenerate them from source; incremental tsc may otherwise leave stale code,
  // or emit a preload that cannot import workspace modules inside the sandbox.
  const desktop = spawnSync(process.execPath, [join(root, "apps/desktop/bundle.mjs")], { cwd: root, stdio: "inherit" });
  if (desktop.status !== 0) process.exit(desktop.status ?? 1);
}

if (!electron && (process.env.AUX_NO_FIXTURES || process.env.VECTOR_NO_FIXTURES) !== "1") {
  procs.push(...(await startFixturesIfNeeded()));
  await waitForFixtures();
  console.log("▸ fixtures up on :4810 :4811 :4812");
}

function resolveDevShell() {
  const named = (process.env.AUX_SHELL || process.env.VECTOR_SHELL)?.trim();
  const candidates = [
    named,
    join(root, "release", "ve-shell"),
    join(root, "engine", "target", "release", "ve-shell"),
    join(root, "engine", "target", "debug", "ve-shell"),
  ];
  return candidates.find((p) => p && existsSync(p));
}

function ensureRuntimeBuilt() {
  const entry = join(root, "apps", "runtime", "dist", "main.js");
  if (existsSync(entry)) return entry;
  console.log("▸ build runtime (tsc)");
  const tsc = join(root, "node_modules", ".bin", "tsc");
  const b = spawnSync(tsc, ["-b", "packages/contracts", "packages/engine-client", "apps/runtime"], {
    cwd: root,
    stdio: "inherit",
  });
  if (b.status !== 0) process.exit(b.status ?? 1);
  return entry;
}

function startRuntimeClient(addr, token) {
  const entry = ensureRuntimeBuilt();
  console.log(`▸ runtime client of ${addr} (MCP/API, same page)`);
  const rt = spawn(process.execPath, [entry], {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      VECTOR_BROWSER_SERVICE: addr,
      VECTOR_BROWSER_SERVICE_TOKEN: token,
      VECTOR_ENGINE_MODE: process.env.VECTOR_ENGINE_MODE || "always",
      VECTOR_RUNTIME_AUTOSTART: "1",
    },
  });
  procs.push(rt);
}

if (!electron) {
  const url = process.env.VECTOR_DEV_URL || "http://127.0.0.1:4810/records";
  const bin = resolveDevShell();
  console.log(`▸ ve-shell --gui --service ${url} (native product)`);
  const app = bin
    ? spawn(bin, ["--gui", "--service", "127.0.0.1:0", url], {
        cwd: root,
        stdio: ["ignore", "pipe", "inherit"],
        env: process.env,
      })
    : spawn(
        "cargo",
        ["run", "-p", "ve-shell", "--features", "window,v8,http", "--", "--gui", "--service", "127.0.0.1:0", url],
        { cwd: join(root, "engine"), stdio: ["ignore", "pipe", "inherit"], env: process.env },
      );
  procs.push(app);
  let buf = "";
  let attached = false;
  app.stdout?.on("data", (chunk) => {
    if (attached) return;
    const next = consumeBrowserServiceStdout(buf, chunk);
    buf = next.rest;
    if (!next.addr) return;
    attached = true;
    console.log(`▸ VECTOR_BROWSER_SERVICE=${next.addr}`);
    startRuntimeClient(next.addr, next.token);
  });
  app.on("exit", (code) => {
    stop();
    process.exit(code ?? 0);
  });
} else {
  console.log("▸ vite dev server :5197");
  const vite = spawn(join(root, "apps/desktop/node_modules/.bin/vite"), ["--host", "127.0.0.1", "--strictPort"], {
    cwd: join(root, "apps/desktop"),
    stdio: ["ignore", "pipe", "pipe"],
  });
  procs.push(vite);
  try {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("Renderer startup timed out on port 5197.")), 30_000);
      const failed = (code) => { clearTimeout(timer); reject(new Error(`Renderer exited before startup (${code}). Check whether port 5197 is already in use.`)); };
      vite.once("exit", failed);
      vite.once("error", error => { clearTimeout(timer); reject(error); });
      let output = "";
      vite.stderr.on("data", chunk => process.stderr.write(chunk));
      vite.stdout.on("data", chunk => {
        process.stdout.write(chunk);
        output = (output + chunk.toString()).slice(-4096);
        if (output.includes("http://127.0.0.1:5197/")) {
          clearTimeout(timer); vite.off("exit", failed); resolve();
        }
      });
    });
  } catch (error) {
    console.error(`Aux could not start: ${error.message}`);
    stop(); process.exit(1);
  }
  vite.on("exit", code => { stop(); process.exit(code || 1); });

  console.log("▸ Aux desktop (Chromium-first)");
  const electronBin = join(root, "apps/desktop/node_modules/.bin/electron");
  const { ELECTRON_RUN_AS_NODE: _drop, ...parentEnv } = process.env;
  const app = spawn(electronBin, [".", ...process.argv.slice(2).filter(arg => arg === "--use-mock-keychain")], {
    cwd: join(root, "apps/desktop"),
    stdio: "inherit",
    env: { ...parentEnv, VITE_DEV_SERVER_URL: "http://127.0.0.1:5197" },
  });
  procs.push(app);
  app.on("error", error => { console.error(`Aux could not start: ${error.message}`); stop(); process.exit(1); });
  app.on("exit", (code) => {
    stop();
    process.exit(code ?? 0);
  });
}
