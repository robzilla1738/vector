// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/stock_measurement/native_stock_views_readiness.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS) && !BUILDFLAG(ENABLE_AUX_SHELL)
#include <cmath>
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/aux/native_startup_launch_receipt.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/stock_measurement/native_stock_memory_sampler.h"
#include "chrome/browser/ui/views/frame/browser_view.h"
#include "chrome/browser/ui/views/location_bar/location_bar_view.h"
#include "chrome/browser/ui/views/omnibox/omnibox_view_views.h"
#include "ui/compositor/compositor.h"
#include "ui/compositor/layer.h"
#include "ui/gfx/geometry/rect_conversions.h"
#include "ui/views/widget/widget.h"
namespace aux {
std::optional<gfx::Rect> ReadNativeStockViewsRootGeometry(BrowserView* current) {
  if (!NativeStartupObservationEnabled() || !current || !current->browser() ||
      !current->browser()->GetProfile() ||
      current->browser()->GetProfile()->IsOffTheRecord()) return std::nullopt;
  const auto view_weak = current->GetAsWeakPtr();
  const auto browser_weak = current->browser()->GetWeakPtr();
  auto* widget = current->GetWidget();
  auto* root = widget ? widget->GetRootView() : nullptr;
  auto* compositor = widget ? widget->GetCompositor() : nullptr;
  auto* location = current->GetLocationBarView();
  auto* input = location ? location->omnibox_view() : nullptr;
  if (!widget || widget->IsClosed() || !widget->IsVisible() || !root || !compositor || !compositor->root_layer() ||
      !input || input->GetWidget() != widget || !input->IsFocusable() || input->GetReadOnly() ||
      input->GetLocalBounds().IsEmpty() || input->GetVisibleBounds() != input->GetLocalBounds()) return std::nullopt;
  const auto widget_weak = widget->GetWeakPtr();
  const auto input_weak = input->AsWeakPtr();
  const auto type = input->GetTextInputType();
  if (!view_weak || !browser_weak || !widget_weak || !input_weak ||
      view_weak->GetWidget() != widget_weak.get() || widget_weak->GetRootView() != root || view_weak->GetLocationBarView() != location ||
      location->omnibox_view() != input || widget_weak->GetCompositor() != compositor) return std::nullopt;
  if (type != ui::TEXT_INPUT_TYPE_TEXT && type != ui::TEXT_INPUT_TYPE_SEARCH && type != ui::TEXT_INPUT_TYPE_URL) return std::nullopt;
  // IsDrawn alone does not exclude an inherited opacity-zero layer. Reject
  // unknown/transformed/clipped native ancestry; no default-opacity inference.
  for (auto* view = static_cast<views::View*>(input); view; view = view->parent()) {
    if (!view->GetVisible() || !view->GetEnabled() || !view->GetTransform().IsIdentity()) return std::nullopt;
    if (auto* layer = view->layer(); layer && (layer->opacity() != 1.f || !layer->transform().IsIdentity() || !layer->clip_rect().IsEmpty())) return std::nullopt;
    if (view == root) break;
    if (!view->parent()) return std::nullopt;
  }
  const gfx::Point point = views::View::ConvertPointToTarget(input, root, input->GetLocalBounds().CenterPoint());
  auto* hit = root->GetEventHandlerForPoint(point);
  if (!view_weak || !browser_weak || !widget_weak || !input_weak ||
      view_weak->GetWidget() != widget_weak.get() || widget_weak->GetRootView() != root ||
      view_weak->GetLocationBarView() != location || location->omnibox_view() != input ||
      widget_weak->GetCompositor() != compositor || !hit || (hit != input && !input->Contains(hit))) return std::nullopt;
  const float scale = compositor->device_scale_factor();
  if (!std::isfinite(scale) || scale <= 0 || compositor->size().IsEmpty() || root->GetLocalBounds().IsEmpty() ||
      compositor->root_layer()->opacity() != 1.f || !compositor->root_layer()->transform().IsIdentity() ||
      !compositor->root_layer()->clip_rect().IsEmpty()) return std::nullopt;
  const gfx::Rect pixels = gfx::ScaleToEnclosingRect(root->GetLocalBounds(), scale);
  if (pixels != gfx::Rect(compositor->size())) return std::nullopt;
  if (!NativeStartupObservationEnabled() || !view_weak || !browser_weak || !widget_weak || !input_weak ||
      view_weak->browser() != browser_weak.get() ||
      widget_weak->GetCompositor() != compositor || compositor->size() != pixels.size()) return std::nullopt;
  return pixels;
}
std::optional<gfx::Rect> ReadNativeStockViewsReadyRoot(BrowserView* current) {
  if (!current || !current->browser()) return std::nullopt;
  const auto view = current->GetAsWeakPtr();
  const auto browser = current->browser()->GetWeakPtr();
  const auto initial = ReadNativeStockMeasurementOwner();
  if (!browser || !initial || initial.get() != browser.get()) return std::nullopt;
  const auto geometry = ReadNativeStockViewsRootGeometry(current);
  const auto final = ReadNativeStockMeasurementOwner();
  if (!view || !browser || !final || final.get() != browser.get() ||
      view->browser() != browser.get()) return std::nullopt;
  return geometry;
}
}  // namespace aux
#endif
