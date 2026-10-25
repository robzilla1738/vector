void AsyncDomStorageDatabase::HandoffAuxUiMigrationRecovery(
    AuxUiMigrationLease& original, AuxUiLeaseCallback callback) {
  auto state = original.state_;
  if (state->handoff_installed) {
    ReadAuxUiMigrationHandoff(original, std::move(callback)); return;
  }
  if (!CurrentAuxUiMigrationWriters(state) || state->pending || state->tainted ||
      !state->deferred.empty() || state->recovery_descriptor_sha256.empty() ||
      (!state->recovery_original_restored && !state->source_absence_proven)) {
    std::move(callback).Run(base::unexpected(DbStatus::IOError(
        "Actual restored source and closed original ownership required")), {}); return;
  }
  if (!state->handoff_successor) {
    auto next = std::make_shared<AuxUiMigrationLease::State>();
    next->owner = weak_ptr_factory_.GetWeakPtr();
    next->writers = state->writers;
    next->prepared_writers = state->prepared_writers;
    state->handoff_successor = std::move(next);
  }
  state->pending = true;
  // Verify the original again on the real DB sequence. This is an original
  // read/sync only; it cannot allocate or repeat a target write.
  RunAuxUiBackend(state, 1, {}, base::BindOnce(
      &AsyncDomStorageDatabase::CheckedAuxUiHandoffSource,
      weak_ptr_factory_.GetWeakPtr(), state, std::move(callback)),
      state->recovery_original_restored);
}
void AsyncDomStorageDatabase::CheckedAuxUiHandoffSource(
    std::shared_ptr<AuxUiMigrationLease::State> state,
    AuxUiLeaseCallback callback, StatusOr<AuxUiSnapshot> result) {
  if (!result.has_value() || !result->matches_source || !result->file_data_synced ||
      !CurrentAuxUiMigrationWriters(state) || state->tainted || !state->deferred.empty()) {
    state->pending = false;
    std::move(callback).Run(base::unexpected(result.has_value() ?
        DbStatus::IOError("Original source readback changed during closed handoff") : result.error()), {});
    return;
  }
  auto next = state->handoff_successor;
  if (next->backend_captured) {
    StartAuxUiHandoffCaches(state, std::move(callback), false); return;
  }
  // A failed read may be recaptured before any cache transition was issued.
  // No future plan has escaped and no target IO is repeated by this sentinel.
  CHECK(!state->handoff_issued);
  next->backend = std::make_shared<AuxDomCapture>();
  for (const auto& writer : state->writers) {
    auto locator = writer->CopyAuxUiMigrationLocator();
    if (!locator.has_value()) {
      state->pending = false;
      std::move(callback).Run(base::unexpected(locator.error()), {}); return;
    }
    next->backend->live_locators.push_back(std::move(locator).value());
  }
  RunAuxUiBackend(state, 0, {}, base::BindOnce(
      &AsyncDomStorageDatabase::CapturedAuxUiHandoffSource,
      weak_ptr_factory_.GetWeakPtr(), state, std::move(callback)), false, true);
}
void AsyncDomStorageDatabase::CapturedAuxUiHandoffSource(
    std::shared_ptr<AuxUiMigrationLease::State> state,
    AuxUiLeaseCallback callback, StatusOr<AuxUiSnapshot> result) {
  if (!result.has_value() || !result->matches_source || !result->file_data_synced ||
      !CurrentAuxUiMigrationWriters(state) || state->tainted || !state->deferred.empty()) {
    state->pending = false;
    std::move(callback).Run(base::unexpected(result.has_value() ?
        DbStatus::IOError("Closed successor source capture changed") : result.error()), {}); return;
  }
  auto next = state->handoff_successor;
  next->snapshot = std::move(result).value();
  next->backend_captured = true;
  StartAuxUiHandoffCaches(state, std::move(callback), false);
}
struct AsyncDomStorageDatabase::AuxUiHandoffRound {
  std::shared_ptr<AuxUiMigrationLease::State> original;
  AuxUiLeaseCallback callback;
  size_t cursor = 0;
  bool observe_only = false;
  std::optional<DbStatus> error;
};
void AsyncDomStorageDatabase::StartAuxUiHandoffCaches(
    std::shared_ptr<AuxUiMigrationLease::State> state,
    AuxUiLeaseCallback callback, bool observe_only) {
  auto round = std::make_shared<AuxUiHandoffRound>();
  round->original = state;
  round->callback = std::move(callback);
  round->observe_only = observe_only || state->handoff_issued;
  state->handoff_issued = true;
  ContinueAuxUiHandoffCaches(std::move(round), DbStatus::OK());
}
void AsyncDomStorageDatabase::ContinueAuxUiHandoffCaches(
    std::shared_ptr<AuxUiHandoffRound> round, DbStatus status) {
  auto state = round->original;
  auto next = state->handoff_successor;
  if (!status.ok() && !round->error) round->error = std::move(status);
  if (!CurrentAuxUiMigrationWriters(state) || state->tainted || !state->deferred.empty()) {
    state->pending = false;
    std::move(round->callback).Run(base::unexpected(DbStatus::IOError(
        "Actual closed handoff owner changed; all custody is retained")), {}); return;
  }
  if (round->cursor == state->writers.size()) {
    state->pending = false;
    if (round->error) {
      std::move(round->callback).Run(base::unexpected(*round->error), {}); return;
    }
    // Every original participant now reports its exact same native successor,
    // actual source and private target plan. Ordinary dispatch never reopened.
    next->pending = true;
    next->private_target_staged = true;
    state->handoff_installed = true;
    aux_ui_migration_gate_ = next;
    RunAuxUiMigrationCaches(next, AuxUiCacheOperation::kValidate, false, next->snapshot,
        base::BindOnce(&AsyncDomStorageDatabase::CompleteAuxUiBegin,
            weak_ptr_factory_.GetWeakPtr(), next, std::move(round->callback)));
    return;
  }
  auto writer = state->writers[round->cursor++];
  const AuxUiMapSnapshot* map = nullptr;
  for (const auto& candidate : next->snapshot.maps) {
    if (!writer->MatchesAuxUiMigrationMap(candidate)) continue;
    if (map) {
      ContinueAuxUiHandoffCaches(round, DbStatus::IOError("Ambiguous native successor map")); return;
    }
    map = &candidate;
  }
  if (!map) {
    auto locator = writer->CopyAuxUiMigrationLocator();
    if (!locator.has_value() || locator->storage_key().origin() == url::Origin::Create(
        GURL("chrome-extension://gokkffaiccpmoeodpmeamcjajcagjmkm/"))) {
      ContinueAuxUiHandoffCaches(round, DbStatus::IOError("Actual UI successor map missing")); return;
    }
  }
  auto reply = mojo::WrapCallbackWithDefaultInvokeIfNotRun(base::BindOnce(
      &AsyncDomStorageDatabase::ContinueAuxUiHandoffCaches,
      weak_ptr_factory_.GetWeakPtr(), round), DbStatus::IOError("Native cache handoff reply unknown"));
  if (round->observe_only)
    writer->ReadAuxUiMigrationCacheHandoff(state->token, next->token, map, std::move(reply));
  else
    writer->HandoffAuxUiMigrationCaches(state->token, next->token, map, std::move(reply));
}
void AsyncDomStorageDatabase::ReadAuxUiMigrationHandoff(
    AuxUiMigrationLease& original, AuxUiLeaseCallback callback) {
  auto state = original.state_;
  auto next = state->handoff_successor;
  if (!next || state->owner.get() != this || state->pending) {
    std::move(callback).Run(base::unexpected(DbStatus::IOError(
        "Exact original handoff remains unavailable or pending")), {}); return;
  }
  if (!state->handoff_installed) {
    if (!CurrentAuxUiMigrationWriters(state) || !next->backend_captured || !state->handoff_issued) {
      std::move(callback).Run(base::unexpected(DbStatus::IOError(
          "Closed native handoff source has not completed")), {}); return;
    }
    state->pending = true;
    // No Handoff RPC is resent. Exact retained participant receipts settle
    // the already-requested transition; no backend/renderer target is written.
    StartAuxUiHandoffCaches(state, std::move(callback), true); return;
  }
  if (!CurrentAuxUiMigrationWriters(next)) {
    std::move(callback).Run(base::unexpected(DbStatus::IOError("Native successor owner changed")), {}); return;
  }
  AuxUiMigrationLease actual(next);
  ReadAuxUiMigrationLease(actual, base::BindOnce(
      [](std::shared_ptr<AuxUiMigrationLease::State> next, AuxUiLeaseCallback callback,
         StatusOr<AuxUiSnapshot> result) {
        AuxUiSnapshot snapshot = next->snapshot;
        if (result.has_value()) snapshot = std::move(result).value();
        else { snapshot.source_ready = false; snapshot.native_error = result.error().ToString(); }
        std::move(callback).Run(std::unique_ptr<AuxUiMigrationLease>(new AuxUiMigrationLease(next)),
                                std::move(snapshot));
      }, next, std::move(callback)));
}

