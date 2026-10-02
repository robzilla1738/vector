// Copyright 2026 The Aux Authors
// Real installed Views/layer facts; never capture or hardware qualification.
#include "chrome/browser/ui/aux/native_pip_video_backing.h"
#include <memory>
#include "base/memory/raw_ptr.h"
#include "chrome/test/views/chrome_views_test_base.h"
#include "testing/gtest/include/gtest/gtest.h"
#include "ui/compositor/layer.h"
#include "ui/compositor/layer_not_drawn.h"
#include "ui/compositor/layer_solid_color.h"
#include "ui/views/background.h"
#include "ui/views/view.h"
#include "ui/views/widget/widget.h"
namespace aux {
class NativePipSolidBackingTest : public ChromeViewsTestBase {
 public:
  NativePipSolidBackingTest();
  ~NativePipSolidBackingTest() override;
  void SetUp() override {
    ChromeViewsTestBase::SetUp();
    widget_ = CreateTestWidget(views::Widget::InitParams::CLIENT_OWNS_WIDGET);
    auto view = std::make_unique<views::View>();
    view->SetBackground(views::CreateLayerBasedSolidBackground(SK_ColorBLACK));
    background_ = widget_->SetContentsView(std::move(view));
    widget_->SetBounds(gfx::Rect(40, 40, 400, 300));
    widget_->Show();
    ASSERT_TRUE(background_->layer());
    ASSERT_TRUE(background_->layer()->AsSolidColor());
  }
  void TearDown() override {
    background_ = nullptr; widget_.reset();
    ChromeViewsTestBase::TearDown();
  }
  std::optional<NativePipSolidBacking> Read() { return ReadNativePipSolidBackingView(widget_.get(), background_); }
  std::unique_ptr<views::Widget> widget_;
  raw_ptr<views::View> background_ = nullptr;
};
NativePipSolidBackingTest::NativePipSolidBackingTest() = default;
NativePipSolidBackingTest::~NativePipSolidBackingTest() = default;
TEST_F(NativePipSolidBackingTest, ActualInstalledSolidIsPositiveAndStable) {
  auto before = Read(); ASSERT_TRUE(before); auto after = Read(); ASSERT_TRUE(after);
  EXPECT_EQ(*before, *after); EXPECT_EQ(before->frame, widget_->GetWindowBoundsInScreen());
  EXPECT_EQ(before->color, SkColors::kBlack);
}
TEST_F(NativePipSolidBackingTest, ReflectedSubtreeIsNotSolidEvenWithBlackBackgroundColor) {
  ui::LayerNotDrawn reflected;
  auto* layer = background_->layer()->AsSolidColor();
  ASSERT_TRUE(layer->IsShowingSolidColorContent());
  layer->SetShowReflectedLayerSubtree(&reflected);
  EXPECT_FALSE(layer->IsShowingSolidColorContent()); EXPECT_FALSE(Read());
  layer->SetShowSolidColorContent(); layer->SetColor(SkColors::kBlack);
  EXPECT_TRUE(layer->IsShowingSolidColorContent()); EXPECT_TRUE(Read());
}
TEST_F(NativePipSolidBackingTest, PartialTransformedOrClippedFillIsUnknown) {
  ASSERT_TRUE(Read());
  auto* layer = background_->layer(); const auto bounds = layer->bounds();
  layer->SetBounds(gfx::Rect(0, 0, bounds.width() - 1, bounds.height())); EXPECT_FALSE(Read());
  layer->SetBounds(bounds);
  layer->SetClipRect(gfx::Rect(1, 1, bounds.width() - 1, bounds.height() - 1)); EXPECT_FALSE(Read());
  layer->SetClipRect(gfx::Rect());
  gfx::Transform translated; translated.Translate(1, 0); layer->SetTransform(translated); EXPECT_FALSE(Read());
  layer->SetTransform(gfx::Transform()); EXPECT_TRUE(Read());
}
TEST_F(NativePipSolidBackingTest, TransparencyOrUnknownMaskIsNotAnOpaqueSolidBacking) {
  ASSERT_TRUE(Read()); auto* layer = background_->layer()->AsSolidColor();
  layer->SetColor(SkColor4f{0, 0, 0, 0.5f}); EXPECT_FALSE(Read());
  layer->SetColor(SkColors::kBlack); layer->SetOpacity(0.5f); EXPECT_FALSE(Read());
  layer->SetOpacity(1); layer->SetRoundedCornerRadius(gfx::RoundedCornersF(6)); EXPECT_FALSE(Read());
}
TEST_F(NativePipSolidBackingTest, AColorOnTexturedOrForeignViewCannotProveSolidMode) {
  ASSERT_TRUE(Read());
  background_->SetPaintToLayer(ui::LAYER_TEXTURED); EXPECT_FALSE(Read());
  auto other = CreateTestWidget(views::Widget::InitParams::CLIENT_OWNS_WIDGET);
  other->Show(); EXPECT_FALSE(ReadNativePipSolidBackingView(other.get(), background_));
}
}  // namespace aux
