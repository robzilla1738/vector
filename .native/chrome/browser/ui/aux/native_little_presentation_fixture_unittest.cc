// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_little_presentation_fixture.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include <memory>
#include "base/functional/bind.h"
#include "content/public/test/browser_task_environment.h"
#include "testing/gtest/include/gtest/gtest.h"
namespace aux {
// Tests callback generations directly; this does not fabricate a native owner.
class NativeLittlePresentationFixtureLifetimeTest : public testing::Test {
 protected:
  void CheckRearm() {
    NativeLittlePresentationFixture fixture{base::WeakPtr<WebUIBrowserUI>()};
    fixture.active_ = true;
    auto old_guest = base::BindOnce(&NativeLittlePresentationFixture::GuestArmed,
        fixture.weak_factory_.GetWeakPtr());
    auto old_submission = base::BindOnce(&NativeLittlePresentationFixture::Submitted,
        fixture.weak_factory_.GetWeakPtr());
    auto old_presentation = base::BindOnce(&NativeLittlePresentationFixture::Presented,
        fixture.weak_factory_.GetWeakPtr());
    auto old_commit = base::BindRepeating(&NativeLittlePresentationFixture::TryStart,
        fixture.weak_factory_.GetWeakPtr());
    fixture.Finish(fixture.Record("refused", "old_finished"));
    fixture.record_.reset(); fixture.active_ = true;
    std::move(old_guest).Run(false);
    std::move(old_submission).Run(nullptr);
    std::move(old_presentation).Run(nullptr);
    old_commit.Run();
    EXPECT_TRUE(fixture.active_); EXPECT_FALSE(fixture.record_);
    // A fresh callback remains operative and refuses this genuinely missing scope.
    auto fresh_guest = base::BindOnce(&NativeLittlePresentationFixture::GuestArmed,
        fixture.weak_factory_.GetWeakPtr());
    std::move(fresh_guest).Run(false);
    EXPECT_FALSE(fixture.active_); ASSERT_TRUE(fixture.record_);
    EXPECT_EQ(*fixture.record_->FindString("reason"), "unavailable_current_guest_lease");
  }
  content::BrowserTaskEnvironment environment_;
};
TEST_F(NativeLittlePresentationFixtureLifetimeTest, OldCallbacksCannotRefuseRearmedSample) {
  CheckRearm();
}
TEST(NativeLittlePresentationFixtureTest, MissingSourceNeverInventsReadyOrMeasuredIdentity) {
  content::BrowserTaskEnvironment environment;
  NativeLittlePresentationFixture fixture{base::WeakPtr<WebUIBrowserUI>()};
  unsigned replies = 0;
  fixture.Prepare(base::BindOnce([](unsigned* count, base::DictValue record) {
    ++*count; EXPECT_EQ(record.FindBool("measured"), false);
    ASSERT_TRUE(record.FindString("status")); EXPECT_EQ(*record.FindString("status"), "refused");
    EXPECT_FALSE(record.contains("windowId")); EXPECT_FALSE(record.contains("requestNonce"));
    EXPECT_FALSE(record.contains("target")); EXPECT_FALSE(record.contains("elapsedUs"));
  }, &replies));
  fixture.Complete(base::BindOnce([](unsigned* count, base::DictValue record) {
    ++*count; ASSERT_TRUE(record.FindString("reason"));
    EXPECT_EQ(*record.FindString("reason"), "no_prepared_sample");
    EXPECT_EQ(record.FindBool("measured"), false); EXPECT_FALSE(record.contains("windowId"));
  }, &replies));
  EXPECT_EQ(replies, 2u);
}
TEST(NativeLittlePresentationFixtureTest, ReentrantReadyRefusalCanDestroyOwnerWithoutAnotherReply) {
  content::BrowserTaskEnvironment environment;
  auto fixture = std::make_unique<NativeLittlePresentationFixture>(base::WeakPtr<WebUIBrowserUI>());
  unsigned replies = 0;
  fixture->Prepare(base::BindOnce([](std::unique_ptr<NativeLittlePresentationFixture>* owner,
      unsigned* count, base::DictValue record) {
    ++*count; EXPECT_EQ(record.FindBool("measured"), false); owner->reset();
  }, &fixture, &replies));
  environment.RunUntilIdle(); EXPECT_FALSE(fixture); EXPECT_EQ(replies, 1u);
}
}  // namespace aux
#endif
