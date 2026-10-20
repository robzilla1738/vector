// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/views/frame/aux_vertical_new_tab_button.h"

#include <utility>

#include "base/check.h"
#include "base/memory/raw_ref.h"
#include "cc/paint/paint_flags.h"
#include "chrome/browser/ui/actions/chrome_action_id.h"
#include "chrome/browser/ui/browser_actions.h"
#include "chrome/browser/ui/browser_element_identifiers.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/grit/generated_resources.h"
#include "third_party/skia/include/core/SkPath.h"
#include "ui/actions/actions.h"
#include "ui/base/l10n/l10n_util.h"
#include "ui/base/metadata/metadata_impl_macros.h"
#include "ui/base/models/image_model.h"
#include "ui/color/color_provider_key.h"
#include "ui/gfx/canvas.h"
#include "ui/gfx/font_list.h"
#include "ui/gfx/geometry/rounded_corners_f.h"
#include "ui/gfx/geometry/rrect_f.h"
#include "ui/gfx/text_constants.h"
#include "ui/gfx/vector_icon_types.h"
#include "ui/views/actions/action_view_controller.h"
#include "ui/views/animation/ink_drop.h"
#include "ui/views/animation/ink_drop_host.h"
#include "ui/views/border.h"
#include "ui/views/controls/highlight_path_generator.h"
#include "ui/views/controls/image_view.h"
#include "ui/views/controls/label.h"
#include "ui/views/layout/flex_layout.h"
#include "ui/views/style/typography.h"
#include "ui/views/view_class_properties.h"
#include "ui/views/widget/widget.h"

