namespace {
mojom::AuxUiDomLeaseReplyPtr AuxDomLeaseFailure(
    const std::optional<base::UnguessableToken>& request,
    const AsyncDomStorageDatabase::AuxUiMigrationLease* lease,
    std::string error) {
  auto reply = mojom::AuxUiDomLeaseReply::New();
  reply->ok = false;
  reply->held = request.has_value();
  reply->request_id = request;
  if (lease) reply->token = lease->token();
  reply->error = std::move(error);
  return reply;
}
mojom::AuxUiDomLeaseReplyPtr AuxDomLeaseSnapshot(
    const base::UnguessableToken& request,
    const AsyncDomStorageDatabase::AuxUiMigrationLease& lease,
    AsyncDomStorageDatabase::AuxUiSnapshot snapshot) {
  auto reply = mojom::AuxUiDomLeaseReply::New();
  reply->ok = true;
  reply->held = true;
  reply->request_id = request;
  reply->token = lease.token();
  reply->matches_source = snapshot.matches_source;
  reply->matches_target = snapshot.matches_target;
  reply->file_data_synced = snapshot.file_data_synced;
  reply->ordinary_work_queued = snapshot.ordinary_work_queued;
  reply->target_attempted = snapshot.target_attempted;
  for (auto& map : snapshot.maps) {
    auto output = mojom::AuxUiDomMapSnapshot::New();
    output->storage_key = std::move(map.storage_key);
    output->session_ids = std::move(map.session_ids);
    for (auto& [key, value] : map.source)
      output->source_entries.push_back(blink::mojom::KeyValue::New(key, std::move(value)));
    for (auto& [key, value] : map.target)
      output->target_entries.push_back(blink::mojom::KeyValue::New(key, std::move(value)));
    reply->maps.push_back(std::move(output));
  }
  return reply;
}
}  // namespace

