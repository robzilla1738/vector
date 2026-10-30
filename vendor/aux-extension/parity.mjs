// Test helper: render parity between supplied chunks and the chunks with Aux-owned blocks in them.
// Both run in one stub world (render-harness.mjs); every export an Aux block defines renders under
// the same props and scenes, and what it renders, what its effects and handlers do, and which stubs
// it calls must match. The supplied side gets only the listed class changes, inside the blocks.
import assert from 'node:assert/strict';
import {BEHAVIOR_CHANGES, REWRITTEN, locateBlocks, readRoute} from './integration.mjs';
import {createWorld} from './render-harness.mjs';
export {createWorld};

/** One named behavior change made to a supplied block; it has to match exactly once. */
function applyBehavior(block, {name, find, replace}) {
  const [first, last] = Array.isArray(find) ? find : [find, find];
  const at = block.indexOf(first);
  if (at < 0 || block.indexOf(first, at + 1) >= 0) throw Error(`Behavior change "${name}" no longer matches the supplied block`);
  const stop = block.indexOf(last, at);
  if (stop < 0) throw Error(`Behavior change "${name}" has no end in the supplied block`);
  return block.slice(0, at) + replace + block.slice(stop + last.length);
}

/** `text` with only the intended class and behavior changes made, inside the replaced blocks. */
export function expectedText(text, blocks, changes, label) {
  let output = '';
  let cursor = 0;
  locateBlocks(text, blocks, label).forEach(([at, stop], index) => {
    if (REWRITTEN.includes(blocks[index].file)) {
      output += text.slice(cursor, at) + readRoute(blocks[index].file);
      cursor = stop;
      return;
    }
    let block = BEHAVIOR_CHANGES.filter(({file}) => file === blocks[index].file).reduce(applyBehavior, text.slice(at, stop));
    for (const [file, from, to] of changes)
      if (file === blocks[index].file) block = block.replace(new RegExp(`(?<![\\w-])${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w-])`, 'g'), to);
    output += text.slice(cursor, at) + block;
    cursor = stop;
  });
  return output + text.slice(cursor);
}

/** Module-scope names an Aux source binds: `var`/`function` at the margin and `var`-list entries. */
export const moduleNames = source => [...source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
  .matchAll(/^(?:(?:var|(?:async\s+)?function)\s+([A-Za-z_$][\w$]*)|(?: {2})?([A-Za-z_$][\w$]*)\s*=(?![=>]))/gm)].map(match => match[1] ?? match[2]);

