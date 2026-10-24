"""Real SQLite allocation observation, never a predicted physical target ID."""
import difflib
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
PARENT = HERE.parent
sha = lambda data: hashlib.sha256(data).hexdigest()
rows = []; patches = []
def emit(path, base, edits):
    root = PARENT / base / 'source'
    original = (root / path).read_bytes(); text = original.decode(); anchors = []
    for before, after in edits:
        assert text.count(before) == 1, (path, before[:90], text.count(before))
        text = text.replace(before, after)
        anchors.append({'find': before, 'replace': after, 'count': 1})
    out = HERE / 'source' / path; out.parent.mkdir(parents=True, exist_ok=True); out.write_text(text)
    rows.append({'path': path, 'inputSha256': sha(original), 'outputSha256': sha(text.encode()),
                 'inputRoot': str(root), 'output': str(out), 'anchors': anchors})
    patches.extend(difflib.unified_diff(original.decode().splitlines(True), text.splitlines(True),
                                     fromfile='a/' + path, tofile='b/' + path))

emit('components/services/storage/dom_storage/async_dom_storage_database.h',
 'native-cache-cohort-integration-a9', [(
  '    std::vector<AuxUiCacheView> cache_views;\n  };',
  '''    std::vector<AuxUiCacheView> cache_views;
    bool allocation_requested = false;
    std::string allocation_action_sha256;
    std::optional<int64_t> allocated_map_id;
    bool allocation_observed = false;
  };'''), (
  '    std::string target_topology_sha256;\n  };',
  '''    std::string target_topology_sha256;
    // Allocation action is not a physical topology digest. Until the real
    // allocator result is observed, physical target digests remain empty.
    std::string allocation_action_sha256;
  };''')])

