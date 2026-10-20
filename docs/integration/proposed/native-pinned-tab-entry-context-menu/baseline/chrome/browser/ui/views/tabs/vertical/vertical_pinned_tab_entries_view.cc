// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#include "chrome/browser/ui/views/tabs/vertical/vertical_pinned_tab_entries_view.h"

#include <algorithm>
#include <memory>
#include <utility>

#include "base/check.h"
#include "base/functional/bind.h"
#include "base/strings/utf_string_conversions.h"
#include "base/task/single_thread_task_runner.h"
#include "cc/paint/paint_flags.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/tab_ui_helper.h"
#include "chrome/browser/ui/tabs/tab_enums.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/views/tabs/vertical/aux_pinned_tab_entry_actions.h"
#include "components/tabs/public/tab_interface.h"
#include "content/public/browser/web_contents.h"
#include "ui/base/metadata/metadata_impl_macros.h"
#include "ui/color/color_provider_key.h"
#include "ui/compositor/layer.h"
#include "ui/events/event.h"
#include "ui/events/keycodes/keyboard_codes.h"
#include "ui/gfx/canvas.h"
#include "ui/gfx/image/image.h"
#include "ui/gfx/vector_icon_types.h"
#include "ui/views/accessibility/view_accessibility.h"
#include "ui/views/controls/image_view.h"
#include "ui/views/widget/widget.h"

