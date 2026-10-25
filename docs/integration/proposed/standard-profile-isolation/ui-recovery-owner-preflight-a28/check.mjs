// Reuse the exact A27 actual-owner cases around the one shared-predicate extraction.
import {readFile,writeFile,unlink} from 'node:fs/promises';
const here=new URL('./',import.meta.url),a27=new URL('../ui-recovery-owner-adoption-a27/',here);
const delta=JSON.parse(await readFile(new URL('source-plan.json',here),'utf8'));
const previous=JSON.parse(await readFile(new URL('source-plan.json',a27),'utf8'));
const joined={...delta,files:previous.files.map(row=>row.path===delta.files[0].path?delta.files[0]:{...row,input:row.output,inputSha256:row.outputSha256,anchors:[]})};
let source=await readFile(new URL('check.mjs',a27),'utf8');
source=source.replace("plan=JSON.parse(await readFile(new URL('source-plan.json',here),'utf8'))",'plan='+JSON.stringify(joined));
source=source.replace('readHandoff:auxReadDraftMigrationRecoveryHandoff};','readHandoff:auxReadDraftMigrationRecoveryHandoff,checkAdoption:auxCheckDraftMigrationRecoveryAdoption};');
const marker="const result={format:'aux.ui-owner-adoption.focused.actual.v1'";
const added=`// Preflight target while its stores are unpublished; every actual setter,
// dirty-memory baseline and storage writer remains unchanged.
{
 const journal=oldJournal(),f=fixture(),held=f.api.recovery('00000000-0000-4000-8000-000000000040','utf16-v1');f.api.seal(held.leaseId,held.revision,'utf16-v1');
 const before=plain(f.api.readCapture('utf16-v1')),snapshot=f.controller.getSnapshot(),plan=planFor(journal,'target');
 const result=plain(f.api.checkAdoption(held.leaseId,held.revision,plan));assert.equal(result.ok,true,result.error);assert.equal(result.retained,true);assert.equal(result.format,'aux.ui-draft-owner-adoption-preflight.v1');
 assert.deepEqual(plain(f.controller.getSnapshot()),plain(snapshot));assert.deepEqual(plain(f.api.readCapture('utf16-v1')),before);assert.equal(f.sessionStorage.writes+f.localStorage.writes,0);
 assert.equal(f.api.adopt(held.leaseId,held.revision,plan).ok,false,'Adopt lost its real desired-store requirement');f.api.release(held.leaseId);cases++;
}
// Actual newer work refuses before native physical Restore; no setter or
// baseline reset is used to make the alternatives look equivalent.
{
 const journal=oldJournal(),f=fixture();f.controller.clear();f.editor.doc=doc('saved source');
 const held=f.api.recovery('00000000-0000-4000-8000-000000000041','utf16-v1');f.api.seal(held.leaseId,held.revision,'utf16-v1');const before=plain(f.api.readCapture('utf16-v1'));
 const result=f.api.checkAdoption(held.leaseId,held.revision,planFor(journal,'source'));assert.equal(result.ok,false);assert.deepEqual(plain(f.api.readCapture('utf16-v1')),before);f.api.release(held.leaseId);cases++;
}
`;
if(!source.includes(marker))throw Error('Actual A27 test anchor changed');source=source.replace(marker,added+marker).replaceAll('actual-focused-a27.json','actual-focused-a28.json');
await writeFile(new URL('actual-replay.generated.mjs',here),source);
try{await import(new URL('actual-replay.generated.mjs',here))}finally{await unlink(new URL('actual-replay.generated.mjs',here))}
