#!/usr/bin/env python3
"""Compose reviewed source proposals only; never edit an active native input."""
import argparse,difflib,hashlib,json
from pathlib import Path
here=Path(__file__).resolve().parent
scope=here.parent
repo=scope.parents[3]
p=argparse.ArgumentParser();p.add_argument('--output',required=True);a=p.parse_args()
out=Path(a.output);out.mkdir(parents=True,exist_ok=False)
inputs=[];changes=[];values={}
def read(path):
 path=Path(path);data=path.read_bytes();inputs.append({'path':str(path),'sha256':hashlib.sha256(data).hexdigest()});return data.decode()
def edits(name,rows,label):
 for row in rows:
  assert values[name].count(row['find'])==row['count'],(label,name,row['find'][:80],values[name].count(row['find']))
  values[name]=values[name].replace(row['find'],row['replace'],row['count']);changes.append({'source':label,'name':name,'count':row['count']})
def jsonread(path):return json.loads(read(path))
# Publisher baseline is frozen in its own exact inventory; use its reviewed output.
publisher=scope/'runtime-publication'
for n in ['AuxDevelopmentWorkerHost.cc','AuxRuntimePublication.inc','AuxRuntimePublicationBridge.h','AuxRuntimePublicationNapi.inc','runtime-bootstrap.cjs','runtime-seed.cjs']:
 values[n]=read(publisher/'source'/n)
coord=scope/'runtime-coordination';spec=jsonread(coord/'overlay.json')
for row in spec['nativeFiles']:
 assert hashlib.sha256(values[row['path']].encode()).hexdigest()==row['beforeSha256']
 edits(row['path'],row['changes'],'runtime-coordination')
 assert hashlib.sha256(values[row['path']].encode()).hexdigest()==row['afterSha256']
values['AuxRuntimeCoordination.inc']=read(coord/'source/AuxRuntimeCoordination.inc')
settlement=scope/'daemon-settlement';spec=jsonread(settlement/'overlay.json')
for row in jsonread(settlement/'inputs.json')['sources']:
 if row['name'] not in values:values[row['name']]=read(row['path'])
for name in {x['path'] for x in spec['changes']}:
 edits(name,[x for x in spec['changes'] if x['path']==name],'daemon-settlement')
values['AuxStandardCleanSettlement.inc']=read(settlement/'source/AuxStandardCleanSettlement.inc')
# Reopen and publication edit disjoint parts of the same selected Dispatcher.
recovery=scope/'restart-recovery'
for row in jsonread(recovery/'inputs.json')['sources']:
 values[row['name']]=read(recovery/'source'/row['name'])
base=read(publisher/'baseline/AuxOwnedCommandDispatcher.swift')
updated=read(publisher/'source/AuxOwnedCommandDispatcher.swift')
old=base.splitlines(True);new=updated.splitlines(True)
for tag,i,j,x,y in difflib.SequenceMatcher(None,old,new,autojunk=False).get_opcodes():
 if tag=='equal':continue
 # Whole lines of context anchor insertions and verify a single actual receiver.
 lo=max(0,i-2);hi=min(len(old),j+2)
 before=''.join(old[lo:hi]);after=''.join(old[lo:i]+new[x:y]+old[j:hi])
 edits('AuxOwnedCommandDispatcher.swift',[{'find':before,'replace':after,'count':1}],'runtime-publication-dispatcher')
# Couple the descendant observer with the already composed native receiver.
desc=scope/'descendant-custody'
manifest_desc=jsonread(desc/'manifest.json')
values['AuxNativeDaemonMain.cc']=read(desc/'baseline/AuxNativeDaemonMain.cc')
for row in jsonread(desc/'replacements.json'):
 change={'find':row['old'],'replace':row['new'],'count':row['count']}
 if row['path']=='AuxDevelopmentWorkerHost.cc' and row['old']=='  auto result = AuxDevelopmentWorkerDrain::drained;\n  if (state_->prepared_fresh_provider)':
  # Both independent lanes insert immediately before factory closure. Preserve
  # root's clean observation block and the observer's real stream observation.
  suffix='\n  if (state_->prepared_fresh_provider)'
  assert row['new'].endswith(suffix)
  change={'find':'  auto result = AuxDevelopmentWorkerDrain::drained;', 'replace':row['new'][:-len(suffix)],'count':1}
 edits(row['path'],[change],'descendant-custody')
for n in ['AuxTaskDescendantObserver.cc','AuxTaskDescendantObserver.h']:
 values[n]=read(desc/'source'/n)
# New actual cohort counts and live observer status are explicit clean-query
# prerequisites, in addition to the actual retained runtime scope counters.
edits('AuxStandardCleanSettlement.inc',[
 {'find':'    int32_t result = hosts.empty() ? 2 : 0;', 'replace':'    int32_t result = hosts.empty() ? 2 : 0;\n    const auto stream = aux::descendants::InspectStream();\n    if (stream == aux::descendants::Result::unknown ||\n        stream == aux::descendants::Result::refused) result = 2;\n    else if (stream != aux::descendants::Result::settled && result == 0) result = 1;', 'count':1},
 {'find':'worker->pty_pending || worker->pty_direct ||', 'replace':'worker->pty_pending || worker->pty_direct || worker->pty_descendant_pending ||', 'count':1},
 {'find':'worker->exec_pending || worker->exec_direct ||', 'replace':'worker->exec_pending || worker->exec_direct || worker->exec_descendant_pending ||', 'count':1}
],'observer-clean-query-coupling')
for n,text in values.items():(out/n).write_text(text)
manifest={'format':'aux.standard-isolation.source-composition.v1','inputs':inputs,'changes':changes,'outputs':[{'path':str(out/n),'sha256':hashlib.sha256(t.encode()).hexdigest()} for n,t in sorted(values.items())],'compiled':False,'activated':False,'productExecuted':False,'runtimeAuthorityGranted':False,'descendantSuccessorPending':False}
(out/'composition.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps({'output':str(out),'files':len(values),'countedEdits':len(changes),'compiled':False}))
