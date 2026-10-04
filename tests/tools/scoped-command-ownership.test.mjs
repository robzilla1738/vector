import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
const root = new URL('../../', import.meta.url);
const require = createRequire(import.meta.url);
const { transformSync } = createRequire(require.resolve('vite'))('esbuild');
const read = path => readFileSync(new URL(path, root), 'utf8');
function registry(path) {
  const module = { exports: {} };
  runInNewContext(transformSync(read(path), { loader: 'ts', format: 'cjs' }).code, { module, exports: module.exports });
  return JSON.parse(JSON.stringify(module.exports));
}
test('authoritative scoped routing preserves every original command and original exact admission set', () => {
  const before = registry('docs/source-audits/scoped-registry-ownership/original-commands.ts');
  const after = registry('packages/contracts/src/commands.ts');
  const original = JSON.parse(read('docs/source-audits/scoped-registry-ownership/original-scoped-ids.json'));
  assert.equal(original.length, 178);
  const originalIds = new Set(before.COMMANDS.map(row => row.id));
  assert.deepEqual(after.SCOPED_COMMANDS.filter(row => originalIds.has(row.id)).map(row => row.id).sort(), original.toSorted());
  assert.deepEqual(after.COMMANDS.filter(row => originalIds.has(row.id)).map(({ dispatch, ...row }) => row), before.COMMANDS);
  for (const row of after.SCOPED_COMMANDS) assert.equal(row.handler, 'shell');
  assert.deepEqual(after.COMMANDS.filter(row => row.dispatch && originalIds.has(row.id)).map(row => row.id).sort(), original.toSorted());
});
test('the original scoped resolver and every unscoped handler remain verbatim', () => {
  const before = read('docs/source-audits/scoped-registry-ownership/original-dispatch.ts');
  const after = read('apps/shell/src/commands.ts');
  const start = before.indexOf('  ...scopedControls(\n');
  const end = before.indexOf('\n  ),', start) + '\n  ),'.length;
  const binding = '  ...Object.fromEntries(SCOPED_COMMANDS.map(({ id }) => [id, (_state: StoreState, context: CommandContext) => invokeScopedControl(id, context)])) as Record<(typeof SCOPED_COMMANDS)[number]["id"], CommandAction>,';
  let expected = before.slice(0, start) + binding + before.slice(end);
  expected = expected.replace('  COMMANDS,', '  COMMANDS,\n  SCOPED_COMMANDS,');
  const helper = expected.indexOf('const scopedControls =');
  const next = expected.indexOf('\nconst defaultSwitcher', helper);
  expected = expected.slice(0, helper) + expected.slice(next + 1);
  assert.equal(after, expected);
});
