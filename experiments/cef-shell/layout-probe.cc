// Source-level CEF candidate probe, not the Aux product entry point.
// Page content must remain Chrome style; only trusted Aux UI may use Alloy.
#include "include/cef_browser.h"
#include "include/cef_client.h"
#include "include/cef_request_context.h"
#include "include/views/cef_box_layout.h"
#include "include/views/cef_browser_view.h"
#include "include/views/cef_browser_view_delegate.h"
#include "include/views/cef_window.h"
#include "include/views/cef_window_delegate.h"

namespace aux::candidate {
namespace {
class BrowserStyle final : public CefBrowserViewDelegate {
 public:
  explicit BrowserStyle(bool sidebar) : sidebar_(sidebar) {}
  cef_runtime_style_t GetBrowserRuntimeStyle() override {
    return sidebar_ ? CEF_RUNTIME_STYLE_ALLOY : CEF_RUNTIME_STYLE_CHROME;
  }
  ChromeToolbarType GetChromeToolbarType(CefRefPtr<CefBrowserView>) override {
    return CEF_CTT_NONE;
  }
  CefSize GetPreferredSize(CefRefPtr<CefView>) override {
    return sidebar_ ? CefSize(260, 900) : CefSize(1000, 900);
  }
 private:
  const bool sidebar_;
  IMPLEMENT_REFCOUNTING(BrowserStyle);
};

class WindowLayout final : public CefWindowDelegate {
 public:
  WindowLayout(CefRefPtr<CefBrowserView> sidebar,
               CefRefPtr<CefBrowserView> content)
      : sidebar_(sidebar), content_(content) {}
  cef_runtime_style_t GetWindowRuntimeStyle() override {
    return CEF_RUNTIME_STYLE_CHROME;
  }
  CefSize GetPreferredSize(CefRefPtr<CefView>) override {
    return CefSize(1260, 900);
  }
  void OnWindowCreated(CefRefPtr<CefWindow> window) override {
    window->SetTitle("Aux — browser-layer layout probe");
    window->SetBackgroundColor(CefColorSetARGB(255, 27, 27, 27));
    CefBoxLayoutSettings settings;
    settings.horizontal = true;
    settings.between_child_spacing = 0;
    auto layout = window->SetToBoxLayout(settings);
    window->AddChildView(sidebar_);
    window->AddChildView(content_);
    layout->SetFlexForView(content_, 1);
    window->Show();
  }
  bool CanClose(CefRefPtr<CefWindow>) override {
    auto browser = content_->GetBrowser();
    return !browser || browser->GetHost()->TryCloseBrowser();
  }
  void OnWindowDestroyed(CefRefPtr<CefWindow>) override {
    sidebar_ = nullptr;
    content_ = nullptr;
  }
 private:
  CefRefPtr<CefBrowserView> sidebar_;
  CefRefPtr<CefBrowserView> content_;
  IMPLEMENT_REFCOUNTING(WindowLayout);
};
}  // namespace

// The eventual caller must supply the actual Aux UI bridge and independent
// trusted-UI/site request contexts. This probe intentionally supplies no mock
// agent or navigation controls, profile migration, or production launcher.
CefRefPtr<CefWindow> CreateLayoutProbe(
    CefRefPtr<CefClient> shell_client,
    CefRefPtr<CefClient> content_client,
    CefRefPtr<CefRequestContext> shell_context,
    CefRefPtr<CefRequestContext> content_context,
    const CefString& trusted_shell_url,
    const CefString& fixture_url) {
  CefBrowserSettings settings;
  auto sidebar = CefBrowserView::CreateBrowserView(
      shell_client, trusted_shell_url, settings, nullptr, shell_context,
      new BrowserStyle(true));
  auto content = CefBrowserView::CreateBrowserView(
      content_client, fixture_url, settings, nullptr, content_context,
      new BrowserStyle(false));
  if (!sidebar || !content ||
      sidebar->GetRuntimeStyle() != CEF_RUNTIME_STYLE_ALLOY ||
      content->GetRuntimeStyle() != CEF_RUNTIME_STYLE_CHROME) {
    return nullptr;
  }
  return CefWindow::CreateTopLevelWindow(new WindowLayout(sidebar, content));
}
}  // namespace aux::candidate
