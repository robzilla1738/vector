// Loads the supplied and the Aux aux-pdf.node side by side and compares all seven pdf methods
// on synthetic PDFs (fixtures.mjs), the native admission ABI, and output file bytes.
//   node --test apps/pdf-addon/tests/parity.test.mjs
// SUPPLIED and AUX override the two addon paths.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { Worker } from 'node:worker_threads';
import { writeFixtures } from './fixtures.mjs';

const repo = new URL('../../../', import.meta.url).pathname;
const paths = {
  supplied: process.env.SUPPLIED ?? join(repo, 'out/live-inputs/completion-20261026/release-addons-a1/aux-pdf.node'),
  aux: process.env.AUX ?? join(repo, 'apps/pdf-addon/.build/aux-pdf.node'),
};
const SIDES = ['supplied', 'aux'];
const require = createRequire(import.meta.url);
const modules = { supplied: require(paths.supplied), aux: require(paths.aux) };
const root = mkdtempSync(join(tmpdir(), 'aux-pdf-parity-'));
test.after(() => rmSync(root, { recursive: true, force: true }));
const fixtures = join(root, 'fixtures');
mkdirSync(fixtures);
const fx = writeFixtures(fixtures);

const dir = (side, name) => join(root, side, name);
const comparable = (side, value) => JSON.parse(JSON.stringify(value).replaceAll(join(root, side), '<root>'));
/** Calls one method; `args` is an argument list, or a function of the side that returns one. */
const attempt = (side, method, args) => {
  try { return { value: comparable(side, modules[side].pdf[method](...(typeof args === 'function' ? args(side) : args))) }; }
  catch (error) { return { thrown: [error.constructor.name, error.message.replaceAll(join(root, side), '<root>'), error.code] }; }
};
/** Runs one call on both sides, asserts identical results and identical files under the named output, returns the result. */
const both = (method, args, output) => {
  const [supplied, aux] = SIDES.map((side) => attempt(side, method, args));
  assert.deepEqual(aux, supplied, `${method}`);
  if (output) sameTree(output);
  return aux;
};
// PDFium writes a fresh, address-derived /ID into every saved PDF; everything else must match byte for byte.
const masked = (bytes) => (bytes.subarray(0, 5).toString() === '%PDF-' ? Buffer.from(bytes.toString('latin1').replace(/\/ID\s*\[\s*<[0-9A-Fa-f]*>\s*<[0-9A-Fa-f]*>\s*\]/g, '/ID[]'), 'latin1') : bytes);
const files = (base) => {
  try { if (statSync(base).isFile()) return ['']; } catch { return []; }
  return readdirSync(base, { recursive: true }).filter((f) => statSync(join(base, f)).isFile()).sort();
};
function sameTree(name) {
  const [a, b] = SIDES.map((side) => dir(side, name));
  assert.deepEqual(files(b), files(a), `${name}: file list`);
  for (const file of files(a)) {
    const [x, y] = [join(a, file), join(b, file)].map((p) => masked(readFileSync(p)));
    assert.ok(x.equals(y), `${relative(root, join(a, file))}: bytes differ`);
  }
}
const input = (fn) => (side) => [fn(side)];

test('exports one pdf object with the seven methods', () => {
  const shape = (m) => ({
    names: Object.getOwnPropertyNames(m), descriptor: { ...Object.getOwnPropertyDescriptor(m, 'pdf'), value: typeof m.pdf },
    methods: Object.getOwnPropertyNames(m.pdf).map((name) => {
      const d = Object.getOwnPropertyDescriptor(m.pdf, name);
      return { name, fn: d.value.name, length: d.value.length, writable: d.writable, enumerable: d.enumerable, configurable: d.configurable };
    }),
    proto: Object.getPrototypeOf(m.pdf) === Object.prototype,
  });
  assert.deepEqual(shape(modules.aux), shape(modules.supplied));
  assert.equal(shape(modules.aux).methods.length, 7);
});

