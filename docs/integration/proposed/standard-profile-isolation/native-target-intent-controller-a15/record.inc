// One immutable record over the existing authenticated finite journal channel.
// Exact pending frames and original upload survive unknown physical results.
struct IntentRecord {
  std::string payload, upload, journal, receipt, error;
  std::array<uint8_t, 32> digest{}, receipt_digest{};
  size_t offset = 0, read_offset = 0;
  int phase = 0;
  bool complete = false;
  std::vector<uint8_t> next;
};
bool IntentReceipt(const IntentRecord& t, std::string_view receipt) {
  auto parsed = base::JSONReader::ReadDict(receipt, base::JSON_PARSE_RFC);
  return parsed && Text(*parsed, "format", "aux.ui-storage.transaction-receipt.v1") &&
      Text(*parsed, "transactionId", t.journal) && Text(*parsed, "ordinal", "0") &&
      Text(*parsed, "kind", "pre-target-intent") && Text(*parsed, "phase", "unqualified-data") &&
      parsed->FindBool("qualified") == false && parsed->FindBool("activationAuthorized") == false &&
      Text(*parsed, "payloadSha256", base::HexEncodeLower(t.digest)) &&
      Text(*parsed, "intentSha256", base::HexEncodeLower(t.digest)) &&
      Text(*parsed, "previousRecordSha256", std::string(64, '0'));
}
void TransferIntentRecord(IntentRecord& t) {
  t.error.clear();
  if (t.complete) return;
  const auto journal = UuidBytes(t.journal), upload = UuidBytes(t.upload);
  if (journal.size() != 16 || upload.size() != 16 || t.payload.empty() || t.payload.size() > kCaptureLimit) {
    t.error = "Invalid retained native immutable intent descriptor"; return;
  }
  if (t.next.empty()) {
    if (t.phase == 0) {
      t.next = {7}; t.next.insert(t.next.end(), journal.begin(), journal.end());
      t.next.insert(t.next.end(), upload.begin(), upload.end()); Integer(t.next, 0, 4);
      t.next.push_back(1); t.next.insert(t.next.end(), 32, 0);
      t.next.insert(t.next.end(), t.digest.begin(), t.digest.end());
      Integer(t.next, t.payload.size(), 4); t.next.insert(t.next.end(), t.digest.begin(), t.digest.end());
    } else if (t.phase == 1 && t.offset < t.payload.size()) {
      const size_t count = std::min<size_t>(8192 - 21, t.payload.size() - t.offset);
      t.next = {8}; t.next.insert(t.next.end(), upload.begin(), upload.end()); Integer(t.next, t.offset, 4);
      const auto part = base::as_byte_span(t.payload).subspan(t.offset, count);
      t.next.insert(t.next.end(), part.begin(), part.end());
    } else if (t.phase <= 2) {
      t.phase = 2; t.next = {9}; t.next.insert(t.next.end(), upload.begin(), upload.end());
    } else if (t.phase == 3) {
      t.next = {10}; t.next.insert(t.next.end(), journal.begin(), journal.end()); Integer(t.next, 0, 4);
    } else {
      const size_t count = std::min<size_t>(8191, t.payload.size() - t.read_offset);
      t.next = {11}; t.next.insert(t.next.end(), journal.begin(), journal.end()); Integer(t.next, 0, 4);
      Integer(t.next, t.read_offset, 4); Integer(t.next, count, 4);
    }
  }
  auto result = peer::ExchangeNativeSelectedUiCaptureFrame(t.next);
  if (result.status != peer::DaemonAuthorityStatus::ready) {
    t.error = "Immutable intent transport outcome remains unacknowledged"; return;
  }
  const auto bytes = base::span(result.payload);
  if (bytes.size() > 8192) { t.error = "Immutable intent reply exceeds its bound"; return; }
  if (t.phase == 0) {
    if (bytes.size() != 5 || bytes.front() != 7 || IntegerAt(result.payload, 1, 4) > t.payload.size()) {
      t.error = "Invalid immutable intent Begin result"; return;
    }
    t.offset = IntegerAt(result.payload, 1, 4); t.phase = 1;
  } else if (t.phase == 1) {
    const size_t expected = t.offset + t.next.size() - 21;
    if (bytes.size() != 5 || bytes.front() != 8 || IntegerAt(result.payload, 1, 4) != expected) {
      t.error = "Invalid immutable intent Append result"; return;
    }
    t.offset = expected;
  } else if (t.phase == 2) {
    if (bytes.size() < 37 || bytes.front() != 9 || IntegerAt(result.payload, 33, 4) != bytes.size() - 37) {
      t.error = "Invalid immutable intent Persist result"; return;
    }
    const auto raw = bytes.subspan(37);
    t.receipt.assign(raw.begin(), raw.end());
    t.receipt_digest = Digest(t.receipt);
    if (!std::ranges::equal(bytes.subspan(1, 32), t.receipt_digest) || !IntentReceipt(t, t.receipt)) {
      t.error = "Immutable intent receipt does not match exact original descriptor"; return;
    }
    t.phase = 3;
  } else if (t.phase == 3) {
    if (bytes.size() < 42 || bytes.front() != 10 || IntegerAt(result.payload, 1, 4) != t.payload.size() ||
        bytes[5] != 1 || IntegerAt(result.payload, 38, 4) != bytes.size() - 42 ||
        !std::ranges::equal(bytes.subspan(6, 32), t.receipt_digest) ||
        !std::ranges::equal(bytes.subspan(42), base::as_byte_span(t.receipt))) {
      t.error = "Immutable intent fresh Load does not match persisted receipt"; return;
    }
    t.phase = 4;
  } else {
    const size_t count = std::min<size_t>(8191, t.payload.size() - t.read_offset);
    if (bytes.size() != count + 1 || bytes.front() != 11 ||
        !std::ranges::equal(bytes.subspan(1), base::as_byte_span(t.payload).subspan(t.read_offset, count))) {
      t.error = "Immutable intent exact payload readback differs"; return;
    }
    t.read_offset += count;
    if (t.read_offset == t.payload.size()) t.complete = true;
  }
  t.next.clear();
}
