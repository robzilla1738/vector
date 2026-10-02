// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_startup_viewport.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include <cmath>
#include <cstdlib>
#include <vector>
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/aux/native_performance_mailbox.h"
#include "chrome/browser/ui/aux/native_startup_launch_receipt.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface_iterator.h"
#include "chrome/browser/ui/webui_browser/webui_browser_ui.h"
#include "chrome/browser/ui/webui_browser/webui_browser_window.h"
#include "content/browser/renderer_host/render_widget_host_impl.h"
#include "content/browser/renderer_host/render_widget_host_view_base.h"
#include "content/public/browser/browser_thread.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/weak_document_ptr.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/web_ui.h"
#include "ui/compositor/compositor.h"
#include "ui/views/view.h"
#include "ui/views/widget/widget.h"
namespace aux {
std::optional<gfx::Rect> ValidateNativeStartupViewportGeometry(
    const NativeStartupViewportGeometry& g) {
  for (const auto& rectangle : {g.shell_screen, g.client_screen, g.root_screen})
    if (rectangle.x() < -1000000 || rectangle.x() > 1000000 ||
        rectangle.y() < -1000000 || rectangle.y() > 1000000 ||
        rectangle.width() > 32768 || rectangle.height() > 32768)
      return std::nullopt;
  if (!std::isfinite(g.shell_scale) || g.shell_scale <= 0 ||
      g.shell_scale > 8 || g.shell_scale != g.root_scale ||
      g.shell_screen.IsEmpty() || g.client_screen != g.shell_screen ||
      !g.root_screen.Contains(g.client_screen) || g.root_screen.IsEmpty() ||
      g.shell_pixels.IsEmpty() || g.root_pixels.IsEmpty() ||
      g.shell_pixels != gfx::ScaleToRoundedSize(g.client_screen.size(), g.shell_scale) ||
      g.root_pixels != gfx::ScaleToRoundedSize(g.root_screen.size(), g.root_scale))
    return std::nullopt;
  gfx::Rect relative = g.client_screen;
  relative.Offset(-g.root_screen.x(), -g.root_screen.y());
  const gfx::Rect pixels = gfx::ScaleToRoundedRect(relative, g.root_scale);
  if (pixels.size() != g.shell_pixels || !gfx::Rect(g.root_pixels).Contains(pixels))
    return std::nullopt;
  return pixels;
}
std::optional<NativeStartupViewport> ReadNativeStartupViewport(
    base::WeakPtr<WebUIBrowserUI> ui) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  const auto owner = ReadNativeGuestStageShellOwner(ui);
  if (!NativeStartupObservationEnabled() || !owner || !ui || !ui->web_ui()) return std::nullopt;
  auto* profile = Profile::FromWebUI(ui->web_ui());
  auto* browser = ui->browser();
  if (!profile || profile->IsOffTheRecord() || !browser) return std::nullopt;
  const auto browser_weak = browser->GetWeakPtr();
  const auto selected = profile->GetPath().DirName();
  std::vector<base::WeakPtr<BrowserWindowInterface>> inventory;
  ForEachCurrentBrowserWindowInterfaceOrderedByActivation(
      [&inventory, selected](BrowserWindowInterface* candidate) {
        if (candidate->GetProfile() && candidate->GetProfile()->GetPath().DirName() == selected &&
            WebUIBrowserWindow::FromBrowser(candidate))
          inventory.push_back(candidate->GetWeakPtr());
        return true;
      });
  if (!ui || !browser_weak || inventory.size() != 1 || !inventory[0] ||
      inventory[0].get() != browser_weak.get() ||
      !NativePerformanceOwnerInventoryMatches(browser_weak.get(), {}, {browser_weak.get()}))
    return std::nullopt;
  auto* shell = ui->web_ui()->GetWebContents();
  auto* frame = shell ? shell->GetPrimaryMainFrame() : nullptr;
  auto* window = shell ? WebUIBrowserWindow::FromWebShellWebContents(shell) : nullptr;
  if (!frame || !window || !window->widget()) return std::nullopt;
  auto document = frame->GetWeakDocumentPtr();
  auto* rwh = static_cast<content::RenderWidgetHostImpl*>(frame->GetRenderWidgetHost());
  if (!rwh || !rwh->GetView()) return std::nullopt;
  auto widget = window->widget()->GetWeakPtr();
  auto view = rwh->GetView()->GetWeakPtr();
  if (!widget || !view || view.get() != shell->GetRenderWidgetHostView()) return std::nullopt;
  auto read = [&]() -> std::optional<NativeStartupViewport> {
    auto* current = document.AsRenderFrameHostIfValid();
    if (!ui || !current || !widget || !view || current->GetRenderWidgetHost() != rwh ||
        rwh->GetView() != view.get())
      return std::nullopt;
    if (!widget->IsVisibleOnScreen() || !widget || widget->IsMinimized() || !view)
      return std::nullopt;
    if (!view->IsShowing() || !view || !widget || !widget->GetRootView() ||
        !widget->GetRootView()->IsDrawn() || !widget || !widget->GetCompositor())
      return std::nullopt;
    NativeStartupViewport result;
    result.owner = *owner;
    result.shell_surface = view->GetCurrentSurfaceId();
    if (!view || !widget) return std::nullopt;
    result.geometry.shell_screen = view->GetViewBounds();
    if (!view || !widget) return std::nullopt;
    const auto untransformed = view->GetViewBoundsWithoutTransform();
    if (!view || !widget || untransformed != result.geometry.shell_screen) return std::nullopt;
    result.geometry.client_screen = widget->GetClientAreaBoundsInScreen();
    if (!view || !widget || !widget->GetRootView()) return std::nullopt;
    result.geometry.root_screen = widget->GetRootView()->GetBoundsInScreen();
    if (!view || !widget) return std::nullopt;
    result.geometry.shell_pixels = view->GetCompositorViewportPixelSize();
    if (!view || !widget || !widget->GetCompositor()) return std::nullopt;
    result.geometry.shell_scale = view->GetDeviceScaleFactor();
    if (!view || !widget || !widget->GetCompositor()) return std::nullopt;
    result.geometry.root_scale = widget->GetCompositor()->device_scale_factor();
    result.geometry.root_pixels = widget->GetCompositor()->size();
    const auto bounds = ValidateNativeStartupViewportGeometry(result.geometry);
    if (!bounds || !result.shell_surface.is_valid() ||
        result.shell_surface.frame_sink_id() != owner->shell_sink ||
        widget->GetCompositor()->frame_sink_id() != owner->display_sink)
      return std::nullopt;
    result.shell_root_pixels = *bounds;
    return result;
  };
  const auto before = read();
  const auto after = read();
  if (!before || before != after || !ui || !browser_weak || !document.AsRenderFrameHostIfValid() ||
      !view || !widget || ReadNativeGuestStageShellOwner(ui) != owner || !ui || !browser_weak ||
      !document.AsRenderFrameHostIfValid() || !widget || !view ||
      document.AsRenderFrameHostIfValid()->GetRenderWidgetHost() != rwh || rwh->GetView() != view.get())
    return std::nullopt;
  return before;
}
}  // namespace aux
#endif
