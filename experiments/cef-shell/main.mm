#import <Cocoa/Cocoa.h>
#include "include/cef_app.h"
#include "include/cef_application_mac.h"
#include "include/cef_command_line.h"
#include "include/cef_client.h"
#include "include/cef_id_mappers.h"
#include "include/cef_request_context.h"
#include "include/cef_request_context_handler.h"
#include "include/views/cef_window.h"
#include "include/wrapper/cef_library_loader.h"
#include <cstdio>
#include <filesystem>

@interface AuxCandidateApplication : NSApplication <CefAppProtocol> {
  BOOL handling_;
}
@end
@implementation AuxCandidateApplication
- (BOOL)isHandlingSendEvent { return handling_; }
- (void)setHandlingSendEvent:(BOOL)value { handling_ = value; }
- (void)sendEvent:(NSEvent*)event {
  CefScopedSendingEvent sending;
  [super sendEvent:event];
}
@end

namespace aux::candidate {
CefRefPtr<CefWindow> CreateLayoutProbe(CefRefPtr<CefClient>, CefRefPtr<CefClient>,
    CefRefPtr<CefRequestContext>, CefRefPtr<CefRequestContext>,
    const CefString&, const CefString&);

class Client final : public CefClient, public CefLifeSpanHandler, public CefLoadHandler, public CefKeyboardHandler {
 public:
  CefRefPtr<CefLifeSpanHandler> GetLifeSpanHandler() override { return this; }
  CefRefPtr<CefLoadHandler> GetLoadHandler() override { return this; }
  CefRefPtr<CefKeyboardHandler> GetKeyboardHandler() override { return this; }
  bool OnPreKeyEvent(CefRefPtr<CefBrowser> browser, const CefKeyEvent& event,
                    CefEventHandle, bool*) override {
    if (event.type != KEYEVENT_RAWKEYDOWN || !(event.modifiers & EVENTFLAG_COMMAND_DOWN)
        || browser->GetHost()->GetRuntimeStyle() != CEF_RUNTIME_STYLE_CHROME) return false;
    const char* name = event.windows_key_code == 'T' ? "IDC_NEW_TAB"
      : event.windows_key_code == 'W' ? "IDC_CLOSE_TAB" : nullptr;
    if (!name) return false;
    const int command = cef_id_for_command_id_name(name);
    if (!browser->GetHost()->CanExecuteChromeCommand(command)) return false;
    browser->GetHost()->ExecuteChromeCommand(command, CEF_WOD_CURRENT_TAB);
    return true;
  }
  void OnLoadEnd(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, int status) override {
    if (frame->IsMain()) fprintf(stderr, "Browser %d loaded: status=%d\n", browser->GetIdentifier(), status);
  }
  void OnLoadError(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame,
                   ErrorCode code, const CefString& text, const CefString&) override {
    if (frame->IsMain()) fprintf(stderr, "Browser %d load error %d: %s\n", browser->GetIdentifier(), code, text.ToString().c_str());
  }
  void OnAfterCreated(CefRefPtr<CefBrowser> browser) override {
    ++browsers_;
    browser->GetHost()->SetAccessibilityState(STATE_ENABLED);
    fprintf(stderr, "Aux candidate browser %d runtime=%s\n", browser->GetIdentifier(),
        browser->GetHost()->GetRuntimeStyle() == CEF_RUNTIME_STYLE_CHROME ? "chrome" : "alloy");
  }
  void OnBeforeClose(CefRefPtr<CefBrowser>) override {
    if (--browsers_ == 0) CefQuitMessageLoop();
  }
 private:
  int browsers_ = 0;
  IMPLEMENT_REFCOUNTING(Client);
};

class Application final : public CefApp, public CefBrowserProcessHandler, public CefRequestContextHandler {
 public:
  explicit Application(std::string profile) : profile_(std::move(profile)) {}
  CefRefPtr<CefBrowserProcessHandler> GetBrowserProcessHandler() override { return this; }
  void OnContextInitialized() override {
    CefRequestContextSettings shell_settings, site_settings;
    CefString(&shell_settings.cache_path) = profile_ + "/shell";
    CefString(&site_settings.cache_path) = profile_ + "/sites";
    shell_context_ = CefRequestContext::CreateContext(shell_settings, this);
    site_context_ = CefRequestContext::CreateContext(site_settings, this);
  }
  void ReleaseContexts() { shell_context_ = nullptr; site_context_ = nullptr; }
  void OnRequestContextInitialized(CefRefPtr<CefRequestContext>) override {
    if (++ready_contexts_ != 2) return;
    auto command = CefCommandLine::GetGlobalCommandLine();
    CefRefPtr<Client> client = new Client();
    // This is a diagnostic surface, never a mock Aux product or a trusted RPC bridge.
    const CefString shell_url = "data:text/html,<style>body{background:%231b1b1b;color:%23eee;font:14px system-ui;padding:20px}p{color:%23999;line-height:1.5}</style><h3>Aux host candidate</h3><p>Chrome content with an isolated shell surface.</p><p>Product controls are not connected.</p>";
    const CefString url = command->HasSwitch("url") ? command->GetSwitchValue("url") : CefString("https://example.com");
    if (!CreateLayoutProbe(client, client, shell_context_, site_context_, shell_url, url)) {
      fprintf(stderr, "Chrome content and isolated shell could not be constructed.\n");
      CefQuitMessageLoop();
    }
  }
 private:
  std::string profile_;
  int ready_contexts_ = 0;
  CefRefPtr<CefRequestContext> shell_context_, site_context_;
  IMPLEMENT_REFCOUNTING(Application);
};
}  // namespace aux::candidate

int main(int argc, char* argv[]) {
  @autoreleasepool {
    CefScopedLibraryLoader library;
    if (!library.LoadInMain()) return 1;
    auto command = CefCommandLine::CreateCommandLine();
    command->InitFromArgv(argc, argv);
    std::string profile = command->GetSwitchValue("profile");
    if (profile.empty() || !std::filesystem::path(profile).is_absolute()) {
      fprintf(stderr, "Pass --profile=/absolute/path/to/an/isolated/development/profile\n");
      return 2;
    }
    std::filesystem::create_directories(profile);
    profile = std::filesystem::canonical(profile).string();
    std::filesystem::create_directories(profile + "/shell");
    std::filesystem::create_directories(profile + "/sites");
    [AuxCandidateApplication sharedApplication];
    [NSApp setActivationPolicy:NSApplicationActivationPolicyRegular];
    CefSettings settings;
    CefString(&settings.root_cache_path) = profile;
    CefRefPtr<aux::candidate::Application> application = new aux::candidate::Application(profile);
    if (!CefInitialize(CefMainArgs(argc, argv), settings, application, nullptr)) return 1;
    CefRunMessageLoop();
    application->ReleaseContexts();
    CefShutdown();
    return 0;
  }
}
