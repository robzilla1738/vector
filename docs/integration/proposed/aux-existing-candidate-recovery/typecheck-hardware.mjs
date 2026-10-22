// SDK compile only. No executable is produced and no hardware entry point runs.
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const here=fileURLToPath(new URL('.',import.meta.url));
const temporary=await mkdtemp(path.join(tmpdir(),'aux-hardware-recovery-typecheck-'));
try {
 const text=await readFile(new URL('check.mjs',import.meta.url),'utf8');
 const declaration=text.slice(text.indexOf(' const files=['),text.indexOf(';\n const executable'));
 const files=[...declaration.matchAll(/'([^']+\.swift)'/g)].map(match=>match[1]).filter(file=>file!=='tests/main.swift');
 const result=spawnSync('/usr/bin/xcrun',['swiftc','-typecheck','-target','arm64-apple-macos13.0','-module-cache-path',path.join(temporary,'module-cache'),...files.map(file=>path.join(here,file))],{encoding:'utf8',timeout:90000,maxBuffer:1024*1024});
 if(result.error||result.status!==0)throw Error(`Hardware source typecheck failed: ${result.error?.message??result.stderr}`);
 console.log('PASS: separate-file SDK typecheck, explicit enclave P256 and macOS26 PQ recovery. No Security/SE/PQ operation executed.');
}finally{await rm(temporary,{recursive:true,force:true});}
