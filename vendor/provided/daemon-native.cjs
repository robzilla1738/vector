'use strict';
// DISPOSABLE TEST ADAPTER ONLY: file-backed DK/KEM is not supplied native fidelity.
// Aux's installation authority is browser-owned. This adapter never calls the
// supplied native binding's Keychain or OS-permission commands.
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

function createAdapter(home) {
  if (!home || !path.isAbsolute(home)) throw new Error('Absolute AUX_HOME is required');
  const dir = path.join(home, 'installation-runtime');
  const secure = path.join(dir, 'secure');
  const file = (name) => path.join(dir, name);
  const mkdir = (p) => { fs.mkdirSync(p, { recursive: true, mode: 0o700 }); fs.chmodSync(p, 0o700); };
  const write = (p, data) => {
    const tmp = `${p}.${crypto.randomUUID()}.tmp`;
    fs.writeFileSync(tmp, data, { mode: 0o600, flag: 'wx' });
    fs.renameSync(tmp, p);
  };
  const signing = () => {
    const p = path.join(home, 'installation-private.pem');
    const st = fs.lstatSync(p);
    if (!st.isFile() || st.isSymbolicLink() || (st.mode & 0o077)) throw new Error('Installation private key must be an owner-only regular file');
    const key = crypto.createPrivateKey(fs.readFileSync(p));
    if (key.asymmetricKeyDetails?.namedCurve !== 'prime256v1') throw new Error('P256 installation authority required');
    const actual = crypto.createPublicKey(key).export({ format: 'der', type: 'spki' });
    const expected = crypto.createPublicKey(fs.readFileSync(path.join(home, 'installation-public.pem'))).export({ format: 'der', type: 'spki' });
    if (!actual.equals(expected)) throw new Error('Installation public/private key mismatch');
    return key;
  };
  const installed = () => fs.existsSync(file('kem.pem')) && fs.existsSync(file('dk.bin'));
  const dk = () => {
    const data = fs.readFileSync(file('dk.bin'));
    if (data.length !== 32) throw new Error('Invalid runtime data key');
    return data;
  };
  const raw = (key) => {
    const j = crypto.createPublicKey(key).export({ format: 'jwk' });
    return Buffer.concat([Buffer.from([4]), Buffer.from(j.x, 'base64url'), Buffer.from(j.y, 'base64url')]).toString('base64');
  };
  const publicKeys = () => ({ scheme: 'p256_v1', sig: raw(signing()), kem: raw(crypto.createPrivateKey(fs.readFileSync(file('kem.pem')))) });
  const secureFile = (key) => {
    if (typeof key !== 'string' || !key || key.length > 4096) throw new Error('Invalid secure storage key');
    return path.join(secure, crypto.createHash('sha256').update(key).digest('hex'));
  };
  const handlers = {
    'install-status': () => { signing(); return { installed: installed(), scheme: 'p256_v1' }; },
    'install-init': () => {
      signing(); mkdir(dir);
      if (!installed()) {
        if (fs.existsSync(file('kem.pem')) || fs.existsSync(file('dk.bin'))) throw new Error('Incomplete runtime identity requires explicit recovery');
        const { privateKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
        write(file('kem.pem'), privateKey.export({ format: 'pem', type: 'pkcs8' }));
        write(file('dk.bin'), crypto.randomBytes(32));
      }
      const p = publicKeys(); return { scheme: p.scheme, sig_pub: p.sig, kem_pub: p.kem };
    },
    'get-public-keys': publicKeys,
    'dk-unwrap': () => ({ dk: dk().toString('base64') }),
    'cdp-sign': ({ challenge }) => {
      if (typeof challenge !== 'string' || challenge.length > 16384) throw new Error('Invalid signing challenge');
      return { signature: crypto.sign('sha256', Buffer.from(challenge, 'base64'), signing()).toString('base64') };
    },
    'secure-save': ({ key, data }) => {
      if (typeof data !== 'string') throw new Error('Secure data must be a string');
      mkdir(secure);
      const nonce = crypto.randomBytes(12), cipher = crypto.createCipheriv('aes-256-gcm', dk(), nonce);
      cipher.setAAD(Buffer.from(key));
      const ciphertext = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
      write(secureFile(key), Buffer.concat([nonce, cipher.getAuthTag(), ciphertext]));
      return {};
    },
    'secure-read': ({ key }) => {
      let b; try { b = fs.readFileSync(secureFile(key)); } catch (e) { if (e.code === 'ENOENT') return {}; throw e; }
      const cipher = crypto.createDecipheriv('aes-256-gcm', dk(), b.subarray(0, 12));
      cipher.setAAD(Buffer.from(key)); cipher.setAuthTag(b.subarray(12, 28));
      return { data: Buffer.concat([cipher.update(b.subarray(28)), cipher.final()]).toString('utf8') };
    },
    'secure-clear': ({ key }) => { fs.rmSync(secureFile(key), { force: true }); return {}; },
  };
  return { run(command, input) {
    try {
      if (!handlers[command]) throw new Error(`Native capability is not integrated for Aux: ${command}`);
      return JSON.stringify(handlers[command](input ? JSON.parse(input) : {}));
    } catch (e) { return JSON.stringify({ error: e.message }); }
  } };
}
module.exports = { createAdapter, run(command, input) {
  if (process.env.AUX_PROVIDED_TEST_ADAPTER !== '1') return JSON.stringify({ error: 'Disposable test adapter disabled; faithful native binding integration required' });
  return createAdapter(process.env.AUX_HOME).run(command, input);
} };
