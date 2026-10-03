#include <set>
#include "chrome/browser/ui/aux/download_naming.h"
// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "chrome/browser/ui/aux/shell_events.h"

#include <string>
#include <map>
#include <optional>
#include <set>
#include <utility>
#include <vector>

#include "base/functional/bind.h"
#include "base/json/json_reader.h"
#include "base/json/json_writer.h"
#include "base/logging.h"
#include "base/memory/raw_ptr.h"
#include "base/memory/weak_ptr.h"
#include "base/strings/string_number_conversions.h"
#include "base/strings/utf_string_conversions.h"
#include "base/task/sequenced_task_runner.h"
#include "base/time/time.h"
#include "base/timer/timer.h"
#include "base/values.h"
#include "base/uuid.h"
#include "chrome/browser/download/download_prefs.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/content_settings/host_content_settings_map_factory.h"
#include "chrome/browser/notifications/notification_display_service.h"
#include "chrome/browser/notifications/notification_display_service_impl.h"
#include "chrome/browser/notifications/notification_display_service_factory.h"
#include "chrome/browser/notifications/notification_handler.h"
#include "chrome/browser/ui/aux/organization_store.h"
#include "chrome/browser/ui/aux/health_recorder.h"
#include "chrome/browser/ui/aux/page_identity.h"
#include "chrome/browser/ui/aux/readable_capture.h"
#include "chrome/browser/ui/aux/runtime_host.h"
#include "chrome/browser/ui/aux/tab_catalog.h"
#include "chrome/browser/ui/login/login_tab_helper.h"
#include "chrome/browser/ssl/https_only_mode_tab_helper.h"
#include "components/security_interstitials/content/https_only_mode_blocking_page.h"
#include "components/security_interstitials/content/security_interstitial_tab_helper.h"
#include "components/security_interstitials/content/ssl_blocking_page.h"
#include "components/download/public/common/download_item.h"
#include "components/prefs/pref_service.h"
#include "components/content_settings/core/browser/host_content_settings_map.h"
#include "components/content_settings/core/common/content_settings_types.h"
#include "components/sessions/content/session_tab_helper.h"
#include "content/public/browser/browser_context.h"
#include "content/public/browser/download_manager.h"
#include "content/public/browser/navigation_handle.h"
#include "content/public/browser/media_player_id.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/web_contents_observer.h"
#include "content/public/browser/web_contents_user_data.h"
#include "chrome/common/chrome_isolated_world_ids.h"
#include "net/base/net_errors.h"
#include "crypto/hash.h"
#include "third_party/blink/public/common/input/web_input_event.h"
#include "ui/base/models/image_model.h"
#include "ui/base/page_transition_types.h"
#include "ui/message_center/public/cpp/notification.h"
#include "ui/message_center/public/cpp/notifier_id.h"
#include "url/origin.h"

namespace aux {
namespace {

const char kRouterKey = 0;
const char kDownloadsKey = 0;
const char kNotificationsKey = 0;
const char kRunAttentionKey = 0;
const char kPasswordOfferKey = 0;
constexpr int kPageChangeWorld = ISOLATED_WORLD_ID_AUX_PAGE_CHANGE;
constexpr size_t kPageChangeMaxTextBytes = 64 * 1024;
constexpr char16_t kPageChangeScript[] = uR"JS((() => {
  if (document.visibilityState !== 'visible' || document.readyState === 'loading') return null;
  if (document.querySelector('input[type="password"], input[autocomplete~="one-time-code"], input[autocomplete^="cc-"], input[autocomplete="current-password"], input[autocomplete="new-password"], [contenteditable="true"], [role="textbox"], meta[http-equiv="Cache-Control"][content*="no-store" i], form[action*="login" i], form[action*="signin" i], form[action*="checkout" i], form[action*="payment" i]')) return null;
  const source = document.querySelector('article') || document.querySelector('main') || document.body;
  if (!source || source.querySelectorAll('*').length > 10000) return null;
  const walker = document.createTreeWalker(source, NodeFilter.SHOW_TEXT);
  let units = 0;
  while (walker.nextNode()) {
    units += walker.currentNode.textContent.length;
    if (units > 65536) return null;
  }
  const copy = source.cloneNode(true);
  copy.querySelectorAll('script,style,form,input,textarea,button,select,iframe,object,embed,nav,aside,footer,header,[hidden],[aria-hidden="true"]').forEach(node => node.remove());
  const text = (copy.textContent || '').replace(/\s+/g, ' ').trim();
  return text && text.length <= 65536 ? text : null;
})())JS";

class PasswordOfferData final : public base::SupportsUserData::Data {
 public:
  PasswordOfferData(std::string origin, std::string id)
      : origin(std::move(origin)), id(std::move(id)) {}

  const std::string origin;
  const std::string id;
};

