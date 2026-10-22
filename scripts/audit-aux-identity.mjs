#!/usr/bin/env node
/** Read-only product identity audit. Reports counts/hashes, never source text. */
import { createHash } from 'node:crypto';
import { lstat, readdir, readFile, realpath, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const identityPatterns = Object.freeze({
  protocol: /AsideDaemonSessionToken|AsideSessionToken|Aside Daemon(?: Dev)? Auth v1|Aside\.[A-Za-z_$][\w$]*|aside\.daemon\.auth\.|aside-daemon/g,
  persistedCrypto: /aside\.dk(?:\.[\w./-]+)?|aside\.install\.[\w.-]+/g,
  endpoint: /https?:\/\/[A-Za-z0-9._-]*aside[A-Za-z0-9._-]*(?::\d+)?/gi,
  product: /Aside|ASIDE|aside[-_](?:browser|native|computer|daemon|agent|vault)|\.aside\b/g,
});
export function countIdentityReferences(text) {
  return Object.fromEntries(Object.entries(identityPatterns).map(([kind, pattern]) =>
    [kind, [...text.matchAll(pattern)].length]));
}
export async function auditIdentity(stage) {
  const root = await realpath(stage);
  const marker = JSON.parse(await readFile(path.join(root, 'manifest.json'), 'utf8'));
  if (marker.implementation !== 'supplied' || marker.version !== 1)
    throw Error('Only an explicit supplied generated stage may be audited.');
  const files = [], links = [], totals = Object.fromEntries(Object.keys(identityPatterns).map(key => [key, 0]));
  let scannedFiles = 0;
  async function walk(relative = '') {
    for (const name of (await readdir(path.join(root, relative))).sort()) {
      const item = path.join(relative, name), absolute = path.join(root, item), stat = await lstat(absolute);
      if (stat.isSymbolicLink()) { links.push(item); continue; }
      if (stat.isDirectory()) { await walk(item); continue; }
      if (!stat.isFile()) throw Error('Unexpected generated stage entry.');
      // Audits are evidence, not product payload. Never scan environment files.
      if (item === 'manifest.json' || /(^|\/)\.env(?:\.|$)/.test(item)) continue;
      const bytes = await readFile(absolute), counts = countIdentityReferences(bytes.toString('utf8'));
      scannedFiles++;
      for (const kind of Object.keys(totals)) totals[kind] += counts[kind];
      const productFilename = /aside/i.test(item);
      if (productFilename || Object.values(counts).some(Boolean))
        files.push({ path: item, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), productFilename, counts });
    }
  }
  await walk();
  return { version: 1, stage: root, scannedFiles, files, totals, linksNotFollowed: links,
    complete: false, scope: 'Raw uncompressed product references; compressed/embedded payloads, native app and legal/HTML classification require separate inspection. Counts may overlap. No source contents or credentials are emitted.',
    productReferencesRemaining: files.length > 0 };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [stage, output] = process.argv.slice(2);
  if (!stage || !output) throw Error('Usage: node scripts/audit-aux-identity.mjs STAGE NEW_REPORT.json');
  const report = await auditIdentity(stage);
  await writeFile(output, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
  console.log(JSON.stringify({ report: output, scannedFiles: report.scannedFiles, filesWithReferences: report.files.length, totals: report.totals, complete: false }));
}
