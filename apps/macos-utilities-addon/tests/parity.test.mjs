// Loads the supplied and the Aux aux-macos-utilities.node side by side and compares every
// command. Never touches the clipboard and never opens an app (see docs/spec/native/macos-utilities.md §6).
//   node --test apps/macos-utilities-addon/tests/parity.test.mjs
// SUPPLIED and AUX override the two addon paths.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Worker } from 'node:worker_threads';
import { crc32, deflateSync } from 'node:zlib';

const repo = new URL('../../../', import.meta.url).pathname;
const paths = {
  supplied: process.env.SUPPLIED ?? join(repo, 'out/live-inputs/completion-20261026/release-addons-a1/aux-macos-utilities.node'),
  aux: process.env.AUX ?? join(repo, 'apps/macos-utilities-addon/.build/aux-macos-utilities.node'),
};
const require = createRequire(import.meta.url);
const addons = { supplied: require(paths.supplied), aux: require(paths.aux) };
const root = mkdtempSync(join(tmpdir(), 'aux-mu-parity-'));
test.after(() => rmSync(root, { recursive: true, force: true }));

// Each addon gets its own copy of every path, so outputs can be compared byte for byte.
const dir = (side, name) => { const d = join(root, side, name); mkdirSync(d, { recursive: true }); return d; };
const attempt = (side, args) => {
  try { return { value: JSON.parse(addons[side].run(...args)) }; }
  catch (error) { return { thrown: [error.constructor.name, error.message, error.code] }; }
};
const json = (side, command, input) => {
  const result = attempt(side, [command, JSON.stringify(input)]);
  assert.equal(result.thrown, undefined, `${side} threw`);
  return result.value;
};
/** Runs a command on both sides with per-side paths and returns both results with paths made comparable. */
const both = (command, input) => {
  const out = {};
  for (const side of ['supplied', 'aux']) {
    const text = JSON.stringify(json(side, command, input(side)));
    out[side] = JSON.parse(text.replaceAll(join(root, side), '<root>'));
  }
  assert.deepEqual(out.aux, out.supplied);
  return out.aux;
};
const sameBytes = (relative) => {
  const [a, b] = ['supplied', 'aux'].map((side) => join(root, side, relative));
  assert.equal(existsSync(b), existsSync(a), `${relative} presence`);
  if (existsSync(a)) assert.ok(readFileSync(a).equals(readFileSync(b)), `${relative} bytes`);
};

function png(width, height) {
  const chunk = (type, data) => {
    const body = Buffer.concat([Buffer.from(type), data]), length = Buffer.alloc(4), crc = Buffer.alloc(4);
    length.writeUInt32BE(data.length); crc.writeUInt32BE(crc32(body));
    return Buffer.concat([length, body, crc]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0); header.writeUInt32BE(height, 4); header.set([8, 6, 0, 0, 0], 8);
  const row = Buffer.alloc(1 + width * 4);
  for (let x = 0; x < width; x++) row.set([x * 255 / width, 90, 200, 255], 1 + x * 4);
  const pixels = Buffer.concat(Array.from({ length: height }, () => row));
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header), chunk('IDAT', deflateSync(pixels)), chunk('IEND', Buffer.alloc(0))]);
}
const fixtures = join(root, 'fixtures');
mkdirSync(fixtures);
writeFileSync(join(fixtures, 'note.txt'), 'Aux parity fixture\n');
writeFileSync(join(fixtures, 'image.png'), png(64, 48));
execFileSync('sips', ['-s', 'format', 'heic', join(fixtures, 'image.png'), '--out', join(fixtures, 'image.heic')], { stdio: 'ignore' });

test('exports only a read-only, non-enumerable run', () => {
  const shape = (m) => ({
    names: Object.getOwnPropertyNames(m), keys: Object.keys(m), proto: Object.getPrototypeOf(m) === Object.prototype,
    descriptor: { ...Object.getOwnPropertyDescriptor(m, 'run'), value: typeof m.run }, name: m.run.name, length: m.run.length,
  });
  assert.deepEqual(shape(addons.aux), shape(addons.supplied));
});