class Router : public base::SupportsUserData::Data {
 public:
  static Router* Get(Profile* profile) {
    return profile ? static_cast<Router*>(profile->GetUserData(&kRouterKey))
                   : nullptr;
  }
  static Router& GetOrCreate(Profile* profile) {
    if (auto* existing = Get(profile)) {
      return *existing;
    }
    auto created = std::make_unique<Router>();
    Router* raw = created.get();
    profile->SetUserData(&kRouterKey, std::move(created));
    return *raw;
  }

  base::RepeatingCallbackList<void(const std::string&, const std::string&)>
      observers;
};

void EmitDict(Profile* profile, std::string_view name, base::DictValue payload) {
  auto json = base::WriteJson(payload);
  if (json) {
    EmitShellEvent(profile, name, std::move(*json));
  }
}

std::string PageId(content::WebContents* contents) {
  Profile* profile = Profile::FromBrowserContext(contents->GetBrowserContext());
  return profile ? PageIdentity::GetOrCreate(profile, contents) : std::string();
}

class PageSignals : public content::WebContentsObserver,
                    public content::WebContentsUserData<PageSignals> {
 public:
  const base::DictValue* navigation_error() const {
    return navigation_error_ ? &*navigation_error_ : nullptr;
  }

  bool has_video() const { return !video_players_.empty(); }

  ~PageSignals() override {
    if (!page_id_.empty()) {
      base::DictValue payload;
      payload.Set("pageId", page_id_);
      payload.Set("muted", false);
      payload.Set("audible", false);
      payload.Set("video", false);
      payload.Set("pip", false);
      payload.Set("removed", true);
      EmitDict(profile_, "onAudio", std::move(payload));
    }
  }

 private:
  friend class content::WebContentsUserData<PageSignals>;
  explicit PageSignals(content::WebContents* contents)
      : content::WebContentsObserver(contents),
        content::WebContentsUserData<PageSignals>(*contents),
        profile_(Profile::FromBrowserContext(contents->GetBrowserContext())),
        page_id_(PageId(contents)) {
    PublishLoading();
    PublishAudio(contents->IsCurrentlyAudible());
    page_change_timer_.Start(FROM_HERE, base::Seconds(15), this,
                             &PageSignals::ObservePageChange);
  }

  void DidStartLoading() override { PublishLoading(); }
  void DidStopLoading() override { PublishLoading(); }
  void OnAudioStateChanged(bool audible) override { PublishAudio(audible); }
  void DidGetUserInteraction(const blink::WebInputEvent& event) override {
    // Agent input enters through the private DevTools broker and carries the
    // debugger bit. An unmarked interaction on this guest page asks the
    // runtime to hand control to the person. This observer runs before the
    // event is dispatched to the renderer.
    if (!profile_ || profile_->IsOffTheRecord() || page_id_.empty() ||
        (event.GetModifiers() & blink::WebInputEvent::kFromDebugger))
      return;
    const base::TimeTicks now = base::TimeTicks::Now();
    if (!last_physical_takeover_.is_null() &&
        now - last_physical_takeover_ < base::Milliseconds(100))
      return;
    auto* runtime = AuxRuntimeHost::ForProfile(profile_);
    if (!runtime)
      return;
    base::DictValue payload;
    payload.Set("pageId", page_id_);
    if (auto json = base::WriteJson(payload)) {
      last_physical_takeover_ = now;
      runtime->CallInternal("view.takeover", std::move(*json),
                            base::BindOnce([](AuxRuntimeHost::Response response) {
                              if (!response.ok) {
                                LOG(WARNING) << "Aux physical takeover refused: "
                                             << response.error_code;
                                return;
                              }
                              auto result = base::JSONReader::Read(
                                  response.result_json, base::JSON_PARSE_RFC);
                              const base::DictValue* dict =
                                  result ? result->GetIfDict() : nullptr;
                              if (dict && dict->FindBool("accepted").value_or(false)) {
                                LOG(INFO) << "Aux physical takeover accepted";
                              }
                            }));
    }
  }
  void PrimaryMainFrameRenderProcessGone(base::TerminationStatus status) override {
    if (status == base::TERMINATION_STATUS_PROCESS_CRASHED ||
        status == base::TERMINATION_STATUS_ABNORMAL_TERMINATION ||
        status == base::TERMINATION_STATUS_PROCESS_WAS_KILLED)
      RecordPageCrash(profile_);
  }
  void OnRendererUnresponsive(content::RenderProcessHost*) override {
    RecordPageUnresponsive(profile_);
  }
  void DidStartNavigation(content::NavigationHandle* handle) override {
    if (!handle->IsInPrimaryMainFrame() || handle->IsSameDocument()) return;
    web_contents()->RemoveUserData(&kPasswordOfferKey);
    page_change_url_.clear();
    ++navigation_generation_;
    base::SequencedTaskRunner::GetCurrentDefault()->PostTask(
        FROM_HERE,
        base::BindOnce(&PageSignals::PublishAuth, weak_factory_.GetWeakPtr()));
  }
  // LoginTabHelper shows its prompt from its own DidFinishNavigation.
  // Read the prompt after that observer returns.
  void DidFinishNavigation(content::NavigationHandle* handle) override {
    if (handle->IsInPrimaryMainFrame() && handle->IsSameDocument() &&
        handle->HasCommitted() && !page_change_url_.empty() &&
        handle->GetURL().SchemeIsHTTPOrHTTPS() &&
        !handle->GetURL().has_username() &&
        !handle->GetURL().has_password()) {
      page_change_url_ = handle->GetURL().spec();
    }
    if (handle->IsInPrimaryMainFrame() && !handle->IsSameDocument() &&
        handle->HasCommitted()) {
      const GURL& url = handle->GetURL();
      const auto* identity = PageIdentity::FromWebContents(web_contents());
      if (profile_ && !profile_->IsOffTheRecord() && identity && !identity->runtime_owned() &&
          handle->IsRendererInitiated() && handle->HasUserGesture() &&
          ui::PageTransitionCoreTypeIs(handle->GetPageTransition(), ui::PAGE_TRANSITION_LINK) &&
          !handle->IsErrorPage() && handle->GetNetErrorCode() == net::OK &&
          url.SchemeIsHTTPOrHTTPS() && !url.has_username() && !url.has_password()) {
        base::SequencedTaskRunner::GetCurrentDefault()->PostTask(
            FROM_HERE, base::BindOnce(&PageSignals::PublishLinkPick,
            weak_factory_.GetWeakPtr(), url, navigation_generation_));
      }
      if (url.SchemeIsHTTPOrHTTPS() && !url.has_username() &&
          !url.has_password() &&
          ReadableResponseAllowed(handle->GetResponseHeaders())) {
        page_change_url_ = url.spec();
      }
      base::SequencedTaskRunner::GetCurrentDefault()->PostTask(
          FROM_HERE,
          base::BindOnce(&PageSignals::PublishNavigation,
                         weak_factory_.GetWeakPtr(), handle->GetURL(),
                         handle->GetNetErrorCode(), handle->IsErrorPage(),
                         navigation_generation_));
    }
    base::SequencedTaskRunner::GetCurrentDefault()->PostTask(
        FROM_HERE,
        base::BindOnce(&PageSignals::PublishAuth, weak_factory_.GetWeakPtr()));
  }

  void PublishLinkPick(const GURL& url, int generation) {
    if (!web_contents() || generation != navigation_generation_ ||
        web_contents()->GetLastCommittedURL() != url || page_id_.empty()) return;
    auto* runtime = AuxRuntimeHost::ForProfile(profile_);
    if (!runtime) return;
    base::DictValue pick;
    pick.Set("pageId", page_id_);
    pick.Set("url", url.spec());
    pick.Set("navigationId", base::Uuid::GenerateRandomV4().AsLowercaseString());
    if (auto json = base::WriteJson(pick)) {
      runtime->CallInternal("command.ranking.link", std::move(*json),
                           base::BindOnce([](AuxRuntimeHost::Response) {}));
    }
  }

  void PublishNavigation(const GURL& url, int net_error, bool error_page,
                         int generation) {
    if (!web_contents() || generation != navigation_generation_) return;
    std::optional<base::DictValue> next;
    auto* helper = security_interstitials::SecurityInterstitialTabHelper::
        FromWebContents(web_contents());
    auto* blocking = helper ? helper->GetBlockingPageForFrame(
        web_contents()->GetPrimaryMainFrame()->GetFrameTreeNodeId()) : nullptr;
    const bool ssl = blocking && blocking->GetTypeForTesting() ==
                                     SSLBlockingPage::kTypeForTesting;
    const bool https_only = blocking && blocking->GetTypeForTesting() ==
                                            security_interstitials::
                                                HttpsOnlyModeBlockingPage::
                                                    kTypeForTesting;
    if (ssl || https_only || (error_page && net_error != net::OK)) {
      const int code = ssl && !net::IsCertificateError(net_error)
                           ? net::ERR_CERT_INVALID
                           : net_error != net::OK ? net_error
                                                  : net::ERR_SSL_PROTOCOL_ERROR;
      base::DictValue failure;
      failure.Set("url", url.spec());
      failure.Set("code", code);
      failure.Set("message", net::ErrorToString(code));
      if (https_only) {
        auto* upgrade = HttpsOnlyModeTabHelper::FromWebContents(web_contents());
        if (upgrade && upgrade->is_navigation_fallback() &&
            upgrade->fallback_url().SchemeIs("http")) {
          failure.Set("upgradedFrom", upgrade->fallback_url().spec());
        }
      }
      next = std::move(failure);
    }
    if (navigation_error_ == next) return;
    navigation_error_ = std::move(next);
    if (!page_id_.empty()) {
      if (auto* runtime = AuxRuntimeHost::ForProfile(profile_)) {
        runtime->NotifyNavigationError(page_id_, navigation_error());
      }
    }
    if (auto* catalog = TabCatalog::GetForProfile(profile_)) {
      catalog->RefreshPage();
    }
  }

  void PublishAuth() {
    if (!web_contents()) {
      return;
    }
    bool showing = false;
    if (auto* login = LoginTabHelper::FromWebContents(web_contents())) {
      showing = login->IsShowingPrompt();
    }
    if (showing == auth_prompt_) {
      return;
    }
    auth_prompt_ = showing;
    EmitShellEvent(profile_, "onHttpAuthChanged", "{}");
  }

  void PublishLoading() {
    if (page_id_.empty()) {
      return;
    }
    base::DictValue payload;
    payload.Set("pageId", page_id_);
    payload.Set("loading", web_contents()->IsLoading());
    EmitDict(profile_, "onLoading", std::move(payload));
  }

  void MediaMetadataChanged(const MediaPlayerInfo& info,
                            const content::MediaPlayerId& id) override {
    if (info.has_video) video_players_.insert(id);
    else video_players_.erase(id);
    PublishAudio(web_contents()->IsCurrentlyAudible());
  }
  void MediaStartedPlaying(const MediaPlayerInfo& info,
                           const content::MediaPlayerId& id) override {
    MediaMetadataChanged(info, id);
  }
  void MediaStoppedPlaying(const MediaPlayerInfo&,
                           const content::MediaPlayerId&,
                           MediaStoppedReason) override {
    PublishAudio(web_contents()->IsCurrentlyAudible());
  }
  void MediaResized(const gfx::Size& size,
                    const content::MediaPlayerId& id) override {
    if (!size.IsEmpty()) video_players_.insert(id);
    PublishAudio(web_contents()->IsCurrentlyAudible());
  }
  void MediaDestroyed(const content::MediaPlayerId& id) override {
    video_players_.erase(id);
    PublishAudio(web_contents()->IsCurrentlyAudible());
  }
  void PrimaryPageChanged(content::Page&) override {
    video_players_.clear();
    PublishAudio(web_contents()->IsCurrentlyAudible());
  }
  void MediaPictureInPictureChanged(bool) override {
    PublishAudio(web_contents()->IsCurrentlyAudible());
    base::DictValue state;
    state.Set("pageId", page_id_);
    state.Set("active", web_contents()->HasPictureInPictureVideo() ||
                        web_contents()->HasPictureInPictureDocument());
    EmitDict(profile_, "onPictureInPicture", std::move(state));
  }

  void PublishAudio(bool audible) {
    if (page_id_.empty()) {
      return;
    }
    base::DictValue payload;
    payload.Set("pageId", page_id_);
    payload.Set("muted", web_contents()->IsAudioMuted());
    payload.Set("audible", audible);
    payload.Set("video", has_video());
    payload.Set("pip", web_contents()->HasPictureInPictureVideo() || web_contents()->HasPictureInPictureDocument());
    EmitDict(profile_, "onAudio", std::move(payload));
  }

  // Only the authenticated Chromium host can submit page observations. Ask
  // the runtime whether this exact page has an armed Skill before extracting
  // any text. The extracted text stays in the browser process; only a digest
  // crosses the runtime boundary.
  void ObservePageChange() {
    if (page_change_pending_ || !profile_ || profile_->IsOffTheRecord() ||
        page_id_.empty() || !web_contents() ||
        web_contents()->GetVisibility() != content::Visibility::VISIBLE)
      return;
    const GURL url = web_contents()->GetLastCommittedURL();
    auto* runtime = AuxRuntimeHost::ForProfile(profile_);
    if (page_change_url_ != url.spec() || !runtime)
      return;
    page_change_pending_ = true;
    const int generation = navigation_generation_;
    base::DictValue params;
    params.Set("pageId", page_id_);
    params.Set("url", url.spec());
    const auto json = base::WriteJson(params);
    if (!json) {
      page_change_pending_ = false;
      return;
    }
    runtime->CallInternal(
        "routines.pageChangeTarget", *json,
        base::BindOnce(&PageSignals::OnPageChangeTarget,
                       weak_factory_.GetWeakPtr(), url.spec(), generation));
  }

  bool SamePage(const std::string& url, int generation) const {
    return web_contents() && generation == navigation_generation_ &&
           page_change_url_ == url &&
           web_contents()->GetLastCommittedURL().spec() == url &&
           web_contents()->GetVisibility() == content::Visibility::VISIBLE;
  }

  void OnPageChangeTarget(std::string url, int generation,
                          AuxRuntimeHost::Response response) {
    if (!SamePage(url, generation) || !response.ok) {
      page_change_pending_ = false;
      return;
    }
    const auto parsed =
        base::JSONReader::Read(response.result_json, base::JSON_PARSE_RFC);
    const base::DictValue* target = parsed ? parsed->GetIfDict() : nullptr;
    const std::optional<int> epoch =
        target ? target->FindInt("documentEpoch") : std::nullopt;
    if (!epoch || !web_contents()->GetPrimaryMainFrame()) {
      page_change_pending_ = false;
      return;
    }
    web_contents()->GetPrimaryMainFrame()->ExecuteJavaScriptInIsolatedWorld(
        kPageChangeScript,
        base::BindOnce(&PageSignals::OnPageChangeText,
                       weak_factory_.GetWeakPtr(), std::move(url), generation,
                       *epoch),
        kPageChangeWorld);
  }

  void OnPageChangeText(std::string url, int generation, int epoch,
                        base::Value value) {
    page_change_pending_ = false;
    if (!SamePage(url, generation)) return;
    const std::string* text = value.GetIfString();
    auto* runtime = AuxRuntimeHost::ForProfile(profile_);
    if (!text || text->empty() || text->size() > kPageChangeMaxTextBytes ||
        !runtime) return;
    base::DictValue event;
    event.Set("kind", "page_change");
    event.Set("eventId", base::Uuid::GenerateRandomV4().AsLowercaseString());
    event.Set("pageId", page_id_);
    event.Set("url", url);
    event.Set("documentEpoch", epoch);
    event.Set("contentSha256", base::HexEncodeLower(crypto::hash::Sha256(*text)));
    event.Set("observedAt", static_cast<double>(
                                base::Time::Now().InMillisecondsSinceUnixEpoch()));
    if (auto json = base::WriteJson(event)) {
      runtime->CallInternal("routines.ingestEvent", std::move(*json),
                            base::BindOnce([](AuxRuntimeHost::Response) {}));
    }
  }

  raw_ptr<Profile> profile_;
  std::string page_id_;
  base::TimeTicks last_physical_takeover_;
  bool auth_prompt_ = false;
  int navigation_generation_ = 0;
  std::string page_change_url_;
  std::set<content::MediaPlayerId> video_players_;
  std::optional<base::DictValue> navigation_error_;
  base::RepeatingTimer page_change_timer_;
  bool page_change_pending_ = false;
  WEB_CONTENTS_USER_DATA_KEY_DECL();
  base::WeakPtrFactory<PageSignals> weak_factory_{this};
};

