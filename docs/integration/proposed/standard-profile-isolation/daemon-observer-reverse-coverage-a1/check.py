#!/usr/bin/env python3
"""Exact source replay and an inert event/publication boundary model only."""
from pathlib import Path
import hashlib,json
R=Path(__file__).resolve().parent
m=json.loads((R/'overlay.json').read_text()); edits=json.loads((R/'replacements.json').read_text())
h=lambda b:hashlib.sha256(b).hexdigest()
base=(R/'baseline/AuxTaskDescendantObserver.cc').read_bytes(); result=base.decode()
assert h(base)==m['source']['beforeSha256'] and len(edits)==1
for c in edits:
 assert c['count']==1 and result.count(c['old'])==1
 result=result.replace(c['old'],c['new'])
assert result.encode()==(R/m['source']['path']).read_bytes()
assert h(result.encode())==m['source']['afterSha256']
assert h((R/'source.patch').read_bytes())==m['patchSha256']
assert h((R/'compile-review.json').read_bytes())==m['compileReviewSha256']
# The real observer obtains birth PID/version/time from ES; these are inert
# records testing matching only, not substitute ES, signing or process proof.
def cohort(pid=-1,start=10,end=0,pending=True,failed=False,reaped=False):
 return dict(pid=pid,start=start,end=end,pending=pending,failed=failed,reaped=reaped)
def root_accepted(cs,b):
 return any(c['start']<=b[2] and (c['pending'] or (not c['failed'] and c['pid']==b[0] and b[2]<=c['end'])) for c in cs)
def edges(c,b):
 return not c['failed'] and not c['pending'] and c['pid']==b[0] and c['start']<=b[2]<=c['end']
def forward(cs,bs):
 return all(c['failed'] or sum(edges(c,b) for b in bs)==1 for c in cs)
def reverse(cs,bs):
 return all(sum(edges(c,b) for c in cs)==1 for b in bs)
def fenced(cs,bs,live=()):
 return not live and all(not c['pending'] and (c['failed'] or c['reaped']) for c in cs) and forward(cs,bs) and reverse(cs,bs)
# Actual defect: pending reservation admits an unrelated birth that exits before
# publication; forward matching sees the real child and used to miss the extra.
c=cohort(); births=[(201,1,12),(202,1,13)]
assert all(root_accepted([c],b) for b in births)
c.update(pid=201,end=15,pending=False,reaped=True)
assert forward([c],births) and not fenced([c],births)
# Legitimate early exit before publication retains its birth tombstone and can
# match once real publication + original reap + physical empty-stream fence exist.
assert fenced([c],[births[0]])
assert not fenced([c],[births[0]],live=[(201,1)])
failed=cohort(pending=False,failed=True)
assert fenced([failed],[]) and not fenced([failed],[(202,1,12)])
# An ambiguous birth shared by two reservations is not a bijection.
duplicate=cohort(pid=201,end=15,pending=False,reaped=True)
assert forward([c,duplicate],[births[0]]) and not fenced([c,duplicate],[births[0]])
# PID reuse produces distinct audit identities; two in one time range refuse.
assert not fenced([c],[(201,1,12),(201,2,14)])
assert not fenced([cohort()],[(201,1,12)])
review=json.loads((R/'compile-review.json').read_text());a=review['baselineRow']['command'];b=review['successorRow']['command']
assert len(a)==len(b) and sum(x!=y for x,y in zip(a,b))==3
print(json.dumps({'exactSourceReplay':True,'inertBoundaryCases':8,'unmatchedExitedBirthRefused':True,'oneToOneMatchedBirthAcceptedByModel':True,'nativeExecuted':False,'compiled':False}))
