// Copyright 2026 The Aux Authors
// Synthetic raw-pair contract tests; not native performance trials.
#include "chrome/browser/ui/aux/native_command_presentation_session.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include "testing/gtest/include/gtest/gtest.h"
#include "base/test/test_future.h"
#include "content/public/test/browser_task_environment.h"
#include "ui/gfx/presentation_feedback.h"
namespace aux {
namespace {
blink::mojom::NativeCommandPresentationResultPtr Sample() {
  auto sample = blink::mojom::NativeCommandPresentationResult::New();
  sample->scope = blink::mojom::NativeCommandPresentationScope::New();
  sample->scope->window_id = 1; sample->scope->content_id = 2;
  sample->scope->renderer_pid = 3; sample->scope->document_generation = 4;
  sample->scope->frame_sink = viz::FrameSinkId(5, 6);
  sample->scope->source = blink::mojom::NativeCommandPresentationSource::kHistory;
  sample->scope->surface_mode = blink::mojom::NativeCommandPresentationMode::kNewTab;
  sample->measured = true; sample->frame_token = 71;
  sample->activated = true; sample->submitted_frame = true; sample->submission_failure = -1;
  sample->input = base::TimeTicks() + base::Seconds(1);
  sample->mutation = sample->input + base::Milliseconds(1);
  sample->commit = sample->input + base::Milliseconds(2);
  sample->submitted = sample->input + base::Milliseconds(3);
  sample->timing.received_compositor_frame_timestamp = sample->input + base::Milliseconds(4);
  sample->timing.embedded_frame_timestamp = sample->input + base::Milliseconds(5);
  sample->timing.draw_start_timestamp = sample->input + base::Milliseconds(6);
  sample->timing.presentation_feedback = gfx::PresentationFeedback(
      sample->input + base::Microseconds(30004), base::Microseconds(16667),
      gfx::PresentationFeedback::kHWCompletion);
  return sample;
}
PerformanceInput Input(const blink::mojom::NativeCommandPresentationResult& sample) {
  return PerformanceInput{{1, 2, 3, 4}, PerformanceInputKind::kKeyDown,
      sample.input, sample.input + base::Microseconds(1), 0};
}
TEST(NativeCommandPresentationSession, MissingOwnedWindowResolvesWithoutReadyOrMeasuredResult) {
  content::BrowserTaskEnvironment environment;
  NativeCommandPresentationSession session{base::WeakPtr<WebUIBrowserUI>()};
  base::test::TestFuture<bool, base::DictValue> result;
  EXPECT_FALSE(session.Prepare(result.GetCallback()));
  ASSERT_TRUE(result.IsReady());
  EXPECT_FALSE(result.Get<0>());
  EXPECT_EQ(result.Get<1>().FindBool("measured"), false);
  EXPECT_EQ(*result.Get<1>().FindString("reason"), "unavailable_owned_scope");
  session.Cancel();
}
TEST(NativeCommandPresentationPair, PreservesRawFractionalBoundary) {
  auto sample = Sample();
  const auto elapsed = ValidateCommandPresentationPair(*sample, Input(*sample),
      sample->timing.presentation_feedback.timestamp);
  if (!base::TimeTicks::IsConsistentAcrossProcesses()) { EXPECT_FALSE(elapsed); return; }
  ASSERT_TRUE(elapsed); EXPECT_EQ(elapsed->InMicroseconds(), 30004);
  EXPECT_GT(elapsed->InMillisecondsF(), 30.0);
}
TEST(NativeCommandPresentationPair, RetainsAllThreeObservedModeSourcePairs) {
  auto sample = Sample();
  const auto observed = sample->timing.presentation_feedback.timestamp;
  if (!base::TimeTicks::IsConsistentAcrossProcesses()) return;
  EXPECT_TRUE(ValidateCommandPresentationPair(*sample, Input(*sample), observed));
  sample->scope->surface_mode = blink::mojom::NativeCommandPresentationMode::kEdit;
  EXPECT_TRUE(ValidateCommandPresentationPair(*sample, Input(*sample), observed));
  sample->scope->surface_mode = blink::mojom::NativeCommandPresentationMode::kCommand;
  EXPECT_FALSE(ValidateCommandPresentationPair(*sample, Input(*sample), observed));
  sample->scope->source = blink::mojom::NativeCommandPresentationSource::kRegistry;
  EXPECT_TRUE(ValidateCommandPresentationPair(*sample, Input(*sample), observed));
  sample->scope->surface_mode = blink::mojom::NativeCommandPresentationMode::kObserveCurrent;
  EXPECT_FALSE(ValidateCommandPresentationPair(*sample, Input(*sample), observed));
  sample->scope->surface_mode = blink::mojom::NativeCommandPresentationMode::kEdit;
  EXPECT_FALSE(ValidateCommandPresentationPair(*sample, Input(*sample), observed));
}
TEST(NativeCommandPresentationPair, RefusesForeignNativeIdentityAndDifferentInputClock) {
  auto sample = Sample(); auto input = Input(*sample);
  input.target.window_id = 9;
  EXPECT_FALSE(ValidateCommandPresentationPair(*sample, input, sample->timing.presentation_feedback.timestamp));
  input = Input(*sample); input.target.document_generation = 5;
  EXPECT_FALSE(ValidateCommandPresentationPair(*sample, input, sample->timing.presentation_feedback.timestamp));
  input = Input(*sample); input.event_ticks += base::Microseconds(1);
  EXPECT_FALSE(ValidateCommandPresentationPair(*sample, input, sample->timing.presentation_feedback.timestamp));
}
TEST(NativeCommandPresentationPair, RefusesReceiptEarlierThanActualSubmissionEvenBeforeHardwareFeedback) {
  auto sample = Sample(); auto input = Input(*sample);
  // Every older check still passes: mutation <= commit <= submitted and
  // commit <= receipt <= embed <= draw <= HW. Only this real causal link fails.
  sample->submitted = sample->timing.received_compositor_frame_timestamp + base::Microseconds(1);
  EXPECT_FALSE(ValidateCommandPresentationPair(*sample, input, sample->timing.presentation_feedback.timestamp));
}
TEST(NativeCommandPresentationPair, RefusesMissingInclusionAndFailedSubmission) {
  auto sample = Sample(); auto input = Input(*sample);
  sample->timing.embedded_frame_timestamp = base::TimeTicks();
  EXPECT_FALSE(ValidateCommandPresentationPair(*sample, input, sample->timing.presentation_feedback.timestamp));
  sample = Sample(); sample->submission_failure = 0;
  EXPECT_FALSE(ValidateCommandPresentationPair(*sample, input, sample->timing.presentation_feedback.timestamp));
  sample = Sample(); sample->measured = false;
  EXPECT_FALSE(ValidateCommandPresentationPair(*sample, input, sample->timing.presentation_feedback.timestamp));
}
}  // namespace
}  // namespace aux
#endif