test('argument validation for every method', () => {
  const file = fx.text, out = '/nonexistent-aux-dir/never';
  const common = [[], [undefined], [null], [1], ['text'], [[]], [{}], [{ filePath: 5 }], [{ filePath: null }], [{ filePath: '/nonexistent/aux.pdf' }],
    [{ filePath: fixtures }], [{ filePath: fx.empty }], [{ filePath: fx.garbage }], [{ filePath: fx.truncated }], [{ filePath: fx.encryptedLocked }]];
  const pages = [{ pages: 'x' }, { pages: [] }, { pages: [0] }, { pages: [4] }, { pages: [1.5] }, { pages: [NaN] }, { pages: [Infinity] }, { pages: ['1'] },
    { pages: [1, 'x'] }, { pages: null }, { pages: undefined }, { pages: { length: 1, 0: 1 } }, { pages: [1e10] }, { pages: [-1] }];
  const cases = {
    extractText: [...common, ...pages.map((p) => [{ filePath: file, ...p }]), [{ filePath: fx.odd }], [{ filePath: fx.odd, pages: [3] }]],
    getFormFields: common,
    renderPages: [...common, [{ filePath: file }], [{ filePath: file, outputDir: 5 }],
      ...[255, 4097, 255.9, -1, '300', NaN, Infinity, null, undefined].map((maxDimension) => [{ filePath: file, outputDir: out, maxDimension }]),
      ...pages.map((p) => [{ filePath: file, outputDir: out, ...p }]), [{ filePath: '/nonexistent', outputDir: out, maxDimension: 100 }]],
    rotate: [...common, [{ filePath: file, outputPath: out }], ...[0, 45, 360, -360, 90.5, '90', NaN, null].map((degrees) => [{ filePath: file, outputPath: out, degrees }]),
      [{ filePath: '/nonexistent', outputPath: out, degrees: 7 }], ...pages.map((p) => [{ filePath: file, outputPath: out, degrees: 90, ...p }])],
    split: [...common, [{ filePath: file }], [{ filePath: file, outputDir: [] }], ...pages.map((p) => [{ filePath: file, outputDir: join(root, 'never-created'), ...p }])],
    merge: [[], [{}], [{ files: 'x' }], [{ files: {} }], [{ files: [] }], [{ files: [{ filePath: file }] }], [{ files: [{ filePath: file }], outputPath: 5 }],
      [{ files: [null], outputPath: out }], [{ files: [{}], outputPath: out }], [{ files: [{ filePath: file }, { filePath: '/nonexistent' }], outputPath: out }],
      [{ files: [{ filePath: file, pages: [9] }], outputPath: out }], [{ files: [{ filePath: fx.garbage }], outputPath: out }]],
    fillFormFields: [...common, [{ filePath: fx.form }], [{ filePath: fx.form, outputPath: out }], [{ filePath: fx.form, outputPath: out, fields: 'x' }],
      [{ filePath: fx.form, outputPath: out, fields: [] }], [{ filePath: fx.form, outputPath: out, fields: [{}] }], [{ filePath: fx.form, outputPath: out, fields: [null] }],
      [{ filePath: fx.form, outputPath: out, fields: [{ name: 5, value: 1 }] }], [{ filePath: fx.form, outputPath: out, fields: [{ field_id: 'name' }] }],
      [{ filePath: fx.form, outputPath: out, fields: [{ field_id: 'name', value: {} }] }], [{ filePath: fx.form, outputPath: out, fields: [{ field_id: 'name', value: [] }] }],
      [{ filePath: fx.form, outputPath: out, fields: [{ field_id: 'name', value: 1n }] }], [{ filePath: fx.form, outputPath: out, fields: [{ field_id: 5, name: 'name', value: 'x' }] }],
      [{ filePath: fx.xfa, outputPath: out, fields: [{ field_id: 'name', value: 'x' }] }], [{ filePath: '/nonexistent', outputPath: out, fields: [{ field_id: 'name', value: 'x' }] }]],
  };
  for (const [method, list] of Object.entries(cases)) {
    for (const args of list) {
      const [supplied, aux] = SIDES.map((side) => attempt(side, method, args));
      assert.deepEqual(aux, supplied, `${method}(${args.map((a) => JSON.stringify(a, (_, v) => (typeof v === 'bigint' ? `${v}n` : v))).join(', ')})`);
    }
  }
});

test('extractText: selections, fonts, encryption, damage, unicode paths', () => {
  for (const file of [fx.text, fx.image, fx.form, fx.encryptedOpen, fx.badXref, fx.unicode]) both('extractText', [{ filePath: file }]);
  for (const pages of [[1], [3, 1, 1], [2, 2, 2], [3]]) both('extractText', [{ filePath: fx.text, pages }]);
  both('extractText', [{ filePath: fx.odd, pages: [1, 2] }]);
  // Unknown keys are ignored.
  both('extractText', [{ filePath: fx.text, outputDir: '/x', maxDimension: 1, extra: true }]);
});

