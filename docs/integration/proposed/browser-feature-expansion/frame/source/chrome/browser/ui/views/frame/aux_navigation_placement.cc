// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/views/frame/aux_navigation_placement.h"

#include <algorithm>

#include "base/functional/bind.h"
#include "base/functional/callback_helpers.h"
#include "ui/views/focus/focus_manager.h"
#include "ui/views/view.h"

namespace aux {

AuxNavigationPlacement::AuxNavigationPlacement(views::View& navigation,
                                             views::View& top_host,
                                             views::View& sidebar_host)
    : navigation_(&navigation),
      top_host_(&top_host),
      sidebar_host_(&sidebar_host),
      top_index_(top_host.GetIndexOf(&navigation)
                     .value_or(top_host.children().size())) {
  navigation_.SetTrackEntireViewHierarchy(true);
  top_host_.SetTrackEntireViewHierarchy(true);
  sidebar_host_.SetTrackEntireViewHierarchy(true);
  state_.navigation = navigation.parent() == &sidebar_host
                          ? NavigationHost::kSidebar
                          : NavigationHost::kTop;
  state_.show_top_navigation = state_.navigation == NavigationHost::kTop;
}

AuxNavigationPlacement::~AuxNavigationPlacement() = default;

AuxNavigationPlacement::Result AuxNavigationPlacement::Update(
    FramePresentationInputs inputs, int available_sidebar_width) {
  if (updating_)
    return Result::kDeferred;
  updating_ = true;
  const auto alive = weak_factory_.GetWeakPtr();
  base::ScopedClosureRunner finish(base::BindOnce(
      [](base::WeakPtr<AuxNavigationPlacement> owner) {
        if (owner)
          owner->updating_ = false;
      }, alive));
  auto* navigation = navigation_.view();
  auto* top = top_host_.view();
  auto* sidebar = sidebar_host_.view();
  if (!navigation || !top || !sidebar || top == sidebar ||
      navigation->Contains(top) || navigation->Contains(sidebar) ||
      !top->GetWidget() || top->GetWidget() != sidebar->GetWidget() ||
      navigation->GetWidget() != top->GetWidget() ||
      (navigation->parent() != top && navigation->parent() != sidebar)) {
    return Result::kUnavailable;
  }

  const auto current = navigation->parent() == sidebar
                           ? NavigationHost::kSidebar
                           : NavigationHost::kTop;
  if (const auto* focus = navigation->GetFocusManager()) {
    inputs.navigation_has_focus |= navigation->Contains(focus->GetFocusedView());
  }
  auto resolved = ResolveFramePresentation(inputs, current);
  if (resolved.relocation_deferred) {
    state_ = resolved;
    return Result::kDeferred;
  }

  // A full native toolbar may not fit a 280-DIP sidebar. Refuse rather than
  // clip its origin/security/permission controls. Root may provide a reviewed
  // native compact toolbar layout; this controller never forces the width.
  if (resolved.navigation == NavigationHost::kSidebar &&
      available_sidebar_width < std::max(1, navigation->GetMinimumSize().width())) {
    inputs.sidebar_navigation = false;
    resolved = ResolveFramePresentation(inputs, current);
    if (resolved.relocation_deferred) {
      state_ = resolved;
      return Result::kDeferred;
    }
    state_ = resolved;
    if (current == NavigationHost::kTop)
      return Result::kInsufficientWidth;
  }

  if (resolved.navigation == current) {
    state_ = resolved;
    return Result::kUnchanged;
  }
  auto* destination = resolved.navigation == NavigationHost::kSidebar
                          ? sidebar
                          : top;
  const auto index = destination == top
                         ? std::min(top_index_, top->children().size())
                         : destination->children().size();
  // Views' native reparent operation preserves the real ToolbarView and its
  // controller ownership. No intermediate unique_ptr owns/destroys that view.
  destination->AddChildViewAt(navigation, index);
  // View-hierarchy notifications can synchronously tear down an owner.
  if (!alive || !navigation_.view() || !top_host_.view() || !sidebar_host_.view() ||
      navigation_.view()->parent() != destination) {
    return Result::kUnavailable;
  }
  state_ = resolved;
  top_host_.view()->InvalidateLayout();
  if (!alive || !sidebar_host_.view())
    return Result::kUnavailable;
  sidebar_host_.view()->InvalidateLayout();
  return Result::kMoved;
}

AuxNavigationPlacement::Result AuxNavigationPlacement::RestoreToTop(
    FramePresentationInputs inputs) {
  inputs.sidebar_navigation = false;
  return Update(inputs, 0);
}

}  // namespace aux
