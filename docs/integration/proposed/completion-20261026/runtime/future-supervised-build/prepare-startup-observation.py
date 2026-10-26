#!/usr/bin/env python3
"""Compose the confirmed startup repair with future ES selection, source only."""
from pathlib import Path
import ast,difflib,hashlib,json
HERE=Path(__file__).resolve().parent
ROOT=Path('/Users/rcourson/Documents/Vibe/web')
PROPOSAL=ROOT/'docs/integration/proposed/completion-20261026/desktop/startup-authority-observation'
CONFIRMED=ROOT/'docs/integration/proposed/completion-20261026/integration/ordinary-chat/startup-observation-confirmed.json'
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
plan=json.loads((PROPOSAL/'source-plan.json').read_text())
# Read only the literal replacement table; do not run the other lane's producer.
syntax=ast.parse((PROPOSAL/'prepare.py').read_text());changes=None
for node in syntax.body:
 if isinstance(node,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='CHANGES' for t in node.targets):changes=ast.literal_eval(node.value)
assert changes is not None
old='#if !defined(AUX_BROWSER_ONLY_NATIVE_STARTUP)'
future=old+' || (defined(AUX_FIXED_LINKED_PTY_POLICY) && AUX_FIXED_LINKED_PTY_POLICY)'
rows=[];patch=[];pins={str(PROPOSAL/'source-plan.json'):sha(PROPOSAL/'source-plan.json'),str(PROPOSAL/'prepare.py'):sha(PROPOSAL/'prepare.py'),str(CONFIRMED):sha(CONFIRMED),str(HERE/'browser-source-plan.json'):sha(HERE/'browser-source-plan.json')}
for item in plan['files']:
 name=item['path'];baseline=PROPOSAL/'baseline'/name;corrected=PROPOSAL/'source'/name
 assert sha(baseline)==item['beforeSha256'] and sha(corrected)==item['afterSha256']
 before=baseline.read_text();replayed=before;anchors=[]
 for a,b in changes[name]:
  assert replayed.count(a)==1;replayed=replayed.replace(a,b);anchors.append({'before':a,'after':b,'count':1})
 assert replayed==corrected.read_text()
 if name.endswith('/AuxSelectedStateHome.cc'):
  previous=HERE/'browser-source'/name;previous_text=previous.read_text()
  assert before.count(old)==1 and before.replace(old,future)==previous_text
  first=previous_text
  for a,b in changes[name]:assert first.count(a)==1;first=first.replace(a,b)
  assert replayed.count(old)==1;second=replayed.replace(old,future)
  assert first==second # correction and future selection commute exactly
  result=first;pins[str(previous)]=sha(previous);preimage=str(previous)
 else:result=replayed;preimage=str(baseline)
 target=HERE/'startup-observation-source'/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_text(result)
 pins[str(baseline)]=sha(baseline);pins[str(corrected)]=sha(corrected)
 rows.append({'path':name,'preimage':preimage,'preimageSha256':sha(preimage),'correctionSource':str(corrected),'correctionSourceSha256':sha(corrected),'output':str(target),'outputSha256':sha(target),'startupAnchors':anchors,'futureBranchPreserved':name.endswith('/AuxSelectedStateHome.cc'),'twoOrderReplayEqual':name.endswith('/AuxSelectedStateHome.cc')})
 patch.append(''.join(difflib.unified_diff(Path(preimage).read_text().splitlines(True),result.splitlines(True),fromfile=preimage,tofile=str(target))))
for path,expected in pins.items():assert sha(path)==expected
receipt={'format':'aux.future-startup-observation-composition.v1','sourceProposalCommit':'07a2974cb2ffd55a346d9e1ce3c49d4481c35d06','triggerConfirmationCommit':'05953cf383c90eb5db4ba4d39be03691cf3736df','inputHashes':pins,'files':rows,'startupAnchorCount':sum(len(row['startupAnchors']) for row in rows),'futureBranchAnchorCount':1,'commutativeCompositionPassed':True,'previousFutureSourceUnchanged':True,'sharedNativeChanged':False,'compiled':False,'linked':False,'signed':False,'executed':False,'activationAllowed':False,'nextGate':'Wait for root actual local acceptance, then compile only affected future ColdLaunch and SelectedStateHome producers and relink affected framework using this exact source selection.'}
(HERE/'startup-observation-plan.json').write_text(json.dumps(receipt,indent=2)+'\n');(HERE/'startup-observation.patch').write_text(''.join(patch))
print(json.dumps({'files':len(rows),'startupAnchors':receipt['startupAnchorCount'],'futureBranchPreserved':True,'bothCompositionOrdersEqual':True,'compiled':False}))
