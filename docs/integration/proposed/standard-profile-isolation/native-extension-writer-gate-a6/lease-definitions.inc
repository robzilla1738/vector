struct StorageFrontend::AuxUiMigrationLease::State {
  State();
  ~State();
  base::WeakPtr<StorageFrontend> owner;
  scoped_refptr<const Extension> extension;
  std::array<std::optional<std::string>, 6> source, target;
  std::vector<base::OnceClosure> deferred;
  bool pending = true, tainted = false, target_attempted = false;
  bool target_file_data_synced = false, target_readback_matches = false;
};
StorageFrontend::AuxUiMigrationLease::State::State() = default;
StorageFrontend::AuxUiMigrationLease::State::~State() = default;
StorageFrontend::AuxUiMigrationLease::AuxUiMigrationLease(
    std::shared_ptr<State> state,
    std::unique_ptr<ValueStore::AuxUiPreferenceCapture> capture)
    : state_(std::move(state)), capture_(std::move(capture)) {}
StorageFrontend::AuxUiMigrationLease::~AuxUiMigrationLease() = default;
std::array<std::optional<std::string>, 6>
StorageFrontend::AuxUiMigrationLease::CopySourceRecords() const {
  return state_ ? state_->source : std::array<std::optional<std::string>, 6>();
}
StorageFrontend::AuxUiMigrationReadback::AuxUiMigrationReadback() = default;
StorageFrontend::AuxUiMigrationReadback::AuxUiMigrationReadback(AuxUiMigrationReadback&&) = default;
StorageFrontend::AuxUiMigrationReadback& StorageFrontend::AuxUiMigrationReadback::operator=(AuxUiMigrationReadback&&) = default;
StorageFrontend::AuxUiMigrationReadback::~AuxUiMigrationReadback() = default;

void StorageFrontend::BeginAuxUiMigrationLease(
    scoped_refptr<const Extension> extension,
    base::OnceCallback<void(AuxUiMigrationLeaseResult)> callback) {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);
  if (!extension || aux_ui_migration_gate_ || !CanUseAuxUiMigrationBackend(*extension)) {
    std::move(callback).Run(base::unexpected(ValueStore::Status(
        ValueStore::OTHER_ERROR, "Actual Aux backend writer gate unavailable"))); return;
  }
  auto state = std::make_shared<AuxUiMigrationLease::State>();
  state->owner = weak_factory_.GetWeakPtr(); state->extension = extension;
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
        state->target = state->source;
        // This is the exact pair order of the actual backend's six-key token.
        // Preserve original JSON bytes and explicit false; never parse/rewrite.
        for (size_t i = 0; i < state->target.size(); i += 2) if (state->source[i]) {
          state->target[i + 1] = state->source[i]; state->target[i].reset();
        }
        std::move(callback).Run(base::WrapUnique(new AuxUiMigrationLease(
            state, std::move(captured.value()))));
      }, weak_factory_.GetWeakPtr(), state, std::move(callback)));
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
  CommitAuxUiPreferencesUngated(state->extension, std::move(lease.capture_), base::BindOnce(
      [](base::WeakPtr<StorageFrontend> owner,
         std::shared_ptr<AuxUiMigrationLease::State> state,
         base::OnceCallback<void(ValueStore::Status)> callback, ValueStore::Status status) {
        state->pending = false;
        state->target_file_data_synced = status.ok();
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
  CaptureAuxUiPreferencesUngated(state->extension, base::BindOnce(
      [](base::WeakPtr<StorageFrontend> owner,
         std::shared_ptr<AuxUiMigrationLease::State> state,
         base::OnceCallback<void(AuxUiMigrationReadbackResult)> callback,
         ValueStore::AuxUiPreferenceCaptureResult captured) {
        state->pending = false;
        if (!owner || owner->aux_ui_migration_gate_ != state ||
            !owner->CanUseAuxUiMigrationBackend(*state->extension) || !captured.has_value()) {
          state->target_readback_matches = false;
          std::move(callback).Run(base::unexpected(ValueStore::Status(
              ValueStore::OTHER_ERROR, "Aux raw target readback refused"))); return;
        }
        AuxUiMigrationReadback result;
        result.records = captured.value()->CopyRecordsForNativeJournal();
        result.matches_source = result.records == state->source;
        result.matches_target = result.records == state->target;
        result.commit_file_data_synced = state->target_file_data_synced;
        result.ordinary_work_queued = state->tainted || !state->deferred.empty();
        state->target_readback_matches = result.matches_target;
        std::move(callback).Run(std::move(result));
      }, weak_factory_.GetWeakPtr(), state, std::move(callback)));
}
bool StorageFrontend::ReleaseAuxUiMigrationLease(AuxUiMigrationLease& lease) {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);
  auto state = lease.state_;
  if (!state || state->owner.get() != this || aux_ui_migration_gate_ != state || state->pending ||
      (state->target_attempted && (!CanUseAuxUiMigrationBackend(*state->extension) ||
       !state->target_file_data_synced ||
       !state->target_readback_matches || state->tainted || !state->deferred.empty()))) return false;
  // No target attempt, or actual successful file-data sync + exact raw target
  // readback. Native controller still owns cross-store journal/activation.
  lease.capture_.reset(); lease.state_.reset(); ReleaseAuxUiMigrationGate(state); return true;
}
void StorageFrontend::ReleaseAuxUiMigrationGate(
    std::shared_ptr<AuxUiMigrationLease::State> state) {
  if (aux_ui_migration_gate_ != state) return;
  aux_ui_migration_gate_.reset();
  auto pending = std::move(state->deferred);
  for (auto& operation : pending) std::move(operation).Run();
}
