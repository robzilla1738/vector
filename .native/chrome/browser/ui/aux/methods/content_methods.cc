// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "chrome/browser/ui/webui_browser/webui_browser_ui.h"

#include <algorithm>
#include <cmath>
#include <array>
#include <optional>
#include <string>
#include <string_view>
#include <utility>
#include <variant>

#include "base/base64.h"
#include "build/build_config.h"
#include "base/files/file_util.h"
#include "base/feature_list.h"
#include "base/functional/bind.h"
#include "base/memory/raw_ptr.h"
#include "base/memory/ref_counted_memory.h"
#include "base/task/sequenced_task_runner.h"
#include "base/task/thread_pool.h"
#include "chrome/browser/shell_integration.h"
#if BUILDFLAG(IS_MAC)
#include "chrome/app/aux_crash_reporting_mac.h"
#endif
#include "printing/buildflags/buildflags.h"
#include "content/public/browser/host_zoom_map.h"
#include "third_party/blink/public/common/page/page_zoom.h"
#include "base/json/json_reader.h"
#include "base/json/json_writer.h"
#include "base/notimplemented.h"
#include "base/strings/string_number_conversions.h"
#include "base/strings/utf_string_conversions.h"
#include "base/values.h"
#include "base/time/time.h"
#include "chrome/browser/bookmarks/bookmark_model_factory.h"
#include "chrome/browser/buildflags.h"
#if BUILDFLAG(ENABLE_AUX_SHELL)
#include "chrome/browser/devtools/devtools_window.h"
#if BUILDFLAG(ENABLE_PRINTING)
#if BUILDFLAG(ENABLE_PRINT_PREVIEW)
#include "chrome/browser/printing/print_view_manager.h"
#else
#include "chrome/browser/printing/print_view_manager_basic.h"
#endif
#include "components/printing/browser/print_to_pdf/pdf_print_utils.h"
#endif
#include "chrome/browser/ui/browser_commands.h"
#include "chrome/browser/ui/select_file_policy/chrome_select_file_policy.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/thumbnails/thumbnail_image.h"
#include "chrome/browser/ui/thumbnails/thumbnail_tab_helper.h"
#include "components/tabs/public/tab_interface.h"
#include "chrome/browser/ui/login/login_tab_helper.h"
#include "chrome/browser/ui/aux/content_blocking_controller.h"
#include "chrome/browser/ui/aux/dictation_mac.h"
#include "chrome/browser/ui/aux/extension_bridge.h"
#include "chrome/browser/ui/aux/migration_import.h"
#include "chrome/browser/ui/aux/runtime_host.h"
#include "chrome/browser/ui/aux/organization_store.h"
#include "chrome/browser/ui/aux/profile_search_engine.h"
#include "chrome/browser/ui/aux/result_preview.h"
#include "chrome/browser/ui/aux/site_prefs.h"
#include "chrome/browser/ui/aux/shell_events.h"
#include "chrome/browser/ui/aux/tab_catalog.h"
#include "chrome/browser/ui/aux/zap_controller.h"
#include "chrome/browser/dom_distiller/dom_distiller_service_factory.h"
#include "components/dom_distiller/content/browser/distiller_page_web_contents.h"
#include "components/dom_distiller/content/browser/distiller_javascript_utils.h"
#include "components/dom_distiller/core/dom_distiller_service.h"
#include "components/dom_distiller/core/proto/distilled_article.pb.h"
#include "components/dom_distiller/core/task_tracker.h"
#include "components/dom_distiller/core/url_utils.h"
#include "chrome/common/chrome_isolated_world_ids.h"
#include "components/guest_contents/browser/guest_contents_handle.h"
#include "components/security_interstitials/content/https_only_mode_blocking_page.h"
#include "components/security_interstitials/content/security_interstitial_page.h"
#include "components/security_interstitials/content/security_interstitial_tab_helper.h"
#include "components/security_interstitials/content/ssl_blocking_page.h"
#include "components/security_interstitials/core/controller_client.h"
#include "components/prefs/pref_change_registrar.h"
#include "components/prefs/pref_service.h"
#include "components/content_settings/core/browser/cookie_settings.h"
#include "components/content_settings/core/common/pref_names.h"
#include "components/browsing_data/content/conditional_cache_counting_helper.h"
#include "components/zoom/zoom_controller.h"
#endif
#include "chrome/browser/contextual_search/contextual_search_service_factory.h"
#include "chrome/browser/content_settings/host_content_settings_map_factory.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ssl/chrome_security_state_util.h"
#include "chrome/browser/ssl/https_only_mode_tab_helper.h"
#include "chrome/browser/ui/bookmarks/bookmark_bar_controller.h"
#include "chrome/browser/ui/bookmarks/bookmarks_service_feature.h"
#include "chrome/browser/ui/browser_element_identifiers.h"
#include "chrome/browser/ui/browser_window/public/browser_window_features.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/interaction/browser_elements.h"
#include "chrome/browser/ui/omnibox/omnibox_next_features.h"
#include "chrome/browser/ui/side_panel/side_panel_entry_id.h"
#include "chrome/browser/ui/tabs/tab_drag_api/tab_drag_service_feature.h"
#include "chrome/browser/ui/tabs/tab_strip_api/controllers/tab_strip_ui_controller_impl.h"
#include "chrome/browser/ui/tabs/tab_strip_api/tab_strip_service_feature.h"
#include "chrome/browser/ui/webui/cr_components/searchbox/searchbox_handler.h"
#include "chrome/browser/ui/webui/favicon_source.h"
#include "chrome/browser/ui/webui/searchbox/realbox_handler.h"
#include "chrome/browser/ui/webui/webui_toolbar/webui_toolbar_extensions_container.h"
#include "chrome/browser/ui/webui_browser/bookmark_bar_page_handler.h"
#include "chrome/browser/ui/webui_browser/webui_browser.h"
#include "chrome/browser/ui/webui_browser/webui_browser_page_handler.h"
#include "chrome/browser/ui/webui_browser/webui_browser_side_panel_ui.h"
#include "chrome/browser/ui/webui_browser/webui_browser_window.h"
#include "chrome/common/webui_url_constants.h"
#include "chrome/common/pref_names.h"
#include "chrome/common/chrome_features.h"
#include "chrome/grit/branded_strings.h"
#include "chrome/grit/generated_resources.h"
#include "chrome/grit/tab_strip_api_resources_map.h"
#include "chrome/grit/webui_browser_resources.h"
#include "chrome/grit/webui_browser_resources_map.h"
#if BUILDFLAG(ENABLE_AUX_SHELL)
#include "chrome/grit/aux_host_resources.h"
#include "chrome/grit/aux_host_resources_map.h"
#include "chrome/grit/aux_resources.h"
#include "chrome/grit/aux_resources_map.h"
#include "ui/display/screen.h"
#include "ui/events/event.h"
#include "ui/events/event_observer.h"
#include "ui/views/event_monitor.h"
#include "ui/shell_dialogs/selected_file_info.h"
#endif
#include "net/base/filename_util.h"
#include "net/base/net_errors.h"
#include "chrome/grit/webui_toolbar_shared_resources.h"
#include "chrome/grit/webui_toolbar_shared_resources_map.h"
#include "components/contextual_search/contextual_search_service.h"
#include "components/contextual_search/contextual_search_session_handle.h"
#include "components/favicon_base/favicon_url_parser.h"
#include "components/guest_contents/browser/guest_contents_host_impl.h"
#include "components/surface_embed/common/features.h"
#include "content/public/browser/browser_context.h"
#include "content/public/browser/browsing_data_filter_builder.h"
#include "content/public/browser/browsing_data_remover.h"
#include "content/public/browser/navigation_controller.h"
#include "content/public/browser/navigation_entry.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/web_contents_observer.h"
#include "content/public/browser/storage_partition.h"
#include "components/content_settings/core/browser/host_content_settings_map.h"
#include "components/content_settings/core/common/content_settings.h"
#include "components/content_settings/core/common/content_settings_pattern.h"
#include "components/content_settings/core/common/content_settings_types.h"
#include "components/security_state/core/security_state.h"
#include "content/public/browser/web_ui.h"
#include "content/public/browser/web_ui_data_source.h"
#include "services/network/public/mojom/content_security_policy.mojom.h"
#if BUILDFLAG(ENABLE_AUX_SHELL)
#include "net/cookies/cookie_options.h"
#include "net/base/registry_controlled_domains/registry_controlled_domain.h"
#include "net/cookies/cookie_partition_key_collection.h"
#include "net/cookies/canonical_cookie.h"
#include "mojo/public/cpp/bindings/callback_helpers.h"
#include "services/network/public/mojom/cookie_manager.mojom.h"
#endif
#include "ui/base/l10n/l10n_util.h"
#include "ui/views/interaction/element_tracker_views.h"
#include "ui/webui/tracked_element/tracked_element_handler.h"
#include "ui/webui/tracked_element/tracked_element_handler_document_singleton.h"
#include "ui/webui/webui_util.h"
#include "url/origin.h"
#include "url/gurl.h"