WEB_CONTENTS_USER_DATA_KEY_IMPL(PageSignals);

const base::DictValue* FindSpace(const base::DictValue& root,
                                 const std::string& space_id) {
  const base::DictValue* shared = root.FindDict("shared");
  if (!shared) {
    return nullptr;
  }
  for (const char* key : {"spaces", "archivedSpaces"}) {
    const base::ListValue* list = shared->FindList(key);
    if (!list) {
      continue;
    }
    for (const base::Value& entry : *list) {
      const base::DictValue* space = entry.GetIfDict();
      const std::string* id = space ? space->FindString("id") : nullptr;
      if (id && *id == space_id && space->FindString("name") &&
          space->FindString("color")) {
        return space;
      }
    }
  }
  return nullptr;
}

class DownloadSignals : public content::DownloadManager::Observer,
                        public download::DownloadItem::Observer,
                        public base::SupportsUserData::Data {
 public:
  explicit DownloadSignals(Profile* profile) : profile_(profile) {
    if (auto* manager = profile->GetDownloadManager()) {
      manager_observation_ = manager;
      manager->AddObserver(this);
      Scan(manager);
    }
  }
  ~DownloadSignals() override {
    ForgetItems();
    if (manager_observation_) {
      manager_observation_->RemoveObserver(this);
      manager_observation_ = nullptr;
    }
  }

  void OnDownloadCreated(content::DownloadManager* manager,
                         download::DownloadItem* item) override {
    ObserveItem(item, !manager->IsManagerInitialized());
  }
  void OnDownloadUpdated(download::DownloadItem* item) override { Publish(item); }
  void OnDownloadDestroyed(download::DownloadItem* item) override {
    std::erase(observed_, item);
    completed_.erase(item->GetGuid());
  }
  void OnManagerInitialized() override {
    if (manager_observation_) {
      Scan(manager_observation_);
    }
  }
  void ManagerGoingDown(content::DownloadManager* manager) override {
    ForgetItems();
    manager->RemoveObserver(this);
    manager_observation_ = nullptr;
  }

 private:
  void Scan(content::DownloadManager* manager) {
    content::DownloadManager::DownloadVector items;
    manager->GetAllDownloads(&items);
    for (download::DownloadItem* item : items) {
      ObserveItem(item, true);
    }
  }
  void ObserveItem(download::DownloadItem* item, bool restored) {
    if (!item) {
      return;
    }
    for (download::DownloadItem* existing : observed_) {
      if (existing == item) {
        return;
      }
    }
    // Scan/startup COMPLETE items are history; a genuine initialized-manager
    // creation can already be complete and must still get its one admission.
    if (restored && item->GetState() == download::DownloadItem::COMPLETE)
      completed_.insert(item->GetGuid());
    observed_.push_back(item);
    item->AddObserver(this);
    Publish(item);
  }
  void ForgetItems() {
    for (download::DownloadItem* item : observed_) {
      item->RemoveObserver(this);
    }
    observed_.clear();
  }
  void Publish(download::DownloadItem* item) {
    const std::string filename = item->GetFileNameToReportUser().AsUTF8Unsafe();
    base::DictValue payload;
    payload.Set("id", item->GetGuid());
    if (!item->GetURL().is_empty()) {
      payload.Set("sourceUrl", item->GetURL().spec());
    }
    if (!item->GetTabUrl().is_empty()) {
      payload.Set("tabUrl", item->GetTabUrl().spec());
    }
    if (!profile_->IsOffTheRecord()) {
      if (auto* prefs = DownloadPrefs::FromBrowserContext(profile_)) {
        payload.Set("downloadRoot", prefs->DownloadPath().AsUTF8Unsafe());
      }
    }
    payload.Set("filename", filename.empty() ? "download" : filename);
    payload.Set("path", item->GetTargetFilePath().AsUTF8Unsafe());
    payload.Set("size", static_cast<double>(item->GetReceivedBytes()));
    if (item->GetTotalBytes() > 0) {
      payload.Set("totalBytes", static_cast<double>(item->GetTotalBytes()));
    }
    payload.Set("paused", item->IsPaused());
    payload.Set("canResume", item->CanResume());
    payload.Set("canCancel", item->GetState() ==
                                  download::DownloadItem::IN_PROGRESS);
    const char* state = "progressing";
    switch (item->GetState()) {
      case download::DownloadItem::COMPLETE:
        state = "completed";
        break;
      case download::DownloadItem::CANCELLED:
        state = "cancelled";
        break;
      case download::DownloadItem::INTERRUPTED:
        state = "interrupted";
        break;
      case download::DownloadItem::IN_PROGRESS:
        state = item->GetReceivedBytes() == 0 ? "started" : "progressing";
        break;
      case download::DownloadItem::MAX_DOWNLOAD_STATE:
        break;
    }
    payload.Set("state", state);
    payload.Set("startedAt", static_cast<double>(
                                 item->GetStartTime().InMillisecondsSinceUnixEpoch()));
    if (item->GetState() != download::DownloadItem::IN_PROGRESS &&
        !item->GetEndTime().is_null()) {
      payload.Set("endedAt", static_cast<double>(
                                 item->GetEndTime().InMillisecondsSinceUnixEpoch()));
    }
    EmitDict(profile_, "onDownload", std::move(payload));
    if (item->GetState() == download::DownloadItem::COMPLETE &&
        completed_.insert(item->GetGuid()).second &&
        aux::EligibleDownloadName(profile_, item)) {
      const auto candidate = aux::RecordDownloadNamingCandidate(profile_, item);
      if (!candidate) return;
      if (auto* runtime = AuxRuntimeHost::ForProfile(profile_)) {
        if (auto json = base::WriteJson(*candidate)) {
          runtime->CallInternal("downloads.completedNative", std::move(*json),
              base::BindOnce([](AuxRuntimeHost::Response) {}));
        }
      }
    }
  }

  raw_ptr<Profile> profile_;
  raw_ptr<content::DownloadManager> manager_observation_ = nullptr;
  std::vector<raw_ptr<download::DownloadItem>> observed_;
  std::set<std::string> completed_;
};

