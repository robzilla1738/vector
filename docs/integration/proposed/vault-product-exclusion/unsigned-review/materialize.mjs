/** Review-only construction. Never launches or signs code. Refuses existing output. */
import { readFileSync, writeFileSync, mkdirSync, cpSync, readdirSync, lstatSync, readlinkSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { SourceTextModule } from 'node:vm';
import { findMachOSeaSection, readSeaBlob, writeSeaBlob, injectMachOSeaBlob } from '../../../../../vendor/aside/lib/sea.mjs';
import { propose, sha256, disabledSeed, edits } from '../proposal.mjs';
const [sourceArg, outputArg] = process.argv.slice(2);
if (!sourceArg || !outputArg) throw Error('Required: archived585 daemon bundle and fresh review output');
const source = resolve(sourceArg), output = resolve(outputArg);
if (!source.includes('provided-candidate-local-browser-pass-v585-observed-baseline/Aux.app/')) throw Error('Archived585 only');
const exe = 'Contents/MacOS/aux-daemon', seed = 'Contents/Resources/static/skills/builtin/password-manager/SKILL.md';
const original = readFileSync(join(source, exe));
if (sha256(original) !== '7ab8e9a0fcc5696f136f577a5c84b9c14f5b265941212d1cdedc573df656d17a') throw Error('Binary pin mismatch');
if (sha256(readFileSync(join(source, seed))) !== '0be8047c194df62c61a160aafd00d33daf6d124caba60ac8c2271d432c7ffab3') throw Error('Seed pin mismatch');
const section = findMachOSeaSection(original);
const blob = readSeaBlob(original.subarray(section.offset, section.offset + section.size));
const proposed = propose(blob.code);
new SourceTextModule(proposed.code, { identifier: 'review-only-daemon.mjs' });
const injected = injectMachOSeaBlob(Buffer.from(original), writeSeaBlob({...blob, code:proposed.code}));
const nextSection = findMachOSeaSection(injected);
const reconstructed = readSeaBlob(injected.subarray(nextSection.offset, nextSection.offset + nextSection.size));
if (!writeSeaBlob({...reconstructed, code:blob.code}).equals(writeSeaBlob(blob))) throw Error('Non-code SEA state changed');
if (reconstructed.code !== proposed.code) throw Error('SEA roundtrip mismatch');
function inventory(root, dir = '') {
  return readdirSync(join(root, dir)).sort().flatMap(name => {
    const path = join(dir, name), full = join(root,path), stat=lstatSync(full);
    if(stat.isDirectory()) return inventory(root,path);
    return [{path,mode:stat.mode & 0o777,type:stat.isSymbolicLink()?'symlink':'file',...(stat.isSymbolicLink()?{target:readlinkSync(full)}:{sha256:sha256(readFileSync(full)),bytes:stat.size})}];
  });
}
const before=inventory(source);
mkdirSync(output, {mode:0o700});
const candidate=join(output,'Aux Daemon.app');
cpSync(source,candidate,{recursive:true,dereference:false,preserveTimestamps:true,errorOnExist:true});
writeFileSync(join(candidate,exe),injected);
writeFileSync(join(candidate,seed),disabledSeed);
const after=inventory(candidate);
const changed=after.filter((x,i)=>JSON.stringify(x)!==JSON.stringify(before[i]));
if(before.length!==after.length || changed.length!==2 || changed.some(x=>![exe,seed].includes(x.path))) throw Error('Unexpected bundle mutation');
const report={kind:'unsigned-review-only-not-launchable',source,candidate,sourceEditCount:edits.length,countPerAnchor:1,baseCodeSha256:sha256(blob.code),proposedCodeSha256:proposed.sha256,changedArtifacts:changed.map(x=>({path:x.path,beforeSha256:before.find(b=>b.path===x.path).sha256,afterSha256:x.sha256,bytes:x.bytes})),leafCount:after.length,unchangedLeafCount:after.length-2,seaAssets:blob.assets.map(([name,bytes])=>({name,sha256:sha256(bytes),bytes:bytes.length})),seaNonCodeRoundtripPreserved:true,syntaxCompiledWithoutEvaluation:true,signingPerformed:false,runtimeExecuted:false,keychainAccessed:false,signatureStatus:'Original signature metadata retained but INVALIDATED by two changed leaves. No signature removed or added.',before,after};
writeFileSync(join(output,'review.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
writeFileSync(join(output,'proposed-daemon.mjs'),proposed.code,{flag:'wx',mode:0o600});
writeFileSync(join(output,'DO-NOT-LAUNCH.txt'),'Unsigned review copy. Original signature is invalidated. No runtime acceptance.\n',{flag:'wx'});
console.log(JSON.stringify({output,changedArtifacts:report.changedArtifacts,leafCount:report.leafCount,reviewSha256:sha256(readFileSync(join(output,'review.json'))),signingPerformed:false,runtimeExecuted:false}));
