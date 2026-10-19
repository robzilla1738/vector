import assert from 'node:assert/strict';
import {
  createHash,
  generateKeyPairSync,
  randomBytes,
  sign,
} from 'node:crypto';
import { test } from 'node:test';
import { startHarness } from './server.mjs';
import { verifyAssertion, verifyRegistration } from './verifier.mjs';

const sha = (value) => createHash('sha256').update(value).digest();
const enc = (value) => Buffer.from(value).toString('base64url');
function cbor(value) {
  const header = (major, size) =>
    size < 24
      ? Buffer.from([(major << 5) | size])
      : size < 256
        ? Buffer.from([(major << 5) | 24, size])
        : Buffer.from([(major << 5) | 25, size >> 8, size & 255]);
  if (typeof value === 'number')
    return value >= 0 ? header(0, value) : header(1, -value - 1);
  if (typeof value === 'string')
    return Buffer.concat([
      header(3, Buffer.byteLength(value)),
      Buffer.from(value),
    ]);
  if (Buffer.isBuffer(value))
    return Buffer.concat([header(2, value.length), value]);
  return Buffer.concat([
    header(5, value.size),
    ...[...value].flatMap(([key, entry]) => [cbor(key), cbor(entry)]),
  ]);
}
function fixture() {
  const pair = generateKeyPairSync('ec', { namedCurve: 'prime256v1' }),
    jwk = pair.publicKey.export({ format: 'jwk' });
  const id = randomBytes(32),
    challenge = enc(randomBytes(32)),
    userId = enc(randomBytes(32));
  const ceremony = {
    kind: 'create',
    challenge,
    origin: 'http://localhost:4000',
    rpId: 'localhost',
    userId,
  };
  const client = Buffer.from(
    JSON.stringify({
      type: 'webauthn.create',
      challenge,
      origin: ceremony.origin,
      crossOrigin: false,
    }),
  );
  const length = Buffer.alloc(2);
  length.writeUInt16BE(id.length);
  const cose = cbor(
    new Map([
      [1, 2],
      [3, -7],
      [-1, 1],
      [-2, Buffer.from(jwk.x, 'base64url')],
      [-3, Buffer.from(jwk.y, 'base64url')],
    ]),
  );
  const auth = Buffer.concat([
    sha('localhost'),
    Buffer.from([0x45]),
    Buffer.alloc(4),
    Buffer.alloc(16),
    length,
    id,
    cose,
  ]);
  const registration = {
    id: enc(id),
    rawId: enc(id),
    type: 'public-key',
    authenticatorAttachment: 'platform',
    response: {
      clientDataJSON: enc(client),
      authenticatorData: enc(auth),
      attestationObject: enc(
        cbor(
          new Map([
            ['fmt', 'none'],
            ['attStmt', new Map()],
            ['authData', auth],
          ]),
        ),
      ),
      publicKeyAlgorithm: -7,
      publicKey: enc(pair.publicKey.export({ type: 'spki', format: 'der' })),
    },
    clientExtensionResults: { credProps: { rk: true } },
  };
  return { pair, registration, ceremony, userId };
}
test('independent verifier validates real ES256 and rejects tampering, origin and counter replay', () => {
  const f = fixture(),
    stored = verifyRegistration(f.registration, f.ceremony);
  const ceremony = { ...f.ceremony, kind: 'get' },
    client = Buffer.from(
      JSON.stringify({
        type: 'webauthn.get',
        challenge: ceremony.challenge,
        origin: ceremony.origin,
      }),
    );
  const counter = Buffer.alloc(4);
  counter.writeUInt32BE(1);
  const auth = Buffer.concat([sha('localhost'), Buffer.from([5]), counter]);
  const assertion = {
    id: stored.id,
    rawId: stored.id,
    type: 'public-key',
    authenticatorAttachment: 'platform',
    response: {
      clientDataJSON: enc(client),
      authenticatorData: enc(auth),
      signature: enc(
        sign('sha256', Buffer.concat([auth, sha(client)]), f.pair.privateKey),
      ),
      userHandle: f.userId,
    },
  };
  assert.equal(verifyAssertion(assertion, ceremony, stored).counter, 1);
  assert.throws(
    () =>
      verifyAssertion(
        assertion,
        { ...ceremony, origin: 'http://localhost:4001' },
        stored,
      ),
    /origin/,
  );
  assert.throws(
    () => verifyAssertion(assertion, ceremony, { ...stored, counter: 1 }),
    /Counter/,
  );
  assert.throws(
    () =>
      verifyAssertion(
        {
          ...assertion,
          response: { ...assertion.response, signature: enc(Buffer.alloc(70)) },
        },
        ceremony,
        stored,
      ),
    /signature/,
  );
  assert.throws(
    () =>
      verifyRegistration(
        {
          ...f.registration,
          response: { ...f.registration.response, publicKeyAlgorithm: -257 },
        },
        f.ceremony,
      ),
    /algorithm/,
  );
});
test('loopback RP serves real API client, refuses cross-origin and consumes ceremony once', async () => {
  const harness = await startHarness();
  try {
    const origin = new URL(harness.url).origin,
      run = new URL(harness.url).pathname.split('/').at(-1);
    const page = await fetch(harness.url);
    assert.equal(page.status, 200);
    assert.match(await page.text(), /Real browser passkeys/);
    const client = await fetch(`${origin}/client.js`);
    assert.match(await client.text(), /navigator.credentials.create/);
    const post = (route, body, source = origin) =>
      fetch(`${origin}/api/${run}/${route}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: source },
        body: JSON.stringify(body),
      });
    assert.equal(
      (
        await post(
          'begin',
          { action: 'register', case: 'normal' },
          'https://attacker.invalid',
        )
      ).status,
      403,
    );
    const begin = await (
      await post('begin', { action: 'cancel', case: 'cancel' })
    ).json();
    assert.equal(
      (
        await post('error', {
          ceremonyId: begin.ceremonyId,
          name: 'AbortError',
        })
      ).status,
      200,
    );
    assert.equal(
      (
        await post('error', {
          ceremonyId: begin.ceremonyId,
          name: 'AbortError',
        })
      ).status,
      400,
    );
    assert.equal(harness.report().automated.registration, false);
  } finally {
    await harness.close();
  }
});
