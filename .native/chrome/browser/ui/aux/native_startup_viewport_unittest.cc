// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_startup_viewport.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include <limits>
#include "content/public/test/browser_task_environment.h"
#include "testing/gtest/include/gtest/gtest.h"
namespace aux {
namespace {
NativeStartupViewportGeometry WholeShell() {
  NativeStartupViewportGeometry result;
  result.shell_screen = gfx::Rect(100, 128, 800, 600);
  result.client_screen = result.shell_screen;
  result.root_screen = gfx::Rect(100, 100, 800, 628);
  result.shell_pixels = gfx::Size(1600, 1200);
  result.root_pixels = gfx::Size(1600, 1256);
  result.shell_scale = 2;
  result.root_scale = 2;
  return result;
}
TEST(NativeStartupViewport, WholeClientUsesNativeRootOffset) {
  EXPECT_EQ(ValidateNativeStartupViewportGeometry(WholeShell()), gfx::Rect(0, 56, 1600, 1200));
  auto negative_screen = WholeShell();
  negative_screen.root_screen.Offset(-1000, -1000);
  negative_screen.client_screen.Offset(-1000, -1000);
  negative_screen.shell_screen.Offset(-1000, -1000);
  EXPECT_EQ(ValidateNativeStartupViewportGeometry(negative_screen), gfx::Rect(0, 56, 1600, 1200));
}
TEST(NativeStartupViewport, EmptyPartialForeignAndClippedClientRefused) {
  auto g = WholeShell(); g.shell_screen = gfx::Rect();
  EXPECT_FALSE(ValidateNativeStartupViewportGeometry(g));
  g = WholeShell(); g.shell_screen.set_height(1);
  EXPECT_FALSE(ValidateNativeStartupViewportGeometry(g));
  g = WholeShell(); g.client_screen.Offset(1, 0);
  EXPECT_FALSE(ValidateNativeStartupViewportGeometry(g));
  g = WholeShell(); g.root_screen.set_height(600);
  EXPECT_FALSE(ValidateNativeStartupViewportGeometry(g));
}
TEST(NativeStartupViewport, BackingSizeAndScaleMustAgree) {
  auto g = WholeShell(); g.shell_pixels.set_width(1599);
  EXPECT_FALSE(ValidateNativeStartupViewportGeometry(g));
  g = WholeShell(); g.root_pixels.set_height(1255);
  EXPECT_FALSE(ValidateNativeStartupViewportGeometry(g));
  g = WholeShell(); g.shell_scale = 1;
  EXPECT_FALSE(ValidateNativeStartupViewportGeometry(g));
  for (const float scale : {0.0f, -1.0f, std::numeric_limits<float>::infinity(),
                            std::numeric_limits<float>::quiet_NaN()}) {
    g = WholeShell(); g.shell_scale = scale; g.root_scale = scale;
    EXPECT_FALSE(ValidateNativeStartupViewportGeometry(g));
  }
}
TEST(NativeStartupViewport, NoBrowserOwnerCannotReadViewport) {
  content::BrowserTaskEnvironment task_environment;
  EXPECT_FALSE(ReadNativeStartupViewport({}));
}
}  // namespace
}  // namespace aux
#endif
