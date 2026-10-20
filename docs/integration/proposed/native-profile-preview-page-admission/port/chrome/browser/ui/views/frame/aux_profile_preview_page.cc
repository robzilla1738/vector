// Copyright 2026 Aux Authors. All rights reserved.
#include "chrome/browser/ui/views/frame/aux_profile_preview_page.h"

#include <algorithm>
#include <memory>
#include <utility>

#include "base/functional/callback_helpers.h"
#include "base/notreached.h"
#include "cc/paint/paint_flags.h"
#include "chrome/browser/ui/views/frame/aux_profile_search_button.h"
#include "chrome/browser/ui/views/profiles/profile_monogram_avatar_view.h"
#include "ui/base/metadata/metadata_impl_macros.h"
#include "ui/base/models/image_model.h"
#include "ui/color/color_provider_key.h"
#include "ui/gfx/canvas.h"
#include "ui/gfx/font_list.h"
#include "ui/gfx/text_constants.h"
#include "ui/gfx/vector_icon_types.h"
#include "ui/views/accessibility/view_accessibility.h"
#include "ui/views/background.h"
#include "ui/views/controls/button/button.h"
#include "ui/views/controls/image_view.h"
#include "ui/views/controls/label.h"
#include "ui/views/controls/scroll_view.h"
#include "ui/views/layout/box_layout.h"
#include "ui/views/layout/fill_layout.h"
#include "ui/views/view_class_properties.h"
#include "ui/views/widget/widget.h"

