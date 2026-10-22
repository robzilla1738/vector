// Compile minimal production-oriented graph, execute pure public pairing ONLY.
import {readFile,mkdtemp,rm} from 'node:fs/promises';import path from 'node:path';import {tmpdir} from 'node:os';import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
const here=fileURLToPath(new URL('.',import.meta.url)),proposal=path.resolve(here,'..'),wrapper=fileURLToPath(new URL('../../../../scripts/native-build.py',import.meta.url));
const temporary=await mkdtemp(path.join(tmpdir(),'aux-clean-runtime-host-check-'));
try {
 const shell=await readFile(path.join(proposal,'aux-runtime-target-capture/check.sh'),'utf8');
 const files=[...shell.matchAll(/"\$proposal\/([^"\n]+\.swift)"/g)].map(match=>match[1]).filter(file=>file!=='aux-runtime-target-capture/tests/main.swift').map(file=>path.join(proposal,file));
 files.push(path.join(proposal,'aux-clean-host-preflight/source/AuxCleanHostPreflight.swift'),path.join(here,'source/AuxCleanRuntimeHost.swift'));
 const object=path.join(temporary,'imports.o');
 function compile(args){const result=spawnSync('/usr/bin/python3',[wrapper,'/usr/bin/xcrun',...args],{encoding:'utf8',timeout:90000,maxBuffer:1024*1024});if(result.error||result.status!==0)throw Error(result.error?.message??result.stderr);}
 compile(['clang++','-std=c++20','-mmacosx-version-min=13.0','-c',path.join(proposal,'aux-clean-host-preflight/source/AuxCleanHostImports.cc'),'-o',object]);
 // Review646 changed only this source guard. Compile it without invoking its
 // constructor or adding external migration code to the delivered graph.
 compile(['swiftc','-typecheck','-target','arm64-apple-macos13.0','-module-cache-path',path.join(temporary,'cache'),path.join(proposal,'aux-native-p256-envelope-port/source/EnvelopeRecords.swift'),path.join(proposal,'aux-native-secure-store/source/AuxSecureStore.swift')]);
 const library=path.join(temporary,'libAuxCleanRuntimeHost.dylib');
 compile(['swiftc','-emit-library','-module-name','AuxCleanRuntimeHost','-target','arm64-apple-macos13.0','-module-cache-path',path.join(temporary,'cache'),...files,object,'-o',library]);
 if((await readFile(library)).toString('latin1').toLowerCase().includes('aside'))throw Error('Reference-product bytes in minimal clean runtime host library');
 const executable=path.join(temporary,'fixture');
 compile(['swiftc','-target','arm64-apple-macos13.0','-module-cache-path',path.join(temporary,'cache'),...files,path.join(here,'tests/main.swift'),object,'-o',executable]);
 const run=spawnSync(executable,[],{encoding:'utf8',timeout:10000,maxBuffer:1024*1024});if(run.error||run.status!==0)throw Error(run.error?.message??run.stderr);process.stdout.write(run.stdout);
}finally{await rm(temporary,{recursive:true,force:true});}
