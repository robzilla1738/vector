#!/usr/bin/env node
/** Inventory shell calls that the current Chromium host cannot answer. */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const renderer = join(root, "apps/desktop/renderer/src");
const nativeRoot = resolve(process.env.AUX_CHROMIUM_SRC ?? join(process.env.HOME, "aux-chromium-stable/chromium/src"));
const handler = join(nativeRoot, "chrome/browser/ui/webui_browser/webui_browser_ui.cc");
if (!existsSync(handler)) throw new Error(`Native handler unavailable: ${handler}`);

const bridgePath = join(renderer, "bridge.ts");
const source = ts.createSourceFile(bridgePath, readFileSync(bridgePath, "utf8"), ts.ScriptTarget.Latest, true);
let methods = [];
source.forEachChild(node => {
  if (ts.isInterfaceDeclaration(node) && node.name.text === "AuxBridge")
    methods = node.members.map(member => member.name?.getText(source)).filter(Boolean);
});
if (!methods.length) throw new Error("AuxBridge interface unavailable");

function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? files(path) : /\.[jt]sx?$/.test(path) && path !== bridgePath ? [path] : [];
  });
}
const rendererText = files(renderer).map(path => readFileSync(path, "utf8")).join("\n");
const called = methods.filter(method => new RegExp(`\\.\\s*${method}\\b`).test(rendererText));
const nativeText = readFileSync(handler, "utf8");
const handled = new Set([...nativeText.matchAll(/method\s*==\s*"([^"]+)"/g)].map(match => match[1]));

// These methods are implemented by the bridge adapter itself, not a native request.
const local = new Set(["windowId", "platform", "privateMode", "quickAskMode", "overlay", "windows", "invoke", "setShortcutOverrides"]);
// The other on* members are forwarded subscriptions. These four currently
// have no native producer and belong in the missing-capability inventory.
const missingEvents = new Set(["onQuickAskState", "onPreviewFrame", "onHttpAuthChanged", "onTranslationChanged"]);
const missing = called.filter(method =>
  missingEvents.has(method) || (!local.has(method) && !method.startsWith("on") && !handled.has(method)));

console.log(`${called.length} renderer-used AuxBridge members; ${missing.length} lack a native handler/producer`);
for (const method of missing) console.log(method);
if (process.argv.includes("--check") && missing.length) process.exitCode = 1;
