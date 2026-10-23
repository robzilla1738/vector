#!/usr/bin/env python3
import difflib
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
manifest = json.loads((HERE / 'manifest.json').read_text())
sha = lambda raw: hashlib.sha256(raw).hexdigest()
patch = ''
for record in manifest['files']:
    relative = record['path']
    oldpath, newpath = HERE/'baseline'/relative, HERE/'source'/relative
    old = oldpath.read_bytes() if oldpath.exists() else None
    new = newpath.read_bytes()
    assert (sha(old) if old is not None else None) == record['baselineSha256']
    assert sha(new) == record['sourceSha256'] and (old != new) == record['changed']
    if not record['changed']: continue
    if old is None: patch += f'diff --git a/{relative} b/{relative}\nnew file mode 100644\n'
    patch += ''.join(difflib.unified_diff(old.decode().splitlines(True) if old is not None else [],new.decode().splitlines(True),fromfile='a/'+relative if old is not None else '/dev/null',tofile='b/'+relative))
assert patch == (HERE/'native.patch').read_text() and sha(patch.encode()) == manifest['patchSha256']
for item in manifest['sourceDependencies']:
    assert sha((Path(manifest['nativeSourceRoot'])/item['path']).read_bytes()) == item['sha256'], item['path']
source=(HERE/'source/chrome/browser/ui/aux_profile_switch_session_rebuild.cc').read_text()
actor=source[source.index('class LoadedSessionWriterParticipant'):]
assert 'GetForProfile(' not in actor
assert actor.count('SessionServiceFactory::GetForProfileIfExisting(') == 1
assert 'GetProfileByPath' not in actor and 'profile_manager()' not in actor
entry=actor[actor.index('void CloseLoadedSessionWritersForMigration('):]
assert entry.index('manager.GetLoadedProfiles()') < entry.index('profile->GetWeakPtr()') < entry.index('->Start()')
assert 'ProfileManager&' not in actor[:actor.index('void CloseLoadedSessionWritersForMigration(')]
advance=actor[actor.index('void LoadedSessionWriterParticipant::Advance()'):actor.index('void LoadedSessionWriterParticipant::BeginFinalWrites()')]
assert advance.index('snapshot.in_flight_paths || snapshot.pending_write_observations') < advance.index('SealDispatchAfterObservedCallbacks()') < advance.index('BeginFinalWrites()')
assert 'if (!pending_writes_) BeginManagerCloses();' in advance
assert 'if (phase_ == Phase::kClosing && !pending_closes_) Finish();' in advance
writes=actor[actor.index('void LoadedSessionWriterParticipant::BeginFinalWrites()'):actor.index('void LoadedSessionWriterParticipant::DidWrite(')]
assert writes.index('if (!profiles_[i])') < writes.index('GetForProfileIfExisting(')
assert writes.index('GetWeakPtrForNativeSessionWriterParticipant()') < writes.index('++pending_writes_') < writes.index('ResetFromCurrentBrowsersWithWriteCompletion(')
closes=actor[actor.index('void LoadedSessionWriterParticipant::BeginManagerCloses()'):actor.index('void LoadedSessionWriterParticipant::DidClose(')]
for token in ['if (!observation.write.has_value())', 'if (!profiles_[i])', 'if (!services_[i])']:
    assert closes.index(token) < closes.index('CloseCommandWriterAdmissionAndObserve(')
assert closes.index('++pending_closes_') < closes.index('CloseCommandWriterAdmissionAndObserve(')
assert 'result_.profiles[index].write = std::move(result);' in actor
assert 'observation.close = std::move(result);' in actor
assert 'captured_writes_completed()' not in actor  # failures stay data, no success coercion
assert actor.count('retained_until_observed_.reset()') == 1
assert 'retained_until_observed_ = base::WrapRefCounted(this)' in actor
finish=actor[actor.index('void LoadedSessionWriterParticipant::Finish()'):]
assert finish.index('final_snapshot_dispatch = SnapshotDispatchState().Inspect()') < finish.index('retained_until_observed_.reset()') < finish.index('std::move(done_).Run(')
for forbidden in ['PostDelayedTask(', 'getenv(', 'SecItem', 'NAPI_MODULE', 'WaitForExit', 'Sleep(']:
    assert forbidden not in actor
rebuild=source[source.index('void ProfileSwitchSessionRebuild::Rebuild('):source.index('class LoadedSessionWriterParticipant')]
assert rebuild.index('dispatch_admission_closed') < rebuild.index('std::exchange(pending_paths_, {})')
assert 'if (!dispatch.BeginDispatch(paths.size()))' in rebuild
assert 'SnapshotDispatchState().DidObserveWrite(result);\n              NotifySnapshotDispatchChanged();' in rebuild
service=(HERE/'source/chrome/browser/sessions/session_service_base.cc').read_text()
weak=service[service.index('SessionServiceBase::GetWeakPtrForNativeSessionWriterParticipant()'):service.index('void SessionServiceBase::CloseCommandWriterAdmissionAndObserve(')]
assert 'return weak_factory_.GetWeakPtr();' in weak
for forbidden in ['Create', 'GetForProfile', 'profile_manager()']: assert forbidden not in weak
print('PASS: exact5-file native patch; actual weak loaded-profile inventory, callback wait/seal/write/close ownership and unresolved retention; no service creation or custody grant')

if (HERE/'evidence.json').exists():
    evidence=json.loads((HERE/'evidence.json').read_text())
    for item in evidence['checkSourcePins']:
        assert sha((HERE/item['path']).read_bytes()) == item['sha256'], item['path']
    assert evidence['sourceManifestSha256'] == sha((HERE/'manifest.json').read_bytes())
    assert evidence['compileInputsSha256'] == sha((HERE/'compile-inputs.json').read_bytes())
    assert evidence['compileCommandsSha256'] == sha((HERE/'compile-commands.json').read_bytes())
    assert evidence['currentProductionTUsCompiled'] == 2
    assert len(evidence['compileResults']) == 2
    assert all(item['exitCode'] == 0 for item in evidence['compileResults'])
    assert evidence['productionDispatchSealTypedChecksPassed'] == 22
    assert not evidence['callbackOwnerRuntimeExecuted'] and not evidence['wholeProfileCustodyClaimed']
    print('PASS: current2-TU compile receipt and focused22-check source pins; actual callback owner runtime remains unexecuted')
