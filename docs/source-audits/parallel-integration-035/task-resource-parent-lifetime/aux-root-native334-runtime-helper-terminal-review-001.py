from pathlib import Path
import json,hashlib,subprocess,stat,mmap
h=lambda p:hashlib.file_digest(Path(p).open('rb'),'sha256').hexdigest()
b=Path('/private/tmp/aux-builder-native334-preparation-001');c=b/'NATIVE334-RUNTIME-HELPER-TERMINAL-CLOSURE-001.json';assert h(c)=='2faeadce412218ae3b536902bab5eb4c720a29ea0927fc3a49d93d162b3f1461';j=json.loads(c.read_text())
for p,v in j['artifactPins'].items():assert h(p)==v['sha256'] and Path(p).stat().st_size==v['bytes'],p
assert len(j['artifactPins'])==37 and j['naturalExitCode']==0
for row in j['children']:assert row['exitCode']==0 and not row['timedOutOrGuardStop'] and row['originalGroupEmpty']
assert len(j['children'])==10
for k in ['pairProof','outerTerminal','helperCompilerManifest']:assert h(j[k]['path'])==j[k]['sha256']
d=json.loads(Path(j['pairProof']['path']).read_text());o=json.loads(Path(j['outerTerminal']['path']).read_text());m=json.loads(Path(j['helperCompilerManifest']['path']).read_text());s=Path('/Users/rcourson/aux-chromium-stable/chromium/src');r=Path('/private/tmp/aux-browser-runtime-builder-native334-source-001')
assert o['exitCode']==0 and o['originalGroupEmpty'] and o['slotAbsent'];assert d['identity']['commit']=='80e02b34ac32137e52dad24287523cd93c6bf321' and not d['identity']['dirty']
prior=json.loads((r/'release/test-artifacts/builder-native334-80e02b34-native-build-001/compiled-stage-guard.json').read_text())
for k in ['native','generated','packetFiles','shellFiles','binaries','componentLibraries','paks','targets','argsSha256','versionHeaderSha256','originalMetadata']:assert d[k]==prior[k],k
# Unchanged compiled outputs already audited at the immediate full18 terminal/capture. Verify changed pair and actual original source gates, not an unchanged full cache re-scan.
for k,base in [('native',s),('packetFiles',r),('runtimeFiles',Path(d['runtimeRoot']))]:
 for p,v in d[k].items():assert h(base/p)==v,p
for k in ['generated','sourceGateFiles','originalMetadata']:
 for p,v in d[k].items():assert h(Path(p) if Path(p).is_absolute() else s/p)==v,p
assert len(d['runtimeFiles'])==92 and d['runtimeFiles']==j['actualRuntimeFiles'];ident=json.loads((Path(d['runtimeRoot'])/'aux-runtime-identity.json').read_text());assert ident==d['identity']
assert d['runtimeStaged'] and d['helperCompiled'] and not d['appLaunched'] and not d['assertionsExecuted'];assert h(d['helperExecutable'])==d['helperExecutableSha256']==j['helperExecutableSha256']==m['output']['sha256'];assert h(d['originalHelperExecutable'])==d['originalHelperUnchangedSha256']
for node in [m['source'],m['output']]:
 p=Path(node['path']);z=p.stat();assert h(p)==node['sha256'] and z.st_size==node['bytes'] and stat.S_IMODE(z.st_mode)==node['mode']
assert m['source']['commit']==d['identity']['commit'] and not m['source']['dirty'] and m['source']['sha256']==d['helperSourceSha256'];assert m['output']['architecture']=='arm64' and m['output']['minimumOS']=='27.0.0' and m['output']['sdkVersion']=='27.0.0'
for node in [m['compiler']['frontend'],m['compiler']['launcher'],m['compiler']['swiftc']]:assert h(node['path'])==node['sha256']
assert h(m['sdk']['settingsPath'])==m['sdk']['settingsSha256'] and str(Path(m['sdk']['path']).resolve())==m['sdk']['resolvedPath'];assert m['compile']['exitCode']==0 and m['compile']['originalGroupEmpty'] and not m['compile']['timedOut'] and not m['compile']['cancelled']
assert m['readback']['exitCode']==0 and h(m['readback']['readerPath'])==m['readback']['readerSha256'];readback=json.loads(Path(m['readback']['stdoutPath']).read_text());assert readback==d['helperMachOReadback'];assert not m['admission']['helperExecuted'] and not m['admission']['performanceQualified'];assert d['helperExecuted'] and d['helperExecutionScope']=='nonprompting-trusted-preflight-only' and d['trustedPreflight']==j['trustedPreflight'];assert j['trustedPreflight']['accessibility'] and j['trustedPreflight']['screenRecording']
ps=subprocess.check_output(['/bin/ps','-axo','pid=,ppid=,pgid=,command='],text=True);remaining=[line for line in ps.splitlines() if len(line.split())>=3 and (int(line.split()[0]) in j['originalPids'] or int(line.split()[2]) in j['originalGroups'])];assert not remaining,remaining;assert not Path('/Users/rcourson/aux-chromium-stable/.aux-native-slot').exists()
watch=[json.loads(x) for x in (Path(j['pairProof']['path']).parent/'watch/events.jsonl').read_text().splitlines()];assert watch[-1]['kind']=='watch_finished' and watch[-1]['armed'] and watch[-1]['incident'] is None
assert any(x.get('kind')=='armed' for x in watch) and not any(x.get('incident') for x in watch)
proof={'status':'NATIVE334_ACTUAL_PAIR_AND_COMPILER_PASS','closureSha256':h(c),'pairProofSha256':h(j['pairProof']['path']),'helperCompilerManifestSha256':h(j['helperCompilerManifest']['path']),'actualRawArtifacts':37,'originalChildrenNaturalZero':10,'freshPidAbsence':len(j['originalPids']),'freshGroupAbsence':len(j['originalGroups']),'runtimeFiles':92,'freshTarget27Helper':True,'historicalHelperUnchanged':True,'trustedOnly':True,'AppAdmitted':False,'safetyExecuted':False};Path('/tmp/aux-root-native334-runtime-helper-terminal-review-001.json').write_text(json.dumps(proof,indent=2)+'\n');print(proof)
