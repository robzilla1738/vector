// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_performance_mailbox.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include "chrome/browser/ui/aux/little_window_controller.h"
#include "chrome/browser/ui/browser.h"
#include "chrome/test/base/in_process_browser_test.h"
#include "content/public/test/browser_test.h"
#include "url/gurl.h"
namespace aux {
class NativePerformanceMailboxBrowserTest : public InProcessBrowserTest {};
IN_PROC_BROWSER_TEST_F(NativePerformanceMailboxBrowserTest, OnlyExactCreatedLittleCanCoexistWithOrigin) {
  auto* origin = browser();
  auto* little = OpenLittleWindow(origin->GetProfile(), GURL(), false, false);
  ASSERT_TRUE(little); ASSERT_TRUE(IsLittleWindow(little));
  EXPECT_TRUE(NativePerformanceOwnerInventoryMatches(origin, {}, {origin}));
  EXPECT_FALSE(NativePerformanceOwnerInventoryMatches(origin, {}, {origin, little}));
  EXPECT_TRUE(NativePerformanceOwnerInventoryMatches(origin, little->GetWeakPtr(), {origin, little}));
  EXPECT_FALSE(NativePerformanceOwnerInventoryMatches(origin, little->GetWeakPtr(), {origin, little, little}));
  EXPECT_FALSE(NativePerformanceOwnerInventoryMatches(little, {}, {little}));
}
IN_PROC_BROWSER_TEST_F(NativePerformanceMailboxBrowserTest, ForeignNormalAndOtherLittleNeverBorrowCleanupPermit) {
  auto* origin = browser();
  auto* little = OpenLittleWindow(origin->GetProfile(), GURL(), false, false);
  auto* other_little = OpenLittleWindow(origin->GetProfile(), GURL(), false, false);
  auto* foreign_normal = CreateBrowser(origin->GetProfile());
  ASSERT_TRUE(little); ASSERT_TRUE(other_little); ASSERT_TRUE(foreign_normal);
  EXPECT_FALSE(NativePerformanceOwnerInventoryMatches(origin, little->GetWeakPtr(), {origin, little, foreign_normal}));
  EXPECT_FALSE(NativePerformanceOwnerInventoryMatches(origin, little->GetWeakPtr(), {origin, little, other_little}));
  EXPECT_FALSE(NativePerformanceOwnerInventoryMatches(origin, foreign_normal->GetWeakPtr(), {origin, foreign_normal}));
}
}  // namespace aux
#endif
