"""Create and recover indexed Local LevelDB maps under real native custody."""
import difflib,hashlib,json
from pathlib import Path
HERE=Path(__file__).resolve().parent;PARENT=HERE.parent
BASE=PARENT/'native-cache-phase-readback-a22b'/'source'
sha=lambda data:hashlib.sha256(data).hexdigest()
changes={
 'components/services/storage/dom_storage/async_dom_storage_database.h':[(
  '    std::optional<base::ByteSize> source_total_size;\n  };',
  '''    std::optional<base::ByteSize> source_total_size;
    bool target_metadata_is_explicit = false;
    std::optional<base::Time> target_last_accessed;
    std::optional<base::Time> target_last_modified;
    std::optional<base::ByteSize> target_total_size;
  };''')],
 'components/services/storage/dom_storage/async_dom_storage_database.cc':[(
  '  std::optional<int64_t> allocated_map_id;\n};',
  '''  std::optional<int64_t> allocated_map_id;
  bool target_metadata_is_explicit = false;
  std::optional<base::Time> target_last_accessed;
  std::optional<base::Time> target_last_modified;
  std::optional<base::ByteSize> target_total_size;
};'''),(
  '''  for (const auto& time : {map.last_accessed, map.last_modified}) {
    AuxDigestNumber(bytes, time.has_value());
    if (time) AuxDigestNumber(bytes, static_cast<uint64_t>(time->ToDeltaSinceWindowsEpoch().InMicroseconds()));
  }
  AuxDigestNumber(bytes, local && map.total_size.has_value());
  if (local && map.total_size) {
    size_t count = 0;
    for (const auto& [key, value] : entries) count += key.size() + value.size();
    AuxDigestNumber(bytes, target && map.target != map.source ? count : map.total_size->InBytes());
  }''',
  '''  const bool explicit_target = target && map.target_metadata_is_explicit;
  for (const auto& time : {explicit_target ? map.target_last_accessed : map.last_accessed,
                          explicit_target ? map.target_last_modified : map.last_modified}) {
    AuxDigestNumber(bytes, time.has_value());
    if (time) AuxDigestNumber(bytes, static_cast<uint64_t>(time->ToDeltaSinceWindowsEpoch().InMicroseconds()));
  }
  const auto& size = explicit_target ? map.target_total_size : map.total_size;
  AuxDigestNumber(bytes, local && size.has_value());
  if (local && size) {
    size_t count = 0;
    for (const auto& [key, value] : entries) count += key.size() + value.size();
    AuxDigestNumber(bytes, target && !explicit_target && map.target != map.source ? count : size->InBytes());
  }'''),(
  '''    output.source_total_size = original.total_size;
    for (const auto& selected''',
  '''    output.source_total_size = original.total_size;
    output.target_metadata_is_explicit = original.target_metadata_is_explicit;
    output.target_last_accessed = original.target_last_accessed;
    output.target_last_modified = original.target_last_modified;
    output.target_total_size = original.target_total_size;
    for (const auto& selected'''),(
  '''    if (map.source_total_size) AuxDigestNumber(bytes, map.source_total_size->InBytes());
    for (const auto* selected''',
  '''    if (map.source_total_size) AuxDigestNumber(bytes, map.source_total_size->InBytes());
    AuxDigestNumber(bytes, map.target_metadata_is_explicit);
    for (const auto& time : {map.target_last_accessed, map.target_last_modified}) {
      AuxDigestNumber(bytes, time.has_value());
      if (time) AuxDigestNumber(bytes, static_cast<uint64_t>(time->ToDeltaSinceWindowsEpoch().InMicroseconds()));
    }
    AuxDigestNumber(bytes, map.target_total_size.has_value());
    if (map.target_total_size) AuxDigestNumber(bytes, map.target_total_size->InBytes());
    for (const auto* selected'''),(
  '''        row.source_persisted, row.allocation_requested, row.allocated_map_id};''',
  '''        row.source_persisted, row.allocation_requested, row.allocated_map_id,
        row.target_metadata_is_explicit, row.target_last_accessed, row.target_last_modified, row.target_total_size};'''),(
  '''    if (map.allocation_requested) {
      if (!local || !sqlite''',
  '''    if (map.target_metadata_is_explicit) {
      size_t count = 0;
      for (const auto& [key, value] : map.target) count += key.size() + value.size();
      if (!local || sqlite || map.source_persisted || map.locator.map_id() ||
          map.allocation_requested || !map.source.empty() || map.target.empty() ||
          map.last_accessed || map.last_modified || map.total_size ||
          !map.target_last_accessed || !map.target_last_modified || !map.target_total_size ||
          map.target_last_accessed != map.target_last_modified || map.target_total_size->InBytes() != count)
        return base::unexpected(DbStatus::IOError("Exact original native LevelDB creation metadata required"));
    } else if (map.target_last_accessed || map.target_last_modified || map.target_total_size) {
      return base::unexpected(DbStatus::IOError("Target metadata must have explicit native provenance"));
    }
    if (map.allocation_requested) {
      if (!local || !sqlite'''),(
  '''                  (local ? (!sqlite || map.locator.map_id() || !map.locator.session_ids().empty() || !map.source.empty()) :''',
  '''                  (local ? (map.locator.map_id() || !map.locator.session_ids().empty() || !map.source.empty()) :'''),(
  '''                return base::unexpected(DbStatus::NotSupported("Actual SQLite absent Local or allocator-owned single-namespace Session map required"));''',
  '''                return base::unexpected(DbStatus::NotSupported("Actual absent native Local or allocator-owned single-namespace Session map required"));'''),(
  '''              map.allocation_requested = local && !map.source_persisted && map.target != map.source;''',
  '''              map.allocation_requested = local && sqlite && !map.source_persisted && map.target != map.source;
              const bool leveldb_creation = local && !sqlite && !map.source_persisted && map.target != map.source;
              if (leveldb_creation) {
                // LevelDB's storage-key identity is already real. Its data
                // and metadata must enter the same actual batch; no future
                // SQLite row ID or caller backend selector is introduced.
                if (!map.target_metadata_is_explicit) {
                  const auto now = base::Time::Now();
                  map.target_last_accessed = now; map.target_last_modified = now;
                }
                map.target_metadata_is_explicit = true;
                size_t count = 0;
                for (const auto& [key, value] : map.target) count += key.size() + value.size();
                map.target_total_size = base::ByteSize(count);
              } else {
                map.target_metadata_is_explicit = false;
                map.target_last_accessed.reset(); map.target_last_modified.reset(); map.target_total_size.reset();
              }'''),(
  '''                  if (!map.allocation_requested || !map.source.empty())
                    return base::unexpected(DbStatus::NotSupported("Original Local absence action missing"));
                  // No observed allocation means the failed original write
                  // left verified source absence. Never retry its allocator.
                  if (!map.allocated_map_id) continue;
                  std::vector<DomStorageDatabase::MapLocator> maps_to_delete;
                  maps_to_delete.emplace_back(map.locator.storage_key(), *map.allocated_map_id);''',
  '''                  if (!map.source.empty() ||
                      (sqlite ? !map.allocation_requested : !map.target_metadata_is_explicit))
                    return base::unexpected(DbStatus::NotSupported("Original Local absence action missing"));
                  // Missing observed SQLite allocation means known source
                  // absence. LevelDB has no generated ID: its actual key
                  // owns both the exact metadata and raw prefix batch.
                  if (sqlite && !map.allocated_map_id) continue;
                  std::vector<DomStorageDatabase::MapLocator> maps_to_delete;
                  if (sqlite) maps_to_delete.emplace_back(map.locator.storage_key(), *map.allocated_map_id);
                  else maps_to_delete.emplace_back(map.locator.storage_key());'''),(
  '''                if (map.last_accessed) update.map_usage->SetLastAccessed(*map.last_accessed);
                if (map.last_modified && map.total_size) {''',
  '''                if (operation == 3 && map.target_metadata_is_explicit) {
                  update.map_usage->SetLastAccessed(*map.target_last_accessed);
                  update.map_usage->SetLastModifiedAndTotalSize(*map.target_last_modified, *map.target_total_size);
                } else {
                if (map.last_accessed) update.map_usage->SetLastAccessed(*map.last_accessed);
                if (map.last_modified && map.total_size) {'''),(
  '''                      operation == 3 ? base::ByteSize(count) : *map.total_size);
                }
              }
              updates.push_back''',
  '''                      operation == 3 ? base::ByteSize(count) : *map.total_size);
                }
                }
              }
              updates.push_back''')],
}
rows=[];patch=[]
for path,edits in changes.items():
 data=(BASE/path).read_bytes();text=data.decode();anchors=[]
 for before,after in edits:
  assert text.count(before)==1,(path,before[:90],text.count(before))
  text=text.replace(before,after);anchors.append({'find':before,'replace':after,'count':1})
 out=HERE/'source'/path;out.parent.mkdir(parents=True,exist_ok=True);out.write_text(text)
 rows.append({'path':path,'inputRoot':str(BASE),'inputSha256':sha(data),'outputSha256':sha(text.encode()),'output':str(out),'anchors':anchors})
 patch.extend(difflib.unified_diff(data.decode().splitlines(True),text.splitlines(True),fromfile='a/'+path,tofile='b/'+path))
