from pathlib import Path
import json,hashlib,difflib,subprocess
b=Path('/private/tmp/aux-builder-native334-preparation-001');sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest();req=json.loads((b/'NATIVE334-STAGE-CONTROLLER-REQUEST-001.json').read_text());launch=json.loads((b/'stage-native334-80e02b34-launch-001.json').read_text())
for k,v in req.items():
 if isinstance(v,dict) and 'path' in v and 'sha256' in v:assert sha(v['path'])==v['sha256'],k
for p,h in launch['pins'].items():assert sha(p)==h,p
old=Path(req['originalController']['path']).read_text();new=Path(req['controller']['path']).read_text();actual=''.join(difflib.unified_diff(old.splitlines(True),new.splitlines(True),fromfile='original333-stage002.py',tofile='successor334-stage001.py'));assert actual==Path(req['delta']['path']).read_text()
receipt=json.loads(Path(req['currentCompiledReceipt']['path']).read_text());ledger=json.loads(Path(req['originalOwnerLedger']['path']).read_text());source=json.loads(Path(req['source']['path']).read_text());export=json.loads((b/'NATIVE334-OWN-SOURCE-EXPORT-001.json').read_text());assert source['native']==export['native'] and source['packets']==export['packets'];assert source['transitionBefore']==receipt['native']
for k in ['naturalGraphClosure','nativeAssertionClosure','currentPairProof','compiledMapProvenance']:assert sha(receipt[k]['path'])==receipt[k]['sha256']
assert receipt['requiredSafetyPassed'] is False and receipt['appLaunchable'] is False and receipt['actualGeneratedDrift']=={}
for f,h in receipt['native'].items():assert sha(Path('/Users/rcourson/aux-chromium-stable/chromium/src')/f)==h
for f,h in receipt['generated'].items():assert sha(f)==h
for f,h in receipt['runtimeFiles'].items():assert sha(Path(receipt['runtimeRoot'])/f)==h
assert sha(receipt['helperExecutable'])==receipt['helperExecutableSha256']
for f,h in ledger['retainedFailureClosures'].items():assert sha(f)==h
pids=set(ledger['actualOriginalPids']);groups=set(ledger['actualOriginalGroups']);ps=subprocess.check_output(['ps','-axo','pid=,pgid=,command='],text=True);rows=[]
for line in ps.splitlines():
 f=line.strip().split(None,2)
 if f and (int(f[0]) in pids or int(f[1]) in groups):rows.append(line)
assert not rows and not Path('/Users/rcourson/aux-chromium-stable/.aux-native-slot').exists()
proof={'status':'STAGE_ONLY_ADMISSION_PASS','launcherSHA256':sha(b/'stage-native334-80e02b34-launch-001.json'),'controllerSHA256':req['controller']['sha256'],'actual14Pins':len(launch['pins']),'exactInspectedOriginalControllerDiff':True,'currentNative733Generated3Runtime92HelperVerified':True,'original524FailureRetained':True,'actualOriginalRows':rows,'initialReadOnlyAuditCorrection':'empty generated drift is original map{} rather than[]; initial assertion refused before proof/mutation','scope':'stage only; no GN/build/App'};Path('/tmp/aux-root-native334-stage-admission-001.json').write_text(json.dumps(proof,indent=2)+'\n');print(proof)
