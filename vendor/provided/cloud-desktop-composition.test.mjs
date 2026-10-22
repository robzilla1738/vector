import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import test from 'node:test';
import { composeCloudDesktop } from './cloud-desktop-composition.mjs';

const sourcePath=new URL('../../out/provided-candidate-local-browser-pass/Aux.app/Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/node-development/index.mjs',import.meta.url);
test('complete actual shipped daemon composition preserves supplied replacement tokens and parses',async()=>{
  const text=await readFile(sourcePath,'utf8');
  const input={component:'daemon',path:'entry.mjs',text};
  assert.equal(composeCloudDesktop(input).text,text);
  const result=composeCloudDesktop(input,{enableCloud:true,profile:'development'});
  assert.equal(result.anchors.length,29);
  let replay=text;
  for(const anchor of result.anchors){assert.equal(replay.split(anchor.find).length-1,anchor.count);replay=replay.split(anchor.find).join(anchor.replace);}
  assert.equal(replay,result.text);
  assert.equal(result.text.includes('fetchAsideAPIAuthenticatedRequest'),false);
  assert.equal(result.text.includes('instanceof AsideApiError'),false);
  // The original SessionStore contains a literal $& regex replacement. A
  // replacement-string patch expands it and silently duplicates source code.
  assert.equal(result.text.split('SessionStore,init_store$1=').length,2);
  try{execFileSync(process.execPath,['--check','--input-type=module'],{input:result.text,stdio:['pipe','pipe','pipe']});}
  catch(error){throw Error('Composed daemon syntax check failed: '+String(error.stderr).split('\n').filter(line=>line.includes('SyntaxError')).join(' '));}
});
