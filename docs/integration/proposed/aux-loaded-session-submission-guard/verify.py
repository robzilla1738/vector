#!/usr/bin/env python3
"""Authenticate successor inputs and paired production transition guards."""
import hashlib,json
from pathlib import Path
HERE=Path(__file__).resolve().parent
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
m=json.loads((HERE/'manifest.json').read_text())
for f in m['files']:
    assert sha(HERE/'source'/f['path'])==f['sourceSha256'],f['path']
    if f['changed']:
        assert sha(HERE/'baseline'/f['path'])==f['baselineSha256'],f['path']
assert sha(HERE/'native.patch')==m['patchSha256']
repo=HERE.parents[3]
assert sha(repo/m['historicalProposal']/'manifest.json')==m['historicalManifestSha256']
s=(HERE/'source/chrome/browser/ui/aux_profile_switch_session_rebuild.cc').read_text()
for anchor in ['SessionWriterSubmissionWindow write_submission_;','SessionWriterSubmissionWindow close_submission_;','write_submission_.CanAdvance(pending_writes_)','close_submission_.CanAdvance(pending_closes_)','write_submission_.Begin();','write_submission_.Finish();','close_submission_.Begin();','close_submission_.Finish();']:
    assert s.count(anchor)==1,anchor
for method,window,next_method in [('BeginFinalWrites','write','DidWrite'),('BeginManagerCloses','close','DidClose')]:
    body=s.split('void LoadedSessionWriterParticipant::'+method+'() {',1)[1].split('void LoadedSessionWriterParticipant::'+next_method,1)[0]
    assert body.index(window+'_submission_.Begin();')<body.index('for (')<body.index(window+'_submission_.Finish();')<body.rindex('ScheduleAdvance();')
assert 'if (!pending_writes_) BeginManagerCloses();' not in s
assert 'Phase::kClosing && !pending_closes_' not in s
if (HERE/'evidence.json').exists():
    evidence=json.loads((HERE/'evidence.json').read_text())
    assert sha(HERE/'manifest.json')==evidence['sourceManifestSha256']
    assert sha(HERE/'compile-inputs.json')==evidence['compileInputsSha256']
    assert sha(HERE/'compile-commands.json')==evidence['compileCommandsSha256']
    assert evidence['currentProductionTUsCompiled']==1
    assert evidence['productionSubmissionWindowChecksPassed']==12
    for item in evidence['checkSourcePins']:
        assert sha(HERE/item['path'])==item['sha256'],item['path']
print('PASS:9 source pins, two production loop/transition guard pairs, historical manifest preserved')
