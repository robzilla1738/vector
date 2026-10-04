import assert from 'node:assert/strict';
import { constants, openSync, closeSync, fstatSync, lstatSync, readSync } from 'node:fs';
import { join } from 'node:path';
import { nativeSlotPath } from '../../../scripts/native-slot.mjs';
const admitted = new WeakSet();
const same = (a, b) => ['dev', 'ino', 'uid', 'mode'].every(key => a[key] === b[key]);
const ownerPattern = /^\{"pid":([1-9][0-9]*),"token":"([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})","startedAt":([1-9][0-9]*)\}$/;
const alive = pid => { try { process.kill(pid, 0); return true; } catch (error) { return error.code === 'EPERM'; } };
function bytes(fd, size) {
  assert.ok(Number.isSafeInteger(size) && size > 0 && size <= 4096);
  const result = Buffer.alloc(size); assert.equal(readSync(fd, result, 0, size, 0), size); return result;
}
/** Read-only original slot descriptor producer. It never acquires, releases,
 * reclaims, deletes or substitutes a native slot. No caller path is accepted.
 */
export function retainNativeSlotForCredentialGrant(originalSlot) {
  const directory = openSync(nativeSlotPath, constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW);
  let ownerFd, closed = false, retired = false;
  try {
    const dir = fstatSync(directory), named = lstatSync(nativeSlotPath);
    assert.ok(dir.isDirectory() && same(dir, named) && dir.uid === process.getuid() && (dir.mode & 0o777) === 0o700);
    ownerFd = openSync(join(nativeSlotPath, 'owner.json'), constants.O_RDONLY | constants.O_NOFOLLOW);
    const info = fstatSync(ownerFd), ownerNamed = lstatSync(join(nativeSlotPath, 'owner.json'));
    assert.ok(info.isFile() && same(info, ownerNamed) && info.uid === process.getuid() && info.nlink === 1 && (info.mode & 0o777) === 0o600);
    const originalBytes = bytes(ownerFd, info.size), match = ownerPattern.exec(originalBytes.toString('utf8'));
    assert.ok(match, 'Invalid original native slot producer bytes');
    const owner = Object.freeze({ pid: Number(match[1]), token: match[2], startedAt: Number(match[3]) });
    assert.ok(Number.isSafeInteger(owner.pid) && owner.pid > 0 && owner.pid <= 0x7fffffff && Number.isSafeInteger(owner.startedAt));
    assert.ok(originalSlot && originalSlot.token === owner.token && alive(owner.pid), 'Foreign or dead original native slot');
    const validate = () => {
      assert.ok(!closed && !retired, 'Retired original credential slot');
      try {
        const currentDir = lstatSync(nativeSlotPath), currentFile = lstatSync(join(nativeSlotPath, 'owner.json')), held = fstatSync(ownerFd);
        assert.ok(same(currentDir, dir) && same(fstatSync(directory), dir) && currentDir.isDirectory());
        assert.ok(same(currentFile, info) && same(held, info) && currentFile.isFile() && held.nlink === 1 && currentFile.nlink === 1);
        assert.equal(held.size, info.size); assert.deepEqual(bytes(ownerFd, held.size), originalBytes);
        assert.ok(originalSlot.token === owner.token && alive(owner.pid));
        try { lstatSync(join(nativeSlotPath, 'quarantine.json')); assert.fail('Original native slot is quarantined'); }
        catch (error) { if (error.code !== 'ENOENT') throw error; }
      } catch (error) { retired = true; throw error; }
    };
    validate();
    const lease = Object.freeze({ directoryFd: directory, ownerFd, validate,
      receipt: Object.freeze({ ownerPid: owner.pid, startedAt: owner.startedAt, directoryIdentity: { dev: dir.dev, ino: dir.ino }, ownerIdentity: { dev: info.dev, ino: info.ino } }),
      release() { if (closed) return; validate(); closeSync(ownerFd); closeSync(directory); closed = true; },
    });
    admitted.add(lease); return lease;
  } catch (error) { if (ownerFd !== undefined) closeSync(ownerFd); closeSync(directory); throw error; }
}

export function readNativeSlotForCredentialGrant(lease) {
  assert.ok(admitted.has(lease), "Foreign retained credential slot"); lease.validate(); return lease;
}
