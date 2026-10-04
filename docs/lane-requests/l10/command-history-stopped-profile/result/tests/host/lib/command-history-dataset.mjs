import assert from 'node:assert/strict';
import { constants, closeSync, fstatSync, lstatSync, openSync, readFileSync, realpathSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { readStoppedCommandProfile } from './app.mjs';
export const COMMAND_HISTORY_ROWS = 50000;
const datasets = new WeakMap();
function origin(fixtureUrl) {
  const url = new URL(fixtureUrl); assert.equal(url.protocol, 'http:'); assert.equal(url.hostname, '127.0.0.1');
  assert.ok(url.port); assert.equal(url.pathname, '/'); assert.ok(!url.username && !url.password && !url.search && !url.hash); return url.origin;
}
function originalProfile(lease) {
  const row = readStoppedCommandProfile(lease); assert.equal(row.profile, 'Default'); assert.equal(row.originalChild.closed, true);
  assert.match(row.fixtureId, /^[a-f0-9]{32}$/); assert.ok(row.originalChild.pid > 0 && row.generation > 0); return row;
}
function pin(path, directory) {
  const value = lstatSync(path); assert.ok(!value.isSymbolicLink() && value.uid === process.getuid());
  assert.ok(directory ? value.isDirectory() : value.isFile() && value.nlink === 1 && value.size > 0 && value.size <= 64 * 1024 * 1024);
  assert.ok((value.mode & 0o022) === 0); assert.equal(realpathSync(path), path);
  return { dev: value.dev, ino: value.ino, uid: value.uid, mode: value.mode & 0o777 };
}
function database(profile, operation, readOnly = false) {
  const parent = join(profile.userDataDir, 'Default'), path = join(parent, 'History');
  const parentPin = pin(parent, true), filePin = pin(path, false);
  for (const suffix of ['-journal', '-wal', '-shm']) assert.ok(!existsSync(path + suffix), 'Original History has outstanding journal debt');
  const fd = openSync(path, (readOnly ? constants.O_RDONLY : constants.O_RDWR) | constants.O_NOFOLLOW | constants.O_CLOEXEC);
  let db, primary;
  try {
    const opened = fstatSync(fd); assert.equal(opened.dev, filePin.dev); assert.equal(opened.ino, filePin.ino);
    db = new DatabaseSync(path, { readOnly }); const result = operation(db); db.close(); db = undefined;
    assert.deepEqual(pin(parent, true), parentPin); assert.deepEqual(pin(path, false), filePin);
    assert.equal(fstatSync(fd).ino, filePin.ino); assert.equal(fstatSync(fd).dev, filePin.dev);
    for (const suffix of ['-journal', '-wal', '-shm']) assert.ok(!existsSync(path + suffix), 'History journal cleanup is unconfirmed');
    return { ...result, file: { path, ...filePin, bytes: fstatSync(fd).size, sha256: createHash('sha256').update(readFileSync(fd)).digest('hex') }, parent: parentPin };
  } catch (error) { primary = error; throw error; }
  finally {
    const cleanup = []; try { db?.close(); } catch (error) { cleanup.push(error); }
    try { closeSync(fd); } catch (error) { cleanup.push(error); }
    if (cleanup.length) throw new AggregateError([...(primary ? [primary] : []), ...cleanup], 'History original handle cleanup debt', { cause: primary ?? cleanup[0] });
  }
}
function schema(db) {
  const rows = db.prepare("SELECT name,sql FROM sqlite_master WHERE type='table' ORDER BY name").all();
  for (const [table, required] of [['urls', ['id', 'url', 'title', 'visit_count', 'typed_count', 'last_visit_time', 'hidden']], ['visits', ['id', 'url', 'visit_time', 'from_visit', 'transition', 'visit_duration', 'opener_visit']]]) {
    const actual = db.prepare(`PRAGMA table_info(${table})`).all(); for (const field of required) assert.ok(actual.some(row => row.name === field), 'Actual native History schema is missing required columns');
  }
  assert.equal(db.prepare('PRAGMA integrity_check').get().integrity_check, 'ok'); return rows;
}
function verifyRows(db, source, seedCount, seedTimeUs) {
  assert.equal(Number(db.prepare('SELECT COUNT(*) AS count FROM urls').get().count), COMMAND_HISTORY_ROWS);
  assert.equal(Number(db.prepare('SELECT COUNT(*) AS count FROM visits').get().count), COMMAND_HISTORY_ROWS);
  const digest = createHash('sha256'); let index = 0;
  const rows = db.prepare('SELECT u.url,u.title,u.visit_count,u.typed_count,u.hidden,u.last_visit_time,v.visit_time,v.transition,v.from_visit,v.opener_visit FROM urls u JOIN visits v ON v.url=u.id ORDER BY u.id');
  rows.setReadBigInts(true);
  for (const row of rows.iterate()) {
    const expectedSeed = row.url === source + '/command-history/native-seed';
    assert.equal(expectedSeed, seedCount === 1 && index === 0);
    if (!expectedSeed) {
      const token = `auxperf${String(index - seedCount).padStart(5, '0')}`;
      assert.equal(row.url, source + '/' + token); assert.equal(row.title, `Aux ${token} history`);
      assert.equal(row.visit_count, 1n); assert.equal(row.typed_count, 1n); assert.equal(row.hidden, 0n);
      assert.equal(row.transition, 1n); assert.equal(row.from_visit, 0n); assert.equal(row.opener_visit, 0n);
      const expectedTime = BigInt(seedTimeUs) - BigInt(index - seedCount) * 1000n;
      assert.equal(row.last_visit_time, expectedTime); assert.equal(row.visit_time, expectedTime);
    }
    digest.update(JSON.stringify(row, (_key, value) => typeof value === 'bigint' ? String(value) : value) + '\n'); index++;
  }
  assert.equal(index, COMMAND_HISTORY_ROWS); return { urlCount: index, visitCount: index, rowsSha256: digest.digest('hex') };
}
// Fixed 50k workload only, after genuine App stop/reap. No selectable paths/counts.
export function prepareCommandHistoryDataset(stoppedProfileLease, fixtureUrl) {
  assert.equal(arguments.length, 2, 'No caller workload selectors');
  const profile = originalProfile(stoppedProfileLease), source = origin(fixtureUrl);
  const seedTimeUs = String((BigInt(Date.now()) + 11644473600000n) * 1000n);
  let committed = false;
  try {
    const receipt = database(profile, db => {
      const originalSchema = schema(db), existing = db.prepare('SELECT id,url FROM urls ORDER BY id').all();
      assert.ok(existing.length <= 1 && existing.every(row => row.url === source + '/command-history/native-seed'), 'Foreign initial History rows');
      assert.equal(Number(db.prepare('SELECT COUNT(*) AS count FROM visits').get().count), existing.length);
      const url = db.prepare('INSERT INTO urls(url,title,visit_count,typed_count,last_visit_time,hidden) VALUES(?,?,1,1,?,0)');
      const visit = db.prepare('INSERT INTO visits(url,visit_time,from_visit,transition,visit_duration,opener_visit) VALUES(?,?,0,1,0,0)');
      db.exec('BEGIN IMMEDIATE');
      try {
        for (let index = 0; index < COMMAND_HISTORY_ROWS - existing.length; index++) {
          const token = `auxperf${String(index).padStart(5, '0')}`, time = BigInt(seedTimeUs) - BigInt(index) * 1000n;
          const row = url.run(source + '/' + token, `Aux ${token} history`, time); visit.run(row.lastInsertRowid, time);
        }
        db.exec('COMMIT'); committed = true;
      } catch (primary) {
        try { db.exec('ROLLBACK'); } catch (cleanup) { throw new AggregateError([primary, cleanup], 'History preparation failed with rollback debt', { cause: primary }); }
        throw primary;
      }
      const currentSchema = schema(db); assert.deepEqual(currentSchema, originalSchema);
      const proof = verifyRows(db, source, existing.length, seedTimeUs); return { seedTimeUs, seedCount: existing.length, schema: originalSchema, ...proof };
    });
    assert.deepEqual(originalProfile(stoppedProfileLease), profile);
    const lease = Object.freeze({}); datasets.set(lease, { profile, source, receipt }); return lease;
  } catch (primary) {
    const error = new AggregateError([primary], 'Owned History preparation failed; original Profile retained', { cause: primary });
    error.stoppedProfileLease = stoppedProfileLease; error.datasetCommitted = committed; error.cleanupDebt = true; throw error;
  }
}
export function readCommandHistoryDataset(datasetLease, stoppedProfileLease) {
  assert.equal(arguments.length, 2);
  const original = datasets.get(datasetLease); assert.ok(original, 'Foreign History dataset lease');
  const profile = originalProfile(stoppedProfileLease);
  for (const field of ['fixtureId', 'userDataDir', 'profile', 'root', 'directory']) assert.deepEqual(profile[field], original.profile[field], 'Different original App Profile');
  assert.ok(profile.generation >= original.profile.generation);
  const actual = database(profile, db => ({ schema: schema(db), ...verifyRows(db, original.source, original.receipt.seedCount, original.receipt.seedTimeUs) }), true);
  assert.deepEqual(actual.parent, original.receipt.parent);
  for (const field of ['dev', 'ino', 'uid', 'mode', 'path']) assert.equal(actual.file[field], original.receipt.file[field]);
  assert.deepEqual(actual.schema, original.receipt.schema); assert.equal(actual.rowsSha256, original.receipt.rowsSha256);
  assert.deepEqual(originalProfile(stoppedProfileLease), profile);
  return Object.freeze({ producer: 'owned-chromium-history-50000', profile, source: original.source, originalSeed: structuredClone(original.receipt), actual, nativeQualificationProven: false });
}
