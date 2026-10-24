// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/aux_preview/aux_preview_ingress.h"
#include <optional>
#include <memory>
#include <string>
#include <utility>
#include "base/functional/bind.h"
#include "base/memory/weak_ptr.h"
#include "base/task/single_thread_task_runner.h"
#include "base/time/time.h"
#include "base/strings/utf_string_conversions.h"
#include "chrome/browser/aux/AuxBrowserPrivateRoots.h"
#include "chrome/browser/aux/AuxSelectedStateHome.h"
#include "chrome/browser/aux/profile_identity.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/aux_preview/aux_preview_controller.h"
#include "chrome/browser/ui/browser_window.h"
#include "chrome/browser/ui/simple_message_box.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "components/prefs/pref_service.h"
#include "components/tabs/public/tab_interface.h"
#include "content/public/browser/navigation_handle.h"
#include "content/public/browser/global_routing_id.h"
#include "content/public/browser/page_navigator.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/weak_document_ptr.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/web_contents_observer.h"
#include "content/public/browser/web_contents_user_data.h"
#include "third_party/blink/public/common/input/web_mouse_event.h"
#include "ui/base/page_transition_types.h"
#include "ui/base/window_open_disposition.h"
namespace aux::preview {
namespace {
BrowserWindowInterface* WindowFor(content::WebContents* contents) {
  auto* tab = contents ? tabs::TabInterface::MaybeGetFromContents(contents) : nullptr;
  return tab ? tab->GetBrowserWindowInterface() : nullptr;
}
struct Intent {
  content::WeakDocumentPtr document;
  base::WeakPtr<BrowserWindowInterface> browser;
  base::WeakPtr<Profile> profile;
  std::shared_ptr<const peer::BrowserPrivateRoots> roots;
  std::string epoch;
  uint64_t generation;
  Trigger trigger;
  std::optional<GURL> actual_href;
};
bool Valid(const Intent& intent) {
  const auto authority = peer::InspectNativeBrowserShutdown();
  return intent.browser && intent.profile && intent.document.AsRenderFrameHostIfValid() &&
      intent.browser->GetProfile() == intent.profile.get() &&
      GetProfileCookieBindingEpoch(intent.profile.get()) == intent.epoch &&
      !IsProfileCookieRestorePending(intent.profile.get()) && intent.roots && intent.roots->Revalidate() &&
      authority.admitted_generation == intent.generation && intent.generation &&
      !authority.admission_closed && !authority.sequence_uncertain && !authority.wrong_process;
}
void OpenIntent(Intent intent, GURL url) {
  if (!Valid(intent)) return;
  auto* frame = intent.document.AsRenderFrameHostIfValid();
  auto result = OpenPeek(intent.browser.get(), frame, url, intent.trigger);
  // A rejected request never falls back to silently navigating the original
  // tab. Explicit context/menu retry is available after the owner settles.
  if (!result.browser && Valid(intent)) {
    auto* live_frame = intent.document.AsRenderFrameHostIfValid();
    auto* source = live_frame ? content::WebContents::FromRenderFrameHost(live_frame) : nullptr;
    // The click was consumed on an ordinary page. Report refusal only while
    // that exact source document is still the selected view of this owner;
    // never show a late warning over a different tab, document or profile.
    if (!source || source->GetPrimaryMainFrame() != live_frame ||
        intent.browser->GetTabStripModel()->GetActiveWebContents() != source)
      return;
    const std::u16string reason = result.error.empty()
        ? u"The preview could not be opened."
        : base::UTF8ToUTF16(result.error);
    chrome::ShowWarningMessageBoxAsync(
        intent.browser->GetWindow()->GetNativeWindow(), u"Aux could not open Peek",
        reason + u" Your original page has not changed.");
  }
}
class Ingress final : public content::WebContentsObserver,
                      public content::WebContentsUserData<Ingress> {
 public:
  explicit Ingress(content::WebContents* contents)
      : WebContentsObserver(contents), WebContentsUserData<Ingress>(*contents) {}
  void PrimaryPageChanged(content::Page&) override { intent_.reset(); }
  void DidGetUserInteraction(const blink::WebInputEvent& event) override {
    intent_.reset();
    if (event.GetType() != blink::WebInputEvent::Type::kMouseDown ||
        IsPreviewContents(web_contents())) return;
    const auto& mouse = static_cast<const blink::WebMouseEvent&>(event);
    if (mouse.button != blink::WebPointerProperties::Button::kLeft) return;
    const int modifiers = event.GetModifiers() & blink::WebInputEvent::kKeyModifiers;
    if (modifiers != 0 && modifiers != blink::WebInputEvent::kAltKey) return;
    auto* browser = WindowFor(web_contents());
    auto* profile = browser ? browser->GetProfile() : nullptr;
    auto* frame = web_contents()->GetPrimaryMainFrame();
    if (!browser || !frame || !profile->IsRegularProfile() || profile->IsOffTheRecord() ||
        browser->GetTabStripModel()->GetActiveWebContents() != web_contents() ||
        !CanOpenQuick(browser)) return;
    const bool opted_in = profile->GetPrefs()->FindPreference(kPeekOrdinaryLinksPref) &&
        profile->GetPrefs()->GetBoolean(kPeekOrdinaryLinksPref);
    if (!modifiers && !opted_in) return;
    intent_.emplace(Intent{frame->GetWeakDocumentPtr(), browser->GetWeakPtr(), profile->GetWeakPtr(),
      peer::CaptureActualChromiumBrowserRoots(), GetProfileCookieBindingEpoch(profile),
      peer::InspectNativeBrowserShutdown().admitted_generation,
      modifiers ? Trigger::kModifierClick : Trigger::kOptInLinkClick, std::nullopt});
    expires_ = base::TimeTicks::Now() + base::Seconds(1);
  }
  void ConfirmLink(content::RenderFrameHost* frame, const GURL& actual_href) {
    // Called only after the existing native input router consumed its one-use
    // nonce and checked the exact document/href receipt against its frame.
    if (intent_ && base::TimeTicks::Now() <= expires_ && Valid(*intent_) &&
        frame == intent_->document.AsRenderFrameHostIfValid())
      intent_->actual_href = actual_href;
  }
  bool Consume(content::RenderFrameHost* frame, const GURL& url, bool modifier_only = false) {
    if (!intent_) return false;
    auto intent = std::move(*intent_); intent_.reset();
    if ((modifier_only && intent.trigger != Trigger::kModifierClick) ||
        base::TimeTicks::Now() > expires_ || !Valid(intent) ||
        frame != intent.document.AsRenderFrameHostIfValid() ||
        !intent.actual_href || *intent.actual_href != url ||
        !url.SchemeIsHTTPOrHTTPS() || url.has_username() || url.has_password()) return false;
    // Preserve anchors within this document and ordinary explicit modified
    // navigation (Cmd-click/middle-click) which never set an intent above.
    if (url.EqualsIgnoringRef(web_contents()->GetLastCommittedURL())) return false;
    base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE,
        base::BindOnce(&OpenIntent, std::move(intent), url));
    return true;
  }
 private:
  friend class content::WebContentsUserData<Ingress>;
  std::optional<Intent> intent_;
  base::TimeTicks expires_;
  WEB_CONTENTS_USER_DATA_KEY_DECL();
};
WEB_CONTENTS_USER_DATA_KEY_IMPL(Ingress);
}  // namespace
void AttachIngress(content::WebContents* contents) { Ingress::CreateForWebContents(contents); }
void TrustedMouseDownLink(content::RenderFrameHost* frame, const GURL& actual_href) {
  auto* contents = frame ? content::WebContents::FromRenderFrameHost(frame) : nullptr;
  if (auto* ingress = contents ? Ingress::FromWebContents(contents) : nullptr)
    ingress->ConfirmLink(frame, actual_href);
}
bool MaybePeekNavigation(content::NavigationHandle* handle) {
  if (!handle || !handle->IsInPrimaryMainFrame() || !handle->IsRendererInitiated() ||
      !handle->HasUserGesture() || handle->IsPost() ||
      !ui::PageTransitionCoreTypeIs(handle->GetPageTransition(), ui::PAGE_TRANSITION_LINK) ||
      !handle->GetInitiatorFrameToken()) return false;
  auto* source = handle->GetWebContents();
  auto* ingress = Ingress::FromWebContents(source);
  auto* frame = content::RenderFrameHost::FromFrameToken(
      {handle->GetInitiatorProcessId(), *handle->GetInitiatorFrameToken()});
  return ingress && ingress->Consume(frame, handle->GetURL());
}
bool MaybePeekOpenURL(content::WebContents* source, const content::OpenURLParams& params) {
  if (!source || !params.is_renderer_initiated || !params.user_gesture || params.post_data ||
      params.started_from_context_menu || !params.initiator_frame_token ||
      !ui::PageTransitionCoreTypeIs(params.transition, ui::PAGE_TRANSITION_LINK) ||
      (params.disposition != WindowOpenDisposition::CURRENT_TAB &&
       params.disposition != WindowOpenDisposition::NEW_FOREGROUND_TAB &&
       params.disposition != WindowOpenDisposition::SAVE_TO_DISK)) return false;
  auto* ingress = Ingress::FromWebContents(source);
  auto* frame = content::RenderFrameHost::FromFrameToken(
      {params.initiator_process_id, *params.initiator_frame_token});
  return ingress && ingress->Consume(frame, params.url);
}
bool MaybePeekDownload(content::WebContents* source, const GURL& url) {
  auto* ingress = source ? Ingress::FromWebContents(source) : nullptr;
  return ingress && ingress->Consume(source->GetPrimaryMainFrame(), url, true);
}
bool AllowDownload(content::WebContents* contents) {
  if (!IsPeekContents(contents)) return true;
  ReportRestriction(contents, "Open this preview as a full tab before downloading.");
  return false;
}
bool AllowExternalProtocol(content::WebContents* contents) {
  if (!IsPeekContents(contents)) return true;
  ReportRestriction(contents, "Open this preview as a full tab before opening another app.");
  return false;
}
bool AllowCloseContents(content::WebContents* contents) {
  auto* browser = WindowFor(contents);
  if (!GetKind(browser)) return true;
  std::string reason;
  if (CanClose(browser, &reason)) return true;
  ReportRestriction(contents, reason); return false;
}
}  // namespace aux::preview
