"""Actual native cache/factory binding overlays; no shared tree writes."""
import re
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
ROWS=[]
def emit(path,edits):
 s=(ROOT/path).read_text()
 for before,after in edits:
  assert s.count(before)==1,(path,before[:120],s.count(before))
  s=s.replace(before,after)
 p=HERE/'source'/path;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(s)
 ROWS.append((path,edits))
path='components/services/storage/dom_storage/storage_area_impl.h'
emit(path,[
 ('#include <optional>','#include <optional>\n#include <set>'),
 ('#include "components/services/storage/dom_storage/async_dom_storage_database.h"','#include "components/services/storage/dom_storage/async_dom_storage_database.h"\n#include "components/services/storage/dom_storage/aux_ui_cache_cohort.h"'),
 ('  // Committer:\n', (HERE/'native-area-declarations.inc').read_text().rstrip()+'\n\n  // Committer:\n'),
 ('  friend class StorageAreaImplTestBase;', '''  void AuxUiCacheNext(DbStatus status);
  friend class StorageAreaImplTestBase;'''),
 ('  base::WeakPtrFactory<StorageAreaImpl> weak_ptr_factory_{this};','''  AuxUiCacheCohort aux_cache_cohort_{*this, observers_, receivers_,
      map_locator_->storage_key(), std::string()};
  std::set<raw_ptr<AuxUiCacheCohort>> aux_cache_participants_;
  std::vector<base::WeakPtr<AuxUiCacheCohort>> aux_cache_holds_;
  std::optional<base::UnguessableToken> aux_cache_request_;
  std::optional<base::UnguessableToken> aux_cache_last_released_;
  AsyncDomStorageDatabase::StatusCallback aux_cache_callback_;
  AsyncDomStorageDatabase::AuxUiCacheOperation aux_cache_operation_ =
      AsyncDomStorageDatabase::AuxUiCacheOperation::kRead;
  std::unique_ptr<AsyncDomStorageDatabase::AuxUiMapSnapshot> aux_cache_map_;
  size_t aux_cache_cursor_ = 0;
  size_t aux_cache_prepared_count_ = 0;
  bool aux_cache_preparing_ = false;
  base::WeakPtrFactory<StorageAreaImpl> weak_ptr_factory_{this};'''),
])
path='components/services/storage/dom_storage/storage_area_impl.cc'
s=(ROOT/path).read_text();edits=[
 ('#include "components/services/storage/dom_storage/storage_area_impl.h"','#include "components/services/storage/dom_storage/storage_area_impl.h"\n#include "mojo/public/cpp/bindings/callback_helpers.h"'),
 ('void StorageAreaImpl::InitializeAsEmpty() {',(HERE/'native-area-definitions.inc').read_text().rstrip()+'\n\nvoid StorageAreaImpl::InitializeAsEmpty() {'),
 ('  if (!receivers_.empty())\n    return;','  if (!receivers_.empty() || aux_cache_cohort_.has_frozen_bindings())\n    return;'),
 ('  if (receivers_.empty())\n    delegate_->OnNoBindings();','  if (receivers_.empty() && !aux_cache_cohort_.has_frozen_bindings())\n    delegate_->OnNoBindings();'),
]
# Manual native producers cannot bypass the paused actual receiver transport.
for method,args in {
 'Bind':'std::move(receiver)', 'PurgeMemory':'', 'AddObserver':'std::move(observer)',
 'Put':'key, value, client_old_value, std::move(source), std::move(callback)',
 'Delete':'key, client_old_value, std::move(source), std::move(callback)',
 'DeleteAll':'std::move(source), std::move(new_observer), std::move(callback)',
 'GetAll':'std::move(new_observer), std::move(callback)',
}.items():
 matches=list(re.finditer(r'void StorageAreaImpl::'+method+r'\([\s\S]*?\) \{',s));assert len(matches)==1,method
 anchor=matches[0].group();tail=(', '+args) if args else ''
 edits.append((anchor,anchor+f'''
  if (database_ && database_->IsAuxUiMigrationHeld()) {{
    database_->DeferForAuxUiMigration(base::BindOnce(&StorageAreaImpl::{method},
        weak_ptr_factory_.GetWeakPtr(){tail}));
    return;
  }}'''))
