import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { transformProvidedSettingsImportCopy } from './provided-settings-import-copy.mjs';

test('only the two pinned import descriptions change; supplied dialogs/actions remain intact', () => {
  const source = readFileSync('/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/agent/assets/general-3dgRbrRk.js', 'utf8');
  const pins = JSON.parse(readFileSync(new URL('../../docs/integration/proposed/native-supplied-settings-links/source-evidence.json', import.meta.url)));
  assert.equal(createHash('sha256').update(source).digest('hex'), pins.files.find(row => row.path === 'assets/general-3dgRbrRk.js').sha256);
  const input = { component: 'agent', path: 'assets/general-3dgRbrRk.js', text: source };
  const result = transformProvidedSettingsImportCopy(input);
  assert.equal(result.anchors.length, 2);
  assert.equal(result.anchors[0].count, 2);
  const anchor = result.anchors[0];
  assert.equal([...result.anchors].reverse().reduce((text, row) => text.split(row.replace).join(row.find), result.text), source);
  assert.equal(transformProvidedSettingsImportCopy({ ...input, component: 'vault' }).text, source);
  assert.throws(() => transformProvidedSettingsImportCopy({ ...input, text: result.text }));
  assert.throws(() => transformProvidedSettingsImportCopy({ ...input, text: source.replace(anchor.find, 'changed') }));
});
