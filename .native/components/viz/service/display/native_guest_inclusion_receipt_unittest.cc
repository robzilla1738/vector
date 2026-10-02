// Copyright 2026 The Aux Authors
// Synthetic exact-inclusion contracts, never native paint trials.
#include "components/viz/service/display/native_guest_inclusion_receipt.h"
#include "base/unguessable_token.h"
#include "testing/gtest/include/gtest/gtest.h"
namespace viz {
namespace {
SurfaceId Surface(FrameSinkId sink) {
  return SurfaceId(sink, LocalSurfaceId(1, base::UnguessableToken::Create()));
}
NativeGuestInclusionScope Scope() {
  const auto input = base::TimeTicks() + base::Seconds(1);
  NativeGuestInclusionScope scope{FrameSinkId(1, 1), FrameSinkId(2, 2), 77, input,
      input + base::Milliseconds(1), input + base::Milliseconds(2),
      {Surface(FrameSinkId(3, 3)), Surface(FrameSinkId(4, 4))}, {}};
  scope.shapes = {{scope.guests[0], gfx::Rect(0, 0, 400, 600), gfx::RectF(0, 0, 400, 600), 0},
      {scope.guests[1], gfx::Rect(400, 0, 400, 600), gfx::RectF(400, 0, 400, 600), 0}};
  return scope;
}
NativeGuestInclusionResult Finish(NativeGuestInclusionReceipt& receipt,
    const NativeGuestInclusionScope& scope) {
  gfx::SwapTimings swap;
  swap.swap_start = scope.input + base::Milliseconds(4);
  swap.swap_end = scope.input + base::Milliseconds(5);
  gfx::PresentationFeedback feedback(scope.input + base::Microseconds(150004),
      base::Microseconds(16667), gfx::PresentationFeedback::kHWCompletion);
  return receipt.Present(Surface(scope.display_sink), scope.input + base::Milliseconds(3),
      swap, feedback, feedback.timestamp);
}
void DrawAll(NativeGuestInclusionReceipt& receipt, const NativeGuestInclusionScope& scope) {
  const auto shell = Surface(scope.shell_sink);
  receipt.BindShellPlacement(shell, scope.mutation_shell_token, gfx::Rect(0, 0, 800, 600),
      gfx::Transform(), std::nullopt, false);
  receipt.RecordDrawnSurface(shell, scope.mutation_shell_token);
  receipt.RecordEmittedSurface(shell, scope.mutation_shell_token, gfx::Rect(0, 0, 800, 600), 1.0f, gfx::Size(800, 600));
  // Guest tokens intentionally differ from the post-mutation shell token.
  receipt.RecordDrawnSurface(scope.guests[0], 8);
  receipt.RecordDrawnSurface(scope.guests[1], 9);
  receipt.BoundGuestCoverage(scope.guests[0], gfx::Rect(0, 0, 400, 600), gfx::Rect(0, 0, 400, 600),
      gfx::Transform(), std::nullopt, std::nullopt, gfx::MaskFilterInfo(), gfx::MaskFilterInfo());
  gfx::Transform right; right.Translate(400, 0);
  receipt.BoundGuestCoverage(scope.guests[1], gfx::Rect(0, 0, 400, 600), gfx::Rect(0, 0, 400, 600),
      right, std::nullopt, std::nullopt, gfx::MaskFilterInfo(), gfx::MaskFilterInfo());
  receipt.RecordEmittedSurface(scope.guests[0], 8, gfx::Rect(0, 0, 400, 600), 1.0f, gfx::Size(400, 600));
  receipt.RecordEmittedSurface(scope.guests[1], 9, gfx::Rect(400, 0, 400, 600), 1.0f, gfx::Size(400, 600));
}
NativeGuestInclusionScope StartupScope() {
  auto scope = Scope(); scope.guests.clear(); scope.shapes.clear();
  scope.kind = NativeInclusionScopeKind::kShellStartup;
  scope.startup_shell = Surface(scope.shell_sink);
  scope.startup_shell_size = gfx::Size(800, 600);
  scope.startup_shell_bounds = gfx::Rect(0, 0, 800, 600);
  return scope;
}
void DrawStartup(NativeGuestInclusionReceipt& receipt, const NativeGuestInclusionScope& scope,
    const gfx::Rect& full = gfx::Rect(0, 0, 800, 600),
    const std::optional<gfx::Rect>& clip = std::nullopt, bool masked = false,
    float opacity = 1.0f) {
  ASSERT_TRUE(scope.startup_shell);
  receipt.BindShellPlacement(*scope.startup_shell, scope.mutation_shell_token,
      full, gfx::Transform(), clip, masked);
  receipt.RecordDrawnSurface(*scope.startup_shell, scope.mutation_shell_token);
  receipt.RecordEmittedSurface(*scope.startup_shell, scope.mutation_shell_token,
      full, opacity, full.size());
}
TEST(NativeShellStartupInclusion, ExactOwnedFullShellStillRequiresHardwareAndIsOneUse) {
  const auto scope = StartupScope(); NativeGuestInclusionReceipt receipt(scope);
  DrawStartup(receipt, scope); const auto measured = Finish(receipt, scope);
  if (!base::TimeTicks::IsConsistentAcrossProcesses()) { EXPECT_FALSE(measured.measured); return; }
  ASSERT_TRUE(measured.measured); ASSERT_EQ(measured.drawn.size(), 1u);
  EXPECT_EQ(measured.drawn.front().surface, *scope.startup_shell);
  EXPECT_EQ(measured.drawn.front().token, scope.mutation_shell_token);
  EXPECT_FALSE(Finish(receipt, scope).measured);
}
TEST(NativeShellStartupInclusion, GuestDefaultCannotBorrowEmptyStartupScope) {
  auto scope = StartupScope(); scope.kind = NativeInclusionScopeKind::kGuestStage;
  NativeGuestInclusionReceipt receipt(scope); DrawStartup(receipt, scope);
  EXPECT_FALSE(Finish(receipt, scope).measured);
  scope.startup_shell.reset(); scope.startup_shell_size = gfx::Size(); scope.startup_shell_bounds = gfx::Rect();
  NativeGuestInclusionReceipt empty(scope); EXPECT_FALSE(Finish(empty, scope).measured);
}
TEST(NativeShellStartupInclusion, UnknownKindAndStartupWithGuestsNeverCount) {
  auto scope = StartupScope(); scope.kind = static_cast<NativeInclusionScopeKind>(99);
  NativeGuestInclusionReceipt unknown(scope); DrawStartup(unknown, scope); EXPECT_FALSE(Finish(unknown, scope).measured);
  scope = StartupScope(); const auto guests = Scope(); scope.guests = guests.guests; scope.shapes = guests.shapes;
  NativeGuestInclusionReceipt mixed(scope); DrawStartup(mixed, scope); EXPECT_FALSE(Finish(mixed, scope).measured);
}
TEST(NativeShellStartupInclusion, MissingSizeBoundsAndForeignSinkNeverCount) {
  for (int mutation = 0; mutation < 4; ++mutation) {
    auto scope = StartupScope();
    if (mutation == 0) scope.startup_shell_size = gfx::Size();
    if (mutation == 1) scope.startup_shell_bounds = gfx::Rect();
    if (mutation == 2) scope.startup_shell = Surface(FrameSinkId(99, 99));
    if (mutation == 3) scope.startup_shell = Surface(scope.display_sink);
    NativeGuestInclusionReceipt receipt(scope); DrawStartup(receipt, scope); EXPECT_FALSE(Finish(receipt, scope).measured);
  }
  auto scope = StartupScope(); scope.startup_shell.reset();
  NativeGuestInclusionReceipt missing(scope); EXPECT_FALSE(Finish(missing, scope).measured);
}
TEST(NativeShellStartupInclusion, PartialTinyMaskedAndTransparentEmissionNeverCount) {
  const auto scope = StartupScope();
  for (const auto& rect : {gfx::Rect(), gfx::Rect(0, 0, 1, 1), gfx::Rect(0, 0, 799, 600)}) {
    NativeGuestInclusionReceipt receipt(scope); DrawStartup(receipt, scope, rect); EXPECT_FALSE(Finish(receipt, scope).measured);
  }
  NativeGuestInclusionReceipt clipped(scope); DrawStartup(clipped, scope, gfx::Rect(0, 0, 800, 600), gfx::Rect(0, 0, 1, 1));
  EXPECT_FALSE(Finish(clipped, scope).measured);
  NativeGuestInclusionReceipt masked(scope); DrawStartup(masked, scope, gfx::Rect(0, 0, 800, 600), std::nullopt, true);
  EXPECT_FALSE(Finish(masked, scope).measured);
  NativeGuestInclusionReceipt transparent(scope); DrawStartup(transparent, scope, gfx::Rect(0, 0, 800, 600), std::nullopt, false, 0.0f);
  EXPECT_FALSE(Finish(transparent, scope).measured);
}
TEST(NativeShellStartupInclusion, WrongLocalSurfaceTokenOrPlacementNeverCount) {
  auto scope = StartupScope(); NativeGuestInclusionReceipt foreign(scope);
  foreign.BindShellPlacement(Surface(scope.shell_sink), scope.mutation_shell_token,
      gfx::Rect(0, 0, 800, 600), gfx::Transform(), std::nullopt, false);
  EXPECT_FALSE(Finish(foreign, scope).measured);
  NativeGuestInclusionReceipt wrong_token(scope);
  wrong_token.BindShellPlacement(*scope.startup_shell, scope.mutation_shell_token - 1,
      gfx::Rect(0, 0, 800, 600), gfx::Transform(), std::nullopt, false);
  EXPECT_FALSE(Finish(wrong_token, scope).measured);
  scope.startup_shell_bounds = gfx::Rect(1, 0, 800, 600);
  NativeGuestInclusionReceipt shifted(scope); DrawStartup(shifted, scope); EXPECT_FALSE(Finish(shifted, scope).measured);
}
TEST(NativeShellStartupInclusion, EmittedHierarchyAloneAndSoftwareFeedbackNeverCount) {
  const auto scope = StartupScope(); NativeGuestInclusionReceipt no_emission(scope);
  no_emission.BindShellPlacement(*scope.startup_shell, scope.mutation_shell_token,
      gfx::Rect(0, 0, 800, 600), gfx::Transform(), std::nullopt, false);
  no_emission.RecordDrawnSurface(*scope.startup_shell, scope.mutation_shell_token);
  EXPECT_FALSE(Finish(no_emission, scope).measured);
  NativeGuestInclusionReceipt software(scope); DrawStartup(software, scope);
  gfx::SwapTimings swap; swap.swap_start = scope.input + base::Milliseconds(4); swap.swap_end = scope.input + base::Milliseconds(5);
  const auto stamp = scope.input + base::Milliseconds(6);
  EXPECT_FALSE(software.Present(Surface(scope.display_sink), scope.input + base::Milliseconds(3), swap,
      gfx::PresentationFeedback(stamp, base::Microseconds(16667), 0), stamp).measured);
}
TEST(NativeGuestCoverage, UsesRealTransformedChildInsteadOfPositiveClip) {
  gfx::Transform transform; transform.Translate(100, 20); transform.Scale(2, 2);
  const gfx::Rect child(0, 0, 400, 300), full(100, 20, 800, 600);
  EXPECT_EQ(NativeGuestFullCoverage(child, child, transform, full, std::nullopt, false), full);
  EXPECT_FALSE(NativeGuestFullCoverage(child, child, transform, gfx::Rect(100, 20, 1, 1), std::nullopt, false));
  EXPECT_FALSE(NativeGuestFullCoverage(child, gfx::Rect(0, 0, 399, 300), transform, full, std::nullopt, false));
  EXPECT_FALSE(NativeGuestFullCoverage(child, child, transform, full, gfx::Rect(100, 20, 799, 600), false));
}
TEST(NativeGuestCoverage, MasksAndUnsupportedTransformsNeverCount) {
  gfx::Transform transform; const gfx::Rect child(0, 0, 400, 300);
  EXPECT_FALSE(NativeGuestFullCoverage(child, child, transform, std::nullopt, std::nullopt, true));
  transform.Rotate(45);
  EXPECT_FALSE(NativeGuestFullCoverage(child, child, transform, std::nullopt, std::nullopt, false));
  EXPECT_FALSE(NativeGuestFullCoverage(gfx::Rect(), gfx::Rect(), gfx::Transform(), std::nullopt, std::nullopt, false));
}
TEST(NativeGuestCoverage, AuthenticatedHeaderShiftedRoundedPaneOnly) {
  auto scope = Scope();
  scope.shapes[0] = {scope.guests[0], gfx::Rect(0, 24, 400, 576), gfx::RectF(0, 0, 400, 600), 6};
  NativeGuestInclusionReceipt receipt(scope);
  const auto shell = Surface(scope.shell_sink);
  receipt.BindShellPlacement(shell, scope.mutation_shell_token, gfx::Rect(0, 0, 800, 600),
      gfx::Transform(), std::nullopt, false);
  gfx::Transform position; position.Translate(0, 24);
  const gfx::Rect child(0, 0, 400, 576);
  const gfx::MaskFilterInfo canonical(gfx::RRectF(gfx::RectF(0, 0, 400, 600), 6));
  EXPECT_EQ(receipt.BoundGuestCoverage(scope.guests[0], child, child, position,
      std::nullopt, std::nullopt, canonical, gfx::MaskFilterInfo()), gfx::Rect(0, 24, 400, 576));
  EXPECT_FALSE(receipt.BoundGuestCoverage(scope.guests[0], child, child, position,
      std::nullopt, std::nullopt, gfx::MaskFilterInfo(), gfx::MaskFilterInfo()));
  const gfx::MaskFilterInfo arbitrary(gfx::RRectF(gfx::RectF(0, 0, 400, 600), 7));
  EXPECT_FALSE(receipt.BoundGuestCoverage(scope.guests[0], child, child, position,
      std::nullopt, std::nullopt, arbitrary, gfx::MaskFilterInfo()));
  const gfx::MaskFilterInfo gradient(gfx::RRectF(gfx::RectF(0, 0, 400, 600), 6), gfx::LinearGradient());
  EXPECT_FALSE(receipt.BoundGuestCoverage(scope.guests[0], child, child, position,
      std::nullopt, std::nullopt, gradient, gfx::MaskFilterInfo()));
  EXPECT_FALSE(receipt.BoundGuestCoverage(scope.guests[0], child, child, position,
      gfx::Rect(0, 24, 1, 1), std::nullopt, canonical, gfx::MaskFilterInfo()));
  EXPECT_FALSE(receipt.BoundGuestCoverage(scope.guests[0], child, gfx::Rect(0, 0, 399, 576), position,
      std::nullopt, std::nullopt, canonical, gfx::MaskFilterInfo()));
}
TEST(NativeGuestCoverage, MissingShellPlacementAndUnboundShapeNeverCount) {
  const auto scope = Scope(); NativeGuestInclusionReceipt receipt(scope);
  EXPECT_FALSE(receipt.BoundGuestCoverage(scope.guests[0], gfx::Rect(0, 0, 400, 600),
      gfx::Rect(0, 0, 400, 600), gfx::Transform(), std::nullopt, std::nullopt,
      gfx::MaskFilterInfo(), gfx::MaskFilterInfo()));
  receipt.BindShellPlacement(Surface(scope.shell_sink), scope.mutation_shell_token,
      gfx::Rect(0, 0, 800, 600), gfx::Transform(), std::nullopt, false);
  EXPECT_FALSE(receipt.BoundGuestCoverage(Surface(scope.guests[0].frame_sink_id()),
      gfx::Rect(0, 0, 400, 600), gfx::Rect(0, 0, 400, 600), gfx::Transform(),
      std::nullopt, std::nullopt, gfx::MaskFilterInfo(), gfx::MaskFilterInfo()));
}
TEST(NativeGuestInclusion, ReusedGuestTokensCanCountOnlyInExactNewDisplayGroup) {
  const auto scope = Scope(); NativeGuestInclusionReceipt receipt(scope); DrawAll(receipt, scope);
  const auto result = Finish(receipt, scope);
  if (!base::TimeTicks::IsConsistentAcrossProcesses()) { EXPECT_FALSE(result.measured); return; }
  ASSERT_TRUE(result.measured); ASSERT_TRUE(result.elapsed);
  EXPECT_EQ(result.elapsed->InMicroseconds(), 150004);
  EXPECT_GT(result.elapsed->InMillisecondsF(), 150.0);
  EXPECT_FALSE(Finish(receipt, scope).measured);
}
TEST(NativeGuestInclusion, MissingPaneAndWrongLocalSurfaceCannotCount) {
  const auto scope = Scope(); NativeGuestInclusionReceipt receipt(scope);
  receipt.RecordDrawnSurface(Surface(scope.shell_sink), scope.mutation_shell_token);
  receipt.RecordDrawnSurface(scope.guests[0], 8);
  receipt.RecordDrawnSurface(Surface(scope.guests[1].frame_sink_id()), 9);
  EXPECT_FALSE(Finish(receipt, scope).measured);
}
TEST(NativeGuestInclusion, DrawHierarchyWithoutEmittedVisibleContentCannotCount) {
  const auto scope = Scope(); NativeGuestInclusionReceipt receipt(scope);
  receipt.RecordDrawnSurface(Surface(scope.shell_sink), scope.mutation_shell_token);
  receipt.RecordDrawnSurface(scope.guests[0], 8); receipt.RecordDrawnSurface(scope.guests[1], 9);
  receipt.RecordEmittedSurface(scope.guests[0], 8, gfx::Rect(), 1.0f, gfx::Size(400, 600));
  receipt.RecordEmittedSurface(scope.guests[1], 9, gfx::Rect(0, 0, 400, 600), 0.0f, gfx::Size(400, 600));
  EXPECT_FALSE(Finish(receipt, scope).measured);
}
TEST(NativeGuestInclusion, OlderShellTokenAndFailureFeedbackCannotCount) {
  const auto scope = Scope(); NativeGuestInclusionReceipt receipt(scope);
  receipt.RecordDrawnSurface(Surface(scope.shell_sink), scope.mutation_shell_token - 1);
  receipt.RecordDrawnSurface(scope.guests[0], 8); receipt.RecordDrawnSurface(scope.guests[1], 9);
  EXPECT_FALSE(Finish(receipt, scope).measured);
  NativeGuestInclusionReceipt failure(scope); DrawAll(failure, scope);
  EXPECT_FALSE(failure.Present(Surface(scope.display_sink), base::TimeTicks(),
      gfx::SwapTimings(), gfx::PresentationFeedback::Failure(), base::TimeTicks::Now()).measured);
}
}  // namespace
}  // namespace viz
