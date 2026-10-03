// Copyright 2026 The Aux Authors
// Synthetic native event/lifetime contracts, not real startup/paint evidence.
#include "components/viz/service/display/native_startup_first_hardware_retention.h"
#include "base/functional/bind.h"
#include "base/memory/raw_ptr.h"
#include "base/memory/ref_counted.h"
#include "base/test/scoped_mock_clock_override.h"
#include "base/test/test_mock_time_task_runner.h"
#include "components/viz/common/surfaces/local_surface_id.h"
#include "testing/gtest/include/gtest/gtest.h"
namespace viz {
// The Viz suite already owns the thread's RunLoop delegate. A standalone
// runner preserves genuine delayed callbacks without installing a second one.
class RetentionTaskRunner : public base::TestMockTimeTaskRunner {
 public:
  explicit RetentionTaskRunner(base::ScopedMockClockOverride* clock)
      : base::TestMockTimeTaskRunner(base::Time::Now(), base::TimeTicks::Now()),
        clock_(clock) {}

 protected:
  ~RetentionTaskRunner() override = default;
  void OnAfterTimePassed() override {
    // Advance at every actual queued deadline, before its callback executes.
    clock_->Advance(NowTicks() - base::TimeTicks::Now());
  }

 private:
  const raw_ptr<base::ScopedMockClockOverride> clock_;
};
class RetentionTaskEnvironment {
 public:
  RetentionTaskEnvironment()
      : runner_(base::MakeRefCounted<RetentionTaskRunner>(&clock_)),
        context_(runner_) {}
  void FastForwardBy(base::TimeDelta delta) { runner_->FastForwardBy(delta); }

