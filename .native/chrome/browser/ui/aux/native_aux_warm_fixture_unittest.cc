// Copyright 2026 The Aux Authors
// Lifecycle/refusal controls only; no admitted launch, input or HW evidence.
#include "chrome/browser/ui/aux/native_aux_warm_fixture.h"
#include "chrome/browser/ui/aux/native_aux_warm_owner.h"
#include <memory>
#include <utility>
#include "base/functional/bind.h"
#include "content/public/test/browser_task_environment.h"
#include "testing/gtest/include/gtest/gtest.h"
namespace aux {
class NativeAuxWarmFixtureLifetimeTest : public testing::Test {
 protected:
  content::BrowserTaskEnvironment environment_;
  auto DelayedRefusal(NativeAuxWarmFixture& fixture) {
    return base::BindOnce(&NativeAuxWarmFixture::Refused,
        fixture.weak_factory_.GetWeakPtr(), "retired_callback");
  }
  void InstallPendingReply(NativeAuxWarmFixture& fixture, int* calls, base::DictValue* record) {
    fixture.complete_ = base::BindOnce([](int* calls, base::DictValue* result,
        base::DictValue reply) { ++*calls; *result = std::move(reply); }, calls, record);
  }
};
TEST_F(NativeAuxWarmFixtureLifetimeTest, MissingOriginalLeaseCannotPrepareOrComplete) {
  NativeAuxWarmFixture fixture(nullptr);
  int calls = 0;
  auto check = [](int* calls, base::DictValue result) {
    ++*calls; EXPECT_EQ(result.FindString("status") ? *result.FindString("status") : "", "refused");
    EXPECT_EQ(result.FindBool("measured"), false);
    EXPECT_FALSE(result.Find("windowId")); EXPECT_FALSE(result.Find("requestNonce"));
  };
  fixture.Prepare({}, base::BindOnce(check, &calls));
  fixture.Complete({}, base::BindOnce(check, &calls));
  EXPECT_EQ(calls, 2); EXPECT_FALSE(fixture.CleanupWindow({}));
}
TEST_F(NativeAuxWarmFixtureLifetimeTest, DestroyedFixtureCannotReceiveDelayedOldRefusal) {
  auto fixture = std::make_unique<NativeAuxWarmFixture>(nullptr);
  auto delayed = DelayedRefusal(*fixture);
  fixture.reset();
  std::move(delayed).Run();
}
TEST_F(NativeAuxWarmFixtureLifetimeTest, DestructionResolvesPendingReplyExactlyOnceWithoutIdentity) {
  int calls = 0; base::DictValue record;
  auto fixture = std::make_unique<NativeAuxWarmFixture>(nullptr);
  InstallPendingReply(*fixture, &calls, &record);
  auto delayed = DelayedRefusal(*fixture);
  fixture.reset(); std::move(delayed).Run();
  EXPECT_EQ(calls, 1); ASSERT_TRUE(record.FindString("reason"));
  EXPECT_EQ(*record.FindString("reason"), "aux_warm_fixture_retired");
  EXPECT_EQ(record.FindBool("measured"), false); EXPECT_FALSE(record.Find("windowId"));
}
}  // namespace aux
