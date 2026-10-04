import json,hashlib,subprocess,pathlib,collections,re
p=pathlib.Path('/private/tmp/aux-builder-native333-preparation-001/NATIVE333-ASSERTIONS-TERMINAL-CLOSURE-001.json');j=json.loads(p.read_text());assert hashlib.sha256(p.read_bytes()).hexdigest()=='520b5be7097acec9a7e96f8d8e5bdc1d1c2018f433e47e460ced145acb3c9493';sha=lambda p:hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
for path,pin in j['artifactPins'].items():
 assert sha(path)==pin['sha256'] and pathlib.Path(path).stat().st_size==pin['bytes'],path
for k in ['terminal','outerTerminal']:assert sha(j[k]['path'])==j[k]['sha256']
assert j['requiredCases']==524 and j['originalBatches']==17 and not j['safetyPassed'] and j['cleanupCompletedBeforeParentSlotRelease']
base=pathlib.Path(j['terminal']['path']).parent;counts=collections.Counter();casecount=0;failed=[];selected={}
for d in sorted((base/'native').iterdir()):
 v=json.loads((d/'assertion-validation.json').read_text());c=json.loads((d/'controller-result.json').read_text())
 expected=c['command'][next(i for i,a in enumerate(c['command']) if a.startswith('--gtest_filter='))].split('=',1)[1].split(':')
 assert len(set(expected))==len(expected) and set(expected)==set(v['expectedCases'])
 if (d/'launcher-summary.json').exists():
  s=json.loads((d/'launcher-summary.json').read_text());actual=s['per_iteration_data'];assert len(actual)==1
  cases=actual[0];assert set(cases)==set(expected) and set(v['actualCases'])==set(expected)
  for name,items in cases.items():
   assert len(items)==1 and name not in selected;selected[name]=items[0]['status'];assert v['statuses'][name]==[items[0]['status']];counts[items[0]['status']]+=1;casecount+=1
 else:
  raw=(d/'stdout.log').read_text();runs=re.findall(r'^\[ RUN      \] (\S+)$',raw,re.M);ok=re.findall(r'^\[       OK \] (\S+) \(',raw,re.M)
  assert len(runs)==len(expected) and set(runs)==set(expected) and len(ok)==len(expected) and set(ok)==set(expected)
  counts['SUCCESS']+=len(ok);casecount+=len(ok)
  for name in ok:assert name not in selected;selected[name]='SUCCESS';assert v['statuses'][name]==['SUCCESS']
 if c['exitCode']!=0:failed.append(d.name)
 assert not c['remainingOwnedProcesses']
ps=subprocess.check_output(['ps','-axo','pid=,pgid=,command='],text=True);rows=[]
for line in ps.splitlines():
 fields=line.strip().split(None,2)
 if fields and (int(fields[0]) in j['originalPids'] or int(fields[1]) in j['originalGroups']):rows.append(line)
assert not rows and casecount==524 and dict(counts)==j['actualStatusCounts'] and failed==['browser_tests','unit_tests']
assert selected==j['selectedCaseStatuses']
outer=json.loads(pathlib.Path(j['outerTerminal']['path']).read_text());assert outer['exitCode']==1 and outer['originalGroupEmpty'] and outer['slotAbsent'] and not outer['actualRows']
state=json.loads((base/'state.json').read_text());assert state['phase']=='completed' and state['watcherExitCode']==0 and state['cleanupCompletedBeforeParentSlotRelease'];assert not (base/'watch-stop').exists() and (base/'watch-done').exists()
# Slot location is pinned by original watch config; its owner file must be absent.
slot=pathlib.Path('/Users/rcourson/aux-chromium-stable/.aux-native-slot');print('slot candidate',str(slot),slot.exists())
assert not slot.exists()
out={'status':'NATURAL_TERMINAL_FAILURE_VERIFIED','closureSHA256':sha(p),'rawPinsVerified':len(j['artifactPins']),'eachOriginalSelectedCaseRawStatusAndWatchClosureExact':True,'selectedCaseCount':casecount,'actualStatusCounts':dict(counts),'failedTargets':failed,'originalPids':j['originalPids'],'originalGroups':j['originalGroups'],'actualRemainingRows':rows,'appExecuted':False,'qualification':False}
pathlib.Path('/tmp/aux-root-native333-assertions-terminal-review-001.json').write_text(json.dumps(out,indent=2)+'\n');print(out)
