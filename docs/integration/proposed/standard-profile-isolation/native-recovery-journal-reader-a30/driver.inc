void Controller::BeginJournalScan() {
  if (!Current() || !Inventory(false)) { Finish("Actual native source changed before readonly discovery"); return; }
  journal_reader_ = std::make_unique<RecoveryJournalReader>();
  journal_reader_->generation = peer::InspectNativeBrowserShutdown().admitted_generation;
  if (!journal_reader_->generation) { Finish("Actual selected native generation unavailable"); return; }
  journal_scan_pending_ = true; recovery_mode_ = false; ScanJournalStep();
}
void Controller::ScanJournalStep() {
  if (!journal_reader_ || !Current() || !Inventory(false)) {
    JournalScanFailed("Actual Profile/documents changed during native journal discovery"); return;
  }
  journal_reader_->Step();  // One real bounded authenticated read-only IPC.
  if (!journal_reader_->error.empty()) { JournalScanFailed(journal_reader_->error); return; }
  if (journal_reader_->ready) {
    auto capture = base::JSONReader::ReadDict(journal_reader_->current.capture, base::JSON_PARSE_RFC);
    const auto* profile = capture ? capture->FindString("nativeProfileId") : nullptr;
    if (!capture || !profile) { JournalScanFailed("Original native capture scope is malformed"); return; }
    if (*profile == profile_id_) {
      if (!Text(*capture, "bindingEpoch", binding_) || !Text(*capture, "restoreEpoch", restoration_)) {
        JournalScanFailed("Historical native UI journal belongs to another Profile binding/restore epoch"); return;
      }
      const auto& data = journal_reader_->current;
      bool historical_terminal = false;
      if (!data.inventory.tailPresent && !data.records.empty() && data.records.back().summary.kind == 8) {
        auto terminal = base::JSONReader::ReadDict(data.records.back().payload, base::JSON_PARSE_RFC);
        historical_terminal = terminal && Text(*terminal, "format", "aux.ui-storage.native-transaction-observation.v1") &&
            terminal->FindBool("terminalAllTargetObserved") == true && terminal->FindBool("restoration") == false &&
            terminal->FindBool("qualified") == false && terminal->FindBool("activationAuthorized") == false &&
            !data.records.empty() && Text(*terminal, "intentSha256", base::HexEncodeLower(data.records.front().summary.payloadSHA));
      }
      // A complete historical target receipt is not current actor authority.
      // Skipping its old recovery still proceeds through a NEW actual capture,
      // writer closure and source/target proof on the current owned profile.
      if (!historical_terminal) {
        if (recovery_plan_) {
          JournalScanFailed("Multiple unresolved native profile journals require verified lineage; no latest-file guess"); return;
        }
        auto plan = DecodeRecoveryPlan(std::move(journal_reader_->current));
        if (!plan) {
          JournalScanFailed("Original verified capture/intent lacks complete current recovery facts; preserve original evidence"); return;
        }
        recovery_plan_ = std::move(plan);
      }
    }
    journal_reader_->Advance();
  }
  if (journal_reader_->done) {
    journal_scan_pending_ = false; recovery_mode_ = !!recovery_plan_;
    cursor_ = 0; PrepareNext(); return;
  }
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE,
      base::BindOnce(&Controller::ScanJournalStep, weak_.GetWeakPtr()));
}
void Controller::JournalScanFailed(std::string reason) {
  // Keep the original read frame/inventory and all unresolved evidence. A new
  // request cannot turn a missing/partial tail into no-write or clear custody.
  error_ = std::move(reason); journal_scan_pending_ = true; cleanup_unknown_ = true;
  ReplyResult();
}
