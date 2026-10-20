// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#include "chrome/browser/ui/views/frame/aux_agent_tabs_bubble.h"

#include <algorithm>
#include <optional>
#include <utility>
#include <vector>

#include "base/functional/bind.h"
#include "base/memory/raw_ptr.h"
#include "base/no_destructor.h"
#include "base/scoped_observation.h"
#include "base/strings/string_number_conversions.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/tab_ui_helper.h"
#include "chrome/browser/ui/tabs/tab_group_features.h"
#include "chrome/browser/ui/tabs/tab_group_model.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/tabs/tab_strip_model_observer.h"
#include "chrome/browser/ui/views/tabs/tab.h"
#include "chrome/browser/ui/views/tabs/tab_strip.h"
#include "components/favicon/content/content_favicon_driver.h"
#include "components/tab_groups/tab_group_id.h"
#include "components/tabs/public/tab_group.h"
#include "components/tabs/public/tab_interface.h"
#include "components/vector_icons/vector_icons.h"
#include "content/public/browser/web_contents.h"
#include "ui/base/metadata/metadata_impl_macros.h"
#include "ui/base/mojom/dialog_button.mojom.h"
#include "ui/color/color_id.h"
#include "ui/gfx/font.h"
#include "ui/gfx/font_list.h"
#include "ui/gfx/image/image.h"
#include "ui/gfx/vector_icon_types.h"
#include "ui/views/accessibility/view_accessibility.h"
#include "ui/views/border.h"
#include "ui/views/bubble/bubble_dialog_delegate_view.h"
#include "ui/views/controls/button/button.h"
#include "ui/views/controls/button/image_button.h"
#include "ui/views/controls/button/image_button_factory.h"
#include "ui/views/controls/focus_ring.h"
#include "ui/views/controls/highlight_path_generator.h"
#include "ui/views/controls/image_view.h"
#include "ui/views/controls/label.h"
#include "ui/views/controls/separator.h"
#include "ui/views/focus/focus_manager.h"
#include "ui/views/layout/flex_layout.h"
#include "ui/views/widget/widget.h"