class NotificationSignals final : public NotificationDisplayService::Observer,
                                  public base::SupportsUserData::Data {
 public:
  explicit NotificationSignals(Profile* profile) : profile_(profile) {
    service_ = NotificationDisplayServiceFactory::GetForProfile(profile);
    if (service_) service_->AddObserver(this);
  }
  ~NotificationSignals() override {
    if (service_) service_->RemoveObserver(this);
  }

  void OnNotificationDisplayed(
      const message_center::Notification& notification,
      const NotificationCommon::Metadata* const metadata) override {
    if (!profile_ || profile_->IsOffTheRecord() || !metadata ||
        (metadata->type != NotificationHandler::Type::WEB_PERSISTENT &&
         metadata->type != NotificationHandler::Type::WEB_NON_PERSISTENT) ||
        notification.notifier_id().type != message_center::NotifierType::WEB_PAGE ||
        notification.id().empty() || notification.id().size() > 1024)
      return;
    const GURL& source = notification.origin_url();
    if (!source.SchemeIsHTTPOrHTTPS() || source.has_username() ||
        source.has_password())
      return;
    auto* settings = HostContentSettingsMapFactory::GetForProfile(profile_);
    if (!settings ||
        settings->GetContentSetting(source, source,
                                    ContentSettingsType::NOTIFICATIONS) !=
            CONTENT_SETTING_ALLOW)
      return;
    auto* runtime = AuxRuntimeHost::ForProfile(profile_);
    if (!runtime) return;
    base::DictValue event;
    event.Set("kind", "site_notification");
    event.Set("origin", url::Origin::Create(source).Serialize());
    event.Set("eventId", notification.id());
    event.Set("permissionGranted", true);
    event.Set("observedAt", static_cast<double>(
                                base::Time::Now().InMillisecondsSinceUnixEpoch()));
    if (auto json = base::WriteJson(event)) {
      runtime->CallInternal("routines.ingestEvent", std::move(*json),
                            base::BindOnce([](AuxRuntimeHost::Response) {}));
    }
  }
  void OnNotificationClosed(const std::string&) override {}
  void OnNotificationDisplayServiceDestroyed(
      NotificationDisplayService* service) override {
    if (service_ == service) {
      service_->RemoveObserver(this);
      service_ = nullptr;
    }
  }

 private:
  raw_ptr<Profile> profile_;
  raw_ptr<NotificationDisplayService> service_ = nullptr;
};

