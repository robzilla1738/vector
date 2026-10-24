"""Generate exact physical DOM owner overlays; never modify the native tree."""
import difflib,hashlib,json,re
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
sha=lambda data:hashlib.sha256(data).hexdigest()
files=[];patch=[]
def project(path,edits):
 original=(ROOT/path).read_bytes();text=original.decode();anchors=[]
 for before,after in edits:
  assert text.count(before)==1,(path,before[:120],text.count(before))
  text=text.replace(before,after);anchors.append({'find':before,'replace':after,'count':1})
 target=HERE/'source'/path;target.parent.mkdir(parents=True,exist_ok=True);target.write_text(text)
 files.append({'path':path,'inputSha256':sha(original),'outputSha256':sha(text.encode()),'output':str(target),'anchors':anchors})
 patch.extend(difflib.unified_diff(original.decode().splitlines(True),text.splitlines(True),fromfile='a/'+path,tofile='b/'+path))
project('components/services/storage/dom_storage/async_dom_storage_database.h',[
 ('#include "base/time/time.h"','#include "base/time/time.h"\n#include "base/unguessable_token.h"'),
 ('  // Registers or unregisters `source` such that its commits will be batched',
  (HERE/'lease-declarations.inc').read_text().rstrip()+'\n\n  // Registers or unregisters `source` such that its commits will be batched'),
 ('  explicit AsyncDomStorageDatabase(StorageType storage_type);',
  '''  explicit AsyncDomStorageDatabase(StorageType storage_type);
  void RunAuxUiMigrationOperation(AuxUiMigrationLease& lease, int operation,
                                  AuxUiReadCallback callback);
  void ReleaseAuxUiMigrationGate(std::shared_ptr<AuxUiMigrationLease::State> state);'''),
 ('  bool is_database_opened_ = false;',
  '''  bool is_database_opened_ = false;
  bool aux_on_disk_ = false;
  std::shared_ptr<AuxUiMigrationLease::State> aux_ui_migration_gate_;'''),
])
project('components/services/storage/dom_storage/async_dom_storage_database.cc',[
 ('#include "base/files/file_path.h"','#include <algorithm>\n#include <cstring>\n#include <iterator>\n\n#include "base/files/file_path.h"\n#include "base/json/json_reader.h"\n#include "base/strings/utf_string_conversions.h"\n#include "url/gurl.h"\n#include "url/origin.h"'),
 ('  DomStorageDatabaseFactory::Open(\n', '  instance->aux_on_disk_ = !dir_to_open.empty();\n  DomStorageDatabaseFactory::Open(\n'),
 ('// static\nstd::unique_ptr<AsyncDomStorageDatabase> AsyncDomStorageDatabase::Open(',
  (HERE/'lease-definitions.inc').read_text().rstrip()+'\n\n// static\nstd::unique_ptr<AsyncDomStorageDatabase> AsyncDomStorageDatabase::Open('),
 ('void AsyncDomStorageDatabase::AddCommitter(Committer* source) {',
  '''void AsyncDomStorageDatabase::AddCommitter(Committer* source) {
  if (aux_ui_migration_gate_) aux_ui_migration_gate_->tainted = true;'''),
 ('void AsyncDomStorageDatabase::RemoveCommitter(Committer* source) {',
  '''void AsyncDomStorageDatabase::RemoveCommitter(Committer* source) {
  if (aux_ui_migration_gate_) aux_ui_migration_gate_->tainted = true;'''),
 ('void AsyncDomStorageDatabase::InitiateCommit() {\n  CHECK(is_database_opened_);',
  '''void AsyncDomStorageDatabase::InitiateCommit() {
  CHECK(is_database_opened_);
  if (aux_ui_migration_gate_ && DeferForAuxUiMigration(base::BindOnce(&AsyncDomStorageDatabase::InitiateCommit,
                                          weak_ptr_factory_.GetWeakPtr()))) return;'''),
 ('void AsyncDomStorageDatabase::DrainCommitsForAuxMigration(\n    StatusCallback callback) {\n  CHECK(is_database_opened_);',
  '''void AsyncDomStorageDatabase::DrainCommitsForAuxMigration(
    StatusCallback callback) {
  CHECK(is_database_opened_);
  if (aux_ui_migration_gate_ && DeferForAuxUiMigration(base::BindOnce(&AsyncDomStorageDatabase::DrainCommitsForAuxMigration,
      weak_ptr_factory_.GetWeakPtr(), std::move(callback)))) return;'''),
 ('    StatusCallback callback) {\n  database_.PostTaskWithThisObject(base::BindOnce(',
  '''    StatusCallback callback) {
  if (aux_ui_migration_gate_ && DeferForAuxUiMigration(base::BindOnce(
      [](base::WeakPtr<AsyncDomStorageDatabase> owner, std::string operation,
         base::OnceCallback<DbStatus(DomStorageDatabase*)> task, StatusCallback callback) {
        if (owner) owner->RunTaskOnDbSequenceAndRecordHistograms(operation, std::move(task), std::move(callback));
      }, weak_ptr_factory_.GetWeakPtr(), std::string(operation), std::move(db_task), std::move(callback)))) return;
  database_.PostTaskWithThisObject(base::BindOnce('''),
 ('    base::OnceCallback<void(StatusOr<T>)> callback) {\n  database_.PostTaskWithThisObject(base::BindOnce(',
  '''    base::OnceCallback<void(StatusOr<T>)> callback) {
  if (aux_ui_migration_gate_ && DeferForAuxUiMigration(base::BindOnce(
      [](base::WeakPtr<AsyncDomStorageDatabase> owner, std::string operation,
         base::OnceCallback<StatusOr<T>(DomStorageDatabase*)> task,
         base::OnceCallback<void(StatusOr<T>)> callback) {
        if (owner) owner->RunTaskOnDbSequenceAndRecordHistograms<T>(operation, std::move(task), std::move(callback));
      }, weak_ptr_factory_.GetWeakPtr(), std::string(operation), std::move(db_task), std::move(callback)))) return;
  database_.PostTaskWithThisObject(base::BindOnce('''),
])
# Only the privileged control interfaces can reach the physical owner. These
# operations have no renderer root/map/target arguments; request IDs correlate
# lost replies, while the actual service-owned token/opaque lease owns custody.
wire='''
// Only reviewed UI key families are exported. Unrelated raw map entries are
// retained privately by the backend for exact CAS and source restoration.
struct AuxUiDomMapSnapshot {
  blink.mojom.StorageKey storage_key;
  array<string> session_ids;
  array<blink.mojom.KeyValue> source_entries;
  array<blink.mojom.KeyValue> target_entries;
};
struct AuxUiDomLeaseReply {
  bool ok;
  bool held;
  string error;
  mojo_base.mojom.UnguessableToken? request_id;
  mojo_base.mojom.UnguessableToken? token;
  array<AuxUiDomMapSnapshot> maps;
  bool matches_source;
  bool matches_target;
  bool file_data_synced;
  bool ordinary_work_queued;
  bool target_attempted;
};
'''
methods='''
  // Native-only pending physical transaction. No full-profile closure,
  // directory durability, cache coherence or activation claim is implied.
  // Begin refuses live map cache owners in this initial physical slice.
  BeginAuxUiPreferenceLease(mojo_base.mojom.UnguessableToken request_id)
      => (AuxUiDomLeaseReply reply);
  // Discovery is read-only and recognizes only this service's original
  // request. It never reruns Begin after an uncertain/lost reply.
  ReadAuxUiPreferenceLease(mojo_base.mojom.UnguessableToken request_id)
      => (AuxUiDomLeaseReply reply);
  CommitAuxUiPreferenceLease(mojo_base.mojom.UnguessableToken request_id,
                            mojo_base.mojom.UnguessableToken token)
      => (AuxUiDomLeaseReply reply);
  RestoreAuxUiPreferenceLease(mojo_base.mojom.UnguessableToken request_id,
                             mojo_base.mojom.UnguessableToken token)
      => (AuxUiDomLeaseReply reply);
  ReleaseAuxUiPreferenceLease(mojo_base.mojom.UnguessableToken request_id,
                             mojo_base.mojom.UnguessableToken token)
      => (bool released);
'''
project('components/services/storage/public/mojom/local_storage_control.mojom',[
 ('import "components/services/storage/public/mojom/storage_policy_update.mojom";',
  'import "mojo/public/mojom/base/unguessable_token.mojom";\nimport "components/services/storage/public/mojom/storage_policy_update.mojom";'),
 ('// Controls the state of Local Storage within a partition.',wire+'\n// Controls the state of Local Storage within a partition.'),
 ('  DrainAuxUiMigration() => (bool file_data_synced);','  DrainAuxUiMigration() => (bool file_data_synced);\n'+methods),
])
project('components/services/storage/public/mojom/session_storage_control.mojom',[
 ('import "third_party/blink/public/mojom/dom_storage/storage_area.mojom";',
  'import "mojo/public/mojom/base/unguessable_token.mojom";\nimport "components/services/storage/public/mojom/local_storage_control.mojom";\nimport "third_party/blink/public/mojom/dom_storage/storage_area.mojom";'),
 ('  DrainAuxUiMigration() => (bool file_data_synced);','  DrainAuxUiMigration() => (bool file_data_synced);\n'+methods),
])
for owner,base in [('LocalStorageImpl','local_storage_impl'),('SessionStorageImpl','session_storage_impl')]:
 declarations=''
 for action in ['Begin','Read','Commit','Restore','Release']:
  args='const base::UnguessableToken& request_id, '
  if action in ['Commit','Restore','Release']: args+='const base::UnguessableToken& token, '
  declarations+=f'  void {action}AuxUiPreferenceLease({args}{action}AuxUiPreferenceLeaseCallback callback) override;\n'
 project(f'components/services/storage/dom_storage/{base}.h',[
  ('  void DrainAuxUiMigration(DrainAuxUiMigrationCallback callback) override;',
   '  void DrainAuxUiMigration(DrainAuxUiMigrationCallback callback) override;\n'+declarations),
  (f'  base::WeakPtrFactory<{owner}> weak_ptr_factory_{{this}};',
   f'''  std::optional<base::UnguessableToken> aux_ui_request_;
  std::unique_ptr<AsyncDomStorageDatabase::AuxUiMigrationLease> aux_ui_lease_;

  base::WeakPtrFactory<{owner}> weak_ptr_factory_{{this}};'''),
 ])
 definitions=(HERE/'service-definitions.inc').read_text().replace('OWNER',owner).replace('LIVE_OWNERS', '!areas_.empty()' if owner=='LocalStorageImpl' else '!data_maps_.empty() || !namespaces_.empty()')
 service_edits=[(f'void {owner}::DrainAuxUiMigration(', definitions.rstrip()+f'\n\nvoid {owner}::DrainAuxUiMigration(')]
 guards={
  'BindStorageArea':'storage_key, '+('namespace_id, ' if owner=='SessionStorageImpl' else '')+'std::move(receiver)',
  'DeleteStorage':'storage_key, '+('namespace_id, ' if owner=='SessionStorageImpl' else '')+'std::move(callback)',
  'CleanUpStorage':'std::move(callback)', 'Flush':'', 'PurgeMemory':'',
  'PurgeUnusedAreasIfNeeded':'', 'RunWhenConnected':'std::move(callback)',
  'DeleteAndRecreateDatabase':'reason',
 }
 if owner=='LocalStorageImpl':
  guards.update({'ApplyPolicyUpdates':'std::move(policy_updates)',
   'ForceKeepSessionState':'','DeleteStaleStorageAreas':'',
   'OnGotMetaDataToDeleteStaleStorageAreas':'std::move(all_metadata)'})
 else:
  guards.update({'BindNamespace':'namespace_id, std::move(receiver)',
   'CreateNamespace':'namespace_id',
   'CloneNamespace':'clone_from_namespace_id, clone_to_namespace_id, clone_type',
   'DeleteNamespace':'namespace_id, should_persist',
   'ScavengeUnusedNamespaces':'','PurgeAllNamespaceDataMaps':'',
   'DeleteNamespacesFromMetadataAndDatabase':'std::move(namespace_ids)'})
 original=(ROOT/f'components/services/storage/dom_storage/{base}.cc').read_text()
 for method,args in guards.items():
  matches=list(re.finditer(r'void '+owner+r'::'+method+r'\([\s\S]*?\) \{',original))
  assert len(matches)==1,(owner,method,len(matches))
  anchor=matches[0].group()
  tail=(', '+args) if args else ''
  addition=f"\n  if (database_ && database_->IsAuxUiMigrationHeld()) {{\n    database_->DeferForAuxUiMigration(base::BindOnce(&{owner}::{method},\n        weak_ptr_factory_.GetWeakPtr(){tail}));\n    return;\n  }}"
  service_edits.append((anchor,anchor+addition))
 project(f'components/services/storage/dom_storage/{base}.cc',service_edits)
