// Copyright 2017 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "components/services/storage/dom_storage/session_storage_impl.h"
#include "components/services/storage/public/mojom/local_storage_control.mojom.h"

#include <inttypes.h>

#include <utility>
#include <limits>
#include <set>

#include "base/barrier_closure.h"
#include "base/compiler_specific.h"
#include "base/functional/bind.h"
#include "base/functional/callback_helpers.h"
#include "base/memory/ptr_util.h"
#include "base/metrics/histogram_functions.h"
#include "base/not_fatal_until.h"
#include "base/numerics/safe_conversions.h"
#include "base/strings/strcat.h"
#include "base/strings/string_number_conversions.h"
#include "base/strings/stringprintf.h"
#include "base/system/sys_info.h"
#include "base/task/sequenced_task_runner.h"
#include "base/trace_event/memory_dump_manager.h"
#include "build/build_config.h"
#include "components/services/storage/dom_storage/async_dom_storage_database.h"
#include "components/services/storage/dom_storage/dom_storage_constants.h"
#include "components/services/storage/dom_storage/dom_storage_database.h"
#include "components/services/storage/dom_storage/dom_storage_histogram_helper.h"
#include "components/services/storage/dom_storage/features.h"
#include "components/services/storage/dom_storage/session_storage_area_impl.h"
#include "mojo/public/cpp/bindings/callback_helpers.h"
#include "mojo/public/cpp/bindings/self_owned_receiver.h"
#include "third_party/blink/public/common/storage_key/storage_key.h"

