// Copyright 2014 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "extensions/browser/api/storage/storage_frontend.h"

#include <memory>
#include <utility>

#include "base/barrier_closure.h"
#include "base/debug/alias.h"
#include "base/files/file_path.h"
#include "base/functional/bind.h"
#include "base/functional/callback_helpers.h"
#include "base/json/json_reader.h"
#include "base/lazy_instance.h"
#include "base/memory/ptr_util.h"
#include "base/memory/raw_ptr.h"
#include "base/metrics/histogram_functions.h"
#include "base/strings/string_util.h"
#include "base/strings/stringprintf.h"
#include "base/task/bind_post_task.h"
#include "base/trace_event/trace_event.h"
#include "components/value_store/value_store_factory.h"
#include "content/public/browser/browser_context.h"
#include "content/public/browser/browser_thread.h"
#include "extensions/browser/api/extensions_api_client.h"
#include "extensions/browser/api/storage/backend_task_runner.h"
#include "extensions/browser/api/storage/local_value_store_cache.h"
#include "extensions/browser/api/storage/storage_area_namespace.h"
#include "extensions/browser/api/storage/storage_utils.h"
#include "extensions/browser/event_router.h"
#include "extensions/browser/extension_registry.h"
#include "extensions/browser/extension_system.h"
#include "extensions/common/api/storage.h"
#include "extensions/common/extension_id.h"
#include "extensions/common/mojom/context_type.mojom.h"
#include "third_party/leveldatabase/env_chromium.h"
#include "mojo/public/cpp/bindings/callback_helpers.h"

using content::BrowserContext;
using content::BrowserThread;
using value_store::ValueStore;

namespace extensions {

namespace {

base::LazyInstance<BrowserContextKeyedAPIFactory<StorageFrontend>>::
    DestructorAtExit g_factory = LAZY_INSTANCE_INITIALIZER;

// Logs a database error or a restore/repair attempt for a local storage
// operation.
void LogLocalErrorOrRestore(
    StorageFrontend::ExtensionsDatabaseOperation operation,
    const ValueStore::Status& status,
    StorageAreaNamespace storage_area) {
  if (storage_area != StorageAreaNamespace::kLocal) {
    return;
  }

  std::string operation_name;
  switch (operation) {
    case StorageFrontend::ExtensionsDatabaseOperation::kGet:
      operation_name = "get";
      break;
    case StorageFrontend::ExtensionsDatabaseOperation::kSet:
      operation_name = "set";
      break;
    case StorageFrontend::ExtensionsDatabaseOperation::kRemove:
      operation_name = "remove";
      break;
    case StorageFrontend::ExtensionsDatabaseOperation::kClear:
      operation_name = "clear";
      break;
  }

  base::UmaHistogramEnumeration(
      base::StringPrintf("Extensions.Database.Local.StatusCodeByOperation.%s",
                         operation_name.c_str()),
      status.code, value_store::ValueStore::STATUS_CODE_MAX);

  if (status.restore_status != value_store::ValueStore::RESTORE_NONE) {
    base::UmaHistogramEnumeration("Extensions.Database.Local.RestoreStatus",
                                  status.restore_status,
                                  value_store::ValueStore::RESTORE_STATUS_MAX);
  }

  if (!status.ok()) {
    base::UmaHistogramEnumeration("Extensions.Database.Local.ErrorByOperation",
                                  operation);
  }
}
events::HistogramValue StorageAreaToEventHistogram(
    StorageAreaNamespace storage_area) {
  switch (storage_area) {
    case StorageAreaNamespace::kLocal:
      return events::STORAGE_LOCAL_ON_CHANGE;
    case StorageAreaNamespace::kSync:
      return events::STORAGE_SYNC_ON_CHANGE;
    case StorageAreaNamespace::kManaged:
      return events::STORAGE_MANAGED_ON_CHANGE;
    case StorageAreaNamespace::kSession:
      return events::STORAGE_SESSION_ON_CHANGE;
    case StorageAreaNamespace::kInvalid:
    default:
      NOTREACHED();
  }
}

void GetKeysWithValueStore(
    StorageAreaNamespace storage_area,
    base::OnceCallback<void(ValueStore::ReadResult)> callback,
    ValueStore* store) {
  ValueStore::ReadResult result = store->GetKeys();
  LogLocalErrorOrRestore(StorageFrontend::ExtensionsDatabaseOperation::kGet,
                         result.status(), storage_area);

  content::GetUIThreadTaskRunner({})->PostTask(
      FROM_HERE, base::BindOnce(std::move(callback), std::move(result)));
}

void GetWithValueStore(
    StorageAreaNamespace storage_area,
    std::optional<std::vector<std::string>> keys,
    base::OnceCallback<void(ValueStore::ReadResult)> callback,
    ValueStore* store) {
  ValueStore::ReadResult result =
      keys.has_value() ? store->Get(keys.value()) : store->Get();
  LogLocalErrorOrRestore(StorageFrontend::ExtensionsDatabaseOperation::kGet,
                         result.status(), storage_area);

  content::GetUIThreadTaskRunner({})->PostTask(
      FROM_HERE, base::BindOnce(std::move(callback), std::move(result)));
}

void GetBytesInUseWithValueStore(std::optional<std::vector<std::string>> keys,
                                 base::OnceCallback<void(size_t)> callback,
                                 ValueStore* store) {
  size_t size = keys.has_value() ? store->GetBytesInUse(keys.value())
                                 : store->GetBytesInUse();

  content::GetUIThreadTaskRunner({})->PostTask(
      FROM_HERE, base::BindOnce(std::move(callback), size));
}

void SetWithValueStore(
    StorageAreaNamespace storage_area,
    const base::DictValue& values,
    base::OnceCallback<void(ValueStore::WriteResult)> callback,
    ValueStore* store) {
  ValueStore::WriteResult result = store->Set(ValueStore::DEFAULTS, values);
  LogLocalErrorOrRestore(StorageFrontend::ExtensionsDatabaseOperation::kSet,
                         result.status(), storage_area);
  content::GetUIThreadTaskRunner({})->PostTask(
      FROM_HERE, base::BindOnce(std::move(callback), std::move(result)));
}

void RemoveWithValueStore(
    StorageAreaNamespace storage_area,
    std::vector<std::string> keys,
    base::OnceCallback<void(ValueStore::WriteResult)> callback,
    ValueStore* store) {
  ValueStore::WriteResult result = store->Remove(keys);
  LogLocalErrorOrRestore(StorageFrontend::ExtensionsDatabaseOperation::kRemove,
                         result.status(), storage_area);
  content::GetUIThreadTaskRunner({})->PostTask(
      FROM_HERE, base::BindOnce(std::move(callback), std::move(result)));
}

void ClearWithValueStore(
    StorageAreaNamespace storage_area,
    base::OnceCallback<void(ValueStore::WriteResult)> callback,
    ValueStore* store) {
  ValueStore::WriteResult result = store->Clear();
  LogLocalErrorOrRestore(StorageFrontend::ExtensionsDatabaseOperation::kClear,
                         result.status(), storage_area);
  content::GetUIThreadTaskRunner({})->PostTask(
      FROM_HERE, base::BindOnce(std::move(callback), std::move(result)));
}

base::ListValue KeysFromDict(base::DictValue dict) {
  base::ListValue list = base::ListValue::with_capacity(dict.size());
  for (auto item : dict) {
    list.Append(std::move(item.first));
  }
  return list;
}

}  // namespace

// static
StorageFrontend* StorageFrontend::Get(BrowserContext* context) {
  return BrowserContextKeyedAPIFactory<StorageFrontend>::Get(context);
}

// static
std::unique_ptr<StorageFrontend> StorageFrontend::CreateForTesting(
    scoped_refptr<value_store::ValueStoreFactory> storage_factory,
    BrowserContext* context) {
  return base::WrapUnique(
      new StorageFrontend(std::move(storage_factory), context));
}

// Implementation of ResultStatus.

StorageFrontend::ResultStatus::ResultStatus() = default;

StorageFrontend::ResultStatus::ResultStatus(const ResultStatus&) = default;

StorageFrontend::ResultStatus::~ResultStatus() = default;

// Implementation of GetKeysResult.

StorageFrontend::GetKeysResult::GetKeysResult() = default;

StorageFrontend::GetKeysResult::GetKeysResult(GetKeysResult&& other) = default;

StorageFrontend::GetKeysResult::~GetKeysResult() = default;

// Implementation of GetResult.

StorageFrontend::GetResult::GetResult() = default;

StorageFrontend::GetResult::GetResult(GetResult&& other) = default;

StorageFrontend::GetResult::~GetResult() = default;

// Implementation of StorageFrontend.

StorageFrontend::StorageFrontend(BrowserContext* context)
    : StorageFrontend(ExtensionSystem::Get(context)->store_factory(), context) {
}

StorageFrontend::StorageFrontend(
    scoped_refptr<value_store::ValueStoreFactory> factory,
    BrowserContext* context)
    : browser_context_(context) {
  Init(std::move(factory));
}

void StorageFrontend::Init(
    scoped_refptr<value_store::ValueStoreFactory> factory) {
  TRACE_EVENT0("browser,startup", "StorageFrontend::Init");

  DCHECK_CURRENTLY_ON(BrowserThread::UI);
  DCHECK(!browser_context_->IsOffTheRecord());

  caches_[settings_namespace::LOCAL] = new LocalValueStoreCache(factory);

  // Add any additional caches the embedder supports (for example, caches
  // for chrome.storage.managed and chrome.storage.sync).
  ExtensionsAPIClient::Get()->AddAdditionalValueStoreCaches(
      browser_context_, factory, GetObserver(), &caches_);
}

StorageFrontend::~StorageFrontend() {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);
  for (auto it = caches_.begin(); it != caches_.end(); ++it) {
    ValueStoreCache* cache = it->second;
    cache->ShutdownOnUI();
    GetBackendTaskRunner()->DeleteSoon(FROM_HERE, cache);
  }
}

