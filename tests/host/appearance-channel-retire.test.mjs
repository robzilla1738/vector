// Controlled owned temporary files and Python kernel locks only. No app/native channel execution.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, openSync, closeSync, statSync, rmSync, chmodSync, symlinkSync, existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { once } from 'node:events';
import { removeOriginalAppearanceChannel } from './lib/appearance-channel-retire.mjs';
function fixture(t) {
  const root = mkdtempSync('/tmp/aux-channel-retirement-control-'); chmodSync(root, 0o700);
  const profile = join(root, 'profile'), file = join(root, 'native-appearance-channel.jsonl');
  mkdirSync(profile, { mode: 0o700 }); const bytes = Buffer.from('controlled original bytes\n');
  writeFileSync(file, bytes, { mode: 0o600, flag: 'wx' });
  const paths = [root, profile, file], fds = paths.map(path => openSync(path, 'r'));
  const pins = { size: String(bytes.length), sha256: createHash('sha256').update(bytes).digest('hex') };
  for (const [i, prefix] of ['root', 'profile', 'file'].entries()) { const s = statSync(paths[i], { bigint: true }); pins[prefix + 'Device'] = String(s.dev); pins[prefix + 'Inode'] = String(s.ino); }
  t.after(() => { fds.forEach(closeSync); rmSync(root, { force: true, recursive: true }); });
  return { root, profile, file, fds, pins };
}
test('fixed dirfd cleanup removes only held inode/bytes and refuses occupied retirement name', t => {
  const f = fixture(t), retired = join(f.root, 'native-appearance-channel.retired.jsonl');
  symlinkSync(f.file, retired);
  assert.throws(() => removeOriginalAppearanceChannel(f.fds, f.pins), /exclusive retirement rename refused/);
  assert.ok(existsSync(f.file)); rmSync(retired);
  const receipt = removeOriginalAppearanceChannel(f.fds, f.pins);
  assert.equal(receipt.removed, true); assert.equal(existsSync(f.file), false); assert.equal(existsSync(retired), false);
});
test('original active kernel writer lease refuses cleanup until original lock holder exits', async t => {
  const f = fixture(t);
  const child = spawn('/usr/bin/python3', ['-I', '-c', "import fcntl,os,sys; fd=os.open(sys.argv[1],os.O_RDONLY|os.O_NOFOLLOW); fcntl.flock(fd,fcntl.LOCK_EX|fcntl.LOCK_NB); print('held',flush=True); sys.stdin.readline()", f.file], { stdio: ['pipe', 'pipe', 'pipe'], env: { PATH: '/usr/bin:/bin', LANG: 'C', LC_ALL: 'C' } });
  const closed = once(child, 'close');
  try {
    const [ready] = await once(child.stdout, 'data'); assert.equal(ready.toString(), 'held\n');
    assert.throws(() => removeOriginalAppearanceChannel(f.fds, f.pins), /Resource temporarily unavailable/);
    assert.ok(existsSync(f.file)); child.stdin.end('\n');
    const [code, signal] = await closed; assert.equal(code, 0); assert.equal(signal, null);
    assert.equal(removeOriginalAppearanceChannel(f.fds, f.pins).removed, true);
  } finally { if (child.exitCode === null && child.signalCode === null) { child.kill('SIGKILL'); await closed; } }
});
test('foreign inode, extra path/operation input, modified bytes and unprotected profile refuse without deletion', t => {
  for (const kind of ['inode', 'path', 'operation', 'bytes', 'mode']) {
    const f = fixture(t), pins = { ...f.pins };
    if (kind === 'inode') pins.fileInode = String(BigInt(pins.fileInode) + 1n);
    if (kind === 'path') pins.path = f.file;
    if (kind === 'operation') pins.operation = 'unlink';
    if (kind === 'bytes') writeFileSync(f.file, 'foreign bytes\n');
    if (kind === 'mode') chmodSync(f.profile, 0o755);
    assert.throws(() => removeOriginalAppearanceChannel(f.fds, pins)); assert.ok(existsSync(f.file));
  }
});

test('actual fixed bootstrap verifies held source SHA before dispatching controlled source', t => {
  const f = fixture(t), source = join(f.root, 'controlled-cleanup-source.py');
  const original = "print('controlled original source executed')\n";
  writeFileSync(source, original, { mode: 0o600 }); const fd = openSync(source, 'r'); t.after(() => closeSync(fd));
  const implementation = readFileSync(new URL('./lib/appearance-channel-retire.mjs', import.meta.url), 'utf8');
  const literal = implementation.match(/const cleanupBootstrap = (".*");/); assert.ok(literal);
  const bootstrap = JSON.parse(literal[1]), sha = createHash('sha256').update(original).digest('hex');
  const invoke = () => execFileSync('/usr/bin/python3', ['-I', '-c', bootstrap, sha], { stdio: ['ignore', 'pipe', 'pipe', 'ignore', 'ignore', 'ignore', fd], timeout: 5000, maxBuffer: 4096,
    env: { PATH: '/usr/bin:/bin', LANG: 'C', LC_ALL: 'C' } });
  assert.equal(invoke().toString(), 'controlled original source executed\n');
  writeFileSync(source, "print('modified source must never execute')\n");
  assert.throws(invoke, error => error.stdout.length === 0 && error.stderr.toString().includes('changed before execution'));
});
