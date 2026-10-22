// Build-recipe generation only: no compiler, addon or lifecycle fixture runs.
import {readFile,mkdtemp,rm,access} from 'node:fs/promises';import path from 'node:path';import {tmpdir} from 'node:os';import {fileURLToPath} from 'node:url';import {spawnSync} from 'node:child_process';import assert from 'node:assert/strict';
const here=fileURLToPath(new URL('../',import.meta.url)),proposal=path.resolve(here,'..');
const shell=await readFile(path.join(here,'build.sh'),'utf8');
const begin='python3 - "$proposal" "$output" "$mode" <<\'PY\'\n';
assert.equal(shell.split(begin).length,2);const program=shell.split(begin)[1].split('\nPY\n')[0];
const root=await mkdtemp(path.join(tmpdir(),'aux-worker-build-modes-'));
try {
 const outputs=[];
 for(const mode of ['','--compile-only']){
  const output=await mkdtemp(path.join(root,'mode-'));
  const result=spawnSync('/usr/bin/python3',['-c',program,proposal,output,mode],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
  outputs.push({source:await readFile(path.join(output,'source-build.sh'),'utf8'),inputs:JSON.parse(await readFile(path.join(output,'production-source-inputs.json')))});
  if(mode){await assert.rejects(access(path.join(output,'fixture-build.sh')));await assert.rejects(access(path.join(output,'FixtureOwnerDrain.swift')));}
  else {await access(path.join(output,'fixture-build.sh'));await access(path.join(output,'FixtureOwnerDrain.swift'));}
 }
 assert.deepEqual(outputs[0],outputs[1]);
 assert(outputs[0].inputs.inputs.length>0);assert(!outputs[0].inputs.inputs.some(unit=>unit.path.includes('/tests/')));
 console.log(`PASS build modes generate identical ${outputs[0].inputs.inputs.length}-unit production recipe; compile-only omits fixture recipe/source; no native compile or lifecycle run.`);
}finally{await rm(root,{recursive:true,force:true});}
