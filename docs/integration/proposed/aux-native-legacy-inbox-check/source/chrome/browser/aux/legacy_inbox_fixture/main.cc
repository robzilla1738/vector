// Deferred actual-code fixture: compile with both production codec TUs.
#include "chrome/browser/notifications/aux_legacy_inbox_codec.h"
#include "chrome/browser/notifications/aux_inbox_codec.h"
#include "crypto/aead.h"
#include "crypto/hash.h"
#include <array>
#include <cstdlib>
#include <iostream>
#include <string>

void Check(bool condition) { if (!condition) std::abort(); }
int main() {
  std::array<uint8_t,32> old_key{}, new_key{}, wrong_key{};
  old_key.fill(0x21); new_key.fill(0x82); wrong_key.fill(0x19);
  const std::string plaintext = std::string("{\"body\":\"synthetic\"}") + std::string("\0binary",7);
  const std::string nonce(12, '\x37');
  crypto::Aead historical_writer(crypto::Aead::AES_256_GCM, old_key);
  std::string encrypted;
  Check(historical_writer.Seal(plaintext, nonce, std::string_view(), &encrypted));
  const std::string original = std::string("ASIDEAI1") + nonce + encrypted;
  using D = aux::LegacyInboxDecodeStatus;
  Check(aux::DecodeExplicitLegacyInboxV1(original,nullptr).status == D::legacyKeyRequired);
  auto decoded = aux::DecodeExplicitLegacyInboxV1(original,&old_key);
  Check(decoded.status == D::decoded && decoded.plaintext == plaintext);
  Check(aux::DecodeExplicitLegacyInboxV1(original,&wrong_key).status == D::authenticationFailedOrWrongKey);
  Check(aux::DecodeExplicitLegacyInboxV1("ASIDEAI1",&old_key).status == D::malformedLegacy);
  Check(aux::DecodeExplicitLegacyInboxV1("unknown",&old_key).status == D::notLegacy);
  for (size_t offset : {size_t(8), size_t(20), original.size()-1}) {
    auto tampered = original; tampered[offset] ^= 1;
    Check(aux::DecodeExplicitLegacyInboxV1(tampered,&old_key).status == D::authenticationFailedOrWrongKey);
  }
  using P = aux::LegacyInboxPreparationStatus;
  Check(aux::PrepareExplicitLegacyInboxV2Bytes(original,nullptr,&new_key).status == P::legacyKeyRequired);
  Check(aux::PrepareExplicitLegacyInboxV2Bytes(original,&old_key,nullptr).status == P::targetKeyRequired);
  auto prepared = aux::PrepareExplicitLegacyInboxV2Bytes(original,&old_key,&new_key);
  Check(prepared.status == P::prepared && prepared.bytes.has_value());
  const auto& bytes = *prepared.bytes;
  Check(bytes.original_ciphertext() == original);
  Check(bytes.original_sha256() == crypto::hash::Sha256(original));
  Check(bytes.replacement_sha256() == crypto::hash::Sha256(bytes.replacement_ciphertext()));
  Check(bytes.replacement_ciphertext().starts_with("AUXAI002"));
  Check(aux::OpenInboxV2(bytes.replacement_ciphertext(),new_key) == plaintext);
  Check(!aux::OpenInboxV2(original,new_key));
  Check(aux::DecodeExplicitLegacyInboxV1(bytes.replacement_ciphertext(),&old_key).status == D::notLegacy);
  Check(!aux::OpenInboxV2(bytes.replacement_ciphertext(),old_key));
  std::cout << "legacy explicit-key codec fixture passed\n";
}
