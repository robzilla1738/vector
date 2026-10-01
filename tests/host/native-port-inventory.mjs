// Exact source inventory for the Electron-to-native test migration. Every
// smoke/e2e file is classified; only assertions actually exercised by the
// native Aux.app runner are marked partial.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const currentSmoke = readdirSync(join(root, "tests/smoke"))
  .filter(name => /\.(?:mjs|cjs)$/.test(name)).map(name => `tests/smoke/${name}`).sort();
// Main retired the Electron harness in 56c53810. Its unresolved assertions
// remain in this audit; deletion never counts as native coverage.
const retirementBase = "51af67ef806e78dbe3ef9a6395f9ff538bd36dfd";
const retirementCommit = "56c53810";
const git = args => execFileSync("git", args, { cwd: root, encoding: "utf8" });
const retired = new Set(git(["diff", "--name-only", "--diff-filter=D", retirementBase, retirementCommit, "--", "tests/smoke", "tests/e2e"]).trim().split("\n"));
const historicalSmoke = git(["ls-tree", "-r", "--name-only", retirementBase, "--", "tests/smoke"]).trim().split("\n")
  .filter(path => /\.(?:mjs|cjs)$/.test(path));
const smoke = [...new Set([...historicalSmoke, ...currentSmoke])].sort();
for (const path of smoke) assert.ok(currentSmoke.includes(path) || retired.has(path), `Unreviewed inventory deletion: ${path}`);
const e2e = "tests/e2e/desktop.test.ts";
const support = new Set([
  "create-space.mjs", "dev-launcher.mjs", "launch.mjs", "poll.mjs",
  "run-suite.mjs", "sidebar-action.mjs", "native-messaging-manifests.mjs",
  "native-messaging-manifests.test.mjs", "internal-cdp-oopif.cjs", "internal-cdp-policy.cjs",
]);
const independent = new Set([
  "chromium-extension-baseline.mjs", "chromium-extension-compat.mjs",
  "chromium-store-lifecycle.mjs", "chromium-webauthn-virtual.mjs", "muse-gateway.mjs",
]);
const partial = new Map([
  ["find-desktop.mjs", "Native Find counts visible matches, advances, handles no result and clears; the Find bar's UI and debounce remain."],
  ["floating-sidebar-design.mjs", "Edge reveal, visible change, Escape dismissal; exact blur, bounds, reduced-motion, and outside-click assertions remain."],
  ["keyboard-browser-desktop.mjs", "Control-Tab selects both real tabs; other browser keyboard shortcuts remain."],
  ["restore-tabs-desktop.mjs", "Official Aux.app restores one active tab with a stable page ID; 20/100-tab resource and latency trials remain."],
  ["shell-visual-desktop.mjs", "Expanded/collapsed/peek/horizontal captures and Command-L focus; populated spaces, rail and fine layout checks remain."],
  ["tab-activation-desktop.mjs", "Keyboard switching updates the active native page ID in both layouts; other activation routes remain."],
  ["tab-loading-desktop.mjs", "Two real pages finish loading and preserve distinct IDs; loading-state UI timing remains."],
  ["two-profiles-desktop.mjs", "Two disposable regular Profiles isolate cookies and page authority across a restart; managed extensions and site storage remain."],
]);

const files = smoke.map(path => {
  const name = path.split("/").at(-1);
  const history = currentSmoke.includes(path) ? {} : { retired: true, sourceCommit: retirementBase };
  if (support.has(name)) return { path, kind: "support", ...history };
  if (independent.has(name)) return { path, kind: "independent", ...history };
  return { path, kind: "electron", ...history, status: partial.has(name) ? "partial" : "remaining", ...(partial.has(name) ? { nativeCoverage: partial.get(name) } : {}) };
});
assert.equal(new Set(files.map(file => file.path)).size, smoke.length);
for (const name of [...support, ...independent, ...partial.keys()]) {
  assert.ok(smoke.includes(`tests/smoke/${name}`), `Inventory entry disappeared: ${name}`);
}
const e2eCoverage = new Map([
  ["drives an embedded Chromium page through the loopback API", ["partial", "Native open, observe, action and foreground identity; extraction remains."]],
  ["two tabs with identical URLs get distinct identities", ["ported", "Native duplicate URLs preserve distinct page and target IDs."]],
  ["interactive programs run in parallel on background pages without flipping the focused tab", ["partial", "Native parallel fills and focus retention; timing and press action remain."]],
  ["takeover blocks dispatch on the live page", ["partial", "Native takeover blocks a click and resumes; exact conflict code remains."]],
]);
assert.ok(existsSync(join(root, e2e)) || retired.has(e2e), "Unreviewed Electron e2e deletion");
const e2eSource = existsSync(join(root, e2e)) ? readFileSync(join(root, e2e), "utf8") : git(["show", `${retirementBase}:${e2e}`]);
const cases = [...e2eSource.matchAll(/\bit\("([^"]+)"/g)].map(match => {
  const coverage = e2eCoverage.get(match[1]);
  assert.ok(coverage, `Review new Electron e2e case: ${match[1]}`);
  return { name: match[1], status: coverage[0], nativeCoverage: coverage[1] };
});
assert.equal(cases.length, e2eCoverage.size, "Review removed Electron e2e cases");
const inventory = { schema: 1, nativeRunner: "tests/host/native-app-journeys.mjs", files, e2eCases: cases };
const markdown = [
  "# Electron to native test inventory", "",
  "Generated by `node tests/host/native-port-inventory.mjs --markdown`. `ported` means a whole e2e case is covered by native Aux.app, including the development build when applicable. `partial` means specific assertions run natively but the Electron file or case still has unported assertions. `remaining` has no claimed native parity. `support` is harness, fixture or unit code, while `independent` exercises a stock/candidate Chromium or non-shell service and is outside the Electron deletion set.", "",
  `Smoke files: ${files.length}; Electron journey files: ${files.filter(file => file.kind === "electron").length}; partially covered: ${files.filter(file => file.status === "partial").length}; remaining without native coverage: ${files.filter(file => file.status === "remaining").length}.`, "",
  `Current smoke files: ${currentSmoke.length}. Files retired by \`${retirementCommit}\` retain their unresolved coverage below; their original source is at \`${retirementBase}\`. Retirement is not a port. The retired Electron e2e cases are likewise retained.`, "",
  "## Electron journey files", "",
  ...files.filter(file => file.kind === "electron").map(file => `- **${file.status}** \`${file.path}\`${file.nativeCoverage ? ` — ${file.nativeCoverage}` : ""}`),
  "", "## Electron e2e cases", "",
  ...cases.map(item => `- **${item.status}** \`${item.name}\` (${e2e}) — ${item.nativeCoverage}`),
  "", "## Other files in the directory", "",
  ...files.filter(file => file.kind !== "electron").map(file => `- **${file.kind}** \`${file.path}\``), "",
].join("\n");
const doc = join(root, "docs/NATIVE_TEST_PORT_INVENTORY.md");
if (process.argv.includes("--check")) {
  assert.equal(readFileSync(doc, "utf8"), markdown, "Regenerate native test inventory after changing the Electron suite");
} else if (process.argv.includes("--write")) {
  writeFileSync(doc, markdown);
} else if (process.argv.includes("--markdown")) {
  process.stdout.write(markdown);
} else {
  console.log(JSON.stringify(inventory, null, 2));
}
