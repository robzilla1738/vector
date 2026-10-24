// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/aux_preview/aux_preview_controller.h"
#include <algorithm>
#include "chrome/browser/ui/aux_preview/aux_preview_controls.h"
#include <map>
#include <memory>
#include <utility>
#include "base/functional/bind.h"
#include "base/memory/weak_ptr.h"
#include "base/no_destructor.h"
#include "base/scoped_observation.h"
#include "base/strings/utf_string_conversions.h"
#include "chrome/browser/actor/ui/actor_ui_tab_controller.h"
#include "chrome/browser/aux/AuxBrowserPrivateRoots.h"
#include "chrome/browser/aux/AuxSelectedStateHome.h"
#include "chrome/browser/aux/profile_identity.h"
#include "chrome/browser/browser_process.h"
#include "chrome/browser/media/webrtc/media_capture_devices_dispatcher.h"
#include "chrome/browser/media/webrtc/media_stream_capture_indicator.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/profiles/profile_attributes_entry.h"
#include "chrome/browser/profiles/profile_attributes_storage.h"
#include "chrome/browser/profiles/profile_manager.h"
#include "chrome/browser/profiles/profile_window.h"
#include "chrome/browser/ui/aux/page_identity.h"
#include "chrome/browser/ui/browser_commands.h"
#include "chrome/browser/ui/browser_init_state.h"
#include "chrome/browser/ui/browser_tabstrip.h"
#include "chrome/browser/ui/browser_window/public/browser_collection_observer.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/browser_window/public/create_browser_window.h"
#include "chrome/browser/ui/browser_window/public/global_browser_collection.h"
#include "chrome/browser/ui/navigator/browser_navigator.h"
#include "chrome/browser/ui/navigator/browser_navigator_params.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/unload_controller.h"
#include "chrome/browser/ui/views/frame/aux_organization_window_controller.h"
#include "components/prefs/pref_service.h"
#include "components/tabs/public/tab_interface.h"
#include "content/public/browser/browser_thread.h"
#include "content/public/browser/devtools_agent_host.h"
#include "content/public/browser/download_manager.h"
#include "content/public/browser/navigation_controller.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/weak_document_ptr.h"
#include "content/public/browser/web_contents.h"
#include "ui/base/base_window.h"
#include "ui/display/screen.h"
#include "url/origin.h"
namespace aux::preview {
namespace {
struct Window {
  Kind kind;
  base::WeakPtr<BrowserWindowInterface> browser;
  base::WeakPtr<BrowserWindowInterface> source;
  base::WeakPtr<Profile> profile;
  std::shared_ptr<const aux::peer::BrowserPrivateRoots> roots;
  std::string profile_id, epoch, restriction;
  uint64_t generation = 0;
  bool promoting = false;
  bool initialized = false;
  base::RepeatingClosureList changes;
};
class Registry final : public BrowserCollectionObserver {
 public:
  Registry() { observation_.Observe(GlobalBrowserCollection::GetInstance()); }
  void OnBrowserClosed(BrowserWindowInterface* browser) override { windows.erase(browser); }
  std::map<const BrowserWindowInterface*, std::shared_ptr<Window>> windows;
 private:
  base::ScopedObservation<GlobalBrowserCollection, BrowserCollectionObserver> observation_{this};
};
auto& Decorator() {
  static base::NoDestructor<base::RepeatingCallback<bool(BrowserWindowInterface*)>> callback;
  return *callback;
}
Registry& Windows() { static base::NoDestructor<Registry> registry; return *registry; }
std::shared_ptr<Window> Find(const BrowserWindowInterface* browser) {
  if (!browser) return nullptr;
  const auto found = Windows().windows.find(browser);
  return found == Windows().windows.end() ? nullptr : found->second;
}
BrowserWindowInterface* BrowserFor(content::WebContents* contents) {
  auto* tab = contents ? tabs::TabInterface::MaybeGetFromContents(contents) : nullptr;
  return tab ? tab->GetBrowserWindowInterface() : nullptr;
}
bool Regular(Profile* profile) {
  return profile && profile->IsRegularProfile() && !profile->IsOffTheRecord() &&
      profile == profile->GetOriginalProfile() && !aux::IsProfileCookieRestorePending(profile);
}
bool Current(const std::shared_ptr<Window>& window) {
  if (!window || !window->browser || !Regular(window->profile.get()) ||
      window->browser->GetProfile() != window->profile.get() ||
      !window->roots || !window->roots->Revalidate() ||
      aux::GetProfileId(window->profile.get()) != window->profile_id ||
      aux::GetProfileCookieBindingEpoch(window->profile.get()) != window->epoch) return false;
  const auto native = aux::peer::InspectNativeBrowserShutdown();
  return window->generation && !native.wrong_process && !native.admission_closed &&
      !native.sequence_uncertain && native.admitted_generation == window->generation;
}
bool BusyBrowser(BrowserWindowInterface* browser) {
  const auto* init = browser ? BrowserInitState::From(browser) : nullptr;
  const auto* unload = browser ? UnloadController::From(browser) : nullptr;
  return !browser || !init || init->is_aux_profile_switch_cache() || !unload ||
      unload->is_attempting_to_close_browser() || unload->is_delete_scheduled();
}
bool AgentOwned(content::WebContents* contents) {
  auto* tab = contents ? tabs::TabInterface::MaybeGetFromContents(contents) : nullptr;
  if (!tab) return true;
  const auto* identity = aux::PageIdentity::FromWebContents(contents);
  if (identity && identity->runtime_owned()) return true;
  auto* actor_controller = actor::ui::ActorUiTabController::Get(tab->GetUnownedUserDataHost());
  return actor_controller && !actor_controller->IsColdForAuxProfileSwitch();
}
bool Protected(content::WebContents* contents, bool moving = false) {
  if (!contents || AgentOwned(contents) || (moving && contents->IsLoading()) ||
      contents->IsCurrentlyAudible() || contents->IsBeingCaptured() ||
      (!moving && contents->NeedToFireBeforeUnloadOrUnloadEvents())) return true;
  auto* tab = tabs::TabInterface::MaybeGetFromContents(contents);
  if (!tab || tab->IsBlocked() || tab->IsSplit()) return true;
  if (content::DevToolsAgentHost::HasFor(contents) &&
      content::DevToolsAgentHost::GetOrCreateFor(contents)->IsAttached()) return true;
  const auto capture = MediaCaptureDevicesDispatcher::GetInstance()->GetMediaStreamCaptureIndicator();
  if (capture->IsCapturingUserMedia(contents) || capture->IsBeingMirrored(contents) ||
      capture->IsCapturingTab(contents) || capture->IsCapturingWindow(contents) ||
      capture->IsCapturingDisplay(contents)) return true;
  auto* profile = Profile::FromBrowserContext(contents->GetBrowserContext());
  return !Regular(profile) || profile->GetDownloadManager()->InProgressCount() != 0;
}
bool SafeUrl(const GURL& url) {
  return url.is_valid() && url.SchemeIsHTTPOrHTTPS() && !url.has_username() &&
      !url.has_password() && url.spec().size() <= 16384;
}
OpenResult Open(BrowserWindowInterface* source, content::RenderFrameHost* frame,
                const GURL& url, Kind kind) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (BusyBrowser(source) || !Regular(source->GetProfile()) || !frame || (!SafeUrl(url) && !(kind == Kind::kQuick && url.is_empty())))
    return {.error = "A regular active profile and HTTP(S) link are required"};
  EnsureNativePreviewControls();
  if (!Decorator()) return {.error = "Native preview controls are unavailable"};
  auto* contents = source->GetTabStripModel()->GetActiveWebContents();
  if (!contents || !frame->IsActive() || content::WebContents::FromRenderFrameHost(frame) != contents ||
      frame->GetBrowserContext() != source->GetProfile() || AgentOwned(contents))
    return {.error = "The source document is unavailable or controlled by active work"};
  auto document = frame->GetWeakDocumentPtr();
  auto source_weak = source->GetWeakPtr();
  auto window = std::make_shared<Window>();
  window->kind = kind; window->source = source_weak;
  window->profile = source->GetProfile()->GetWeakPtr();
  window->roots = aux::peer::CaptureActualChromiumBrowserRoots();
  const auto native = aux::peer::InspectNativeBrowserShutdown();
  if (!window->roots || !window->roots->Revalidate() || !native.admitted_generation ||
      native.wrong_process || native.admission_closed || native.sequence_uncertain)
    return {.error = "Browser startup authority is unavailable"};
  window->generation = native.admitted_generation;
  window->profile_id = aux::GetProfileId(source->GetProfile());
  window->epoch = aux::GetProfileCookieBindingEpoch(source->GetProfile());
  auto* screen = display::Screen::Get();
  if (!screen || window->epoch.empty()) return {.error = "Preview window is unavailable"};
  const auto area = screen->GetDisplayNearestWindow(source->GetWindow()->GetNativeWindow()).work_area();
  gfx::Rect bounds(0, 0, std::min(kind == Kind::kPeek ? 900 : 760, area.width()),
                   std::min(kind == Kind::kPeek ? 650 : 560, area.height()));
  bounds.set_origin(gfx::Point(area.x() + (area.width() - bounds.width()) / 2,
                              area.y() + (area.height() - bounds.height()) / 3));
  BrowserWindowCreateParams params(BrowserWindowInterface::TYPE_POPUP, source->GetProfile(), true);
  params.initial_bounds = bounds;
  params.omit_from_session_restore = true;
  params.should_trigger_session_restore = false;
  params.is_trusted_source = false;  // Always retain the actual native origin UI.
  auto* browser = CreateBrowserWindow(std::move(params));
  if (!browser) return {.error = "Could not create a native preview window"};
  window->browser = browser->GetWeakPtr();
  Windows().windows[browser] = window;
  // Creation can run native callbacks. Recheck the original document/owner
  // before starting any network request; no speculative loads were scheduled.
  if (!Current(window) || !source_weak || !document.AsRenderFrameHostIfValid() ||
      source_weak->GetProfile() != window->profile.get()) {
    browser->GetWindow()->Close();
    return {.error = "The source profile or document changed"};
  }
  // Insert an actual blank native tab first so its TabInterface/window owner
  // already exists when the target request's navigation throttles are created.
  auto* blank = chrome::AddAndReturnTabAt(browser, GURL("about:blank"), -1, true,
      std::nullopt, false, NavigateParams::WindowAction::kNoAction);
  if (!blank || !window->browser || !Decorator().Run(browser) || !Current(window) ||
      !source_weak || !document.AsRenderFrameHostIfValid() ||
      source_weak->GetProfile() != window->profile.get()) {
    if (window->browser) window->browser->GetWindow()->Close();
    return {.error = "The source or native preview controls became unavailable"};
  }
  if (!url.is_empty()) {
    NavigateParams navigation(browser, url, ui::PAGE_TRANSITION_LINK);
    navigation.disposition = WindowOpenDisposition::CURRENT_TAB;
    navigation.initiator_origin = url::Origin();
    Navigate(&navigation);
    if (!window->browser || !navigation.navigated_or_inserted_contents) {
      if (window->browser) window->browser->GetWindow()->Close();
      return {.error = "Preview navigation was refused"};
    }
  }
  window->initialized = true;
  browser->GetWindow()->Show(); browser->GetWindow()->Activate();
  if (url.is_empty()) chrome::FocusLocationBar(browser);
  return {.browser = browser};
}
base::DictValue Result(bool ok, std::string message = {}) {
  return base::DictValue().Set("ok", ok).Set("error", message);
}
void Move(std::shared_ptr<Window> window, std::string space,
          base::OnceCallback<void(base::DictValue)> done,
          BrowserWindowInterface* target) {
  if (!Current(window) || !window->promoting || BusyBrowser(target) ||
      target->GetType() != BrowserWindowInterface::TYPE_NORMAL ||
      target->GetProfile() != window->profile.get() || Find(target)) {
    window->promoting = false; std::move(done).Run(Result(false, "Destination is unavailable")); return;
  }
  auto* browser = window->browser.get();
  auto* model = browser->GetTabStripModel();
  if (model->count() != 1 || Protected(model->GetActiveWebContents(), true)) {
    window->promoting = false; std::move(done).Run(Result(false, "Finish active preview work before promoting")); return;
  }
  auto* organization = aux::AuxOrganizationWindowController::FromBrowser(target);
  if (!organization || !organization->IsProjectionReady() ||
      (!space.empty() && !organization->SelectSpace(space))) {
    window->promoting = false; std::move(done).Run(Result(false, "Destination Space is unavailable or busy")); return;
  }
  const auto handle = model->GetTabAtIndex(0)->GetHandle();
  auto* contents = model->GetActiveWebContents();
  auto destination = target->GetWeakPtr();
  // Chromium transfers the real TabModel/WebContents and navigation history.
  // The source popup can close synchronously as its final tab leaves.
  chrome::MoveTabsToExistingWindow(browser, target, {0});
  const bool moved = destination && handle.Get() &&
      handle.Get()->GetContents() == contents &&
      handle.Get()->GetBrowserWindowInterface() == destination.get();
  window->promoting = false;
  if (moved) {
    destination->GetWindow()->Show(); destination->GetWindow()->Activate();
    std::move(done).Run(Result(true));
  } else {
    std::move(done).Run(Result(false, "The tab could not be moved; it was not reopened"));
  }
}
}  // namespace
void SetNativeWindowDecorator(base::RepeatingCallback<bool(BrowserWindowInterface*)> callback) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  Decorator() = std::move(callback);
}
base::CallbackListSubscription ObservePresentation(BrowserWindowInterface* browser, base::RepeatingClosure callback) {
  const auto window = Find(browser);
  return window ? window->changes.Add(std::move(callback)) : base::CallbackListSubscription();
}
OpenResult OpenPeek(BrowserWindowInterface* browser, content::RenderFrameHost* frame,
                    const GURL& url, Trigger trigger) {
  if (trigger == Trigger::kOptInLinkClick &&
      (!browser || !browser->GetProfile()->GetPrefs()->FindPreference(kPeekOrdinaryLinksPref) ||
       !browser->GetProfile()->GetPrefs()->GetBoolean(kPeekOrdinaryLinksPref)))
    return {.error = "Ordinary-link Peek is disabled"};
  return Open(browser, frame, url, Kind::kPeek);
}
bool CanOpenQuick(BrowserWindowInterface* browser) {
  if (BusyBrowser(browser) || !Regular(browser->GetProfile())) return false;
  auto* contents = browser->GetTabStripModel()->GetActiveWebContents();
  if (!contents || !contents->GetPrimaryMainFrame() || AgentOwned(contents)) return false;
  const auto roots = aux::peer::CaptureActualChromiumBrowserRoots();
  const auto native = aux::peer::InspectNativeBrowserShutdown();
  return roots && roots->Revalidate() && native.admitted_generation &&
      !native.wrong_process && !native.admission_closed && !native.sequence_uncertain;
}
OpenResult OpenQuick(BrowserWindowInterface* browser, const GURL& url) {
  auto* contents = browser ? browser->GetTabStripModel()->GetActiveWebContents() : nullptr;
  return Open(browser, contents ? contents->GetPrimaryMainFrame() : nullptr,
              url == GURL("about:blank") ? GURL() : url, Kind::kQuick);
}
std::optional<Kind> GetKind(const BrowserWindowInterface* browser) {
  const auto window = Find(browser);
  return window ? std::optional(window->kind) : std::nullopt;
}
bool IsPreviewContents(content::WebContents* contents) {
  return GetKind(BrowserFor(contents)).has_value();
}
bool IsPeekContents(content::WebContents* contents) {
  return GetKind(BrowserFor(contents)) == Kind::kPeek;
}
bool CanClose(BrowserWindowInterface* browser, std::string* reason) {
  const auto window = Find(browser);
  if (!window) return true;
  if (browser->GetTabStripModel()->empty()) return true;
  if (!window->initialized && browser->GetTabStripModel()->count() == 1 &&
      browser->GetTabStripModel()->GetActiveWebContents()->GetVisibleURL() == GURL("about:blank")) return true;
  if (!Current(window) || window->promoting) {
    if (reason) *reason = "Preview owner is changing; try again after it settles";
    return false;
  }
  for (auto* tab : *browser->GetTabStripModel()) {
    if (Protected(tab->GetContents())) {
      if (reason) *reason = "Finish active work, media, downloads or page dialogs before closing";
      return false;
    }
  }
  return true;
}
bool Dismiss(BrowserWindowInterface* browser, std::string* reason) {
  if (!Find(browser) || !CanClose(browser, reason)) return false;
  browser->GetWindow()->Close(); return true;
}
bool Back(BrowserWindowInterface* browser) {
  const auto window = Find(browser);
  auto* contents = browser ? browser->GetTabStripModel()->GetActiveWebContents() : nullptr;
  if (!Current(window) || window->promoting || Protected(contents) ||
      !contents->GetController().CanGoBack()) return false;
  contents->GetController().GoBack(); return true;
}
void Promote(BrowserWindowInterface* browser, BrowserWindowInterface* destination,
             const std::string& space, base::OnceCallback<void(base::DictValue)> done) {
  const auto window = Find(browser);
  if (!Current(window) || window->promoting || browser->GetTabStripModel()->count() != 1 ||
      Protected(browser->GetTabStripModel()->GetActiveWebContents(), true)) {
    std::move(done).Run(Result(false, "Preview is unavailable or has active work")); return;
  }
  window->promoting = true;
  window->changes.Notify();
  if (!Current(window)) {
    window->promoting = false;
    std::move(done).Run(Result(false, "Preview owner changed")); return;
  }
  if (destination) { Move(window, space, std::move(done), destination); return; }
  if (window->source && !BusyBrowser(window->source.get()) &&
      window->source->GetType() == BrowserWindowInterface::TYPE_NORMAL &&
      window->source->GetProfile() == window->profile.get()) {
    Move(window, space, std::move(done), window->source.get()); return;
  }
  profiles::OpenBrowserWindowForProfile(
      base::BindOnce(&Move, window, space, std::move(done)), false, false, false,
      window->profile.get());
}
base::DictValue Presentation(BrowserWindowInterface* browser) {
  const auto window = Find(browser);
  if (!window) return base::DictValue();
  std::string name = "Profile";
  if (window->profile && g_browser_process && g_browser_process->profile_manager()) {
    auto* entry = g_browser_process->profile_manager()->GetProfileAttributesStorage()
        .GetProfileAttributesWithPath(window->profile->GetPath());
    if (entry) name = base::UTF16ToUTF8(entry->GetName());
  }
  auto* contents = browser->GetTabStripModel()->GetActiveWebContents();
  return base::DictValue().Set("mode", window->kind == Kind::kPeek ? "peek" : "quick")
      .Set("profileName", name).Set("restriction", window->restriction)
      .Set("canBack", contents && contents->GetController().CanGoBack())
      .Set("promoting", window->promoting);
}
bool AllowNewContents(content::WebContents* source) {
  if (!IsPeekContents(source)) return true;
  ReportRestriction(source, "Open this preview as a tab before opening another window.");
  return false;
}
void ReportRestriction(content::WebContents* contents, std::string reason) {
  if (const auto window = Find(BrowserFor(contents))) {
    window->restriction = std::move(reason);
    window->changes.Notify();
  }
}
bool CurrentOwner(content::WebContents* contents) { return Current(Find(BrowserFor(contents))); }
}  // namespace aux::preview