#include <set>

#if BUILDFLAG(ENABLE_AUX_SHELL)
namespace {

constexpr int kTranslationWorld = ISOLATED_WORLD_ID_AUX_TRANSLATION;

// Text nodes and their originals remain in the page's isolated world. Neither
// original nor translated text is sent to the Aux shell.
constexpr char16_t kTranslationCaptureScript[] = uR"JS((() => {
  if (!document.body || document.readyState === 'loading') return null;
  const prior = globalThis.__auxTranslation;
  if (prior && prior.applied) {
    for (const record of prior.records) {
      if (record.node.isConnected && record.node.textContent === record.applied)
        record.node.textContent = record.original;
    }
  }
  const records = [];
  const texts = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let inspected = 0;
  let truncated = false;
  while (walker.nextNode()) {
    if (++inspected > 10000) { truncated = true; break; }
    const node = walker.currentNode;
    const parent = node.parentElement;
    if (!parent || parent.closest('script,style,noscript,textarea,input,select,option,code,pre,[contenteditable],[aria-hidden="true"],[hidden]')) continue;
    const original = node.textContent || '';
    const text = original.trim();
    if (!text || text.length > 4000) continue;
    const style = getComputedStyle(parent);
    if (style.display === 'none' || style.visibility !== 'visible') continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    if (!range.getClientRects().length) continue;
    if (texts.length === 400) { truncated = true; break; }
    records.push({node, original, applied: null});
    texts.push(text);
  }
  if (!texts.length) return null;
  const token = Date.now().toString(36) + Math.random().toString(36).slice(2);
  globalThis.__auxTranslation = {token, records, applied: false};
  return {token, texts, title: document.title.slice(0, 200), truncated};
})())JS";

constexpr char16_t kTranslationRestoreScript[] = uR"JS((() => {
  const state = globalThis.__auxTranslation;
  if (!state) return 0;
  let restored = 0;
  for (const record of state.records) {
    if (record.applied !== null && record.node.isConnected &&
        record.node.textContent === record.applied) {
      record.node.textContent = record.original;
      restored++;
    }
  }
  delete globalThis.__auxTranslation;
  return restored;
})())JS";

void EmitTranslationState(Profile* profile, const std::string& page_id,
                          base::DictValue state) {
  state.Set("pageId", page_id);
  if (auto json = base::WriteJson(base::Value(std::move(state))))
    aux::EmitShellEvent(profile, "onTranslationChanged", std::move(*json));
}

bool TranslationPageCurrent(WebUIBrowserUI* ui, const std::string& page_id,
                            content::WebContents* expected, int navigation_id,
                            const GURL& url) {
  BrowserWindowInterface* owner = nullptr;
  auto* catalog = aux::TabCatalog::GetForProfile(ui->browser()->GetProfile());
  auto* page = catalog ? catalog->FindPage(page_id, &owner) : nullptr;
  const auto* entry = page ? page->GetController().GetLastCommittedEntry() : nullptr;
  return page && page == expected && owner == ui->browser() && entry &&
         entry->GetUniqueID() == navigation_id &&
         page->GetLastCommittedURL() == url;
}

// Distillation owns a ViewerHandle only while the source document is current.
// Its result crosses the WebUI boundary as a bounded HTML envelope; the shell
// converts that envelope to its restricted ReaderNode tree before rendering.
class ReaderRequest final : public dom_distiller::ViewRequestDelegate,
                            public content::WebContentsObserver {
 public:
  using Reply = base::OnceCallback<void(const dom_distiller::DistilledArticleProto*)>;

  ReaderRequest(content::WebContents* contents, Reply reply)
      : content::WebContentsObserver(contents), reply_(std::move(reply)) {}
  ~ReaderRequest() override { viewer_.reset(); }

  void Start() {
    if (!dom_distiller::DistillerJavaScriptWorldIdIsSet()) {
      dom_distiller::SetDistillerJavaScriptWorldId(
          ISOLATED_WORLD_ID_CHROME_INTERNAL);
    }
    auto* service = dom_distiller::DomDistillerServiceFactory::GetForBrowserContext(
        web_contents()->GetBrowserContext());
    if (!service) { Finish(nullptr); return; }
    auto source = std::make_unique<dom_distiller::SourcePageHandleWebContents>(
        web_contents(), false);
    auto page = service->CreateDefaultDistillerPageWithHandle(std::move(source));
    viewer_ = service->ViewUrlIgnoreCache(
        this, std::move(page), web_contents()->GetLastCommittedURL());
    base::SequencedTaskRunner::GetCurrentDefault()->PostDelayedTask(
        FROM_HERE, base::BindOnce(&ReaderRequest::Timeout,
                                  weak_factory_.GetWeakPtr()), base::Seconds(15));
  }

  void OnArticleReady(const dom_distiller::DistilledArticleProto* article) override {
    Finish(article);
  }
  void OnArticleUpdated(dom_distiller::ArticleDistillationUpdate) override {}
  void OnDistillationFailed(dom_distiller::DistillationParseResult) override {
    Finish(nullptr);
  }
  void PrimaryPageChanged(content::Page&) override { Finish(nullptr); }
  void PrimaryMainFrameRenderProcessGone(base::TerminationStatus) override {
    Finish(nullptr);
  }
  void WebContentsDestroyed() override { Finish(nullptr); }

 private:
  void Timeout() { Finish(nullptr); }
  void Finish(const dom_distiller::DistilledArticleProto* article) {
    if (finished_) return;
    finished_ = true;
    Observe(nullptr);
    std::move(reply_).Run(article);
    // Cancelling during a distiller callback can invalidate its observer list.
    base::SequencedTaskRunner::GetCurrentDefault()->DeleteSoon(FROM_HERE, this);
  }
  Reply reply_;
  std::unique_ptr<dom_distiller::ViewerHandle> viewer_;
  bool finished_ = false;
  base::WeakPtrFactory<ReaderRequest> weak_factory_{this};
};

// A thumbnail can arrive after the shell asks for it. Keep the subscription
// alive for a bounded interval and detach it outside the image callback.
class PreviewRequest : public base::RefCounted<PreviewRequest> {
 public:
  using Reply = base::OnceCallback<void(ThumbnailImage::CompressedThumbnailData)>;

  PreviewRequest(scoped_refptr<ThumbnailImage> image, Reply reply)
      : image_(std::move(image)), reply_(std::move(reply)) {}

  void Start() {
    subscription_ = image_->Subscribe();
    subscription_->SetCompressedImageCallback(base::BindRepeating(
        &PreviewRequest::OnData, base::RetainedRef(this)));
    base::SequencedTaskRunner::GetCurrentDefault()->PostDelayedTask(
        FROM_HERE, base::BindOnce(&PreviewRequest::Complete,
                                  base::RetainedRef(this), nullptr),
        base::Seconds(5));
    image_->RequestCompressedThumbnailData();
  }

 private:
  friend class base::RefCounted<PreviewRequest>;
  ~PreviewRequest() = default;

  void OnData(ThumbnailImage::CompressedThumbnailData data) {
    if (data) Complete(std::move(data));
  }

  void Complete(ThumbnailImage::CompressedThumbnailData data) {
    if (finished_) return;
    finished_ = true;
    std::move(reply_).Run(std::move(data));
    base::SequencedTaskRunner::GetCurrentDefault()->PostTask(
        FROM_HERE, base::BindOnce(&PreviewRequest::Detach,
                                  base::RetainedRef(this)));
  }

  void Detach() { subscription_.reset(); }

  scoped_refptr<ThumbnailImage> image_;
  Reply reply_;
  std::unique_ptr<ThumbnailImage::Subscription> subscription_;
  bool finished_ = false;
};

struct SitePermissionKind {
  std::string_view name;
  ContentSettingsType type;
};

// Only persistent allow/block content settings belong in this list. Capture
// and sanitized clipboard access do not have per-origin saved decisions here.
constexpr std::array<SitePermissionKind, 7> kSitePermissionKinds = {{
    {"media:audio", ContentSettingsType::MEDIASTREAM_MIC},
    {"media:video", ContentSettingsType::MEDIASTREAM_CAMERA},
    {"geolocation", ContentSettingsType::GEOLOCATION},
    {"notifications", ContentSettingsType::NOTIFICATIONS},
    {"pointerLock", ContentSettingsType::POINTER_LOCK},
    {"idle-detection", ContentSettingsType::IDLE_DETECTION},
    {"clipboard-read", ContentSettingsType::CLIPBOARD_READ_WRITE},
}};

class SiteDataRemoval final : public content::BrowsingDataRemover::Observer {
 public:
  SiteDataRemoval(content::BrowsingDataRemover* remover,
                  base::OnceCallback<void(uint64_t)> done)
      : remover_(remover), done_(std::move(done)) {
    remover_->AddObserver(this);
  }

