from pathlib import Path
import hashlib,json
base=Path(__file__).resolve().parent
root=base.parents[4]
source=root/'docs/integration/proposed/standard-profile-isolation/native-frontend-observation-a10b/source/chrome/browser/aux/ui_storage_migration_controller.cc'
original=source.read_text(); text=original; anchors=[]
def edit(a,b):
 global text
 n=text.count(a)
 assert n==1,(n,a[:150])
 text=text.replace(a,b); anchors.append({'find':a,'replace':b,'count':1})
edit('#include "components/value_store/value_store.h"','#include "components/value_store/value_store.h"\n#include "components/services/storage/public/mojom/local_storage_control.mojom.h"\n#include "components/services/storage/public/mojom/session_storage_control.mojom.h"')
edit('bool prepared = false, cleanup_unknown = false;', 'bool prepared = false, sealed = false, cleanup_unknown = false;')
edit('class Controller final :', '''// Proxy pointers are NEVER retained across asynchronous boundaries. A hold stores
// only the actual original partition index, native correlation and service data.
struct DomHold {
  size_t partition = 0;
  bool local = false, attempted = false, pending = false, unknown = false, released = false;
  uint64_t generation = 0;
  base::UnguessableToken request;
  std::optional<base::UnguessableToken> token;
  storage::mojom::AuxUiDomLeaseReplyPtr source;
};
class Controller final :''')
edit('  bool AcceptLease(Frame&, const base::DictValue&);','  bool AcceptLease(Frame&, const base::DictValue&, bool sealed = false);')
edit('  void DrainNext();', '''  std::optional<content::DOMStorageContext::AuxUiMigrationControls> DomControls(size_t) const;
  bool DomCurrent() const;
  bool AcceptDom(size_t, storage::mojom::AuxUiDomLeaseReplyPtr);
  bool PairDomSources() const;
  void BeginDomNext();
  void BeganDom(size_t, storage::mojom::AuxUiDomLeaseReplyPtr);
  void DomLost(size_t);
  void ValidateDomNext();
  void ValidatedDom(size_t, storage::mojom::AuxUiDomLeaseReplyPtr);
  void SealNext();
  void Sealed(size_t, bool, std::optional<base::DictValue>, std::string);
  void CleanupDomNext();
  void ObservedDomCleanup(size_t, storage::mojom::AuxUiDomLeaseReplyPtr);
  void ReleasedDom(size_t, bool);
  void CleanupFrontend();
  void DrainNext();''')
edit('  std::unique_ptr<ExtensionLease> extension_lease_;','  std::unique_ptr<ExtensionLease> extension_lease_;\n  std::vector<DomHold> dom_holds_;\n  size_t dom_cursor_ = 0;\n  bool sealing_ = false, dom_cleaning_ = false;')
edit('  return busy_ || cleanup_unknown_ || extension_lease_ || worker_attempted_ ||','  return busy_ || cleanup_unknown_ || extension_lease_ || worker_attempted_ ||\n      std::ranges::any_of(dom_holds_, [](const auto& hold) { return hold.attempted && !hold.released; }) ||')
edit('  if (cleanup_unknown_ || extension_lease_ || worker_attempted_ ||','  if (cleanup_unknown_ || extension_lease_ || worker_attempted_ ||\n      std::ranges::any_of(dom_holds_, [](const auto& hold) { return hold.attempted && !hold.released; }) ||')
edit('  frames_.clear(); partitions_.clear(); transfer_.reset(); error_.clear();','  frames_.clear(); partitions_.clear(); dom_holds_.clear(); transfer_.reset(); error_.clear();\n  sealing_ = false;')
edit('      method != "auxValidateDraftMigrationCapture" && method != "auxReleaseDraftMigrationCapture")) {','      method != "auxValidateDraftMigrationCapture" && method != "auxSealDraftMigrationCapture" &&\n      method != "auxReleaseDraftMigrationCapture")) {')
edit('bool Controller::AcceptLease(Frame& frame, const base::DictValue& value) {','bool Controller::AcceptLease(Frame& frame, const base::DictValue& value, bool sealed) {')
edit('!owners || *owners <= 0 || *owners > 256 || value.FindBool("sealed") != false ||','!owners || *owners <= 0 || *owners > 256 || value.FindBool("sealed") != sealed ||\n      (sealed && (!frame.prepared || *lease != frame.lease_id || *revision != frame.revision)) ||')
edit('  frame.source_stores = std::move(stores); frame.prepared = true;','  frame.source_stores = std::move(stores); frame.prepared = true; frame.sealed = sealed;')
edit('  cursor_ = 0; DrainNext();','''  for (size_t partition = 0; partition < partitions_.size(); ++partition) {
    for (const bool local : {true, false}) {
      DomHold hold; hold.partition = partition; hold.local = local;
      hold.request = base::UnguessableToken::Create();
      dom_holds_.push_back(std::move(hold));
    }
  }
  dom_cursor_ = 0; BeginDomNext();''')
