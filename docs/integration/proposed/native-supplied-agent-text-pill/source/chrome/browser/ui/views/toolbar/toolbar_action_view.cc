// Copyright 2013 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "chrome/browser/ui/views/toolbar/toolbar_action_view.h"

#include "chrome/browser/buildflags.h"
#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
#include "chrome/browser/aux/component_bootstrap.h"
#include "chrome/browser/ui/color/chrome_color_id.h"
#include "ui/color/color_provider.h"
#include "ui/gfx/color_utils.h"
#include "ui/views/background.h"
#include "ui/views/controls/highlight_path_generator.h"
#endif

#include <string>

#include "base/feature_list.h"
#include "base/functional/bind.h"
#include "base/metrics/user_metrics.h"
#include "base/metrics/user_metrics_action.h"
#include "chrome/browser/extensions/extension_context_menu_model.h"
#include "chrome/browser/themes/theme_properties.h"
#include "chrome/browser/ui/browser_element_identifiers.h"
#include "chrome/browser/ui/layout_constants.h"
#include "chrome/browser/ui/toolbar/toolbar_action_view_model.h"
#include "chrome/browser/ui/view_ids.h"
#include "chrome/browser/ui/views/chrome_layout_provider.h"
#include "chrome/browser/ui/views/event_utils.h"
#include "chrome/browser/ui/views/extensions/extension_context_menu_controller.h"
#include "chrome/browser/ui/views/toolbar/toolbar_button.h"
#include "chrome/browser/ui/views/toolbar/toolbar_icon_container_view.h"
#include "chrome/browser/ui/views/toolbar/toolbar_ink_drop_util.h"
#include "components/sessions/content/session_tab_helper.h"
#include "content/public/browser/browser_context.h"
#include "extensions/common/extension_features.h"
#include "ui/accessibility/ax_node_data.h"
#include "ui/base/metadata/metadata_impl_macros.h"
#include "ui/base/models/image_model.h"
#include "ui/base/models/image_model_utils.h"
#include "ui/base/mojom/menu_source_type.mojom.h"
#include "ui/base/resource/resource_bundle.h"
#include "ui/base/theme_provider.h"
#include "ui/compositor/paint_recorder.h"
#include "ui/events/event.h"
#include "ui/gfx/color_palette.h"
#include "ui/gfx/image/image_skia.h"
#include "ui/native_theme/native_theme.h"
#include "ui/views/accessibility/view_accessibility.h"
#include "ui/views/animation/ink_drop.h"
#include "ui/views/animation/ink_drop_impl.h"
#include "ui/views/controls/button/button.h"
#include "ui/views/controls/button/label_button_border.h"
#include "ui/views/controls/menu/menu_controller.h"
#include "ui/views/controls/menu/menu_model_adapter.h"
#include "ui/views/controls/menu/menu_runner.h"
#include "ui/views/mouse_constants.h"

class ToolbarActionView::ContextMenuObserver
    : public ExtensionContextMenuController::Observer {
 public:
  explicit ContextMenuObserver(ToolbarActionView* owner) : owner_(owner) {}
  ContextMenuObserver(const ContextMenuObserver&) = delete;
  ContextMenuObserver& operator=(const ContextMenuObserver&) = delete;
  ~ContextMenuObserver() override = default;

  // ExtensionContextMenuController::Observer:
  void OnContextMenuShown() override { owner_->OnContextMenuShown(); }
  void OnContextMenuClosed() override { owner_->OnContextMenuClosed(); }

 private:
  const raw_ptr<ToolbarActionView> owner_;
};

using views::LabelButtonBorder;

////////////////////////////////////////////////////////////////////////////////
// ToolbarActionView

