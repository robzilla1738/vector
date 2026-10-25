import pathlib,json,hashlib
root=pathlib.Path('/Users/rcourson/.codex/worktrees/aux-features-navigation/web')
p=root/'docs/integration/proposed/standard-profile-isolation/native-recovery-journal-reader-a30'
src=root/'docs/integration/proposed/standard-profile-isolation/native-recovery-capture-facts-a24/source/chrome/browser/aux/ui_storage_migration_controller.cc'
original=src.read_text(); text=original; anchors=[]
def swap(a,b,n=1):
 global text
 assert text.count(a)==n,(a[:120],text.count(a),n)
 text=text.replace(a,b);anchors.append(dict(find=a,replace=b,count=n))
reader=(p/'reader.inc').read_text().replace('current.inventory, record_index)', 'current.inventory, static_cast<uint32_t>(record_index))').replace('current.journal, record_index, offset, count, record_bytes)', 'current.journal, static_cast<uint32_t>(record_index), static_cast<uint32_t>(offset), count, record_bytes)').replace('record_bytes - offset);','record_bytes - static_cast<uint32_t>(offset));')
(p/'reader.inc').write_text(reader)
decode=(p/'decode.inc').read_text()
if 'observed_domains;' not in decode: decode=decode.replace('    for (const auto& raw : *rows) {','    std::set<std::pair<size_t, bool>> observed_domains;\n    for (const auto& raw : *rows) {').replace('if (domain == result->domains.end() || maps->size()', 'if (domain == result->domains.end() ||\n          !observed_domains.emplace(domain->partition, domain->local).second || maps->size()').replace('      for (const auto& raw_map : *maps) {','      std::set<uint32_t> observed_maps;\n      for (const auto& raw_map : *maps) {').replace('if (!map || !ordinal || *ordinal < 0) return nullptr;', 'if (!map || !ordinal || *ordinal < 0 || !observed_maps.insert(static_cast<uint32_t>(*ordinal)).second) return nullptr;')
(p/'decode.inc').write_text(decode)
qualify=(p/'qualify.inc').read_text().replace('bool Controller::RecoveryOwnersCurrent() const {','bool Controller::RecoveryOwnersCurrent() {').replace('InventoryConst()', 'Inventory(false)')
a='''    auto observed = frontend ? frontend->ObserveAuxUiMigrationLease(frontend_request_id_)
        : Frontend::AuxUiMigrationLeaseObservationResult(base::unexpected(
            value_store::ValueStore::Status(value_store::ValueStore::OTHER_ERROR, "Actual frontend unavailable")));'''
b='''    if (!frontend) { HoldRecovery("Actual original recovery frontend unavailable"); return; }
    auto observed = frontend->ObserveAuxUiMigrationLease(frontend_request_id_);'''
assert a in qualify or b in qualify;qualify=qualify.replace(a,b);(p/'qualify.inc').write_text(qualify)
swap('#include "chrome/browser/aux/ui_storage_migration_completion.h"','#include "chrome/browser/aux/ui_storage_migration_completion.h"\n#include "chrome/browser/aux/ui_storage_migration_journal_protocol.h"\n#include "chrome/browser/ui/aux/page_identity.h"\n#include "base/no_destructor.h"')
swap('struct Frame {',reader+'\n'+(p/'plan.inc').read_text()+'\nstruct Frame {')
swap('  std::string request_id, lease_id, capture_json, result_json, namespace_id;', '  std::string request_id, lease_id, capture_json, result_json, namespace_id;\n  std::string native_page_id, native_route;\n  size_t recovery_owner = 0;')
swap('  bool target_seen = false, source_seen = false, mixed_seen = false, published = false;','  bool target_seen = false, source_seen = false, mixed_seen = false, published = false;\n  bool recovery_attempted = false, recovery_prepare_attempted = false;\n  storage::mojom::AuxUiDomLeaseReplyPtr recovery;')
swap('  void PrepareNext();','''  void PrepareNext();
  void BeginJournalScan();
  void ScanJournalStep();
  void JournalScanFailed(std::string);
  std::unique_ptr<VerifiedRecoveryPlan> DecodeRecoveryPlan(RecoveryJournalData);
  void HoldRecovery(std::string);
  bool RecoveryOwnersCurrent();
  bool MatchRecoveryOwners();
  void ResumeRecoveryQualification();
  void RecoverySealNext();
  void RecoverySealed(size_t, std::optional<base::DictValue>, std::string);
  void ReadRecoveryFrontend();
  void RecoveryFrontendRead(Frontend::AuxUiMigrationReadbackResult);
  void QualifyRecoveryDomNext();
  void RecoveryDomRead(size_t, storage::mojom::AuxUiDomLeaseReplyPtr);
  void RecoveryDomLost(size_t);''')