namespace {
constexpr int kEntryHeight = 40;
constexpr int kPreferredWidth = 32;
constexpr int kGap = 6;
// Exact supplied kGlobeIcon (24-unit path rendered at16), not the Agent row
// glyph.
// clang-format off
constexpr gfx::PathElement kGlobePath[] = {
    gfx::CANVAS_DIMENSIONS, 24.0f,
    gfx::FILL_RULE_NONZERO,
    gfx::MOVE_TO, 12.0f, 22.0f,
    gfx::R_ARC_TO, 9.68999958f, 9.68999958f, 0.0f, 0.0f, 1.0f, -3.9000001f, -0.790000021f,
    gfx::R_ARC_TO, 9.98999977f, 9.98999977f, 0.0f, 0.0f, 1.0f, -3.18000007f, -2.1400001f,
    gfx::R_ARC_TO, 9.98999977f, 9.98999977f, 0.0f, 0.0f, 1.0f, -2.1400001f, -3.18000007f,
    gfx::ARC_TO, 9.68999958f, 9.68999958f, 0.0f, 0.0f, 1.0f, 2.0f, 12.0f,
    gfx::R_CUBIC_TO, 0.0f, -1.38f, 0.25999999f, -2.68000007f, 0.790000021f, -3.9000001f,
    gfx::R_ARC_TO, 9.98999977f, 9.98999977f, 0.0f, 0.0f, 1.0f, 2.1400001f, -3.18000007f,
    gfx::R_ARC_TO, 9.98999977f, 9.98999977f, 0.0f, 0.0f, 1.0f, 3.18000007f, -2.1400001f,
    gfx::ARC_TO, 9.68999958f, 9.68999958f, 0.0f, 0.0f, 1.0f, 12.0f, 2.0f,
    gfx::R_CUBIC_TO, 1.38f, 0.0f, 2.68000007f, 0.25999999f, 3.9000001f, 0.790000021f,
    gfx::R_ARC_TO, 9.98999977f, 9.98999977f, 0.0f, 0.0f, 1.0f, 3.18000007f, 2.1400001f,
    gfx::R_ARC_TO, 9.98999977f, 9.98999977f, 0.0f, 0.0f, 1.0f, 2.1400001f, 3.18000007f,
    gfx::ARC_TO, 9.68999958f, 9.68999958f, 0.0f, 0.0f, 1.0f, 22.0f, 12.0f,
    gfx::R_ARC_TO, 9.68999958f, 9.68999958f, 0.0f, 0.0f, 1.0f, -0.790000021f, 3.9000001f,
    gfx::R_ARC_TO, 9.98999977f, 9.98999977f, 0.0f, 0.0f, 1.0f, -2.1400001f, 3.18000007f,
    gfx::R_ARC_TO, 9.98999977f, 9.98999977f, 0.0f, 0.0f, 1.0f, -3.18000007f, 2.1400001f,
    gfx::ARC_TO, 9.68999958f, 9.68999958f, 0.0f, 0.0f, 1.0f, 12.0f, 22.0f,
    gfx::CLOSE,
    gfx::R_MOVE_TO, 0.0f, -2.0f,
    gfx::R_CUBIC_TO, 2.23000002f, 0.0f, 4.13000011f, -0.769999981f, 5.67999983f, -2.31999993f,
    gfx::CUBIC_TO, 19.2299995f, 16.1299992f, 20.0f, 14.2299995f, 20.0f, 12.0f,
    gfx::R_CUBIC_TO, 0.0f, -0.119999997f, 0.0f, -0.239999995f, -0.00999999978f, -0.360000014f,
    gfx::R_ARC_TO, 5.0999999f, 5.0999999f, 0.0f, 0.0f, 1.0f, -0.00999999978f, -0.310000002f,
    gfx::R_ARC_TO, 1.99000001f, 1.99000001f, 0.0f, 0.0f, 1.0f, -0.680000007f, 1.20000005f,
    gfx::ARC_TO, 1.92999995f, 1.92999995f, 0.0f, 0.0f, 1.0f, 18.0f, 13.0f,
    gfx::R_H_LINE_TO, -2.0f,
    gfx::R_CUBIC_TO, -0.550000012f, 0.0f, -1.01999998f, -0.189999998f, -1.40999997f, -0.589999974f,
    gfx::ARC_TO, 1.94000006f, 1.94000006f, 0.0f, 0.0f, 1.0f, 14.0f, 11.0f,
    gfx::R_V_LINE_TO, -1.0f,
    gfx::R_H_LINE_TO, -4.0f,
    gfx::V_LINE_TO, 8.0f,
    gfx::R_CUBIC_TO, 0.0f, -0.550000012f, 0.200000003f, -1.01999998f, 0.589999974f, -1.40999997f,
    gfx::CUBIC_TO, 10.9799995f, 6.19999981f, 11.4499998f, 6.0f, 12.0f, 6.0f,
    gfx::R_H_LINE_TO, 1.0f,
    gfx::R_ARC_TO, 1.70000005f, 1.70000005f, 0.0f, 0.0f, 1.0f, 0.310000002f, -1.00999999f,
    gfx::R_CUBIC_TO, 0.209999993f, -0.289999992f, 0.460000008f, -0.529999971f, 0.75999999f, -0.709999979f,
    gfx::R_ARC_TO, 11.0200005f, 11.0200005f, 0.0f, 0.0f, 0.0f, -1.00999999f, -0.200000003f,
    gfx::ARC_TO, 7.19999981f, 7.19999981f, 0.0f, 0.0f, 0.0f, 12.0f, 4.0f,
    gfx::R_CUBIC_TO, -2.23000002f, 0.0f, -4.11999989f, 0.769999981f, -5.67999983f, 2.31999993f,
    gfx::CUBIC_TO, 4.76999998f, 7.88000011f, 4.0f, 9.77000046f, 4.0f, 12.0f,
    gfx::R_H_LINE_TO, 5.0f,
    gfx::R_CUBIC_TO, 1.10000002f, 0.0f, 2.03999996f, 0.389999986f, 2.81999993f, 1.17999995f,
    gfx::CUBIC_TO, 12.6099997f, 13.96f, 13.0f, 14.8999996f, 13.0f, 16.0f,
    gfx::R_V_LINE_TO, 1.0f,
    gfx::R_H_LINE_TO, -3.0f,
    gfx::R_V_LINE_TO, 2.75f,
    gfx::R_CUBIC_TO, 0.330000013f, 0.0799999982f, 0.660000026f, 0.140000001f, 0.99000001f, 0.189999998f,
    gfx::R_CUBIC_TO, 0.330000013f, 0.0399999991f, 0.660000026f, 0.0599999987f, 1.00999999f, 0.0599999987f,
    gfx::CLOSE,
};
const gfx::VectorIconRep kGlobeReps[] = {{kGlobePath}};
const gfx::VectorIcon kGlobeIcon(kGlobeReps, 1, "kAuxPinnedGlobeIcon");
// clang-format on

bool IsDark(const views::View& view) {
  return view.GetWidget()->GetColorMode() ==
         ui::ColorProviderKey::ColorMode::kDark;
}
}  // namespace