test('getFormFields: every field type, sort order, XFA and plain documents', () => {
  for (const file of [fx.form, fx.xfa, fx.text, fx.encryptedOpen, fx.badXref]) both('getFormFields', [{ filePath: file }]);
  assert.equal(both('getFormFields', [{ filePath: fx.form }]).value.fieldCount, 13);
});

test('renderPages: sizes, rotation, images, form widgets and PNG bytes', () => {
  const cases = [
    ['text-default', { filePath: fx.text }], ['text-256', { filePath: fx.text, maxDimension: 256, pages: [2, 1, 2] }],
    ['text-4096', { filePath: fx.text, maxDimension: 4096, pages: [1] }], ['text-fraction', { filePath: fx.text, maxDimension: 777.7 }],
    ['image', { filePath: fx.image }], ['image-small', { filePath: fx.image, maxDimension: 300 }], ['form', { filePath: fx.form, maxDimension: 900 }],
    ['xfa', { filePath: fx.xfa, maxDimension: 600 }], ['encrypted', { filePath: fx.encryptedOpen, maxDimension: 500 }],
    ['odd-zero', { filePath: fx.odd, pages: [1] }], ['odd-thin', { filePath: fx.odd, pages: [2], maxDimension: 256 }], ['odd-missing', { filePath: fx.odd, pages: [3] }],
    ['unicode', { filePath: fx.unicode, pages: [1], maxDimension: 256 }],
    // The daemon's preview call (thumbnail and small preview).
    ['preview-thumb', { filePath: fx.text, maxDimension: 1024, pages: [1] }], ['preview-small', { filePath: fx.text, maxDimension: 256, pages: [1] }],
  ];
  for (const [name, options] of cases) both('renderPages', input((side) => ({ ...options, outputDir: join(dir(side, `render-${name}`), 'nested/out') })), `render-${name}`);
  const result = both('renderPages', input((side) => ({ filePath: fx.text, outputDir: dir(side, 'render-check'), pages: [1] })));
  assert.deepEqual(result.value.pages[0], { page: 1, path: '<root>/render-check/page_001.png', width: 1236, height: 1600 });
});

test('merge, split and rotate: results and saved PDF bytes', () => {
  both('merge', input((side) => ({ files: [{ filePath: fx.text, pages: [3, 1] }, { filePath: fx.image }, { filePath: fx.form }, { filePath: fx.text, pages: [2, 2] }], outputPath: join(dir(side, 'merge'), 'a/b/merged.pdf') })), 'merge');
  both('merge', input((side) => ({ files: [{ filePath: fx.encryptedOpen }], outputPath: join(dir(side, 'merge-encrypted'), 'out.pdf') })), 'merge-encrypted');
  both('merge', input((side) => ({ files: [{ filePath: fx.text }], outputPath: dir(side, 'merge-bare') })), 'merge-bare');
  both('merge', input((side) => ({ files: [{ filePath: fx.text }], outputPath: '/dev/null/aux.pdf' })));
  both('split', input((side) => ({ filePath: fx.text, outputDir: dir(side, 'split') })), 'split');
  both('split', input((side) => ({ filePath: fx.form, outputDir: dir(side, 'split-dup'), pages: [2, 1, 2] })), 'split-dup');
  both('split', input((side) => ({ filePath: fx.text, outputDir: '/dev/null/split' })));
  for (const degrees of [-270, -180, -90, 90, 180, 270]) {
    both('rotate', input((side) => ({ filePath: fx.text, outputPath: join(dir(side, `rotate${degrees}`), 'r.pdf'), degrees, pages: [2, 1, 2] })), `rotate${degrees}`);
  }
  both('rotate', input((side) => ({ filePath: fx.form, outputPath: join(dir(side, 'rotate-form'), 'r.pdf'), degrees: 90 })), 'rotate-form');
  // Read the outputs back through both modules.
  for (const side of SIDES) for (const file of ['merge/a/b/merged.pdf', 'split/page_002.pdf', 'rotate-90/r.pdf', 'rotate-form/r.pdf']) {
    both('extractText', [{ filePath: join(dir(side, ''), file) }]);
    both('renderPages', input((s) => ({ filePath: join(dir(side, ''), file), outputDir: dir(s, `reread-${side}-${file.replaceAll('/', '_')}`), maxDimension: 300 })), `reread-${side}-${file.replaceAll('/', '_')}`);
  }
});