void StorageFrontend::OnReadFinished(
    const ExtensionId& extension_id,
    StorageAreaNamespace storage_area,
    base::OnceCallback<void(StorageFrontend::GetResult)> callback,
    ValueStore::ReadResult result) {
  bool success = result.status().ok();

  GetResult get_result;

  get_result.status.success = success;
  get_result.status.error =
      success ? std::nullopt : std::optional(result.status().message);

  if (success) {
    get_result.data = result.PassSettings();
  }

  std::move(callback).Run(std::move(get_result));
}

void StorageFrontend::OnReadKeysFinished(
    base::OnceCallback<void(GetKeysResult)> callback,
    ValueStore::ReadResult result) {
  bool success = result.status().ok();

  GetKeysResult get_keys_result;

  get_keys_result.status.success = success;
  get_keys_result.status.error =
      success ? std::nullopt : std::optional(result.status().message);

  if (success) {
    get_keys_result.data = KeysFromDict(result.PassSettings());
  }

  std::move(callback).Run(std::move(get_keys_result));
}

void StorageFrontend::OnWriteFinished(
    const ExtensionId& extension_id,
    StorageAreaNamespace storage_area,
    base::OnceCallback<void(StorageFrontend::ResultStatus)> callback,
    ValueStore::WriteResult result) {
  bool success = result.status().ok();

  if (success && !result.changes().empty()) {
    OnSettingsChanged(
        extension_id, storage_area,
        storage_utils::GetAccessLevelForArea(extension_id, *browser_context_,
                                             storage_area),
        value_store::ValueStoreChange::ToValue(result.PassChanges()));
  }

  ResultStatus status;
  status.success = success;
  status.error =
      success ? std::nullopt : std::optional(result.status().message);
  std::move(callback).Run(status);
}

void StorageFrontend::GetValues(scoped_refptr<const Extension> extension,
                                StorageAreaNamespace storage_area,
                                std::optional<std::vector<std::string>> keys,
                                base::OnceCallback<void(GetResult)> callback) {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);

  if (storage_area == StorageAreaNamespace::kSession) {
    SessionStorageManager* storage_manager =
        SessionStorageManager::GetForBrowserContext(browser_context_);

    std::map<std::string, const base::Value*> result =
        keys.has_value() ? storage_manager->Get(extension->id(), keys.value())
                         : storage_manager->GetAll(extension->id());

    GetResult get_result;
    get_result.data = base::DictValue();

    for (auto item : result) {
      get_result.data->Set(std::move(item.first), item.second->Clone());
    }

    // Using a task here is important since we want to consistently fire the
    // callback asynchronously.
    content::GetUIThreadTaskRunner({})->PostTask(
        FROM_HERE, base::BindOnce(std::move(callback), std::move(get_result)));
    return;
  }

  settings_namespace::Namespace settings_namespace =
      StorageAreaToSettingsNamespace(storage_area);

  CHECK(StorageFrontend::IsStorageEnabled(settings_namespace));

  RunWithStorage(
      extension, settings_namespace,
      base::BindOnce(&GetWithValueStore, storage_area, std::move(keys),
                     base::BindOnce(&StorageFrontend::OnReadFinished,
                                    weak_factory_.GetWeakPtr(), extension->id(),
                                    storage_area, std::move(callback))));
}

