from pathlib import Path
import hashlib,json,subprocess,stat
h=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
b=Path('/private/tmp/aux-builder-native333-preparation-001');c=b/'NATIVE333-STAGE-TERMINAL-CLOSURE-001.json';assert h(c)=='d7ca6ebb4a901e6e4908db06f1669e40a145b7df654fe5cfd2f72530c33d088c';j=json.loads(c.read_text())
for p,row in j['rawArtifacts'].items():assert h(p)==row['sha256'] and Path(p).stat().st_size==row['bytes'],p
assert len(j['rawArtifacts'])==27
for k in ['stageProof','outerTerminal','processSnapshot','originalFailureRetained']:assert h(j[k]['path'])==j[k]['sha256']
t=json.loads(Path(j['outerTerminal']['path']).read_text());assert t['exitCode']==0 and t['originalGroupEmpty'] and t['slotAbsent']
a=json.loads(Path(j['stageProof']['path']).read_text());r=Path('/private/tmp/aux-browser-runtime-builder-native333-source-001');s=Path('/Users/rcourson/aux-chromium-stable/chromium/src')
assert a['candidate']=='7fc074917a610981e17791d656430cb2130a99d4' and a['identity']['tree']=='557efd5dc6afba744e5f594a8871e7ece50f80f9' and not a['identity']['dirty']
for p,v in a['native'].items():assert h(s/p)==v,p
for p,v in a['packets'].items():assert h(r/p)==v,p
assert len(a['native'])==733 and len(a['packets'])==333
for row in a['shellFiles']:assert h(s/'chrome/browser/resources/aux/assets'/row['path'])==row['sha256'],row['path']
assert len(a['shellFiles'])==174
for row in j['actualPhysicalGeneratedSeals']:
 p=Path(row['path']);z=p.stat();actual={'device':z.st_dev,'inode':z.st_ino,'uid':z.st_uid,'mode':stat.S_IMODE(z.st_mode),'bytes':z.st_size,'mtimeNs':z.st_mtime_ns,'sha256':h(p)}
 assert actual==row['actual'] and actual['mode']==0o444 and actual['sha256']==a['generated'][str(p)],p
 assert actual==next(x['observed'] for x in a['generatedReadonlySeal']['rows'] if x['path']==str(p))
assert len(j['actualChildren'])==3
for row in j['actualChildren']:
 assert row['exitCode']==0 and row['originalGroupEmpty']
 assert h(row['stdout'])==row['stdoutSha256'] and h(row['stderr'])==row['stderrSha256']
ps=subprocess.check_output(['/bin/ps','-axo','pid=,ppid=,pgid=,command='],text=True)
remaining=[line for line in ps.splitlines() if len(line.split())>=3 and (int(line.split()[0]) in j['originalPids'] or int(line.split()[2]) in j['originalGroups'])];assert not remaining,remaining
assert len(j['originalPids'])==10 and len(j['originalGroups'])==4 and not Path('/Users/rcourson/aux-chromium-stable/.aux-native-slot').exists()
p=Path(j['stageProof']['path']).parent;events=[json.loads(x) for x in (p/'watch/events.jsonl').read_text().splitlines()];assert any(x['kind']=='armed' for x in events);last=events[-1];assert last['kind']=='watch_finished' and last['armed'] and last['incident'] is None and not last['ownedSisoSignaled'];assert (p/'watch-done').exists() and not (p/'watch-stop').exists()
assert not a['compiled'] and not a['appLaunched'] and a['mixedPairNotLaunchable']
L=b/'gn-native333-7fc07491-after-stage-launch-001.json';assert h(L)=='6b5cd5702f87967e9e3697d5b57c2ce8a0695dc1d866e8ae0e2891cc8da28d5f';d=json.loads(L.read_text())
for p,v in d['pins'].items():assert h(p)==v,p
assert d['argv'][-1]==j['stageProof']['sha256'];assert h(b/'run-native333-original-gn-launch-001.py')=='3df65ff4d8490afa5185501b15812e0fc888a06baf71daee93bf7d05bb4c3951'
proof={'status':'ACTUAL_STAGE_TERMINAL_AND_GN_ADMISSION_PASS','rawArtifacts':27,'actualNative':733,'actualPackets':333,'actualAssets':174,'actualChildren':3,'freshAbsentPids':10,'freshAbsentGroups':4,'actualPhysical0444Seals':3,'watcherNaturalFinishedNoIncident':True,'launcher':h(L),'outer':h(b/'run-native333-original-gn-launch-001.py'),'scope':'genuine GN only; no compile or App admission','stageProof':j['stageProof'],'closureSha256':h(c)}
Path('/tmp/aux-root-native333-stage-terminal-review-001.json').write_text(json.dumps(proof,indent=2)+'\n');print(json.dumps(proof))
