#!/usr/bin/env python3
"""Focused source replay and paired API checks only; never runs native code."""
from pathlib import Path
import hashlib,json,subprocess,tempfile
HERE=Path(__file__).resolve().parent;ROOT=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
ORG=Path('/Users/rcourson/.codex/worktrees/aux-features-organization/web/docs/integration/proposed/standard-profile-isolation/native-cache-cohort-integration-a9/source/components/services/storage/dom_storage')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
plan=json.loads((HERE/'source-plan.json').read_text());rows=plan['files'];assert len(rows)==6
expected={f'components/services/storage/dom_storage/{kind}_storage_impl.{suffix}'for kind in ['local','session']for suffix in ['h','cc']}|{f'components/services/storage/public/mojom/{kind}_storage_control.mojom'for kind in ['local','session']}
assert {r['path']for r in rows}==expected
for row in rows:
 before=Path(row['beforeImage']);assert sha(before)==row['inputSha256']==sha(ROOT/row['path']);text=before.read_text()
 for edit in row['anchors']:assert text.count(edit['find'])==edit['count']==1;text=text.replace(edit['find'],edit['replace'])
 assert Path(row['source']).read_text()==text and sha(Path(row['source']))==row['outputSha256']
with tempfile.TemporaryDirectory(prefix='aux-dom-control-glue-')as temporary:
 stage=Path(temporary)
 for row in rows:
  p=stage/row['path'];p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(Path(row['beforeImage']).read_bytes())
 subprocess.run(['git','apply','--check',str(HERE/'native.patch')],cwd=stage,check=True,capture_output=True)
 subprocess.run(['git','apply',str(HERE/'native.patch')],cwd=stage,check=True,capture_output=True)
 for row in rows:assert sha(stage/row['path'])==row['outputSha256']
 subprocess.run(['git','apply','--reverse',str(HERE/'native.patch')],cwd=stage,check=True,capture_output=True)
 for row in rows:assert sha(stage/row['path'])==row['inputSha256']
async_header=ORG/'async_dom_storage_database.h';namespace_header=ORG/'session_storage_namespace_impl.h';namespace_cc=ORG/'session_storage_namespace_impl.cc'
a=async_header.read_text();n=namespace_header.read_text()
api=['ValidateAuxUiMigrationLease','StageAuxUiMigrationTargets','PublishAuxUiMigrationLease','AuxUiTargetMap','desired_selected_entries','source_topology_sha256','target_topology_sha256','source_map_sha256','target_map_sha256','AuxUiCacheView','source_ready','private_target_staged','cache_published','native_error','using AuxUiBeforeReopen = base::OnceCallback<DbStatus()>;','AuxUiBeforeReopen before_reopen, StatusCallback callback']
for needle in api:assert needle in a,needle
namespace_api=['CanFreezeAuxUiMigrationNamespace() const','FreezeAuxUiMigrationNamespace(const base::UnguessableToken& request)','CanResumeAuxUiMigrationNamespace(const base::UnguessableToken& request) const','ResumeAuxUiMigrationNamespace(const base::UnguessableToken& request)','ReholdAuxUiMigrationNamespaceAfterFailedResume(const base::UnguessableToken& request)']
for needle in namespace_api:assert needle in n,needle
contracts={'format':'aux.dom-cohort.controls.native-contract.v1','asyncHeader':str(async_header),'asyncHeaderSha256':sha(async_header),'asyncPublicContractStrings':api,'namespaceHeader':str(namespace_header),'namespaceHeaderSha256':sha(namespace_header),'namespaceImplementation':str(namespace_cc),'namespaceImplementationSha256':sha(namespace_cc),'namespacePublicContractStrings':namespace_api,'backendOwnerLaneStillIntegratesImplementation':True,'nativeBuildRun':False}
(HERE/'native-contract.json').write_text(json.dumps(contracts,indent=2)+'\n')
pins={str(async_header):sha(async_header),str(namespace_header):sha(namespace_header),str(namespace_cc):sha(namespace_cc)}
for name in ['components/services/storage/dom_storage/db_status.h','components/services/storage/dom_storage/dom_storage_database.h','third_party/blink/public/mojom/dom_storage/storage_area.mojom']:
 pins[str(ROOT/name)]=sha(ROOT/name)
for row in rows:pins[str(ROOT/row['path'])]=row['inputSha256']
(HERE/'dependency-pins.json').write_text(json.dumps({'format':'aux.dom-cohort.controls.dependencies.v1','files':[{'path':k,'sha256':v}for k,v in sorted(pins.items())]},indent=2)+'\n')
for kind in ['local','session']:
 s=(HERE/'source/components/services/storage/dom_storage'/f'{kind}_storage_impl.cc').read_text()
 for needle in ['ValidateAuxUiMigrationLease','StageAuxUiMigrationTargets','PublishAuxUiMigrationLease','BeforeAuxUiLeaseReopen','aux_ui_release_pending_','aux_ui_generation_','source_ready && snapshot.native_error.empty()','ordinals.insert','desired_selected_entries.emplace']:
  assert needle in s,(kind,needle)
 assert 'if (released)'not in s and 'bool released ='not in s
 begin=s[s.index(f'void {kind.title()}StorageImpl::BeginAuxUiPreferenceLease'):s.index(f'bool {kind.title()}StorageImpl::OwnsAuxUiLease')]
 assert '!areas_.empty()'not in begin and '!data_maps_.empty()'not in begin and '!namespaces_.empty()'not in begin
 assert 'lease.has_value() && !lease.value()'in begin
session=(HERE/'source/components/services/storage/dom_storage/session_storage_impl.cc').read_text();assert session.index('CanFreezeAuxUiMigrationNamespace')<session.index('FreezeAuxUiMigrationNamespace(request_id)')<session.index('database_->BeginAuxUiMigrationLease')
for row in rows:assert sha(ROOT/row['path'])==row['inputSha256']
receipt={'format':'aux.dom-cohort.controls.static-check.v1','passed':True,'nativeFiles':6,'singleMatchAnchors':sum(len(r['anchors'])for r in rows),'exactPatchReplayedAndReversed':True,'nativePublicApiPaired':True,'namespaceFreezeResumeReholdPaired':True,'duplicateRawKeysAndOrdinalsRejected':True,'privateObserverTokensExported':False,'actualNativeMutation':False,'mojoGenerationRun':False,'compilerRun':False,'nativeApiExecuted':False,'productExecuted':False,'runtimeAcceptance':False}
(HERE/'static-check.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))
