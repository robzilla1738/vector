from pathlib import Path
import hashlib,json
base=Path(__file__).resolve().parent;root=base.parents[4]
source=root/'docs/integration/proposed/standard-profile-isolation/native-live-target-controller-a18/source/chrome/browser/aux/ui_storage_migration_controller.cc'
original=source.read_text();text=original;anchors=[]
def edit(a,b):
 global text
 assert text.count(a)==1,(text.count(a),a[:140]);text=text.replace(a,b);anchors.append({'find':a,'replace':b,'count':1})
edit('#include "chrome/browser/aux/ui_storage_migration_controller.h"','#include "chrome/browser/aux/ui_storage_migration_controller.h"\n#include "chrome/browser/aux/ui_storage_migration_completion.h"')
edit('namespace aux {\nnamespace {','namespace aux {\nnamespace migration_detail {')
edit('  bool prepared = false, sealed = false, cleanup_unknown = false;','  bool prepared = false, sealed = false, cleanup_unknown = false;\n  std::string target_observation_sha;')
edit('  bool pending() const;','''  bool pending() const;
  std::unique_ptr<UiStorageMigrationCompletion> TakeCompletion();
  bool AcknowledgeCompletion(UiStorageMigrationOwnerAck);''')
edit('  void StartLive();','''  bool CompletionCurrent();
  std::string CompletionFingerprint() const;
  void StartLive();''')
edit('  std::string live_failure_;','''  std::string live_failure_;
  bool live_terminal_written_ = false, completion_taken_ = false;
  uint32_t terminal_ordinal_ = 0;
  std::unique_ptr<UiStorageMigrationCompletion> completion_fact_;
  std::optional<UiStorageMigrationOwnerAck> completion_ack_;''')
edit('  live_failure_.clear(); live_records_.clear(); live_record_.reset();','  live_failure_.clear(); live_records_.clear(); live_record_.reset();\n  live_terminal_written_ = false; terminal_ordinal_ = 0; completion_taken_ = false; completion_fact_.reset(); completion_ack_.reset();')
edit('''  LiveFrameNext();
}
void Controller::LiveFrontend''','''  const auto* units = value->FindDict("storeUnits");
  auto raw_units = units ? base::WriteJson(*units) : std::nullopt;
  if (!raw_units) { HoldLive("Current renderer units could not be fingerprinted"); return; }
  frames_[index]->target_observation_sha = base::HexEncodeLower(Digest(*raw_units));
  LiveFrameNext();
}
void Controller::LiveFrontend''')
edit('  fact.Set("domains", std::move(domains)); return fact;','''  fact.Set("domains", std::move(domains));
  base::ListValue pages;
  for (const auto& frame : frames_) {
    base::DictValue page; page.Set("nativeDocumentId", frame->document_id.ToString());
    page.Set("nativeLocalFrameToken", frame->native_frame_token->ToString());
    page.Set("nativeBlinkDocumentToken", frame->native_document_token->ToString());
    page.Set("currentStoreUnitsSha256", frame->target_observation_sha);
    pages.Append(std::move(page));
  }
  fact.Set("rendererCurrentStores", std::move(pages));
  fact.Set("terminalAllTargetObserved", live_terminal_written_);
  return fact;''')
