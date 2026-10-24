// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_FRAME_PRESENTATION_STATE_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_FRAME_PRESENTATION_STATE_H_

namespace aux {

inline constexpr char kSidebarNavigationEnabledPref[] =
    "aux.sidebar_navigation_enabled";
inline constexpr char kMinimalUiEnabledPref[] = "aux.minimal_ui_enabled";


// Preferences request a mode; the real vertical-tab controller remains the
// collapse/animation owner. Do not persist transient hover/focus state.
enum class SidebarMode { kDocked, kAutoHide };
enum class SidebarSurface { kDocked, kHidden, kHoverPreview };
enum class NavigationHost { kTop, kSidebar };

struct FramePresentationInputs {
  bool sidebar_collapsed = false;
  bool hover_revealed = false;
  bool sidebar_navigation = false;
  bool minimal = false;
  bool always_show_full_url = false;
  bool sidebar_has_focus = false;
  bool navigation_has_focus = false;
  bool menu_open = false;
  bool drag_active = false;
  bool transition_active = false;
};

struct FramePresentationState {
  SidebarSurface sidebar = SidebarSurface::kDocked;
  NavigationHost navigation = NavigationHost::kTop;
  bool reserve_sidebar_width = true;
  bool relocation_deferred = false;
  bool suppress_redundant_chrome = false;
  bool full_url_required = false;
  // Minimal mode may suppress redundant chrome, never the sole trusted URL
  // control. Consumers must not equate suppress_redundant_chrome with hiding
  // the navigation host or its permissions/security indicators.
  bool show_top_navigation = true;
};

constexpr bool FrameRelocationLocked(const FramePresentationInputs& inputs) {
  return inputs.navigation_has_focus || inputs.menu_open || inputs.drag_active ||
         inputs.transition_active;
}

// current_host comes from the actual navigation view's parent, not a saved
// preference. This projection adds no timers, animation curves or colors.
constexpr FramePresentationState ResolveFramePresentation(
    const FramePresentationInputs& inputs, NavigationHost current_host) {
  FramePresentationState result;
  const auto desired = inputs.sidebar_navigation && !inputs.sidebar_collapsed
                           ? NavigationHost::kSidebar
                           : NavigationHost::kTop;
  result.relocation_deferred =
      desired != current_host && FrameRelocationLocked(inputs);
  result.navigation = result.relocation_deferred ? current_host : desired;
  result.reserve_sidebar_width = !inputs.sidebar_collapsed;
  result.sidebar = !inputs.sidebar_collapsed
                       ? SidebarSurface::kDocked
                       : (inputs.hover_revealed || inputs.sidebar_has_focus ||
                          inputs.menu_open || inputs.drag_active ||
                          result.navigation == NavigationHost::kSidebar)
                             ? SidebarSurface::kHoverPreview
                             : SidebarSurface::kHidden;
  result.suppress_redundant_chrome = inputs.minimal;
  result.full_url_required = inputs.always_show_full_url;
  result.show_top_navigation = result.navigation == NavigationHost::kTop;
  return result;
}

}  // namespace aux
#endif  // CHROME_BROWSER_UI_VIEWS_FRAME_AUX_FRAME_PRESENTATION_STATE_H_
