// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_person_capture_controller.h"
#include "base/functional/bind.h"
#include "base/test/bind.h"
#include "content/public/test/browser_task_environment.h"
#include "content/public/test/test_browser_context.h"
#include "content/public/test/web_contents_tester.h"
#include "testing/gtest/include/gtest/gtest.h"
namespace aux {
namespace {
TEST(NativePersonCaptureOwnerTest, ReservesBeforeOriginalGuardCanReenter) {
  content::BrowserTaskEnvironment tasks; content::TestBrowserContext context;
  auto contents = content::WebContentsTester::CreateTestWebContents(&context, nullptr);
  NativePersonCaptureController::CreateForWebContents(contents.get());
  auto* owner = NativePersonCaptureController::FromWebContents(contents.get());
  int guards = 0, nested_replies = 0, original_replies = 0;
  owner->Capture({}, base::BindLambdaForTesting([&] {
    ++guards;
    owner->Capture({}, base::BindRepeating([] { ADD_FAILURE() << "Nested operation reached authority"; return true; }),
        base::BindLambdaForTesting([&](base::DictValue result) { ++nested_replies; EXPECT_TRUE(result.FindDict("error")); }));
    return false;
  }), base::BindLambdaForTesting([&](base::DictValue result) { ++original_replies; EXPECT_TRUE(result.FindDict("error")); }));
  EXPECT_EQ(1, guards); EXPECT_EQ(1, nested_replies); EXPECT_EQ(1, original_replies);
  // No mask was dispatched: known-unmasked refusal permits a fresh operation.
  owner->Capture({}, base::BindRepeating([] { return false; }),
      base::BindLambdaForTesting([&](base::DictValue result) { ++original_replies; EXPECT_TRUE(result.FindDict("error")); }));
  EXPECT_EQ(2, original_replies);
}
TEST(NativePersonCaptureOwnerTest, OriginalGuardMayDestroyItsController) {
  content::BrowserTaskEnvironment tasks; content::TestBrowserContext context;
  auto contents = content::WebContentsTester::CreateTestWebContents(&context, nullptr);
  NativePersonCaptureController::CreateForWebContents(contents.get());
  auto* owner = NativePersonCaptureController::FromWebContents(contents.get());
  const auto weak = owner->GetWeakPtr(); int replies = 0;
  owner->Capture({}, base::BindLambdaForTesting([&] { contents.reset(); return true; }),
      base::BindLambdaForTesting([&](base::DictValue result) { ++replies; EXPECT_FALSE(weak); EXPECT_TRUE(result.FindDict("error")); }));
  EXPECT_FALSE(weak); EXPECT_EQ(1, replies);
}
TEST(NativePersonCaptureOwnerTest, DirectOwnerRemovalInvalidatesWeakBeforeOriginalFailureReply) {
  content::BrowserTaskEnvironment tasks; content::TestBrowserContext context;
  auto contents = content::WebContentsTester::CreateTestWebContents(&context, nullptr);
  NativePersonCaptureController::CreateForWebContents(contents.get());
  auto* owner = NativePersonCaptureController::FromWebContents(contents.get());
  const auto weak = owner->GetWeakPtr(); int replies = 0;
  owner->Capture({}, base::BindLambdaForTesting([&] { contents->RemoveUserData(NativePersonCaptureController::UserDataKey()); return true; }),
      base::BindLambdaForTesting([&](base::DictValue result) { ++replies; EXPECT_FALSE(weak); EXPECT_TRUE(result.FindDict("error")); }));
  EXPECT_FALSE(weak); EXPECT_EQ(1,replies);
  EXPECT_EQ(nullptr,NativePersonCaptureController::FromWebContents(contents.get()));
}
}  // namespace
}  // namespace aux
