from pathlib import Path
import json,hashlib,subprocess,stat,ast
h=lambda p:hashlib.file_digest(Path(p).open('rb'),'sha256').hexdigest();b=Path('/private/tmp/aux-builder-native334-preparation-001');c=b/'NATIVE334-SUCCESSFUL-FULL18-TERMINAL-CLOSURE-001.json';assert h(c)=='da58036ca8ee3bbd3f758623e9d83c4922d8bf475d7ca5df89b527708d70d598';j=json.loads(c.read_text())
for p,v in j['rawArtifacts'].items():assert isinstance(v,dict) and h(p)==v['sha256'] and Path(p).stat().st_size==v['bytes'],p
assert len(j['rawArtifacts'])==15
assert h(j['terminalProof'])==j['terminalProofSha256'] and h(j['outerTerminal'])==j['outerTerminalSha256'];t=json.loads(Path(j['terminalProof']).read_text());o=json.loads(Path(j['outerTerminal']).read_text());assert t['graphExitCode']==0 and t['watcherExitCode']==0 and o['exitCode']==0 and o['originalGroupEmpty'] and o['slotAbsent'];assert t['outputs']==j['actualOutputHashes'] and len(t['outputs'])==18
for p,v in t['outputs'].items():assert h(p)==v,p
for row in j['generatedRestoredPhysicalRows']:
 p=Path(row['path']);z=p.stat();actual={'path':str(p),'device':z.st_dev,'inode':z.st_ino,'uid':z.st_uid,'mode':stat.S_IMODE(z.st_mode),'bytes':z.st_size,'mtimeNs':z.st_mtime_ns,'sha256':h(p)};assert actual==row and actual['mode']==0o644
 seal=next(x for x in t['originalGeneratedModesRestored']['rows'] if x['path']==str(p));assert {k:v for k,v in actual.items() if k!='path'}==seal['restoration']['after'] and seal['restoration']['namedOriginalAtRestoration'] and seal['restoration']['contentStillExpected']
ps=subprocess.check_output(['/bin/ps','-axo','pid=,ppid=,pgid=,command='],text=True);remaining=[line for line in ps.splitlines() if len(line.split())>=3 and (int(line.split()[0]) in j['originalPids'] or int(line.split()[2]) in j['originalGroups'])];assert not remaining,remaining;assert len(j['originalPids'])==10 and len(j['originalGroups'])==2 and not Path('/Users/rcourson/aux-chromium-stable/.aux-native-slot').exists()
p=Path(j['terminalProof']).parent;state=json.loads((p/'state.json').read_text());assert state['actualVersionHeaderRealRevision'] and state['terminalGnAndMetadataGuard']=='PASS' and state['terminalNativeAndGeneratedGuard']=='PASS' and state['ownedCompilerChildrenAbsent'];assert t['nativeAndGeneratedGuard']=='PASS' and not t['assertionsExecuted'] and not t['payloadStaged'] and t['mixedPairNotLaunchable']

proof={'status':'FULL18_334_NATURAL_TERMINAL_PASS','actualRaw':15,'actualOutputHashes':18,'freshAbsentPids':10,'freshAbsentGroups':2,'physical0644Restored':3,'AppAdmitted':False};Path('/tmp/aux-root-native334-full18-terminal-review-001.json').write_text(json.dumps(proof,indent=2)+'\n');print(proof)