struct RunAttentionEntry {
  std::string run_id;
  std::string identity;
  std::string window_id;
};

class RunAttentionState final : public base::SupportsUserData::Data {
 public:
  std::map<std::string, RunAttentionEntry> entries;
  std::map<std::string, base::TimeTicks> last_by_kind;
};

class RunAttentionHandler final : public NotificationHandler {
 public:
  void OnClick(Profile* profile, const GURL&, const std::string& notification_id,
               const std::optional<int>&, const std::optional<std::u16string>&,
               base::OnceClosure completed) override {
    auto* state = profile ? static_cast<RunAttentionState*>(
        profile->GetUserData(&kRunAttentionKey)) : nullptr;
    if (state) {
      auto it = state->entries.find(notification_id);
      if (it != state->entries.end()) {
        base::DictValue payload;
        payload.Set("runId", it->second.run_id);
        payload.Set("identity", it->second.identity);
        payload.Set("windowId", it->second.window_id);
        EmitDict(profile, "onRunAttentionActivated", std::move(payload));
        state->entries.erase(it);
      }
    }
    std::move(completed).Run();
  }
  void OnClose(Profile* profile, const GURL&, const std::string& notification_id,
               bool, base::OnceClosure completed) override {
    auto* state = profile ? static_cast<RunAttentionState*>(
        profile->GetUserData(&kRunAttentionKey)) : nullptr;
    if (state) state->entries.erase(notification_id);
    std::move(completed).Run();
  }
};

}  // namespace

