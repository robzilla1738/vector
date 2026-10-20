// Copyright 2025 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "chrome/browser/ui/views/tabs/vertical/vertical_tab_strip_bottom_container.h"

#include "base/functional/bind.h"
#include "base/strings/string_number_conversions.h"
#include "base/strings/utf_string_conversions.h"
#include "chrome/browser/sync/sync_service_factory.h"
#include "chrome/browser/ui/browser_element_identifiers.h"
#include "chrome/browser/ui/layout_constants.h"
#include "chrome/browser/ui/tabs/vertical_tab_strip_state_controller.h"
#include "chrome/browser/ui/views/frame/browser_view.h"
#include "chrome/browser/ui/views/frame/vertical_tab_strip_region_view.h"
#include "chrome/browser/ui/views/tabs/shared/new_tab_button.h"
#include "chrome/browser/ui/views/tabs/shared/tab_strip_flat_edge_button.h"
#include "ui/actions/actions.h"
#include "ui/base/metadata/metadata_impl_macros.h"
#include "ui/color/color_provider_key.h"
#include "ui/compositor/layer.h"
#include "ui/views/background.h"
#include "ui/views/border.h"
#include "ui/views/controls/label.h"
#include "ui/views/controls/throbber.h"
#include "ui/views/style/typography.h"
#include "ui/views/view_class_properties.h"
#include "ui/views/widget/widget.h"

VerticalTabStripBottomContainer::VerticalTabStripBottomContainer(
    tabs::VerticalTabStripStateController* state_controller,
    actions::ActionItem* root_action_item,
    BrowserWindowInterface* browser,
    base::RepeatingClosure record_new_tab_button_pressed)
    : browser_(browser), root_action_item_(root_action_item) {
  SetProperty(views::kElementIdentifierKey,
              kVerticalTabStripBottomContainerElementId);

#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
  sync_compact_ = state_controller->GetCollapseState() !=
                  tabs::VerticalTabStripCollapseState::kExpanded;
  InitializeSyncCard();
#else
  auto new_tab_button = std::make_unique<shared::NewTabButton>(
      browser_,
      GetLayoutConstant(LayoutConstant::kVerticalTabStripNewTabButtonSize),
      GetLayoutConstant(LayoutConstant::kVerticalTabStripButtonIconSize));
  new_tab_button->SetOnContextMenuWillShowCallback(base::BindRepeating(
      &VerticalTabStripBottomContainer::OnNewTabButtonContextMenuWillShow,
      base::Unretained(this)));
  new_tab_button->SetOnContextMenuClosedCallback(base::BindRepeating(
      &VerticalTabStripBottomContainer::OnNewTabButtonContextMenuClosed,
      base::Unretained(this)));

  new_tab_button_pressed_subscription_ =
      new_tab_button->RegisterWillInvokeActionCallback(
          record_new_tab_button_pressed);

  new_tab_button_ = AddChildView(std::move(new_tab_button));
#endif

  OnCollapseStateChanged(state_controller->GetCollapseState());
  collapsed_state_change_subscription_ =
      state_controller->RegisterOnCollapseChanged(base::BindRepeating(
          &VerticalTabStripBottomContainer::OnCollapseStateChanged,
          base::Unretained(this)));
}

VerticalTabStripBottomContainer::~VerticalTabStripBottomContainer() = default;

bool VerticalTabStripBottomContainer::IsPositionInWindowCaption(
    const gfx::Point& point) {
  for (views::View* child : children()) {
    if (!child->GetVisible()) {
      continue;
    }
    gfx::Point point_in_child = point;
    views::View::ConvertPointToTarget(this, child, &point_in_child);
    if (child->HitTestPoint(point_in_child)) {
      return false;
    }
  }
  return true;
}

void VerticalTabStripBottomContainer::OnCollapseStateChanged(
    tabs::VerticalTabStripCollapseState state) {
  // Updating the styles immediately at start of the animation by including
  // collapsing state.
  UpdateButtonStyles(state != tabs::VerticalTabStripCollapseState::kExpanded);
}

void VerticalTabStripBottomContainer::OnNewTabButtonContextMenuWillShow() {
  BrowserView* browser_view = BrowserView::GetBrowserViewForBrowser(browser_);
  CHECK(browser_view);
  CHECK(browser_view->tab_strip_view());
  expand_on_hover_lock_ = browser_view->tab_strip_view()->GetExpandOnHoverLock(
      ExpandOnHoverLockType::kKeepCurrentState);
}

void VerticalTabStripBottomContainer::OnNewTabButtonContextMenuClosed() {
  expand_on_hover_lock_.reset();
}

void VerticalTabStripBottomContainer::UpdateButtonStyles(bool collapsed) {
  auto orientation = collapsed ? views::LayoutOrientation::kVertical
                               : views::LayoutOrientation::kHorizontal;

#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
  sync_compact_ = collapsed;
  SetOrientation(orientation);
  SetCrossAxisAlignment(collapsed ? views::LayoutAlignment::kStretch
                                  : views::LayoutAlignment::kStart);
  sync_card_->SetVisible(false);
  SetVisible(collapsed);
#else
  // Setting button's layout based on collapsed state
  SetOrientation(orientation);
  SetCrossAxisAlignment(collapsed ? views::LayoutAlignment::kStretch
                                  : views::LayoutAlignment::kStart);

  new_tab_button_->SetProperty(
      views::kFlexBehaviorKey,
      views::FlexSpecification(
          orientation, views::MinimumFlexSizeRule::kScaleToMinimum,
          collapsed ? views::MaximumFlexSizeRule::kPreferred
                    : views::MaximumFlexSizeRule::kUnbounded,
          false, views::MinimumFlexSizeRule::kPreferred));

  new_tab_button_->SetInsets(GetLayoutInsets(
      collapsed ? LayoutInset::VERTICAL_TAB_STRIP_BOTTOM_BUTTON_COLLAPSED
                : LayoutInset::VERTICAL_TAB_STRIP_BOTTOM_BUTTON_UNCOLLAPSED));
#endif
}

