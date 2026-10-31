// The runtime cleanup on a small tree, with this machine's Python standing in for the runtime's.
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {repoRoot} from '../lib/repo-root.mjs';

const tag = spawnSync('python3', ['-c', 'import sys; print(sys.implementation.cache_tag)'], {encoding: 'utf8'}).stdout.trim();
const clean = (runtime, ...args) => spawnSync('python3', [path.join(repoRoot, 'scripts/runtime/clean_runtime.py'), runtime, 'python3', ...args], {encoding: 'utf8'});

function runtime(scratch) {
  const lib = path.join(scratch, 'python/lib');
  mkdirSync(path.join(lib, '__pycache__'), {recursive: true});
  writeFileSync(path.join(scratch, 'prepare-python.py'), 'print("Aside: could not clear quarantine from x")\n');
  writeFileSync(path.join(lib, 'mod.py'), 'value = 1\n');
  spawnSync('python3', ['-c', `import py_compile; py_compile.compile("mod.py", cfile="__pycache__/mod.${tag}.pyc", dfile="/Users/someone/.aside/mod.py")`], {cwd: lib});
  return lib;
}

test('the cleanup recompiles with relative sources and rewords the runtime', () => {
  const scratch = mkdtempSync(path.join(tmpdir(), 'aux-clean-runtime-'));
  try {
    const lib = runtime(scratch), result = clean(scratch);
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout).sort(), ['prepare-python.py', `python/lib/__pycache__/mod.${tag}.pyc`].sort());
    const compiled = readFileSync(path.join(lib, `__pycache__/mod.${tag}.pyc`));
    assert.equal(compiled.includes('.aside'), false);
    assert.ok(compiled.includes('python/lib/mod.py'));
    assert.match(readFileSync(path.join(scratch, 'prepare-python.py'), 'utf8'), /Aux: could not/);
  } finally {
    rmSync(scratch, {recursive: true, force: true});
  }
});

test('a compiled file with no source stops the cleanup', () => {
  const scratch = mkdtempSync(path.join(tmpdir(), 'aux-clean-runtime-'));
  try {
    const lib = runtime(scratch);
    rmSync(path.join(lib, 'mod.py'));
    const result = clean(scratch);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /no source/);
  } finally {
    rmSync(scratch, {recursive: true, force: true});
  }
});
