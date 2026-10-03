import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { constants, openSync, closeSync, fstatSync, lstatSync, readSync, readlinkSync, readdirSync, realpathSync } from 'node:fs';
import { join, relative, isAbsolute } from 'node:path';
import { canonicalPairJson, pairHash } from './packaged-runtime-pair-protocol.mjs';
const same = (a, b) => ['dev', 'ino', 'size', 'mtimeMs', 'ctimeMs', 'mode', 'uid'].every(key => a[key] === b[key]);
const within = (root, path) => { const name = relative(root, path); return name !== '..' && !name.startsWith('../') && !isAbsolute(name); };
const compare = (a, b) => Buffer.compare(Buffer.from(a), Buffer.from(b));
function hashFile(fd, size) {
  const digest = createHash('sha256'), buffer = Buffer.alloc(65536);
  for (let offset = 0; offset < size;) {
    const count = readSync(fd, buffer, 0, Math.min(buffer.length, size - offset), offset);
    assert.ok(count > 0, 'Original package file truncated'); digest.update(buffer.subarray(0, count)); offset += count;
  }
  return digest.digest('hex');
}
/** Read-only original approved closure. All descriptors stay held until release.
 * This primitive validates bytes; it never proves compilation or admission. */
export function retainApprovedClosure(closure) {
  assert.equal(realpathSync(closure.root), closure.root, 'Noncanonical closure root');
  assert.equal(pairHash(canonicalPairJson(closure.rows)), closure.inventorySha256);
  assert.ok(['complete-tree', 'compiled-deployment'].includes(closure.scope));
  const rootMetadata = lstatSync(closure.root);
  assert.deepEqual({ device: rootMetadata.dev, inode: rootMetadata.ino, mode: rootMetadata.mode & 0o7777 }, closure.rootMetadata, 'Foreign original closure root');
  const held = [], seen = new Map(); let retired = false;
  for (const row of closure.rows) assert.ok(typeof row.path === 'string' && row.path.length > 0 && !isAbsolute(row.path) && !row.path.includes('\\') && !row.path.includes('\0') && row.path.split('/').every(part => part && part !== '.' && part !== '..'), 'Foreign closure path');
  const expected = new Map(closure.rows.map(row => [row.path, row]));
  assert.equal(expected.size, closure.rows.length);
  const named = name => name ? join(closure.root, name) : closure.root;
  function check(item) {
    assert.ok(same(item.initial, lstatSync(named(item.name))), 'Original closure entry replaced');
    if (item.fd !== undefined) assert.ok(same(item.initial, fstatSync(item.fd)), 'Original closure descriptor changed');
  }
  function walk(name) {
    assert.ok(held.length < 8192, 'Held package closure limit');
    const path = named(name), initial = lstatSync(path), row = name ? expected.get(name) : null;
    assert.ok(initial.uid === process.getuid(), 'Foreign package entry owner');
    if (name) assert.ok(row, 'Unexpected package closure entry');
    if (initial.isSymbolicLink()) {
      assert.equal(row.kind, 'symlink'); assert.equal(initial.mode & 0o7777, row.mode);
      const target = readlinkSync(path), bytes = Buffer.from(target);
      assert.equal(target, row.target); assert.equal(bytes.length, row.size); assert.equal(pairHash(bytes), row.sha256);
      const resolved = realpathSync(path);
      assert.ok(within(closure.root, resolved) && expected.has(relative(closure.root, resolved)), 'Foreign/dangling closure symlink');
      const item = { name, initial, target, resolved }; held.push(item); seen.set(name, row); check(item); return;
    }
    assert.ok(initial.isDirectory() || initial.isFile(), 'Unsupported package entry');
    assert.ok(!(initial.mode & 0o6022), 'Unsafe writable package entry');
    assert.equal(realpathSync(path), path, 'Changed closure parent');
    if (row) { assert.equal(row.kind, initial.isDirectory() ? 'directory' : 'regular'); assert.equal(initial.mode & 0o7777, row.mode); }
    const fd = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW | (initial.isDirectory() ? constants.O_DIRECTORY : 0));
    const item = { name, initial, fd, row }; held.push(item); check(item);
    if (row) seen.set(name, row);
    if (initial.isDirectory() && closure.scope === 'complete-tree') {
      const children = readdirSync(path).sort(compare); check(item);
      for (const child of children) { check(item); walk(name ? name + '/' + child : child); }
      check(item);
    } else if (initial.isFile()) {
      assert.equal(initial.size, row.size); assert.equal(hashFile(fd, initial.size), row.sha256); check(item);
    }
  }
  function validate() {
    assert.equal(retired, false, 'Retired original package closure');
    for (const item of held) {
      check(item);
      if (item.target !== undefined) {
        assert.equal(readlinkSync(named(item.name)), item.target);
        assert.equal(realpathSync(named(item.name)), item.resolved);
      } else if (item.initial.isFile()) assert.equal(hashFile(item.fd, item.initial.size), item.row.sha256);
      else if (closure.scope === 'complete-tree') {
        const actual = readdirSync(named(item.name)).sort(compare);
        const prefix = item.name ? item.name + '/' : '';
        const children = [...expected.keys()].filter(name => name.startsWith(prefix) && !name.slice(prefix.length).includes('/')).map(name => name.slice(prefix.length)).sort(compare);
        assert.deepEqual(actual, children, 'Original package closure membership changed');
      }
      check(item);
    }
  }
  const release = () => { if (retired) return; retired = true; for (const item of held) if (item.fd !== undefined) closeSync(item.fd); };
  try { walk('');
    if (closure.scope === 'compiled-deployment') for (const row of closure.rows) walk(row.path);
    assert.equal(seen.size, expected.size, 'Missing package closure entries'); validate();
    return Object.freeze({ validate, release, root: closure.root });
  } catch (error) { release(); throw error; }
}
