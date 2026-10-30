// Host-only: each Aux-owned component against the sealed chunk it replaces. Both chunks run in one
// stub world; every export renders under the same props and scenes, and what it renders, what its
// effects and handlers do, and which stubs it calls must match. The supplied side has only the
// listed corner changes applied, inside the replaced blocks.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {requireInput} from '../../scripts/lib/inputs.mjs';
import {COMPONENTS, CORNER_CHANGES, GLOBALS_CSS, integrateComponents, integrateStyles, locateBlocks, readComponent} from './integration.mjs';
import {createWorld} from './render-harness.mjs';

const dist = `${requireInput('candidateApp')}/Contents/Resources/aux/apps/extension/dist`;

/** The sealed chunk with only the intended corner changes, made inside the replaced blocks. */
function expected(chunk, sealed) {
  const blocks = COMPONENTS[chunk];
  let output = '';
  let cursor = 0;
  locateBlocks(sealed, blocks, chunk).forEach(([at, stop], index) => {
    let text = sealed.slice(at, stop);
    for (const [file, from, to] of CORNER_CHANGES)
      if (file === blocks[index].file) text = text.replace(new RegExp(`(?<![\\w-])${from}(?![\\w-])`, 'g'), to);
    output += sealed.slice(cursor, at) + text;
    cursor = stop;
  });
  return output + sealed.slice(cursor);
}

// Module-scope names an Aux source binds: `var`/`function` at the margin and `var`-list entries.
const moduleNames = source => [...source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
  .matchAll(/^(?:(?:var|function)\s+([A-Za-z_$][\w$]*)|(?: {2})?([A-Za-z_$][\w$]*)\s*=(?![=>]))/gm)].map(match => match[1] ?? match[2]);

test('every Aux-owned component renders, runs its effects and handles events like the one it replaces', async () => {
  const world = createWorld();
  // Callbacks are stubs, so every call a handler or effect makes to them is logged and compared.
  const spies = Object.fromEntries(['onClick', 'onCheckedChange', 'onOpenChange', 'onNarrowMorphHeightChange', 'onPointerDown', 'onPointerMove',
    'onPointerUp', 'onPointerCancel', 'onValueChange'].map(name => [name, world.stub(`spy:${name}`)]));
  const PROPS = [
    {},
    {className: 'probe', children: 'child'},
    {className: 'probe', variant: 'outline', size: 'sm', shape: 'pill', disabled: true, checked: true, showCloseButton: false, orientation: 'vertical',
      effect: false, inset: true, side: 'left', align: 'end', sideOffset: 2, narrowMorph: false, unstyled: true, open: true, forceNarrow: true,
      travel: true, placeholder: 'Pick', delay: 300, alignItemWithTrigger: false, overlayClassName: 'overlay', type: 'email', value: 'v', ...spies},
    {variant: 'destructive', size: 'icon-xs', checked: false, open: false, narrowMorphScale: false, align: 'inline-end', children: ['a', 'b'], ...spies},
  ];
  const scenes = [
    {},
    {context: {isNarrow: true, narrowMorph: true, narrowMorphPhase: 'active', narrowRootHeight: 120, narrowRootScale: 0.96, isOpen: true,
      popupRef: {current: world.stub('popup')}, triggerRef: {current: world.stub('trigger')}, triggerPresentation: {children: 'Sub', className: 'sub', inset: true},
      setNarrowRootHeights: world.stub('setNarrowRootHeights'), activateNarrowSubmenu: world.stub('activate'), deactivateNarrowSubmenu: world.stub('deactivate'),
      completeNarrowSubmenuExit: world.stub('complete'), setTriggerPresentation: world.stub('setTriggerPresentation')},
     state: 20, renderState: {checked: true, activeTabPosition: {left: 4, top: 2}, activeTabSize: {width: 40, height: 20}}},
    {context: {isNarrow: false, narrowMorphPhase: 'exiting', isOpen: false}, renderState: {checked: false}},
  ];
  let compared = 0;
  for (const chunk of Object.keys(COMPONENTS)) {
    const sealed = readFileSync(`${dist}/${chunk}`, 'utf8');
    const supplied = await world.evaluate(expected(chunk, sealed), `supplied:${chunk}`);
    const ours = await world.evaluate(integrateComponents(chunk, sealed), `aux:${chunk}`);
    assert.deepEqual(Object.keys(ours).sort(), Object.keys(supplied).sort(), chunk);
    // The exports the Aux blocks define. The chunk's other exports are its unchanged text; calling
    // them under stubs only starts async work the stubs cannot finish.
    const local = Object.fromEntries([...sealed.matchAll(/export\{([^}]*)\}/g)].flatMap(([, list]) =>
      list.split(',').map(entry => entry.split(' as ').map(part => part.trim()).reverse())));
    const owned = new Set(COMPONENTS[chunk].flatMap(({file}) => moduleNames(readComponent(file))));
    for (const name of Object.keys(supplied)) {
      const [a, b] = [supplied[name], ours[name]];
      if (!owned.has(local[name]) || typeof a !== 'function' && !a?.$forwardRef) { assert.equal(typeof b, typeof a, `${chunk} ${name}`); continue; }
      for (const props of PROPS) for (const scene of scenes) {
        const [actual, wanted] = [JSON.stringify(world.render(b, props, scene)), JSON.stringify(world.render(a, props, scene))];
        if (actual !== wanted) {
          let at = 0;
          while (actual[at] === wanted[at]) at++;
          assert.fail(`${chunk} export ${name}: differs at ${at}\n  supplied: …${wanted.slice(Math.max(0, at - 200), at + 200)}\n  aux:      …${actual.slice(Math.max(0, at - 200), at + 200)}`);
        }
        compared++;
      }
    }
  }
  assert.ok(compared > 800, `compared ${compared} renders`);
});