swap('  bool recovery_mode_ = false;','''  bool recovery_mode_ = false;
  std::unique_ptr<RecoveryJournalReader> journal_reader_;
  std::unique_ptr<VerifiedRecoveryPlan> recovery_plan_;
  bool journal_scan_pending_ = false, recovery_pending_ = false;
  bool recovery_fresh_sealed_ = false, recovery_qualified_ = false;
  bool recovery_extension_source_ = false, recovery_extension_target_ = false;
  size_t recovery_cursor_ = 0;''')
swap('Controller::Controller(Profile* profile) : profile_(profile->GetWeakPtr()) {','''// Operation7 retains one physical download/inventory on the selected owner.
// Serialize native controller users across profiles; this weak reservation is
// never a writer-closure fact and cannot settle unknown physical work.
base::WeakPtr<Controller>& JournalOwner() {
  static base::NoDestructor<base::WeakPtr<Controller>> owner;
  return *owner;
}
'''+decode+'\n'+(p/'driver.inc').read_text()+'\n'+qualify+'''\nController::Controller(Profile* profile) : profile_(profile->GetWeakPtr()) {''')
swap('  return busy_ || cleanup_unknown_ || extension_lease_ || worker_attempted_ ||','  return busy_ || cleanup_unknown_ || journal_scan_pending_ || recovery_pending_ || extension_lease_ || worker_attempted_ ||')
swap('      actual->GetLastCommittedOrigin() == extension_->origin();','''      actual->GetLastCommittedOrigin() == extension_->origin() &&
      actual->GetLastCommittedURL().path() == frame.native_route &&
      (PageIdentity::FromWebContents(frame.contents.get()) ?
          PageIdentity::FromWebContents(frame.contents.get())->id() : std::string()) == frame.native_page_id;''')
swap('    retained->request_id = base::Uuid::GenerateRandomV4().AsLowercaseString();','''    retained->native_route = frame->GetLastCommittedURL().path();
    if (const auto* identity = PageIdentity::FromWebContents(contents)) retained->native_page_id = identity->id();
    retained->request_id = base::Uuid::GenerateRandomV4().AsLowercaseString();''')
swap('  if (live_active_) {','''  if (journal_scan_pending_) {
    busy_ = true; reply_ = std::move(reply); ScanJournalStep(); return;
  }
  if (recovery_pending_) {
    busy_ = true; reply_ = std::move(reply); ResumeRecoveryQualification(); return;
  }
  if (live_active_) {''')
swap('  frames_.clear(); partitions_.clear(); dom_holds_.clear(); transfer_.reset(); error_.clear();','''  auto& journal_owner = JournalOwner();
  if (journal_owner && journal_owner.get() != this && journal_owner->pending()) {
    std::move(reply).Run(Refused("Another actual profile holds the selected native journal channel")); return;
  }
  frames_.clear(); partitions_.clear(); dom_holds_.clear(); transfer_.reset(); error_.clear();
  journal_reader_.reset(); recovery_plan_.reset();
  journal_scan_pending_ = false; recovery_pending_ = false; recovery_mode_ = false;
  recovery_fresh_sealed_ = false; recovery_qualified_ = false;''')
swap('  reply_ = std::move(reply); cursor_ = 0; PrepareNext();','  journal_owner = weak_.GetWeakPtr();\n  reply_ = std::move(reply); cursor_ = 0; BeginJournalScan();')
swap('''  frontend->BeginAuxUiMigrationLease(extension_, frontend_request_id_, mojo::WrapCallbackWithDropHandler(
      base::BindOnce(&Controller::FrontendPrepared, weak_.GetWeakPtr()),
      base::BindOnce(&Controller::FrontendLost, weak_.GetWeakPtr(), true)));''','''  auto callback = mojo::WrapCallbackWithDropHandler(
      base::BindOnce(&Controller::FrontendPrepared, weak_.GetWeakPtr()),
      base::BindOnce(&Controller::FrontendLost, weak_.GetWeakPtr(), true));
  if (recovery_mode_) {
    if (!recovery_plan_) { HoldRecovery("Verified original recovery descriptor unavailable"); return; }
    frontend->RequalifyAuxUiMigrationLease(extension_, frontend_request_id_, recovery_plan_->extension, std::move(callback));
  } else frontend->BeginAuxUiMigrationLease(extension_, frontend_request_id_, std::move(callback));''')
