from pathlib import Path
import json,hashlib,subprocess,stat
P=Path('/private/tmp/aux-builder-native332-preparation-001');R=Path('/private/tmp/aux-browser-runtime-builder-native332-source-001');O=R/'release/test-artifacts/builder-native332-d9a0e06e-runtime-helper-target27-001'
def h(p):
 with Path(p).open('rb') as f:return hashlib.file_digest(f,'sha256').hexdigest()
C=P/'NATIVE332-RUNTIME-HELPER-TERMINAL-CLOSURE-001.json';assert h(C)=='ad6c596567ba02d7947bc868aac363770a8b8d6ad7ae1717028be5d0e0bc8158';c=json.loads(C.read_text())
for p,v in c['artifactPins'].items():assert h(p)==v['sha256'] and Path(p).stat().st_size==v['bytes'],p
pair=O/'pair-proof.json';assert h(pair)=='54f1685ec03f3d958dbe1d549c345ca7ec927070ff5c8bdb46c9559c2801a399';d=json.loads(pair.read_text());g=json.loads((R/'release/test-artifacts/builder-native332-d9a0e06e-native-build-001/compiled-stage-guard.json').read_text())
for k in ['identity','native','generated','binaries','componentLibraries','paks','shellFiles','packetFiles','originalMetadata','sourceGateFiles','terminalProofSha256','argsSha256','versionHeaderSha256']:assert d[k]==g[k],k
for p,v in d['runtimeFiles'].items():assert h(Path(d['runtimeRoot'])/p)==v,p
assert len(d['runtimeFiles'])==92 and json.loads((Path(d['runtimeRoot'])/'aux-runtime-identity.json').read_text())==d['identity']
assert h(d['helperExecutable'])==d['helperExecutableSha256'];assert h(d['originalHelperExecutable'])==d['originalHelperUnchangedSha256'];assert d['runtimeStaged'] and d['helperCompiled'] and not d['appLaunched'] and not d['assertionsExecuted']
for p,v in d['generated'].items():assert h(p)==v and stat.S_IMODE(Path(p).stat().st_mode)==0o644
mPath=Path(d['helperCompilerManifestPath']);assert h(mPath)==d['helperCompilerManifestSha256']=='1da99d6cfe64a936ce5075411b678c303e45f43b276ddc68088026bd889d687d';m=json.loads(mPath.read_text());assert mPath.read_text()==json.dumps(m,sort_keys=True,separators=(',',':'),ensure_ascii=False)+'\n'
for section in ['compile', 'readback']:
 row=m[section]
 for kind in ['stdout','stderr']:
  if kind+'Path' in row:assert h(row[kind+'Path'])==row[kind+'Sha256']
for row in [m['compiler']['version'],m['sdk']['selection']]:
 for kind in ['stdout','stderr']:assert h(row[kind+'Path'])==row[kind+'Sha256']
for row in [m['source'],m['output'],m['compiler']['launcher'],m['compiler']['swiftc'],m['compiler']['frontend']]:assert h(row['path'])==row['sha256']
for key in ['source','output']:
 row=m[key];assert Path(row['path']).stat().st_size==row['bytes'] and stat.S_IMODE(Path(row['path']).stat().st_mode)==row['mode'] and not Path(row['path']).is_symlink()
