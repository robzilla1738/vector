import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile,mkdtemp,writeFile,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {Worker} from 'node:worker_threads';
const [modulePath,hash,controlPath,scenario]=process.argv.slice(2);
assert.equal(createHash('sha256').update(await readFile(modulePath)).digest('hex'),hash);
assert.notEqual(hash,'bfe946e05fbaf2ae68d0560258f50e63a6c3ff6da2937e0aa8f9f19016e1f7fb');
const require=createRequire(import.meta.url),{pdf}=require(modulePath),control=require(controlPath);
control.initialize(modulePath);
assert.deepEqual(Object.keys(pdf).sort(),['extractText','fillFormFields','getFormFields','merge','renderPages','rotate','split'].sort());
assert.equal(control.pending(),0);
const temporary=await mkdtemp(path.join(tmpdir(),'aux-pdf-custody-'));
function encode(objects){let bytes='%PDF-1.7\n',offsets=[0];for(let i=0;i<objects.length;i++){offsets.push(Buffer.byteLength(bytes));bytes+=`${i+1} 0 obj\n${objects[i]}\nendobj\n`;}const xref=Buffer.byteLength(bytes);return bytes+`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`+offsets.slice(1).map(n=>`${String(n).padStart(10,'0')} 00000 n \n`).join('')+`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;}
const file=path.join(temporary,'synthetic.pdf'),stream='BT /F1 12 Tf 20 250 Td (Aux PDF Custody) Tj ET\n';
await writeFile(file,encode(['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 300] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',`<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}endstream`,'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>']),{mode:0o600});
let worker;
try{
 if(scenario==='reentrant'){
  const input={get filePath(){assert.throws(()=>pdf.extractText({}),/already active on this thread/);assert.equal(control.pending(),1);assert.equal(control.close(),1);return file;}};
  assert.match(pdf.extractText(input).pages[0].text,/Aux PDF Custody/);
 }else if(scenario==='worker'){
  const shared=new SharedArrayBuffer(4),view=new Int32Array(shared);
  worker=new Worker(`const {parentPort,workerData}=require('node:worker_threads');const pdf=require(workerData.modulePath).pdf;const view=new Int32Array(workerData.shared);const input={get filePath(){parentPort.postMessage('admitted');if(Atomics.wait(view,0,0,10000)==='timed-out')throw Error('Fixture release timeout');return workerData.file;}};const result=pdf.extractText(input);parentPort.postMessage(result.pages[0].text);`,{eval:true,workerData:{modulePath,file,shared}});
  const exited=new Promise((resolve,reject)=>{worker.once('error',reject);worker.once('exit',code=>code===0?resolve():reject(Error(`worker exit ${code}`)));});
  const message=()=>new Promise((resolve,reject)=>{worker.once('message',resolve);worker.once('error',reject);});
  assert.equal(await message(),'admitted');assert.equal(control.pending(),1);assert.equal(control.close(),1);
  for(const operation of Object.values(pdf))assert.throws(()=>operation({}),/Native PDF admission is closed/);
  const completed=message();Atomics.store(view,0,1);Atomics.notify(view,0);assert.match(await completed,/Aux PDF Custody/);await exited;
 }else if(scenario==='idle'){assert.equal(control.close(),0);}
 else throw Error('Unknown fixture scenario');
 assert.equal(control.pending(),0);assert.equal(control.close(),0);assert.equal(control.close(),0);
 for(const operation of Object.values(pdf))assert.throws(()=>operation({}),/Native PDF admission is closed/);
 console.log(`PASS actual PDF native custody ${scenario}; synchronous native operations, own synthetic document only`);
}finally{if(worker)await worker.terminate();await rm(temporary,{recursive:true,force:true});}
