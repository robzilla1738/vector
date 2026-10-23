// Actual codec and Chromium crypto only; synthetic bytes, no profile/storage.
#include <array>
#include <cstdio>
#include <string>
#include <string_view>

#include "base/check.h"
#include "base/containers/span.h"
#include "chrome/browser/notifications/aux_inbox_codec.h"
#include "crypto/hash.h"
#include "crypto/kdf.h"

namespace {
size_t checks = 0;
void Expect(bool result) {
  CHECK(result);
  ++checks;
}
}  // namespace

int main() {
  std::array<uint8_t, 32> root;
  for (size_t i = 0; i < root.size(); ++i)
    root[i] = static_cast<uint8_t>(i);
  constexpr std::string_view info = "aux.agent-inbox.master-key.v2";
  const auto key = crypto::kdf::Hkdf<32>(crypto::hash::kSha256, root, {},
                                      base::as_byte_span(info));
  // RFC5869 independent Python hmac/hashlib vector pinned by root proposal.
  constexpr std::array<uint8_t, 32> expected = {
      0x56, 0x66, 0xac, 0x7f, 0x86, 0xa8, 0x8f, 0xfa,
      0xea, 0x84, 0x26, 0x99, 0xae, 0x97, 0x2e, 0x27,
      0x0a, 0x0a, 0x97, 0xd1, 0xeb, 0x94, 0xb8, 0x15,
      0x71, 0x13, 0x95, 0xc8, 0x64, 0x29, 0xd0, 0x03};
  Expect(key == expected);
  std::string plaintext("notification\0binary\xff", 20);
  const auto record = aux::SealInboxV2(plaintext, key);
  Expect(record.has_value());
  Expect(record->size() == 8 + 12 + plaintext.size() + 16);
  Expect(aux::ClassifyInboxEnvelope(*record) == aux::InboxEnvelope::auxV2);
  Expect(aux::OpenInboxV2(*record, key) == plaintext);
  const auto empty = aux::SealInboxV2({}, key);
  Expect(empty.has_value());
  Expect(aux::OpenInboxV2(*empty, key) == std::string());
  auto other_key = key;
  other_key[0] ^= 1;
  Expect(!aux::OpenInboxV2(*record, other_key));
  // Every byte: version, nonce, ciphertext and tag must resist alteration.
  for (size_t i = 0; i < record->size(); ++i) {
    auto changed = *record;
    changed[i] ^= 1;
    Expect(!aux::OpenInboxV2(changed, key));
  }
  for (size_t length = 0; length < record->size(); ++length)
    Expect(!aux::OpenInboxV2(std::string_view(*record).substr(0, length), key));
  auto legacy = *record;
  legacy.replace(0, 8, "ASIDEAI1");
  Expect(aux::ClassifyInboxEnvelope(legacy) == aux::InboxEnvelope::legacyV1);
  Expect(!aux::OpenInboxV2(legacy, key));
  auto unknown = *record;
  unknown.replace(0, 8, "AUXAI003");
  Expect(aux::ClassifyInboxEnvelope(unknown) == aux::InboxEnvelope::unknown);
  Expect(!aux::OpenInboxV2(unknown, key));
  auto extra = *record + "x";
  Expect(!aux::OpenInboxV2(extra, key));
  std::printf("PASS:%zu actual codec/HKDF synthetic checks; no storage, caller or authority execution\n", checks);
  return 0;
}
