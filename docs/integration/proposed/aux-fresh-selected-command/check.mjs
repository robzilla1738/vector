import {mkdtemp,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import path from 'node:path';import {spawn} from 'node:child_process';import {fileURLToPath} from 'node:url';
const here=fileURLToPath(new URL('.',import.meta.url)),root=fileURLToPath(new URL('../../../../',import.meta.url));
const temporary=await mkdtemp(path.join(tmpdir(),'aux-fresh-selected-build-'));
try {
 await new Promise((resolve,reject)=>{const p=spawn('/usr/bin/python3',[path.join(root,'scripts/native-build.py'),'sh',path.join(here,'build.sh'),path.resolve(here,'..'),temporary],{stdio:['ignore','pipe','pipe']});let out='',err='';p.stdout.on('data',x=>out+=x);p.stderr.on('data',x=>err+=x);p.on('error',reject);p.on('close',code=>code===0?(console.log(out),resolve()):reject(Error(err||out||`exit ${code}`)));});
}finally{await rm(temporary,{recursive:true,force:true});}
