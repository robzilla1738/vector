// NO module load: compile callable source, inspect bytes, execute public facts.
import {mkdtemp,readFile,rm} from 'node:fs/promises';import path from 'node:path';import {tmpdir} from 'node:os';import {fileURLToPath} from 'node:url';import {spawn} from 'node:child_process';
const here=fileURLToPath(new URL('.',import.meta.url)),proposal=path.resolve(here,'..'),root=fileURLToPath(new URL('../../../../',import.meta.url));
const temporary=await mkdtemp(path.join(tmpdir(),'aux-development-host-compile-'));
function run(command,args){return new Promise((resolve,reject)=>{const child=spawn(command,args,{stdio:['ignore','pipe','pipe']});let output='',error='';child.stdout.on('data',chunk=>output+=chunk);child.stderr.on('data',chunk=>error+=chunk);child.once('error',reject);child.once('close',code=>code===0?resolve(output):reject(Error(error||`compile exited ${code}`)));});}
try {
 const headers='/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/runtime/node/include/node';
 await run('/usr/bin/python3',[path.join(root,'scripts/native-build.py'),'sh',path.join(here,'build.sh'),proposal,headers,temporary]);
 const bytes=await readFile(path.join(temporary,'aux-runtime-owned.node'));if(bytes.toString('latin1').toLowerCase().includes('aside'))throw Error('Reference-product literal in new development runtime graph');
 process.stdout.write(await run(path.join(temporary,'public-fixture'),[]));
 console.log('PASS: composed native source compiled; .node not loaded, no initializer, signed-policy loader and Security never invoked.');
}finally{await rm(temporary,{recursive:true,force:true});}
