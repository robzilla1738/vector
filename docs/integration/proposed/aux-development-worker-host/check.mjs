import {mkdtemp,mkdir,readFile,rm} from 'node:fs/promises';import path from 'node:path';import {tmpdir} from 'node:os';import {fileURLToPath} from 'node:url';import {spawn} from 'node:child_process';import {createHash} from 'node:crypto';
const here=fileURLToPath(new URL('.',import.meta.url)),proposal=path.resolve(here,'..'),root=fileURLToPath(new URL('../../../../',import.meta.url));
const runtime='/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/runtime/node';
const args=process.argv.slice(2),compileOnly=args.length===1&&args[0]==='--compile-only';
if(args.length&&!compileOnly){console.error('Usage: node check.mjs [--compile-only]');process.exit(2);}
const temporary=await mkdtemp(path.join(tmpdir(),'aux-development-worker-'));
function run(command,args,environment,timeout=240000){return new Promise((resolve,reject)=>{const child=spawn(command,args,{stdio:['ignore','pipe','pipe'],...(environment?{env:environment}:{})});let output='',error='';const timer=setTimeout(()=>{child.kill('SIGKILL');reject(Error('Bounded worker check timeout'));},timeout);child.stdout.on('data',chunk=>output+=chunk);child.stderr.on('data',chunk=>error+=chunk);child.once('error',reject);child.once('close',code=>{clearTimeout(timer);code===0?resolve(output):reject(Error(output+'\n'+(error||`exited ${code}`)));});});}
try {
 await run('/usr/bin/python3',[path.join(root,'scripts/native-build.py'),'sh',path.join(here,'build.sh'),proposal,path.join(runtime,'include/node'),temporary,...(compileOnly?['--compile-only']:[])]);
 const bytes=await readFile(path.join(temporary,'aux-runtime-owned.node'));if(bytes.toString('latin1').toLowerCase().includes('aside'))throw Error('Old-product literal in new graph');
 const inventory=JSON.parse(await readFile(path.join(temporary,'production-source-inputs.json')));
 if(inventory.format!=='aux.worker.production.compile.inputs.v1'||!Array.isArray(inventory.inputs)||!inventory.inputs.length)throw Error('Missing actual production source inventory');
 const seen=new Set();let swift=0,cpp=0;
 for(const unit of inventory.inputs){
   if(typeof unit.path!=='string'||!/^aux-[a-z0-9-]+\/source\/[A-Za-z0-9_-]+\.(swift|cc)$/.test(unit.path)||seen.has(unit.path))throw Error('Invalid production translation unit');
   seen.add(unit.path);const source=await readFile(path.join(proposal,unit.path));
   if(createHash('sha256').update(source).digest('hex')!==unit.sha256)throw Error('Production source changed during compile: '+unit.path);
   if(unit.path.endsWith('.swift'))swift++;else cpp++;
 }
 console.log(`Actual production graph compiled: ${swift} Swift + ${cpp} C++ units; compiled old-product literal count 0; artifact SHA-256 ${createHash('sha256').update(bytes).digest('hex')}.`);
 if(compileOnly){
   console.log('PASS compile-only: no lifecycle fixture compiled or run; signed-policy producer, native attachment and Security never executed. Historical lifecycle evidence was not updated.');
 }else{
   const home=path.join(temporary,'home');await mkdir(home,{mode:0o700});
   console.log(await run(path.join(runtime,'bin/node'),[path.join(here,'tests/check.cjs'),path.join(temporary,'aux-synthetic-fixture.node')],{PATH:'/usr/bin:/bin',HOME:home,TMPDIR:temporary},15000));
   console.log('PASS source graph compiled, actual worker lifecycle fixture passed; real signed-policy producer never executed.');
 }

}finally{await rm(temporary,{recursive:true,force:true});}
