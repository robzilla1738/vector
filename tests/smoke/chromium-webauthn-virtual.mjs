// Synthetic WebAuthn protocol qualification in a disposable Chromium profile.
// Virtual CTAP2 authenticators never touch Touch ID, passkey providers or real credentials.
import assert from "node:assert/strict";
import { createHash, createPublicKey, verify } from "node:crypto";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const { chromium } = createRequire(join(root, "packages/chromium-driver/package.json"))("playwright-core");
const candidate = process.env.AUX_CANDIDATE_BIN;
const control = process.env.AUX_CONTROL_BIN;
assert.ok(!(candidate && control), "Choose one browser binary per run.");
const binary = candidate ?? control;
if (binary) assert.ok(existsSync(binary), `Browser executable missing: ${binary}`);
if (candidate)
  assert.match(
    realpathSync(candidate),
    /\/out\/(?:AuxProof|AuxDev)\/.*\/Contents\/MacOS\//,
    "Use a compiled isolated Aux candidate.",
  );
const scope = candidate
  ? "Aux compiled candidate"
  : control
    ? "external browser control"
    : "Chrome for Testing control";
const directory = mkdtempSync(join(tmpdir(), "aux-webauthn-virtual-"));
const profile = join(directory, "profile");
const server = createServer((_request, response) => {
  response.setHeader("content-type", "text/html");
  response.end("<!doctype html><title>Aux synthetic WebAuthn RP</title><h1>Local RP only</h1>");
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://localhost:${server.address().port}`;
let context;
let session;
let authenticatorId;
try {
  context = await chromium.launchPersistentContext(profile, {
    headless: false,
    ...(binary ? { executablePath: realpathSync(binary) } : {}),
    env: { PATH: process.env.PATH, HOME: directory, TMPDIR: directory },
    args: ["--use-mock-keychain", "--password-store=basic", "--no-first-run"],
  });
  const page = await context.newPage();
  await page.goto(origin);
  assert.equal(await page.evaluate(() => window.isSecureContext), true, "localhost must be a secure context");
  session = await context.newCDPSession(page);
  await session.send("WebAuthn.enable");
  ({ authenticatorId } = await session.send("WebAuthn.addVirtualAuthenticator", {
    options: {
      protocol: "ctap2",
      transport: "internal",
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
      automaticPresenceSimulation: true,
    },
  }));

  const result = await page.evaluate(async () => {
    const bytes = (value) => Array.from(new Uint8Array(value));
    const challengeCreate = new Uint8Array(32).fill(7);
    const challengeGet = new Uint8Array(32).fill(9);
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge: challengeCreate,
        rp: { name: "Aux local RP", id: "localhost" },
        user: { id: new Uint8Array([1, 2, 3]), name: "synthetic", displayName: "Synthetic user" },
        pubKeyCredParams: [{ type: "public-key", alg: -7 }],
        authenticatorSelection: { residentKey: "required", userVerification: "required" },
        attestation: "none",
        timeout: 10_000,
      },
    });
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: challengeGet,
        rpId: "localhost",
        allowCredentials: [{ type: "public-key", id: credential.rawId }],
        userVerification: "required",
        timeout: 10_000,
      },
    });
    let wrongRp = "accepted";
    try {
      await navigator.credentials.get({
        publicKey: { challenge: new Uint8Array(32), rpId: "unrelated.invalid", timeout: 1000 },
      });
    } catch (error) {
      wrongRp = error.name;
    }
    return {
      id: credential.id,
      assertionId: assertion.id,
      rawId: bytes(credential.rawId),
      publicKey: bytes(credential.response.getPublicKey()),
      registrationClientData: bytes(credential.response.clientDataJSON),
      registrationAuthenticatorData: bytes(credential.response.getAuthenticatorData()),
      assertionClientData: bytes(assertion.response.clientDataJSON),
      assertionAuthenticatorData: bytes(assertion.response.authenticatorData),
      signature: bytes(assertion.response.signature),
      wrongRp,
    };
  });
  const clientCreate = JSON.parse(Buffer.from(result.registrationClientData).toString());
  const clientGet = JSON.parse(Buffer.from(result.assertionClientData).toString());
  const rpHash = createHash("sha256").update("localhost").digest();
  const registrationData = Buffer.from(result.registrationAuthenticatorData);
  const assertionData = Buffer.from(result.assertionAuthenticatorData);
  assert.equal(result.id, result.assertionId);
  assert.equal(clientCreate.type, "webauthn.create");
  assert.equal(clientGet.type, "webauthn.get");
  for (const client of [clientCreate, clientGet]) assert.equal(client.origin, origin);
  assert.equal(clientCreate.challenge, Buffer.alloc(32, 7).toString("base64url"));
  assert.equal(clientGet.challenge, Buffer.alloc(32, 9).toString("base64url"));
  assert.deepEqual(registrationData.subarray(0, 32), rpHash);
  assert.deepEqual(assertionData.subarray(0, 32), rpHash);
  assert.equal(
    registrationData[32] & 0x45,
    0x45,
    "registration must show UP, UV and attested credential data",
  );
  assert.equal(assertionData[32] & 0x05, 0x05, "assertion must show UP and UV");
  assert.ok(
    verify(
      "sha256",
      Buffer.concat([
        assertionData,
        createHash("sha256").update(Buffer.from(result.assertionClientData)).digest(),
      ]),
      createPublicKey({ key: Buffer.from(result.publicKey), format: "der", type: "spki" }),
      Buffer.from(result.signature),
    ),
  );
  assert.equal(result.wrongRp, "SecurityError");
  const credentials = await session.send("WebAuthn.getCredentials", { authenticatorId });
  assert.equal(credentials.credentials.length, 1);
  assert.equal(credentials.credentials[0].isResidentCredential, true);

  await session.send("WebAuthn.setUserVerified", { authenticatorId, isUserVerified: false });
  const uvDenied = await page.evaluate(async (rawId) => {
    try {
      await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32).fill(11),
          rpId: "localhost",
          allowCredentials: [{ type: "public-key", id: new Uint8Array(rawId) }],
          userVerification: "required",
          timeout: 2000,
        },
      });
      return "accepted";
    } catch (error) {
      return error.name;
    }
  }, result.rawId);
  assert.equal(uvDenied, "NotAllowedError");

  const evidence = {
    at: new Date().toISOString(),
    scope,
    browser: context.browser()?.version(),
    binary: binary ? realpathSync(binary) : undefined,
    profile: "disposable",
    origin,
    checks: {
      registration: true,
      assertion: true,
      signatureVerified: true,
      challengeAndOriginVerified: true,
      rpHashAndUserVerificationVerified: true,
      residentCredential: true,
      wrongRpRejected: result.wrongRp,
      missingUserVerificationRejected: uvDenied,
    },
    limitations:
      "Virtual CTAP2 only. Does not prove Touch ID, Apple Passwords, iCloud sync, external security keys, real IdP accounts, or signed-bundle entitlements.",
  };
  const artifact = join(
    root,
    "release/test-artifacts",
    candidate
      ? "aux-candidate-webauthn-virtual.json"
      : control
        ? "system-control-webauthn-virtual.json"
        : "chrome-reference-webauthn-virtual.json",
  );
  mkdirSync(join(root, "release/test-artifacts"), { recursive: true });
  writeFileSync(artifact, JSON.stringify(evidence, null, 2) + "\n");
  console.log(JSON.stringify(evidence, null, 2));
} finally {
  if (authenticatorId && session)
    await session.send("WebAuthn.removeVirtualAuthenticator", { authenticatorId }).catch(() => {});
  if (session) await session.send("WebAuthn.disable").catch(() => {});
  await context?.close().catch(() => {});
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
  rmSync(directory, { recursive: true, force: true });
}
