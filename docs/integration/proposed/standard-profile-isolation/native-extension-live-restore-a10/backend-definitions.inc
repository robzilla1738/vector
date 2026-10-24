ValueStore::AuxUiPreferenceReadbackResult
LeveldbValueStore::CommitRetainedAuxUiPreferenceMigration(
    std::shared_ptr<AuxUiPreferenceCapture> capture) {
  return ApplyRetainedAuxUiPreferenceMigration(std::move(capture), false, false);
}
ValueStore::AuxUiPreferenceReadbackResult
LeveldbValueStore::ReadRetainedAuxUiPreferenceMigration(
    std::shared_ptr<AuxUiPreferenceCapture> capture) {
  return ApplyRetainedAuxUiPreferenceMigration(std::move(capture), false, true);
}
ValueStore::AuxUiPreferenceReadbackResult
LeveldbValueStore::RestoreRetainedAuxUiPreferenceMigration(
    std::shared_ptr<AuxUiPreferenceCapture> capture) {
  return ApplyRetainedAuxUiPreferenceMigration(std::move(capture), true, false);
}
ValueStore::AuxUiPreferenceReadbackResult
LeveldbValueStore::ApplyRetainedAuxUiPreferenceMigration(
    std::shared_ptr<AuxUiPreferenceCapture> capture, bool restore, bool read_only) {
  if (!capture || capture->owner.get() != this || !db())
    return base::unexpected(Status(OTHER_ERROR, "Original retained Aux backend owner unavailable"));
  if (!read_only && !restore &&
      (capture->retained_target_attempted || capture->retained_restore_attempted))
    return base::unexpected(Status(OTHER_ERROR, "Observe the original target attempt instead of replaying it"));
  if (!read_only && restore && !capture->retained_observation_known)
    return base::unexpected(Status(OTHER_ERROR, "Exact source/target readback required before restoring"));
  if (!read_only) {
    if (restore) capture->retained_restore_attempted = true;
    else capture->retained_target_attempted = true;
  }
  capture->retained_observation_known = false;
  auto read = [&]() -> base::expected<AuxUiPreferenceRecords, Status> {
    AuxUiPreferenceRecords records;
    for (size_t index = 0; index < kAuxUiPreferenceKeys.size(); ++index) {
      std::string raw;
      const auto status = db()->Get(read_options(), kAuxUiPreferenceKeys[index], &raw);
      if (!status.ok() && !status.IsNotFound()) return base::unexpected(ToValueStoreError(status));
      if (status.ok()) records[index] = std::move(raw);
    }
    return records;
  };
  auto before = read();
  if (!before.has_value()) return base::unexpected(std::move(before.error()));
  const auto target = capture->CopyTargetRecordsForNativeJournal();
  if (before.value() != capture->records && before.value() != target)
    return base::unexpected(Status(OTHER_ERROR, "Current Aux preference bytes match neither retained source nor target"));
  if (!read_only && !restore && before.value() != capture->records)
    return base::unexpected(Status(OTHER_ERROR, "Aux source changed before target CAS"));
  const auto& expected = read_only ? before.value() : restore ? capture->records : target;
  leveldb::WriteBatch batch;
  if (!read_only) for (size_t index = 0; index < kAuxUiPreferenceKeys.size(); ++index) {
    if (expected[index]) batch.Put(kAuxUiPreferenceKeys[index], *expected[index]);
    else batch.Delete(kAuxUiPreferenceKeys[index]);
  }
  leveldb::WriteOptions options;
  options.sync = true;
  // The original token is NOT invalidated by its own transaction. Every
  // ordinary existing Get/Write still invalidates it via the real factory.
  // An empty readback batch gives a fresh file-data sync after a lost result.
  const auto written = db()->Write(options, &batch);
  if (!written.ok()) return base::unexpected(ToValueStoreError(written));
  auto after = read();
  if (!after.has_value()) return base::unexpected(std::move(after.error()));
  if (capture->owner.get() != this || after.value() != expected)
    return base::unexpected(Status(OTHER_ERROR, "Aux raw preference readback changed after physical sync"));
  AuxUiPreferenceReadback result;
  result.records = std::move(after.value());
  result.matches_source = result.records == capture->records;
  result.matches_target = result.records == target;
  result.file_data_synced = true;
  result.target_attempted = capture->retained_target_attempted;
  result.restore_attempted = capture->retained_restore_attempted;
  capture->retained_observation_known = true;
  return result;
}
