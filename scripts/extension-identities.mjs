import { createHash, generateKeyPairSync } from 'node:crypto';
import { mkdir, open, readFile, writeFile } from 'node:fs/promises';

await mkdir('out/keys', { recursive: true, mode: 0o700 });
const identities = {};
for (const name of ['agent', 'vault']) {
  const path = `out/keys/${name}.pem`;
  let publicKey;
  try {
    const file = await open(path, 'wx', 0o600);
    try {
      const pair = generateKeyPairSync('rsa', { modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'der' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      });
      await file.writeFile(pair.privateKey);
      publicKey = pair.publicKey;
    } finally { await file.close(); }
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    const { createPublicKey } = await import('node:crypto');
    publicKey = createPublicKey(await readFile(path)).export({ type: 'spki', format: 'der' });
  }
  const key = publicKey.toString('base64');
  const id = createHash('sha256').update(publicKey).digest('hex').slice(0, 32)
    .replace(/[0-9a-f]/g, (character) => String.fromCharCode(97 + parseInt(character, 16)));
  identities[name] = { id, key };
}
await writeFile('docs/design/extension-identities.json', JSON.stringify(identities, null, 2) + '\n');
console.log('Generated public extension identities; private keys remain under out/keys.');
