// Copyright 2026 Aux Authors. All rights reserved.
// Owner-supplied service042b14c0..042b3bc4, adapted to Chromium155 public APIs.
#include "chrome/browser/aux/ntp_prerender_service.h"

#include <cstdint>
#include <optional>
#include <utility>

#include "base/callback_list.h"
#include "base/feature_list.h"
#include "base/functional/bind.h"
#include "base/memory/weak_ptr.h"
#include "base/scoped_observation.h"
#include "base/supports_user_data.h"
#include "base/task/single_thread_task_runner.h"
#include "base/time/time.h"
#include "base/timer/timer.h"
#include "chrome/browser/aux/component_bootstrap.h"
#include "chrome/browser/extensions/extension_url_overrides.h"
#include "chrome/browser/preloading/preloading_prefs.h"
#include "chrome/browser/preloading/prerender/prerender_web_contents_delegate.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/profiles/profile_observer.h"
#include "chrome/browser/ui/browser_window/public/browser_collection_observer.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/browser_window/public/profile_browser_collection.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/unload_controller.h"
#include "chrome/common/pref_names.h"
#include "components/prefs/pref_change_registrar.h"
#include "components/prefs/pref_service.h"
#include "content/public/browser/preload_pipeline_info.h"
#include "content/public/browser/preloading.h"
#include "content/public/browser/preloading_trigger_type.h"
#include "content/public/browser/prerender_handle.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/render_widget_host_view.h"
#include "content/public/browser/weak_document_ptr.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/web_contents_observer.h"
#include "extensions/browser/extension_registry.h"
#include "extensions/browser/extension_registry_observer.h"
#include "extensions/common/extension.h"
#include "extensions/common/constants.h"
#include "extensions/common/manifest_handlers/chrome_url_overrides_handler.h"
#include "net/http/http_request_headers.h"
#include "ui/base/page_transition_types.h"
#include "ui/gfx/geometry/rect.h"
#include "url/gurl.h"

