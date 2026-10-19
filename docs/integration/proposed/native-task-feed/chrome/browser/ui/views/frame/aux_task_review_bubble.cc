// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// Implements docs/spec/native/surfaces.md V2; dimensions remain provisional.
#include "chrome/browser/ui/views/frame/aux_task_review_bubble.h"

#include "base/functional/bind.h"
#include "ui/base/metadata/metadata_impl_macros.h"
#include "ui/base/mojom/dialog_button.mojom.h"
#include "ui/color/color_id.h"
#include "ui/views/controls/button/md_text_button.h"
#include "ui/views/controls/label.h"
#include "ui/views/controls/scroll_view.h"
#include "ui/views/layout/box_layout.h"
#include "ui/views/widget/widget.h"

views::Widget* AuxTaskReviewBubble::Show(
    views::View* anchor, AuxNativeTask task, ResolveCallback resolve,
    base::OnceClosure open_conversation, base::OnceClosure on_closed) {
  auto bubble = std::unique_ptr<AuxTaskReviewBubble>(new AuxTaskReviewBubble(
      anchor, std::move(task), std::move(resolve),
      std::move(open_conversation), std::move(on_closed)));
  auto* widget = views::BubbleDialogDelegate::CreateBubbleDeprecated(
      std::move(bubble), views::Widget::InitParams::NATIVE_WIDGET_OWNS_WIDGET);
  widget->Show();
  return widget;
}

AuxTaskReviewBubble::AuxTaskReviewBubble(
    views::View* anchor, AuxNativeTask task, ResolveCallback resolve,
    base::OnceClosure open_conversation, base::OnceClosure on_closed)
    : views::BubbleDialogDelegate(anchor, views::BubbleBorder::LEFT_TOP),
      task_(std::move(task)), resolve_(std::move(resolve)),
      open_conversation_(std::move(open_conversation)) {
  RegisterWindowClosingCallback(std::move(on_closed));
  SetButtons(static_cast<int>(ui::mojom::DialogButton::kNone));
  SetShowCloseButton(true);
  SetTitle(task_.title);
  set_close_on_deactivate(true);
  set_fixed_width(360);
  auto* contents = SetContentsView(std::make_unique<views::View>());
  auto* layout = contents->SetLayoutManager(std::make_unique<views::BoxLayout>(
      views::BoxLayout::Orientation::kVertical, gfx::Insets(16), 12));
  layout->set_cross_axis_alignment(views::BoxLayout::CrossAxisAlignment::kStretch);

  auto* heading = contents->AddChildView(std::make_unique<views::Label>(
      task_.pending_action ? task_.pending_action->title : u"Task details"));
  heading->SetMultiLine(true);
  heading->SetHorizontalAlignment(gfx::ALIGN_LEFT);
  if (task_.pending_action && !task_.pending_action->detail.empty()) {
    auto scroll = std::make_unique<views::ScrollView>();
    scroll->ClipHeightTo(0, 240);
    auto detail = std::make_unique<views::Label>(task_.pending_action->detail);
    detail->SetMultiLine(true);
    detail->SetAllowCharacterBreak(true);
    detail->SetHorizontalAlignment(gfx::ALIGN_LEFT);
    detail->SetMaximumWidth(328);
    detail->SetSelectable(true);
    scroll->SetContents(std::move(detail));
    contents->AddChildView(std::move(scroll));
  }
  error_label_ = contents->AddChildView(std::make_unique<views::Label>());
  error_label_->SetMultiLine(true);
  error_label_->SetHorizontalAlignment(gfx::ALIGN_LEFT);
  error_label_->SetEnabledColor(ui::kColorAlertHighSeverity);
  error_label_->SetVisible(false);

  if (task_.pending_action &&
      task_.pending_action->kind == "permission-approval") {
    auto* actions = contents->AddChildView(std::make_unique<views::View>());
    actions->SetLayoutManager(std::make_unique<views::BoxLayout>(
        views::BoxLayout::Orientation::kHorizontal, gfx::Insets(), 8));
    deny_ = actions->AddChildView(std::make_unique<views::MdTextButton>(
        base::BindRepeating(&AuxTaskReviewBubble::Decide,
                            weak_factory_.GetWeakPtr(), false),
        u"Deny"));
    allow_ = actions->AddChildView(std::make_unique<views::MdTextButton>(
        base::BindRepeating(&AuxTaskReviewBubble::Decide,
                            weak_factory_.GetWeakPtr(), true),
        u"Approve"));
    allow_->SetStyle(ui::ButtonStyle::kProminent);
  }
  contents->AddChildView(std::make_unique<views::MdTextButton>(
      base::BindRepeating(&AuxTaskReviewBubble::OpenConversation,
                          weak_factory_.GetWeakPtr()),
      task_.pending_action && task_.pending_action->kind == "ask-user-question"
          ? u"Answer"
      : task_.pending_action && task_.pending_action->kind == "draft-approval"
          ? u"Review"
          : u"Open conversation"));
}

AuxTaskReviewBubble::~AuxTaskReviewBubble() = default;

void AuxTaskReviewBubble::Decide(bool allow) {
  if (!allow_ || !allow_->GetEnabled() || !task_.pending_action)
    return;
  allow_->SetEnabled(false);
  deny_->SetEnabled(false);
  error_label_->SetVisible(false);
  base::DictValue input;
  input.Set("popoverId", task_.pending_action->id);
  input.Set("action", allow ? "approve" : "deny");
  resolve_.Run(task_.id, "resolve-popover", std::move(input),
      base::BindOnce(&AuxTaskReviewBubble::OnResolved,
                     weak_factory_.GetWeakPtr()));
}

void AuxTaskReviewBubble::OnResolved(std::optional<std::u16string> error) {
  if (!error) {
    OpenConversation();
    return;
  }
  allow_->SetEnabled(true);
  deny_->SetEnabled(true);
  error_label_->SetText(*error);
  error_label_->SetVisible(true);
  SizeToContents();
}

void AuxTaskReviewBubble::OpenConversation() {
  if (open_conversation_)
    std::move(open_conversation_).Run();
  if (GetWidget())
    GetWidget()->Close();
}
