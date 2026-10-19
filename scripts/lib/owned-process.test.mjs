import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { launchOwnedProcess } from './owned-process.mjs';

test('owned guardian cleans normal descendants and reports forced shutdown', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'aux-owned-group-'));
  try {
    const grandchild = join(directory, 'grandchild.mjs');
    const child = join(directory, 'child.mjs');
    await writeFile(grandchild, `import {writeFileSync} from 'node:fs';\nprocess.on('SIGTERM',()=>{if(process.env.STUBBORN!=='1'){writeFileSync(process.env.MARKER,'stopped');process.exit(0)}});\nprocess.send('ready');\nsetInterval(()=>{},1000);\n`);
    await writeFile(child, `import {spawn} from 'node:child_process';\nconst child=spawn(process.execPath,[process.env.GRANDCHILD],{env:process.env,stdio:['ignore','ignore','ignore','ipc']});\nchild.once('message',()=>process.exit(0));\n`);
    for (const stubborn of [false, true]) {
      const marker = join(directory, stubborn ? 'forced' : 'normal');
      const owned = await launchOwnedProcess(process.execPath, [child], { cwd: directory,
        env: { PATH: '/usr/bin:/bin', HOME: directory, TMPDIR: directory, GRANDCHILD: grandchild, MARKER: marker, STUBBORN: stubborn ? '1' : '0' } });
      assert(Number.isInteger(owned.pid));
      const result = await owned.done;
      assert.equal(result.childExitCode, 0);
      assert.equal(result.forced, stubborn);
      assert.equal(result.groupStopped, !stubborn);
      if (!stubborn) assert.equal(await readFile(marker, 'utf8'), 'stopped');
      assert.equal(await owned.stop(), result); // settled stop never signals again.
    }
    const missing = await launchOwnedProcess(join(directory, 'missing-executable'), [], { cwd: directory, env: { HOME: directory, PATH: '/usr/bin:/bin' } });
    assert.equal(missing.pid, null);
    const failure = await missing.done;
    assert.equal(failure.childExitCode, 1);
    assert.equal(failure.groupStopped, true);
    assert(failure.error);
    assert.equal(await missing.stop(), failure);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('guardian refuses launch queued after stop', { timeout: 10000 }, async () => {
  const { spawn } = await import('node:child_process');
  const { fileURLToPath } = await import('node:url');
  const directory = await mkdtemp(join(tmpdir(), 'aux-stop-before-launch-'));
  const marker = join(directory, 'launched');
  const guardian = spawn(process.execPath, [fileURLToPath(new URL('./owned-process-guardian.mjs', import.meta.url))],
    { cwd: directory, env: { PATH: '/usr/bin:/bin', HOME: directory }, detached: true, stdio: ['ignore', 'ignore', 'ignore', 'ipc'] });
  const closed = new Promise(resolve => guardian.once('close', resolve));
  try {
    await new Promise(resolve => guardian.once('spawn', resolve));
    guardian.send({ event: 'stop' });
    guardian.send({ event: 'launch', command: process.execPath,
      args: ['-e', `require('node:fs').writeFileSync(${JSON.stringify(marker)},'started')`], cwd: directory, env: { HOME: directory } });
    await closed;
    await assert.rejects(readFile(marker), { code: 'ENOENT' });
  } finally {
    if (guardian.exitCode === null && guardian.signalCode === null) guardian.kill('SIGKILL');
    await closed;
    await rm(directory, { recursive: true, force: true });
  }
});

test('launcher waits for a pending controller on SIGTERM and preserves state', { timeout: 20000 }, async () => {
  const { spawn } = await import('node:child_process');
  const { mkdir, copyFile, access } = await import('node:fs/promises');
  const { setTimeout: delay } = await import('node:timers/promises');
  const directory = await mkdtemp(join(tmpdir(), 'aux-launch-start-race-'));
  const scripts = join(directory, 'scripts');
  const library = join(scripts, 'lib');
  const app = join(directory, 'Aux Fixture.app');
  const executable = join(app, 'Contents/MacOS/Aux');
  const acknowledged = join(directory, 'acknowledged');
  const release = join(directory, 'release');
  const stopped = join(directory, 'stopped');
  const started = join(directory, 'started');
  const fixture = join(directory, 'app.mjs');
  let launcher;
  let closed;
  try {
    await mkdir(library, { recursive: true });
    await mkdir(join(app, 'Contents/Resources/aux'), { recursive: true });
    await mkdir(join(app, 'Contents/MacOS'), { recursive: true });
    await writeFile(join(app, 'Contents/Resources/aux/bundle.json'), JSON.stringify({ version: 1, implementation: 'supplied' }));
    await copyFile(new URL('../../docs/integration/proposed/launcher-owned-shutdown/aux.mjs', import.meta.url), join(scripts, 'aux.mjs'));
    await copyFile(new URL('./owned-process.mjs', import.meta.url), join(library, 'real-owned-process.mjs'));
    await copyFile(new URL('./owned-process-guardian.mjs', import.meta.url), join(library, 'owned-process-guardian.mjs'));
    await writeFile(join(library, 'owned-process.mjs'), `
      import {launchOwnedProcess as actual} from './real-owned-process.mjs';
      import {writeFile,access} from 'node:fs/promises';
      import {setTimeout as delay} from 'node:timers/promises';
      export {ownGroupMembers} from './real-owned-process.mjs';
      export async function launchOwnedProcess(...args){
        const child=await actual(...args);
        await writeFile(process.env.ACKNOWLEDGED,'ready');
        while(true){try{await access(process.env.RELEASE);break}catch{await delay(10)}}
        return child;
      }
    `);
    await writeFile(executable, '#!/bin/sh\nexec "$NODE_FIXTURE" "$APP_FIXTURE"\n', { mode: 0o700 });
    await writeFile(fixture, `import {writeFileSync} from 'node:fs';\nwriteFileSync(process.env.STARTED,'started');\nprocess.on('SIGTERM',()=>{writeFileSync(process.env.STOPPED,'stopped');process.exit(0)});\nsetInterval(()=>{},1000);\n`);
    launcher = spawn(process.execPath, [join(scripts, 'aux.mjs'), '--temp-profile', '--app', app], {
      cwd: directory, env: { PATH: '/usr/bin:/bin', HOME: directory, TMPDIR: directory, NODE_FIXTURE: process.execPath,
        APP_FIXTURE: fixture, ACKNOWLEDGED: acknowledged, RELEASE: release, STARTED: started, STOPPED: stopped },
      stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    launcher.stderr.on('data', chunk => { stderr += chunk; });
    closed = new Promise(resolve => launcher.once('close', (code, signal) => resolve({ code, signal })));
    const waitFor = async path => {
      for (let count = 0; count < 250; count++) {
        try { await access(path); return; } catch { await delay(20); }
      }
      assert.fail('Disposable startup fixture did not become ready');
    };
    await waitFor(acknowledged);
    await waitFor(started);
    launcher.kill('SIGTERM');
    // Let the signal reach the launcher while its start() still awaits the
    // actual controller. Releasing it must not escape the shutdown snapshot.
    await delay(100);
    await writeFile(release, 'release');
    assert.deepEqual(await closed, { code: 143, signal: null });
    assert.equal(await readFile(stopped, 'utf8'), 'stopped');
    const retained = stderr.match(/Temporary Aux state retained at ([^;]+);/);
    assert(retained, 'Retained state path must be reported');
    assert(retained[1].startsWith(directory + '/'));
    await access(retained[1]);
  } finally {
    await writeFile(release, 'release');
    if (launcher && launcher.exitCode === null && launcher.signalCode === null) launcher.kill('SIGTERM');
    if (closed) await closed;
    await rm(directory, { recursive: true, force: true });
  }
});
