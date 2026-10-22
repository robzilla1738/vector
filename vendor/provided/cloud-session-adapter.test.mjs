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
  let generation = 0, running = false, failTransaction = false; const projects = new Map();
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
    ProjectStore: { get: (_account, id) => projects.get(id) }, GlobalAgentSessionServer: { isRunning: () => running, isLoading: () => false },
    EventBus: { emit: (type, data) => events.push({ type, data }) }, logger: { warn: () => {} },
    SessionTurnTable: { sessionId: 'turn-session' }, SessionTurnMemoryExtractionTable: { sessionId: 'memory-session' }, eq: (_column, id) => id,
    stateDb: () => ({ transaction: callback => { const oldSessions = new Map(sessions), oldTurns = new Map(turns); try { const result=callback(); if (failTransaction) { failTransaction=false; throw Error('Injected SQLite commit failure'); } return result; } catch(error) { sessions.clear(); turns.clear(); for(const [id,value] of oldSessions)sessions.set(id,value);for(const [id,value]of oldTurns)turns.set(id,value);throw error; } }, delete: table => ({ where: id => ({ run: () => { if (table.sessionId === 'turn-session') turns.delete(id); } }) }) }),
    createDefaultTokenUsage: zeroUsage, normalizeSessionTurnProjection: value => value,
    extractFinalAssistantMessage: message => [message], isRunInputPrefixOpen: turn => !!turn && !turn.userMessage.some(msg => msg.role === 'user'),
    sessionMessageStore: () => ({ rewrite: (session, value) => { const result = context.rewriteSessionMessageJsonlRows(1, session, value); messages.set(session.id, rows(value.map(row => row.msg))); return result; } }),
    resolveSessionMessageDir: (_account, session) => context.getSessionStorageDir(session), sessionMessagesJsonlPath: directory => path.join(directory, 'messages.jsonl'),
    SessionStore: {
      get: (_account, id) => sessions.get(id), listAllMessageRows: async (_account, id) => { const session=sessions.get(id);if(session){try{return rows(syncFs.readFileSync(path.join(context.getSessionStorageDir(session),'messages.jsonl'),'utf8').trimEnd().split('\n').filter(Boolean).map(line=>JSON.parse(line)));}catch(error){if(error.code!=='ENOENT')throw error;}}return messages.get(id)??[]; }, listTurnsForFeedback: (_account, id) => turns.get(id) ?? [],
      restore: (_account, session) => { syncFs.mkdirSync(context.getSessionStorageDir(session), { recursive: true }); sessions.set(session.id, session); },
      restoreTurns: (_account, id, value) => turns.set(id, value), update: (_account, id, patch) => sessions.set(id, { ...sessions.get(id), ...patch }),
      adoptMirrorState: (_account, id, state) => sessions.set(id, { ...sessions.get(id), ...state }), clearMessages: async (_account, id) => { messages.set(id, []); turns.set(id, []); },
    },
    AsideApiError: class extends Error { constructor(status) { super(); this.status = status; } },
  });
  new vm.Script(`var isRunStartUserMessage,addUsage$1,createSessionTurnInsert,createOpenSessionTurnInsert;${reducerInit};${reducers}${writer}${cloudSessionHelpers}`, { importModuleDynamically: vm.constants.USE_MAIN_CONTEXT_DEFAULT_LOADER }).runInContext(context);
  return { context, sessions, messages, turns, events, key, account, projects, failCommit: () => { failTransaction=true; }, setGeneration: value => { generation = value; }, setRunning: value => { running = value; } };
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

test('SQLite commit failure rolls the original JSONL file back without losing prior projections', async () => {
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'aux-session-rollback-'));
  try {
    const device=fixture(root), original=snapshot();await device.context.auxCloudRestoreSessionSnapshot(1,original);
    const before=await device.context.auxCloudSessionSnapshot(1,original.session.id), oldFile=await fs.readFile(path.join(device.context.getSessionStorageDir(device.sessions.get(original.session.id)),'messages.jsonl'),'utf8');
    const changed=snapshot();changed.session.title='Newer cloud title';changed.rows=rows([...changed.rows.map(row=>row.msg),{role:'user',content:'new remote message',timestamp:4}]);device.failCommit();
    await assert.rejects(device.context.auxCloudRestoreSessionSnapshot(1,changed,device.context.auxCloudSessionDigest(before)),/SQLite commit failure/);
    assert.equal(device.sessions.get(original.session.id).title,'Recovered history');assert.equal(device.sessions.get(original.session.id).transcriptRevision,1);
    assert.equal(await fs.readFile(path.join(device.context.getSessionStorageDir(device.sessions.get(original.session.id)),'messages.jsonl'),'utf8'),oldFile);
    assert.equal(device.turns.get(original.session.id).length,1);assert.equal((await fs.readdir(path.join(root,'sync'))).filter(file=>file.startsWith('cloud-restore-')).length,0);
  } finally {await fs.rm(root,{recursive:true,force:true});}
});