edit('      value->FindBool("ok") != true || value->FindBool("closed") != true || value->FindBool("sealed") != false ||','      value->FindBool("ok") != true || value->FindBool("closed") != true ||\n      value->FindBool("sealed") != frames_[index]->sealed ||')
edit('  ValidationComplete();\n}\nvoid Controller::ValidationComplete()', '  dom_cursor_ = 0; ValidateDomNext();\n}\nvoid Controller::ValidationComplete()')
edit('Finish("Capture retained and read back; genuine DOM writer gates, target import and recovery remain required");','Finish("Sealed source retained and read back; private target intent, import and recovery remain required");')
edit('  capture.Set("workerReportJson", worker_report_json_);','''  capture.Set("workerReportJson", worker_report_json_);
  base::ListValue domains;
  for (const auto& hold : dom_holds_) {
    base::DictValue domain;
    domain.Set("partitionOrdinal", static_cast<int>(hold.partition));
    domain.Set("storage", hold.local ? "local-storage" : "session-storage");
    domain.Set("requestId", hold.request.ToString());
    domain.Set("serviceToken", hold.token->ToString());
    domain.Set("controlGeneration", base::NumberToString(hold.generation));
    domain.Set("sourceTopologySha256", hold.source->source_topology_sha256);
    base::ListValue maps;
    for (const auto& map : hold.source->maps) {
      base::DictValue fact;
      fact.Set("ordinal", static_cast<int>(map->map_ordinal));
      fact.Set("storageKey", map->storage_key.Serialize());
      fact.Set("sourceMapSha256", map->source_map_sha256);
      fact.Set("sourcePersisted", map->source_persisted);
      base::ListValue records, namespaces;
      for (const auto& entry : map->source_entries) {
        base::DictValue raw;
        raw.Set("keyBase64", base::Base64Encode(entry->key));
        raw.Set("valueBase64", base::Base64Encode(entry->value));
        records.Append(std::move(raw));
      }
      for (const auto& ns : map->session_ids) namespaces.Append(ns);
      fact.Set("sourceSelectedRaw", std::move(records));
      fact.Set("nativeNamespaces", std::move(namespaces));
      maps.Append(std::move(fact));
    }
    domain.Set("maps", std::move(maps)); domains.Append(std::move(domain));
  }
  capture.Set("domSourceFacts", std::move(domains));
  capture.Set("rendererSourceSealed", true);''')
edit('void Controller::StartCleanup() {\n  // Reopen', '''void Controller::StartCleanup() {
  dom_cursor_ = 0; CleanupDomNext();
}
void Controller::CleanupFrontend() {
  // Reopen''')
edit('  if (extension_lease_ || frontend_begin_pending_ || frontend_io_pending_ ||','  if (std::ranges::any_of(dom_holds_, [](const auto& hold) { return hold.attempted && !hold.released; }) ||\n      extension_lease_ || frontend_begin_pending_ || frontend_io_pending_ ||')
edit('  result.Set("backendWriterClosure", false);','''  result.Set("domCleanupPending", std::ranges::any_of(dom_holds_,
      [](const auto& hold) { return hold.attempted && !hold.released; }));
  result.Set("backendWriterClosure", false);''')
# Source fences on every transfer boundary, plus final sealing/pairing before capture.
edit('void Controller::Persist() {\n  if (!Inventory(false)', 'void Controller::Persist() {\n  if (!DomCurrent() || !PairDomSources() || !Inventory(false)')
edit('void Controller::RunTransfer() {\n  if (!Inventory(false)', 'void Controller::RunTransfer() {\n  if (!DomCurrent() || !Inventory(false)')
edit('void Controller::TransferStep() {\n  if (!Inventory(false)', 'void Controller::TransferStep() {\n  if (!DomCurrent() || !Inventory(false)')
methods=(base/'methods.inc').read_text()
edit('void Controller::DrainNext() {',methods+'\nvoid Controller::DrainNext() {')
edit('  void DrainNext();\n', '')
edit('  void Drained(bool);\n', '')
start=text.index('void Controller::DrainNext() {')
end=text.index('void Controller::ValidateNext() {', start)
edit(text[start:end], '')
output=base/'source/chrome/browser/aux/ui_storage_migration_controller.cc'; output.parent.mkdir(parents=True,exist_ok=True); output.write_text(text)
sha=lambda x:hashlib.sha256(x).hexdigest()
plan={'format':'aux.native-dom-source-controller.v1','files':[{'path':'chrome/browser/aux/ui_storage_migration_controller.cc','input':str(source),'inputSha256':sha(original.encode()),'output':str(output),'outputSha256':sha(text.encode()),'anchors':anchors}]}
dependencies=[
('/Users/rcourson/.codex/worktrees/aux-features-frame/web/docs/integration/proposed/standard-profile-isolation/native-dom-control-result-observation-a1/source/components/services/storage/public/mojom/local_storage_control.mojom','finite DOM reply including released/aborted observations'),
('/Users/rcourson/.codex/worktrees/aux-features-frame/web/docs/integration/proposed/standard-profile-isolation/native-dom-control-cohort-glue-a1/source/components/services/storage/public/mojom/session_storage_control.mojom','actual Session finite methods'),
('/private/tmp/aux-chromium-recovery-snapshot-20261023/src/content/public/browser/dom_storage_context.h','actual no-bind control-generation seam'),
('/private/tmp/aux-chromium-recovery-snapshot-20261023/src/third_party/blink/public/mojom/dom_storage/storage_area.mojom','exact UTF16 cache document/source data'),
]
plan['dependencies']=[{'path':p,'sha256':sha(Path(p).read_bytes()),'role':role} for p,role in dependencies]
(base/'source-plan.json').write_text(json.dumps(plan,indent=2)+'\n')
print(len(anchors),'anchors',len(text),'bytes',sha(text.encode()))
