"""Counted replay and real owner-contract checks only; no native build/run."""
from pathlib import Path
import json,hashlib,re
HERE=Path(__file__).resolve().parent
plan=json.loads((HERE/'source-plan.json').read_text());native=Path(plan['nativeRoot']);sha=lambda x:hashlib.sha256(x).hexdigest()
for row in plan['files']:
 text=(native/row['path']).read_text();assert sha(text.encode())==row['inputSha256']
 for a in row['anchors']:
  assert text.count(a['find'])==a['count'];text=text.replace(a['find'],a['replace'])
 assert text==Path(row['output']).read_text();assert sha(text.encode())==row['outputSha256']
for row in plan['dependencies']:assert sha(Path(row['input']).read_bytes())==row['requiredOutputSha256']
s=Path(plan['files'][0]['output']).read_text()
for forbidden in ['auxSealDraftMigrationCapture','auxObserveDraftMigrationTarget','CommitAuxUiMigrationLease(', 'CommitAuxUiPreferenceMigration(', 'BeginAuxUiStorageMigrationLease(', 'ApplyAuxUiStorageMigrationTarget(']:assert forbidden not in s,forbidden
assert s.count('IsAuxLocalFeatureWritePending(')==1
assert s.count('backendWriterClosure", false')==2
assert 'CaptureAuxUiPreferencesForMigration(' not in s
assert 'worker_inventory_.start_token' in s and 'context != worker_context_id_' in s
assert 'if (cursor_ == frames_.size()) { BeginWorker(); return; }' in s
assert 'frontend->BeginAuxUiMigrationLease(extension_' in s
assert 'frontend->ReadbackAuxUiMigrationLease(*extension_lease_' in s
assert 'result->records != extension_lease_->CopySourceRecords()' in s
assert 'frontend->ReleaseAuxUiMigrationLease(*extension_lease_)' in s
assert 'ownExternalRequestRetired' in s
assert 'if (value.FindBool("transportSuperseded") == true) return;' in s
assert 'if (cleanup) { error_' in s
assert s.count('using Capture =')==0 and 'extension_capture_' not in s
# Existing actual Profile/epoch/draft/source-document authority remains intact.
for anchor in ['IsAuxLocalProfileAdmitted(profile_.get())','GetProfileCookieBindingEpoch(profile_.get()) == binding_',
 'GetProfileCookieRestoreEpoch(profile_.get()) == restoration_',
 'results[0].document_id != self->frames_[index]->document_id',
 'source->GetBrowserContext() == profile_.get()',
 'IsUiStorageMigrationPending(Profile* profile)',
 'if (alive && !alive->pending()) alive->settled_.Notify();']:
 assert anchor in s,anchor
# Source gate release is attempted before the first productive restore path.
cleanup=s[s.index('void Controller::StartCleanup()'):s.index('void Controller::ReleaseNext()')]
assert cleanup.index('ReleaseAuxUiMigrationLease(')<cleanup.index('ObserveCleanupNext(); else ReleaseNext();')
# New native function declarations pair with exactly one real definition.
for name in ['BeginWorker','WorkerPrepared','WorkerCorrelation','WorkerControlLost','BeginFrontend','FrontendPrepared','FrontendLost','FrontendCurrent','ReadWorkerForValidation','WorkerReadForValidation','ValidateWorker','WorkerValidated','ValidateFrontend','FrontendReadback','ValidationComplete','StartCleanup','CleanupWorker','ObservedWorkerCleanup','ReleasedWorker']:
 assert len(re.findall(r'Controller::'+name+r'\(',s))==1,name
r={'format':'aux.ui-worker-controller-integration.source-check.actual.v1','passed':True,'files':len(plan['files']),'countedAnchors':plan['countedAnchors'],
 'exactCurrentCorrectedNativeInputsReplayed':True,'explicitFrontendA6AndWorkerHelperDependenciesPinned':True,
 'allFramesFlushBeforeWorkerHoldAndFrontendGate':True,'frontendOpaqueTokenSourceReadbackAndCleanupPathsPresent':True,
 'originalProfileEpochDocumentAndSettledWakeAnchorsPreserved':True,'unknownControlAndReadbackOutcomesRetained':True,
 'sourceOnly':True,'nativeCompiled':False,'nativeExecuted':False,'productExecuted':False,'backendWriterClosure':False,'targetApisCalled':False,'runtimeAccepted':False,
 'sourcePlanSha256':sha((HERE/'source-plan.json').read_bytes())}
(HERE/'actual-source-check-a1.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r))
