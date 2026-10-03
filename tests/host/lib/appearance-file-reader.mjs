import assert from 'node:assert/strict';
import { constants, openSync, closeSync, fstatSync, lstatSync, readSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { removeOriginalAppearanceChannel } from './appearance-channel-retire.mjs';
import { createAppearanceFileRecordDecoder } from './appearance-file-records.mjs';

// Internal transport only: admission and native/runtime/helper ownership belong
// to the original App owner. No file header supplies a signing key or identity.
export function createAppearanceFileReader({ root, capabilityReceipt, validateOriginal, revalidateOriginal = validateOriginal }) {
  assert.equal(typeof validateOriginal, 'function');
  const checkOwner = () => {
    const result = validateOriginal();
    assert.ok(!result || typeof result.then !== 'function', 'Original owner fence must be synchronous');
  };
  const receipt = structuredClone(capabilityReceipt);
  const decoder = createAppearanceFileRecordDecoder(receipt);
  const flags = constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_CLOEXEC;
  const descriptors = [];
  let retired = false, sealed = false, cleanupBusy = false, failure, busy = false, offset = 0, originalHeader;
  const same = (actual, expected, mode, directory = false) => {
    assert.ok(directory ? actual.isDirectory() : actual.isFile(), 'Original appearance file type changed');
    assert.equal(actual.uid, BigInt(process.getuid()));
    assert.equal(actual.mode & 0o777n, BigInt(mode));
    assert.equal(actual.dev.toString(), expected.device); assert.equal(actual.ino.toString(), expected.inode);
    if (!directory) assert.equal(actual.nlink, 1n);
  };
  const paths = [root, join(root, 'profile'), join(root, receipt.basename)];
  const pins = [
    { device: receipt.rootDevice, inode: receipt.rootInode },
    { device: receipt.profileDevice, inode: receipt.profileInode },
    { device: receipt.fileDevice, inode: receipt.fileInode },
  ];
  function validate() {
    assert.ok(!retired && !sealed, 'Original appearance reader retired'); if (failure) throw failure;
    checkOwner();
    for (let i = 0; i < paths.length; i++) {
      same(lstatSync(paths[i], { bigint: true }), pins[i], i === 2 ? 0o600 : 0o700, i !== 2);
      same(fstatSync(descriptors[i], { bigint: true }), pins[i], i === 2 ? 0o600 : 0o700, i !== 2);
    }
    const size = fstatSync(descriptors[2], { bigint: true }).size;
    assert.ok(size >= BigInt(offset) && size <= 2097152n, 'Original appearance file truncated or exceeded bound');
    checkOwner(); return Number(size);
  }
  function retire() {
    if (retired) return;
    retired = true; decoder.retire();
    const errors = [];
    for (const fd of descriptors.splice(0)) try { closeSync(fd); } catch (error) { errors.push(error); }
    if (errors.length) throw new AggregateError(errors, 'Original appearance descriptors failed to close');
  }
  try {
    checkOwner();
    for (let i = 0; i < paths.length; i++) {
      same(lstatSync(paths[i], { bigint: true }), pins[i], i === 2 ? 0o600 : 0o700, i !== 2);
      descriptors.push(openSync(paths[i], flags | (i === 2 ? 0 : constants.O_DIRECTORY)));
    }
    validate();
  } catch (error) {
    try { retire(); } catch (cleanup) { throw new AggregateError([error, cleanup], 'Appearance admission and descriptor cleanup failed'); }
    throw error;
  }
  return Object.freeze({
    async read() {
      assert.ok(!busy, 'Concurrent original appearance read'); busy = true;
      try {
        validate(); await revalidateOriginal(); const size = validate();
        const bytes = Buffer.alloc(size - offset);
        let consumed = 0;
        while (consumed < bytes.length) {
          const count = readSync(descriptors[2], bytes, consumed, bytes.length - consumed, offset + consumed);
          assert.ok(count > 0, 'Original appearance file changed during read'); consumed += count;
        }
        const records = decoder.write(bytes);
        if (offset === 0) { const end = bytes.indexOf(10); assert.ok(end >= 0, "Original native header incomplete"); originalHeader = bytes.subarray(0, end + 1).toString("base64"); }
        offset += consumed;
        validate(); await revalidateOriginal(); validate(); return records;
      } catch (error) { failure ??= error; throw failure; }
      finally { busy = false; }
    },
    header() { validate(); assert.ok(originalHeader, "Original native header not read"); return originalHeader; },
    seal() { sealed = true; decoder.retire(); },
    async removeAfterOriginalRetirement(confirmRetirement) {
      assert.equal(typeof confirmRetirement, 'function');
      assert.ok(sealed && !retired && !cleanupBusy, 'Original sealed channel required');
      cleanupBusy = true;
      try {
        assert.equal(await confirmRetirement(), true, 'Original process retirement unverified');
        // A fresh decoder authenticates the final complete original file, including
        // samples written after observation stopped. No failed framing is deleted.
        const size = Number(fstatSync(descriptors[2], { bigint: true }).size);
        assert.ok(size > 0 && size <= 2097152);
        for (let i = 0; i < paths.length; i++) {
          same(lstatSync(paths[i], { bigint: true }), pins[i], i === 2 ? 0o600 : 0o700, i !== 2);
          same(fstatSync(descriptors[i], { bigint: true }), pins[i], i === 2 ? 0o600 : 0o700, i !== 2);
        }
        const bytes = Buffer.alloc(size); let offset = 0;
        while (offset < size) { const n = readSync(descriptors[2], bytes, offset, size - offset, offset); assert.ok(n > 0); offset += n; }
        const finalDecoder = createAppearanceFileRecordDecoder(receipt);
        try { finalDecoder.write(bytes); finalDecoder.finish(); } finally { finalDecoder.retire(); }
        assert.equal(await confirmRetirement(), true, 'Original process retirement changed');
        assert.ok(sealed && !retired, 'Original retained cleanup owner replaced');
        for (let i = 0; i < paths.length; i++) {
          same(lstatSync(paths[i], { bigint: true }), pins[i], i === 2 ? 0o600 : 0o700, i !== 2);
          same(fstatSync(descriptors[i], { bigint: true }), pins[i], i === 2 ? 0o600 : 0o700, i !== 2);
        }
        const result = removeOriginalAppearanceChannel(descriptors, {
          rootDevice: receipt.rootDevice, rootInode: receipt.rootInode,
          profileDevice: receipt.profileDevice, profileInode: receipt.profileInode,
          fileDevice: receipt.fileDevice, fileInode: receipt.fileInode,
          size: String(size), sha256: createHash('sha256').update(bytes).digest('hex'),
        });
        for (let i = 0; i < 2; i++) same(lstatSync(paths[i], { bigint: true }), pins[i], 0o700, true);
        retire(); return result;
      } finally { cleanupBusy = false; }
    },
    retire,
  });
}
