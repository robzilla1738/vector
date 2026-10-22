import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs/promises';
import * as syncFs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createHash, randomBytes } from 'node:crypto';
import { cloudSessionHelpers, applyCloudSessionAdapter } from './cloud-session-adapter.mjs';

const source = await fs.readFile('/Users/rcourson/Downloads/aside-rea 2/extracted/daemon-app/index.mjs', 'utf8');
const writer = source.slice(source.indexOf('function rewriteSessionMessageJsonlRows('), source.indexOf('var SESSION_MESSAGES_JSONL_FILE,'));
const reducers = source.slice(source.indexOf('function updateSessionTurnInsertFromRow('), source.indexOf('function updateOpenSessionTurnForNewMessage('));
const initAt = source.indexOf('init_session_turns=');
const reducerInit = source.slice(source.indexOf('isRunStartUserMessage=Cn=>', initAt), source.indexOf('}));function sessionListOrderBy', initAt));
const zeroUsage = () => ({ input: 0, output: 0, cacheRead: 0, cacheWrite: 0, totalTokens: 0, cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 } });
function rows(messages) { let offset = 0; return messages.map(msg => { const row = { id: String(offset), msg, jsonlReadSize: Buffer.byteLength(JSON.stringify(msg) + '\n') }; offset += row.jsonlReadSize; return row; }); }
function snapshot(id = 'session-one') { return { version: 1, session: { id, title: 'Recovered history', model: { provider: 'fixture', modelId: 'fixture' }, harnessId: 'v1', createdAt: '2026-10-21T00:00:00Z', updatedAt: '2026-10-21T00:00:01Z', readAt: '2026-10-21T00:00:01Z', archivedAt: null, pinnedAt: null, wasActive: true, cwd: '/other-device/private', permission: { fullAccess: true }, runtimeConfig: { workingDirs: ['/other-device/private'] }, browserBinding: { profileId: 'other-device' }, queuedMessages: ['execute remotely'], suspension: { kind: 'approval' } }, rows: rows([{ role: 'turn-lifecycle', event: 'started', turnId: 'fixture-turn', timestamp: 1 }, { role: 'user', content: 'hello', timestamp: 2 }, { role: 'assistant', content: [{ type: 'text', text: 'Hello back' }], timestamp: 3, usage: zeroUsage(), stopReason: 'stop' }]), turns: [{ turnId: 'fixture-turn', filesChanged: [] }] }; }

function fixture(root, key = randomBytes(32)) {
  const sessions = new Map(), messages = new Map(), turns = new Map(), events = [], account = { userId: 'fixture-user', createdAt: '2026-10-21' };
  let generation = 0, running = false;
  const context = vm.createContext({ Buffer, Map, Set, JSON, Number, Error, Date, Object, Promise, process, setTimeout, clearTimeout,
    ...syncFs, path,
    AccountRegistry: { getAccount: () => account, getSession: () => ({ accessToken: 'fixture' }) }, isSyncEnabled: () => true, readAccessTokenSyncGeneration: () => generation,
    auxCloudFileContext: async () => ({ key: Buffer.from(key), userId: account.userId, generation }),
    sha256Hex: bytes => createHash('sha256').update(bytes).digest('hex'),
    getAgentFileSyncDir: () => path.join(root, 'sync'), getAccountRoot: () => root,
    getSessionStorageDir: session => path.join(root, 'sessions', `2026-10-21_${session.id}`),
    settings: () => ({ get: name => name === 'defaultPermissionMode' ? 'read-only' : name === 'defaultModel' ? { provider: 'fixture', modelId: 'fixture' } : {} }),
    sessionRuntimeConfigSchema: { parse: () => ({ workingDirs: [] }) }, modelSelectionSchema: { parse: model => model },
    mergePermissionConfig: permission => permission, permissionForMode: () => ({ files: { writableRoots: [] }, sandbox: { enabled: true } }), createDefaultToolState: cwd => ({ cwd }),
    ProjectStore: { get: () => undefined }, GlobalAgentSessionServer: { isRunning: () => running, isLoading: () => false },
    EventBus: { emit: (type, data) => events.push({ type, data }) }, logger: { warn: () => {} },
    SessionTurnTable: { sessionId: 'turn-session' }, SessionTurnMemoryExtractionTable: { sessionId: 'memory-session' }, eq: (_column, id) => id,
    stateDb: () => ({ transaction: callback => callback(), delete: table => ({ where: id => ({ run: () => { if (table.sessionId === 'turn-session') turns.delete(id); } }) }) }),
    createDefaultTokenUsage: zeroUsage, normalizeSessionTurnProjection: value => value,
    extractFinalAssistantMessage: message => [message], isRunInputPrefixOpen: turn => !!turn && !turn.userMessage.some(msg => msg.role === 'user'),
    sessionMessageStore: () => ({ rewrite: (session, value) => { const result = context.rewriteSessionMessageJsonlRows(1, session, value); messages.set(session.id, rows(value.map(row => row.msg))); return result; } }),
    resolveSessionMessageDir: (_account, session) => context.getSessionStorageDir(session), sessionMessagesJsonlPath: directory => path.join(directory, 'messages.jsonl'),
    SessionStore: {
      get: (_account, id) => sessions.get(id), listAllMessageRows: async (_account, id) => messages.get(id) ?? [], listTurnsForFeedback: (_account, id) => turns.get(id) ?? [],
      restore: (_account, session) => { syncFs.mkdirSync(context.getSessionStorageDir(session), { recursive: true }); sessions.set(session.id, session); },
      restoreTurns: (_account, id, value) => turns.set(id, value), update: (_account, id, patch) => sessions.set(id, { ...sessions.get(id), ...patch }),
      adoptMirrorState: (_account, id, state) => sessions.set(id, { ...sessions.get(id), ...state }), clearMessages: async (_account, id) => { messages.set(id, []); turns.set(id, []); },
    },
    AsideApiError: class extends Error { constructor(status) { super(); this.status = status; } },
  });
  new vm.Script(`var isRunStartUserMessage,addUsage$1,createSessionTurnInsert,createOpenSessionTurnInsert;${reducerInit};${reducers}${writer}${cloudSessionHelpers}`, { importModuleDynamically: vm.constants.USE_MAIN_CONTEXT_DEFAULT_LOADER }).runInContext(context);
  return { context, sessions, messages, turns, events, key, account, setGeneration: value => { generation = value; }, setRunning: value => { running = value; } };
}