test('late projects and parents attach only to unchanged inactive historical sessions', async () => {
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'aux-session-associations-'));
  try {
    const device=fixture(root), child=snapshot('a-child');child.session.parentId='z-parent';child.session.projectId='late-project';await device.context.auxCloudRestoreSessionSnapshot(1,child);
    const state=await device.context.auxCloudSessionState(1), imported=await device.context.auxCloudSessionSnapshot(1,'a-child');state.sessions['a-child']={cloudId:'a-child',revision:1,localDigest:device.context.auxCloudSessionDigest(imported),desiredParentCloudId:'z-parent',desiredProjectId:'late-project'};
    await device.context.auxCloudRepairSessionAssociations(1,state);assert.equal(device.sessions.get('a-child').projectId,null);assert.equal(device.sessions.get('a-child').parentId,null);
    await device.context.auxCloudRestoreSessionSnapshot(1,snapshot('z-parent'));device.projects.set('late-project',{id:'late-project',workspacePath:path.join(root,'local-workspace')});await device.context.auxCloudRepairSessionAssociations(1,state);
    const local=device.sessions.get('a-child');assert.equal(local.parentId,'z-parent');assert.equal(local.projectId,'late-project');assert.equal(local.cwd,path.join(root,'local-workspace'));assert.equal(local.permissionMode,'read-only');assert.equal(state.sessions['a-child'].localDigest,device.context.auxCloudSessionDigest(await device.context.auxCloudSessionSnapshot(1,'a-child')));
  } finally {await fs.rm(root,{recursive:true,force:true});}
});

test('pending deletion first verifies a newer encrypted conflict copy and preserves another racing update', async () => {
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'aux-session-delete-conflict-'));
  try {
    const device=fixture(root), state=await device.context.auxCloudSessionState(1);state.sessions['session-one']={cloudId:'session-one',revision:1,pendingDelete:true};let revision=2, race=true, lastUpload;const copies=new Map(), calls=[];
    device.context.auxCloudReadSessionSnapshot=async (_account,record)=>structuredClone(record.id==='session-one'?snapshot():copies.get(record.id));
    device.context.auxCloudSessionCipher=async (_account,_id,copy)=>Buffer.from(JSON.stringify(copy));device.context.auxCloudUploadBytes=async (_account,bytes)=>{lastUpload=JSON.parse(bytes.toString());return{id:'fixture-blob'};};
    device.context.auxCloudSessionJSON=async (_account,route,method,_body,headers)=>{const id=route.split('/').at(-1);calls.push({id,method,headers});if(method==='GET'){if(id==='session-one')return{id,revision};if(!copies.has(id))throw new device.context.AsideApiError(404);return{id,revision:1};}if(method==='PUT'){copies.set(id,lastUpload);return{id,revision:1};}assert.equal(copies.size>0,true);assert.equal(headers['X-Aux-If-Match'],'"'+revision+'"');if(race){race=false;revision=3;throw new device.context.AsideApiError(412);}return{id,revision:revision+1,deletedAt:'2026-10-22T00:00:00Z'};};
    await assert.rejects(device.context.auxCloudFlushSessionDeletion(1,'session-one',state));assert.equal(state.sessions['session-one'].pendingDelete,true);assert.equal(copies.size,1);
    await device.context.auxCloudFlushSessionDeletion(1,'session-one',state);assert.equal(copies.size,2);assert.equal(state.sessions['session-one'].pendingDelete,false);assert.equal(state.sessions['session-one'].deleted,true);assert.equal([...copies.values()].every(copy=>copy.session.title.includes('conflict copy')&&copy.originSessionId==='session-one'),true);
  } finally {await fs.rm(root,{recursive:true,force:true});}
});

test('restart checkpoint rolls back a file-only replacement and refuses a later local edit', async () => {
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'aux-session-restart-'));
  try {
    const device=fixture(root), original=snapshot();await device.context.auxCloudRestoreSessionSnapshot(1,original);const local=device.sessions.get(original.session.id), before=await device.context.auxCloudSessionSnapshot(1,local.id), identity=device.context.auxCloudSessionIdentity(1), changed=snapshot();changed.rows=rows([...changed.rows.map(row=>row.msg),{role:'user',content:'remote update before crash',timestamp:4}]);
    const checkpoint=device.context.auxCloudSessionRestoreJournal(1,local.id,identity), saved={version:1,identity,id:local.id,createdAt:local.createdAt.toISOString(),previousRevision:1,targetRevision:2,previousRows:before.rows,previousRowsDigest:device.context.auxCloudSessionRowsDigest(before.rows),targetRowsDigest:device.context.auxCloudSessionRowsDigest(changed.rows),previousMetaDigest:createHash('sha256').update(JSON.stringify(device.context.auxCloudSessionMeta(local,local.id))).digest('hex'),targetMetaDigest:'uncommitted'};
    await fs.writeFile(checkpoint,JSON.stringify(saved),{mode:0o600});device.context.rewriteSessionMessageJsonlRows(1,local,changed.rows);await device.context.auxCloudRecoverSessionRestores(1);assert.equal(device.context.auxCloudSessionDigest(await device.context.auxCloudSessionSnapshot(1,local.id)),device.context.auxCloudSessionDigest(before));
    await fs.writeFile(checkpoint,JSON.stringify(saved),{mode:0o600});device.context.rewriteSessionMessageJsonlRows(1,local,rows([{role:'user',content:'new local work after crash',timestamp:7}]));await assert.rejects(device.context.auxCloudRecoverSessionRestores(1),/local changes/);assert.equal((await device.context.SessionStore.listAllMessageRows(1,local.id))[0].msg.content,'new local work after crash');assert.equal((await fs.stat(checkpoint)).isFile(),true);
  } finally {await fs.rm(root,{recursive:true,force:true});}
});
