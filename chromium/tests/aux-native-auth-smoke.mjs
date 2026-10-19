// Native P-256/DER interoperability and CDP boundary smoke; disposable homes only.
import assert from 'node:assert/strict';
import { generateKeyPairSync, randomBytes, sign, verify } from 'node:crypto';
import {
  chmodSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
const probe = process.argv[2];
if (!probe) throw new Error('Pass the built native auth_probe executable path');
const home = mkdtempSync(join(tmpdir(), 'aux-native-auth-'));
try {
  const keys = generateKeyPairSync('ec', {
    namedCurve: 'prime256v1',
    privateKeyEncoding: { format: 'pem', type: 'pkcs8' },
    publicKeyEncoding: { format: 'pem', type: 'spki' },
  });
  writeFileSync(join(home, 'installation-private.pem'), keys.privateKey, {
    mode: 0o600,
  });
  writeFileSync(join(home, 'installation-public.pem'), keys.publicKey, {
    mode: 0o600,
  });
  const challenge = randomBytes(32),
    message = Buffer.concat([Buffer.from('Aux Daemon Auth v1\0'), challenge]);
  writeFileSync(
    join(home, 'input.json'),
    JSON.stringify({
      challenge: challenge.toString('base64'),
      signature: sign('sha256', message, keys.privateKey).toString('base64'),
    }),
    { mode: 0o600 },
  );
  const result = spawnSync(resolve(probe), [`--home=${home}`], {
    encoding: 'utf8',
  });
  assert.equal(
    result.status,
    0,
    `Native probe failed at step ${result.status}: ${result.stderr.slice(0, 500)}`,
  );
  assert.equal(
    verify(
      'sha256',
      message,
      keys.publicKey,
      Buffer.from(
        readFileSync(join(home, 'native-signature'), 'utf8'),
        'base64',
      ),
    ),
    true,
  );
  chmodSync(join(home, 'installation-private.pem'), 0o644);
  const unsafe = spawnSync(resolve(probe), [`--home=${home}`], {
    encoding: 'utf8',
  });
  assert.equal(
    unsafe.status,
    6,
    'Native signer must reject a private key readable by other users',
  );
  console.log(
    'Native P-256 DER interoperability, key permissions, CDP authentication/replay/Host/Origin passed.',
  );
} finally {
  rmSync(home, { recursive: true, force: true });
}
