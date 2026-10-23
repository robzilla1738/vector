#!/usr/bin/env python3
import difflib
import hashlib
import json
from pathlib import Path
import sys

HERE = Path(__file__).resolve().parent
manifest = json.loads((HERE / 'manifest.json').read_text())
sha = lambda raw: hashlib.sha256(raw).hexdigest()
patch = ''
for record in manifest['files']:
    relative = record['path']
    oldpath, newpath = HERE / 'baseline' / relative, HERE / 'source' / relative
    old = oldpath.read_bytes() if oldpath.exists() else None
    new = newpath.read_bytes()
    assert (sha(old) if old is not None else None) == record['baselineSha256']
    assert sha(new) == record['sourceSha256']
    if '--live' in sys.argv:
        path = Path(manifest['nativeSourceRoot']) / relative
        assert (path.read_bytes() if path.exists() else None) == old, relative
    if old is None:
        patch += f'diff --git a/{relative} b/{relative}\nnew file mode 100644\n'
    patch += ''.join(difflib.unified_diff(
        old.decode().splitlines(True) if old is not None else [],
        new.decode().splitlines(True), fromfile='a/' + relative if old is not None else '/dev/null',
        tofile='b/' + relative))
for item in manifest['anchors']:
    assert (HERE / 'baseline' / item['path']).read_text().count(item['anchor']) == item['baselineCount']
    assert (HERE / 'source' / item['path']).read_text().count(item['anchor']) == item['sourceCount']
assert patch == (HERE / 'native.patch').read_text()
assert sha(patch.encode()) == manifest['patchSha256']
source = (HERE / 'source/chrome/browser/ui/aux_profile_switch_session_rebuild.cc').read_text()
schedule = source[source.index('void ProfileSwitchSessionRebuild::Schedule('):source.index('void ProfileSwitchSessionRebuild::Rebuild(')]
assert schedule.index('AdmitPending(0)') < schedule.index('GetOriginalProfile()')
assert schedule.index('AdmitPending(next_paths.size()') < schedule.index('pending_paths_ = std::move(next_paths)') < schedule.index('PostDelayedTask(')
close = source[source.index('ProfileSwitchSessionRebuild::CloseAdmissionAndDispatchPendingSnapshots()'):source.index('ProfileSwitchSessionRebuild::InspectSnapshotDispatch()')]
assert close.index('state.CloseAdmission()') < close.index('++owner->generation_') < close.index('owner->Rebuild(owner->generation_)')
rebuild = source[source.index('void ProfileSwitchSessionRebuild::Rebuild('):]
assert rebuild.index('generation != generation_') < rebuild.index('std::exchange(pending_paths_, {})') < rebuild.index('dispatch.BeginDispatch(paths.size())')
assert rebuild.index('service->ResetFromCurrentBrowsers();') < rebuild.index('dispatch.DidDispatchPath();')
# Owner members must not be accessed after a reset may reentrantly destroy it.
after_begin = rebuild[rebuild.index('dispatch.BeginDispatch(paths.size());') + len('dispatch.BeginDispatch(paths.size());'):]
for token in ['pending_paths_', 'generation_', 'weak_ptr_factory_', 'this->']:
    assert token not in after_begin, token
assert not manifest['allWriterCustodyClaimed'] and not manifest['storageDurabilityClaimed']
if '--live' in sys.argv:
    for item in manifest['sourceDependencies']:
        assert sha((Path(manifest['nativeSourceRoot']) / item['path']).read_bytes()) == item['sha256']
print('PASS: exact3-file native patch, paired schedule/close/rebuild/destruction source checks; no UI/source checkout mutation')
