import assert from 'node:assert/strict';
import test from 'node:test';
import { execFileSync } from 'node:child_process';
const helper = new URL('./composer-image-appearance.mjs', import.meta.url).href;
function child(body) {
  const script = `import assert from 'node:assert/strict';
import { lstat, readdir, chmod, mkdir, rmdir, unlink, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createInvalidImageFixture } from ${JSON.stringify(helper)};
${body}`;
  return JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e', script], { encoding: 'utf8', timeout: 5000 }));
}
const preopen = `const previous=process.umask(0o200); let failure;
try { await createInvalidImageFixture(); assert.fail('Real exclusive open must refuse in original nonwritable directory'); }
catch(error) { failure=error; } finally { process.umask(previous); }
assert.ok(failure instanceof AggregateError); assert.equal(failure.errors[0].code,'EACCES');
const lease=failure.ownedImageFixture, original=lease.diagnostics.originalDirectory;
assert.equal(original.mode & 0o777,0o500); assert.equal(lease.diagnostics.originalFile,undefined);
const dir=lease.diagnostics.directory;`;
test('real pre-open permission failure retains original known-empty directory lease', () => {
  assert.deepEqual(child(`${preopen}
await lease.dispose(); await assert.rejects(lstat(dir),{code:'ENOENT'}); await lease.dispose();
console.log(JSON.stringify({ originalOpenRefused:true, originalEmptyTreeCleaned:true }));`), { originalOpenRefused: true, originalEmptyTreeCleaned: true });
});
test('unknown entry in failed creation tree refuses then exact correction permits cleanup', () => {
  assert.deepEqual(child(`${preopen}
const unknown=join(dir,'owned-test-blocker'); await chmod(dir,0o700); await mkdir(unknown,{mode:0o700}); await chmod(dir,0o500);
await assert.rejects(lease.dispose(),e=>e.ownedImageFixture===lease && e.errors[0]===failure.errors[0]);
assert.ok((await lstat(unknown)).isDirectory());
await chmod(dir,0o700);await rmdir(unknown);await chmod(dir,0o500);await lease.dispose();
await assert.rejects(lstat(dir),{code:'ENOENT'});
console.log(JSON.stringify({ unknownRetained:true, originalLeaseCleaned:true }));`), { unknownRetained: true, originalLeaseCleaned: true });
});
test('real post-open setup failure retains original FD/inode and primary plus cleanup debt', () => {
  assert.deepEqual(child(`const previous=process.umask(0o400); let failure;
try { await createInvalidImageFixture(); assert.fail('Original restrictive setup must refuse'); }
catch(error) { failure=error; } finally { process.umask(previous); }
assert.ok(failure instanceof AggregateError); const lease=failure.ownedImageFixture;
assert.ok(lease.diagnostics.originalFile); assert.equal(lease.diagnostics.originalFile.mode & 0o777,0o200);
await assert.rejects(lease.dispose(),e=>e.ownedImageFixture===lease && e.errors.length===2 && e.errors[0]===failure.errors[0] && e.errors[1].code==='EACCES');
// Original retained FD was read/checked before this genuine directory read refusal.
// Test-only teardown corrects only its exact captured synthetic tree; this is NOT
// a production lease success because changed original permissions remain debt.
const {directory,path,originalDirectory,originalFile}=lease.diagnostics;
const dir=await lstat(directory),file=await lstat(path);
for(const k of ['dev','ino','uid','mode']) { assert.equal(dir[k],originalDirectory[k]);assert.equal(file[k],originalFile[k]); }
await chmod(directory,0o700);await chmod(path,0o600);
await assert.rejects(lease.dispose(),e=>e.ownedImageFixture===lease && e.errors[1].name==='AssertionError');
assert.equal(await readFile(path,'utf8'),'Aux owned invalid image fixture\\n');
await unlink(path);await rmdir(directory);
console.log(JSON.stringify({ originalFileRetained:true, bothErrorsRetained:true, changedPermissionsRefused:true, testTreeCleaned:true }));`), { originalFileRetained: true, bothErrorsRetained: true, changedPermissionsRefused: true, testTreeCleaned: true });
});