void OWNER::BeginAuxUiPreferenceLease(
    const base::UnguessableToken& request_id,
    BeginAuxUiPreferenceLeaseCallback callback) {
  if (request_id.is_empty() || aux_ui_request_ || LIVE_OWNERS ||
      connection_state_ != CONNECTION_FINISHED || !database_ || in_memory_ ||
      storage_partition_directory_.empty()) {
    std::move(callback).Run(AuxDomLeaseFailure(aux_ui_request_, aux_ui_lease_.get(),
        "Existing disk backend required; discover an already-held request instead of preparing again"));
    return;
  }
  aux_ui_request_ = request_id;
  database_->BeginAuxUiMigrationLease(base::BindOnce(
      [](base::WeakPtr<OWNER> owner, base::UnguessableToken request,
         BeginAuxUiPreferenceLeaseCallback callback,
         StatusOr<std::unique_ptr<AsyncDomStorageDatabase::AuxUiMigrationLease>> lease,
         AsyncDomStorageDatabase::AuxUiSnapshot snapshot) {
        if (!owner || owner->aux_ui_request_ != request) {
          std::move(callback).Run(AuxDomLeaseFailure(request, nullptr, "Aux DOM service owner changed"));
          return;
        }
        if (!lease.has_value()) {
          owner->aux_ui_request_.reset();
          std::move(callback).Run(AuxDomLeaseFailure(std::nullopt, nullptr, lease.error().ToString()));
          return;
        }
        owner->aux_ui_lease_ = std::move(lease).value();
        std::move(callback).Run(AuxDomLeaseSnapshot(request, *owner->aux_ui_lease_, std::move(snapshot)));
      }, weak_ptr_factory_.GetWeakPtr(), request_id, std::move(callback)));
}
void OWNER::ReadAuxUiPreferenceLease(
    const base::UnguessableToken& request_id,
    ReadAuxUiPreferenceLeaseCallback callback) {
  if (aux_ui_request_ != request_id || !aux_ui_lease_ || !database_) {
    std::move(callback).Run(AuxDomLeaseFailure(aux_ui_request_, aux_ui_lease_.get(),
        "Exact original request is not available or is still pending"));
    return;
  }
  database_->ReadAuxUiMigrationLease(*aux_ui_lease_, base::BindOnce(
      [](base::WeakPtr<OWNER> owner, base::UnguessableToken request,
         ReadAuxUiPreferenceLeaseCallback callback,
         StatusOr<AsyncDomStorageDatabase::AuxUiSnapshot> result) {
        if (!owner || owner->aux_ui_request_ != request || !owner->aux_ui_lease_) {
          std::move(callback).Run(AuxDomLeaseFailure(request, nullptr, "Aux DOM service owner changed"));
        } else if (!result.has_value()) {
          std::move(callback).Run(AuxDomLeaseFailure(owner->aux_ui_request_, owner->aux_ui_lease_.get(), result.error().ToString()));
        } else {
          std::move(callback).Run(AuxDomLeaseSnapshot(request, *owner->aux_ui_lease_, std::move(result).value()));
        }
      }, weak_ptr_factory_.GetWeakPtr(), request_id, std::move(callback)));
}
void OWNER::CommitAuxUiPreferenceLease(
    const base::UnguessableToken& request_id, const base::UnguessableToken& token,
    CommitAuxUiPreferenceLeaseCallback callback) {
  if (aux_ui_request_ != request_id || !aux_ui_lease_ ||
      aux_ui_lease_->token() != token || !database_) {
    std::move(callback).Run(AuxDomLeaseFailure(aux_ui_request_, aux_ui_lease_.get(), "Exact native-held DOM lease required"));
    return;
  }
  database_->CommitAuxUiMigrationLease(*aux_ui_lease_, base::BindOnce(
      [](base::WeakPtr<OWNER> owner, base::UnguessableToken request,
         CommitAuxUiPreferenceLeaseCallback callback,
         StatusOr<AsyncDomStorageDatabase::AuxUiSnapshot> result) {
        if (!owner || owner->aux_ui_request_ != request || !owner->aux_ui_lease_) {
          std::move(callback).Run(AuxDomLeaseFailure(request, nullptr, "Aux DOM service owner changed"));
        } else if (!result.has_value()) {
          std::move(callback).Run(AuxDomLeaseFailure(owner->aux_ui_request_, owner->aux_ui_lease_.get(), result.error().ToString()));
        } else {
          std::move(callback).Run(AuxDomLeaseSnapshot(request, *owner->aux_ui_lease_, std::move(result).value()));
        }
      }, weak_ptr_factory_.GetWeakPtr(), request_id, std::move(callback)));
}
void OWNER::RestoreAuxUiPreferenceLease(
    const base::UnguessableToken& request_id, const base::UnguessableToken& token,
    RestoreAuxUiPreferenceLeaseCallback callback) {
  if (aux_ui_request_ != request_id || !aux_ui_lease_ ||
      aux_ui_lease_->token() != token || !database_) {
    std::move(callback).Run(AuxDomLeaseFailure(aux_ui_request_, aux_ui_lease_.get(), "Exact native-held DOM lease required"));
    return;
  }
  database_->RestoreAuxUiMigrationLease(*aux_ui_lease_, base::BindOnce(
      [](base::WeakPtr<OWNER> owner, base::UnguessableToken request,
         RestoreAuxUiPreferenceLeaseCallback callback,
         StatusOr<AsyncDomStorageDatabase::AuxUiSnapshot> result) {
        if (!owner || owner->aux_ui_request_ != request || !owner->aux_ui_lease_) {
          std::move(callback).Run(AuxDomLeaseFailure(request, nullptr, "Aux DOM service owner changed"));
        } else if (!result.has_value()) {
          std::move(callback).Run(AuxDomLeaseFailure(owner->aux_ui_request_, owner->aux_ui_lease_.get(), result.error().ToString()));
        } else {
          std::move(callback).Run(AuxDomLeaseSnapshot(request, *owner->aux_ui_lease_, std::move(result).value()));
        }
      }, weak_ptr_factory_.GetWeakPtr(), request_id, std::move(callback)));
}
void OWNER::ReleaseAuxUiPreferenceLease(
    const base::UnguessableToken& request_id, const base::UnguessableToken& token,
    ReleaseAuxUiPreferenceLeaseCallback callback) {
  bool released = aux_ui_request_ == request_id && aux_ui_lease_ && database_ &&
      aux_ui_lease_->token() == token && database_->ReleaseAuxUiMigrationLease(*aux_ui_lease_);
  if (released) { aux_ui_lease_.reset(); aux_ui_request_.reset(); }
  std::move(callback).Run(released);
}
