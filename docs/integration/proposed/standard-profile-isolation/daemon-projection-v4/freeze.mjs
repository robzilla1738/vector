import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {ROOT,PREFIX,PRODUCER_FILES} from './contract.mjs';
const here=path.dirname(fileURLToPath(import.meta.url));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const [rootArg,pinsArg,outputArg]=process.argv.slice(2);
if(![rootArg,pinsArg,outputArg].every(value=>value&&path.isAbsolute(value)))throw Error('Absolute root, fresh pins file and fresh /private/tmp output required');
const root=path.resolve(rootArg),output=path.resolve(outputArg);
if(path.dirname(output)!=='/private/tmp'||output!==outputArg||here!==path.join(root,'docs/integration/proposed/standard-profile-isolation/daemon-projection-v4'))throw Error('Exact committed producer and direct fresh /private/tmp output required');
try{await fs.lstat(output);throw Error('Output exists')}catch(error){if(error.code!=='ENOENT')throw error}
const immutable=JSON.parse(await fs.readFile(path.join(here,'immutable-inputs.json'),'utf8'));
if(root!==ROOT||immutable.root!==root||immutable.format!=='aux.standard.daemon-projection.immutable.v4')throw Error('Reviewed root differs');
const inputs=new Map();
async function pin(file,expected){const actual=sha(await fs.readFile(file));if(expected&&actual!==expected)throw Error('Immutable input changed: '+file);if(inputs.has(file)&&inputs.get(file)!==actual)throw Error('Input changed during freeze');inputs.set(file,actual)}
for(const row of immutable.inputs)await pin(row.path,row.sha256);
for(const name of PRODUCER_FILES)await pin(path.join(here,name));
await pin(process.execPath);
for(const [file,hash] of inputs)await pin(file,hash);
const result={format:'aux.standard.daemon-projection.inputs.v4',root,producer:here,output,node:process.execPath,nodeVersion:process.version,immutableSha256:inputs.get(path.join(here,'immutable-inputs.json')),inputs:[...inputs].map(([path,sha256])=>({path,sha256})),preparedOnly:true,productExecuted:false,nativePairingPending:true};
await fs.writeFile(pinsArg,JSON.stringify(result,null,2)+'\n',{flag:'wx',mode:0o600});
console.log(JSON.stringify({frozen:true,pins:pinsArg,inputs:inputs.size,composed:false,projected:false,productExecuted:false}));
