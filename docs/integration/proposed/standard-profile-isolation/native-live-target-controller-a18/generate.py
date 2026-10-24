from pathlib import Path
import hashlib,json
base=Path(__file__).resolve().parent;root=base.parents[4]
source=root/'docs/integration/proposed/standard-profile-isolation/native-controller-span-compile-a17c/source/chrome/browser/aux/ui_storage_migration_controller.cc'
original=source.read_text();text=original;anchors=[]
def edit(a,b):
 global text
 assert text.count(a)==1,(text.count(a),a[:130]);text=text.replace(a,b);anchors.append({'find':a,'replace':b,'count':1})
edit('  bool stage_attempted = false, staged = false;', '''  bool stage_attempted = false, staged = false;
  bool commit_attempted = false, publish_attempted = false;
  bool target_seen = false, source_seen = false, mixed_seen = false, published = false;''')
edit('bool PrivateDraftTargetsMatch(const storage::mojom::AuxUiDomMapSnapshot& map, bool local) {',
     'bool PrivateDraftTargetsMatch(const storage::mojom::AuxUiDomMapSnapshot& map, bool local, bool allow_published = false) {')
edit('view->cache->tainted || view->cache->published || !view->cache->error.empty()',
     'view->cache->tainted || (view->cache->published && !allow_published) || !view->cache->error.empty()')
edit('  void BeginIntent();',(base/'live-declarations.inc').read_text()+'  void BeginIntent();')
edit('  bool intent_validation_ = false;', '  bool intent_validation_ = false;\n'+(base/'live-fields.inc').read_text())
edit('  return busy_ || cleanup_unknown_ || extension_lease_ || worker_attempted_ ||', '  return busy_ || cleanup_unknown_ || extension_lease_ || worker_attempted_ ||\n      live_active_ || live_pending_ || (live_record_ && !live_record_->complete) ||')
edit('  if (intent_ && !intent_->complete) {','''  if (live_active_) {
    busy_ = true; reply_ = std::move(reply); RunLive(); return;
  }
  if (intent_ && !intent_->complete) {''')
edit('  sealing_ = false; intent_.reset(); intent_validation_ = false;','''  sealing_ = false; intent_.reset(); intent_validation_ = false;
  live_active_ = false; live_pending_ = false; live_rollback_ = false;
  live_persistent_attempted_ = false; live_target_complete_ = false; live_source_complete_ = false;
  live_extension_attempted_ = false; live_extension_target_ = false; live_extension_synced_ = false;
  live_failure_.clear(); live_records_.clear(); live_record_.reset();''')
edit('method != "auxValidateDraftMigrationCapture" && method != "auxSealDraftMigrationCapture" &&', 'method != "auxValidateDraftMigrationCapture" && method != "auxObserveDraftMigrationTarget" &&\n      method != "auxSealDraftMigrationCapture" &&')
edit('''    if (intent_ && intent_->complete)
      Finish("Sealed source, private targets and immutable intent retained; target CAS/recovery remain required");''','''    if (intent_ && intent_->complete) StartLive();''')
edit('void Controller::BeginIntent() {',(base/'live-methods.inc').read_text()+'\nvoid Controller::BeginIntent() {')
edit('''  if (!value->held || value->released || value->aborted || value->target_attempted || value->cache_published) {
    hold.unknown = true; cleanup_unknown_ = true; ReplyResult(); return;
  }''','''  const bool original_source = live_source_complete_ && value->matches_source && value->file_data_synced &&
      !value->cache_published && !value->known_source_target_mixture;
  const bool completed_target = live_target_complete_ && value->matches_target && value->file_data_synced &&
      value->cache_published && !value->ordinary_work_queued && !value->known_source_target_mixture;
  if (!value->held || value->released || value->aborted ||
      ((value->target_attempted || value->cache_published) && !original_source && !completed_target)) {
    hold.unknown = true; cleanup_unknown_ = true; ReplyResult(); return;
  }''')
