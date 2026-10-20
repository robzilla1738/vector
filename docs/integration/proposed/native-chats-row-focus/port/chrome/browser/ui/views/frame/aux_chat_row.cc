// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/views/frame/aux_chat_row.h"

#include <utility>
#include "base/functional/bind.h"
#include "base/notreached.h"
#include "base/time/time.h"
#include "base/timer/timer.h"
#include "cc/paint/paint_flags.h"
#include "ui/base/metadata/metadata_impl_macros.h"
#include "ui/base/models/image_model.h"
#include "ui/color/color_provider_key.h"
#include "ui/events/event.h"
#include "ui/gfx/canvas.h"
#include "ui/gfx/font_list.h"
#include "ui/gfx/paint_throbber.h"
#include "ui/gfx/vector_icon_types.h"
#include "ui/views/accessibility/view_accessibility.h"
#include "ui/views/background.h"
#include "ui/views/border.h"
#include "ui/views/controls/button/button_controller.h"
#include "ui/views/controls/button/image_button.h"
#include "ui/views/controls/image_view.h"
#include "ui/views/controls/label.h"
#include "ui/views/layout/box_layout.h"
#include "ui/views/view_class_properties.h"
#include "ui/views/widget/widget.h"

namespace aux {
namespace {
#include "chrome/browser/ui/views/frame/aux_chat_icons.inc"

SkColor Color(const views::View& view, int role) {
  const bool dark = view.GetWidget() && view.GetWidget()->GetColorMode() ==
      ui::ColorProviderKey::ColorMode::kDark;
  // Original035e6d40 private mixer, including task-only roles277..279.
  switch (role) {
    case 214: return dark ? 0x14fafafa : 0xffffffff;
    case 221: return dark ? 0xd9fafafa : 0xd90a0a0a;
    case 222: case 236: return dark ? 0x8cfafafa : 0x8c0a0a0a;
    case 225: return dark ? 0xa6fafafa : 0xb80a0a0a;
    case 226: return dark ? 0x73fafafa : 0x730a0a0a;
    case 247: return dark ? 0x14fafafa : 0x140a0a0a;
    case 274: return 0xfffb7171;
    case 277: return 0x1a16a34a;
    case 278: return dark ? 0xff22c55e : 0xff16a34a;
    case 279: return dark ? 0xff38b6f6 : 0xff0284c7;
  }
  NOTREACHED();
}

class ChatThrobber final : public views::View {
  METADATA_HEADER(ChatThrobber, views::View)
 public:
  ChatThrobber() {
    SetCanProcessEventsWithinSubtree(false);
    SetPreferredSize(gfx::Size(24, 24));
  }
 protected:
  void AddedToWidget() override { views::View::AddedToWidget(); Update(); }
  void RemovedFromWidget() override { timer_.Stop(); views::View::RemovedFromWidget(); }
  void VisibilityChanged(views::View* from, bool visible) override {
    views::View::VisibilityChanged(from, visible);
    Update();
  }
  void OnPaint(gfx::Canvas* canvas) override {
    gfx::Rect bounds = GetLocalBounds();
    bounds.ClampToCenteredSize(gfx::Size(16, 16));
    gfx::PaintThrobberSpinning(canvas, bounds, Color(*this, 221),
        timer_.IsRunning() ? base::TimeTicks::Now() - started_
                           : base::Microseconds(550000), 1.5f);
  }
 private:
  void Update() {
    if (!GetWidget() || !IsDrawn()) { timer_.Stop(); return; }
    if (timer_.IsRunning()) return;
    started_ = base::TimeTicks::Now();
    // Original4674c48: 33000us, only attached+drawn, reset on resume.
    timer_.Start(FROM_HERE, base::Microseconds(33000), this,
                 &ChatThrobber::SchedulePaint);
    SchedulePaint();
  }
  base::TimeTicks started_;
  base::RepeatingTimer timer_;
};
BEGIN_METADATA(ChatThrobber)
END_METADATA

class ChatUnreadDot final : public views::View {
  METADATA_HEADER(ChatUnreadDot, views::View)
 public:
  ChatUnreadDot() {
    SetCanProcessEventsWithinSubtree(false);
    SetPreferredSize(gfx::Size(24, 24));
  }
 protected:
  void OnPaint(gfx::Canvas* canvas) override {
    cc::PaintFlags flags;
    flags.setAntiAlias(true);
    flags.setColor(Color(*this, 279));
    // Original4674ed0 literaldf42980: center + (-4,-4,4,4).
    canvas->DrawCircle(gfx::PointF(width() * .5f, height() * .5f), 4, flags);
  }
};
BEGIN_METADATA(ChatUnreadDot)
END_METADATA

class ChatBadge final : public views::Label {
  METADATA_HEADER(ChatBadge, views::Label)
 public:
  explicit ChatBadge(std::u16string title) : views::Label(title) {
    SetCanProcessEventsWithinSubtree(false);
    SetAutoColorReadabilityEnabled(false);
    SetSubpixelRenderingEnabled(false);
    SetHorizontalAlignment(gfx::ALIGN_CENTER);
    const gfx::FontList font;
    SetFontList(font.Derive(12 - font.GetFontSize(), gfx::Font::NORMAL,
                           gfx::Font::Weight::MEDIUM));
    SetLineHeight(14);
    SetBorder(views::CreateEmptyBorder(gfx::Insets::VH(2, 8)));
  }
 protected:
  void OnThemeChanged() override {
    views::Label::OnThemeChanged();
    SetEnabledColor(Color(*this, 278));
    SetBackground(views::CreateRoundedRectBackground(Color(*this, 277), 999));
  }
};
BEGIN_METADATA(ChatBadge)
END_METADATA
}  // namespace

AuxChatRow::AuxChatRow(Chat chat, Action selected, Action rename, Action archive,
                       Context context, bool show_all)
    : views::Button(base::BindRepeating(&AuxChatRow::Pressed,
                                        base::Unretained(this))),
      chat_(std::move(chat)), selected_(std::move(selected)),
      rename_(std::move(rename)), archive_(std::move(archive)),
      context_(std::move(context)), show_all_(show_all) {
  button_controller()->set_notify_action(views::ButtonController::NotifyAction::kOnRelease);
  SetFocusBehavior(views::View::FocusBehavior::ALWAYS);
  SetNotifyEnterExitOnChild(true);
  auto* layout = SetLayoutManager(std::make_unique<views::BoxLayout>(
      views::BoxLayout::Orientation::kHorizontal, gfx::Insets::VH(6, 8)));
  layout->set_cross_axis_alignment(views::BoxLayout::CrossAxisAlignment::kCenter);
  pin_ = AddChildView(std::make_unique<views::ImageView>());
  pin_->SetCanProcessEventsWithinSubtree(false);
  pin_->SetPreferredSize(gfx::Size(16, 16));
  pin_->SetProperty(views::kMarginsKey, gfx::Insets::TLBR(0, 0, 0, 4));
  label_ = AddChildView(std::make_unique<views::Label>(chat_.title));
  label_->SetCanProcessEventsWithinSubtree(false);
  label_->SetAutoColorReadabilityEnabled(false);
  label_->SetSubpixelRenderingEnabled(false);
  label_->SetHorizontalAlignment(gfx::ALIGN_TO_HEAD);
  label_->SetElideBehavior(gfx::FADE_TAIL);
  const gfx::FontList font;
  label_->SetFontList(font.Derive(14 - font.GetFontSize(), gfx::Font::NORMAL,
                                 gfx::Font::Weight::NORMAL));
  layout->SetFlexForView(label_, 1);
  auto* controls = AddChildView(std::make_unique<views::View>());
  auto* controls_layout = controls->SetLayoutManager(
      std::make_unique<views::BoxLayout>(views::BoxLayout::Orientation::kHorizontal));
  controls_layout->set_cross_axis_alignment(views::BoxLayout::CrossAxisAlignment::kCenter);
  if (!show_all_) {
    switch (chat_.status) {
      case ChatStatus::kRunning:
        status_ = controls->AddChildView(std::make_unique<ChatThrobber>()); break;
      case ChatStatus::kFinishedUnread:
        status_ = controls->AddChildView(std::make_unique<ChatUnreadDot>()); break;
      case ChatStatus::kAwaitingApproval:
        status_ = controls->AddChildView(std::make_unique<ChatBadge>(u"Awaiting approval")); break;
      case ChatStatus::kAwaitingAnswer:
        status_ = controls->AddChildView(std::make_unique<ChatBadge>(u"Awaiting answer")); break;
      case ChatStatus::kError: {
        auto error = std::make_unique<views::ImageView>();
        error->SetCanProcessEventsWithinSubtree(false);
        error->SetPreferredSize(gfx::Size(24, 24));
        status_ = controls->AddChildView(std::move(error)); break;
      }
      case ChatStatus::kIdle: case ChatStatus::kAwaitingInboxEvents: break;
    }
    archive_button_ = controls->AddChildView(std::make_unique<views::ImageButton>(
        base::BindRepeating(&AuxChatRow::Archive, base::Unretained(this))));
    archive_button_->SetFocusBehavior(views::View::FocusBehavior::ACCESSIBLE_ONLY);
    archive_button_->SetPreferredSize(gfx::Size(24, 24));
    archive_button_->SetTooltipText(u"Archive Chat");
    archive_button_->GetViewAccessibility().SetName(u"Archive Chat");
  }
  GetViewAccessibility().SetName(chat_.title);
  Refresh();
}
AuxChatRow::~AuxChatRow() = default;
gfx::Size AuxChatRow::CalculatePreferredSize(const views::SizeBounds& available) const {
  auto result = views::Button::CalculatePreferredSize(available);
  result.set_height(32);
  return result;
}
void AuxChatRow::Pressed(const ui::Event& event) {
  const std::string id = chat_.id;
  auto action = !show_all_ && event.IsMouseEvent() &&
      (event.flags() & (ui::EF_IS_DOUBLE_CLICK | ui::EF_IS_TRIPLE_CLICK))
      ? rename_ : selected_;
  if (action) action.Run(id);
}
void AuxChatRow::Archive() {
  const std::string id = chat_.id;
  auto action = archive_;
  if (action) action.Run(id);
}
bool AuxChatRow::OnMousePressed(const ui::MouseEvent& event) {
  if (!show_all_ && context_ &&
      (event.flags() & ui::EF_MOUSE_BUTTON) == ui::EF_RIGHT_MOUSE_BUTTON) {
    auto callback = context_;
    Chat copy = chat_;
    callback.Run(this, std::move(copy), event);
    return true;
  }
  return views::Button::OnMousePressed(event);
}
void AuxChatRow::SetSelected(bool selected) {
  if (is_selected_ == selected) return;
  is_selected_ = selected;
  Refresh();
}
void AuxChatRow::StateChanged(ButtonState old_state) {
  views::Button::StateChanged(old_state);
  Refresh();
}
void AuxChatRow::OnThemeChanged() {
  views::Button::OnThemeChanged();
  Refresh();
}
void AuxChatRow::Refresh() {
  const bool hover = GetState() == STATE_HOVERED || GetState() == STATE_PRESSED;
  pin_->SetVisible(chat_.pinned && !show_all_);
  pin_->SetImage(ui::ImageModel::FromVectorIcon(kPinIcon, Color(*this, 236), 16));
  label_->SetEnabledColor(Color(*this, show_all_ ? 222 : is_selected_ ? 221 : 225));
  if (status_) {
    status_->SetVisible(!hover);
    if (chat_.status == ChatStatus::kError)
      static_cast<views::ImageView*>(status_.get())->SetImage(
          ui::ImageModel::FromVectorIcon(kErrorIcon, Color(*this, 274), 16));
  }
  if (archive_button_) {
    archive_button_->SetVisible(hover);
    for (auto state : {STATE_NORMAL, STATE_HOVERED, STATE_PRESSED})
      archive_button_->SetImageModel(state,
          ui::ImageModel::FromVectorIcon(kArchiveIcon, Color(*this, 226), 16));
  }
  SchedulePaint();
}
void AuxChatRow::OnPaintBackground(gfx::Canvas* canvas) {
  if (!is_selected_ && GetState() == STATE_NORMAL) return;
  cc::PaintFlags flags;
  flags.setAntiAlias(true);
  flags.setColor(Color(*this, is_selected_ ? 214 : 247));
  canvas->DrawRoundRect(gfx::RectF(GetLocalBounds()), 10, flags);
}
BEGIN_METADATA(AuxChatRow)
END_METADATA
}  // namespace aux
