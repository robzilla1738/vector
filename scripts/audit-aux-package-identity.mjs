#!/usr/bin/env node
/** Read-only raw delivered-byte inventory. Never executes or modifies the app. */
import { createReadStream } from 'node:fs';
import { lstat, readdir, readFile, readlink, realpath, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Fixed tokens permit bounded streaming across arbitrary binary/chunk boundaries.
// Counts overlap intentionally; they are findings, not classified product bugs.
export const deliveredIdentityTokens = Object.freeze([
  'Aside', 'ASIDE', 'aside-native', 'aside-browser', 'aside-daemon',
  'aside-agent', 'aside-vault', 'aside-memory', 'aside-runtime',
  'aside.dk.', 'aside.wrap.', 'aside.install.', 'aside.daemon.auth.',
  'aside.com', 'asidehq.com', 'AsideNativeSwift', '__aside', 'aside_dom',
]);
function encodedTokens() {
  return deliveredIdentityTokens.flatMap(token => {
    const le = Buffer.from(token, 'utf16le'), be = Buffer.from(le).swap16();
    return [['ascii', Buffer.from(token)], ['utf16le', le], ['utf16be', be]]
      .map(([encoding, bytes]) => ({ token, encoding, bytes }));
  });
}
export async function scanDeliveredBytes(chunks) {
  const needles = encodedTokens(), overlap = Math.max(...needles.map(x => x.bytes.length)) - 1;
  const counts = {}, hash = createHash('sha256');
  let tail = Buffer.alloc(0), size = 0;
  for await (const chunk of chunks) {
    const bytes = Buffer.from(chunk); hash.update(bytes); size += bytes.length;
    const joined = Buffer.concat([tail, bytes]);
    for (const { token, encoding, bytes: needle } of needles) {
      let offset = 0;
      while ((offset = joined.indexOf(needle, offset)) !== -1) {
        // Already counted matches end entirely inside the retained prefix.
        if (offset + needle.length > tail.length) {
          const key = `${encoding}:${token}`; counts[key] = (counts[key] ?? 0) + 1;
        }
        offset++;
      }
    }
    tail = Buffer.from(joined.subarray(Math.max(0, joined.length - overlap)));
  }
  return { bytes: size, sha256: hash.digest('hex'), counts };
}
export async function auditDeliveredIdentity(app) {
  const input = path.resolve(app), stat = await lstat(input);
  if (!stat.isDirectory() || stat.isSymbolicLink() || path.extname(input) !== '.app')
    throw Error('An explicit regular candidate .app directory is required');
  const root = await realpath(input);
  const markerPath = path.join(root, 'Contents/Resources/aux/bundle.json');
  // Reject a symlink in any marker ancestor before reading it.
  let current = root;
  for (const part of ['Contents', 'Resources', 'aux', 'bundle.json']) {
    current = path.join(current, part);
    if ((await lstat(current)).isSymbolicLink()) throw Error('Candidate marker must not traverse links');
  }
  const marker = JSON.parse(await readFile(markerPath, 'utf8'));
  if (marker.version !== 1 || marker.implementation !== 'supplied' || path.resolve(marker.finalApp ?? '') !== root)
    throw Error('Candidate supplied marker does not match the explicit app');
  const files = [], links = [], totals = {};
  let scannedFiles = 0, scannedBytes = 0;
  async function walk(relative = '') {
    for (const name of (await readdir(path.join(root, relative))).sort()) {
      const item = path.join(relative, name), absolute = path.join(root, item), entry = await lstat(absolute);
      if (entry.isSymbolicLink()) { links.push({ path: item, target: await readlink(absolute) }); continue; }
      if (entry.isDirectory()) { await walk(item); continue; }
      if (!entry.isFile()) throw Error('Unexpected candidate entry');
      if (/(^|\/)\.env(?:\.|$)/.test(item)) throw Error('Environment file in delivered candidate; audit refused');
      const result = await scanDeliveredBytes(createReadStream(absolute));
      scannedFiles++; scannedBytes += result.bytes;
      for (const [key, value] of Object.entries(result.counts)) totals[key] = (totals[key] ?? 0) + value;
      const productFilename = /aside/i.test(item);
      if (productFilename || Object.keys(result.counts).length) files.push({ path: item, productFilename, ...result });
    }
  }
  await walk();
  return { version: 1, app: root, identityProfile: marker.identityProfile,
    stateIdentityVersion: marker.stateIdentityVersion, scannedFiles, scannedBytes, files, totals,
    linksNotFollowed: links, complete: false, runtimeAcceptance: false,
    scope: 'Fixed raw ASCII/UTF-16 byte tokens in regular delivered files and paths. Overlapping counts include legal attribution and provenance. Links are recorded, never followed. Compressed payloads, synthesized strings, image pixels, reachability and runtime behavior require separate inspection. No source snippets are emitted.' };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [app, output] = process.argv.slice(2);
  if (!app || !output) throw Error('Usage: node scripts/audit-aux-package-identity.mjs CANDIDATE.app NEW_REPORT.json');
  const report = await auditDeliveredIdentity(app);
  await writeFile(output, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
  console.log(JSON.stringify({ report: output, scannedFiles: report.scannedFiles,
    scannedBytes: report.scannedBytes, filesWithReferences: report.files.length, complete: false }));
}
