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
    if not record['changed']: continue
    if old is None: patch += f'diff --git a/{relative} b/{relative}\nnew file mode 100644\n'
    patch += ''.join(difflib.unified_diff(old.decode().splitlines(True) if old is not None else [], new.decode().splitlines(True), fromfile='a/'+relative if old is not None else '/dev/null', tofile='b/'+relative))
assert patch == (HERE / 'native.patch').read_text() and sha(patch.encode()) == manifest['patchSha256']
def source(path, area='source'):
    return (HERE / area / path).read_text()
core = 'components/sessions/core/'
old, backend = source(core+'command_storage_backend.cc', 'baseline'), source(core+'command_storage_backend.cc')
start='CommandStorageBackend::WriteStatus CommandStorageBackend::AppendCommandsImpl('
end='\n// static\nbool CommandStorageBackend::TimestampFromPath'
assert backend[backend.index(start):backend.index(end)] == old[old.index(start):old.index(end)], 'Original actual write/format body drift'
for marker in ['void CommandStorageBackend::AppendCommands(', 'void CommandStorageBackend::AppendCommandsWithCompletion(', 'CommandStorageBackend::ReadLastSessionCommands()', 'CommandStorageBackend::ReadLastSessionCommandsPreservingFiles()', 'void CommandStorageBackend::DeleteLastSession()', 'void CommandStorageBackend::MoveCurrentSessionToLastSession()']:
    position=backend.index('{',backend.index(marker))
    assert 'writer_admission_.Admit()' in backend[position:position+330], marker
close=backend[backend.index('void CommandStorageBackend::CloseWriterAdmissionAndObserve('):backend.index(start)]
assert close.index('CHECK(owning_task_runner()->RunsTasksInCurrentSequence())') < close.index('writer_admission_.Close()') < close.index('open_file_.reset()') < close.index('callback_task_runner_->PostTask(')
for forbidden in ['\n  CloseFile(', 'InitIfNecessary(', 'base::Delete', 'fsync(']: assert forbidden not in close
manager=source(core+'command_storage_manager.cc')
for marker in ['void CommandStorageManager::OnEncryptorReady(', 'void CommandStorageManager::ScheduleCommand(', 'void CommandStorageManager::AppendRebuildCommands(', 'void CommandStorageManager::EraseCommand(', 'void CommandStorageManager::SwapCommand(', 'void CommandStorageManager::ClearPendingCommands()', 'void CommandStorageManager::StartSaveTimer()', 'void CommandStorageManager::Save()', 'void CommandStorageManager::SaveWithCompletion(', 'void CommandStorageManager::MoveCurrentSessionToLastSession()', 'void CommandStorageManager::DeleteLastSession()', 'void CommandStorageManager::GetLastSessionCommandsImpl(', 'void CommandStorageManager::OnErrorWritingToFile()']:
    position=manager.index('{',manager.index(marker))
    assert 'writer_admission_.Admit()' in manager[position:position+200], marker
close=manager[manager.index('void CommandStorageManager::CloseWriterAdmissionAndObserve('):manager.index('bool CommandStorageManager::HasPendingSave()')]
assert close.index('writer_admission_.Close()') < close.index('weak_factory_for_timer_.InvalidateWeakPtrs()') < close.index('PostNonNestableTask(')
assert 'std::move(backend), std::move(completion)' in close
for forbidden in ['Save(', 'SaveImpl(', 'pending_commands_.clear(', 'pending_encrypted_ops_.clear(']: assert forbidden not in close
assert 'backend.get()' not in manager and 'backend_.get()' not in manager
assert 'RetainUnrunSessionOperations(pending_encrypted_ops_, ops, i + 1)' in manager
assert 'initial.active_encryption_replay_operations = active_encryption_replay_operations_' in manager
rotation=manager[manager.index('void CommandStorageManager::MoveCurrentSessionToLastSession()'):manager.index('void CommandStorageManager::DeleteLastSession()')]
assert rotation.index('Save();') < rotation.index('if (!weak || !writer_admission_.Admit())') < rotation.index('PostNonNestableTask(')
service=source('chrome/browser/sessions/session_service_base.cc')
forward=service[service.index('void SessionServiceBase::CloseCommandWriterAdmissionAndObserve('):service.index('void SessionServiceBase::SetTabWindow(')]
assert 'if (!command_storage_manager_)' in forward and 'result.manager_unavailable = true' in forward
for forbidden in ['Create', 'Factory', 'command_storage_manager()']: assert forbidden not in forward
assert 'command_storage_manager_->CloseWriterAdmissionAndObserve(std::move(done))' in forward
print('PASS: exact8-file source pin/patch;6 backend and13 manager admission entries; owned sequence/references, nondeleting release, deferred retention and no lazy-manager creation')

for item in manifest['closureDependencies']:
    assert sha((Path(manifest['nativeSourceRoot']) / item['path']).read_bytes()) == item['sha256'], item['path']
if (HERE / 'evidence.json').exists():
    evidence = json.loads((HERE / 'evidence.json').read_text())
    for item in evidence['checkSourcePins']:
        assert sha((HERE / item['path']).read_bytes()) == item['sha256'], item['path']
    assert evidence['sourceManifestSha256'] == sha((HERE / 'manifest.json').read_bytes())
    assert evidence['compileInputsSha256'] == sha((HERE / 'compile-inputs.json').read_bytes())
    assert evidence['compileCommandsSha256'] == sha((HERE / 'compile-commands.json').read_bytes())
    assert evidence['currentProductionTUsCompiled'] == 3
    assert len(evidence['compileResults']) == 3
    assert all(item['exitCode'] == 0 for item in evidence['compileResults'])
    assert evidence['productionAdmissionResultChecksPassed'] == 17
    assert not evidence['realBackendIOExecuted'] and not evidence['wholeProfileCustodyClaimed']
    print('PASS: current3-TU compile receipt and focused17-check source pins; no backend runtime or whole-profile claim')
