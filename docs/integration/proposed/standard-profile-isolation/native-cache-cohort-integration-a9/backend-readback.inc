StatusOr<AsyncDomStorageDatabase::AuxUiSnapshot> AuxReadDomCapture(
    AuxDomCapture& capture, bool local, DomStorageDatabase* database) {
  auto metadata = database->ReadAllMetadata();
  if (!metadata.has_value()) return base::unexpected(metadata.error());
  const url::Origin agent = url::Origin::Create(GURL("chrome-extension://gokkffaiccpmoeodpmeamcjajcagjmkm/"));
  std::vector<AuxDomMap> current;
  for (const auto& original : capture.maps) {
    current.push_back({original.locator.Clone(), {}, {}, {}, {}, {}, false});
  }
  for (auto& record : metadata->map_metadata) {
    if (record.map_locator.storage_key().origin() != agent) continue;
    size_t index = capture.maps.size();
    for (size_t i = 0; i < capture.maps.size(); ++i) {
      const auto& locator = capture.maps[i].locator;
      if (locator.storage_key() == record.map_locator.storage_key() &&
          (local || locator.map_id() == record.map_locator.map_id())) {
        if (index != capture.maps.size()) return base::unexpected(DbStatus::IOError("Ambiguous native map topology"));
        index = i;
      }
    }
    if (index == capture.maps.size() || !capture.maps[index].source_persisted)
      return base::unexpected(DbStatus::IOError("Native map inventory changed"));
    auto& map = current[index];
    if (!map.source_persisted) {
      map.locator = std::move(record.map_locator);
      map.last_accessed = record.last_accessed; map.last_modified = record.last_modified;
      map.total_size = record.total_size; map.source_persisted = true;
    } else {
      if (local) return base::unexpected(DbStatus::IOError("Repeated native Local metadata"));
      for (const auto& session : record.map_locator.session_ids()) {
        if (std::ranges::contains(map.locator.session_ids(), session))
          return base::unexpected(DbStatus::IOError("Repeated native Session metadata"));
        map.locator.AddSession(session);
      }
    }
  }
  AsyncDomStorageDatabase::AuxUiSnapshot result;
  result.matches_source = true; result.matches_target = true;
  size_t export_bytes = 0;
  for (size_t i = 0; i < capture.maps.size(); ++i) {
    const auto& original = capture.maps[i]; auto& observed = current[i];
    if (observed.source_persisted != original.source_persisted)
      return base::unexpected(DbStatus::IOError("Native persisted topology changed"));
    std::vector<std::string> before = original.locator.session_ids();
    std::vector<std::string> after = observed.locator.session_ids();
    std::sort(before.begin(), before.end()); std::sort(after.begin(), after.end());
    if (before != after) return base::unexpected(DbStatus::IOError("Native namespace topology changed"));
    auto entries = database->ReadMapKeyValues(observed.locator.Clone());
    if (!entries.has_value()) return base::unexpected(entries.error());
    observed.source = std::move(*entries);
    const std::string current_digest = AuxFullMapDigest(observed, false, local);
    const std::string source_digest = AuxFullMapDigest(original, false, local);
    const std::string target_digest = AuxFullMapDigest(original, true, local);
    result.matches_source &= current_digest == source_digest;
    result.matches_target &= current_digest == target_digest;
    AsyncDomStorageDatabase::AuxUiMapSnapshot output;
    output.storage_key = original.locator.storage_key();
    output.session_ids = original.locator.session_ids();
    std::sort(output.session_ids.begin(), output.session_ids.end());
    output.source = AuxSelectedEntries(original.source, local);
    output.target = AuxSelectedEntries(original.target, local);
    output.map_ordinal = i; output.map_id = original.locator.map_id();
    output.source_persisted = original.source_persisted;
    output.source_map_sha256 = source_digest; output.target_map_sha256 = target_digest;
    for (const auto& selected : {output.source, output.target})
      for (const auto& [key, value] : selected) export_bytes += key.size() + value.size();
    if (export_bytes > 16 * 1024 * 1024)
      return base::unexpected(DbStatus::NotSupported("Native selected wire bound exceeded"));
    result.maps.push_back(std::move(output));
  }
  result.source_topology_sha256 = AuxTopologyDigest(capture, false, local);
  result.target_topology_sha256 = AuxTopologyDigest(capture, true, local);
  result.file_data_synced = capture.file_data_synced;
  result.target_attempted = capture.target_attempted;
  return result;
}
