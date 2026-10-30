// Host-only: what the owner's decisions (docs/plans/2026-10-30-owner-requests.md) make Aux do, run
// on the staged chunks rather than read from their source. routes.test.mjs covers likeness to the
// supplied screens; these cover the Aux-owned behavior parity has nothing to say about.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {requireInput} from '../../scripts/lib/inputs.mjs';
import {ROUTES, dropRemovedChunks, integrateRoutes} from './integration.mjs';
import {createWorld} from './parity.mjs';
import {stagedText} from './staged.mjs';

const candidate = requireInput('candidateApp');
const staged = chunk => stagedText(candidate, chunk);
const released = chunk => ROUTES[chunk] ? integrateRoutes(chunk, staged(chunk)) : staged(chunk);
/** A chunk as released, in the harness, with internal names exported too. */
const load = async (world, chunk, names = []) =>
  world.evaluate(`${released(chunk)}\nexport {${names.map(name => `${name} as __${name}`).join(',')}};`, `decisions:${chunk}`);
const text = rendered => JSON.stringify(rendered);
/** Arrays from inside the harness's realm, as plain data. */
const plain = value => JSON.parse(JSON.stringify(value));
const links = rendered => [...new Set(text(rendered).match(/\/onboarding\/[a-z/-]+/g) ?? [])];

/** The balanced `{…}` body of the arrow function that follows `anchor` in `source`, as source. */
function arrow(source, anchor, head) {
  const start = source.indexOf(head, source.indexOf(anchor));
  let at = source.indexOf('{', start + head.length - 1), depth = 0;
  const open = at;
  for (; at < source.length; at++) {
    if (source[at] === '{') depth++;
    else if (source[at] === '}' && !--depth) break;
  }
  return source.slice(start, open) + source.slice(open, at + 1);
}

// ---------------------------------------------------------------------------------- onboarding

const MAIN = 'assets/extension-main-Dz1-AsCT.js';
const redirect = target => ({redirect: target});
/** The onboarding route's guard, run with a daemon we control. */
function onboardingGuard({account, done = false}) {
  const main = staged(MAIN);
  const types = staged('assets/-types-Wy38XkNB.js').match(/function K\(o\)\{.*?\n?\}(?=function |var |const |export)/s)?.[0];
  const guard = new Function('localStorage', `${types};return K`)({getItem: () => (done ? '1' : null)});
  const beforeLoad = arrow(main, 'Qt=n("/_public/onboarding")', 'async({context:e,location:t})=>');
  const daemon = {waits: 0, ready: Promise.resolve()};
  const run = new Function('te', 'Ht', 'S', 'ae', 'c', `let Y=!1;return ${beforeLoad}`)(() => (daemon.waits++, daemon.ready), () => false, {queryOptions: {}}, guard, redirect);
  const context = {queryClient: {query: async () => ({accountId: 7}), fetchQuery: async () => account},
    trpc: {accounts: {get: {queryOptions: () => ({})}, auth: {me: {queryOptions: () => ({})}}}}};
  return {daemon, visit: pathname => run({context, location: {pathname, searchStr: ''}})};
}

test('setup: a new local person goes through every step without being sent back', async () => {
  const {visit} = onboardingGuard({account: {mode: 'local'}});
  for (const path of ['/onboarding/glance', '/onboarding/import-browser', '/onboarding/import-password', '/onboarding/make-it-yours', '/onboarding/ai', '/onboarding/done'])
    assert.equal(await visit(path), undefined, path);
  const fresh = onboardingGuard({account: {mode: 'cloud', onboardingCompletedAt: null}});
  assert.equal(await fresh.visit('/onboarding/import-browser'), undefined, 'a cloud account in setup stays too');
});