void StorageFrontend::GetKeys(
    scoped_refptr<const Extension> extension,
    StorageAreaNamespace storage_area,
    base::OnceCallback<void(GetKeysResult)> callback) {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);

  if (storage_area == StorageAreaNamespace::kSession) {
    SessionStorageManager* storage_manager =
        SessionStorageManager::GetForBrowserContext(browser_context_);

    std::vector<std::string> keys = storage_manager->GetKeys(extension->id());

    base::ListValue list = base::ListValue::with_capacity(keys.size());
    for (const std::string& key : keys) {
      list.Append(key);
    }

    GetKeysResult get_keys_result;
    get_keys_result.data = std::move(list);

    // Using a task here is important since we want to consistently fire the
    // callback asynchronously.
    content::GetUIThreadTaskRunner({})->PostTask(
        FROM_HERE,
        base::BindOnce(std::move(callback), std::move(get_keys_result)));
    return;
  }

  settings_namespace::Namespace settings_namespace =
      StorageAreaToSettingsNamespace(storage_area);

  CHECK(StorageFrontend::IsStorageEnabled(settings_namespace));

  base::OnceCallback<void(ValueStore::ReadResult)> test =
      base::BindOnce(&StorageFrontend::OnReadKeysFinished,
                     weak_factory_.GetWeakPtr(), std::move(callback));
  RunWithStorage(
      extension, settings_namespace,
      base::BindOnce(&GetKeysWithValueStore, storage_area, std::move(test)));
}

void StorageFrontend::GetBytesInUse(
    scoped_refptr<const Extension> extension,
    StorageAreaNamespace storage_area,
    std::optional<std::vector<std::string>> keys,
    base::OnceCallback<void(size_t)> callback) {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);

  if (storage_area == StorageAreaNamespace::kSession) {
    SessionStorageManager* storage_manager =
        SessionStorageManager::GetForBrowserContext(browser_context_);

    size_t bytes_in_use =
        keys.has_value()
            ? storage_manager->GetBytesInUse(extension->id(), keys.value())
            : storage_manager->GetTotalBytesInUse(extension->id());

    // Using a task here is important since we want to consistently fire the
    // callback asynchronously.
    content::GetUIThreadTaskRunner({})->PostTask(
        FROM_HERE, base::BindOnce(std::move(callback), bytes_in_use));
    return;
  }

  extensions::settings_namespace::Namespace settings_namespace =
      extensions::StorageAreaToSettingsNamespace(storage_area);

  CHECK(StorageFrontend::IsStorageEnabled(settings_namespace));

  RunWithStorage(extension, settings_namespace,
                 base::BindOnce(&GetBytesInUseWithValueStore, std::move(keys),
                                std::move(callback)));
}

void StorageFrontend::Set(scoped_refptr<const Extension> extension,
                          StorageAreaNamespace storage_area,
                          base::DictValue values,
                          base::OnceCallback<void(ResultStatus)> callback) {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);

  if (storage_area == StorageAreaNamespace::kSession) {
    SessionStorageManager* storage_manager =
        SessionStorageManager::GetForBrowserContext(browser_context_);

    std::map<std::string, base::Value> values_map;
    for (auto item : values) {
      values_map.emplace(std::move(item.first), std::move(item.second));
    }

    std::vector<SessionStorageManager::ValueChange> changes;
    std::string error;
    bool success = storage_manager->Set(extension->id(), std::move(values_map),
                                        changes, &error);

    if (success && !changes.empty()) {
      OnSettingsChanged(extension->id(), storage_area,
                        storage_utils::GetAccessLevelForArea(
                            extension->id(), *browser_context_, storage_area),
                        storage_utils::ValueChangeToValue(std::move(changes)));
    }

    ResultStatus status;
    status.success = success;
    status.error = success ? std::nullopt : std::optional(error);

    // Using a task here is important since we want to consistently fire the
    // callback asynchronously.
    content::GetUIThreadTaskRunner({})->PostTask(
        FROM_HERE, base::BindOnce(std::move(callback), status));
    return;
  }

  settings_namespace::Namespace settings_namespace =
      StorageAreaToSettingsNamespace(storage_area);

  CHECK(StorageFrontend::IsStorageEnabled(settings_namespace));

  RunWithStorage(
      extension, settings_namespace,
      base::BindOnce(&SetWithValueStore, storage_area, std::move(values),
                     base::BindOnce(&StorageFrontend::OnWriteFinished,
                                    weak_factory_.GetWeakPtr(), extension->id(),
                                    storage_area, std::move(callback))));
}

void StorageFrontend::Remove(scoped_refptr<const Extension> extension,
                             StorageAreaNamespace storage_area,
                             const std::vector<std::string>& keys,
                             base::OnceCallback<void(ResultStatus)> callback) {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);

  if (storage_area == StorageAreaNamespace::kSession) {
    SessionStorageManager* storage_manager =
        SessionStorageManager::GetForBrowserContext(browser_context_);

    std::vector<SessionStorageManager::ValueChange> changes;
    storage_manager->Remove(extension->id(), keys, changes);

    if (!changes.empty()) {
      OnSettingsChanged(extension->id(), storage_area,
                        storage_utils::GetAccessLevelForArea(
                            extension->id(), *browser_context_, storage_area),
                        storage_utils::ValueChangeToValue(std::move(changes)));
    }

    // Using a task here is important since we want to consistently fire the
    // callback asynchronously.
    content::GetUIThreadTaskRunner({})->PostTask(
        FROM_HERE,
        base::BindOnce(std::move(callback), StorageFrontend::ResultStatus()));
    return;
  }

  settings_namespace::Namespace settings_namespace =
      StorageAreaToSettingsNamespace(storage_area);

  CHECK(StorageFrontend::IsStorageEnabled(settings_namespace));

  RunWithStorage(
      extension, settings_namespace,
      base::BindOnce(&RemoveWithValueStore, storage_area, keys,
                     base::BindOnce(&StorageFrontend::OnWriteFinished,
                                    weak_factory_.GetWeakPtr(), extension->id(),
                                    storage_area, std::move(callback))));
}

