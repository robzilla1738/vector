import assert from 'node:assert/strict';
/** Closed generated Aux GRD/header/map format from generate_grd.py and
 * resource_map.py. Unsupported conditional/custom GRIT forms refuse. */
export function readShellResourceIndex(grd, header, map) {
  for (const text of [grd, header, map]) assert.ok(typeof text === 'string' && Buffer.byteLength(text) <= 4 * 1024 * 1024);
  assert.ok(!/<!DOCTYPE|<!ENTITY|<if\b|<part\b/.test(grd), 'Unsupported selected GRIT structure');
  const includes = [...grd.matchAll(/<include\s+([^<>]*)\/>/g)];
  assert.equal(includes.length, 175, 'Incomplete original Aux include set');
  assert.equal((grd.match(/<include\b/g) ?? []).length, includes.length, 'Unsupported non-self-closing include');
  const ids = new Map();
  for (const match of header.matchAll(/^#define (IDR_AUX_[A-Z0-9_]+) ([0-9]+)\s*$/gm)) {
    assert.ok(!ids.has(match[1]), 'Duplicate generated resource name');
    const id = Number(match[2]); assert.ok(id > 0 && id <= 65535); ids.set(match[1], id);
  }
  assert.equal(ids.size, 175, 'Incomplete original Aux generated header');
  assert.equal((header.match(/^#define\s+IDR_AUX_\S+/gm) ?? []).length, ids.size, 'Unsupported generated header expression');
  assert.equal(new Set(ids.values()).size, 175, 'Duplicate generated resource ID');
  const bodies = [...map.matchAll(/const webui::ResourcePath kAuxResources\[175\] = \{([^]*?)\};/g)];
  assert.equal(bodies.length, 1, 'Missing unique original Aux resource map');
  const paths = new Map();
  const remaining = bodies[0][1].replace(/\{"([^"\\]*)", (IDR_AUX_[A-Z0-9_]+)\},/g, (_, path, name) => {
    assert.ok(!paths.has(path) && ids.has(name), 'Duplicate or foreign original resource mapping'); paths.set(path, name); return '';
  });
  assert.equal(remaining.trim(), '', 'Unsupported generated resource map rows');
  assert.equal(paths.size, 175, 'Incomplete original resource map');
  const rows = [], names = new Set(), seen = new Set();
  for (const match of includes) {
    const selected = { compress: 'default', flattenhtml: 'false', preprocess: 'false', allowexternalscript: 'false', use_base_dir: 'true' };
    const attributes = new Set(), rawAttributes = {};
    const rest = match[1].replace(/([a-z_]+)="([^"<>]*)"/g, (_, key, value) => {
      assert.ok(!attributes.has(key) && ['name', 'file', 'resource_path', 'type', ...Object.keys(selected)].includes(key), 'Unsupported original include attribute');
      assert.ok(!value.includes('&'), 'Unsupported escaped original include attribute');
      attributes.add(key); rawAttributes[key] = value; selected[key] = value; return '';
    });
    assert.equal(rest.trim(), '', 'Malformed original include attributes');
    for (const key of ['name', 'file', 'resource_path', 'type']) assert.ok(selected[key], 'Missing original include attribute');
    assert.ok(['BINDATA', 'chrome_html'].includes(selected.type), 'Unknown original GRIT node type');
    assert.equal(paths.get(selected.resource_path), selected.name, 'Original include/header/map disagreement');
    assert.ok(!seen.has(selected.resource_path) && !names.has(selected.name), 'Duplicate original include');
    seen.add(selected.resource_path); names.add(selected.name);
    rows.push(Object.freeze({ resourcePath: selected.resource_path, resourceName: selected.name,
      resourceId: ids.get(selected.name), element: 'include', rawAttributes: Object.freeze(rawAttributes), selectedInclude: Object.freeze(selected) }));
  }
  assert.equal(names.size, ids.size);
  return Object.freeze(rows);
}