test('argument validation and command routing', () => {
  const cases = [
    [], [undefined], [null], [1], [{}], [Symbol('x')], ['a\0b'], ['copy-file\0'], ['copy-file', 5], ['copy-file', null],
    ['copy-file', 'a\0b'], ['', ''], ['nope', ''], ['\uD800', ''], ['COPY-FILE', '{}'], ['copy-file'], ['copy-file', '{}', 'extra'],
    ['copy-file', ''], ['copy-file', '[]'], ['copy-file', 'not json'], ['copy-file', '"text"'], ['copy-file', '{"filePath":5}'],
    ['copy-file', '{"filePath":null}'], ['copy-file', '{"filePath":"/nonexistent/aux"}'],
    ['open-with', '{}'], ['open-with', '{"filePath":"/etc/hosts"}'], ['open-with', '{"filePath":"/nonexistent","appPath":"/nonexistent"}'],
    ['open-with', '{"filePath":"/etc/hosts","appPath":"/nonexistent/App.app"}'],
    ['list-open-apps', '{}'], ['list-open-apps', '{"filePath":"/nonexistent"}'], ['list-open-apps', '{"filePath":["/etc/hosts"]}'],
    ['app-icons', '{}'], ['app-icons', '{"bundleIds":[]}'], ['app-icons', '{"iconDirectory":"/tmp"}'], ['app-icons', '{"bundleIds":[1],"iconDirectory":"/tmp"}'],
    ['app-icons', '{"bundleIds":"com.apple.finder","iconDirectory":"/tmp"}'], ['app-icons', '{"bundleIds":[null],"iconDirectory":"/tmp"}'],
    ['generate-thumbnail', '{}'], ['generate-thumbnail', '{"filePath":"/a","iconOutputPath":"/b"}'],
    ['generate-thumbnail', '{"filePath":"/a","iconOutputPath":"/b","thumbnailOutputPath":7}'],
  ];
  for (const args of cases) {
    const [supplied, aux] = ['supplied', 'aux'].map((side) => attempt(side, args));
    assert.deepEqual(aux, supplied, `run(${args.map((a) => typeof a === 'symbol' ? 'Symbol' : JSON.stringify(a)).join(', ')})`);
  }
});

test('list-open-apps: candidates, default, names and icons', () => {
  for (const file of ['note.txt', 'image.png']) {
    const result = both('list-open-apps', (side) => ({ filePath: join(fixtures, file), iconDirectory: join(dir(side, `apps-${file}`), 'icons') }));
    assert.ok(result.apps.length > 0, `${file} has candidate apps`);
    assert.equal(result.apps.filter((a) => a.default).length, 1);
    for (const app of result.apps) sameBytes(app.iconPath.replace('<root>/', ''));
  }
  both('list-open-apps', () => ({ filePath: join(fixtures, 'note.txt') }));
  both('list-open-apps', () => ({ filePath: fixtures }));
});

test('app-icons: lookups, misses and the cached file', () => {
  const ids = ['com.apple.finder', 'com.apple.Safari', 'com.apple.TextEdit', 'com.apple.Preview', 'dev.aux.not-installed'];
  const result = both('app-icons', (side) => ({ bundleIds: ids, iconDirectory: join(dir(side, 'icons'), 'nested') }));
  for (const path of Object.values(result.icons)) sameBytes(path.replace('<root>/', ''));
  // An existing <bundle id>.png is returned as it is, never redrawn.
  for (const side of ['supplied', 'aux']) writeFileSync(join(dir(side, 'cached'), 'com.apple.finder.png'), 'not a png');
  both('app-icons', (side) => ({ bundleIds: ['com.apple.finder'], iconDirectory: dir(side, 'cached') }));
  sameBytes('cached/com.apple.finder.png');
});

test('generate-thumbnail: PNG, HEIC, text, missing file and unwritable outputs', () => {
  for (const file of ['image.png', 'image.heic', 'note.txt', 'missing.png']) {
    both('generate-thumbnail', (side) => {
      const out = dir(side, `preview-${file}`);
      return { filePath: join(fixtures, file), iconOutputPath: join(out, 'deep/icon.png'), thumbnailOutputPath: join(out, 'deep/thumb.png') };
    });
    sameBytes(`preview-${file}/deep/icon.png`);
    sameBytes(`preview-${file}/deep/thumb.png`);
  }
  both('generate-thumbnail', () => ({ filePath: join(fixtures, 'image.png'), iconOutputPath: '/dev/null/icon.png', thumbnailOutputPath: '/dev/null/thumb.png' }));
});

test('native shutdown ABI: pending Environments, closure, refusal after close', () => {
  const probe = (side) => JSON.parse(execFileSync(process.execPath,
    ['--no-warnings', new URL('lifecycle-probe.cjs', import.meta.url).pathname, paths[side]], { encoding: 'utf8' }));
  const supplied = probe('supplied');
  assert.deepEqual(probe('aux'), supplied);
  assert.equal(supplied.worker.pending, '2');
});

test('runs in a worker thread and survives worker teardown', async () => {
  const runInWorker = (side) => new Promise((resolve, reject) => {
    const worker = new Worker(`
      const { parentPort, workerData } = require('node:worker_threads');
      parentPort.postMessage(require(workerData.path).run('list-open-apps', workerData.input));`,
    { eval: true, workerData: { path: paths[side], input: JSON.stringify({ filePath: join(fixtures, 'note.txt') }) } });
    worker.once('message', (output) => { worker.terminate(); resolve(JSON.parse(output)); });
    worker.once('error', reject);
  });
  assert.deepEqual(await runInWorker('aux'), await runInWorker('supplied'));
  assert.deepEqual(json('aux', 'copy-file', {}), json('supplied', 'copy-file', {}));
});
