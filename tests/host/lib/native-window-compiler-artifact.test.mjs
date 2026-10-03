import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import ts from 'typescript';
import { decodeNativeWindowCompiler } from './native-window-compiler-protocol.mjs';
import { readStartupMachO } from './startup-helper-manifest.mjs';
const hash = value => createHash('sha256').update(value).digest('hex');
const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(k => [k, canonical(value[k])])) : value;
const raw = value => JSON.stringify(canonical(value)) + '\n';
// Controlled filesystem and synthetic Mach-O bytes only. The actual lease and
// existing Mach-O parser execute, but no compiler, helper or native process runs.
function fixture() {
 const root=fs.realpathSync(fs.mkdtempSync(join(tmpdir(),'aux-input-artifact-control-')));
 const put=(name,data,mode=0o644)=>{const path=join(root,name);fs.writeFileSync(path,data,{mode});return path;};
 const binary=Buffer.alloc(104);binary.writeUInt32LE(0xfeedfacf,0);binary.writeUInt32LE(0x100000c,4);binary.writeUInt32LE(2,12);binary.writeUInt32LE(3,16);binary.writeUInt32LE(72,20);
 binary.writeUInt32LE(0x1b,32);binary.writeUInt32LE(24,36);binary.fill(0xdd,40,56);
 binary.writeUInt32LE(0x32,56);binary.writeUInt32LE(24,60);binary.writeUInt32LE(1,64);binary.writeUInt32LE(15<<16,68);binary.writeUInt32LE((26<<16)|(1<<8),72);
 binary.writeUInt32LE(0x80000028,80);binary.writeUInt32LE(24,84);binary.writeBigUInt64LE(104n,88);
 const source=put('native-window.swift','controlled source');const sourceSha=hash(fs.readFileSync(source));
 const output=put(`native-window-${sourceSha.slice(0,12)}`,binary,0o755);
 const tool=put('tool','controlled tool',0o755),sdk=join(root,'sdk');fs.mkdirSync(sdk);
 const settings=put('sdk/SDKSettings.json','{}');
 const reader=fileURLToPath(new URL('./startup-helper-manifest.mjs',import.meta.url));
 const logs=name=>{const stdoutPath=put(`${name}.stdout`,name),stderrPath=put(`${name}.stderr`,'');return {stdoutPath,stdoutSha256:hash(fs.readFileSync(stdoutPath)),stderrPath,stderrSha256:hash(''),exitCode:0};};
 const m={producer:'aux-native-window-helper-compile',version:1,source:{commit:'b'.repeat(40),productTree:'c'.repeat(40),dirty:false,path:source,sha256:sourceSha,bytes:fs.statSync(source).size,mode:420},
 compiler:{launcher:{path:'/usr/bin/xcrun',sha256:hash('controlled tool')},swiftc:{path:tool,resolvedPath:tool,sha256:hash('controlled tool')},frontend:{path:tool,sha256:hash('controlled tool')},version:logs('version'),argv:['xcrun','swiftc',source,'-o',join(root,'original.tmp')],originalOutputPath:join(root,'original.tmp'),environment:{PATH:root,DEVELOPER_DIR:null,SDKROOT:null,TOOLCHAINS:null}},
 sdk:{path:sdk,resolvedPath:sdk,settingsPath:settings,settingsSha256:hash('{}'),version:'27.0',selection:logs('sdk')},compile:{originalPid:20,originalGroup:20,timedOut:false,cancelled:false,originalGroupEmpty:true,...logs('compile')},
 output:{path:output,sha256:hash(binary),bytes:binary.length,mode:493,architecture:'arm64',fileType:'MH_EXECUTE',uuid:'d'.repeat(32),minimumOS:'15.0.0',sdkVersion:'26.1.0'},
 readback:{readerPath:reader,readerSha256:hash(fs.readFileSync(reader)),stdoutPath:put('readback',JSON.stringify(readStartupMachO(binary))+'\n'),stdoutSha256:hash(JSON.stringify(readStartupMachO(binary))+'\n'),exitCode:0},admission:{independentAuditRequired:true,helperExecuted:false,performanceQualified:false}};
 const admission={manifestPath:put('manifest.json',raw(m)),manifestSha256:hash(raw(m)),auditPath:join(root,'audit.json')};
 const a={producer:'aux-native-window-helper-independent-audit',version:1,manifestPath:admission.manifestPath,manifestSha256:admission.manifestSha256,sourceSha256:sourceSha,executableSha256:m.output.sha256,launcherSha256:m.compiler.launcher.sha256,swiftcSha256:m.compiler.swiftc.sha256,frontendSha256:m.compiler.frontend.sha256,sdkSettingsSha256:m.sdk.settingsSha256,compilerVersionStdoutSha256:m.compiler.version.stdoutSha256,compilerVersionStderrSha256:m.compiler.version.stderrSha256,compileStdoutSha256:m.compile.stdoutSha256,compileStderrSha256:m.compile.stderrSha256,readbackStdoutSha256:m.readback.stdoutSha256,readerSha256:m.readback.readerSha256,compilerArgvSha256:hash(JSON.stringify(m.compiler.argv)),sourceCommit:m.source.commit,productTree:m.source.productTree,outputUuid:m.output.uuid,outputMinimumOS:m.output.minimumOS,outputSdkVersion:m.output.sdkVersion,sourceMode:420,outputMode:493};
 put('audit.json',raw(a));admission.auditSha256=hash(raw(a));
 const map=path=>path==='/usr/bin/xcrun'?tool:path;
 const controlledFs={...fs,lstatSync:path=>fs.lstatSync(map(path)),realpathSync:path=>fs.realpathSync(map(path))};
 const url=new URL('./native-window-compiler-artifact.mjs',import.meta.url),exports={};
 const code=ts.transpileModule(fs.readFileSync(url,'utf8').replaceAll('import.meta.url',JSON.stringify(url.href)),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true,target:ts.ScriptTarget.ES2022}}).outputText;
 const dependencies={'node:assert/strict':assert,'node:crypto':{createHash},'node:fs':controlledFs,'node:url':{fileURLToPath},'./native-window-compiler-protocol.mjs':{decodeNativeWindowCompiler},'./startup-helper-manifest.mjs':{readStartupMachO}};
 vm.runInNewContext(code,{exports,Buffer,process,URL,JSON,require(name){assert.ok(dependencies[name],name);return dependencies[name];}});
 return {m,admission,root,open:()=>exports.retainNativeWindowCompiler(admission),dispose:()=>fs.rmSync(root,{recursive:true,force:true})};
}
for(const changed of ['source','output','tool','settings','compileLog','manifest']) test(`held original ${changed} mutation refuses`,()=>{
 const f=fixture();let lease;try{lease=f.open();const path={source:f.m.source.path,output:f.m.output.path,tool:f.m.compiler.frontend.path,settings:f.m.sdk.settingsPath,compileLog:f.m.compile.stdoutPath,manifest:f.admission.manifestPath}[changed];fs.appendFileSync(path,'changed');assert.throws(()=>lease.validate());}finally{lease?.release();f.dispose();}
});
test('same-byte atomic executable replacement refuses original inode continuity',()=>{const f=fixture();let lease;try{lease=f.open();const p=f.m.output.path,copy=p+'.replacement';fs.writeFileSync(copy,fs.readFileSync(p),{mode:0o755});fs.renameSync(copy,p);assert.throws(()=>lease.validate(),/replaced/);}finally{lease?.release();f.dispose();}});
test('symlink manifest refuses before artifact admission',()=>{const f=fixture();try{fs.renameSync(f.admission.manifestPath,f.admission.manifestPath+'.original');fs.symlinkSync(f.admission.manifestPath+'.original',f.admission.manifestPath);assert.throws(f.open,/Symlink/);}finally{f.dispose();}});
test('retained controls preserve raw Mach-O versions, client bytes and retirement',()=>{const f=fixture();let lease;try{lease=f.open();assert.equal(lease.image.sdkVersion,'26.1.0');assert.equal(lease.loadedHelperProven,false);assert.equal(lease.performanceQualified,false);lease.matchOriginalClient({helperExecutable:f.m.output.path,helperSource:f.m.source.path});lease.validate();lease.release();assert.throws(()=>lease.validate(),/Retired/);}finally{lease?.release();f.dispose();}});
test('public documentary metadata cannot retarget the held original helper lease', () => {
 const f=fixture();let lease;try {
  lease=f.open();
  assert.throws(()=>{lease.decoded.manifest.output.path='/foreign/replacement';},TypeError);
  assert.throws(()=>{lease.decoded.manifest.compiler.argv.push('/foreign');},TypeError);
  assert.throws(()=>{lease.decoded.audit.sourceSha256='0'.repeat(64);},TypeError);
  lease.matchOriginalClient({helperExecutable:f.m.output.path,helperSource:f.m.source.path});lease.validate();
 } finally {lease?.release();f.dispose();}
});
