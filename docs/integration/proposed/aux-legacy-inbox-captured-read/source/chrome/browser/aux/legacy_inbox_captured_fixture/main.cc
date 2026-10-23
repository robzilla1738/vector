// Deferred pure captured-observation fixture; no Security functions called.
#include "chrome/browser/notifications/aux_legacy_inbox_captured_read.h"
#include "base/base64.h"
#include "crypto/aead.h"
#include <Security/SecBase.h>
#include <array>
#include <cstdlib>
#include <string>
void Check(bool value) { if (!value) std::abort(); }
int main() {
  std::array<uint8_t,32> original{}, wrong{}; original.fill(0x42); wrong.fill(0x31);
  crypto::Aead writer(crypto::Aead::AES_256_GCM,original);
  std::string encrypted, nonce(12,'n');
  Check(writer.Seal("captured synthetic backup",nonce,std::string_view(),&encrypted));
  const auto record = std::string("ASIDEAI1") + nonce + encrypted;
  using S=aux::CapturedLegacyInboxDecodeStatus;
  using K=aux::CapturedLegacyInboxKeyRead::ValueKind;
  auto call=[&](int32_t status,K kind,const std::string& bytes) {
    return aux::DecodeLegacyInboxFromCapturedKeyRead(record,{status,kind,bytes});
  };
  Check(call(errSecItemNotFound,K::none,{}).status==S::keyMissing);
  auto locked=call(errSecInteractionNotAllowed,K::none,{});
  Check(locked.status==S::keyUnavailable && locked.unavailable_status==errSecInteractionNotAllowed);
  Check(call(errSecSuccess,K::other,{}).status==S::malformedKey);
  Check(call(errSecSuccess,K::data,"not base64").status==S::malformedKey);
  auto encoded=base::Base64Encode(original);
  Check(call(errSecSuccess,K::data,encoded+"\n").status==S::malformedKey);
  Check(call(errSecSuccess,K::data,base::Base64Encode(wrong)).status==S::authenticationFailedOrWrongKey);
  auto valid=call(errSecSuccess,K::data,encoded);
  Check(valid.status==S::decoded && valid.plaintext=="captured synthetic backup" && !valid.unavailable_status);
  // Inaccessibility never substitutes another key or poisons a later capture.
  Check(call(errSecInteractionNotAllowed,K::none,{}).status==S::keyUnavailable);
  Check(call(errSecSuccess,K::data,encoded).status==S::decoded);
  Check(aux::DecodeLegacyInboxFromCapturedKeyRead("ASIDEAI1",{errSecSuccess,K::data,encoded}).status==S::malformedEnvelope);
  Check(aux::DecodeLegacyInboxFromCapturedKeyRead("AUXAI002",{errSecSuccess,K::data,encoded}).status==S::notLegacy);
}
