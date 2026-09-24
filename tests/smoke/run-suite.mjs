#!/usr/bin/env node
/**
 * Grouped desktop smoke runner — executes tests/smoke files serially with a
 * per-file timeout and stray-process cleanup between runs.
 *
 *   node tests/smoke/run-suite.mjs release
 *   node tests/smoke/run-suite.mjs all
 *   node tests/smoke/run-suite.mjs private-boundary-desktop packaged
 *
 * Suites:
 *   release — the grouped release gate named in the 2026-09-22 handoff §18.1.
 *   all     — every *.mjs smoke file in this directory.
 *
 * Env:
 *   AUX_SMOKE_TIMEOUT_MS     per-file timeout override (default 480000)
 *   AUX_SMOKE_CONTINUE       "0" stops the suite on the first failure
 */
import { spawn, spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const DESIGN_SUITE = [
  "toolbar-glass-design", "floating-sidebar-design", "tab-preview-layout",
  "sidebar-sessions", "new-chat-design", "settings-design", "projects-design",
  "tab-groups", "motion-design", "conversation-jump-design", "text-contrast-design",
];
const RELEASE_SUITE = [
  "runtime-recovery-desktop",
  "tab-recovery-desktop",
  "unsaved-work-desktop",
  "window-unsaved-work-desktop",
  "conversation-lifecycle-desktop",
  "conversation-context-desktop",
  "conversation-multi-tab-desktop",
  "page-action-context-desktop",
  "conversation-queue-desktop",
  "private-boundary-desktop",
  "authentication-navigation-desktop",
  "scoped-agent-connection-desktop",
  "local-projects-desktop",
  "packaged",
];
// Long-running files get a wider timeout; tune per-file here.
const TIMEOUT_OVERRIDES_MS = {
  packaged: 900_000,
  "private-boundary-desktop": 600_000,
  "multi-window-desktop": 600_000,
  "private-desktop": 600_000,
};
const DEFAULT_TIMEOUT_MS = Number(process.env.AUX_SMOKE_TIMEOUT_MS ?? 480_000);

const requested = process.argv.slice(2);
if (requested.length === 0) {
  console.error("usage: node tests/smoke/run-suite.mjs <release|design|all|file ...>");
  process.exit(2);
}
let names;
if (requested.length === 1 && requested[0] === "release") names = RELEASE_SUITE;
else if (requested.length === 1 && requested[0] === "design") names = DESIGN_SUITE;
else if (requested.length === 1 && requested[0] === "all") {
  names = readdirSync(dir)
    .filter((f) => f.endsWith(".mjs") && f !== "run-suite.mjs" && !f.startsWith("zz-"))
    .map((f) => f.slice(0, -4))
    .sort();
} else names = requested;

const killStrays = () => {
  // Tests that hung leave Electron/private-process children; tests take their
  // own pids but a timed-out child can escape cleanup. Kill only processes
  // whose command line is unmistakably ours.
  for (const pattern of ["aux-private", "Aux Browser"]) {
    spawnSync("pkill", ["-9", "-f", pattern], { stdio: "ignore" });
  }
};

const results = [];
let failed = 0;
for (const name of names) {
  const file = join(dir, `${name}.mjs`);
  const timeout = TIMEOUT_OVERRIDES_MS[name] ?? DEFAULT_TIMEOUT_MS;
  const started = Date.now();
  process.stdout.write(`\n=== ${name} ===\n`);
  const child = spawn(process.execPath, [file], {
    stdio: "inherit",
    detached: true, // own process group so we can kill children on timeout
    env: { ...process.env },
  });
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    try {
      process.kill(-child.pid, "SIGKILL");
    } catch {
      try { child.kill("SIGKILL"); } catch { /* already dead */ }
    }
  }, timeout);
  const code = await new Promise((resolve) => {
    child.on("exit", (c) => resolve(c));
    child.on("error", () => resolve(1));
  });
  clearTimeout(timer);
  killStrays();
  const secs = ((Date.now() - started) / 1000).toFixed(1);
  const status = timedOut ? `TIMEOUT (>${(timeout / 1000).toFixed(0)}s)` : code === 0 ? "PASS" : `FAIL (exit ${code})`;
  results.push({ name, status, secs });
  if (timedOut || code !== 0) {
    failed += 1;
    if (process.env.AUX_SMOKE_CONTINUE === "0") break;
  }
}

console.log("\n=== smoke suite results ===");
for (const r of results) console.log(`${r.status.padEnd(18)} ${r.name} (${r.secs}s)`);
console.log(`${results.length - failed}/${results.length} passed`);
process.exit(failed === 0 ? 0 : 1);
