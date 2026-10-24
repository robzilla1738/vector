import {createHash} from 'node:crypto';
const sha=value=>createHash('sha256').update(value).digest('hex');
const gate=String.raw`
async function inspectWithAuthority(authority, destination) {
  if (destination !== path.join(authority.roots.taskHome, 'runtime')) throw Error('Runtime inspection destination does not match native task home');
  const report = await authority.functions.inspectRuntimeCache();
  const current = authority.functions.captureStorageRoots();
  if (authority.keys.some(key => current[key] !== authority.roots[key])) throw Error('Runtime owner changed during inspection');
  const fields=['format','authority','status','ownerGeneration','transportGeneration','checkedEntries','missing','modified','unsafe'];
  if (!report || !Object.isFrozen(report) || Object.keys(report).sort().join('\0') !== fields.sort().join('\0') ||
      report.format !== 'aux.runtime-cache-inspection.v1' || report.authority !== 'none' ||
      report.ownerGeneration !== authority.roots.ownerGeneration || report.transportGeneration !== authority.roots.transportGeneration ||
      !['checkedEntries','missing','modified','unsafe'].every(key => Number.isSafeInteger(report[key]) && report[key] >= 0 && report[key] <= 10930)) throw Error('Invalid native runtime inspection');
  if (['incomplete','unsafe','cancelled'].includes(report.status)) throw Object.assign(Error('Retained runtime is incomplete, unsafe or no longer current'), {code:'AUX_RUNTIME_CACHE_REFUSED'});
  if (!['matching-seed','unverified-modified','unverified-newer','unverified-other-version'].includes(report.status)) throw Error('Unknown native runtime inspection result');
  // Modified and newer caches retain original downstream compatibility checks.
  // This result never asserts update provenance or grants execution authority.
  return report;
}
`;
export function applyRuntimeCacheInspection(source,{kind,inputSha256}) {
  if(sha(source)!==inputSha256)throw Error('Runtime cache inspection input hash mismatch');
  const edits=[];
  const replace=(before,after,count=1)=>{
    if(source.split(before).length-1!==count)throw Error(`Runtime cache inspection anchor drift: ${kind}`);
    source=source.split(before).join(after);edits.push({before,after,count});
  };
  if(kind==='seed'){
    replace('async function seedBundledRuntime({ source, home, bundleRuntimeRoot, pins }) {','async function seedBundledRuntime({ source, home, bundleRuntimeRoot, pins, inspectRetainedRuntime }) {');
    replace('return { retained: true, runtime, seeded: false };',"if (typeof inspectRetainedRuntime !== 'function') throw Error('Native retained-runtime inspection required');\n    const inspection = await inspectRetainedRuntime();\n    return { retained: true, runtime, seeded: false, inspection };",2);
  }else if(kind==='bootstrap'){
    replace("['captureStorageRoots','withBrokerAwaited']","['captureStorageRoots','withBrokerAwaited','inspectRuntimeCache']");
    replace('let active,activeRoots;',gate+'\nlet active,activeRoots;');
    replace('return seedBundledRuntime({ source: path.join(root, \'agent-runtime\'), home, bundleRuntimeRoot: report.runtimeRoot, pins });',"return seedBundledRuntime({ source: path.join(root, 'agent-runtime'), home, bundleRuntimeRoot: report.runtimeRoot, pins,\n      inspectRetainedRuntime: () => inspectWithAuthority(authority, destination) });");
    source+="\nObject.defineProperty(module.exports, 'inspectRetainedRuntime', {value: async function inspectRetainedRuntime(destination) {\n  return inspectWithAuthority(captureNativeRuntime(), destination);\n}});\n";
  }else if(kind==='daemon'){
    const before='if(Cn?.aborted)throw Cn.reason??new DOMException(`Operation aborted`,`AbortError`);if(agentRuntimeJob.state===`failed`&&!await serializeReplacement';
    const call='await (await import(`node:module`)).createRequire(process.execPath)(path.join(__auxDaemonResources,`native/runtime-bootstrap.cjs`)).inspectRetainedRuntime(path.resolve(ei.runtimeDir??AUX_RUNTIME_DIR));';
    replace(before,'if(Cn?.aborted)throw Cn.reason??new DOMException(`Operation aborted`,`AbortError`);'+call+'if(Cn?.aborted)throw Cn.reason??new DOMException(`Operation aborted`,`AbortError`);if(agentRuntimeJob.state===`failed`&&!await serializeReplacement');
    replace('runtimeUseCount+=1;let ti=!1;return{state:`ready`','if(activeInstall)return acquireAgentRuntimeUse(Cn,ei);if(Cn?.aborted)throw Cn.reason??new DOMException(`Operation aborted`,`AbortError`);runtimeUseCount+=1;let ti=!1;return{state:`ready`');
  }else throw Error('Unknown runtime cache inspection input kind');
  return {source,kind,inputSha256,outputSha256:sha(source),edits};
}
