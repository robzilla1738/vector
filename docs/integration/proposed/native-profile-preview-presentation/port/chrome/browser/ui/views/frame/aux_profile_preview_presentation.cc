// Copyright 2026 Aux Authors. All rights reserved.
#include "chrome/browser/ui/views/frame/aux_profile_preview_presentation.h"

#include <algorithm>
#include <cmath>

#include "ui/compositor/layer.h"
#include "ui/gfx/transform.h"
#include "ui/views/view.h"

namespace aux {
namespace {
// Original df518f4; preserve its actual float rather than rounded -0.42f.
constexpr float kSourceFade = -0.42000001668930054f;

void SetPresentation(views::View& view, float x, float opacity) {
  if (!view.layer()) {
    view.SetPaintToLayer();
    view.layer()->SetFillsBoundsOpaquely(false);
  }
  gfx::Transform transform;
  transform.Translate(x, 0);
  view.layer()->SetTransform(transform);
  view.layer()->SetOpacity(opacity);
}
}  // namespace

ProfilePreviewPresentation::ProfilePreviewPresentation(
    views::View& owner, ProfilePreviewSurfaces source,
    views::View* top_boundary)
    : owner_(&owner), top_boundary_(top_boundary) {
  for (size_t i = 0; i < source.size(); ++i) {
    source_[i].SetView(source[i]);
  }
}

ProfilePreviewPresentation::~ProfilePreviewPresentation() {
  Reset(false);
}

gfx::Rect ProfilePreviewPresentation::PreviewBounds(
    const views::View& owner, ProfilePreviewSurfaces surfaces,
    const views::View* top_boundary) {
  // Original4640600 uses the actual five role-bound child rectangles. These
  // are owner-layout coordinates, not screen or full BrowserView bounds.
  gfx::Rect combined;
  bool found = false;
  for (auto* surface : surfaces) {
    if (!surface || !surface->GetVisible() || surface->bounds().IsEmpty()) {
      continue;
    }
    if (found) {
      combined.Union(surface->bounds());
    } else {
      combined = surface->bounds();
      found = true;
    }
  }
  if (!found) {
    return owner.GetLocalBounds();
  }
  const int boundary = top_boundary && !top_boundary->bounds().IsEmpty()
                           ? top_boundary->bounds().bottom()
                           : combined.y();
  const int top = std::clamp(boundary, 0, std::max(owner.height(), 0));
  return gfx::Rect(0, top, std::max(owner.width(), 0),
                   std::max(owner.height() - top, 0));
}

bool ProfilePreviewPresentation::BindPreview(
    views::View& target_owner, ProfilePreviewSurfaces target,
    const views::View* target_top_boundary, views::View& page,
    views::View& live_host, int direction) {
  Reset(true);
  auto* owner = owner_.view();
  if (!owner || &target_owner == owner ||
      (direction != -1 && direction != 1) || &page == &live_host ||
      !page.Contains(&live_host) || !owner->Contains(&page) ||
      page.GetWidget() != owner->GetWidget() ||
      target_owner.size() != owner->size()) {
    return false;
  }
  // These pointers originally come only from the selected cached region's
  // own members. Preserve that positive ownership at this typed155 seam.
  for (size_t i = 0; i < target.size(); ++i) {
    if (!target[i]) {
      continue;
    }
    if (target[i] == &target_owner || !target_owner.Contains(target[i])) {
      return false;
    }
    for (size_t j = 0; j < i; ++j) {
      if (target[j] == target[i]) {
        return false;
      }
    }
  }
  ProfilePreviewSurfaces source;
  for (size_t i = 0; i < source.size(); ++i) {
    source[i] = source_[i].view();
  }
  page.SetBoundsRect(PreviewBounds(*owner, source, top_boundary_.view()));
  live_host.SetBoundsRect(page.GetLocalBounds());
  const int target_top =
      PreviewBounds(target_owner, target, target_top_boundary).y();
  // Original4657d98..4657e34 preserves each genuine child rectangle and
  // offsets its Y by the cached region's computed preview top. No screenshot
  // or reconstruction of its tabs/bookmarks/tasks replaces these live Views.
  for (auto* surface : target) {
    if (!surface || !surface->parent()) {
      continue;
    }
    gfx::Rect bounds = surface->bounds();
    bounds.Offset(0, -target_top);
    borrowed_.Borrow(surface, &live_host, bounds);
  }
  if (borrowed_.empty()) {
    return false;
  }
  page_.SetView(&page);
  direction_ = direction;
  page.SetVisible(true);
  return true;
}

void ProfilePreviewPresentation::Update(float progress) {
  auto* owner = owner_.view();
  if (!owner) {
    return;
  }
  progress = std::clamp(progress, -1.0f, 1.0f);
  const float magnitude = std::abs(progress);
  if (magnitude <= 0.001f) {
    Reset(false);
    return;
  }
  if (!owner->layer()) {
    owner->SetPaintToLayer();
    owner->layer()->SetFillsBoundsOpaquely(false);
  }
  owner->layer()->SetMasksToBounds(true);
  const int direction = progress > 0 ? 1 : -1;
  auto* page = page_.view();
  const bool matching = page && page->GetVisible() && direction == direction_;
  const float width = std::max(owner->width(), 1);
  const float source_opacity = matching ? 1.0f + kSourceFade * magnitude : 1.0f;
  for (auto& tracker : source_) {
    if (auto* surface = tracker.view(); surface && surface->GetVisible()) {
      SetPresentation(*surface, -width * progress, source_opacity);
    }
  }
  if (!page) {
    return;
  }
  if (matching) {
    SetPresentation(*page, width * (direction - progress),
                    std::min(1.0f, 0.22f + 0.78f * magnitude));
  } else {
    SetPresentation(*page, 0, 0);
    page->SetVisible(false);
  }
}

void ProfilePreviewPresentation::Reset(bool invalidate_before_restore) {
  // Original465933c resets the actual source layers, and465330c restores
  // live borrowed children before an inactive preview can be hidden/released.
  for (auto& tracker : source_) {
    if (auto* surface = tracker.view(); surface && surface->layer()) {
      SetPresentation(*surface, 0, 1);
    }
  }
  borrowed_.Restore(invalidate_before_restore);
  if (auto* page = page_.view()) {
    SetPresentation(*page, 0, 0);
    page->SetVisible(false);
  }
  page_.SetView(nullptr);
  direction_ = 0;
}
}  // namespace aux
