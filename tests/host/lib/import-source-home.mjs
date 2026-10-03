import { constants, openSync, closeSync, fstatSync, lstatSync, realpathSync, mkdirSync, writeFileSync, readFileSync, readdirSync, unlinkSync, rmdirSync, chmodSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { basename, dirname, join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { DatabaseSync } from 'node:sqlite';

const leases = new WeakMap();
const owners = new WeakMap();
const directories = ['', 'Library', 'Library/Application Support', 'Library/Application Support/Google', 'Library/Application Support/Google/Chrome', 'Library/Application Support/Google/Chrome/Default'];
const profile = directories.at(-1);
const files = [`${profile}/Bookmarks`, `${profile}/History`];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
function identity(path, directory) {
  const named = lstatSync(path);
  if (named.isSymbolicLink() || named.uid !== process.getuid() || (named.mode & 0o777) !== (directory ? 0o700 : 0o600) || (!directory && named.nlink !== 1) || !(directory ? named.isDirectory() : named.isFile())) throw new Error('Import source identity refused');
  const fd = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW | (directory ? constants.O_DIRECTORY : 0));
  try {
    const held = fstatSync(fd);
    if (held.dev !== named.dev || held.ino !== named.ino || held.size !== named.size) throw new Error('Import source changed during admission');
    if (!directory && held.size > 1048576) throw new Error('Import source exceeds fixed fixture bound');
    const digest = directory ? null : hash(readFileSync(fd));
    const after = lstatSync(path);
    if (after.dev !== held.dev || after.ino !== held.ino || after.size !== held.size || after.mtimeMs !== held.mtimeMs || after.ctimeMs !== held.ctimeMs) throw new Error('Import source changed during read');
    return Object.freeze({ dev: held.dev, ino: held.ino, mode: held.mode, uid: held.uid, nlink: directory ? null : held.nlink, size: directory ? null : held.size, sha256: digest });
  } finally { closeSync(fd); }
}
function original(lease, owner) {
  const value = leases.get(lease);
  if (!value || value.owner !== owner || value.disposed) throw new Error('Foreign or retired import source lease');
  return value;
}
function assertTree(value) {
  for (const row of value.rows) {
    if (JSON.stringify(identity(row.path, row.directory)) !== JSON.stringify(row.identity) || realpathSync(row.path) !== row.realpath) throw new Error('Original import source replaced or changed');
    if (row.directory && row.children && JSON.stringify(readdirSync(row.path).sort()) !== JSON.stringify(row.children)) throw new Error('Unknown import source entry; cleanup refused');
  }
}
export function importSourceEnvironment(base, overrides) {
  if (overrides && Object.hasOwn(overrides, 'AUX_IMPORT_SOURCE_HOME')) throw new Error('Import source environment requires an original App lease');
  const env = { ...base, ...overrides };
  delete env.AUX_IMPORT_SOURCE_HOME;
  return env;
}
export function createImportSourceOwner(userDataDir) {
  const root = dirname(resolve(userDataDir));
  if (basename(userDataDir) !== 'profile' || !/^aux-native-journey-[A-Za-z0-9]+$/.test(basename(root)) || dirname(realpathSync(root)) !== realpathSync('/tmp') || realpathSync(root) === realpathSync(homedir()) || realpathSync(userDataDir) !== join(realpathSync(root), 'profile')) throw new Error('Import source requires original disposable Profile');
  const rows = [root, userDataDir].map(path => ({ path, directory: true, realpath: realpathSync(path), identity: identity(path, true), children: null }));
  const owner = Object.freeze({}); owners.set(owner, { userDataDir, rows }); return owner;
}
export function createImportSourceHome(owner, fixtureUrl) {
  const originalOwner = owners.get(owner);
  if (!originalOwner) throw new Error('Foreign import source owner');
  assertTree(originalOwner);
  const { userDataDir, rows: originalRows } = originalOwner;
  const url = new URL(fixtureUrl);
  if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1' || !url.port || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('Import source requires an owned loopback fixture origin');
  const home = join(userDataDir, 'import-source-home');
  // Exclusive creation: never discover, adopt, or overwrite another source.
  mkdirSync(home, { mode: 0o700 });
  const createdHome = identity(home, true);
  try {
  for (const dir of directories.slice(1)) mkdirSync(join(home, dir), { mode: 0o700 });
  const bookmarkUrl = new URL('/setup/bookmark', url).href;
  const historyUrl = new URL('/setup/history', url).href;
  writeFileSync(join(home, files[0]), JSON.stringify({ version: 1, roots: { bookmark_bar: { type: 'folder', name: 'Bookmarks bar', children: [{ type: 'url', name: 'Synthetic import bookmark', url: bookmarkUrl }] } } }), { flag: 'wx', mode: 0o600 });
  writeFileSync(join(home, files[1]), '', { flag: 'wx', mode: 0o600 });
  const db = new DatabaseSync(join(home, files[1]));
  try {
    db.exec('CREATE TABLE urls(id INTEGER PRIMARY KEY,url TEXT,title TEXT); CREATE TABLE visits(id INTEGER PRIMARY KEY,url INTEGER,visit_time INTEGER);');
    db.prepare('INSERT INTO urls VALUES(1,?,?)').run(historyUrl, 'Synthetic import history');
    db.exec('INSERT INTO visits VALUES(1,1,13344473600000000);');
  } finally { db.close(); }
  chmodSync(join(home, files[1]), 0o600);
  const rows = [...originalRows, ...[...directories.map(dir => join(home, dir)), ...files.map(file => join(home, file))].map(path => {
    const directory = !files.some(file => path === join(home, file));
    return { path, directory, realpath: realpathSync(path), identity: identity(path, directory), children: directory ? readdirSync(path).sort() : null };
  })];
  assertTree({ rows });
  const receipt = Object.freeze({ source: 'chrome', profile: 'Default', categories: Object.freeze(['bookmarks', 'history']), counts: Object.freeze({ bookmarks: 1, history: 1 }), home, files: Object.freeze(rows.filter(row => !row.directory).map(row => Object.freeze({ path: row.path, ...row.identity }))) });
  const lease = Object.freeze({});
  leases.set(lease, { owner, home, rows, receipt, disposed: false });
  return lease;
  } catch (error) {
    const failure = new AggregateError([error], 'Import source preparation failed; original source directory retained for inspection', { cause: error });
    failure.retainedSourceHome = Object.freeze({ home, identity: createdHome });
    throw failure;
  }
}
export function readImportSourceHome(lease, owner) {
  const value = original(lease, owner); assertTree(value); return value.receipt;
}
export function disposeImportSourceHome(lease, owner) {
  const value = original(lease, owner); assertTree(value);
  for (const file of files) unlinkSync(join(value.home, file));
  for (const dir of [...directories].reverse()) rmdirSync(join(value.home, dir));
  value.disposed = true;
}
