struct AsyncDomStorageDatabase::AuxUiCacheRound {
  std::shared_ptr<AuxUiMigrationLease::State> state;
  AuxUiCacheOperation operation = AuxUiCacheOperation::kRead;
  bool prepare = false;
  AuxUiSnapshot snapshot;
  size_t cursor = 0;
  StatusCallback callback;
};
bool AsyncDomStorageDatabase::CurrentAuxUiMigrationWriters(
    const std::shared_ptr<AuxUiMigrationLease::State>& state) const {
  if (!state || state != aux_ui_migration_gate_ || state->owner.get() != this ||
      state->writers.size() != committers_.size()) return false;
  for (const auto& writer : state->writers)
    if (!writer || !committers_.contains(writer.get())) return false;
  return true;
}
void AsyncDomStorageDatabase::RunAuxUiMigrationCaches(
    std::shared_ptr<AuxUiMigrationLease::State> state,
    AuxUiCacheOperation operation, bool prepare,
    const AuxUiSnapshot& snapshot, StatusCallback callback) {
  auto round = std::make_shared<AuxUiCacheRound>();
  round->state = std::move(state); round->operation = operation;
  round->prepare = prepare; round->snapshot = snapshot;
  round->callback = std::move(callback);
  ContinueAuxUiMigrationCaches(round, DbStatus::OK());
}
void AsyncDomStorageDatabase::ContinueAuxUiMigrationCaches(
    std::shared_ptr<AuxUiCacheRound> round, DbStatus status) {
  if (!status.ok() || !CurrentAuxUiMigrationWriters(round->state)) {
    std::move(round->callback).Run(status.ok() ?
        DbStatus::IOError("Original native writer registry changed") : std::move(status)); return;
  }
  const size_t count = !round->prepare && round->operation == AuxUiCacheOperation::kRelease ?
      round->state->prepared_writers : round->state->writers.size();
  if (round->cursor == count) {
    std::move(round->callback).Run(DbStatus::OK()); return;
  }
  auto writer = round->state->writers[round->cursor++];
  auto reply = mojo::WrapCallbackWithDefaultInvokeIfNotRun(base::BindOnce(
      &AsyncDomStorageDatabase::ContinueAuxUiMigrationCaches,
      weak_ptr_factory_.GetWeakPtr(), round), DbStatus::IOError("Actual native cache owner reply lost"));
  if (round->prepare) {
    round->state->prepared_writers = round->cursor;
    writer->PrepareAuxUiMigrationCaches(round->state->token, std::move(reply)); return;
  }
  const AuxUiMapSnapshot* map = nullptr;
  for (const auto& candidate : round->snapshot.maps) {
    if (!writer->MatchesAuxUiMigrationMap(candidate)) continue;
    if (map) { std::move(reply).Run(DbStatus::IOError("Native cache map pairing is ambiguous")); return; }
    map = &candidate;
  }
  if (round->operation == AuxUiCacheOperation::kStage && !map) {
    auto locator = writer->CopyAuxUiMigrationLocator();
    if (!locator.has_value()) { std::move(reply).Run(locator.error()); return; }
    const auto origin = url::Origin::Create(GURL("chrome-extension://gokkffaiccpmoeodpmeamcjajcagjmkm/"));
    if (locator->storage_key().origin() == origin) {
      std::move(reply).Run(DbStatus::IOError("Actual live UI map is absent from captured topology")); return;
    }
    // Non-UI maps have no renderer target; their existing native receiver
    // hold remains until the same real cleanup. Nothing is imported there.
    base::SequencedTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE,
        base::BindOnce([](StatusCallback callback) { std::move(callback).Run(DbStatus::OK()); }, std::move(reply)));
    return;
  }
  if (map && (round->operation == AuxUiCacheOperation::kPublish ||
              round->operation == AuxUiCacheOperation::kRestore)) {
    DbStatus adopted = writer->AdoptAuxUiMigrationMap(*map,
        round->operation == AuxUiCacheOperation::kPublish);
    if (!adopted.ok()) { std::move(reply).Run(std::move(adopted)); return; }
  }
  writer->RunAuxUiMigrationCaches(round->state->token, round->operation, map, std::move(reply));
}
void AsyncDomStorageDatabase::AttachAuxUiCacheObservations(
    const std::shared_ptr<AuxUiMigrationLease::State>& state, AuxUiSnapshot& snapshot) const {
  for (auto& map : snapshot.maps) map.cache_views.clear();
  if (!CurrentAuxUiMigrationWriters(state)) {
    snapshot.native_error = "Original native cache registry changed";
    snapshot.source_ready = false; return;
  }
  for (const auto& writer : state->writers) {
    for (auto& map : snapshot.maps) {
      if (!writer->MatchesAuxUiMigrationMap(map)) continue;
      auto views = writer->CopyAuxUiMigrationCacheViews();
      for (auto& view : views) {
        if (map.session_ids.empty() ? !view.namespace_id.empty() :
            !std::ranges::contains(map.session_ids, view.namespace_id)) {
          snapshot.native_error = "Actual native cache namespace pairing changed";
          snapshot.source_ready = false; return;
        }
        auto source_units = AuxUiCacheCohort::DecodeSelected(map.source, map.session_ids.empty());
        auto target_units = AuxUiCacheCohort::DecodeSelected(map.target, map.session_ids.empty());
        std::map<std::u16string, std::u16string> expected_source, expected_target;
        if (!source_units.has_value() || !target_units.has_value()) {
          snapshot.native_error = "Native cache unit codec refused";
          snapshot.source_ready = false; return;
        }
        for (const auto& entry : source_units.value()) expected_source.emplace(
            std::u16string(entry->key.begin(), entry->key.end()), std::u16string(entry->value.begin(), entry->value.end()));
        for (const auto& entry : target_units.value()) expected_target.emplace(
            std::u16string(entry->key.begin(), entry->key.end()), std::u16string(entry->value.begin(), entry->value.end()));
        if (view.source != expected_source || view.staged != expected_target) {
          snapshot.native_error = "Actual private cache source/target pairing disagrees";
          snapshot.source_ready = false; return;
        }
        map.cache_views.push_back(std::move(view));
      }
    }
  }
}
