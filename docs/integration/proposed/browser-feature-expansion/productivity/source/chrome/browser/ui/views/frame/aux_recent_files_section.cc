// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/views/frame/aux_recent_files_section.h"
#include <cmath>
#include <utility>
#include "base/functional/bind.h"
#include "base/strings/utf_string_conversions.h"
#include "base/task/sequenced_task_runner.h"
#include "base/time/time.h"
#include "cc/paint/paint_flags.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/aux_recent_files_service.h"
#include "chrome/browser/ui/aux_chosen_files_service.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/views/frame/aux_section_clip_view.h"
#include "components/prefs/pref_service.h"
#include "components/pref_registry/pref_registry_syncable.h"
#include "ui/base/metadata/metadata_impl_macros.h"
#include "ui/base/models/image_model.h"
#include "ui/color/color_provider_key.h"
#include "ui/events/event.h"
#include "ui/gfx/canvas.h"
#include "ui/gfx/font_list.h"
#include "ui/gfx/vector_icon_types.h"
#include "ui/views/accessibility/view_accessibility.h"
#include "ui/views/controls/button/button.h"
#include "ui/views/controls/button/button_controller.h"
#include "ui/views/controls/image_view.h"
#include "ui/views/controls/label.h"
#include "ui/views/layout/box_layout.h"
#include "ui/views/view_class_properties.h"
#include "ui/views/widget/widget.h"
namespace aux {
namespace {
constexpr char kExpanded[] = "aux.vertical_tabs.recent_files_expanded";
#include "chrome/browser/ui/views/frame/aux_vertical_bookmark_row_icons.inc"
SkColor RowColor(const views::View& view, bool secondary) {
  const bool dark = view.GetWidget() && view.GetWidget()->GetColorMode() ==
      ui::ColorProviderKey::ColorMode::kDark;
  return secondary ? (dark ? 0x8cfafafa : 0x8c0a0a0a)
                   : (dark ? 0xa6fafafa : 0xb80a0a0a);
}
// Retains the existing 32px / 14pt row, 16px icon, 10px hover corners.
class RecentFileRow final : public views::Button {
  METADATA_HEADER(RecentFileRow, views::Button)
 public:
  RecentFileRow(std::u16string name, base::RepeatingClosure reveal,
                base::RepeatingClosure drag)
      : views::Button(std::move(reveal)), drag_(std::move(drag)) {
    button_controller()->set_notify_action(views::ButtonController::NotifyAction::kOnRelease);
    SetFocusBehavior(FocusBehavior::ALWAYS);
    auto* layout = SetLayoutManager(std::make_unique<views::BoxLayout>(
        views::BoxLayout::Orientation::kHorizontal, gfx::Insets::VH(6, 8)));
    layout->set_cross_axis_alignment(views::BoxLayout::CrossAxisAlignment::kCenter);
    icon_ = AddChildView(std::make_unique<views::ImageView>());
    icon_->SetCanProcessEventsWithinSubtree(false);
    icon_->SetPreferredSize(gfx::Size(16, 16));
    icon_->SetProperty(views::kMarginsKey, gfx::Insets::TLBR(0, 0, 0, 8));
    label_ = AddChildView(std::make_unique<views::Label>(name));
    label_->SetCanProcessEventsWithinSubtree(false);
    label_->SetAutoColorReadabilityEnabled(false);
    label_->SetSubpixelRenderingEnabled(false);
    label_->SetHorizontalAlignment(gfx::ALIGN_TO_HEAD);
    label_->SetElideBehavior(gfx::FADE_TAIL);
    const gfx::FontList font;
    label_->SetFontList(font.Derive(14 - font.GetFontSize(), gfx::Font::NORMAL,
                                   gfx::Font::Weight::NORMAL));
    layout->SetFlexForView(label_, 1);
    SetTooltipText(name + u" — drag to attach; click to show in Finder");
    GetViewAccessibility().SetName(name);
    Refresh();
  }
  gfx::Size CalculatePreferredSize(const views::SizeBounds& bounds) const override {
    auto size = views::Button::CalculatePreferredSize(bounds);
    size.set_height(32); return size;
  }
  bool OnMousePressed(const ui::MouseEvent& event) override {
    pressed_ = event.IsOnlyLeftMouseButton(); dragged_ = false;
    origin_ = event.location();
    return views::Button::OnMousePressed(event);
  }
  bool OnMouseDragged(const ui::MouseEvent& event) override {
    if (pressed_ && !dragged_ && ExceededDragThreshold(event.location() - origin_)) {
      dragged_ = true; pressed_ = false;
      // Native drag may synchronously retire this row during a nested run loop.
      auto callback = drag_;
      SetState(STATE_NORMAL);
      callback.Run(); return true;
    }
    return views::Button::OnMouseDragged(event);
  }
  void OnMouseReleased(const ui::MouseEvent& event) override {
    pressed_ = false;
    if (dragged_) { SetState(STATE_NORMAL); return; }
    views::Button::OnMouseReleased(event);
  }
  void OnMouseCaptureLost() override {
    pressed_ = false;
    views::Button::OnMouseCaptureLost();
  }
 protected:
  void OnThemeChanged() override { views::Button::OnThemeChanged(); Refresh(); }
  void StateChanged(ButtonState old) override {
    views::Button::StateChanged(old); SchedulePaint();
  }
  void OnPaintBackground(gfx::Canvas* canvas) override {
    if (GetState() == STATE_NORMAL || GetState() == STATE_DISABLED) return;
    const bool dark = GetWidget() && GetWidget()->GetColorMode() == ui::ColorProviderKey::ColorMode::kDark;
    cc::PaintFlags flags; flags.setAntiAlias(true);
    flags.setColor(dark ? 0x14fafafa : 0x140a0a0a);
    canvas->DrawRoundRect(gfx::RectF(GetLocalBounds()), 10, flags);
  }
 private:
  void Refresh() {
    label_->SetEnabledColor(RowColor(*this, false));
    icon_->SetImage(ui::ImageModel::FromVectorIcon(kPageIcon, RowColor(*this, true), 16));
  }
  base::RepeatingClosure drag_;
  raw_ptr<views::ImageView> icon_ = nullptr;
  raw_ptr<views::Label> label_ = nullptr;
  gfx::Point origin_;
  bool pressed_ = false, dragged_ = false;
};
BEGIN_METADATA(RecentFileRow)
END_METADATA
}  // namespace
void AuxRecentFilesSection::RegisterPrefs(user_prefs::PrefRegistrySyncable* registry) {
  registry->RegisterBooleanPref(kExpanded, true);
}
AuxRecentFilesSection::AuxRecentFilesSection(BrowserWindowInterface& browser)
    : AuxSectionView(u"Recent files", true,
        base::BindRepeating(&AuxRecentFilesSection::Toggle, base::Unretained(this)),
        gfx::Insets::TLBR(4, 0, 8, 0), {}, {}, 2) {
  auto rows = std::make_unique<views::View>();
  auto* layout = rows->SetLayoutManager(std::make_unique<views::BoxLayout>(
      views::BoxLayout::Orientation::kVertical));
  layout->set_cross_axis_alignment(views::BoxLayout::CrossAxisAlignment::kStretch);
  layout->SetCollapseMarginsSpacing(true);
  rows_ = rows.get();
  clip_ = contents()->AddChildView(std::make_unique<AuxSectionClipView>(std::move(rows)));
  clip_->SetProperty(views::kMarginsKey, gfx::Insets::TLBR(2, 7, 0, 7));
  animation_.SetSlideDuration(gfx::Animation::ShouldRenderRichAnimation()
      ? base::Milliseconds(180) : base::TimeDelta());
  BindBrowser(browser);
}
AuxRecentFilesSection::~AuxRecentFilesSection() { PauseProfileObservation(); }
void AuxRecentFilesSection::PauseProfileObservation() {
  weak_factory_.InvalidateWeakPtrs(); refresh_pending_ = false;
  prefs_.RemoveAll(); chosen_changed_ = {};
  if (manager_) manager_->RemoveObserver(this);
  manager_ = nullptr;
  for (auto* item : observed_) item->RemoveObserver(this);
  observed_.clear(); profile_.reset();
  rows_->RemoveAllChildViews(); row_count_ = 0; SetVisible(false);
}
void AuxRecentFilesSection::BindBrowser(BrowserWindowInterface& browser) {
  PauseProfileObservation();
  auto* profile = browser.GetProfile();
  if (!profile || profile->IsOffTheRecord()) return;
  profile_ = profile->GetWeakPtr();
  chosen_changed_ = files::ObserveChosenFilesChanged(profile,
      base::BindRepeating(&AuxRecentFilesSection::ScheduleRefresh, weak_factory_.GetWeakPtr()));
  manager_ = profile->GetDownloadManager();
  manager_->AddObserver(this);
  content::DownloadManager::DownloadVector items;
  manager_->GetAllDownloads(&items);
  for (download::DownloadItem* item : items) { observed_.insert(item); item->AddObserver(this); }
  prefs_.Init(profile->GetPrefs());
  prefs_.Add(kExpanded, base::BindRepeating(&AuxRecentFilesSection::PreferenceChanged,
                                         base::Unretained(this)));
  expanded_ = profile->GetPrefs()->GetBoolean(kExpanded);
  animation_.Reset(expanded_ ? 1 : 0); SetDisclosureOpen(expanded_);
  Refresh();
}
void AuxRecentFilesSection::Toggle() {
  if (profile_) profile_->GetPrefs()->SetBoolean(kExpanded, !expanded_);
}
void AuxRecentFilesSection::PreferenceChanged() {
  if (!profile_) return;
  expanded_ = profile_->GetPrefs()->GetBoolean(kExpanded);
  SetDisclosureOpen(expanded_); clip_->SetVisible(true);
  if (expanded_) animation_.Show(); else animation_.Hide();
  ApplyHeight();
}
void AuxRecentFilesSection::ScheduleRefresh() {
  if (refresh_pending_ || !manager_) return;
  refresh_pending_ = true;
  base::SequencedTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE,
      base::BindOnce(&AuxRecentFilesSection::Refresh, weak_factory_.GetWeakPtr()));
}
void AuxRecentFilesSection::Refresh() {
  refresh_pending_ = false;
  rows_->RemoveAllChildViews(); row_count_ = 0;
  if (!profile_ || !manager_) { SetVisible(false); return; }
  auto listing = files::ListRecentFiles(profile_.get());
  const auto* entries = listing.FindList("files");
  if (entries) for (const auto& entry : *entries) {
    const auto* file = entry.GetIfDict();
    const auto* id = file ? file->FindString("id") : nullptr;
    const auto* name = file ? file->FindString("name") : nullptr;
    if (!id || !name || !file->FindBool("available").value_or(false)) continue;
    auto row = std::make_unique<RecentFileRow>(base::UTF8ToUTF16(*name),
        base::BindRepeating(&AuxRecentFilesSection::Reveal, weak_factory_.GetWeakPtr(), *id),
        base::BindRepeating(&AuxRecentFilesSection::Drag, weak_factory_.GetWeakPtr(), *id));
    if (row_count_) row->SetProperty(views::kMarginsKey, gfx::Insets::TLBR(2, 0, 0, 0));
    rows_->AddChildView(std::move(row));
    if (++row_count_ == 5) break;
  }
  SetVisible(row_count_ > 0); ApplyHeight();
}
void AuxRecentFilesSection::Reveal(const std::string& guid) {
  if (profile_) files::RevealRecentFile(profile_.get(), guid);
}
void AuxRecentFilesSection::Drag(const std::string& guid) {
  if (profile_ && GetWidget())
    files::DragRecentDownload(profile_.get(), guid, GetWidget()->GetNativeView());
}
void AuxRecentFilesSection::ApplyHeight() {
  const int natural = row_count_ ? row_count_ * 34 - 2 : 0;
  const int height = std::round(natural * animation_.GetCurrentValue());
  clip_->SetHeights(height, natural);
  clip_->SetVisible(height > 0 || animation_.is_animating());
}
void AuxRecentFilesSection::OnDownloadCreated(content::DownloadManager* manager, download::DownloadItem* item) {
  if (manager != manager_) return;
  if (observed_.insert(item).second) item->AddObserver(this);
  ScheduleRefresh();
}
void AuxRecentFilesSection::OnManagerInitialized() { ScheduleRefresh(); }
void AuxRecentFilesSection::ManagerGoingDown(content::DownloadManager*) { PauseProfileObservation(); }
void AuxRecentFilesSection::OnDownloadUpdated(download::DownloadItem*) { ScheduleRefresh(); }
void AuxRecentFilesSection::OnDownloadRemoved(download::DownloadItem* item) {
  if (observed_.erase(item)) item->RemoveObserver(this);
  ScheduleRefresh();
}
void AuxRecentFilesSection::OnDownloadDestroyed(download::DownloadItem* item) {
  observed_.erase(item); ScheduleRefresh();
}
void AuxRecentFilesSection::AnimationProgressed(const gfx::Animation*) { ApplyHeight(); }
void AuxRecentFilesSection::AnimationEnded(const gfx::Animation*) { ApplyHeight(); }
void AuxRecentFilesSection::AnimationCanceled(const gfx::Animation*) { ApplyHeight(); }
BEGIN_METADATA(AuxRecentFilesSection)
END_METADATA
}  // namespace aux
