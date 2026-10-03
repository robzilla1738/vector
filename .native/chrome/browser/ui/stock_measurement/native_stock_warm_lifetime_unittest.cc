// Copyright 2026 The Aux Authors
// Native lifetime/refusal controls only, not a launch/input/HW measurement.
#include "chrome/browser/ui/stock_measurement/native_stock_warm_creation_ticket.h"
#include "chrome/browser/ui/stock_measurement/native_stock_warm_owner.h"
#include "chrome/browser/ui/stock_measurement/native_stock_warm_session.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS) && !BUILDFLAG(ENABLE_AUX_SHELL)
#include <memory>
#include <vector>
#include "base/functional/bind.h"
#include "chrome/test/base/chrome_views_test_base.h"
#include "testing/gtest/include/gtest/gtest.h"
namespace aux {
namespace {
void CreatedWithoutAuthority(int* calls, base::WeakPtr<BrowserView>) { ++*calls; }
void RefusedCount(int* calls, const char*) { ++*calls; }
void DestroyTicket(std::unique_ptr<NativeStockWarmCreationTicket>* ticket, int* calls, const char*) {
  ++*calls; ticket->reset();
}
void SaveRecord(std::vector<base::DictValue>* records, base::DictValue record) {
  records->push_back(std::move(record));
}
}  // namespace
// Uses the existing native Views fixture UI thread. No additional local
// TaskEnvironment or synthetic helper/kernel/paint authority is installed.
class NativeStockWarmSessionLifetimeTest : public ChromeViewsTestBase {
 protected:
  base::OnceClosure LateRegistered(NativeStockWarmSession* session) {
    return base::BindOnce(&NativeStockWarmSession::Registered,
        session->weak_factory_.GetWeakPtr(), std::optional<base::TimeTicks>());
  }
};
TEST_F(NativeStockWarmSessionLifetimeTest, EmptyReceiptCannotCreateRetainedOwner) {
  EXPECT_FALSE(NativeStockWarmOwner::RetainOriginal(NativeStartupLaunchReceipt(), nullptr));
}
TEST_F(NativeStockWarmSessionLifetimeTest, MissingOwnerRefusesWithoutPublishingOrCreating) {
  int created = 0, refused = 0;
  NativeStockWarmCreationTicket ticket(nullptr,
      base::BindOnce(&CreatedWithoutAuthority, &created), base::BindOnce(&RefusedCount, &refused));
  auto original = ticket.GetWeakPtr();
  EXPECT_FALSE(ticket.Prepare()); EXPECT_FALSE(original);
  EXPECT_FALSE(NativeStockWarmCreationTicket::PreparedTicket());
  EXPECT_EQ(created, 0); EXPECT_EQ(refused, 1);
  ticket.Cancel(); EXPECT_EQ(refused, 1);
}
TEST_F(NativeStockWarmSessionLifetimeTest, RefusalCallbackMayDestroyTicketSynchronously) {
  int created = 0, refused = 0;
  std::unique_ptr<NativeStockWarmCreationTicket> ticket;
  ticket = std::make_unique<NativeStockWarmCreationTicket>(nullptr,
      base::BindOnce(&CreatedWithoutAuthority, &created),
      base::BindOnce(&DestroyTicket, &ticket, &refused));
  auto original = ticket->GetWeakPtr();
  EXPECT_FALSE(ticket->Prepare()); EXPECT_FALSE(ticket); EXPECT_FALSE(original);
  EXPECT_EQ(created, 0); EXPECT_EQ(refused, 1);
  EXPECT_FALSE(NativeStockWarmCreationTicket::PreparedTicket());
}
TEST_F(NativeStockWarmSessionLifetimeTest, DestructionRetiresWeakTicketWithoutInventingRefusal) {
  int created = 0, refused = 0;
  auto ticket = std::make_unique<NativeStockWarmCreationTicket>(nullptr,
      base::BindOnce(&CreatedWithoutAuthority, &created), base::BindOnce(&RefusedCount, &refused));
  auto original = ticket->GetWeakPtr(); ticket.reset(); EXPECT_FALSE(original);
  EXPECT_EQ(created, 0); EXPECT_EQ(refused, 0);
}
TEST_F(NativeStockWarmSessionLifetimeTest, MissingNativeScopeEmitsHonestFixedRefusal) {
  NativeStockWarmSession session(nullptr); std::vector<base::DictValue> records;
  session.Start({}, base::BindOnce(&SaveRecord, &records));
  ASSERT_EQ(records.size(), 1u);
  EXPECT_EQ(*records[0].FindString("producer"), "aux-native-stock-warm-presentation");
  EXPECT_EQ(*records[0].FindString("status"), "refused");
  EXPECT_FALSE(*records[0].FindBool("measured"));
  EXPECT_FALSE(*records[0].FindBool("earliestPresentationProven"));
  EXPECT_FALSE(*records[0].FindBool("inputLineageProven"));
  EXPECT_FALSE(records[0].Find("rootSurface"));
  EXPECT_FALSE(records[0].Find("nativeInputUs"));
}
TEST_F(NativeStockWarmSessionLifetimeTest, DelayedOldReplyCannotActOnSecondAttempt) {
  NativeStockWarmSession session(nullptr); std::vector<base::DictValue> records;
  auto delayed = LateRegistered(&session);
  session.Start({}, base::BindOnce(&SaveRecord, &records));
  ASSERT_EQ(records.size(), 1u);
  session.Start({}, base::BindOnce(&SaveRecord, &records));
  ASSERT_EQ(records.size(), 2u);
  EXPECT_EQ(*records[1].FindString("reason"), "warm_already_observed");
  std::move(delayed).Run(); EXPECT_EQ(records.size(), 2u);
}
}  // namespace aux
#endif