void StorageFrontend::Clear(
    scoped_refptr<const Extension> extension,
    StorageAreaNamespace storage_area,
    base::OnceCallback<void(StorageFrontend::ResultStatus)> callback) {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);

  if (storage_area == StorageAreaNamespace::kSession) {
    SessionStorageManager* storage_manager =
        SessionStorageManager::GetForBrowserContext(browser_context_);

    std::vector<SessionStorageManager::ValueChange> changes;
    storage_manager->Clear(extension->id(), changes);

    if (!changes.empty()) {
      OnSettingsChanged(extension->id(), storage_area,
                        storage_utils::GetAccessLevelForArea(
                            extension->id(), *browser_context_, storage_area),
                        storage_utils::ValueChangeToValue(std::move(changes)));
    }

    // Using a task here is important since we want to consistently fire the
    // callback asynchronously.
    content::GetUIThreadTaskRunner({})->PostTask(
        FROM_HERE,
        base::BindOnce(std::move(callback), StorageFrontend::ResultStatus()));
    return;
  }

  settings_namespace::Namespace settings_namespace =
      StorageAreaToSettingsNamespace(storage_area);

  CHECK(StorageFrontend::IsStorageEnabled(settings_namespace));

  RunWithStorage(
      extension, settings_namespace,
      base::BindOnce(&ClearWithValueStore, storage_area,
                     base::BindOnce(&StorageFrontend::OnWriteFinished,
                                    weak_factory_.GetWeakPtr(), extension->id(),
                                    storage_area, std::move(callback))));
}

ValueStoreCache* StorageFrontend::GetValueStoreCache(
    settings_namespace::Namespace settings_namespace) const {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);
  auto it = caches_.find(settings_namespace);
  if (it != caches_.end()) {
    return it->second;
  }
  return nullptr;
}

bool StorageFrontend::IsStorageEnabled(
    settings_namespace::Namespace settings_namespace) const {
  return caches_.contains(settings_namespace);
}

struct StorageFrontend::AuxUiMigrationLease::State {
  State();
  ~State();
  base::WeakPtr<StorageFrontend> owner;
  scoped_refptr<const Extension> extension;
  base::UnguessableToken request;
  std::shared_ptr<ValueStore::AuxUiPreferenceCapture> capture;
  std::array<std::optional<std::string>, 6> source, target;
  std::vector<base::OnceClosure> deferred;
  bool pending = true, tainted = false, target_attempted = false;
  bool target_file_data_synced = false, target_readback_matches = false;
  bool restore_attempted = false, source_file_data_synced = false, source_readback_matches = false;
};
StorageFrontend::AuxUiMigrationLease::State::State() = default;
StorageFrontend::AuxUiMigrationLease::State::~State() = default;
StorageFrontend::AuxUiMigrationLease::AuxUiMigrationLease(
    std::shared_ptr<State> state,
    std::shared_ptr<ValueStore::AuxUiPreferenceCapture> capture)
    : state_(std::move(state)), capture_(std::move(capture)) {}
StorageFrontend::AuxUiMigrationLease::~AuxUiMigrationLease() = default;
std::array<std::optional<std::string>, 6>
StorageFrontend::AuxUiMigrationLease::CopySourceRecords() const {
  return state_ ? state_->source : std::array<std::optional<std::string>, 6>();
}
std::array<std::optional<std::string>, 6>
StorageFrontend::AuxUiMigrationLease::CopyTargetRecords() const {
  return state_ ? state_->target : std::array<std::optional<std::string>, 6>();
}
StorageFrontend::AuxUiMigrationReadback::AuxUiMigrationReadback() = default;
StorageFrontend::AuxUiMigrationReadback::AuxUiMigrationReadback(AuxUiMigrationReadback&&) = default;
StorageFrontend::AuxUiMigrationReadback& StorageFrontend::AuxUiMigrationReadback::operator=(AuxUiMigrationReadback&&) = default;
StorageFrontend::AuxUiMigrationReadback::~AuxUiMigrationReadback() = default;

void StorageFrontend::BeginAuxUiMigrationLease(
    scoped_refptr<const Extension> extension,
    base::OnceCallback<void(AuxUiMigrationLeaseResult)> callback) {
  BeginAuxUiMigrationLease(std::move(extension), base::UnguessableToken::Create(), std::move(callback));
}
void StorageFrontend::BeginAuxUiMigrationLease(
    scoped_refptr<const Extension> extension, const base::UnguessableToken& request,
    base::OnceCallback<void(AuxUiMigrationLeaseResult)> callback) {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);
  if (request.is_empty() || aux_ui_retired_requests_.contains(request) ||
      aux_ui_retired_requests_.size() >= 64 || !extension || aux_ui_migration_gate_ ||
      !CanUseAuxUiMigrationBackend(*extension)) {
    std::move(callback).Run(base::unexpected(ValueStore::Status(
        ValueStore::OTHER_ERROR, "Actual Aux backend writer gate unavailable"))); return;
  }
  auto state = std::make_shared<AuxUiMigrationLease::State>();
  state->owner = weak_factory_.GetWeakPtr(); state->extension = extension;
  state->request = request;
  // Admission closes on the actual frontend sequence before the backend queue
  // sentinel. Every already submitted operation precedes the raw capture.
  aux_ui_migration_gate_ = state;
  CaptureAuxUiPreferencesUngated(extension, base::BindOnce(
      [](base::WeakPtr<StorageFrontend> owner,
         std::shared_ptr<AuxUiMigrationLease::State> state,
         base::OnceCallback<void(AuxUiMigrationLeaseResult)> callback,
         ValueStore::AuxUiPreferenceCaptureResult captured) {
        state->pending = false;
        if (!owner || owner->aux_ui_migration_gate_ != state ||
            !owner->CanUseAuxUiMigrationBackend(*state->extension) || !captured.has_value()) {
          // Begin has made no target write. Replaying ordinary work here is
          // an abort of the hold, never a successful capture or durable drain.
          if (owner && owner->aux_ui_migration_gate_ == state)
            owner->ReleaseAuxUiMigrationGate(state);
          std::move(callback).Run(base::unexpected(ValueStore::Status(
              ValueStore::OTHER_ERROR, "Original Aux backend capture route unavailable"))); return;
        }
        state->source = captured.value()->CopyRecordsForNativeJournal();
        state->target = captured.value()->CopyTargetRecordsForNativeJournal();
        // The original frontend State owns custody BEFORE the consumer reply.
        // A lost/destroyed callback must not strand the actual backend token.
        state->capture = std::move(captured.value());
        std::move(callback).Run(base::WrapUnique(new AuxUiMigrationLease(state, state->capture)));
      }, weak_factory_.GetWeakPtr(), state, std::move(callback)));
}

