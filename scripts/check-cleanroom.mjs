import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const index = JSON.parse(await readFile(join(root, 'out/reference/hashes.json'), 'utf8'));
if (index.version !== 1 || !index.sha256?.length) throw new Error('Reference hash index is missing or invalid.');
const referenceHashes = new Set(index.sha256);
// Canonical public license text acquired directly from apache.org; not product code.
const commonLicenseHashes = new Set(['cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30']);
const identifiers = JSON.parse(await readFile(join(root, 'out/reference/identifiers.json'), 'utf8'));
if (!Array.isArray(identifiers.extensionIds) || !identifiers.extensionIds.length) throw new Error('Reference identifier index is missing.');
const roots = process.argv.slice(2);
const targets = roots.length ? roots : ['apps', 'packages', 'assets/brand', 'chromium/patches/aux'];
const failures = [];
let files = 0;
const forbidden = /aside(?:hq)?|AsideDisplay/i;
// Owner-approved standard HTML vocabulary, verified against independent MIT packages.
function withoutHtmlVocabulary(text) {
  return text
    .replace(/<\/?aside(?=[\s/>])/g, value => value.replace('aside', '[html-tag]'))
    .replace(/nav,aside,footer,header,\[hidden\]/g, value => value.replace('aside', '[html-tag]'))
    .replace(/address\s*:\s*(?:true|!0),\s*article\s*:\s*(?:true|!0),\s*aside\s*:\s*(?:true|!0),\s*blockquote\s*:\s*(?:true|!0),\s*body\s*:\s*(?:true|!0)/g, (value) => value.replace('aside', '[html-tag]'))
    .replace(/address\.article\.aside\.base\.basefont\.blockquote\.body\.caption/g, (value) => value.replace('aside', '[html-tag]'));
}
const bundleFingerprint = /\b(?:webpackChunk|__webpack_require__|sourceMappingURL=data:application\/json)/;
async function inspect(path) {
  const info = await stat(path);
  if (info.isDirectory()) {
    for (const entry of await readdir(path, { withFileTypes: true })) {
      if (['node_modules', '.git', '.cache'].includes(entry.name) || entry.isSymbolicLink()) continue;
      await inspect(join(path, entry.name));
    }
    return;
  }
  if (!info.isFile()) return;
  files++;
  const hash = createHash('sha256');
  let carry = '';
  let foundName = false;
  let foundBundle = false;
  let foundId = false;
  for await (const chunk of createReadStream(path)) {
    hash.update(chunk);
    const text = carry + chunk.toString('latin1');
    foundName ||= forbidden.test(text);
    foundBundle ||= bundleFingerprint.test(text);
    foundId ||= identifiers.extensionIds.some((id) => text.includes(id));
    carry = text.slice(-256);
  }
  if (foundName && /\.(?:[cm]?js|jsx|ts|tsx|css|html)$/.test(path)) {
    if (info.size > 64 * 1024 * 1024) throw new Error(`Text artifact exceeds checker limit: ${path}`);
    foundName = forbidden.test(withoutHtmlVocabulary(await readFile(path, 'latin1')));
  }
  const digest = hash.digest('hex');
  // Canonical Apache-2.0 English tokenizer data; ordinary vocabulary is not product identity.
  const vocabularyHashes = new Set(['da0e79933b9ed51798a3ae27893d3c5fa4a201126cef75586296df9b4d2c62a0', '07eced375cec144d27c900241f3e339478dec958f92fddbc551f295c992038a3']);
  if (vocabularyHashes.has(digest)) foundName = false;
  if (foundId) failures.push(`${path}: reference extension identity`);
  if (foundName) failures.push(`${path}: reference product name or identifier`);
  if (foundBundle && /\/(?:src|patches)\//.test(path)) failures.push(`${path}: bundled-code fingerprint in source`);
  if (referenceHashes.has(digest) && !(commonLicenseHashes.has(digest) && /(?:LICENSE|COPYING|NOTICE)(?:[-.][^/]*)?$/.test(path))) failures.push(`${path}: byte-identical reference artifact`);
}
for (const target of targets) await inspect(resolve(root, target));
if (!files) throw new Error('No rebuild files were checked.');
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Clean-room artifact checks passed for ${files} files. Manual provenance review is still required.`);
}
