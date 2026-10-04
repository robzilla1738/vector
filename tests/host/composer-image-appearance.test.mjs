import { basename, dirname, join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, lstat, unlink } from 'node:fs/promises';
import { captureComposerImageRejection, createInvalidImageFixture, createValidImageFixture, createLongNamedValidImageFixture, longImageFilename } from './lib/composer-image-appearance.mjs';

function context() {
  const calls = [], paths = [], captures = [];
  const snapshots = { 'pages.list': [], 'runs.list': [], 'workspace.get': { id: 'original' }, 'settings.get': { modelConfigured: false } };
  const t = { appearanceEnabled: true, app: { pid: 881 }, signal: new AbortController().signal,
    rpc: async method => structuredClone(snapshots[method]),
    capture: async (name, options) => { captures.push([name, options]); },
    ax: { pid: 881, query: async selector => selector.name === 'Reply to conversation' ? [{ value: 'Original unsent draft', focused: true }] : [{}],
      click: async selector => calls.push(['click', selector.name]), waitFor: async (selector, state) => calls.push(['wait', selector.name ?? selector.role, state]),
      openPanel: async path => { paths.push(path); assert.equal(await readFile(path, 'utf8'), 'Aux owned invalid image fixture\n'); },
      key: async key => calls.push(['key', key]), focus: async selector => calls.push(['focus', selector.name]),
      windows: async () => [{ id: 17, layer: 0, width: 800, height: 700 }], dump: async () => ({ original: true }),
    },
  };
  return { t, calls, paths, captures, snapshots };
}

test('ordinary mode performs no chooser or filesystem work', async () => {
  assert.deepEqual(await captureComposerImageRejection({ appearanceEnabled: false }), { status: 'not-requested' });
});
test('fixed owned file lacks native supported magic and exact cleanup removes it', async () => {
  const fixture = await createInvalidImageFixture();
  assert.equal(await readFile(fixture.path, 'utf8'), 'Aux owned invalid image fixture\n');
  await fixture.validate(); await fixture.dispose();
  await assert.rejects(readFile(fixture.path), { code: 'ENOENT' });
});
test('source sequence uses original chooser and owned Home captures, preserving draft/state', async () => {
  const { t, calls, paths, captures } = context();
  const result = await captureComposerImageRejection(t);
  assert.equal(result.status, 'observed');
  assert.equal(paths.length, 1);
  assert.deepEqual(captures.map(row => row[1]), [
    { windowId: 17, state: 'home-image-native-chooser-rejection' },
    { windowId: 17, state: 'home-image-chooser-cancelled-draft-focused' },
  ]);
  assert.ok(calls.some(row => row[0] === 'wait' && row[1] === 'Unsupported or oversized evidence file'));
  assert.equal(calls.filter(row => row[0] === 'key' && row[1] === 'escape').length, 2);
  await assert.rejects(readFile(paths[0]), { code: 'ENOENT' });
});
test('retired original owner prevents capture while exact owned fixture cleanup remains possible', async () => {
  const { t, paths, captures } = context();
  t.ax.openPanel = async path => { paths.push(path); t.app = { pid: 881 }; };
  await assert.rejects(captureComposerImageRejection(t), error => error.code === "ERR_ASSERTION");
  assert.equal(captures.length, 0);
  await assert.rejects(readFile(paths[0]), { code: 'ENOENT' });
});
test('changed original fixture refuses removal instead of hiding cleanup debt', async () => {
  const fixture = await createInvalidImageFixture();
  const original = await lstat(fixture.path), bytes = await readFile(fixture.path);
  await writeFile(fixture.path, 'foreign bytes');
  await assert.rejects(fixture.validate()); await assert.rejects(fixture.dispose());
  assert.equal(await readFile(fixture.path, 'utf8'), 'foreign bytes');
  const now = await lstat(fixture.path); assert.equal(now.ino, original.ino); assert.equal(now.dev, original.dev);
  await writeFile(fixture.path, bytes); await fixture.validate(); await fixture.dispose();
});

test('original chooser failure and changed fixture preserve both failures', async () => {
  const { t, paths } = context(); const primary = new Error('Original chooser refusal');
  let original, bytes, failure;
  t.ax.openPanel = async path => { paths.push(path); original = await lstat(path); bytes = await readFile(path); await writeFile(path, 'changed original fixture'); throw primary; };
  await assert.rejects(captureComposerImageRejection(t), error => { failure = error; return error instanceof AggregateError && error.errors[0] === primary && error.errors.length === 2; });
  assert.equal(await readFile(paths[0], 'utf8'), 'changed original fixture');
  const lease = failure.errors[1].ownedImageFixture; assert.ok(lease);
  const now = await lstat(paths[0]); assert.equal(now.ino, original.ino); assert.equal(now.dev, original.dev);
  await writeFile(paths[0], bytes); await lease.validate(); await lease.dispose();
});

test('same-PID replacement native window and changed state refuse before appearance capture', async () => {
  for (const change of ['window', 'state']) {
    const { t, captures, snapshots, paths } = context();
    t.ax.openPanel = async path => {
      paths.push(path);
      if (change === 'window') t.ax.windows = async () => [{ id: 18, layer: 0, width: 800, height: 700 }];
      else snapshots['runs.list'] = [{ runId: 'foreign-run' }];
    };
    await assert.rejects(captureComposerImageRejection(t));
    assert.equal(captures.length, 0);
    await assert.rejects(readFile(paths[0]), { code: 'ENOENT' });
  }
});

test('closed long filename retains original valid PNG bytes and exact inode cleanup after unknown entry refusal',async()=>{const original=await createValidImageFixture(),long=await createLongNamedValidImageFixture();let foreign;try{assert.equal(basename(long.path),longImageFilename);assert.ok(longImageFilename.length>100&&longImageFilename.length<255);assert.equal(longImageFilename.includes('/'),false);const before=await lstat(long.path);assert.equal(before.mode&0o777,0o600);assert.equal(before.nlink,1);assert.ok((await readFile(long.path)).equals(await readFile(original.path)));await long.validate();foreign=join(dirname(long.path),'unknown-owned-test-entry');await writeFile(foreign,'original source control',{flag:'wx',mode:0o600});await assert.rejects(long.dispose(),error=>error.ownedImageFixture===long);assert.equal((await lstat(long.path)).ino,before.ino);assert.equal((await lstat(long.path)).dev,before.dev);assert.equal(await readFile(foreign,'utf8'),'original source control');await unlink(foreign);foreign=undefined;await long.validate();await long.dispose();await long.dispose();await assert.rejects(readFile(long.path),{code:'ENOENT'})}finally{if(foreign)await unlink(foreign);await original.dispose();await long.dispose()}});