test('the components replace their blocks once and refuse a second pass', () => {
  for (const [chunk, blocks] of Object.entries(COMPONENTS)) {
    const after = integrateComponents(chunk, readFileSync(`${dist}/${chunk}`, 'utf8'));
    for (const {file} of blocks) assert.equal(after.split(readComponent(file)).length - 1, 1, file);
    assert.throws(() => integrateComponents(chunk, after), /drift/);
  }
});

test('the module-scope names the Aux sources bind are free in the rest of their chunks', () => {
  for (const [chunk, blocks] of Object.entries(COMPONENTS)) {
    const sealed = readFileSync(`${dist}/${chunk}`, 'utf8');
    let rest = '';
    let cursor = 0;
    for (const [at, stop] of locateBlocks(sealed, blocks, chunk)) { rest += `${sealed.slice(cursor, at)} `; cursor = stop; }
    rest += sealed.slice(cursor);
    // Names the rest of the chunk binds itself (its own declarations, not uses).
    const bound = name => new RegExp(`(?:^|[;,{(\\s])(?:var|let|const|function|class)?\\s*${name.replace(/\$/g, '\\$')}\\s*=|function\\s+${name.replace(/\$/g, '\\$')}\\b`).test(rest);
    const exported = new Set([...rest.matchAll(/export\{([^}]*)\}/g)].flatMap(([, list]) => list.split(',').map(entry => entry.split(' as ')[0].trim())));
    for (const {file} of blocks)
      for (const name of new Set(moduleNames(readComponent(file))))
        if (!exported.has(name)) assert.ok(!bound(name), `${file}: ${name} is already bound in ${chunk}`);
  }
});

test('every class the corner changes introduce is compiled in the shipped globals CSS', () => {
  const css = integrateStyles(readFileSync(`${dist}/${GLOBALS_CSS}`, 'utf8'));
  for (const [file, , to] of CORNER_CHANGES) {
    assert.ok(new RegExp(`\\.${to}(?:\\s*\\{|,)`).test(css), `${file}: .${to} is not compiled`);
    assert.ok(readComponent(file).includes(to), `${file} uses ${to}`);
  }
});
