// Synthetic actual-format generated metadata; never native GRIT/build evidence.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readShellResourceIndex } from './lib/shell-resource-index.mjs';
function fixture() {
  const values = Array.from({ length: 175 }, (_, index) => ({ name: `IDR_AUX_ASSET_${index}`, path: `asset-${index}.js`, id: index + 1 }));
  return { grd: '<grit><includes>\n' + values.map(v => `<include name="${v.name}" file="/controlled/${v.path}" resource_path="${v.path}" use_base_dir="false" type="chrome_html" />`).join('\n') + '\n</includes></grit>',
    header: values.map(v => `#define ${v.name} ${v.id}`).join('\n'),
    map: 'const webui::ResourcePath kAuxResources[175] = {\n' + values.map(v => `  {"${v.path}", ${v.name}},`).join('\n') + '\n};\n' };
}
test('original generated include/header/map bijection retains actual chrome_html attributes and IDs', () => {
  const f = fixture(), rows = readShellResourceIndex(f.grd, f.header, f.map);
  assert.equal(rows.length, 175); assert.equal(rows[0].resourceId, 1);
  assert.equal(rows[0].selectedInclude.type, 'chrome_html'); assert.equal(rows[0].selectedInclude.compress, 'default');
  assert.equal(rows[0].selectedInclude.use_base_dir, 'false'); assert.equal(Object.isFrozen(rows[0].selectedInclude), true);
});
test('conditional, duplicate, partial, unknown and contradictory generated metadata refuse', () => {
  for (const change of [f => { f.grd = f.grd.replace('chrome_html', 'unknown'); },
    f => { f.grd = '<!DOCTYPE owned>' + f.grd; }, f => { f.grd = '<if expr="true">' + f.grd; },
    f => { f.header = f.header.replace('#define IDR_AUX_ASSET_1 2', '#define IDR_AUX_ASSET_1 1'); },
    f => { f.map = f.map.replace('"asset-0.js"', '"foreign.js"'); },
    f => { f.grd = f.grd.replace('name="IDR_AUX_ASSET_0"', 'name="IDR_AUX_ASSET_0" name="IDR_AUX_ASSET_0"'); },
    f => { f.map = f.map.replace('IDR_AUX_ASSET_0},', 'IDR_AUX_ASSET_0, "/unexpected"},'); },
    f => { f.header = f.header.replace('#define IDR_AUX_ASSET_0 1', ''); }]) {
    const f = fixture(); change(f); assert.throws(() => readShellResourceIndex(f.grd, f.header, f.map));
  }
});
