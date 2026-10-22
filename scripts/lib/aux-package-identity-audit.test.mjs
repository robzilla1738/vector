import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, writeFile, symlink, rm, realpath } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { scanDeliveredBytes, auditDeliveredIdentity } from '../audit-aux-package-identity.mjs';

test('binary streaming retains split ASCII and both UTF-16 encodings without duplicate overlap counts', async () => {
  const le = Buffer.from('AsideNativeSwift', 'utf16le');
  const input = Buffer.concat([Buffer.from([0, 255]), Buffer.from('AsideNativeSwift aside.dk.wrap'), le, Buffer.from(le).swap16()]);
  const whole = await scanDeliveredBytes([input]);
  const chunks = Array.from(input, byte => Buffer.from([byte]));
  assert.deepEqual(await scanDeliveredBytes(chunks), whole);
  assert.equal(whole.counts['ascii:Aside'], 1);
  assert.equal(whole.counts['ascii:AsideNativeSwift'], 1);
  assert.equal(whole.counts['utf16le:AsideNativeSwift'], 1);
  assert.equal(whole.counts['utf16be:AsideNativeSwift'], 1);
  assert.equal(whole.sha256, createHash('sha256').update(input).digest('hex'));
  assert.equal(whole.bytes, input.length);
});
test('HTML aside semantics and Aux strings are not raw product tokens', async () => {
  assert.deepEqual((await scanDeliveredBytes([Buffer.from('<aside>Aux</aside> aux.dk.v2')])).counts, {});
});
test('candidate traversal records links without scanning their targets and refuses a linked marker', async () => {
  const temp = await realpath(await mkdtemp(path.join(os.tmpdir(), 'aux-package-audit-')));
  try {
    const app = path.join(temp, 'Aux.app'), resources = path.join(app, 'Contents/Resources/aux');
    await mkdir(resources, { recursive: true });
    const marker = { version: 1, implementation: 'supplied', finalApp: app };
    await writeFile(path.join(resources, 'bundle.json'), JSON.stringify(marker));
    await writeFile(path.join(temp, 'outside'), 'AsideNativeSwift');
    await symlink(path.join(temp, 'outside'), path.join(resources, 'external'));
    const report = await auditDeliveredIdentity(app);
    assert.equal(report.scannedFiles, 1);
    assert.equal(report.linksNotFollowed.length, 1);
    assert.deepEqual(report.totals, {});
    await rm(path.join(resources, 'bundle.json'));
    await writeFile(path.join(temp, 'marker.json'), JSON.stringify(marker));
    await symlink(path.join(temp, 'marker.json'), path.join(resources, 'bundle.json'));
    await assert.rejects(auditDeliveredIdentity(app), /must not traverse links/);
  } finally { await rm(temp, { recursive: true, force: true }); }
});
