import assert from 'node:assert/strict';
import { mkdtemp, open, lstat, readdir, unlink, rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { captureHomeState } from './home-capture.mjs';

const invalidBytes = Buffer.from('Aux owned invalid image fixture\n', 'ascii');
const validBytes = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGUlEQVR4nGMwqzz+nxLMMGrAqAGjBgwXAwCiVHUfEP0xPQAAAABJRU5ErkJggg==', 'base64');
const digest = data => createHash('sha256').update(data).digest('hex');
const shell = (name, role) => ({ name, ...(role ? { role } : {}), match: 'exact', scope: 'shell', index: 0 });
const composer = shell('Reply to conversation');

/** Fixed fixture only. No arbitrary source path or actual user image is accepted. */
export function createInvalidImageFixture() { return createOwnedImageFixture('invalid-image.png', invalidBytes); }
export function createValidImageFixture() { return createOwnedImageFixture('valid-image.png', validBytes); }
export const longImageFilename = 'aux-owned-long-image-' + 'filename-segment-'.repeat(7) + 'final.png';
export function createLongNamedValidImageFixture() { return createOwnedImageFixture(longImageFilename, validBytes); }
async function createOwnedImageFixture(filename, bytes) {
  const directory = await mkdtemp(join(tmpdir(), 'aux-image-appearance-'));
  const path = join(directory, filename);
  let file, parent, initialFile;
  try {
    parent = await lstat(directory); // Retain original identity before any file open.
    file = await open(path, 'wx+', 0o600);
    initialFile = await file.stat(); // Retain original FD/inode before any write.
    await file.writeFile(bytes); await file.sync();
    const original = await file.stat();
    const validate = async () => {
      const now = await lstat(path), dir = await lstat(directory), held = await file.stat();
      assert.ok(now.isFile() && !now.isSymbolicLink() && dir.isDirectory() && !dir.isSymbolicLink());
      for (const key of ['dev', 'ino', 'uid', 'mode', 'nlink', 'size']) assert.equal(now[key], original[key], `Owned image ${key} changed`);
      for (const key of ['dev', 'ino', 'uid', 'mode']) assert.equal(dir[key], parent[key], `Owned image directory ${key} changed`);
      assert.equal(now.uid, process.getuid()); assert.equal(now.mode & 0o777, 0o600); assert.equal(dir.mode & 0o777, 0o700);
      assert.equal(now.nlink, 1); assert.equal(held.ino, original.ino); assert.equal(held.dev, original.dev);
      assert.deepEqual(await readdir(directory), [filename]);
      const content = Buffer.alloc(bytes.length); const read = await file.read(content, 0, content.length, 0);
      assert.equal(read.bytesRead, bytes.length); assert.equal(digest(content), digest(bytes));
    };
    await validate();
    let phase = 'live';
    const validateRemainingDirectory = async () => {
      const dir = await lstat(directory);
      assert.ok(dir.isDirectory() && !dir.isSymbolicLink());
      for (const key of ['dev', 'ino', 'uid', 'mode']) assert.equal(dir[key], parent[key], `Owned image directory ${key} changed`);
      assert.deepEqual(await readdir(directory), [], 'Unknown image cleanup entry remains');
      const held = await file.stat();
      assert.equal(held.ino, original.ino); assert.equal(held.dev, original.dev);
    };
    const lease = Object.freeze({ path, validate, async dispose() {
      if (phase === 'disposed') return;
      try {
        if (phase === 'live') { await validate(); await unlink(path); phase = 'file-removed'; }
        if (phase === 'file-removed') { await validateRemainingDirectory(); await rmdir(directory); phase = 'tree-removed'; }
        await file.close(); file = null; phase = 'disposed';
      } catch (error) {
        // Keep the original FD/closure; never reopen a replacement inode or
        // discard the lease merely because validation/partial cleanup refused.
        throw Object.assign(new AggregateError([error], 'Original image fixture cleanup is unresolved', { cause: error }),
          { ownedImageFixture: lease, cleanupPhase: phase });
      }
    } });
    return lease;
  } catch (error) {
    // Creation failure retains only the directory returned by mkdtemp and
    // original exclusive file handle; no discovery/reopen can supply identity.
    let fileRemoved = false, treeRemoved = false, disposed = false;
    const identity = value => value && Object.freeze(Object.fromEntries(['dev', 'ino', 'uid', 'mode'].map(key => [key, value[key]])));
    const diagnostics = Object.freeze({ directory, path, originalDirectory: identity(parent), originalFile: identity(initialFile) });
    const originalDirectory = async () => {
      assert.ok(parent, 'Original created directory identity was not available; cleanup remains debt');
      const dir = await lstat(directory);
      assert.ok(dir.isDirectory() && !dir.isSymbolicLink());
      for (const key of ['dev', 'ino', 'uid', 'mode']) assert.equal(dir[key], parent[key], `Original creation directory ${key} changed`);
      assert.equal(dir.uid, process.getuid());
    };
    const lease = Object.freeze({ path, diagnostics, async dispose() {
      if (disposed) return;
      try {
        if (!treeRemoved) {
          await originalDirectory();
          if (file && !fileRemoved) {
            assert.ok(initialFile, 'Original exclusive file identity unavailable; cleanup remains debt');
            const held = await file.stat(), named = await lstat(path);
            assert.ok(named.isFile() && !named.isSymbolicLink());
            for (const key of ['dev', 'ino', 'uid', 'mode']) { assert.equal(held[key], initialFile[key]); assert.equal(named[key], initialFile[key]); }
            assert.equal(named.uid, process.getuid()); assert.equal(named.nlink, 1); assert.equal(held.nlink, 1);
            assert.ok(Number.isSafeInteger(held.size) && held.size >= 0 && held.size <= bytes.length); assert.equal(named.size, held.size);
            const partial = Buffer.alloc(held.size), read = await file.read(partial, 0, partial.length, 0);
            assert.equal(read.bytesRead, partial.length); assert.ok(partial.equals(bytes.subarray(0, partial.length)), 'Unknown partial creation bytes refuse cleanup');
            assert.deepEqual(await readdir(directory), [filename]);
            await unlink(path); fileRemoved = true;
          }
          await originalDirectory(); assert.deepEqual(await readdir(directory), []);
          await rmdir(directory); treeRemoved = true;
        }
        if (file) { await file.close(); file = null; }
        disposed = true;
      } catch (cleanup) {
        throw Object.assign(new AggregateError([error, cleanup], 'Image creation and original cleanup remain unresolved', { cause: error }),
          { ownedImageFixture: lease, cleanupPhase: treeRemoved ? 'creation-tree-removed' : fileRemoved ? 'creation-file-removed' : 'creation-failed' });
      }
    } });
    throw Object.assign(new AggregateError([error], 'Owned image fixture creation failed with retained cleanup lease', { cause: error }),
      { ownedImageFixture: lease, cleanupPhase: 'creation-failed' });
  }
}

export async function captureComposerImageRejection(t) {
  if (!t.appearanceEnabled) return { status: 'not-requested' };
  const app = t.app, ax = t.ax, owner = app.pid;
  assert.ok(Number.isInteger(owner) && owner > 0 && ax.pid === owner);
  const stable = () => { assert.equal(t.app, app); assert.equal(t.ax, ax); assert.equal(app.pid, owner); assert.equal(ax.pid, owner); assert.ok(!t.signal?.aborted); };
  const before = {};
  for (const method of ['pages.list', 'runs.list', 'workspace.get', 'settings.get']) before[method] = await t.rpc(method);
  assert.deepEqual(before['pages.list'], []); assert.deepEqual(before['runs.list'], []);
  const draft = (await ax.query(composer))[0]?.value;
  assert.equal(typeof draft, 'string'); stable();
  const initialWindows = (await ax.windows()).filter(window => window.layer === 0 && window.width > 0 && window.height > 0);
  assert.equal(initialWindows.length, 1); const windowId = initialWindows[0].id;
  assert.ok(Number.isInteger(windowId) && windowId > 0); stable();
  const unchanged = async () => {
    stable();
    assert.equal((await ax.query(composer))[0]?.value, draft);
    for (const method of Object.keys(before)) assert.deepEqual(await t.rpc(method), before[method], `Image rejection changed ${method}`);
    const windows = (await ax.windows()).filter(window => window.layer === 0 && window.width > 0 && window.height > 0);
    assert.equal(windows.length, 1); assert.equal(windows[0].id, windowId); stable();
  };
  const fixture = await createInvalidImageFixture();
  let primary, cleanup, result;
  try {
    await fixture.validate(); stable();
    await ax.click(shell('Add context', 'AXPopUpButton'));
    await ax.waitFor(shell('Image', 'AXButton'), 'enabled');
    await ax.click(shell('Image', 'AXButton'));
    await fixture.validate(); stable();
    await ax.openPanel(fixture.path);
    await ax.waitFor({ name: 'Unsupported or oversized evidence file', match: 'contains', scope: 'shell', index: 0 });
    await ax.waitFor(shell('Preparing image…'), 'absent');
    stable(); await fixture.validate();
    await unchanged();
    await captureHomeState(t, 'home-image-native-rejection', 'home-image-native-chooser-rejection');
    stable();
    if (!(await ax.query(shell('Image', 'AXButton'))).length) {
      await ax.click(shell('Add context', 'AXPopUpButton'));
      await ax.waitFor(shell('Image', 'AXButton'), 'enabled');
    }
    await ax.click(shell('Image', 'AXButton'));
    await ax.waitFor({ role: 'AXSheet', scope: 'window' });
    await fixture.validate(); stable();
    await ax.key('escape');
    await ax.waitFor({ role: 'AXSheet', scope: 'window' }, 'absent');
    await ax.waitFor(shell('Preparing image…'), 'absent');
    await ax.key('escape');
    await ax.focus(composer);
    assert.equal((await ax.query(composer))[0]?.focused, true);
    assert.equal((await ax.query(composer))[0]?.value, draft);
    stable();
    await unchanged();
    await captureHomeState(t, 'home-image-cancelled-draft-focused', 'home-image-chooser-cancelled-draft-focused');
    stable();
    result = { status: 'observed', ax: await ax.dump(), rpc: before };
  } catch (error) { primary = error; }
  finally {
    try { await fixture.dispose(); } catch (error) { cleanup = error; }
  }
  if (primary && cleanup) throw new AggregateError([primary, cleanup], 'Image appearance failed and original fixture cleanup is unresolved');
  if (primary || cleanup) throw primary ?? cleanup;
  return result;
}
