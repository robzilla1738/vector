// Copyright 2026 Aux Authors. All rights reserved.
#include "chrome/browser/ui/views/frame/aux_profile_preview_input.h"

#include <algorithm>
#include <cmath>
#include <memory>
#include <utility>

#include "base/check.h"
#include "base/functional/bind.h"
#include "base/time/time.h"
#include "chrome/browser/browser_process.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/profiles/profile_manager.h"
#include "chrome/browser/profiles/profile_attributes_entry.h"
#include "chrome/browser/profiles/profile_attributes_storage.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/views/frame/aux_profile_switch_owner.h"
#include "chrome/browser/ui/views/frame/browser_view.h"
#include "chrome/browser/ui/views/frame/contents_container_view.h"
#include "chrome/browser/ui/views/frame/contents_web_view.h"
#include "chrome/browser/ui/views/frame/multi_contents_view.h"
#include "chrome/browser/ui/views/tabs/vertical/vertical_tab_strip_scroll_view.h"
#include "ui/events/event.h"
#include "ui/events/event_constants.h"
#include "ui/views/view.h"
#include "ui/views/view_utils.h"
#include "ui/views/widget/widget.h"

namespace aux {
namespace {
constexpr float kEpsilon = 0.001f;
bool Horizontal(float x, float y) {
  return std::abs(x) > std::max(1.0f, 1.5f * std::abs(y));
}
bool Fresh(const ui::ScrollEvent& e) {
  return e.scroll_event_phase() == ui::ScrollEventPhase::kBegan ||
      (e.scroll_event_phase() == ui::ScrollEventPhase::kNone &&
       e.momentum_phase() == ui::EventMomentumPhase::MAY_BEGIN);
}
float X(const ui::ScrollEvent& e) {
  return e.x_offset() != 0 ? e.x_offset() : e.x_offset_ordinal();
}
float Y(const ui::ScrollEvent& e) {
  return e.y_offset() != 0 ? e.y_offset() : e.y_offset_ordinal();
}
}  // namespace

ProfilePreviewInput::ProfilePreviewInput(
    BrowserWindowInterface& browser, views::View& region,
    VerticalTabStripScrollView& scroll, ProfilePreviewRegionOwner& preview,
    base::RepeatingCallback<bool()> layout_admitted)
    : browser_(browser.GetWeakPtr()), region_(&region), scroll_(&scroll),
      preview_(preview.GetWeakPtr()),
      layout_admitted_(std::move(layout_admitted)) {
  CHECK(layout_admitted_);
  // Original37e0288 tween1, the actual SlideAnimation EASE_OUT default.
  animation_.SetTweenType(gfx::Tween::EASE_OUT);
}
ProfilePreviewInput::~ProfilePreviewInput() = default;

bool ProfilePreviewInput::idle() const {
  return !active_ && !committing_ && !animation_.is_animating() &&
      std::abs(progress_) <= kEpsilon;
}
bool ProfilePreviewInput::ValidSource() const {
  auto* browser = browser_.get();
  return browser && browser->GetProfile() &&
      !browser->GetProfile()->IsOffTheRecord() && region_.view() && preview_;
}
bool ProfilePreviewInput::Admitted() const {
  return ValidSource() && region_.view()->IsDrawn() && layout_admitted_.Run();
}
bool ProfilePreviewInput::Contains(const ui::LocatedEvent& event) const {
  auto* region = region_.view();
  auto* widget = region ? region->GetWidget() : nullptr;
  auto* root = widget ? widget->GetRootView() : nullptr;
  if (!root) {
    return false;
  }
  auto point = event.root_location();
  views::View::ConvertPointToTarget(root, region, &point);
  return region->GetLocalBounds().Contains(point);
}
const std::vector<base::FilePath>& ProfilePreviewInput::Roster() {
  if (roster_valid_ && !idle()) {
    return roster_;
  }
  roster_.clear();
  auto* manager = g_browser_process ? g_browser_process->profile_manager() : nullptr;
  if (browser_ && browser_->GetProfile() &&
      !browser_->GetProfile()->IsOffTheRecord() && manager &&
      g_browser_process->local_state()) {
    roster_ = HorizontalProfileOrder(manager->GetProfileAttributesStorage(),
                                    *g_browser_process->local_state());
    auto& storage = manager->GetProfileAttributesStorage();
    std::erase_if(roster_, [&storage](const base::FilePath& path) {
      auto* entry = storage.GetProfileAttributesWithPath(path);
      return !entry || entry->IsOmitted();
    });
  }
  roster_valid_ = true;
  return roster_;
}
base::FilePath ProfilePreviewInput::Adjacent(int direction) {
  if (!browser_ || !browser_->GetProfile() || !direction) {
    return {};
  }
  const auto& roster = Roster();
  const auto current = browser_->GetProfile()->GetOriginalProfile()->GetPath();
  const auto found = std::ranges::find(roster, current);
  if (roster.size() < 2 || found == roster.end()) {
    return {};
  }
  const auto index = found - roster.begin() + (direction < 0 ? -1 : 1);
  return index >= 0 && static_cast<size_t>(index) < roster.size()
      ? roster[index] : base::FilePath();
}

void ProfilePreviewInput::OnScrollEvent(ui::ScrollEvent* event) {
  auto alive = weak_factory_.GetWeakPtr();
  if (!event || event->type() != ui::EventType::kScroll || !Admitted() ||
      !alive || (!active_ && !committing_ && !Contains(*event))) {
    return;
  }
  if (committing_) {
    event->SetHandled();
    event->StopPropagation();
    return;
  }
  if (!active_) {
    auto* scroll = views::AsViewClass<VerticalTabStripScrollView>(scroll_.view());
    if (scroll && scroll->scroll_sequence_active() &&
        scroll->axis_lock() == VerticalTabStripScrollView::Axis::kVertical &&
        !Fresh(*event)) {
      return;
    }
    if (event->momentum_phase() != ui::EventMomentumPhase::NONE &&
        !Fresh(*event)) {
      return;
    }
    if (event->momentum_phase() == ui::EventMomentumPhase::NONE &&
        event->scroll_event_phase() == ui::ScrollEventPhase::kEnd) {
      return;
    }
    if (!Horizontal(X(*event), Y(*event))) {
      return;
    }
  }
  if (HandleScroll(*event) && alive) {
    event->SetHandled();
    event->StopPropagation();
  }
}
bool ProfilePreviewInput::HandleScroll(const ui::ScrollEvent& event) {
  auto alive = weak_factory_.GetWeakPtr();
  if (Fresh(event)) {
    StopAnimation();
    if (!alive || !preview_) {
      return false;
    }
    reveal_.Reset(0);
    ApplyContents(ContentsEffect::kOpacity, 1);
    if (!alive || !preview_) {
      return false;
    }
    active_ = false;
    dx_ = dy_ = 0;
  } else if (event.momentum_phase() != ui::EventMomentumPhase::NONE) {
    if (active_) {
      FinishGesture();
      return true;
    }
    return false;
  }
  const float x = X(event), y = Y(event);
  if (active_ && x == 0 && y == 0 &&
      event.scroll_event_phase() == ui::ScrollEventPhase::kNone) {
    FinishGesture();
    return true;
  }
  if (Roster().size() < 2) {
    active_ = false;
    dx_ = dy_ = 0;
    return false;
  }
  if (!active_) {
    StopAnimation();
    if (!alive) {
      return false;
    }
    ApplyContents(ContentsEffect::kCapture);
    if (!alive) {
      return false;
    }
    active_ = true;
    dx_ = dy_ = 0;
  }
  dx_ += x;
  dy_ += y;
  if (!Horizontal(dx_, dy_)) {
    active_ = false;
    dx_ = dy_ = 0;
    CancelGesture();
    return false;
  }
  float progress = std::clamp(-dx_ / std::max(1, region_.view()->width()),
                              -1.0f, 1.0f);
  const int direction = progress < 0 ? -1 : 1;
  if (progress != 0 && !Bind(direction)) {
    if (!alive) {
      return false;
    }
    progress = std::clamp(progress * 0.28f, -0.16f, 0.16f);
  }
  if (!alive || !preview_) {
    return false;
  }
  Update(progress);
  if (alive && event.scroll_event_phase() == ui::ScrollEventPhase::kEnd) {
    FinishGesture();
  }
  return true;
}
bool ProfilePreviewInput::Bind(int direction) {
  const auto target = Adjacent(direction);
  if (target.empty()) {
    return false;
  }
  if (bound_target_ == target) {
    return true;
  }
  auto alive = weak_factory_.GetWeakPtr();
  if (!preview_ || !preview_->Begin(target, direction) || !alive) {
    return false;
  }
  bound_target_ = target;
  return true;
}
void ProfilePreviewInput::Update(float progress) {
  progress_ = progress;
  if (std::abs(progress) <= kEpsilon) {
    bound_target_.clear();
  }
  if (preview_) {
    preview_->Update(progress);
  }
}
void ProfilePreviewInput::FinishGesture() {
  if (!active_ || !region_.view()) {
    return;
  }
  const int direction = dx_ > 0 ? -1 : 1;
  const bool commit = std::abs(dx_) >= 0.5f * std::max(1, region_.view()->width()) &&
                      Horizontal(dx_, dy_);
  active_ = false;
  dx_ = dy_ = 0;
  const auto target = commit ? Adjacent(direction) : base::FilePath();
  auto alive = weak_factory_.GetWeakPtr();
  if ((target.empty() || !Commit(target, direction)) && alive) {
    CancelGesture();
  }
}
void ProfilePreviewInput::CancelGesture() {
  if (!committing_) {
    auto alive = weak_factory_.GetWeakPtr();
    crossfading_ = false;
    ApplyContents(ContentsEffect::kClear);
    if (alive) {
      AnimateTo(0, false);
    }
  }
}
void ProfilePreviewInput::StopAnimation() {
  animation_.Reset(0);
}
void ProfilePreviewInput::AnimateTo(float target, bool commit) {
  StopAnimation();
  animation_from_ = progress_;
  animation_to_ = target;
  if (std::abs(progress_ - target) < kEpsilon) {
    auto alive = weak_factory_.GetWeakPtr();
    Update(target);
    if (alive && !commit && preview_) {
      bound_target_.clear();
      preview_->Cancel();
    }
    return;
  }
  const auto duration = commit
      ? base::Microseconds(std::max<int64_t>(55000,
            static_cast<int64_t>(static_cast<double>(std::min(std::abs(target - progress_), 1.0f)) * 170000.0)))
      : base::Microseconds(170000);
  animation_.SetSlideDuration(duration);
  animation_.Show();
}
bool ProfilePreviewInput::Commit(const base::FilePath& target, int direction) {
  if (committing_ || !preview_ || target.empty()) {
    return false;
  }
  auto alive = weak_factory_.GetWeakPtr();
  if (target != bound_target_) {
    if (!preview_->Begin(target, direction) || !alive) {
      return false;
    }
    bound_target_ = target;
  }
  const bool settle = preview_->HasLivePreview() && std::abs(progress_) >= kEpsilon;
  committing_ = true;
  const bool crossfading = settle && ApplyContents(ContentsEffect::kBeginCrossfade);
  if (!alive || !preview_) {
    return false;
  }
  crossfading_ = crossfading;
  if (!preview_->Commit(base::BindOnce(&ProfilePreviewInput::OnCommitted,
                                     weak_factory_.GetWeakPtr()))) {
    if (alive) {
      committing_ = false;
      crossfading_ = false;
      ApplyContents(ContentsEffect::kClear);
    }
    return false;
  }
  if (alive && committing_ && settle) {
    AnimateTo(static_cast<float>(direction), true);
  }
  return true;
}
void ProfilePreviewInput::OnCommitted(Browser* result) {
  committing_ = false;
  active_ = false;
  bound_target_.clear();
  roster_valid_ = false;
  progress_ = dx_ = dy_ = 0;
  StopAnimation();
  auto alive = weak_factory_.GetWeakPtr();
  if (crossfading_ && result) {
    reveal_.Reset(0);
    reveal_.SetSlideDuration(base::Microseconds(120000));
    reveal_.Show();
  } else {
    crossfading_ = false;
    ApplyContents(ContentsEffect::kClear);
  }
  if (!alive) {
    return;
  }
  // Actual core completion/result is owned by ProfileSwitchRequest; a loaded
  // Profile is never interpreted as successful activation here.
}
void ProfilePreviewInput::AnimationProgressed(const gfx::Animation* animation) {
  if (animation == &reveal_) {
    ApplyContents(ContentsEffect::kOpacity,
                  static_cast<float>(reveal_.GetCurrentValue()));
    return;
  }
  if (animation != &animation_) {
    return;
  }
  const float delta = animation_to_ - animation_from_;
  const float value = static_cast<float>(
      static_cast<double>(animation_from_) + animation_.GetCurrentValue() * delta);
  auto alive = weak_factory_.GetWeakPtr();
  Update(value);
  if (alive && committing_ && preview_) {
    if (crossfading_) {
      ApplyContents(ContentsEffect::kOpacity,
                    static_cast<float>(1 - animation_.GetCurrentValue()));
    }
    if (alive && preview_) {
      preview_->OnPreviewFrame();
    }
  }
}
void ProfilePreviewInput::AnimationEnded(const gfx::Animation* animation) {
  if (animation == &reveal_) {
    crossfading_ = false;
    ApplyContents(ContentsEffect::kClear);
    return;
  }
  if (animation != &animation_) {
    return;
  }
  auto alive = weak_factory_.GetWeakPtr();
  Update(animation_to_);
  if (!alive || !preview_) {
    return;
  }
  if (committing_) {
    preview_->OnPreviewFrame();
  } else {
    bound_target_.clear();
    preview_->Cancel();
  }
}
bool ProfilePreviewInput::ApplyContents(ContentsEffect effect, float opacity) {
  auto* view = browser_ ? BrowserView::GetBrowserViewForBrowser(browser_.get())
                        : nullptr;
  auto* multi = view ? view->multi_contents_view() : nullptr;
  if (!multi) {
    return false;
  }
  auto alive = weak_factory_.GetWeakPtr();
  std::vector<std::unique_ptr<views::ViewTracker>> contents;
  for (const auto& container : multi->contents_container_views()) {
    if (container && container->contents_view()) {
      contents.push_back(std::make_unique<views::ViewTracker>(
          container->contents_view()));
    }
  }
  bool began = false;
  for (const auto& tracker : contents) {
    auto* web = views::AsViewClass<ContentsWebView>(tracker->view());
    if (!web) {
      continue;
    }
    switch (effect) {
      case ContentsEffect::kCapture:
        if (web->IsDrawn()) {
          web->CaptureAuxProfileSwitchOverlay();
        } else {
          web->ClearAuxProfileSwitchOverlay();
        }
        break;
      case ContentsEffect::kClear:
        web->ClearAuxProfileSwitchOverlay();
        break;
      case ContentsEffect::kOpacity:
        web->SetAuxProfileSwitchOpacity(opacity);
        break;
      case ContentsEffect::kBeginCrossfade:
        if (web->IsDrawn()) {
          if (!web->BeginAuxProfileSwitchCrossfade()) {
            if (alive) {
              ApplyContents(ContentsEffect::kClear);
            }
            return false;
          }
          began = true;
        }
        break;
    }
    if (!alive || !browser_) {
      return false;
    }
  }
  return effect != ContentsEffect::kBeginCrossfade || began;
}
bool ProfilePreviewInput::Select(const base::FilePath& target) {
  auto alive = weak_factory_.GetWeakPtr();
  if (!ValidSource() || !alive || committing_ || target.empty()) {
    return false;
  }
  const auto current = browser_->GetProfile()->GetOriginalProfile()->GetPath();
  if (target == current) {
    return false;
  }
  const auto& roster = Roster();
  const auto from = std::ranges::find(roster, current);
  const auto to = std::ranges::find(roster, target);
  const int direction = from != roster.end() && to != roster.end() && to < from
      ? -1 : 1;
  return Commit(target, direction);
}
void ProfilePreviewInput::OnMouseEvent(ui::MouseEvent* event) {
  auto alive = weak_factory_.GetWeakPtr();
  if (!event || (event->type() != ui::EventType::kMousePressed &&
                 event->type() != ui::EventType::kMouseReleased) ||
      !ValidSource() || !alive || !region_.view()->IsDrawn() ||
      !Contains(*event) ||
      !(event->changed_button_flags() &
        (ui::EF_BACK_MOUSE_BUTTON | ui::EF_FORWARD_MOUSE_BUTTON))) {
    return;
  }
  if (event->type() == ui::EventType::kMousePressed) {
    event->SetHandled();
    event->StopPropagation();
    return;
  }
  if (!committing_ && Roster().size() >= 2) {
    const int direction = event->changed_button_flags() & ui::EF_BACK_MOUSE_BUTTON
        ? -1 : 1;
    const auto target = Adjacent(direction);
    if ((target.empty() || !Commit(target, direction)) && alive) {
      CancelGesture();
    }
    if (alive) {
      event->SetHandled();
      event->StopPropagation();
    }
  }
}
}  // namespace aux