namespace aux {
namespace {
#include "chrome/browser/ui/views/frame/aux_vertical_new_tab_icon.inc"

bool Dark(const views::View& view) {
  return view.GetWidget()->GetColorMode() ==
         ui::ColorProviderKey::ColorMode::kDark;
}
gfx::RoundedCornersF Corners(AuxVerticalNewTabButton::CornerMode mode) {
  const float top =
      mode == AuxVerticalNewTabButton::CornerMode::kBottomOnly ? 0 : 8;
  const float bottom =
      mode == AuxVerticalNewTabButton::CornerMode::kTopOnly ? 0 : 8;
  return gfx::RoundedCornersF(top, top, bottom, bottom);
}
}  // namespace

class AuxVerticalNewTabActionInterface final
    : public views::LabelButtonActionViewInterface {
 public:
  explicit AuxVerticalNewTabActionInterface(AuxVerticalNewTabButton* button)
      : views::LabelButtonActionViewInterface(button), button_(*button) {}
  void ActionItemChangedImpl(actions::ActionItem* item) override {
    // Original4244ce8 calls the BUTTON interface, not LabelButton's image
    // projection. The constructor's exact plus must survive action updates.
    views::ButtonActionViewInterface::ActionItemChangedImpl(item);
    button_->SetText(item->GetText());
    button_->SetEnabled(true);
  }
  void InvokeActionImpl(actions::ActionItem* item) override {
    // Original7fb5f68 notifies640 before invoking the actual action.
    const auto alive = button_->weak_factory_.GetWeakPtr();
    const auto action = item->GetAsWeakPtr();
    button_->before_invoke_.Notify();
    if (alive && action)
      views::ActionViewInterface::InvokeActionImpl(action.get());
  }

 private:
  const raw_ref<AuxVerticalNewTabButton> button_;
};

AuxVerticalNewTabButton::AuxVerticalNewTabButton(
    BrowserWindowInterface& browser)
    : views::LabelButton({}, l10n_util::GetStringUTF16(IDS_NEW_TAB)) {
  SetProperty(views::kElementIdentifierKey, kNewTabButtonElementId);
  SetAnimateOnStateChange(false);
  views::InkDrop::Get(this)->SetMode(views::InkDropHost::InkDropMode::OFF);
  label()->SetHorizontalAlignment(gfx::ALIGN_TO_HEAD);
  label()->SetElideBehavior(gfx::FADE_TAIL);
  label()->SetAutoColorReadabilityEnabled(false);
  label()->SetBackgroundColor(SK_ColorTRANSPARENT);
  const auto font = label()->font_list();
  label()->SetFontList(
      font.Derive(2, font.GetFontStyle(), gfx::Font::Weight::NORMAL));
  SetImageLabelSpacing(8);
  SetImageCentered(false);
  SetHorizontalAlignment(gfx::ALIGN_LEFT);
  SetMinSize(gfx::Size(0, 32));
  SetBorder(views::CreateEmptyBorder(gfx::Insets::VH(6, 8)));
  layout_ = SetLayoutManager(std::make_unique<views::FlexLayout>());
  layout_->SetOrientation(views::LayoutOrientation::kHorizontal)
      .SetDefault(views::kCrossAxisAlignmentKey,
                  views::LayoutAlignment::kCenter)
      .SetIgnoreDefaultMainAxisMargins(true);
  image_container_view()->SetProperty(views::kMarginsKey,
                                      gfx::Insets::TLBR(0, 0, 0, 8));
  auto* image = static_cast<views::ImageView*>(image_container_view());
  image->SetImageSize(gfx::Size(16, 16));
  label()->SetProperty(
      views::kFlexBehaviorKey,
      views::FlexSpecification(views::MinimumFlexSizeRule::kScaleToZero,
                               views::MaximumFlexSizeRule::kUnbounded));
  UpdateHighlightPath();
  RebindBrowser(browser);
}
AuxVerticalNewTabButton::~AuxVerticalNewTabButton() = default;

void AuxVerticalNewTabButton::RebindBrowser(BrowserWindowInterface& browser) {
  // Retire the old window-owned action before observing the genuine new root.
  weak_factory_.InvalidateWeakPtrs();
  action_controller_.reset();
  auto* browser_actions = BrowserActions::From(&browser);
  CHECK(browser_actions);
  auto* item = actions::ActionManager::Get().FindAction(
      kActionNewTab, browser_actions->root_action_item());
  CHECK(item);
  action_controller_ = std::make_unique<views::ActionViewController>();
  action_controller_->CreateActionViewRelationship(this, item->GetAsWeakPtr());
}

void AuxVerticalNewTabButton::SetCompact(bool compact) {
  compact_ = compact;
  label()->SetVisible(!compact);
  UpdateShortcutVisibility();
  layout_->SetMainAxisAlignment(compact ? views::LayoutAlignment::kCenter
                                        : views::LayoutAlignment::kStart);
  image_container_view()->SetProperty(
      views::kMarginsKey,
      compact ? gfx::Insets() : gfx::Insets::TLBR(0, 0, 0, 8));
  SetImageCentered(compact);
  SetHorizontalAlignment(compact ? gfx::ALIGN_CENTER : gfx::ALIGN_LEFT);
  SetImageLabelSpacing(compact ? 0 : 8);
  SetBorder(views::CreateEmptyBorder(gfx::Insets::VH(6, 8)));
  InvalidateLayout();
  SchedulePaint();
}
void AuxVerticalNewTabButton::SetCornerMode(CornerMode mode) {
  CHECK(mode == CornerMode::kAll || mode == CornerMode::kBottomOnly ||
        mode == CornerMode::kTopOnly);
  corner_mode_ = mode;
  UpdateHighlightPath();
  SchedulePaint();
}
void AuxVerticalNewTabButton::SetShortcutText(const std::u16string& text) {
  if (text.empty()) {
    if (shortcut_) {
      auto* old = shortcut_.get();
      shortcut_ = nullptr;
      RemoveChildViewT(old);
    }
    return;
  }
  if (!shortcut_) {
    shortcut_ = AddChildView(std::make_unique<views::Label>(
        text, views::style::CONTEXT_LABEL, views::style::STYLE_PRIMARY));
    shortcut_->SetCanProcessEventsWithinSubtree(false);
    shortcut_->SetAutoColorReadabilityEnabled(false);
    shortcut_->SetFontList(label()->font_list());
    shortcut_->SetProperty(views::kMarginsKey, gfx::Insets::TLBR(0, 8, 0, 4));
  } else {
    shortcut_->SetText(text);
  }
  UpdateShortcutVisibility();
  if (GetWidget())
    UpdateColors();
}
base::CallbackListSubscription AuxVerticalNewTabButton::AddBeforeInvokeCallback(
    base::RepeatingClosure callback) {
  return before_invoke_.Add(std::move(callback));
}
std::unique_ptr<views::ActionViewInterface>
AuxVerticalNewTabButton::GetActionViewInterface() {
  return std::make_unique<AuxVerticalNewTabActionInterface>(this);
}
void AuxVerticalNewTabButton::UpdateShortcutVisibility() {
  if (shortcut_)
    shortcut_->SetVisible(!compact_ && (GetState() == STATE_HOVERED ||
                                        GetState() == STATE_PRESSED));
}
void AuxVerticalNewTabButton::UpdateColors() {
  if (!GetWidget())
    return;
  // Private236 aliases the mixer cache's secondary foreground (222), not
  // 155's unrelated numeric ColorId236. Original theme and widget determine it.
  const SkColor foreground = Dark(*this) ? 0x8cfafafa : 0x8c0a0a0a;
  SetEnabledTextColors(foreground);
  SetTextColor(STATE_DISABLED, foreground);
  SetImageModel(STATE_NORMAL, ui::ImageModel::FromVectorIcon(kNewTabPlusIcon,
                                                             foreground, 12));
  if (shortcut_)
    shortcut_->SetEnabledColor(Dark(*this) ? 0x99fafafa : 0x990a0a0a);
}
void AuxVerticalNewTabButton::OnThemeChanged() {
  views::LabelButton::OnThemeChanged();
  UpdateColors();
}
void AuxVerticalNewTabButton::StateChanged(ButtonState old_state) {
  views::LabelButton::StateChanged(old_state);
  UpdateShortcutVisibility();
}
void AuxVerticalNewTabButton::UpdateHighlightPath() {
  views::InstallRoundRectHighlightPathGenerator(this, gfx::Insets(),
                                                Corners(corner_mode_));
}
void AuxVerticalNewTabButton::PaintButtonContents(gfx::Canvas* canvas) {
  if (GetWidget() &&
      (GetState() == STATE_HOVERED || GetState() == STATE_PRESSED)) {
    cc::PaintFlags flags;
    flags.setAntiAlias(true);
    flags.setColor(Dark(*this) ? 0x14fafafa : 0x140a0a0a);
    canvas->DrawPath(SkPath::RRect(SkRRect{gfx::RRectF(
                         gfx::RectF(GetLocalBounds()), Corners(corner_mode_))}),
                     flags);
  }
  views::LabelButton::PaintButtonContents(canvas);
}
BEGIN_METADATA(AuxVerticalNewTabButton)
END_METADATA
}  // namespace aux
