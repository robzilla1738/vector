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
    oldpath, newpath = HERE / 'baseline' / relative, HERE / 'source' / relative
    old = oldpath.read_bytes() if oldpath.exists() else None
    new = newpath.read_bytes()
    assert (sha(old) if old is not None else None) == record['baselineSha256']
    assert sha(new) == record['sourceSha256']
    assert (old != new) == record['changed']
    if not record['changed']:
        continue
    if old is None:
        patch += f'diff --git a/{relative} b/{relative}\nnew file mode 100644\n'
    patch += ''.join(difflib.unified_diff(
        old.decode().splitlines(True) if old is not None else [],
        new.decode().splitlines(True), fromfile='a/' + relative if old is not None else '/dev/null',
        tofile='b/' + relative))
assert patch == (HERE / 'native.patch').read_text()
assert sha(patch.encode()) == manifest['patchSha256']
def source(path, area='source'):
    return (HERE / area / path).read_text()
path = 'components/sessions/core/command_storage_backend.cc'
old, new = source(path, 'baseline'), source(path)
end = '\n// static\nbool CommandStorageBackend::TimestampFromPath'
old_append = old[old.index('void CommandStorageBackend::AppendCommands('):old.index(end)]
new_append = new[new.index('CommandStorageBackend::WriteStatus CommandStorageBackend::AppendCommandsImpl('):new.index(end)]
normalized = new_append.replace('CommandStorageBackend::WriteStatus CommandStorageBackend::AppendCommandsImpl(', 'void CommandStorageBackend::AppendCommands(', 1).replace('    return WriteStatus::kUnknown;', '    return;', 1)
assert normalized.endswith('  return status;\n}\n')
normalized = normalized[:-len('  return status;\n}\n')] + '}\n'
assert normalized == old_append, 'Original real append/write/error/format body must remain exact'
observed = new[new.index('void CommandStorageBackend::AppendCommandsWithCompletion('):new.index('CommandStorageBackend::WriteStatus CommandStorageBackend::AppendCommandsImpl(')]
assert observed.index('AppendCommandsImpl(') < observed.index('callback_task_runner_->PostTask(')
for status in ['kUnknown', 'kSuccess', 'kFileNotOpened', 'kFileWriteError', 'kSerializationError', 'kEncryptionUnavailable']:
    assert observed.count('case WriteStatus::' + status + ':') == 1
manager = source('components/sessions/core/command_storage_manager.cc')
save = manager[manager.index('void CommandStorageManager::SaveImpl('):manager.index('bool CommandStorageManager::HasPendingSave()')]
assert save.count('PostAppendWithObservation(') == 6
assert save.count('observe.Run(SessionBackendWriteOutcome::kBackendUnavailable)') == 3
assert 'dual ? 2 : 1' in save and 'const bool deferred = !pending_encrypted_ops_.empty();' in save
assert 'SaveImpl({});' in manager and 'BindPostTaskToCurrentDefault(std::move(done))' in manager
assert 'SessionBackendWriteOutcome::kTaskRejected' in manager
assert 'std::move(backend), std::move(commands), reset,' in manager
assert save.index('if (!weak)') > save.index('delegate_->OnWillSaveCommands();')
scheduler = source('chrome/browser/ui/aux_profile_switch_session_rebuild.cc')
assert 'static WorkspaceSnapshotDispatchState state;' in scheduler
assert 'base::NoDestructor<WorkspaceSnapshotDispatchState>' not in scheduler
assert scheduler.index('dispatch.BeginWriteObservation();') < scheduler.index('service->ResetFromCurrentBrowsersWithWriteCompletion(')
assert 'SnapshotDispatchState().DidObserveWrite(result);' in scheduler
service = source('chrome/browser/sessions/session_service_base.cc')
method = service[service.index('void SessionServiceBase::ResetFromCurrentBrowsersWithWriteCompletion('):service.index('void SessionServiceBase::SetTabWindow(')]
assert method.index('ResetFromCurrentBrowsers();') < method.index('if (!weak)') < method.index('SaveWithCompletion(std::move(report))')
for path in [record['path'] for record in manifest['files']]:
    for forbidden in ['SecItem', 'NAPI_MODULE', 'getenv(', 'fsync(', 'FlushFileBuffers(']:
        assert source(path).count(forbidden) == (source(path, 'baseline').count(forbidden) if (HERE / 'baseline' / path).exists() else 0), (path, forbidden)
print('PASS: exact original append/write body, all6 selected backend posts/3 unavailable branches, async/weak lifetime pairing, scheduler callback consumption; no fsync or whole-writer claim')

if (HERE / 'evidence.json').exists():
    evidence = json.loads((HERE / 'evidence.json').read_text())
    for item in evidence['checkSourcePins']:
        assert sha((HERE / item['path']).read_bytes()) == item['sha256'], item['path']
    assert evidence['sourceManifestSha256'] == sha((HERE / 'manifest.json').read_bytes())
    assert evidence['compileInputsSha256'] == sha((HERE / 'compile-inputs.json').read_bytes())
    assert evidence['compileCommandsSha256'] == sha((HERE / 'compile-commands.json').read_bytes())
    assert evidence['currentProductionTUsCompiled'] == 4
    assert len(evidence['compileResults']) == 4
    assert all(item['exitCode'] == 0 for item in evidence['compileResults'])
    assert evidence['capturedResultLifetimeChecksPassed'] == 37
    assert not evidence['backendIOExecuted'] and not evidence['wholeWriterCustodyClaimed']
    print('PASS: current4-TU compile receipt and focused37-check sources authenticated')
