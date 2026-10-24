bool Controller::CompletionCurrent() {
  if (!live_active_ || !live_target_complete_ || live_source_complete_ || live_rollback_ ||
      live_pending_ || live_record_ || !live_terminal_written_ || live_records_.empty() ||
      !terminal_ordinal_ || live_records_.back()->ordinal != terminal_ordinal_ ||
      !live_records_.back()->complete || live_records_.back()->kind != 8 ||
      !LiveOwners(false) || !live_extension_target_ || !live_extension_synced_) return false;
  return std::ranges::all_of(dom_holds_, [](const auto& hold) {
    return hold.target_seen && !hold.mixed_seen && hold.published && !hold.pending && !hold.unknown &&
        hold.source->file_data_synced && hold.source->source_ready &&
        !hold.source->ordinary_work_queued && hold.source->target_topology_sha256.size() == 64 &&
        std::ranges::all_of(hold.source->maps, [](const auto& map) {
          return map->target_map_sha256.size() == 64 && (!map->allocation_requested || map->allocation_observed);
        });
  });
}
std::string Controller::CompletionFingerprint() const {
  if (!transfer_ || !intent_ || live_records_.empty()) return {};
  const auto& terminal = *live_records_.back();
  std::string bytes("aux.ui-storage.terminal-fact.v1"); bytes.push_back('\0');
  bytes.append(transfer_->journal); bytes.append(base::NumberToString(terminal.ordinal)); bytes.push_back('\0');
  bytes.append(base::HexEncodeLower(transfer_->digest)); bytes.append(base::HexEncodeLower(intent_->digest));
  bytes.append(base::HexEncodeLower(terminal.digest)); bytes.append(base::HexEncodeLower(terminal.receipt_digest));
  bytes.append(base::NumberToString(transfer_->generation)); bytes.push_back('\0');
  bytes.append(profile_id_); bytes.push_back('\0'); bytes.append(binding_); bytes.push_back('\0'); bytes.append(restoration_);
  return base::HexEncodeLower(Digest(bytes));
}
std::unique_ptr<UiStorageMigrationCompletion> Controller::TakeCompletion() {
  if (completion_taken_ || !CompletionCurrent()) return nullptr;
  const auto& terminal = *live_records_.back();
  const auto journal = UuidBytes(terminal.journal);
  if (journal.size() != 16) return nullptr;
  std::vector<uint8_t> frame{10}; frame.insert(frame.end(), journal.begin(), journal.end());
  Integer(frame, terminal.ordinal, 4);
  std::vector<uint8_t> expected{10}; Integer(expected, terminal.payload.size(), 4); expected.push_back(terminal.kind);
  expected.insert(expected.end(), terminal.receipt_digest.begin(), terminal.receipt_digest.end());
  Integer(expected, terminal.receipt.size(), 4); expected.insert(expected.end(), terminal.receipt.begin(), terminal.receipt.end());
  const auto fingerprint = CompletionFingerprint();
  if (fingerprint.size() != 64 || expected.size() > 8192) return nullptr;
  completion_taken_ = true;
  auto current = base::BindRepeating([](base::WeakPtr<Controller> owner, std::string expected_fingerprint) {
    return owner && owner->CompletionCurrent() && owner->CompletionFingerprint() == expected_fingerprint;
  }, weak_.GetWeakPtr(), fingerprint);
  return std::unique_ptr<UiStorageMigrationCompletion>(new UiStorageMigrationCompletion(
      transfer_->generation, fingerprint, std::move(frame), std::move(expected), std::move(current)));
}
bool Controller::AcknowledgeCompletion(UiStorageMigrationOwnerAck acknowledgement) {
  if (!completion_taken_ || completion_ack_ || !CompletionCurrent() ||
      !acknowledgement.Matches(transfer_->generation, CompletionFingerprint())) return false;
  completion_ack_.emplace(std::move(acknowledgement));
  busy_ = true;
  // The typed owner ACK is not enough by itself. Repeat actual worker, editor,
  // frontend, DOM/cache and current-store checks before opening any gate.
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE,
      base::BindOnce(&Controller::RunLive, weak_.GetWeakPtr()));
  return true;
}
