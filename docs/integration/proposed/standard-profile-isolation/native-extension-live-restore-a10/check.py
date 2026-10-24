from pathlib import Path
import json,hashlib
HERE=Path(__file__).resolve().parent;plan=json.loads((HERE/'source-plan.json').read_text());native=Path(plan['nativeRoot']);sha=lambda x:hashlib.sha256(x).hexdigest()
for row in plan['files']:
 text=(native/row['path']).read_text();assert sha(text.encode())==row['inputSha256']
 for a in row['anchors']:assert text.count(a['find'])==a['count'];text=text.replace(a['find'],a['replace'])
 assert text==Path(row['output']).read_text() and sha(text.encode())==row['outputSha256']
read=lambda p:(HERE/'source'/p).read_text()
backend=read('components/value_store/leveldb_value_store.cc');front=read('extensions/browser/api/storage/storage_frontend.cc')
retained=backend[backend.index('LeveldbValueStore::CommitRetainedAuxUiPreferenceMigration('):backend.index('bool LeveldbValueStore::WriteToDbForTest(')]
assert 'EnsureDbIsOpen' not in retained and 'DeleteDbFile' not in retained and 'InvalidateWeakPtrs' not in retained
assert 'capture->owner.get() != this || !db()' in retained
assert 'before.value() != capture->records && before.value() != target' in retained
assert 'capture->retained_observation_known = false;' in retained
assert 'options.sync = true;' in retained and 'after.value() != expected' in retained
assert 'before.value() != capture->records' in retained
assert 'retained_target_attempted || capture->retained_restore_attempted' in retained
for stem in ['weak_unlimited_settings_storage','settings_storage_quota_enforcer']:
 body=read('extensions/browser/api/storage/'+stem+'.cc')
 for name in ['Commit','Read','Restore']:assert 'delegate_->'+name+'RetainedAuxUiPreferenceMigration(std::move(capture))' in body
assert 'std::move(lease.capture_)' not in front
assert 'AuxUiRetainedOperation::kRestore' in front and 'AuxUiRetainedOperation::kRead' in front
assert 'state->source_file_data_synced && state->source_readback_matches' in front
assert '!state->restore_attempted && !state->tainted && state->deferred.empty()' in front
assert 'retained_target_attempted' not in read('extensions/browser/api/storage/storage_frontend.h') # backend-private state
r={'format':'aux.native-extension-live-restore.source-check.actual.v1','passed':True,'files':len(plan['files']),'countedAnchors':plan['countedAnchors'],'exactReplayAndOriginalInputPreservation':True,'realQuotaUnlimitedBackendAndFrontendConsumersPresent':True,'liveOpaqueTokenSourceTargetCasAndSyncReadbackAnchorsPresent':True,'ordinaryInvalidationAndLegacyOneShotPathPreserved':True,'sourceOnly':True,'nativeCompiled':False,'nativeExecuted':False,'productExecuted':False,'restartRecoveryImplemented':False,'runtimeAccepted':False,'sourcePlanSha256':sha((HERE/'source-plan.json').read_bytes())}
(HERE/'actual-source-check-a10.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r))
