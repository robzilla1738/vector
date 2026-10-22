import {readFile,writeFile} from 'node:fs/promises';import {createHash} from 'node:crypto';import {fileURLToPath} from 'node:url';import path from 'node:path';
const here=fileURLToPath(new URL('.',import.meta.url)),root=fileURLToPath(new URL('../../../../',import.meta.url));
const hash=x=>createHash('sha256').update(x).digest('hex');
const pins=JSON.parse(await readFile(path.join(here,'source-pins.json')));
for(const d of [pins.fdBaseline,...pins.dependencies])if(hash(await readFile(path.join(root,d.path)))!==d.sha256)throw Error('Dependency drift: '+d.path);
for(const [p,h] of Object.entries(pins.sources))if(hash(await readFile(path.join(here,p)))!==h)throw Error('Source drift: '+p);
const source=await readFile(path.join(root,pins.fdBaseline.path),'utf8');
let prefix=source.slice(source.indexOf('final class PrivateFreshInstallationJournalStore {'),source.indexOf('    private func filename('));
for(const c of pins.fdAdaptations){if(prefix.split(c.find).length-1!==c.count)throw Error('FD adaptation count differs');prefix=prefix.split(c.find).join(c.replace);}
if(process.argv.length!==3)throw Error('One private build output required');
await writeFile(process.argv[2],'// Pinned private FD prefix + versioned nonsecret CSK journal.\nimport Foundation\nimport CryptoKit\nimport Darwin\n'+await readFile(path.join(here,'source/CskHandoffRecords.swift'),'utf8')+prefix+await readFile(path.join(here,'source/PrivateCskHandoffJournalStore.tail.swift'),'utf8'),{flag:'wx',mode:0o600});
