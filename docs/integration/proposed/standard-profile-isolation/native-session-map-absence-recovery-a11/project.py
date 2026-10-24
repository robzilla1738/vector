"""Exact Session allocator-owned absence recovery over reviewed A9 bytes."""
import difflib,hashlib,json
from pathlib import Path
HERE=Path(__file__).resolve().parent
BASE=HERE.parent/'native-cache-cohort-integration-a9'/'source'
NATIVE=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
sha=lambda data:hashlib.sha256(data).hexdigest()
path='components/services/storage/dom_storage/async_dom_storage_database.cc'
original=(BASE/path).read_bytes();text=original.decode();anchors=[]
for before,after in [
 ('  AuxDigestNumber(bytes, map.source_persisted || !entries.empty());','  AuxDigestNumber(bytes, target ? map.source_persisted || !entries.empty() : map.source_persisted);'),
 ('''    if (index == capture.maps.size() || !capture.maps[index].source_persisted)
      return base::unexpected(DbStatus::IOError("Native map inventory changed"));''','''    if (index == capture.maps.size())
      return base::unexpected(DbStatus::IOError("Native map inventory changed"));'''),
 ('''    if (observed.source_persisted != original.source_persisted)
      return base::unexpected(DbStatus::IOError("Native persisted topology changed"));''','''    const bool target_present = original.source_persisted || !original.target.empty();
    if (observed.source_persisted != original.source_persisted &&
        observed.source_persisted != target_present)
      return base::unexpected(DbStatus::IOError("Native persisted topology changed"));'''),
 ('''    result.matches_source &= current_digest == source_digest;
    result.matches_target &= current_digest == target_digest;''','''    if (current_digest != source_digest && current_digest != target_digest)
      return base::unexpected(DbStatus::IOError("Native map differs from every retained alternative"));
    result.matches_source &= current_digest == source_digest;
    result.matches_target &= current_digest == target_digest;'''),
 ('''              if (!map.source_persisted && candidate != map.source)
                return base::unexpected(DbStatus::NotSupported("New persisted map creation/absence rollback is not implemented"));''','''              if (!map.source_persisted && candidate != map.source &&
                  (local || !map.locator.map_id() || map.locator.session_ids().size() != 1))
                return base::unexpected(DbStatus::NotSupported("Actual single-namespace Session allocator identity required for new map"));'''),
 ('''            if ((operation == 3 && (capture->target_attempted || !before->matches_source)) ||
                (operation == 4 && !before->matches_source && !before->matches_target))
              return base::unexpected(DbStatus::IOError("Exact retained source/target CAS required"));''','''            // AuxReadDomCapture has checked every complete map/topology
            // against one exact retained alternative. A failed multi-map
            // absence restore may leave a known mixture; recovery may finish
            // those same originals, never overwrite an unknown map.
            if (operation == 3 && (capture->target_attempted || !before->matches_source))
              return base::unexpected(DbStatus::IOError("Exact retained source CAS required"));'''),
 ('''              if (map.source == map.target) continue;
              const auto& desired = operation == 3 ? map.target : map.source;''','''              if (map.source == map.target) continue;
              if (operation == 4 && !map.source_persisted) {
                if (local || !map.source.empty() || !map.locator.map_id() ||
                    map.locator.session_ids().size() != 1)
                  return base::unexpected(DbStatus::NotSupported("Original native absence cannot be restored by this owner"));
                const std::string session = map.locator.session_ids().front();
                auto unreferenced = map.locator.Clone();
                unreferenced.RemoveSession(session);
                std::vector<DomStorageDatabase::MapLocator> maps_to_delete;
                maps_to_delete.push_back(std::move(unreferenced));
                // Real Session backend operation removes this exact owned
                // namespace reference and allocator map data transactionally.
                DbStatus removed = database->DeleteStorageKeysFromSession(
                    session, {map.locator.storage_key()}, std::move(maps_to_delete));
                if (!removed.ok()) return base::unexpected(removed);
                continue;
              }
              const auto& desired = operation == 3 ? map.target : map.source;'''),
]:
 assert text.count(before)==1,(before[:100],text.count(before))
 text=text.replace(before,after);anchors.append({'find':before,'replace':after,'count':1})
target=HERE/'source'/path;target.parent.mkdir(parents=True,exist_ok=True);target.write_text(text)
facts=[]
for fact,needles in {
 'components/services/storage/dom_storage/leveldb/session_storage_leveldb.cc':[
 'DbStatus SessionStorageLevelDB::DeleteStorageKeysFromSession(', '    CHECK(map.session_ids().empty());'],
 'components/services/storage/dom_storage/sqlite/session_storage_sqlite.cc':[
 'DbStatus SessionStorageSqlite::DeleteStorageKeysFromSession(', '    CHECK(map_locator.session_ids().empty());',
 '        map_entries_table_->DeleteMap(map_locator.map_id().value()));'],
}.items():
 data=(NATIVE/fact).read_bytes();value=data.decode();pins=[]
 for needle in needles:
  count=value.count(needle);assert count>0
  pins.append({'find':needle,'count':count})
 facts.append({'path':fact,'sha256':sha(data),'anchors':pins})
files=[{'path':path,'inputSha256':sha(original),'outputSha256':sha(text.encode()),'output':str(target),'anchors':anchors}]
(HERE/'source-plan.json').write_text(json.dumps({'format':'aux.native-session-absence-recovery.source.v1','nativeRoot':str(BASE),'physicalRoot':str(NATIVE),'consumedNativeBackend':facts,'files':files,'nativeCheckoutChanged':False,'nativeCompiled':False,'productExecuted':False,'restartRecoveryImplemented':False,'localAbsentAllocationImplemented':False,'activationAuthorized':False},indent=2)+'\n')
(HERE/'native.patch').write_text(''.join(difflib.unified_diff(original.decode().splitlines(True),text.splitlines(True),fromfile='a/'+path,tofile='b/'+path)))
print(json.dumps({'files':1,'countedAnchors':len(anchors),'inputSha256':sha(original),'outputSha256':sha(text.encode())}))
