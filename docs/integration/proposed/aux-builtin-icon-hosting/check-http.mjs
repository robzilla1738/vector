/** Public development assets only; no credentials, user records or model calls. */
import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const repo = new URL('../../../../', import.meta.url);
const acquired = JSON.parse(readFileSync(new URL('acquisition.json', import.meta.url)));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const results = [];
// Two bounded public downloads at a time; every delivered asset is checked once.
for (let index = 0; index < acquired.files.length; index += 2) {
  results.push(...await Promise.all(acquired.files.slice(index, index + 2).map(async asset => {
    const name = asset.path.split('/').at(-1);
    const url = 'https://dev-cloud.getaux.co/builtin-skills/v1/' + name;
    const response = await fetch(url, {redirect: 'error', signal: AbortSignal.timeout(15000)});
    const bytes = Buffer.from(await response.arrayBuffer());
    const headers = Object.fromEntries(['content-type', 'cache-control', 'content-security-policy',
      'cross-origin-resource-policy', 'access-control-allow-origin', 'x-content-type-options']
      .map(key => [key, response.headers.get(key)]));
    if (response.status !== 200 || sha(bytes) !== asset.sha256 ||
        !bytes.equals(readFileSync(new URL(asset.path, repo))) ||
        headers['content-type']?.split(';')[0] !== (name.endsWith('.svg') ? 'image/svg+xml' : asset.contentType) ||
        headers['cache-control'] !== 'public, max-age=31536000, immutable' ||
        headers['content-security-policy'] !== "default-src 'none'; img-src data:; style-src 'unsafe-inline'; sandbox" ||
        headers['cross-origin-resource-policy'] !== 'cross-origin' ||
        headers['access-control-allow-origin'] !== '*' || headers['x-content-type-options'] !== 'nosniff') {
      throw Error('Public asset response mismatch: ' + name);
    }
    return {path: '/builtin-skills/v1/' + name, status: response.status, bytes: bytes.length,
      sha256: sha(bytes), headers};
  })));
}
writeFileSync(new URL('http-check.json', import.meta.url), JSON.stringify({
  format: 'aux.builtin-icons.http-check.v1', checkedAt: new Date().toISOString(),
  deployment: 'dpl_9Zqn7Mt8E7pmWXhwn6hBms3VpgXa', target: 'preview',
  origin: 'https://dev-cloud.getaux.co', assets: results, passed: true,
  actualAppCompared: false, productionActivated: false,
}, null, 2) + '\n');
console.log('PASS: ' + results.length + ' actual public Aux icon responses, exact bytes and image/security headers');
