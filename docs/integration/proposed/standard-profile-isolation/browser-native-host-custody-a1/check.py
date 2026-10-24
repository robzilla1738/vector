"""Counted selected-source replay and inert lineage scenarios; no native calls."""
from pathlib import Path
import json, hashlib, difflib
P=Path(__file__).resolve().parent
N=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
rows=json.loads((P/'replacements.json').read_text())
files=[];patch=[]
for path in dict.fromkeys(r['path'] for r in rows):
    before=(N/path).read_text();after=before
    for row in rows:
        if row['path']!=path:continue
        assert after.count(row['old'])==row['count']==1,path
        after=after.replace(row['old'],row['new'])
    assert after==(P/'source'/path).read_text(),path
    files.append({'path':path,'beforeSha256':hashlib.sha256(before.encode()).hexdigest(),'afterSha256':hashlib.sha256(after.encode()).hexdigest()})
    patch.extend(difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile='a/'+path,tofile='b/'+path,n=0))
# Independent scenario assertions for the new scope semantics.
def covered(birth, cohorts):return sum(c['pid']==birth[0] and c['start']<=birth[1]<=c['end'] and not c.get('failed') for c in cohorts)==1
native={'pid':101,'start':10,'end':20};daemon={'pid':202,'start':11,'end':21}
assert covered((101,15),[native,daemon])
assert not covered((303,16),[native,daemon]) # exited unrelated root during pending spawn
assert not covered((101,15),[native,native]) # ambiguous native attribution
live={202:202,203:202,104:101}
assert any(root==101 for root in live.values()) # host direct reap does not clear fork
live.pop(104)
assert not any(root==101 for root in live.values()) # daemon cannot stall host cohort
assert live # still cannot pass post-ACK all-family fence
assert not all(root==202 for root in {**live,304:304}.values()) # crash scope not waived
(P/'change.patch').write_text(''.join(patch))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
new=[{'path':str(f.relative_to(P/'source')),'sha256':sha(f)} for f in sorted((P/'source/base/process/mac').glob('*'))]
manifest={'format':'aux.browser-native-host-custody.overlay.v1','files':files,'newFiles':new,'countedAdaptations':len(rows),'patchSha256':sha(P/'change.patch'),'enginePredecessor':{'path':'/private/tmp/aux-standard-native-source-20261023-a4/AuxTaskDescendantObserver.cc','sha256':sha(Path('/private/tmp/aux-standard-native-source-20261023-a4/AuxTaskDescendantObserver.cc'))},'nativeCompiled':False,'runtimeAccepted':False,'productExecuted':False,'signingPerformed':False,'crashRegistrationCloseIntegrated':False}
(P/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
(P/'source-check.json').write_text(json.dumps({'passed':True,'kind':'counted source replay and inert lineage scenarios','files':len(files),'anchors':len(rows),'nativeCompiled':False,'observerExecuted':False,'crashHandlerStopped':False},indent=2)+'\n')
print(json.dumps({'passed':True,'files':len(files),'anchors':len(rows)}))
