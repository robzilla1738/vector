// Compile-time policy checks only. No executable, native view or app launch.
#include "chrome/browser/ui/views/frame/aux_frame_presentation_state.h"

using aux::FramePresentationInputs;
using aux::NavigationHost;
using aux::ResolveFramePresentation;
using aux::SidebarSurface;

constexpr auto baseline = ResolveFramePresentation({}, NavigationHost::kTop);
static_assert(baseline.navigation == NavigationHost::kTop);
static_assert(baseline.sidebar == SidebarSurface::kDocked);
static_assert(baseline.reserve_sidebar_width);
static_assert(!baseline.suppress_redundant_chrome);

constexpr bool CheckTransitions() {
  FramePresentationInputs input;
  input.sidebar_navigation = true;
  if (ResolveFramePresentation(input, NavigationHost::kTop).navigation !=
      NavigationHost::kSidebar)
    return false;
  input.navigation_has_focus = true;
  const auto typing = ResolveFramePresentation(input, NavigationHost::kTop);
  if (!typing.relocation_deferred || !typing.show_top_navigation)
    return false;
  input.sidebar_collapsed = true;
  const auto collapse = ResolveFramePresentation(input, NavigationHost::kSidebar);
  if (!collapse.relocation_deferred || collapse.reserve_sidebar_width ||
      collapse.sidebar != SidebarSurface::kHoverPreview)
    return false;
  input.navigation_has_focus = false;
  const auto settled = ResolveFramePresentation(input, NavigationHost::kSidebar);
  if (settled.navigation != NavigationHost::kTop ||
      settled.sidebar != SidebarSurface::kHidden)
    return false;
  input.hover_revealed = true;
  const auto hover = ResolveFramePresentation(input, NavigationHost::kTop);
  if (hover.navigation != NavigationHost::kTop || hover.reserve_sidebar_width ||
      hover.sidebar != SidebarSurface::kHoverPreview)
    return false;
  input.hover_revealed = false;
  input.sidebar_has_focus = true;
  if (ResolveFramePresentation(input, NavigationHost::kTop).sidebar !=
      SidebarSurface::kHoverPreview)
    return false;
  input.sidebar_has_focus = false;
  input.minimal = true;
  input.always_show_full_url = true;
  const auto minimal = ResolveFramePresentation(input, NavigationHost::kTop);
  if (!minimal.show_top_navigation || !minimal.full_url_required ||
      !minimal.suppress_redundant_chrome)
    return false;
  for (int lock = 0; lock < 3; ++lock) {
    input.menu_open = lock == 0;
    input.drag_active = lock == 1;
    input.transition_active = lock == 2;
    const auto held = ResolveFramePresentation(input, NavigationHost::kSidebar);
    if (!held.relocation_deferred ||
        held.navigation != NavigationHost::kSidebar ||
        held.sidebar != SidebarSurface::kHoverPreview)
      return false;
  }
  return true;
}
static_assert(CheckTransitions());
