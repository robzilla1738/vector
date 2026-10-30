// Hermetic: the dispatcher's routing rules, with a stand-in tRPC router.
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import test from 'node:test';
import {createAuxOwnedDaemon} from './dispatcher.mjs';
import {BINDINGS_FUNCTION, DAEMON_EDITS, RUNTIME_FILES, STORE_EDITS, integrateDaemon, withoutStoreEdits} from './integration.mjs';

const router = record => ({_def: {record}});
const procedure = (type, by, meta) => ({_def: {type, meta}, by});
const port = source => `data:text/javascript,${encodeURIComponent(source)}`;
const owns = body => port(`export const create = ({procedure}) => (${body});`);
const bindings = {router, procedure};
const supplied = () => ({
  inbox: router({list: procedure('query', 'supplied'), add: procedure('mutation', 'supplied')}),
  settings: router({get: procedure('query', 'supplied')}),
  sessions: router({get: procedure('query', 'supplied', {method: 'GET', path: '/sessions/{sessionId}'}),
    tabs: {list: procedure('query', 'supplied'), remove: procedure('mutation', 'supplied')}}),
});

test('registered namespaces get Aux procedures; the rest of the namespace and every other namespace stay supplied', async () => {
  const daemon = await createAuxOwnedDaemon({inbox: owns(`{list: procedure('query', 'aux')}`)});
  const routers = supplied(), composed = daemon.compose(routers, bindings);
  assert.equal(composed.settings, routers.settings);
  assert.equal(composed.inbox._def.record.list.by, 'aux');
  assert.equal(composed.inbox._def.record.add, routers.inbox._def.record.add);
  assert.deepEqual(daemon.owned(), {inbox: ['list']});
});

test('an Aux procedure must replace a supplied one of the same kind', async () => {
  for (const [body, message] of [[`{remove: procedure('mutation', 'aux')}`, /inbox.remove is not a supplied procedure/],
    [`{list: procedure('mutation', 'aux')}`, /inbox.list is a mutation, the supplied one a query/]]) {
    const daemon = await createAuxOwnedDaemon({inbox: owns(body)});
    assert.throws(() => daemon.compose(supplied(), bindings), message);
  }
  const daemon = await createAuxOwnedDaemon({routines: owns('{}')});
  assert.throws(() => daemon.compose(supplied(), bindings), /no routines router/);
});

test('nested namespaces and nested records replace only their own procedures', async () => {
  const daemon = await createAuxOwnedDaemon({'sessions.tabs': owns(`{list: procedure('query', 'aux')}`), inbox: owns(`{list: procedure('query', 'aux')}`)});
  const routers = supplied(), {sessions, inbox} = daemon.compose(routers, bindings);
  assert.equal(sessions._def.record.tabs.list.by, 'aux');
  assert.equal(sessions._def.record.tabs.remove, routers.sessions._def.record.tabs.remove);
  assert.equal(sessions._def.record.get, routers.sessions._def.record.get);
  assert.equal(inbox._def.record.list.by, 'aux');
  const nested = await createAuxOwnedDaemon({sessions: owns(`{tabs: {remove: procedure('mutation', 'aux')}}`)});
  assert.equal(nested.compose(supplied(), bindings).sessions._def.record.tabs.remove.by, 'aux');
  assert.deepEqual(nested.owned(), {sessions: ['tabs.remove']});
  const misplaced = await createAuxOwnedDaemon({sessions: owns(`{get: {x: procedure('query', 'aux')}}`)});
  assert.throws(() => misplaced.compose(supplied(), bindings), /sessions.get is not a supplied router/);
});

test('an Aux procedure keeps the HTTP route meta of the one it replaces', async () => {
  const daemon = await createAuxOwnedDaemon({sessions: owns(`{get: procedure('query', 'aux')}`)});
  assert.throws(() => daemon.compose(supplied(), bindings), /sessions.get must keep the supplied HTTP route meta/);
});

test('a store is created once, from the bindings, when the bundle first reaches it', async () => {
  let created = 0;
  const daemon = await createAuxOwnedDaemon({}, {settings: port('export const create = ({tag}) => ({tag});')});
  const bindings = () => (created++, {tag: 'bound'});
  assert.deepEqual(daemon.storesInUse(), []);
  assert.equal(daemon.store('settings', bindings), daemon.store('settings', bindings));
  assert.deepEqual([daemon.store('settings', bindings).tag, created, daemon.storesInUse()], ['bound', 1, ['settings']]);
  assert.throws(() => daemon.store('sessions', bindings), /no sessions store/);
});

test('the daemon edits apply once to their anchors and ship only runtime files', () => {
  const entry = [...DAEMON_EDITS, ...STORE_EDITS].map(rule => rule.find).join(';');
  const composed = integrateDaemon(entry);
  for (const rule of [...DAEMON_EDITS, ...STORE_EDITS]) assert.ok(composed.includes(rule.replace), rule.name);
  assert.equal(withoutStoreEdits(composed).includes('auxOwnedDaemon.store('), false, 'the reference keeps the bundle\'s own stores');
  assert.throws(() => integrateDaemon(composed), /already/);
  assert.throws(() => integrateDaemon(entry.replace('inbox:inboxRouter,', '')), /expected 1, got 0/);
  assert.deepEqual(RUNTIME_FILES.slice(0, 2), ['dispatcher.mjs', 'registry.mjs']);
  for (const file of RUNTIME_FILES) {
    assert.ok(existsSync(new URL(file, import.meta.url)), file);
    assert.doesNotMatch(file, /test|parity/, file);
  }
  assert.match(BINDINGS_FUNCTION, /^function auxOwnedDaemonBindings\(\)\{return\{get router\(\)\{return router\},get accountProcedure\(\)\{return accountProcedure\},.*,z:\{get object\(\)\{return object\},get string\(\)\{return string\$3\},/);
});
