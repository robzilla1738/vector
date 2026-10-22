import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { applyCloudAttachmentAdapter, cloudAttachmentHelpers } from './cloud-attachment-adapter.mjs';

const original = await fs.readFile('/Users/rcourson/Downloads/aside-rea 2/extracted/daemon-app/index.mjs', 'utf8');
const suppliedWriter = original.slice(original.indexOf('function attachmentFilename('), original.indexOf('function normalizeToolResultContent('));
test('attachment and large-share patch count-checks the actual supplied daemon', () => {
  const result = applyCloudAttachmentAdapter(original);
  assert.equal(result.anchors.length, 4);
  assert.throws(() => applyCloudAttachmentAdapter(result.text), /anchor changed/);
  assert.throws(() => applyCloudAttachmentAdapter(original.replace('async function publishSharedSession(Cn,ei,ti){let ni=', 'async function changedPublisher(){')), /anchor changed/);
});

function fixture(root, data = Buffer.from('private file fixture')) {
  const account = { userId: 'fixture-owner', createdAt: '2026-10-21' }, record = { id: '00000000-0000-4000-8000-000000000001', attachmentId: 'attachment-one', localPath: 'attachments/file.txt', size: data.length, sha256: createHash('sha256').update(data).digest('hex'), mimeType: 'text/plain' };
  const context = vm.createContext({ Buffer, Buffer$1: Buffer, Map, Set, JSON, Number, Error, URL, AbortSignal,
    path, nodeFs: fs, constants$1: constants, SESSION_ATTACHMENTS_DIR: 'attachments', import_mime_types$2: { extension: () => 'txt' }, resolveSessionPath: (dir, entry) => path.resolve(dir, entry),
    getSessionStorageDir: () => root, isSyncEnabled: () => true,
    AccountRegistry: { getAccount: () => account, getSession: () => ({ accessToken: 'fixture-token' }) },
    sha256Hex: bytes => createHash('sha256').update(bytes).digest('hex'), AsideApiError: class extends Error {},
    fetchAsideAPIAuthenticatedRequest: async (_accountId, route) => route.startsWith('/attachment-sessions/') ? Response.json(record) : new Response(data),
  });
  new vm.Script(suppliedWriter + cloudAttachmentHelpers, { importModuleDynamically: vm.constants.USE_MAIN_CONTEXT_DEFAULT_LOADER }).runInContext(context);
  return { context, account, record };
}

test('cloud restore uses supplied attachment writer under an existing session root', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'aux-attachment-restore-'));
  try {
    const { context } = fixture(root);
    assert.equal(context.auxCloudStoredAttachmentPath('./attachments/file.txt'), 'attachments/file.txt');
    for (const unsafe of ['../file', 'attachments/../file', '/attachments/file', 'attachments/a/b', 'attachments/..']) assert.equal(context.auxCloudStoredAttachmentPath(unsafe), null);
    const restored = await context.auxCloudRestoreAttachment(1, { id: 'session-one', incognito: false }, './attachments/file.txt');
    assert.equal(restored, './attachments/file.txt');
    assert.equal(await fs.readFile(path.join(root, 'attachments/file.txt'), 'utf8'), 'private file fixture');
  } finally { await fs.rm(root, { recursive: true, force: true }); }
});

test('restore rejects redirected directories and corrupt content before any file write', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'aux-attachment-symlink-')), outside = await fs.mkdtemp(path.join(os.tmpdir(), 'aux-attachment-outside-'));
  try {
    await fs.symlink(outside, path.join(root, 'attachments'));
    const { context, record } = fixture(root);
    await assert.rejects(context.auxCloudRestoreAttachment(1, { id: 'session-one' }, 'attachments/file.txt'), /redirected/);
    assert.deepEqual(await fs.readdir(outside), []);
    await fs.unlink(path.join(root, 'attachments'));
    record.sha256 = 'a'.repeat(64);
    await assert.rejects(context.auxCloudRestoreAttachment(1, { id: 'session-one' }, 'attachments/file.txt'), /integrity/);
    assert.deepEqual(await fs.readdir(root), []);
  } finally { await fs.rm(root, { recursive: true, force: true }); await fs.rm(outside, { recursive: true, force: true }); }
});

test('incognito and ephemeral sessions never trigger cloud restore', async () => {
  const { context } = fixture('/never-accessed');
  assert.equal(await context.auxCloudRestoreAttachment(1, { id: 'session', incognito: true }, 'attachments/file.txt'), null);
  assert.equal(await context.auxCloudRestoreAttachment(1, { id: 'session', ephemeral: true }, 'attachments/file.txt'), null);
});

test('large-share transfer uses scoped signed PUT without forwarding account authorization', async () => {
  const { context } = fixture('/not-used');
  let intent, uploaded = false;
  const attachmentId = '00000000-0000-4000-8000-000000000001';
  context.toSharedSessionMessages = messages => messages;
  context.sharedSessionLinkSchema = { parse: value => value };
  context.toSharedSessionLink = id => ({ id, url: `https://share.getaux.co/s/${id}` });
  context.fetchAsideAPIAuthenticatedRequest = async (_account, route, options) => {
    if (route === '/attachments/intents') { intent = JSON.parse(options.body); return Response.json({ id: attachmentId }); }
    if (route.endsWith('/upload-url')) return Response.json({ url: 'https://blob.vercel-storage.com/?disposable=signature' });
    assert.ok(route.endsWith('/commit'));
    assert.equal(uploaded, true);
    return Response.json({ id: attachmentId, sha256: intent.sha256, size: intent.size, share: { id: 'disposable-share-fixture', title: 'Fixture', createdAt: '2026-10-21T00:00:00Z' } });
  };
  context.fetch = async (_url, options) => {
    assert.equal(options.method, 'PUT');
    assert.equal(options.headers.Authorization, undefined);
    assert.equal(options.headers['content-type'], 'application/json');
    assert.equal(options.redirect, 'error');
    assert.equal(options.body.length, intent.size);
    uploaded = true;
    return new Response(null, { status: 200 });
  };
  const result = await context.auxCloudPublishLargeSession(1, { id: 'fixture-session', title: 'Fixture' }, [{ role: 'user', content: 'x'.repeat(3_600_000), timestamp: 1 }]);
  assert.equal(intent.purpose, 'share');
  assert.equal(result.id, 'disposable-share-fixture');
});
