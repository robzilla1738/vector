import { createHash } from 'node:crypto';
import { decodeNativeWindowCompiler } from '../../host/lib/native-window-compiler-protocol.mjs';
const hash=value=>createHash('sha256').update(value).digest('hex');
const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])])):value;
const raw=value=>JSON.stringify(canonical(value))+'\n';
// Explicit synthetic externally pinned documents; no actual artifact/helper proof.
export function syntheticCompilerFixture(){
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
