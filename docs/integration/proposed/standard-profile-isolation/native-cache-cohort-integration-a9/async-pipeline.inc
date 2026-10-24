void AsyncDomStorageDatabase::BeginAuxUiMigrationLease(AuxUiLeaseCallback callback) {
  if (!is_database_opened_ || !aux_on_disk_ || aux_ui_migration_gate_) {
    std::move(callback).Run(base::unexpected(DbStatus::NotSupported("Actual disk backend or outstanding owner unavailable")), {}); return;
  }
  if (committers_.size() > 4096) {
    std::move(callback).Run(base::unexpected(DbStatus::NotSupported("Finite native writer inventory exceeded")), {}); return;
  }
  auto state = std::make_shared<AuxUiMigrationLease::State>();
  state->owner = weak_ptr_factory_.GetWeakPtr();
  for (Committer* writer : committers_) {
    auto weak = writer->GetAuxUiMigrationWeakPtr();
    auto locator = writer->CopyAuxUiMigrationLocator();
    if (!weak || !writer->CanHoldAuxUiMigration(this) || !locator.has_value()) {
      std::move(callback).Run(base::unexpected(DbStatus::NotSupported("Actual native writer cannot be closed")), {}); return;
    }
    state->writers.push_back(std::move(weak));
    state->backend->live_locators.push_back(std::move(locator).value());
  }
  // Collect actual pending batches before closing ordinary dispatch, in the
  // same owning stack. Their replies precede the backend capture sentinel.
  InitiateCommit();
  state->pending = true; aux_ui_migration_gate_ = state;
  RunAuxUiMigrationCaches(state, AuxUiCacheOperation::kRead, true, {}, base::BindOnce(
      &AsyncDomStorageDatabase::PreparedAuxUiMigration, weak_ptr_factory_.GetWeakPtr(), state, std::move(callback)));
}
void AsyncDomStorageDatabase::PreparedAuxUiMigration(
    std::shared_ptr<AuxUiMigrationLease::State> state, AuxUiLeaseCallback callback, DbStatus status) {
  if (!status.ok() || !CurrentAuxUiMigrationWriters(state) || state->tainted) {
    CompleteAuxUiBegin(state, std::move(callback), status.ok() ? DbStatus::IOError("Native writers changed before capture") : std::move(status)); return;
  }
  RunAuxUiBackend(state, 0, {}, base::BindOnce(&AsyncDomStorageDatabase::CapturedAuxUiMigration,
      weak_ptr_factory_.GetWeakPtr(), state, std::move(callback)));
}
void AsyncDomStorageDatabase::CapturedAuxUiMigration(
    std::shared_ptr<AuxUiMigrationLease::State> state, AuxUiLeaseCallback callback,
    StatusOr<AuxUiSnapshot> result) {
  if (!result.has_value()) { CompleteAuxUiBegin(state, std::move(callback), result.error()); return; }
  state->snapshot = std::move(result).value(); state->backend_captured = true;
  RunAuxUiMigrationCaches(state, AuxUiCacheOperation::kStage, false, state->snapshot,
      base::BindOnce(&AsyncDomStorageDatabase::StagedAuxUiBegin,
          weak_ptr_factory_.GetWeakPtr(), state, std::move(callback)));
}
void AsyncDomStorageDatabase::StagedAuxUiBegin(
    std::shared_ptr<AuxUiMigrationLease::State> state, AuxUiLeaseCallback callback, DbStatus status) {
  if (!status.ok()) { CompleteAuxUiBegin(state, std::move(callback), std::move(status)); return; }
  state->private_target_staged = true;
  RunAuxUiMigrationCaches(state, AuxUiCacheOperation::kValidate, false, state->snapshot,
      base::BindOnce(&AsyncDomStorageDatabase::CompleteAuxUiBegin,
          weak_ptr_factory_.GetWeakPtr(), state, std::move(callback)));
}
void AsyncDomStorageDatabase::CompleteAuxUiBegin(
    std::shared_ptr<AuxUiMigrationLease::State> state, AuxUiLeaseCallback callback, DbStatus status) {
  state->pending = false;
  state->source_ready = status.ok() && state->backend_captured && state->private_target_staged &&
      CurrentAuxUiMigrationWriters(state) && !state->tainted &&
      state->snapshot.file_data_synced && (state->snapshot.matches_source || state->snapshot.matches_target);
  state->snapshot.source_ready = state->source_ready;
  state->snapshot.private_target_staged = state->private_target_staged;
  state->snapshot.native_error = state->source_ready ? "" : status.ok() ? "Native source inventory changed" : status.ToString();
  state->snapshot.ordinary_work_queued = state->tainted || !state->deferred.empty();
  AttachAuxUiCacheObservations(state, state->snapshot);
  if (!state->snapshot.native_error.empty()) state->source_ready = state->snapshot.source_ready = false;
  // Once minted, an uncertain source retains the exact opaque owner. The
  // service must keep this discoverable even when source_ready is false.
  std::move(callback).Run(std::unique_ptr<AuxUiMigrationLease>(new AuxUiMigrationLease(state)), state->snapshot);
}
void AsyncDomStorageDatabase::ReadAuxUiMigrationLease(AuxUiMigrationLease& lease, AuxUiReadCallback callback) {
  RunAuxUiMigrationOperation(lease, 1, {}, std::move(callback));
}
void AsyncDomStorageDatabase::ValidateAuxUiMigrationLease(AuxUiMigrationLease& lease, AuxUiReadCallback callback) {
  RunAuxUiMigrationOperation(lease, 1, {}, std::move(callback));
}
void AsyncDomStorageDatabase::StageAuxUiMigrationTargets(AuxUiMigrationLease& lease,
    std::vector<AuxUiTargetMap> targets, AuxUiReadCallback callback) {
  RunAuxUiMigrationOperation(lease, 2, std::move(targets), std::move(callback));
}
void AsyncDomStorageDatabase::CommitAuxUiMigrationLease(AuxUiMigrationLease& lease, AuxUiReadCallback callback) {
  RunAuxUiMigrationOperation(lease, 3, {}, std::move(callback));
}
void AsyncDomStorageDatabase::RestoreAuxUiMigrationLease(AuxUiMigrationLease& lease, AuxUiReadCallback callback) {
  RunAuxUiMigrationOperation(lease, 4, {}, std::move(callback));
}
void AsyncDomStorageDatabase::PublishAuxUiMigrationLease(AuxUiMigrationLease& lease, AuxUiReadCallback callback) {
  RunAuxUiMigrationOperation(lease, 5, {}, std::move(callback));
}
void AsyncDomStorageDatabase::RunAuxUiMigrationOperation(AuxUiMigrationLease& lease,
    int operation, std::vector<AuxUiTargetMap> targets, AuxUiReadCallback callback) {
  auto state = lease.state_;
  if (!CurrentAuxUiMigrationWriters(state) || state->pending ||
      ((operation == 2 || operation == 3 || operation == 5) &&
       (!state->source_ready || state->tainted || (operation != 5 && state->target_attempted)))) {
    std::move(callback).Run(base::unexpected(DbStatus::IOError("Original native transaction phase cannot run"))); return;
  }
  if (!state->backend_captured) {
    auto result = state->snapshot; result.source_ready = false;
    result.native_error = "Original source preparation remains refused; release exact custody";
    std::move(callback).Run(std::move(result)); return;
  }
  state->pending = true;
  RunAuxUiMigrationCaches(state, AuxUiCacheOperation::kRead, false, state->snapshot,
      base::BindOnce(&AsyncDomStorageDatabase::CheckedAuxUiOperation,
          weak_ptr_factory_.GetWeakPtr(), state, operation, std::move(targets), std::move(callback)));
}
void AsyncDomStorageDatabase::CheckedAuxUiOperation(
    std::shared_ptr<AuxUiMigrationLease::State> state, int operation,
    std::vector<AuxUiTargetMap> targets, AuxUiReadCallback callback, DbStatus status) {
  if (!status.ok() || !CurrentAuxUiMigrationWriters(state) ||
      ((operation == 2 || operation == 3 || operation == 5) && state->tainted)) {
    CompleteAuxUiOperation(state, std::move(callback), status.ok() ? DbStatus::IOError("Native registry changed") : status); return;
  }
  if (operation == 3 || operation == 4) { state->target_attempted = true; state->resolved_and_synced = false; }
  RunAuxUiBackend(state, operation == 5 ? 1 : operation, std::move(targets),
      base::BindOnce(&AsyncDomStorageDatabase::BackendAuxUiOperation,
          weak_ptr_factory_.GetWeakPtr(), state, operation, std::move(callback)));
}
void AsyncDomStorageDatabase::BackendAuxUiOperation(
    std::shared_ptr<AuxUiMigrationLease::State> state, int operation,
    AuxUiReadCallback callback, StatusOr<AuxUiSnapshot> result) {
  if (!result.has_value()) { CompleteAuxUiOperation(state, std::move(callback), result.error()); return; }
  state->snapshot = std::move(result).value();
  state->resolved_and_synced = state->snapshot.file_data_synced &&
      (state->snapshot.matches_source || state->snapshot.matches_target);
  if (operation == 5 && (!state->snapshot.matches_target || !state->snapshot.file_data_synced)) {
    CompleteAuxUiOperation(state, std::move(callback), DbStatus::IOError("Real synchronized backend target required before publication")); return;
  }
  if (operation == 4 && (!state->snapshot.matches_source || !state->snapshot.file_data_synced)) {
    CompleteAuxUiOperation(state, std::move(callback), DbStatus::IOError("Real synchronized original backend required before cache restoration")); return;
  }
  AuxUiCacheOperation cache = operation == 2 ? AuxUiCacheOperation::kStage :
      operation == 4 ? AuxUiCacheOperation::kRestore : operation == 5 ?
      AuxUiCacheOperation::kPublish : AuxUiCacheOperation::kValidate;
  RunAuxUiMigrationCaches(state, cache, false, state->snapshot,
      base::BindOnce(&AsyncDomStorageDatabase::CachedAuxUiOperation,
          weak_ptr_factory_.GetWeakPtr(), state, operation, std::move(callback)));
}
void AsyncDomStorageDatabase::CachedAuxUiOperation(
    std::shared_ptr<AuxUiMigrationLease::State> state, int operation,
    AuxUiReadCallback callback, DbStatus status) {
  if (status.ok()) {
    if (operation == 2) state->private_target_staged = true;
    if (operation == 4) state->cache_published = false;
    if (operation == 5) state->cache_published = true;
  }
  CompleteAuxUiOperation(state, std::move(callback), std::move(status));
}
void AsyncDomStorageDatabase::CompleteAuxUiOperation(
    std::shared_ptr<AuxUiMigrationLease::State> state, AuxUiReadCallback callback, DbStatus status) {
  state->pending = false;
  state->source_ready = status.ok() && state->backend_captured && state->private_target_staged &&
      CurrentAuxUiMigrationWriters(state) && !state->tainted &&
      state->snapshot.file_data_synced && (state->snapshot.matches_source || state->snapshot.matches_target);
  state->snapshot.native_error = status.ok() ? "" : status.ToString();
  state->snapshot.source_ready = state->source_ready;
  state->snapshot.private_target_staged = state->private_target_staged;
  state->snapshot.cache_published = state->cache_published;
  state->snapshot.ordinary_work_queued = state->tainted || !state->deferred.empty();
  state->snapshot.target_attempted = state->target_attempted;
  AttachAuxUiCacheObservations(state, state->snapshot);
  if (!state->snapshot.native_error.empty()) state->source_ready = state->snapshot.source_ready = false;
  std::move(callback).Run(state->snapshot);
}
void AsyncDomStorageDatabase::ReleaseAuxUiMigrationLease(AuxUiMigrationLease& lease,
    AuxUiBeforeReopen before_reopen, StatusCallback callback) {
  auto state = lease.state_;
  if (!CurrentAuxUiMigrationWriters(state) || state->pending || !before_reopen ||
      (state->target_attempted && (!state->resolved_and_synced ||
       (state->snapshot.matches_target && !state->snapshot.matches_source && !state->cache_published)))) {
    std::move(callback).Run(DbStatus::IOError("Actual target/source cleanup remains held")); return;
  }
  state->pending = true;
  RunAuxUiMigrationCaches(state, AuxUiCacheOperation::kRelease, false, state->snapshot,
      base::BindOnce(&AsyncDomStorageDatabase::ReleasedAuxUiCaches,
          weak_ptr_factory_.GetWeakPtr(), state, std::move(before_reopen), std::move(callback)));
}
void AsyncDomStorageDatabase::ReleasedAuxUiCaches(
    std::shared_ptr<AuxUiMigrationLease::State> state, AuxUiBeforeReopen before_reopen,
    StatusCallback callback, DbStatus status) {
  state->pending = false;
  if (!status.ok() || !CurrentAuxUiMigrationWriters(state)) {
    std::move(callback).Run(status.ok() ? DbStatus::IOError("Original native release owner changed") : status); return;
  }
  status = std::move(before_reopen).Run();
  if (!status.ok()) { std::move(callback).Run(std::move(status)); return; }
  // The concrete native service just resumed its exact namespaces in this
  // owning stack. No queued ordinary message dispatches before the join.
  ReleaseAuxUiMigrationGate(state);
  std::move(callback).Run(DbStatus::OK());
}
void AsyncDomStorageDatabase::ReleaseAuxUiMigrationGate(
    std::shared_ptr<AuxUiMigrationLease::State> state) {
  CHECK(aux_ui_migration_gate_ == state);
  auto deferred = std::move(state->deferred);
  aux_ui_migration_gate_.reset();
  for (auto& operation : deferred) std::move(operation).Run();
}
