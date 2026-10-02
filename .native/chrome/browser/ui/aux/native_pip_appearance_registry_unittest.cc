// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license in the LICENSE file.
// Authority/refusal tests only; not native visual qualification evidence.
#include "chrome/browser/ui/aux/native_pip_appearance_registry.h"
#include "chrome/browser/ui/aux/journey_fixture_path.h"
#include "base/test/scoped_command_line.h"
#include <memory>
#include <utility>
#include "base/files/file_util.h"
#include "base/files/scoped_temp_dir.h"
#include "base/functional/bind.h"
#include "chrome/browser/buildflags.h"
#include "chrome/test/base/testing_profile.h"
#include "chrome/test/views/chrome_views_test_base.h"
#include "content/public/browser/picture_in_picture_window_controller.h"
#include "content/public/browser/video_picture_in_picture_window_controller.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/test/test_renderer_host.h"
#include "content/public/test/web_contents_tester.h"
#include "ui/views/widget/widget.h"
#include "url/gurl.h"
#include "testing/gtest/include/gtest/gtest.h"
namespace aux {
TEST(NativePipAppearanceRegistry, ExplicitSwitchCannotGrantForeignProfile) {
  base::test::ScopedCommandLine command;
  command.GetProcessCommandLine()->AppendSwitch("aux-native-appearance-observer");
  command.GetProcessCommandLine()->AppendSwitchASCII("user-data-dir", "/tmp/foreign-pip-fixture/profile");
  EXPECT_FALSE(NativePipAppearanceObservationEnabled());
  NativePipAppearanceRegistry registry;
  EXPECT_FALSE(registry.SnapshotFor(nullptr, {}));
}
TEST(NativePipAppearanceRegistry, MissingActualWidgetNeverProducesSnapshot) {
  NativePipAppearanceRegistry registry;
  EXPECT_FALSE(registry.RegisterVideo(nullptr, {}));
  EXPECT_FALSE(registry.RegisterDocumentHost(nullptr, {}));
  EXPECT_FALSE(registry.RegisterBrowserDocument(nullptr, nullptr, {}));
  EXPECT_FALSE(ReadNativePipWindowAppearance(nullptr, NativePipSurfaceKind::kVideo));
  EXPECT_FALSE(ReadNativePipWindowAppearance(nullptr, NativePipSurfaceKind::kDocument));
}
// Genuine Views/widget/Profile/controller lifetimes, not native capture evidence.
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
class NativePipAppearanceRegistryTestPeer {
 public:
  static bool Register(NativePipAppearanceRegistry* registry, views::Widget* widget,
                       NativePipAppearanceRegistry::OwnerReader reader) {
    return registry->Register(widget, NativePipSurfaceKind::kVideo, std::move(reader));
  }
  static size_t Count(const NativePipAppearanceRegistry& registry) {
    return registry.entries_.size();
  }
  static uint64_t Generation(const NativePipAppearanceRegistry& registry,
                             views::Widget* widget) {
    return registry.entries_.at(widget).registration_generation;
  }
};
class NativePipRegistrationLifetimeTest : public ChromeViewsTestBase {
 public:
  NativePipRegistrationLifetimeTest();
  ~NativePipRegistrationLifetimeTest() override;
  void SetUp() override {
    ChromeViewsTestBase::SetUp();
    ASSERT_TRUE(root_.CreateUniqueTempDirUnderPath(base::FilePath("/private/tmp"), "aux-native-journey-"));
    ASSERT_TRUE(base::SetPosixFilePermissions(root_.GetPath(), 0700));
    const auto selected = root_.GetPath().AppendASCII("profile");
    ASSERT_TRUE(base::CreateDirectory(selected));
    ASSERT_TRUE(base::SetPosixFilePermissions(selected, 0700));
    command_.GetProcessCommandLine()->AppendSwitch("aux-native-appearance-observer");
    command_.GetProcessCommandLine()->AppendSwitchPath("user-data-dir", selected);
    observation_metadata_ = std::make_unique<ScopedNativeObservationMetadataForTesting>(*command_.GetProcessCommandLine());
    ASSERT_TRUE(NativePipAppearanceObservationEnabled());
    profile_ = TestingProfile::Builder().SetPath(selected.AppendASCII("Default")).Build();
    renderer_ = std::make_unique<content::RenderViewHostTestEnabler>();
    opener_ = content::WebContentsTester::CreateTestWebContents(profile_.get(), nullptr);
    // This fixture tests registry/widget lifetimes, not HTTP policy admission.
    // A real committed blank document avoids waiting on AuxZapCommitCondition's
    // authenticated runtime snapshot/renderer stylesheet reply in NavigationSimulator.
    content::WebContentsTester::For(opener_.get())->NavigateAndCommit(GURL("about:blank"));
    ASSERT_TRUE(opener_->GetPrimaryMainFrame()->IsRenderFrameLive());
    controller_ = content::PictureInPictureWindowController::GetOrCreateVideoPictureInPictureController(opener_.get());
    widget_ = CreateTestWidget(views::Widget::InitParams::CLIENT_OWNS_WIDGET);
    widget_->Show();
    ASSERT_TRUE(widget_->IsVisible());
    registry_ = std::make_unique<NativePipAppearanceRegistry>();
  }
  void TearDown() override {
    registry_.reset(); widget_.reset(); controller_ = nullptr; opener_.reset(); renderer_.reset(); profile_.reset();
    observation_metadata_.reset();
    ChromeViewsTestBase::TearDown();
  }
  NativePipOwner Owner() const { return {profile_.get(), opener_.get(), nullptr, controller_}; }
  NativePipAppearanceRegistry::OwnerReader Reader() {
    return base::BindRepeating([](NativePipRegistrationLifetimeTest* test) -> std::optional<NativePipOwner> {
      return test->Owner();
    }, base::Unretained(this));
  }
 public:
  base::test::ScopedCommandLine command_;
  std::unique_ptr<ScopedNativeObservationMetadataForTesting> observation_metadata_;
  base::ScopedTempDir root_;
  std::unique_ptr<TestingProfile> profile_;
  std::unique_ptr<content::RenderViewHostTestEnabler> renderer_;
  std::unique_ptr<content::WebContents> opener_;
  raw_ptr<content::PictureInPictureWindowController> controller_ = nullptr;
  std::unique_ptr<views::Widget> widget_;
  std::unique_ptr<NativePipAppearanceRegistry> registry_;
};
NativePipRegistrationLifetimeTest::NativePipRegistrationLifetimeTest() = default;
NativePipRegistrationLifetimeTest::~NativePipRegistrationLifetimeTest() = default;

TEST_F(NativePipRegistrationLifetimeTest, ValidRegistrationAndReregistrationHaveDistinctGenerations) {
  ASSERT_TRUE(NativePipAppearanceRegistryTestPeer::Register(registry_.get(), widget_.get(), Reader()));
  EXPECT_EQ(1u, NativePipAppearanceRegistryTestPeer::Count(*registry_));
  const auto first = NativePipAppearanceRegistryTestPeer::Generation(*registry_, widget_.get());
  widget_->Hide();
  EXPECT_EQ(0u, NativePipAppearanceRegistryTestPeer::Count(*registry_));
  widget_->Show();
  ASSERT_TRUE(NativePipAppearanceRegistryTestPeer::Register(registry_.get(), widget_.get(), Reader()));
  EXPECT_GT(NativePipAppearanceRegistryTestPeer::Generation(*registry_, widget_.get()), first);
}
TEST_F(NativePipRegistrationLifetimeTest, ReaderDestroysWidget) {
  EXPECT_FALSE(NativePipAppearanceRegistryTestPeer::Register(registry_.get(), widget_.get(),
      base::BindRepeating([](NativePipRegistrationLifetimeTest* test) -> std::optional<NativePipOwner> {
        test->widget_.reset(); return test->Owner();
      }, base::Unretained(this))));
  EXPECT_EQ(0u, NativePipAppearanceRegistryTestPeer::Count(*registry_));
}
TEST_F(NativePipRegistrationLifetimeTest, ReaderDestroysRegistry) {
  auto* registry = registry_.get();
  EXPECT_FALSE(NativePipAppearanceRegistryTestPeer::Register(registry, widget_.get(),
      base::BindRepeating([](NativePipRegistrationLifetimeTest* test) -> std::optional<NativePipOwner> {
        test->registry_.reset(); return test->Owner();
      }, base::Unretained(this))));
  EXPECT_FALSE(registry_);
}
TEST_F(NativePipRegistrationLifetimeTest, ReaderNestedRegisterRefusesOnlyNestedAttempt) {
  EXPECT_TRUE(NativePipAppearanceRegistryTestPeer::Register(registry_.get(), widget_.get(),
      base::BindRepeating([](NativePipRegistrationLifetimeTest* test) -> std::optional<NativePipOwner> {
        EXPECT_FALSE(NativePipAppearanceRegistryTestPeer::Register(test->registry_.get(), test->widget_.get(), test->Reader()));
        return test->Owner();
      }, base::Unretained(this))));
  EXPECT_EQ(1u, NativePipAppearanceRegistryTestPeer::Count(*registry_));
}
TEST_F(NativePipRegistrationLifetimeTest, ReaderUnregisterCancelsPendingAttempt) {
  EXPECT_FALSE(NativePipAppearanceRegistryTestPeer::Register(registry_.get(), widget_.get(),
      base::BindRepeating([](NativePipRegistrationLifetimeTest* test) -> std::optional<NativePipOwner> {
        test->registry_->Unregister(test->widget_.get()); return test->Owner();
      }, base::Unretained(this))));
  EXPECT_TRUE(NativePipAppearanceRegistryTestPeer::Register(registry_.get(), widget_.get(), Reader()));
}
TEST_F(NativePipRegistrationLifetimeTest, SnapshotMatcherDestroysRegistry) {
  ASSERT_TRUE(NativePipAppearanceRegistryTestPeer::Register(registry_.get(), widget_.get(), Reader()));
  auto* registry = registry_.get();
  EXPECT_FALSE(registry->SnapshotFor(profile_.get(), base::BindRepeating(
      [](NativePipRegistrationLifetimeTest* test, content::WebContents* opener) {
        EXPECT_EQ(test->opener_.get(), opener); test->registry_.reset(); return true;
      }, base::Unretained(this))));
  EXPECT_FALSE(registry_);
}
#endif
}  // namespace aux