swap('    domain.Set("controlGeneration", base::NumberToString(hold.generation));\n    domain.Set("sourceTopologySha256", hold.source->source_topology_sha256);', '    domain.Set("controlGeneration", base::NumberToString(hold.generation));\n    const auto native_config = partitions_[hold.partition]->GetConfig();\n    domain.Set("nativePartitionDomain", native_config.partition_domain());\n    domain.Set("nativePartitionName", native_config.partition_name());\n    domain.Set("nativePartitionInMemory", native_config.in_memory());\n    domain.Set("sourceTopologySha256", hold.source->source_topology_sha256);', 2)
swap('  extension_lease_ = std::move(result.value());','''  extension_lease_ = std::move(result.value());
  if (recovery_mode_ && (!recovery_plan_ || !extension_lease_ || !extension_lease_->IsRecoveryQualified() ||
      extension_lease_->RecoveryDescriptorSha256() != recovery_plan_->extension.descriptor_sha256)) {
    HoldRecovery("Actual frontend did not retain the verified original recovery descriptor"); return;
  }''')
swap('  if (dom_cursor_ == dom_holds_.size()) {\n    sealing_ = true; dom_cursor_ = 0; ValidateDomNext(); return;','  if (dom_cursor_ == dom_holds_.size()) {\n    if (recovery_mode_) { recovery_cursor_ = 0; RecoverySealNext(); return; }\n    sealing_ = true; dom_cursor_ = 0; ValidateDomNext(); return;')
swap('    page.Set("nativeDocumentId", frame->document_id.ToString());','    page.Set("nativePageId", frame->native_page_id);\n    page.Set("nativeRoute", frame->native_route);\n    page.Set("nativeDocumentId", frame->document_id.ToString());')
# Future durable observed facts are actual native attempt state, never inferred
# from a kind2 declaration that was persisted before the physical call.
a='    domain.Set("storage", hold.local ? "local-storage" : "session-storage");'
# Three domains builders; add to live observation only exact surrounding anchor.
swap('    domain.Set("fileDataSynced", hold.source->file_data_synced);','    domain.Set("fileDataSynced", hold.source->file_data_synced);\n    domain.Set("targetAttempted", hold.source->target_attempted);')
swap('void Controller::Finish(std::string error) {','''void Controller::Finish(std::string error) {
  if (recovery_mode_ || recovery_pending_) { HoldRecovery(std::move(error)); return; }''')
swap('  result.Set("workerCleanupPending", worker_attempted_);','''  result.Set("nativeJournalReadPending", journal_scan_pending_);
  result.Set("originalRecoveryRetained", !!recovery_plan_);
  result.Set("freshRecoveryOwnersObserved", recovery_qualified_);
  result.Set("recoveryRestorationPending", recovery_pending_);
  result.Set("workerCleanupPending", worker_attempted_);''')
swap('  if (alive && !alive->pending()) alive->settled_.Notify();','''  if (alive && !alive->pending()) {
    if (JournalOwner().get() == alive.get()) JournalOwner().reset();
    alive->settled_.Notify();
  }''')
out=p/'source/chrome/browser/aux/ui_storage_migration_controller.cc';out.parent.mkdir(parents=True,exist_ok=True);out.write_text(text)
sha=lambda path:hashlib.sha256(path.read_bytes()).hexdigest()
deps=[pathlib.Path('/Users/rcourson/.codex/worktrees/aux-features-frame/web/docs/integration/proposed/standard-profile-isolation/ui-journal-protocol-helper-a29/source/chrome/browser/aux/ui_storage_migration_journal_protocol.h'),pathlib.Path('/Users/rcourson/.codex/worktrees/aux-features-frame/web/docs/integration/proposed/standard-profile-isolation/native-extension-recovery-a20/source/extensions/browser/api/storage/storage_frontend.h'),pathlib.Path('/Users/rcourson/.codex/worktrees/aux-features-frame/web/docs/integration/proposed/standard-profile-isolation/native-dom-control-uncertainty-a35/source/components/services/storage/public/mojom/local_storage_control.mojom'),pathlib.Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src/chrome/browser/ui/aux/page_identity.h'),pathlib.Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src/chrome/browser/ui/browser_tabrestore.cc')]
manifest={'format':'aux.native-recovery-journal-reader.v1','files':[dict(path='chrome/browser/aux/ui_storage_migration_controller.cc',input=str(src),inputSha256=sha(src),output=str(out),outputSha256=sha(out),anchors=anchors)],'dependencies':[dict(path=str(x),sha256=sha(x)) for x in deps]}
(p/'source-plan.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps({'anchors':len(anchors),'inputSha256':sha(src),'outputSha256':sha(out),'outputLines':len(text.splitlines())}))
