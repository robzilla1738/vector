// Host-only: the polish edits against the sealed candidate's real extension chunks.
import {requireInput} from '../../../scripts/lib/inputs.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {EDITS, integratePolish} from './integration.mjs';

const dist = `${requireInput('candidateApp')}/Contents/Resources/aux/apps/extension/dist`;

for (const [chunk, edits] of Object.entries(EDITS)) {
  test(`${chunk} takes every polish edit once and refuses a second pass`, () => {
    const after = integratePolish(chunk, readFileSync(`${dist}/${chunk}`, 'utf8'));
    for (const rule of edits) assert.ok(after.includes(rule.replace), rule.name);
    assert.throws(() => integratePolish(chunk, after), /drift/);
  });
}

test('words search, addresses open', () => {
  const urlish = text => /^\S+$/.test(text) && /[.:/]|^localhost$/i.test(text);
  for (const text of ['github.com', '127.0.0.1:56234/beta', 'localhost', 'https://x']) assert.ok(urlish(text), text);
  for (const text of ['gith', 'best pizza', 'aux browser']) assert.ok(!urlish(text), text);
});
