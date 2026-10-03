// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/stock_measurement/native_stock_startup_session.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS) && !BUILDFLAG(ENABLE_AUX_SHELL)
#include "base/functional/bind.h"
#include "base/test/task_environment.h"
#include "testing/gtest/include/gtest/gtest.h"
namespace aux {
class NativeStockStartupSessionLifetimeTest : public testing::Test {
 protected:
  static void Count(unsigned* calls, base::DictValue) { ++*calls; }
  static void PrimeRefusalReply(NativeStockStartupSession& session, unsigned* calls) {
    session.reply_ = base::BindOnce(&Count, calls);
    session.deadline_ = base::TimeTicks::Now() + base::Seconds(5);
  }
  static base::OnceClosure DelayedRegistration(NativeStockStartupSession& session) {
    return base::BindOnce(&NativeStockStartupSession::Registered,
        session.weak_factory_.GetWeakPtr(), std::make_optional(base::TimeTicks::Now()));
  }
  static base::OnceClosure DelayedSubmission(NativeStockStartupSession& session) {
    return base::BindOnce(&NativeStockStartupSession::Submitted,
        session.weak_factory_.GetWeakPtr(), std::optional<viz::NativeStockReadyFrame>());
  }
  base::test::TaskEnvironment tasks_{base::test::TaskEnvironment::TimeSource::MOCK_TIME};
};
TEST_F(NativeStockStartupSessionLifetimeTest, MissingOriginalLeaseRefusesWithoutInventedIdentity) {
  NativeStockStartupSession session(nullptr);
  NativeStartupLaunchReceipt invalid;
  invalid.browser_pid = 123; invalid.launcher_pid = 456;
  invalid.trial = "unadmitted"; invalid.launch = base::TimeTicks::Now();
  std::optional<base::DictValue> result;
  session.Start(std::move(invalid), base::BindOnce(
      [](std::optional<base::DictValue>* out, base::DictValue value) { *out = std::move(value); }, &result));
  ASSERT_TRUE(result); EXPECT_FALSE(result->FindBool("measured").value_or(true));
  ASSERT_TRUE(result->FindString("producer"));
  EXPECT_EQ(*result->FindString("producer"), "aux-native-stock-startup-presentation");
  EXPECT_FALSE(result->Find("browserPid")); EXPECT_FALSE(result->Find("launcherPid"));
  EXPECT_FALSE(result->Find("trial")); EXPECT_FALSE(result->Find("launchReceiptNonce"));
}
TEST_F(NativeStockStartupSessionLifetimeTest, CancelRetiresAlreadyQueuedRegistrationAndSubmission) {
  NativeStockStartupSession session(nullptr);
  unsigned calls = 0; PrimeRefusalReply(session, &calls);
  auto registration = DelayedRegistration(session); auto submission = DelayedSubmission(session);
  session.Cancel(); EXPECT_EQ(calls, 1u);
  std::move(registration).Run(); std::move(submission).Run(); tasks_.RunUntilIdle();
  EXPECT_EQ(calls, 1u);
}
}  // namespace aux
#endif
