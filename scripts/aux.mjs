#!/usr/bin/env node
/**
 * Runs Aux locally: the rebranded Aside daemon, the authenticated CDP gate and the browser.
 *
 *   node scripts/aux.mjs [--chromium <binary>] [--home <dir>] [--profile <dir>] [--temp-profile]
 *                        [--env-file <file>] [--real-keychain] [--no-browser] [-- <extra browser args>]
 *
 * The daemon and extensions come from `out/aside-staged` (build them with `npm run vendor:aside`).
 */
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { startCdpGate } from "../vendor/aside/shims/aux-cdp-gate.mjs";
import { AUX_CDP_PORT, AUX_PORT } from "../vendor/aside/patches/daemon.mjs";

const root = resolve(import.meta.dirname, "..");
const staged = join(root, "out/aside-staged");
const args = process.argv.slice(2);
const separator = args.indexOf("--");
const extraBrowserArgs = separator === -1 ? [] : args.splice(separator).slice(1);
const flag = (name) => args.includes(name);
const option = (name) => (flag(name) ? args[args.indexOf(name) + 1] : undefined);

const home = resolve(option("--home") ?? process.env.ASIDE_HOME ?? join(homedir(), ".aux"));
const tempProfile = flag("--temp-profile");
const profile = tempProfile ? mkdtempSync(join(tmpdir(), "aux-profile-")) : resolve(option("--profile") ?? join(home, "profile"));
const chromium = resolve(
  option("--chromium") ??
    process.env.AUX_CHROMIUM ??
    join(homedir(), "Documents/Code/aux-chromium-security-155/chromium/src/out/AuxAside/Aux.app/Contents/MacOS/Aux"),
);
const upstreamPort = AUX_CDP_PORT + 1;

function loadEnvFile(path) {
  const values = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (match) values[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
  }
  return values;
}

function seedRuntime() {
  const from = join(staged, "agent-runtime");
  const to = join(home, "runtime");
  const version = (directory) => (existsSync(join(directory, "version.txt")) ? readFileSync(join(directory, "version.txt"), "utf8").trim() : null);
  if (version(to) === version(from)) return;
  console.log("seeding agent runtime");
  mkdirSync(home, { recursive: true });
  rmSync(to, { recursive: true, force: true });
  execFileSync("cp", ["-cR", from, to]);
}

function seedMemory() {
  const from = join(staged, "memory");
  if (!existsSync(from)) return;
  for (const name of readdirSync(from)) {
    if (!existsSync(join(home, name))) execFileSync("cp", ["-cR", join(from, name), join(home, name)]);
  }
}

for (const required of ["Aux Daemon.app", "extensions/agent-manager", "extensions/password-manager", "agent-runtime"]) {
  if (!existsSync(join(staged, required))) {
    console.error(`Missing ${required} in out/aside-staged. Run: node scripts/vendor-aside.mjs`);
    process.exit(1);
  }
}
if (!flag("--no-browser") && !existsSync(chromium)) {
  console.error(`Browser binary not found: ${chromium}\nPass --chromium <binary> or set AUX_CHROMIUM.`);
  process.exit(1);
}

seedRuntime();
seedMemory();
const children = [];
const stop = () => {
  for (const child of children) child.kill("SIGTERM");
  if (tempProfile) rmSync(profile, { recursive: true, force: true });
};
process.on("exit", () => children.forEach((child) => child.kill("SIGTERM")));
process.on("uncaughtException", (error) => {
  console.error(error.code === "EADDRINUSE" ? `Port ${error.port} is in use. Is another Aux running?` : error);
  process.exit(1);
});
process.on("SIGINT", () => (stop(), process.exit(130)));
process.on("SIGTERM", () => (stop(), process.exit(143)));

const daemon = spawn(join(staged, "Aux Daemon.app/Contents/MacOS/aux-daemon"), [], {
  env: { ...process.env, ...(option("--env-file") ? loadEnvFile(resolve(option("--env-file"))) : {}), ASIDE_HOME: home },
  stdio: ["ignore", "inherit", "inherit"],
});
children.push(daemon);
daemon.on("exit", (code) => {
  console.error(`daemon exited (${code})`);
  stop();
  process.exit(code ?? 1);
});
console.log(`daemon on http://127.0.0.1:${AUX_PORT} · home ${home}`);

// The daemon creates its installation keys on first start; the gate needs them to verify signatures.
for (let waited = 0; !existsSync(join(home, "install/sig.pem")); waited += 200) {
  if (waited > 60_000) throw new Error("Daemon did not create installation keys");
  await new Promise((done) => setTimeout(done, 200));
}
await startCdpGate({ port: AUX_CDP_PORT, upstreamPort, home, log: console.error });
console.log(`cdp gate on localhost:${AUX_CDP_PORT} -> ${upstreamPort}`);

if (flag("--no-browser")) {
  console.log("browser skipped; Ctrl-C to stop");
} else {
  const extensions = ["agent-manager", "password-manager"].map((name) => join(staged, "extensions", name)).join(",");
  const browser = spawn(
    chromium,
    [
      `--user-data-dir=${profile}`,
      `--remote-debugging-port=${upstreamPort}`,
      "--remote-debugging-address=127.0.0.1",
      "--remote-allow-origins=*",
      `--load-extension=${extensions}`,
      "--no-first-run",
      "--no-default-browser-check",
      // Without an Aux-signed build, the Keychain prompt for the cookie key stalls every network request.
      ...(flag("--real-keychain") ? [] : ["--use-mock-keychain"]),
      ...extraBrowserArgs,
    ],
    { stdio: "inherit" },
  );
  children.push(browser);
  browser.on("exit", (code) => {
    stop();
    process.exit(code ?? 0);
  });
}
