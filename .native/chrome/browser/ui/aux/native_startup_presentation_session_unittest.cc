// Copyright 2026 The Aux Authors
// Mojo cancellation/lifetime tests, never simulated launch/paint authority.
#include "chrome/browser/ui/aux/native_startup_presentation_session.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include "base/functional/bind.h"
#include "base/task/single_thread_task_runner.h"
#include "base/test/task_environment.h"
#include "content/public/test/browser_task_environment.h"
#include "mojo/public/cpp/bindings/receiver.h"
#include "testing/gtest/include/gtest/gtest.h"
namespace aux {
class NativeStartupPresentationSessionLifetimeTest : public testing::Test,
    public blink::mojom::NativeStartupFrameLease {
 protected:
  void Stop() override {}
  auto PendingHardware(NativeStartupPresentationSession& session) {
    return base::BindOnce(&NativeStartupPresentationSession::Presented,
        session.weak_factory_.GetWeakPtr(), viz::mojom::NativeGuestInclusionResultPtr());
  }
  void WaitForHardware(NativeStartupPresentationSession& session,
      std::optional<base::DictValue>* result) {
    // Only the pending callback/pipe is seeded; no Profile, original launch,
    // document, geometry, token or measured identity is fabricated.
    session.reply_ = base::BindOnce(
        [](std::optional<base::DictValue>* output, base::DictValue record) {
          *output = std::move(record);
        }, result);
    receiver_.Bind(session.lease_.BindNewPipeAndPassReceiver());
    session.lease_.set_disconnect_handler(base::BindOnce(
        &NativeStartupPresentationSession::LeaseDisconnected, session.weak_factory_.GetWeakPtr()));
  }
  void SeedPendingHardware(NativeStartupPresentationSession& session) {
    session.hardware_record_ = base::DictValue().Set("pending", true);
  }
  bool HasPendingHardware(const NativeStartupPresentationSession& session) {
    return session.hardware_record_.has_value();
  }
  auto PendingHello(NativeStartupPresentationSession& session) {
    return base::BindOnce(&NativeStartupPresentationSession::HelloConfirmed,
        session.weak_factory_.GetWeakPtr(), std::optional<base::TimeTicks>(base::TimeTicks::Now()));
  }
  void Refuse(NativeStartupPresentationSession& session, const char* reason) {
    session.Refuse(reason);
  }
  void ArmOriginalDeadline(NativeStartupPresentationSession& session) {
    session.started_ = base::TimeTicks::Now(); session.deadline_ = session.started_ + base::Seconds(5);
    session.timeout_.Start(FROM_HERE, base::Seconds(5), base::BindOnce(
        &NativeStartupPresentationSession::Refuse, session.weak_factory_.GetWeakPtr(), "startup_presentation_timeout"));
  }
  content::BrowserTaskEnvironment environment_{base::test::TaskEnvironment::TimeSource::MOCK_TIME};
  mojo::Receiver<blink::mojom::NativeStartupFrameLease> receiver_{this};
};
TEST_F(NativeStartupPresentationSessionLifetimeTest, DisconnectBeforeHardwareRefusesAndRetiresLateReply) {
  NativeStartupPresentationSession session({});
  std::optional<base::DictValue> result;
  WaitForHardware(session, &result);
  auto delayed_hardware = PendingHardware(session);
  receiver_.reset(); environment_.RunUntilIdle();
  ASSERT_TRUE(result);
  EXPECT_EQ(result->FindBool("measured"), false);
  ASSERT_TRUE(result->FindString("reason"));
  EXPECT_EQ(*result->FindString("reason"), "startup_frame_lease_disconnected");
  EXPECT_FALSE(result->Find("elapsedUs"));
  auto original = result->Clone();
  std::move(delayed_hardware).Run(); environment_.RunUntilIdle();
  EXPECT_EQ(*result, original);
}
TEST_F(NativeStartupPresentationSessionLifetimeTest, OwnerDestructionCancelsPendingCallback) {
  auto session = std::make_unique<NativeStartupPresentationSession>(base::WeakPtr<WebUIBrowserUI>());
  std::optional<base::DictValue> result;
  WaitForHardware(*session, &result);
  auto delayed_hardware = PendingHardware(*session);
  session.reset(); environment_.RunUntilIdle();
  std::move(delayed_hardware).Run(); environment_.RunUntilIdle();
  EXPECT_FALSE(result);
}
TEST_F(NativeStartupPresentationSessionLifetimeTest, DisconnectWhileHelloPendingRefusesRetainedHardware) {
  NativeStartupPresentationSession session({});
  std::optional<base::DictValue> result;
  WaitForHardware(session, &result);
  // Only pending local storage is seeded; this creates no measured authority.
  SeedPendingHardware(session);
  receiver_.reset(); environment_.RunUntilIdle();
  ASSERT_TRUE(result);
  EXPECT_EQ(result->FindBool("measured"), false);
  ASSERT_TRUE(result->FindString("reason"));
  EXPECT_EQ(*result->FindString("reason"), "startup_frame_lease_disconnected");
  EXPECT_FALSE(result->Find("elapsedUs"));
  EXPECT_FALSE(result->Find("runtimeHelloElapsedUs"));
  EXPECT_FALSE(HasPendingHardware(session));
}
TEST_F(NativeStartupPresentationSessionLifetimeTest, LateHelloConfirmationCannotReplaceCancellation) {
  NativeStartupPresentationSession session({});
  std::optional<base::DictValue> result;
  WaitForHardware(session, &result);
  auto delayed = PendingHello(session);
  Refuse(session, "startup_cancelled");
  ASSERT_TRUE(result);
  const auto original = result->Clone();
  std::move(delayed).Run(); environment_.RunUntilIdle();
  EXPECT_EQ(*result, original);
  EXPECT_FALSE(result->Find("runtimeHelloUs"));
}
TEST_F(NativeStartupPresentationSessionLifetimeTest, QueuedConfirmationAfterOriginalDeadlineRefusesBeforeDelayedTimer) {
  NativeStartupPresentationSession session({});
  std::optional<base::DictValue> result;
  WaitForHardware(session, &result);
  ArmOriginalDeadline(session);
  // Queued first, but delivered after clock expiry. No measured scope is seeded.
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE,
      PendingHello(session));
  environment_.AdvanceClock(base::Seconds(6)); environment_.RunUntilIdle();
  ASSERT_TRUE(result); EXPECT_EQ(result->FindBool("measured"), false);
  ASSERT_TRUE(result->FindString("reason")); EXPECT_EQ(*result->FindString("reason"), "startup_deadline_elapsed");
  EXPECT_FALSE(result->Find("elapsedUs")); EXPECT_FALSE(result->Find("runtimeHelloElapsedUs"));
}
}  // namespace aux
#endif
