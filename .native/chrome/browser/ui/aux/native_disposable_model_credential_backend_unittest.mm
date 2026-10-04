// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#include "chrome/browser/ui/aux/native_disposable_model_credential_backend.h"
#import <Security/Security.h>
#import <LocalAuthentication/LocalAuthentication.h>
#include <memory>
#include <string>
#include <utility>
#include <vector>
#include "base/functional/bind.h"
#include "testing/gtest/include/gtest/gtest.h"
namespace aux {
class NativeDisposableModelCredentialBackendTestPeer {
 public:
  using Backend = NativeDisposableModelCredentialBackend;
  using Item = Backend::Item;
  using Write = Backend::Write;
  struct Store {
    bool present = false;
    bool locked = false;
    bool lose_returned_ref = false;
    bool foreign_ref = false;
    bool foreign_marker = false;
    int32_t add_status = errSecSuccess;
    int32_t delete_status = errSecSuccess;
    int adds = 0;
    int deletes = 0;
    base::OnceClosure on_copy;
    base::OnceClosure on_add;
    base::OnceClosure on_delete;
    base::apple::ScopedCFTypeRef<CFDictionaryRef> created;
    std::vector<base::apple::ScopedCFTypeRef<CFDictionaryRef>> copies;
    base::apple::ScopedCFTypeRef<CFDictionaryRef> deletion;
  };
  static base::apple::ScopedCFTypeRef<CFDataRef> Reference(bool foreign) {
    const UInt8 value = foreign ? 2 : 1;
    return base::apple::ScopedCFTypeRef<CFDataRef>(
        CFDataCreate(kCFAllocatorDefault, &value, 1));
  }
  class MockSecurity : public Backend::Security {
   public:
    explicit MockSecurity(std::shared_ptr<Store> store) : store_(std::move(store)) {}
    int32_t Copy(CFDictionaryRef query, CFTypeRef* result) override {
      store_->copies.emplace_back(CFDictionaryCreateCopy(kCFAllocatorDefault, query));
      if (store_->on_copy) std::move(store_->on_copy).Run();
      EXPECT_FALSE(CFDictionaryContainsKey(query, kSecReturnData));
      auto* const attributes_requested = CFDictionaryGetValue(query, kSecReturnAttributes);
      EXPECT_TRUE(attributes_requested && CFEqual(attributes_requested, kCFBooleanTrue));
      auto* const context = CFDictionaryGetValue(query, kSecUseAuthenticationContext);
      EXPECT_TRUE(context && [(__bridge LAContext*)context interactionNotAllowed]);
      if (store_->locked) return errSecInteractionNotAllowed;
      if (!store_->present) return errSecItemNotFound;
      auto reference = Reference(store_->foreign_ref);
      const auto items = static_cast<CFArrayRef>(CFDictionaryGetValue(query, kSecMatchItemList));
      if (items) EXPECT_EQ(CFArrayGetCount(items), 1);
      auto* const requested = items ? CFArrayGetValueAtIndex(items, 0) : nullptr;
      if (requested && !CFEqual(requested, reference.get())) return errSecItemNotFound;
      auto attributes = CFDictionaryCreateMutable(kCFAllocatorDefault, 0,
          &kCFTypeDictionaryKeyCallBacks, &kCFTypeDictionaryValueCallBacks);
      for (const auto key : {kSecAttrService, kSecAttrAccount})
        CFDictionarySetValue(attributes, key, CFDictionaryGetValue(query, key));
      CFDictionarySetValue(attributes, kSecValuePersistentRef, reference.get());
      if (store_->created && !store_->foreign_marker)
        CFDictionarySetValue(attributes, kSecAttrGeneric,
            CFDictionaryGetValue(store_->created.get(), kSecAttrGeneric));
      *result = attributes;
      return errSecSuccess;
    }
    int32_t Add(CFDictionaryRef query, CFTypeRef* result) override {
      ++store_->adds;
      if (store_->on_add) std::move(store_->on_add).Run();
      if (store_->present) return errSecDuplicateItem;
      if (store_->add_status != errSecSuccess) return store_->add_status;
      store_->created.reset(CFDictionaryCreateCopy(kCFAllocatorDefault, query));
      store_->present = true;
      if (!store_->lose_returned_ref) *result = Reference(false).release();
      return errSecSuccess;
    }
    int32_t Delete(CFDictionaryRef query) override {
      ++store_->deletes;
      if (store_->on_delete) std::move(store_->on_delete).Run();
      store_->deletion.reset(CFDictionaryCreateCopy(kCFAllocatorDefault, query));
      EXPECT_TRUE(CFDictionaryContainsKey(query, kSecMatchItemList));
      EXPECT_FALSE(CFDictionaryContainsKey(query, kSecValuePersistentRef));
      EXPECT_TRUE(CFDictionaryContainsKey(query, kSecAttrGeneric));
      EXPECT_FALSE(CFDictionaryContainsKey(query, kSecReturnData));
      if (store_->delete_status != errSecSuccess) return store_->delete_status;
      if (store_->foreign_ref || store_->foreign_marker) return errSecItemNotFound;
      store_->present = false;
      return errSecSuccess;
    }
   private:
    std::shared_ptr<Store> store_;
  };
  static std::unique_ptr<Backend> CreateWithCheck(
      std::shared_ptr<Store> store, base::RepeatingCallback<bool()> current) {
    return std::unique_ptr<Backend>(new Backend(
        base::FilePath("/tmp/aux-native-journey-mock/profile/Default"),
        std::move(current), std::make_unique<MockSecurity>(std::move(store)), std::string(64, 'd')));
  }
  static std::unique_ptr<Backend> Create(std::shared_ptr<Store> store, bool* current) {
    return std::unique_ptr<Backend>(new Backend(
        base::FilePath("/tmp/aux-native-journey-mock/profile/Default"),
        base::BindRepeating([](bool* owner) { return *owner; }, current),
        std::make_unique<MockSecurity>(std::move(store)), std::string(64, 'd')));
  }
};
namespace {
using Peer = NativeDisposableModelCredentialBackendTestPeer;
class DisposableModelCredentialBackendTest : public testing::Test {
 protected:
  std::shared_ptr<Peer::Store> store_ = std::make_shared<Peer::Store>();
  bool current_ = true;
  std::unique_ptr<Peer::Backend> backend_ = Peer::Create(store_, &current_);
};
TEST_F(DisposableModelCredentialBackendTest, OriginalOwnerCallbackDestructionRefusesBeforeSecurity) {
  backend_ = Peer::CreateWithCheck(store_, base::BindRepeating(
      [](std::unique_ptr<Peer::Backend>* original) {
        original->reset();
        return true;
      }, &backend_));
  auto* original = backend_.get();
  EXPECT_EQ(original->ObserveOriginal(), Peer::Item::kUnavailable);
  EXPECT_FALSE(backend_);
  EXPECT_TRUE(store_->copies.empty());
  EXPECT_EQ(store_->adds, 0);
  EXPECT_EQ(store_->deletes, 0);
}
TEST_F(DisposableModelCredentialBackendTest, RecursiveOwnerCheckCannotEnterSecurity) {
  backend_ = Peer::CreateWithCheck(store_, base::BindRepeating(
      [](std::unique_ptr<Peer::Backend>* original) {
        EXPECT_EQ((*original)->ObserveOriginal(), Peer::Item::kUnavailable);
        return true;
      }, &backend_));
  EXPECT_EQ(backend_->ObserveOriginal(), Peer::Item::kAbsent);
  EXPECT_EQ(store_->copies.size(), 1u);
  EXPECT_EQ(store_->adds, 0);
  EXPECT_EQ(store_->deletes, 0);
}
TEST_F(DisposableModelCredentialBackendTest, CopyDestructionRefusesWithoutReplacementAuthority) {
  store_->on_copy = base::BindOnce([](std::unique_ptr<Peer::Backend>* backend) {
    backend->reset();
  }, &backend_);
  auto* original = backend_.get();
  EXPECT_EQ(original->ObserveOriginal(), Peer::Item::kUnavailable);
  EXPECT_FALSE(backend_);
  EXPECT_EQ(store_->copies.size(), 1u);
  EXPECT_EQ(store_->adds, 0);
  EXPECT_EQ(store_->deletes, 0);
}
TEST_F(DisposableModelCredentialBackendTest, AddDestructionRetainsUncertainWriteDebt) {
  ASSERT_EQ(backend_->ObserveOriginal(), Peer::Item::kAbsent);
  store_->on_add = base::BindOnce([](std::unique_ptr<Peer::Backend>* backend) {
    backend->reset();
  }, &backend_);
  auto* original = backend_.get();
  EXPECT_EQ(original->AddFixedOriginal(), Peer::Write::kUncertain);
  EXPECT_FALSE(backend_);
  EXPECT_TRUE(store_->present);
  EXPECT_EQ(store_->adds, 1);
  EXPECT_EQ(store_->deletes, 0);
}
TEST_F(DisposableModelCredentialBackendTest, DeleteDestructionCannotReportRemovedReceipt) {
  ASSERT_EQ(backend_->ObserveOriginal(), Peer::Item::kAbsent);
  ASSERT_EQ(backend_->AddFixedOriginal(), Peer::Write::kOriginalSaved);
  store_->on_delete = base::BindOnce([](std::unique_ptr<Peer::Backend>* backend) {
    backend->reset();
  }, &backend_);
  auto* original = backend_.get();
  EXPECT_EQ(original->RemoveOriginal(), Peer::Item::kUnavailable);
  EXPECT_FALSE(backend_);
  EXPECT_EQ(store_->deletes, 1);
  EXPECT_FALSE(store_->present);
}
TEST_F(DisposableModelCredentialBackendTest, RetainedOriginalGuardianWitnessIsTheExactItemMarker) {
  ASSERT_EQ(backend_->ObserveOriginal(), Peer::Item::kAbsent);
  ASSERT_EQ(backend_->AddFixedOriginal(), Peer::Write::kOriginalSaved);
  ASSERT_TRUE(store_->created);
  const auto marker = static_cast<CFDataRef>(CFDictionaryGetValue(store_->created.get(), kSecAttrGeneric));
  ASSERT_TRUE(marker);
  ASSERT_EQ(CFDataGetLength(marker), 64);
  const std::string original(64, 'd');
  EXPECT_EQ(std::string(reinterpret_cast<const char*>(CFDataGetBytePtr(marker)), 64), original);
}
TEST_F(DisposableModelCredentialBackendTest, AttributesOnlyAbsentOriginalQueryThenFixedAtomicAdd) {
  ASSERT_EQ(backend_->ObserveOriginal(), Peer::Item::kAbsent);
  ASSERT_EQ(backend_->AddFixedOriginal(), Peer::Write::kOriginalSaved);
  ASSERT_TRUE(store_->created);
  EXPECT_EQ(store_->adds, 1);
  EXPECT_TRUE(CFEqual(CFDictionaryGetValue(store_->created.get(), kSecAttrAccount),
      CFSTR("modelKey-openai-compatible")));
  EXPECT_TRUE(CFEqual(CFDictionaryGetValue(store_->created.get(), kSecAttrService),
      CFSTR("dev.aux.browser:/tmp/aux-native-journey-mock/profile/Default")));
  EXPECT_TRUE(CFEqual(CFDictionaryGetValue(store_->created.get(), kSecAttrSynchronizable), kCFBooleanFalse));
  EXPECT_TRUE(CFEqual(CFDictionaryGetValue(store_->created.get(), kSecReturnPersistentRef), kCFBooleanTrue));
  const auto value = static_cast<CFDataRef>(CFDictionaryGetValue(store_->created.get(), kSecValueData));
  const std::string expected = "aux-disposable-loopback-appearance-synthetic-key-v1";
  ASSERT_EQ(CFDataGetLength(value), static_cast<CFIndex>(expected.size()));
  EXPECT_EQ(std::string(reinterpret_cast<const char*>(CFDataGetBytePtr(value)), CFDataGetLength(value)), expected);
  EXPECT_EQ(backend_->AddFixedOriginal(), Peer::Write::kNoWrite);
}
TEST_F(DisposableModelCredentialBackendTest, ExistingForeignItemNeverWritesOrDeletes) {
  store_->present = true;
  EXPECT_EQ(backend_->ObserveOriginal(), Peer::Item::kForeign);
  EXPECT_EQ(backend_->AddFixedOriginal(), Peer::Write::kNoWrite);
  EXPECT_EQ(backend_->RemoveOriginal(), Peer::Item::kUnavailable);
  EXPECT_EQ(store_->adds, 0); EXPECT_EQ(store_->deletes, 0);
}
TEST_F(DisposableModelCredentialBackendTest, AtomicDuplicateRaceNeverUpdatesUnknownItem) {
  ASSERT_EQ(backend_->ObserveOriginal(), Peer::Item::kAbsent);
  store_->present = true;
  EXPECT_EQ(backend_->AddFixedOriginal(), Peer::Write::kNoWrite);
  EXPECT_EQ(store_->adds, 1); EXPECT_EQ(store_->deletes, 0);
  EXPECT_TRUE(store_->present);
}
TEST_F(DisposableModelCredentialBackendTest, LockedAbsenceIsNotAuthorityToWrite) {
  store_->locked = true;
  EXPECT_EQ(backend_->ObserveOriginal(), Peer::Item::kUnavailable);
  EXPECT_EQ(backend_->AddFixedOriginal(), Peer::Write::kNoWrite);
  EXPECT_EQ(store_->adds, 0);
}
TEST_F(DisposableModelCredentialBackendTest, MissingReturnedReferenceKeepsUncertainWriteWithoutBroadDelete) {
  ASSERT_EQ(backend_->ObserveOriginal(), Peer::Item::kAbsent);
  store_->lose_returned_ref = true;
  EXPECT_EQ(backend_->AddFixedOriginal(), Peer::Write::kUncertain);
  EXPECT_TRUE(store_->present);
  EXPECT_EQ(backend_->RemoveOriginal(), Peer::Item::kUnavailable);
  EXPECT_EQ(store_->deletes, 0);
}
TEST_F(DisposableModelCredentialBackendTest, ForeignPersistentReferenceOrCreationWitnessRefusesCleanup) {
  ASSERT_EQ(backend_->ObserveOriginal(), Peer::Item::kAbsent);
  ASSERT_EQ(backend_->AddFixedOriginal(), Peer::Write::kOriginalSaved);
  store_->foreign_ref = true;
  EXPECT_EQ(backend_->RemoveOriginal(), Peer::Item::kForeign);
  store_->foreign_ref = false; store_->foreign_marker = true;
  EXPECT_EQ(backend_->RemoveOriginal(), Peer::Item::kForeign);
  EXPECT_EQ(store_->deletes, 0); EXPECT_TRUE(store_->present);
}
TEST_F(DisposableModelCredentialBackendTest, ExactOwnedReferenceDeleteAndAbsenceAreBothRequired) {
  ASSERT_EQ(backend_->ObserveOriginal(), Peer::Item::kAbsent);
  ASSERT_EQ(backend_->AddFixedOriginal(), Peer::Write::kOriginalSaved);
  EXPECT_EQ(backend_->RemoveOriginal(), Peer::Item::kAbsent);
  ASSERT_TRUE(store_->deletion);
  auto original = Peer::Reference(false);
  const auto items = static_cast<CFArrayRef>(CFDictionaryGetValue(store_->deletion.get(), kSecMatchItemList));
  ASSERT_EQ(CFArrayGetCount(items), 1);
  EXPECT_TRUE(CFEqual(CFArrayGetValueAtIndex(items, 0), original.get()));
  EXPECT_EQ(store_->deletes, 1); EXPECT_FALSE(store_->present);
}
TEST_F(DisposableModelCredentialBackendTest, LostCallerAckStillRetainsOriginalHandleForCleanup) {
  ASSERT_EQ(backend_->ObserveOriginal(), Peer::Item::kAbsent);
  ASSERT_EQ(backend_->AddFixedOriginal(), Peer::Write::kOriginalSaved);
  // Retain actual backend through corrected primitive ledger, not caller ACK.
  auto retained = std::move(backend_);
  EXPECT_EQ(retained->RemoveOriginal(), Peer::Item::kAbsent);
  EXPECT_EQ(store_->deletes, 1);
}
TEST_F(DisposableModelCredentialBackendTest, LockedRemovalAndRetiredProfileNeverDelete) {
  ASSERT_EQ(backend_->ObserveOriginal(), Peer::Item::kAbsent);
  ASSERT_EQ(backend_->AddFixedOriginal(), Peer::Write::kOriginalSaved);
  store_->locked = true;
  EXPECT_EQ(backend_->RemoveOriginal(), Peer::Item::kUnavailable);
  store_->locked = false; current_ = false;
  EXPECT_EQ(backend_->RemoveOriginal(), Peer::Item::kUnavailable);
  current_ = true;
  EXPECT_EQ(backend_->RemoveOriginal(), Peer::Item::kUnavailable);
  EXPECT_EQ(store_->deletes, 0); EXPECT_TRUE(store_->present);
}
}  // namespace
}  // namespace aux