facts=[]
ROOT=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
rel='components/services/storage/dom_storage/leveldb/local_storage_leveldb.cc'
data=(ROOT/rel).read_bytes();value=data.decode()
for name,needles in {'LevelDB atomic data/metadata and exact absence':[
 'DomStorageDatabase::Key GetMapPrefix(const blink::StorageKey& storage_key)',
 'leveldb_batch->UpdateMapKeyValues(map_prefix, map_update)',
 'PutMapUsageMetadata(*leveldb_batch, map_locator.storage_key(),',
 'DB_RETURN_IF_ERROR(batch->DeletePrefixed(GetMapPrefix(map.storage_key())));',
 'return batch->Commit();']}.items():
 checks=[{'find':s,'count':value.count(s)} for s in needles];assert all(a['count'] for a in checks)
 facts.append({'path':rel,'sha256':sha(data),'name':name,'anchors':checks})
(HERE/'source-plan.json').write_text(json.dumps({'format':'aux.native-leveldb-absence.source.v1','files':rows,'nativeRoot':str(ROOT),'physicalFacts':facts,'nativeCheckoutChanged':False,'nativeCompiled':False,'productExecuted':False,'runtimeAcceptance':False},indent=2)+'\n')
(HERE/'native.patch').write_text(''.join(patch))
print(json.dumps({'files':len(rows),'countedAnchors':sum(len(r['anchors']) for r in rows)}))
