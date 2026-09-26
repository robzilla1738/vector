#!/usr/bin/env node
/** Inventory shell calls that the current Chromium host cannot answer. */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const renderer = join(root, "apps/shell/src");
const nativeRoot = resolve(process.env.AUX_CHROMIUM_SRC ?? join(process.env.HOME, "aux-chromium-stable/chromium/src"));
const registry = join(nativeRoot, "chrome/browser/ui/aux/method_registry.cc");
const bootstrap = join(nativeRoot, "chrome/browser/resources/aux_host/aux_host_bootstrap.ts");
if (!existsSync(registry)) throw new Error(`Native method registry unavailable: ${registry}`);
if (!existsSync(bootstrap)) throw new Error(`Native host bootstrap unavailable: ${bootstrap}`);

// The renderer bridge surface is the generated host client: every HostMethods
// entry plus every HostEvents subscription, composed members aside.
const { HostMethods, HostEvents } = await import("../packages/contracts/dist/host-methods.js");
const methods = [...Object.keys(HostMethods), ...Object.keys(HostEvents)];
if (!methods.length) throw new Error("Host method manifest unavailable");

const bridgePath = join(renderer, "bridge.ts");
const source = ts.createSourceFile(bridgePath, readFileSync(bridgePath, "utf8"), ts.ScriptTarget.Latest, true);
let local = new Set();
source.forEachChild(node => {
  if (ts.isInterfaceDeclaration(node) && node.name.text === "ComposedBridgeMembers")
    local = new Set(node.members.map(member => member.name?.getText(source)).filter(Boolean));
});
if (!local.size) throw new Error("ComposedBridgeMembers interface unavailable");

function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? files(path) : /\.[jt]sx?$/.test(path) && path !== bridgePath ? [path] : [];
  });
}
const rendererText = files(renderer).map(path => readFileSync(path, "utf8")).join("\n");
const called = methods.filter(method => new RegExp(`\\.\\s*${method}\\b`).test(rendererText));
const nativeText = readFileSync(registry, "utf8");
const registrations = [...nativeText.matchAll(/register_shell\([\s\S]*?\{([^}]+)\}\);/g)];
if (registrations.length < 5) throw new Error("Native shell registration inventory is incomplete");
const handled = new Set(registrations.flatMap(match =>
  [...match[1].matchAll(/"([^"]+)"/g)].map(name => name[1])));

// Methods the aux_host bootstrap answers without the shell registry (e.g.
// autocomplete through the searchbox mojo surface).
const bootstrapText = readFileSync(bootstrap, "utf8");
for (const match of bootstrapText.matchAll(/method === '([^']+)'/g)) handled.add(match[1]);

// Events the bootstrap forwards come from its hostEvents allowlist; any other
// HostEvents entry currently has no native producer.
const produced = new Set();
const hostEventsMatch = bootstrapText.match(/hostEvents = new Set\(\[([\s\S]*?)\]\)/);
if (!hostEventsMatch) throw new Error("Native host event inventory unavailable");
for (const match of hostEventsMatch[1].matchAll(/'([^']+)'/g)) produced.add(match[1]);

const missing = called.filter(method =>
  !local.has(method) && !handled.has(method) && !produced.has(method));

console.log(`${called.length} renderer-used AuxBridge members; ${missing.length} lack a native handler/producer`);
console.log(`${methods.length} manifest members; ${handled.size} native method handlers, ${produced.size} native event producers, ${local.size} composed`);
for (const method of missing) console.log(method);
if (process.argv.includes("--check") && missing.length) process.exitCode = 1;
