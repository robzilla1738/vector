// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#include "chrome/browser/ui/aux/native_disposable_model_credential_backend.h"
#import <Security/Security.h>
#import <LocalAuthentication/LocalAuthentication.h>
#include <string>
#include <utility>
#include "base/check.h"
#include "base/check_op.h"
namespace aux {
namespace {
constexpr char kAccount[] = "modelKey-openai-compatible";
constexpr char kSyntheticKey[] = "aux-disposable-loopback-appearance-synthetic-key-v1";
base::apple::ScopedCFTypeRef<CFStringRef> String(const std::string& value) {
  return base::apple::ScopedCFTypeRef<CFStringRef>(CFStringCreateWithCString(
      kCFAllocatorDefault, value.c_str(), kCFStringEncodingUTF8));
}
bool EqualField(CFDictionaryRef dictionary, CFStringRef key, CFTypeRef expected) {
  auto* const actual = CFDictionaryGetValue(dictionary, key);
  return actual && expected && CFEqual(actual, expected);
}
}  // namespace
NativeDisposableModelCredentialBackend::Security::~Security() = default;
class NativeDisposableModelCredentialBackend::SystemSecurity final : public Security {
 public:
  int32_t Copy(CFDictionaryRef query, CFTypeRef* result) override {
    return SecItemCopyMatching(query, result);
  }
  int32_t Add(CFDictionaryRef query, CFTypeRef* result) override {
    return SecItemAdd(query, result);
  }
  int32_t Delete(CFDictionaryRef query) override { return SecItemDelete(query); }
};
NativeDisposableModelCredentialBackend::NativeDisposableModelCredentialBackend(
    base::FilePath original_profile, base::RepeatingCallback<bool()> current,
    std::unique_ptr<Security> security, std::string original_creation_witness)
    : original_profile_(std::move(original_profile)),
      original_profile_current_(std::move(current)), security_(std::move(security)) {
  CHECK(security_);
  CHECK_EQ(original_creation_witness.size(), 64u);
  CHECK_EQ(original_creation_witness.find_first_not_of("0123456789abcdef"), std::string::npos);
  creation_witness_.reset(CFDataCreate(kCFAllocatorDefault,
      reinterpret_cast<const UInt8*>(original_creation_witness.data()), original_creation_witness.size()));
}
NativeDisposableModelCredentialBackend::~NativeDisposableModelCredentialBackend() = default;
std::unique_ptr<NativeDisposableModelCredentialBackend>
NativeDisposableModelCredentialBackend::ForOriginalProfile(
    base::FilePath profile, base::RepeatingCallback<bool()> current,
    std::string original_creation_witness) {
  if (original_creation_witness.size() != 64 ||
      original_creation_witness.find_first_not_of("0123456789abcdef") != std::string::npos) return nullptr;
  return std::unique_ptr<NativeDisposableModelCredentialBackend>(
      new NativeDisposableModelCredentialBackend(std::move(profile),
          std::move(current), std::make_unique<SystemSecurity>(), std::move(original_creation_witness)));
}
bool NativeDisposableModelCredentialBackend::ProfileCurrent() {
  if (profile_retired_ || profile_checking_ || original_profile_.empty() ||
      original_profile_current_.is_null())
    return false;
  profile_checking_ = true;
  auto original_current = original_profile_current_;
  auto weak = weak_factory_.GetWeakPtr();
  const bool current = original_current.Run();
  if (!weak) return false;
  profile_checking_ = false;
  if (!current) profile_retired_ = true;
  return !profile_retired_;
}
base::apple::ScopedCFTypeRef<CFMutableDictionaryRef>
NativeDisposableModelCredentialBackend::FixedQuery() const {
  base::apple::ScopedCFTypeRef<CFMutableDictionaryRef> query(CFDictionaryCreateMutable(
      kCFAllocatorDefault, 0, &kCFTypeDictionaryKeyCallBacks, &kCFTypeDictionaryValueCallBacks));
  auto service = String("dev.aux.browser:" + original_profile_.AsUTF8Unsafe());
  auto account = String(kAccount);
  if (!query || !service || !account) return base::apple::ScopedCFTypeRef<CFMutableDictionaryRef>();
  CFDictionarySetValue(query.get(), kSecClass, kSecClassGenericPassword);
  CFDictionarySetValue(query.get(), kSecAttrService, service.get());
  CFDictionarySetValue(query.get(), kSecAttrAccount, account.get());
  CFDictionarySetValue(query.get(), kSecAttrSynchronizable, kCFBooleanFalse);
  // Failure, not interaction or authentication, is the only fixture behavior.
  LAContext* context = [[LAContext alloc] init];
  context.interactionNotAllowed = YES;
  CFDictionarySetValue(query.get(), kSecUseAuthenticationContext,
      (__bridge CFTypeRef)context);
  return query;
}
NativeDisposableModelCredentialBackend::Item
NativeDisposableModelCredentialBackend::ObserveAccount() {
  auto query = FixedQuery();
  if (!query) return Item::kUnavailable;
  CFDictionarySetValue(query.get(), kSecReturnAttributes, kCFBooleanTrue);
  CFDictionarySetValue(query.get(), kSecReturnPersistentRef, kCFBooleanTrue);
  CFDictionarySetValue(query.get(), kSecMatchLimit, kSecMatchLimitOne);
  CFTypeRef result = nullptr;
  auto security = security_;
  auto weak = weak_factory_.GetWeakPtr();
  const auto status = security->Copy(query.get(), &result);
  base::apple::ScopedCFTypeRef<CFTypeRef> owned(result);
  if (!weak) return Item::kUnavailable;
  if (!ProfileCurrent()) return Item::kUnavailable;
  if (status == errSecItemNotFound) return Item::kAbsent;
  if (status != errSecSuccess) return Item::kUnavailable;
  return persistent_ref_ && MatchesOriginal(result) ? Item::kOriginal : Item::kForeign;
}
bool NativeDisposableModelCredentialBackend::MatchesOriginal(CFTypeRef result) const {
  if (!result || CFGetTypeID(result) != CFDictionaryGetTypeID()) return false;
  auto dictionary = static_cast<CFDictionaryRef>(result);
  auto service = String("dev.aux.browser:" + original_profile_.AsUTF8Unsafe());
  auto account = String(kAccount);
  return EqualField(dictionary, kSecAttrService, service.get()) &&
      EqualField(dictionary, kSecAttrAccount, account.get()) &&
      EqualField(dictionary, kSecAttrGeneric, creation_witness_.get()) &&
      EqualField(dictionary, kSecValuePersistentRef, persistent_ref_.get());
}
NativeDisposableModelCredentialBackend::Item
NativeDisposableModelCredentialBackend::ObserveOriginal() {
  if (!ProfileCurrent()) return Item::kUnavailable;
  if (!persistent_ref_) {
    auto weak = weak_factory_.GetWeakPtr();
    const auto result = ObserveAccount();
    if (!weak) return Item::kUnavailable;
    if (!add_attempted_ && result == Item::kAbsent) absence_observed_ = true;
    return add_attempted_ ? Item::kUnavailable : result;
  }
  auto query = FixedQuery();
  if (!query) return Item::kUnavailable;
  const void* original = persistent_ref_.get();
  base::apple::ScopedCFTypeRef<CFArrayRef> items(CFArrayCreate(
      kCFAllocatorDefault, &original, 1, &kCFTypeArrayCallBacks));
  if (!items) return Item::kUnavailable;
  CFDictionarySetValue(query.get(), kSecMatchItemList, items.get());
  CFDictionarySetValue(query.get(), kSecReturnAttributes, kCFBooleanTrue);
  CFDictionarySetValue(query.get(), kSecReturnPersistentRef, kCFBooleanTrue);
  CFDictionarySetValue(query.get(), kSecMatchLimit, kSecMatchLimitOne);
  CFTypeRef result = nullptr;
  auto security = security_;
  auto weak = weak_factory_.GetWeakPtr();
  const auto status = security->Copy(query.get(), &result);
  base::apple::ScopedCFTypeRef<CFTypeRef> owned(result);
  if (!weak) return Item::kUnavailable;
  if (!ProfileCurrent()) return Item::kUnavailable;
  if (status == errSecItemNotFound) return ObserveAccount();
  if (status != errSecSuccess) return Item::kUnavailable;
  return MatchesOriginal(result) ? Item::kOriginal : Item::kForeign;
}
NativeDisposableModelCredentialBackend::Write
NativeDisposableModelCredentialBackend::AddFixedOriginal() {
  if (!ProfileCurrent() || !absence_observed_ || add_attempted_ || !creation_witness_)
    return Write::kNoWrite;
  add_attempted_ = true;
  auto query = FixedQuery();
  if (!query) return Write::kNoWrite;
  base::apple::ScopedCFTypeRef<CFDataRef> value(CFDataCreate(kCFAllocatorDefault,
      reinterpret_cast<const UInt8*>(kSyntheticKey), sizeof(kSyntheticKey) - 1));
  if (!value) return Write::kNoWrite;
  CFDictionarySetValue(query.get(), kSecAttrGeneric, creation_witness_.get());
  CFDictionarySetValue(query.get(), kSecValueData, value.get());
  CFDictionarySetValue(query.get(), kSecReturnPersistentRef, kCFBooleanTrue);
  CFTypeRef result = nullptr;
  auto security = security_;
  auto weak = weak_factory_.GetWeakPtr();
  const auto status = security->Add(query.get(), &result);
  base::apple::ScopedCFTypeRef<CFTypeRef> owned(result);
  if (!weak) return Write::kUncertain;
  if (status == errSecDuplicateItem) return Write::kNoWrite;
  if (status != errSecSuccess || !result || CFGetTypeID(result) != CFDataGetTypeID() ||
      CFDataGetLength(static_cast<CFDataRef>(result)) <= 0) return Write::kUncertain;
  persistent_ref_.reset(static_cast<CFDataRef>(CFRetain(result)));
  return ObserveOriginal() == Item::kOriginal ? Write::kOriginalSaved : Write::kUncertain;
}
NativeDisposableModelCredentialBackend::Item
NativeDisposableModelCredentialBackend::RemoveOriginal() {
  if (!ProfileCurrent() || !persistent_ref_) return Item::kUnavailable;
  auto weak = weak_factory_.GetWeakPtr();
  const auto observed = ObserveOriginal();
  if (!weak) return Item::kUnavailable;
  if (observed != Item::kOriginal) return observed;
  auto query = FixedQuery();
  if (!query || !ProfileCurrent()) return Item::kUnavailable;
  const void* original = persistent_ref_.get();
  base::apple::ScopedCFTypeRef<CFArrayRef> items(CFArrayCreate(
      kCFAllocatorDefault, &original, 1, &kCFTypeArrayCallBacks));
  if (!items) return Item::kUnavailable;
  CFDictionarySetValue(query.get(), kSecMatchItemList, items.get());
  CFDictionarySetValue(query.get(), kSecAttrGeneric, creation_witness_.get());
  auto security = security_;
  const auto status = security->Delete(query.get());
  if (!weak) return Item::kUnavailable;
  if (!ProfileCurrent()) return Item::kUnavailable;
  if (status != errSecSuccess && status != errSecItemNotFound) return Item::kUnavailable;
  return ObserveOriginal();
}
}  // namespace aux
