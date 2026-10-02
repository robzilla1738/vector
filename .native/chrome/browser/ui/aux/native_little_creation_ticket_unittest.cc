// Copyright 2026 The Aux Authors
// Synthetic pairing tests only, never native presentation trials.
#include "chrome/browser/ui/aux/native_little_creation_ticket.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include "components/viz/common/surfaces/local_surface_id.h"
#include "testing/gtest/include/gtest/gtest.h"
namespace aux {
namespace {
struct Pair {
  base::TimeTicks arm = base::TimeTicks() + base::Seconds(1);
  NativeGuestPresentationOwner owner;
  viz::mojom::NativeGuestInclusionResultPtr sample;
  Pair();
  ~Pair();
};
Pair::Pair() {
  owner.shell_sink = viz::FrameSinkId(1, 1); owner.display_sink = viz::FrameSinkId(2, 2);
  owner.guest_surface = viz::SurfaceId(viz::FrameSinkId(3, 3),
      viz::LocalSurfaceId(1, base::UnguessableToken::Create()));
  owner.device_scale_factor = 1;
  owner.native_bounds_in_parent_dip = gfx::Rect(0, 50, 400, 300);
  owner.native_frame_size_in_pixels = gfx::Size(400, 300);
  sample = viz::mojom::NativeGuestInclusionResult::New();
  sample->scope = viz::mojom::NativeGuestInclusionScope::New();
  sample->scope->display_sink = owner.display_sink; sample->scope->shell_sink = owner.shell_sink;
  sample->scope->mutation_shell_token = 7; sample->scope->input = arm;
  sample->scope->mutation = arm + base::Milliseconds(200);
  sample->scope->shell_submission = arm + base::Milliseconds(210);
  sample->scope->guests = {owner.guest_surface};
  sample->scope->shapes.push_back(viz::mojom::NativeGuestExpectedShape::New(
      owner.guest_surface, owner.native_bounds_in_parent_dip,
      gfx::RectF(owner.native_bounds_in_parent_dip), 0));
  sample->drawn.push_back(viz::mojom::NativeDrawnGuest::New(
      viz::SurfaceId(owner.shell_sink, viz::LocalSurfaceId(1, base::UnguessableToken::Create())),
      7, gfx::Rect(0, 0, 400, 350), gfx::Size(400, 350)));
  sample->drawn.push_back(viz::mojom::NativeDrawnGuest::New(owner.guest_surface, 9,
      owner.native_bounds_in_parent_dip, owner.native_frame_size_in_pixels));
  sample->display_surface = viz::SurfaceId(owner.display_sink,
      viz::LocalSurfaceId(1, base::UnguessableToken::Create()));
  sample->draw = arm + base::Milliseconds(220);
  sample->swap.swap_start = arm + base::Milliseconds(221);
  sample->swap.swap_end = arm + base::Milliseconds(222);
  sample->feedback = gfx::PresentationFeedback(arm + base::Milliseconds(450),
      base::Microseconds(16667), gfx::PresentationFeedback::kHWCompletion);
  sample->elapsed = base::Milliseconds(450); sample->measured = true;
}
Pair::~Pair() = default;
TEST(NativeLittleHardwareUpperBound, PositiveRetainsWholeTriggerDuration) {
  Pair p;
  EXPECT_EQ(ValidateLittleHardwareUpperBound(p.arm, p.arm + base::Milliseconds(180),
      p.owner, *p.sample, p.arm + base::Milliseconds(460)), base::Milliseconds(450));
  // No transport/setup/mutation subtraction to manufacture a smaller metric.
  EXPECT_FALSE(ValidateLittleHardwareUpperBound(p.arm + base::Milliseconds(100),
      p.arm + base::Milliseconds(180), p.owner, *p.sample, p.arm + base::Milliseconds(460)));
}
TEST(NativeLittleHardwareUpperBound, MissingHardwareOrCausalOrderCannotMeasure) {
  Pair p; const auto committed = p.arm + base::Milliseconds(180), observed = p.arm + base::Milliseconds(460);
  p.sample->feedback.flags = 0;
  EXPECT_FALSE(ValidateLittleHardwareUpperBound(p.arm, committed, p.owner, *p.sample, observed));
  p.sample->feedback.flags = gfx::PresentationFeedback::kHWCompletion;
  p.sample->scope->shell_submission = p.arm + base::Milliseconds(170);
  EXPECT_FALSE(ValidateLittleHardwareUpperBound(p.arm, committed, p.owner, *p.sample, observed));
  p.sample->scope->shell_submission = p.arm + base::Milliseconds(210);
  p.sample->swap.swap_end = p.arm + base::Milliseconds(219);
  EXPECT_FALSE(ValidateLittleHardwareUpperBound(p.arm, committed, p.owner, *p.sample, observed));
}
TEST(NativeLittleHardwareUpperBound, ForeignSurfacePartialShapeAndWrongRootAreRefused) {
  Pair p; const auto committed = p.arm + base::Milliseconds(180), observed = p.arm + base::Milliseconds(460);
  const auto surface = p.owner.guest_surface;
  p.owner.guest_surface = viz::SurfaceId(viz::FrameSinkId(3, 3),
      viz::LocalSurfaceId(2, base::UnguessableToken::Create()));
  EXPECT_FALSE(ValidateLittleHardwareUpperBound(p.arm, committed, p.owner, *p.sample, observed));
  p.owner.guest_surface = surface;
  p.sample->scope->shapes.front()->inner_in_shell_pixels.set_width(1);
  EXPECT_FALSE(ValidateLittleHardwareUpperBound(p.arm, committed, p.owner, *p.sample, observed));
  p.sample->scope->shapes.front()->inner_in_shell_pixels = p.owner.native_bounds_in_parent_dip;
  p.sample->drawn.front()->token = 8;
  EXPECT_FALSE(ValidateLittleHardwareUpperBound(p.arm, committed, p.owner, *p.sample, observed));
}
}  // namespace
}  // namespace aux
#endif