test('session patch pins Store exports and both supplied discovery callers', () => {
  const result = applyCloudSessionAdapter(source);
  assert.equal(result.anchors.length, 4);
  assert.throws(() => applyCloudSessionAdapter(result.text), /anchor changed/);
  assert.throws(() => applyCloudSessionAdapter(source.replace('Cn.appendMessage=Hi', 'Cn.appendMessage=changed')), /export changed/);
  new vm.Script('var ' + result.anchors[1].replace + '}));');
});

test('two-device encrypted snapshot restores original JSONL/turn projections with local authority', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'aux-session-fixture-'));
  try {
    const a = fixture(root), second = path.join(root, 'device-b'); await fs.mkdir(second);
    const b = fixture(second, a.key), payload = snapshot();
    const encrypted = await a.context.auxCloudSessionCipher(1, payload.session.id, payload);
    assert.equal(encrypted.includes(Buffer.from('Recovered history')), false);
    const record = { id: payload.session.id, generation: 0, blobId: '00000000-0000-4000-8000-000000000001', size: encrypted.length, sha256: createHash('sha256').update(encrypted).digest('hex') };
    b.context.fetchAsideAPIAuthenticatedRequest = async () => new Response(encrypted);
    const recovered = await b.context.auxCloudReadSessionSnapshot(1, record);
    assert.equal(await b.context.auxCloudRestoreSessionSnapshot(1, recovered), true);
    const local = b.sessions.get(payload.session.id);
    assert.equal(local.cwd, second);
    assert.equal(local.status, 'interrupted');
    assert.equal(local.permissionMode, 'read-only');
    assert.equal(local.browserBinding, null);
    assert.equal(local.suspension, null);
    assert.equal(local.queuedMessages.length, 0);
    assert.equal(local.runtimeConfig.workingDirs.length, 0);
    assert.equal(b.turns.get(payload.session.id).length, 1);
    assert.ok(b.turns.get(payload.session.id)[0].finishedAt);
    const file = path.join(b.context.getSessionStorageDir(local), 'messages.jsonl');
    assert.equal(await fs.readFile(file, 'utf8'), payload.rows.map(row => JSON.stringify(row.msg) + '\n').join(''));
    b.account.userId = 'wrong-user'; await assert.rejects(b.context.auxCloudReadSessionSnapshot(1, record));
    b.account.userId = 'fixture-user'; b.setGeneration(1); await assert.rejects(b.context.auxCloudReadSessionSnapshot(1, record), /generation/);
  } finally { await fs.rm(root, { recursive: true, force: true }); }
});

test('active or locally changed work is never overwritten during discovery', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'aux-session-active-'));
  try {
    const device = fixture(root), payload = snapshot();
    device.sessions.set(payload.session.id, { ...payload.session, createdAt: new Date(payload.session.createdAt), updatedAt: new Date(payload.session.updatedAt), status: 'running' });
    device.setRunning(true);
    assert.equal(await device.context.auxCloudRestoreSessionSnapshot(1, payload), false);
    assert.equal((await fs.readdir(root)).length, 0);
    device.setRunning(false); device.sessions.get(payload.session.id).status = 'idle';
    assert.equal(await device.context.auxCloudRestoreSessionSnapshot(1, payload, 'stale-digest'), false);
  } finally { await fs.rm(root, { recursive: true, force: true }); }
});

test('restoration rejects orphan directories, symlinks and malformed message offsets', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'aux-session-guards-')), outside = await fs.mkdtemp(path.join(os.tmpdir(), 'aux-session-outside-'));
  try {
    const device = fixture(root), payload = snapshot();
    payload.rows[1].id = '999'; assert.throws(() => device.context.auxCloudValidateSessionSnapshot(payload, payload.session.id), /message rows/); payload.rows = snapshot().rows;
    await fs.symlink(outside, path.join(root, 'sessions'));
    await assert.rejects(device.context.auxCloudRestoreSessionSnapshot(1, payload), /redirected/);
    assert.deepEqual(await fs.readdir(outside), []);
  } finally { await fs.rm(root, { recursive: true, force: true }); await fs.rm(outside, { recursive: true, force: true }); }
});
