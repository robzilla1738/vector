// Copyright 2016 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "components/services/storage/dom_storage/storage_area_impl.h"
#include "mojo/public/cpp/bindings/callback_helpers.h"

#include <memory>

#include "base/functional/bind.h"
#include "base/logging.h"
#include "base/metrics/histogram_functions.h"
#include "base/task/single_thread_task_runner.h"
#include "base/trace_event/memory_dump_manager.h"
#include "base/trace_event/process_memory_dump.h"
#include "third_party/abseil-cpp/absl/strings/str_format.h"

namespace storage {

StorageAreaImpl::Delegate::~Delegate() = default;

std::optional<DomStorageDatabase::MapBatchUpdate::Usage>
StorageAreaImpl::Delegate::GetMapUsageMetadataToCommit() {
  return std::nullopt;
}

void StorageAreaImpl::Delegate::OnMapLoaded() {}

bool StorageAreaImpl::s_aggressive_flushing_enabled_ = false;

StorageAreaImpl::RateLimiter::RateLimiter(size_t desired_rate,
                                          base::TimeDelta time_quantum)
    : rate_(desired_rate), samples_(0), time_quantum_(time_quantum) {
  DCHECK_GT(desired_rate, 0ul);
}

base::TimeDelta StorageAreaImpl::RateLimiter::ComputeTimeNeeded() const {
  return time_quantum_ * (samples_ / rate_);
}

base::TimeDelta StorageAreaImpl::RateLimiter::ComputeDelayNeeded(
    const base::TimeDelta elapsed_time) const {
  base::TimeDelta time_needed = ComputeTimeNeeded();
  if (time_needed > elapsed_time)
    return time_needed - elapsed_time;
  return base::TimeDelta();
}

StorageAreaImpl::CommitBatch::CommitBatch() = default;

StorageAreaImpl::CommitBatch::~CommitBatch() = default;

StorageAreaImpl::OnLoadCompleteTask::OnLoadCompleteTask(
    base::OnceClosure callback,
    AccessMode mode)
    : callback(std::move(callback)), mode(mode) {}

StorageAreaImpl::OnLoadCompleteTask::OnLoadCompleteTask(
    OnLoadCompleteTask&& source) = default;

StorageAreaImpl::OnLoadCompleteTask::~OnLoadCompleteTask() = default;

StorageAreaImpl::StorageAreaImpl(
    AsyncDomStorageDatabase* database,
    scoped_refptr<DomStorageDatabase::SharedMapLocator> map_locator,
    Delegate* delegate,
    const Options& options)
    : map_locator_(std::move(map_locator)),
      delegate_(delegate),
      database_(database),
      cache_mode_(database ? options.cache_mode : CacheMode::KEYS_AND_VALUES),
      storage_used_(0),
      max_size_(options.max_size),
      memory_used_(0),
      start_time_(base::TimeTicks::Now()),
      default_commit_delay_(options.default_commit_delay),
      data_rate_limiter_(options.max_bytes_per_hour, base::Hours(1)),
      commit_rate_limiter_(options.max_commits_per_hour, base::Hours(1)) {
  if (database_) {
    database_->AddCommitter(this);
  }
  receivers_.set_disconnect_handler(base::BindRepeating(
      &StorageAreaImpl::OnConnectionError, weak_ptr_factory_.GetWeakPtr()));
}

StorageAreaImpl::~StorageAreaImpl() {
  // For local storage, the map ID is unknown where `database_` must use the
  // area's storage key to look up the map ID.
  bool is_session_storage = map_locator_->map_id().has_value();

  // Record data loss, which happens when this storage area destructs before
  // persisting changes to `database_`.
  //
  // TODO(crbug.com/503422295): Monitor this histogram and if dropping changes
  // is common then handle that here.
  std::string histogram_name =
      absl::StrFormat("Storage.%s.ShutdownDroppedChanges",
                      is_session_storage ? "SessionStorage" : "LocalStorage");
  base::UmaHistogramBoolean(histogram_name,
                            has_pending_load_read_write_tasks());

  CommitChanges();
  if (database_) {
    database_->RemoveCommitter(this);
  }
}

void StorageAreaImpl::AddAuxUiCacheCohort(AuxUiCacheCohort* cohort) {
  CHECK(cohort); CHECK(aux_cache_participants_.insert(cohort).second);
  if (database_) database_->NotifyAuxUiMigrationRegistryChanged();
}
void StorageAreaImpl::RemoveAuxUiCacheCohort(AuxUiCacheCohort* cohort) {
  CHECK_EQ(aux_cache_participants_.erase(cohort), 1u);
  if (database_) database_->NotifyAuxUiMigrationRegistryChanged();
}
bool StorageAreaImpl::CanHoldAuxUiMigration(AsyncDomStorageDatabase* owner) const {
  if (database_ != owner || !database_ || has_pending_load_tasks() ||
      map_state_ == MapState::LOADING_FROM_DATABASE || map_state_ == MapState::LOADING_FROM_FORK ||
      aux_cache_cohort_.held() || aux_cache_cohort_.pending() || aux_cache_callback_) return false;
  for (AuxUiCacheCohort* participant : aux_cache_participants_)
    if (!participant || participant->held() || participant->pending()) return false;
  return true;
}
base::WeakPtr<AsyncDomStorageDatabase::Committer> StorageAreaImpl::GetAuxUiMigrationWeakPtr() {
  return weak_ptr_factory_.GetWeakPtr();
}
StatusOr<DomStorageDatabase::MapLocator> StorageAreaImpl::CopyAuxUiMigrationLocator() const {
  if (!database_ || !map_locator_) return base::unexpected(DbStatus::IOError("Actual native map owner missing"));
  return map_locator_->Clone();
}
bool StorageAreaImpl::MatchesAuxUiMigrationMap(
    const AsyncDomStorageDatabase::AuxUiMapSnapshot& map) const {
  if (map.storage_key != map_locator_->storage_key()) return false;
  if (map_locator_->session_ids().empty()) return map.session_ids.empty();
  return map.map_id == map_locator_->map_id();
}
void StorageAreaImpl::PrepareAuxUiMigrationCaches(
    const base::UnguessableToken& request, AsyncDomStorageDatabase::StatusCallback callback) {
  if (aux_cache_callback_ || aux_cache_cohort_.held()) {
    std::move(callback).Run(DbStatus::IOError("Actual cache cohort already retained")); return;
  }
  aux_cache_holds_.clear();
  aux_cache_holds_.push_back(aux_cache_cohort_.GetWeakPtr());
  for (AuxUiCacheCohort* participant : aux_cache_participants_) aux_cache_holds_.push_back(participant->GetWeakPtr());
  aux_cache_request_ = request;
  aux_cache_callback_ = std::move(callback);
  aux_cache_cursor_ = 0;
  aux_cache_prepared_count_ = 0;
  aux_cache_preparing_ = true;
  AuxUiCacheNext(DbStatus::OK());
}
void StorageAreaImpl::RunAuxUiMigrationCaches(
    const base::UnguessableToken& request,
    AsyncDomStorageDatabase::AuxUiCacheOperation operation,
    const AsyncDomStorageDatabase::AuxUiMapSnapshot* map,
    AsyncDomStorageDatabase::StatusCallback callback) {
  if (!aux_cache_request_ && operation == AsyncDomStorageDatabase::AuxUiCacheOperation::kRelease &&
      aux_cache_last_released_ == request) {
    std::move(callback).Run(DbStatus::OK()); return;
  }
  if (aux_cache_callback_ || aux_cache_request_ != request) {
    std::move(callback).Run(DbStatus::IOError("Actual native cache hold unavailable")); return;
  }
  if (operation == AsyncDomStorageDatabase::AuxUiCacheOperation::kStage &&
      (!map || !MatchesAuxUiMigrationMap(*map))) {
    std::move(callback).Run(DbStatus::IOError("Actual native cache map pairing failed")); return;
  }
  aux_cache_operation_ = operation;
  aux_cache_map_ = map ? std::make_unique<AsyncDomStorageDatabase::AuxUiMapSnapshot>(*map) : nullptr;
  aux_cache_callback_ = std::move(callback);
  aux_cache_cursor_ = 0;
  aux_cache_preparing_ = false;
  AuxUiCacheNext(DbStatus::OK());
}
void StorageAreaImpl::AuxUiCacheNext(DbStatus status) {
  const size_t count = !aux_cache_preparing_ &&
      aux_cache_operation_ == AsyncDomStorageDatabase::AuxUiCacheOperation::kRelease ?
      aux_cache_prepared_count_ : aux_cache_holds_.size();
  if (!status.ok() || aux_cache_cursor_ == count) {
    if (status.ok() && !aux_cache_preparing_ &&
        aux_cache_operation_ == AsyncDomStorageDatabase::AuxUiCacheOperation::kRelease) {
      aux_cache_last_released_ = aux_cache_request_;
      aux_cache_holds_.clear(); aux_cache_request_.reset(); aux_cache_map_.reset();
    }
    auto callback = std::move(aux_cache_callback_);
    std::move(callback).Run(std::move(status)); return;
  }
  auto participant = aux_cache_holds_[aux_cache_cursor_++];
  if (!participant) { AuxUiCacheNext(DbStatus::IOError("Actual native cache owner was destroyed")); return; }
  auto reply = mojo::WrapCallbackWithDefaultInvokeIfNotRun(base::BindOnce(
      &StorageAreaImpl::AuxUiCacheNext, weak_ptr_factory_.GetWeakPtr()),
      DbStatus::IOError("Actual native cache acknowledgment was lost"));
  if (aux_cache_preparing_) {
    aux_cache_prepared_count_ = aux_cache_cursor_;
    participant->Prepare(*aux_cache_request_, std::move(reply)); return;
  }
  using Operation = AsyncDomStorageDatabase::AuxUiCacheOperation;
  switch (aux_cache_operation_) {
    case Operation::kRead: participant->Read(std::move(reply)); break;
    case Operation::kValidate: participant->Validate(std::move(reply)); break;
    case Operation::kStage: {
      auto source = AuxUiCacheCohort::DecodeSelected(aux_cache_map_->source, aux_cache_map_->session_ids.empty());
      auto target = AuxUiCacheCohort::DecodeSelected(aux_cache_map_->target, aux_cache_map_->session_ids.empty());
      if (!source.has_value() || !target.has_value()) {
        std::move(reply).Run(DbStatus::NotSupported("Exact native UI byte codec refused")); return;
      }
      participant->Stage(source.value(), target.value(), std::move(reply)); break;
    }
    case Operation::kRecoveryStage: {
      if (!aux_cache_map_) { std::move(reply).Run(DbStatus::IOError("Recorded recovery map missing")); return; }
      auto source = AuxUiCacheCohort::DecodeSelected(aux_cache_map_->source, aux_cache_map_->session_ids.empty());
      auto target = AuxUiCacheCohort::DecodeSelected(aux_cache_map_->target, aux_cache_map_->session_ids.empty());
      if (!source.has_value() || !target.has_value()) {
        std::move(reply).Run(DbStatus::NotSupported("Recovery original codec refused")); return;
      }
      participant->StageRecovery(source.value(), target.value(), std::move(reply)); break;
    }
    case Operation::kRecoveryRestore: participant->RestoreRecovery(std::move(reply)); break;
    case Operation::kPublish: participant->Publish(std::move(reply)); break;
    case Operation::kRestore: participant->Restore(std::move(reply)); break;
    case Operation::kRelease: participant->Release(*aux_cache_request_, std::move(reply)); break;
  }
}
std::vector<AsyncDomStorageDatabase::AuxUiCacheView> StorageAreaImpl::CopyAuxUiMigrationCacheViews() const {
  std::vector<AsyncDomStorageDatabase::AuxUiCacheView> result;
  for (const auto& participant : aux_cache_holds_) {
    if (!participant) continue;
    for (const auto& report : participant->CopyReports()) {
      if (!report || !report->ok || !report->held || report->tainted) continue;
      AsyncDomStorageDatabase::AuxUiCacheView view;
      view.namespace_id = participant->namespace_id(); view.published = report->published;
      view.recovery_prepared = report->recovery_prepared;
      view.recovery_restored = report->recovery_restored;
      for (const auto& source : report->sources)
        view.documents.push_back({source->source_id, source->frame, source->document});
      for (const auto& entry : report->source_entries)
        view.source.emplace(std::u16string(entry->key.begin(), entry->key.end()),
                            std::u16string(entry->value.begin(), entry->value.end()));
      for (const auto& entry : report->staged_entries)
        view.staged.emplace(std::u16string(entry->key.begin(), entry->key.end()),
                            std::u16string(entry->value.begin(), entry->value.end()));
      result.push_back(std::move(view));
    }
  }
  return result;
}
DbStatus StorageAreaImpl::AdoptAuxUiMigrationMap(
    const AsyncDomStorageDatabase::AuxUiMapSnapshot& map, bool target) {
  if (!MatchesAuxUiMigrationMap(map) || has_pending_load_tasks() || commit_batch_ ||
      commit_batches_in_flight_ || !database_ || !database_->IsAuxUiMigrationHeld())
    return DbStatus::IOError("Actual native map cannot adopt a target while work is pending");
  if (map_state_ == MapState::UNLOADED) return DbStatus::OK();
  const bool local = map_locator_->session_ids().empty();
  auto matches = [&](const ValueMap& expected) {
    size_t found = 0;
    if (map_state_ == MapState::LOADED_KEYS_AND_VALUES) {
      for (const auto& [key, value] : keys_values_map_) {
        if (!AuxUiCacheCohort::IsReviewedKey(key, local)) continue;
        auto original = expected.find(key);
        if (original == expected.end() || original->second != value) return false;
        ++found;
      }
    } else if (map_state_ == MapState::LOADED_KEYS_ONLY) {
      for (const auto& [key, size] : keys_only_map_) {
        if (!AuxUiCacheCohort::IsReviewedKey(key, local)) continue;
        auto original = expected.find(key);
        if (original == expected.end() || original->second.size() != size) return false;
        ++found;
      }
    } else { return false; }
    return found == expected.size();
  };
  if (!matches(map.source) && !matches(map.target))
    return DbStatus::IOError("Actual native cache differs from both retained alternatives");
  const auto& desired = target ? map.target : map.source;
  if (map_state_ == MapState::LOADED_KEYS_AND_VALUES) {
    for (const auto& [key, value] : map.source) keys_values_map_.erase(key);
    for (const auto& [key, value] : map.target) keys_values_map_.erase(key);
    keys_values_map_.insert(desired.begin(), desired.end());
  } else {
    for (const auto& [key, value] : map.source) keys_only_map_.erase(key);
    for (const auto& [key, value] : map.target) keys_only_map_.erase(key);
    for (const auto& [key, value] : desired) keys_only_map_[key] = value.size();
  }
  CalculateStorageAndMemoryUsed();
  has_committed_data_ = true;
  // This is adoption after the real DB CAS/sync/readback, not another ordinary
  // write: no commit batch/timer, observer event or success callback is made up.
  return DbStatus::OK();
}

void StorageAreaImpl::InitializeAsEmpty() {
  DCHECK_EQ(map_state_, MapState::UNLOADED);

  map_state_ = MapState::LOADING_FROM_DATABASE;
  if (loading_started_callback_for_testing_) {
    loading_started_callback_for_testing_.Run();
  }
  OnMapLoaded(ValueMap());
}

void StorageAreaImpl::Bind(
    mojo::PendingReceiver<blink::mojom::StorageArea> receiver) {
  if (database_ && database_->IsAuxUiMigrationHeld()) {
    database_->DeferForAuxUiMigration(base::BindOnce(&StorageAreaImpl::Bind,
        weak_ptr_factory_.GetWeakPtr(), std::move(receiver)));
    return;
  }
  receivers_.Add(this, std::move(receiver));
  // If the number of bindings is more than 1, then the |client_old_value| sent
  // by the clients need not be valid due to races on updates from multiple
  // clients. So, cache the values in the service. Setting cache mode back to
  // only keys when the number of bindings goes back to 1 could cause
  // inconsistency due to the async notifications of mutations to the client
  // reaching late.
  if (cache_mode_ == CacheMode::KEYS_ONLY_WHEN_POSSIBLE &&
      receivers_.size() > 1) {
    SetCacheMode(CacheMode::KEYS_AND_VALUES);
  }
}

std::unique_ptr<StorageAreaImpl> StorageAreaImpl::ForkToNewMap(
    scoped_refptr<DomStorageDatabase::SharedMapLocator> new_map_locator,
    Delegate* delegate,
    const Options& options) {
  auto forked_area = std::make_unique<StorageAreaImpl>(
      database_, std::move(new_map_locator), delegate, options);
  // If the source map is empty, don't bother hitting disk.
  if (IsMapLoadedAndEmpty()) {
    forked_area->InitializeAsEmpty();
    return forked_area;
  }
  forked_area->map_state_ = MapState::LOADING_FROM_FORK;

  if (IsMapLoaded()) {
    DoForkOperation(forked_area->weak_ptr_factory_.GetWeakPtr());
  } else {
    LoadMap(OnLoadCompleteTask(
        base::BindOnce(&StorageAreaImpl::DoForkOperation,
                       weak_ptr_factory_.GetWeakPtr(),
                       forked_area->weak_ptr_factory_.GetWeakPtr()),
        AccessMode::ReadWrite));
  }
  return forked_area;
}

bool StorageAreaImpl::has_pending_load_read_write_tasks() const {
  for (const auto& task : on_load_complete_tasks_) {
    if (task.mode == AccessMode::ReadWrite) {
      return true;
    }
  }
  return false;
}

void StorageAreaImpl::EnableAggressiveCommitDelay() {
  s_aggressive_flushing_enabled_ = true;
}

void StorageAreaImpl::ScheduleImmediateCommit() {
  if (has_pending_load_read_write_tasks()) {
    LoadMap(OnLoadCompleteTask(
        base::BindOnce(&StorageAreaImpl::ScheduleImmediateCommit,
                       weak_ptr_factory_.GetWeakPtr()),
        AccessMode::ReadWrite));
    return;
  }

  if (!database_) {
    return;
  }
  CommitChanges();
}

void StorageAreaImpl::OnMemoryDump(const std::string& name,
                                   base::trace_event::ProcessMemoryDump* pmd) {
  if (!IsMapLoaded())
    return;

  const char* system_allocator_name =
      base::trace_event::MemoryDumpManager::GetInstance()
          ->system_allocator_pool_name();
  if (commit_batch_) {
    size_t data_size = 0;
    for (const auto& iter : commit_batch_->changed_values)
      data_size += iter.first.size() + iter.second.size();
    for (const auto& key : commit_batch_->changed_keys)
      data_size += key.size();

    auto* commit_batch_mad = pmd->CreateAllocatorDump(name + "/commit_batch");
    commit_batch_mad->AddScalar(
        base::trace_event::MemoryAllocatorDump::kNameSize,
        base::trace_event::MemoryAllocatorDump::kUnitsBytes, data_size);
    if (system_allocator_name)
      pmd->AddSuballocation(commit_batch_mad->guid(), system_allocator_name);
  }

  // Do not add storage map usage if less than 1KB.
  if (memory_used_ < 1024)
    return;

  auto* map_mad = pmd->CreateAllocatorDump(name + "/storage_map");
  map_mad->AddScalar(base::trace_event::MemoryAllocatorDump::kNameSize,
                     base::trace_event::MemoryAllocatorDump::kUnitsBytes,
                     memory_used_);
  map_mad->AddString("load_state", "",
                     map_state_ == MapState::LOADED_KEYS_ONLY
                         ? "keys_only"
                         : "keys_and_values");
  if (system_allocator_name)
    pmd->AddSuballocation(map_mad->guid(), system_allocator_name);
}

void StorageAreaImpl::PurgeMemory() {
  if (database_ && database_->IsAuxUiMigrationHeld()) {
    database_->DeferForAuxUiMigration(base::BindOnce(&StorageAreaImpl::PurgeMemory,
        weak_ptr_factory_.GetWeakPtr()));
    return;
  }
  if (!IsMapLoaded() ||  // We're not using any memory.
      commit_batch_ ||   // We leave things alone with changes pending.
      !database_) {  // Don't purge anything if we're not backed by a database.
    return;
  }

  map_state_ = MapState::UNLOADED;
  memory_used_ = 0;
  keys_only_map_.clear();
  keys_values_map_.clear();
}

void StorageAreaImpl::SetCacheModeForTesting(CacheMode cache_mode) {
  SetCacheMode(cache_mode);
}

void StorageAreaImpl::SetLoadingStartedCallbackForTesting(
    base::RepeatingClosure callback) {
  loading_started_callback_for_testing_ = callback;
}

void StorageAreaImpl::AddObserver(
    mojo::PendingRemote<blink::mojom::StorageAreaObserver> observer) {
  if (database_ && database_->IsAuxUiMigrationHeld()) {
    database_->DeferForAuxUiMigration(base::BindOnce(&StorageAreaImpl::AddObserver,
        weak_ptr_factory_.GetWeakPtr(), std::move(observer)));
    return;
  }
  mojo::Remote<blink::mojom::StorageAreaObserver> observer_remote(
      std::move(observer));
  if (cache_mode_ == CacheMode::KEYS_AND_VALUES)
    observer_remote->ShouldSendOldValueOnMutations(false);
  observers_.Add(std::move(observer_remote));
}

void StorageAreaImpl::Put(
    const std::vector<uint8_t>& key,
    const std::vector<uint8_t>& value,
    const std::optional<std::vector<uint8_t>>& client_old_value,
    blink::mojom::StorageAreaSourcePtr source,
    PutCallback callback) {
  if (database_ && database_->IsAuxUiMigrationHeld()) {
    database_->DeferForAuxUiMigration(base::BindOnce(&StorageAreaImpl::Put,
        weak_ptr_factory_.GetWeakPtr(), key, value, client_old_value, std::move(source), std::move(callback)));
    return;
  }
  if (!IsMapLoaded() || IsMapUpgradeNeeded()) {
    LoadMap(OnLoadCompleteTask(
        base::BindOnce(&StorageAreaImpl::Put, weak_ptr_factory_.GetWeakPtr(),
                       key, value, client_old_value, std::move(source),
                       std::move(callback)),
        AccessMode::ReadWrite));
    return;
  }

  size_t old_item_size = 0;
  size_t old_item_memory = 0;
  size_t new_item_memory = 0;
  std::optional<std::vector<uint8_t>> old_value;
  if (map_state_ == MapState::LOADED_KEYS_ONLY) {
    KeysOnlyMap::const_iterator found = keys_only_map_.find(key);
    if (found != keys_only_map_.end()) {
      if (client_old_value &&
          client_old_value.value().size() == found->second) {
        if (client_old_value == value) {
          // NOTE: Even though the key is not changing, we have to acknowledge
          // the change request, as clients may rely on this acknowledgement for
          // caching behavior.
          for (const auto& observer : observers_)
            observer->KeyChanged(key, value, value, source.Clone());
          std::move(callback).Run(true);  // Key already has this value.
          return;
        }
        old_value = client_old_value.value();
      } else {
#if DCHECK_IS_ON()
        // If |client_old_value| was not provided or if it's size does not
        // match, then we still let the change go through. But the notification
        // sent to clients will not contain old value. This is okay since
        // currently the only observer to these notification is the client
        // itself.
        DVLOG(1) << "Storage area with MapLocator "
                 << map_locator_->ToDebugString()
                 << ": past value has length of " << found->second << ", but:";
        if (client_old_value) {
          DVLOG(1) << "Given past value has incorrect length of "
                   << client_old_value.value().size();
        } else {
          DVLOG(1) << "No given past value was provided.";
        }
#endif
      }
      old_item_size = key.size() + found->second;
      old_item_memory = key.size() + sizeof(size_t);
    }
    new_item_memory = key.size() + sizeof(size_t);
  } else {
    DCHECK_EQ(map_state_, MapState::LOADED_KEYS_AND_VALUES);
    auto found = keys_values_map_.find(key);
    if (found != keys_values_map_.end()) {
      if (found->second == value) {
        // NOTE: Even though the key is not changing, we have to acknowledge
        // the change request, as clients may rely on this acknowledgement for
        // caching behavior.
        for (const auto& observer : observers_)
          observer->KeyChanged(key, value, value, source.Clone());
        std::move(callback).Run(true);  // Key already has this value.
        return;
      }
      old_value = std::move(found->second);
      old_item_size = key.size() + old_value.value().size();
      old_item_memory = old_item_size;
    }
    new_item_memory = key.size() + value.size();
  }

  size_t new_item_size = key.size() + value.size();
  size_t new_storage_used = storage_used_ - old_item_size + new_item_size;

  // Only check quota if the size is increasing, this allows
  // shrinking changes to pre-existing maps that are over budget.
  if (new_item_size > old_item_size && new_storage_used > max_size_) {
    if (map_state_ == MapState::LOADED_KEYS_ONLY) {
      receivers_.ReportBadMessage(
          "The quota in browser cannot exceed when there is only one "
          "renderer.");
    } else {
      for (const auto& observer : observers_)
        observer->KeyChangeFailed(key, source.Clone());
      std::move(callback).Run(false);
    }
    return;
  }

  if (database_) {
    CreateCommitBatchIfNeeded();
    // No need to store values in |commit_batch_| if values are already
    // available in |keys_values_map_|, since CommitChanges() will take values
    // from there.
    if (map_state_ == MapState::LOADED_KEYS_ONLY)
      commit_batch_->changed_values[key] = value;
    else
      commit_batch_->changed_keys.insert(key);
  }

  if (map_state_ == MapState::LOADED_KEYS_ONLY)
    keys_only_map_[key] = value.size();
  else
    keys_values_map_[key] = value;

  storage_used_ = new_storage_used;
  memory_used_ += new_item_memory - old_item_memory;
  for (const auto& observer : observers_)
    observer->KeyChanged(key, value, old_value, source.Clone());
  std::move(callback).Run(true);
}

void StorageAreaImpl::Delete(
    const std::vector<uint8_t>& key,
    const std::optional<std::vector<uint8_t>>& client_old_value,
    blink::mojom::StorageAreaSourcePtr source,
    DeleteCallback callback) {
  if (database_ && database_->IsAuxUiMigrationHeld()) {
    database_->DeferForAuxUiMigration(base::BindOnce(&StorageAreaImpl::Delete,
        weak_ptr_factory_.GetWeakPtr(), key, client_old_value, std::move(source), std::move(callback)));
    return;
  }
  // Map upgrade check is required because the cache state could be changed
  // due to multiple bindings, and when multiple bindings are involved the
  // |client_old_value| can race. Thus any changes require checking for an
  // upgrade.
  if (!IsMapLoaded() || IsMapUpgradeNeeded()) {
    LoadMap(OnLoadCompleteTask(
        base::BindOnce(&StorageAreaImpl::Delete, weak_ptr_factory_.GetWeakPtr(),
                       key, client_old_value, std::move(source),
                       std::move(callback)),
        AccessMode::ReadWrite));
    return;
  }

  if (database_)
    CreateCommitBatchIfNeeded();

  std::vector<uint8_t> old_value;
  if (map_state_ == MapState::LOADED_KEYS_ONLY) {
    KeysOnlyMap::const_iterator found = keys_only_map_.find(key);
    if (found == keys_only_map_.end()) {
      // NOTE: Even though the key is not changing, we have to acknowledge
      // the change request, as clients may rely on this acknowledgement for
      // caching behavior.
      for (const auto& observer : observers_)
        observer->KeyDeleted(key, std::nullopt, source.Clone());
      std::move(callback).Run();
      return;
    }
    if (client_old_value && client_old_value.value().size() == found->second) {
      old_value = client_old_value.value();
    } else {
#if DCHECK_IS_ON()
      // If |client_old_value| was not provided or if it's size does not match,
      // then we still let the change go through. But the notification sent to
      // clients will not contain old value. This is okay since currently the
      // only observer to these notification is the client itself.
      DVLOG(1) << "Storage area with map locator "
               << map_locator_->ToDebugString() << ": past value has length of "
               << found->second << ", but:";
      if (client_old_value) {
        DVLOG(1) << "Given past value has incorrect length of "
                 << client_old_value.value().size();
      } else {
        DVLOG(1) << "No given past value was provided.";
      }
#endif
    }
    storage_used_ -= key.size() + found->second;
    keys_only_map_.erase(found);
    memory_used_ -= key.size() + sizeof(size_t);
    if (commit_batch_)
      commit_batch_->changed_values[key] = std::vector<uint8_t>();
  } else {
    DCHECK_EQ(map_state_, MapState::LOADED_KEYS_AND_VALUES);
    auto found = keys_values_map_.find(key);
    if (found == keys_values_map_.end()) {
      // NOTE: Even though the key is not changing, we have to acknowledge
      // the change request, as clients may rely on this acknowledgement for
      // caching behavior.
      for (const auto& observer : observers_)
        observer->KeyDeleted(key, std::nullopt, source.Clone());
      std::move(callback).Run();
      return;
    }
    old_value.swap(found->second);
    keys_values_map_.erase(found);
    memory_used_ -= key.size() + old_value.size();
    storage_used_ -= key.size() + old_value.size();
    if (commit_batch_)
      commit_batch_->changed_keys.insert(key);
  }

  for (auto& observer : observers_)
    observer->KeyDeleted(key, old_value, source.Clone());
  std::move(callback).Run();
}

void StorageAreaImpl::DeleteAll(
    blink::mojom::StorageAreaSourcePtr source,
    mojo::PendingRemote<blink::mojom::StorageAreaObserver> new_observer,
    DeleteAllCallback callback) {
  if (database_ && database_->IsAuxUiMigrationHeld()) {
    database_->DeferForAuxUiMigration(base::BindOnce(&StorageAreaImpl::DeleteAll,
        weak_ptr_factory_.GetWeakPtr(), std::move(source), std::move(new_observer), std::move(callback)));
    return;
  }
  // Don't check if a map upgrade is needed here and instead just create an
  // empty map ourself.
  if (!IsMapLoaded()) {
    LoadMap(OnLoadCompleteTask(
        base::BindOnce(&StorageAreaImpl::DeleteAll,
                       weak_ptr_factory_.GetWeakPtr(), std::move(source),
                       std::move(new_observer), std::move(callback)),
        AccessMode::ReadWrite));
    return;
  }

  bool already_empty = IsMapLoadedAndEmpty();

  // Upgrade map state if needed.
  if (IsMapUpgradeNeeded()) {
    DCHECK(keys_values_map_.empty());
    map_state_ = MapState::LOADED_KEYS_AND_VALUES;
  }

  if (new_observer)
    AddObserver(std::move(new_observer));

  if (already_empty) {
    for (const auto& observer : observers_)
      observer->AllDeleted(/*was_nonempty=*/false, source.Clone());
    std::move(callback).Run();
    return;
  }

  if (database_) {
    CreateCommitBatchIfNeeded();
    commit_batch_->clear_all_first = true;
    commit_batch_->changed_values.clear();
    commit_batch_->changed_keys.clear();
  }

  keys_only_map_.clear();
  keys_values_map_.clear();

  storage_used_ = 0;
  memory_used_ = 0;
  for (const auto& observer : observers_)
    observer->AllDeleted(/*was_nonempty=*/true, source.Clone());
  std::move(callback).Run();
}

void StorageAreaImpl::GetAll(
    mojo::PendingRemote<blink::mojom::StorageAreaObserver> new_observer,
    GetAllCallback callback) {
  if (database_ && database_->IsAuxUiMigrationHeld()) {
    database_->DeferForAuxUiMigration(base::BindOnce(&StorageAreaImpl::GetAll,
        weak_ptr_factory_.GetWeakPtr(), std::move(new_observer), std::move(callback)));
    return;
  }
  // If the map is keys-only and empty, then no loading is necessary.
  if (IsMapLoadedAndEmpty()) {
    std::move(callback).Run(std::vector<blink::mojom::KeyValuePtr>());
    if (new_observer)
      AddObserver(std::move(new_observer));
    return;
  }

  // The map must always be loaded for the KEYS_ONLY_WHEN_POSSIBLE mode.
  if (map_state_ != MapState::LOADED_KEYS_AND_VALUES) {
    LoadMap(OnLoadCompleteTask(
        base::BindOnce(&StorageAreaImpl::GetAll, weak_ptr_factory_.GetWeakPtr(),
                       std::move(new_observer), std::move(callback)),
        AccessMode::ReadOnly));
    return;
  }

  std::vector<blink::mojom::KeyValuePtr> all;
  for (const auto& it : keys_values_map_) {
    auto kv = blink::mojom::KeyValue::New();
    kv->key = it.first;
    kv->value = it.second;
    all.push_back(std::move(kv));
  }
  std::move(callback).Run(std::move(all));
  if (new_observer)
    AddObserver(std::move(new_observer));
}

base::OnceCallback<void(DbStatus)>
StorageAreaImpl::GetCommitCompleteCallback() {
  return base::BindOnce(&StorageAreaImpl::OnCommitComplete,
                        weak_ptr_factory_.GetWeakPtr());
}

void StorageAreaImpl::SetCacheMode(CacheMode cache_mode) {
  if (cache_mode_ == cache_mode ||
      (!database_ && cache_mode == CacheMode::KEYS_ONLY_WHEN_POSSIBLE)) {
    return;
  }
  cache_mode_ = cache_mode;
  bool should_send_values = cache_mode == CacheMode::KEYS_ONLY_WHEN_POSSIBLE;
  for (auto& observer : observers_)
    observer->ShouldSendOldValueOnMutations(should_send_values);

  // If the |keys_only_map_| is loaded and desired state needs values, no point
  // keeping around the map since the next change would require reload. On the
  // other hand if only keys are desired, the keys and values map can still be
  // used. Consider not unloading when the map is still useful.
  UnloadMapIfPossible();
}

void StorageAreaImpl::OnConnectionError() {
  if (!receivers_.empty() || aux_cache_cohort_.has_frozen_bindings())
    return;
  // If any tasks are waiting for load to complete, delay calling the
  // no_bindings_callback_ until all those tasks have completed.
  if (!on_load_complete_tasks_.empty())
    return;
  delegate_->OnNoBindings();
}

void StorageAreaImpl::LoadMap(OnLoadCompleteTask completion_task) {
  DCHECK_NE(map_state_, MapState::LOADED_KEYS_AND_VALUES);
  DCHECK(keys_values_map_.empty());

  // Current commit batch needs to be applied before re-loading the map. The
  // re-load of map occurs only when GetAll() is called or CacheMode is set to
  // keys and values, and the |keys_only_map_| is already loaded. In this case
  // commit batch needs to be committed before reading the database.
  if (map_state_ == MapState::LOADED_KEYS_ONLY) {
    DCHECK(on_load_complete_tasks_.empty());
    DCHECK(database_);
    CommitChanges();
    // Make sure the keys only map is not used when on load tasks are in queue.
    // The changes to the area will be queued to on load tasks.
    keys_only_map_.clear();
    map_state_ = MapState::UNLOADED;
  }

  on_load_complete_tasks_.push_back(std::move(completion_task));
  if (map_state_ == MapState::LOADING_FROM_DATABASE ||
      map_state_ == MapState::LOADING_FROM_FORK) {
    return;
  }

  map_state_ = MapState::LOADING_FROM_DATABASE;
  if (loading_started_callback_for_testing_) {
    loading_started_callback_for_testing_.Run();
  }

  if (!database_) {
    OnMapLoaded(
        base::unexpected(DbStatus::IOError("Database no longer valid.")));
    return;
  }

  database_->ReadMapKeyValues(map_locator_->Clone(),
                              base::BindOnce(&StorageAreaImpl::OnMapLoaded,
                                             weak_ptr_factory_.GetWeakPtr()));
}

void StorageAreaImpl::OnMapLoaded(StatusOr<ValueMap> map_from_database) {
  CHECK(keys_values_map_.empty());
  CHECK_EQ(map_state_, MapState::LOADING_FROM_DATABASE);

  keys_only_map_.clear();
  map_state_ = MapState::LOADED_KEYS_AND_VALUES;

  keys_values_map_.clear();
  if (map_from_database.has_value()) {
    keys_values_map_ = *std::move(map_from_database);
  } else {
    // We proceed without using a backing store, nothing will be persisted but
    // the class is functional for the lifetime of the object.
    if (database_) {
      database_->RemoveCommitter(this);
      database_ = nullptr;
    }
    SetCacheMode(CacheMode::KEYS_AND_VALUES);
  }
  CalculateStorageAndMemoryUsed();
  delegate_->OnMapLoaded();
  OnLoadComplete();
}

void StorageAreaImpl::CalculateStorageAndMemoryUsed() {
  memory_used_ = 0;
  storage_used_ = 0;

  for (auto& it : keys_values_map_)
    memory_used_ += it.first.size() + it.second.size();
  storage_used_ = memory_used_;

  for (auto& it : keys_only_map_) {
    memory_used_ += it.first.size() + sizeof(size_t);
    storage_used_ += it.first.size() + it.second;
  }
}

void StorageAreaImpl::OnLoadComplete() {
  DCHECK(IsMapLoaded());

  std::vector<OnLoadCompleteTask> tasks;
  on_load_complete_tasks_.swap(tasks);
  for (auto it = tasks.begin(); it != tasks.end(); ++it) {
    // Some tasks (like GetAll) can require a reload if they need a different
    // map type. If this happens, stop our task execution. Appending tasks is
    // required (instead of replacing) because the task that required the
    // reload-requesting-task put itself on the task queue and it still needs
    // to be executed before the rest of the tasks.
    if (!IsMapLoaded()) {
      on_load_complete_tasks_.reserve(on_load_complete_tasks_.size() +
                                      (tasks.end() - it));
      std::move(it, tasks.end(), std::back_inserter(on_load_complete_tasks_));
      return;
    }
    std::move(it->callback).Run();
  }

  // Call before |OnNoBindings| as delegate can destroy this object.
  UnloadMapIfPossible();

  // We might need to call the no_bindings_callback_ here if bindings became
  // empty while waiting for load to complete.
  if (receivers_.empty() && !aux_cache_cohort_.has_frozen_bindings())
    delegate_->OnNoBindings();
}

void StorageAreaImpl::CreateCommitBatchIfNeeded() {
  if (commit_batch_)
    return;
  DCHECK(database_);

  commit_batch_ = std::make_unique<CommitBatch>();
  StartCommitTimer();
}

void StorageAreaImpl::StartCommitTimer() {
  if (!commit_batch_)
    return;

  // Start a timer to commit any changes that accrue in the batch, but only if
  // no commits are currently in flight. In that case the timer will be
  // started after the commits have happened.
  if (commit_batches_in_flight_)
    return;

  base::SingleThreadTaskRunner::GetCurrentDefault()->PostDelayedTask(
      FROM_HERE,
      base::BindOnce(&StorageAreaImpl::CommitChanges,
                     weak_ptr_factory_.GetWeakPtr()),
      ComputeCommitDelay());
}

base::TimeDelta StorageAreaImpl::ComputeCommitDelay() const {
  if (s_aggressive_flushing_enabled_)
    return base::Seconds(1);

  base::TimeDelta elapsed_time = base::TimeTicks::Now() - start_time_;
  base::TimeDelta delay =
      std::max(default_commit_delay_,
               std::max(commit_rate_limiter_.ComputeDelayNeeded(elapsed_time),
                        data_rate_limiter_.ComputeDelayNeeded(elapsed_time)));
  // TODO(mek): Rename histogram to match class name, or eliminate histogram
  // entirely.
  base::UmaHistogramLongTimes("LevelDBWrapper.CommitDelay", delay);
  return delay;
}

void StorageAreaImpl::CommitChanges() {
  // Note: commit_batch_ may be null if ScheduleImmediateCommit was called
  // after a delayed commit task was scheduled.
  if (!commit_batch_) {
    return;
  }

  database_->InitiateCommit();
}

std::optional<DomStorageDatabase::MapBatchUpdate>
StorageAreaImpl::CollectCommit() {
  if (!commit_batch_) {
    return std::nullopt;
  }

  DCHECK(database_);
  DCHECK(IsMapLoaded()) << static_cast<int>(map_state_);

  commit_rate_limiter_.add_samples(1);

  // Commit all our changes in a single batch.
  DomStorageDatabase::MapBatchUpdate commit(map_locator_->Clone());
  commit.clear_all_first = commit_batch_->clear_all_first;
  commit.map_usage = delegate_->GetMapUsageMetadataToCommit();

  size_t data_size = 0;
  if (map_state_ == MapState::LOADED_KEYS_AND_VALUES) {
    DCHECK(commit_batch_->changed_values.empty())
        << "Map state and commit state out of sync.";
    for (const auto& key : commit_batch_->changed_keys) {
      data_size += key.size();

      auto it = keys_values_map_.find(key);
      if (it != keys_values_map_.end()) {
        data_size += it->second.size();
        commit.entries_to_add.emplace_back(std::move(key), it->second);
      } else {
        commit.keys_to_delete.push_back(std::move(key));
      }
    }
  } else {
    DCHECK(commit_batch_->changed_keys.empty())
        << "Map state and commit state out of sync.";
    DCHECK_EQ(map_state_, MapState::LOADED_KEYS_ONLY);
    for (auto& entry : commit_batch_->changed_values) {
      const auto& key = entry.first;
      data_size += key.size();

      auto it = keys_only_map_.find(key);
      if (it != keys_only_map_.end()) {
        data_size += entry.second.size();
        commit.entries_to_add.emplace_back(std::move(key),
                                           std::move(entry.second));
      } else {
        commit.keys_to_delete.push_back(std::move(key));
      }
    }
  }

  data_rate_limiter_.add_samples(data_size);

  ++commit_batches_in_flight_;
  commit_batch_.reset();
  return commit;
}

void StorageAreaImpl::OnCommitComplete(DbStatus status) {
  has_committed_data_ = true;
  --commit_batches_in_flight_;
  StartCommitTimer();

  if (!status.ok()) {
    SetCacheMode(CacheMode::KEYS_AND_VALUES);
  }

  // Call before |DidCommit| as delegate can destroy this object.
  UnloadMapIfPossible();

  delegate_->DidCommit(status);
}

void StorageAreaImpl::UnloadMapIfPossible() {
  // Do not unload the map if:
  // * The desired cache mode isn't key-only,
  // * The map isn't a loaded key-value map,
  // * There are pending tasks waiting on the key-value map being loaded, or
  // * There is no database connection.
  // * We have commit batches in-flight.
  // * We haven't committed data yet.
  if (cache_mode_ != CacheMode::KEYS_ONLY_WHEN_POSSIBLE ||
      map_state_ != MapState::LOADED_KEYS_AND_VALUES ||
      has_pending_load_tasks() || !database_ || commit_batches_in_flight_ > 0 ||
      !has_committed_data_) {
    return;
  }

  keys_only_map_.clear();
  memory_used_ = 0;
  for (auto& it : keys_values_map_) {
    keys_only_map_.insert(std::make_pair(it.first, it.second.size()));
  }
  if (commit_batch_) {
    for (const auto& key : commit_batch_->changed_keys) {
      auto value_it = keys_values_map_.find(key);
      commit_batch_->changed_values[key] = value_it == keys_values_map_.end()
                                               ? std::vector<uint8_t>()
                                               : std::move(value_it->second);
    }
    commit_batch_->changed_keys.clear();
  }

  keys_values_map_.clear();
  map_state_ = MapState::LOADED_KEYS_ONLY;

  CalculateStorageAndMemoryUsed();
}

void StorageAreaImpl::DoForkOperation(
    const base::WeakPtr<StorageAreaImpl>& forked_area) {
  if (!forked_area)
    return;

  DCHECK(IsMapLoaded());
  // TODO(dmurph): If these commits fails, then the disk could be in an
  // inconsistant state. Ideally all further operations will fail and the code
  // will correctly delete the database?
  if (database_) {
    // All changes must be stored in the database before the copy operation.
    CommitChanges();

    // Commit the forked map to the database, which copies the source map's
    // key/value pairs.
    ++commit_batches_in_flight_;
    database_->CloneMap(/*source=*/map_locator_->Clone(),
                        /*target=*/forked_area->map_locator_->Clone(),
                        GetCommitCompleteCallback());
  }

  forked_area->OnForkStateLoaded(database_ != nullptr, keys_values_map_,
                                 keys_only_map_);
}

void StorageAreaImpl::OnForkStateLoaded(bool database_enabled,
                                        const ValueMap& value_map,
                                        const KeysOnlyMap& keys_only_map) {
  // This callback can get either the value map or the key only map depending
  // on parent operations and other things. So handle both.
  if (!value_map.empty() || keys_only_map.empty()) {
    keys_values_map_ = value_map;
    map_state_ = MapState::LOADED_KEYS_AND_VALUES;
  } else {
    keys_only_map_ = keys_only_map;
    map_state_ = MapState::LOADED_KEYS_ONLY;
  }

  if (!database_enabled) {
    if (database_) {
      database_->RemoveCommitter(this);
    }
    database_ = nullptr;
    cache_mode_ = CacheMode::KEYS_AND_VALUES;
  }

  CalculateStorageAndMemoryUsed();
  OnLoadComplete();
}

}  // namespace storage