StorageFrontend::AuxUiMigrationLeaseObservationResult
StorageFrontend::ObserveAuxUiMigrationLease(const base::UnguessableToken& request) {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);
  if (request.is_empty()) return base::unexpected(ValueStore::Status(ValueStore::OTHER_ERROR,
      "An original native frontend request is required"));
  const auto state = aux_ui_migration_gate_;
  if (state && state->request == request && state->owner.get() == this &&
      CanUseAuxUiMigrationBackend(*state->extension)) {
    AuxUiMigrationLeaseObservation result;
    result.preparation_pending = state->pending;
    result.target_attempted = state->target_attempted;
    if (!state->pending && state->capture)
      result.lease = base::WrapUnique(new AuxUiMigrationLease(state, state->capture));
    return result;
  }
  if (aux_ui_aborted_request_ == request && aux_ui_aborted_extension_ &&
      CanUseAuxUiMigrationBackend(*aux_ui_aborted_extension_)) {
    AuxUiMigrationLeaseObservation result; result.aborted_before_target = true; return result;
  }
  return base::unexpected(ValueStore::Status(ValueStore::OTHER_ERROR,
      "Original frontend request remains unknown; absence is not an abort"));
}
bool StorageFrontend::ValidateAuxUiMigrationLease(const AuxUiMigrationLease& lease) const {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);
  const auto state = lease.state_;
  return state && state->owner.get() == this && aux_ui_migration_gate_ == state &&
      !state->pending && !state->tainted && state->deferred.empty() &&
      CanUseAuxUiMigrationBackend(*state->extension);
}
void StorageFrontend::CommitAuxUiMigrationLease(
    AuxUiMigrationLease& lease, base::OnceCallback<void(ValueStore::Status)> callback) {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);
  if (!ValidateAuxUiMigrationLease(lease) || !lease.capture_ || lease.state_->target_attempted) {
    std::move(callback).Run(ValueStore::Status(ValueStore::OTHER_ERROR,
        "Actual Aux source capture cannot authorize another target attempt")); return;
  }
  auto state = lease.state_;
  state->pending = true; state->target_attempted = true;
  state->target_file_data_synced = false; state->target_readback_matches = false;
  state->source_file_data_synced = false; state->source_readback_matches = false;
  RunRetainedAuxUiPreferencesUngated(state->extension, lease.capture_, AuxUiRetainedOperation::kCommit, base::BindOnce(
      [](base::WeakPtr<StorageFrontend> owner,
         std::shared_ptr<AuxUiMigrationLease::State> state,
         base::OnceCallback<void(ValueStore::Status)> callback,
         ValueStore::AuxUiPreferenceReadbackResult result) {
        state->pending = false;
        state->target_file_data_synced = result.has_value() && result->file_data_synced && result->matches_target;
        state->target_readback_matches = state->target_file_data_synced && result->records == state->target;
        ValueStore::Status status = state->target_readback_matches ? ValueStore::Status() :
            ValueStore::Status(ValueStore::OTHER_ERROR, "Actual retained Aux target/readback remains unknown");
        if (!owner || owner->aux_ui_migration_gate_ != state ||
            !owner->CanUseAuxUiMigrationBackend(*state->extension) || state->tainted)
          status = ValueStore::Status(ValueStore::OTHER_ERROR,
              "Aux target outcome requires original-owner readback/recovery");
        std::move(callback).Run(std::move(status));
      }, weak_factory_.GetWeakPtr(), state, std::move(callback)));
}
void StorageFrontend::ReadbackAuxUiMigrationLease(
    AuxUiMigrationLease& lease,
    base::OnceCallback<void(AuxUiMigrationReadbackResult)> callback) {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);
  auto state = lease.state_;
  if (!state || state->owner.get() != this || aux_ui_migration_gate_ != state ||
      state->pending || !CanUseAuxUiMigrationBackend(*state->extension)) {
    std::move(callback).Run(base::unexpected(ValueStore::Status(
        ValueStore::OTHER_ERROR, "Original Aux backend readback unavailable"))); return;
  }
  state->pending = true;
  state->source_file_data_synced = false; state->source_readback_matches = false;
  state->target_file_data_synced = false; state->target_readback_matches = false;
  RunRetainedAuxUiPreferencesUngated(state->extension, lease.capture_, AuxUiRetainedOperation::kRead, base::BindOnce(
      [](base::WeakPtr<StorageFrontend> owner,
         std::shared_ptr<AuxUiMigrationLease::State> state,
         base::OnceCallback<void(AuxUiMigrationReadbackResult)> callback,
         ValueStore::AuxUiPreferenceReadbackResult captured) {
        state->pending = false;
        if (!owner || owner->aux_ui_migration_gate_ != state ||
            !owner->CanUseAuxUiMigrationBackend(*state->extension) || !captured.has_value()) {
          state->target_readback_matches = false;
          std::move(callback).Run(base::unexpected(ValueStore::Status(
              ValueStore::OTHER_ERROR, "Aux raw target readback refused"))); return;
        }
        AuxUiMigrationReadback result;
        result.records = captured->records;
        result.matches_source = result.records == state->source;
        result.matches_target = result.records == state->target;
        result.readback_file_data_synced = captured->file_data_synced;
        result.source_file_data_synced = captured->file_data_synced && result.matches_source;
        result.restore_attempted = state->restore_attempted || captured->restore_attempted;
        state->source_file_data_synced = result.source_file_data_synced;
        state->source_readback_matches = result.matches_source && captured->file_data_synced;
        state->target_file_data_synced = result.matches_target && captured->file_data_synced && state->target_attempted;
        state->target_readback_matches = result.matches_target && captured->file_data_synced;
        result.commit_file_data_synced = state->target_file_data_synced;
        result.ordinary_work_queued = state->tainted || !state->deferred.empty();
        std::move(callback).Run(std::move(result));
      }, weak_factory_.GetWeakPtr(), state, std::move(callback)));
}
bool StorageFrontend::ReleaseAuxUiMigrationLease(AuxUiMigrationLease& lease) {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);
  auto state = lease.state_;
  if (!state || state->owner.get() != this || aux_ui_migration_gate_ != state || state->pending ||
      (state->target_attempted && (!CanUseAuxUiMigrationBackend(*state->extension) ||
       !((state->source_file_data_synced && state->source_readback_matches) ||
         (state->target_file_data_synced && state->target_readback_matches &&
          !state->restore_attempted && !state->tainted && state->deferred.empty()))))) return false;
  // No target attempt, or actual successful file-data sync + exact raw target
  // readback. Native controller still owns cross-store journal/activation.
  lease.capture_.reset(); lease.state_.reset(); ReleaseAuxUiMigrationGate(state); return true;
}
void StorageFrontend::RunRetainedAuxUiPreferencesUngated(
    scoped_refptr<const Extension> extension,
    std::shared_ptr<ValueStore::AuxUiPreferenceCapture> capture,
    AuxUiRetainedOperation operation, AuxUiRetainedCallback callback) {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);
  using Result = ValueStore::AuxUiPreferenceReadbackResult;
  if (!capture || !extension || !CanUseAuxUiMigrationBackend(*extension)) {
    std::move(callback).Run(base::unexpected(ValueStore::Status(
        ValueStore::OTHER_ERROR, "Original retained Aux frontend route unavailable"))); return;
  }
  auto reply = base::BindOnce(
      [](base::WeakPtr<StorageFrontend> owner, scoped_refptr<const Extension> extension,
         AuxUiRetainedCallback callback, Result result) {
        if (!owner || !owner->CanUseAuxUiMigrationBackend(*extension))
          result = base::unexpected(ValueStore::Status(ValueStore::OTHER_ERROR,
              "Original retained Aux frontend route was lost"));
        std::move(callback).Run(std::move(result));
      }, weak_factory_.GetWeakPtr(), extension, std::move(callback));
  auto guarded = mojo::WrapCallbackWithDefaultInvokeIfNotRun(
      base::BindPostTaskToCurrentDefault(std::move(reply)),
      Result(base::unexpected(ValueStore::Status(ValueStore::OTHER_ERROR,
          "Retained Aux physical callback outcome remains unknown"))));
  RunWithStorageUngated(extension, settings_namespace::LOCAL, base::BindOnce(
      [](std::shared_ptr<ValueStore::AuxUiPreferenceCapture> capture,
         AuxUiRetainedOperation operation, AuxUiRetainedCallback callback, ValueStore* storage) {
        if (!storage) {
          std::move(callback).Run(base::unexpected(ValueStore::Status(
              ValueStore::OTHER_ERROR, "Original retained Aux storage unavailable"))); return;
        }
        switch (operation) {
          case AuxUiRetainedOperation::kCommit:
            std::move(callback).Run(storage->CommitRetainedAuxUiPreferenceMigration(std::move(capture))); return;
          case AuxUiRetainedOperation::kRead:
            std::move(callback).Run(storage->ReadRetainedAuxUiPreferenceMigration(std::move(capture))); return;
          case AuxUiRetainedOperation::kRestore:
            std::move(callback).Run(storage->RestoreRetainedAuxUiPreferenceMigration(std::move(capture))); return;
        }
      }, std::move(capture), operation, std::move(guarded)));
}
void StorageFrontend::RestoreAuxUiMigrationLease(
    AuxUiMigrationLease& lease, base::OnceCallback<void(ValueStore::Status)> callback) {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);
  const auto state = lease.state_;
  // Queued ordinary callbacks stay queued. Exact source restoration is an abort
  // path; it may later replay those originals after current source readback.
  if (!state || state->owner.get() != this || aux_ui_migration_gate_ != state ||
      state->pending || !lease.capture_ || !CanUseAuxUiMigrationBackend(*state->extension)) {
    std::move(callback).Run(ValueStore::Status(ValueStore::OTHER_ERROR,
        "Original Aux frontend restore lease unavailable")); return;
  }
  state->pending = true; state->restore_attempted = true;
  state->source_file_data_synced = false; state->source_readback_matches = false;
  RunRetainedAuxUiPreferencesUngated(state->extension, lease.capture_, AuxUiRetainedOperation::kRestore,
      base::BindOnce([](base::WeakPtr<StorageFrontend> owner,
          std::shared_ptr<AuxUiMigrationLease::State> state,
          base::OnceCallback<void(ValueStore::Status)> callback,
          ValueStore::AuxUiPreferenceReadbackResult result) {
        state->pending = false;
        state->source_file_data_synced = result.has_value() && result->file_data_synced && result->matches_source;
        state->source_readback_matches = state->source_file_data_synced && result->records == state->source;
        if (!owner || owner->aux_ui_migration_gate_ != state ||
            !owner->CanUseAuxUiMigrationBackend(*state->extension) || !state->source_readback_matches) {
          std::move(callback).Run(ValueStore::Status(ValueStore::OTHER_ERROR,
              "Aux original source restore requires exact retained-owner readback")); return;
        }
        std::move(callback).Run(ValueStore::Status());
      }, weak_factory_.GetWeakPtr(), state, std::move(callback)));
}

