/** Reviewed snapshot buffers -> newly created private SQLite clone only.
 * Never opens an original/profile path. Strict complete-WAL acceptance; no
 * silent valid-prefix recovery, journal dropping or no-WAL fallback.
 */
import * as fs from 'node:fs/promises';
import { constants as fileConstants } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { prepareSqliteProviderIdentity } from './aux-sqlite-provider-identity.mjs';

const MAX = 64 * 1024 * 1024;
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const hashPattern = /^[a-f0-9]{64}$/;
function pageSize(database) { const size = database.readUInt16BE(16); return size === 1 ? 65536 : size; }
function checksum(bytes, bigEndian, state = [0, 0]) {
  let [first, second] = state;
  const word = bigEndian ? offset => bytes.readUInt32BE(offset) : offset => bytes.readUInt32LE(offset);
  for (let offset = 0; offset < bytes.length; offset += 8) {
    first = (first + word(offset) + second) >>> 0;
    second = (second + word(offset + 4) + first) >>> 0;
  }
  return [first, second];
}
function project(database, wal) {
  if (database.length < 512 || database.subarray(0, 16).toString() !== 'SQLite format 3\0') throw Error('Unsupported SQLite main snapshot');
  const page = pageSize(database);
  if (page < 512 || page > 65536 || (page & (page - 1)) || database.length % page || ![1, 2].includes(database[18]) || database[18] !== database[19]) throw Error('Unsupported main page layout');
  if (!wal?.length) return { projection: Buffer.from(database), pageSize: page, frames: 0, commits: 0, finalPages: database.length / page };
  if (database[18] !== 2 || wal.length < 32) throw Error('WAL snapshot/main mode mismatch');
  const magic = wal.readUInt32BE(0), bigEndian = magic === 0x377f0683;
  if (![0x377f0682, 0x377f0683].includes(magic) || wal.readUInt32BE(4) !== 3007000 || wal.readUInt32BE(8) !== page || (wal.length - 32) % (24 + page)) throw Error('Malformed WAL header, page size or torn frame tail');
  let state = checksum(wal.subarray(0, 24), bigEndian);
  if (state[0] !== wal.readUInt32BE(24) || state[1] !== wal.readUInt32BE(28)) throw Error('WAL header checksum mismatch');
  const frames = (wal.length - 32) / (24 + page), pages = [];
  let commits = 0, finalPages = database.length / page, finalCommitFrame = 0;
  for (let index = 0; index < frames; index++) {
    const offset = 32 + index * (24 + page), frame = wal.subarray(offset, offset + 24), body = wal.subarray(offset + 24, offset + 24 + page);
    const number = frame.readUInt32BE(0), size = frame.readUInt32BE(4);
    if (!number || number * page > MAX || size * page > MAX || !frame.subarray(8, 16).equals(wal.subarray(16, 24))) throw Error('WAL frame page bound or salt mismatch');
    state = checksum(body, bigEndian, checksum(frame.subarray(0, 8), bigEndian, state));
    if (state[0] !== frame.readUInt32BE(16) || state[1] !== frame.readUInt32BE(20)) throw Error('WAL frame checksum mismatch');
    pages.push({ number, body });
    if (size) { commits++; finalPages = size; finalCommitFrame = index + 1; }
  }
  if (frames && finalCommitFrame !== frames) throw Error('Unsupported uncommitted WAL tail; no frames discarded');
  const projection = Buffer.alloc(finalPages * page);
  database.copy(projection, 0, 0, Math.min(database.length, projection.length));
  for (const entry of pages) if (entry.number <= finalPages) entry.body.copy(projection, (entry.number - 1) * page);
  return { projection, pageSize: page, frames, commits, finalPages };
}
async function assertScope(capability, hashes, phase) {
  if (!capability || capability.disposable !== true || capability.exclusive !== true || capability.rollbackJournalAbsent !== true || !/^[A-Za-z0-9-]{8,128}$/.test(capability.id) || typeof capability.assertStopped !== 'function' || await capability.assertStopped({ ...hashes, phase }) !== true) throw Error('Live stopped-exclusive disposable snapshot capability required');
}
async function writePrivate(filename, bytes) {
  const handle = await fs.open(filename, fileConstants.O_CREAT | fileConstants.O_EXCL | fileConstants.O_WRONLY | fileConstants.O_NOFOLLOW, 0o600);
  try { await handle.writeFile(bytes); await handle.sync(); }
  finally { await handle.close(); }
}
async function syncPath(filename) {
  const handle = await fs.open(filename, fileConstants.O_RDONLY | fileConstants.O_NOFOLLOW);
  try { await handle.sync(); } finally { await handle.close(); }
}

