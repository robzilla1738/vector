from pathlib import Path
import json,hashlib
base=Path(__file__).resolve().parent; root=base.parents[4]
source=root/'docs/integration/proposed/standard-profile-isolation/native-dom-source-controller-a14/source/chrome/browser/aux/ui_storage_migration_controller.cc'
original=source.read_text();text=original;anchors=[]
def edit(a,b):
 global text
 assert text.count(a)==1,(text.count(a),a[:160]);text=text.replace(a,b);anchors.append({'find':a,'replace':b,'count':1})
edit('#include <array>','#include <array>\n#include <bit>')
edit('struct Frame {',(base/'record.inc').read_text()+'\nstruct Frame {')
edit('  storage::mojom::AuxUiDomLeaseReplyPtr source;','  storage::mojom::AuxUiDomLeaseReplyPtr source;\n  std::vector<storage::mojom::AuxUiDomTargetMapPtr> targets;\n  bool stage_attempted = false, staged = false;')
edit('class Controller final :',(base/'target-codec.inc').read_text()+'\nclass Controller final :')
edit('  bool PairDomSources() const;','''  bool PairDomSources() const;
  bool BuildDomTargets();
  void StageDomNext();
  void StagedDom(size_t, storage::mojom::AuxUiDomLeaseReplyPtr);
  void BeginIntent();
  void RunIntent();''')
edit('  std::shared_ptr<Transfer> transfer_;','  std::shared_ptr<Transfer> transfer_;\n  std::unique_ptr<IntentRecord> intent_;\n  bool intent_validation_ = false;')
edit('  return busy_ || cleanup_unknown_ || extension_lease_ || worker_attempted_ ||','  return busy_ || cleanup_unknown_ || extension_lease_ || worker_attempted_ ||\n      (intent_ && !intent_->complete) ||')
edit('  // Unfinished native transfer keeps ALL original holds.', '''  if (intent_ && !intent_->complete) {
    if (!Current() || !Inventory(false) || !FrontendCurrent()) {
      std::move(reply).Run(Refused("Original source holds unavailable for immutable intent recovery")); return;
    }
    busy_ = true; reply_ = std::move(reply); intent_validation_ = true;
    cursor_ = 0; ReadWorkerForValidation(); return;
  }
  // Unfinished native transfer keeps ALL original holds.''')
edit('  sealing_ = false;\n  worker_inventory_retained_', '  sealing_ = false; intent_.reset(); intent_validation_ = false;\n  worker_inventory_retained_')
a='''  if (hold.source && (hold.source->maps != value->maps ||
      hold.source->source_topology_sha256 != value->source_topology_sha256 ||
      hold.source->target_topology_sha256 != value->target_topology_sha256)) return false;'''
b='''  if (hold.source && !SameDomSource(*hold.source, *value)) return false;
  if (hold.stage_attempted) {
    if (hold.targets.size() != value->maps.size()) return false;
    for (const auto& map : value->maps) {
      const auto plan = std::ranges::find_if(hold.targets,
          [&](const auto& target) { return target->map_ordinal == map->map_ordinal; });
      if (plan == hold.targets.end() || (*plan)->desired_selected_entries != map->target_entries ||
          !PrivateDraftTargetsMatch(*map, hold.local)) return false;
    }
  } else if (hold.source && (hold.source->maps != value->maps ||
      hold.source->target_topology_sha256 != value->target_topology_sha256)) return false;
  if (hold.staged && hold.source && (hold.source->maps != value->maps ||
      hold.source->target_topology_sha256 != value->target_topology_sha256)) return false;'''
edit(a,b)
a='''void Controller::ValidationComplete() {
  if (post_persist_validation_)
    Finish("Sealed source retained and read back; private target intent, import and recovery remain required");
  else if (transfer_validation_) { transfer_validation_ = false; RunTransfer(); }
  else Persist();
}'''
b='''void Controller::ValidationComplete() {
  if (intent_validation_) {
    intent_validation_ = false;
    if (intent_ && intent_->complete)
      Finish("Sealed source, private targets and immutable intent retained; target CAS/recovery remain required");
    else RunIntent();
  } else if (post_persist_validation_) BeginIntent();
  else if (transfer_validation_) { transfer_validation_ = false; RunTransfer(); }
  else if (!std::ranges::all_of(dom_holds_, [](const auto& hold) { return hold.staged; })) {
    if (!BuildDomTargets()) { Finish("Exact sealed-memory private target plan refused"); return; }
    dom_cursor_ = 0; StageDomNext();
  } else Persist();
}'''
edit(a,b)
edit('  capture.Set("rendererSourceSealed", true);','''  capture.Set("rendererSourceSealed", true);
  capture.Set("privateNativeTargetsStaged", true);''')
edit('void Controller::BeginDomNext() {',(base/'target-methods.inc').read_text()+'\nvoid Controller::BeginDomNext() {')
# Preserve all original producer custody if journal outcome is physically unknown.
edit('  if (transfer_ && !transfer_->complete) {\n    // Never release', '  if ((transfer_ && !transfer_->complete) || (intent_ && !intent_->complete)) {\n    // Never release')
edit('  result.Set("backendWriterClosure", false);','''  result.Set("immutableIntentRetained", intent_ && intent_->complete);
  if (intent_ && intent_->complete) result.Set("intentSha256", base::HexEncodeLower(intent_->digest));
  result.Set("backendWriterClosure", false);''')
output=base/'source/chrome/browser/aux/ui_storage_migration_controller.cc';output.parent.mkdir(parents=True,exist_ok=True);output.write_text(text)
sha=lambda x:hashlib.sha256(x).hexdigest()
plan={'format':'aux.native-target-intent-controller.v1','files':[{'path':'chrome/browser/aux/ui_storage_migration_controller.cc','input':str(source),'inputSha256':sha(original.encode()),'output':str(output),'outputSha256':sha(text.encode()),'anchors':anchors}]}
codec=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src/third_party/blink/renderer/modules/storage/cached_storage_area.cc')
plan['dependencies']=[{'path':str(codec),'sha256':sha(codec.read_bytes()),'anchors':['enum class StorageFormat : uint8_t { UTF16 = 0, Latin1 = 1 };','CachedStorageArea::FormatOption CachedStorageArea::GetKeyFormat() const {','CachedStorageArea::FormatOption CachedStorageArea::GetValueFormat() const {','Vector<uint8_t> CachedStorageArea::StringToUint8Vector(']}]
protocol=Path('/Users/rcourson/Documents/Vibe/web/docs/integration/proposed/standard-profile-isolation/ui-transaction-record-journal-a1/PROTOCOL.md')
plan['dependencies'].append({'path':str(protocol),'sha256':sha(protocol.read_bytes()),'role':'authenticated immutable record frames7-11; fixed ordinal0 kind1'})
(base/'source-plan.json').write_text(json.dumps(plan,indent=2)+'\n');print(len(anchors),'anchors',len(text),'bytes',sha(text.encode()))
