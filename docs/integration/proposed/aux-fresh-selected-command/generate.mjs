import {readFile,writeFile} from 'node:fs/promises';import {createHash} from 'node:crypto';import {fileURLToPath} from 'node:url';import path from 'node:path';
const here=fileURLToPath(new URL('.',import.meta.url)),proposal=path.resolve(here,'..');
const pin=JSON.parse(await readFile(path.join(here,'source-pins.json')));
const source=await readFile(path.join(proposal,'aux-fresh-installation-journal/source/PrivateFreshInstallationJournalStore.swift'));
if(createHash('sha256').update(source).digest('hex')!==pin.storeBaselineSha256)throw Error('Fresh private store baseline drift');
const continuation=await readFile(path.join(here,'source/PrivateFreshInstallationJournalStore.swift.continuation'));
if(createHash('sha256').update(continuation).digest('hex')!==pin.storeContinuationSha256)throw Error('Fresh selection continuation drift');
if(process.argv.length!==3)throw Error('Expected one private build output path');
await writeFile(process.argv[2],Buffer.concat([source,continuation]),{flag:'wx',mode:0o600});