test('setup: Run setup again opens after finishing, with no redirect anywhere', async () => {
  const {visit} = onboardingGuard({account: {mode: 'local'}, done: true});
  for (const path of ['/onboarding/glance', '/onboarding/import-browser', '/onboarding/ai']) assert.equal(await visit(path), undefined, path);
  const main = staged(MAIN);
  const due = new Function('localStorage', 'chrome', `${main.match(/function auxOnboardingDue\(\)\{.*?\}catch\{return!1\}\}/)[0]};return auxOnboardingDue`);
  assert.equal(due({getItem: () => '1'}, {extension: {}})(), false, 'Settings doesn’t send a finished person back');
  assert.equal(due({getItem: () => null}, {extension: {}})(), true);
  assert.equal(due({getItem: () => null}, {extension: {inIncognitoContext: true}})(), false);
  const world = createWorld();
  const general = await load(world, 'assets/general-3dgRbrRk.js', ['Gg']);
  assert.match(text(world.render(general.__Gg, {})), /Run setup again/);
  assert.match(readFileSync(new URL('./routes/general-settings.js', import.meta.url), 'utf8'), /main\.html#\/onboarding\/glance/);
});

test('setup: Welcome and Make it yours open before the daemon; the other steps wait inline', async () => {
  const {visit, daemon} = onboardingGuard({account: {mode: 'local'}});
  let release;
  daemon.ready = new Promise(resolve => { release = resolve; });
  assert.equal(await visit('/onboarding/glance'), undefined);
  assert.equal(await visit('/onboarding/make-it-yours'), undefined);
  assert.equal(daemon.waits, 0, 'neither asks the daemon');
  let settled = false;
  const waiting = visit('/onboarding/import-browser').then(() => { settled = true; });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(settled, false, 'Import waits for the daemon');
  release();
  await waiting;
  const main = staged(MAIN);
  for (const route of ['n("/_public/onboarding")({', 'n("/_public/onboarding/import-browser/")({', 'n("/_public/onboarding/ai/")({'])
    assert.ok(main.includes(`${route}pendingMs:0,pendingComponent:auxAgentReady,`), route);
  assert.match(main, /function auxAgentReady\(\).*Getting your agent ready…/);
});

test('setup: each step leads to the next', async () => {
  const world = createWorld();
  const glance = await load(world, 'assets/glance-BfAlmExy.js');
  assert.deepEqual(links(world.render(glance.component, {})), ['/onboarding/import-browser']);
  const yours = world.render(glance.yours, {});
  assert.deepEqual(links(yours).sort(), ['/onboarding/ai', '/onboarding/import-password']);
  assert.match(text(yours), /aux-agent-ui\.js#AuxAgentSetup/, 'the name and look sit in the step');
  const importer = await load(world, 'assets/import-browser-DwQpkFpc.js', ['ImportFooter']);
  assert.deepEqual(links(world.render(importer.__ImportFooter, {})), ['/onboarding/import-password']);
  for (const [chunk, from] of [['assets/import-password-mvM-KsU6.js', '/onboarding/make-it-yours'], ['assets/ai-CzEX5E7S.js', '/onboarding/make-it-yours']])
    assert.ok(staged(chunk).includes(`"${from}"`), chunk);
  const dots = staged('assets/route-CSKkWqf5.js').match(/f=(\[[^\]]*\])/)[1];
  assert.deepEqual(JSON.parse(dots), ['/onboarding/glance', '/onboarding/import-browser', '/onboarding/import-password', '/onboarding/make-it-yours', '/onboarding/ai']);
  const done = readFileSync(new URL('./routes/onboarding-done.js', import.meta.url), 'utf8');
  assert.ok(done.includes("localStorage.setItem('aux.onboarding.completed.v1', '1')") && !done.includes('keepTasksRunning'));
});

test('setup: no plan or credit copy on the way through', () => {
  for (const chunk of ['assets/glance-BfAlmExy.js', 'assets/import-browser-DwQpkFpc.js', 'assets/import-password-mvM-KsU6.js', 'assets/done-DPzI9pFd.js'])
    assert.doesNotMatch(released(chunk), /Upgrade|Add credits|Free plan/, chunk);
});

// -------------------------------------------------------------------------------------- import

const IMPORT = 'assets/import-browser-DwQpkFpc.js';
const IMPORTER = 'assets/use-browser-importer-GNOc7eYC.js';
const chrome = {id: 'chrome', name: 'Google Chrome', supportedDataKinds: ['history', 'bookmarks', 'cookies', 'passwords', 'extensions'], categories: ['bookmarks', 'history', 'searchEngine', 'passwords']};
const firefox = {id: 'firefox', name: 'Firefox', supportedDataKinds: ['history', 'bookmarks', 'cookies'], categories: ['bookmarks', 'history', 'cookies']};
const browserRow = source => ({source, targets: [{kind: 'source', id: source.id, source, alreadyImported: false}], alreadyImported: false, requiresProfileSelection: false});

test('import: what comes over is chosen, passwords say when they can’t, and the search engine is opt-in', async () => {
  const world = createWorld({'./use-browser-importer-GNOc7eYC.js#t': targets => targets[0]});
  const {__ImportDialog: Dialog} = await load(world, IMPORT, ['ImportDialog']);
  const sent = [];
  const open = (source, unchecked) => world.render(Dialog, {browsers: [browserRow(source)], initialBrowserId: source.id, initialStep: 'data', onCancel: () => {}, onImport: (_, options) => sent.push(options)},
    {state: ['data', source.id, '', unchecked, 'merge'], event: {}});
  const fromChrome = text(open(chrome, ['searchEngine']));
  for (const row of ['Passwords', 'Extensions', 'Default search engine', 'Stay signed in to sites']) assert.ok(fromChrome.includes(row), row);
  assert.ok(!fromChrome.includes('can’t come over'));
  assert.deepEqual(plain(sent.at(-1).dataKinds), ['bookmarks', 'history', 'cookies', 'extensions', 'passwords'], 'unticked by default, so it isn’t sent');
  open(chrome, []);
  assert.ok(sent.at(-1).dataKinds.includes('searchEngine'), 'ticked, it is');
  const fromFirefox = text(open(firefox, ['searchEngine']));
  assert.ok(fromFirefox.includes('Passwords can’t come over from Firefox.'));
  for (const row of ['"Passwords"', 'Extensions', 'Default search engine']) assert.ok(!fromFirefox.includes(row), row);
});

test('import: the Keychain explainer shows for passwords and sign-ins, never for Firefox or Zen, and names the real item', async () => {
  const world = createWorld();
  const {__needsKeychain: needs, __safeStorage: storage, __importTargets: targets} = await load(world, IMPORTER, ['needsKeychain', 'safeStorage', 'importTargets']);
  for (const kinds of [['passwords'], ['cookies'], ['history', 'passwords'], undefined]) assert.equal(needs(chrome, kinds), true, String(kinds));
  assert.equal(needs(chrome, ['history', 'bookmarks', 'searchEngine']), false);
  for (const source of [firefox, {id: 'zen', name: 'Zen'}]) assert.equal(needs(source, ['cookies']), false, source.id);
  assert.equal(storage(chrome), 'Chrome Safe Storage');
  assert.equal(storage({id: 'edge', name: 'Microsoft Edge'}), 'Microsoft Edge Safe Storage');
  assert.equal(storage({id: 'vivaldi', name: 'Vivaldi'}), 'Vivaldi Safe Storage');
  assert.equal(storage({id: 'helium', name: 'Helium'}), 'Helium Storage Key');
  // The daemon's list stops at the browsers it knew: the browser's own word counts as detected.
  const sources = new Map(['vivaldi', 'opera', 'chromium', 'zen'].map(id => [id, {id, name: id, profiles: [], installed: true}]));
  sources.set('gone', {id: 'gone', name: 'Gone', profiles: [], installed: false});
  const listed = targets(sources, new Map(), new Set());
  assert.deepEqual(JSON.parse(JSON.stringify(listed.map(target => [target.id, target.detected]))), [['vivaldi', true], ['opera', true], ['chromium', true], ['zen', true]]);
});

test('import: the new sources have names and tiles, and a partial import says what it skipped', async () => {
  const main = staged(MAIN);
  for (const [id, name] of [['vivaldi', 'Vivaldi'], ['opera', 'Opera'], ['chromium', 'Chromium'], ['zen', 'Zen']]) assert.ok(main.includes(`["${id}","${name}"]`), id);
  const world = createWorld();
  const icons = await load(world, 'assets/browser-icon-DvnonVC4.js', ['auxBrowserTile']);
  assert.match(icons.__auxBrowserTile('vivaldi'), /^data:image\/svg\+xml,/);
  assert.equal(icons.__auxBrowserTile('unknown'), undefined);
  const progress = await load(world, 'assets/progress-CS-jrVXz.js', ['skippedSummary']);
  assert.equal(progress.__skippedSummary(['cookies']), 'Imported everything except site sign-ins.');
  assert.equal(progress.__skippedSummary(['passwords']), 'Imported everything except passwords.');
  assert.equal(progress.__skippedSummary(['cookies', 'passwords']), 'Imported everything except site sign-ins and passwords.');
});

test('import: Settings names every kind, so no default search engine comes without the switch', async () => {
  const world = createWorld();
  const general = await load(world, 'assets/general-3dgRbrRk.js', ['ImportDialog']);
  const started = [];
  const target = {id: 'chrome', source: chrome, label: 'Chrome', alreadyImported: false, detected: true};
  const scene = ticked => ({state: ['chrome', 'idle', null, null, ticked], event: {}, imports: {'./use-browser-importer-GNOc7eYC.js#n': {targets: [target], dialogs: 'dialogs',
    importTarget: async (_, options) => (started.push(options.dataKinds), 'cancelled')}}});
  const rendered = world.render(general.__ImportDialog, {description: 'd', title: 't', onBusyChange: () => {}, onClose: () => {}}, scene(false));
  assert.match(text(rendered), /Use Google Chrome’s default search engine/);
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(plain(started.at(-1)), chrome.supportedDataKinds);
  world.render(general.__ImportDialog, {description: 'd', title: 't', onBusyChange: () => {}, onClose: () => {}}, scene(true));
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(plain(started.at(-1)), [...chrome.supportedDataKinds, 'searchEngine']);
});

// ------------------------------------------------------------------------------------ settings

test('settings: Ask before quitting reads and writes the browser’s own setting', async () => {
  const world = createWorld();
  const {__AuxConfirmQuitSetting: Row} = await load(world, 'assets/general-3dgRbrRk.js', ['AuxConfirmQuitSetting']);
  assert.equal(world.render(Row, {}, {chrome: {auxBrowserPreferences: {}}}).tree, null, 'no row without the API');
  const writes = [];
  const api = {getConfirmToQuitEnabled: async () => true, setConfirmToQuitEnabled: async value => { writes.push(value); }};
  const rendered = world.render(Row, {}, {chrome: {auxBrowserPreferences: api}, state: [true], args: [false]});
  assert.match(text(rendered), /Ask before quitting/);
  assert.deepEqual(writes, [false]);
});

const SHORTCUTS = 'assets/use-shortcut-capture-DGr8Ws5Z.js';
const PAGE = 'assets/appearance-C03x8vQf.js';

test('shortcuts: the recorder takes function keys, alone or with modifiers', async () => {
  const world = createWorld();
  const {__A: record} = await load(world, SHORTCUTS, ['A']);
  const key = (code, extra = {}) => record({code, ctrlKey: false, altKey: false, metaKey: false, shiftKey: false, ...extra}, true);
  assert.equal(key('F5'), 'F5');
  assert.equal(key('F12', {metaKey: true, shiftKey: true}), 'Command+Shift+F12');
  assert.equal(key('KeyK'), null, 'a letter still needs a modifier');
  assert.equal(key('F13'), null);
});

test('shortcuts: a conflict names the owner, and Replace moves the keys', async () => {
  const world = createWorld();
  const {__I: write} = await load(world, SHORTCUTS, ['I']);
  const rows = [{commandId: 34014, serializedShortcut: 'Command+T', defaultSerializedShortcut: 'Command+T'}, {commandId: 34015, serializedShortcut: 'Command+W', defaultSerializedShortcut: 'Command+W'}];
  const calls = [];
  const api = {getKeyboardShortcuts: async () => rows, setKeyboardShortcut: async (...args) => { calls.push(args); }, resetKeyboardShortcut: async () => {}, setShortcutHandlingSuspended: async () => {}};
  await assert.rejects(write(api, 34015, 'Command+T'), /^Error: “New tab” already uses this shortcut\.$/);
  await write(api, 34015, 'Command+T', true);
  assert.deepEqual(calls, [[34015, 'Command+T', true]]);

  const page = await load(world, PAGE, ['KeyboardShortcuts', 'ShortcutRow']);
  const mutations = [], toasts = [], mutated = [];
  const imports = {'./strip-markdown-DRcmtuJc.js#K': options => (mutations.push(options), {isPending: false, mutate: value => mutated.push(value)}),
    './useQueries-CrOl5VwX.js#t': () => [{data: [], isPending: false}, {data: true}, {data: 'Alt+Space'}], './use-shortcut-capture-DGr8Ws5Z.js#i': true,
    './dist-LyKrHgST.js#n.error': (title, options) => toasts.push(options)};
  world.render(page.__KeyboardShortcuts, {}, {imports: {...imports, './strip-markdown-DRcmtuJc.js#er': imports['./strip-markdown-DRcmtuJc.js#K']}});
  const update = mutations[0];
  update.onError(new Error('“New tab” already uses this shortcut.'), {commandId: 34015, shortcut: 'Command+T'});
  assert.equal(toasts.at(-1).action.label, 'Replace');
  toasts.at(-1).action.onClick();
  assert.deepEqual(plain(mutated), [{commandId: 34015, shortcut: 'Command+T', replace: true}]);
  update.onError(new Error('“Mini popup” already uses this shortcut.'), {commandId: 34015, shortcut: 'Command+T', replace: true});
  assert.equal(toasts.at(-1).action, undefined, 'no second Replace for a command that can’t give up its keys');
  update.onError(new Error('This shortcut is already used by a browser menu command.'), {commandId: 34015, shortcut: 'Command+T'});
  assert.equal(toasts.at(-1).action, undefined, 'a menu item isn’t replaced');
  assert.match(toasts.at(-1).description, /A menu item already uses these keys/);

  const toggled = [];
  const row = world.render(page.__ShortcutRow, {shortcut: {commandId: 34015, shortcut: '⌘W', alwaysForAux: false, isCustomized: false}, editable: true, disabled: false, onChange: () => {}, onAlways: value => toggled.push(value)}, {});
  assert.match(text(row), /Always use for Aux, even on pages that use these keys/);
  assert.deepEqual(toggled, [true]);
  const none = world.render(page.__ShortcutRow, {shortcut: {commandId: 34069, shortcut: '⌥Space', isCustomized: false}, editable: true, disabled: false, onChange: () => {}}, {});
  assert.doesNotMatch(text(none), /Always use/);
});

test('Link routing names Spaces and keeps the rule’s group out of sight', async () => {
  const world = createWorld();
  const {__AuxRoutingDialog: Dialog, __AuxRoutingSetting: Row} = await load(world, 'assets/general-3dgRbrRk.js', ['AuxRoutingDialog', 'AuxRoutingSetting']);
  assert.match(text(world.render(Row, {})), /Choose a Space for sites you open from other apps\./);
  const profiles = [{id: 'p1', name: 'Default', spaces: [{id: 's1', name: 'Work'}]}, {id: 'p2', name: 'Isolated', spaces: [{id: 's2', name: 'Personal'}]}];
  const rule = {id: 'r1', enabled: true, host: 'x.test', path: '', subdomains: false, priority: 0, profileId: 'p1', spaceId: 's1'};
  const configuration = {revision: '1', rules: [rule]};
  const rendered = text(world.render(Dialog, {onClose: () => {}}, {state: [{configuration, profiles}, configuration, 'r1', false, '', '', ''], event: {target: {value: ''}}}));
  assert.ok(rendered.includes('in the Space you choose'));
  assert.ok(!/"Profile"|Default|Isolated/.test(rendered), 'no profile or group name on screen');
  for (const space of ['Work', 'Personal', 'Current Space']) assert.ok(rendered.includes(space), space);
});

// --------------------------------------------------------------------------------------- agent

test('the agent’s startup states: getting ready, then couldn’t start with Try again', async () => {
  const world = createWorld();
  const island = await load(world, 'assets/island-C0ouZ54e.js', ['AuxNewTabAgentStatus']);
  assert.equal(world.render(island.__AuxNewTabAgentStatus, {onCheck: () => {}}, {state: [false, false, 0]}).tree, null, 'nothing flashes on a normal open');
  assert.match(text(world.render(island.__AuxNewTabAgentStatus, {onCheck: () => {}}, {state: [true, false, 0]})), /Getting your agent ready…/);
  let retried = 0, checked = 0;
  const failed = world.render(island.__AuxNewTabAgentStatus, {onCheck: () => { checked++; }}, {state: [true, true, 0], chrome: {auxBrowserPreferences: {retryDaemon: () => { retried++; }}}});
  assert.match(text(failed), /Your agent couldn’t start\.[^]*Try again/);
  assert.deepEqual([retried, checked], [1, 1]);
  const errors = await load(world, 'assets/error-tracking-B1YG2RRM.js', ['tryAgain', 'ATTEMPTS']);
  assert.equal(errors.__ATTEMPTS, 6);
  assert.match(released('assets/error-tracking-B1YG2RRM.js'), /Your agent couldn’t start\./);
  assert.match(released('assets/error-tracking-B1YG2RRM.js'), /Getting your agent ready…/);
});

const agentUi = async world => world.evaluate(readFileSync(new URL('../provided/agent/aux-agent-ui.js', import.meta.url), 'utf8')
  .replace(/^import \{([^}]*)\} from "/gm, 'import{$1}from"'), 'decisions:aux-agent-ui');

test('the panel’s chat menu filters side chats, routines, channels and New Tab', async () => {
  const world = createWorld();
  const ui = await agentUi(world);
  const rows = [{id: 'a'}, {id: 'b', trigger: {type: 'user', source: 'sidepanel'}}, {id: 'c', trigger: {type: 'routine'}}, {id: 'd', trigger: {type: 'standalone-routine', routineId: 'r'}},
    {id: 'e', trigger: {type: 'channel'}}, {id: 'f', trigger: {type: 'user', source: 'new-tab'}}, {id: 'g', trigger: {type: 'subagent'}}];
  const ids = filter => ui.auxAgentChats(rows, filter).map(row => row.id).join();
  assert.equal(ids('side'), 'a,b');
  assert.equal(ids('routines'), 'c,d');
  assert.equal(ids('channels'), 'e');
  assert.equal(ids('new-tab'), 'f');
  assert.equal(ui.auxAgentChatsEmpty('new-tab'), 'No New Tab chats yet');
  assert.equal(JSON.stringify(ui.auxAgentChatsQuery('routines')), '{"routines":"include"}');
  assert.equal(JSON.stringify(ui.auxAgentChatsQuery('side')), '{}');
  assert.match(text(world.render(ui.AuxAgentChatFilters, {value: 'side', onChange: () => {}})), /Side chats[^]*Routines[^]*Channels[^]*New Tab/);
});

test('Add a local agent shows the exact command and saves only after a confirm', async () => {
  const world = createWorld();
  const ui = await agentUi(world);
  const scene = (draft, extra = {}) => ({state: [[{id: 'agent-1', name: 'Mine', command: '/bin/mine --acp'}], draft, null, false], event: {target: {value: ''}},
    imports: {'./strip-markdown-DRcmtuJc.js#Kt': {accountId: 7}, ...extra}});
  const closed = text(world.render(ui.AuxLocalAgents, {}, scene(null)));
  assert.ok(closed.includes('Add a local agent…') && closed.includes('/bin/mine --acp'));
  const entry = text(world.render(ui.AuxLocalAgents, {}, scene({name: 'New', command: 'x --acp'})));
  assert.ok(entry.includes('without a shell') && entry.includes('Continue') && !entry.includes('Add agent'));
  const confirm = text(world.render(ui.AuxLocalAgents, {}, scene({name: 'New', command: 'x --acp', confirm: '/usr/local/bin/x --acp'})));
  assert.ok(confirm.includes('/usr/local/bin/x --acp') && confirm.includes('Aux will run exactly this') && confirm.includes('Add agent'));
});

test('Make it yours says the agent is getting ready, or that it couldn’t start', async () => {
  const world = createWorld();
  const ui = await agentUi(world);
  assert.match(text(world.render(ui.AuxAgentSetup, {}, {state: [null, false, 0]})), /Getting your agent ready…/);
  let retried = 0;
  const failed = world.render(ui.AuxAgentSetup, {}, {state: [null, true, 0], chrome: {auxBrowserPreferences: {retryDaemon: () => { retried++; }}}});
  assert.match(text(failed), /Your agent couldn’t start\.[^]*Try again/);
  assert.equal(retried, 1);
});

test('a removed chunk leaves every import and Vite deps table, and the indexes hold', () => {
  const chunk = 'assets/gone-AAAA.js', kept = 'assets/kept-BBBB.js';
  const before = `const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["${kept}","${chunk}","assets/other-CCCC.js"])))=>i.map(i=>d[i]);`
    + 'var a=()=>s(()=>import("./kept-BBBB.js"),__vite__mapDeps([0,1,2])),b=()=>s(()=>import("./gone-AAAA.js"),__vite__mapDeps([1,2]));';
  const after = dropRemovedChunks(before, [chunk]);
  assert.ok(after.includes(`[0,2]`) && after.includes(`["${kept}",null,"assets/other-CCCC.js"]`));
  assert.ok(after.includes('b=()=>Promise.resolve({})') && !after.includes('gone-AAAA'));
  assert.equal(dropRemovedChunks('no such chunk here', [chunk]), 'no such chunk here');
  assert.throws(() => dropRemovedChunks(`import{t as x}from"./gone-AAAA.js";`, [chunk]), /still imported/);
});
