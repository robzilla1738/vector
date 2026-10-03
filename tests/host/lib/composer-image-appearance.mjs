import assert from 'node:assert/strict';
import { mkdtemp, open, lstat, readdir, unlink, rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { captureHomeState } from './home-capture.mjs';

const bytes = Buffer.from('Aux owned invalid image fixture\n', 'ascii');
const digest = data => createHash('sha256').update(data).digest('hex');
const shell = (name, role) => ({ name, ...(role ? { role } : {}), match: 'exact', scope: 'shell', index: 0 });
const composer = shell('Reply to conversation');

/** Fixed fixture only. No arbitrary source path or actual user image is accepted. */
export async function createInvalidImageFixture() {
  const directory = await mkdtemp(join(tmpdir(), 'aux-image-appearance-'));
  const path = join(directory, 'invalid-image.png');
  let file;
  try {
    file = await open(path, 'wx+', 0o600);
    await file.writeFile(bytes); await file.sync();
    const original = await file.stat(), parent = await lstat(directory);
    const validate = async () => {
      const now = await lstat(path), dir = await lstat(directory), held = await file.stat();
      assert.ok(now.isFile() && !now.isSymbolicLink() && dir.isDirectory() && !dir.isSymbolicLink());
      for (const key of ['dev', 'ino', 'uid', 'mode', 'nlink', 'size']) assert.equal(now[key], original[key], `Owned image ${key} changed`);
      for (const key of ['dev', 'ino', 'uid', 'mode']) assert.equal(dir[key], parent[key], `Owned image directory ${key} changed`);
      assert.equal(now.uid, process.getuid()); assert.equal(now.mode & 0o777, 0o600); assert.equal(dir.mode & 0o777, 0o700);
      assert.equal(now.nlink, 1); assert.equal(held.ino, original.ino); assert.equal(held.dev, original.dev);
      assert.deepEqual(await readdir(directory), ['invalid-image.png']);
      const content = Buffer.alloc(bytes.length); const read = await file.read(content, 0, content.length, 0);
      assert.equal(read.bytesRead, bytes.length); assert.equal(digest(content), digest(bytes));
    };
    await validate();
    return Object.freeze({ path, validate, async dispose() { try { await validate(); await unlink(path); await rmdir(directory); } finally { await file.close(); file = null; } } });
  } catch (error) {
    // Unknown file/tree identity is retained as cleanup debt, never blindly removed.
    if (file) await file.close().catch(() => {});
    throw error;
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
    await ax.click(shell('Add context', 'AXButton'));
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
      await ax.click(shell('Add context', 'AXButton'));
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
