// Actual static SEA/development entry preparation, never app/runtime activation.
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {buildDaemonNodeDevelopment} from '../../../../../vendor/provided/daemon-node-development.mjs';
import {adaptDaemonCode} from '../../../../../vendor/provided/daemon-adapter.mjs';
import {findMachOSeaSection,readSeaBlob} from '../../../../../vendor/aside/lib/sea.mjs';
import {materializeAuxCryptoRuntimeAssets} from './materialize.mjs';
import {composeDeferredAuxCryptoEntry} from './compose.mjs';
const pin=JSON.parse(readFileSync(new URL('../source-pins.json',import.meta.url))),hash=x=>createHash('sha256').update(x).digest('hex');
export function prepareAuxCryptoRuntimeEntries(originalBinary){
 if(!Buffer.isBuffer(originalBinary)||hash(originalBinary)!==pin.binarySha256)throw Error('Exact supplied static binary required');
 const section=findMachOSeaSection(originalBinary),blob=readSeaBlob(originalBinary.subarray(section.offset,section.offset+section.size));
 const sea=composeDeferredAuxCryptoEntry({mode:'sea',original:blob.code,entry:adaptDaemonCode(blob.code,{},'aux-v1',2).code});
 const development=buildDaemonNodeDevelopment(originalBinary,{},'aux-v1',2);
 if(JSON.stringify(development.manifest.files)!==JSON.stringify(pin.originalDevelopmentInventory))throw Error('Actual generated node entry/asset inventory drift');
 const index=development.files.find(f=>f.path.endsWith('/node-development/index.mjs'));
 if(!index)throw Error('Actual generated daemon index missing');
 const node=composeDeferredAuxCryptoEntry({mode:'node-development',original:blob.code,entry:index.bytes.toString()});
 const seaAssets=materializeAuxCryptoRuntimeAssets({mode:'sea'}),nodeAssets=materializeAuxCryptoRuntimeAssets({mode:'node-development'});
 const developmentFiles=[...development.files.map(f=>f===index?{...f,bytes:Buffer.from(node.code)}:f),...nodeAssets.files];
 return {seaEntry:Buffer.from(sea.code),seaAssets:seaAssets.files,developmentFiles,manifest:{format:'aux.crypto-runtime-entry-preparation.v1',activation:false,seaEntrySha256:sea.sha256,nodeDevelopmentEntrySha256:node.sha256,seaFlags:blob.flags,seaInjectionPerformed:false,files:[...seaAssets.files,...developmentFiles].map(f=>({path:f.path,mode:f.mode,bytes:f.bytes.length,sha256:hash(f.bytes)}))}};
}