class VerticalPinnedTabEntriesView::EntryView : public views::View {
  METADATA_HEADER(EntryView, views::View)
 public:
  EntryView(VerticalPinnedTabEntriesView* owner, size_t index)
      : owner_(owner), index_(index) {
    SetUseDefaultFillLayout(true);
    SetPreferredSize(gfx::Size(kEntryHeight, kEntryHeight));
    SetPaintToLayer(ui::LAYER_TEXTURED);
    layer()->SetFillsBoundsOpaquely(false);
    icon_ = AddChildView(std::make_unique<views::ImageView>());
    icon_->SetImageSize(gfx::Size(16, 16));
    icon_->SetCanProcessEventsWithinSubtree(false);
    SetFocusBehavior(FocusBehavior::ALWAYS);
    SetNotifyEnterExitOnChild(true);
  }
  void Update() {
    const auto& entry = owner_->entries_[index_];
    SetTooltipText(entry.title);
    GetViewAccessibility().SetName(entry.title);
    if (!entry.image.IsEmpty()) {
      icon_->SetImage(entry.image);
    } else if (GetWidget()) {
      const SkColor color = entry.active
                                ? (IsDark(*this) ? 0xd9fafafa : 0xd90a0a0a)
                                : (IsDark(*this) ? 0x8cfafafa : 0x8c0a0a0a);
      icon_->SetImage(ui::ImageModel::FromVectorIcon(kGlobeIcon, color, 16));
    }
    SchedulePaint();
  }
  void OnThemeChanged() override {
    views::View::OnThemeChanged();
    if (GetWidget())
      Update();
  }
  void AddedToWidget() override {
    views::View::AddedToWidget();
    Update();
  }
  bool OnMousePressed(const ui::MouseEvent& event) override {
    if (!event.IsOnlyLeftMouseButton() && !event.IsOnlyMiddleMouseButton())
      return false;
    pressed_ = true;
    RequestFocus();
    return true;
  }
  void OnMouseReleased(const ui::MouseEvent& event) override {
    const bool pressed = std::exchange(pressed_, false);
    if (!pressed || !HitTestPoint(event.location()))
      return;
    if (event.IsOnlyLeftMouseButton())
      owner_->Activate(index_);
    else if (event.IsOnlyMiddleMouseButton())
      owner_->Close(index_);
  }
  void CancelPress() { pressed_ = false; }
  void OnMouseCaptureLost() override { CancelPress(); }
  void OnMouseEntered(const ui::MouseEvent&) override {
    hovered_ = true;
    SchedulePaint();
  }
  void OnMouseExited(const ui::MouseEvent&) override {
    hovered_ = false;
    SchedulePaint();
  }
  bool OnKeyPressed(const ui::KeyEvent& event) override {
    if (event.key_code() != ui::VKEY_SPACE &&
        event.key_code() != ui::VKEY_RETURN)
      return false;
    owner_->Activate(index_);
    return true;
  }
  void OnPaint(gfx::Canvas* canvas) override {
    if (!GetWidget() || !GetColorProvider())
      return;
    const bool dark = IsDark(*this);
    const bool active = owner_->entries_[index_].active;
    cc::PaintFlags flags;
    flags.setAntiAlias(true);
    canvas->DrawColor(SK_ColorTRANSPARENT, SkBlendMode::kSrc);
    flags.setColor(active ? (dark ? 0x14fafafa : 0xffffffff)
                          : (dark ? 0x14fafafa : 0x140a0a0a));
    // Original0460d780 uses two filled paths, not an invented inset border.
    canvas->DrawRoundRect(gfx::RectF(GetLocalBounds()), 10, flags);
    if (active) {
      flags.setColor(dark ? 0x33fafafa : 0x330a0a0a);
      canvas->DrawRoundRect(gfx::RectF(GetLocalBounds()), 10, flags);
    } else if (hovered_) {
      flags.setColor(dark ? 0x33ffffff : 0x59ffffff);
      canvas->DrawRoundRect(gfx::RectF(GetLocalBounds()), 10, flags);
    }
  }

