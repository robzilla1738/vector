import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

// Execute the actual journey geometry lookup without running native effects.
const source = readFileSync(new URL('./journeys/layout-modes.mjs', import.meta.url), 'utf8');
const start = source.indexOf('async function mainWindow(t) {');
const end = source.indexOf('async function centerPointer', start);
assert.ok(start >= 0 && end > start);
const mainWindow = runInNewContext(`(${source.slice(start, end).trim()})`);
const window = width => ({ id: 71, layer: 0, x: 24, y: 42, width, height: 700 });
const context = rows => ({ assert, ax: { windows: async () => rows } });

for (const width of [720, 799, 810]) {
  test(`actual layout lookup retains the original ${width}pt frame`, async () => {
    const original = window(width);
    assert.equal(await mainWindow(context([original, { ...window(900), id: 72, layer: 3 }])), original);
  });
}

test('actual layout lookup refuses absent or ambiguous normal windows', async () => {
  for (const rows of [[], [{ ...window(810), layer: 3 }], [window(720), { ...window(810), id: 72 }]]) {
    await assert.rejects(mainWindow(context(rows)), /one normal fixture window/);
  }
});

test('actual layout lookup refuses zero, negative and malformed observed frames', async () => {
  for (const mutation of [{ width: 0 }, { height: 0 }, { width: -1 }, { x: NaN }, { y: Infinity }, { height: undefined }, { width: '810' }]) {
    await assert.rejects(mainWindow(context([{ ...window(810), ...mutation }])), /positive finite window frame/);
  }
});
