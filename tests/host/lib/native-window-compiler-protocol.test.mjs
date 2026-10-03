import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { decodeNativeWindowCompiler } from './native-window-compiler-protocol.mjs';
const hash=value=>createHash('sha256').update(value).digest('hex');
const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])])):value;
const raw=value=>JSON.stringify(canonical(value))+'\n';
// Pure synthetic documents only, never actual compiled artifact admission.
function fixture(){
 const sha='a'.repeat(64),logs={stdoutPath:'/controlled/stdout',stdoutSha256:sha,stderrPath:'/controlled/stderr',stderrSha256:sha,exitCode:0};
 const m={producer:'aux-native-window-helper-compile',version:1,
 source:{commit:'b'.repeat(40),productTree:'c'.repeat(40),dirty:false,path:'/controlled/native-window.swift',sha256:sha,bytes:100,mode:420},
 compiler:{launcher:{path:'/usr/bin/xcrun',sha256:sha},swiftc:{path:'/controlled/swiftc',resolvedPath:'/controlled/swift-driver',sha256:sha},frontend:{path:'/controlled/swift-frontend',sha256:sha},version:{...logs},argv:['xcrun','swiftc','/controlled/native-window.swift','-o','/controlled/original.tmp'],originalOutputPath:'/controlled/original.tmp',environment:{PATH:'/controlled',DEVELOPER_DIR:null,SDKROOT:null,TOOLCHAINS:null}},
 sdk:{path:'/controlled/sdk',resolvedPath:'/controlled/actual-sdk',settingsPath:'/controlled/sdk/SDKSettings.json',settingsSha256:sha,version:'27.0',selection:{...logs}},
 compile:{originalPid:20,originalGroup:20,timedOut:false,cancelled:false,originalGroupEmpty:true,...logs},
 output:{path:'/controlled/native-window-aaaaaaaaaaaa',sha256:sha,bytes:1000,mode:493,architecture:'arm64',fileType:'MH_EXECUTE',uuid:'d'.repeat(32),minimumOS:'15.0.0',sdkVersion:'26.1.0'},
 readback:{readerPath:'/controlled/startup-helper-manifest.mjs',readerSha256:sha,stdoutPath:'/controlled/readback',stdoutSha256:sha,exitCode:0},
 admission:{independentAuditRequired:true,helperExecuted:false,performanceQualified:false}};
 const admission={manifestPath:'/controlled/manifest.json',manifestSha256:hash(raw(m)),auditPath:'/controlled/root-audit.json'};
 const a={producer:'aux-native-window-helper-independent-audit',version:1,manifestPath:admission.manifestPath,manifestSha256:admission.manifestSha256,
 sourceSha256:sha,executableSha256:sha,launcherSha256:sha,swiftcSha256:sha,frontendSha256:sha,sdkSettingsSha256:sha,
 compilerVersionStdoutSha256:sha,compilerVersionStderrSha256:sha,compileStdoutSha256:sha,compileStderrSha256:sha,readbackStdoutSha256:sha,readerSha256:sha,
 compilerArgvSha256:hash(JSON.stringify(m.compiler.argv)),sourceCommit:m.source.commit,productTree:m.source.productTree,
 outputUuid:m.output.uuid,outputMinimumOS:'15.0.0',outputSdkVersion:'26.1.0',sourceMode:420,outputMode:493};
 const decode=()=>{const manifestRaw=raw(m);admission.manifestSha256=hash(manifestRaw);a.manifestSha256=admission.manifestSha256;
  const auditRaw=raw(a);admission.auditSha256=hash(auditRaw);return decodeNativeWindowCompiler(manifestRaw,auditRaw,admission);};
 return {m,a,admission,decode};
}
test('matching synthetic original documents retain actual version distinctions without artifact proof',()=>{
 const f=fixture(),value=f.decode();assert.equal(value.manifest.sdk.version,'27.0');assert.equal(value.manifest.output.sdkVersion,'26.1.0');
 assert.equal(value.independentDocumentsMatched,true);assert.equal(value.retainedOriginalFilesProven,false);assert.equal(value.loadedHelperProven,false);assert.equal(value.performanceQualified,false);
 assert.throws(()=>{value.manifest.output.uuid='e'.repeat(32);},TypeError);
});
test('approved digest must be external; changed raw bytes cannot self-admit',()=>{
 const f=fixture();f.decode();assert.throws(()=>decodeNativeWindowCompiler(raw(f.m)+' ',raw(f.a),f.admission),/approved original/);
});
test('duplicate keys, extra whitespace and exponential numeric serialization refuse even with supplied matching hashes',()=>{
 for(const change of [s=>s.replace('"version":1','"version":1,"version":1'),s=>s.replace('"version":1','"version":1e0'),s=>s.replace('{','{ ')]){
  const f=fixture();f.decode();const changed=change(raw(f.m));f.admission.manifestSha256=hash(changed);
  assert.throws(()=>decodeNativeWindowCompiler(changed,raw(f.a),f.admission),/Noncanonical/);
 }
});
test('cancelled, timeout, live process group, unsafe executable and invented command refuse',()=>{
 for(const change of [f=>f.m.compile.cancelled=true,f=>f.m.compile.timedOut=true,f=>f.m.compile.originalGroupEmpty=false,
 f=>f.m.compile.originalGroup=21,f=>f.m.output.mode=511,f=>f.m.compiler.argv.push('--selector'),f=>f.m.source.dirty=true,
 f=>f.m.output.uuid='0'.repeat(32),f=>f.m.output.fileType='MH_DYLIB',f=>f.m.compiler.environment.token='caller']){
  const f=fixture();change(f);assert.throws(f.decode);
 }
});
test('missing or compiler-self-produced audit cannot replace independent root metadata',()=>{
 for(const change of [f=>delete f.a.frontendSha256,f=>f.a.producer='aux-native-window-helper-compile',
 f=>f.a.outputMinimumOS='27.0.0',f=>f.a.compilerArgvSha256='f'.repeat(64),f=>f.a.sourceMode=493]){
  const f=fixture();change(f);assert.throws(f.decode,/Independent/);
 }
});