 private:
  const raw_ptr<VerticalPinnedTabEntriesView> owner_;
  const size_t index_;
  raw_ptr<views::ImageView> icon_ = nullptr;
  bool pressed_ = false;
  bool hovered_ = false;
};
BEGIN_METADATA(VerticalPinnedTabEntriesView, EntryView)
END_METADATA

VerticalPinnedTabEntriesView::VerticalPinnedTabEntriesView(
    BrowserWindowInterface* browser)
    : browser_(browser) {
  CHECK(browser_);
  SetVisible(false);
  BindProfile();
}
VerticalPinnedTabEntriesView::~VerticalPinnedTabEntriesView() {
  TabStripModelObserver::StopObservingAll(this);
}
void VerticalPinnedTabEntriesView::BindProfile() {
  CHECK(!paused_);
  model_ = browser_->GetTabStripModel();
  CHECK(model_);
  model_->AddObserver(this);
  pref_changes_.Init(browser_->GetProfile()->GetPrefs());
  pref_changes_.Add(
      aux::kPinnedTabEntriesPref,
      base::BindRepeating(&VerticalPinnedTabEntriesView::ScheduleRefresh,
                          weak_factory_.GetWeakPtr()));
  Refresh();
}
void VerticalPinnedTabEntriesView::PauseForProfileSwitch() {
  paused_ = true;
  for (views::View* child : children())
    static_cast<EntryView*>(child)->CancelPress();
  weak_factory_.InvalidateWeakPtrs();
  refresh_pending_ = false;
  ui_changes_.clear();
  pref_changes_.Reset();
  TabStripModelObserver::StopObservingAll(this);
  model_ = nullptr;
}
void VerticalPinnedTabEntriesView::RebindAfterProfileSwitch() {
  CHECK(paused_);
  icon_cache_.clear();
  entries_.clear();
  RemoveAllChildViews();
  paused_ = false;
  BindProfile();
}
void VerticalPinnedTabEntriesView::ScheduleRefresh() {
  if (paused_ || refresh_pending_)
    return;
  refresh_pending_ = true;
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(
      FROM_HERE, base::BindOnce(
                     [](base::WeakPtr<VerticalPinnedTabEntriesView> view) {
                       if (view) {
                         view->refresh_pending_ = false;
                         view->Refresh();
                       }
                     },
                     weak_factory_.GetWeakPtr()));
}
void VerticalPinnedTabEntriesView::Refresh() {
  if (paused_ || !model_)
    return;
  ui_changes_.clear();
  auto saved = aux::ReadPinnedTabEntries(*browser_->GetProfile()->GetPrefs());
  std::vector<Entry> entries;
  for (auto& value : saved) {
    Entry entry;
    entry.saved = std::move(value);
    entry.title = entry.saved.title.empty()
                      ? base::UTF8ToUTF16(entry.saved.url.has_host()
                                              ? entry.saved.url.host()
                                              : entry.saved.url.spec())
                      : entry.saved.title;
    if (auto cached = icon_cache_.find(entry.saved.url.spec());
        cached != icon_cache_.end())
      entry.image = cached->second;
    entry.live_index = aux::FindPinnedTabEntry(*model_, entry.saved.url);
    if (entry.live_index) {
      auto* tab = model_->GetTabAtIndex(*entry.live_index);
      if (auto* helper = TabUIHelper::From(tab)) {
        const auto title = helper->GetTitle();
        if (!title.empty())
          entry.title = title;
        const auto icon = helper->GetFavicon();
        if (!icon.IsEmpty()) {
          entry.image = icon;
          icon_cache_.insert_or_assign(entry.saved.url.spec(), entry.image);
        }
        ui_changes_.push_back(helper->AddTabUIChangeCallback(
            base::BindRepeating(&VerticalPinnedTabEntriesView::ScheduleRefresh,
                                weak_factory_.GetWeakPtr())));
      }
      entry.active = *entry.live_index == model_->active_index();
    }
    entries.push_back(std::move(entry));
  }
  if (children().size() != entries.size()) {
    RemoveAllChildViews();
    entries_ = std::move(entries);
    for (size_t i = 0; i < entries_.size(); ++i)
      AddChildView(std::make_unique<EntryView>(this, i));
  } else
    entries_ = std::move(entries);
  for (views::View* child : children())
    static_cast<EntryView*>(child)->Update();
  SetVisible(!entries_.empty());
  PreferredSizeChanged();
  InvalidateLayout();
}
void VerticalPinnedTabEntriesView::Activate(size_t index) {
  if (paused_ || !model_ || index >= entries_.size())
    return;
  const GURL url = entries_[index].saved.url;
  aux::OpenPinnedTabEntry(*browser_, url);
}
void VerticalPinnedTabEntriesView::Close(size_t index) {
  if (paused_ || !model_ || index >= entries_.size())
    return;
  if (auto live = aux::FindPinnedTabEntry(*model_, entries_[index].saved.url))
    model_->CloseWebContentsAt(*live, CLOSE_USER_GESTURE);
}
void VerticalPinnedTabEntriesView::SetCompactPresentation(bool compact) {
  if (compact_ == compact)
    return;
  compact_ = compact;
  PreferredSizeChanged();
  InvalidateLayout();
}
void VerticalPinnedTabEntriesView::SetLayoutWidthOverride(
    std::optional<int> width) {
  if (width)
    *width = std::max(*width, kPreferredWidth);
  if (width_override_ == width)
    return;
  width_override_ = width;
  PreferredSizeChanged();
  InvalidateLayout();
}
int VerticalPinnedTabEntriesView::Columns(const views::SizeBound& width) const {
  const int count = std::max(static_cast<int>(entries_.size()), 1);
  if (compact_ && !width_override_)
    return 1;
  int cap = std::min(count, 4);
  if (width_override_ || width.is_bounded()) {
    const int available =
        width_override_.value_or(width.is_bounded() ? width.value() : 0);
    cap = std::min(
        {count,
         std::max((std::max(available, 0) + kGap) / (kEntryHeight + kGap), 1),
         available < 151 ? 2 : 4});
  }
  if (count <= cap)
    return count;
  if (cap < 3)
    return cap;
  if (count % cap == 1 ||
      ((count + cap - 2) / (cap - 1) == (count + cap - 1) / cap &&
       count % (cap - 1) == 0))
    --cap;
  return cap;
}
gfx::Size VerticalPinnedTabEntriesView::CalculatePreferredSize(
    const views::SizeBounds& available) const {
  if (entries_.empty())
    return gfx::Size();
  const int columns = Columns(available.width());
  const int rows = (static_cast<int>(entries_.size()) + columns - 1) / columns;
  return gfx::Size(
      std::max(available.width().is_bounded() ? available.width().value()
                                              : kPreferredWidth,
               0),
      rows * kEntryHeight + (rows - 1) * kGap);
}
gfx::Rect VerticalPinnedTabEntriesView::EntryBounds(size_t index) const {
  const int available = width_override_.value_or(width());
  const int columns = Columns(views::SizeBound(available));
  const int tile_width =
      std::max((available - (columns - 1) * kGap) / columns, 0);
  return gfx::Rect(static_cast<int>(index % columns) * (tile_width + kGap),
                   static_cast<int>(index / columns) * (kEntryHeight + kGap),
                   tile_width, kEntryHeight);
}
void VerticalPinnedTabEntriesView::Layout(PassKey) {
  for (size_t i = 0; i < children().size(); ++i)
    children()[i]->SetBoundsRect(EntryBounds(i));
}
void VerticalPinnedTabEntriesView::OnTabStripModelChanged(
    TabStripModel*,
    const TabStripModelChange&,
    const TabStripSelectionChange&) {
  ScheduleRefresh();
}
void VerticalPinnedTabEntriesView::OnTabChangedAt(tabs::TabInterface*,
                                                  TabChangeType) {
  ScheduleRefresh();
}
void VerticalPinnedTabEntriesView::OnTabPinnedStateChanged(tabs::TabInterface*,
                                                           int) {
  ScheduleRefresh();
}
void VerticalPinnedTabEntriesView::OnTabStripModelDestroyed(TabStripModel*) {
  model_ = nullptr;
  ui_changes_.clear();
  pref_changes_.Reset();
  weak_factory_.InvalidateWeakPtrs();
  refresh_pending_ = false;
}
BEGIN_METADATA(VerticalPinnedTabEntriesView)
END_METADATA
