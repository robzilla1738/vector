std::string AuxRecoveryDescriptorDigest(const AsyncDomStorageDatabase::AuxUiSnapshot& recorded) {
  std::string bytes("aux.ui-dom-recovery-descriptor.v1"); bytes.push_back('\0');
  AuxDigestBytes(bytes, recorded.source_topology_sha256);
  AuxDigestBytes(bytes, recorded.target_topology_sha256);
  AuxDigestBytes(bytes, recorded.allocation_action_sha256);
  AuxDigestNumber(bytes, recorded.target_attempted);
  AuxDigestNumber(bytes, recorded.maps.size());
  for (const auto& map : recorded.maps) {
    AuxDigestNumber(bytes, map.map_ordinal);
    AuxDigestBytes(bytes, map.storage_key.Serialize());
    AuxDigestNumber(bytes, map.map_id.has_value());
    if (map.map_id) AuxDigestNumber(bytes, static_cast<uint64_t>(*map.map_id));
    AuxDigestNumber(bytes, map.session_ids.size());
    for (const auto& session : map.session_ids) AuxDigestBytes(bytes, session);
    AuxDigestNumber(bytes, map.source_persisted);
    AuxDigestBytes(bytes, map.source_map_sha256); AuxDigestBytes(bytes, map.target_map_sha256);
    AuxDigestNumber(bytes, map.allocation_requested);
    AuxDigestBytes(bytes, map.allocation_action_sha256);
    AuxDigestNumber(bytes, map.allocation_observed);
    AuxDigestNumber(bytes, map.allocated_map_id.has_value());
    if (map.allocated_map_id) AuxDigestNumber(bytes, static_cast<uint64_t>(*map.allocated_map_id));
    for (const auto& time : {map.source_last_accessed, map.source_last_modified}) {
      AuxDigestNumber(bytes, time.has_value());
      if (time) AuxDigestNumber(bytes, static_cast<uint64_t>(time->ToDeltaSinceWindowsEpoch().InMicroseconds()));
    }
    AuxDigestNumber(bytes, map.source_total_size.has_value());
    if (map.source_total_size) AuxDigestNumber(bytes, map.source_total_size->InBytes());
    for (const auto* selected : {&map.source, &map.target}) {
      AuxDigestNumber(bytes, selected->size());
      for (const auto& [key, value] : *selected) { AuxDigestRaw(bytes, key); AuxDigestRaw(bytes, value); }
    }
  }
  return base::HexEncodeLower(crypto::hash::Sha256(bytes));
}
StatusOr<AsyncDomStorageDatabase::AuxUiSnapshot> AuxRequalifyRecordedCapture(
    AuxDomCapture& fresh, AuxDomCapture& recovery,
    const AsyncDomStorageDatabase::AuxUiSnapshot& recorded, bool local, bool sqlite,
    DomStorageDatabase* database) {
  if (!fresh.captured || fresh.target_attempted || recorded.maps.size() != fresh.maps.size() ||
      recorded.maps.size() > 256 || recorded.source_topology_sha256.size() != 64)
    return base::unexpected(DbStatus::IOError("Fresh held inventory and exact original descriptor required"));
  DbStatus synced = database->SyncForAuxMigration();
  if (!synced.ok()) return base::unexpected(synced);
  fresh.file_data_synced = true;
  auto current = AuxReadDomCapture(fresh, local, database);
  if (!current.has_value()) return base::unexpected(current.error());
  if (!current->matches_source || !current->file_data_synced)
    return base::unexpected(DbStatus::IOError("Fresh actual source changed before recovery observation"));
  AuxDomCapture proposed;
  proposed.unrelated_metadata_sha256 = fresh.unrelated_metadata_sha256;
  std::set<size_t> matched;
  size_t wire_bytes = 0;
  for (size_t ordinal = 0; ordinal < recorded.maps.size(); ++ordinal) {
    const auto& row = recorded.maps[ordinal];
    if (!local && (row.source_last_accessed || row.source_last_modified || row.source_total_size))
      return base::unexpected(DbStatus::NotSupported("Session recovery cannot invent Local usage metadata"));
    if (row.map_ordinal != ordinal || row.source_map_sha256.size() != 64 ||
        row.source != AuxSelectedEntries(row.source, local) ||
        row.target != AuxSelectedEntries(row.target, local))
      return base::unexpected(DbStatus::NotSupported("Finite exact native recovery ordinal/selected descriptor required"));
    std::vector<std::string> namespaces = row.session_ids;
    std::sort(namespaces.begin(), namespaces.end());
    if (std::adjacent_find(namespaces.begin(), namespaces.end()) != namespaces.end() ||
        (local ? !namespaces.empty() : namespaces.empty()))
      return base::unexpected(DbStatus::IOError("Native recovery namespace topology is ambiguous"));
    size_t index = fresh.maps.size();
    for (size_t i = 0; i < fresh.maps.size(); ++i) {
      const auto& actual = fresh.maps[i];
      if (actual.locator.storage_key() != row.storage_key) continue;
      auto actual_namespaces = actual.locator.session_ids();
      std::sort(actual_namespaces.begin(), actual_namespaces.end());
      if (actual_namespaces != namespaces || (!local && actual.locator.map_id() != row.map_id)) continue;
      if (index != fresh.maps.size())
        return base::unexpected(DbStatus::IOError("More than one actual native recovery map matches"));
      index = i;
    }
    if (index == fresh.maps.size() || !matched.insert(index).second)
      return base::unexpected(DbStatus::IOError("Recorded map has no unique freshly held native owner"));
    const auto& actual = fresh.maps[index];
    if (!row.allocation_requested && actual.locator.map_id() != row.map_id)
      return base::unexpected(DbStatus::IOError("Original native map identity changed"));
    DomStorageDatabase::MapLocator locator = row.map_id ?
        DomStorageDatabase::MapLocator(row.storage_key, *row.map_id) :
        DomStorageDatabase::MapLocator(row.storage_key);
    for (const auto& session : row.session_ids) locator.AddSession(session);
    AuxDomMap map{std::move(locator), actual.source, actual.source,
        row.source_last_accessed, row.source_last_modified, row.source_total_size,
        row.source_persisted, row.allocation_requested, row.allocated_map_id};
    for (const auto& [key, value] : AuxSelectedEntries(actual.source, local)) {
      map.source.erase(key); map.target.erase(key);
    }
    for (const auto& [key, value] : row.source) { map.source.emplace(key, value); wire_bytes += key.size() + value.size(); }
    for (const auto& [key, value] : row.target) { map.target.emplace(key, value); wire_bytes += key.size() + value.size(); }
    if (wire_bytes > 16 * 1024 * 1024)
      return base::unexpected(DbStatus::NotSupported("Finite native recovery descriptor bound exceeded"));
    for (const auto* entries : {&map.source, &map.target}) {
      DbStatus valid = AuxValidateEntries(*entries, local);
      if (!valid.ok()) return base::unexpected(valid);
    }
    auto canonical = AuxBuildTarget(map.target, local);
    if (!canonical.has_value() || canonical.value() != map.target)
      return base::unexpected(DbStatus::NotSupported("Recovery target is not the exact current native codec"));
    if (map.allocation_requested) {
      if (!local || !sqlite || !recorded.target_attempted || map.source_persisted ||
          map.locator.map_id() || !map.source.empty() || map.last_accessed || map.last_modified || map.total_size ||
          row.allocation_observed != row.allocated_map_id.has_value() ||
          row.allocation_action_sha256 != AuxAllocationActionDigest(map, ordinal))
        return base::unexpected(DbStatus::IOError("Original allocation action facts are incomplete"));
      if (actual.source_persisted) {
        if (!actual.locator.map_id() || (map.allocated_map_id && map.allocated_map_id != actual.locator.map_id()))
          return base::unexpected(DbStatus::IOError("Actual allocator result changed or is missing"));
        map.allocated_map_id = actual.locator.map_id();
      }
    } else if (row.allocated_map_id || row.allocation_observed || !row.allocation_action_sha256.empty()) {
      return base::unexpected(DbStatus::IOError("Unexpected allocation metadata on existing map"));
    }
    const auto source = AuxFullMapDigest(map, false, local);
    const auto target = AuxFullMapDigest(map, true, local);
    if (source != row.source_map_sha256 ||
        (!row.target_map_sha256.empty() && target != row.target_map_sha256) ||
        (row.target_map_sha256.empty() && !map.allocation_requested))
      return base::unexpected(DbStatus::IOError("Recorded complete original/target map digest differs"));
    const auto observed = AuxFullMapDigest(actual, false, local);
    if (observed != source && observed != target)
      return base::unexpected(DbStatus::IOError("Fresh physical map differs from every recorded alternative"));
    proposed.maps.push_back(std::move(map));
  }
  proposed.captured = true;
  // Observation cannot authorize a new target attempt. Any recovery write
  // requires a separate explicit original-owned recovery transaction.
  proposed.target_attempted = recorded.target_attempted;
  proposed.file_data_synced = true;
  if (AuxTopologyDigest(proposed, false, local) != recorded.source_topology_sha256 ||
      (!recorded.target_topology_sha256.empty() &&
       AuxTopologyDigest(proposed, true, local) != recorded.target_topology_sha256) ||
      AuxAllocationActionsDigest(proposed) != recorded.allocation_action_sha256)
    return base::unexpected(DbStatus::IOError("Complete original topology/allocation action differs"));
  auto observed = AuxReadDomCapture(proposed, local, database);
  if (!observed.has_value()) return base::unexpected(observed.error());
  // These are read-only physical observations, never cache/source closure or
  // authority to overwrite the fresh capture. Its current view stays intact.
  observed->source_ready = false;
  observed->private_target_staged = false;
  observed->cache_published = false;
  recovery = std::move(proposed);
  return observed;
}
