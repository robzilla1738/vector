// Host-only: each Aux-owned route against the staged chunk it replaces (see parity.mjs), staged as
// the release hands it over: after the package edits and every earlier transform.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {requireInput} from '../../scripts/lib/inputs.mjs';
import {GLOBALS_CSS, ROUTES, TOKEN_CHANGES, integrateRoutes, integrateStyles, readRoute} from './integration.mjs';
import {assertFreeNames, assertParity} from './parity.mjs';
import {stagedText} from './staged.mjs';

const candidate = requireInput('candidateApp');
const textOf = chunk => stagedText(candidate, chunk);

// Scenes that set what the routes' imports return, so each branch renders: signed in or not, a
// session open or not, sidebar mode open or closed, Settings embedded or not, a menu item active.
const signedIn = {data: {accountId: 7, mode: 'cloud', authStatus: 'active', browserProfile: 'p'}};
const routeScenes = [
  world => ({imports: {
    './utils-DCBm67_n.js#y': true, './sidebar-Cj9gldy1.js#s': {sidebarState: 'closed', setSidebarState: world.stub('setSidebarState')},
    './newtab-CnOLQ0yu.js#o': {accountId: 7, browserMode: 'default', setAccountId: world.stub('setAccountId')},
    './strip-markdown-DRcmtuJc.js#nr': signedIn, './strip-markdown-DRcmtuJc.js#tr': signedIn, './utils-BEeo4-cB.js#n': true,
    './strip-markdown-DRcmtuJc.js#Kt': {accountId: 7, mode: 'default'}, './extension-page-url-BH3pfT7h.js#i': false,
    './Matches-B99cyGDb.js#n': () => ({to}) => to.includes('memories'),
    './-components-4o0FSqQ9.js#r': {currentSessionId: null, onSessionChange: world.stub('onSessionChange')},
    './provider-Cw0zhujt.js#f': false, './context-q_vohNW8.js#n': {currentSession: {title: '', incognito: true}, updateMode: world.stub('updateMode')},
  }, state: ['mem', 1, true, null]}),
  world => ({imports: {
    './utils-DCBm67_n.js#y': true, './sidebar-Cj9gldy1.js#s': {sidebarState: 'open', setSidebarState: world.stub('setSidebarState')},
    './newtab-CnOLQ0yu.js#o': {accountId: null, browserMode: 'incognito', setAccountId: world.stub('setAccountId')},
    './strip-markdown-DRcmtuJc.js#nr': {data: {mode: 'local'}}, './strip-markdown-DRcmtuJc.js#tr': {data: {mode: 'local'}},
    './strip-markdown-DRcmtuJc.js#Kt': {accountId: 7, mode: 'incognito'}, './extension-page-url-BH3pfT7h.js#i': false,
    './Matches-B99cyGDb.js#n': () => () => false,
    './-components-4o0FSqQ9.js#r': {currentSessionId: 's1', onSessionChange: world.stub('onSessionChange')},
    './provider-Cw0zhujt.js#f': true, './context-q_vohNW8.js#n': {currentSession: {title: 'Plan', incognito: false}, updateMode: world.stub('updateMode')},
  }, state: ['zzzz', 0, false, 'x']}),
];

test('every Aux-owned route renders, runs its effects and handles events like the one it replaces', async () => {
  await assertParity({blocksByChunk: ROUTES, textOf, integrate: integrateRoutes, read: readRoute, changes: TOKEN_CHANGES, minimum: 300, scenes: routeScenes});
});

test('the routes replace their blocks once and refuse a second pass', () => {
  for (const [chunk, blocks] of Object.entries(ROUTES)) {
    const after = integrateRoutes(chunk, textOf(chunk));
    for (const {file} of blocks) assert.equal(after.split(readRoute(file)).length - 1, 1, file);
    assert.throws(() => integrateRoutes(chunk, after), /drift/);
  }
});

test('the module-scope names the Aux routes bind are free in the rest of their chunks', () => {
  assertFreeNames({blocksByChunk: ROUTES, textOf, read: readRoute});
});

test('the token changes use compiled, theme-following classes', () => {
  const css = integrateStyles(readFileSync(`${candidate}/Contents/Resources/aux/apps/extension/dist/${GLOBALS_CSS}`, 'utf8'));
  for (const [file, from, to] of TOKEN_CHANGES) {
    const selector = to.replace(/:/g, '\\:');
    assert.ok(css.includes(`.${selector}:hover`) || css.includes(`.${selector}{`), `${file}: .${to} is not compiled`);
    assert.ok(readRoute(file).includes(to) && !readRoute(file).includes(from), file);
  }
});
