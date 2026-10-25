// Copyright 2016 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "components/services/storage/dom_storage/local_storage_impl.h"

#include <inttypes.h>

#include <algorithm>
#include <optional>
#include <set>
#include <string>
#include <string_view>
#include <utility>
#include <limits>

#include "base/byte_size.h"
#include "base/files/file_path.h"
#include "base/functional/bind.h"
#include "base/memory/raw_ptr.h"
#include "base/metrics/histogram_functions.h"
#include "base/strings/strcat.h"
#include "base/strings/string_number_conversions.h"
#include "base/strings/stringprintf.h"
#include "base/system/sys_info.h"
#include "base/task/thread_pool.h"
#include "base/trace_event/memory_dump_manager.h"
#include "build/build_config.h"
#include "components/services/storage/dom_storage/async_dom_storage_database.h"
#include "components/services/storage/dom_storage/db_status.h"
#include "components/services/storage/dom_storage/dom_storage_constants.h"
#include "components/services/storage/dom_storage/dom_storage_database.h"
#include "components/services/storage/dom_storage/dom_storage_histogram_helper.h"
#include "components/services/storage/dom_storage/features.h"
#include "components/services/storage/dom_storage/leveldb_status_helper.h"
#include "components/services/storage/dom_storage/storage_area_impl.h"
#include "mojo/public/cpp/bindings/callback_helpers.h"
#include "storage/common/database/database_identifier.h"
#include "third_party/blink/public/common/storage_key/storage_key.h"

