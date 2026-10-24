void AsyncDomStorageDatabase::PrepareAuxUiMigrationRecoveryCaches(
    AuxUiMigrationLease& lease, AuxUiReadCallback callback) {
  RunAuxUiRecoveryAction(lease, 0, std::move(callback));
}
void AsyncDomStorageDatabase::ReadAuxUiMigrationRecovery(
    AuxUiMigrationLease& lease, AuxUiReadCallback callback) {
  RunAuxUiRecoveryAction(lease, 1, std::move(callback));
}
void AsyncDomStorageDatabase::RestoreAuxUiMigrationRecovery(
    AuxUiMigrationLease& lease, AuxUiReadCallback callback) {
  RunAuxUiRecoveryAction(lease, 2, std::move(callback));
}
void AsyncDomStorageDatabase::RunAuxUiRecoveryAction(
    AuxUiMigrationLease& lease, int operation, AuxUiReadCallback callback) {
  auto state = lease.state_;
  if (!CurrentAuxUiMigrationWriters(state) || state->pending || state->tainted ||
      state->recovery_descriptor_sha256.empty() || !state->recovery_backend ||
      !state->recovery_requalified || (operation == 2 && !state->recovery_cache_prepared)) {
    std::move(callback).Run(base::unexpected(DbStatus::IOError("Actual requalified original/cache custody required"))); return;
  }
  state->pending = true;
  RunAuxUiMigrationCaches(state, AuxUiCacheOperation::kRead, false, state->snapshot,
      base::BindOnce(&AsyncDomStorageDatabase::CheckedAuxUiRecoveryAction,
          weak_ptr_factory_.GetWeakPtr(), state, operation, std::move(callback)));
}
void AsyncDomStorageDatabase::CheckedAuxUiRecoveryAction(
    std::shared_ptr<AuxUiMigrationLease::State> state, int operation,
    AuxUiReadCallback callback, DbStatus status) {
  if (!status.ok() || !CurrentAuxUiMigrationWriters(state) || state->tainted) {
    state->pending = false;
    state->recovery_original_restored = false;
    std::move(callback).Run(base::unexpected(status.ok() ? DbStatus::IOError("Actual recovery writer registry changed") : status)); return;
  }
  if (operation == 2) {
    // This is an original restoration under the same immutable descriptor,
    // never an allocator/target retry. Only its actual result can reopen.
    state->recovery_write_attempted = true;
    state->recovery_original_restored = false;
  }
  RunAuxUiBackend(state, operation == 2 ? 4 : 1, {},
      base::BindOnce(&AsyncDomStorageDatabase::BackendAuxUiRecoveryAction,
          weak_ptr_factory_.GetWeakPtr(), state, operation, std::move(callback)), true);
}
void AsyncDomStorageDatabase::BackendAuxUiRecoveryAction(
    std::shared_ptr<AuxUiMigrationLease::State> state, int operation,
    AuxUiReadCallback callback, StatusOr<AuxUiSnapshot> result) {
  if (!result.has_value() || !CurrentAuxUiMigrationWriters(state) || state->tainted) {
    state->pending = false;
    state->recovery_original_restored = false;
    std::move(callback).Run(result.has_value() ?
        StatusOr<AuxUiSnapshot>(base::unexpected(DbStatus::IOError("Actual recovery owner changed after backend operation"))) : std::move(result)); return;
  }
  if (operation == 2 && (!result->matches_source || !result->file_data_synced)) {
    state->pending = false;
    state->recovery_original_restored = false;
    std::move(callback).Run(base::unexpected(DbStatus::IOError("Actual complete original readback/sync required before cache restoration"))); return;
  }
  if (state->recovery_original_restored && (!result->matches_source || !result->file_data_synced)) {
    state->pending = false; state->recovery_original_restored = false;
    std::move(callback).Run(base::unexpected(DbStatus::IOError("Previously restored original is no longer verified"))); return;
  }
  auto snapshot = std::move(result).value();
  const auto cache = operation == 0 ? AuxUiCacheOperation::kRecoveryStage :
      operation == 2 ? AuxUiCacheOperation::kRecoveryRestore : AuxUiCacheOperation::kRead;
  RunAuxUiMigrationCaches(state, cache, false, snapshot,
      base::BindOnce(&AsyncDomStorageDatabase::CompletedAuxUiRecoveryAction,
          weak_ptr_factory_.GetWeakPtr(), state, operation, snapshot, std::move(callback)));
}
void AsyncDomStorageDatabase::CompletedAuxUiRecoveryAction(
    std::shared_ptr<AuxUiMigrationLease::State> state, int operation,
    AuxUiSnapshot snapshot, AuxUiReadCallback callback, DbStatus status) {
  state->pending = false;
  if (!status.ok() || !CurrentAuxUiMigrationWriters(state) || state->tainted) {
    state->recovery_original_restored = false;
    std::move(callback).Run(base::unexpected(status.ok() ? DbStatus::IOError("Actual recovery cache registry changed") : status)); return;
  }
  if (operation == 0) state->recovery_cache_prepared = true;
  if (operation == 2) state->recovery_original_restored = true;
  // Do not infer an unacknowledged native cache adoption from bare renderer
  // flags. After a lost internal ack, explicit original Restore must recheck
  // every native owner and renderer again; it never replays target creation.
  snapshot.recovery_cache_prepared = state->recovery_cache_prepared;
  snapshot.recovery_original_restored = state->recovery_original_restored;
  snapshot.source_ready = snapshot.private_target_staged = snapshot.cache_published = false;
  for (auto& map : snapshot.maps) {
    auto original = AuxUiCacheCohort::DecodeSelected(map.source, map.session_ids.empty());
    auto target = AuxUiCacheCohort::DecodeSelected(map.target, map.session_ids.empty());
    if (!original.has_value() || !target.has_value()) {
      std::move(callback).Run(base::unexpected(DbStatus::IOError("Original recovery cache codec changed"))); return;
    }
    std::map<std::u16string, std::u16string> source_units, target_units;
    for (const auto& entry : original.value()) source_units.emplace(
        std::u16string(entry->key.begin(), entry->key.end()), std::u16string(entry->value.begin(), entry->value.end()));
    for (const auto& entry : target.value()) target_units.emplace(
        std::u16string(entry->key.begin(), entry->key.end()), std::u16string(entry->value.begin(), entry->value.end()));
    for (const auto& writer : state->writers) {
      if (!writer->MatchesAuxUiMigrationMap(map)) continue;
      for (auto& view : writer->CopyAuxUiMigrationCacheViews()) {
        if ((map.session_ids.empty() ? !view.namespace_id.empty() :
             !std::ranges::contains(map.session_ids, view.namespace_id)) ||
            (view.source != source_units && view.source != target_units) ||
            (state->recovery_cache_prepared && !view.recovery_prepared) ||
            (state->recovery_original_restored && !view.recovery_restored)) {
          state->recovery_original_restored = false;
          std::move(callback).Run(base::unexpected(DbStatus::IOError("Actual journal-original cache pairing/readback changed"))); return;
        }
        map.cache_views.push_back(std::move(view));
      }
    }
  }
  std::move(callback).Run(std::move(snapshot));
}
