from pathlib import Path
import json,hashlib,subprocess,stat
h=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest();b=Path('/private/tmp/aux-builder-native334-preparation-001');c=b/'NATIVE334-GN-TERMINAL-CLOSURE-001.json';assert h(c)=='a42b9e7d04337b9404e63e7a2362d621ce8e6ea8a85e18e0a89e05c29adeb540';j=json.loads(c.read_text())
for p,row in j['rawArtifacts'].items():assert h(p)==row['sha256'] and Path(p).stat().st_size==row['bytes'],p
assert len(j['rawArtifacts'])==34
for k in ['GNProof','outerTerminal','processSnapshot']:assert h(j[k]['path'])==j[k]['sha256']
t=json.loads(Path(j['outerTerminal']['path']).read_text());assert t['exitCode']==0 and t['originalGroupEmpty'] and t['slotAbsent']
a=json.loads(Path(j['GNProof']['path']).read_text());d=json.loads((b/'gn-native334-80e02b34-real-revision-input-001.json').read_text());assert a['stageProofSha256']=='5afd39ec1811e2ea3983b7b2fa59d3fd51c8728e969918fbed032efb44748845' and a['inputSha256']==h(b/'gn-native334-80e02b34-real-revision-input-001.json')
expected=json.loads(Path(d['originalVersionAction']['path']).read_text())['//base/version_info:generate_version_info_action'];actual=a['actualRealVersionAction'];assert actual['type']=='action'
for k in ['args','inputs','script','outputs','sources']:assert actual[k]==expected[k],k
p=Path(j['GNProof']['path']).parent
for flag,value in d['effectiveFlags'].items():assert (p/('effective-'+flag+'.stdout')).read_text().strip()==flag+' = '+value
assert len(a['children'])==10 and a['children']==j['actualChildren']
for row in a['children']:
 assert row['exitCode']==0 and row['actualOriginalGroupEmpty'] and not row.get('deadlineOrCancellationOrWatchFailure');assert h(row['stdout'])==row['stdoutSha256'] and h(row['stderr'])==row['stderrSha256']
ps=subprocess.check_output(['/bin/ps','-axo','pid=,ppid=,pgid=,command='],text=True);remaining=[line for line in ps.splitlines() if len(line.split())>=3 and (int(line.split()[0]) in j['originalPids'] or int(line.split()[2]) in j['originalGroups'])];assert not remaining,remaining
assert len(j['originalPids'])==183 and len(j['originalGroups'])==11 and not Path('/Users/rcourson/aux-chromium-stable/.aux-native-slot').exists()
for row in j['actualPhysicalGeneratedSeals']:
 path=Path(row['path']);z=path.stat();actual={'device':z.st_dev,'inode':z.st_ino,'uid':z.st_uid,'mode':stat.S_IMODE(z.st_mode),'bytes':z.st_size,'mtimeNs':z.st_mtime_ns,'sha256':h(path)};assert actual==row['actual'] and actual['mode']==0o444
 assert actual==next(x['observed'] for x in a['generatedReadonlySeal']['rows'] if x['path']==str(path))
assert a['watcherExitCode']==0 and a['primaryFailure'] is None and a['afterGuard']=='PASS' and a['realVersionActionPassed'] and a['generatedModesRemainReadonly'] and not a['compiled'] and not a['appLaunched']
events=[json.loads(x) for x in (p/'watch/events.jsonl').read_text().splitlines()];last=events[-1];assert last['kind']=='watch_finished' and last['armed'] and last['incident'] is None and not last['ownedSisoSignaled'];assert (p/'watch-done').exists() and not (p/'watch-stop').exists()
s=Path('/Users/rcourson/aux-chromium-stable/chromium/src');assert h(s/'out/AuxDev/args.gn')==a['authenticArgsSha256'] and h(s/'out/AuxDev/toolchain.ninja')==a['generatedToolchainSha256']
proof={'status':'ACTUAL_GN_TERMINAL_PASS','rawArtifacts':34,'naturalChildren':10,'freshAbsentPids':183,'freshAbsentGroups':11,'physical0444Seals':3,'originalVersionActionAndEightActualFlags':True,'watcherNaturalFinishedNoIncident':True,'GNProof':j['GNProof'],'full18AdmissionPending':True};Path('/tmp/aux-root-native334-gn-terminal-review-001.json').write_text(json.dumps(proof,indent=2)+'\n');print(proof)
