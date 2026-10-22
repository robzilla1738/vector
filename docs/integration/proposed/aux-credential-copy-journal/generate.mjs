import {readFile,writeFile} from 'node:fs/promises';import {createHash} from 'node:crypto';import {fileURLToPath} from 'node:url';import path from 'node:path';
const here=fileURLToPath(new URL('.',import.meta.url)),root=fileURLToPath(new URL('../../../../',import.meta.url));
const pins=JSON.parse(await readFile(path.join(here,'source-pins.json')));
for(const dependency of pins.dependencies){if(createHash('sha256').update(await readFile(path.join(root,dependency.path))).digest('hex')!==dependency.sha256)throw Error('Dependency drift: '+dependency.path);}
const source=await readFile(path.join(root,pins.fdBaseline.path),'utf8');
if(createHash('sha256').update(source).digest('hex')!==pins.fdBaseline.sha256)throw Error('Private FD baseline drift');
let prefix=source.slice(source.indexOf('final class PrivateFreshInstallationJournalStore {'),source.indexOf('    private func filename('));
for(const change of pins.fdAdaptations){if(prefix.split(change.find).length-1!==change.count)throw Error('Private FD adaptation count drift');prefix=prefix.split(change.find).join(change.replace);}
const tail=await readFile(path.join(here,'source/PrivateAuxCredentialCopyJournalStore.tail.swift'),'utf8');
if(createHash('sha256').update(tail).digest('hex')!==pins.storeTailSha256)throw Error('Credential tail drift');
const records=await readFile(path.join(here,'source/CredentialCopyStoreRecords.swift'),'utf8');
if(createHash('sha256').update(records).digest('hex')!==pins.storeRecordsSha256)throw Error('Credential records drift');
if(process.argv.length!==3)throw Error('Expected one private build output');
await writeFile(process.argv[2],'// Exact pinned FD prefix with reviewed name/UUID adaptations.\nimport Foundation\nimport CryptoKit\nimport Darwin\n'+records+prefix+tail,{flag:'wx',mode:0o600});
