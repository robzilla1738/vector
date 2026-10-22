// Actual private filesystem; fixed synthetic authority in memory only.
import {readFile,mkdtemp,mkdir,realpath,rm} from 'node:fs/promises';
import path from 'node:path';import {tmpdir} from 'node:os';import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
const here=fileURLToPath(new URL('.',import.meta.url)),proposal=path.resolve(here,'..');
const temporary=await mkdtemp(path.join(tmpdir(),'aux-durable-selection-check-'));
try{
 const shell=await readFile(path.join(proposal,'aux-terminal-command-context/check.sh'),'utf8');
 const files=[...shell.matchAll(/"\$proposal\/([^"\n]+\.swift)"/g)].map(match=>path.join(proposal,match[1])).map(file=>file.endsWith('/aux-installation-journal-store/source/PrivateInstallationJournalStore.swift')?path.join(here,'source/PrivateInstallationJournalStore.swift'):file.endsWith('/aux-terminal-command-context/tests/main.swift')?path.join(here,'tests/main.swift'):file);
 files.push(path.join(here,'source/InstallationSelection.swift'));
 const executable=path.join(temporary,'fixture');const result=spawnSync('/usr/bin/xcrun',['swiftc','-target','arm64-apple-macos13.0','-module-cache-path',path.join(temporary,'module-cache'),...files,'-o',executable],{encoding:'utf8',timeout:90000,maxBuffer:1024*1024});
 if(result.error||result.status!==0)throw Error(result.error?.message??result.stderr);
 const root=path.join(await realpath(temporary),'selection-fixture');await mkdir(root,{mode:0o700});
 const run=spawnSync(executable,[root],{encoding:'utf8',timeout:30000,maxBuffer:1024*1024});if(run.error||run.status!==0)throw Error(run.error?.message??run.stderr);process.stdout.write(run.stdout);
}finally{await rm(temporary,{recursive:true,force:true});}
