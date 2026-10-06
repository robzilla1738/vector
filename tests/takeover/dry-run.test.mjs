import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "../..");
const invoke = (path, args = []) =>
  spawnSync(process.execPath, [resolve(root, path), ...args], { cwd: root, encoding: "utf8" });

test("signing dry run reports blockers and never creates output", () => {
  const directory = mkdtempSync(resolve(tmpdir(), "aux-sign-test-"));
  try {
    const input = resolve(directory, "missing-build");
    const output = resolve(directory, "output");
    const result = invoke("scripts/chromium-sign.mjs", ["--input", input, "--output", output]);
    assert.equal(result.status, 0, result.stderr);
    const plan = JSON.parse(result.stdout);
    assert.equal(plan.ready, false);
    assert.ok(plan.blockers.some((blocker) => blocker.includes("is_component_build=false")));
    assert.equal(plan.signing, "ad-hoc");
    assert.deepEqual(readdirSync(directory), []);
    const refused = invoke("scripts/chromium-sign.mjs", ["--input", input, "--output", output, "--execute"]);
    assert.notEqual(refused.status, 0);
    assert.deepEqual(readdirSync(directory), []);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("notarization always stays a dry run", () => {
  const result = invoke("scripts/chromium-notarize.mjs");
  assert.equal(result.status, 0, result.stderr);
  const plan = JSON.parse(result.stdout);
  assert.equal(plan.submitted, false);
  assert.equal(plan.mode, "dry-run");
  assert.ok(plan.commands.some((command) => command.includes("notarytool")));
  assert.notEqual(invoke("scripts/chromium-notarize.mjs", ["--execute"]).status, 0);
});

test("all owner takeover cases dry-run without qualification", () => {
  const result = invoke("tests/takeover/run.mjs");
  assert.equal(result.status, 0, result.stderr);
  const plan = JSON.parse(result.stdout);
  assert.equal(plan.mode, "dry-run");
  assert.equal(plan.qualified, false);
  assert.deepEqual(
    plan.cases.map((entry) => entry.id),
    ["keychain", "onepassword", "passkey", "sparkle", "crashpad", "notarization"],
  );
  assert.notEqual(invoke("tests/takeover/run.mjs", ["--execute"]).status, 0);
});

test("takeover report accepts a symlinked workspace path and refuses replacement", () => {
  const directory = mkdtempSync(resolve(tmpdir(), "aux-takeover-alias-"));
  const alias = join(directory, "checkout");
  const filename = `alias-${process.pid}-${Date.now()}.json`;
  const output = join(alias, "release/test-artifacts", filename);
  const actual = join(root, "release/test-artifacts", filename);
  try {
    symlinkSync(root, alias, "dir");
    const first = invoke("tests/takeover/run.mjs", ["--output", output]);
    assert.equal(first.status, 0, first.stderr);
    assert.ok(existsSync(actual));
    const second = invoke("tests/takeover/run.mjs", ["--output", output]);
    assert.notEqual(second.status, 0);
  } finally {
    rmSync(actual, { force: true });
    rmSync(directory, { recursive: true, force: true });
  }
});

test(
  "packaging rejects a browser that would use Chromium or Electron profile storage",
  { skip: process.platform !== "darwin" },
  () => {
    const directory = mkdtempSync(resolve(tmpdir(), "aux-profile-sign-test-"));
    try {
      const contents = resolve(directory, "Aux.app/Contents");
      mkdirSync(contents, { recursive: true });
      for (const productDir of ["", "Chromium", "Aux Browser Profile", "Aux"]) {
        writeFileSync(
          resolve(contents, "Info.plist"),
          `<?xml version="1.0"?><plist version="1.0"><dict>
        <key>CFBundleIdentifier</key><string>dev.aux.browser</string>
        ${productDir ? `<key>CrProductDirName</key><string>${productDir}</string>` : ""}
      </dict></plist>`,
        );
        const result = invoke("scripts/chromium-sign.mjs", [
          "--input",
          directory,
          "--output",
          resolve(directory, "output"),
        ]);
        assert.equal(result.status, 0, result.stderr);
        const plan = JSON.parse(result.stdout);
        assert.equal(
          plan.blockers.some((blocker) => blocker.includes("profile directory")),
          productDir !== "Aux",
        );
        assert.equal(existsSync(resolve(directory, "output")), false);
      }
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  },
);
