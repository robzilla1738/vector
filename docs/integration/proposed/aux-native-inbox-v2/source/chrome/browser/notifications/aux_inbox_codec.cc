#include "chrome/browser/notifications/aux_inbox_codec.h"
#include "base/containers/span.h"
#include "crypto/aead.h"
#include "crypto/random.h"
namespace aux {
namespace {
constexpr std::string_view kPrefix="AUXAI002";
// Compatibility detection only; actual historical key recovery is separate.
constexpr std::string_view kLegacyPrefix="ASIDEAI1";
constexpr size_t kNonceBytes=12;
constexpr size_t kTagBytes=16;
}
InboxEnvelope ClassifyInboxEnvelope(std::string_view record) {
  if(record.starts_with(kPrefix)) return InboxEnvelope::auxV2;
  if(record.starts_with(kLegacyPrefix)) return InboxEnvelope::legacyV1;
  return InboxEnvelope::unknown;
}
std::optional<std::string> SealInboxV2(std::string_view plaintext,
    const std::array<uint8_t,32>& key) {
  crypto::Aead aead(crypto::Aead::AES_256_GCM,key);
  if(aead.NonceLength()!=kNonceBytes) return std::nullopt;
  std::string nonce(kNonceBytes,'\0');
  crypto::RandBytes(base::as_writable_byte_span(nonce));
  std::string encrypted;
  if(!aead.Seal(plaintext,nonce,kPrefix,&encrypted)) return std::nullopt;
  return std::string(kPrefix)+nonce+encrypted;
}
std::optional<std::string> OpenInboxV2(std::string_view record,
    const std::array<uint8_t,32>& key) {
  if(ClassifyInboxEnvelope(record)!=InboxEnvelope::auxV2 ||
      record.size()<kPrefix.size()+kNonceBytes+kTagBytes) return std::nullopt;
  crypto::Aead aead(crypto::Aead::AES_256_GCM,key);
  if(aead.NonceLength()!=kNonceBytes) return std::nullopt;
  std::string plaintext;
  if(!aead.Open(record.substr(kPrefix.size()+kNonceBytes),
      record.substr(kPrefix.size(),kNonceBytes),kPrefix,&plaintext)) return std::nullopt;
  return plaintext;
}
}