emit('components/services/storage/dom_storage/async_dom_storage_database.cc',
 'native-session-map-absence-recovery-a11', [(
  '  bool source_persisted = true;\n};',
  '''  bool source_persisted = true;
  bool allocation_requested = false;
  std::optional<int64_t> allocated_map_id;
};'''), (
  '  bool captured = false;\n  bool target_attempted = false;',
  '''  std::string unrelated_metadata_sha256;
  bool captured = false;
  bool target_attempted = false;'''), (
  '''  AuxDigestLocator(bytes, map.locator);
  const auto& entries = target ? map.target : map.source;''',
  '''  if (target && map.allocation_requested && !map.allocated_map_id) return {};
  if (target && map.allocation_requested) {
    DomStorageDatabase::MapLocator actual(map.locator.storage_key(), *map.allocated_map_id);
    AuxDigestLocator(bytes, actual);
  } else {
    AuxDigestLocator(bytes, map.locator);
  }
  const auto& entries = target ? map.target : map.source;'''), (
  '''  for (const auto& map : capture.maps) {
    AuxDigestLocator(bytes, map.locator);
    AuxDigestNumber(bytes, map.source_persisted || !(target ? map.target : map.source).empty());
    AuxDigestBytes(bytes, AuxFullMapDigest(map, target, local));
  }''',
  '''  for (const auto& map : capture.maps) {
    if (target && map.allocation_requested && !map.allocated_map_id) return {};
    if (target && map.allocation_requested) {
      DomStorageDatabase::MapLocator actual(map.locator.storage_key(), *map.allocated_map_id);
      AuxDigestLocator(bytes, actual);
    } else {
      AuxDigestLocator(bytes, map.locator);
    }
    AuxDigestNumber(bytes, map.source_persisted || !(target ? map.target : map.source).empty());
    AuxDigestBytes(bytes, AuxFullMapDigest(map, target, local));
  }'''), (
  'StatusOr<AsyncDomStorageDatabase::AuxUiSnapshot> AuxReadDomCapture(',
  '''std::string AuxUnrelatedMetadataDigest(const DomStorageDatabase::Metadata& metadata,
                                       const url::Origin& agent) {
  std::vector<std::string> records;
  for (const auto& record : metadata.map_metadata) {
    if (record.map_locator.storage_key().origin() == agent) continue;
    std::string bytes;
    AuxDigestLocator(bytes, record.map_locator);
    for (const auto& time : {record.last_accessed, record.last_modified}) {
      AuxDigestNumber(bytes, time.has_value());
      if (time) AuxDigestNumber(bytes, static_cast<uint64_t>(time->ToDeltaSinceWindowsEpoch().InMicroseconds()));
    }
    AuxDigestNumber(bytes, record.total_size.has_value());
    if (record.total_size) AuxDigestNumber(bytes, record.total_size->InBytes());
    records.push_back(std::move(bytes));
  }
  std::sort(records.begin(), records.end());
  std::string bytes("aux.ui-dom-unrelated-metadata.v1"); bytes.push_back('\\0');
  AuxDigestNumber(bytes, records.size());
  for (const auto& record : records) AuxDigestBytes(bytes, record);
  return base::HexEncodeLower(crypto::hash::Sha256(bytes));
}
std::string AuxAllocationActionDigest(const AuxDomMap& map, size_t ordinal) {
  if (!map.allocation_requested) return {};
  std::string bytes("aux.ui-dom-local-allocation-action.v1"); bytes.push_back('\\0');
  AuxDigestNumber(bytes, ordinal);
  AuxDigestLocator(bytes, map.locator);
  AuxDigestNumber(bytes, map.source_persisted);
  AuxDigestBytes(bytes, AuxFullMapDigest(map, false, true));
  AuxDigestNumber(bytes, map.target.size());
  for (const auto& [key, value] : map.target) { AuxDigestRaw(bytes, key); AuxDigestRaw(bytes, value); }
  return base::HexEncodeLower(crypto::hash::Sha256(bytes));
}
std::string AuxAllocationActionsDigest(const AuxDomCapture& capture) {
  std::string bytes("aux.ui-dom-local-allocation-actions.v1"); bytes.push_back('\\0');
  AuxDigestBytes(bytes, AuxTopologyDigest(capture, false, true));
  size_t count = 0;
  for (size_t i = 0; i < capture.maps.size(); ++i) {
    auto action = AuxAllocationActionDigest(capture.maps[i], i);
    if (!action.empty()) { ++count; AuxDigestBytes(bytes, action); }
  }
  if (!count) return {};
  AuxDigestNumber(bytes, count);
  return base::HexEncodeLower(crypto::hash::Sha256(bytes));
}
StatusOr<AsyncDomStorageDatabase::AuxUiSnapshot> AuxReadDomCapture('''), (
  '''  const url::Origin agent = url::Origin::Create(GURL("chrome-extension://gokkffaiccpmoeodpmeamcjajcagjmkm/"));
  std::vector<AuxDomMap> current;''',
  '''  const url::Origin agent = url::Origin::Create(GURL("chrome-extension://gokkffaiccpmoeodpmeamcjajcagjmkm/"));
  if (AuxUnrelatedMetadataDigest(*metadata, agent) != capture.unrelated_metadata_sha256)
    return base::unexpected(DbStatus::IOError("Unrelated native metadata changed"));
  std::vector<AuxDomMap> current;'''), (
  '    const auto& original = capture.maps[i]; auto& observed = current[i];',
  '    auto& original = capture.maps[i]; auto& observed = current[i];'), (
  '''    observed.source = std::move(*entries);
    const std::string current_digest''',
  '''    observed.source = std::move(*entries);
    if (original.allocation_requested && observed.source_persisted) {
      if (!local || !capture.target_attempted || !observed.locator.map_id() ||
          original.source_persisted || !original.source.empty() ||
          observed.last_accessed != original.last_accessed ||
          observed.last_modified != original.last_modified || observed.total_size != original.total_size ||
          observed.source != original.target ||
          (original.allocated_map_id && original.allocated_map_id != observed.locator.map_id()))
        return base::unexpected(DbStatus::IOError("Actual allocated target identity/readback differs from original action"));
      // The real SQLite allocator has now supplied its ID through the unique
      // metadata row, joined to the exact raw target and unchanged other maps.
      // This is a past physical observation, never a predicted target ID.
      original.allocated_map_id = observed.locator.map_id();
    }
    const std::string current_digest'''), (
  '''    output.source_map_sha256 = source_digest; output.target_map_sha256 = target_digest;
    for (const auto& selected''',
  '''    output.source_map_sha256 = source_digest; output.target_map_sha256 = target_digest;
    output.allocation_requested = original.allocation_requested;
    output.allocation_action_sha256 = AuxAllocationActionDigest(original, i);
    output.allocated_map_id = original.allocated_map_id;
    output.allocation_observed = original.allocated_map_id.has_value();
    for (const auto& selected'''), (
  '''  result.target_topology_sha256 = AuxTopologyDigest(capture, true, local);
  result.file_data_synced''',
  '''  result.target_topology_sha256 = AuxTopologyDigest(capture, true, local);
  result.allocation_action_sha256 = AuxAllocationActionsDigest(capture);
  result.file_data_synced'''), (
  '         std::shared_ptr<AuxMigrationWriteStatus> writes, bool local, int operation,',
  '         std::shared_ptr<AuxMigrationWriteStatus> writes, bool local, bool sqlite, int operation,'), (
  '''            if (!metadata.has_value()) return base::unexpected(metadata.error());
            for (auto& record : metadata->map_metadata)''',
  '''            if (!metadata.has_value()) return base::unexpected(metadata.error());
            capture->unrelated_metadata_sha256 = AuxUnrelatedMetadataDigest(*metadata, agent);
            for (auto& record : metadata->map_metadata)'''), (
  '''              if (!map.source_persisted && candidate != map.source &&
                  (local || !map.locator.map_id() || map.locator.session_ids().size() != 1))
                return base::unexpected(DbStatus::NotSupported("Actual single-namespace Session allocator identity required for new map"));''',
  '''              if (!map.source_persisted && candidate != map.source &&
                  (local ? (!sqlite || map.locator.map_id() || !map.locator.session_ids().empty() || !map.source.empty()) :
                   (!map.locator.map_id() || map.locator.session_ids().size() != 1)))
                return base::unexpected(DbStatus::NotSupported("Actual SQLite absent Local or allocator-owned single-namespace Session map required"));'''), (
  '''            for (size_t i = 0; i < capture->maps.size(); ++i) capture->maps[i].target = std::move(proposed[i]);''',
  '''            for (size_t i = 0; i < capture->maps.size(); ++i) {
              auto& map = capture->maps[i];
              map.target = std::move(proposed[i]);
              map.allocation_requested = local && !map.source_persisted && map.target != map.source;
            }'''), (
  '''              if (operation == 4 && !map.source_persisted) {
                if (local || !map.source.empty() || !map.locator.map_id() ||
                    map.locator.session_ids().size() != 1)''',
  '''              if (operation == 4 && !map.source_persisted) {
                if (local) {
                  if (!map.allocation_requested || !map.source.empty())
                    return base::unexpected(DbStatus::NotSupported("Original Local absence action missing"));
                  // No observed allocation means the failed original write
                  // left verified source absence. Never retry its allocator.
                  if (!map.allocated_map_id) continue;
                  std::vector<DomStorageDatabase::MapLocator> maps_to_delete;
                  maps_to_delete.emplace_back(map.locator.storage_key(), *map.allocated_map_id);
                  DbStatus removed = database->DeleteStorageKeysFromSession(
                      {}, {map.locator.storage_key()}, std::move(maps_to_delete));
                  if (!removed.ok()) return base::unexpected(removed);
                  continue;
                }
                if (!map.source.empty() || !map.locator.map_id() ||
                    map.locator.session_ids().size() != 1)'''), (
  '''      }, state->backend, aux_migration_write_status_, local, operation, std::move(targets), std::move(guarded)));''',
  '''      }, state->backend, aux_migration_write_status_, local, is_sqlite_, operation, std::move(targets), std::move(guarded)));''')])

(HERE / 'source-plan.json').write_text(json.dumps({'format': 'aux.local-allocation-action.source.v1',
    'files': rows, 'nativeCheckoutChanged': False, 'nativeCompiled': False,
    'productExecuted': False, 'restartRecoveryImplemented': False, 'runtimeAcceptance': False}, indent=2) + '\n')
(HERE / 'native.patch').write_text(''.join(patches))
print(json.dumps({'files': len(rows), 'countedAnchors': sum(len(r['anchors']) for r in rows)}))