void StorageFrontend::ReleaseAuxUiMigrationGate(
    std::shared_ptr<AuxUiMigrationLease::State> state) {
  if (aux_ui_migration_gate_ != state) return;
  aux_ui_migration_gate_.reset();
  aux_ui_retired_requests_.insert(state->request);
  if (!state->target_attempted) {
    // Past gate retirement only, never current writer-drain/readiness. Original
    // ordinary callbacks below keep their real completion/ordering semantics.
    aux_ui_aborted_request_ = state->request;
    aux_ui_aborted_extension_ = state->extension;
  }
  auto pending = std::move(state->deferred);
  for (auto& operation : pending) std::move(operation).Run();
}

bool StorageFrontend::CanUseAuxUiMigrationBackend(
    const Extension& extension) const {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);
  const ExtensionRegistry* registry = ExtensionRegistry::Get(browser_context_);
  return !browser_context_->IsOffTheRecord() && registry &&
         extension.id() == "gokkffaiccpmoeodpmeamcjajcagjmkm" &&
         registry->enabled_extensions().GetByID(extension.id()) == &extension &&
         IsStorageEnabled(settings_namespace::LOCAL);
}

void StorageFrontend::CaptureAuxUiPreferencesForMigration(
    scoped_refptr<const Extension> extension, AuxUiPreferenceCaptureCallback callback) {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);
  if (aux_ui_migration_gate_) {
    std::move(callback).Run(base::unexpected(ValueStore::Status(
        ValueStore::OTHER_ERROR, "Actual Aux writer lease already owns this backend"))); return;
  }
  CaptureAuxUiPreferencesUngated(std::move(extension), std::move(callback));
}
void StorageFrontend::CaptureAuxUiPreferencesUngated(
    scoped_refptr<const Extension> extension,
    AuxUiPreferenceCaptureCallback callback) {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);
  using Result = ValueStore::AuxUiPreferenceCaptureResult;
  if (!extension || !CanUseAuxUiMigrationBackend(*extension)) {
    std::move(callback).Run(base::unexpected(
        ValueStore::Status(ValueStore::OTHER_ERROR, "Aux migration route refused")));
    return;
  }
  auto reply = base::BindOnce(
      [](base::WeakPtr<StorageFrontend> owner,
         scoped_refptr<const Extension> extension,
         AuxUiPreferenceCaptureCallback callback, Result result) {
        if (!owner || !owner->CanUseAuxUiMigrationBackend(*extension)) {
          result = base::unexpected(ValueStore::Status(
              ValueStore::OTHER_ERROR, "Aux migration route was lost"));
        }
        std::move(callback).Run(std::move(result));
      },
      weak_factory_.GetWeakPtr(), extension, std::move(callback));
  auto guarded = mojo::WrapCallbackWithDefaultInvokeIfNotRun(
      base::BindPostTaskToCurrentDefault(std::move(reply)),
      Result(base::unexpected(ValueStore::Status(
          ValueStore::OTHER_ERROR, "Aux migration capture reply was lost"))));
  RunWithStorageUngated(extension, settings_namespace::LOCAL, base::BindOnce(
      [](AuxUiPreferenceCaptureCallback callback, ValueStore* storage) {
        if (!storage) {
          std::move(callback).Run(base::unexpected(ValueStore::Status(
              ValueStore::OTHER_ERROR, "Aux migration storage unavailable")));
          return;
        }
        std::move(callback).Run(storage->CaptureAuxUiPreferencesForMigration());
      },
      std::move(guarded)));
}