bool ShowRunAttention(Profile* profile, const std::string& kind,
                      const std::string& run_id, const std::string& identity,
                      const std::string& window_id) {
  if (!profile || profile->IsOffTheRecord() || run_id.empty() || identity.empty() ||
      window_id.empty() || run_id.size() > 128 || identity.size() > 128 ||
      window_id.size() > 128) return false;
  const char16_t* title = nullptr;
  const char16_t* body = nullptr;
  if (kind == "completed") {
    title = u"Aux finished a task";
    body = u"Open Aux to review the result.";
  } else if (kind == "question") {
    title = u"Aux needs your answer";
    body = u"Open Aux to review a question.";
  } else if (kind == "handoff") {
    title = u"Your turn in Aux";
    body = u"Open Aux to finish a browser step.";
  } else {
    return false;
  }
  auto* service = NotificationDisplayServiceImpl::GetForProfile(profile);
  if (!service) return false;
  if (!service->GetNotificationHandler(NotificationHandler::Type::AUX_RUN_ATTENTION)) {
    service->AddNotificationHandler(NotificationHandler::Type::AUX_RUN_ATTENTION,
                                    std::make_unique<RunAttentionHandler>());
  }
  auto* state = static_cast<RunAttentionState*>(
      profile->GetUserData(&kRunAttentionKey));
  if (!state) {
    profile->SetUserData(&kRunAttentionKey, std::make_unique<RunAttentionState>());
    state = static_cast<RunAttentionState*>(profile->GetUserData(&kRunAttentionKey));
  }
  const auto now = base::TimeTicks::Now();
  auto last = state->last_by_kind.find(kind);
  if (last != state->last_by_kind.end() && now - last->second < base::Seconds(5))
    return false;
  const std::string notification_id =
      "aux-run-attention-" + base::Uuid::GenerateRandomV4().AsLowercaseString();
  state->entries.emplace(notification_id,
                         RunAttentionEntry{run_id, identity, window_id});
  state->last_by_kind[kind] = now;
  message_center::RichNotificationData data;
  message_center::Notification notification(
      message_center::NOTIFICATION_TYPE_SIMPLE, notification_id,
      std::u16string(title), std::u16string(body), ui::ImageModel(), u"Aux",
      GURL(), message_center::NotifierId(), data, nullptr);
  service->Display(NotificationHandler::Type::AUX_RUN_ATTENTION,
                   notification, nullptr);
  return true;  // Enqueued; OS permission can still deny display. The shell keeps a fallback.
}

