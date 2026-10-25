struct RecoveryRecordData {
  ui_journal::RecordSummary summary;
  std::string payload, receipt;
};
struct RecoveryJournalData {
  ui_journal::Uuid journal{};
  std::string journal_id, capture, capture_receipt;
  std::array<uint8_t, 32> capture_digest{};
  uint64_t source_generation = 0;
  ui_journal::Inventory inventory;
  std::vector<RecoveryRecordData> records;
};
std::string JournalUuidText(const ui_journal::Uuid& id) {
  std::string text = base::HexEncodeLower(id);
  for (const size_t at : {size_t{8}, size_t{13}, size_t{18}, size_t{23}}) text.insert(at, 1, '-');
  return CanonicalUuid(text) ? text : std::string();
}
// Data reader only. Actual Controller invokes each single RPC after checking its
// genuine current Profile/document inventory. No payload chooses that owner.
struct RecoveryJournalReader {
  uint64_t generation = 0;
  int phase = 0;
  size_t cursor = 0, offset = 0, record_index = 0, record_total = 0;
  uint32_t capture_bytes = 0, record_bytes = 0;
  bool ready = false, done = false;
  std::string error;
  std::vector<ui_journal::Uuid> journals;
  std::vector<uint8_t> next;
  RecoveryJournalData current;
  RecoveryRecordData record;
  void Advance() {
    ready = false; current = RecoveryJournalData(); record = RecoveryRecordData();
    capture_bytes = 0; record_bytes = 0; offset = 0; record_index = 0; record_total = 0;
    ++cursor; phase = 1; if (cursor == journals.size()) done = true;
  }
  bool Receipt(const ui_journal::SelectedRecord& selected) const {
    auto value = base::JSONReader::ReadDict(selected.receiptJSON, base::JSON_PARSE_RFC);
    if (!value || !Text(*value, "format", "aux.ui-storage.transaction-receipt.v1") ||
        !Text(*value, "transactionId", current.journal_id) ||
        !Text(*value, "ordinal", base::NumberToString(selected.ordinal)) || selected.kind < 1 || selected.kind > 8 ||
        !Text(*value, "kind", kRecordKinds[selected.kind - 1]) ||
        !Text(*value, "phase", "unqualified-data") || value->FindBool("qualified") != false ||
        value->FindBool("activationAuthorized") != false ||
        !Text(*value, "payloadSha256", base::HexEncodeLower(current.inventory.records[record_index].payloadSHA)) ||
        !Text(*value, "intentSha256", base::HexEncodeLower(current.inventory.records.front().payloadSHA))) return false;
    const std::array<uint8_t, 32> zero{};
    return Text(*value, "previousRecordSha256", base::HexEncodeLower(
        record_index ? current.inventory.records[record_index - 1].receiptSHA : zero));
  }
  void Step() {
    if (done || ready) return;
    error.clear();
    if (next.empty()) {
      if (phase == 0) next = {4};
      else if (phase == 1) {
        if (cursor >= journals.size()) { done = true; return; }
        current.journal = journals[cursor]; current.journal_id = JournalUuidText(current.journal);
        next = {5}; next.insert(next.end(), current.journal.begin(), current.journal.end());
      } else if (phase == 2) {
        const size_t count = std::min<size_t>(8191, capture_bytes - offset);
        next = {6}; next.insert(next.end(), current.journal.begin(), current.journal.end());
        Integer(next, offset, 4); Integer(next, count, 4);
      } else if (phase == 3) {
        auto frame = ui_journal::MakeInventoryRequest(current.journal);
        if (!frame) { error = "Invalid native journal inventory request"; return; } next = std::move(*frame);
      } else if (phase == 4) {
        auto frame = ui_journal::MakeSelectRequest(current.journal, current.inventory, static_cast<uint32_t>(record_index));
        if (!frame) { error = "Original verified prefix ordinal unavailable"; return; } next = std::move(*frame);
      } else {
        const uint32_t count = std::min<uint32_t>(8191, record_bytes - static_cast<uint32_t>(offset));
        auto frame = ui_journal::MakePayloadReadRequest(current.journal, static_cast<uint32_t>(record_index), static_cast<uint32_t>(offset), count, record_bytes);
        if (!frame) { error = "Original selected record read is out of bounds"; return; } next = std::move(*frame);
      }
    }
    auto result = peer::ExchangeNativeSelectedUiCaptureFrame(next);
    if (result.status != peer::DaemonAuthorityStatus::ready) {
      error = "Original read-only journal frame remains unacknowledged"; return;
    }
    const auto bytes = base::span(result.payload);
    if (bytes.size() > 8192) { error = "Native journal reply exceeds bound"; return; }
    if (phase == 0) {
      if (bytes.size() < 5 || bytes.front() != 4 || IntegerAt(result.payload, 1, 4) > 256 ||
          bytes.size() != 5 + IntegerAt(result.payload, 1, 4) * 16) { error = "Invalid actual native journal discovery"; return; }
      std::set<std::string> unique;
      auto ids = bytes.subspan<5>();
      while (!ids.empty()) {
        ui_journal::Uuid id{}; base::span(id).copy_from(ids.first<16>()); ids = ids.subspan<16>();
        const auto text = JournalUuidText(id);
        if (text.empty() || !unique.insert(text).second) { error = "Ambiguous discovered native journal UUID"; return; }
        journals.push_back(id);
      }
      phase = 1; done = journals.empty();
    } else if (phase == 1) {
      if (bytes.size() < 57 || bytes.front() != 5 || !IntegerAt(result.payload, 1, 4) ||
          IntegerAt(result.payload, 1, 4) > kCaptureLimit || !IntegerAt(result.payload, 5, 8) ||
          IntegerAt(result.payload, 13, 8) != generation || IntegerAt(result.payload, 53, 4) != bytes.size() - 57) {
        error = "Actual native capture Load is unqualified/unknown"; return;
      }
      capture_bytes = IntegerAt(result.payload, 1, 4); current.source_generation = IntegerAt(result.payload, 5, 8);
      base::span(current.capture_digest).copy_from(bytes.subspan<21, 32>());
      const auto receipt = bytes.subspan<57>(); current.capture_receipt.assign(receipt.begin(), receipt.end());
      auto parsed = base::JSONReader::ReadDict(current.capture_receipt, base::JSON_PARSE_RFC);
      if (!parsed || !Text(*parsed, "format", "aux.ui-storage.capture-receipt.v1") ||
          !Text(*parsed, "transactionId", current.journal_id) ||
          !Text(*parsed, "captureSha256", base::HexEncodeLower(current.capture_digest)) ||
          !Text(*parsed, "phase", "captured-unqualified") || parsed->FindBool("activationAuthorized") != false) {
        error = "Actual native capture receipt binding is invalid"; return;
      }
      offset = 0; current.capture.reserve(capture_bytes); phase = 2;
    } else if (phase == 2) {
      const size_t count = std::min<size_t>(8191, capture_bytes - offset);
      if (bytes.size() != count + 1 || bytes.front() != 6) { error = "Native capture chunk mismatch"; return; }
      const auto part = bytes.subspan<1>(); current.capture.append(part.begin(), part.end()); offset += count;
      if (offset == capture_bytes) {
        if (Digest(current.capture) != current.capture_digest) { error = "Native capture payload SHA mismatch"; return; }
        phase = 3;
      }
    } else if (phase == 3) {
      auto inventory = ui_journal::ParseInventoryReply(bytes);
      if (!inventory || inventory->sourceGeneration != current.source_generation || inventory->currentGeneration != generation) {
        error = "Actual journal inventory/root generation changed"; return;
      }
      current.inventory = std::move(*inventory); record_index = 0; record_total = 0;
      ready = current.inventory.records.empty(); phase = 4;
    } else if (phase == 4) {
      auto selected = ui_journal::ParseSelectedReply(bytes, current.inventory, static_cast<uint32_t>(record_index));
      if (!selected || !Receipt(*selected) || selected->payloadBytes > kCaptureLimit - record_total) {
        error = "Verified native prefix receipt/intent/chain mismatch"; return;
      }
      record = RecoveryRecordData(); record.summary = current.inventory.records[record_index];
      record.receipt = std::move(selected->receiptJSON); record_bytes = selected->payloadBytes;
      record.payload.reserve(record_bytes); offset = 0; phase = 5;
    } else {
      const size_t count = std::min<size_t>(8191, record_bytes - static_cast<uint32_t>(offset));
      if (bytes.size() != count + 1 || bytes.front() != 11) { error = "Original selected record chunk mismatch"; return; }
      const auto part = bytes.subspan<1>(); record.payload.append(part.begin(), part.end()); offset += count;
      if (offset == record_bytes) {
        if (Digest(record.payload) != record.summary.payloadSHA) { error = "Verified native record payload SHA mismatch"; return; }
        record_total += record_bytes; current.records.push_back(std::move(record));
        ++record_index; ready = record_index == current.inventory.records.size(); phase = 4;
      }
    }
    next.clear();
  }
};