void StorageFrontend::CommitAuxUiPreferenceMigration(
    scoped_refptr<const Extension> extension,
    std::unique_ptr<ValueStore::AuxUiPreferenceCapture> capture,
    base::OnceCallback<void(ValueStore::Status)> callback) {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);
  if (aux_ui_migration_gate_) {
    std::move(callback).Run(ValueStore::Status(ValueStore::OTHER_ERROR,
        "Actual Aux writer lease already owns this backend")); return;
  }
  CommitAuxUiPreferencesUngated(std::move(extension), std::move(capture), std::move(callback));
}
void StorageFrontend::CommitAuxUiPreferencesUngated(
    scoped_refptr<const Extension> extension,
    std::unique_ptr<ValueStore::AuxUiPreferenceCapture> capture,
    base::OnceCallback<void(ValueStore::Status)> callback) {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);
  if (!capture || !extension || !CanUseAuxUiMigrationBackend(*extension)) {
    std::move(callback).Run(ValueStore::Status(
        ValueStore::OTHER_ERROR, "Aux migration route refused"));
    return;
  }
  auto reply = base::BindOnce(
      [](base::WeakPtr<StorageFrontend> owner,
         scoped_refptr<const Extension> extension,
         base::OnceCallback<void(ValueStore::Status)> callback,
         ValueStore::Status result) {
        // Lost routing after commit can conceal a completed write. Keep it an
        // error/unknown outcome for journal readback; do not blindly retry.
        if (!owner || !owner->CanUseAuxUiMigrationBackend(*extension)) {
          result = ValueStore::Status(ValueStore::OTHER_ERROR,
                                     "Aux migration commit route was lost");
        }
        std::move(callback).Run(std::move(result));
      },
      weak_factory_.GetWeakPtr(), extension, std::move(callback));
  auto guarded = mojo::WrapCallbackWithDefaultInvokeIfNotRun(
      base::BindPostTaskToCurrentDefault(std::move(reply)),
      ValueStore::Status(ValueStore::OTHER_ERROR,
                         "Aux migration commit reply was lost"));
  RunWithStorageUngated(extension, settings_namespace::LOCAL, base::BindOnce(
      [](std::unique_ptr<ValueStore::AuxUiPreferenceCapture> capture,
         base::OnceCallback<void(ValueStore::Status)> callback,
         ValueStore* storage) {
        if (!storage) {
          std::move(callback).Run(ValueStore::Status(
              ValueStore::OTHER_ERROR, "Aux migration storage unavailable"));
          return;
        }
        std::move(callback).Run(
            storage->CommitAuxUiPreferenceMigration(std::move(capture)));
      },
      std::move(capture), std::move(guarded)));
}

void StorageFrontend::RunWithStorage(
    scoped_refptr<const Extension> extension,
    settings_namespace::Namespace settings_namespace,
    ValueStoreCache::StorageCallback callback) {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);
  CHECK(extension.get());
  if (aux_ui_migration_gate_ && extension->id() == "gokkffaiccpmoeodpmeamcjajcagjmkm" &&
      settings_namespace == extensions::settings_namespace::LOCAL) {
    aux_ui_migration_gate_->tainted = true;
    // Preserve the original operation and its real callback. The source pause
    // must close producers before this gate; attempted new work invalidates
    // qualification and cannot silently execute against a captured old store.
    aux_ui_migration_gate_->deferred.push_back(base::BindOnce(
        &StorageFrontend::RunWithStorage, weak_factory_.GetWeakPtr(),
        std::move(extension), settings_namespace, std::move(callback)));
    return;
  }
  RunWithStorageUngated(std::move(extension), settings_namespace, std::move(callback));
}
void StorageFrontend::RunWithStorageUngated(
    scoped_refptr<const Extension> extension,
    settings_namespace::Namespace settings_namespace,
    ValueStoreCache::StorageCallback callback) {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);
  CHECK(extension.get());

  ValueStoreCache* cache = caches_[settings_namespace];
  CHECK(cache);

  GetBackendTaskRunner()->PostTask(
      FROM_HERE,
      base::BindOnce(&ValueStoreCache::RunWithValueStoreForExtension,
                     base::Unretained(cache), std::move(callback), extension));
}

