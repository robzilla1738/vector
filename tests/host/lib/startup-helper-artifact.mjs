import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { constants, closeSync, fstatSync, lstatSync, openSync, readFileSync, readSync, realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { assembleStartupHelper } from '../assemble-startup-helper.mjs';
import { validateStartupCompilerManifest } from './startup-helper-manifest.mjs';
const hex = (value, size) => typeof value === 'string' && new RegExp(`^[a-f0-9]{${size}}$`).test(value);
function fdHash(fd, size) {
  const digest = createHash('sha256'), buffer = Buffer.alloc(65536);
  for (let offset = 0; offset < size;) {
    const count = readSync(fd, buffer, 0, Math.min(buffer.length, size - offset), offset);
    assert.ok(count > 0, 'Original helper artifact truncated');
    digest.update(buffer.subarray(0, count)); offset += count;
  }
  return digest.digest('hex');
}
const same = (a, b) => ['dev', 'ino', 'size', 'mtimeMs', 'ctimeMs'].every(key => a[key] === b[key]);
/** Hold original executable/compiler-manifest descriptors through child cleanup.
 * Requires independently audited compiler/SDK pins plus actual executable metadata.
 * File consistency and synthetic manifest controls alone never prove compilation. */
export function retainStartupHelperArtifact(helper, compilerAudit) {
  assert.deepEqual(Object.keys(helper ?? {}).sort(), ['path', 'sha256', 'sourceSha256', 'assembledSha256', 'imageUuid', 'compilerManifestPath', 'compilerManifestSha256'].sort());
  for (const key of ['sha256', 'sourceSha256', 'assembledSha256', 'compilerManifestSha256']) assert.ok(hex(helper[key], 64));
  assert.ok(hex(helper.imageUuid, 32));
  const assembly = assembleStartupHelper(
    readFileSync(new URL('../startup-receipt-writer.swift', import.meta.url)),
    readFileSync(new URL('../startup-launch.swift', import.meta.url)),
    readFileSync(new URL('../assemble-startup-helper.mjs', import.meta.url)),
    readFileSync(new URL('../startup-child-lifetime.swift', import.meta.url)),
  ).manifest;
  assert.equal(helper.sourceSha256, assembly.sourceSha256); assert.equal(helper.assembledSha256, assembly.assembledSha256);
  const held = [];
  let retired = false;
  const validate = () => {
    assert.equal(retired, false, 'Retired startup helper artifact lease');
    for (const item of held) {
      const current = fstatSync(item.fd), path = lstatSync(item.path);
      assert.ok(same(item.initial, current) && same(item.initial, path) && !path.isSymbolicLink(), 'Original startup helper artifact replaced');
      assert.equal(fdHash(item.fd, item.initial.size), item.hash, 'Original startup helper bytes changed');
    }
  };
  try {
    for (const [key, hashKey, maximum, executable] of [['path', 'sha256', 64 * 1024 * 1024, true], ['compilerManifestPath', 'compilerManifestSha256', 1024 * 1024, false]]) {
      assert.equal(helper[key], resolve(helper[key])); assert.equal(realpathSync(helper[key]), helper[key]);
      const fd = openSync(helper[key], constants.O_RDONLY | constants.O_NOFOLLOW);
      const initial = fstatSync(fd); held.push({ fd, initial, path: helper[key], hash: helper[hashKey] });
      assert.ok(initial.isFile() && initial.uid === process.getuid() && (initial.mode & 0o022) === 0 && (initial.mode & 0o6000) === 0 && initial.nlink === 1 && initial.size > 0 && initial.size <= maximum);
      if (executable) assert.ok((initial.mode & 0o100) !== 0);
    }
    validate();
    const originalBytes = item => {
      const bytes = Buffer.alloc(item.initial.size);
      for (let offset = 0; offset < bytes.length;) {
        const count = readSync(item.fd, bytes, offset, bytes.length - offset, offset);
        assert.ok(count > 0, 'Original compiler artifact truncated'); offset += count;
      }
      return bytes;
    };
    const compile = validateStartupCompilerManifest(originalBytes(held[1]).toString('utf8'),
      originalBytes(held[0]), assembly, compilerAudit);
    assert.equal(compile.image.imageUuid, helper.imageUuid);
    assert.equal(compile.originalManifestSha256, helper.compilerManifestSha256);
    validate();
    return Object.freeze({ compile, identity: Object.freeze({ ...helper }), assembly, validate,
      release() { if (retired) return; retired = true; for (const item of held) closeSync(item.fd); },
    });
  } catch (error) { for (const item of held) closeSync(item.fd); throw error; }
}