edit('''void Controller::Finish(std::string error) {
  error_ = std::move(error);''','''void Controller::Finish(std::string error) {
  if (live_active_ && live_persistent_attempted_ && !live_target_complete_ && !live_source_complete_) {
    HoldLive(std::move(error)); return;
  }
  error_ = std::move(error);''')
edit('  result.Set("immutableIntentRetained", intent_ && intent_->complete);','''  result.Set("liveTargetObserved", live_target_complete_);
  result.Set("originalSourceRestored", live_source_complete_);
  result.Set("liveTransactionPending", live_active_ || live_pending_ || (live_record_ && !live_record_->complete));
  result.Set("immutableIntentRetained", intent_ && intent_->complete);''')
# Exact original metadata is data for native fresh-owner requalification, never doubles.
edit('  intent.Set("domains", std::move(domains)); intent.Set("extensionSource", std::move(extension_source));',
     '''  auto extension_descriptor = value_store::ValueStore::MakeAuxUiPreferenceRecoveryDescriptor(extension_lease_->CopySourceRecords());
  if (!extension_descriptor.has_value() || extension_descriptor->target != extension_lease_->CopyTargetRecords()) {
    Finish("Exact bounded fixed-six recovery descriptor refused"); return;
  }
  intent.Set("extensionSourceSha256", extension_descriptor->source_sha256);
  intent.Set("extensionTargetSha256", extension_descriptor->target_sha256);
  intent.Set("extensionDescriptorSha256", extension_descriptor->descriptor_sha256);
  intent.Set("domains", std::move(domains)); intent.Set("extensionSource", std::move(extension_source));''')
edit('''      fact.Set("originalMapId", map->map_id ? base::Value(base::NumberToString(*map->map_id)) : base::Value());''','''      fact.Set("originalMapId", map->map_id ? base::Value(base::NumberToString(*map->map_id)) : base::Value());
      fact.Set("sourceLastAccessedUs", map->source_last_accessed_us ? base::Value(*map->source_last_accessed_us) : base::Value());
      fact.Set("sourceLastModifiedUs", map->source_last_modified_us ? base::Value(*map->source_last_modified_us) : base::Value());
      fact.Set("sourceTotalSizeBytes", map->source_total_size_bytes ? base::Value(*map->source_total_size_bytes) : base::Value());''')
edit('''        a.map_id != b.map_id || a.source_persisted != b.source_persisted ||''','''        a.map_id != b.map_id || a.source_persisted != b.source_persisted ||
        a.source_last_accessed_us != b.source_last_accessed_us || a.source_last_modified_us != b.source_last_modified_us ||
        a.source_total_size_bytes != b.source_total_size_bytes ||''')
output=base/'source/chrome/browser/aux/ui_storage_migration_controller.cc';output.parent.mkdir(parents=True,exist_ok=True);output.write_text(text)
sha=lambda x:hashlib.sha256(x).hexdigest()
wire=Path('/Users/rcourson/.codex/worktrees/aux-features-frame/web/docs/integration/proposed/standard-profile-isolation/native-dom-control-mixture-wire-a17d/source/components/services/storage/public/mojom/local_storage_control.mojom')
plan={'format':'aux.native-live-target-controller.v1','files':[{'path':'chrome/browser/aux/ui_storage_migration_controller.cc','input':str(source),'inputSha256':sha(original.encode()),'output':str(output),'outputSha256':sha(text.encode()),'anchors':anchors}],'dependencies':[{'path':str(wire),'sha256':sha(wire.read_bytes()),'role':'actual allocation, exact metadata and known source-target mixture facts'}]}
helper=Path('/Users/rcourson/.codex/worktrees/aux-features-frame/web/docs/integration/proposed/standard-profile-isolation/native-extension-recovery-a20/source/components/value_store/value_store.h')
plan['dependencies'].append({'path':str(helper),'sha256':sha(helper.read_bytes()),'role':'actual fixed-six descriptor fingerprint and finite target derivation'})
(base/'source-plan.json').write_text(json.dumps(plan,indent=2)+'\n');print(len(anchors),len(text),sha(text.encode()))
