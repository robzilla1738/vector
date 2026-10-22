import {mkdtemp,mkdir,readFile,rm} from 'node:fs/promises';import path from 'node:path';import {tmpdir} from 'node:os';import {fileURLToPath} from 'node:url';import {spawn} from 'node:child_process';
const here=fileURLToPath(new URL('.',import.meta.url)),proposal=path.resolve(here,'..'),root=fileURLToPath(new URL('../../../../',import.meta.url));
const runtime='/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/runtime/node';
const temporary=await mkdtemp(path.join(tmpdir(),'aux-development-worker-'));
function run(command,args,environment){return new Promise((resolve,reject)=>{const child=spawn(command,args,{stdio:['ignore','pipe','pipe'],...(environment?{env:environment}:{})});let output='',error='';const timer=setTimeout(()=>{child.kill('SIGKILL');reject(Error('Bounded worker check timeout'));},240000);child.stdout.on('data',chunk=>output+=chunk);child.stderr.on('data',chunk=>error+=chunk);child.once('error',reject);child.once('close',code=>{clearTimeout(timer);code===0?resolve(output):reject(Error(output+'\n'+(error||`exited ${code}`)));});});}
try {
 await run('/usr/bin/python3',[path.join(root,'scripts/native-build.py'),'sh',path.join(here,'build.sh'),proposal,path.join(runtime,'include/node'),temporary]);
 const bytes=await readFile(path.join(temporary,'aux-runtime-owned.node'));if(bytes.toString('latin1').toLowerCase().includes('aside'))throw Error('Old-product literal in new graph');
 const home=path.join(temporary,'home');await mkdir(home,{mode:0o700});
 console.log(await run(path.join(runtime,'bin/node'),[path.join(here,'tests/check.cjs'),path.join(temporary,'aux-synthetic-fixture.node')],{PATH:'/usr/bin:/bin',HOME:home,TMPDIR:temporary}));
 console.log('PASS source graph compiled, actual worker lifecycle fixture passed; real signed-policy producer never executed.');
}finally{await rm(temporary,{recursive:true,force:true});}
