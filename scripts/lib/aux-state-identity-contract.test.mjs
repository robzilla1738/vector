import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, realpath, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { assertAuxStateIdentityDeclarations, assertAuxStateIdentityPairing, verifyAuxStateIdentityContract } from './aux-state-identity-contract.mjs';
const reviewPath = fileURLToPath(new URL('../../docs/integration/proposed/aux-native-preference-identity/manifest.json', import.meta.url));
const review = JSON.parse(await readFile(reviewPath));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
function fixture(version = 2, profile = 'aux-v1') {
  const declarations = Object.fromEntries(['stage','ui','apps'].map(role => [role,{identityProfile:profile,stateIdentityVersion:version}]));
  const nativeSources = Object.fromEntries(review.files.map(file => [file.path,file.edits.flatMap(edit => Array(edit.count).fill(version === 2 ? edit.replace : edit.find)).join('\n')]));
  return {identityProfile:profile,stateIdentityVersion:version,declarations,nativeSources,preferenceReview:review};
}
test('explicit source generations pair across stage, UI, apps and all nineteen native keys', () => {
  for (const input of [fixture(),fixture(1),fixture(1,'compatibility')]) {
    const report=assertAuxStateIdentityPairing(input);
    assert.equal(report.nativePreferenceKeys,19);assert.equal(report.nativePreferenceFiles.length,21);assert.equal(report.runtimeAcceptance,false);assert.equal(report.migrationAcceptance,false);
  }
  const invalid=fixture(2,'compatibility');assert.throws(()=>assertAuxStateIdentityPairing(invalid),/requires aux-v1/);
  const mixed=fixture();mixed.declarations.apps.stateIdentityVersion=1;assert.throws(()=>assertAuxStateIdentityPairing(mixed),/declaration mismatch/);
  const absent=fixture();delete absent.declarations.ui.stateIdentityVersion;assert.throws(()=>assertAuxStateIdentityDeclarations(absent),/declaration mismatch/);
});
test('actual quoted consumers and registrations reject mixed, missing or duplicate native anchors', () => {
  const input=fixture(),file=review.files[0];
  input.nativeSources[file.path]+='\n"aside.inboxNotification"'; // Explicitly excluded event name remains outside preference proof.
  assert.equal(assertAuxStateIdentityPairing(input).staticNativePairing,true);
  input.nativeSources[file.path]+='\n'+file.edits[0].find;
  assert.throws(()=>assertAuxStateIdentityPairing(input),/generation mismatch/);
  const duplicate=fixture();duplicate.nativeSources[file.path]+='\n'+file.edits[0].replace;assert.throws(()=>assertAuxStateIdentityPairing(duplicate),/generation mismatch/);
  const missing=fixture();delete missing.nativeSources[file.path];assert.throws(()=>assertAuxStateIdentityPairing(missing),/Missing native/);
});
test('filesystem preflight validates final composition source hashes without requiring old full-file hashes', async t => {
  const root=await realpath(await mkdtemp(join(tmpdir(),'aux-state-contract-')));t.after(()=>rm(root,{recursive:true,force:true}));
  const stageRoot=join(root,'stage'),nativeRoot=join(root,'native');const input=fixture();const files=[];
  for (const [role,path]of[['stage','manifest.json'],['ui','ui/manifest.json'],['apps','apps/manifest.json']]) {await mkdir(join(stageRoot,path.includes('/')?'ui':'apps'),{recursive:true});await writeFile(join(stageRoot,path),JSON.stringify(input.declarations[role]));}
  for(const[path,text]of Object.entries(input.nativeSources)){const absolute=join(nativeRoot,path);await mkdir(absolute.slice(0,absolute.lastIndexOf('/')),{recursive:true});await writeFile(absolute,text+'\n// unrelated reviewed fix');files.push({path,outputSha256:hash(text+'\n// unrelated reviewed fix')});}
  const options={stageRoot,nativeRoot,composition:{sourceRoot:nativeRoot,files},identityProfile:'aux-v1',stateIdentityVersion:2,preferenceReviewPath:reviewPath,preferenceReviewSha256:hash(await readFile(reviewPath))};
  assert.equal((await verifyAuxStateIdentityContract(options)).staticNativePairing,true);
  await writeFile(join(nativeRoot,files[0].path),'changed');await assert.rejects(verifyAuxStateIdentityContract(options),/hash mismatch/);
});