namespace aux {
namespace {
BASE_FEATURE(kAuxNtpPrerender, base::FEATURE_ENABLED_BY_DEFAULT);
constexpr char kServiceKey[] = "aux-ntp-prerender";
constexpr char kHandleKey[] = "aux-ntp-prerender-handle";
constexpr auto kScheduleDelay = base::Milliseconds(500);

std::optional<GURL> EligibleOverride(Profile* profile) {
  // Original0529c24 returns persisted BrowserProfileType;04ce584 tests system3.
  if (!profile || !base::FeatureList::IsEnabled(kAuxNtpPrerender) ||
      profile->IsOffTheRecord() || profile->IsGuestSession() ||
      profile->IsSystemProfile()) {
    return std::nullopt;
  }
  const auto* registry = extensions::ExtensionRegistry::Get(profile);
  const auto* extension =
      registry ? registry->enabled_extensions().GetByID(kAgentExtensionId)
               : nullptr;
  if (!extension)
    return std::nullopt;
  GURL url("chrome://newtab/");
  if (!ExtensionUrlOverrides::HandleChromeURLOverride(&url, profile) ||
      !url.SchemeIs(extensions::kExtensionScheme) ||
      url.host() != kAgentExtensionId) {
    return std::nullopt;
  }
  const auto& overrides =
      extensions::URLOverrides::GetChromeURLOverrides(extension);
  const auto found = overrides.find("newtab");
  if (found == overrides.end() || found->second != url)
    return std::nullopt;
  return url;
}

void CopyFallback(content::RenderFrameHost* destination,
                  content::RenderFrameHost* source) {
  if (destination && source && destination->GetView() && source->GetView()) {
    destination->GetView()->TakeFallbackContentFrom(source->GetView());
  }
}

// Original042b3870 destructor and042b39b8 RFH-change callback. Keep the real
// prerender handle alive after Take until its adopted WebContents is destroyed.
class ActivationHandle final : public base::SupportsUserData::Data,
                               public content::WebContentsObserver {
 public:
  ActivationHandle(content::WebContents* contents,
                   std::unique_ptr<content::PrerenderHandle> handle,
                   content::RenderFrameHost* candidate,
                   content::RenderFrameHost* source)
      : content::WebContentsObserver(contents),
        handle_(std::move(handle)),
        candidate_(candidate->GetWeakDocumentPtr()),
        source_(source ? source->GetWeakDocumentPtr()
                       : content::WeakDocumentPtr()) {}
  ~ActivationHandle() override = default;
  bool Matches(const GURL& url) const {
    return handle_ && handle_->GetInitialPrerenderingUrl() == url;
  }
  bool BackgroundReady(content::WebContents* contents) const {
    auto* candidate = candidate_.AsRenderFrameHostIfValid();
    if (!candidate || !contents || !handle_) return false;
    auto* primary = contents->GetPrimaryMainFrame();
    // Original042b2454: current candidate, or loading/ready real handle while
    // the adopted WebContents primary document still has an empty URL.
    return candidate == primary ||
           (handle_->IsValid() && contents->GetLastCommittedURL().is_empty());
  }
  void RenderFrameHostChanged(content::RenderFrameHost*,
                              content::RenderFrameHost* new_host) override {
    if (new_host != candidate_.AsRenderFrameHostIfValid())
      return;
    CopyFallback(new_host, source_.AsRenderFrameHostIfValid());
    source_ = content::WeakDocumentPtr();
  }

 private:
  std::unique_ptr<content::PrerenderHandle> handle_;
  content::WeakDocumentPtr candidate_;
  content::WeakDocumentPtr source_;
};

// This hidden WebContents is both the initiator and the prerender owner.
// Chromium's new-tab delegate assumes a separate initiator and NOTREACHEDs
// here. Apply the same real profile preference check as BrowserWebContentsDelegate.
class NtpPrerenderDelegate final : public PrerenderWebContentsDelegateImpl {
 public:
  content::PreloadingEligibility IsPrerender2Supported(
      content::WebContents& contents,
      content::PreloadingTriggerType trigger_type) override {
    auto* profile = Profile::FromBrowserContext(contents.GetBrowserContext());
    return prefetch::IsSomePreloadingEnabled(*profile->GetPrefs());
  }
};

class NtpPrerenderService final : public base::SupportsUserData::Data,
                                  public ProfileObserver,
                                  public BrowserCollectionObserver,
                                  public extensions::ExtensionRegistryObserver,
                                  public content::PrerenderHandle::Observer {
 public:
  explicit NtpPrerenderService(Profile* profile)
      : profile_(profile->GetWeakPtr()) {
    profile_observation_.Observe(profile);
    auto* registry = extensions::ExtensionRegistry::Get(profile);
    extension_observation_.Observe(registry);
    profile->GetPrefs()->SetBoolean("aux.account_password_extension_available",
        registry->enabled_extensions().Contains(kAgentExtensionId));
    browser_observation_.Observe(
        ProfileBrowserCollection::GetForProfile(profile));
    preferences_.Init(profile->GetPrefs());
    // Preloading follows actual browser preferences, independently of the
    // excluded built-in Vault product.
    for (const char* key :
         {"extensions.chrome_url_overrides", prefs::kNetworkPredictionOptions,
          prefs::kBrowserColorScheme}) {
      if (profile->GetPrefs()->FindPreference(key)) {
        preferences_.Add(
            key, base::BindRepeating(&NtpPrerenderService::PreferenceChanged,
                                     weak_.GetWeakPtr()));
      }
    }
  }
  ~NtpPrerenderService() override { Reset(); }
  void SetEnabled(bool enabled) {
    enabled_ = enabled;
    if (!enabled) {
      timer_.Stop();
      Reset();
    }
  }
  void Schedule(BrowserWindowInterface* browser, base::TimeDelta delay) {
    if (!enabled_ || !profile_ || !browser ||
        browser->GetProfile() != profile_.get() ||
        browser->GetType() != BrowserWindowInterface::TYPE_NORMAL ||
        browser->IsDeleteScheduled())
      return;
    const auto* unload = UnloadController::From(browser);
    if (!unload || unload->is_attempting_to_close_browser())
      return;
    if (source_.get() != browser) {
      source_ = browser->GetWeakPtr();
      close_subscription_ =
          browser->RegisterBrowserDidClose(base::BindRepeating(
              &NtpPrerenderService::SourceClosed, weak_.GetWeakPtr()));
    }
    if (contents_ || !EligibleOverride(profile_.get()))
      return;
    timer_.Start(
        FROM_HERE, delay,
        base::BindOnce(&NtpPrerenderService::Start, weak_.GetWeakPtr()));
  }
  std::unique_ptr<content::WebContents> Take(BrowserWindowInterface* browser,
                                             const GURL& requested) {
    if (!enabled_ || !profile_ || !browser ||
        browser->GetProfile() != profile_.get() ||
        requested != GURL("chrome://newtab/"))
      return nullptr;
    auto* active = browser->GetTabStripModel()->GetActiveWebContents();
    if (contents_ && (prerender_source_.get() != browser ||
                      (active && active->GetContainerBounds().size() != size_)))
      Reset();
    const auto current = EligibleOverride(profile_.get());
    content::RenderFrameHost* candidate = nullptr;
    if (contents_ && handle_ && handle_->IsValid() && current &&
        *current == url_) {
      contents_->ForEachRenderFrameHost([&](content::RenderFrameHost* frame) {
        if (!candidate && !frame->GetParentOrOuterDocumentOrEmbedder() &&
            frame->IsInLifecycleState(
                content::RenderFrameHost::LifecycleState::kPrerendering) &&
            frame->GetLastCommittedURL() == url_ && frame->IsRenderFrameLive())
          candidate = frame;
      });
    }
    if (!candidate) {
      Reset();
      Schedule(browser, kScheduleDelay);
      return nullptr;
    }
    auto* source_frame = active ? active->GetPrimaryMainFrame() : nullptr;
    CopyFallback(contents_->GetPrimaryMainFrame(), source_frame);
    CopyFallback(candidate, source_frame);
    handle_->RemoveObserver(this);
    contents_->SetUserData(kHandleKey, std::make_unique<ActivationHandle>(
                                           contents_.get(), std::move(handle_),
                                           candidate, source_frame));
    delegate_.PrerenderWebContentsReleased(contents_.get());
    contents_->SetDelegate(nullptr);
    contents_->WasShown();
    auto result = std::move(contents_);
    url_ = GURL();
    Schedule(browser, base::TimeDelta());
    return result;
  }
  void OnExtensionLoaded(content::BrowserContext*,
                         const extensions::Extension* extension) override {
    if (profile_ && extension->id() == kAgentExtensionId) {
      profile_->GetPrefs()->SetBoolean("aux.account_password_extension_available", true);
      PreferenceChanged();
    }
  }
  void OnExtensionUnloaded(content::BrowserContext*,
                           const extensions::Extension* extension,
                           extensions::UnloadedExtensionReason) override {
    if (profile_ && extension->id() == kAgentExtensionId) {
      profile_->GetPrefs()->SetBoolean("aux.account_password_extension_available", false);
      PreferenceChanged();
    }
  }
  void OnBrowserActivated(BrowserWindowInterface* browser) override {
    Schedule(browser, kScheduleDelay);
  }
  void OnProfileWillBeDestroyed(Profile*) override {
    SetEnabled(false);
    preferences_.RemoveAll();
    browser_observation_.Reset();
    profile_observation_.Reset();
    extension_observation_.Reset();
    close_subscription_ = {};
    source_.reset();
    profile_.reset();
  }
  void OnLifecycleStateChanged(
      content::PrerenderLifecycleStatus status) override {
    if (status == content::PrerenderLifecycleStatus::kHTTPSuccessResponse)
      return;
    // Do not destroy a handle while its notification stack is active.
    base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(
        FROM_HERE, base::BindOnce(&NtpPrerenderService::ResetIfCurrent,
                                  weak_.GetWeakPtr(), generation_));
  }

 private:
  void Start() {
    if (!enabled_ || !profile_ || !source_ || source_->IsDeleteScheduled() ||
        contents_)
      return;
    const auto* unload = UnloadController::From(source_.get());
    const auto url = EligibleOverride(profile_.get());
    if (!url || !unload || unload->is_attempting_to_close_browser() ||
        prefetch::GetPreloadPagesState(*profile_->GetPrefs()) ==
            prefetch::PreloadPagesState::kNoPreloading)
      return;
    url_ = *url;
    prerender_source_ = source_;
    content::WebContents::CreateParams params(profile_.get());
    params.initially_hidden = true;
    auto* active = source_->GetTabStripModel()->GetActiveWebContents();
    if (active)
      params.context = active->GetNativeView();
    contents_ = content::WebContents::Create(params);
    delegate_.PrerenderWebContentsCreated(contents_.get());
    contents_->SetDelegate(&delegate_);
    if (active) {
      size_ = active->GetContainerBounds().size();
      contents_->Resize(gfx::Rect(size_));
    }
    handle_ = contents_->StartPrerendering(
        url_, content::PreloadingTriggerType::kEmbedder, "AuxNewTabPage",
        net::HttpRequestHeaders(), std::nullopt, ui::PAGE_TRANSITION_TYPED,
        /*should_warm_up_compositor=*/true, /*should_prepare_paint_tree=*/true,
        content::PreloadingHoldbackStatus::kUnspecified,
        content::PreloadPipelineInfo::Create(
            content::PreloadingType::kPrerender),
        /*preloading_attempt=*/nullptr, {}, {}, /*allow_reuse=*/false);
    if (!handle_) {
      Reset();
      return;
    }
    handle_->AddObserver(this);
  }
  void ResetIfCurrent(uint64_t generation) {
    if (generation == generation_)
      Reset();
  }
  void Reset() {
    ++generation_;
    if (handle_)
      handle_->RemoveObserver(this);
    handle_.reset();
    if (contents_)
      contents_->SetDelegate(nullptr);
    contents_.reset();
    url_ = GURL();
    size_ = gfx::Size();
    prerender_source_.reset();
  }
  void PreferenceChanged() {
    timer_.Stop();
    Reset();
    if (source_)
      Schedule(source_.get(), kScheduleDelay);
  }
  void SourceClosed(BrowserWindowInterface* browser) {
    if (source_.get() != browser)
      return;
    timer_.Stop();
    Reset();
    source_.reset();
    close_subscription_ = {};
  }
  base::WeakPtr<Profile> profile_;
  base::WeakPtr<BrowserWindowInterface> source_;
  base::WeakPtr<BrowserWindowInterface> prerender_source_;
  uint64_t generation_ = 0;
  bool enabled_ = false;
  base::OneShotTimer timer_;
  PrefChangeRegistrar preferences_;
  base::CallbackListSubscription close_subscription_;
  NtpPrerenderDelegate delegate_;
  std::unique_ptr<content::WebContents> contents_;
  std::unique_ptr<content::PrerenderHandle> handle_;
  GURL url_;
  gfx::Size size_;
  base::ScopedObservation<Profile, ProfileObserver> profile_observation_{this};
  base::ScopedObservation<extensions::ExtensionRegistry,
                         extensions::ExtensionRegistryObserver>
      extension_observation_{this};
  base::ScopedObservation<ProfileBrowserCollection, BrowserCollectionObserver>
      browser_observation_{this};
  base::WeakPtrFactory<NtpPrerenderService> weak_{this};
};

NtpPrerenderService* GetService(Profile* profile) {
  if (!profile || profile->IsOffTheRecord() || profile->IsGuestSession() ||
      profile->IsSystemProfile())
    return nullptr;
  auto* service =
      static_cast<NtpPrerenderService*>(profile->GetUserData(kServiceKey));
  if (!service) {
    auto owned = std::make_unique<NtpPrerenderService>(profile);
    service = owned.get();
    profile->SetUserData(kServiceKey, std::move(owned));
  }
  return service;
}
}  // namespace

bool IsEligibleNtpPrerenderUrl(Profile* profile, const GURL& url) {
  const auto eligible = EligibleOverride(profile);
  return eligible && *eligible == url;
}
bool IsNtpPrerenderFeatureEnabled() {
  return base::FeatureList::IsEnabled(kAuxNtpPrerender);
}
bool IsNtpPrerenderContents(content::WebContents* contents) {
  if (!contents) return false;
  const auto eligible = EligibleOverride(
      Profile::FromBrowserContext(contents->GetBrowserContext()));
  if (!eligible) return false;
  auto* transferred = static_cast<ActivationHandle*>(contents->GetUserData(kHandleKey));
  return contents->GetVisibleURL() == GURL("chrome://newtab/") ||
         contents->GetVisibleURL() == *eligible ||
         (transferred && transferred->Matches(*eligible) &&
          contents->GetVisibleURL().is_empty() &&
          contents->GetLastCommittedURL().is_empty() &&
          transferred->BackgroundReady(contents));
}
bool IsNtpPrerenderBackgroundReady(content::WebContents* contents) {
  if (!IsNtpPrerenderContents(contents)) return false;
  auto* transferred = static_cast<ActivationHandle*>(contents->GetUserData(kHandleKey));
  return transferred && transferred->BackgroundReady(contents);
}
void SetNtpPrerenderEnabled(Profile* profile, bool enabled) {
  if (auto* service = GetService(profile))
    service->SetEnabled(enabled);
}
void ScheduleNtpPrerender(BrowserWindowInterface* browser) {
  if (browser)
    if (auto* service = GetService(browser->GetProfile()))
      service->Schedule(browser, kScheduleDelay);
}
std::unique_ptr<content::WebContents> TakePrerenderedNewTab(
    BrowserWindowInterface* browser,
    const GURL& requested_url) {
  if (browser)
    if (auto* service = GetService(browser->GetProfile()))
      return service->Take(browser, requested_url);
  return nullptr;
}
}  // namespace aux