edit('''      live_target_complete_ = true;
      HoldLive("Actual live target awaits typed selected-home terminal acceptance; no automatic cleanup"); return;''','''      if (!live_terminal_written_) {
        live_terminal_written_ = true; live_observation_domain_ = -2;
        RecordLive(8, LiveAction::kComplete);
        if (live_record_) terminal_ordinal_ = live_record_->ordinal;
        else live_terminal_written_ = false;
        return;
      }
      if (!terminal_ordinal_ || live_records_.empty() || live_records_.back()->ordinal != terminal_ordinal_ ||
          live_records_.back()->kind != 8 || !live_records_.back()->complete) {
        HoldLive("Actual aggregate terminal record is not durable"); return;
      }
      live_target_complete_ = true;
      if (!completion_ack_) {
        if (!completion_fact_) completion_fact_ = TakeCompletion();
        if (!completion_fact_ || !completion_fact_->IsCurrent()) {
          HoldLive("Original one-shot native terminal fact is unavailable"); return;
        }
        auto acknowledgement = peer::AcceptNativeSelectedUiMigrationCompletion(*completion_fact_);
        if (!acknowledgement) {
          HoldLive("Actual selected-home terminal observation is pending; retain original fact"); return;
        }
        if (!AcknowledgeCompletion(std::move(*acknowledgement))) {
          HoldLive("Actual selected-home acknowledgement no longer matches original fact"); return;
        }
        return;
      }
      if (!completion_ack_->Matches(transfer_->generation, CompletionFingerprint()) || !CompletionCurrent()) {
        HoldLive("Original selected-home acknowledgement or final actual target facts changed"); return;
      }
      live_active_ = false; cleanup_unknown_ = false;
      Finish("Actual UI transaction terminal accepted by the selected native owner; installation selection remains separate"); return;''')
edit('''  live_rollback_ = true; live_domain_ = dom_holds_.size(); live_action_ = LiveAction::kRestoreDomAttempt;''', '''  live_target_complete_ = false; completion_ack_.reset(); completion_fact_.reset();
  live_rollback_ = true; live_domain_ = dom_holds_.size(); live_action_ = LiveAction::kRestoreDomAttempt;''')
edit('void Controller::StartLive() {',(base/'methods.inc').read_text()+'\nvoid Controller::StartLive() {')
# An unexpected old callback cannot bypass native owner acknowledgement.
edit('''void Controller::Finish(std::string error) {
  if (live_active_''','''void Controller::Finish(std::string error) {
  if (live_target_complete_ && !completion_ack_) { HoldLive(std::move(error)); return; }
  if (live_active_''')
edit('void Controller::CleanupDomNext() {', '''void Controller::CleanupDomNext() {
  if (live_target_complete_ && (!completion_ack_ ||
      !completion_ack_->Matches(transfer_->generation, CompletionFingerprint()))) {
    cleanup_unknown_ = true; ReplyResult(); return;
  }''')
edit('''}  // namespace
void PrepareUiStorageMigration''','''}  // namespace migration_detail
using migration_detail::Controller;
using migration_detail::Find;
using migration_detail::Reply;
using migration_detail::Refused;
using migration_detail::kController;
'''+(base/'value-methods.inc').read_text()+'''
std::unique_ptr<UiStorageMigrationCompletion> TakeUiStorageMigrationCompletion(Profile* profile) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  auto* owner = Find(profile); return owner ? owner->TakeCompletion() : nullptr;
}
bool AcknowledgeUiStorageMigrationCompletion(Profile* profile, UiStorageMigrationOwnerAck acknowledgement) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  auto* owner = Find(profile); return owner && owner->AcknowledgeCompletion(std::move(acknowledgement));
}
void PrepareUiStorageMigration''')
output=base/'source/chrome/browser/aux/ui_storage_migration_controller.cc';output.parent.mkdir(parents=True,exist_ok=True);output.write_text(text)
sha=lambda x:hashlib.sha256(x).hexdigest()
header=base/'source/chrome/browser/aux/ui_storage_migration_completion.h'
plan={'format':'aux.native-ui-completion-fact.v1','files':[{'path':'chrome/browser/aux/ui_storage_migration_controller.cc','input':str(source),'inputSha256':sha(original.encode()),'output':str(output),'outputSha256':sha(text.encode()),'anchors':anchors},{'path':'chrome/browser/aux/ui_storage_migration_completion.h','input':None,'inputSha256':None,'output':str(header),'outputSha256':sha(header.read_bytes()),'anchors':[]}]}
(base/'source-plan.json').write_text(json.dumps(plan,indent=2)+'\n');print(len(anchors),len(text),sha(text.encode()),sha(header.read_bytes()))
