// Host-only: the command bar edits against the sealed candidate's real palette chunk.
import {requireInput} from '../../../scripts/lib/inputs.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {CHUNK, EDITS, integrateCommandBar} from './integration.mjs';

const palette = `${requireInput('candidateApp')}/Contents/Resources/aux/apps/extension/dist/${CHUNK}`;

test('the palette takes every command bar edit once and refuses a second pass', () => {
  const after = integrateCommandBar(readFileSync(palette, 'utf8'));
  for (const rule of EDITS) assert.ok(after.includes(rule.replace), rule.name);
  assert.throws(() => integrateCommandBar(after), /already/);
});

test('words search, addresses open', () => {
  const urlish = text => /^\S+$/.test(text) && /[.:/]|^localhost$/i.test(text);
  for (const text of ['github.com', '127.0.0.1:56234/beta', 'localhost', 'https://x']) assert.ok(urlish(text), text);
  for (const text of ['gith', 'best pizza', 'aux browser']) assert.ok(!urlish(text), text);
});