#if BUILDFLAG(ENABLE_AUX_BROWSER) && BUILDFLAG(IS_MAC)
void VerticalTabStripBottomContainer::InitializeSyncCard() {
  sync_card_ = AddChildView(std::make_unique<views::FlexLayoutView>());
  sync_card_->SetOrientation(views::LayoutOrientation::kVertical);
  sync_card_->SetCrossAxisAlignment(views::LayoutAlignment::kStretch);
  sync_card_->SetInteriorMargin(gfx::Insets::TLBR(10, 12, 10, 12));
  sync_card_->SetCollapseMargins(true);
  sync_card_->SetProperty(views::kMarginsKey, gfx::Insets::TLBR(2, 4, 4, 4));
  sync_card_->SetPaintToLayer();
  sync_card_->layer()->SetFillsBoundsOpaquely(false);
  sync_row_ =
      sync_card_->AddChildView(std::make_unique<views::FlexLayoutView>());
  sync_row_->SetCrossAxisAlignment(views::LayoutAlignment::kCenter);
  sync_row_->SetCollapseMargins(true);
  sync_throbber_ =
      sync_row_->AddChildView(std::make_unique<views::Throbber>(18));
  sync_throbber_->SetProperty(views::kMarginsKey,
                              gfx::Insets::TLBR(0, 0, 0, 8));
  sync_throbber_->Start();
  sync_label_ = sync_row_->AddChildView(std::make_unique<views::Label>(
      u"Syncing...", views::style::CONTEXT_LABEL, views::style::STYLE_PRIMARY));
  sync_label_->SetFontList(
      sync_label_->font_list().DeriveWithWeight(gfx::Font::Weight::SEMIBOLD));
  sync_label_->SetHorizontalAlignment(gfx::ALIGN_LEFT);
  sync_label_->SetSubpixelRenderingEnabled(false);
  sync_label_->SetMultiLine(false);
  sync_label_->SetProperty(
      views::kFlexBehaviorKey,
      views::FlexSpecification(views::LayoutOrientation::kHorizontal,
                               views::MinimumFlexSizeRule::kScaleToZero,
                               views::MaximumFlexSizeRule::kUnbounded, false,
                               views::MinimumFlexSizeRule::kPreferred));
  UpdateSyncLabel();
  sync_service_ = SyncServiceFactory::GetForProfile(browser_->GetProfile());
  if (sync_service_) {
    sync_observation_.Observe(sync_service_);
  }
  UpdateSyncState();
  UpdateSyncLabel();
  sync_card_->SetVisible(false);
}

void VerticalTabStripBottomContainer::UpdateSyncState() {
  const syncer::DataTypeSet pending =
      sync_service_ ? sync_service_->GetTypesWithPendingDownloadForInitialSync()
                    : syncer::DataTypeSet();
  if (pending == pending_initial_downloads_) {
    return;
  }
  pending_initial_downloads_ = pending;
  UpdateSyncLabel();
  UpdateButtonStyles(sync_compact_);
}

void VerticalTabStripBottomContainer::UpdateSyncLabel() {
  sync_row_->SetVisible(false);
  std::u16string text = u"Syncing...";
  if (!pending_initial_downloads_.empty()) {
    text += u" (";
    size_t displayed = 0;
    for (syncer::DataType type : pending_initial_downloads_) {
      if (displayed == 2) {
        break;
      }
      if (displayed != 0) {
        text += u", ";
      }
      text += base::UTF8ToUTF16(syncer::DataTypeToDebugString(type));
      ++displayed;
    }
    if (pending_initial_downloads_.size() > displayed) {
      text += u" +" + base::NumberToString16(pending_initial_downloads_.size() -
                                             displayed);
    }
    text += u")";
  }
  sync_label_->SetText(text);
  sync_throbber_->Stop();
}

void VerticalTabStripBottomContainer::OnStateChanged(
    syncer::SyncService* service) {
  if (service == sync_service_) {
    UpdateSyncState();
  }
}

void VerticalTabStripBottomContainer::OnSyncShutdown(
    syncer::SyncService* service) {
  if (service != sync_service_) {
    return;
  }
  sync_observation_.Reset();
  sync_service_ = nullptr;
  UpdateSyncState();
}

void VerticalTabStripBottomContainer::OnThemeChanged() {
  views::FlexLayoutView::OnThemeChanged();
  if (!GetWidget() || !sync_card_) {
    return;
  }
  const bool dark =
      GetWidget()->GetColorMode() == ui::ColorProviderKey::ColorMode::kDark;
  sync_label_->SetEnabledColor(dark ? 0xd9fafafa : 0xd90a0a0a);
  sync_card_->SetBackground(
      views::CreateRoundedRectBackground(dark ? 0x9918181b : 0x99ffffff, 12));
  sync_card_->SetBorder(
      views::CreateRoundedRectBorder(1, 12, dark ? 0x26fafafa : 0x1a0a0a0a));
}
#endif

BEGIN_METADATA(VerticalTabStripBottomContainer)
END_METADATA