ToolbarActionView::ToolbarActionView(ToolbarActionViewModel* view_model,
                                     ToolbarActionView::Delegate* delegate)
    : MenuButton(base::BindRepeating(&ToolbarActionView::ButtonPressed,
                                     base::Unretained(this))),
      view_model_(view_model),
      delegate_(delegate) {
  ConfigureInkDrop(this);
  SetHideInkDropWhenShowingContextMenu(false);
  SetShowInkDropWhenHotTracked(true);
  SetID(VIEW_ID_BROWSER_ACTION);
  SetProperty(views::kElementIdentifierKey, kToolbarActionViewElementId);
  model_subscription_ =
      view_model_->RegisterIconUpdateObserver(base::BindRepeating(
          &ToolbarActionView::UpdateState, base::Unretained(this)));
  SetHorizontalAlignment(gfx::ALIGN_CENTER);
  set_drag_controller(delegate_);
  // Normally, the notify action is determined by whether a view is draggable
  // (and is set to press for non-draggable and release for draggable views).
  // However, ToolbarActionViews may be draggable or non-draggable depending on
  // whether they are shown in an incognito window. We want to preserve the same
  // trigger event to keep the UX (more) consistent. Set all ToolbarActionViews
  // to trigger on mouse release.
  button_controller()->set_notify_action(
      views::ButtonController::NotifyAction::kOnRelease);

  context_menu_observer_ = std::make_unique<ContextMenuObserver>(this);
  context_menu_controller_ = std::make_unique<ExtensionContextMenuController>(
      view_model, context_menu_observer_.get(),
      extensions::ExtensionContextMenuModel::ContextMenuSource::kToolbarAction);
  set_context_menu_controller(context_menu_controller_.get());

#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
  if (view_model_->GetId() == aux::kAgentExtensionId) {
    SetText(u"Ask Aux");
    label()->SetFontList(label()->font_list()
                            .DeriveWithSizeDelta(14 - label()->font_list().GetFontSize())
                            .DeriveWithWeight(gfx::Font::Weight::MEDIUM));
    SetBorder(CreateDefaultBorder());
    views::InstallRoundRectHighlightPathGenerator(this, gfx::Insets(), 999);
  }
#endif
  UpdateState();
}

ToolbarActionView::~ToolbarActionView() {
  set_context_menu_controller(nullptr);
  view_model_->HidePopup();
}

gfx::Rect ToolbarActionView::GetAnchorBoundsInScreen() const {
  gfx::Rect bounds = GetBoundsInScreen();
  bounds.Inset(GetToolbarInkDropInsets(this));
  return bounds;
}

std::unique_ptr<LabelButtonBorder> ToolbarActionView::CreateDefaultBorder()
    const {
  std::unique_ptr<LabelButtonBorder> border =
      LabelButton::CreateDefaultBorder();
  // Toolbar action buttons have no insets because the badges are drawn right at
  // the edge of the view's area. Other padding (such as centering the icon) is
  // handled directly by the Image.
#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
  if (view_model_->GetId() == aux::kAgentExtensionId) {
    border->set_insets(gfx::Insets::VH(4, 10));
    return border;
  }
#endif
  border->set_insets(gfx::Insets());
  return border;
}

bool ToolbarActionView::IsTriggerableEvent(const ui::Event& event) {
  // By default MenuButton checks the time since the menu closure, but that
  // prevents left clicks from showing the extension popup when the context menu
  // is showing.  The time check is to prevent reshowing on the same click that
  // closed the menu, when this class handles via |suppress_next_release_|, so
  // it's not necessary.  Bypass it by calling IsTriggerableEventType() instead
  // of IsTriggerableEvent().
  return button_controller()->IsTriggerableEventType(event);
}

bool ToolbarActionView::OnKeyPressed(const ui::KeyEvent& event) {
  std::optional<event_utils::ReorderDirection> reorder_direction =
      event_utils::GetReorderCommandForKeyboardEvent(event);
  if (reorder_direction) {
    int move_by = 0;
    switch (*reorder_direction) {
      case event_utils::ReorderDirection::kPrevious:
        move_by = -1;
        break;
      case event_utils::ReorderDirection::kNext:
        move_by = 1;
        break;
    }

    delegate_->MovePinnedActionBy(view_model_->GetId(), move_by);
    return true;
  }

  if (event.key_code() == ui::VKEY_DOWN) {
    context_menu_controller()->ShowContextMenuForView(
        this, gfx::Point(), ui::mojom::MenuSourceType::kKeyboard);
    return true;
  }
  return MenuButton::OnKeyPressed(event);
}

// Linux enter/leave events are sometimes flaky, so we don't want to "miss"
// an enter event and fail to hover the button. This is effectively a no-op if
// the button is already showing the hover card (crbug.com/40840442).
void ToolbarActionView::OnMouseMoved(const ui::MouseEvent& event) {
  MaybeUpdateHoverCardStatus(event);
}

void ToolbarActionView::OnMouseEntered(const ui::MouseEvent& event) {
  MaybeUpdateHoverCardStatus(event);
}

void ToolbarActionView::OnFocus() {
  MenuButton::OnFocus();
  delegate_->UpdateHoverCard(this, ToolbarActionHoverCardUpdateType::kFocus);
}

