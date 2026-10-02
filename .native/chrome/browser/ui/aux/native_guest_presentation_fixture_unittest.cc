// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_guest_presentation_fixture.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include <limits>
#include "base/functional/bind.h"
#include "content/public/test/browser_task_environment.h"
#include "testing/gtest/include/gtest/gtest.h"
namespace aux {
namespace {
blink::mojom::NativeGuestStageScopePtr Scope() {
  auto scope = blink::mojom::NativeGuestStageScope::New();
  scope->metric = blink::mojom::NativeGuestStageMetric::kTabSwitch;
  scope->request_nonce = base::UnguessableToken::Create();
  scope->sample_sequence = 1; scope->window_id = 2;
  scope->shell_widget_routing_id = 3; scope->shell_renderer_pid = 4;
  scope->native_document_generation = 5;
  scope->shell_sink = viz::FrameSinkId(std::numeric_limits<uint32_t>::max(), 6);
  scope->display_sink = viz::FrameSinkId(7, 8);
  return scope;
}
TEST(NativeGuestPresentationFixtureTest, ReadyPreservesUnsignedFrameSinkIdentity) {
  auto scope = Scope(); auto record = EncodeGuestPresentationReady(*scope);
  ASSERT_TRUE(record.FindString("status")); EXPECT_EQ(*record.FindString("status"), "ready");
  const auto* sink = record.FindDict("shellSink"); ASSERT_TRUE(sink);
  EXPECT_EQ(sink->FindDouble("clientId"), static_cast<double>(std::numeric_limits<uint32_t>::max()));
  EXPECT_FALSE(record.contains("shellDocument"));
  EXPECT_FALSE(record.contains("url"));
}
TEST(NativeGuestPresentationFixtureTest, InvalidScopeNeverAdvertisesReadyIdentity) {
  auto scope = Scope(); scope->request_nonce = base::UnguessableToken();
  auto record = EncodeGuestPresentationReady(*scope);
  EXPECT_EQ(*record.FindString("status"), "refused");
  EXPECT_EQ(*record.FindString("reason"), "invalid_scope");
  EXPECT_FALSE(record.contains("windowId")); EXPECT_FALSE(record.contains("requestNonce"));
}
TEST(NativeGuestPresentationFixtureTest, ClaimedMeasurementWithoutNativeInputIsRefused) {
  auto scope = Scope();
  auto record = EncodeGuestPresentationComplete(scope.get(), nullptr, nullptr, std::nullopt, "measured");
  EXPECT_EQ(*record.FindString("status"), "refused");
  EXPECT_EQ(*record.FindString("reason"), "no_native_input");
  EXPECT_EQ(record.FindBool("measured"), false); EXPECT_FALSE(record.contains("elapsedUs"));
}
TEST(NativeGuestPresentationFixtureTest, NativeInputWithoutActualPresentationCannotMeasure) {
  auto scope = Scope(); const auto now = base::TimeTicks::Now();
  PerformanceInput input{{2, 3, 4, 5}, PerformanceInputKind::kKeyDown, now, now, 4};
  auto record = EncodeGuestPresentationComplete(scope.get(), nullptr, nullptr, input, "measured");
  EXPECT_EQ(*record.FindString("reason"), "invalid_presentation_pair");
  EXPECT_EQ(record.FindBool("measured"), false); EXPECT_FALSE(record.contains("elapsedUs"));
  EXPECT_TRUE(record.FindString("nativeInputUs"));
  record = EncodeGuestPresentationComplete(scope.get(), nullptr, nullptr, input, "stale_guest_document_lease");
  EXPECT_EQ(*record.FindString("reason"), "stale_guest_document_lease");
}
TEST(NativeGuestPresentationFixtureTest, MissingOwnerFailureMustBeConsumedBeforeAnotherSample) {
  content::BrowserTaskEnvironment environment;
  NativeGuestPresentationFixture fixture{base::WeakPtr<WebUIBrowserUI>()};
  std::optional<base::DictValue> first, blocked, completion, duplicate;
  fixture.Prepare(blink::mojom::NativeGuestStageMetric::kTabSwitch,
      base::BindOnce([](std::optional<base::DictValue>* output, base::DictValue result) {
        *output = std::move(result);
      }, &first));
  ASSERT_TRUE(first); EXPECT_EQ(*first->FindString("reason"), "unavailable_owned_scope");
  fixture.Prepare(blink::mojom::NativeGuestStageMetric::kSplitDrop,
      base::BindOnce([](std::optional<base::DictValue>* output, base::DictValue result) {
        *output = std::move(result);
      }, &blocked));
  ASSERT_TRUE(blocked); EXPECT_EQ(*blocked->FindString("reason"), "prior_sample_unconsumed");
  fixture.Complete(base::BindOnce([](std::optional<base::DictValue>* output, base::DictValue result) {
    *output = std::move(result);
  }, &completion));
  ASSERT_TRUE(completion); EXPECT_EQ(*completion->FindString("reason"), "unavailable_owned_scope");
  fixture.Complete(base::BindOnce([](std::optional<base::DictValue>* output, base::DictValue result) {
    *output = std::move(result);
  }, &duplicate));
  ASSERT_TRUE(duplicate); EXPECT_EQ(*duplicate->FindString("reason"), "no_prepared_sample");
}
TEST(NativeGuestPresentationFixtureTest, GeometryRequiresActualPixelFrameAndConnectorFloorCeilConversion) {
  blink::mojom::NativeGuestStageWitness witness;
  auto page = blink::mojom::NativeGuestStagePage::New();
  page->plugin_bounds_in_parent_pixels = gfx::Rect(3, 5, 101, 103);
  page->pane_bounds = gfx::RectF(3, 5, 101, 103); page->pane_radius = 0;
  witness.pages.push_back(std::move(page));
  NativeGuestStageOwnedSnapshot owner; NativeGuestPresentationOwner guest;
  guest.device_scale_factor = 1.25;
  guest.native_bounds_in_parent_dip = gfx::Rect(2, 4, 81, 83);
  guest.native_frame_size_in_pixels = gfx::Size(101, 103);
  owner.guests.push_back(guest);
  EXPECT_TRUE(NativeGuestStageGeometryMatches(witness, owner));
  owner.guests[0].native_bounds_in_parent_dip.set_x(3);
  EXPECT_FALSE(NativeGuestStageGeometryMatches(witness, owner));
  owner.guests[0] = guest; owner.guests[0].native_frame_size_in_pixels.set_width(1);
  EXPECT_FALSE(NativeGuestStageGeometryMatches(witness, owner));
  owner.guests[0] = guest; witness.pages[0]->plugin_bounds_in_parent_pixels.reset();
  EXPECT_FALSE(NativeGuestStageGeometryMatches(witness, owner));
}
}  // namespace
}  // namespace aux
#endif
