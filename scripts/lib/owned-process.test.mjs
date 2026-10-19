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