emit(path,edits)
path='components/services/storage/dom_storage/session_storage_area_impl.h'
emit(path,[
 ('#include "components/services/storage/dom_storage/session_storage_metadata.h"','#include "components/services/storage/dom_storage/session_storage_metadata.h"\n#include "components/services/storage/dom_storage/aux_ui_cache_cohort.h"'),
 ('  base::WeakPtrFactory<SessionStorageAreaImpl> weak_ptr_factory_{this};','''  AuxUiCacheCohort aux_cache_cohort_{*this, observers_, receivers_, storage_key_, namespace_id_};
  base::WeakPtrFactory<SessionStorageAreaImpl> weak_ptr_factory_{this};'''),
])
path='components/services/storage/dom_storage/session_storage_area_impl.cc'
s=(ROOT/path).read_text();edits=[
 ('#include "components/services/storage/dom_storage/session_storage_data_map.h"','#include "components/services/storage/dom_storage/session_storage_data_map.h"\n#include "components/services/storage/dom_storage/storage_area_impl.h"'),
 ('  receivers_.set_disconnect_handler(base::BindRepeating(','  shared_data_map_->storage_area()->AddAuxUiCacheCohort(&aux_cache_cohort_);\n  receivers_.set_disconnect_handler(base::BindRepeating('),
 ('SessionStorageAreaImpl::~SessionStorageAreaImpl() {','SessionStorageAreaImpl::~SessionStorageAreaImpl() {\n  shared_data_map_->storage_area()->RemoveAuxUiCacheCohort(&aux_cache_cohort_);'),
 ('  return !receivers_.empty();','  return !receivers_.empty() || aux_cache_cohort_.has_frozen_bindings();'),
 ('void SessionStorageAreaImpl::CreateNewMap(NewMapType map_type) {','''void SessionStorageAreaImpl::CreateNewMap(NewMapType map_type) {
  shared_data_map_->storage_area()->RemoveAuxUiCacheCohort(&aux_cache_cohort_);'''),
]
# Reattach to the real newly forked data map only after the original COW
# operation, before its regular observer/binding continuation.
anchor='  if (bound)\n    shared_data_map_->AddBindingReference();'
assert s.count(anchor)==1
edits.append((anchor,'  shared_data_map_->storage_area()->AddAuxUiCacheCohort(&aux_cache_cohort_);\n'+anchor))
for method,args in {
 'Bind':'std::move(receiver)', 'AddObserver':'std::move(observer)',
 'Put':'key, value, client_old_value, std::move(source), std::move(callback)',
 'Delete':'key, client_old_value, std::move(source), std::move(callback)',
 'DeleteAll':'std::move(source), std::move(new_observer), std::move(callback)',
 'GetAll':'std::move(new_observer), std::move(callback)',
 'NotifyObserversAllDeleted':'',
}.items():
 matches=list(re.finditer(r'void SessionStorageAreaImpl::'+method+r'\([\s\S]*?\) \{',s));assert len(matches)==1,method
 anchor=matches[0].group();tail=(', '+args) if args else ''
 edits.append((anchor,anchor+f'''
  auto* actual_database = shared_data_map_->storage_area()->database();
  if (actual_database && actual_database->IsAuxUiMigrationHeld()) {{
    actual_database->DeferForAuxUiMigration(base::BindOnce(&SessionStorageAreaImpl::{method},
        weak_ptr_factory_.GetWeakPtr(){tail}));
    return;
  }}'''))
emit(path,edits)
print('materialized 4 actual native actor files')
