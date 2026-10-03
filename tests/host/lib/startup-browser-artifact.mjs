import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { constants, closeSync, fstatSync, lstatSync, openSync, readSync, realpathSync } from 'node:fs';
import { join } from 'node:path';
import { readStartupMachO } from './startup-helper-manifest.mjs';
/** Only the fixed admitted Aux or Stock bundle executable. Hold it through original child
 * cleanup; this byte lease alone does not prove the native build's compilation. */
export function retainStartupBrowserArtifact(bundle, pins, kind = 'aux') {
  assert.ok(kind === 'aux' || kind === 'stock', 'Closed startup executable kind required');
  assert.deepEqual(Object.keys(pins ?? {}).sort(), ['imageUuid', 'sha256']);
  assert.match(pins.sha256, /^[a-f0-9]{64}$/); assert.match(pins.imageUuid, /^[a-f0-9]{32}$/);
  const path = join(bundle, kind === 'aux' ? 'Contents/MacOS/Aux' : 'Contents/MacOS/Chromium'); assert.equal(realpathSync(path), path);
  const fd = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  let retired = false;
  try {
    const initial = fstatSync(fd);
    const valid = info => info.isFile() && info.uid === process.getuid() && !(info.mode & 0o6022) &&
      (info.mode & 0o100) && info.nlink === 1 && info.size > 0 && info.size <= 64 * 1024 * 1024;
    assert.ok(valid(initial));
    const same = info => valid(info) && ['dev', 'ino', 'size', 'mode', 'mtimeMs', 'ctimeMs'].every(key => info[key] === initial[key]);
    const bytes = () => {
      const result = Buffer.alloc(initial.size);
      for (let offset = 0; offset < result.length;) {
        const count = readSync(fd, result, offset, result.length - offset, offset);
        assert.ok(count > 0, 'Original browser executable truncated'); offset += count;
      }
      return result;
    };
    const validate = () => {
      assert.equal(retired, false, 'Retired original browser executable lease');
      assert.ok(same(fstatSync(fd)) && same(lstatSync(path)), 'Original browser executable replaced');
      const original = bytes();
      assert.equal(createHash('sha256').update(original).digest('hex'), pins.sha256);
      assert.equal(readStartupMachO(original).imageUuid, pins.imageUuid);
      assert.ok(same(fstatSync(fd)) && same(lstatSync(path)), 'Original browser changed during readback');
    };
    validate();
    const identity = Object.freeze({ ...pins, device: String(initial.dev), inode: String(initial.ino) });
    assert.match(identity.device, /^[1-9][0-9]{0,19}$/); assert.match(identity.inode, /^[1-9][0-9]{0,19}$/);
    return Object.freeze({ identity, validate,
      release() { if (retired) return; retired = true; closeSync(fd); } });
  } catch (error) { closeSync(fd); throw error; }
}
