"""Converge lost publication/restoration replies from actual held view facts."""
import difflib,hashlib,json
from pathlib import Path
HERE=Path(__file__).resolve().parent;PARENT=HERE.parent
sha=lambda data:hashlib.sha256(data).hexdigest()
changes={
 'components/services/storage/dom_storage/aux_ui_cache_cohort.h':('native-cache-recovery-original-a18',[(
  '  bool held() const { return request_.has_value(); }',
  '  bool ObserveHeldPhase(const base::UnguessableToken& request, bool target) const;\n  bool held() const { return request_.has_value(); }'),(
  '  bool recovery_plan_set_ = false;',
  '  std::optional<bool> zero_endpoint_phase_published_;\n  bool recovery_plan_set_ = false;')]),
 'components/services/storage/dom_storage/aux_ui_cache_cohort.cc':('native-cache-recovery-original-a18',[(
  'StatusOr<AuxUiCacheCohort::Entries> AuxUiCacheCohort::DecodeSelected(',
  (HERE/'cohort.inc').read_text()+'StatusOr<AuxUiCacheCohort::Entries> AuxUiCacheCohort::DecodeSelected('),(
  '  if (operation_ == Operation::kRelease && outcome.ok()) {',
  '''  if (outcome.ok() && nodes_.empty()) {
    if (operation_ == Operation::kPrepare || operation_ == Operation::kRestore)
      zero_endpoint_phase_published_ = false;
    if (operation_ == Operation::kPublish) zero_endpoint_phase_published_ = true;
  }
  if (operation_ == Operation::kRelease && outcome.ok()) {
    zero_endpoint_phase_published_.reset();''')]),
 'components/services/storage/dom_storage/storage_area_impl.h':('native-cache-cohort-integration-a9',[(
  '  DbStatus AdoptAuxUiMigrationMap(const AsyncDomStorageDatabase::AuxUiMapSnapshot& map, bool target) override;',
  '''  DbStatus AdoptAuxUiMigrationMap(const AsyncDomStorageDatabase::AuxUiMapSnapshot& map, bool target) override;
  bool ObserveAuxUiMigrationCachePhase(const AsyncDomStorageDatabase::AuxUiMapSnapshot& map, bool target) const override;''')]),
 'components/services/storage/dom_storage/storage_area_impl.cc':('native-recovery-restoration-a19',[(
  'DbStatus StorageAreaImpl::AdoptAuxUiMigrationMap(',
  (HERE/'native.inc').read_text()+'DbStatus StorageAreaImpl::AdoptAuxUiMigrationMap(')]),
 'components/services/storage/dom_storage/async_dom_storage_database.h':('native-recovery-restoration-a19',[(
  '    virtual DbStatus AdoptAuxUiMigrationMap(const AuxUiMapSnapshot& map, bool target);',
  '''    virtual DbStatus AdoptAuxUiMigrationMap(const AuxUiMapSnapshot& map, bool target);
    virtual bool ObserveAuxUiMigrationCachePhase(const AuxUiMapSnapshot& map, bool target) const;''')]),
 'components/services/storage/dom_storage/async_dom_storage_database.cc':('native-recovery-allocation-proof-a20b',[(
  'void AsyncDomStorageDatabase::NotifyAuxUiMigrationRegistryChanged() {',
  '''bool AsyncDomStorageDatabase::Committer::ObserveAuxUiMigrationCachePhase(const AuxUiMapSnapshot&, bool) const {
  return false;
}
void AsyncDomStorageDatabase::NotifyAuxUiMigrationRegistryChanged() {'''),(
  '''void AsyncDomStorageDatabase::CompleteAuxUiOperation(
    std::shared_ptr<AuxUiMigrationLease::State> state, AuxUiReadCallback callback, DbStatus status) {
  state->pending = false;
  state->source_ready = status.ok() && state->backend_captured && state->private_target_staged &&''',
  '''void AsyncDomStorageDatabase::CompleteAuxUiOperation(
    std::shared_ptr<AuxUiMigrationLease::State> state, AuxUiReadCallback callback, DbStatus status) {
  state->pending = false;
  if (status.ok() && !state->tainted && state->recovery_descriptor_sha256.empty() &&
      CurrentAuxUiMigrationWriters(state) && state->snapshot.file_data_synced) {
    auto actual_phase = [&](bool target) {
      size_t observed_owners = 0;
      for (const auto& writer : state->writers) {
        const AuxUiMapSnapshot* map = nullptr;
        for (const auto& candidate : state->snapshot.maps) {
          if (!writer->MatchesAuxUiMigrationMap(candidate)) continue;
          if (map) return false;
          map = &candidate;
        }
        if (!map) {
          auto locator = writer->CopyAuxUiMigrationLocator();
          if (!locator.has_value() || locator->storage_key().origin() == url::Origin::Create(
              GURL("chrome-extension://gokkffaiccpmoeodpmeamcjajcagjmkm/"))) return false;
          continue;
        }
        ++observed_owners;
        if (!writer->ObserveAuxUiMigrationCachePhase(*map, target)) return false;
      }
      // New observation requires an actual native owner/retained cohort.
      // An empty registry is never turned into a synthetic phase receipt.
      return observed_owners != 0;
    };
    if (state->snapshot.matches_target && actual_phase(true)) state->cache_published = true;
    else if (state->snapshot.matches_source && actual_phase(false)) state->cache_published = false;
  }
  state->source_ready = status.ok() && state->backend_captured && state->private_target_staged &&''')]),
}
rows=[];patch=[]
for path,(base,edits) in changes.items():
 root=PARENT/base/'source';data=(root/path).read_bytes();text=data.decode();anchors=[]
 for before,after in edits:
  assert text.count(before)==1,(path,before[:90],text.count(before))
  text=text.replace(before,after);anchors.append({'find':before,'replace':after,'count':1})
 out=HERE/'source'/path;out.parent.mkdir(parents=True,exist_ok=True);out.write_text(text)
 rows.append({'path':path,'inputRoot':str(root),'inputSha256':sha(data),'outputSha256':sha(text.encode()),'output':str(out),'anchors':anchors})
 patch.extend(difflib.unified_diff(data.decode().splitlines(True),text.splitlines(True),fromfile='a/'+path,tofile='b/'+path))
(HERE/'source-plan.json').write_text(json.dumps({'format':'aux.native-cache-phase-readback.source.v1','files':rows,'nativeCheckoutChanged':False,'nativeCompiled':False,'productExecuted':False,'runtimeAcceptance':False},indent=2)+'\n')
(HERE/'native.patch').write_text(''.join(patch))
print(json.dumps({'files':len(rows),'countedAnchors':sum(len(r['anchors']) for r in rows)}))