void ToolbarActionView::OnBlur() {
  MenuButton::OnBlur();
  if (!delegate_->IsFocusOnExtensionAction()) {
    delegate_->UpdateHoverCard(nullptr,
                               ToolbarActionHoverCardUpdateType::kFocus);
  }
}

void ToolbarActionView::MaybeUpdateHoverCardStatus(
    const ui::MouseEvent& event) {
  if (!GetWidget()->IsMouseEventsEnabled()) {
    return;
  }

  delegate_->UpdateHoverCard(this, ToolbarActionHoverCardUpdateType::kHover);
}

void ToolbarActionView::UpdateState() {
  content::WebContents* web_contents = delegate_->GetCurrentWebContents();
#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
  const bool supplied_agent = view_model_->GetId() == aux::kAgentExtensionId;
  GetViewAccessibility().SetName(supplied_agent
      ? u"Ask Aux" : view_model_->GetAccessibleName(web_contents));
  if (supplied_agent) {
    SetTooltipText(u"Ask Aux");
    SetText(u"Ask Aux");
    SetTextColor(views::Button::STATE_NORMAL, kColorToolbarButtonIcon);
    SetTextColor(views::Button::STATE_HOVERED, kColorToolbarButtonIconHovered);
    SetTextColor(views::Button::STATE_PRESSED, kColorToolbarButtonIconPressed);
    SetTextColor(views::Button::STATE_DISABLED, kColorToolbarButtonIconInactive);
    for (auto state : {views::Button::STATE_NORMAL, views::Button::STATE_HOVERED,
                       views::Button::STATE_PRESSED, views::Button::STATE_DISABLED}) {
      SetImageModel(state, ui::ImageModel());
    }
    if (const auto* colors = GetColorProvider()) {
      // Supplied normal-state pill: blend toolbar icon into toolbar at 26/255.
      SetBackground(views::CreateRoundedRectBackground(
          color_utils::AlphaBlend(colors->GetColor(kColorToolbarButtonIcon),
                                  colors->GetColor(kColorToolbar), 26.0f / 255.0f),
          999));
    }
  }
#else
  GetViewAccessibility().SetName(view_model_->GetAccessibleName(web_contents));
#endif
  if (!sessions::SessionTabHelper::IdForTab(web_contents).is_valid()) {
    return;
  }

#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
  if (!supplied_agent) {
#endif
  ui::ImageModel icon = view_model_->GetIcon(web_contents, GetPreferredSize());
  if (!icon.IsEmpty()) {
    SetImageModel(views::Button::STATE_NORMAL, icon);
    SetImageModel(views::Button::STATE_DISABLED,
                  ui::GetDefaultDisabledIconFromImageModel(icon));
  }

#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
  }
#endif

  if (!base::FeatureList::IsEnabled(
          extensions_features::kExtensionsMenuAccessControl)) {
#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
    if (!supplied_agent)
#endif
      SetTooltipText(view_model_->GetTooltip(web_contents));
  }

  SchedulePaint();
}

gfx::ImageSkia ToolbarActionView::GetIconForTest() {
  return GetImage(views::Button::STATE_NORMAL);
}

int ToolbarActionView::GetDragOperationsForTest(const gfx::Point& point) {
  return views::View::GetDragOperations(point);
}

gfx::Size ToolbarActionView::CalculatePreferredSize(
    const views::SizeBounds& available_size) const {
#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
  if (view_model_->GetId() == aux::kAgentExtensionId) {
    return LabelButton::CalculatePreferredSize(available_size);
  }
#endif
  return delegate_->GetToolbarActionSize();
}

void ToolbarActionView::OnThemeChanged() {
  MenuButton::OnThemeChanged();
#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
  if (view_model_->GetId() == aux::kAgentExtensionId) {
    UpdateState();
  }
#endif
}

bool ToolbarActionView::OnMousePressed(const ui::MouseEvent& event) {
  delegate_->UpdateHoverCard(nullptr, ToolbarActionHoverCardUpdateType::kEvent);
  if (event.IsOnlyLeftMouseButton()) {
    if (view_model()->IsShowingPopup()) {
      // Left-clicking the button should always hide the popup.  In most cases,
      // this would have happened automatically anyway due to the popup losing
      // activation, but if the popup is currently being inspected, the
      // activation loss will not automatically close it, so force-hide here.
      view_model_->HidePopup();

      // Since we just hid the popup, don't allow the mouse release for this
      // click to re-show it.
      suppress_next_release_ = true;
    } else {
      // This event is likely to trigger the MenuButton action.
      // TODO(bruthig): The ACTION_PENDING triggering logic should be in
      // MenuButton::OnPressed() however there is a bug with the pressed state
      // logic in MenuButton. See http://crbug.com/41227327.
      views::InkDrop::Get(this)->AnimateToState(
          views::InkDropState::ACTION_PENDING, &event);
    }
  }

  return MenuButton::OnMousePressed(event);
}