test('fillFormFields: text, choice, checkbox, radio, unfillable and missing fields', () => {
  const cases = {
    all: [{ field_id: 'name', value: 'Ada Lovelace' }, { name: 'notes', value: 'Line one\nLine two' }, { field_id: 'agree', value: true }, { field_id: 'color', value: 'blue' },
      { field_id: 'size', value: 'Large' }, { field_id: 'fruit', value: 'Cherry' }, { field_id: 'go', value: 'x' }, { field_id: 'sig', value: 'x' }, { field_id: 'nope', value: 1 },
      { field_id: 'a_left', value: 42.5 }, { field_id: 'b_right', value: null }, { field_id: 'dup', value: false }],
    unicode: [{ field_id: 'name', value: 'Zoë 😀 漢字' }, { field_id: 'a_left', value: 1e21 }, { field_id: 'b_right', value: -0 }],
    checkboxYes: [{ field_id: 'agree', value: 'Yes' }], checkboxTrue: [{ field_id: 'agree', value: 'true' }], checkboxOne: [{ field_id: 'agree', value: 1 }],
    checkboxOff: [{ field_id: 'agree', value: 'Off' }], checkboxBad: [{ field_id: 'agree', value: 'maybe' }], checkboxNull: [{ field_id: 'agree', value: null }],
    radioRed: [{ field_id: 'color', value: 'red' }], radioNumber: [{ field_id: 'color', value: 1 }], radioUnknown: [{ field_id: 'color', value: 'green' }],
    choiceBad: [{ field_id: 'size', value: 'Huge' }], choiceSmall: [{ field_id: 'size', value: 'Small' }], listNumber: [{ field_id: 'fruit', value: 2 }],
    lastWins: [{ name: 'name', value: 'first' }, { field_id: 'name', value: 'second' }], idOverName: [{ field_id: 'name', name: 'notes', value: 'by id' }],
    onlyMissing: [{ field_id: 'nope', value: 'x' }],
  };
  for (const [name, fields] of Object.entries(cases)) {
    const out = (side) => join(dir(side, `fill-${name}`), 'filled.pdf');
    both('fillFormFields', input((side) => ({ filePath: fx.form, outputPath: out(side), fields })), `fill-${name}`);
    both('getFormFields', (side) => [{ filePath: out(side) }]);
    both('renderPages', input((side) => ({ filePath: out(side), outputDir: dir(side, `fill-${name}-png`), maxDimension: 700 })), `fill-${name}-png`);
  }
  both('fillFormFields', input((side) => ({ filePath: fx.text, outputPath: join(dir(side, 'fill-plain'), 'out.pdf'), fields: [{ field_id: 'x', value: 'y' }] })), 'fill-plain');
});

test('repeated calls give the same output', () => {
  for (const side of SIDES) {
    const runs = [1, 2].map((n) => modules[side].pdf.renderPages({ filePath: fx.form, outputDir: dir(side, `repeat-${n}`), maxDimension: 400 }));
    assert.deepEqual(comparable(side, runs[0]).pages.map((p) => p.width), comparable(side, runs[1]).pages.map((p) => p.width));
    for (const page of ['page_001.png', 'page_002.png']) assert.ok(readFileSync(join(dir(side, 'repeat-1'), page)).equals(readFileSync(join(dir(side, 'repeat-2'), page))));
  }
});

test('native admission ABI: reentrancy, pending count, closure', () => {
  const probe = (side) => JSON.parse(execFileSync(process.execPath,
    ['--no-warnings', new URL('lifecycle-probe.cjs', import.meta.url).pathname, paths[side], fx.text], { encoding: 'utf8' }));
  const supplied = probe('supplied');
  assert.deepEqual(probe('aux'), supplied);
  assert.equal(supplied.duringCall.pending, '1');
  assert.equal(supplied.closeDuringCall.result, 1);
});

test('runs in a worker thread', async () => {
  const runInWorker = (side) => new Promise((resolve, reject) => {
    const worker = new Worker(`
      const { parentPort, workerData } = require('node:worker_threads');
      const { pdf } = require(workerData.path);
      parentPort.postMessage([pdf.extractText({ filePath: workerData.file }), pdf.getFormFields({ filePath: workerData.form })]);`,
    { eval: true, workerData: { path: paths[side], file: fx.text, form: fx.form } });
    worker.once('message', (output) => { worker.terminate(); resolve(output); });
    worker.once('error', reject);
  });
  assert.deepEqual(await runInWorker('aux'), await runInWorker('supplied'));
  both('extractText', [{ filePath: fx.text, pages: [1] }]);
});
