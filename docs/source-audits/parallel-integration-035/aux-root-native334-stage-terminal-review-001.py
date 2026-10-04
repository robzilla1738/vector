from pathlib import Path
import hashlib,json,subprocess,stat
h=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
b=Path('/private/tmp/aux-builder-native334-preparation-001');c=b/'NATIVE334-STAGE-TERMINAL-CLOSURE-001.json';assert h(c)=='05974b0b60718a6882b5364df1bdf81abb7fc8481fe6a0ce4ae2e06672ca0743';j=json.loads(c.read_text())
for row in j['rawArtifacts']:
 p=Path(row['path']);assert h(p)==row['sha256'] and p.stat().st_size==row['bytes'],p
assert len(j['rawArtifacts'])==27
for k in ['stageProof','outerTerminal','processSnapshot','originalFailureRetained']:assert h(j[k]['path'])==j[k]['sha256']
t=json.loads(Path(j['outerTerminal']['path']).read_text());assert t['exitCode']==0 and t['originalGroupEmpty'] and t['slotAbsent']
a=json.loads(Path(j['stageProof']['path']).read_text());r=Path('/private/tmp/aux-browser-runtime-builder-native334-source-001');s=Path('/Users/rcourson/aux-chromium-stable/chromium/src')
assert a['candidate']=='80e02b34ac32137e52dad24287523cd93c6bf321' and a['identity']['tree']=='378cd08ce0c51bb4989e9ba6f001f31c639a5c19' and not a['identity']['dirty']
for p,v in a['native'].items():assert h(s/p)==v,p
for p,v in a['packets'].items():assert h(r/p)==v,p
assert len(a['native'])==733 and len(a['packets'])==334
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
assert len(j['originalPids'])==9 and len(j['originalGroups'])==4 and not Path('/Users/rcourson/aux-chromium-stable/.aux-native-slot').exists()
p=Path(j['stageProof']['path']).parent;events=[json.loads(x) for x in (p/'watch/events.jsonl').read_text().splitlines()];assert any(x['kind']=='armed' for x in events);last=events[-1];assert last['kind']=='watch_finished' and last['armed'] and last['incident'] is None and not last['ownedSisoSignaled'];assert (p/'watch-done').exists() and not (p/'watch-stop').exists()
assert not a['compiled'] and not a['appLaunched'] and a['mixedPairNotLaunchable']

proof={'status':'ACTUAL334_STAGE_TERMINAL_REVIEW_PASS','rawArtifacts':27,'native':733,'packets':334,'assets':174,'actualOriginalChildren':3,'freshAbsentPids':9,'freshAbsentGroups':4,'actualPhysical0444Seals':3,'naturalWatcherNoIncident':True,'stageProof':j['stageProof'],'closureSha256':h(c),'GNAdmission':False};Path('/tmp/aux-root-native334-stage-terminal-review-001.json').write_text(json.dumps(proof,indent=2)+'\n');print(proof)
