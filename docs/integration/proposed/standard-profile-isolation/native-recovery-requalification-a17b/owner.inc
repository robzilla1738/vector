void AsyncDomStorageDatabase::RequalifyAuxUiMigrationLease(
    AuxUiMigrationLease& lease, AuxUiSnapshot recorded, AuxUiReadCallback callback) {
  auto state = lease.state_;
  if (recorded.maps.size() > 256) {
    std::move(callback).Run(base::unexpected(DbStatus::NotSupported("Finite native recovery map bound exceeded"))); return;
  }
  size_t bytes = 0;
  for (const auto& map : recorded.maps) for (const auto* entries : {&map.source, &map.target})
    for (const auto& [key, value] : *entries) {
      bytes += key.size() + value.size();
      if (bytes > 16 * 1024 * 1024) {
        std::move(callback).Run(base::unexpected(DbStatus::NotSupported("Finite native recovery byte bound exceeded"))); return;
      }
    }
  const std::string descriptor = AuxRecoveryDescriptorDigest(recorded);
  if (!CurrentAuxUiMigrationWriters(state) || state->pending || !state->source_ready ||
      state->target_attempted || state->tainted ||
      (!state->recovery_descriptor_sha256.empty() && state->recovery_descriptor_sha256 != descriptor)) {
    std::move(callback).Run(base::unexpected(DbStatus::IOError("Fresh actual source hold/original recovery descriptor required"))); return;
  }
  // Freeze this operation's descriptor before any asynchronous boundary.
  // A later call may re-read the same original, never substitute a new plan.
  state->recovery_descriptor_sha256 = descriptor;
  state->pending = true;
  RunAuxUiMigrationCaches(state, AuxUiCacheOperation::kValidate, false, state->snapshot,
      base::BindOnce(&AsyncDomStorageDatabase::CheckedAuxUiRecovery,
          weak_ptr_factory_.GetWeakPtr(), state, std::move(recorded), std::move(callback)));
}
void AsyncDomStorageDatabase::CheckedAuxUiRecovery(
    std::shared_ptr<AuxUiMigrationLease::State> state, AuxUiSnapshot recorded,
    AuxUiReadCallback callback, DbStatus status) {
  if (!status.ok() || !CurrentAuxUiMigrationWriters(state) || state->tainted) {
    state->pending = false;
    std::move(callback).Run(base::unexpected(status.ok() ? DbStatus::IOError("Fresh native recovery writer inventory changed") : status)); return;
  }
  if (!state->recovery_backend) state->recovery_backend = std::make_shared<AuxDomCapture>();
  auto reply = base::BindOnce(
      [](base::WeakPtr<AsyncDomStorageDatabase> owner,
         std::shared_ptr<AuxUiMigrationLease::State> state, AuxUiReadCallback callback,
         StatusOr<AuxUiSnapshot> result) {
        state->pending = false;
        if (!owner || !owner->CurrentAuxUiMigrationWriters(state) || state->tainted)
          result = base::unexpected(DbStatus::IOError("Actual fresh recovery owner changed"));
        std::move(callback).Run(std::move(result));
      }, weak_ptr_factory_.GetWeakPtr(), state, std::move(callback));
  auto guarded = mojo::WrapCallbackWithDefaultInvokeIfNotRun(
      base::BindPostTaskToCurrentDefault(std::move(reply)),
      StatusOr<AuxUiSnapshot>(base::unexpected(DbStatus::IOError("Actual recovery observation reply lost"))));
  database_.PostTaskWithThisObject(base::BindOnce(
      [](std::shared_ptr<AuxDomCapture> fresh, std::shared_ptr<AuxDomCapture> recovery,
         AuxUiSnapshot recorded, bool local, bool sqlite,
         AuxUiReadCallback callback, DomStorageDatabase* database) {
        std::move(callback).Run(AuxRequalifyRecordedCapture(*fresh, *recovery, recorded, local, sqlite, database));
      }, state->backend, state->recovery_backend, std::move(recorded),
      storage_type_ == StorageType::kLocalStorage, is_sqlite_, std::move(guarded)));
}