namespace aux {
namespace {
#include "chrome/browser/ui/views/frame/aux_profile_preview_icons.inc"

bool Dark(const views::View& view) {
  return view.GetWidget()->GetColorMode() ==
         ui::ColorProviderKey::ColorMode::kDark;
}
SkColor Foreground(const views::View& view, int role) {
  const bool dark = Dark(view);
  switch (role) {
    case 221: return dark ? 0xd9fafafa : 0xd90a0a0a;
    case 222: return dark ? 0x8cfafafa : 0x8c0a0a0a;
    case 225: return dark ? 0xa6fafafa : 0xb80a0a0a;
    case 226: return dark ? 0x73fafafa : 0x730a0a0a;
  }
  NOTREACHED();
}
void StyleLabel(views::Label* label, int size, gfx::Font::Weight weight) {
  label->SetCanProcessEventsWithinSubtree(false);
  label->SetHorizontalAlignment(gfx::ALIGN_TO_HEAD);
  label->SetElideBehavior(gfx::FADE_TAIL);
  label->SetSubpixelRenderingEnabled(false);
  label->SetAutoColorReadabilityEnabled(false);
  label->SetBackgroundColor(SK_ColorTRANSPARENT);
  const gfx::FontList font;
  label->SetFontList(font.Derive(size - font.GetFontSize(),
                               gfx::Font::NORMAL, weight));
}

// The original AsideSectionRowButton's preview-only constructor branch:
// no actions or secondary control, genuine Button/label/image descendants.
// Ordinary actionable sidebar rows are deliberately not substituted by it.
class PreviewSectionRow final : public views::Button {
  METADATA_HEADER(PreviewSectionRow, views::Button)
 public:
  PreviewSectionRow(const gfx::VectorIcon* icon,
                    const std::u16string& title,
                    int foreground,
                    bool selected,
                    bool section)
      : views::Button(base::DoNothing()), icon_(icon),
        foreground_(foreground), selected_(selected),
        height_(section ? 28 : 34) {
    SetFocusBehavior(FocusBehavior::NEVER);
    SetCanProcessEventsWithinSubtree(false);
    SetAnimateOnStateChange(false);
    SetNotifyEnterExitOnChild(true);
    GetViewAccessibility().SetName(title);
    SetTooltipText(title);
    SetProperty(views::kMarginsKey, gfx::Insets::TLBR(0, 8, 0, 8));
    auto* layout = SetLayoutManager(std::make_unique<views::BoxLayout>(
        views::BoxLayout::Orientation::kHorizontal,
        gfx::Insets::TLBR(0, section ? 8 : 7, 0, 8)));
    layout->set_cross_axis_alignment(
        views::BoxLayout::CrossAxisAlignment::kCenter);
    layout->SetCollapseMarginsSpacing(true);
    if (icon_) {
      icon_view_ = AddChildView(std::make_unique<views::ImageView>());
      icon_view_->SetImageSize(gfx::Size(16, 16));
      icon_view_->SetProperty(views::kMarginsKey,
                             gfx::Insets::TLBR(0, 0, 0, 8));
    }
    label_ = AddChildView(std::make_unique<views::Label>(title));
    StyleLabel(label_, 13, gfx::Font::Weight::MEDIUM);
    layout->SetFlexForView(label_, 1);
  }
  gfx::Size CalculatePreferredSize(
      const views::SizeBounds& available_size) const override {
    auto size = views::Button::CalculatePreferredSize(available_size);
    size.set_height(height_);
    return size;
  }
  void AddedToWidget() override {
    views::Button::AddedToWidget();
    UpdateColors();
  }
  void OnThemeChanged() override {
    views::Button::OnThemeChanged();
    UpdateColors();
  }
  void OnPaintBackground(gfx::Canvas* canvas) override {
    if (!GetWidget() || (!selected_ && GetState() == STATE_NORMAL)) {
      return;
    }
    cc::PaintFlags flags;
    flags.setAntiAlias(true);
    flags.setColor(GetState() == STATE_HOVERED
                       ? (Dark(*this) ? 0x14fafafa : 0x140a0a0a)
                       : (Dark(*this) ? 0x0afafafa : 0x8cffffff));
    canvas->DrawRoundRect(gfx::RectF(GetLocalBounds()), 8, flags);
  }
 private:
  void UpdateColors() {
    if (!GetWidget()) {
      return;
    }
    label_->SetEnabledColor(Foreground(*this, foreground_));
    if (icon_view_) {
      icon_view_->SetImage(ui::ImageModel::FromVectorIcon(
          *icon_, Foreground(*this, 222), 16));
    }
    SchedulePaint();
  }
  const raw_ptr<const gfx::VectorIcon> icon_;
  const int foreground_;
  const bool selected_;
  const int height_;
  raw_ptr<views::ImageView> icon_view_ = nullptr;
  raw_ptr<views::Label> label_;
};
BEGIN_METADATA(PreviewSectionRow)
END_METADATA
}  // namespace

ProfilePagePreviewPageView::ProfilePagePreviewPageView() {
  // Original46536b0 clears View+0x1a9 on the whole preview page. The real
  // borrowed tabs remain presentation-only until actual profile activation.
  SetCanProcessEventsWithinSubtree(false);
  SetProperty(views::kViewIgnoredByLayoutKey, true);
  SetBackground(views::CreateSolidBackground(SK_ColorTRANSPARENT));
  captured_image_ = AddChildView(std::make_unique<views::ImageView>());
  live_host_ = AddChildView(std::make_unique<views::View>());
  live_host_->SetProperty(views::kViewIgnoredByLayoutKey, true);
  live_host_->SetVisible(false);
  fallback_ = AddChildView(std::make_unique<views::View>());
  fallback_->SetVisible(false);
  header_ = fallback_->AddChildView(std::make_unique<views::View>());
  auto* header_layout = header_->SetLayoutManager(
      std::make_unique<views::BoxLayout>(
          views::BoxLayout::Orientation::kHorizontal,
          gfx::Insets::TLBR(6, 8, 6, 7)));
  header_layout->set_cross_axis_alignment(
      views::BoxLayout::CrossAxisAlignment::kCenter);
  auto* avatar = header_->AddChildView(std::make_unique<views::View>());
  avatar->SetPreferredSize(gfx::Size(20, 20));
  avatar->SetLayoutManager(std::make_unique<views::FillLayout>());
  avatar->SetProperty(views::kMarginsKey, gfx::Insets::TLBR(0, 0, 0, 4));
  avatar_image_ = avatar->AddChildView(std::make_unique<views::ImageView>());
  avatar_image_->SetImageSize(gfx::Size(20, 20));
  monogram_ = avatar->AddChildView(
      std::make_unique<ProfileMonogramAvatarView>(u""));
  monogram_->SetVisible(false);
  name_ = header_->AddChildView(std::make_unique<views::Label>());
  StyleLabel(name_, 14, gfx::Font::Weight::MEDIUM);
  header_layout->SetFlexForView(name_, 1);
  disclosure_ = header_->AddChildView(std::make_unique<views::ImageView>());
  disclosure_->SetImageSize(gfx::Size(12, 12));
  search_ = fallback_->AddChildView(
      std::make_unique<ProfileSearchButton>(base::DoNothing()));
  scroll_ = fallback_->AddChildView(std::make_unique<views::ScrollView>());
  auto rows = std::make_unique<views::View>();
  auto* rows_layout = rows->SetLayoutManager(
      std::make_unique<views::BoxLayout>(
          views::BoxLayout::Orientation::kVertical));
  rows_layout->set_cross_axis_alignment(
      views::BoxLayout::CrossAxisAlignment::kStretch);
  rows_layout->SetCollapseMarginsSpacing(true);
  rows_ = scroll_->SetContents(std::move(rows));
  SetVisible(false);
}
ProfilePagePreviewPageView::~ProfilePagePreviewPageView() = default;

void ProfilePagePreviewPageView::SetProfile(const std::u16string& name,
                                            const gfx::ImageSkia& avatar) {
  name_->SetText(name);
  name_->SetVisible(true);
  monogram_->SetName(name);
  avatar_image_->SetImage(ui::ImageModel::FromImageSkia(avatar));
  avatar_image_->SetVisible(!avatar.isNull());
  monogram_->SetVisible(avatar.isNull());
}
void ProfilePagePreviewPageView::SetFallbackData(
    std::vector<ProfilePreviewTab> tabs,
    std::vector<std::u16string> bookmarks) {
  if (tabs_ == tabs && bookmarks_ == bookmarks) {
    return;
  }
  tabs_ = std::move(tabs);
  bookmarks_ = std::move(bookmarks);
  RebuildRows();
}
void ProfilePagePreviewPageView::RebuildRows() {
  rows_->RemoveAllChildViews();
  size_t count = 0;
  for (const auto& tab : tabs_) {
    if (tab.pinned && count < 10) {
      rows_->AddChildView(std::make_unique<PreviewSectionRow>(
          &kPinIcon, tab.title, tab.active ? 221 : 225, tab.active, false));
      ++count;
    }
  }
  if (!bookmarks_.empty()) {
    rows_->AddChildView(std::make_unique<PreviewSectionRow>(
        nullptr, u"Bookmarks", 226, false, true));
    for (size_t i = 0; i < std::min<size_t>(4, bookmarks_.size()); ++i) {
      rows_->AddChildView(std::make_unique<PreviewSectionRow>(
          &kBookmarkIcon, bookmarks_[i], 225, false, false));
    }
  }
  rows_->AddChildView(std::make_unique<PreviewSectionRow>(
      nullptr, u"Tabs", 226, false, true));
  count = 0;
  for (const auto& tab : tabs_) {
    if (!tab.pinned && count < 10) {
      rows_->AddChildView(std::make_unique<PreviewSectionRow>(
          &kGlobeIcon, tab.title, tab.active ? 221 : 225, tab.active, false));
      ++count;
    }
  }
  if (count == 0) {
    // Exact supplied fallback presentation; does not create or claim a real tab.
    rows_->AddChildView(std::make_unique<PreviewSectionRow>(
        &kGlobeIcon, u"New Tab", 221, true, false));
  }
  rows_->InvalidateLayout();
  scroll_->InvalidateLayout();
}
void ProfilePagePreviewPageView::SetFallbackGeometry(
    const gfx::Rect& header, const gfx::Rect& search, const gfx::Rect& scroll) {
  header_bounds_ = header;
  search_bounds_ = search;
  scroll_bounds_ = scroll;
  InvalidateLayout();
}
void ProfilePagePreviewPageView::SetCapturedImage(const gfx::ImageSkia& image) {
  captured_image_->SetImage(ui::ImageModel::FromImageSkia(image));
}
void ProfilePagePreviewPageView::ShowLiveContent(bool live) {
  live_host_->SetVisible(live);
  fallback_->SetVisible(!live);
  InvalidateLayout();
}
void ProfilePagePreviewPageView::Layout(PassKey) {
  captured_image_->SetBoundsRect(GetLocalBounds());
  captured_image_->SetImageSize(size());
  live_host_->SetBoundsRect(GetLocalBounds());
  fallback_->SetBoundsRect(GetLocalBounds());
  gfx::Rect header = header_bounds_.IsEmpty()
      ? gfx::Rect(8, 0, std::max(width() - 16, 0), 32) : header_bounds_;
  header.set_width(std::min(header.width(), std::max(width() - header.x(), 0)));
  header_->SetBoundsRect(header);
  gfx::Rect search = search_bounds_;
  if (search.IsEmpty()) {
    const auto preferred = search_->GetPreferredSize();
    search = gfx::Rect(width() - preferred.width() - 8,
        header.y() + (header.height() - preferred.height()) / 2,
        preferred.width(), preferred.height());
  }
  search_->SetBoundsRect(search);
  scroll_->SetBoundsRect(scroll_bounds_.IsEmpty()
      ? gfx::Rect(0, header.bottom(), width(),
                  std::max(height() - header.bottom(), 0)) : scroll_bounds_);
  LayoutSuperclass<views::View>(this);
}
void ProfilePagePreviewPageView::UpdateColors() {
  if (!GetWidget()) {
    return;
  }
  name_->SetEnabledColor(Foreground(*this, 221));
  disclosure_->SetImage(ui::ImageModel::FromVectorIcon(
      kDisclosureIcon, Foreground(*this, 222), 12));
}
void ProfilePagePreviewPageView::OnThemeChanged() {
  views::View::OnThemeChanged();
  UpdateColors();
}
BEGIN_METADATA(ProfilePagePreviewPageView)
END_METADATA
}  // namespace aux