namespace {
// Exact supplied functional glyph path scalars (bit-preserving float32).
// clang-format off
constexpr gfx::PathElement kWindowSparklePath[] = {
    gfx::CANVAS_DIMENSIONS, 16.0f,
    gfx::MOVE_TO, 12.0f, 7.32999992f,
    gfx::CUBIC_TO, 12.3699999f, 7.32999992f, 12.6700001f, 7.63000011f, 12.6700001f, 8.0f,
    gfx::CUBIC_TO, 12.6700001f, 8.84000015f, 12.8500004f, 9.30000019f, 13.1099997f, 9.56000042f,
    gfx::CUBIC_TO, 13.3699999f, 9.81000042f, 13.8199997f, 10.0f, 14.6700001f, 10.0f,
    gfx::CUBIC_TO, 15.0299997f, 10.0f, 15.3299999f, 10.3000002f, 15.3299999f, 10.6700001f,
    gfx::CUBIC_TO, 15.3299999f, 11.0299997f, 15.0299997f, 11.3299999f, 14.6700001f, 11.3299999f,
    gfx::CUBIC_TO, 13.8199997f, 11.3299999f, 13.3699999f, 11.5200005f, 13.1099997f, 11.7799997f,
    gfx::CUBIC_TO, 12.8500004f, 12.0299997f, 12.6700001f, 12.4899998f, 12.6700001f, 13.3299999f,
    gfx::CUBIC_TO, 12.6700001f, 13.6999998f, 12.3699999f, 14.0f, 12.0f, 14.0f,
    gfx::CUBIC_TO, 11.6300001f, 14.0f, 11.3299999f, 13.6999998f, 11.3299999f, 13.3299999f,
    gfx::CUBIC_TO, 11.3299999f, 12.4899998f, 11.1499996f, 12.0299997f, 10.8900003f, 11.7799997f,
    gfx::CUBIC_TO, 10.6300001f, 11.5200005f, 10.1800003f, 11.3299999f, 9.32999992f, 11.3299999f,
    gfx::CUBIC_TO, 8.96000004f, 11.3299999f, 8.67000008f, 11.0299997f, 8.67000008f, 10.6700001f,
    gfx::CUBIC_TO, 8.67000008f, 10.3000002f, 8.96000004f, 10.0f, 9.32999992f, 10.0f,
    gfx::CUBIC_TO, 10.1800003f, 10.0f, 10.6300001f, 9.81000042f, 10.8900003f, 9.56000042f,
    gfx::CUBIC_TO, 11.1499996f, 9.30000019f, 11.3299999f, 8.84000015f, 11.3299999f, 8.0f,
    gfx::CUBIC_TO, 11.3299999f, 7.63000011f, 11.6300001f, 7.32999992f, 12.0f, 7.32999992f,
    gfx::CLOSE,
    gfx::MOVE_TO, 12.0f, 2.67000008f,
    gfx::CUBIC_TO, 13.4700003f, 2.67000008f, 14.6700001f, 3.8599999f, 14.6700001f, 5.32999992f,
    gfx::CUBIC_TO, 14.6700001f, 5.69999981f, 14.3699999f, 6.0f, 14.0f, 6.0f,
    gfx::CUBIC_TO, 13.6300001f, 6.0f, 13.3299999f, 5.69999981f, 13.3299999f, 5.32999992f,
    gfx::CUBIC_TO, 13.3299999f, 4.5999999f, 12.7399998f, 4.0f, 12.0f, 4.0f,
    gfx::H_LINE_TO, 4.0f,
    gfx::CUBIC_TO, 3.25999999f, 4.0f, 2.67000008f, 4.5999999f, 2.67000008f, 5.32999992f,
    gfx::V_LINE_TO, 10.6700001f,
    gfx::CUBIC_TO, 2.67000008f, 11.3999996f, 3.25999999f, 12.0f, 4.0f, 12.0f,
    gfx::H_LINE_TO, 6.67000008f,
    gfx::CUBIC_TO, 7.03000021f, 12.0f, 7.32999992f, 12.3000002f, 7.32999992f, 12.6700001f,
    gfx::CUBIC_TO, 7.32999992f, 13.0299997f, 7.03000021f, 13.3299999f, 6.67000008f, 13.3299999f,
    gfx::H_LINE_TO, 4.0f,
    gfx::CUBIC_TO, 2.52999997f, 13.3299999f, 1.33000004f, 12.1400003f, 1.33000004f, 10.6700001f,
    gfx::V_LINE_TO, 5.32999992f,
    gfx::CUBIC_TO, 1.33000004f, 3.8599999f, 2.52999997f, 2.67000008f, 4.0f, 2.67000008f,
    gfx::H_LINE_TO, 12.0f,
    gfx::CLOSE,
    gfx::MOVE_TO, 11.8299999f, 10.5f,
    gfx::CUBIC_TO, 11.7700005f, 10.5600004f, 11.71f, 10.6099997f, 11.6499996f, 10.6700001f,
    gfx::CUBIC_TO, 11.71f, 10.7200003f, 11.7700005f, 10.7700005f, 11.8299999f, 10.8299999f,
    gfx::CUBIC_TO, 11.8900003f, 10.8900003f, 11.9499998f, 10.96f, 12.0f, 11.0200005f,
    gfx::CUBIC_TO, 12.0500002f, 10.96f, 12.1099997f, 10.8900003f, 12.1700001f, 10.8299999f,
    gfx::CUBIC_TO, 12.2299995f, 10.7700005f, 12.29f, 10.7200003f, 12.3500004f, 10.6700001f,
    gfx::CUBIC_TO, 12.29f, 10.6099997f, 12.2299995f, 10.5600004f, 12.1700001f, 10.5f,
    gfx::CUBIC_TO, 12.1099997f, 10.4399996f, 12.0500002f, 10.3800001f, 12.0f, 10.3100004f,
    gfx::CUBIC_TO, 11.9499998f, 10.3800001f, 11.8900003f, 10.4399996f, 11.8299999f, 10.5f,
    gfx::CLOSE,
    gfx::MOVE_TO, 4.0f, 4.67000008f,
    gfx::CUBIC_TO, 4.36999989f, 4.67000008f, 4.67000008f, 4.96999979f, 4.67000008f, 5.32999992f,
    gfx::CUBIC_TO, 4.67000008f, 5.69999981f, 4.36999989f, 6.0f, 4.0f, 6.0f,
    gfx::CUBIC_TO, 3.63000011f, 6.0f, 3.32999992f, 5.69999981f, 3.32999992f, 5.32999992f,
    gfx::CUBIC_TO, 3.32999992f, 4.96999979f, 3.63000011f, 4.67000008f, 4.0f, 4.67000008f,
    gfx::CLOSE,
    gfx::MOVE_TO, 6.0f, 4.67000008f,
    gfx::CUBIC_TO, 6.36999989f, 4.67000008f, 6.67000008f, 4.96999979f, 6.67000008f, 5.32999992f,
    gfx::CUBIC_TO, 6.67000008f, 5.69999981f, 6.36999989f, 6.0f, 6.0f, 6.0f,
    gfx::CUBIC_TO, 5.63000011f, 6.0f, 5.32999992f, 5.69999981f, 5.32999992f, 5.32999992f,
    gfx::CUBIC_TO, 5.32999992f, 4.96999979f, 5.63000011f, 4.67000008f, 6.0f, 4.67000008f,
    gfx::CLOSE,
    gfx::MOVE_TO, 8.0f, 4.67000008f,
    gfx::CUBIC_TO, 8.36999989f, 4.67000008f, 8.67000008f, 4.96999979f, 8.67000008f, 5.32999992f,
    gfx::CUBIC_TO, 8.67000008f, 5.69999981f, 8.36999989f, 6.0f, 8.0f, 6.0f,
    gfx::CUBIC_TO, 7.63000011f, 6.0f, 7.32999992f, 5.69999981f, 7.32999992f, 5.32999992f,
    gfx::CUBIC_TO, 7.32999992f, 4.96999979f, 7.63000011f, 4.67000008f, 8.0f, 4.67000008f,
    gfx::CLOSE,
};
const gfx::VectorIconRep kWindowSparkleReps[] = {{kWindowSparklePath}};
const gfx::VectorIcon kWindowSparkleIcon(kWindowSparkleReps, 1, "kAuxWindowSparkleIcon");

constexpr gfx::PathElement kGlobePath[] = {
    gfx::CANVAS_DIMENSIONS, 16.0f,
    gfx::MOVE_TO, 8.0f, 0.5f,
    gfx::CUBIC_TO, 11.8900003f, 0.5f, 15.0900002f, 3.46000004f, 15.46f, 7.25f,
    gfx::H_LINE_TO, 15.5f,
    gfx::V_LINE_TO, 8.75f,
    gfx::H_LINE_TO, 15.46f,
    gfx::CUBIC_TO, 15.0900002f, 12.54f, 11.8900003f, 15.5f, 8.0f, 15.5f,
    gfx::CUBIC_TO, 4.11000013f, 15.5f, 0.910000026f, 12.54f, 0.540000021f, 8.75f,
    gfx::H_LINE_TO, 0.5f,
    gfx::V_LINE_TO, 7.25f,
    gfx::H_LINE_TO, 0.540000021f,
    gfx::CUBIC_TO, 0.910000026f, 3.46000004f, 4.11000013f, 0.5f, 8.0f, 0.5f,
    gfx::CLOSE,
    gfx::MOVE_TO, 6.13999987f, 8.75f,
    gfx::CUBIC_TO, 6.21000004f, 10.2399998f, 6.46999979f, 11.5500002f, 6.84000015f, 12.5f,
    gfx::CUBIC_TO, 7.05999994f, 13.0600004f, 7.30000019f, 13.46f, 7.53000021f, 13.71f,
    gfx::CUBIC_TO, 7.76000023f, 13.96f, 7.92000008f, 14.0f, 8.0f, 14.0f,
    gfx::CUBIC_TO, 8.07999992f, 14.0f, 8.23999977f, 13.96f, 8.47000027f, 13.71f,
    gfx::CUBIC_TO, 8.69999981f, 13.46f, 8.93999958f, 13.0600004f, 9.15999985f, 12.5f,
    gfx::CUBIC_TO, 9.52999973f, 11.5500002f, 9.78999996f, 10.2399998f, 9.85999966f, 8.75f,
    gfx::H_LINE_TO, 6.13999987f,
    gfx::CLOSE,
    gfx::MOVE_TO, 2.04999995f, 8.75f,
    gfx::CUBIC_TO, 2.31999993f, 10.8999996f, 3.72000003f, 12.6999998f, 5.6500001f, 13.5200005f,
    gfx::CUBIC_TO, 5.57999992f, 13.3699999f, 5.51000023f, 13.21f, 5.44000006f, 13.04f,
    gfx::CUBIC_TO, 5.0f, 11.8900003f, 4.71000004f, 10.3900003f, 4.63999987f, 8.75f,
    gfx::H_LINE_TO, 2.04999995f,
    gfx::CLOSE,
    gfx::MOVE_TO, 11.3599997f, 8.75f,
    gfx::CUBIC_TO, 11.29f, 10.3900003f, 11.0f, 11.8900003f, 10.5600004f, 13.04f,
    gfx::CUBIC_TO, 10.4899998f, 13.21f, 10.4200001f, 13.3699999f, 10.3500004f, 13.5200005f,
    gfx::CUBIC_TO, 12.2799997f, 12.6999998f, 13.6800003f, 10.8999996f, 13.9499998f, 8.75f,
    gfx::H_LINE_TO, 11.3599997f,
    gfx::CLOSE,
    gfx::MOVE_TO, 5.6500001f, 2.48000002f,
    gfx::CUBIC_TO, 3.72000003f, 3.29999995f, 2.31999993f, 5.0999999f, 2.04999995f, 7.25f,
    gfx::H_LINE_TO, 4.63999987f,
    gfx::CUBIC_TO, 4.71000004f, 5.61000013f, 5.0f, 4.11000013f, 5.44000006f, 2.96000004f,
    gfx::CUBIC_TO, 5.51000023f, 2.78999996f, 5.57999992f, 2.63000011f, 5.6500001f, 2.48000002f,
    gfx::CLOSE,
    gfx::MOVE_TO, 8.0f, 2.0f,
    gfx::CUBIC_TO, 7.92000008f, 2.0f, 7.76000023f, 2.03999996f, 7.53000021f, 2.28999996f,
    gfx::CUBIC_TO, 7.30000019f, 2.53999996f, 7.05999994f, 2.94000006f, 6.84000015f, 3.5f,
    gfx::CUBIC_TO, 6.46999979f, 4.46000004f, 6.21000004f, 5.76000023f, 6.13999987f, 7.25f,
    gfx::H_LINE_TO, 9.85999966f,
    gfx::CUBIC_TO, 9.78999996f, 5.76000023f, 9.52999973f, 4.46000004f, 9.15999985f, 3.5f,
    gfx::CUBIC_TO, 8.93999958f, 2.94000006f, 8.69999981f, 2.53999996f, 8.47000027f, 2.28999996f,
    gfx::CUBIC_TO, 8.23999977f, 2.03999996f, 8.07999992f, 2.0f, 8.0f, 2.0f,
    gfx::CLOSE,
    gfx::MOVE_TO, 10.3500004f, 2.48000002f,
    gfx::CUBIC_TO, 10.4200001f, 2.63000011f, 10.4899998f, 2.78999996f, 10.5600004f, 2.96000004f,
    gfx::CUBIC_TO, 11.0f, 4.11000013f, 11.29f, 5.61000013f, 11.3599997f, 7.25f,
    gfx::H_LINE_TO, 13.9499998f,
    gfx::CUBIC_TO, 13.6800003f, 5.0999999f, 12.2799997f, 3.29999995f, 10.3500004f, 2.48000002f,
    gfx::CLOSE,
};
const gfx::VectorIconRep kGlobeReps[] = {{kGlobePath}};
const gfx::VectorIcon kGlobeIcon(kGlobeReps, 1, "kAuxGlobeIcon");
// clang-format on

struct AgentTabsBubbleOwner {
  base::WeakPtr<BrowserWindowInterface> browser;
  base::WeakPtr<views::Widget> widget;
};

std::vector<AgentTabsBubbleOwner>& AgentTabsBubbleOwners() {
  static base::NoDestructor<std::vector<AgentTabsBubbleOwner>> owners;
  std::erase_if(*owners, [](const auto& owner) {
    return !owner.browser || !owner.widget;
  });
  return *owners;
}

std::unique_ptr<views::Label> MakeLabel(const std::u16string& text,
                                        int size,
                                        gfx::Font::Weight weight,
                                        int line_height) {
  auto label = std::make_unique<views::Label>(text);
  label->SetHorizontalAlignment(gfx::ALIGN_LEFT);
  label->SetFontList(label->font_list().Derive(
      size - label->font_list().GetFontSize(), gfx::Font::NORMAL, weight));
  label->SetLineHeight(line_height);
  return label;
}

void ConfigureButton(views::Button* button, int radius) {
  button->SetFocusBehavior(views::View::FocusBehavior::ALWAYS);
  button->SetNotifyEnterExitOnChild(true);
  views::FocusRing::Install(button);
  views::InstallRoundRectHighlightPathGenerator(button, gfx::Insets(), radius);
}

class AgentTabsRow : public views::Button, public views::FocusChangeListener {
  METADATA_HEADER(AgentTabsRow, views::Button)
 public:
  AgentTabsRow(TabStripModel* model,
               tabs::TabInterface* tab,
               base::WeakPtr<TabStrip> tab_strip)
      : views::Button(base::BindRepeating(&AgentTabsRow::Activate,
                                          base::Unretained(this))),
        model_(model),
        tab_(tab->GetHandle()),
        tab_strip_(tab_strip) {
    ConfigureButton(this, 8);
    SetBorder(views::CreateEmptyBorder(gfx::Insets::TLBR(0, 8, 0, -1)));
    SetLayoutManager(std::make_unique<views::FlexLayout>())
        ->SetCrossAxisAlignment(views::LayoutAlignment::kCenter)
        .SetCollapseMargins(true)
        .SetDefault(views::kMarginsKey, gfx::Insets::TLBR(0, 0, 0, 8));
    auto* favicon = AddChildView(std::make_unique<views::ImageView>());
    favicon->SetImageSize(gfx::Size(16, 16));
    auto* contents = tab->GetContents();
    auto* driver = favicon::ContentFaviconDriver::FromWebContents(contents);
    auto image = driver ? driver->GetFavicon() : gfx::Image();
    favicon->SetImage(image.IsEmpty() ? ui::ImageModel::FromVectorIcon(
                                            kGlobeIcon, ui::kColorIcon, 16)
                                      : ui::ImageModel::FromImage(image));
    const auto title_text = TabUIHelper::From(tab)->GetTitle();
    auto* title =
        AddChildView(MakeLabel(title_text, 14, gfx::Font::Weight::NORMAL, 20));
    title->SetProperty(
        views::kFlexBehaviorKey,
        views::FlexSpecification(views::MinimumFlexSizeRule::kScaleToMinimum,
                                 views::MaximumFlexSizeRule::kUnbounded));
    GetViewAccessibility().SetName(title_text);
    auto close = views::CreateVectorImageButtonWithNativeTheme(
        base::BindRepeating(&AgentTabsRow::Close, base::Unretained(this)),
        vector_icons::kCloseIcon, 16);
    close->SetPreferredSize(gfx::Size(22, 22));
    close->SetTooltipText(u"Close tab");
    close->GetViewAccessibility().SetName(u"Close tab");
    close_ = AddChildView(std::move(close));
    close_->SetVisible(false);
  }

