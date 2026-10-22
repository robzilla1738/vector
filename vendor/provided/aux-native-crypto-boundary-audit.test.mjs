import test from'node:test';import assert from'node:assert/strict';import{readFileSync}from'node:fs';import{createHash}from'node:crypto';import{inspectAuxNativeCryptoBoundary}from'./aux-native-crypto-boundary-audit.mjs';
const source=process.env.AUX_PINNED_DAEMON_SOURCE,binary=process.env.AUX_PINNED_NATIVE_ADDON;
test('actual pinned JS routing, native ranges and ARM64 crypto calls agree; altered inputs refuse',{skip:!source||!binary},()=>{
 const root=new URL('../../docs/integration/proposed/aux-native-crypto-boundary/',import.meta.url),manifest=JSON.parse(readFileSync(new URL('static-artifacts.json',root))),binaryBytes=readFileSync(binary),daemonSourceBytes=readFileSync(source);
 for(const entry of manifest.entries)assert.equal(createHash('sha256').update(readFileSync(new URL(entry.path,root))).digest('hex'),entry.sha256);
 const result=inspectAuxNativeCryptoBoundary({binaryBytes,daemonSourceBytes,manifest});assert.equal(result.verifiedFunctionRanges,12);assert.equal(result.verifiedCallTargets,13);assert.equal(result.execution,false);assert.equal(result.authorityAccess,false);
 const changed=Buffer.from(binaryBytes);changed[0x3d840]^=1;assert.throws(()=>inspectAuxNativeCryptoBoundary({binaryBytes:changed,daemonSourceBytes,manifest}),/pin/);
 const bad=structuredClone(manifest);bad.calls[0].target+=4;assert.throws(()=>inspectAuxNativeCryptoBoundary({binaryBytes,daemonSourceBytes,manifest:bad}),/target drift/);
});