void StartShellEvents(Profile* profile) {
  if (!profile) {
    return;
  }
  Router::GetOrCreate(profile);
  if (!profile->IsOffTheRecord() && !profile->GetUserData(&kNotificationsKey)) {
    profile->SetUserData(&kNotificationsKey,
                         std::make_unique<NotificationSignals>(profile));
  }
  if (profile->GetUserData(&kDownloadsKey)) {
    return;
  }
  profile->SetUserData(&kDownloadsKey,
                       std::make_unique<DownloadSignals>(profile));
}

void EmitShellEvent(Profile* profile,
                    std::string_view name,
                    std::string payload_json) {
  if (Router* router = Router::Get(profile)) {
    router->observers.Notify(std::string(name), payload_json);
  }
}

void PublishPasswordOffer(Profile* profile,
                          content::WebContents* contents,
                          std::string origin,
                          std::string username,
                          bool update) {
  if (!profile || profile->IsOffTheRecord() || !contents ||
      contents->GetBrowserContext() != profile || origin.empty()) {
    return;
  }
  const std::string page_id = PageId(contents);
  if (page_id.empty()) return;
  const std::string offer_id = base::Uuid::GenerateRandomV4().AsLowercaseString();
  contents->SetUserData(&kPasswordOfferKey,
                        std::make_unique<PasswordOfferData>(origin, offer_id));
  base::DictValue payload;
  payload.Set("pageId", page_id);
  payload.Set("username", username.substr(0, 256));
  payload.Set("origin", std::move(origin));
  payload.Set("kind", update ? "update" : "save");
  payload.Set("offerId", offer_id);
  EmitDict(profile, "onVaultOffer", std::move(payload));
}

