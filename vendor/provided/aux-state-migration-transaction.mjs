/** External offline migration tool. Never bundled into the delivered app.
 * Every call requires a live, caller-owned exclusive stopped-disposable scope.
 * Multi-file rename is journaled, not atomic. No advisory lock stops browsers.
 */
import * as fs from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import { createHash, randomBytes } from 'node:crypto';

const FORMAT = 'aux.state-migration.v1';
const sha = value => createHash('sha256').update(value).digest('hex');
const noFollow = constants.O_NOFOLLOW;
if (!noFollow || typeof process.getuid !== 'function') throw Error('State migration requires POSIX no-follow files');
const uid = BigInt(process.getuid());
const hashPattern = /^[a-f0-9]{64}$/;
function safeRelative(value) {
  if (typeof value !== 'string' || value.length > 1024 || value.split('/').some(part => !/^[A-Za-z0-9_. -]+$/.test(part) || part === '.' || part === '..' || part.endsWith('.') || part.endsWith(' ') || part.startsWith('.aux-migration-') || part.startsWith('.aux-state-migration-')) || path.isAbsolute(value) || value.startsWith('.aux-state-migration-')) throw Error('Unsafe migration target path');
  return value;
}
function identity(stat) { return { dev: String(stat.dev), ino: String(stat.ino), uid: String(stat.uid), mode: Number(stat.mode & 0o777n), size: Number(stat.size) }; }
function sameIdentity(a, b) { return a && b && ['dev', 'ino', 'uid', 'mode', 'size'].every(key => a[key] === b[key]); }
function safeStat(stat, directory) {
  if ((directory ? !stat.isDirectory() : !stat.isFile()) || stat.isSymbolicLink() || stat.uid !== uid || (stat.mode & 0o7077n) !== 0n || (!directory && ((stat.mode & 0o111n) !== 0n || stat.nlink !== 1n))) throw Error('Unsafe migration ownership, permissions or file alias');
  if (!directory && stat.size > 64n * 1024n * 1024n) throw Error('Migration file exceeds 64 MiB');
}
async function syncDirectory(directory) {
  const handle = await fs.open(directory, constants.O_RDONLY | noFollow);
  try { const stat = await handle.stat({ bigint: true }); safeStat(stat, true); await handle.sync(); }
  finally { await handle.close(); }
}
async function validateRoot(root, expected) {
  if (typeof root !== 'string' || path.resolve(root) !== root || await fs.realpath(root) !== root) throw Error('Disposable root must be an exact canonical path');
  const stat = await fs.lstat(root, { bigint: true }); safeStat(stat, true);
  const current = identity(stat);
  // Directory sizes change as this transaction creates its journal/temp files.
  if (expected && ['dev', 'ino', 'uid', 'mode'].some(key => expected[key] !== current[key])) throw Error('Disposable root identity changed');
  return current;
}
async function proof(root, capability, phase, transactionId, rootIdentity) {
  await validateRoot(root, rootIdentity);
  if (!capability || capability.root !== root || capability.disposable !== true || capability.exclusive !== true || !/^[A-Za-z0-9-]{8,128}$/.test(capability.id) || typeof capability.assertStopped !== 'function' || await capability.assertStopped({ root, phase, transactionId }) !== true) throw Error('Live exclusive stopped-disposable capability required');
}
async function checkedPath(root, relative, parents, capture = false) {
  const parts = relative.split('/'); let directory = root;
  for (let i = 0; i < parts.length - 1; i++) {
    directory = path.join(directory, parts[i]);
    if (await fs.realpath(directory) !== directory) throw Error('Symlink or aliased migration directory');
    const stat = await fs.lstat(directory, { bigint: true }); safeStat(stat, true);
    const name = parts.slice(0, i + 1).join('/'), current = identity(stat);
    if (capture && !parents[name]) parents[name] = current;
    if (!parents[name] || ['dev', 'ino', 'uid', 'mode'].some(key => parents[name][key] !== current[key])) throw Error('Migration parent identity changed');
  }
  return path.join(root, relative);
}
async function readChecked(filename) {
  const handle = await fs.open(filename, constants.O_RDONLY | noFollow);
  try {
    const before = await handle.stat({ bigint: true }); safeStat(before, false);
    const bytes = await handle.readFile(); const after = await handle.stat({ bigint: true }); safeStat(after, false);
    if (!sameIdentity(identity(before), identity(after)) || before.mtimeNs !== after.mtimeNs || before.ctimeNs !== after.ctimeNs) throw Error('Migration file changed during read');
    return { bytes, hash: sha(bytes), identity: identity(after) };
  } finally { await handle.close(); }
}
async function exclusiveWrite(filename, bytes, mode = 0o600) {
  const handle = await fs.open(filename, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | noFollow, mode);
  try { await handle.writeFile(bytes); await handle.sync(); const stat = await handle.stat({ bigint: true }); safeStat(stat, false); return identity(stat); }
  finally { await handle.close(); }
}
function journalPath(root, transactionId) {
  if (!/^[a-f0-9]{32}$/.test(transactionId)) throw Error('Invalid migration transaction ID');
  return path.join(root, `.aux-state-migration-${transactionId}`);
}
async function checkJournalDirectory(root, journal) {
  const directory = journalPath(root, journal.id);
  if (await fs.realpath(directory) !== directory) throw Error('Aliased journal directory');
  const stat = await fs.lstat(directory, { bigint: true }); safeStat(stat, true);
  if (journal.directoryIdentity && ['dev', 'ino', 'uid', 'mode'].some(key => identity(stat)[key] !== journal.directoryIdentity[key])) throw Error('Migration journal directory changed');
  return directory;
}
async function writeJournal(root, journal) {
  const directory = await checkJournalDirectory(root, journal);
  const temporary = path.join(directory, `journal-${randomBytes(8).toString('hex')}.next`);
  await exclusiveWrite(temporary, Buffer.from(JSON.stringify(journal) + '\n'));
  await fs.rename(temporary, path.join(directory, 'journal.json'));
  await syncDirectory(directory);
}
async function load(root, capability, transactionId) {
  await proof(root, capability, 'load', transactionId);
  const directory = journalPath(root, transactionId);
  if (await fs.realpath(directory) !== directory) throw Error('Aliased journal directory');
  safeStat(await fs.lstat(directory, { bigint: true }), true);
  const data = await readChecked(path.join(directory, 'journal.json'));
  const journal = JSON.parse(data.bytes.toString());
  if (journal.format !== FORMAT || journal.id !== transactionId || journal.root !== root || journal.capabilityId !== capability.id || !Array.isArray(journal.entries) || journal.entries.length < 1 || journal.entries.length > 128 || !['preparing', 'prepared', 'committing', 'committed', 'rolling-back', 'rolled-back'].includes(journal.phase)) throw Error('Invalid migration journal');
  await proof(root, capability, 'journal-loaded', transactionId, journal.rootIdentity);
  await checkJournalDirectory(root, journal);
  const names = new Set();
  for (const [index, entry] of journal.entries.entries()) {
    safeRelative(entry.path);
    if (names.has(entry.path.toLowerCase()) || !hashPattern.test(entry.beforeHash) || !hashPattern.test(entry.afterHash) || entry.backup !== `${index}.original` || entry.temp !== path.posix.join(path.posix.dirname(entry.path), `.aux-migration-${transactionId}-${index}.new`).replace(/^\.\//, '')) throw Error('Invalid migration journal target');
    names.add(entry.path.toLowerCase());
  }
  return journal;
}
async function inspect(root, journal, entry) {
  const filename = await checkedPath(root, entry.path, journal.parents);
  const current = await readChecked(filename);
  current.bytes.fill(0);
  if (current.hash === entry.beforeHash && (sameIdentity(current.identity, entry.beforeIdentity) || sameIdentity(current.identity, entry.rollbackIdentity))) return { state: 'old', current, filename };
  if (current.hash === entry.afterHash && sameIdentity(current.identity, entry.afterIdentity)) return { state: 'new', current, filename };
  throw Error(`Concurrent or unknown migration state: ${entry.path}`);
}
async function checkAll(root, journal) {
  const states = [];
  for (const entry of journal.entries) states.push(await inspect(root, journal, entry));
  return states;
}
async function verifyBackups(root, journal, allowIncomplete = false) {
  const directory = await checkJournalDirectory(root, journal);
  for (const entry of journal.entries) {
    if (allowIncomplete && !entry.backupIdentity) continue;
    const backup = await readChecked(path.join(directory, entry.backup));
    if (backup.hash !== entry.beforeHash || !sameIdentity(backup.identity, entry.backupIdentity)) throw Error('Migration original backup changed or incomplete');
    backup.bytes.fill(0);
  }
}
async function checkpoint(callback, stage, index) { if (callback) await callback({ stage, index }); }

export function createStateMigrationId() { return randomBytes(16).toString('hex'); }
export async function prepareStateMigration({ root, capability, transactionId: id, files, onCheckpoint }) {
  journalPath(root, id);
  await proof(root, capability, 'prepare', id);
  if (!Array.isArray(files) || files.length < 1 || files.length > 128) throw Error('Explicit bounded migration targets required');
  const journal = { format: FORMAT, id, root, rootIdentity: await validateRoot(root), capabilityId: capability.id, phase: 'preparing', parents: {}, entries: [] };
  const names = new Set(), inodes = new Set(), payloads = []; let totalBytes = 0;
  try {
    for (const [index, file] of files.entries()) {
      const relative = safeRelative(file.path);
      if (names.has(relative.toLowerCase()) || !hashPattern.test(file.expectedSha256) || !(file.bytes instanceof Uint8Array)) throw Error('Duplicate or invalid migration target');
      names.add(relative.toLowerCase());
      const filename = await checkedPath(root, relative, journal.parents, true);
      if (await fs.realpath(filename) !== filename) throw Error('Symlink or aliased migration file');
      const original = await readChecked(filename), inode = `${original.identity.dev}:${original.identity.ino}`;
      if (inodes.has(inode) || original.hash !== file.expectedSha256) throw Error('Migration target alias or before-write hash conflict');
      inodes.add(inode);
      const next = Buffer.from(file.bytes); totalBytes += next.length + original.bytes.length;
      if (next.length > 64 * 1024 * 1024 || totalBytes > 128 * 1024 * 1024) throw Error('Migration payload limit exceeded');
      journal.entries.push({ path: relative, beforeHash: original.hash, afterHash: sha(next), beforeIdentity: original.identity, backup: `${index}.original`, temp: path.posix.join(path.posix.dirname(relative), `.aux-migration-${id}-${index}.new`).replace(/^\.\//, '') });
      payloads.push({ original: original.bytes, next });
    }
    await proof(root, capability, 'prepare-journal', id, journal.rootIdentity);
    const directory = journalPath(root, id); await fs.mkdir(directory, { mode: 0o700 });
    journal.directoryIdentity = identity(await fs.lstat(directory, { bigint: true }));
    await syncDirectory(root); await writeJournal(root, journal);
    for (const [index, entry] of journal.entries.entries()) {
      await proof(root, capability, 'prepare-file', id, journal.rootIdentity);
      entry.backupIdentity = await exclusiveWrite(path.join(directory, entry.backup), payloads[index].original);
      await syncDirectory(directory);
      const temporary = await checkedPath(root, entry.temp, journal.parents);
      entry.afterIdentity = await exclusiveWrite(temporary, payloads[index].next, entry.beforeIdentity.mode);
      await syncDirectory(path.dirname(temporary)); await writeJournal(root, journal);
      await checkpoint(onCheckpoint, 'prepared-file', index);
    }
    await proof(root, capability, 'prepared', id, journal.rootIdentity); await checkAll(root, journal);
    journal.phase = 'prepared'; await writeJournal(root, journal);
    return { transactionId: id, journalRelative: path.basename(directory) };
  } finally { for (const payload of payloads) { payload.original.fill(0); payload.next.fill(0); } }
}

function receiptValue(root, journal, status) {
  return { format: FORMAT, transactionId: journal.id, status, rootSha256: sha(root), capabilityId: journal.capabilityId, files: journal.entries.map(entry => ({ path: entry.path, beforeSha256: entry.beforeHash, afterSha256: entry.afterHash })) };
}
async function receipt(root, journal, status) {
  const directory = await checkJournalDirectory(root, journal);
  const value = receiptValue(root, journal, status);
  const bytes = Buffer.from(JSON.stringify(value) + '\n');
  const filename = path.join(directory, `${status}-receipt.json`);
  try { await exclusiveWrite(filename, bytes); await syncDirectory(directory); }
  catch (error) { if (error.code !== 'EEXIST' || (await readChecked(filename)).hash !== sha(bytes)) throw error; }
  return { ...value, receiptSha256: sha(bytes) };
}
async function applyNew(root, capability, journal, onCheckpoint) {
  await verifyBackups(root, journal); const all = await checkAll(root, journal);
  if (journal.phase === 'preparing' && journal.entries.some(entry => !entry.afterIdentity)) throw Error('Preparation incomplete; explicit rollback required');
  for (const [index, entry] of journal.entries.entries()) {
    if (all[index].state === 'new') continue;
    const staged = await readChecked(await checkedPath(root, entry.temp, journal.parents));
    if (staged.hash !== entry.afterHash || !sameIdentity(staged.identity, entry.afterIdentity)) throw Error('Prepared migration output changed or missing');
    staged.bytes.fill(0);
  }
  journal.phase = 'committing'; await writeJournal(root, journal);
  for (const [index, entry] of journal.entries.entries()) {
    await proof(root, capability, 'before-commit-file', journal.id, journal.rootIdentity);
    const states = await checkAll(root, journal); if (states[index].state === 'new') continue;
    const temporary = await checkedPath(root, entry.temp, journal.parents);
    const staged = await readChecked(temporary);
    if (staged.hash !== entry.afterHash || !sameIdentity(staged.identity, entry.afterIdentity)) throw Error('Prepared migration output changed');
    staged.bytes.fill(0);
    await proof(root, capability, 'commit-rename', journal.id, journal.rootIdentity);
    if ((await inspect(root, journal, entry)).state !== 'old') throw Error('Migration target changed before rename');
    await fs.rename(temporary, states[index].filename); await syncDirectory(path.dirname(states[index].filename));
    await checkpoint(onCheckpoint, 'renamed-new-file', index);
    await writeJournal(root, journal);
  }
  await proof(root, capability, 'commit-complete', journal.id, journal.rootIdentity);
  if ((await checkAll(root, journal)).some(item => item.state !== 'new')) throw Error('Incomplete migration commit');
  journal.phase = 'committed'; await writeJournal(root, journal);
  return receipt(root, journal, 'committed');
}
export async function commitStateMigration({ root, capability, transactionId, onCheckpoint }) {
  const journal = await load(root, capability, transactionId);
  if (journal.phase !== 'prepared') throw Error('Explicit recovery required for interrupted or completed migration');
  return applyNew(root, capability, journal, onCheckpoint);
}
export async function recoverStateMigration({ root, capability, transactionId, action, onCheckpoint }) {
  if (!['complete', 'rollback'].includes(action)) throw Error('Explicit complete or rollback action required');
  const journal = await load(root, capability, transactionId);
  if (action === 'complete') {
    if (['rolling-back', 'rolled-back'].includes(journal.phase)) throw Error('Cannot complete a rollback');
    return applyNew(root, capability, journal, onCheckpoint);
  }
  const states = await checkAll(root, journal);
  // Incomplete preparation never renamed targets; safe rollback needs no backup
  // for still-original files. Changed/new files always require verified originals.
  if (states.some(item => item.state === 'new')) await verifyBackups(root, journal);
  journal.phase = 'rolling-back'; await writeJournal(root, journal);
  for (const [index, entry] of journal.entries.entries()) {
    await proof(root, capability, 'before-rollback-file', journal.id, journal.rootIdentity);
    const all = await checkAll(root, journal); if (all[index].state === 'old') continue;
    const original = await readChecked(path.join(await checkJournalDirectory(root, journal), entry.backup));
    if (original.hash !== entry.beforeHash || !sameIdentity(original.identity, entry.backupIdentity)) throw Error('Original migration backup changed');
    const relative = path.posix.join(path.posix.dirname(entry.path), `.aux-migration-${journal.id}-${index}-${randomBytes(6).toString('hex')}.rollback`).replace(/^\.\//, '');
    const temporary = await checkedPath(root, relative, journal.parents);
    try { entry.rollbackIdentity = await exclusiveWrite(temporary, original.bytes, entry.beforeIdentity.mode); }
    finally { original.bytes.fill(0); }
    await syncDirectory(path.dirname(temporary)); await writeJournal(root, journal);
    await proof(root, capability, 'rollback-rename', journal.id, journal.rootIdentity);
    if ((await inspect(root, journal, entry)).state !== 'new') throw Error('Rollback target changed');
    await fs.rename(temporary, all[index].filename); await syncDirectory(path.dirname(all[index].filename));
    await checkpoint(onCheckpoint, 'renamed-old-file', index); await writeJournal(root, journal);
  }
  await proof(root, capability, 'rollback-complete', journal.id, journal.rootIdentity);
  if ((await checkAll(root, journal)).some(item => item.state !== 'old')) throw Error('Incomplete migration rollback');
  journal.phase = 'rolled-back'; await writeJournal(root, journal);
  return receipt(root, journal, 'rolled-back');
}
export async function verifyStateMigration({ root, capability, transactionId, expectedReceiptSha256 }) {
  if (!hashPattern.test(expectedReceiptSha256)) throw Error('Exact expected receipt hash required');
  const journal = await load(root, capability, transactionId);
  if (!['committed', 'rolled-back'].includes(journal.phase)) throw Error('Migration is not terminal');
  await verifyBackups(root, journal, journal.phase === 'rolled-back');
  const target = journal.phase === 'committed' ? 'new' : 'old';
  if ((await checkAll(root, journal)).some(item => item.state !== target)) throw Error('Migration result changed');
  const record = await readChecked(path.join(await checkJournalDirectory(root, journal), `${journal.phase}-receipt.json`));
  if (record.hash !== expectedReceiptSha256) throw Error('Migration receipt mismatch');
  const value = JSON.parse(record.bytes.toString());
  if (JSON.stringify(value) !== JSON.stringify(receiptValue(root, journal, journal.phase))) throw Error('Invalid migration receipt');
  return { verified: true, status: journal.phase, transactionId, receiptSha256: record.hash, originalsRetained: true };
}
