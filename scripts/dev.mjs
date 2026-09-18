#!/usr/bin/env node
/**
 * `pnpm dev` — native product is ve-shell (no Electron). Fixtures start on
 * :4810–4812, then `ve-shell --gui --service` opens the records fixture
 * so a human and an authorized agent share one NativeBrowser.
 *
 * Hybrid Electron desktop: VECTOR_ELECTRON=1 pnpm dev
 * (or `pnpm dev:electron`).
 */
import { spawn, spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { startFixturesIfNeeded, waitForFixtures } from "./fixtures.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const electron = process.env.VECTOR_ELECTRON === "1" || process.argv.includes("--electron");

const procs = [];
const stop = () => procs.forEach((p) => p.kill());
process.on("SIGINT", () => { stop(); process.exit(0); });
process.on("SIGTERM", () => { stop(); process.exit(0); });

if (electron) {
  const tsc = join(root, "node_modules", ".bin", "tsc");
  console.log("▸ build workspace (Electron hybrid)");
  const b = spawnSync(tsc, ["-b", "tsconfig.json"], { cwd: root, stdio: "inherit" });
  if (b.status !== 0) process.exit(b.status ?? 1);
}

if (process.env.VECTOR_NO_FIXTURES !== "1") {
  procs.push(...(await startFixturesIfNeeded()));
  await waitForFixtures();
  console.log("▸ fixtures up on :4810 :4811 :4812");
}

if (!electron) {
  const url = process.env.VECTOR_DEV_URL || "http://127.0.0.1:4810/records";
  console.log(`▸ ve-shell --gui --service ${url} (native product)`);
  const app = spawn(
    "cargo",
    ["run", "-p", "ve-shell", "--features", "window,v8,http", "--", "--gui", "--service", "127.0.0.1:0", url],
    { cwd: join(root, "engine"), stdio: "inherit" },
  );
  procs.push(app);
  app.on("exit", (code) => {
    stop();
    process.exit(code ?? 0);
  });
} else {
  console.log("▸ vite dev server :5197");
  const vite = spawn(join(root, "apps/desktop/node_modules/.bin/vite"), ["--host", "127.0.0.1", "--strictPort"], {
    cwd: join(root, "apps/desktop"),
    stdio: "inherit",
  });
  procs.push(vite);
  await new Promise((r) => setTimeout(r, 1500));

  console.log("▸ electron (hybrid, not the product)");
  const electronBin = join(root, "apps/desktop/node_modules/.bin/electron");
  const { ELECTRON_RUN_AS_NODE: _drop, ...parentEnv } = process.env;
  const app = spawn(electronBin, ["."], {
    cwd: join(root, "apps/desktop"),
    stdio: "inherit",
    env: { ...parentEnv, VITE_DEV_SERVER_URL: "http://127.0.0.1:5197" },
  });
  procs.push(app);
  app.on("exit", (code) => {
    stop();
    process.exit(code ?? 0);
  });
}
