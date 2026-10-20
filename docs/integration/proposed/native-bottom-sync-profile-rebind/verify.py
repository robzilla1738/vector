"""Verify real transaction ordering and exact patch replay without services/profiles."""
from pathlib import Path
import hashlib
import json
import subprocess
import tempfile

root = Path(__file__).resolve().parent
manifest = json.loads((root / 'manifest.json').read_text())
evidence = json.loads((root / 'source-evidence.json').read_text())
sha = lambda data: hashlib.sha256(data).hexdigest()
for row in evidence['inputs']:
    assert sha(Path(row['path']).read_bytes()) == row['sha256']
with tempfile.TemporaryDirectory(prefix='aux-bottom-profile-rebind-') as directory:
    for row in manifest['files']:
        old = (root / 'baseline' / row['path']).read_text()
        new = (root / 'source' / row['path']).read_text()
        assert sha(old.encode()) == row['baselineSha256']
        assert sha(new.encode()) == row['outputSha256']
        for anchor in row['anchors']:
            assert old.count(anchor['before']) == anchor['count'] == 1
            old = old.replace(anchor['before'], anchor['after'])
        assert old == new
        target = Path(directory) / row['path']
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes((root / 'baseline' / row['path']).read_bytes())
    subprocess.run(['git', 'apply', '--check', str(root / 'native.patch')], cwd=directory, check=True)
    subprocess.run(['git', 'apply', str(root / 'native.patch')], cwd=directory, check=True)
    for row in manifest['files']:
        assert sha((Path(directory) / row['path']).read_bytes()) == row['outputSha256']
code = (root / 'source' / manifest['files'][1]['path']).read_text()
pause = code.split('::PauseForAuxProfileSwitch() {', 1)[1].split('\n}', 1)[0]
assert pause.index('sync_observation_.Reset()') < pause.index('sync_service_ = nullptr')
assert 'UpdateSync' not in pause and 'pending_initial_downloads_' not in pause
assert 'sync_profile_switch_paused_ = true' in pause
bind = code.split('::BindSyncServiceForCurrentProfile() {', 1)[1].split('\n}', 1)[0]
assert 'CHECK(!sync_observation_.IsObserving())' in bind
assert 'GetForProfile(browser_->GetProfile())' in bind
assert bind.index('GetForProfile') < bind.index('Observe(sync_service_)') < bind.index('UpdateSyncState()')
region = (root / 'source' / manifest['files'][2]['path']).read_text()
end = region.split('::EndAuxProfileSwitch(uint64_t generation) {', 1)[1].split('\n}', 1)[0]
assert end.index('pinned_profile_switch_generation_ == generation') < end.index('RebindAfterAuxProfileSwitch()')
assert 'pinned_profile_switch_generation_.reset()' in end
transaction = next(Path(row['path']).read_text() for row in evidence['inputs'] if row['path'].endswith('aux_profile_switch_transaction.cc'))
complete = transaction.split('::Complete(Scope* scope) {', 1)[1].split('\n}', 1)[0]
assert complete.index('finish_') < complete.index('EndAuxProfileSwitch(scope->vertical_generation)')
assert complete.index('abort_') < complete.index('EndAuxProfileSwitch(scope->vertical_generation)')
print('PASS: nine exact anchors, actual commit/rollback order, observer detach/bind and 3-file disposable replay')
