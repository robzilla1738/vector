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