  void AddedToWidget() override {
    views::Button::AddedToWidget();
    focus_observation_.Observe(GetFocusManager());
  }
  void RemovedFromWidget() override {
    focus_observation_.Reset();
    views::Button::RemovedFromWidget();
  }
  void OnDidChangeFocus(views::View*, views::View*) override {
    UpdateCloseVisibility();
  }
  void OnMouseEntered(const ui::MouseEvent& event) override {
    views::Button::OnMouseEntered(event);
    UpdateCloseVisibility();
    auto* tab = tab_.Get();
    const int index = tab ? model_->GetIndexOfTab(tab) : TabStripModel::kNoTab;
    if (tab_strip_ && index != TabStripModel::kNoTab) {
      tab_strip_->UpdateHoverCard(
          tab_strip_->tab_at(index),
          TabSlotController::HoverCardUpdateType::kHover);
    }
  }
  void OnMouseExited(const ui::MouseEvent& event) override {
    views::Button::OnMouseExited(event);
    UpdateCloseVisibility();
    if (tab_strip_) {
      tab_strip_->UpdateHoverCard(
          nullptr, TabSlotController::HoverCardUpdateType::kHover);
    }
  }

 private:
  void UpdateCloseVisibility() {
    auto* focus_manager = GetFocusManager();
    close_->SetVisible(
        IsMouseHovered() ||
        (focus_manager && Contains(focus_manager->GetFocusedView())));
  }
  void Activate() {
    auto* tab = tab_.Get();
    const int index = tab ? model_->GetIndexOfTab(tab) : TabStripModel::kNoTab;
    if (index != TabStripModel::kNoTab) {
      model_->ActivateTabAt(index);
    }
  }
  void Close() {
    auto* tab = tab_.Get();
    const int index = tab ? model_->GetIndexOfTab(tab) : TabStripModel::kNoTab;
    if (index != TabStripModel::kNoTab) {
      model_->CloseWebContentsAt(
          index, TabCloseTypes::CLOSE_USER_GESTURE |
                     TabCloseTypes::CLOSE_CREATE_HISTORICAL_TAB);
    }
  }
  const raw_ptr<TabStripModel> model_;
  const tabs::TabHandle tab_;
  const base::WeakPtr<TabStrip> tab_strip_;
  raw_ptr<views::ImageButton> close_ = nullptr;
  base::ScopedObservation<views::FocusManager, views::FocusChangeListener>
      focus_observation_{this};
};
BEGIN_METADATA(AgentTabsRow)
END_METADATA

class AgentTabsBubble : public views::BubbleDialogDelegateView,
                        public TabStripModelObserver {
  METADATA_HEADER(AgentTabsBubble, views::BubbleDialogDelegateView)
 public:
  AgentTabsBubble(BrowserWindowInterface* browser,
                  views::View* anchor,
                  tab_groups::TabGroupId group,
                  base::WeakPtr<TabStrip> tab_strip)
      : views::BubbleDialogDelegateView(anchor, views::BubbleBorder::TOP_LEFT),
        model_(browser->GetTabStripModel()),
        group_(group),
        tab_strip_(tab_strip) {
    SetAccessibleTitle(u"Agent Tabs");
    SetButtons(static_cast<int>(ui::mojom::DialogButton::kNone));
    set_margins(gfx::Insets());
    set_corner_radius(10);
    SetLayoutManager(std::make_unique<views::FlexLayout>())
        ->SetOrientation(views::LayoutOrientation::kVertical);
    auto* header = AddChildView(std::make_unique<views::View>());
    header->SetBorder(
        views::CreateEmptyBorder(gfx::Insets::TLBR(10, 12, 8, 12)));
    header->SetLayoutManager(std::make_unique<views::FlexLayout>())
        ->SetOrientation(views::LayoutOrientation::kVertical);
    header->AddChildView(
        MakeLabel(u"Agent Tabs", 14, gfx::Font::Weight::MEDIUM, 20));
    header->AddChildView(MakeLabel(u"Background tabs opened for work", 12,
                                   gfx::Font::Weight::NORMAL, 18));
    AddSeparator();
    rows_ = AddChildView(std::make_unique<views::View>());
    rows_->SetBorder(views::CreateEmptyBorder(gfx::Insets(4)));
    rows_->SetLayoutManager(std::make_unique<views::FlexLayout>())
        ->SetOrientation(views::LayoutOrientation::kVertical);
    AddSeparator();
    auto* footer = AddChildView(std::make_unique<views::View>());
    footer->SetBorder(views::CreateEmptyBorder(gfx::Insets(4)));
    footer->SetLayoutManager(std::make_unique<views::FlexLayout>())
        ->SetOrientation(views::LayoutOrientation::kVertical);
    auto close_all = std::make_unique<views::Button>(base::BindRepeating(
        &AgentTabsBubble::CloseAll, base::Unretained(this)));
    ConfigureButton(close_all.get(), 8);
    close_all->SetBorder(
        views::CreateEmptyBorder(gfx::Insets::TLBR(0, 8, 0, 8)));
    close_all->SetLayoutManager(std::make_unique<views::FlexLayout>())
        ->SetCrossAxisAlignment(views::LayoutAlignment::kCenter);
    close_all->AddChildView(
        MakeLabel(u"Close all", 14, gfx::Font::Weight::NORMAL, 20));
    close_all->GetViewAccessibility().SetName(u"Close all");
    footer->AddChildView(std::move(close_all));
    observation_.Observe(model_);
    Refresh();
  }

  void OnTabStripModelChanged(TabStripModel*,
                              const TabStripModelChange&,
                              const TabStripSelectionChange&) override {
    Refresh();
  }
  void OnTabGroupChanged(const TabGroupChange& change) override {
    if (change.group == group_) {
      if (change.type == TabGroupChange::Type::kClosed) {
        CloseBubble();
      } else {
        Refresh();
      }
    }
  }
  void OnTabChangedAt(tabs::TabInterface*, TabChangeType) override {
    Refresh();
  }
  void OnTabStripModelDestroyed(TabStripModel*) override {
    observation_.Reset();
    rows_->RemoveAllChildViews();
    model_ = nullptr;
    CloseBubble();
  }

 private:
  void AddSeparator() {
    auto* separator = AddChildView(std::make_unique<views::Separator>());
    separator->SetOrientation(views::Separator::Orientation::kHorizontal);
    separator->SetBorder(
        views::CreateEmptyBorder(gfx::Insets::TLBR(0, 4, 0, 4)));
  }
  void CloseBubble() {
    if (GetWidget()) {
      GetWidget()->CloseWithReason(views::Widget::ClosedReason::kUnspecified);
    }
  }
  void Refresh() {
    auto* groups = model_->group_model();
    if (!groups || !groups->ContainsTabGroup(group_)) {
      CloseBubble();
      return;
    }
    rows_->RemoveAllChildViews();
    const auto range = groups->GetTabGroup(group_)->ListTabs();
    for (int index = range.start(); index < static_cast<int>(range.end());
         ++index) {
      rows_->AddChildView(std::make_unique<AgentTabsRow>(
          model_, model_->GetTabAtIndex(index), tab_strip_));
    }
    if (GetWidget()) {
      SizeToContents();
    }
  }
  void CloseAll() {
    auto* groups = model_ ? model_->group_model() : nullptr;
    if (!groups || !groups->ContainsTabGroup(group_)) {
      return;
    }
    // The real model opens an ungrouped tab first if this is every tab.
    model_->CloseAllTabsInGroup(group_);
  }
  raw_ptr<TabStripModel> model_;
  const tab_groups::TabGroupId group_;
  const base::WeakPtr<TabStrip> tab_strip_;
  raw_ptr<views::View> rows_ = nullptr;
  base::ScopedObservation<TabStripModel, TabStripModelObserver> observation_{
      this};
};
BEGIN_METADATA(AgentTabsBubble)
END_METADATA

class AgentTabsButton : public views::Button, public TabStripModelObserver {
  METADATA_HEADER(AgentTabsButton, views::Button)
 public:
  AgentTabsButton(BrowserWindowInterface* browser, TabStrip* tab_strip)
      : views::Button(base::BindRepeating(&AgentTabsButton::Toggle,
                                          base::Unretained(this))),
        browser_(browser->GetWeakPtr()),
        model_(browser->GetTabStripModel()),
        tab_strip_(tab_strip ? tab_strip->AsWeakPtr()
                             : base::WeakPtr<TabStrip>()) {
    ConfigureButton(this, 10);
    SetBorder(views::CreateEmptyBorder(gfx::Insets::TLBR(0, 6, 0, 6)));
    SetLayoutManager(std::make_unique<views::FlexLayout>())
        ->SetCrossAxisAlignment(views::LayoutAlignment::kCenter)
        .SetCollapseMargins(true)
        .SetDefault(views::kMarginsKey, gfx::Insets::TLBR(0, 0, 0, 6));
    auto* icon = AddChildView(std::make_unique<views::ImageView>());
    icon->SetImageSize(gfx::Size(16, 16));
    icon->SetImage(
        ui::ImageModel::FromVectorIcon(kWindowSparkleIcon, ui::kColorIcon, 16));
    AddChildView(MakeLabel(u"Agent Tabs", 14, gfx::Font::Weight::MEDIUM, 20));
    count_ = AddChildView(MakeLabel(u"", 12, gfx::Font::Weight::MEDIUM, 18));
    count_->SetHorizontalAlignment(gfx::ALIGN_CENTER);
    count_->SetPreferredSize(gfx::Size(14, 18));
    count_->SetProperty(views::kMarginsKey, gfx::Insets());
    SetTooltipText(u"Background tabs Aux opened");
    GetViewAccessibility().SetName(u"Agent Tabs");
    observation_.Observe(model_);
    Refresh();
  }
  ~AgentTabsButton() override { CloseBubble(); }
  void OnTabStripModelChanged(TabStripModel*,
                              const TabStripModelChange&,
                              const TabStripSelectionChange&) override {
    Refresh();
  }
  void OnTabGroupChanged(const TabGroupChange&) override { Refresh(); }
  void OnTabStripModelDestroyed(TabStripModel*) override {
    observation_.Reset();
    model_ = nullptr;
    group_.reset();
    SetVisible(false);
    CloseBubble();
  }