  void OnBrowsingDataRemoverDone(uint64_t failed_data_types) override {
    auto done = std::move(done_);
    delete this;
    std::move(done).Run(failed_data_types);
  }

 private:
  ~SiteDataRemoval() override { remover_->RemoveObserver(this); }
  raw_ptr<content::BrowsingDataRemover> remover_;
  base::OnceCallback<void(uint64_t)> done_;
};

bool ParseBrowsingDataRange(const base::ListValue& args, base::Time* begin,
                            base::Time* end) {
  if (args.size() < 2 || (!args[0].is_int() && !args[0].is_double()) ||
      (!args[1].is_int() && !args[1].is_double())) {
    return false;
  }
  const double since_ms = args[0].GetDouble();
  const double before_ms = args[1].GetDouble();
  constexpr double kMaxDateMs = 8640000000000000.0;
  if (!std::isfinite(since_ms) || !std::isfinite(before_ms) ||
      since_ms < 0 || before_ms <= since_ms || before_ms > kMaxDateMs ||
      std::floor(since_ms) != since_ms ||
      std::floor(before_ms) != before_ms) {
    return false;
  }
  *begin = base::Time::FromMillisecondsSinceUnixEpoch(
      static_cast<int64_t>(since_ms));
  *end = base::Time::FromMillisecondsSinceUnixEpoch(
      static_cast<int64_t>(before_ms));
  return true;
}

bool SavedSitePermission(const ContentSettingPatternSource& rule,
                         bool private_profile, std::string* origin) {
  // A wildcard, policy, extension or inherited private rule is not a decision
  // that this site's Reset button may remove.
  if (rule.source != content_settings::mojom::ProviderType::kPrefProvider ||
      (private_profile && !rule.incognito)) {
    return false;
  }
  const GURL url(rule.primary_pattern.ToString());
  if (!url.is_valid() || !url.SchemeIsHTTPOrHTTPS() ||
      rule.primary_pattern != ContentSettingsPattern::FromURLNoWildcard(url)) {
    return false;
  }
  const std::string serialized = url::Origin::Create(url).Serialize();
  if (rule.secondary_pattern != ContentSettingsPattern::Wildcard() &&
      rule.secondary_pattern != rule.primary_pattern) {
    return false;
  }
  const ContentSetting setting = rule.GetContentSetting();
  if (setting != CONTENT_SETTING_ALLOW && setting != CONTENT_SETTING_BLOCK) {
    return false;
  }
  *origin = serialized;
  return true;
}

base::DictValue SavedSitePermissions(HostContentSettingsMap* map,
                                     bool private_profile) {
  base::DictValue sites;
  for (const auto& kind : kSitePermissionKinds) {
    for (const auto& rule : map->GetSettingsForOneType(kind.type)) {
      std::string origin;
      if (!SavedSitePermission(rule, private_profile, &origin)) continue;
      base::DictValue* decisions = sites.EnsureDict(origin);
      decisions->Set(kind.name, rule.GetContentSetting() == CONTENT_SETTING_ALLOW
                                    ? "allow" : "deny");
    }
  }
  return sites;
}

}  // namespace

