// Host-only: each Aux-owned component against the sealed chunk it replaces (see parity.mjs).
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {requireInput} from '../../scripts/lib/inputs.mjs';
import {COMPONENTS, CORNER_CHANGES, GLOBALS_CSS, integrateComponents, integrateStyles, readComponent} from './integration.mjs';
import {assertFreeNames, assertParity} from './parity.mjs';

const dist = `${requireInput('candidateApp')}/Contents/Resources/aux/apps/extension/dist`;
const textOf = chunk => readFileSync(`${dist}/${chunk}`, 'utf8');

test('every Aux-owned component renders, runs its effects and handles events like the one it replaces', async () => {
  await assertParity({blocksByChunk: COMPONENTS, textOf, integrate: integrateComponents, read: readComponent, changes: CORNER_CHANGES, minimum: 1000});
});

test('the components replace their blocks once and refuse a second pass', () => {
  for (const [chunk, blocks] of Object.entries(COMPONENTS)) {
    const after = integrateComponents(chunk, textOf(chunk));
    for (const {file} of blocks) assert.equal(after.split(readComponent(file)).length - 1, 1, file);
    assert.throws(() => integrateComponents(chunk, after), /drift/);
  }
});

test('the module-scope names the Aux sources bind are free in the rest of their chunks', () => {
  assertFreeNames({blocksByChunk: COMPONENTS, textOf, read: readComponent});
});

test('every class the corner changes introduce is compiled in the shipped globals CSS', () => {
  const css = integrateStyles(readFileSync(`${dist}/${GLOBALS_CSS}`, 'utf8'));
  for (const [file, , to] of CORNER_CHANGES) {
    assert.ok(new RegExp(`\\.${to}(?:\\s*\\{|,)`).test(css), `${file}: .${to} is not compiled`);
    assert.ok(readComponent(file).includes(to), `${file} uses ${to}`);
  }
});