assert Path(m['compiler']['swiftc']['path']).resolve()==Path(m['compiler']['frontend']['path']);assert h(m['sdk']['settingsPath'])==m['sdk']['settingsSha256'];assert str(Path(m['sdk']['path']).resolve())==m['sdk']['resolvedPath'];assert m['sdk']['version']=='27.0'
assert m['source']['commit']==d['identity']['commit'] and m['source']['productTree']==d['identity']['tree'] and not m['source']['dirty']
assert m['admission']=={'helperExecuted':False,'independentAuditRequired':True,'performanceQualified':False};assert m['compile']['exitCode']==0 and not m['compile']['timedOut'] and not m['compile']['cancelled'] and m['compile']['originalGroupEmpty']
code="import {readFileSync} from 'node:fs';import {readStartupMachO} from "+json.dumps(Path(m['readback']['readerPath']).as_uri())+";console.log(JSON.stringify(readStartupMachO(readFileSync("+json.dumps(m['output']['path'])+"))));"
assert h(m['readback']['readerPath'])==m['readback']['readerSha256'];image=json.loads(subprocess.check_output(['node','--input-type=module','-e',code],text=True));assert image==d['helperMachOReadback'];assert image=={'architecture':m['output']['architecture'],'imageUuid':m['output']['uuid'],'minimumOS':m['output']['minimumOS'],'sdkVersion':m['output']['sdkVersion']}
assert image['architecture']=='arm64' and image['minimumOS']==image['sdkVersion']=='27.0.0'
children=d['children'];assert len(children)==10 and all(x['exitCode']==0 and not x['timedOutOrGuardStop'] and x['originalGroupEmpty'] for x in children)
assert children[7]['argv']==m['compiler']['argv'] and children[7]['deadlineSeconds']==120 and children[-1]['deadlineSeconds']==10 and children[-1]['argv']==[d['helperExecutable'],'trusted']
assert d['trustedPreflight']==json.loads((O/'helper-trusted.stdout').read_text()) and d['trustedPreflight']['accessibility'] and d['trustedPreflight']['screenRecording']
t=json.loads(Path(c['outerTerminal']['path']).read_text());assert t['exitCode']==0 and t['originalGroupEmpty'] and t['slotAbsent'];assert not Path('/Users/rcourson/aux-chromium-stable/.aux-native-slot').exists()
rows=subprocess.check_output(['/bin/ps','-axo','pid=,pgid=,command='],text=True).splitlines();assert not [r for r in rows if len(r.split())>2 and (int(r.split()[0]) in c['originalPids'] or int(r.split()[1]) in c['originalGroups'])]
v=m['compiler']['version'];a={'producer':'aux-native-window-helper-independent-audit','version':1,'manifestPath':str(mPath),'manifestSha256':h(mPath),'sourceSha256':h(m['source']['path']),'executableSha256':h(m['output']['path']),'launcherSha256':h(m['compiler']['launcher']['path']),'swiftcSha256':h(m['compiler']['swiftc']['path']),'frontendSha256':h(m['compiler']['frontend']['path']),'sdkSettingsSha256':h(m['sdk']['settingsPath']),'compilerVersionStdoutSha256':h(v['stdoutPath']),'compilerVersionStderrSha256':h(v['stderrPath']),'compileStdoutSha256':h(m['compile']['stdoutPath']),'compileStderrSha256':h(m['compile']['stderrPath']),'readbackStdoutSha256':h(m['readback']['stdoutPath']),'readerSha256':h(m['readback']['readerPath']),'compilerArgvSha256':hashlib.sha256(json.dumps(m['compiler']['argv'],separators=(',',':')).encode()).hexdigest(),'sourceCommit':m['source']['commit'],'productTree':m['source']['productTree'],'outputUuid':image['imageUuid'],'outputMinimumOS':image['minimumOS'],'outputSdkVersion':image['sdkVersion'],'sourceMode':m['source']['mode'],'outputMode':m['output']['mode']}
schema=json.loads(Path('/tmp/aux-builder-native-window-helper-artifact-proposal/helper-compile-sidecar-schema-fixed-PROPOSAL.json').read_text());assert sorted(a)==sorted(schema['independentAuditContract']['requiredKeys'])
ap=Path('/tmp/aux-root-native332-helper-independent-audit-001.json');ap.write_text(json.dumps(a,sort_keys=True,separators=(',',':'))+'\n')
audit={'result':'PASS','pairProof':str(pair),'pairProofSHA256':h(pair),'actualRuntimeFilesChecked':92,'rawArtifactsChecked':len(c['artifactPins']),'naturalChildren':10,'actualOriginalPIDsAndGroupsAbsent':True,'originalSDK27MachO':image,'independentCompilerAudit':str(ap),'independentCompilerAuditSHA256':h(ap),'scope':'Matching runtime/helper pair and original nonprompting trusted preflight only. App and assertions not yet admitted.'}
Path('/tmp/aux-root-native332-runtime-helper-terminal-review-001.json').write_text(json.dumps(audit,indent=2)+'\n');print(json.dumps(audit))