export async function checkpointPrivateSqliteSnapshot({ databaseBytes, expectedSha256, walBytes, expectedWalSha256, rollbackJournalBytes, capability }) {
  if (!(databaseBytes instanceof Uint8Array) || databaseBytes.length > MAX || !hashPattern.test(expectedSha256) || sha(databaseBytes) !== expectedSha256 || (walBytes !== null && !(walBytes instanceof Uint8Array)) || walBytes?.length > MAX || expectedWalSha256 !== (walBytes === null ? null : sha(walBytes))) throw Error('Invalid bounded database/WAL snapshot or expected hashes');
  if (rollbackJournalBytes !== null) throw Error('Rollback-journal snapshot unsupported; explicit verified absence required');
  const hashes = { databaseSha256: expectedSha256, walSha256: expectedWalSha256 };
  await assertScope(capability, hashes, 'validate-wal-snapshot');
  const database = Buffer.from(databaseBytes), wal = walBytes === null ? null : Buffer.from(walBytes);
  let projection, directory, directoryIdentity, db;
  try {
    if (sha(database) !== expectedSha256 || (wal === null ? null : sha(wal)) !== expectedWalSha256) throw Error('Snapshot buffers changed before private cloning');
    const validated = project(database, wal); projection = validated.projection;
    await assertScope(capability, hashes, 'create-private-clone');
    directory = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'aux-sqlite-wal-copy-')));
    await fs.chmod(directory, 0o700);
    directoryIdentity = await fs.lstat(directory);
    if (!directoryIdentity.isDirectory() || directoryIdentity.uid !== process.getuid() || (directoryIdentity.mode & 0o7777) !== 0o700) throw Error('Unsafe private clone directory');
    const filename = path.join(directory, 'state.db');
    await writePrivate(filename, database);
    if (wal?.length) await writePrivate(`${filename}-wal`, wal);
    await syncPath(directory);
    db = new DatabaseSync(filename, { allowExtension: false }); db.enableDefensive(true);
    db.exec('PRAGMA trusted_schema=OFF; PRAGMA temp_store=MEMORY; PRAGMA wal_autocheckpoint=0; PRAGMA synchronous=FULL;');
    const checkpoint = db.prepare('PRAGMA wal_checkpoint(FULL)').get();
    if (checkpoint.busy !== 0 || (validated.frames > 0 && (checkpoint.log !== validated.frames || checkpoint.checkpointed !== validated.frames))) throw Error('Private WAL checkpoint did not acknowledge all validated frames');
    const checkpointed = await fs.readFile(filename);
    if (!checkpointed.equals(projection)) throw Error('Private checkpoint differs from independent committed-page projection; no base-database fallback accepted');
    await assertScope(capability, hashes, 'checkpointed-private-clone');
    if (db.prepare('PRAGMA journal_mode=DELETE').get().journal_mode !== 'delete') throw Error('Private clone did not leave WAL mode');
    db.close(); db = null;
    await syncPath(filename); await syncPath(directory);
    const output = await fs.readFile(filename);
    if (output.length !== checkpointed.length || output[18] !== 1 || output[19] !== 1 || !output.subarray(100).equals(checkpointed.subarray(100))) throw Error('Leaving WAL mode changed private clone data pages');
    // Reuse the separately pinned schema/selection validator on another memory
    // clone. Its provider-migrated bytes are deliberately discarded: this helper
    // only checkpoints, and returns the original logical provider values.
    const validation = await prepareSqliteProviderIdentity({
      databaseBytes: output, expectedSha256: sha(output), walBytes: null,
      capability: { ...capability, assertStopped: async () => { await assertScope(capability, hashes, 'validate-checkpointed-schema'); return true; } },
    });
    validation.bytes.fill(0);
    await assertScope(capability, hashes, 'wal-copy-prepared');
    return {
      bytes: output,
      receipt: { format: 'aux.sqlite-wal-copy.v1', sourceSha256: expectedSha256, sourceWalSha256: expectedWalSha256, outputSha256: sha(output), frames: validated.frames, committedTransactions: validated.commits, finalPages: validated.finalPages, pageSize: validated.pageSize, independentlyProjectedCheckpoint: true, outputJournalMode: 'delete', targetSchemaSha256: validation.receipt.targetSchemaSha256, providerMigrationApplied: false, sourceUnchanged: true },
    };
  } finally {
    db?.close(); database.fill(0); wal?.fill(0); projection?.fill(0);
    if (directory) {
      const current = await fs.lstat(directory);
      if (current.isSymbolicLink() || !current.isDirectory() || current.dev !== directoryIdentity?.dev || current.ino !== directoryIdentity?.ino || current.uid !== process.getuid()) throw Error('Private clone cleanup identity changed; retained for review');
      await fs.rm(directory, { recursive: true, force: false });
    }
  }
}