facts=[]
for path,needles in {
 'components/services/storage/dom_storage/dom_storage_database.h':[
  '  virtual DbStatus UpdateMaps(std::vector<MapBatchUpdate> map_updates) = 0;',
  '  virtual StatusOr<Metadata> ReadAllMetadata() = 0;'],
 'components/services/storage/dom_storage/leveldb/local_storage_leveldb.cc':[
  'DbStatus LocalStorageLevelDB::UpdateMaps(', '  return leveldb_batch->Commit();'],
 'components/services/storage/dom_storage/leveldb/session_storage_leveldb.cc':[
  'DbStatus SessionStorageLevelDB::UpdateMaps('],
 'components/services/storage/dom_storage/sqlite/local_storage_sqlite.cc':[
  'DbStatus LocalStorageSqlite::UpdateMaps('],
 'components/services/storage/dom_storage/sqlite/session_storage_sqlite.cc':[
  'DbStatus SessionStorageSqlite::UpdateMaps('],
 'third_party/blink/renderer/modules/storage/cached_storage_area.cc':[
  'enum class StorageFormat : uint8_t { UTF16 = 0, Latin1 = 1 };',
  'CachedStorageArea::FormatOption CachedStorageArea::GetValueFormat() const {'],
}.items():
 data=(ROOT/path).read_bytes();text=data.decode();anchors=[]
 for needle in needles:
  assert text.count(needle)>=1,(path,needle)
  anchors.append({'find':needle,'count':text.count(needle)})
 facts.append({'path':path,'sha256':sha(data),'anchors':anchors})
result={'format' :'aux.native-dom-transaction-lease.source.v1','nativeRoot':str(ROOT),'files':files,'consumedNativeBackend':facts,
 'nativeCheckoutChanged':False,'nativeCompiled':False,'productExecuted':False,
 'loadedCacheCoherenceImplemented':False,'rendererTargetImportImplemented':False,
 'directoryDurabilityProven':False,'crossStoreRecoveryImplemented':False,'activationAuthorized':False}
(HERE/'source-plan.json').write_text(json.dumps(result,indent=2)+'\n')
(HERE/'native.patch').write_text(''.join(patch))
print(json.dumps({'files':len(files),'countedAnchors':sum(len(row['anchors']) for row in files)}))