bool ConsumePasswordOffer(content::WebContents* contents,
                          std::string_view origin,
                          std::string_view offer_id) {
  auto* offer = contents ? static_cast<PasswordOfferData*>(
      contents->GetUserData(&kPasswordOfferKey)) : nullptr;
  if (!offer || offer_id.empty() || offer->id != offer_id ||
      offer->origin != origin) {
    return false;
  }
  contents->RemoveUserData(&kPasswordOfferKey);
  return true;
}

base::CallbackListSubscription ObserveShellEvents(
    Profile* profile,
    base::RepeatingCallback<void(const std::string&, const std::string&)>
        callback) {
  if (!profile) {
    return {};
  }
  StartShellEvents(profile);
  return Router::GetOrCreate(profile).observers.Add(std::move(callback));
}

void WatchPageShellEvents(content::WebContents* contents) {
  if (contents && !PageSignals::FromWebContents(contents)) {
    PageSignals::CreateForWebContents(contents);
  }
}

const base::DictValue* PageNavigationError(content::WebContents* contents) {
  auto* signals = contents ? PageSignals::FromWebContents(contents) : nullptr;
  return signals ? signals->navigation_error() : nullptr;
}

bool PageHasVideo(content::WebContents* contents) {
  WatchPageShellEvents(contents);
  auto* signals = contents ? PageSignals::FromWebContents(contents) : nullptr;
  return signals && signals->has_video();
}

void PublishTabPlacement(Profile* profile,
                         content::WebContents* contents,
                         const std::string& space_id,
                         const std::string& workspace_id) {
  if (!profile || !contents || space_id.empty()) {
    return;
  }
  const base::DictValue* space =
      FindSpace(profile->GetPrefs()->GetDict(kOrganizationPref), space_id);
  if (!space) {
    return;
  }
  const SessionID window_id =
      sessions::SessionTabHelper::IdForWindowContainingTab(contents);
  if (!window_id.is_valid()) {
    return;
  }
  base::DictValue space_payload;
  space_payload.Set("id", space_id);
  space_payload.Set("name", *space->FindString("name"));
  space_payload.Set("color", *space->FindString("color"));
  int grain = space->FindInt("grain").value_or(0);
  if (grain < 0) {
    grain = 0;
  } else if (grain > 100) {
    grain = 100;
  }
  space_payload.Set("grain", grain);
  if (!workspace_id.empty()) {
    space_payload.Set("workspaceId", workspace_id);
  }
  base::DictValue placement;
  placement.Set("space", std::move(space_payload));
  base::DictValue payload;
  payload.Set("pageId", PageIdentity::GetOrCreate(profile, contents));
  payload.Set("windowId", base::NumberToString(window_id.id()));
  payload.Set("placement", std::move(placement));
  EmitDict(profile, "onTabsPlacement", std::move(payload));
}

}  // namespace aux