void ToolbarActionView::OnMouseReleased(const ui::MouseEvent& event) {
  // MenuButton::OnMouseReleased() may synchronously delete |this|, so writing
  // member variables after that point is unsafe.  Instead, copy the old value
  // of |suppress_next_release_| so it can be updated now.
  const bool suppress_next_release = suppress_next_release_;
  suppress_next_release_ = false;
  if (!suppress_next_release) {
    MenuButton::OnMouseReleased(event);
  }
}

void ToolbarActionView::OnGestureEvent(ui::GestureEvent* event) {
  // While the dropdown menu is showing, the button should not handle gestures.
  if (context_menu_controller_->IsMenuRunning()) {
    event->StopPropagation();
  } else {
    MenuButton::OnGestureEvent(event);
  }
}

void ToolbarActionView::OnDragDone() {
  views::MenuButton::OnDragDone();

  // The mouse release that ends a drag does not generate a mouse release event,
  // so OnMouseReleased() doesn't get called.  Thus if the click that started
  // the drag set |suppress_next_release_|, it must be reset here or the next
  // mouse release after the drag will be erroneously discarded.
  suppress_next_release_ = false;
}

void ToolbarActionView::AddedToWidget() {
  MenuButton::AddedToWidget();

  // This cannot happen until there's a focus controller, which lives on the
  // widget.
  view_model_->RegisterCommand();
}

void ToolbarActionView::RemovedFromWidget() {
  // This must happen before the focus controller, which lives on the widget,
  // becomes unreachable.
  view_model_->UnregisterCommand();

  MenuButton::RemovedFromWidget();
}

void ToolbarActionView::OnContextMenuShown() {
  delegate_->OnContextMenuShown(view_model_->GetId());
}

void ToolbarActionView::OnContextMenuClosed() {
  delegate_->OnContextMenuClosed(view_model_->GetId());
}

views::Button* ToolbarActionView::GetReferenceButtonForPopupInternal() {
  // Browser actions in the overflow menu can still show popups, so we may need
  // a reference view other than this button's parent. If so, use the overflow
  // view which is a BrowserAppMenuButton.
  return GetVisible() ? this : delegate_->GetOverflowReferenceView();
}

views::BubbleAnchor ToolbarActionView::GetReferenceButtonForPopup() {
  return views::BubbleAnchor(GetReferenceButtonForPopupInternal());
}

void ToolbarActionView::ShowContextMenuAsFallback() {
  context_menu_controller()->ShowContextMenuForView(
      this, GetKeyboardContextMenuLocation(), ui::mojom::MenuSourceType::kNone);
}

void ToolbarActionView::OnPopupShown(bool by_user) {
  // If this was through direct user action, we press the menu button.
  if (by_user) {
    // GetReferenceButtonForPopup returns either |this| or
    // delegate_->GetOverflowReferenceView() which is a BrowserAppMenuButton.
    // This cast is safe because both will have a MenuButtonController.
    views::MenuButtonController* reference_view_controller =
        static_cast<views::MenuButtonController*>(
            GetReferenceButtonForPopupInternal()->button_controller());
    pressed_lock_ = reference_view_controller->TakeLock();
  }
}

void ToolbarActionView::OnPopupClosed() {
  pressed_lock_.reset();  // Unpress the menu button if it was pressed.
}

void ToolbarActionView::ButtonPressed() {
  if (view_model_->IsEnabled(delegate_->GetCurrentWebContents())) {
    base::RecordAction(base::UserMetricsAction(
        "Extensions.Toolbar.ExtensionActivatedFromToolbar"));
    view_model_->ExecuteUserAction(
        ToolbarActionViewModel::InvocationSource::kToolbarButton);
  } else {
    // If the action isn't enabled, show the context menu as a fallback.
    context_menu_controller()->ShowContextMenuForView(
        this, GetMenuPosition(), ui::mojom::MenuSourceType::kNone);
  }
}

BEGIN_METADATA(ToolbarActionView)
END_METADATA