void WebUIBrowserUI::HandleAuxContentRequest(
    const std::string& method, const base::ListValue& args,
    RequestCallback callback) {
  const base::ListValue* list = &args;
  if (method == "browsingDataPreview") {
    base::Time begin;
    base::Time end;
    if (list->size() != 2 || !ParseBrowsingDataRange(*list, &begin, &end)) {
      std::move(callback).Run(false, "", "invalid_argument",
                              "Choose a valid browsing-data time period");
      return;
    }
    if (browser_->GetProfile()->IsOffTheRecord()) {
      std::move(callback).Run(false, "", "forbidden",
                              "Browsing-data counts require a regular Profile");
      return;
    }
    browser_->GetProfile()->GetDefaultStoragePartition()
        ->GetCookieManagerForBrowserProcess()
        ->GetAllCookies(mojo::WrapCallbackWithDefaultInvokeIfNotRun(
            base::BindOnce(
                [](base::WeakPtr<WebUIBrowserUI> ui, base::Time begin,
                   base::Time end, RequestCallback callback,
                   const net::CookieList& cookies) {
                  if (!ui || !ui->IsAuthorizedAuxDocument()) {
                    std::move(callback).Run(false, "", "forbidden",
                                            "The Aux shell is no longer active");
                    return;
                  }
                  int cookie_count = 0;
                  for (const auto& cookie : cookies) {
                    if (cookie.CreationDate() >= begin &&
                        cookie.CreationDate() < end) {
                      ++cookie_count;
                    }
                  }
                  browsing_data::ConditionalCacheCountingHelper::Count(
                      ui->browser_->GetProfile()->GetDefaultStoragePartition(),
                      begin, end,
                      base::BindOnce(
                          [](base::WeakPtr<WebUIBrowserUI> ui,
                             int cookie_count, RequestCallback callback,
                             bool upper_limit, int64_t cache_bytes) {
                            if (!ui || !ui->IsAuthorizedAuxDocument()) {
                              std::move(callback).Run(
                                  false, "", "forbidden",
                                  "The Aux shell is no longer active");
                              return;
                            }
                            if (cache_bytes < 0) {
                              std::move(callback).Run(
                                  false, "", "backend_unavailable",
                                  "Chromium could not count cached files");
                              return;
                            }
                            base::DictValue result;
                            result.Set("cookies", cookie_count);
                            result.Set("cacheBytes",
                                       static_cast<double>(cache_bytes));
                            result.Set("cacheEstimate", upper_limit);
                            std::move(callback).Run(
                                true,
                                *base::WriteJson(base::Value(std::move(result))),
                                "", "");
                          },
                          ui, cookie_count, std::move(callback)));
                },
                weak_factory_.GetWeakPtr(), begin, end,
                std::move(callback)),
            net::CookieList()));
    return;
  }
  if (method == "clearBrowsingData") {
    base::Time begin;
    base::Time end;
    if (list->size() != 3 || !ParseBrowsingDataRange(*list, &begin, &end) ||
        !(*list)[2].is_dict()) {
      std::move(callback).Run(false, "", "invalid_argument",
                              "Choose a valid browsing-data removal");
      return;
    }
    const base::DictValue& selected = (*list)[2].GetDict();
    const bool cookies = selected.FindBool("cookies").value_or(false);
    const bool cache = selected.FindBool("cache").value_or(false);
    if (selected.size() != 2 || !selected.FindBool("cookies") ||
        !selected.FindBool("cache") || (!cookies && !cache)) {
      std::move(callback).Run(false, "", "invalid_argument",
                              "Select cookies or cached files to clear");
      return;
    }
    if (browser_->GetProfile()->IsOffTheRecord()) {
      std::move(callback).Run(false, "", "forbidden",
                              "Browsing data cannot be cleared from Private mode");
      return;
    }
    uint64_t mask = 0;
    if (cookies) mask |= content::BrowsingDataRemover::DATA_TYPE_COOKIES;
    if (cache) mask |= content::BrowsingDataRemover::DATA_TYPE_CACHE;
    auto* remover = browser_->GetProfile()->GetBrowsingDataRemover();
    auto* observer = new SiteDataRemoval(remover, base::BindOnce(
        [](RequestCallback callback, uint64_t failed_data_types) {
          if (failed_data_types) {
            std::move(callback).Run(false, "", "backend_unavailable",
                                    "Chromium could not clear all selected browsing data");
          } else {
            std::move(callback).Run(true, "true", "", "");
          }
        }, std::move(callback)));
    remover->RemoveAndReply(
        begin, end, mask,
        content::BrowsingDataRemover::ORIGIN_TYPE_UNPROTECTED_WEB |
            content::BrowsingDataRemover::ORIGIN_TYPE_PROTECTED_WEB,
        observer);
    return;
  }
  if (method == "translatePage" || method == "showOriginal") {
    if (args.size() != 1 || !args[0].is_string()) {
      std::move(callback).Run(false, "", "invalid_argument",
                              "Expected a page identity");
      return;
    }
    const std::string page_id = args[0].GetString();
    BrowserWindowInterface* owner = nullptr;
    auto* catalog = aux::TabCatalog::GetForProfile(browser_->GetProfile());
    auto* contents = catalog ? catalog->FindPage(page_id, &owner) : nullptr;
    if (!contents || owner != browser_ ||
        browser_->GetProfile()->IsOffTheRecord() ||
        browser_->GetTabStripModel()->GetActiveWebContents() != contents ||
        !contents->GetLastCommittedURL().SchemeIsHTTPOrHTTPS() ||
        contents->GetLastCommittedURL().has_username() ||
        contents->GetLastCommittedURL().has_password()) {
      std::move(callback).Run(false, "", "forbidden",
                              "Translation requires the active web page in a regular window");
      return;
    }
    const auto* entry = contents->GetController().GetLastCommittedEntry();
    if (!entry || !contents->GetPrimaryMainFrame()) {
      std::move(callback).Run(false, "", "stale_page",
                              "The page is still loading");
      return;
    }
    const int navigation_id = entry->GetUniqueID();
    const GURL url = contents->GetLastCommittedURL();
    auto weak_contents = contents->GetWeakPtr();
    if (method == "showOriginal") {
      contents->GetPrimaryMainFrame()->ExecuteJavaScriptInIsolatedWorld(
          kTranslationRestoreScript,
          base::BindOnce(
              [](base::WeakPtr<WebUIBrowserUI> ui, std::string page_id,
                 base::WeakPtr<content::WebContents> page, int navigation_id,
                 GURL url, RequestCallback callback, base::Value result) {
                if (!ui || !page || !TranslationPageCurrent(
                        ui.get(), page_id, page.get(), navigation_id, url)) {
                  std::move(callback).Run(false, "", "stale_page",
                                          "The page changed before restoration");
                  return;
                }
                const int restored = result.is_int() ? result.GetInt() : 0;
                EmitTranslationState(ui->browser_->GetProfile(), page_id, {});
                std::move(callback).Run(true, base::NumberToString(restored),
                                        "", "");
              },
              weak_factory_.GetWeakPtr(), page_id, weak_contents,
              navigation_id, url, std::move(callback)),
          kTranslationWorld);
      return;
    }
    contents->GetPrimaryMainFrame()->ExecuteJavaScriptInIsolatedWorld(
        kTranslationCaptureScript,
        base::BindOnce(
            [](base::WeakPtr<WebUIBrowserUI> ui, std::string page_id,
               base::WeakPtr<content::WebContents> page, int navigation_id,
               GURL url, RequestCallback callback, base::Value captured) {
              if (!ui || !page || !TranslationPageCurrent(
                      ui.get(), page_id, page.get(), navigation_id, url)) {
                std::move(callback).Run(false, "", "stale_page",
                                        "The page changed before translation");
                return;
              }
              const auto* capture = captured.GetIfDict();
              const auto* texts = capture ? capture->FindList("texts") : nullptr;
              const auto* token = capture ? capture->FindString("token") : nullptr;
              const auto* title = capture ? capture->FindString("title") : nullptr;
              if (!texts || texts->empty() || texts->size() > 400 ||
                  !token || token->size() > 64 || !title ||
                  title->size() > 200) {
                std::move(callback).Run(false, "", "unavailable",
                                        "No visible page text could be translated");
                return;
              }
              size_t total_bytes = 0;
              for (const auto& text : *texts) {
                if (!text.is_string() || text.GetString().empty() ||
                    text.GetString().size() > 4000 ||
                    (total_bytes += text.GetString().size()) > 400000) {
                  std::move(callback).Run(false, "", "too_large",
                                          "Visible page text exceeds translation limits");
                  return;
                }
              }
              base::DictValue params;
              params.Set("texts", texts->Clone());
              params.Set("context", *title);
              auto params_json = base::WriteJson(base::Value(std::move(params)));
              auto* runtime = AuxRuntimeHost::ForProfile(
                  ui->browser_->GetProfile());
              if (!runtime || !params_json) {
                std::move(callback).Run(false, "", "unavailable",
                                        "Translation runtime is unavailable");
                return;
              }
              base::DictValue pending;
              pending.Set("pending", true);
              EmitTranslationState(ui->browser_->GetProfile(), page_id,
                                   std::move(pending));
              const bool capture_truncated =
                  capture->FindBool("truncated").value_or(false);
              runtime->CallApi(
                  "translate.page", std::move(*params_json),
                  base::BindOnce(
                      [](base::WeakPtr<WebUIBrowserUI> ui,
                         std::string page_id,
                         base::WeakPtr<content::WebContents> page,
                         int navigation_id, GURL url, std::string token,
                         size_t expected_count, bool capture_truncated,
                         RequestCallback callback,
                         AuxRuntimeHost::Response response) {
                        if (!ui) return;
                        auto fail = [&](const std::string& code,
                                        const std::string& message) {
                          EmitTranslationState(ui->browser_->GetProfile(),
                                               page_id, {});
                          std::move(callback).Run(false, "", code, message);
                        };
                        if (!page || !TranslationPageCurrent(
                                ui.get(), page_id, page.get(), navigation_id,
                                url)) {
                          fail("stale_page", "The page changed during translation");
                          return;
                        }
                        if (!response.ok) {
                          fail(response.error_code.empty() ? "unavailable"
                                                           : response.error_code,
                               response.error_message.empty()
                                   ? "Translation failed"
                                   : response.error_message);
                          return;
                        }
                        auto parsed = base::JSONReader::Read(
                            response.result_json, base::JSON_PARSE_RFC);
                        const auto* result = parsed ? parsed->GetIfDict() : nullptr;
                        const auto* translations =
                            result ? result->FindList("translations") : nullptr;
                        const auto* lang = result ? result->FindString("lang") : nullptr;
                        if (!translations || !lang || lang->empty() ||
                            lang->size() > 40 ||
                            translations->size() != expected_count) {
                          fail("invalid_response",
                               "Translation returned misaligned segments");
                          return;
                        }
                        size_t bytes = 0;
                        for (const auto& item : *translations) {
                          if (!item.is_string() ||
                              (bytes += item.GetString().size()) > 1600000) {
                            fail("invalid_response",
                                 "Translation returned invalid text");
                            return;
                          }
                        }
                        auto token_json = base::WriteJson(base::Value(token));
                        auto values_json = base::WriteJson(
                            base::Value(translations->Clone()));
                        if (!token_json || !values_json) {
                          fail("invalid_response",
                               "Translation could not be applied");
                          return;
                        }
                        const std::string script =
                            "((token, values) => {"
                            "const state = globalThis.__auxTranslation;"
                            "if (!state || state.token !== token ||"
                            "state.records.length !== values.length) return -1;"
                            "let count = 0;"
                            "for (let i = 0; i < values.length; i++) {"
                            "const record = state.records[i];"
                            "if (!record.node.isConnected ||"
                            "record.node.textContent !== record.original) continue;"
                            "const prefix = record.original.match(/^\\s*/)[0];"
                            "const suffix = record.original.match(/\\s*$/)[0];"
                            "record.applied = prefix + values[i] + suffix;"
                            "record.node.textContent = record.applied;"
                            "count++;"
                            "}"
                            "state.applied = count > 0;"
                            "return count;"
                            "})(" + *token_json + "," + *values_json + ")";
                        page->GetPrimaryMainFrame()
                            ->ExecuteJavaScriptInIsolatedWorld(
                                base::UTF8ToUTF16(script),
                                base::BindOnce(
                                    [](base::WeakPtr<WebUIBrowserUI> ui,
                                       std::string page_id,
                                       base::WeakPtr<content::WebContents> page,
                                       int navigation_id, GURL url,
                                       std::string lang, bool truncated,
                                       RequestCallback callback,
                                       base::Value applied) {
                                      if (!ui || !page ||
                                          !TranslationPageCurrent(
                                              ui.get(), page_id, page.get(),
                                              navigation_id, url)) {
                                        if (ui)
                                          EmitTranslationState(
                                              ui->browser_->GetProfile(),
                                              page_id, {});
                                        std::move(callback).Run(
                                            false, "", "stale_page",
                                            "The page changed before translated text was applied");
                                        return;
                                      }
                                      const int count = applied.is_int()
                                          ? applied.GetInt() : 0;
                                      if (count <= 0) {
                                        EmitTranslationState(
                                            ui->browser_->GetProfile(),
                                            page_id, {});
                                        std::move(callback).Run(
                                            false, "", "stale_page",
                                            "The page text changed before translation was applied");
                                        return;
                                      }
                                      base::DictValue state;
                                      state.Set("lang", lang);
                                      state.Set("count", count);
                                      state.Set("truncated", truncated);
                                      EmitTranslationState(
                                          ui->browser_->GetProfile(), page_id,
                                          state.Clone());
                                      std::move(callback).Run(
                                          true,
                                          *base::WriteJson(base::Value(
                                              std::move(state))),
                                          "", "");
                                    },
                                    ui, page_id, page, navigation_id, url,
                                    *lang,
                                    capture_truncated ||
                                        result->FindBool("truncated").value_or(false),
                                    std::move(callback)),
                                kTranslationWorld);
                      },
                      ui, page_id, page, navigation_id, url, *token,
                      texts->size(), capture_truncated, std::move(callback)));
            },
            weak_factory_.GetWeakPtr(), page_id, weak_contents,
            navigation_id, url, std::move(callback)),
        kTranslationWorld);
    return;
  }
  if (method == "proceedInsecure" || method == "useHttp") {
    if (list->size() != 2 || !(*list)[0].is_string() ||
        !(*list)[1].is_string()) {
      std::move(callback).Run(false, "", "invalid_argument",
                              "A page ID and failing URL are required");
      return;
    }
    BrowserWindowInterface* owner = nullptr;
    auto* catalog = aux::TabCatalog::GetForProfile(browser_->GetProfile());
    content::WebContents* contents = catalog ? catalog->FindPage(
        (*list)[0].GetString(), &owner) : nullptr;
    const base::DictValue* failure = aux::PageNavigationError(contents);
    const std::string* failed_url = failure ? failure->FindString("url") : nullptr;
    auto* helper = contents ? security_interstitials::
        SecurityInterstitialTabHelper::FromWebContents(contents) : nullptr;
    auto* blocking = helper ? helper->GetBlockingPageForFrame(
        contents->GetPrimaryMainFrame()->GetFrameTreeNodeId()) : nullptr;
    if (!contents || owner != browser_ || !failed_url || !blocking ||
        contents->GetVisibleURL().spec() != *failed_url) {
      std::move(callback).Run(true, "false", "", "");
      return;
    }
    const std::string& requested = (*list)[1].GetString();
    bool allowed = false;
    if (method == "proceedInsecure") {
      const int code = failure->FindInt("code").value_or(net::OK);
      allowed = requested == *failed_url && net::IsCertificateError(code) &&
          blocking->GetTypeForTesting() == SSLBlockingPage::kTypeForTesting;
    } else {
      const std::string* fallback = failure->FindString("upgradedFrom");
      auto* upgrade = HttpsOnlyModeTabHelper::FromWebContents(contents);
      allowed = fallback && requested == *fallback &&
          GURL(requested).SchemeIs("http") && upgrade &&
          upgrade->is_navigation_fallback() &&
          upgrade->fallback_url().spec() == requested &&
          blocking->GetTypeForTesting() == security_interstitials::
              HttpsOnlyModeBlockingPage::kTypeForTesting;
    }
    if (allowed) {
      blocking->CommandReceived(base::NumberToString(
          security_interstitials::CMD_PROCEED));
    }
    std::move(callback).Run(true, allowed ? "true" : "false", "", "");
    return;
  }
  if (method == "readArticle") {
    if (args.size() != 1 || !args[0].is_string()) {
      std::move(callback).Run(false, "", "invalid_argument", "Expected a page identity");
      return;
    }
    const std::string page_id = args[0].GetString();
    BrowserWindowInterface* owner = nullptr;
    auto* catalog = aux::TabCatalog::GetForProfile(browser_->GetProfile());
    content::WebContents* contents = catalog ? catalog->FindPage(page_id, &owner) : nullptr;
    if (!contents || owner != browser_ ||
        !contents->GetLastCommittedURL().SchemeIsHTTPOrHTTPS() ||
        !dom_distiller::url_utils::IsUrlDistillable(contents->GetLastCommittedURL())) {
      std::move(callback).Run(false, "", "not_found", "No readable page is available");
      return;
    }
    const auto* entry = contents->GetController().GetLastCommittedEntry();
    if (!entry) {
      std::move(callback).Run(false, "", "not_found", "The page has not loaded");
      return;
    }
    const int navigation_id = entry->GetUniqueID();
    const GURL url = contents->GetLastCommittedURL();
    auto reply = base::BindOnce(
        [](base::WeakPtr<WebUIBrowserUI> ui, std::string page_id,
           int navigation_id, GURL url, RequestCallback callback,
           const dom_distiller::DistilledArticleProto* article) {
          if (!ui) return;
          BrowserWindowInterface* current_owner = nullptr;
          auto* catalog = aux::TabCatalog::GetForProfile(ui->browser()->GetProfile());
          auto* page = catalog ? catalog->FindPage(page_id, &current_owner) : nullptr;
          const auto* entry = page ? page->GetController().GetLastCommittedEntry() : nullptr;
          if (!page || current_owner != ui->browser() || !entry ||
              entry->GetUniqueID() != navigation_id || page->GetLastCommittedURL() != url) {
            std::move(callback).Run(false, "", "stale_page", "The page changed while preparing Reader view");
            return;
          }
          if (!article || article->pages_size() == 0 ||
              article->pages(0).html().empty()) {
            std::move(callback).Run(false, "", "unavailable", "Reader could not extract this article");
            return;
          }
          std::string html;
          for (const auto& distilled_page : article->pages()) {
            if (html.size() + distilled_page.html().size() > 2 * 1024 * 1024) {
              std::move(callback).Run(false, "", "too_large", "This article is too large for Reader view");
              return;
            }
            html += distilled_page.html();
          }
          base::DictValue envelope;
          envelope.Set("title", article->title().empty()
                                    ? base::UTF16ToUTF8(page->GetTitle()) : article->title());
          envelope.Set("byline", "");
          envelope.Set("site", url.host());
          envelope.Set("url", url.spec());
          envelope.Set("minutes", 1);
          base::DictValue content;
          content.Set("tag", "__aux_distilled_html");
          base::ListValue children;
          children.Append(std::move(html));
          content.Set("children", std::move(children));
          envelope.Set("content", std::move(content));
          std::move(callback).Run(true, *base::WriteJson(envelope), "", "");
        }, weak_factory_.GetWeakPtr(), page_id, navigation_id, url,
        std::move(callback));
    (new ReaderRequest(contents, std::move(reply)))->Start();
    return;
  }
  if (method == "preview") {
    if (args.size() != 1 || !args[0].is_string()) {
      std::move(callback).Run(false, "", "invalid_argument",
                              "Expected a page identity");
      return;
    }
    BrowserWindowInterface* owner = nullptr;
    auto* catalog = aux::TabCatalog::GetForProfile(browser_->GetProfile());
    content::WebContents* contents =
        catalog ? catalog->FindPage(args[0].GetString(), &owner) : nullptr;
    if (!contents || owner != browser_) {
      std::move(callback).Run(false, "", "not_found",
                              "The page is no longer in this window");
      return;
    }
    auto* tab = tabs::TabInterface::MaybeGetFromContents(contents);
    auto* helper = tab ? ThumbnailTabHelper::From(tab) : nullptr;
    auto image = helper ? helper->thumbnail() : nullptr;
    if (!image) {
      std::move(callback).Run(true, "null", "", "");
      return;
    }
    const auto* entry = contents->GetController().GetLastCommittedEntry();
    const int navigation_id = entry ? entry->GetUniqueID() : 0;
    auto reply = base::BindOnce(
        [](base::WeakPtr<WebUIBrowserUI> ui, std::string page_id,
           int navigation_id, RequestCallback callback,
           ThumbnailImage::CompressedThumbnailData jpeg) {
          if (!ui) return;
          BrowserWindowInterface* current_owner = nullptr;
          auto* catalog = aux::TabCatalog::GetForProfile(ui->browser()->GetProfile());
          auto* page = catalog
              ? catalog->FindPage(page_id, &current_owner) : nullptr;
          const auto* entry = page
              ? page->GetController().GetLastCommittedEntry() : nullptr;
          if (!page || current_owner != ui->browser() || !entry ||
              entry->GetUniqueID() != navigation_id || !jpeg ||
              jpeg->data.empty() || jpeg->data.size() > 512 * 1024) {
            std::move(callback).Run(true, "null", "", "");
            return;
          }
          std::string encoded = base::Base64Encode(std::string_view(
              reinterpret_cast<const char*>(jpeg->data.data()),
              jpeg->data.size()));
          std::move(callback).Run(
              true,
              *base::WriteJson(base::Value("data:image/jpeg;base64," + encoded)),
              "", "");
        },
        weak_factory_.GetWeakPtr(), args[0].GetString(), navigation_id,
        std::move(callback));
    base::MakeRefCounted<PreviewRequest>(image, std::move(reply))->Start();
    return;
  }
  if (method == "httpAuthRequests" || method == "respondHttpAuth") {
    if (method == "httpAuthRequests" && !list->empty()) {
      std::move(callback).Run(false, "", "invalid_argument", "No arguments expected");
      return;
    }
    if (method == "respondHttpAuth" &&
        (list->size() != 2 || !(*list)[0].is_string() ||
         (!(*list)[1].is_none() && !(*list)[1].is_dict()))) {
      std::move(callback).Run(false, "", "invalid_argument", "Invalid authentication response");
      return;
    }
    auto* tabs = browser_->GetTabStripModel();
    base::ListValue requests;
    bool handled = false;
    for (int i = 0; i < tabs->count(); ++i) {
      auto* login = LoginTabHelper::FromWebContents(tabs->GetWebContentsAt(i));
      if (!login) continue;
      const auto pending = login->GetAuxAuthRequest();
      if (!pending) continue;
      if (method == "httpAuthRequests") {
        base::DictValue row;
        row.Set("id", pending->id);
        row.Set("origin", pending->origin);
        row.Set("realm", pending->realm);
        row.Set("proxy", pending->proxy);
        row.Set("retry", pending->retry);
        requests.Append(std::move(row));
        continue;
      }
      if (pending->id != (*list)[0].GetString()) continue;
      std::optional<net::AuthCredentials> credentials;
      if ((*list)[1].is_dict()) {
        const auto& value = (*list)[1].GetDict();
        const std::string* username = value.FindString("username");
        const std::string* password = value.FindString("password");
        if (!username || !password) {
          std::move(callback).Run(false, "", "invalid_argument", "Credentials are incomplete");
          return;
        }
        credentials.emplace(base::UTF8ToUTF16(*username),
                            base::UTF8ToUTF16(*password));
      }
      handled = login->RespondAuxAuth(pending->id, credentials);
      if (handled) aux::EmitShellEvent(browser_->GetProfile(), "onHttpAuthChanged", "{}");
      break;
    }
    if (method == "httpAuthRequests") {
      std::move(callback).Run(true, *base::WriteJson(requests), "", "");
    } else {
      std::move(callback).Run(true, handled ? "true" : "false", "", "");
    }
    return;
  }
  if (method == "crashReporting") {
    if (!list->empty()) {
      std::move(callback).Run(false, "", "invalid_argument",
                              "Crash reporting state takes no arguments");
      return;
    }
    base::DictValue result;
#if BUILDFLAG(IS_MAC)
    result.Set("available", aux_crash_reporting::HasConfiguredEndpoint());
    result.Set("decided", aux_crash_reporting::HasUserChoice());
    result.Set("consent", aux_crash_reporting::HasConsent());
#else
    result.Set("available", false);
    result.Set("decided", false);
    result.Set("consent", false);
#endif
    std::move(callback).Run(true, *base::WriteJson(base::Value(std::move(result))),
                            "", "");
    return;
  }
  if (method == "setCrashReporting") {
    if (browser_->GetProfile()->IsOffTheRecord()) {
      std::move(callback).Run(false, "", "forbidden",
                              "Crash reporting consent cannot change in Private mode");
      return;
    }
    if (list->size() != 1 || !(*list)[0].is_bool()) {
      std::move(callback).Run(false, "", "invalid_argument",
                              "A crash reporting choice is required");
      return;
    }
#if BUILDFLAG(IS_MAC)
    if (!aux_crash_reporting::HasConfiguredEndpoint()) {
      std::move(callback).Run(false, "", "backend_unavailable",
                              "This build has no crash report destination");
      return;
    }
    const bool consent = (*list)[0].GetBool();
    if (!aux_crash_reporting::SetConsent(consent)) {
      std::move(callback).Run(false, "", "forbidden",
                              "Crash reporting consent could not be saved");
      return;
    }
    std::move(callback).Run(true, consent ? "true" : "false", "", "");
#else
    std::move(callback).Run(false, "", "backend_unavailable",
                            "Crash reporting consent is unavailable on this platform");
#endif
    return;
  }
  if (method == "cookieControls") {
    if (!list->empty()) {
      std::move(callback).Run(false, "", "invalid_argument",
                              "Cookie controls take no arguments");
      return;
    }
    auto* prefs = browser_->GetProfile()->GetPrefs();
    base::DictValue result;
    result.Set("blockThirdParty",
               prefs->GetInteger(prefs::kCookieControlsMode) ==
                   static_cast<int>(content_settings::CookieControlsMode::kBlockThirdParty));
    result.Set("managed", prefs->IsManagedPreference(prefs::kCookieControlsMode));
    std::move(callback).Run(true, *base::WriteJson(base::Value(std::move(result))),
                            "", "");
    return;
  }
  if (method == "setCookieControls") {
    if (browser_->GetProfile()->IsOffTheRecord()) {
      std::move(callback).Run(false, "", "forbidden",
                              "Cookie controls cannot change in Private mode");
      return;
    }
    if (list->size() != 1 || !(*list)[0].is_bool()) {
      std::move(callback).Run(false, "", "invalid_argument",
                              "A third-party cookie setting is required");
      return;
    }
    auto* prefs = browser_->GetProfile()->GetPrefs();
    if (prefs->IsManagedPreference(prefs::kCookieControlsMode)) {
      std::move(callback).Run(false, "", "forbidden",
                              "Cookie controls are managed by your organization");
      return;
    }
    const bool block = (*list)[0].GetBool();
    prefs->SetInteger(prefs::kCookieControlsMode,
                      static_cast<int>(block ? content_settings::CookieControlsMode::kBlockThirdParty
                                             : content_settings::CookieControlsMode::kOff));
    std::move(callback).Run(true, block ? "true" : "false", "", "");
    return;
  }
  if (method == "httpsUpgrade") {
    if (!list->empty()) {
      std::move(callback).Run(false, "", "invalid_argument",
                              "HTTPS upgrade state takes no arguments");
      return;
    }
    auto* prefs = browser_->GetProfile()->GetPrefs();
    const bool policy_allowed = prefs->GetBoolean(prefs::kHttpsUpgradesEnabled);
    const bool available =
        policy_allowed && base::FeatureList::IsEnabled(features::kHttpsUpgrades);
    base::DictValue result;
    result.Set("enabled", available && prefs->GetBoolean(aux::kHttpsUpgradesEnabled));
    result.Set("available", available);
    result.Set("managed", !policy_allowed &&
                              prefs->IsManagedPreference(prefs::kHttpsUpgradesEnabled));
    std::move(callback).Run(true, *base::WriteJson(base::Value(std::move(result))),
                            "", "");
    return;
  }
  if (method == "setHttpsUpgrade") {
    if (browser_->GetProfile()->IsOffTheRecord()) {
      std::move(callback).Run(false, "", "forbidden",
                              "HTTPS upgrade settings cannot change in Private mode");
      return;
    }
    if (list->size() != 1 || !(*list)[0].is_bool()) {
      std::move(callback).Run(false, "", "invalid_argument",
                              "An HTTPS upgrade setting is required");
      return;
    }
    const bool enabled = (*list)[0].GetBool();
    auto* pref_service = browser_->GetProfile()->GetPrefs();
    if (enabled && !pref_service->GetBoolean(prefs::kHttpsUpgradesEnabled)) {
      std::move(callback).Run(false, "", "forbidden",
                              "HTTPS upgrades are disabled by browser policy");
      return;
    }
    if (enabled && !base::FeatureList::IsEnabled(features::kHttpsUpgrades)) {
      std::move(callback).Run(false, "", "backend_unavailable",
                              "HTTPS upgrades are unavailable in this build");
      return;
    }
    pref_service->SetBoolean(aux::kHttpsUpgradesEnabled, enabled);
    std::move(callback).Run(true, enabled ? "true" : "false", "", "");
    return;
  }
  if (method == "siteDataCount") {
    if (list->size() != 1 || !(*list)[0].is_string()) {
      std::move(callback).Run(false, "", "invalid_argument",
                              "A page ID is required to count website data");
      return;
    }
    BrowserWindowInterface* owner = nullptr;
    auto* profile = browser_->GetProfile();
    const std::string page_id = (*list)[0].GetString();
    content::WebContents* contents =
        aux::TabCatalog::GetForProfile(profile)->FindPage(page_id, &owner);
    if (!contents || owner != browser_ ||
        !contents->GetLastCommittedURL().SchemeIsHTTPOrHTTPS()) {
      std::move(callback).Run(false, "", "not_found",
                              "The website is no longer in this window");
      return;
    }
    const GURL url = contents->GetLastCommittedURL();
    const content::NavigationEntry* entry =
        contents->GetController().GetLastCommittedEntry();
    if (!entry) {
      std::move(callback).Run(false, "", "conflict",
                              "The page is still loading");
      return;
    }
    std::string domain = net::registry_controlled_domains::GetDomainAndRegistry(
        url, net::registry_controlled_domains::INCLUDE_PRIVATE_REGISTRIES);
    if (domain.empty() &&
        (url.HostIsIPAddress() || url.host().find('.') == std::string::npos)) {
      domain = url.host();
    }
    if (domain.empty()) {
      std::move(callback).Run(false, "", "invalid_argument",
                              "The website has no clearable domain");
      return;
    }
    profile->GetStoragePartitionForUrl(url)
        ->GetCookieManagerForBrowserProcess()
        ->GetAllCookies(mojo::WrapCallbackWithDefaultInvokeIfNotRun(
            base::BindOnce(
                [](base::WeakPtr<WebUIBrowserUI> ui, std::string page_id,
                   GURL expected_url, int navigation_id, std::string domain,
                   RequestCallback callback, const net::CookieList& cookies) {
                  if (!ui || !ui->IsAuthorizedAuxDocument()) {
                    std::move(callback).Run(false, "", "forbidden",
                                            "The Aux shell is no longer active");
                    return;
                  }
                  BrowserWindowInterface* owner = nullptr;
                  auto* current = aux::TabCatalog::GetForProfile(
                                      ui->browser_->GetProfile())
                                      ->FindPage(page_id, &owner);
                  const auto* current_entry = current
                      ? current->GetController().GetLastCommittedEntry()
                      : nullptr;
                  if (!current || owner != ui->browser_ ||
                      current->GetLastCommittedURL() != expected_url ||
                      !current_entry ||
                      current_entry->GetUniqueID() != navigation_id) {
                    std::move(callback).Run(false, "", "conflict",
                                            "The page changed. Review website data again");
                    return;
                  }
                  int count = 0;
                  for (const auto& cookie : cookies) {
                    std::string host = cookie.Domain();
                    if (!host.empty() && host.front() == '.') host.erase(0, 1);
                    if (host == domain ||
                        (host.size() > domain.size() &&
                         host.compare(host.size() - domain.size(),
                                      domain.size(), domain) == 0 &&
                         host[host.size() - domain.size() - 1] == '.')) {
                      ++count;
                    }
                  }
                  base::DictValue result;
                  result.Set("domain", domain);
                  result.Set("cookies", count);
                  std::move(callback).Run(
                      true, *base::WriteJson(base::Value(std::move(result))),
                      "", "");
                },
                weak_factory_.GetWeakPtr(), page_id, url,
                entry->GetUniqueID(), std::move(domain), std::move(callback)),
            net::CookieList()));
    return;
  }
  if (method == "clearSiteData") {
    if (list->size() != 1 || !(*list)[0].is_string()) {
      std::move(callback).Run(false, "", "invalid_argument",
                              "A page ID is required to clear website data");
      return;
    }
    BrowserWindowInterface* owner = nullptr;
    auto* profile = browser_->GetProfile();
    content::WebContents* contents =
        aux::TabCatalog::GetForProfile(profile)->FindPage(
            (*list)[0].GetString(), &owner);
    if (!contents || owner != browser_ ||
        !contents->GetLastCommittedURL().SchemeIsHTTPOrHTTPS()) {
      std::move(callback).Run(false, "", "not_found",
                              "The website is no longer in this window");
      return;
    }
    const GURL url = contents->GetLastCommittedURL();
    std::string domain = net::registry_controlled_domains::GetDomainAndRegistry(
        url, net::registry_controlled_domains::INCLUDE_PRIVATE_REGISTRIES);
    if (domain.empty() &&
        (url.HostIsIPAddress() || url.host().find('.') == std::string::npos)) {
      domain = url.host();
    }
    if (domain.empty()) {
      std::move(callback).Run(false, "", "invalid_argument",
                              "The website has no clearable domain");
      return;
    }
    auto filter = content::BrowsingDataFilterBuilder::Create(
        content::BrowsingDataFilterBuilder::Mode::kDelete);
    filter->AddRegisterableDomain(domain);
    auto* remover = profile->GetBrowsingDataRemover();
    auto* observer = new SiteDataRemoval(remover, base::BindOnce(
        [](RequestCallback callback, uint64_t failed_data_types) {
          if (failed_data_types) {
            std::move(callback).Run(false, "", "backend_unavailable",
                                    "Website data could not be completely cleared");
          } else {
            std::move(callback).Run(true, "true", "", "");
          }
        }, std::move(callback)));
    remover->RemoveWithFilterAndReply(
        base::Time(), base::Time::Max(),
        content::BrowsingDataRemover::DATA_TYPE_DOM_STORAGE |
            content::BrowsingDataRemover::DATA_TYPE_COOKIES,
        content::BrowsingDataRemover::ORIGIN_TYPE_UNPROTECTED_WEB |
            content::BrowsingDataRemover::ORIGIN_TYPE_PROTECTED_WEB,
        std::move(filter), observer);
    return;
  }
  if (method == "sitePermissions") {
    if (!list->empty()) {
      std::move(callback).Run(false, "", "invalid_argument",
                              "Site permissions take no arguments");
      return;
    }
    auto* profile = browser_->GetProfile();
    auto* map = HostContentSettingsMapFactory::GetForProfile(profile);
    std::move(callback).Run(
        true, *base::WriteJson(SavedSitePermissions(map, profile->IsOffTheRecord())),
        "", "");
    return;
  }
  if (method == "clearSitePermission") {
    if (list->empty() || list->size() > 2 || !(*list)[0].is_string() ||
        (list->size() == 2 && !(*list)[1].is_string())) {
      std::move(callback).Run(false, "", "invalid_argument",
                              "Invalid permission reset request");
      return;
    }
    const GURL url((*list)[0].GetString());
    if (!url.is_valid() || !url.SchemeIsHTTPOrHTTPS() ||
        url::Origin::Create(url).Serialize() != (*list)[0].GetString()) {
      std::move(callback).Run(false, "", "invalid_argument",
                              "An exact website origin is required");
      return;
    }
    const std::string requested = list->size() == 2 ? (*list)[1].GetString() : "";
    if (!requested.empty() && requested != "media" &&
        std::ranges::none_of(kSitePermissionKinds,
                             [&](const SitePermissionKind& kind) {
                               return kind.name == requested;
                             })) {
      std::move(callback).Run(false, "", "invalid_argument",
                              "Unknown website permission");
      return;
    }
    auto* profile = browser_->GetProfile();
    auto* map = HostContentSettingsMapFactory::GetForProfile(profile);
    for (const auto& kind : kSitePermissionKinds) {
      if (!requested.empty() && requested != kind.name &&
          !(requested == "media" &&
            (kind.name == "media:audio" || kind.name == "media:video"))) {
        continue;
      }
      for (const auto& rule : map->GetSettingsForOneType(kind.type)) {
        std::string origin;
        if (!SavedSitePermission(rule, profile->IsOffTheRecord(), &origin) ||
            origin != (*list)[0].GetString()) {
          continue;
        }
        map->SetContentSettingCustomScope(rule.primary_pattern,
                                          rule.secondary_pattern, kind.type,
                                          CONTENT_SETTING_DEFAULT);
      }
    }
    std::move(callback).Run(true, "true", "", "");
    return;
  }
  if (method == "privatePageZoom") {
    if (!browser_->GetProfile()->IsOffTheRecord()) {
      std::move(callback).Run(false, "", "permission_denied",
                              "Private page zoom is only available in Private windows");
      return;
    }
    if (list->size() != 2 || !(*list)[0].is_string() || !(*list)[1].is_dict()) {
      std::move(callback).Run(false, "", "invalid_argument",
                              "Invalid Private page zoom request");
      return;
    }
    BrowserWindowInterface* owner = nullptr;
    auto* catalog = aux::TabCatalog::GetForProfile(browser_->GetProfile());
    content::WebContents* contents =
        catalog->FindPage((*list)[0].GetString(), &owner);
    if (!contents || owner != browser_) {
      std::move(callback).Run(false, "", "not_found",
                              "The page is no longer in this window");
      return;
    }
    auto* zoom_controller = zoom::ZoomController::FromWebContents(contents);
    if (!zoom_controller) {
      std::move(callback).Run(false, "", "backend_unavailable",
                              "Page zoom is unavailable");
      return;
    }
    const base::DictValue& options = (*list)[1].GetDict();
    const double current = zoom_controller->GetZoomLevel();
    double next = current;
    bool requested = false;
    constexpr double kZoomBase = 1.2;
    constexpr std::array<int, 16> kZoomPercentages = {
        25, 33, 50, 67, 75, 90, 100, 110, 125, 150, 175, 200, 250, 300, 400, 500};
    if (options.FindBool("reset").value_or(false)) {
      requested = true;
      next = zoom_controller->GetDefaultZoomLevel();
    } else if (const std::string* direction = options.FindString("direction")) {
      if (*direction != "in" && *direction != "out") {
        std::move(callback).Run(false, "", "invalid_argument",
                                "Invalid zoom direction");
        return;
      }
      requested = true;
      const int current_percent =
          static_cast<int>(std::round(100.0 * std::pow(kZoomBase, current)));
      int stepped = *direction == "in" ? 500 : 25;
      for (int percentage : kZoomPercentages) {
        if (*direction == "in" && percentage > current_percent) {
          stepped = percentage;
          break;
        }
        if (*direction == "out" && percentage < current_percent)
          stepped = percentage;
      }
      next = std::log(stepped / 100.0) / std::log(kZoomBase);
    } else if (const std::optional<double> level = options.FindDouble("level")) {
      requested = true;
      next = *level;
    } else if (const std::optional<double> delta = options.FindDouble("delta")) {
      requested = true;
      next += *delta;
    }
    if (!std::isfinite(next)) {
      std::move(callback).Run(false, "", "invalid_argument", "Invalid page zoom");
      return;
    }
    if (requested) {
      next = std::clamp(next, std::log(0.25) / std::log(kZoomBase),
                        std::log(5.0) / std::log(kZoomBase));
    }
    if (requested && next != current && !zoom_controller->SetZoomLevel(next)) {
      std::move(callback).Run(false, "", "backend_unavailable",
                              "Page zoom is disabled");
      return;
    }
    base::DictValue result;
    result.Set("level", zoom_controller->GetZoomLevel());
    std::move(callback).Run(true, *base::WriteJson(result), "", "");
    return;
  }
  if (method == "siteZoom") {
    if (list->size() > 1 || (!list->empty() && !(*list)[0].is_string())) {
      std::move(callback).Run(false, "", "invalid_argument", "Invalid saved zoom request");
      return;
    }
    auto* map = content::HostZoomMap::GetDefaultForBrowserContext(browser_->GetProfile());
    auto key = [](const content::HostZoomMap::ZoomLevelChange& entry) {
      return entry.scheme.empty() ? entry.host : entry.scheme + "://" + entry.host;
    };
    if (!list->empty()) {
      for (const auto& entry : map->GetAllZoomLevels()) {
        if (key(entry) != (*list)[0].GetString()) continue;
        if (entry.scheme.empty()) map->SetZoomLevelForHost(entry.host, 0);
        else map->SetZoomLevelForHostAndScheme(entry.scheme, entry.host, 0);
      }
      if (shell_host_client_.is_bound())
        shell_host_client_->OnEvent("onSiteZoomChanged", "{}");
    }
    base::ListValue result;
    for (const auto& entry : map->GetAllZoomLevels()) {
      if (entry.mode == content::HostZoomMap::ZOOM_CHANGED_TEMPORARY_ZOOM ||
          entry.host.empty()) continue;
      base::DictValue row;
      row.Set("origin", key(entry));
      row.Set("percentage", static_cast<int>(std::round(
          blink::ZoomLevelToZoomFactor(entry.zoom_level) * 100)));
      result.Append(std::move(row));
    }
    std::move(callback).Run(true, *base::WriteJson(result), "", "");
    return;
  }
  if (method == "siteInfo" || method == "setSiteTrackers") {
    if (list->size() != (method == "siteInfo" ? 1u : 2u) ||
        !(*list)[0].is_string() ||
        (method == "setSiteTrackers" && !(*list)[1].is_bool())) {
      std::move(callback).Run(false, "", "invalid_argument",
                              "Invalid site controls request");
      return;
    }
    const std::string page_id = (*list)[0].GetString();
    BrowserWindowInterface* owner = nullptr;
    auto* catalog = aux::TabCatalog::GetForProfile(browser_->GetProfile());
    content::WebContents* contents = catalog->FindPage(page_id, &owner);
    if (!contents || owner != browser_ ||
        !contents->GetLastCommittedURL().SchemeIsHTTPOrHTTPS()) {
      std::move(callback).Run(false, "", "not_found",
                              "The website is no longer in this window");
      return;
    }
    const GURL url = contents->GetLastCommittedURL();
    const content::NavigationEntry* entry =
        contents->GetController().GetLastCommittedEntry();
    if (!entry) {
      std::move(callback).Run(false, "", "conflict",
                              "The page is still loading");
      return;
    }
    const int navigation_id = entry->GetUniqueID();
    auto* blocker =
        aux::ContentBlockingController::ForProfile(browser_->GetProfile());
    if (method == "setSiteTrackers") {
      const bool allowed = (*list)[1].GetBool();
      if (browser_->GetProfile()->IsOffTheRecord()) {
        const bool previous = blocker->IsAllowed(url.host());
        if (!blocker->SetPrivateSiteAllowed(url.host(), allowed)) {
          std::move(callback).Run(false, "", "invalid_argument",
                                  "Invalid private site exception");
          return;
        }
        aux::ZapController::ForProfile(browser_->GetProfile())
            ->RefreshCosmetic(base::BindOnce(
                [](base::WeakPtr<WebUIBrowserUI> owner, std::string page_id,
                   GURL url, int navigation_id, bool previous, bool allowed,
                   RequestCallback callback, bool applied) {
                  if (!owner) return;
                  auto* profile = owner->browser_->GetProfile();
                  auto* catalog = aux::TabCatalog::GetForProfile(profile);
                  auto* page = catalog ? catalog->FindPage(page_id) : nullptr;
                  const auto* entry = page
                      ? page->GetController().GetLastCommittedEntry() : nullptr;
                  if (!page || page->GetLastCommittedURL() != url || !entry ||
                      entry->GetUniqueID() != navigation_id) applied = false;
                  if (!applied) {
                    aux::ContentBlockingController::ForProfile(profile)
                        ->SetPrivateSiteAllowed(url.host(), previous);
                    aux::ZapController::ForProfile(profile)->RefreshCosmetic(
                        base::BindOnce(
                            [](RequestCallback callback, bool) {
                              std::move(callback).Run(
                                  false, "", "conflict",
                                  "The page changed or rejected the cosmetic rule");
                            }, std::move(callback)));
                    return;
                  }
                  base::DictValue result;
                  result.Set("hostname", url.host());
                  result.Set("allowed", allowed);
                  std::move(callback).Run(true, *base::WriteJson(result), "", "");
                }, weak_factory_.GetWeakPtr(), page_id, url, navigation_id,
                previous, allowed, std::move(callback)));
        return;
      }
      base::DictValue params;
      params.Set("hostname", url.host());
      params.Set("allowed", allowed);
      base::DictValue site_guard;
      site_guard.Set("pageId", page_id);
      site_guard.Set("expectedUrl", url.spec());
      site_guard.Set("navigationId", navigation_id);
      params.Set("siteGuard", std::move(site_guard));
      AuxRuntimeHost::ForProfile(browser_->GetProfile())
          ->CallInternal("blocking.setSiteAllowed", *base::WriteJson(params),
                         base::BindOnce(
                             [](RequestCallback callback,
                                AuxRuntimeHost::Response response) {
                               std::move(callback).Run(
                                   response.ok, response.result_json,
                                   response.error_code, response.error_message);
                             },
                             std::move(callback)));
      return;
    }
    base::DictValue result;
    result.Set("pageId", page_id);
    result.Set("url", url.spec());
    const std::string origin = url::Origin::Create(url).Serialize();
    result.Set("origin", origin);
    result.Set("title", base::UTF16ToUTF8(contents->GetTitle()));
    result.Set("security",
               url.SchemeIs("https")
                   ? (chrome_security_state::GetSecurityLevel(contents) ==
                              security_state::SECURE
                          ? "secure"
                          : "insecure")
                   : (url.HostIsIPAddress() || url.host() == "localhost"
                          ? "local"
                          : "insecure"));
    result.Set("trackersAllowed",
               !blocker->enabled() || blocker->IsAllowed(url.host()));
    result.Set("blockedCount", blocker->BlockedForSite(url.host()));
    auto* map = HostContentSettingsMapFactory::GetForProfile(browser_->GetProfile());
    base::DictValue saved = SavedSitePermissions(
        map, browser_->GetProfile()->IsOffTheRecord());
    const base::DictValue* decisions = saved.FindDict(origin);
    result.Set("permissions", decisions ? decisions->Clone() : base::DictValue());
    browser_->GetProfile()
        ->GetStoragePartitionForUrl(url)
        ->GetCookieManagerForBrowserProcess()
        ->GetCookieList(
            url, net::CookieOptions::MakeAllInclusive(),
            net::CookiePartitionKeyCollection::ContainsAll(),
            mojo::WrapCallbackWithDefaultInvokeIfNotRun(
                base::BindOnce(
                    [](base::WeakPtr<WebUIBrowserUI> ui, std::string page_id,
                       GURL expected_url, int navigation_id,
                       base::DictValue result, RequestCallback callback,
                       const net::CookieAccessResultList& cookies,
                       const net::CookieAccessResultList&) {
                      if (!ui || !ui->IsAuthorizedAuxDocument()) {
                        std::move(callback).Run(
                            false, "", "forbidden",
                            "The Aux shell is no longer active");
                        return;
                      }
                      BrowserWindowInterface* owner = nullptr;
                      content::WebContents* current =
                          aux::TabCatalog::GetForProfile(
                              ui->browser_->GetProfile())
                              ->FindPage(page_id, &owner);
                      if (!current || owner != ui->browser_ ||
                          current->GetLastCommittedURL() != expected_url ||
                          !current->GetController().GetLastCommittedEntry() ||
                          current->GetController()
                                  .GetLastCommittedEntry()
                                  ->GetUniqueID() != navigation_id) {
                        std::move(callback).Run(
                            false, "", "conflict",
                            "The page changed. Open site controls again");
                        return;
                      }
                      result.Set("cookieCount",
                                 static_cast<int>(cookies.size()));
                      std::move(callback).Run(true, *base::WriteJson(result),
                                              "", "");
                    },
                    weak_factory_.GetWeakPtr(), page_id, url, navigation_id,
                    std::move(result), std::move(callback)),
                net::CookieAccessResultList(), net::CookieAccessResultList()));
    return;
  }
  std::move(callback).Run(false, "", "not_found",
                          "Unsupported Aux shell method: " + method);
}
#endif
