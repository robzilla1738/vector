import assert from 'node:assert/strict';
import {
  createHash,
  createPublicKey,
  generateKeyPairSync,
  randomUUID,
  sign,
  verify,
} from 'node:crypto';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import type { PasskeyRecord, PasskeyVaultAdapter } from './schema.js';
import { PasskeyService } from './service.js';

test('native proof, real ES256 result, counters, replay, fresh verification and private epoch', async () => {
  const home = mkdtempSync(join(tmpdir(), 'aux-passkeys-'));
  const installation = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  writeFileSync(
    join(home, 'installation-public.pem'),
    installation.publicKey.export({ format: 'pem', type: 'spki' }),
    { mode: 0o600 },
  );
  let generation = 1,
    records: unknown[] = [],
    writes = 0;
  let verifyHook: undefined | (() => Promise<void>);
  const vault: PasskeyVaultAdapter = {
    generation: () => generation,
    readPasskeys: () => structuredClone(records),
    verifyFresh: async (_account, v) => {
      if (!('password' in v) || v.password !== 'fixture-password')
        throw new Error('Verification failed.');
      await verifyHook?.();
      return generation;
    },
    commitPasskeys: (_account, expected, mutate) => {
      assert.equal(expected, generation);
      records = mutate(structuredClone(records));
      writes++;
    },
  };
  const host = {
    home,
    requireAccount: (id: number) => assert.equal(id, 1),
    bindings: () => [{ accountId: 1, profileId: 'fixture-profile' }],
  };
  const service = new PasskeyService(host, vault),
    scope = {
      accountId: 1,
      profileId: 'fixture-profile',
      browserMode: 'default' as const,
    };
  const epoch = randomUUID();
  function proof(
    kind: 'create' | 'get',
    patch: Record<string, unknown> = {},
    session = epoch,
  ) {
    const challenge = Buffer.alloc(32, 7).toString('base64url');
    const clientDataJSON = Buffer.from(
      JSON.stringify({
        type: `webauthn.${kind}`,
        challenge,
        origin: 'https://login.example.test',
        crossOrigin: false,
      }),
    ).toString('base64url');
    const request = {
      version: 1,
      id: randomUUID(),
      kind,
      ...scope,
      profileSession: session,
      frameId: '21:9',
      origin: 'https://login.example.test',
      topOrigin: 'https://login.example.test',
      rpId: 'example.test',
      expiresAt: Date.now() + 60000,
      clientDataJSON,
      options: {
        challenge,
        rp: { id: 'example.test', name: 'Fixture' },
        user: {
          id: Buffer.from('user').toString('base64url'),
          name: 'fixture@example.test',
          displayName: 'Fixture',
        },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
        attestation: 'none',
      },
      ...patch,
    };
    const payload = JSON.stringify(request);
    return {
      request,
      proof: {
        payload,
        signature: sign(
          'sha256',
          Buffer.from(`Aux Passkey Request v1\n${payload}`),
          installation.privateKey,
        ).toString('base64'),
      },
    };
  }
  try {
    const creation = proof('create');
    assert.throws(
      () =>
        service.begin(scope, {
          ...creation.proof,
          payload: creation.proof.payload.replace(
            'example.test',
            'attacker.test',
          ),
        }),
      /proof/,
    );
    const preview = service.begin(scope, creation.proof);
    assert.equal(preview.rpId, 'example.test');
    const created = (await service.confirm(scope, preview.requestId, {
      password: 'fixture-password',
    })) as { response: { publicKey: string; authenticatorData: string } };
    const publicKey = createPublicKey({
      key: Buffer.from(created.response.publicKey, 'base64url'),
      format: 'der',
      type: 'spki',
    });
    assert.equal(
      Buffer.from(created.response.authenticatorData, 'base64url')[32],
      0x45,
    );
    assert.equal(writes, 1);
    assert.equal((records[0] as PasskeyRecord).counter, 0);
    await assert.rejects(
      service.confirm(scope, preview.requestId, {
        password: 'fixture-password',
      }),
      /active/,
    );
    const assertion = proof('get');
    const get = service.begin(scope, assertion.proof);
    assert.equal(get.candidates.length, 1);
    assert.equal(JSON.stringify(get).includes('privateKey'), false);
    const result = (await service.confirm(
      scope,
      get.requestId,
      { password: 'fixture-password' },
      get.candidates[0]?.id,
    )) as {
      response: {
        authenticatorData: string;
        signature: string;
        clientDataJSON: string;
      };
    };
    const auth = Buffer.from(result.response.authenticatorData, 'base64url');
    assert.equal(auth[32], 5);
    assert.equal(auth.readUInt32BE(33), 1);
    assert(
      verify(
        'sha256',
        Buffer.concat([
          auth,
          createHash('sha256')
            .update(Buffer.from(result.response.clientDataJSON, 'base64url'))
            .digest(),
        ]),
        publicKey,
        Buffer.from(result.response.signature, 'base64url'),
      ),
    );
    const restarted = new PasskeyService(host, vault);
    restarted.begin(scope, assertion.proof);
    await assert.rejects(
      restarted.confirm(scope, get.requestId, { password: 'fixture-password' }),
      /already used/,
    );
    const badUv = proof('get');
    service.begin(scope, badUv.proof);
    await assert.rejects(
      service.confirm(scope, badUv.request.id, { password: 'wrong-fixture' }),
      /Verification/,
    );
    const race = proof('get');
    service.begin(scope, race.proof);
    verifyHook = async () => {
      generation++;
    };
    await assert.rejects(
      service.confirm(scope, race.request.id, { password: 'fixture-password' }),
      /state changed/,
    );
    verifyHook = undefined;
    const privateScope = { ...scope, browserMode: 'incognito' as const },
      before = writes;
    const ephemeral = proof('create', { browserMode: 'incognito' });
    service.begin(privateScope, ephemeral.proof);
    await service.confirm(privateScope, ephemeral.request.id, {
      password: 'fixture-password',
    });
    assert.equal(writes, before);
    const privateGet = proof('get', { browserMode: 'incognito' });
    assert.equal(
      service.begin(privateScope, privateGet.proof).candidates.length,
      1,
    );
    const reopened = proof('get', { browserMode: 'incognito' }, randomUUID());
    assert.equal(
      service.begin(privateScope, reopened.proof).candidates.length,
      0,
    );
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});
