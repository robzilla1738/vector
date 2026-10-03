import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { constants, openSync, closeSync, fstatSync, lstatSync, readSync, realpathSync } from 'node:fs';
const same = (a, b) => ['dev', 'ino', 'size', 'mtimeMs', 'ctimeMs', 'mode', 'uid'].every(key => a[key] === b[key]);
/** Held original documentary bytes. Only an independently approved caller may
 * supply references. This primitive neither brands a pair nor grants launch. */
export function retainPackagedRuntimeFiles() {
  const held = new Map(); let retired = false;
  function check(item) {
    assert.equal(retired, false, 'Retired packaged artifact references');
    assert.equal(realpathSync(item.path), item.path, 'Original artifact parent changed');
    assert.ok(same(item.initial, lstatSync(item.path)) && same(item.initial, fstatSync(item.fd)), 'Original artifact replaced');
  }
  function hash(item) {
    check(item); const buffer = Buffer.alloc(65536), digest = createHash('sha256');
    for (let offset = 0; offset < item.initial.size;) {
      const count = readSync(item.fd, buffer, 0, Math.min(buffer.length, item.initial.size - offset), offset);
      assert.ok(count > 0, 'Original artifact truncated'); digest.update(buffer.subarray(0, count)); offset += count;
    }
    assert.equal(digest.digest('hex'), item.sha256, 'Original artifact bytes changed'); check(item);
  }
  function retain(reference) {
    assert.equal(retired, false, 'Retired packaged artifact references');
    assert.deepEqual(Object.keys(reference).sort(), ['path', 'sha256']);
    assert.match(reference.sha256, /^[a-f0-9]{64}$/); assert.equal(realpathSync(reference.path), reference.path);
    const old = held.get(reference.path);
    if (old) { assert.equal(old.sha256, reference.sha256, 'Contradictory original reference'); hash(old); return old; }
    assert.ok(held.size < 8192, 'Packaged reference descriptor bound');
    const initial = lstatSync(reference.path);
    assert.ok(initial.isFile() && !initial.isSymbolicLink() && initial.uid === process.getuid() &&
      !(initial.mode & 0o6022) && initial.size <= 1024 * 1024 * 1024, 'Unsafe original artifact reference');
    const fd = openSync(reference.path, constants.O_RDONLY | constants.O_NOFOLLOW);
    const item = { ...reference, initial, fd }; held.set(reference.path, item);
    try { hash(item); return item; }
    catch (error) { held.delete(reference.path); closeSync(fd); throw error; }
  }
  function validate() { assert.equal(retired, false); for (const item of held.values()) hash(item); }
  return Object.freeze({
    retain(reference) { retain(reference); },
    read(reference, maximum = 32 * 1024 * 1024) {
      assert.ok(Number.isSafeInteger(maximum) && maximum >= 0 && maximum <= 64 * 1024 * 1024);
      const item = retain(reference); assert.ok(item.initial.size <= maximum, 'Original artifact read byte bound');
      const bytes = Buffer.alloc(item.initial.size); let offset = 0;
      while (offset < bytes.length) { const count = readSync(item.fd, bytes, offset, bytes.length - offset, offset); assert.ok(count > 0); offset += count; }
      hash(item); return bytes;
    },
    validate,
    release() { if (retired) return; retired = true; for (const item of held.values()) closeSync(item.fd); },
  });
}