namespace storage {
namespace {

void IgnoreStatus(base::OnceClosure callback, DbStatus status) {
  std::move(callback).Run();
}

StorageAreaImpl::Options createOptions() {
  // Delay for a moment after a value is set in anticipation
  // of other values being set, so changes are batched.
  static constexpr base::TimeDelta kCommitDefaultDelaySecs = base::Seconds(5);

  // To avoid excessive IO we apply limits to the amount of data being written
  // and the frequency of writes.
  static const size_t kMaxBytesPerHour = kPerStorageAreaQuota;
  static constexpr int kMaxCommitsPerHour = 60;

  StorageAreaImpl::Options options;
  options.max_size = kPerStorageAreaQuota + kPerStorageAreaOverQuotaAllowance;
  options.default_commit_delay = kCommitDefaultDelaySecs;
  options.max_bytes_per_hour = kMaxBytesPerHour;
  options.max_commits_per_hour = kMaxCommitsPerHour;
#if BUILDFLAG(IS_ANDROID)
    options.cache_mode = StorageAreaImpl::CacheMode::KEYS_ONLY_WHEN_POSSIBLE;
#else
    options.cache_mode = StorageAreaImpl::CacheMode::KEYS_AND_VALUES;
    if (base::SysInfo::IsLowEndDevice()) {
      options.cache_mode = StorageAreaImpl::CacheMode::KEYS_ONLY_WHEN_POSSIBLE;
    }
#endif
    return options;
}
}  // namespace

class LocalStorageImpl::StorageAreaHolder final
    : public StorageAreaImpl::Delegate {
 public:
  StorageAreaHolder(LocalStorageImpl* context,
                    const blink::StorageKey& storage_key)
      : context_(context),
        storage_key_(storage_key),
        area_(context_->database_.get(),
              base::MakeRefCounted<DomStorageDatabase::SharedMapLocator>(
                  DomStorageDatabase::MapLocator(storage_key_)),
              this,
              createOptions()) {}

  ~StorageAreaHolder() override {
    // If we already wrote last_accessed we can skip writing it again.
    if (has_written_access_meta_data_) {
      return;
    }
    // We should not write last_accessed if the area is empty.
    if (storage_area()->empty()) {
      return;
    }

    if (!context_->database_) {
      // The database does not exist.
      return;
    }

    // We should not write last_accessed if the data will be purged.
    if (context_->origins_to_purge_on_shutdown_.find(storage_key_.origin()) !=
            context_->origins_to_purge_on_shutdown_.end() ||
        context_->origins_to_purge_on_shutdown_.find(
            url::Origin::Create(storage_key_.top_level_site().GetURL())) !=
            context_->origins_to_purge_on_shutdown_.end()) {
      return;
    }

    // Update the storage area map's last access time in the database.
    DomStorageDatabase::Metadata usage;
    usage.map_metadata.push_back({
        .map_locator{storage_key_},
        .last_accessed{base::Time::Now()},
    });
    context_->database_->PutMetadata(
        std::move(usage), base::BindOnce([](DbStatus status) {
          base::UmaHistogramBoolean(
              "LocalStorage.AccessMetaDataUpdateAtShutdown", status.ok());
        }));
  }

  StorageAreaImpl* storage_area() { return &area_; }

  void OnNoBindings() override {
    has_bindings_ = false;
    // Don't delete ourselves, but do schedule an immediate commit. Possible
    // deletion will happen under memory pressure or when another localstorage
    // area is opened.
    storage_area()->ScheduleImmediateCommit();
  }

  std::optional<DomStorageDatabase::MapBatchUpdate::Usage>
  GetMapUsageMetadataToCommit() override {
    DomStorageDatabase::MapBatchUpdate::Usage map_usage;

    if (storage_area()->empty()) {
      // Delete this empty map's usage metadata from the database.
      map_usage.DeleteAllUsage();
      return map_usage;
    }

    // Update the last modified time and total size in the database.
    base::Time now = base::Time::Now();
    map_usage.SetLastModifiedAndTotalSize(
        now, base::ByteSize(storage_area()->storage_used()));

    if (!has_written_access_meta_data_) {
      // Update the last accessed time in the database.
      map_usage.SetLastAccessed(now);
      has_written_access_meta_data_ = true;
    }
    return map_usage;
  }

  void DidCommit(DbStatus status) override { context_->OnCommitResult(status); }
  void Bind(mojo::PendingReceiver<blink::mojom::StorageArea> receiver) {
    has_bindings_ = true;
    storage_area()->Bind(std::move(receiver));
  }

  bool has_bindings() const { return has_bindings_; }

 private:
  raw_ptr<LocalStorageImpl> context_;
  blink::StorageKey storage_key_;
  bool has_bindings_ = false;
  bool has_written_access_meta_data_ = false;
  StorageAreaImpl area_;
};

LocalStorageImpl::LocalStorageImpl(
    const base::FilePath& storage_partition_directory,
    DestructLocalStorageCallback destruct_callback,
    mojo::PendingReceiver<mojom::LocalStorageControl> receiver)
    : destruct_callback_(std::move(destruct_callback)),
      storage_partition_directory_(storage_partition_directory),
      memory_dump_id_(base::StringPrintf("LocalStorage/0x%" PRIXPTR,
                                         reinterpret_cast<uintptr_t>(this))) {
  base::trace_event::MemoryDumpManager::GetInstance()
      ->RegisterDumpProviderWithSequencedTaskRunner(
          this, "LocalStorage", base::SequencedTaskRunner::GetCurrentDefault(),
          MemoryDumpProvider::Options());

  if (receiver) {
    control_receiver_.Bind(std::move(receiver));
    control_receiver_.set_disconnect_handler(
        base::BindOnce(&LocalStorageImpl::OnReceiverDisconnected,
                       weak_ptr_factory_.GetWeakPtr()));
  }
}

void LocalStorageImpl::BindStorageArea(
    const blink::StorageKey& storage_key,
    mojo::PendingReceiver<blink::mojom::StorageArea> receiver) {
  if (database_ && database_->IsAuxUiMigrationHeld()) {
    database_->DeferForAuxUiMigration(base::BindOnce(&LocalStorageImpl::BindStorageArea,
        weak_ptr_factory_.GetWeakPtr(), storage_key, std::move(receiver)));
    return;
  }
  if (connection_state_ != CONNECTION_FINISHED) {
    RunWhenConnected(base::BindOnce(&LocalStorageImpl::BindStorageArea,
                                    weak_ptr_factory_.GetWeakPtr(), storage_key,
                                    std::move(receiver)));
    return;
  }

  GetOrCreateStorageArea(storage_key)->Bind(std::move(receiver));
}

void LocalStorageImpl::GetUsage(GetUsageCallback callback) {
  RunWhenConnected(base::BindOnce(&LocalStorageImpl::RetrieveStorageUsage,
                                  weak_ptr_factory_.GetWeakPtr(),
                                  std::move(callback)));
}

void LocalStorageImpl::DeleteStorage(const blink::StorageKey& storage_key,
                                     DeleteStorageCallback callback) {
  if (database_ && database_->IsAuxUiMigrationHeld()) {
    database_->DeferForAuxUiMigration(base::BindOnce(&LocalStorageImpl::DeleteStorage,
        weak_ptr_factory_.GetWeakPtr(), storage_key, std::move(callback)));
    return;
  }
  if (connection_state_ != CONNECTION_FINISHED) {
    RunWhenConnected(base::BindOnce(&LocalStorageImpl::DeleteStorage,
                                    weak_ptr_factory_.GetWeakPtr(), storage_key,
                                    std::move(callback)));
    return;
  }

  auto found = areas_.find(storage_key);
  if (found != areas_.end()) {
    // We don't bother passing an observer because this is a one-shot event and
    // we only care about observing its completion, for which the reply alone is
    // sufficient.
    found->second->storage_area()->DeleteAll(
        /*source=*/nullptr,
        /*new_observer=*/mojo::NullRemote(), std::move(callback));
    found->second->storage_area()->ScheduleImmediateCommit();
  } else if (database_) {
    std::vector<DomStorageDatabase::MapLocator> maps_to_delete;
    maps_to_delete.emplace_back(storage_key);

    database_->DeleteStorageKeysFromSession(
        /*session_id=*/std::string(), /*metadata_to_delete=*/{storage_key},
        std::move(maps_to_delete),
        base::BindOnce([](base::OnceClosure callback,
                          DbStatus) { std::move(callback).Run(); },
                       std::move(callback)));
  } else {
    std::move(callback).Run();
  }
}

void LocalStorageImpl::CleanUpStorage(CleanUpStorageCallback callback) {
  if (database_ && database_->IsAuxUiMigrationHeld()) {
    database_->DeferForAuxUiMigration(base::BindOnce(&LocalStorageImpl::CleanUpStorage,
        weak_ptr_factory_.GetWeakPtr(), std::move(callback)));
    return;
  }
  if (connection_state_ != CONNECTION_FINISHED) {
    RunWhenConnected(base::BindOnce(&LocalStorageImpl::CleanUpStorage,
                                    weak_ptr_factory_.GetWeakPtr(),
                                    std::move(callback)));
    return;
  }

  if (database_) {
    // Try to commit all changes before cleaning up the database. If
    // an area is not ready to commit its changes, nothing breaks but the
    // clean up doesn't remove all traces of old data.
    Flush();
    database_->CleanUpStaleData(
        base::BindOnce(&IgnoreStatus, std::move(callback)));
  } else {
    std::move(callback).Run();
  }
}

namespace {
mojom::AuxUiDomLeaseReplyPtr AuxDomLeaseFailure(
    const std::optional<base::UnguessableToken>& request,
    const AsyncDomStorageDatabase::AuxUiMigrationLease* lease,
    std::string error) {
  auto reply = mojom::AuxUiDomLeaseReply::New();
  reply->held = request.has_value();
  reply->request_id = request;
  if (lease) reply->token = lease->token();
  reply->error = std::move(error);
  return reply;
}
mojom::AuxUiDomLeaseReplyPtr AuxDomLeaseReleased(
    const base::UnguessableToken& request, const base::UnguessableToken& token) {
  auto reply = mojom::AuxUiDomLeaseReply::New();
  // Successful correlated observation only. No source_ready/cache/map or
  // ordinary writer readiness is inferred after the actual owner reopened.
  reply->ok = true;
  reply->held = false;
  reply->source_ready = false;
  reply->released = true;
  reply->request_id = request;
  reply->token = token;
  return reply;
}
mojom::AuxUiDomLeaseReplyPtr AuxDomLeaseAborted(
    const base::UnguessableToken& request, std::string error) {
  auto reply = mojom::AuxUiDomLeaseReply::New();
  reply->ok = false;
  reply->held = false;
  reply->source_ready = false;
  reply->aborted = true;
  reply->request_id = request;
  reply->error = std::move(error);
  return reply;
}
mojom::AuxUiDomLeaseReplyPtr AuxDomLeaseSnapshot(
    const base::UnguessableToken& request,
    const AsyncDomStorageDatabase::AuxUiMigrationLease& lease,
    AsyncDomStorageDatabase::AuxUiSnapshot snapshot) {
  auto reply = mojom::AuxUiDomLeaseReply::New();
  reply->ok = snapshot.source_ready && snapshot.native_error.empty();
  reply->held = true;
  reply->request_id = request;
  reply->token = lease.token();
  reply->error = std::move(snapshot.native_error);
  reply->matches_source = snapshot.matches_source;
  reply->matches_target = snapshot.matches_target;
  reply->file_data_synced = snapshot.file_data_synced;
  reply->ordinary_work_queued = snapshot.ordinary_work_queued;
  reply->target_attempted = snapshot.target_attempted;
  reply->source_ready = snapshot.source_ready;
  reply->private_target_staged = snapshot.private_target_staged;
  reply->cache_published = snapshot.cache_published;
  reply->source_topology_sha256 = std::move(snapshot.source_topology_sha256);
  reply->target_topology_sha256 = std::move(snapshot.target_topology_sha256);
  reply->allocation_action_sha256 = std::move(snapshot.allocation_action_sha256);
  reply->known_source_target_mixture = snapshot.known_source_target_mixture;
  reply->recovery_cache_prepared = snapshot.recovery_cache_prepared;
  reply->recovery_original_restored = snapshot.recovery_original_restored;
  reply->source_absence_cancellation = snapshot.source_absence_cancellation;
  for (auto& map : snapshot.maps) {
    auto output = mojom::AuxUiDomMapSnapshot::New();
    output->storage_key = std::move(map.storage_key);
    output->session_ids = std::move(map.session_ids);
    output->map_ordinal = map.map_ordinal;
    output->map_id = map.map_id;
    output->fresh_map_id = map.fresh_map_id;
    output->source_persisted = map.source_persisted;
    output->source_map_sha256 = std::move(map.source_map_sha256);
    output->target_map_sha256 = std::move(map.target_map_sha256);
    output->allocation_requested = map.allocation_requested;
    output->allocation_action_sha256 = std::move(map.allocation_action_sha256);
    output->allocated_map_id = map.allocated_map_id;
    output->allocation_observed = map.allocation_observed;
    if (map.source_last_accessed)
      output->source_last_accessed_us = base::NumberToString(
          map.source_last_accessed->ToDeltaSinceWindowsEpoch().InMicroseconds());
    if (map.source_last_modified)
      output->source_last_modified_us = base::NumberToString(
          map.source_last_modified->ToDeltaSinceWindowsEpoch().InMicroseconds());
    if (map.source_total_size)
      output->source_total_size_bytes = base::NumberToString(map.source_total_size->InBytes());
    output->target_metadata_is_explicit = map.target_metadata_is_explicit;
    if (map.target_last_accessed)
      output->target_last_accessed_us = base::NumberToString(
          map.target_last_accessed->ToDeltaSinceWindowsEpoch().InMicroseconds());
    if (map.target_last_modified)
      output->target_last_modified_us = base::NumberToString(
          map.target_last_modified->ToDeltaSinceWindowsEpoch().InMicroseconds());
    if (map.target_total_size)
      output->target_total_size_bytes = base::NumberToString(map.target_total_size->InBytes());
    for (auto& [key, value] : map.source)
      output->source_entries.push_back(blink::mojom::KeyValue::New(key, std::move(value)));
    for (auto& [key, value] : map.target)
      output->target_entries.push_back(blink::mojom::KeyValue::New(key, std::move(value)));
    for (auto& view : map.cache_views) {
      auto cached = mojom::AuxUiDomCacheView::New();
      cached->namespace_id = std::move(view.namespace_id);
      cached->recovery_prepared = view.recovery_prepared;
      cached->recovery_restored = view.recovery_restored;
      cached->cache = blink::mojom::AuxUiCacheReply::New();
      cached->cache->ok = reply->ok;
      cached->cache->held = true;
      cached->cache->tainted = !reply->ok;
      cached->cache->error = reply->error;
      cached->cache->request_id = request;
      cached->cache->published = view.published;
      // No private observer token is exported. Native controller joins these
      // factual frame/document stamps to the actual held browser documents.
      for (auto& document : view.documents)
        cached->cache->sources.push_back(blink::mojom::AuxUiCacheDocument::New(
            document.source_id, document.frame, document.document));
      for (const auto& [key, value] : view.source)
        cached->cache->source_entries.push_back(blink::mojom::AuxUiCacheEntry::New(
            std::vector<uint16_t>(key.begin(), key.end()),
            std::vector<uint16_t>(value.begin(), value.end())));
      for (const auto& [key, value] : view.staged)
        cached->cache->staged_entries.push_back(blink::mojom::AuxUiCacheEntry::New(
            std::vector<uint16_t>(key.begin(), key.end()),
            std::vector<uint16_t>(value.begin(), value.end())));
      output->cache_views.push_back(std::move(cached));
    }
    reply->maps.push_back(std::move(output));
  }
  return reply;
}
bool ConvertAuxDomTargets(std::vector<mojom::AuxUiDomTargetMapPtr> input,
    std::vector<AsyncDomStorageDatabase::AuxUiTargetMap>* output) {
  std::set<uint32_t> ordinals;
  std::vector<AsyncDomStorageDatabase::AuxUiTargetMap> converted;
  for (auto& map : input) {
    if (!map || !ordinals.insert(map->map_ordinal).second) return false;
    AsyncDomStorageDatabase::AuxUiTargetMap target;
    target.map_ordinal = map->map_ordinal;
    for (auto& entry : map->desired_selected_entries) {
      if (!entry || !target.desired_selected_entries.emplace(
              std::move(entry->key), std::move(entry->value)).second) return false;
    }
    converted.push_back(std::move(target));
  }
  *output = std::move(converted);
  return true;
}

bool IsAuxRecoveryDigest(std::string_view value, bool allow_empty = false) {
  return (allow_empty && value.empty()) || (value.size() == 64 &&
      std::ranges::all_of(value, [](char byte) {
        return (byte >= '0' && byte <= '9') || (byte >= 'a' && byte <= 'f');
      }));
}
bool ParseAuxRecoveryTime(const std::optional<std::string>& encoded,
                          std::optional<base::Time>* output) {
  if (!encoded) return true;
  int64_t value = 0;
  if (encoded->size() > 20 || !base::StringToInt64(*encoded, &value) ||
      base::NumberToString(value) != *encoded) return false;
  const auto time = base::Time::FromDeltaSinceWindowsEpoch(base::Microseconds(value));
  if (time.ToDeltaSinceWindowsEpoch().InMicroseconds() != value) return false;
  *output = time;
  return true;
}
bool ParseAuxRecoverySize(const std::optional<std::string>& encoded,
                          std::optional<base::ByteSize>* output) {
  if (!encoded) return true;
  uint64_t value = 0;
  if (encoded->size() > 20 || !base::StringToUint64(*encoded, &value) ||
      base::NumberToString(value) != *encoded) return false;
  *output = base::ByteSize(value);
  return true;
}
bool ConvertAuxDomRecovery(mojom::AuxUiDomRecoveryDescriptorPtr input,
                           AsyncDomStorageDatabase::AuxUiSnapshot* output) {
  if (!input || input->maps.size() > 256 ||
      !IsAuxRecoveryDigest(input->source_topology_sha256) ||
      !IsAuxRecoveryDigest(input->target_topology_sha256, true) ||
      !IsAuxRecoveryDigest(input->allocation_action_sha256, true)) return false;
  AsyncDomStorageDatabase::AuxUiSnapshot recorded;
  recorded.source_topology_sha256 = std::move(input->source_topology_sha256);
  recorded.target_topology_sha256 = std::move(input->target_topology_sha256);
  recorded.allocation_action_sha256 = std::move(input->allocation_action_sha256);
  recorded.target_attempted = input->target_attempted;
  size_t bytes = 0, entries = 0;
  constexpr size_t kBytes = 16 * 1024 * 1024, kEntries = 65536;
  const auto consume_bytes = [&](size_t size) {
    if (size > kBytes - bytes) return false;
    bytes += size; return true;
  };
  const auto convert_entries = [&](auto input_entries, auto* output_entries) {
    if (input_entries.size() > kEntries - entries) return false;
    entries += input_entries.size();
    for (auto& entry : input_entries) {
      if (!entry || !consume_bytes(entry->key.size()) || !consume_bytes(entry->value.size()) ||
          !output_entries->emplace(std::move(entry->key), std::move(entry->value)).second)
        return false;
    }
    return true;
  };
  for (auto& row : input->maps) {
    if (!row || row->map_ordinal != recorded.maps.size() || row->session_ids.size() > 256 ||
        !IsAuxRecoveryDigest(row->source_map_sha256) ||
        !IsAuxRecoveryDigest(row->target_map_sha256, true) ||
        !IsAuxRecoveryDigest(row->allocation_action_sha256, true) ||
        row->storage_key.Serialize().size() > 4096) return false;
    std::set<std::string> namespaces;
    for (const auto& id : row->session_ids)
      if (id.size() > 4096 || !consume_bytes(id.size()) || !namespaces.insert(id).second)
        return false;
    AsyncDomStorageDatabase::AuxUiMapSnapshot map;
    map.storage_key = std::move(row->storage_key);
    map.session_ids = std::move(row->session_ids);
    map.map_ordinal = row->map_ordinal;
    map.map_id = row->map_id;
    map.source_persisted = row->source_persisted;
    map.source_map_sha256 = std::move(row->source_map_sha256);
    map.target_map_sha256 = std::move(row->target_map_sha256);
    map.allocation_requested = row->allocation_requested;
    map.allocation_action_sha256 = std::move(row->allocation_action_sha256);
    map.allocated_map_id = row->allocated_map_id;
    map.allocation_observed = row->allocation_observed;
    if (!ParseAuxRecoveryTime(row->source_last_accessed_us, &map.source_last_accessed) ||
        !ParseAuxRecoveryTime(row->source_last_modified_us, &map.source_last_modified)) return false;
    if (!ParseAuxRecoverySize(row->source_total_size_bytes, &map.source_total_size)) return false;
    map.target_metadata_is_explicit = row->target_metadata_is_explicit;
    if (!ParseAuxRecoveryTime(row->target_last_accessed_us, &map.target_last_accessed) ||
        !ParseAuxRecoveryTime(row->target_last_modified_us, &map.target_last_modified) ||
        !ParseAuxRecoverySize(row->target_total_size_bytes, &map.target_total_size)) return false;
    if (!convert_entries(std::move(row->source_entries), &map.source) ||
        !convert_entries(std::move(row->target_entries), &map.target)) return false;
    // Leave all cache/docs/readiness flags at native defaults. Only the actual
    // held owner may join these facts to its retained current map inventory.
    recorded.maps.push_back(std::move(map));
  }
  *output = std::move(recorded);
  return true;
}
}  // namespace

void LocalStorageImpl::BeginAuxUiPreferenceLease(
    const base::UnguessableToken& request_id,
    BeginAuxUiPreferenceLeaseCallback callback) {
  if (aux_ui_aborted_ && aux_ui_aborted_->request == request_id) {
    if (aux_ui_aborted_->generation == aux_ui_generation_)
      std::move(callback).Run(AuxDomLeaseAborted(request_id, aux_ui_aborted_->error));
    else
      std::move(callback).Run(AuxDomLeaseFailure(std::nullopt, nullptr,
          "Retired original DOM request cannot prepare again"));
    return;
  }
  if (aux_ui_released_ && aux_ui_released_->request == request_id) {
    if (aux_ui_released_->generation == aux_ui_generation_)
      std::move(callback).Run(AuxDomLeaseReleased(request_id, aux_ui_released_->token));
    else
      std::move(callback).Run(AuxDomLeaseFailure(std::nullopt, nullptr,
          "Retired original DOM request cannot prepare again"));
    return;
  }
  if (aux_ui_retired_requests_.contains(request_id) ||
      aux_ui_retired_requests_.size() >= 64) {
    std::move(callback).Run(AuxDomLeaseFailure(std::nullopt, nullptr,
        "Retired original request or native transaction history limit"));
    return;
  }
  if (request_id.is_empty() || aux_ui_request_ ||
      aux_ui_generation_ == std::numeric_limits<uint64_t>::max() ||
      connection_state_ != CONNECTION_FINISHED || !database_ || in_memory_ ||
      storage_partition_directory_.empty()) {
    std::move(callback).Run(AuxDomLeaseFailure(aux_ui_request_, aux_ui_lease_.get(),
        "Existing disk backend required; discover the exact held request instead of rerunning Begin"));
    return;
  }
  aux_ui_request_ = request_id;
  const uint64_t generation = ++aux_ui_generation_;
  database_->BeginAuxUiMigrationLease(base::BindOnce(
      [](base::WeakPtr<LocalStorageImpl> owner, base::UnguessableToken request,
         uint64_t generation, BeginAuxUiPreferenceLeaseCallback callback,
         StatusOr<std::unique_ptr<AsyncDomStorageDatabase::AuxUiMigrationLease>> lease,
         AsyncDomStorageDatabase::AuxUiSnapshot snapshot) {
        if (!owner || owner->aux_ui_request_ != request ||
            owner->aux_ui_generation_ != generation) {
          std::move(callback).Run(AuxDomLeaseFailure(request, nullptr, "Aux DOM service owner changed"));
          return;
        }
        if (lease.has_value() && !lease.value()) {
          // An impossible/unknown native result cannot erase original custody.
          std::move(callback).Run(AuxDomLeaseFailure(request, nullptr,
              "Native DOM lease result omitted its retained owner"));
          return;
        }
        if (!lease.has_value()) {
          const std::string error = lease.error().ToString();
          owner->aux_ui_retired_requests_.insert(request);
          owner->aux_ui_aborted_ = AuxUiAbortedReceipt{request, generation, error};
          owner->aux_ui_request_.reset();
          // Only this actual no-lease callback and concrete native cleanup
          // create the observation. Timeout, missing owner and null-success
          // lease remain unknown and never enter this branch.
          std::move(callback).Run(AuxDomLeaseAborted(request, error));
          return;
        }
        // A real held lease remains discoverable even if cache preparation
        // refused or its result is uncertain. Never reset it for source_ready=false.
        owner->aux_ui_lease_ = std::move(lease).value();
        std::move(callback).Run(AuxDomLeaseSnapshot(request, *owner->aux_ui_lease_, std::move(snapshot)));
      }, weak_ptr_factory_.GetWeakPtr(), request_id, generation, std::move(callback)));
}
bool LocalStorageImpl::OwnsAuxUiLease(const base::UnguessableToken& request,
    const base::UnguessableToken& token, uint64_t generation) const {
  return aux_ui_request_ == request && aux_ui_lease_ && database_ &&
      aux_ui_lease_->token() == token && aux_ui_generation_ == generation;
}
void LocalStorageImpl::CompleteAuxUiOperation(base::WeakPtr<LocalStorageImpl> owner,
    base::UnguessableToken request, base::UnguessableToken token,
    uint64_t generation, AuxUiReplyCallback callback,
    StatusOr<AsyncDomStorageDatabase::AuxUiSnapshot> result) {
  if (!owner || !owner->OwnsAuxUiLease(request, token, generation)) {
    std::move(callback).Run(AuxDomLeaseFailure(request, nullptr, "Aux DOM service owner changed"));
  } else if (!result.has_value()) {
    std::move(callback).Run(AuxDomLeaseFailure(owner->aux_ui_request_, owner->aux_ui_lease_.get(), result.error().ToString()));
  } else {
    std::move(callback).Run(AuxDomLeaseSnapshot(request, *owner->aux_ui_lease_, std::move(result).value()));
  }
}
void LocalStorageImpl::RunAuxUiOperation(const base::UnguessableToken& request,
    const base::UnguessableToken& token, AuxUiOperation operation,
    AuxUiReplyCallback callback) {
  if (!OwnsAuxUiLease(request, token, aux_ui_generation_) || aux_ui_release_pending_ ||
      (AuxUiHandoffBlocksOperations() && operation != AuxUiOperation::kRead &&
       operation != AuxUiOperation::kValidate && operation != AuxUiOperation::kRecoveryRead)) {
    std::move(callback).Run(AuxDomLeaseFailure(aux_ui_request_, aux_ui_lease_.get(),
        "Exact original native-held lease required; release may still be pending"));
    return;
  }
  auto completed = base::BindOnce(&LocalStorageImpl::CompleteAuxUiOperation,
      weak_ptr_factory_.GetWeakPtr(), request, token, aux_ui_generation_, std::move(callback));
  switch (operation) {
    case AuxUiOperation::kRead: database_->ReadAuxUiMigrationLease(*aux_ui_lease_, std::move(completed)); return;
    case AuxUiOperation::kValidate: database_->ValidateAuxUiMigrationLease(*aux_ui_lease_, std::move(completed)); return;
    case AuxUiOperation::kCommit: database_->CommitAuxUiMigrationLease(*aux_ui_lease_, std::move(completed)); return;
    case AuxUiOperation::kRestore: database_->RestoreAuxUiMigrationLease(*aux_ui_lease_, std::move(completed)); return;
    case AuxUiOperation::kPublish: database_->PublishAuxUiMigrationLease(*aux_ui_lease_, std::move(completed)); return;
    case AuxUiOperation::kRecoveryPrepare: database_->PrepareAuxUiMigrationRecoveryCaches(*aux_ui_lease_, std::move(completed)); return;
    case AuxUiOperation::kRecoveryRead: database_->ReadAuxUiMigrationRecovery(*aux_ui_lease_, std::move(completed)); return;
    case AuxUiOperation::kRecoveryRestore: database_->RestoreAuxUiMigrationRecovery(*aux_ui_lease_, std::move(completed)); return;
  }
}
void LocalStorageImpl::ReadAuxUiPreferenceLease(const base::UnguessableToken& request_id, ReadAuxUiPreferenceLeaseCallback callback) {
  if (aux_ui_handoffs_.contains(request_id)) {
    ReadAuxUiHandoff(request_id, std::move(callback)); return;
  }
  if (aux_ui_aborted_ && aux_ui_aborted_->request == request_id &&
      aux_ui_aborted_->generation == aux_ui_generation_) {
    std::move(callback).Run(AuxDomLeaseAborted(request_id, aux_ui_aborted_->error));
    return;
  }
  if (aux_ui_released_ && aux_ui_released_->request == request_id &&
      aux_ui_released_->generation == aux_ui_generation_) {
    std::move(callback).Run(AuxDomLeaseReleased(request_id, aux_ui_released_->token));
    return;
  }
  RunAuxUiOperation(request_id, aux_ui_lease_ ? aux_ui_lease_->token() : base::UnguessableToken(), AuxUiOperation::kRead, std::move(callback));
}
void LocalStorageImpl::ValidateAuxUiPreferenceLease(const base::UnguessableToken& request_id, const base::UnguessableToken& token, ValidateAuxUiPreferenceLeaseCallback callback) {
  RunAuxUiOperation(request_id, token, AuxUiOperation::kValidate, std::move(callback));
}
void LocalStorageImpl::CommitAuxUiPreferenceLease(const base::UnguessableToken& request_id, const base::UnguessableToken& token, CommitAuxUiPreferenceLeaseCallback callback) {
  RunAuxUiOperation(request_id, token, AuxUiOperation::kCommit, std::move(callback));
}
void LocalStorageImpl::RestoreAuxUiPreferenceLease(const base::UnguessableToken& request_id, const base::UnguessableToken& token, RestoreAuxUiPreferenceLeaseCallback callback) {
  RunAuxUiOperation(request_id, token, AuxUiOperation::kRestore, std::move(callback));
}
void LocalStorageImpl::PublishAuxUiPreferenceLease(const base::UnguessableToken& request_id, const base::UnguessableToken& token, PublishAuxUiPreferenceLeaseCallback callback) {
  RunAuxUiOperation(request_id, token, AuxUiOperation::kPublish, std::move(callback));
}
void LocalStorageImpl::RequalifyAuxUiPreferenceLease(
    const base::UnguessableToken& request_id, const base::UnguessableToken& token,
    mojom::AuxUiDomRecoveryDescriptorPtr recorded, RequalifyAuxUiPreferenceLeaseCallback callback) {
  AsyncDomStorageDatabase::AuxUiSnapshot converted;
  if (!OwnsAuxUiLease(request_id, token, aux_ui_generation_) || aux_ui_release_pending_ ||
      AuxUiHandoffBlocksOperations() || !ConvertAuxDomRecovery(std::move(recorded), &converted)) {
    std::move(callback).Run(AuxDomLeaseFailure(aux_ui_request_, aux_ui_lease_.get(),
        "Exact fresh native lease and bounded original journal facts required"));
    return;
  }
  database_->RequalifyAuxUiMigrationLease(*aux_ui_lease_, std::move(converted),
      base::BindOnce(&LocalStorageImpl::CompleteAuxUiOperation, weak_ptr_factory_.GetWeakPtr(),
          request_id, token, aux_ui_generation_, std::move(callback)));
}

void LocalStorageImpl::PrepareAuxUiPreferenceRecoveryCaches(const base::UnguessableToken& request_id,
    const base::UnguessableToken& token, PrepareAuxUiPreferenceRecoveryCachesCallback callback) {
  RunAuxUiOperation(request_id, token, AuxUiOperation::kRecoveryPrepare, std::move(callback));
}

void LocalStorageImpl::ReadAuxUiPreferenceRecovery(const base::UnguessableToken& request_id,
    const base::UnguessableToken& token, ReadAuxUiPreferenceRecoveryCallback callback) {
  RunAuxUiOperation(request_id, token, AuxUiOperation::kRecoveryRead, std::move(callback));
}

void LocalStorageImpl::RestoreAuxUiPreferenceRecovery(const base::UnguessableToken& request_id,
    const base::UnguessableToken& token, RestoreAuxUiPreferenceRecoveryCallback callback) {
  RunAuxUiOperation(request_id, token, AuxUiOperation::kRecoveryRestore, std::move(callback));
}

bool LocalStorageImpl::AuxUiHandoffBlocksOperations() const {
  if (!aux_ui_handoff_original_) return false;
  auto found = aux_ui_handoffs_.find(*aux_ui_handoff_original_);
  return found == aux_ui_handoffs_.end() || !found->second.handed_off ||
      !found->second.service_joined;
}
void LocalStorageImpl::AnnotateAuxUiHandoff(AuxUiHandoffReceipt receipt,
    AuxUiReplyCallback callback, mojom::AuxUiDomLeaseReplyPtr reply) {
  reply->handoff_pending = receipt.pending;
  reply->handed_off = receipt.handed_off;
  reply->handoff_original_request = receipt.original_request;
  reply->handoff_original_token = receipt.original_token;
  reply->handoff_request = receipt.successor_request;
  if (receipt.handed_off && !receipt.service_joined) {
    reply->ok = false; reply->source_ready = false;
    reply->error = "Closed native handoff has an uncertain service join; writer gates stay held";
  }
  std::move(callback).Run(std::move(reply));
}
void LocalStorageImpl::ReadAuxUiHandoff(const base::UnguessableToken& original,
    AuxUiReplyCallback callback) {
  auto found = aux_ui_handoffs_.find(original);
  CHECK(found != aux_ui_handoffs_.end());
  const auto& receipt = found->second;
  // The receipt has separate opaque predecessor custody; only its factual
  // fields are copied into the annotation callback.
  AuxUiHandoffReceipt observed;
  observed.original_request = receipt.original_request;
  observed.original_token = receipt.original_token;
  observed.successor_request = receipt.successor_request;
  observed.successor_token = receipt.successor_token;
  observed.original_generation = receipt.original_generation;
  observed.successor_generation = receipt.successor_generation;
  observed.pending = receipt.pending;
  observed.handed_off = receipt.handed_off;
  observed.service_joined = receipt.service_joined;
  if (!receipt.handed_off) {
    if (OwnsAuxUiLease(receipt.original_request, receipt.original_token,
                      receipt.original_generation)) {
      // Observe the one native retained successor. This is not Handoff replay,
      // a fresh Begin, a write, or a new token request.
      database_->ReadAuxUiMigrationHandoff(*aux_ui_lease_, base::BindOnce(
          &LocalStorageImpl::CompleteAuxUiHandoff, weak_ptr_factory_.GetWeakPtr(),
          receipt.original_request, receipt.original_token,
          receipt.original_generation, std::move(callback)));
      return;
    }
    AnnotateAuxUiHandoff(std::move(observed), std::move(callback),
        AuxDomLeaseFailure(aux_ui_request_, aux_ui_lease_.get(),
            "Closed native handoff owner remains unknown; retained receipt only"));
    return;
  }
  auto annotate = base::BindOnce(&LocalStorageImpl::AnnotateAuxUiHandoff,
      std::move(observed), std::move(callback));
  if (receipt.successor_token &&
      OwnsAuxUiLease(receipt.successor_request, *receipt.successor_token,
                    receipt.successor_generation)) {
    RunAuxUiOperation(receipt.successor_request, *receipt.successor_token,
                      AuxUiOperation::kRead, std::move(annotate)); return;
  }
  if (receipt.successor_token && aux_ui_released_ &&
      aux_ui_released_->request == receipt.successor_request &&
      aux_ui_released_->token == *receipt.successor_token &&
      aux_ui_released_->generation == receipt.successor_generation &&
      aux_ui_generation_ == receipt.successor_generation) {
    std::move(annotate).Run(AuxDomLeaseReleased(receipt.successor_request,
                                             *receipt.successor_token)); return;
  }
  // Historical handoff is not current release, notfound or writer readiness.
  std::move(annotate).Run(AuxDomLeaseFailure(std::nullopt, nullptr,
      "Successor ownership changed; only the historical handoff is observed"));
}
void LocalStorageImpl::CompleteAuxUiHandoff(base::WeakPtr<LocalStorageImpl> owner,
    base::UnguessableToken request, base::UnguessableToken token, uint64_t generation,
    AuxUiReplyCallback callback,
    StatusOr<std::unique_ptr<AsyncDomStorageDatabase::AuxUiMigrationLease>> successor,
    AsyncDomStorageDatabase::AuxUiSnapshot snapshot) {
  if (owner) {
    auto known = owner->aux_ui_handoffs_.find(request);
    if (known != owner->aux_ui_handoffs_.end() && known->second.handed_off) {
      owner->ReadAuxUiHandoff(request, std::move(callback)); return;
    }
  }
  if (!owner || !owner->OwnsAuxUiLease(request, token, generation) ||
      owner->aux_ui_handoff_original_ != request) {
    std::move(callback).Run(AuxDomLeaseFailure(request, nullptr,
        "Closed handoff service owner changed; native custody remains unknown")); return;
  }
  auto found = owner->aux_ui_handoffs_.find(request);
  CHECK(found != owner->aux_ui_handoffs_.end());
  auto& receipt = found->second;
  if (!successor.has_value() || !successor.value()) {
    // No sole successor is discarded. The original native gate and any
    // partial cohort transfer stay held, with this immutable correlation.
    auto reply = AuxDomLeaseFailure(owner->aux_ui_request_, owner->aux_ui_lease_.get(),
        successor.has_value() ? "Native closed handoff omitted a retained successor" :
              successor.error().ToString());
    reply->handoff_pending = true;
    reply->handoff_original_request = request;
    reply->handoff_original_token = token;
    reply->handoff_request = receipt.successor_request;
    std::move(callback).Run(std::move(reply)); return;
  }
  if (successor.value()->token().is_empty() || successor.value()->token() == token) {
    // Retain even an impossible native result; do not destroy its owner
    // or pretend the original token can authorize release.
    receipt.original_lease = std::move(successor.value());
    auto reply = AuxDomLeaseFailure(owner->aux_ui_request_, owner->aux_ui_lease_.get(),
        "Native closed handoff returned an invalid token; both opaque owners stay held");
    reply->handoff_pending = true;
    reply->handoff_original_request = request;
    reply->handoff_original_token = token;
    reply->handoff_request = receipt.successor_request;
    std::move(callback).Run(std::move(reply)); return;
  }
  receipt.original_lease = std::move(owner->aux_ui_lease_);
  owner->aux_ui_lease_ = std::move(successor.value());
  owner->aux_ui_request_ = receipt.successor_request;
  receipt.successor_generation = ++owner->aux_ui_generation_;
  receipt.successor_token = owner->aux_ui_lease_->token();
  receipt.pending = false;
  receipt.handed_off = true;
  receipt.service_joined = true;

  owner->aux_ui_retired_requests_.insert(request);
  // Actual successor custody + predecessor receipt precede the Mojo reply.
  auto reply = AuxDomLeaseSnapshot(receipt.successor_request,
      *owner->aux_ui_lease_, std::move(snapshot));
  reply->handoff_original_request = request;
  reply->handoff_original_token = token;
  reply->handoff_request = receipt.successor_request;
  reply->handed_off = true;
  std::move(callback).Run(std::move(reply));
}
void LocalStorageImpl::HandoffAuxUiPreferenceRecovery(
    const base::UnguessableToken& request_id, const base::UnguessableToken& token,
    const base::UnguessableToken& new_request,
    HandoffAuxUiPreferenceRecoveryCallback callback) {
  auto existing = aux_ui_handoffs_.find(request_id);
  if (existing != aux_ui_handoffs_.end()) {
    if (existing->second.original_token == token &&
        existing->second.successor_request == new_request) {
      ReadAuxUiHandoff(request_id, std::move(callback)); return;
    }
    std::move(callback).Run(AuxDomLeaseFailure(aux_ui_request_, aux_ui_lease_.get(),
        "Original handoff correlation is immutable")); return;
  }
  if (!OwnsAuxUiLease(request_id, token, aux_ui_generation_) || aux_ui_release_pending_ ||
      AuxUiHandoffBlocksOperations() || new_request.is_empty() || new_request == request_id ||
      aux_ui_retired_requests_.contains(new_request) ||
      aux_ui_retired_requests_.size() >= 63 || aux_ui_handoffs_.size() >= 64 ||
      aux_ui_generation_ == std::numeric_limits<uint64_t>::max()) {
    std::move(callback).Run(AuxDomLeaseFailure(aux_ui_request_, aux_ui_lease_.get(),
        "Exact retained recovery lease and unused native handoff correlation required")); return;
  }

  AuxUiHandoffReceipt pending;
  pending.original_request = request_id;
  pending.original_token = token;
  pending.successor_request = new_request;
  pending.original_generation = aux_ui_generation_;
  aux_ui_handoffs_.emplace(request_id, std::move(pending));
  aux_ui_handoff_original_ = request_id;
  database_->HandoffAuxUiMigrationRecovery(*aux_ui_lease_, base::BindOnce(
      &LocalStorageImpl::CompleteAuxUiHandoff, weak_ptr_factory_.GetWeakPtr(), request_id,
      token, aux_ui_generation_, std::move(callback)));
}

void LocalStorageImpl::StageAuxUiPreferenceTargets(
    const base::UnguessableToken& request_id, const base::UnguessableToken& token,
    std::vector<mojom::AuxUiDomTargetMapPtr> targets,
    StageAuxUiPreferenceTargetsCallback callback) {
  std::vector<AsyncDomStorageDatabase::AuxUiTargetMap> converted;
  if (!OwnsAuxUiLease(request_id, token, aux_ui_generation_) || aux_ui_release_pending_ ||
      AuxUiHandoffBlocksOperations() || !ConvertAuxDomTargets(std::move(targets), &converted)) {
    std::move(callback).Run(AuxDomLeaseFailure(aux_ui_request_, aux_ui_lease_.get(),
        "Exact lease and unique captured ordinals/raw selected keys required"));
    return;
  }
  database_->StageAuxUiMigrationTargets(*aux_ui_lease_, std::move(converted),
      base::BindOnce(&LocalStorageImpl::CompleteAuxUiOperation, weak_ptr_factory_.GetWeakPtr(),
          request_id, token, aux_ui_generation_, std::move(callback)));
}
DbStatus LocalStorageImpl::BeforeAuxUiLeaseReopen(base::WeakPtr<LocalStorageImpl> owner,
    base::UnguessableToken request, base::UnguessableToken token, uint64_t generation) {
  if (!owner || !owner->aux_ui_release_pending_ ||
      !owner->OwnsAuxUiLease(request, token, generation))
    return DbStatus::IOError("Exact native service release owner changed");
  return DbStatus::OK();
}
void LocalStorageImpl::AuxUiLeaseReleased(base::WeakPtr<LocalStorageImpl> owner,
    base::UnguessableToken request, base::UnguessableToken token, uint64_t generation,
    ReleaseAuxUiPreferenceLeaseCallback callback, DbStatus status) {
  if (!owner || !owner->OwnsAuxUiLease(request, token, generation)) {
    std::move(callback).Run(false); return;
  }
  owner->aux_ui_release_pending_ = false;
  if (!status.ok()) {
    std::move(callback).Run(false); return;
  }
  // Record only after the actual asynchronous backend/cache/namespace
  // cleanup succeeded; a lost Mojo reply can then be discovered without rerun.
  owner->aux_ui_retired_requests_.insert(request);
  owner->aux_ui_released_ = AuxUiReleasedReceipt{request, token, generation};
  owner->aux_ui_lease_.reset();
  owner->aux_ui_request_.reset();
  std::move(callback).Run(true);
}
void LocalStorageImpl::ReleaseAuxUiPreferenceLease(
    const base::UnguessableToken& request_id, const base::UnguessableToken& token,
    ReleaseAuxUiPreferenceLeaseCallback callback) {
  if (!OwnsAuxUiLease(request_id, token, aux_ui_generation_) || aux_ui_release_pending_ ||
      AuxUiHandoffBlocksOperations()) {
    std::move(callback).Run(false); return;
  }
  aux_ui_release_pending_ = true;
  // Only this concrete native service constructs the synchronous prerequisite;
  // no readiness callback, root or restore map comes from Mojo/UI callers.
  database_->ReleaseAuxUiMigrationLease(*aux_ui_lease_,
      base::BindOnce(&LocalStorageImpl::BeforeAuxUiLeaseReopen, weak_ptr_factory_.GetWeakPtr(),
          request_id, token, aux_ui_generation_),
      base::BindOnce(&LocalStorageImpl::AuxUiLeaseReleased, weak_ptr_factory_.GetWeakPtr(),
          request_id, token, aux_ui_generation_, std::move(callback)));
}

void LocalStorageImpl::DrainAuxUiMigration(DrainAuxUiMigrationCallback callback) {
  DrainLoadedAreasForAuxMigration(base::BindOnce(
      [](DrainAuxUiMigrationCallback reply, DbStatus status) {
        std::move(reply).Run(status.ok());
      }, std::move(callback)));
}

void LocalStorageImpl::DrainLoadedAreasForAuxMigration(
    AsyncDomStorageDatabase::StatusCallback callback) {
  if (connection_state_ != CONNECTION_FINISHED || !database_ || in_memory_ ||
      storage_partition_directory_.empty()) {
    std::move(callback).Run(
        DbStatus::IOError("Aux migration requires an existing disk backend"));
    return;
  }
  for (const auto& entry : areas_) {
    StorageAreaImpl* area = entry.second->storage_area();
    if (!area->initialized() || area->has_pending_load_tasks() ||
        area->database() != database_.get()) {
      std::move(callback).Run(
          DbStatus::IOError("Aux storage areas are not ready to drain"));
      return;
    }
  }
  // Loaded areas have no deferred load callbacks. Scheduling their immediate
  // commits posts existing batches before the DB queue sentinel below.
  for (const auto& entry : areas_) {
    entry.second->storage_area()->ScheduleImmediateCommit();
  }
  auto reply = base::BindOnce(
      [](base::WeakPtr<LocalStorageImpl> owner,
         AsyncDomStorageDatabase::StatusCallback callback, DbStatus status) {
        if (!owner || owner->connection_state_ != CONNECTION_FINISHED ||
            !owner->database_ || owner->in_memory_) {
          status = DbStatus::IOError("Aux storage service changed during drain");
        }
        std::move(callback).Run(std::move(status));
      },
      weak_ptr_factory_.GetWeakPtr(), std::move(callback));
  database_->DrainCommitsForAuxMigration(
      mojo::WrapCallbackWithDefaultInvokeIfNotRun(
          std::move(reply),
          DbStatus::IOError("Aux storage service drain reply was lost")));
}

void LocalStorageImpl::Flush() {
  if (database_ && database_->IsAuxUiMigrationHeld()) {
    database_->DeferForAuxUiMigration(base::BindOnce(&LocalStorageImpl::Flush,
        weak_ptr_factory_.GetWeakPtr()));
    return;
  }
  if (connection_state_ != CONNECTION_FINISHED) {
    RunWhenConnected(base::BindOnce(&LocalStorageImpl::Flush,
                                    weak_ptr_factory_.GetWeakPtr()));
    return;
  }

  for (const auto& it : areas_)
    it.second->storage_area()->ScheduleImmediateCommit();
}

StorageAreaImpl* LocalStorageImpl::GetStorageAreaForTesting(
    const blink::StorageKey& storage_key) {
  if (connection_state_ != CONNECTION_FINISHED) {
    return nullptr;
  }
  const auto& it = areas_.find(storage_key);
  if (it == areas_.end()) {
    return nullptr;
  }
  return it->second->storage_area();
}

void LocalStorageImpl::FlushStorageKeyForTesting(
    const blink::StorageKey& storage_key) {
  StorageAreaImpl* storage_area = GetStorageAreaForTesting(storage_key);
  if (!storage_area) {
    return;
  }
  storage_area->ScheduleImmediateCommit();
}

void LocalStorageImpl::ShutDown() {
  control_receiver_.reset();

  // Nothing to do if no connection to the database was ever finished.
  if (connection_state_ == CONNECTION_FINISHED) {
    // Flush any uncommitted data.
    for (const auto& it : areas_) {
      auto* area = it.second->storage_area();
      area->ScheduleImmediateCommit();
    }

    if (database_ && !force_keep_session_state_ &&
        !origins_to_purge_on_shutdown_.empty()) {
      database_->PurgeOriginsForShutdown(
          std::move(origins_to_purge_on_shutdown_));
    }
  }
}

void LocalStorageImpl::PurgeMemory() {
  if (database_ && database_->IsAuxUiMigrationHeld()) {
    database_->DeferForAuxUiMigration(base::BindOnce(&LocalStorageImpl::PurgeMemory,
        weak_ptr_factory_.GetWeakPtr()));
    return;
  }
  for (auto it = areas_.begin(); it != areas_.end();) {
    if (it->second->has_bindings()) {
      it->second->storage_area()->PurgeMemory();
      ++it;
    } else {
      it = areas_.erase(it);
    }
  }
}

void LocalStorageImpl::ApplyPolicyUpdates(
    std::vector<mojom::StoragePolicyUpdatePtr> policy_updates) {
  if (database_ && database_->IsAuxUiMigrationHeld()) {
    database_->DeferForAuxUiMigration(base::BindOnce(&LocalStorageImpl::ApplyPolicyUpdates,
        weak_ptr_factory_.GetWeakPtr(), std::move(policy_updates)));
    return;
  }
  for (const auto& update : policy_updates) {
    const url::Origin origin = update->origin;
    if (!update->purge_on_shutdown)
      origins_to_purge_on_shutdown_.erase(origin);
    else
      origins_to_purge_on_shutdown_.insert(std::move(origin));
  }
}

void LocalStorageImpl::PurgeUnusedAreasIfNeeded() {
  if (database_ && database_->IsAuxUiMigrationHeld()) {
    database_->DeferForAuxUiMigration(base::BindOnce(&LocalStorageImpl::PurgeUnusedAreasIfNeeded,
        weak_ptr_factory_.GetWeakPtr()));
    return;
  }
  size_t total_cache_size, unused_area_count;
  GetStatistics(&total_cache_size, &unused_area_count);

  // Nothing to purge.
  if (!unused_area_count)
    return;

  // No purge is needed.
  if (total_cache_size <= kMaxLocalStorageCacheSize &&
      areas_.size() <= kMaxLocalStorageAreaCount &&
      !base::SysInfo::IsLowEndDevice()) {
    return;
  }

  for (auto it = areas_.begin(); it != areas_.end();) {
    if (it->second->has_bindings())
      ++it;
    else
      it = areas_.erase(it);
  }
}

void LocalStorageImpl::ForceKeepSessionState() {
  if (database_ && database_->IsAuxUiMigrationHeld()) {
    database_->DeferForAuxUiMigration(base::BindOnce(&LocalStorageImpl::ForceKeepSessionState,
        weak_ptr_factory_.GetWeakPtr()));
    return;
  }
  SetForceKeepSessionState();
}

bool LocalStorageImpl::OnMemoryDump(
    const base::trace_event::MemoryDumpArgs& args,
    base::trace_event::ProcessMemoryDump* pmd) {
  if (connection_state_ != CONNECTION_FINISHED)
    return true;

  std::string context_name =
      base::StringPrintf("site_storage/localstorage/0x%" PRIXPTR,
                         reinterpret_cast<uintptr_t>(this));

  if (database_) {
    // Account for database memory usage, which actually lives in the file
    // service.
    auto* global_dump = pmd->CreateSharedGlobalAllocatorDump(memory_dump_id_);
    // The size of the database dump will be added by the database service.
    auto* db_mad = pmd->CreateAllocatorDump(
        context_name + (database_->is_sqlite() ? "/sqlite" : "/leveldb"));
    // Specifies that the current context is responsible for keeping memory
    // alive.
    int kImportance = 2;
    pmd->AddOwnershipEdge(db_mad->guid(), global_dump->guid(), kImportance);
  }

  if (args.level_of_detail ==
      base::trace_event::MemoryDumpLevelOfDetail::kBackground) {
    size_t total_cache_size, unused_area_count;
    GetStatistics(&total_cache_size, &unused_area_count);
    auto* mad = pmd->CreateAllocatorDump(context_name + "/cache_size");
    mad->AddScalar(base::trace_event::MemoryAllocatorDump::kNameSize,
                   base::trace_event::MemoryAllocatorDump::kUnitsBytes,
                   total_cache_size);
    mad->AddScalar("total_areas",
                   base::trace_event::MemoryAllocatorDump::kUnitsObjects,
                   areas_.size());
    return true;
  }
  for (const auto& it : areas_) {
    std::string storage_key_str =
        it.first.GetMemoryDumpString(/*max_length=*/50);
    std::string area_dump_name = base::StringPrintf(
        "%s/%s/0x%" PRIXPTR, context_name.c_str(), storage_key_str.c_str(),
        reinterpret_cast<uintptr_t>(it.second->storage_area()));
    it.second->storage_area()->OnMemoryDump(area_dump_name, pmd);
  }
  return true;
}

const base::FilePath& LocalStorageImpl::GetStoragePartitionDirectory() const {
  return storage_partition_directory_;
}

void LocalStorageImpl::SetDatabaseOpenCallbackForTesting(
    base::OnceClosure callback) {
  RunWhenConnected(std::move(callback));
}

void LocalStorageImpl::OverrideDeleteStaleStorageAreasDelayForTesting(
    const base::TimeDelta& delay) {
  delete_stale_storage_areas_delay_ = delay;
}

void LocalStorageImpl::ForceFakeOpenStorageAreaForTesting(
    const blink::StorageKey& storage_key) {
  areas_[storage_key] = std::make_unique<StorageAreaHolder>(this, storage_key);
}

LocalStorageImpl::~LocalStorageImpl() {
  ShutDown();
  base::trace_event::MemoryDumpManager::GetInstance()->UnregisterDumpProvider(
      this);
}

void LocalStorageImpl::RunWhenConnected(base::OnceClosure callback) {
  if (database_ && database_->IsAuxUiMigrationHeld()) {
    database_->DeferForAuxUiMigration(base::BindOnce(&LocalStorageImpl::RunWhenConnected,
        weak_ptr_factory_.GetWeakPtr(), std::move(callback)));
    return;
  }
  // If we don't have a database connection, we'll need to establish one.
  if (connection_state_ == NO_CONNECTION) {
    connection_state_ = CONNECTION_IN_PROGRESS;
    InitiateConnection();
  }

  if (connection_state_ == CONNECTION_IN_PROGRESS) {
    // Queue this OpenLocalStorage call for when we have a level db pointer.
    on_database_opened_callbacks_.push_back(std::move(callback));
    return;
  }

  std::move(callback).Run();
}

void LocalStorageImpl::InitiateConnection(
    bool in_memory_only,
    bool destroy_existing_db_for_recovery) {
  CHECK_EQ(connection_state_, CONNECTION_IN_PROGRESS);

  // Use an in-memory database unless we were given a usable (absolute)
  // subdirectory and weren't asked to stay in memory.
  in_memory_ = in_memory_only || storage_partition_directory_.empty() ||
               !storage_partition_directory_.IsAbsolute();
  const base::FilePath dir_to_open =
      in_memory_ ? base::FilePath() : storage_partition_directory_;
  // Recovery destroys the pre-existing on-disk database before reopening (which
  // may itself be in-memory). An empty `dir_to_destroy` means no destroy.
  const base::FilePath dir_to_destroy = destroy_existing_db_for_recovery
                                            ? storage_partition_directory_
                                            : base::FilePath();
  database_ = AsyncDomStorageDatabase::Open(
      StorageType::kLocalStorage, dir_to_open, memory_dump_id_, dir_to_destroy,
      base::BindOnce(&LocalStorageImpl::OnDatabaseOpened,
                     weak_ptr_factory_.GetWeakPtr()));
}

void LocalStorageImpl::OnDatabaseOpened(
    AsyncDomStorageDatabase::OpenOutcome outcome) {
  // If this open destroyed a pre-existing database, log the destroy status and
  // feed its outcome into the recovery histogram. In LocalStorage destroys only
  // happen during recovery, so `recovery_state_` is always set here.
  if (outcome.destroy_outcome) {
    CHECK(recovery_state_);
    outcome.destroy_outcome->status.Log(
        "Storage.LocalStorage.DestroyDatabase",
        outcome.destroy_outcome->destroyed_db_metrics_type);
    recovery_state_->AddDestroyResult(outcome.destroy_outcome->status.ok());
  }

  if (!outcome.open_status.ok()) {
    // If we failed to open the database, try to delete and recreate the
    // database, or ultimately fallback to an in-memory database.
    DeleteAndRecreateDatabase(DomStorageRecoveryReason::kOpenFailure);
    return;
  }

  OnConnectionFinished();
}

void LocalStorageImpl::OnConnectionFinished() {
  CHECK_EQ(connection_state_, CONNECTION_IN_PROGRESS);
  // If connection was opened successfully, reset tried_to_recreate_during_open_
  // to enable recreating the database on future errors.
  if (database_)
    tried_to_recreate_during_open_ = false;

  // Emit recovery histogram if we just completed a recovery cycle.
  if (recovery_state_) {
    LogDomStorageRecoveryOutcome("LocalStorage", *recovery_state_,
                                 /*has_database=*/database_ != nullptr,
                                 in_memory_);
    recovery_state_.reset();
  }

  // Clear stale storage areas after a delay to prevent blocking session
  // restoration.
  if (database_ && !in_memory_) {
    base::SequencedTaskRunner::GetCurrentDefault()->PostDelayedTask(
        FROM_HERE,
        base::BindOnce(&LocalStorageImpl::DeleteStaleStorageAreas,
                       weak_ptr_factory_.GetWeakPtr()),
        delete_stale_storage_areas_delay_);
  }

  // |database_| should be known to either be valid or invalid by now. Run our
  // delayed bindings.
  connection_state_ = CONNECTION_FINISHED;
  for (size_t i = 0; i < on_database_opened_callbacks_.size(); ++i)
    std::move(on_database_opened_callbacks_[i]).Run();
  on_database_opened_callbacks_.clear();
}

void LocalStorageImpl::DeleteAndRecreateDatabase(
    DomStorageRecoveryReason reason) {
  if (database_ && database_->IsAuxUiMigrationHeld()) {
    database_->DeferForAuxUiMigration(base::BindOnce(&LocalStorageImpl::DeleteAndRecreateDatabase,
        weak_ptr_factory_.GetWeakPtr(), reason));
    return;
  }
  CHECK(database_);
  const DatabaseMetricsType metrics_type = database_->metrics_type();

  // Record the reason that initiated this recovery cycle. The first reason
  // wins: subsequent calls during the same recovery cycle (e.g. an open
  // failure after a destroy triggered by kCommitErrorThresholdExceeded) do not
  // overwrite it. So, the histogram correctly attributes the outcome to the
  // original reason.
  if (!recovery_state_) {
    recovery_state_.emplace(reason, metrics_type);
  }

  // We're about to set database_ to null, so delete the StorageAreaImpls
  // that might still be using the old database.
  areas_.clear();

  // Reset state to be in process of connecting. This will cause requests for
  // StorageAreas to be queued until the connection is complete.
  connection_state_ = CONNECTION_IN_PROGRESS;
  RecordCommitErrorCountAtReset("LocalStorage", commit_error_count_,
                                metrics_type);
  commit_error_count_ = 0;
  database_.reset();

  bool recreate_in_memory = false;

  // If tried to recreate database on disk already, try again but this time
  // in memory.
  if (tried_to_recreate_during_open_) {
    if (in_memory_) {
      // Give up completely, run without any database.
      OnConnectionFinished();
      return;
    }
    recreate_in_memory = true;
  }

  tried_to_recreate_during_open_ = true;

  // `!in_memory_` means the old database was on-disk and must be destroyed
  // before reopening.
  InitiateConnection(recreate_in_memory,
                     /*destroy_existing_db_for_recovery=*/!in_memory_);
}

LocalStorageImpl::StorageAreaHolder* LocalStorageImpl::GetOrCreateStorageArea(
    const blink::StorageKey& storage_key) {
  CHECK_EQ(connection_state_, CONNECTION_FINISHED);
  auto found = areas_.find(storage_key);
  if (found != areas_.end()) {
    return found->second.get();
  }

  PurgeUnusedAreasIfNeeded();

  auto holder = std::make_unique<StorageAreaHolder>(this, storage_key);
  StorageAreaHolder* holder_ptr = holder.get();
  areas_[storage_key] = std::move(holder);
  return holder_ptr;
}

void LocalStorageImpl::RetrieveStorageUsage(GetUsageCallback callback) {
  CHECK_EQ(connection_state_, ConnectionState::CONNECTION_FINISHED);

  if (!database_) {
    // If for whatever reason no database is available, no storage is
    // used, so return an array only containing the current areas.
    std::vector<mojom::StorageUsageInfoPtr> result;
    base::Time now = base::Time::Now();
    for (const auto& it : areas_) {
      result.emplace_back(mojom::StorageUsageInfo::New(it.first, 0, now));
    }
    std::move(callback).Run(std::move(result));
  } else {
    database_->ReadAllMetadata(
        base::BindOnce(&LocalStorageImpl::OnGotWriteMetaData,
                       weak_ptr_factory_.GetWeakPtr(), std::move(callback)));
  }
}

void LocalStorageImpl::OnGotWriteMetaData(
    GetUsageCallback callback,
    StatusOr<DomStorageDatabase::Metadata> all_metadata) {
  std::vector<mojom::StorageUsageInfoPtr> result;
  std::set<blink::StorageKey> storage_keys;

  // Update `result` to include maps that have committed data to disk.
  if (all_metadata.has_value()) {
    for (const DomStorageDatabase::MapMetadata& usage_metadata :
         all_metadata->map_metadata) {
      if (usage_metadata.last_modified && usage_metadata.total_size) {
        const blink::StorageKey& storage_key =
            usage_metadata.map_locator.storage_key();
        storage_keys.insert(storage_key);

        result.emplace_back(mojom::StorageUsageInfo::New(
            storage_key, usage_metadata.total_size->InBytes(),
            *usage_metadata.last_modified));
      }
    }
  }

  // Add any storage keys for which StorageAreas exist, but which haven't
  // committed any data to disk yet.
  base::Time now = base::Time::Now();
  for (const auto& it : areas_) {
    if (storage_keys.find(it.first) != storage_keys.end())
      continue;
    StorageAreaImpl* storage_area = it.second->storage_area();
    // Skip any storage keys that definitely don't have any data.
    if (!storage_area->has_pending_load_tasks() && storage_area->empty()) {
      continue;
    }
    result.emplace_back(mojom::StorageUsageInfo::New(
        it.first, storage_area->storage_used(), now));
  }
  std::move(callback).Run(std::move(result));
}

void LocalStorageImpl::GetStatistics(size_t* total_cache_size,
                                     size_t* unused_area_count) {
  *total_cache_size = 0;
  *unused_area_count = 0;
  for (const auto& it : areas_) {
    *total_cache_size += it.second->storage_area()->memory_used();
    if (!it.second->has_bindings())
      (*unused_area_count)++;
  }
}

void LocalStorageImpl::OnCommitResult(DbStatus status) {
  CHECK_EQ(connection_state_, CONNECTION_FINISHED);
  CHECK(database_);
  if (status.ok()) {
    const DatabaseMetricsType metrics_type = database_->metrics_type();
    if (commit_error_count_ > 0 && tried_to_recover_from_commit_errors_) {
      base::UmaHistogramEnumeration(
          base::StrCat(
              {"Storage.LocalStorage.Recovery.CommitErrorThresholdExceeded",
               MaybeGetOnDiskExperimentalSuffix(metrics_type)}),
          DomStorageDatabaseRecoveryOutcome::
              kTransientErrorsAfterAttemptedRecovery);
    }
    RecordCommitErrorCountAtReset("LocalStorage", commit_error_count_,
                                  metrics_type);
    commit_error_count_ = 0;
    return;
  }

  commit_error_count_++;
  if (commit_error_count_ > kCommitErrorThreshold) {
    if (tried_to_recover_from_commit_errors_) {
      // We already tried to recover from a high commit error rate before, but
      // are still having problems: there isn't really anything left to try, so
      // just ignore errors.
      base::UmaHistogramEnumeration(
          base::StrCat(
              {"Storage.LocalStorage.Recovery.CommitErrorThresholdExceeded",
               MaybeGetOnDiskExperimentalSuffix(database_->metrics_type())}),
          DomStorageDatabaseRecoveryOutcome::
              kOngoingErrorsAfterAttemptedRecovery);
      return;
    }
    tried_to_recover_from_commit_errors_ = true;

    // Deleting StorageAreas in here could cause more commits (and commit
    // errors), but those commits won't reach OnCommitResult because the area
    // will have been deleted before the commit finishes.
    DeleteAndRecreateDatabase(
        DomStorageRecoveryReason::kCommitErrorThresholdExceeded);
  }
}

void LocalStorageImpl::DeleteStaleStorageAreas() {
  if (database_ && database_->IsAuxUiMigrationHeld()) {
    database_->DeferForAuxUiMigration(base::BindOnce(&LocalStorageImpl::DeleteStaleStorageAreas,
        weak_ptr_factory_.GetWeakPtr()));
    return;
  }
  if (!database_ || connection_state_ != CONNECTION_FINISHED) {
    // Due to the delay before LocalStorageImpl::DeleteStaleStorageAreas is invoked
    // it's possible `database_` existed before, but no longer.
    return;
  }
  database_->ReadAllMetadata(
      base::BindOnce(&LocalStorageImpl::OnGotMetaDataToDeleteStaleStorageAreas,
                     weak_ptr_factory_.GetWeakPtr()));
}

void LocalStorageImpl::OnGotMetaDataToDeleteStaleStorageAreas(
    StatusOr<DomStorageDatabase::Metadata> all_metadata) {
  if (database_ && database_->IsAuxUiMigrationHeld()) {
    database_->DeferForAuxUiMigration(base::BindOnce(&LocalStorageImpl::OnGotMetaDataToDeleteStaleStorageAreas,
        weak_ptr_factory_.GetWeakPtr(), std::move(all_metadata)));
    return;
  }
  if (!database_ || connection_state_ != CONNECTION_FINISHED) {
    // This method is provided as a callback to an off thread task. Between the
    // time that the task is posted and now when this callback is invoked, the
    // `database_` member may have been reset.
    return;
  }
  if (!all_metadata.has_value()) {
    // ERROR: Failed to read from the database!
    return;
  }
  // Filter and collect stale storage areas for deletion.
  std::vector<blink::StorageKey> stale_storage_keys;
  std::vector<DomStorageDatabase::MapLocator> maps_to_delete;
  uint64_t orphans_found = 0;
  for (const DomStorageDatabase::MapMetadata& usage_metadata :
       all_metadata->map_metadata) {
    const blink::StorageKey& storage_key =
        usage_metadata.map_locator.storage_key();
    if (areas_.find(storage_key) != areas_.end()) {
      // If the storage area is currently loaded it must not be cleared.
      continue;
    }

    // Use the most recent last accessed time or last modified time.
    base::Time accessed_or_modified_time;
    if (usage_metadata.last_accessed && usage_metadata.last_modified) {
      accessed_or_modified_time = std::max(*usage_metadata.last_accessed,
                                           *usage_metadata.last_modified);
    } else if (usage_metadata.last_modified) {
      accessed_or_modified_time = *usage_metadata.last_modified;
    } else {
      accessed_or_modified_time = usage_metadata.last_accessed.value();
    }

    if ((base::Time::Now() - accessed_or_modified_time) >=
        base::Days(kLocalStorageStaleBucketCutoffInDays)) {
      // If the storage area has not been accessed or modified within 400 days
      // it can be cleared.
      stale_storage_keys.push_back(storage_key);
      maps_to_delete.emplace_back(storage_key);
    } else if ((storage_key.nonce().has_value() ||
                storage_key.top_level_site().opaque()) &&
               (base::Time::Now() - accessed_or_modified_time) >=
                   base::Days(1)) {
      // If the storage area has not been accessed or modified in this browsing
      // session and is transient (has a nonce) then it can be cleared.
      stale_storage_keys.push_back(storage_key);
      maps_to_delete.emplace_back(storage_key);
      orphans_found++;
    }
  }
  // These are counted independently to better track errors in rollout.
  base::UmaHistogramCounts100000(
      "LocalStorage.OrphanStorageAreasOnStartupCount", orphans_found);

  // Delete stale storage areas and count results.
  size_t deleted_count = stale_storage_keys.size();
  database_->DeleteStorageKeysFromSession(
      /*session_id=*/std::string(),
      /*metadata_to_delete=*/std::move(stale_storage_keys),
      std::move(maps_to_delete),
      base::BindOnce(
          [](size_t keys_deleted, DbStatus status) {
            base::UmaHistogramBoolean(
                "LocalStorage.StaleStorageAreasDeletedOnStartupSuccess",
                status.ok());
            if (status.ok()) {
              base::UmaHistogramCounts100000(
                  "LocalStorage.StaleStorageAreasDeletedOnStartupCount",
                  keys_deleted);
            }
          },
          deleted_count));
}

void LocalStorageImpl::OnReceiverDisconnected() {
  std::move(destruct_callback_).Run(this);
}

}  // namespace storage
