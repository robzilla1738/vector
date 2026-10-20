// Copyright 2026 Aux Authors. All rights reserved.
#include "chrome/browser/ui/views/frame/aux_profile_preview_capture_cache.h"

#include <utility>

#include "base/check.h"
#include "base/functional/bind.h"
#include "base/task/single_thread_task_runner.h"
#include "chrome/browser/browser_process.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/profiles/profile_attributes_entry.h"
#include "chrome/browser/profiles/profile_attributes_storage.h"
#include "chrome/browser/profiles/profile_manager.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "ui/gfx/image/image.h"
#include "ui/snapshot/snapshot.h"
#include "ui/views/view.h"
#include "ui/views/widget/widget.h"

namespace aux {
namespace {
constexpr int kLastAttempt = 3;
// Original MOVZ0xd4c0/MOVK1 is120000microseconds, not100000.
constexpr auto kRetryDelay = base::Microseconds(120000);

bool HasMultipleProfiles() {
  auto* manager = g_browser_process ? g_browser_process->profile_manager() : nullptr;
  if (!manager) {
    return false;
  }
  size_t count = 0;
  for (auto* entry : manager->GetProfileAttributesStorage()
                         .GetAllProfilesAttributesSortedForDisplay()) {
    if (entry && !entry->IsOmitted() && ++count >= 2) {
      return true;
    }
  }
  return false;
}

bool Within(views::View& region, views::View* child,
            const gfx::Rect& bounds) {
  if (!child || !child->GetVisible() || child->size().IsEmpty() ||
      !region.Contains(child) || !child->parent()) {
    return false;
  }
  auto rect = child->bounds();
  // Current155 has genuine nested children; preserve actual owner coordinates.
  views::View::ConvertRectToTarget(child->parent(), &region, &rect);
  return bounds.Contains(rect);
}
}  // namespace

ProfilePreviewCaptureCache::ProfilePreviewCaptureCache(
    BrowserWindowInterface& browser, views::View& region, Geometry geometry)
    : browser_(browser.GetWeakPtr()), region_(&region),
      geometry_(std::move(geometry)) {
  CHECK(geometry_);
}
ProfilePreviewCaptureCache::~ProfilePreviewCaptureCache() = default;

bool ProfilePreviewCaptureCache::IsCurrent(const base::FilePath& path) const {
  auto* browser = browser_.get();
  auto* profile = browser ? browser->GetProfile() : nullptr;
  return profile && !profile->IsOffTheRecord() &&
      profile->GetOriginalProfile()->GetPath() == path;
}

void ProfilePreviewCaptureCache::Request(base::TimeDelta delay) {
  auto* browser = browser_.get();
  auto* profile = browser ? browser->GetProfile() : nullptr;
  if (profile && !profile->IsOffTheRecord()) {
    Schedule(profile->GetOriginalProfile()->GetPath(), delay, 0);
  }
}

void ProfilePreviewCaptureCache::Schedule(
    base::FilePath path, base::TimeDelta delay, int attempt) {
  if (path.empty() || attempt > kLastAttempt || !region_.view() ||
      !HasMultipleProfiles() || !pending_.insert(path).second) {
    return;
  }
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostDelayedTask(
      FROM_HERE,
      base::BindOnce(&ProfilePreviewCaptureCache::Capture,
                     weak_factory_.GetWeakPtr(), path, attempt), delay);
}

void ProfilePreviewCaptureCache::Capture(base::FilePath path, int attempt) {
  pending_.erase(path);
  if (!IsCurrent(path) || !region_.view() || !HasMultipleProfiles()) {
    return;
  }
  auto alive = weak_factory_.GetWeakPtr();
  region_.view()->DeprecatedLayoutImmediately();
  if (!alive || !region_.view() || !IsCurrent(path)) {
    return;
  }
  auto geometry = geometry_.Run();
  if (!alive || !region_.view() || !IsCurrent(path)) {
    return;
  }
  auto* region = region_.view();
  if (!geometry || geometry->bounds.IsEmpty() ||
      !Within(*region, geometry->header, geometry->bounds) ||
      !Within(*region, geometry->scroll, geometry->bounds)) {
    Schedule(path, kRetryDelay, attempt + 1);
    return;
  }
  for (const auto& view : geometry->optional_content) {
    if (view && view->GetVisible() && view->size().IsEmpty()) {
      Schedule(path, kRetryDelay, attempt + 1);
      return;
    }
  }
  auto* widget = region->GetWidget();
  auto* root = widget ? widget->GetRootView() : nullptr;
  if (!root || !widget->GetNativeView()) {
    return;
  }
  auto bounds = geometry->bounds;
  views::View::ConvertRectToTarget(region, root, &bounds);
  bounds.Intersect(root->GetLocalBounds());
  if (bounds.IsEmpty()) {
    return;
  }
  ui::GrabViewSnapshot(widget->GetNativeView(), bounds,
      base::BindOnce(&ProfilePreviewCaptureCache::OnCaptured,
                    weak_factory_.GetWeakPtr(), path, attempt));
}

void ProfilePreviewCaptureCache::OnCaptured(
    base::FilePath path, int attempt, gfx::Image image) {
  if (!region_.view() || !IsCurrent(path)) {
    return;
  }
  auto alive = weak_factory_.GetWeakPtr();
  const bool idle = geometry_.Run().has_value();
  if (!alive || !region_.view() || !IsCurrent(path)) {
    return;
  }
  if (image.IsEmpty() || !idle) {
    Schedule(path, kRetryDelay, attempt + 1);
    return;
  }
  images_.insert_or_assign(path, image.AsImageSkia());
}

gfx::ImageSkia ProfilePreviewCaptureCache::Find(
    const base::FilePath& path) const {
  const auto found = images_.find(path);
  return found == images_.end() ? gfx::ImageSkia() : found->second;
}
}  // namespace aux
