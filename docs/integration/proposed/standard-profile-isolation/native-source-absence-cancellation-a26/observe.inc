StatusOr<AsyncDomStorageDatabase::AuxUiSnapshot> AuxObserveOriginalAbsence(
    AuxDomCapture& fresh, const AsyncDomStorageDatabase::AuxUiSnapshot& recorded,
    bool local, DomStorageDatabase* database) {
  if (!fresh.captured || fresh.target_attempted || recorded.maps.size() != fresh.maps.size() ||
      recorded.maps.size() > 256 || recorded.source_topology_sha256.size() != 64)
    return base::unexpected(DbStatus::IOError("Exact fresh source inventory required for absence observation"));
  auto sync = database->SyncForAuxMigration();
  if (!sync.ok()) return base::unexpected(sync);
  fresh.file_data_synced = true;
  auto observed = AuxReadDomCapture(fresh, local, database);
  if (!observed.has_value()) return base::unexpected(observed.error());
  if (!observed->matches_source || !observed->file_data_synced)
    return base::unexpected(DbStatus::IOError("Fresh source changed during absence observation"));
  auto metadata = database->ReadAllMetadata();
  if (!metadata.has_value()) return base::unexpected(metadata.error());
  AuxDomCapture original;
  original.unrelated_metadata_sha256 = fresh.unrelated_metadata_sha256;
  std::set<size_t> matched;
  std::vector<std::optional<int64_t>> fresh_ids;
  size_t absent = 0;
  for (size_t ordinal = 0; ordinal < recorded.maps.size(); ++ordinal) {
    const auto& row = recorded.maps[ordinal];
    if (row.map_ordinal != ordinal || row.source_map_sha256.size() != 64 ||
        row.source != AuxSelectedEntries(row.source, local))
      return base::unexpected(DbStatus::IOError("Exact original source descriptor required"));
    auto namespaces = row.session_ids;
    std::sort(namespaces.begin(), namespaces.end());
    if (std::adjacent_find(namespaces.begin(), namespaces.end()) != namespaces.end() ||
        (local ? !namespaces.empty() : namespaces.empty()))
      return base::unexpected(DbStatus::IOError("Original source namespace scope is ambiguous"));
    size_t index = fresh.maps.size();
    for (size_t i = 0; i < fresh.maps.size(); ++i) {
      const auto& current = fresh.maps[i];
      auto current_namespaces = current.locator.session_ids();
      std::sort(current_namespaces.begin(), current_namespaces.end());
      // Scope comparison is data correlation only. No namespace or map ID
      // is assigned/rebound, and this observation cannot restore a target.
      if (current.locator.storage_key() != row.storage_key || current_namespaces != namespaces) continue;
      if (index != fresh.maps.size())
        return base::unexpected(DbStatus::IOError("Original source has multiple fresh native scopes"));
      index = i;
    }
    if (index == fresh.maps.size() || !matched.insert(index).second)
      return base::unexpected(DbStatus::IOError("Original source lacks a unique captured fresh scope"));
    const auto& current = fresh.maps[index];
    if (current.source_persisted != row.source_persisted ||
        current.last_accessed != row.source_last_accessed ||
        current.last_modified != row.source_last_modified || current.total_size != row.source_total_size ||
        AuxSelectedEntries(current.source, local) != row.source)
      return base::unexpected(DbStatus::IOError("Fresh physical source differs from recorded original"));
    DomStorageDatabase::MapLocator locator = row.map_id ?
        DomStorageDatabase::MapLocator(row.storage_key, *row.map_id) :
        DomStorageDatabase::MapLocator(row.storage_key);
    for (const auto& ns : row.session_ids) locator.AddSession(ns);
    if (!row.source_persisted) {
      ++absent;
      if (!row.source.empty() || !current.source.empty() || row.source_last_accessed ||
          row.source_last_modified || row.source_total_size)
        return base::unexpected(DbStatus::IOError("Original native absence is not empty"));
    }
    if (current.locator.map_id() != row.map_id) {
      if (local || row.source_persisted || row.session_ids.size() != 1 ||
          !row.map_id || !current.locator.map_id())
        return base::unexpected(DbStatus::IOError("Changed persisted/native source identity cannot be canceled"));
      // The old allocator ID is not treated as the fresh area's identity.
      // It must have no metadata reference anywhere and no raw values. This
      // proves old physical absence only, never restored correspondence.
      for (const auto& entry : metadata->map_metadata)
        if (entry.map_locator.map_id() == row.map_id)
          return base::unexpected(DbStatus::IOError("Old Session map still has a native metadata reference"));
      auto old_entries = database->ReadMapKeyValues(locator.Clone());
      if (!old_entries.has_value()) return base::unexpected(old_entries.error());
      if (!old_entries->empty())
        return base::unexpected(DbStatus::IOError("Old unpersisted Session ID contains physical data"));
    }
    AuxDomMap source{std::move(locator), current.source, current.source,
        row.source_last_accessed, row.source_last_modified, row.source_total_size, row.source_persisted};
    if (AuxFullMapDigest(source, false, local) != row.source_map_sha256)
      return base::unexpected(DbStatus::IOError("Complete original source digest differs"));
    original.maps.push_back(std::move(source));
    fresh_ids.push_back(current.locator.map_id());
  }
  if (!absent || AuxTopologyDigest(original, false, local) != recorded.source_topology_sha256)
    return base::unexpected(DbStatus::IOError("Complete original source-absence topology is unproven"));
  original.captured = true; original.file_data_synced = true;
  auto result = AuxReadDomCapture(original, local, database);
  if (!result.has_value()) return base::unexpected(result.error());
  if (!result->matches_source || !result->file_data_synced)
    return base::unexpected(DbStatus::IOError("Original source readback changed"));
  for (size_t i = 0; i < result->maps.size(); ++i) {
    result->maps[i].fresh_map_id = fresh_ids[i];
    result->maps[i].target.clear(); result->maps[i].target_map_sha256.clear();
  }
  result->target_topology_sha256.clear(); result->allocation_action_sha256.clear();
  result->matches_target = false; result->known_source_target_mixture = false;
  result->source_ready = result->private_target_staged = result->cache_published = false;
  result->source_absence_cancellation = true;
  // No recovery capsule is produced. The verified controller may cancel only
  // after separately joining fresh editor/failed-memory/worker intents. This
  // function neither releases those owners nor discards/restores any values.
  return result;
}
