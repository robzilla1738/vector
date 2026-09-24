import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const electron = createRequire(join(root, 'apps/desktop/package.json'))('electron');
const proc = spawn(electron, [join(import.meta.dirname, 'internal-cdp-oopif.cjs')], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
let output = '';
proc.stdout.on('data', chunk => { output += String(chunk); });
proc.stderr.on('data', chunk => { output += String(chunk); });
const timer = setTimeout(() => proc.kill('SIGKILL'), 20_000);
try {
  const [code] = await once(proc, 'exit');
  assert.equal(code, 0, output);
  process.stdout.write(output);
} finally {
  clearTimeout(timer);
}