void StorageFrontend::DeleteStorageSoon(const ExtensionId& extension_id,
                                        base::OnceClosure done_callback) {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);
  if (aux_ui_migration_gate_ && extension_id == "gokkffaiccpmoeodpmeamcjajcagjmkm") {
    aux_ui_migration_gate_->tainted = true;
    aux_ui_migration_gate_->deferred.push_back(base::BindOnce(
        &StorageFrontend::DeleteStorageSoon, weak_factory_.GetWeakPtr(), extension_id,
        std::move(done_callback)));
    return;
  }
  auto subtask_done_callback =
      base::BarrierClosure(caches_.size(), std::move(done_callback));
  for (auto& cache_map : caches_) {
    ValueStoreCache* cache = cache_map.second;
    GetBackendTaskRunner()->PostTaskAndReply(
        FROM_HERE,
        base::BindOnce(&ValueStoreCache::DeleteStorageSoon,
                       base::Unretained(cache), extension_id),
        subtask_done_callback);
  }
}

SettingsChangedCallback StorageFrontend::GetObserver() {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);
  return base::BindRepeating(&StorageFrontend::OnSettingsChanged,
                             weak_factory_.GetWeakPtr());
}

void StorageFrontend::SetCacheForTesting(
    settings_namespace::Namespace settings_namespace,
    std::unique_ptr<ValueStoreCache> cache) {
  DisableStorageForTesting(settings_namespace);  // IN-TEST
  caches_[settings_namespace] = cache.release();
}

void StorageFrontend::DisableStorageForTesting(
    settings_namespace::Namespace settings_namespace) {
  auto it = caches_.find(settings_namespace);
  if (it != caches_.end()) {
    ValueStoreCache* cache = it->second;
    cache->ShutdownOnUI();
    GetBackendTaskRunner()->DeleteSoon(FROM_HERE, cache);
    caches_.erase(it);
  }
}

// Forwards changes on to the extension processes for |browser_context_| and its
// incognito partner if it exists.
void StorageFrontend::OnSettingsChanged(
    const ExtensionId& extension_id,
    StorageAreaNamespace storage_area,
    std::optional<api::storage::AccessLevel> access_level,
    base::Value changes) {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);
  TRACE_EVENT1("browser", "StorageFrontend::OnSettingsChanged", "extension_id",
               extension_id);

  // Alias extension_id for investigation of shutdown hangs. crbug.com/1154997
  // Extension IDs are exactly 32 characters in length.
  constexpr size_t kExtensionsIdLength = 32;
  char extension_id_str[kExtensionsIdLength + 1];
  base::strlcpy(extension_id_str, extension_id.c_str(),
                std::size(extension_id_str));
  base::debug::Alias(extension_id_str);

  const std::string namespace_string = StorageAreaToString(storage_area);
  EventRouter* event_router = EventRouter::Get(browser_context_);

  bool has_event_changed_listener = event_router->ExtensionHasEventListener(
      extension_id, api::storage::OnChanged::kEventName);

  // Event for StorageArea.
  auto area_event_name =
      base::StringPrintf("storage.%s.onChanged", namespace_string.c_str());
  bool has_area_changed_event_listener =
      event_router->ExtensionHasEventListener(extension_id, area_event_name);

  if (!has_event_changed_listener && !has_area_changed_event_listener) {
    return;
  }

  base::ScopedUmaHistogramTimer timer(
      "Extensions.Storage.OnSettingsChangedTime");

  api::storage::AccessLevel effective_access_level =
      access_level.has_value()
          ? access_level.value()
          : storage_utils::GetAccessLevelForArea(
                extension_id, *browser_context_, storage_area);

  std::optional<mojom::ContextType> restrict_to_context_type = std::nullopt;
  // Restrict event to privileged context if access level is set only to trusted
  // contexts.
  if (effective_access_level == api::storage::AccessLevel::kTrustedContexts) {
    restrict_to_context_type = mojom::ContextType::kPrivilegedExtension;
  }

  auto make_changed_event = [&namespace_string,
                             restrict_to_context_type](base::Value changes) {
    base::ListValue args;
    args.Append(std::move(changes));
    args.Append(namespace_string);

    return std::make_unique<Event>(
        events::STORAGE_ON_CHANGED, api::storage::OnChanged::kEventName,
        std::move(args), /*restrict_to_browser_context=*/nullptr,
        restrict_to_context_type);
  };
  auto make_area_changed_event = [&storage_area, &area_event_name,
                                  restrict_to_context_type](
                                     base::Value changes) {
    base::ListValue args;
    args.Append(std::move(changes));
    return std::make_unique<Event>(StorageAreaToEventHistogram(storage_area),
                                   area_event_name, std::move(args), nullptr,
                                   restrict_to_context_type);
  };
  // We only dispatch the events if there's a valid listener (even though
  // EventRouter would handle the no-listener case) since copying `changes`
  // can be expensive.
  // Event for each storage(sync, local, managed).
  if (has_event_changed_listener && has_area_changed_event_listener) {
    event_router->DispatchEventToExtension(
        extension_id, make_area_changed_event(changes.Clone()));
  }
  if (has_event_changed_listener) {
    event_router->DispatchEventToExtension(
        extension_id, make_changed_event(std::move(changes)));
  } else if (has_area_changed_event_listener) {
    event_router->DispatchEventToExtension(
        extension_id, make_area_changed_event(std::move(changes)));
  }
}

// BrowserContextKeyedAPI implementation.

// static
BrowserContextKeyedAPIFactory<StorageFrontend>*
StorageFrontend::GetFactoryInstance() {
  return g_factory.Pointer();
}

// static
const char* StorageFrontend::service_name() { return "StorageFrontend"; }

}  // namespace extensions
