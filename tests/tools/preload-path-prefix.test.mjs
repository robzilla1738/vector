import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtempSync, writeFileSync, rmSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';
import { factorPreloadPathPrefix, preloadPathPrefix } from '../../scripts/preload-path-prefix.mjs';
const require = createRequire(new URL('../../apps/shell/package.json', import.meta.url));
const viteRequire = createRequire(require.resolve('vite/package.json'));
const { parseAst } = await import(pathToFileURL(viteRequire.resolve('rollup/parseAst')));
const { build } = await import(pathToFileURL(require.resolve('vite')));
const helper = urls => `const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=${JSON.stringify(urls)})))=>i.map(i=>d[i]);`;
const urls = Array.from({ length: 16 }, (_, i) => `assets/Original-${i}.${i % 3 ? 'js' : 'css'}`);
const evaluate = code => new Function(code + ';return __vite__mapDeps;')();
test('exact original cached URLs/order/indices, mutable cache identity and failure behavior are retained', () => {
  const original = helper(urls); const result = factorPreloadPathPrefix(original, parseAst);
  assert.ok(result.savedBytes > 0); assert.deepEqual(result.urls, urls);
  const a = evaluate(original), b = evaluate(result.code);
  assert.deepEqual(b([15, 2, 0, 2, 99]), a([15, 2, 0, 2, 99]));
  const ac = a.f, bc = b.f; a.f[0] = b.f[0] = 'Original changed cache';
  assert.deepEqual(b([0, 1]), a([0, 1])); assert.equal(a.f, ac); assert.equal(b.f, bc);
  assert.throws(() => a(null), TypeError); assert.throws(() => b(null), TypeError);
});
test('explicit original cache getter and original index map effects occur in the same order', () => {
  const original = helper(urls); const transformed = factorPreloadPathPrefix(original, parseAst).code;
  function observed(code) {
    const events = []; const cache = { get 0() { events.push('entry'); return 'actual'; } };
    const owner = { get f() { events.push('cache'); return cache; } };
    const input = { map(callback) { events.push('map'); return callback(0); } };
    const value = evaluate(code)(input, owner); return { value, events };
  }
  assert.deepEqual(observed(transformed), observed(original));
});
test('fresh lexical name preserves preceding effects and refuses foreign/dynamic/changed helpers', () => {
  const original = 'const $a=7;' + helper(urls);
  const transformed = factorPreloadPathPrefix(original, parseAst);
  assert.ok(transformed.code.includes('const $b="assets/"')); assert.equal(new Function(transformed.code + ';return $a;')(), 7);
  for (const code of [helper(['other/foreign.js', ...urls]), helper(urls).replace('i.map(i=>d[i])', 'i.map(i=>d[i]+"foreign")'), helper(urls).replace(JSON.stringify(urls), '["assets/A.js",getForeign()]'), helper(urls).replace('m.f=', 'm.foreign='), 'const other=' + JSON.stringify(urls)]) assert.equal(factorPreloadPathPrefix(code, parseAst), null);
});
test('source maps and nonchunk assets are left untouched', () => {
  const code = helper(urls); const chunk = { type: 'chunk', code, map: {} }; const asset = { type: 'asset', source: code };
  preloadPathPrefix().generateBundle.handler.call({ parse: parseAst }, {}, { chunk, asset });
  assert.equal(chunk.code, code); assert.equal(asset.source, code);
});
test('actual installed Vite output retains every preload URL and import/dynamic edge under supported post hook', async () => {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'aux-preload-path-controls-')));
  const before = new Map(), after = new Map();
  const capture = (name, into) => ({ name, generateBundle: { order: 'post', handler(_options, bundle) {
    for (const [file, item] of Object.entries(bundle)) if (item.type === 'chunk') into.set(file, { code: item.code, imports: item.imports, dynamicImports: item.dynamicImports, referencedFiles: item.referencedFiles });
  } } });
  try {
    writeFileSync(join(root, 'index.html'), '<script type="module" src="/main.js"></script>');
    writeFileSync(join(root, 'main.js'), Array.from({length: 16}, (_, i) => `globalThis.load${i}=()=>import('./part${i}.js');`).join('\n'));
    for (let i = 0; i < 16; i++) { writeFileSync(join(root, `part${i}.js`), `import './part${i}.css';export const value=${i};`); writeFileSync(join(root, `part${i}.css`), `.part${i}{color:rgb(${i},0,0)}`); }
    await build({ root, configFile: false, logLevel: 'silent', plugins: [capture('before', before), preloadPathPrefix(), capture('after', after)], build: { write: false, target: 'chrome154', minify: true, sourcemap: false } });
    assert.deepEqual([...after.keys()], [...before.keys()]); let changed = 0;
    for (const [file, item] of before) {
      const result = after.get(file); assert.deepEqual([result.imports,result.dynamicImports,result.referencedFiles], [item.imports,item.dynamicImports,item.referencedFiles]);
      const expected = factorPreloadPathPrefix(item.code, parseAst);
      assert.equal(result.code, expected?.code ?? item.code);
      if (expected) { changed++; const parse = code => { const ast = parseAst(code); return ast.body.find(n => n.type === 'VariableDeclaration' && n.declarations[0]?.id.name === '__vite__mapDeps'); };
        const original = parse(item.code); const updated = parse(result.code); const prefix = result.code.slice(0, updated.start);
        const a = evaluate(item.code.slice(original.start, original.end)); const b = evaluate(prefix + result.code.slice(updated.start, updated.end));
        assert.deepEqual(b(expected.urls.map((_, i) => i)), a(expected.urls.map((_, i) => i)));
      }
    }
    assert.ok(changed > 0);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