namespace storage {

namespace {

// Limits on the cache size and number of areas in memory, over which the areas
// are purged.
#if BUILDFLAG(IS_ANDROID)
const unsigned kMaxSessionStorageAreaCount = 10;
const size_t kMaxSessionStorageCacheSize = 2 * 1024 * 1024;
#else
const unsigned kMaxSessionStorageAreaCount = 50;
const size_t kMaxSessionStorageCacheSize = 20 * 1024 * 1024;
#endif

}  // namespace

SessionStorageImpl::SessionStorageImpl(
    const base::FilePath& storage_partition_directory,
    BackingMode backing_mode,
    DestructSessionStorageCallback destruct_callback,
    mojo::PendingReceiver<mojom::SessionStorageControl> receiver)
    : destruct_callback_(std::move(destruct_callback)),
      backing_mode_(backing_mode),
      storage_partition_directory_(storage_partition_directory),
      memory_dump_id_(base::StringPrintf("SessionStorage/0x%" PRIXPTR,
                                         reinterpret_cast<uintptr_t>(this))),
      receiver_(this, std::move(receiver)) {
  base::trace_event::MemoryDumpManager::GetInstance()
      ->RegisterDumpProviderWithSequencedTaskRunner(
          this, "SessionStorage",
          base::SequencedTaskRunner::GetCurrentDefault(),
          base::trace_event::MemoryDumpProvider::Options());
  receiver_.set_disconnect_handler(
      base::BindOnce(&SessionStorageImpl::OnReceiverDisconnected,
                     weak_ptr_factory_.GetWeakPtr()));
}

SessionStorageImpl::~SessionStorageImpl() {
  ShutDown();
  base::trace_event::MemoryDumpManager::GetInstance()->UnregisterDumpProvider(
      this);
}

void SessionStorageImpl::BindNamespace(
    const std::string& namespace_id,
    mojo::PendingReceiver<blink::mojom::SessionStorageNamespace> receiver) {
  if (database_ && database_->IsAuxUiMigrationHeld()) {
    database_->DeferForAuxUiMigration(base::BindOnce(&SessionStorageImpl::BindNamespace,
        weak_ptr_factory_.GetWeakPtr(), namespace_id, std::move(receiver)));
    return;
  }
  if (connection_state_ != CONNECTION_FINISHED) {
    RunWhenConnected(base::BindOnce(&SessionStorageImpl::BindNamespace,
                                    weak_ptr_factory_.GetWeakPtr(),
                                    namespace_id, std::move(receiver)));
    return;
  }
  auto found = namespaces_.find(namespace_id);
  if (found == namespaces_.end()) {
    return;
  }

  if (found->second->state() ==
      SessionStorageNamespaceImpl::State::kNotPopulated) {
    found->second->PopulateFromMetadata(
        database_.get(), metadata_.GetOrCreateNamespaceEntry(namespace_id));
  }

  PurgeUnusedAreasIfNeeded();
  found->second->Bind(std::move(receiver));
}

void SessionStorageImpl::BindStorageArea(
    const blink::StorageKey& storage_key,
    const std::string& namespace_id,
    mojo::PendingReceiver<blink::mojom::StorageArea> receiver) {
  if (database_ && database_->IsAuxUiMigrationHeld()) {
    database_->DeferForAuxUiMigration(base::BindOnce(&SessionStorageImpl::BindStorageArea,
        weak_ptr_factory_.GetWeakPtr(), storage_key, namespace_id, std::move(receiver)));
    return;
  }
  if (connection_state_ != CONNECTION_FINISHED) {
    RunWhenConnected(base::BindOnce(&SessionStorageImpl::BindStorageArea,
                                    weak_ptr_factory_.GetWeakPtr(), storage_key,
                                    namespace_id, std::move(receiver)));
    return;
  }

  auto found = namespaces_.find(namespace_id);
  if (found == namespaces_.end()) {
    return;
  }

  SessionStorageMetadata::NamespaceEntry namespace_entry =
      metadata_.GetOrCreateNamespaceEntry(namespace_id);

  if (found->second->state() ==
      SessionStorageNamespaceImpl::State::kNotPopulated) {
    found->second->PopulateFromMetadata(database_.get(), namespace_entry);
  }

  PurgeUnusedAreasIfNeeded();
  found->second->OpenArea(storage_key, std::move(receiver), namespace_entry);
}

void SessionStorageImpl::CreateNamespace(const std::string& namespace_id) {
  if (database_ && database_->IsAuxUiMigrationHeld()) {
    database_->DeferForAuxUiMigration(base::BindOnce(&SessionStorageImpl::CreateNamespace,
        weak_ptr_factory_.GetWeakPtr(), namespace_id));
    return;
  }
  if (namespaces_.find(namespace_id) != namespaces_.end())
    return;

  namespaces_.emplace(std::make_pair(
      namespace_id, CreateSessionStorageNamespaceImpl(namespace_id)));
}

void SessionStorageImpl::CloneNamespace(
    const std::string& clone_from_namespace_id,
    const std::string& clone_to_namespace_id,
    mojom::SessionStorageCloneType clone_type) {
  if (database_ && database_->IsAuxUiMigrationHeld()) {
    database_->DeferForAuxUiMigration(base::BindOnce(&SessionStorageImpl::CloneNamespace,
        weak_ptr_factory_.GetWeakPtr(), clone_from_namespace_id, clone_to_namespace_id, clone_type));
    return;
  }
  if (namespaces_.find(clone_to_namespace_id) != namespaces_.end()) {
    // Non-immediate clones expect to be paired with a |Clone| from the mojo
    // namespace object. If that clone has already happened, then we don't need
    // to do anything here.
    // However, immediate clones happen without a |Clone| from the mojo
    // namespace object, so there should never be a namespace already populated
    // for an immediate clone.
    DCHECK_NE(clone_type, mojom::SessionStorageCloneType::kImmediate);
    return;
  }

  auto clone_from_ns = namespaces_.find(clone_from_namespace_id);
  std::unique_ptr<SessionStorageNamespaceImpl> clone_to_namespace_impl =
      CreateSessionStorageNamespaceImpl(clone_to_namespace_id);
  switch (clone_type) {
    case mojom::SessionStorageCloneType::kImmediate: {
      // If the namespace doesn't exist or it's not populated yet, just create
      // an empty session storage by not marking it as pending a clone.
      if (clone_from_ns == namespaces_.end() ||
          !clone_from_ns->second->IsPopulated()) {
        break;
      }
      clone_from_ns->second->Clone(clone_to_namespace_id);
      return;
    }
    case mojom::SessionStorageCloneType::kWaitForCloneOnNamespace:
      if (clone_from_ns != namespaces_.end()) {
        // The namespace exists and is in-use, so wait until receiving a clone
        // call on that mojo binding.
        clone_to_namespace_impl->SetPendingPopulationFromParentNamespace(
            clone_from_namespace_id);
        clone_from_ns->second->AddChildNamespaceWaitingForClone(
            clone_to_namespace_id);
      } else if (metadata_.namespace_storage_key_map().contains(
                     clone_from_namespace_id)) {
        CHECK_EQ(connection_state_, CONNECTION_FINISHED);

        // The namespace exists on disk but is not in-use, so do the appropriate
        // metadata operations to clone the namespace and set up the new object.
        auto source_namespace_entry =
            metadata_.GetOrCreateNamespaceEntry(clone_from_namespace_id);
        auto namespace_entry =
            metadata_.GetOrCreateNamespaceEntry(clone_to_namespace_id);
        metadata_.RegisterShallowClonedNamespace(source_namespace_entry,
                                                 namespace_entry);
        if (database_) {
          database_->PutMetadata(
              SessionStorageMetadata::ToDomStorageMetadata(namespace_entry),
              base::BindOnce(&SessionStorageImpl::OnCommitResult,
                             weak_ptr_factory_.GetWeakPtr()));
        }
      }
      // If there is no sign of a source namespace, just run with an empty
      // namespace.
      break;
    default:
      NOTREACHED();
  }
  namespaces_.emplace(
      std::piecewise_construct, std::forward_as_tuple(clone_to_namespace_id),
      std::forward_as_tuple(std::move(clone_to_namespace_impl)));
}

void SessionStorageImpl::DeleteNamespace(const std::string& namespace_id,
                                         bool should_persist) {
  if (database_ && database_->IsAuxUiMigrationHeld()) {
    database_->DeferForAuxUiMigration(base::BindOnce(&SessionStorageImpl::DeleteNamespace,
        weak_ptr_factory_.GetWeakPtr(), namespace_id, should_persist));
    return;
  }
  auto namespace_it = namespaces_.find(namespace_id);
  // If the namespace has pending clones, do the clone now before destroying it.
  if (namespace_it != namespaces_.end()) {
    SessionStorageNamespaceImpl* namespace_ptr = namespace_it->second.get();
    if (namespace_ptr->HasChildNamespacesWaitingForClone()) {
      // Wait until we are connected, as it simplifies our choices.
      if (connection_state_ != CONNECTION_FINISHED) {
        RunWhenConnected(base::BindOnce(&SessionStorageImpl::DeleteNamespace,
                                        weak_ptr_factory_.GetWeakPtr(),
                                        namespace_id, should_persist));
        return;
      }
      namespace_ptr->CloneAllNamespacesWaitingForClone(database_.get(),
                                                       &metadata_, namespaces_);
    }

    // The object hierarchy uses iterators bound to the metadata object, so
    // make sure to delete the object hierarchy first.
    namespaces_.erase(namespace_it);
  }

  if (!has_scavenged_ && should_persist)
    protected_namespaces_from_scavenge_.insert(namespace_id);

  if (!should_persist) {
    RunWhenConnected(base::BindOnce(
        &SessionStorageImpl::DeleteNamespacesFromMetadataAndDatabase,
        weak_ptr_factory_.GetWeakPtr(),
        std::vector<std::string>({namespace_id})));
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
  for (auto& map : snapshot.maps) {
    auto output = mojom::AuxUiDomMapSnapshot::New();
    output->storage_key = std::move(map.storage_key);
    output->session_ids = std::move(map.session_ids);
    output->map_ordinal = map.map_ordinal;
    output->map_id = map.map_id;
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
    for (auto& [key, value] : map.source)
      output->source_entries.push_back(blink::mojom::KeyValue::New(key, std::move(value)));
    for (auto& [key, value] : map.target)
      output->target_entries.push_back(blink::mojom::KeyValue::New(key, std::move(value)));
    for (auto& view : map.cache_views) {
      auto cached = mojom::AuxUiDomCacheView::New();
      cached->namespace_id = std::move(view.namespace_id);
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
}  // namespace

void SessionStorageImpl::BeginAuxUiPreferenceLease(
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
  for (const auto& [id, space] : namespaces_) {
    if (!space->CanFreezeAuxUiMigrationNamespace()) {
      std::move(callback).Run(AuxDomLeaseFailure(std::nullopt, nullptr,
          "Session namespace has unresolved clone/population/bind work"));
      return;
    }
  }
  aux_ui_request_ = request_id;
  const uint64_t generation = ++aux_ui_generation_;
  for (const auto& [id, space] : namespaces_) {
    if (!space->FreezeAuxUiMigrationNamespace(request_id)) {
      if (ResumeAuxUiNamespaces(request_id)) {
        aux_ui_frozen_namespaces_.clear();
        aux_ui_namespaces_resumed_ = false;
        aux_ui_namespace_error_.clear();
        aux_ui_request_.reset();
      }
      std::move(callback).Run(AuxDomLeaseFailure(aux_ui_request_, nullptr,
          "Native session namespace freeze changed after preflight"));
      return;
    }
    aux_ui_frozen_namespaces_.push_back(id);
  }
  database_->BeginAuxUiMigrationLease(base::BindOnce(
      [](base::WeakPtr<SessionStorageImpl> owner, base::UnguessableToken request,
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
          if (!owner->ResumeAuxUiNamespaces(request)) {
            std::move(callback).Run(AuxDomLeaseFailure(owner->aux_ui_request_, nullptr,
                owner->aux_ui_namespace_error_));
            return;
          }
          owner->aux_ui_frozen_namespaces_.clear();
          owner->aux_ui_namespaces_resumed_ = false;
          owner->aux_ui_namespace_error_.clear();
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
bool SessionStorageImpl::OwnsAuxUiLease(const base::UnguessableToken& request,
    const base::UnguessableToken& token, uint64_t generation) const {
  return aux_ui_request_ == request && aux_ui_lease_ && database_ &&
      aux_ui_lease_->token() == token && aux_ui_generation_ == generation;
}
void SessionStorageImpl::CompleteAuxUiOperation(base::WeakPtr<SessionStorageImpl> owner,
    base::UnguessableToken request, base::UnguessableToken token,
    uint64_t generation, AuxUiReplyCallback callback,
    StatusOr<AsyncDomStorageDatabase::AuxUiSnapshot> result) {
  if (!owner || !owner->OwnsAuxUiLease(request, token, generation)) {
    std::move(callback).Run(AuxDomLeaseFailure(request, nullptr, "Aux DOM service owner changed"));
  } else if (!result.has_value()) {
    std::move(callback).Run(AuxDomLeaseFailure(owner->aux_ui_request_, owner->aux_ui_lease_.get(), result.error().ToString()));
  } else {
    if (!owner->aux_ui_namespace_error_.empty()) {
      result.value().native_error = owner->aux_ui_namespace_error_;
      result.value().source_ready = false;
    }
    std::move(callback).Run(AuxDomLeaseSnapshot(request, *owner->aux_ui_lease_, std::move(result).value()));
  }
}
void SessionStorageImpl::RunAuxUiOperation(const base::UnguessableToken& request,
    const base::UnguessableToken& token, AuxUiOperation operation,
    AuxUiReplyCallback callback) {
  if (!OwnsAuxUiLease(request, token, aux_ui_generation_) || aux_ui_release_pending_) {
    std::move(callback).Run(AuxDomLeaseFailure(aux_ui_request_, aux_ui_lease_.get(),
        "Exact original native-held lease required; release may still be pending"));
    return;
  }
  auto completed = base::BindOnce(&SessionStorageImpl::CompleteAuxUiOperation,
      weak_ptr_factory_.GetWeakPtr(), request, token, aux_ui_generation_, std::move(callback));
  switch (operation) {
    case AuxUiOperation::kRead: database_->ReadAuxUiMigrationLease(*aux_ui_lease_, std::move(completed)); return;
    case AuxUiOperation::kValidate: database_->ValidateAuxUiMigrationLease(*aux_ui_lease_, std::move(completed)); return;
    case AuxUiOperation::kCommit: database_->CommitAuxUiMigrationLease(*aux_ui_lease_, std::move(completed)); return;
    case AuxUiOperation::kRestore: database_->RestoreAuxUiMigrationLease(*aux_ui_lease_, std::move(completed)); return;
    case AuxUiOperation::kPublish: database_->PublishAuxUiMigrationLease(*aux_ui_lease_, std::move(completed)); return;
  }
}
void SessionStorageImpl::ReadAuxUiPreferenceLease(const base::UnguessableToken& request_id, ReadAuxUiPreferenceLeaseCallback callback) {
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
void SessionStorageImpl::ValidateAuxUiPreferenceLease(const base::UnguessableToken& request_id, const base::UnguessableToken& token, ValidateAuxUiPreferenceLeaseCallback callback) {
  RunAuxUiOperation(request_id, token, AuxUiOperation::kValidate, std::move(callback));
}
void SessionStorageImpl::CommitAuxUiPreferenceLease(const base::UnguessableToken& request_id, const base::UnguessableToken& token, CommitAuxUiPreferenceLeaseCallback callback) {
  RunAuxUiOperation(request_id, token, AuxUiOperation::kCommit, std::move(callback));
}
void SessionStorageImpl::RestoreAuxUiPreferenceLease(const base::UnguessableToken& request_id, const base::UnguessableToken& token, RestoreAuxUiPreferenceLeaseCallback callback) {
  RunAuxUiOperation(request_id, token, AuxUiOperation::kRestore, std::move(callback));
}
void SessionStorageImpl::PublishAuxUiPreferenceLease(const base::UnguessableToken& request_id, const base::UnguessableToken& token, PublishAuxUiPreferenceLeaseCallback callback) {
  RunAuxUiOperation(request_id, token, AuxUiOperation::kPublish, std::move(callback));
}
void SessionStorageImpl::StageAuxUiPreferenceTargets(
    const base::UnguessableToken& request_id, const base::UnguessableToken& token,
    std::vector<mojom::AuxUiDomTargetMapPtr> targets,
    StageAuxUiPreferenceTargetsCallback callback) {
  std::vector<AsyncDomStorageDatabase::AuxUiTargetMap> converted;
  if (!OwnsAuxUiLease(request_id, token, aux_ui_generation_) || aux_ui_release_pending_ ||
      !ConvertAuxDomTargets(std::move(targets), &converted)) {
    std::move(callback).Run(AuxDomLeaseFailure(aux_ui_request_, aux_ui_lease_.get(),
        "Exact lease and unique captured ordinals/raw selected keys required"));
    return;
  }
  database_->StageAuxUiMigrationTargets(*aux_ui_lease_, std::move(converted),
      base::BindOnce(&SessionStorageImpl::CompleteAuxUiOperation, weak_ptr_factory_.GetWeakPtr(),
          request_id, token, aux_ui_generation_, std::move(callback)));
}
DbStatus SessionStorageImpl::BeforeAuxUiLeaseReopen(base::WeakPtr<SessionStorageImpl> owner,
    base::UnguessableToken request, base::UnguessableToken token, uint64_t generation) {
  if (!owner || !owner->aux_ui_release_pending_ ||
      !owner->OwnsAuxUiLease(request, token, generation))
    return DbStatus::IOError("Exact native service release owner changed");
  if (!owner->ResumeAuxUiNamespaces(request))
    return DbStatus::IOError(owner->aux_ui_namespace_error_);
  return DbStatus::OK();
}
void SessionStorageImpl::AuxUiLeaseReleased(base::WeakPtr<SessionStorageImpl> owner,
    base::UnguessableToken request, base::UnguessableToken token, uint64_t generation,
    ReleaseAuxUiPreferenceLeaseCallback callback, DbStatus status) {
  if (!owner || !owner->OwnsAuxUiLease(request, token, generation)) {
    std::move(callback).Run(false); return;
  }
  owner->aux_ui_release_pending_ = false;
  if (!status.ok()) {
    if (owner->aux_ui_namespaces_resumed_) owner->ReholdAuxUiNamespaces(request);
    std::move(callback).Run(false); return;
  }
  owner->aux_ui_frozen_namespaces_.clear();
  owner->aux_ui_namespaces_resumed_ = false;
  owner->aux_ui_namespace_error_.clear();
  // Record only after the actual asynchronous backend/cache/namespace
  // cleanup succeeded; a lost Mojo reply can then be discovered without rerun.
  owner->aux_ui_retired_requests_.insert(request);
  owner->aux_ui_released_ = AuxUiReleasedReceipt{request, token, generation};
  owner->aux_ui_lease_.reset();
  owner->aux_ui_request_.reset();
  std::move(callback).Run(true);
}
void SessionStorageImpl::ReleaseAuxUiPreferenceLease(
    const base::UnguessableToken& request_id, const base::UnguessableToken& token,
    ReleaseAuxUiPreferenceLeaseCallback callback) {
  if (!OwnsAuxUiLease(request_id, token, aux_ui_generation_) || aux_ui_release_pending_) {
    std::move(callback).Run(false); return;
  }
  aux_ui_release_pending_ = true;
  // Only this concrete native service constructs the synchronous prerequisite;
  // no readiness callback, root or restore map comes from Mojo/UI callers.
  database_->ReleaseAuxUiMigrationLease(*aux_ui_lease_,
      base::BindOnce(&SessionStorageImpl::BeforeAuxUiLeaseReopen, weak_ptr_factory_.GetWeakPtr(),
          request_id, token, aux_ui_generation_),
      base::BindOnce(&SessionStorageImpl::AuxUiLeaseReleased, weak_ptr_factory_.GetWeakPtr(),
          request_id, token, aux_ui_generation_, std::move(callback)));
}

bool SessionStorageImpl::ReholdAuxUiNamespaces(const base::UnguessableToken& request) {
  bool held = true;
  for (const auto& id : aux_ui_frozen_namespaces_) {
    auto found = namespaces_.find(id);
    if (found == namespaces_.end() ||
        !found->second->ReholdAuxUiMigrationNamespaceAfterFailedResume(request)) held = false;
  }
  aux_ui_namespaces_resumed_ = false;
  if (!held) aux_ui_namespace_error_ = "Native namespace rehold uncertain; backend admission remains held";
  return held;
}
bool SessionStorageImpl::ResumeAuxUiNamespaces(const base::UnguessableToken& request) {
  // Preflight ALL actual retained namespace identities before changing any.
  for (const auto& id : aux_ui_frozen_namespaces_) {
    auto found = namespaces_.find(id);
    if (found == namespaces_.end() ||
        !found->second->CanResumeAuxUiMigrationNamespace(request)) {
      aux_ui_namespace_error_ = "Exact frozen namespace owner changed"; return false;
    }
  }
  std::vector<std::string> resumed;
  for (const auto& id : aux_ui_frozen_namespaces_) {
    auto found = namespaces_.find(id);
    if (!found->second->ResumeAuxUiMigrationNamespace(request)) {
      bool reheld = true;
      // Same owning task, before yielding or permitting backend ordinary work.
      for (const auto& prior : resumed) {
        auto actual = namespaces_.find(prior);
        if (actual == namespaces_.end() ||
            !actual->second->ReholdAuxUiMigrationNamespaceAfterFailedResume(request)) reheld = false;
      }
      aux_ui_namespace_error_ = reheld ? "Native namespace resume refused; exact holds restored"
          : "Native namespace rehold uncertain; backend admission remains held";
      return false;
    }
    resumed.push_back(id);
  }
  aux_ui_namespaces_resumed_ = true;
  aux_ui_namespace_error_.clear();
  return true;
}

void SessionStorageImpl::DrainAuxUiMigration(DrainAuxUiMigrationCallback callback) {
  DrainLoadedAreasForAuxMigration(base::BindOnce(
      [](DrainAuxUiMigrationCallback reply, DbStatus status) {
        std::move(reply).Run(status.ok());
      }, std::move(callback)));
}

void SessionStorageImpl::DrainLoadedAreasForAuxMigration(
    AsyncDomStorageDatabase::StatusCallback callback) {
  if (connection_state_ != CONNECTION_FINISHED || !database_ || in_memory_ ||
      storage_partition_directory_.empty()) {
    std::move(callback).Run(
        DbStatus::IOError("Aux migration requires an existing disk backend"));
    return;
  }
  for (const auto& entry : data_maps_) {
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
  for (const auto& entry : data_maps_) {
    entry.second->storage_area()->ScheduleImmediateCommit();
  }
  auto reply = base::BindOnce(
      [](base::WeakPtr<SessionStorageImpl> owner,
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

void SessionStorageImpl::Flush() {
  if (database_ && database_->IsAuxUiMigrationHeld()) {
    database_->DeferForAuxUiMigration(base::BindOnce(&SessionStorageImpl::Flush,
        weak_ptr_factory_.GetWeakPtr()));
    return;
  }
  if (connection_state_ != CONNECTION_FINISHED) {
    RunWhenConnected(base::BindOnce(&SessionStorageImpl::Flush,
                                    weak_ptr_factory_.GetWeakPtr()));
    return;
  }

  for (const auto& it : data_maps_)
    it.second->storage_area()->ScheduleImmediateCommit();
}

void SessionStorageImpl::GetUsage(GetUsageCallback callback) {
  if (connection_state_ != CONNECTION_FINISHED) {
    RunWhenConnected(base::BindOnce(&SessionStorageImpl::GetUsage,
                                    weak_ptr_factory_.GetWeakPtr(),
                                    std::move(callback)));
    return;
  }

  const SessionStorageMetadata::NamespaceStorageKeyMap& all_namespaces =
      metadata_.namespace_storage_key_map();

  std::vector<mojom::SessionStorageUsageInfoPtr> result;
  result.reserve(all_namespaces.size());
  for (const auto& pair : all_namespaces) {
    for (const auto& storage_key_map_pair : pair.second) {
      result.push_back(mojom::SessionStorageUsageInfo::New(
          storage_key_map_pair.first, pair.first));
    }
  }
  std::move(callback).Run(std::move(result));
}

void SessionStorageImpl::DeleteStorage(const blink::StorageKey& storage_key,
                                       const std::string& namespace_id,
                                       DeleteStorageCallback callback) {
  if (database_ && database_->IsAuxUiMigrationHeld()) {
    database_->DeferForAuxUiMigration(base::BindOnce(&SessionStorageImpl::DeleteStorage,
        weak_ptr_factory_.GetWeakPtr(), storage_key, namespace_id, std::move(callback)));
    return;
  }
  if (connection_state_ != CONNECTION_FINISHED) {
    RunWhenConnected(base::BindOnce(&SessionStorageImpl::DeleteStorage,
                                    weak_ptr_factory_.GetWeakPtr(), storage_key,
                                    namespace_id, std::move(callback)));
    return;
  }

  auto found = namespaces_.find(namespace_id);
  if (found != namespaces_.end() &&
      found->second->state() !=
          SessionStorageNamespaceImpl::State::kNotPopulated) {
    found->second->RemoveStorageKeyData(storage_key, std::move(callback));
    return;
  }

  // If we don't have the namespace loaded, then we can delete it all using the
  // metadata.
  scoped_refptr<DomStorageDatabase::SharedMapLocator> map_locator =
      metadata_.TakeExistingMap(namespace_id, storage_key);
  if (!map_locator || !database_) {
    // Nothing to delete.
    std::move(callback).Run();
    return;
  }

  // Delete `storage_key` from `namespace_id` in the database.  Also delete
  // `map_locator` when not referenced by a cloned session.
  std::vector<DomStorageDatabase::MapLocator> maps_to_delete;
  if (map_locator->session_ids().empty()) {
    maps_to_delete.emplace_back(std::move(*map_locator));
  }
  database_->DeleteStorageKeysFromSession(
      namespace_id, /*metadata_to_delete=*/{storage_key},
      std::move(maps_to_delete),
      base::BindOnce(&SessionStorageImpl::OnCommitResult,
                     weak_ptr_factory_.GetWeakPtr())
          .Then(std::move(callback)));
}

void SessionStorageImpl::CleanUpStorage(CleanUpStorageCallback callback) {
  if (database_ && database_->IsAuxUiMigrationHeld()) {
    database_->DeferForAuxUiMigration(base::BindOnce(&SessionStorageImpl::CleanUpStorage,
        weak_ptr_factory_.GetWeakPtr(), std::move(callback)));
    return;
  }
  if (connection_state_ != CONNECTION_FINISHED) {
    RunWhenConnected(base::BindOnce(&SessionStorageImpl::CleanUpStorage,
                                    weak_ptr_factory_.GetWeakPtr(),
                                    std::move(callback)));
    return;
  }
  if (database_) {
    for (const auto& it : data_maps_) {
      it.second->storage_area()->ScheduleImmediateCommit();
    }
    database_->CleanUpStaleData(
        base::IgnoreArgs<DbStatus>(std::move(callback)));
  } else {
    std::move(callback).Run();
  }
}

void SessionStorageImpl::ShutDown() {
  receiver_.reset();

  // The namespaces will DCHECK if they are destructed with pending clones. It
  // is valid to drop these on shutdown.
  for (auto& namespace_pair : namespaces_) {
    namespace_pair.second->ClearChildNamespacesWaitingForClone();
  }

  // Nothing to do if no connection to the database was ever finished.
  if (connection_state_ == CONNECTION_FINISHED) {
    // Flush any uncommitted data.
    for (const auto& it : data_maps_) {
      auto* area = it.second->storage_area();
      area->ScheduleImmediateCommit();
    }
  }
}

void SessionStorageImpl::PurgeMemory() {
  if (database_ && database_->IsAuxUiMigrationHeld()) {
    database_->DeferForAuxUiMigration(base::BindOnce(&SessionStorageImpl::PurgeMemory,
        weak_ptr_factory_.GetWeakPtr()));
    return;
  }
  // Purge all areas that don't have bindings.
  for (const auto& namespace_pair : namespaces_) {
    namespace_pair.second->PurgeUnboundAreas();
  }
  // Purge memory from bound maps.
  for (const auto& data_map_pair : data_maps_) {
    data_map_pair.second->storage_area()->PurgeMemory();
  }
}

void SessionStorageImpl::PurgeUnusedAreasIfNeeded() {
  if (database_ && database_->IsAuxUiMigrationHeld()) {
    database_->DeferForAuxUiMigration(base::BindOnce(&SessionStorageImpl::PurgeUnusedAreasIfNeeded,
        weak_ptr_factory_.GetWeakPtr()));
    return;
  }
  size_t total_cache_size, unused_area_count;
  GetStatistics(&total_cache_size, &unused_area_count);

  // Nothing to purge.
  if (!unused_area_count) {
    return;
  }

  bool cache_size_limit_exceeded =
      total_cache_size > kMaxSessionStorageCacheSize;

  bool area_count_limit_exceeded =
      data_maps_.size() > kMaxSessionStorageAreaCount;

  if (cache_size_limit_exceeded || area_count_limit_exceeded ||
      base::SysInfo::IsLowEndDeviceOrPartialLowEndModeEnabled()) {
    // Purge all areas that don't have bindings.
    for (const auto& namespace_pair : namespaces_) {
      namespace_pair.second->PurgeUnboundAreas();
    }
  }
}

void SessionStorageImpl::ScavengeUnusedNamespaces() {
  if (database_ && database_->IsAuxUiMigrationHeld()) {
    database_->DeferForAuxUiMigration(base::BindOnce(&SessionStorageImpl::ScavengeUnusedNamespaces,
        weak_ptr_factory_.GetWeakPtr()));
    return;
  }
  if (has_scavenged_) {
    return;
  }
  if (connection_state_ != CONNECTION_FINISHED) {
    RunWhenConnected(
        base::BindOnce(&SessionStorageImpl::ScavengeUnusedNamespaces,
                       weak_ptr_factory_.GetWeakPtr()));
    return;
  }
  has_scavenged_ = true;
  std::vector<std::string> namespaces_to_delete;
  for (const auto& metadata_namespace : metadata_.namespace_storage_key_map()) {
    const std::string& namespace_id = metadata_namespace.first;
    if (namespaces_.contains(namespace_id) ||
        protected_namespaces_from_scavenge_.contains(namespace_id)) {
      continue;
    }
    namespaces_to_delete.push_back(namespace_id);
  }
  DeleteNamespacesFromMetadataAndDatabase(std::move(namespaces_to_delete));
  protected_namespaces_from_scavenge_.clear();
}

bool SessionStorageImpl::OnMemoryDump(
    const base::trace_event::MemoryDumpArgs& args,
    base::trace_event::ProcessMemoryDump* pmd) {
  if (connection_state_ != CONNECTION_FINISHED)
    return true;

  std::string context_name =
      base::StringPrintf("site_storage/sessionstorage/0x%" PRIXPTR,
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
                   data_maps_.size());
    return true;
  }
  for (const auto& it : data_maps_) {
    const auto& storage_key = it.second->map_locator().storage_key();
    std::string storage_key_str =
        storage_key.GetMemoryDumpString(/*max_length=*/50);
    std::string area_dump_name = base::StringPrintf(
        "%s/%s/0x%" PRIXPTR, context_name.c_str(), storage_key_str.c_str(),
        reinterpret_cast<uintptr_t>(it.second->storage_area()));
    it.second->storage_area()->OnMemoryDump(area_dump_name, pmd);
  }
  return true;
}

const base::FilePath& SessionStorageImpl::GetStoragePartitionDirectory() const {
  return storage_partition_directory_;
}

void SessionStorageImpl::FlushAreaForTesting(
    const std::string& namespace_id,
    const blink::StorageKey& storage_key) {
  if (connection_state_ != CONNECTION_FINISHED)
    return;
  const auto& it = namespaces_.find(namespace_id);
  if (it == namespaces_.end())
    return;
  it->second->FlushStorageKeyForTesting(storage_key);
}

void SessionStorageImpl::SetDatabaseOpenCallbackForTesting(
    base::OnceClosure callback) {
  RunWhenConnected(std::move(callback));
}

void SessionStorageImpl::OnDataMapCreation(int64_t map_id,
                                           SessionStorageDataMap* map) {
  auto result = data_maps_.emplace(std::piecewise_construct,
                                   std::forward_as_tuple(map_id),
                                   std::forward_as_tuple(map));

  // `map_id` must identify a unique new map that did not exist in `data_maps_`.
  CHECK(result.second);
}

void SessionStorageImpl::OnDataMapDestruction(int64_t map_id) {
  data_maps_.erase(map_id);
}

void SessionStorageImpl::OnCommitResult(DbStatus status) {
  // Previous commit errors deleted and recreated the database below. Ignore
  // additional errors from the old database while waiting for the new database
  // to open. The `!database_` check additionally handles the case where
  // recovery failed completely and we are now running without a database.
  if (connection_state_ != CONNECTION_FINISHED || !database_) {
    return;
  }
  if (status.ok()) {
    const DatabaseMetricsType metrics_type = database_->metrics_type();
    if (commit_error_count_ > 0 && tried_to_recover_from_commit_errors_) {
      base::UmaHistogramEnumeration(
          base::StrCat(
              {"Storage.SessionStorage.Recovery.CommitErrorThresholdExceeded",
               MaybeGetOnDiskExperimentalSuffix(metrics_type)}),
          DomStorageDatabaseRecoveryOutcome::
              kTransientErrorsAfterAttemptedRecovery);
    }
    RecordCommitErrorCountAtReset("SessionStorage", commit_error_count_,
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
              {"Storage.SessionStorage.Recovery.CommitErrorThresholdExceeded",
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

scoped_refptr<SessionStorageDataMap>
SessionStorageImpl::MaybeGetExistingDataMapForId(int64_t map_id) {
  auto it = data_maps_.find(map_id);
  if (it == data_maps_.end())
    return nullptr;
  return base::WrapRefCounted(it->second);
}

void SessionStorageImpl::RegisterShallowClonedNamespace(
    const std::string& source_namespace_id,
    const std::string& new_namespace_id,
    const SessionStorageNamespaceImpl::StorageKeyAreas& clone_from_areas) {
  bool found = false;
  auto it = namespaces_.find(new_namespace_id);
  if (it != namespaces_.end()) {
    found = true;
    if (it->second->IsPopulated()) {
      // Assumes this method is called on a stack handling a mojo message.
      receiver_.ReportBadMessage("Cannot clone to already populated namespace");
      return;
    }
  }

  CHECK_EQ(connection_state_, CONNECTION_FINISHED);

  auto source_namespace_entry =
      metadata_.GetOrCreateNamespaceEntry(source_namespace_id);
  auto namespace_entry = metadata_.GetOrCreateNamespaceEntry(new_namespace_id);
  metadata_.RegisterShallowClonedNamespace(source_namespace_entry,
                                           namespace_entry);

  if (database_) {
    database_->PutMetadata(
        SessionStorageMetadata::ToDomStorageMetadata(namespace_entry),
        base::BindOnce(&SessionStorageImpl::OnCommitResult,
                       weak_ptr_factory_.GetWeakPtr()));
  }

  if (found) {
    it->second->PopulateAsClone(database_.get(), namespace_entry,
                                clone_from_areas);
    return;
  }

  auto namespace_impl = CreateSessionStorageNamespaceImpl(new_namespace_id);
  namespace_impl->PopulateAsClone(database_.get(), namespace_entry,
                                  clone_from_areas);
  namespaces_.emplace(std::piecewise_construct,
                      std::forward_as_tuple(new_namespace_id),
                      std::forward_as_tuple(std::move(namespace_impl)));
}

std::unique_ptr<SessionStorageNamespaceImpl>
SessionStorageImpl::CreateSessionStorageNamespaceImpl(
    std::string namespace_id) {
  SessionStorageAreaImpl::RegisterNewAreaMap map_id_callback =
      base::BindRepeating(&SessionStorageMetadata::RegisterNewMap,
                          base::Unretained(&metadata_));

  return std::make_unique<SessionStorageNamespaceImpl>(
      std::move(namespace_id), this, std::move(map_id_callback), this);
}

void SessionStorageImpl::DeleteNamespacesFromMetadataAndDatabase(
    std::vector<std::string> namespace_ids) {
  if (database_ && database_->IsAuxUiMigrationHeld()) {
    database_->DeferForAuxUiMigration(base::BindOnce(&SessionStorageImpl::DeleteNamespacesFromMetadataAndDatabase,
        weak_ptr_factory_.GetWeakPtr(), std::move(namespace_ids)));
    return;
  }
  CHECK_EQ(connection_state_, CONNECTION_FINISHED);

  // Remove each namespace from `metadata_`.
  std::vector<DomStorageDatabase::MapLocator> maps_to_delete;
  for (const std::string& namespace_id : namespace_ids) {
    std::map<blink::StorageKey,
             scoped_refptr<DomStorageDatabase::SharedMapLocator>>
        namespace_to_delete = metadata_.TakeNamespace(namespace_id);

    // Find unreferenced map key/value pairs to delete from `database_`.
    for (auto& [storage_key, map_locator] : namespace_to_delete) {
      if (map_locator->session_ids().empty()) {
        maps_to_delete.emplace_back(std::move(*map_locator));
      }
    }
  }

  // Delete the namespaces and map key/values from `database_`.
  if (!database_) {
    return;
  }
  database_->DeleteSessions(std::move(namespace_ids), std::move(maps_to_delete),
                            base::BindOnce(&SessionStorageImpl::OnCommitResult,
                                           weak_ptr_factory_.GetWeakPtr()));
}

void SessionStorageImpl::RunWhenConnected(base::OnceClosure callback) {
  if (database_ && database_->IsAuxUiMigrationHeld()) {
    database_->DeferForAuxUiMigration(base::BindOnce(&SessionStorageImpl::RunWhenConnected,
        weak_ptr_factory_.GetWeakPtr(), std::move(callback)));
    return;
  }
  switch (connection_state_) {
    case NO_CONNECTION:
      // If we don't have a filesystem_connection_, we'll need to establish one.
      connection_state_ = CONNECTION_IN_PROGRESS;
      receiver_.Pause();
      on_database_opened_callbacks_.push_back(std::move(callback));
      InitiateConnection();
      return;
    case CONNECTION_IN_PROGRESS:
      // Queue this OpenSessionStorage call for when we have a level db pointer.
      on_database_opened_callbacks_.push_back(std::move(callback));
      return;
    case CONNECTION_FINISHED:
      std::move(callback).Run();
      return;
  }
  NOTREACHED();
}

void SessionStorageImpl::InitiateConnection(
    bool in_memory_only,
    bool destroy_existing_db_for_recovery) {
  CHECK_EQ(connection_state_, CONNECTION_IN_PROGRESS);

  // Use an in-memory database unless we were given a usable subdirectory and
  // weren't asked to stay in memory.
  in_memory_ = in_memory_only || backing_mode_ == BackingMode::kNoDisk ||
               storage_partition_directory_.empty();
  const base::FilePath dir_to_open =
      in_memory_ ? base::FilePath() : storage_partition_directory_;

  // Recovery destroys the pre-existing on-disk database before reopening (which
  // may itself be in-memory). `kClearDiskStateOnOpen` also destroys any
  // pre-existing on-disk state, but only when actually opening on disk (an
  // empty dir has nothing to destroy). An empty `dir_to_destroy` means no
  // destroy.
  const bool destroy_existing =
      destroy_existing_db_for_recovery ||
      (!in_memory_ && backing_mode_ == BackingMode::kClearDiskStateOnOpen);
  const base::FilePath dir_to_destroy =
      destroy_existing ? storage_partition_directory_ : base::FilePath();
  database_ = AsyncDomStorageDatabase::Open(
      StorageType::kSessionStorage, dir_to_open, memory_dump_id_,
      dir_to_destroy,
      base::BindOnce(&SessionStorageImpl::OnDatabaseOpened,
                     weak_ptr_factory_.GetWeakPtr()));
}

void SessionStorageImpl::OnDatabaseOpened(
    AsyncDomStorageDatabase::OpenOutcome outcome) {
  // If this open destroyed a pre-existing database, log the destroy result.
  // This covers both recovery and the `kClearDiskStateOnOpen` path. If
  // `recovery_state_` is set, then add the destroy's result to it.
  if (outcome.destroy_outcome) {
    outcome.destroy_outcome->status.Log(
        "Storage.SessionStorage.DestroyDatabase",
        outcome.destroy_outcome->destroyed_db_metrics_type);
    if (recovery_state_) {
      recovery_state_->AddDestroyResult(outcome.destroy_outcome->status.ok());
    }
  }

  if (!outcome.open_status.ok()) {
    // If we failed to open the database, try to delete and recreate the
    // database, or ultimately fallback to an in-memory database.
    DeleteAndRecreateDatabase(DomStorageRecoveryReason::kOpenFailure);
    return;
  }

  if (!database_) {
    // Some tests only simulate database connection without a database being
    // present.
    OnConnectionFinished();
    return;
  }

  database_->ReadAllMetadata(
      base::BindOnce(&SessionStorageImpl::OnGotDatabaseMetadata,
                     weak_ptr_factory_.GetWeakPtr()));
}

void SessionStorageImpl::OnGotDatabaseMetadata(
    StatusOr<DomStorageDatabase::Metadata> all_metadata) {
  if (!all_metadata.has_value()) {
    DeleteAndRecreateDatabase(DomStorageRecoveryReason::kMetadataReadFailure);
    return;
  }

  metadata_.Initialize(*std::move(all_metadata));

  OnConnectionFinished();
}

void SessionStorageImpl::OnConnectionFinished() {
  CHECK_EQ(connection_state_, CONNECTION_IN_PROGRESS);

  // If connection was opened successfully, reset tried_to_recreate_during_open_
  // to enable recreating the database on future errors.
  if (database_)
    tried_to_recreate_during_open_ = false;

  // Emit recovery histogram if we just completed a recovery cycle.
  if (recovery_state_) {
    LogDomStorageRecoveryOutcome("SessionStorage", *recovery_state_,
                                 /*has_database=*/database_ != nullptr,
                                 in_memory_);
    recovery_state_.reset();
  }

  // |database_| should be known to either be valid or invalid by now. Run our
  // delayed bindings.
  connection_state_ = CONNECTION_FINISHED;
  receiver_.Resume();
  std::vector<base::OnceClosure> callbacks;
  std::swap(callbacks, on_database_opened_callbacks_);
  for (size_t i = 0; i < callbacks.size(); ++i)
    std::move(callbacks[i]).Run();
}

void SessionStorageImpl::PurgeAllNamespaceDataMaps() {
  if (database_ && database_->IsAuxUiMigrationHeld()) {
    database_->DeferForAuxUiMigration(base::BindOnce(&SessionStorageImpl::PurgeAllNamespaceDataMaps,
        weak_ptr_factory_.GetWeakPtr()));
    return;
  }
  // Destroy all `SessionStorageDataMap` instances by re-initializing each
  // namespace.
  for (const auto& [namespace_id, namespace_impl] : namespaces_) {
    namespaces_.insert_or_assign(
        namespace_id, CreateSessionStorageNamespaceImpl(namespace_id));
  }
  CHECK(data_maps_.empty());
}

void SessionStorageImpl::DeleteAndRecreateDatabase(
    DomStorageRecoveryReason reason) {
  if (database_ && database_->IsAuxUiMigrationHeld()) {
    database_->DeferForAuxUiMigration(base::BindOnce(&SessionStorageImpl::DeleteAndRecreateDatabase,
        weak_ptr_factory_.GetWeakPtr(), reason));
    return;
  }
  CHECK(database_);
  const DatabaseMetricsType metrics_type = database_->metrics_type();

  // Record the reason that initiated this recovery cycle. Only the first
  // reason is kept when recovery re-enters (e.g. open-fail after destroy).
  if (!recovery_state_) {
    recovery_state_.emplace(reason, metrics_type);
  }

  // We're about to set database_ to null, so delete the StorageAreas
  // that might still be using the old database.
  PurgeAllNamespaceDataMaps();

  // Reset state to be in process of connecting. This will cause requests for
  // StorageAreas to be queued until the connection is complete.
  connection_state_ = CONNECTION_IN_PROGRESS;
  receiver_.Pause();
  RecordCommitErrorCountAtReset("SessionStorage", commit_error_count_,
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

  protected_namespaces_from_scavenge_.clear();

  // `!in_memory_` means the old database was on-disk and must be destroyed
  // before reopening.
  InitiateConnection(recreate_in_memory,
                     /*destroy_existing_db_for_recovery=*/!in_memory_);
}

void SessionStorageImpl::GetStatistics(size_t* total_cache_size,
                                       size_t* unused_area_count) {
  *total_cache_size = 0;
  *unused_area_count = 0;
  for (const auto& it : data_maps_) {
    *total_cache_size += it.second->storage_area()->memory_used();
    if (it.second->binding_count() == 0)
      (*unused_area_count)++;
  }
}

void SessionStorageImpl::OnReceiverDisconnected() {
  std::move(destruct_callback_).Run(this);
}

}  // namespace storage
