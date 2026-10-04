// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#include "chrome/browser/ui/aux/native_disposable_model_credential_lease.h"
#include <memory>
#include <utility>
#include <vector>
#include "base/functional/bind.h"
#include "testing/gtest/include/gtest/gtest.h"
namespace aux {
class NativeDisposableModelCredentialTestPeer {
 public:
  using Lease = NativeDisposableModelCredentialLease;
  using Item = Lease::Backend::Item;
  using Write = Lease::Backend::Write;
  struct StoreState {
    Item item = Item::kAbsent;
    Write next_write = Write::kOriginalSaved;
    bool unavailable = false;
    int adds = 0;
    int deletes = 0;
    int destructions = 0;
    base::RepeatingClosure on_observe;
    base::RepeatingClosure on_add;
    base::RepeatingClosure on_remove;
  };
  struct Debt { Lease::Receipt receipt; std::shared_ptr<Lease::Backend> backend; };
  class Store : public Lease::Backend {
   public:
    explicit Store(std::shared_ptr<StoreState> state) : state_(std::move(state)) {}
    ~Store() override { ++state_->destructions; }
    Item ObserveOriginal() override {
      const auto callback = state_->on_observe;
      if (callback) callback.Run();
      return state_->unavailable ? Item::kUnavailable : state_->item;
    }
    Write AddFixedOriginal() override {
      ++state_->adds;
      if (state_->item != Item::kAbsent) return Write::kNoWrite;
      if (state_->next_write != Write::kNoWrite) state_->item = Item::kOriginal;
      const auto callback = state_->on_add;
      if (callback) callback.Run();
      return state_->next_write;
    }
    Item RemoveOriginal() override {
      if (state_->unavailable || state_->item == Item::kForeign)
        return ObserveOriginal();
      if (state_->item == Item::kOriginal) ++state_->deletes;
      state_->item = Item::kAbsent;
      const auto callback = state_->on_remove;
      if (callback) callback.Run();
      return state_->item;
    }
   private:
    std::shared_ptr<StoreState> state_;
  };
  static std::unique_ptr<Lease> Create(std::shared_ptr<StoreState> state,
      bool* current, std::vector<Debt>* retained) {
    return std::unique_ptr<Lease>(new Lease(
        {base::UnguessableToken::Create(), base::UnguessableToken::Create(), 1},
        std::make_unique<Store>(std::move(state)),
        base::BindRepeating([](bool* live) { return *live; }, current),
        base::BindOnce([](std::vector<Debt>* ledger, Lease::Receipt receipt,
                          std::shared_ptr<Lease::Backend> backend) {
          ledger->push_back({receipt, std::move(backend)});
        }, retained)));
  }
  static const void* OriginalBackend(Lease* lease) { return lease->backend_.get(); }
  static void DropRetainedDebt(Lease* lease) {
    lease->retain_debt_ = base::BindOnce([](Lease::Receipt receipt,
                                          std::shared_ptr<Lease::Backend> backend) {});
  }
  static void DestroyInCurrent(Lease* lease, std::unique_ptr<Lease>* owner) {
    lease->current_ = base::BindRepeating([](std::unique_ptr<Lease>* original) {
      original->reset();
      return true;
    }, owner);
  }
  static bool Acquire(Lease* lease) { return lease->AcquireAbsent(); }
  static bool Save(Lease* lease) { return lease->SaveFixed(); }
  static bool ObserveRemoval(Lease* lease) { return lease->ObserveExplicitRemoval(); }
  static bool Cleanup(Lease* lease) { return lease->CleanupOriginal(); }
  static void Retire(Lease* lease) { lease->Retire(); }
  static bool CleanupDebt(Debt* debt) {
    if (debt->backend->RemoveOriginal() != Item::kAbsent) return false;
    debt->receipt.state = Lease::State::kRemoved;
    debt->receipt.cleanup_debt = false;
    return true;
  }
};
namespace {
using Peer = NativeDisposableModelCredentialTestPeer;
using Lease = Peer::Lease;
class DisposableModelCredentialLeaseTest : public testing::Test {
 protected:
  // Ledger/store/owner outlive lease, including failing assertions.
  std::vector<Peer::Debt> debts_;
  std::shared_ptr<Peer::StoreState> store_ = std::make_shared<Peer::StoreState>();
  bool current_ = true;
  std::unique_ptr<Lease> lease_ = Peer::Create(store_, &current_, &debts_);
};
TEST_F(DisposableModelCredentialLeaseTest, RequiresOriginalAbsentItemBeforeFixedSave) {
  store_->item = Peer::Item::kForeign;
  EXPECT_FALSE(Peer::Acquire(lease_.get()));
  EXPECT_FALSE(Peer::Save(lease_.get()));
  EXPECT_EQ(store_->adds, 0);
  EXPECT_FALSE(lease_->receipt().cleanup_debt);
}
TEST_F(DisposableModelCredentialLeaseTest, AtomicAddRefusesItemInsertedAfterAbsence) {
  ASSERT_TRUE(Peer::Acquire(lease_.get()));
  store_->item = Peer::Item::kForeign;
  EXPECT_FALSE(Peer::Save(lease_.get()));
  EXPECT_EQ(store_->item, Peer::Item::kForeign);
  EXPECT_EQ(store_->deletes, 0);
  EXPECT_FALSE(lease_->receipt().cleanup_debt);
}
TEST_F(DisposableModelCredentialLeaseTest, LostCallerAckKeepsOriginalSavedDebt) {
  ASSERT_TRUE(Peer::Acquire(lease_.get()));
  ASSERT_TRUE(Peer::Save(lease_.get()));
  const auto original = lease_->receipt();
  EXPECT_TRUE(original.cleanup_debt);
  EXPECT_EQ(original.state, Lease::State::kSaved);
  lease_.reset();  // No external reply/ACK consumed.
  ASSERT_EQ(debts_.size(), 1u);
  EXPECT_EQ(debts_[0].receipt.lease, original.lease);
  EXPECT_EQ(debts_[0].receipt.host, original.host);
  EXPECT_EQ(debts_[0].receipt.profile, original.profile);
  EXPECT_TRUE(debts_[0].receipt.retired);
  EXPECT_TRUE(debts_[0].receipt.cleanup_debt);
  EXPECT_EQ(store_->deletes, 0);
  EXPECT_TRUE(Peer::CleanupDebt(&debts_[0]));
  EXPECT_EQ(store_->deletes, 1);
}
TEST_F(DisposableModelCredentialLeaseTest, CancelReviewDoesNotRemoveOriginalItem) {
  ASSERT_TRUE(Peer::Acquire(lease_.get()));
  ASSERT_TRUE(Peer::Save(lease_.get()));
  EXPECT_EQ(store_->deletes, 0);
  EXPECT_FALSE(Peer::ObserveRemoval(lease_.get()));
  EXPECT_EQ(lease_->receipt().state, Lease::State::kSaved);
  EXPECT_TRUE(lease_->receipt().cleanup_debt);
}
TEST_F(DisposableModelCredentialLeaseTest, ActualExplicitRemovalRequiresAbsence) {
  ASSERT_TRUE(Peer::Acquire(lease_.get()));
  ASSERT_TRUE(Peer::Save(lease_.get()));
  store_->item = Peer::Item::kAbsent;  // Original settings producer removal.
  EXPECT_TRUE(Peer::ObserveRemoval(lease_.get()));
  EXPECT_EQ(lease_->receipt().state, Lease::State::kRemoved);
  EXPECT_FALSE(lease_->receipt().cleanup_debt);
  EXPECT_EQ(store_->deletes, 0);  // Observation is not another delete.
}
TEST_F(DisposableModelCredentialLeaseTest, RetiredHostCannotRearmButOriginalDebtCanCleanup) {
  ASSERT_TRUE(Peer::Acquire(lease_.get()));
  ASSERT_TRUE(Peer::Save(lease_.get()));
  Peer::Retire(lease_.get());
  EXPECT_FALSE(Peer::Save(lease_.get()));
  EXPECT_FALSE(Peer::ObserveRemoval(lease_.get()));
  EXPECT_TRUE(Peer::Cleanup(lease_.get()));
  EXPECT_FALSE(lease_->receipt().cleanup_debt);
}
TEST_F(DisposableModelCredentialLeaseTest, ObservedOwnerAbaPermanentlyRefusesWrite) {
  ASSERT_TRUE(Peer::Acquire(lease_.get()));
  current_ = false;
  EXPECT_FALSE(Peer::Save(lease_.get()));
  current_ = true;
  EXPECT_FALSE(Peer::Save(lease_.get()));
  EXPECT_EQ(store_->adds, 0);
}
TEST_F(DisposableModelCredentialLeaseTest, ForeignReplacementRefusesDeletionAndRetainsDebt) {
  ASSERT_TRUE(Peer::Acquire(lease_.get()));
  ASSERT_TRUE(Peer::Save(lease_.get()));
  store_->item = Peer::Item::kForeign;
  EXPECT_FALSE(Peer::Cleanup(lease_.get()));
  lease_.reset();
  ASSERT_EQ(debts_.size(), 1u);
  EXPECT_FALSE(Peer::CleanupDebt(&debts_[0]));
  EXPECT_TRUE(debts_[0].receipt.cleanup_debt);
  EXPECT_EQ(store_->deletes, 0);
}
TEST_F(DisposableModelCredentialLeaseTest, UncertainWriteOrLockedRemovalRetainsOriginalDebt) {
  ASSERT_TRUE(Peer::Acquire(lease_.get()));
  store_->next_write = Peer::Write::kUncertain;
  EXPECT_FALSE(Peer::Save(lease_.get()));
  EXPECT_EQ(lease_->receipt().state, Lease::State::kUncertain);
  store_->unavailable = true;
  EXPECT_FALSE(Peer::Cleanup(lease_.get()));
  lease_.reset();
  ASSERT_EQ(debts_.size(), 1u);
  EXPECT_TRUE(debts_[0].receipt.cleanup_debt);
  store_->unavailable = false;
  EXPECT_TRUE(Peer::CleanupDebt(&debts_[0]));
}
TEST_F(DisposableModelCredentialLeaseTest, AcquireBackendSurvivesSynchronousOwnerDestruction) {
  store_->on_observe = base::BindRepeating([](std::unique_ptr<Lease>* original) {
    original->reset();
  }, &lease_);
  EXPECT_FALSE(Peer::Acquire(lease_.get()));
  EXPECT_FALSE(lease_);
  EXPECT_EQ(store_->destructions, 1);
  EXPECT_EQ(store_->adds, 0);
  EXPECT_TRUE(debts_.empty());
}
TEST_F(DisposableModelCredentialLeaseTest, SavedOrUncertainAddRetainsOriginalDebtAfterOwnerDestruction) {
  for (auto write : {Peer::Write::kOriginalSaved, Peer::Write::kUncertain}) {
    debts_.clear();
    store_ = std::make_shared<Peer::StoreState>();
    lease_ = Peer::Create(store_, &current_, &debts_);
    ASSERT_TRUE(Peer::Acquire(lease_.get()));
    const auto original = lease_->receipt();
    auto* const backend_identity = Peer::OriginalBackend(lease_.get());
    store_->next_write = write;
    store_->on_add = base::BindRepeating([](std::unique_ptr<Lease>* owner) {
      owner->reset();
    }, &lease_);
    EXPECT_FALSE(Peer::Save(lease_.get()));
    EXPECT_FALSE(lease_);
    ASSERT_EQ(debts_.size(), 1u);
    EXPECT_EQ(debts_[0].receipt.lease, original.lease);
    EXPECT_EQ(debts_[0].backend.get(), backend_identity);
    EXPECT_TRUE(debts_[0].receipt.retired);
    EXPECT_TRUE(debts_[0].receipt.cleanup_debt);
    EXPECT_EQ(store_->destructions, 0);
    EXPECT_EQ(store_->adds, 1);
    EXPECT_TRUE(Peer::CleanupDebt(&debts_[0]));
    EXPECT_EQ(store_->deletes, 1);
  }
}
TEST_F(DisposableModelCredentialLeaseTest, DroppedDebtSinkCannotDestroyExecutingAddBackend) {
  ASSERT_TRUE(Peer::Acquire(lease_.get()));
  Peer::DropRetainedDebt(lease_.get());  // Invalid future ledger, lifetime control only.
  store_->on_add = base::BindRepeating([](std::unique_ptr<Lease>* original, Peer::StoreState* store) {
    original->reset();
    EXPECT_EQ(store->destructions, 0);
  }, &lease_, store_.get());
  EXPECT_FALSE(Peer::Save(lease_.get()));
  EXPECT_FALSE(lease_);
  EXPECT_EQ(store_->adds, 1);
  EXPECT_EQ(store_->destructions, 1);
  EXPECT_EQ(store_->item, Peer::Item::kOriginal);
  EXPECT_TRUE(debts_.empty());  // This does not prove cleanup or a valid ledger.
}
TEST_F(DisposableModelCredentialLeaseTest, RemovalObservationRetainsDebtIfOriginalOwnerDiesDuringRead) {
  ASSERT_TRUE(Peer::Acquire(lease_.get()));
  ASSERT_TRUE(Peer::Save(lease_.get()));
  store_->item = Peer::Item::kAbsent;
  store_->on_observe = base::BindRepeating([](std::unique_ptr<Lease>* original) {
    original->reset();
  }, &lease_);
  EXPECT_FALSE(Peer::ObserveRemoval(lease_.get()));
  ASSERT_EQ(debts_.size(), 1u);
  EXPECT_TRUE(debts_[0].receipt.cleanup_debt);
  EXPECT_EQ(store_->destructions, 0);
  store_->on_observe.Reset();
  EXPECT_TRUE(Peer::CleanupDebt(&debts_[0]));
  EXPECT_EQ(store_->deletes, 0);
}
TEST_F(DisposableModelCredentialLeaseTest, CleanupDoesNotPublishSuccessAfterOriginalOwnerDestruction) {
  ASSERT_TRUE(Peer::Acquire(lease_.get()));
  ASSERT_TRUE(Peer::Save(lease_.get()));
  store_->on_remove = base::BindRepeating([](std::unique_ptr<Lease>* original) {
    original->reset();
  }, &lease_);
  EXPECT_FALSE(Peer::Cleanup(lease_.get()));
  ASSERT_EQ(debts_.size(), 1u);
  EXPECT_TRUE(debts_[0].receipt.cleanup_debt);
  EXPECT_EQ(store_->item, Peer::Item::kAbsent);
  EXPECT_EQ(store_->destructions, 0);
  store_->on_remove.Reset();
  EXPECT_TRUE(Peer::CleanupDebt(&debts_[0]));
  EXPECT_EQ(store_->deletes, 1);
}
TEST_F(DisposableModelCredentialLeaseTest, OriginalCurrentCallbackDestructionRefusesBeforeBackendDispatch) {
  Peer::DestroyInCurrent(lease_.get(), &lease_);
  EXPECT_FALSE(Peer::Acquire(lease_.get()));
  EXPECT_FALSE(lease_);
  EXPECT_EQ(store_->adds, 0);
  EXPECT_EQ(store_->destructions, 1);
  EXPECT_TRUE(debts_.empty());
}
}  // namespace
}  // namespace aux
