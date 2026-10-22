import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, realpath, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { assertAuxStateIdentityDeclarations, assertAuxStateIdentityPairing, verifyAuxStateIdentityContract, auxNativeEventContracts } from './aux-state-identity-contract.mjs';
const reviewPath = fileURLToPath(new URL('../../docs/integration/proposed/aux-native-preference-identity/manifest.json', import.meta.url));
const review = JSON.parse(await readFile(reviewPath));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
function fixture(version = 2, profile = 'aux-v1') {
  const declarations = Object.fromEntries(['stage','ui','apps'].map(role => [role,{identityProfile:profile,stateIdentityVersion:version}]));
  const nativeSources = Object.fromEntries(review.files.map(file => [file.path,file.edits.flatMap(edit => Array(edit.count).fill(version === 2 ? edit.replace : edit.find)).join('\n')]));
  const namespace=version===2?'aux':'aside';
  for(const event of auxNativeEventContracts){const token=JSON.stringify(namespace+'.'+event.name);nativeSources[event.path]=(nativeSources[event.path]??'')+'\n'+(event.constant?`constexpr char ${event.constant}[] = ${token};`:`Dispatch(*profile_, ${token}, std::move(payload));`);}
  const agentBackground=auxNativeEventContracts.map(event=>`if (e?.type === "${namespace}.${event.name}") { return true; }`).join('\n');
  return {identityProfile:profile,stateIdentityVersion:version,declarations,nativeSources,preferenceReview:review,agentBackground};
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
  assert.equal(assertAuxStateIdentityPairing(input).staticNativePairing,true);
  input.nativeSources[file.path]+='\n'+file.edits[0].find;
  assert.throws(()=>assertAuxStateIdentityPairing(input),/generation mismatch/);
  const duplicate=fixture();duplicate.nativeSources[file.path]+='\n'+file.edits[0].replace;assert.throws(()=>assertAuxStateIdentityPairing(duplicate),/generation mismatch/);
  const missing=fixture();delete missing.nativeSources[file.path];assert.throws(()=>assertAuxStateIdentityPairing(missing),/Missing native/);
});
test('filesystem preflight validates final composition source hashes without requiring old full-file hashes', async t => {
  const root=await realpath(await mkdtemp(join(tmpdir(),'aux-state-contract-')));t.after(()=>rm(root,{recursive:true,force:true}));
  const stageRoot=join(root,'stage'),nativeRoot=join(root,'native');const input=fixture();const files=[];
  input.declarations.ui.components={agent:{files:[{path:'background.js',outputSha256:hash(input.agentBackground)}]}};
  await mkdir(join(stageRoot,'ui/agent'),{recursive:true});await writeFile(join(stageRoot,'ui/agent/background.js'),input.agentBackground);
  for (const [role,path]of[['stage','manifest.json'],['ui','ui/manifest.json'],['apps','apps/manifest.json']]) {await mkdir(join(stageRoot,path.includes('/')?'ui':'apps'),{recursive:true});await writeFile(join(stageRoot,path),JSON.stringify(input.declarations[role]));}
  for(const[path,text]of Object.entries(input.nativeSources)){const absolute=join(nativeRoot,path);await mkdir(absolute.slice(0,absolute.lastIndexOf('/')),{recursive:true});await writeFile(absolute,text+'\n// unrelated reviewed fix');files.push({path,outputSha256:hash(text+'\n// unrelated reviewed fix')});}
  const options={stageRoot,nativeRoot,composition:{sourceRoot:nativeRoot,files},identityProfile:'aux-v1',stateIdentityVersion:2,preferenceReviewPath:reviewPath,preferenceReviewSha256:hash(await readFile(reviewPath))};
  assert.equal((await verifyAuxStateIdentityContract(options)).staticNativePairing,true);
  await writeFile(join(stageRoot,'ui/agent/background.js'),input.agentBackground+'changed');await assert.rejects(verifyAuxStateIdentityContract(options),/background hash mismatch/);await writeFile(join(stageRoot,'ui/agent/background.js'),input.agentBackground);
  const eventFile=files.find(file=>file.path===auxNativeEventContracts[0].path),eventOriginal=await readFile(join(nativeRoot,eventFile.path));await writeFile(join(nativeRoot,eventFile.path),'tampered event');await assert.rejects(verifyAuxStateIdentityContract(options),/hash mismatch/);await writeFile(join(nativeRoot,eventFile.path),eventOriginal);
  await writeFile(join(nativeRoot,files[0].path),'changed');await assert.rejects(verifyAuxStateIdentityContract(options),/hash mismatch/);
});

test('runtime events reject the previously admitted mixed producer/receiver generations, compounds and missing handlers', async () => {
  const mixed=fixture();
  for(const event of auxNativeEventContracts)mixed.nativeSources[event.path]=mixed.nativeSources[event.path].replaceAll('aux.'+event.name,'aside.'+event.name);
  assert.throws(()=>assertAuxStateIdentityPairing(mixed),/Runtime event generation mismatch/);
  for(const field of ['native','agent']){
    const value=fixture(),event=auxNativeEventContracts[1];
    if(field==='native')value.nativeSources[event.path]+='\n"aux.inboxNotification.extra"';else value.agentBackground+='\n"aux.inboxNotification.extra"';
    assert.throws(()=>assertAuxStateIdentityPairing(value),/Runtime event generation mismatch/);
  }
  const noReceiver=fixture();noReceiver.agentBackground=noReceiver.agentBackground.replace('if (e?.type === "aux.inboxNotification")','if (other === "aux.inboxNotification")');assert.throws(()=>assertAuxStateIdentityPairing(noReceiver),/actual Agent event receiver/);
  const real=fixture();
  for(const path of new Set(auxNativeEventContracts.map(event=>event.path)))real.nativeSources[path]=await readFile(new URL('../../docs/integration/proposed/aux-runtime-contract-identity/source/'+path,import.meta.url),'utf8');
  const original=await readFile('/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/agent/background.js','utf8');
  const {applyAuxRuntimeContractIdentity}=await import('../../vendor/provided/aux-runtime-contract-identity.mjs');
  real.agentBackground=applyAuxRuntimeContractIdentity({component:'agent',path:'background.js',text:original,original,branding:'supplied'}).text;
  const actual=assertAuxStateIdentityPairing(real);assert.equal(actual.staticRuntimeEventPairing,true);assert.equal(actual.nativeEventFiles.length,2);assert.equal(actual.nativeRuntimeEvents,3);assert.equal(actual.agentRuntimeEvents.sha256,hash(real.agentBackground));
});