/** Names an Aux block keeps from the supplied block it replaces (so both chunks bind them). */
function keptNames(text, blocks, read, label) {
  return locateBlocks(text, blocks, label).flatMap(([at, stop], index) => {
    const supplied = new Set([...text.slice(at, stop).matchAll(/(?:^|[;,]|\bvar\s)\s*(?:var\s+)?([\w$]+)=(?!=)|function\s+([\w$]+)\(/g)].map(match => match[1] ?? match[2]));
    return moduleNames(read(blocks[index].file)).filter(name => supplied.has(name));
  });
}

/** Both versions of a chunk evaluated in `world`. Internal components both keep by name are
 * exported too (__kept_<name>), and so are the bindings an Aux block renamed, in pairs (__pair_<Aux name>). */
export async function evaluatePair({world, chunk, text, blocks, integrate, read, changes, renamed = () => ({})}) {
  const kept = [...new Set(keptNames(text, blocks, read, chunk))];
  const pairs = Object.entries(renamed(chunk));
  const rewritten = blocks.some(({file}) => REWRITTEN.includes(file));
  const exposed = (source, side) => `${source}\nexport {${[...kept.map(name => `${name} as __kept_${name}`),
    ...pairs.map(([before, after]) => `${side === 'supplied' && !rewritten ? before : after} as __pair_${after}`)].join(',')}};`;
  const supplied = await world.evaluate(exposed(expectedText(text, blocks, changes, chunk), 'supplied'), `supplied:${chunk}`);
  const ours = await world.evaluate(exposed(integrate(chunk, text), 'aux'), `aux:${chunk}`);
  return {supplied, ours, kept, pairs};
}

/** `defaults: false` renders only the given props and scenes: fixtures that need each other (a queue's
 * real text and its real attachments) are not crossed with the stub-only defaults. */
export async function assertParity({blocksByChunk, textOf, integrate, read, changes, minimum, scenes: extraScenes = [], props: extraProps = [], renamed = () => ({}),
  defaults = true}) {
  const world = createWorld();
  // Callbacks are stubs, so every call a handler or effect makes to them is logged and compared.
  const spies = Object.fromEntries(['onClick', 'onCheckedChange', 'onOpenChange', 'onNarrowMorphHeightChange', 'onPointerDown', 'onPointerMove',
    'onPointerUp', 'onPointerCancel', 'onValueChange', 'onSessionChange', 'onQueryChange', 'onKeyDown', 'onActivate', 'onSelect', 'onInputChange',
    'onOmniboxModeChange', 'onResolve', 'onSubmit', 'onCancel'].map(name => [name, world.stub(`spy:${name}`)]));
  // Callbacks a component awaits without catching (a prompt's onResolve or onSubmit) are always given:
  // without them its handlers only reject after the test ends.
  const awaited = {onResolve: spies.onResolve, onSubmit: spies.onSubmit, onCancel: spies.onCancel};
  const PROPS = [
    {...awaited},
    {className: 'probe', children: 'child', ...awaited},
    {className: 'probe', variant: 'outline', size: 'sm', shape: 'pill', disabled: true, checked: true, showCloseButton: false, orientation: 'vertical',
      effect: false, inset: true, side: 'left', align: 'end', sideOffset: 2, narrowMorph: false, unstyled: true, open: true, forceNarrow: true,
      travel: true, placeholder: 'Pick', delay: 300, alignItemWithTrigger: false, overlayClassName: 'overlay', type: 'email', value: 'v',
      accountId: 7, sessionId: 'session-1', title: 'Title', label: 'Label', description: 'Says what it does', badge: 'New', id: 'section',
      illustration: {src: '/a.png', alt: 'A'}, initialInput: 'hello', mode: 'ask', omniboxMode: 'search', query: 'mem', hasQuery: true,
      results: [{id: 'r1', title: 'Memory', breadcrumb: 'Agent', path: '/u/$userId/settings/memories', kind: 'section'}], selectedIndex: 0, index: 0,
      item: {label: 'Memory', icon: world.stub('icon'), activeIcon: world.stub('activeIcon'), href: '/u/$userId/settings/memories', badge: 'New', exact: false,
        children: [{label: 'Overview', icon: world.stub('icon2'), href: '/u/$userId/settings/memories/files', promoteWhenCollapsed: true}]},
      link: {label: 'Extensions', icon: world.stub('puzzle'), kind: 'chrome', to: 'chrome://extensions'}, draftScopeKey: 'tab:1', forcedMode: null, ...spies},
    {variant: 'destructive', size: 'icon-xs', checked: false, open: false, narrowMorphScale: false, align: 'inline-end', children: ['a', 'b'],
      accountId: 0, title: world.stub('node'), isExpanded: true, submenu: [{label: 'History', icon: world.stub('icon3'), href: '/h', badge: 'New'}],
      item: {label: 'General', icon: world.stub('icon4'), href: '/u/$userId/settings/general'}, results: [], query: '', hasQuery: false,
      link: {label: 'Docs', icon: world.stub('doc'), kind: 'web', to: 'https://example.com'}, ...spies},
  ];
  const scenes = [
    {},
    {context: {isNarrow: true, narrowMorph: true, narrowMorphPhase: 'active', narrowRootHeight: 120, narrowRootScale: 0.96, isOpen: true,
      popupRef: {current: world.stub('popup')}, triggerRef: {current: world.stub('trigger')}, triggerPresentation: {children: 'Sub', className: 'sub', inset: true},
      setNarrowRootHeights: world.stub('setNarrowRootHeights'), activateNarrowSubmenu: world.stub('activate'), deactivateNarrowSubmenu: world.stub('deactivate'),
      completeNarrowSubmenuExit: world.stub('complete'), setTriggerPresentation: world.stub('setTriggerPresentation'),
      accountId: 7, browserMode: 'default', omniboxMode: 'ask', setAccountId: world.stub('setAccountId'), setOmniboxMode: world.stub('setOmniboxMode')},
     state: 20, renderState: {checked: true, activeTabPosition: {left: 4, top: 2}, activeTabSize: {width: 40, height: 20}}},
    {context: {isNarrow: false, narrowMorphPhase: 'exiting', isOpen: false, accountId: null, browserMode: 'incognito', mode: 'incognito'},
     state: '', renderState: {checked: false}},
    // Settings search with a query and a selection; other components read these as their own state.
    {context: {accountId: 7, mode: 'default'}, state: ['mem', 1, true, null], renderState: {checked: true}},
  ];
  if (!defaults) PROPS.length = scenes.length = 0;
  scenes.push(...extraScenes.map(scene => (typeof scene === 'function' ? scene(world) : scene)));
  PROPS.push(...extraProps.map(props => ({...(typeof props === 'function' ? props(world) : props), ...spies})));
  let compared = 0;
  for (const [chunk, blocks] of Object.entries(blocksByChunk)) {
    const text = textOf(chunk);
    // Internal components both versions keep by name are exported too, so they render on their own.
    const {supplied, ours, kept, pairs} = await evaluatePair({world, chunk, text, blocks, integrate, read, changes, renamed});
    assert.deepEqual(Object.keys(ours).sort(), Object.keys(supplied).sort(), chunk);
    // The exports the Aux blocks define. The chunk's other exports are its unchanged text; calling
    // them under stubs only starts async work the stubs cannot finish.
    const local = Object.fromEntries([...text.matchAll(/export\{([^}]*)\}/g)].flatMap(([, list]) =>
      list.split(',').map(entry => entry.split(' as ').map(part => part.trim()).reverse())));
    const owned = new Set(blocks.flatMap(({file}) => moduleNames(read(file))));
    for (const name of kept) local[`__kept_${name}`] = name;
    for (const [, after] of pairs) local[`__pair_${after}`] = after;
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
  assert.ok(compared >= minimum, `compared ${compared} renders`);
  return {compared, world};
}

/** Module-scope names each Aux block binds are not declared again in the rest of its chunk, nor in another of its blocks. */
export function assertFreeNames({blocksByChunk, textOf, read}) {
  for (const [chunk, blocks] of Object.entries(blocksByChunk)) {
    const text = textOf(chunk);
    let rest = '';
    let cursor = 0;
    for (const [at, stop] of locateBlocks(text, blocks, chunk)) { rest += `${text.slice(cursor, at)} `; cursor = stop; }
    rest += text.slice(cursor);
    const bound = name => new RegExp(`(?:^|[;,{(\\s])(?:var|let|const|function|class)?\\s*${name.replace(/\$/g, '\\$')}\\s*=|function\\s+${name.replace(/\$/g, '\\$')}\\b`).test(rest);
    const exported = new Set([...rest.matchAll(/export\{([^}]*)\}/g)].flatMap(([, list]) => list.split(',').map(entry => entry.split(' as ')[0].trim())));
    const owner = new Map();
    for (const {file} of blocks)
      for (const name of new Set(moduleNames(read(file)))) {
        if (!exported.has(name)) assert.ok(!bound(name), `${file}: ${name} is already bound in ${chunk}`);
        assert.ok(!owner.has(name), `${file}: ${name} is also bound in ${owner.get(name)}`);
        owner.set(name, file);
      }
  }
}
