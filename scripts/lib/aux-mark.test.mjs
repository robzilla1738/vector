import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import { readAuxMark, auxMarkReactChildren, auxMarkSvg } from './aux-mark.mjs';

test('canonical supplied SVG remains byte-exact and both React paths retain group/clip geometry', async () => {
  const mark = await readAuxMark();
  assert.equal(
    createHash('sha256').update(mark.svg).digest('hex'),
    '45ba4f1d823cab3085cad8902fd17420ff5a9a5ac3139b180bfc0902875f515c',
  );
  assert.equal(
    await readFile(
      new URL('../../assets/brand/aux-mark-white.svg', import.meta.url),
      'utf8',
    ),
    mark.svg,
  );
  const jsx = (type, props) => ({ type, props });
  const tree = vm.runInNewContext(auxMarkReactChildren('C', mark), {
    C: { jsx, jsxs: jsx },
  });
  assert.equal(tree.length, 2);
  assert.equal(tree[0].type, 'defs');
  assert.equal(tree[1].type, 'g');
  assert.equal(tree[1].props.transform, 'scale(12.8)');
  assert.equal(tree[1].props.clipPath, `url(#${mark.clipId})`);
  assert.equal(tree[1].props.children.length, 2);
  assert.deepEqual(
    Array.from(tree[1].props.children, (path) => path.props.d),
    mark.paths,
  );
  assert.equal(tree[0].props.children.props.children.props.width, 80);
  assert.equal(tree[0].props.children.props.children.props.height, 80);
  for (const color of ['#fff', '#0A0A0A']) {
    const svg = auxMarkSvg(mark, color, 0.16);
    assert.ok(svg.includes('width="64" height="64"'));
    assert.ok(svg.includes('viewBox="0 0 1024 1024"'));
    for (const path of mark.paths) assert.ok(svg.includes(`d="${path}"`));
    assert.ok(svg.includes('transform="scale(12.8)"'));
  }
});
