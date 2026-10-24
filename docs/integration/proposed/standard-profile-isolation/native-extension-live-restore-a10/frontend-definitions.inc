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
