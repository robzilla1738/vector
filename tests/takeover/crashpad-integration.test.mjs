import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { validateCrashpadDistribution } from "../../scripts/lib/crashpad-signing.mjs";
import { inspectLocalCrashpad } from "../../scripts/crashpad-local-check.mjs";

const args = 'enable_aux_shell = true\naux_crash_upload_url = ""\n';
const validate = (changes = {}) =>
  validateCrashpadDistribution({ args, appInfo: { AuxCrashUploadURL: "" }, ...changes });

test("Aux Crashpad distribution is offline by default and rejects inherited or insecure endpoints", () => {
  assert.deepEqual(validate(), []);
  assert.match(validate({ appInfo: {} }).join(" "), /differs/);
  assert.match(
    validate({
      args: 'enable_aux_shell = true\naux_crash_upload_url = "http://crash.example.test/upload"',
      appInfo: { AuxCrashUploadURL: "http://crash.example.test/upload" },
    }).join(" "),
    /HTTPS/,
  );
  assert.match(
    validate({
      args: 'enable_aux_shell = true\naux_crash_upload_url = "https://user:pass@crash.example.test/upload"',
      appInfo: { AuxCrashUploadURL: "https://user:pass@crash.example.test/upload" },
    }).join(" "),
    /credentials/,
  );
  assert.deepEqual(
    validate({
      args: 'enable_aux_shell = true\naux_crash_upload_url = "https://crash.example.test/upload"',
      appInfo: { AuxCrashUploadURL: "https://crash.example.test/upload" },
    }),
    [],
  );
});

test("offline Crashpad inspection requires a patched Aux and a local dump", () => {
  const root = mkdtempSync(join(tmpdir(), "aux-crashpad-test-"));
  const app = join(root, "Aux.app");
  const contents = join(app, "Contents");
  const database = join(root, "Crashpad");
  mkdirSync(contents, { recursive: true });
  mkdirSync(join(database, "pending"), { recursive: true });
  const info = join(contents, "Info.plist");
  const plist = (endpoint) =>
    writeFileSync(
      info,
      JSON.stringify({ CFBundleIdentifier: "dev.aux.browser", AuxCrashUploadURL: endpoint }),
    );
  plist("");
  assert.throws(
    () => inspectLocalCrashpad({ app, crashDir: database, requireReport: true }),
    /No local Crashpad minidump/,
  );
  writeFileSync(join(database, "pending", "fixture.dmp"), "fixture only");
  assert.equal(inspectLocalCrashpad({ app, crashDir: database, requireReport: true }).reports, 1);
  plist("https://crash.example.test/upload");
  assert.throws(() => inspectLocalCrashpad({ app, crashDir: database }), /Offline verification/);
  writeFileSync(info, JSON.stringify({ CFBundleIdentifier: "dev.aux.browser" }));
  assert.throws(() => inspectLocalCrashpad({ app, crashDir: database }), /consent patch/);
});