 private:
  // Destruction restores the original task handle before runner/clock teardown.
  base::ScopedMockClockOverride clock_;
  scoped_refptr<RetentionTaskRunner> runner_;
  base::TestMockTimeTaskRunner::ScopedContext context_;
};
class NativeStartupFirstHardwareRetentionTest : public testing::Test {
 protected:
  SurfaceId Surface(FrameSinkId sink) {
    return SurfaceId(sink, LocalSurfaceId(1, 1, base::UnguessableToken::Create()));
  }
  NativeGuestInclusionScope Scope(const NativeStartupFirstHardwareRetention& retention,
      SurfaceId surface, uint32_t token) {
    NativeGuestInclusionScope scope;
    scope.kind = NativeInclusionScopeKind::kShellStartup;
    scope.shell_sink = shell_; scope.display_sink = display_;
    scope.mutation_shell_token = token;
    scope.startup_shell = surface; scope.startup_shell_size = gfx::Size(800, 600);
    scope.startup_shell_bounds = gfx::Rect(0, 0, 800, 600);
    scope.input = retention.registered_at() - base::Milliseconds(1);
    scope.mutation = retention.registered_at() + base::Milliseconds(1);
    scope.shell_submission = retention.registered_at() + base::Milliseconds(2);
    return scope;
  }
  std::unique_ptr<NativeStartupShellFootprint> Footprint(SurfaceId surface, uint32_t token, bool full = true) {
    auto footprint = std::make_unique<NativeStartupShellFootprint>(shell_);
    if (full) {
      footprint->BindShellPlacement(surface, token, gfx::Rect(800, 600), gfx::Transform(), {}, false);
      footprint->RecordEmittedSurface(surface, token, gfx::Rect(800, 600), 1, gfx::Size(800, 600));
    }
    footprint->RecordDrawnSurface(surface, token);
    return footprint;
  }
  void Feed(NativeStartupFirstHardwareRetention& retention, uint64_t ticket, bool hw = true) {
    gfx::SwapTimings swap;
    swap.swap_start = retention.registered_at() + base::Milliseconds(4);
    swap.swap_end = retention.registered_at() + base::Milliseconds(5);
    retention.Presented(ticket, swap, gfx::PresentationFeedback(
        retention.registered_at() + base::Milliseconds(6), base::Milliseconds(16),
        hw ? gfx::PresentationFeedback::kHWCompletion : 0));
  }
  auto Reply(std::optional<NativeGuestInclusionResult>* output, int* calls) {
    return base::BindOnce([](std::optional<NativeGuestInclusionResult>* out, int* count,
        std::optional<NativeGuestInclusionResult> result) { ++*count; *out = std::move(result); }, output, calls);
  }
  RetentionTaskEnvironment environment_;
  const FrameSinkId display_{1, 1}, shell_{2, 2};
};
TEST_F(NativeStartupFirstHardwareRetentionTest, OriginalGroupBeforeJoinRetainsExactFullHardware) {
  auto nonce = base::UnguessableToken::Create();
  NativeStartupFirstHardwareRetention retention(nonce, display_, shell_);
  const auto shell = Surface(shell_); const auto display = Surface(display_);
  environment_.FastForwardBy(base::Milliseconds(10));
  auto ticket = retention.RegisterFrame(Footprint(shell, 7), display,
      retention.registered_at() + base::Milliseconds(3)); ASSERT_TRUE(ticket);
  Feed(retention, *ticket);
  std::optional<NativeGuestInclusionResult> result; int calls = 0;
  retention.Join(nonce, Scope(retention, shell, 7), Reply(&result, &calls));
  ASSERT_TRUE(result); EXPECT_TRUE(result->measured); EXPECT_EQ(calls, 1);
  EXPECT_EQ(result->feedback.timestamp, retention.registered_at() + base::Milliseconds(6));
  EXPECT_FALSE(retention.active());
}
TEST_F(NativeStartupFirstHardwareRetentionTest, LaterRedrawCannotReplaceOriginalPendingGroup) {
  auto nonce = base::UnguessableToken::Create(); NativeStartupFirstHardwareRetention retention(nonce, display_, shell_);
  const auto surface = Surface(shell_); environment_.FastForwardBy(base::Milliseconds(10));
  auto ticket = retention.RegisterFrame(Footprint(surface, 7), Surface(display_),
      retention.registered_at() + base::Milliseconds(3)); ASSERT_TRUE(ticket);
  EXPECT_FALSE(retention.RegisterFrame(Footprint(surface, 7), Surface(display_),
      retention.registered_at() + base::Milliseconds(7)));
  std::optional<NativeGuestInclusionResult> result; int calls = 0;
  retention.Join(nonce, Scope(retention, surface, 7), Reply(&result, &calls)); EXPECT_EQ(calls, 0);
  Feed(retention, *ticket); ASSERT_TRUE(result); EXPECT_EQ(calls, 1);
}
TEST_F(NativeStartupFirstHardwareRetentionTest, FirstPartialPlacementCannotBeReplacedByFullRedraw) {
  auto nonce = base::UnguessableToken::Create(); NativeStartupFirstHardwareRetention retention(nonce, display_, shell_);
  const auto surface = Surface(shell_); environment_.FastForwardBy(base::Milliseconds(10));
  auto first = retention.RegisterFrame(Footprint(surface, 7, false), Surface(display_),
      retention.registered_at() + base::Milliseconds(3)); ASSERT_TRUE(first);
  EXPECT_FALSE(retention.RegisterFrame(Footprint(surface, 7), Surface(display_),
      retention.registered_at() + base::Milliseconds(7)));
  Feed(retention, *first);
  std::optional<NativeGuestInclusionResult> result; int calls = 0;
  retention.Join(nonce, Scope(retention, surface, 7), Reply(&result, &calls)); EXPECT_EQ(calls, 1); EXPECT_FALSE(result);
}
TEST_F(NativeStartupFirstHardwareRetentionTest, OriginalSoftwareFeedbackRefusesLaterHardwareReplacement) {
  auto nonce = base::UnguessableToken::Create(); NativeStartupFirstHardwareRetention retention(nonce, display_, shell_);
  const auto surface = Surface(shell_); environment_.FastForwardBy(base::Milliseconds(10));
  auto first = retention.RegisterFrame(Footprint(surface, 7), Surface(display_),
      retention.registered_at() + base::Milliseconds(3)); ASSERT_TRUE(first); Feed(retention, *first, false);
  EXPECT_FALSE(retention.RegisterFrame(Footprint(surface, 7), Surface(display_),
      retention.registered_at() + base::Milliseconds(7)));
  std::optional<NativeGuestInclusionResult> result; int calls = 0;
  retention.Join(nonce, Scope(retention, surface, 7), Reply(&result, &calls)); EXPECT_EQ(calls, 1); EXPECT_FALSE(result);
}
TEST_F(NativeStartupFirstHardwareRetentionTest, RegistrationAfterMutationOrForeignNonceRefuses) {
  for (int variant = 0; variant < 2; ++variant) {
    auto nonce = base::UnguessableToken::Create(); NativeStartupFirstHardwareRetention retention(nonce, display_, shell_);
    environment_.FastForwardBy(base::Milliseconds(10));
    auto scope = Scope(retention, Surface(shell_), 7);
    if (!variant) scope.mutation = retention.registered_at() - base::Milliseconds(1);
    std::optional<NativeGuestInclusionResult> result; int calls = 0;
    retention.Join(variant ? base::UnguessableToken::Create() : nonce, scope, Reply(&result, &calls));
    EXPECT_EQ(calls, 1); EXPECT_FALSE(result); EXPECT_EQ(retention.active(), variant == 1);
  }
}
TEST_F(NativeStartupFirstHardwareRetentionTest, BoundedOverflowNeverEvictsIntoLaterGreenEvidence) {
  auto nonce = base::UnguessableToken::Create(); NativeStartupFirstHardwareRetention retention(nonce, display_, shell_);
  environment_.FastForwardBy(base::Milliseconds(10)); const auto surface = Surface(shell_);
  for (uint32_t token = 1; token <= 64; ++token)
    ASSERT_TRUE(retention.RegisterFrame(Footprint(surface, token), Surface(display_),
        retention.registered_at() + base::Milliseconds(3)));
  EXPECT_FALSE(retention.RegisterFrame(Footprint(surface, 65), Surface(display_),
      retention.registered_at() + base::Milliseconds(3)));
  EXPECT_FALSE(retention.active());
  std::optional<NativeGuestInclusionResult> result; int calls = 0;
  retention.Join(nonce, Scope(retention, surface, 1), Reply(&result, &calls)); EXPECT_EQ(calls, 1); EXPECT_FALSE(result);
}
TEST_F(NativeStartupFirstHardwareRetentionTest, MissingOriginalGroupTimesOutWithoutLaterFrameGuess) {
  auto nonce = base::UnguessableToken::Create(); NativeStartupFirstHardwareRetention retention(nonce, display_, shell_);
  environment_.FastForwardBy(base::Milliseconds(10));
  std::optional<NativeGuestInclusionResult> result; int calls = 0;
  retention.Join(nonce, Scope(retention, Surface(shell_), 7), Reply(&result, &calls)); EXPECT_EQ(calls, 0);
  environment_.FastForwardBy(base::Seconds(5)); EXPECT_EQ(calls, 1); EXPECT_FALSE(result); EXPECT_FALSE(retention.active());
}
TEST_F(NativeStartupFirstHardwareRetentionTest, CancelRetiresPendingReplyAndDelayedOriginalFeedback) {
  auto nonce = base::UnguessableToken::Create();
  NativeStartupFirstHardwareRetention retention(nonce, display_, shell_);
  const auto surface = Surface(shell_); environment_.FastForwardBy(base::Milliseconds(10));
  auto ticket = retention.RegisterFrame(Footprint(surface, 7), Surface(display_),
      retention.registered_at() + base::Milliseconds(3)); ASSERT_TRUE(ticket);
  auto original = retention.GetWeakPtr();
  auto delayed = base::BindOnce([](base::WeakPtr<NativeStartupFirstHardwareRetention> owner,
      uint64_t ticket, gfx::SwapTimings swap, gfx::PresentationFeedback feedback) {
    if (owner) owner->Presented(ticket, swap, feedback);
  }, original, *ticket, gfx::SwapTimings(), gfx::PresentationFeedback::Failure());
  std::optional<NativeGuestInclusionResult> result; int calls = 0;
  retention.Join(nonce, Scope(retention, surface, 7), Reply(&result, &calls));
  retention.Cancel(); EXPECT_EQ(calls, 1); EXPECT_FALSE(result); EXPECT_FALSE(original);
  std::move(delayed).Run(); EXPECT_EQ(calls, 1); EXPECT_FALSE(result);
  EXPECT_FALSE(retention.RegisterFrame(Footprint(surface, 7), Surface(display_),
      retention.registered_at() + base::Milliseconds(3)));
}
TEST_F(NativeStartupFirstHardwareRetentionTest, DestroyedDisplayOwnerCannotDeliverIntoReplacement) {
  auto nonce = base::UnguessableToken::Create();
  auto retention = std::make_unique<NativeStartupFirstHardwareRetention>(nonce, display_, shell_);
  auto original = retention->GetWeakPtr();
  std::optional<NativeGuestInclusionResult> result; int calls = 0;
  retention->Join(nonce, Scope(*retention, Surface(shell_), 7), Reply(&result, &calls));
  retention.reset(); EXPECT_EQ(calls, 1); EXPECT_FALSE(result); EXPECT_FALSE(original);
  NativeStartupFirstHardwareRetention replacement(base::UnguessableToken::Create(), display_, shell_);
  EXPECT_TRUE(replacement.active());
  replacement.Join(nonce, Scope(replacement, Surface(shell_), 7), Reply(&result, &calls));
  EXPECT_EQ(calls, 2); EXPECT_FALSE(result); EXPECT_TRUE(replacement.active());
}
}  // namespace viz
