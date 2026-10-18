// Interactive Store lifecycle qualification. Requires a human to operate Chrome-owned UI.
// AUX_CANDIDATE_BIN=/.../out/AuxFast/Aux.app/Contents/MacOS/Aux AUX_STORE_EXTENSION_ID=<actual-id> node scripts/dev.mjs -- node this-file
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createInterface } from "node:readline/promises";

import { nativeSource } from "../../chromium/dev-config.mjs";
import { assertDevLock } from "../../scripts/dev.mjs";
import {
  inspectAuxCandidate,
  assertAuxCandidateUnchanged,
  assertCandidateBrowserVersion,
} from "./native-candidate.mjs";

const root = resolve(import.meta.dirname, "../..");
const { chromium } = createRequire(join(root, "packages/chromium-driver/package.json"))("playwright-core");
const binary = process.env.AUX_CANDIDATE_BIN;
const storeId = process.env.AUX_STORE_EXTENSION_ID;
assert.ok(binary && existsSync(binary), "Set AUX_CANDIDATE_BIN to a compiled Aux candidate.");
assert.match(storeId ?? "", /^[a-p]{32}$/, "Set AUX_STORE_EXTENSION_ID to a Chrome Web Store extension ID.");
assert.ok(process.stdin.isTTY, "Store lifecycle requires a human at the candidate UI.");

const candidateProof = binary
  ? (() => {
      assertDevLock();
      return inspectAuxCandidate(binary, {
        source: nativeSource,
        generatedHeader: join(root, "chromium/generated/aux_host_methods.h"),
        capability: "extensions",
      });
    })()
  : undefined;
const directory = mkdtempSync(join(tmpdir(), "aux-store-lifecycle-"));
const profile = join(directory, "profile");
const probe = join(directory, "probe");
mkdirSync(probe);
writeFileSync(
  join(probe, "manifest.json"),
  JSON.stringify({
    manifest_version: 3,
    name: "Aux Store lifecycle observer",
    version: "1.0",
    permissions: ["management"],
    background: { service_worker: "worker.js" },
  }),
);
writeFileSync(join(probe, "worker.js"), "chrome.runtime.onInstalled.addListener(()=>{});");
writeFileSync(join(probe, "inspect.html"), "<!doctype html><title>Aux Store lifecycle observer</title>");
const evidence = {
  at: new Date().toISOString(),
  binary: candidateProof.executable.path,
  storeId,
  profile: "disposable",
  candidateIdentity: candidateProof,
  checks: {},
};
const input = createInterface({ input: process.stdin, output: process.stdout });
let context;
const launch = async () => {
  if (candidateProof) {
    assertDevLock();
    assertAuxCandidateUnchanged(candidateProof);
  }
  context = await chromium.launchPersistentContext(profile, {
    headless: false,
    executablePath: candidateProof.executable.path,
    env: { PATH: process.env.PATH, HOME: directory, TMPDIR: directory },
    args: [`--load-extension=${probe}`, "--use-mock-keychain", "--password-store=basic", "--no-first-run"],
  });
  assertCandidateBrowserVersion(context, candidateProof);
  const worker =
    context.serviceWorkers()[0] ?? (await context.waitForEvent("serviceworker", { timeout: 30_000 }));
  const page = await context.newPage();
  await page.goto(`chrome-extension://${new URL(worker.url()).host}/inspect.html`);
  return page;
};
const inspect = async (page) =>
  page.evaluate(async (id) => {
    try {
      const item = await chrome.management.get(id);
      return {
        installed: true,
        id: item.id,
        name: item.name,
        version: item.version,
        enabled: item.enabled,
        installType: item.installType,
        permissions: item.permissions,
      };
    } catch {
      return { installed: false };
    }
  }, storeId);
const checkpoint = async (message) => {
  const answer = await input.question(`${message} Type yes to continue, or anything else to stop: `);
  assert.equal(answer.trim().toLowerCase(), "yes", "Operator stopped the Store probe.");
};
try {
  let observer = await launch();
  const storePage = await context.newPage();
  await storePage.goto(`https://chromewebstore.google.com/detail/${storeId}`);
  await checkpoint("In the candidate UI, review the Store listing, install it and approve its permissions.");
  const installed = await inspect(observer);
  assert.ok(
    installed.installed && installed.enabled,
    "Store extension did not appear enabled after UI installation.",
  );
  evidence.checks.install = installed;
  evidence.checks.permissionPrompt = {
    status: "operator_confirmed",
    note: "Prompt content is not captured by Playwright.",
  };

  try {
    await observer.evaluate((id) => chrome.management.setEnabled(id, false), storeId);
    assert.equal((await inspect(observer)).enabled, false);
    await observer.evaluate((id) => chrome.management.setEnabled(id, true), storeId);
    assert.equal((await inspect(observer)).enabled, true);
    evidence.checks.disableEnable = { status: "pass" };
  } catch (error) {
    evidence.checks.disableEnable = { status: "fail", reason: String(error) };
  }

  await context.close();
  context = undefined;
  observer = await launch();
  const retained = await inspect(observer);
  assert.ok(
    retained.installed && retained.enabled && retained.id === storeId,
    "Store extension was not retained after candidate restart.",
  );
  evidence.checks.restart = retained;
  evidence.checks.update = {
    status: "unqualified",
    reason: "A Store update needs a published version change; opening a current listing cannot prove one.",
  };

  await context.newPage().then((page) => page.goto("chrome://extensions"));
  await checkpoint("Remove the Store extension in chrome://extensions, including its native confirmation.");
  assert.equal((await inspect(observer)).installed, false, "Store extension remained installed.");
  evidence.checks.remove = { status: "pass" };
  await context.close();
  context = undefined;
  observer = await launch();
  assert.equal((await inspect(observer)).installed, false, "Removed Store extension returned after restart.");
  evidence.checks.removedAfterRestart = { status: "pass" };
  const artifact = join(root, "release/test-artifacts/aux-candidate-store-lifecycle.json");
  mkdirSync(join(root, "release/test-artifacts"), { recursive: true });
  if (candidateProof) {
    assertDevLock();
    assertAuxCandidateUnchanged(candidateProof);
  }
  writeFileSync(artifact, JSON.stringify(evidence, null, 2) + "\n");
  console.log(JSON.stringify(evidence, null, 2));
} finally {
  input.close();
  await context?.close().catch(() => {});
  rmSync(directory, { recursive: true, force: true });
}
