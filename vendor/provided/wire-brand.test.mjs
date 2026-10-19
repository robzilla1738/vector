import { test } from 'node:test';
import assert from 'node:assert/strict';
import { brandProductPreservingWires } from './wire-brand.mjs';
const wireCounts = { 'AsideDaemonSessionToken ': 1, AsideSessionToken: 0,
  'Aside Daemon Auth v1': 1, 'Aside Daemon Dev Auth v1': 0, 'Aside.': 2 };
test('wire branding is count-pinned, replayable and preserves full methods and dispatch prefix', () => {
  const source = 'Aside UI; AsideDaemonSessionToken ; Aside Daemon Auth v1; `Aside.getTabs`; startsWith(`Aside.`)';
  const result = brandProductPreservingWires(source, { productCount: 5, wireCounts });
  assert.equal(result.code, source.replace('Aside UI', 'Aux UI'));
  let replay = source;
  for (const e of result.edits) replay = replay.split(e.find).join(e.replace);
  assert.equal(replay, result.code);
  assert.throws(() => brandProductPreservingWires(source, { productCount: 4, wireCounts }), /count drift/);
  assert.throws(() => brandProductPreservingWires(source, { productCount: 5, wireCounts: { ...wireCounts, 'Aside.': 1 } }), /expected 1/);
});
