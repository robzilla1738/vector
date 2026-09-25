import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";
import test from "node:test";
import { compareBuildVersions, publicKeyForSeed, appcast } from "../../scripts/sparkle-rehearsal.mjs";
import { validateSparkleSigning } from "../../scripts/lib/sparkle-signing.mjs";
import { stageSparkle, verifyArchive } from "../../chromium/fetch-sparkle.mjs";

const key = generateKeyPairSync("ed25519").privateKey.export({ format: "jwk" });
const seed = Buffer.from(key.d, "base64url");
const publicKey = Buffer.from(key.x, "base64url").toString("base64");
const args = "enable_aux_sparkle = true\n";
const appInfo = { SUFeedURL: "https://updates.example.test/appcast.xml", SUPublicEDKey: publicKey };
const validate = (changes = {}) =>
  validateSparkleSigning({
    args,
    appInfo,
    frameworkPresent: true,
    signingParts: "aux-sparkle-framework",
    adhoc: false,
    localFeedRehearsal: false,
    ...changes,
  });

test("Sparkle signed distribution requires a complete bundled updater and trusted feed", () => {
  assert.deepEqual(validate(), []);
  assert.match(validate({ frameworkPresent: false }).join(" "), /disagree/);
  assert.match(validate({ adhoc: true }).join(" "), /Developer ID/);
  assert.match(validate({ signingParts: "" }).join(" "), /nested/);
  assert.match(validate({ appInfo: { ...appInfo, SUPublicEDKey: "bad" } }).join(" "), /public key/);
  assert.match(
    validate({ appInfo: { ...appInfo, SUFeedURL: "http://evil.test/feed.xml" } }).join(" "),
    /HTTPS/,
  );
  assert.deepEqual(
    validate({
      appInfo: { ...appInfo, SUFeedURL: "http://127.0.0.1:8765/appcast.xml" },
      localFeedRehearsal: true,
    }),
    [],
  );
  assert.match(
    validate({ appInfo: { ...appInfo, SUFeedURL: "http://127.0.0.1:8765/appcast.xml" } }).join(" "),
    /HTTPS/,
  );
});

test("local fixture key and appcast retain Sparkle's exact signing identity", () => {
  assert.equal(publicKeyForSeed(seed), publicKey);
  assert.equal(compareBuildVersions("154.0.1", "154.0.2"), -1);
  assert.equal(compareBuildVersions("154.0.2", "154.0.1"), 1);
  assert.equal(compareBuildVersions("154.0.1", "154.0.1.0"), 0);
  const signature = Buffer.alloc(64, 7).toString("base64");
  const xml = appcast({
    url: "http://127.0.0.1:8765/Aux-2.zip",
    shortVersion: "2 & beta",
    buildVersion: "2",
    signature,
    bytes: 1234,
    channel: "beta",
  });
  assert.match(xml, /<sparkle:channel>beta<\/sparkle:channel>/);
  assert.match(xml, /2 &amp; beta/);
  assert.match(xml, /sparkle:edSignature=/);
  assert.match(xml, /sparkle:minimumSystemVersion>12.0/);
});

test("fixture key creation stays local and refuses replacement", () => {
  const directory = mkdtempSync(join(tmpdir(), "aux-sparkle-test-"));
  const keyFile = join(directory, "fixture.key");
  const script = new URL("../../scripts/sparkle-rehearsal.mjs", import.meta.url).pathname;
  const first = spawnSync(process.execPath, [script, "keygen", "--output", keyFile], { encoding: "utf8" });
  assert.equal(first.status, 0, first.stderr);
  assert.equal(statSync(keyFile).mode & 0o777, 0o600);
  assert.equal(Buffer.from(readFileSync(keyFile, "utf8").trim(), "base64").length, 32);
  const second = spawnSync(process.execPath, [script, "keygen", "--output", keyFile], { encoding: "utf8" });
  assert.notEqual(second.status, 0);
});

test("Sparkle staging rejects an archive before extracting if its digest differs", () => {
  const directory = mkdtempSync(join(tmpdir(), "aux-sparkle-archive-"));
  const archive = join(directory, "Sparkle-2.10.0.tar.xz");
  const source = join(directory, "source");
  writeFileSync(archive, "not the pinned release");
  assert.throws(() => verifyArchive(archive), /SHA-256/);
  assert.throws(() => stageSparkle({ source, archive }), /SHA-256/);
  assert.equal(existsSync(join(source, "third_party", "aux_sparkle", "Sparkle.framework")), false);
});

test("local rehearsal server exposes only the selected feed and prepared archive", async () => {
  const directory = mkdtempSync(join(tmpdir(), "aux-sparkle-feed-"));
  const reservation = createServer();
  await new Promise((resolve) => reservation.listen(0, "127.0.0.1", resolve));
  const port = reservation.address().port;
  await new Promise((resolve) => reservation.close(resolve));
  const base = `http://127.0.0.1:${port}`;
  writeFileSync(
    join(directory, "rehearsal.json"),
    JSON.stringify({ base, artifacts: [{ name: "Aux-2.zip", phase: "upgrade" }] }),
  );
  writeFileSync(join(directory, "upgrade-appcast.xml"), "<rss>upgrade</rss>");
  writeFileSync(join(directory, "Aux-2.zip"), "fixture archive");
  const script = new URL("../../scripts/sparkle-rehearsal.mjs", import.meta.url).pathname;
  const server = spawn(
    process.execPath,
    [script, "serve", "--output", directory, "--phase", "upgrade", "--port", String(port)],
    { stdio: ["ignore", "pipe", "pipe"] },
  );
  try {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("local feed did not start")), 5000);
      server.stdout.once("data", () => {
        clearTimeout(timeout);
        resolve();
      });
      server.once("exit", (code) => {
        clearTimeout(timeout);
        reject(new Error(`server exited ${code}`));
      });
    });
    assert.equal(await (await fetch(`${base}/appcast.xml`)).text(), "<rss>upgrade</rss>");
    assert.equal((await fetch(`${base}/Aux-2.zip`, { method: "HEAD" })).status, 200);
    assert.equal((await fetch(`${base}/missing.zip`)).status, 404);
    assert.equal((await fetch(`${base}/appcast.xml`, { method: "POST" })).status, 405);
  } finally {
    server.kill("SIGTERM");
  }
});