 private:
  void CloseBubble() {
    if (widget_) {
      widget_->CloseWithReason(views::Widget::ClosedReason::kUnspecified);
    }
  }
  void Refresh() {
    group_.reset();
    int count = 0;
    if (auto* groups = model_->group_model()) {
      for (const auto id : groups->ListTabGroups()) {
        auto* group = groups->GetTabGroup(id);
        if (group->GetTabGroupFeatures()->is_agent_group()) {
          group_ = id;
          count = group->ListTabs().length();
          break;
        }
      }
    }
    count_->SetText(base::NumberToString16(count));
    SetVisible(count > 0);
    if (!count) {
      CloseBubble();
    }
  }
  void Toggle() {
    if (widget_) {
      CloseBubble();
      return;
    }
    if (!browser_ || !model_ || !group_) {
      return;
    }
    auto bubble = std::make_unique<AgentTabsBubble>(browser_.get(), this,
                                                    *group_, tab_strip_);
    auto* widget =
        views::BubbleDialogDelegateView::CreateBubble(std::move(bubble));
    widget_ = widget->GetWeakPtr();
    AgentTabsBubbleOwners().push_back({browser_, widget_});
    widget->Show();
  }
  const base::WeakPtr<BrowserWindowInterface> browser_;
  raw_ptr<TabStripModel> model_;
  const base::WeakPtr<TabStrip> tab_strip_;
  raw_ptr<views::Label> count_ = nullptr;
  std::optional<tab_groups::TabGroupId> group_;
  base::WeakPtr<views::Widget> widget_;
  base::ScopedObservation<TabStripModel, TabStripModelObserver> observation_{
      this};
};
BEGIN_METADATA(AgentTabsButton)
END_METADATA
}  // namespace

bool CanSwitchAuxAgentTabsProfile(BrowserWindowInterface* browser) {
  if (!browser) {
    return false;
  }
  // Close is asynchronous; the actual old-context widget must finish retiring.
  return std::ranges::none_of(AgentTabsBubbleOwners(), [browser](const auto& owner) {
    return owner.browser.get() == browser;
  });
}

std::unique_ptr<views::Button> CreateAuxAgentTabsButton(
    BrowserWindowInterface* browser,
    TabStrip* tab_strip) {
  return std::make_unique<AgentTabsButton>(browser, tab_strip);
}
