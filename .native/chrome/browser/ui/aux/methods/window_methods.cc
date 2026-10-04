// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "chrome/browser/ui/webui_browser/webui_browser_ui.h"
#include "chrome/browser/ui/aux/native_appearance_file_channel.h"

#include "base/base64.h"
#include "base/command_line.h"
#include <cmath>
#include <cstdio>
#include <optional>
#include <utility>
#include <variant>
#include <vector>

#include "base/files/file_util.h"
#include "base/functional/bind.h"
#include "base/memory/ref_counted_memory.h"
#include "base/strings/string_util.h"
#include "base/strings/utf_string_conversions.h"
#include "base/time/time.h"
#include "base/task/thread_pool.h"
#include "build/build_config.h"
#include "chrome/browser/shell_integration.h"
#include "printing/buildflags/buildflags.h"
#include "content/public/browser/host_zoom_map.h"
#include "third_party/blink/public/common/page/page_zoom.h"
#include "base/json/json_reader.h"
#include "base/json/json_writer.h"
#include "base/notimplemented.h"
#include "base/strings/string_number_conversions.h"
#include "base/strings/utf_string_conversions.h"
#include "chrome/browser/bookmarks/bookmark_model_factory.h"
#include "chrome/browser/buildflags.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include "chrome/browser/ui/aux/journey_fixture_path.h"
#include "chrome/browser/ui/aux/method_registry.h"
#include "chrome/browser/ui/aux/native_aux_warm_fixture.h"
#include "chrome/browser/ui/aux/native_aux_warm_owner.h"
#include "chrome/browser/ui/aux/native_startup_presentation_session.h"
#include "chrome/browser/ui/aux/native_startup_launch_receipt.h"
#include "chrome/browser/ui/aux/native_command_presentation_session.h"
#include "chrome/browser/ui/aux/native_guest_presentation_fixture.h"
#include "chrome/browser/ui/aux/native_little_presentation_fixture.h"
#if BUILDFLAG(ENABLE_AUX_SHELL)
#include "chrome/browser/ui/aux/native_pip_presentation_fixture.h"
#endif
#include "chrome/browser/ui/aux/native_performance_mailbox.h"
#include "chrome/browser/ui/aux/native_cdp_measurement_producer.h"
#include "chrome/browser/ui/aux/native_stop_input_endpoint.h"
#include "chrome/browser/ui/aux/native_organization_work_fixture.h"
#include "chrome/browser/ui/aux/native_shell_memory.h"
#include "chrome/browser/ui/aux/native_process_memory_sampler.h"
#endif
#include "chrome/browser/platform_util.h"
#include "chrome/browser/download/download_prefs.h"
#include "components/download/public/common/download_item.h"
#include "content/public/browser/download_manager.h"
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
#include "chrome/browser/ui/toolbar/back_forward_menu_model.h"
#include "ui/display/screen.h"
#include "ui/base/clipboard/scoped_clipboard_writer.h"
#include "ui/views/controls/menu/menu_item_view.h"
#include "ui/views/controls/menu/menu_model_adapter.h"
#include "ui/views/controls/menu/menu_runner.h"
#include "chrome/browser/ui/aux/appearance_prefs.h"
#include "chrome/browser/ui/aux/native_utility_appearance_owner.h"
#include "chrome/browser/ui/aux/content_blocking_controller.h"
#include "chrome/browser/ui/aux/dictation_mac.h"
#include "chrome/browser/ui/aux/extension_bridge.h"
#include "chrome/browser/ui/aux/migration_import.h"
#include "chrome/browser/ui/aux/runtime_host.h"
#include "chrome/browser/ui/aux/shell_events.h"
#include "chrome/browser/ui/aux/organization_store.h"
#include "chrome/browser/ui/aux/profile_search_engine.h"
#include "chrome/browser/ui/aux/quick_ask_controller.h"
#include "chrome/browser/ui/aux/little_window_controller.h"
#include "chrome/browser/ui/aux/methods/shortcuts_methods.h"
#include "chrome/browser/ui/aux/methods/layout_methods.h"
#include "chrome/browser/ui/aux/result_preview.h"
#include "chrome/browser/ui/aux/tab_catalog.h"
#include "chrome/browser/ui/aux/page_identity.h"
#include "chrome/browser/picture_in_picture/picture_in_picture_window_manager.h"
#include "chrome/browser/ui/aux/zap_controller.h"
#include "components/guest_contents/browser/guest_contents_handle.h"
#include "components/prefs/pref_change_registrar.h"
#include "components/prefs/pref_service.h"
#endif
#include "chrome/browser/contextual_search/contextual_search_service_factory.h"
#include "chrome/browser/profiles/profile.h"
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
#include "chrome/grit/webui_toolbar_shared_resources.h"
#include "chrome/grit/webui_toolbar_shared_resources_map.h"
#include "components/contextual_search/contextual_search_service.h"
#include "components/contextual_search/contextual_search_session_handle.h"
#include "components/favicon_base/favicon_url_parser.h"
#include "components/guest_contents/browser/guest_contents_host_impl.h"
#include "components/surface_embed/common/features.h"
#include "content/public/browser/browser_context.h"
#include "content/public/browser/navigation_controller.h"
#include "content/public/browser/navigation_entry.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/weak_document_ptr.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/storage_partition.h"
#include "content/public/browser/web_ui.h"
#include "content/public/browser/web_ui_data_source.h"
#include "services/network/public/mojom/content_security_policy.mojom.h"
#if BUILDFLAG(ENABLE_AUX_SHELL)
#include "net/cookies/cookie_options.h"
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

enum AuxContextCommand {
  kAuxContextBack = 1,
  kAuxContextForward = 2,
  kAuxContextReload = 3,
  kAuxContextCopyAddress = 4,
  kAuxContextAskAboutPage = 5,
  kAuxContextSummarizePage = 6,
};

struct ResolvedOpenPath {
  base::FilePath path;
  bool allowed = false;
  bool directory = false;
};

// Resolve symlinks before checking roots or file type. Only document-like
// files under Aux storage or the user's download locations may launch an app.
ResolvedOpenPath ResolveOpenPath(base::FilePath requested,
                                 std::vector<base::FilePath> roots,
                                 std::vector<base::FilePath> completed_downloads,
                                 bool reveal_only) {
  const base::FilePath path = base::MakeAbsoluteFilePath(requested);
  if (path.empty()) return {};
  if (reveal_only) return {path, true, false};
  static const auto* blocked = new std::set<std::string>({
      ".app", ".command", ".sh", ".bash", ".zsh", ".csh", ".fish",
      ".tool", ".terminal", ".pkg", ".mpkg", ".scpt", ".scptd",
      ".applescript", ".workflow", ".action", ".jar", ".exe",
      ".bat", ".cmd", ".msi", ".ps1", ".vbs", ".py", ".rb",
      ".pl", ".php", ".webloc", ".inetloc", ".fileloc", ".desktop",
      ".dmg", ".xip", ".mobileconfig", ".appex"});
  for (base::FilePath component = path; !component.empty() &&
                                   component != component.DirName();
       component = component.DirName()) {
    if (blocked->contains(base::ToLowerASCII(component.Extension()))) return {};
  }
  const bool directory = base::DirectoryExists(path);
  if (!directory) {
#if BUILDFLAG(IS_POSIX)
    int permissions = 0;
    if (!base::GetPosixFilePermissions(path, &permissions) ||
        (permissions & (base::FILE_PERMISSION_EXECUTE_BY_USER |
                        base::FILE_PERMISSION_EXECUTE_BY_GROUP |
                        base::FILE_PERMISSION_EXECUTE_BY_OTHERS))) {
      return {};
    }
#else
    return {};
#endif
  }
  for (const base::FilePath& download : completed_downloads) {
    if (base::MakeAbsoluteFilePath(download) == path)
      return {path, true, false};
  }
  for (const base::FilePath& root : roots) {
    const base::FilePath resolved_root = base::MakeAbsoluteFilePath(root);
    if (!resolved_root.empty() && resolved_root.IsParent(path))
      return {path, true, directory};
  }
  return {};
}

}  // namespace

bool WebUIBrowserUI::IsCommandIdEnabled(int command_id) const {
  BrowserWindowInterface* owner = nullptr;
  auto* catalog = aux::TabCatalog::GetForProfile(browser_->GetProfile());
  auto* contents = catalog
      ? catalog->FindPage(aux_context_page_id_, &owner) : nullptr;
  if (!contents || owner != browser_ ||
      contents != browser_->GetTabStripModel()->GetActiveWebContents())
    return false;
  auto& navigation = contents->GetController();
  if (command_id == kAuxContextBack) return navigation.CanGoBack();
  if (command_id == kAuxContextForward) return navigation.CanGoForward();
  if (command_id == kAuxContextCopyAddress)
    return contents->GetLastCommittedURL().SchemeIsHTTPOrHTTPS();
  if (command_id == kAuxContextAskAboutPage ||
      command_id == kAuxContextSummarizePage) {
    const GURL& url = contents->GetLastCommittedURL();
    return !browser_->GetProfile()->IsOffTheRecord() &&
           url.SchemeIsHTTPOrHTTPS() && url.spec().size() <= 2048 &&
           !url.has_username() && !url.has_password();
  }
  return command_id == kAuxContextReload;
}

void WebUIBrowserUI::ExecuteCommand(int command_id, int event_flags) {
  if (!IsCommandIdEnabled(command_id)) return;
  BrowserWindowInterface* owner = nullptr;
  auto* contents = aux::TabCatalog::GetForProfile(browser_->GetProfile())
      ->FindPage(aux_context_page_id_, &owner);
  if (!contents || owner != browser_) return;
  auto& navigation = contents->GetController();
  switch (command_id) {
    case kAuxContextBack:
      navigation.GoBack();
      break;
    case kAuxContextForward:
      navigation.GoForward();
      break;
    case kAuxContextReload:
      navigation.Reload(content::ReloadType::NORMAL, true);
      break;
    case kAuxContextCopyAddress: {
      ui::ScopedClipboardWriter writer(ui::ClipboardBuffer::kCopyPaste);
      writer.WriteText(base::UTF8ToUTF16(contents->GetLastCommittedURL().spec()));
      break;
    }
    case kAuxContextAskAboutPage:
    case kAuxContextSummarizePage: {
      const std::string url = contents->GetLastCommittedURL().spec();
      const auto* entry = navigation.GetLastCommittedEntry();
      auto* runtime = AuxRuntimeHost::ForProfile(browser_->GetProfile());
      if (!entry || !runtime) break;
      const int navigation_id = entry->GetUniqueID();
      const std::string page_id = aux_context_page_id_;
      const std::string window_id =
          base::NumberToString(browser_->GetSessionID().id());
      const std::string title =
          base::UTF16ToUTF8(contents->GetTitle().substr(0, 512));
      const std::string action_name = command_id == kAuxContextSummarizePage
                                          ? "summarize" : "ask";
      // The runtime owns documentEpoch and sessionId. Read both from its
      // authenticated current page list, then recheck the native tab before
      // emitting an action. A stale or unavailable identity creates no draft.
      runtime->CallApi("pages.list", "{}",
          base::BindOnce(
              [](base::WeakPtr<WebUIBrowserUI> self, std::string page_id,
                 std::string window_id, std::string url, std::string title,
                 std::string action_name, int navigation_id,
                 AuxRuntimeHost::Response response) {
                if (!self || !response.ok ||
                    !self->IsAuthorizedAuxDocument()) return;
                BrowserWindowInterface* owner = nullptr;
                auto* catalog = aux::TabCatalog::GetForProfile(
                    self->browser_->GetProfile());
                auto* page = catalog ? catalog->FindPage(page_id, &owner) : nullptr;
                if (!page || owner != self->browser_ ||
                    page != self->browser_->GetTabStripModel()->GetActiveWebContents() ||
                    page->GetLastCommittedURL().spec() != url ||
                    !page->GetController().GetLastCommittedEntry() ||
                    page->GetController().GetLastCommittedEntry()->GetUniqueID() != navigation_id)
                  return;
                auto parsed = base::JSONReader::Read(response.result_json,
                                                      base::JSON_PARSE_RFC);
                if (!parsed || !parsed->is_list()) return;
                for (const auto& item : parsed->GetList()) {
                  if (!item.is_dict()) continue;
                  const auto& target = item.GetDict();
                  const std::string* id = target.FindString("pageId");
                  const std::string* target_window = target.FindString("windowId");
                  const std::string* target_url = target.FindString("url");
                  const auto epoch = target.FindInt("documentEpoch");
                  if (!id || *id != page_id || !target_window ||
                      *target_window != window_id || !target_url ||
                      *target_url != url || !epoch || *epoch < 0) continue;
                  base::DictValue action;
                  action.Set("pageId", page_id);
                  action.Set("windowId", window_id);
                  action.Set("url", url);
                  action.Set("topUrl", url);
                  action.Set("documentEpoch", *epoch);
                  if (const std::string* session = target.FindString("sessionId"))
                    action.Set("sessionId", *session);
                  action.Set("title", title);
                  action.Set("capturedAt", static_cast<double>(
                      base::Time::Now().InMillisecondsSinceUnixEpoch()));
                  action.Set("action", action_name);
                  action.Set("selection", "");
                  action.Set("truncated", false);
                  if (auto json = base::WriteJson(base::Value(std::move(action))))
                    aux::EmitShellEvent(self->browser_->GetProfile(),
                                        "onPageAction", *json);
                  return;
                }
              }, weak_factory_.GetWeakPtr(), page_id, window_id, url, title,
              action_name, navigation_id));
      break;
    }
  }
}

#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
bool WebUIBrowserUI::DeferAuxGuestTabSwitchForTesting(const gfx::NativeEvent& event,
    base::OnceClosure registered_effect) {
  return aux::NativePerformanceObservationEnabled() && IsAuthorizedAuxDocument() &&
      guest_presentation_fixture_ && guest_presentation_fixture_->DeferConsumedTabSwitch(
          event, std::move(registered_effect));
}
void WebUIBrowserUI::ObserveAuxPerformanceInput(const gfx::NativeEvent& event) {
  if (command_presentation_session_) command_presentation_session_->ObserveNativeInput(event);
}
#endif

void WebUIBrowserUI::HandleAuxWindowRequest(
    const std::string& method, const base::ListValue& args,
    RequestCallback callback) {
  const base::ListValue* list = &args;
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
  if (method == "performanceFixtureNextRequest") {
    auto* shell = web_ui() ? web_ui()->GetWebContents() : nullptr;
    auto* frame = shell ? shell->GetPrimaryMainFrame() : nullptr;
    if (!args.empty() || !aux::NativePerformanceObservationEnabled() ||
        !IsAuthorizedAuxDocument() || !frame || frame != web_ui()->GetRenderFrameHost()) {
      std::move(callback).Run(false, "", "forbidden", "Private fixture mailbox requires its current owner");
      return;
    }
    if (!performance_mailbox_)
      performance_mailbox_ = std::make_unique<aux::NativePerformanceMailbox>(GetWeakPtr());
    performance_mailbox_->Next(base::BindOnce(
        [](base::WeakPtr<WebUIBrowserUI> ui, content::WeakDocumentPtr document,
           RequestCallback callback, std::optional<base::DictValue> request) {
          auto* frame = document.AsRenderFrameHostIfValid();
          if (!ui || !aux::NativePerformanceObservationEnabled() || !ui->IsAuthorizedAuxDocument() ||
              !ui->web_ui() || !ui->web_ui()->GetWebContents() || !frame ||
              frame != ui->web_ui()->GetRenderFrameHost() ||
              frame != ui->web_ui()->GetWebContents()->GetPrimaryMainFrame()) {
            std::move(callback).Run(false, "", "forbidden", "Private fixture mailbox owner changed"); return;
          }
          const auto json = request ? base::WriteJson(*request) : std::nullopt;
          std::move(callback).Run(json && json->size() <= 512, json.value_or(""),
              json ? "" : "unavailable", json ? "" : "Private fixture mailbox unavailable");
        }, GetWeakPtr(), frame->GetWeakDocumentPtr(), std::move(callback)));
    return;
  }
  if (method == "prepareCdpStopMeasurement" || method == "prepareCdpTakeoverMeasurement" ||
      method == "completeCdpRetirementMeasurement") {
    auto* contents = web_ui() ? web_ui()->GetWebContents() : nullptr;
    auto* frame = contents ? contents->GetPrimaryMainFrame() : nullptr;
    if (!args.empty() || !aux::NativePerformanceObservationEnabled() || !IsAuthorizedAuxDocument() ||
        !frame || frame != web_ui()->GetRenderFrameHost()) {
      std::move(callback).Run(false, "", "forbidden", "CDP measurement requires its original fixture owner"); return;
    }
    const auto sequence = performance_mailbox_ ? performance_mailbox_->TakeExpected(method) : std::nullopt;
    if (!sequence) {
      std::move(callback).Run(false, "", "forbidden", "CDP measurement requires its owned mailbox operation"); return;
    }
    if (!cdp_measurement_producer_)
      cdp_measurement_producer_ = std::make_unique<aux::NativeCdpMeasurementProducer>(browser());
    if (method == "prepareCdpTakeoverMeasurement") stop_input_endpoint_.reset();
    const auto operation = method == "completeCdpRetirementMeasurement" ?
        aux::NativeCdpMeasurementProducer::Operation::kComplete : method == "prepareCdpStopMeasurement" ?
        aux::NativeCdpMeasurementProducer::Operation::kPrepareStop :
        aux::NativeCdpMeasurementProducer::Operation::kPrepareTakeover;
    auto record = operation == aux::NativeCdpMeasurementProducer::Operation::kComplete ?
        base::DictValue() : cdp_measurement_producer_->Run(operation);
    auto reply = base::BindOnce([](base::WeakPtr<WebUIBrowserUI> ui,
        content::WeakDocumentPtr document, uint64_t sequence, std::string operation,
        RequestCallback callback, base::DictValue record, bool ready) {
      auto* frame = document.AsRenderFrameHostIfValid();
      if (!ui || !aux::NativePerformanceObservationEnabled() || !ui->IsAuthorizedAuxDocument() ||
          !ui->web_ui() || !ui->web_ui()->GetWebContents() || !frame ||
          frame != ui->web_ui()->GetRenderFrameHost() ||
          frame != ui->web_ui()->GetWebContents()->GetPrimaryMainFrame()) {
        std::move(callback).Run(false, "", "forbidden", "CDP measurement owner changed"); return;
      }
      if (ready && operation == "completeCdpRetirementMeasurement") {
        record = ui->cdp_measurement_producer_->Run(aux::NativeCdpMeasurementProducer::Operation::kComplete);
        ui->stop_input_endpoint_.reset();
      }
      if (!ready) {
        if (ui->cdp_measurement_producer_)
          ui->cdp_measurement_producer_->Run(aux::NativeCdpMeasurementProducer::Operation::kComplete);
        record = base::DictValue().Set("producer", "aux-native-cdp-retirement")
            .Set("version", 1).Set("status", "refused");
      }
      if (!ui->performance_mailbox_ || !ui->performance_mailbox_->EmitReply(sequence, operation, record)) {
        std::move(callback).Run(false, "", "forbidden", "CDP measurement reply changed"); return;
      }
      const auto json = base::WriteJson(record);
      std::move(callback).Run(json && json->size() <= 16000, json.value_or(""),
          json ? "" : "unavailable", json ? "" : "CDP measurement unavailable");
    }, GetWeakPtr(), frame->GetWeakDocumentPtr(), *sequence, method,
        std::move(callback), std::move(record));
    if (method == "prepareCdpStopMeasurement") {
      stop_input_endpoint_.reset();
      stop_input_endpoint_ = std::make_unique<aux::NativeStopInputEndpoint>(frame, cdp_measurement_producer_.get());
      stop_input_endpoint_->Prepare(base::BindOnce([](base::WeakPtr<WebUIBrowserUI> ui,
          base::OnceCallback<void(bool)> reply, bool ready) {
        if (!ready || !ui || !ui->cdp_measurement_producer_) {
          std::move(reply).Run(false); return;
        }
        ui->cdp_measurement_producer_->WaitForFreshDispatches(std::move(reply));
      }, GetWeakPtr(), std::move(reply)));
    } else {
      if (method == "completeCdpRetirementMeasurement") {
        if (stop_input_endpoint_) stop_input_endpoint_->WaitForMeasuredCompletion(std::move(reply));
        else std::move(reply).Run(true);
      } else cdp_measurement_producer_->WaitForFreshDispatches(std::move(reply));
    }
    return;
  }
#if BUILDFLAG(ENABLE_AUX_SHELL)
  if (method == "preparePipWindowPresentation" || method == "completePipWindowPresentation" || method == "retirePipWindowPresentation") {
    auto* contents = web_ui() ? web_ui()->GetWebContents() : nullptr;
    auto* frame = contents ? contents->GetPrimaryMainFrame() : nullptr;
    if (!args.empty() || !aux::NativePerformanceObservationEnabled() || !IsAuthorizedAuxDocument() ||
        !frame || frame != web_ui()->GetRenderFrameHost()) {
      std::move(callback).Run(false, "", "forbidden", "PiP root presentation fixture requires its current owner and no arguments"); return;
    }
    const auto sequence = performance_mailbox_ ? performance_mailbox_->TakeExpected(method) : std::nullopt;
    if (!sequence) {
      std::move(callback).Run(false, "", "forbidden", "PiP root presentation fixture requires its owned mailbox operation"); return;
    }
    if (!pip_presentation_fixture_ || (method == "preparePipWindowPresentation" && pip_presentation_fixture_->HasRetired()))
      pip_presentation_fixture_ = std::make_unique<aux::NativePipPresentationFixture>(GetWeakPtr());
    auto reply = base::BindOnce([](base::WeakPtr<WebUIBrowserUI> ui,
        content::WeakDocumentPtr document, uint64_t sequence, std::string operation,
        RequestCallback callback, base::DictValue record) {
      auto* frame = document.AsRenderFrameHostIfValid();
      if (!ui || !aux::NativePerformanceObservationEnabled() || !ui->IsAuthorizedAuxDocument() ||
          !ui->web_ui() || !ui->web_ui()->GetWebContents() || !frame ||
          frame != ui->web_ui()->GetRenderFrameHost() ||
          frame != ui->web_ui()->GetWebContents()->GetPrimaryMainFrame()) {
        std::move(callback).Run(false, "", "forbidden", "PiP root presentation fixture owner changed"); return;
      }
      if (!ui->performance_mailbox_ || !ui->performance_mailbox_->EmitReply(sequence, operation, record)) {
        std::move(callback).Run(false, "", "forbidden", "PiP root presentation fixture reply changed"); return;
      }
      const auto json = base::WriteJson(record);
      std::move(callback).Run(json && json->size() <= 16384, json.value_or(""),
          json ? "" : "unavailable", json ? "" : "PiP root presentation fixture unavailable");
    }, GetWeakPtr(), frame->GetWeakDocumentPtr(), *sequence, method, std::move(callback));
    if (method == "completePipWindowPresentation") pip_presentation_fixture_->Complete(std::move(reply));
    else if (method == "retirePipWindowPresentation") pip_presentation_fixture_->Retire(std::move(reply));
    else pip_presentation_fixture_->Prepare(std::move(reply));
    return;
  }
#endif
  if (method == "prepareLittleWindowPresentation" || method == "completeLittleWindowPresentation") {
    auto* contents = web_ui() ? web_ui()->GetWebContents() : nullptr;
    auto* frame = contents ? contents->GetPrimaryMainFrame() : nullptr;
    if (!args.empty() || !aux::NativePerformanceObservationEnabled() || !IsAuthorizedAuxDocument() ||
        !frame || frame != web_ui()->GetRenderFrameHost()) {
      std::move(callback).Run(false, "", "forbidden", "Little presentation fixture requires its current owner and no arguments"); return;
    }
    const auto sequence = performance_mailbox_ ? performance_mailbox_->TakeExpected(method) : std::nullopt;
    if (!sequence) {
      std::move(callback).Run(false, "", "forbidden", "Little presentation fixture requires its owned mailbox operation"); return;
    }
    if (!little_presentation_fixture_)
      little_presentation_fixture_ = std::make_unique<aux::NativeLittlePresentationFixture>(GetWeakPtr());
    auto reply = base::BindOnce([](base::WeakPtr<WebUIBrowserUI> ui,
        content::WeakDocumentPtr document, uint64_t sequence, std::string operation,
        RequestCallback callback, base::DictValue record) {
      auto* frame = document.AsRenderFrameHostIfValid();
      if (!ui || !aux::NativePerformanceObservationEnabled() || !ui->IsAuthorizedAuxDocument() ||
          !ui->web_ui() || !ui->web_ui()->GetWebContents() || !frame ||
          frame != ui->web_ui()->GetRenderFrameHost() ||
          frame != ui->web_ui()->GetWebContents()->GetPrimaryMainFrame()) {
        std::move(callback).Run(false, "", "forbidden", "Little presentation fixture owner changed"); return;
      }
      if (!ui->performance_mailbox_ || !ui->performance_mailbox_->EmitReply(sequence, operation, record)) {
        std::move(callback).Run(false, "", "forbidden", "Little presentation fixture reply changed"); return;
      }
      const auto json = base::WriteJson(record);
      std::move(callback).Run(json && json->size() <= 16384, json.value_or(""),
          json ? "" : "unavailable", json ? "" : "Little presentation fixture unavailable");
    }, GetWeakPtr(), frame->GetWeakDocumentPtr(), *sequence, method, std::move(callback));
    if (method == "completeLittleWindowPresentation") little_presentation_fixture_->Complete(std::move(reply));
    else little_presentation_fixture_->Prepare(std::move(reply));
    return;
  }
  if (method == "prepareOrganizationAutoArchiveWork" ||
      method == "prepareOrganizationLiveFolderWork" || method == "completeOrganizationWork") {
    auto* contents = web_ui() ? web_ui()->GetWebContents() : nullptr;
    auto* frame = contents ? contents->GetPrimaryMainFrame() : nullptr;
    if (!args.empty() || !aux::NativePerformanceObservationEnabled() || !IsAuthorizedAuxDocument() ||
        !frame || frame != web_ui()->GetRenderFrameHost()) {
      std::move(callback).Run(false, "", "forbidden", "Organization work fixture requires its current owner and no arguments"); return;
    }
    const auto sequence = performance_mailbox_ ? performance_mailbox_->TakeExpected(method) : std::nullopt;
    if (!sequence) {
      std::move(callback).Run(false, "", "forbidden", "Organization work fixture requires its owned mailbox operation"); return;
    }
    if (!organization_work_fixture_)
      organization_work_fixture_ = std::make_unique<aux::NativeOrganizationWorkFixture>(GetWeakPtr());
    auto reply = base::BindOnce([](base::WeakPtr<WebUIBrowserUI> ui,
        content::WeakDocumentPtr document, uint64_t sequence, std::string operation,
        RequestCallback callback, base::DictValue record) {
      auto* frame = document.AsRenderFrameHostIfValid();
      if (!ui || !aux::NativePerformanceObservationEnabled() || !ui->IsAuthorizedAuxDocument() ||
          !ui->web_ui() || !ui->web_ui()->GetWebContents() || !frame ||
          frame != ui->web_ui()->GetRenderFrameHost() ||
          frame != ui->web_ui()->GetWebContents()->GetPrimaryMainFrame()) {
        std::move(callback).Run(false, "", "forbidden", "Organization work fixture owner changed"); return;
      }
      record.Set("operation", operation);
      if (!ui->performance_mailbox_ || !ui->performance_mailbox_->EmitReply(sequence, operation, record)) {
        std::move(callback).Run(false, "", "forbidden", "Organization work fixture reply changed"); return;
      }
      const auto json = base::WriteJson(record);
      std::move(callback).Run(json && json->size() <= 16384, json.value_or(""),
          json ? "" : "unavailable", json ? "" : "Organization work fixture unavailable");
    }, GetWeakPtr(), frame->GetWeakDocumentPtr(), *sequence, method, std::move(callback));
    if (method == "completeOrganizationWork") organization_work_fixture_->Complete(std::move(reply));
    else organization_work_fixture_->Prepare(method == "prepareOrganizationAutoArchiveWork" ?
        blink::mojom::NativeOrganizationWorkMetric::kAutoArchive :
        blink::mojom::NativeOrganizationWorkMetric::kLiveFolderRefresh, std::move(reply));
    return;
  }
  if (method == "prepareGuestSplitDropPresentation" ||
      method == "prepareGuestDividerFramePresentation" ||
      method == "prepareGuestTabSwitchPresentation" ||
      method == "completeGuestPresentation" || method == "sampleShellMemory" || method == "sampleProcessMemory" ||
      method == "prepareSubagentMemoryWorkload" || method == "prepareAuxWarmWindow" ||
      method == "completeAuxWarmWindow") {
    if (!args.empty()) {
      std::move(callback).Run(false, "", "invalid_argument", "Guest fixture takes no arguments");
      return;
    }
    auto* contents = web_ui() ? web_ui()->GetWebContents() : nullptr;
    auto* frame = contents ? contents->GetPrimaryMainFrame() : nullptr;
    if (!aux::NativePerformanceObservationEnabled() || !IsAuthorizedAuxDocument() ||
        !frame || frame != web_ui()->GetRenderFrameHost()) {
      std::move(callback).Run(false, "", "forbidden", "Guest fixture requires its current owned shell");
      return;
    }
    const auto mailbox_sequence = performance_mailbox_ ? performance_mailbox_->TakeExpected(method) : std::nullopt;
    if (!mailbox_sequence) {
      std::move(callback).Run(false, "", "forbidden", "Guest fixture requires its owned mailbox operation"); return;
    }
    auto reply = base::BindOnce([](base::WeakPtr<WebUIBrowserUI> ui,
        content::WeakDocumentPtr document, uint64_t sequence, std::string operation,
        RequestCallback callback, base::DictValue record) {
      auto* frame = document.AsRenderFrameHostIfValid();
      if (!ui || !aux::NativePerformanceObservationEnabled() || !ui->IsAuthorizedAuxDocument() ||
          !ui->web_ui() || !ui->web_ui()->GetWebContents() || !frame ||
          frame != ui->web_ui()->GetRenderFrameHost() ||
          frame != ui->web_ui()->GetWebContents()->GetPrimaryMainFrame()) {
        std::move(callback).Run(false, "", "forbidden", "Guest fixture owner changed");
        return;
      }
      if (!ui->performance_mailbox_ || !ui->performance_mailbox_->EmitReply(sequence, operation, record)) {
        std::move(callback).Run(false, "", "forbidden", "Private fixture reply owner changed"); return;
      }
      const auto json = base::WriteJson(record);
      if (!json || json->size() > 16384) {
        std::move(callback).Run(false, "", "unavailable", "Guest fixture record is unavailable");
        return;
      }
      std::move(callback).Run(true, *json, "", "");
    }, GetWeakPtr(), frame->GetWeakDocumentPtr(), *mailbox_sequence, method, std::move(callback));
    if (method == "prepareAuxWarmWindow" || method == "completeAuxWarmWindow") {
      if (!aux::NativeStartupObservationEnabled()) {
        std::move(reply).Run(base::DictValue().Set("producer", "aux-native-warm-window")
            .Set("version", 1).Set("status", "refused").Set("measured", false)
            .Set("reason", "startup_observer_not_admitted"));
        return;
      }
      if (!warm_window_fixture_ && method == "prepareAuxWarmWindow") {
        auto original = startup_presentation_session_ ?
            startup_presentation_session_->TakeOriginalWarmOwner() : nullptr;
        if (original) warm_window_fixture_ =
            std::make_unique<aux::NativeAuxWarmFixture>(std::move(original));
      }
      if (!warm_window_fixture_) {
        std::move(reply).Run(base::DictValue().Set("producer", "aux-native-warm-window")
            .Set("version", 1).Set("status", "refused").Set("measured", false)
            .Set("reason", "missing_original_cold_owner"));
        return;
      }
      if (method == "prepareAuxWarmWindow") warm_window_fixture_->Prepare(GetWeakPtr(), std::move(reply));
      else warm_window_fixture_->Complete(GetWeakPtr(), std::move(reply));
      return;
    }
    if (method == "sampleProcessMemory" || method == "prepareSubagentMemoryWorkload") {
      if (!process_memory_sampler_)
        process_memory_sampler_ = std::make_unique<aux::NativeProcessMemorySampler>(GetWeakPtr());
      if (method == "prepareSubagentMemoryWorkload") process_memory_sampler_->PrepareSubagents(std::move(reply));
      else process_memory_sampler_->Sample(std::move(reply));
      return;
    }
    if (method == "sampleShellMemory") {
      if (!shell_memory_sampler_)
        shell_memory_sampler_ = std::make_unique<aux::NativeShellMemorySampler>(GetWeakPtr());
      std::move(reply).Run(shell_memory_sampler_->Sample());
      return;
    }
    if (!guest_presentation_fixture_)
      guest_presentation_fixture_ = std::make_unique<aux::NativeGuestPresentationFixture>(GetWeakPtr());
    if (method == "completeGuestPresentation") {
      guest_presentation_fixture_->Complete(std::move(reply));
    } else {
      const auto metric = method == "prepareGuestSplitDropPresentation" ?
          blink::mojom::NativeGuestStageMetric::kSplitDrop :
          method == "prepareGuestDividerFramePresentation" ?
          blink::mojom::NativeGuestStageMetric::kDividerFrame :
          blink::mojom::NativeGuestStageMetric::kTabSwitch;
      guest_presentation_fixture_->Prepare(metric, std::move(reply));
    }
    return;
  }
#endif
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
  if (method == "commandPresentationSnapshot") {
    if (!args.empty()) {
      std::move(callback).Run(false, "", "invalid_argument", "Command presentation takes no arguments");
      return;
    }
    if (!aux::NativePerformanceObservationEnabled() || !IsAuthorizedAuxDocument()) {
      std::move(callback).Run(false, "", "forbidden", "Command presentation requires the authorized test shell");
      return;
    }
    if (!command_presentation_session_)
      command_presentation_session_ = std::make_unique<aux::NativeCommandPresentationSession>(GetWeakPtr());
    // Prepare always resolves a nonnull callback, including a rejected request.
    command_presentation_session_->Prepare(base::BindOnce(
        [](base::WeakPtr<WebUIBrowserUI> ui, RequestCallback callback,
           bool measured, base::DictValue record) {
          if (!ui || !aux::NativePerformanceObservationEnabled() || !ui->IsAuthorizedAuxDocument()) {
            std::move(callback).Run(false, "", "forbidden", "Command presentation shell changed");
            return;
          }
          auto json = base::WriteJson(record);
          std::move(callback).Run(json.has_value(), json.value_or(""),
              json ? "" : "internal_error", json ? "" : "Command presentation record unavailable");
        }, GetWeakPtr(), std::move(callback)));
    return;
  }
  if (method == "pipAppearanceSnapshot") {
    if (!args.empty()) {
      std::move(callback).Run(false, "", "invalid_argument", "PiP appearance snapshot takes no arguments");
      return;
    }
    if (!aux::NativeAppearanceObservationEnabled() || !IsAuthorizedAuxDocument()) {
      std::move(callback).Run(false, "", "forbidden", "PiP appearance requires the authorized test shell");
      return;
    }
    auto* contents = web_ui()->GetWebContents();
    auto* frame = contents->GetPrimaryMainFrame();
    auto* window = WebUIBrowserWindow::FromWebShellWebContents(contents);
    auto* profile = Profile::FromWebUI(web_ui());
    if (!frame || frame != web_ui()->GetRenderFrameHost() || !window ||
        window->browser() != browser_ || browser_->GetProfile() != profile) {
      std::move(callback).Run(false, "", "unavailable", "PiP appearance owner is unavailable");
      return;
    }
    const auto document = frame->GetWeakDocumentPtr();
    const auto self = weak_factory_.GetWeakPtr();
    const auto shell_contents = contents->GetWeakPtr();
    const auto before = window->GetAuxAppearanceSnapshot();
    const auto owner_window_id = before.FindInt("windowId");
    if (!self || !shell_contents || !document.AsRenderFrameHostIfValid() ||
        window != WebUIBrowserWindow::FromWebShellWebContents(shell_contents.get())) {
      std::move(callback).Run(false, "", "unavailable", "PiP appearance shell changed"); return;
    }
    auto owns_opener = base::BindRepeating(
        [](base::WeakPtr<WebUIBrowserUI> ui, content::WebContents* opener) {
          if (!ui || !aux::NativeAppearanceObservationEnabled() || !ui->IsAuthorizedAuxDocument() ||
              !opener || opener->IsBeingDestroyed()) return false;
          auto* shell = ui->web_ui()->GetWebContents();
          auto* window = WebUIBrowserWindow::FromWebShellWebContents(shell);
          auto* profile = Profile::FromWebUI(ui->web_ui());
          auto* identity = aux::PageIdentity::FromWebContents(opener);
          auto* catalog = aux::TabCatalog::GetForProfile(profile);
          BrowserWindowInterface* owner = nullptr;
          return window && window->browser() == ui->browser_ && catalog && identity &&
              opener->GetBrowserContext() == profile &&
              catalog->FindPage(identity->id(), &owner) == opener && owner == window->browser();
        }, weak_factory_.GetWeakPtr());
    auto result = PictureInPictureWindowManager::GetInstance()->SnapshotNativePipAppearanceForTesting(
        profile, std::move(owns_opener));
    if (!self || !shell_contents) {
      std::move(callback).Run(false, "", "unavailable", "PiP appearance shell was destroyed"); return;
    }
    auto* current = document.AsRenderFrameHostIfValid();
    auto* after_window = WebUIBrowserWindow::FromWebShellWebContents(contents);
    const auto after = after_window ? after_window->GetAuxAppearanceSnapshot() : base::DictValue();
    if (!self || !shell_contents) {
      std::move(callback).Run(false, "", "unavailable", "PiP appearance shell was destroyed"); return;
    }
    const auto same = [&](const char* key) {
      const auto* lhs = before.Find(key); const auto* rhs = after.Find(key);
      return lhs && rhs && *lhs == *rhs;
    };
    if (!aux::NativeAppearanceObservationEnabled() || !IsAuthorizedAuxDocument() ||
        !current || current != contents->GetPrimaryMainFrame() || current != web_ui()->GetRenderFrameHost() ||
        after_window != window || Profile::FromWebUI(web_ui()) != profile ||
        !same("pid") || !same("windowId") || !same("frame") || !result ||
        !owner_window_id || *owner_window_id <= 0 ||
        result->FindInt("pid") != before.FindInt("pid") ||
        result->FindInt("windowId") == owner_window_id) {
      std::move(callback).Run(false, "", "unavailable", "PiP appearance owner changed or is absent");
      return;
    }
    result->Set("ownerWindowId", *owner_window_id);
    const auto json = base::WriteJson(base::Value(std::move(*result)));
    static size_t emitted = 0;
    if (!json || json->size() > 4096 || emitted >= 4000) {
      std::move(callback).Run(false, "", "unavailable", "PiP appearance observation is unavailable");
      return;
    }
    ++emitted;
    std::fprintf(stderr, "AUX_NATIVE_PIP_APPEARANCE_V1 %s\n", json->c_str());
    std::fflush(stderr);
    std::move(callback).Run(true, *json, "", "");
    return;
  }
  if (method == "appearanceSnapshot") {
    if (!args.empty()) {
      std::move(callback).Run(false, "", "invalid_argument", "Appearance snapshot takes no arguments");
      return;
    }
    if (!aux::NativeAppearanceObservationEnabled() ||
        !IsAuthorizedAuxDocument()) {
      std::move(callback).Run(false, "", "forbidden", "Appearance snapshot requires the authorized test shell");
      return;
    }
    auto* contents = web_ui()->GetWebContents();
    auto* frame = contents->GetPrimaryMainFrame();
    auto* window = WebUIBrowserWindow::FromWebShellWebContents(contents);
    if (!frame || frame != web_ui()->GetRenderFrameHost() || !window) {
      std::move(callback).Run(false, "", "unavailable", "Appearance target is unavailable");
      return;
    }
    const auto original_ui = GetWeakPtr();
    const auto original_contents = contents->GetWeakPtr();
    const auto original_document = frame->GetWeakDocumentPtr();
    const auto original_browser = browser_->GetWeakPtr();
    const auto still_original = [&]() {
      return original_ui && original_contents && original_browser &&
          original_ui->web_ui()->GetWebContents() == original_contents.get() &&
          original_ui->browser_ == original_browser.get() &&
          original_document.AsRenderFrameHostIfValid() &&
          original_document.AsRenderFrameHostIfValid() == original_contents->GetPrimaryMainFrame() &&
          original_document.AsRenderFrameHostIfValid() == original_ui->web_ui()->GetRenderFrameHost() &&
          WebUIBrowserWindow::FromWebShellWebContents(original_contents.get()) == window &&
          window->browser() == original_browser.get();
    };
    const bool utility_target = !browser_->GetProfile()->IsOffTheRecord() &&
        !aux::IsQuickAskWindow(browser_);
    auto before_utility = utility_target
        ? aux::ReadNativeUtilityAppearanceOwner(GetWeakPtr()) : std::nullopt;
    if (!still_original()) {
      std::move(callback).Run(false, "", "unavailable", "Appearance owner changed during readback");
      return;
    }
    auto before = window->GetAuxAppearanceSnapshot();
    if (!still_original() || before.empty() ||
        (before_utility && before_utility->FindInt("windowId") != before.FindInt("windowId"))) {
      std::move(callback).Run(false, "", "unavailable", "Native appearance is unavailable");
      return;
    }
    frame->ExecuteJavaScript(uR"JS((() => {
      const root = document.documentElement, app = document.querySelector('.app');
      const theme = root.dataset.theme;
      const vertical = !!app?.classList.contains('tabs-vertical');
      const horizontal = !!app?.classList.contains('tabs-horizontal');
      return {theme: theme === 'light' || theme === 'dark' ? theme : null,
        layout: vertical !== horizontal ? (vertical ? 'vertical' : 'horizontal') : null,
        sidebarAppearance: root.dataset.sidebarAppearance === 'translucent' ? 'translucent'
          : root.dataset.sidebarAppearance === 'solid' ? 'solid' : null,
        systemDark: matchMedia('(prefers-color-scheme: dark)').matches,
        reduceMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
        reduceTransparency: matchMedia('(prefers-reduced-transparency: reduce)').matches};
    })())JS", base::BindOnce(
        [](base::WeakPtr<WebUIBrowserUI> ui, content::WeakDocumentPtr document,
           base::DictValue before, bool utility_target,
           std::optional<base::DictValue> before_utility,
           RequestCallback callback, base::Value value) {
          if (!ui || !aux::NativeAppearanceObservationEnabled() || !ui->IsAuthorizedAuxDocument()) {
            std::move(callback).Run(false, "", "forbidden", "Appearance shell changed");
            return;
          }
          auto* contents = ui->web_ui()->GetWebContents();
          auto* frame = document.AsRenderFrameHostIfValid();
          auto* window = WebUIBrowserWindow::FromWebShellWebContents(contents);
          if (!frame || frame != contents->GetPrimaryMainFrame() ||
              frame != ui->web_ui()->GetRenderFrameHost() || !window || !value.is_dict()) {
            std::move(callback).Run(false, "", "unavailable", "Appearance document changed");
            return;
          }
          const auto shell_weak = contents->GetWeakPtr();
          const auto browser_weak = ui->browser_->GetWeakPtr();
          const auto still_original = [&]() {
            return ui && shell_weak && browser_weak &&
                ui->web_ui()->GetWebContents() == shell_weak.get() &&
                ui->browser_ == browser_weak.get() &&
                document.AsRenderFrameHostIfValid() &&
                document.AsRenderFrameHostIfValid() == shell_weak->GetPrimaryMainFrame() &&
                document.AsRenderFrameHostIfValid() == ui->web_ui()->GetRenderFrameHost() &&
                WebUIBrowserWindow::FromWebShellWebContents(shell_weak.get()) == window &&
                window->browser() == browser_weak.get();
          };
          auto result = window->GetAuxAppearanceSnapshot();
          if (!still_original()) {
            std::move(callback).Run(false, "", "unavailable", "Appearance owner changed during readback");
            return;
          }
          const auto same = [&](const char* key) {
            const auto* a = before.Find(key); const auto* b = result.Find(key);
            return a && b && *a == *b;
          };
          if (result.empty() || !same("pid") || !same("windowId") || !same("frame") ||
              !same("nativeTheme") || !same("backing") || !same("material")) {
            std::move(callback).Run(false, "", "unavailable", "Appearance window changed");
            return;
          }
          if (utility_target) {
            auto after_utility = aux::ReadNativeUtilityAppearanceOwner(ui);
            if (!still_original() ||
                (after_utility && after_utility->FindInt("windowId") != result.FindInt("windowId")) ||
                before_utility.has_value() != after_utility.has_value() ||
                (before_utility && !aux::NativeUtilityAppearanceOwnerMatches(
                    *before_utility, *after_utility))) {
              std::move(callback).Run(false, "", "unavailable", "Utility appearance owner changed");
              return;
            }
            if (after_utility) result.Set("utilityOwnership", std::move(*after_utility));
            else result.Set("utilityOwnership", base::Value());
          }
          const auto& observed = value.GetDict();
          base::DictValue shell;
          for (const char* key : {"theme", "layout", "sidebarAppearance"}) {
            const auto* entry = observed.Find(key);
            if (!entry || (!entry->is_string() && !entry->is_none())) {
              std::move(callback).Run(false, "", "unavailable", "Shell appearance observation is invalid");
              return;
            }
            shell.Set(key, entry->Clone());
          }
          for (const char* key : {"systemDark", "reduceMotion", "reduceTransparency"}) {
            const auto entry = observed.FindBool(key);
            if (!entry.has_value()) {
              std::move(callback).Run(false, "", "unavailable", "Shell preference observation is invalid");
              return;
            }
            shell.Set(key, *entry);
          }
          result.Set("shell", std::move(shell));
          result.Set("windowKind", ui->browser_->GetProfile()->IsOffTheRecord() ? "private" :
              aux::IsQuickAskWindow(ui->browser_) ? "quick-ask" :
              aux::IsLittleWindow(ui->browser_) ? "little" : "normal");
          result.Set("producer", "aux-native-appearance-snapshot"); result.Set("version", 1);
          // Private windows have no RuntimeHost. Read the actual compiled native
          // identity at this same guarded document/window join, never a label
          // supplied by the renderer or observation caller.
          std::optional<std::string> private_identity_json;
          if (ui->browser_->GetProfile()->IsOffTheRecord()) {
            const auto capabilities = aux::AuxMethodRegistry::Get().Capabilities();
            const auto* build_id = capabilities.FindString("buildId");
            const auto* source_commit = capabilities.FindString("sourceCommit");
            if (!build_id || !source_commit || build_id->empty() || source_commit->empty()) {
              std::move(callback).Run(false, "", "unavailable", "Private native identity is unavailable");
              return;
            }
            base::DictValue identity;
            identity.Set("buildId", *build_id);
            identity.Set("sourceCommit", *source_commit);
            base::DictValue receipt;
            receipt.Set("producer", "aux-native-private-window-observation");
            receipt.Set("version", 1);
            receipt.Set("native", std::move(identity));
            receipt.Set("runtimeStatus", "inactive-private");
            receipt.Set("appearance", result.Clone());
            private_identity_json = base::WriteJsonWithOptions(base::Value(std::move(receipt)),
                base::JsonOptions::OPTIONS_OMIT_DOUBLE_TYPE_PRESERVATION);
            if (!private_identity_json || private_identity_json->size() > 4096) {
              std::move(callback).Run(false, "", "unavailable", "Private native identity is invalid");
              return;
            }
          }
          const auto json = base::WriteJson(base::Value(std::move(result)));
          if (!json || json->size() > 4096) {
            std::move(callback).Run(false, "", "unavailable", "Appearance observation is invalid");
            return;
          }
          static size_t emitted = 0;
          if (emitted >= 4000) {
            std::move(callback).Run(false, "", "unavailable", "Appearance observation limit reached");
            return;
          }
          if (utility_target && base::CommandLine::ForCurrentProcess()->HasSwitch("aux-native-appearance-file-observer") &&
              !aux::PublishNativeAppearanceFileRecord(ui->browser_->GetProfile(), *json)) {
            std::move(callback).Run(false, "", "unavailable", "Original native appearance file publication refused");
            return;
          }
          ++emitted;
          std::fprintf(stderr, "AUX_NATIVE_APPEARANCE_V1 %s\n", json->c_str());
          if (private_identity_json) {
            std::fprintf(stderr, "AUX_NATIVE_PRIVATE_WINDOW_V1 %s\n",
                         private_identity_json->c_str());
          }
          std::fflush(stderr);
          std::move(callback).Run(true, *json, "", "");
        }, GetWeakPtr(), frame->GetWeakDocumentPtr(), std::move(before),
           utility_target, std::move(before_utility), std::move(callback)));
    return;
  }
#endif
  if (method == "windowControlsVisible") {
    if (args.size() != 1 || !args[0].is_bool()) {
      std::move(callback).Run(false, "", "invalid_argument", "Expected window controls visibility");
      return;
    }
    if (!browser_ || browser_->GetType() != BrowserWindowInterface::TYPE_NORMAL ||
        aux::IsLittleWindow(browser_.get()) || aux::IsQuickAskWindow(browser_.get())) {
      std::move(callback).Run(false, "", "unavailable", "Window controls require a browser window");
      return;
    }
    const bool ok = aux::SetWindowControlsVisible(browser_.get(), args[0].GetBool());
    std::move(callback).Run(ok, ok ? "true" : "", ok ? "" : "unavailable", ok ? "" : "Browser window unavailable");
    return;
  }
  if (method == "littleWindow" || method == "externalLinkTarget" || method == "showTabWindow") {
    auto result = aux::HandleLittleWindow(browser_, method, args);
    if (!result) {
      std::move(callback).Run(false, "", "invalid_argument", "Invalid Little window request");
      return;
    }
    std::move(callback).Run(true, *base::WriteJson(*result), "", "");
    return;
  }
  if (method == "dispatchCommand") {
    const std::string* id = args.size() == 1 ? args[0].GetIfString() : nullptr;
    if (!id || !aux::DispatchNativeAuxCommand(browser_.get(), *id)) {
      std::move(callback).Run(false, "", "invalid_argument", "Unavailable Aux native command");
      return;
    }
    std::move(callback).Run(true, "true", "", "");
    return;
  }
  if (method == "quickAskShortcut") {
    if (list->size() > 1 || (list->size() == 1 &&
                             !(*list)[0].is_bool() && !(*list)[0].is_none())) {
      std::move(callback).Run(false, "", "invalid_argument",
                              "Expected an optional enabled flag");
      return;
    }
    const auto status = list->empty() || (*list)[0].is_none()
        ? aux::GetQuickAskShortcutStatus()
        : aux::SetQuickAskShortcutEnabled((*list)[0].GetBool());
    base::DictValue result;
    result.Set("enabled", status.enabled);
    result.Set("registered", status.registered);
    result.Set("error", status.error);
    std::move(callback).Run(true, *base::WriteJson(base::Value(std::move(result))),
                            "", "");
    return;
  }
  if (method == "quickAsk") {
    if (list->size() != 1 || !(*list)[0].is_string()) {
      std::move(callback).Run(false, "", "invalid_argument",
                              "Expected a Quick Ask action");
      return;
    }
    const std::string& action = (*list)[0].GetString();
    if (action == "status") {
      std::move(callback).Run(true,
                              aux::IsQuickAskWindow(browser_) ? "true" : "false",
                              "", "");
      return;
    }
    if (action == "open") {
      const bool opened = aux::OpenQuickAsk(browser_->GetProfile());
      std::move(callback).Run(opened, opened ? "true" : "",
                              opened ? "" : "unavailable",
                              opened ? "" : "Quick Ask could not open.");
      return;
    }
    if (action == "dismiss" || action == "expand") {
      if (!aux::IsQuickAskWindow(browser_)) {
        std::move(callback).Run(false, "", "forbidden",
                                "Only the Quick Ask window can do that.");
        return;
      }
      std::move(callback).Run(true, "false", "", "");
      if (action == "expand")
        aux::ExpandQuickAsk(browser_);
      else
        aux::DismissQuickAsk(browser_);
      return;
    }
    std::move(callback).Run(false, "", "invalid_argument",
                            "Unknown Quick Ask action");
    return;
  }
  if (method == "contextMenu") {
    if (list->size() != 1 ||
        (!(*list)[0].is_none() && !(*list)[0].is_string())) {
      std::move(callback).Run(false, "", "invalid_argument",
                              "Expected a page identity or editable target");
      return;
    }
    if ((*list)[0].is_none()) {
      std::move(callback).Run(true, "false", "", "");
      return;
    }
    BrowserWindowInterface* owner = nullptr;
    auto* catalog = aux::TabCatalog::GetForProfile(browser_->GetProfile());
    auto* contents = catalog
        ? catalog->FindPage((*list)[0].GetString(), &owner) : nullptr;
    if (!contents || owner != browser_ ||
        contents != browser_->GetTabStripModel()->GetActiveWebContents()) {
      std::move(callback).Run(true, "false", "", "");
      return;
    }
    aux_context_menu_runner_.reset();
    aux_context_menu_adapter_.reset();
    aux_context_menu_model_.reset();
    aux_context_page_id_ = (*list)[0].GetString();
    aux_context_menu_model_ = std::make_unique<ui::SimpleMenuModel>(this);
    aux_context_menu_model_->AddItem(kAuxContextBack, u"Back");
    aux_context_menu_model_->AddItem(kAuxContextForward, u"Forward");
    aux_context_menu_model_->AddItem(kAuxContextReload, u"Reload");
    aux_context_menu_model_->AddSeparator(ui::NORMAL_SEPARATOR);
    aux_context_menu_model_->AddItem(kAuxContextCopyAddress,
                                    u"Copy page address");
    aux_context_menu_model_->AddSeparator(ui::NORMAL_SEPARATOR);
    aux_context_menu_model_->AddItem(kAuxContextAskAboutPage,
                                    u"Ask about this page");
    aux_context_menu_model_->AddItem(kAuxContextSummarizePage,
                                    u"Summarize page");
    aux_context_menu_adapter_ = std::make_unique<views::MenuModelAdapter>(
        aux_context_menu_model_.get());
    aux_context_menu_runner_ = std::make_unique<views::MenuRunner>(
        aux_context_menu_adapter_->CreateMenu(),
        views::MenuRunner::HAS_MNEMONICS);
    const gfx::Point cursor = display::Screen::Get()->GetCursorScreenPoint();
    std::move(callback).Run(true, "true", "", "");
    aux_context_menu_runner_->RunMenuAt(
        browser_window()->widget(), nullptr,
        gfx::Rect(cursor, gfx::Size(1, 1)),
        views::MenuAnchorPosition::kTopLeft,
        ui::mojom::MenuSourceType::kMouse);
    return;
  }
  if (method == "navigationMenu") {
    if (list->size() != 2 || !(*list)[0].is_string() ||
        !(*list)[1].is_string() ||
        ((*list)[1].GetString() != "back" &&
         (*list)[1].GetString() != "forward")) {
      std::move(callback).Run(false, "", "invalid_argument",
                              "Expected a tab and navigation direction");
      return;
    }
    BrowserWindowInterface* owner = nullptr;
    auto* catalog = aux::TabCatalog::GetForProfile(browser_->GetProfile());
    auto* contents = catalog
        ? catalog->FindPage((*list)[0].GetString(), &owner) : nullptr;
    const bool back = (*list)[1].GetString() == "back";
    if (!contents || owner != browser_ ||
        contents != browser_->GetTabStripModel()->GetActiveWebContents() ||
        !(back ? contents->GetController().CanGoBack()
               : contents->GetController().CanGoForward())) {
      std::move(callback).Run(true, "false", "", "");
      return;
    }
    aux_navigation_menu_runner_.reset();
    aux_navigation_menu_adapter_.reset();
    aux_navigation_menu_model_.reset();
    aux_navigation_menu_model_ = std::make_unique<BackForwardMenuModel>(
        browser_, back ? BackForwardMenuModel::ModelType::kBackward
                       : BackForwardMenuModel::ModelType::kForward);
    aux_navigation_menu_adapter_ = std::make_unique<views::MenuModelAdapter>(
        aux_navigation_menu_model_.get());
    aux_navigation_menu_runner_ = std::make_unique<views::MenuRunner>(
        aux_navigation_menu_adapter_->CreateMenu(),
        views::MenuRunner::HAS_MNEMONICS);
    const gfx::Point cursor = display::Screen::Get()->GetCursorScreenPoint();
    std::move(callback).Run(true, "true", "", "");
    aux_navigation_menu_runner_->RunMenuAt(
        browser_window()->widget(), nullptr,
        gfx::Rect(cursor, gfx::Size(1, 1)),
        views::MenuAnchorPosition::kTopLeft,
        ui::mojom::MenuSourceType::kMouse);
    return;
  }
  if (method == "openPath" || method == "revealPath") {
    const bool reveal_only = method == "revealPath";
    if (list->size() != 1 || !(*list)[0].is_string() ||
        (*list)[0].GetString().empty() ||
        (*list)[0].GetString().size() > 8192) {
      std::move(callback).Run(false, "", "invalid_argument",
                              "An absolute file path is required");
      return;
    }
    const base::FilePath requested =
        base::FilePath::FromUTF8Unsafe((*list)[0].GetString());
    if (!requested.IsAbsolute()) {
      std::move(callback).Run(false, "", "invalid_argument",
                              "An absolute file path is required");
      return;
    }
    Profile* profile = browser_->GetProfile();
    std::vector<base::FilePath> roots;
    if (!profile->IsOffTheRecord())
      roots.push_back(profile->GetPath().Append("Aux Runtime Data"));
    if (auto* prefs = DownloadPrefs::FromBrowserContext(profile))
      roots.push_back(prefs->DownloadPath());
    roots.push_back(DownloadPrefs::GetDefaultDownloadDirectory());
    std::vector<base::FilePath> completed_downloads;
    if (auto* manager = profile->GetDownloadManager()) {
      content::DownloadManager::DownloadVector items;
      manager->GetAllDownloads(&items);
      for (download::DownloadItem* item : items) {
        if (item->GetState() == download::DownloadItem::COMPLETE)
          completed_downloads.push_back(item->GetTargetFilePath());
      }
    }
    base::ThreadPool::PostTaskAndReplyWithResult(
        FROM_HERE, {base::MayBlock(), base::TaskPriority::USER_VISIBLE},
        base::BindOnce(&ResolveOpenPath, requested, std::move(roots),
                       std::move(completed_downloads), reveal_only),
        base::BindOnce(
            [](base::WeakPtr<WebUIBrowserUI> self, bool reveal_only,
               RequestCallback callback, ResolvedOpenPath resolved) {
              if (!self) return;
              if (!resolved.allowed) {
                std::move(callback).Run(
                    true, reveal_only ? "false" :
                          *base::WriteJson(base::Value(
                              "Aux opens documents from its data and download folders only. Use Reveal to show this file in Finder.")),
                    "", "");
                return;
              }
              Profile* profile = self->browser_->GetProfile();
              if (reveal_only) {
                platform_util::ShowItemInFolder(profile, resolved.path);
                std::move(callback).Run(true, "true", "", "");
                return;
              }
              platform_util::OpenItem(
                  profile, resolved.path,
                  resolved.directory ? platform_util::OPEN_FOLDER
                                     : platform_util::OPEN_FILE,
                  base::BindOnce(
                      [](RequestCallback callback,
                         platform_util::OpenOperationResult result) {
                        const char* error = result == platform_util::OPEN_SUCCEEDED
                            ? "" : result == platform_util::OPEN_FAILED_PATH_NOT_FOUND
                            ? "File not found" : result == platform_util::OPEN_FAILED_INVALID_TYPE
                            ? "Not a file or folder" : result == platform_util::OPEN_FAILED_NO_HANLDER_FOR_FILE_TYPE
                            ? "No application can open this file" : "The file could not be opened";
                        std::move(callback).Run(
                            true, *base::WriteJson(base::Value(error)), "", "");
                      }, std::move(callback)));
            }, GetWeakPtr(), reveal_only, std::move(callback)));
    return;
  }
  if (method == "openExternal") {
    if (list->size() != 1 || !(*list)[0].is_string()) {
      std::move(callback).Run(false, "", "invalid_argument",
                              "An external link is required");
      return;
    }
    const GURL url((*list)[0].GetString());
    if (!url.is_valid() ||
        (!url.SchemeIsHTTPOrHTTPS() && !url.SchemeIs("mailto"))) {
      std::move(callback).Run(false, "", "invalid_argument",
                              "Only web and mail links can open externally");
      return;
    }
    platform_util::OpenExternal(url);
    // The platform API is asynchronous and does not report launch completion.
    std::move(callback).Run(true, "null", "", "");
    return;
  }
  if (method == "defaultBrowser" || method == "setDefaultBrowser") {
    if (!list->empty() || browser_->GetProfile()->IsOffTheRecord()) {
      std::move(callback).Run(false, "", "invalid_argument",
                              "Default browser settings require a regular profile");
      return;
    }
    auto worker = base::MakeRefCounted<shell_integration::DefaultBrowserWorker>();
    auto reply = base::BindOnce(
        [](RequestCallback callback, shell_integration::DefaultWebClientState state) {
          base::DictValue result;
          result.Set("isDefault", state == shell_integration::IS_DEFAULT);
          std::move(callback).Run(true, *base::WriteJson(result), "", "");
        }, std::move(callback));
    if (method == "setDefaultBrowser")
      worker->StartSetAsDefault(std::move(reply));
    else
      worker->StartCheckIsDefault(std::move(reply));
    return;
  }
  if (method == "dataDir") {
    if (!list->empty() || browser_->GetProfile()->IsOffTheRecord()) {
      std::move(callback).Run(false, "", "forbidden",
                              "Runtime storage requires a regular profile");
      return;
    }
    std::move(callback).Run(true, *base::WriteJson(base::Value(
        browser_->GetProfile()->GetPath().Append("Aux Runtime Data").AsUTF8Unsafe())),
        "", "");
    return;
  }
  if (method == "resolveSearch") {
    if (list->size() != 1 || !(*list)[0].is_string()) {
      std::move(callback).Run(false, "", "invalid_argument",
                              "Invalid search query");
      return;
    }
    const auto url = aux::ProfileSearchEngine::Resolve(
        browser_->GetProfile(), (*list)[0].GetString());
    if (!url) {
      std::move(callback).Run(false, "", "backend_unavailable",
                              "Profile search engine is unavailable");
      return;
    }
    std::move(callback).Run(true, *base::WriteJson(base::Value(*url)), "", "");
    return;
  }
  if (method == "setAppearance") {
    if (list->size() != 4 || !(*list)[0].is_string() ||
        !(*list)[1].is_bool() || !(*list)[2].is_bool() || !(*list)[3].is_string()) {
      std::move(callback).Run(false, "", "invalid_argument", "Invalid appearance settings");
      return;
    }
    const auto& theme = (*list)[0].GetString();
    const auto& material = (*list)[3].GetString();
    if ((theme != "system" && theme != "dark" && theme != "light") ||
        (material != "liquid-glass" && material != "titlebar" &&
         material != "sidebar" && material != "under-window")) {
      std::move(callback).Run(false, "", "invalid_argument", "Unknown appearance setting");
      return;
    }
    if (!browser_->GetProfile()->IsOffTheRecord()) {
      PrefService* prefs = browser_->GetProfile()->GetPrefs();
      prefs->SetString(aux::kAppearanceThemePref, theme);
      prefs->SetBoolean(aux::kAppearanceGlassPref, (*list)[1].GetBool());
      prefs->SetString(aux::kAppearanceMaterialPref, material);
    }
#if BUILDFLAG(IS_MAC)
    WebUIBrowserWindow::FromWebShellWebContents(web_ui()->GetWebContents())
        ->SetAuxAppearance(theme, (*list)[1].GetBool(), material);
#endif
    std::move(callback).Run(true, "true", "", "");
    return;
  }
  if (method == "setShortcuts") {
#if BUILDFLAG(IS_MAC)
    const auto* bindings = list->size() == 1 ? (*list)[0].GetIfList() : nullptr;
    bool valid = bindings && bindings->size() <= 512;
    if (valid) for (const auto& value : *bindings) {
      const auto* row = value.GetIfDict();
      const auto* key = row ? row->FindString("key") : nullptr;
      const auto* command = row ? row->FindString("commandId") : nullptr;
      if (!key || key->empty() || key->size() > 32 || !command ||
          command->size() > 64 || !row->FindBool("meta").has_value() ||
          !row->FindBool("ctrl").has_value() || !row->FindBool("shift").has_value() ||
          !row->FindBool("alt").has_value()) { valid = false; break; }
    }
    auto* window = WebUIBrowserWindow::FromBrowser(browser_);
    if (!valid || !window || !window->SetAuxShortcuts(*bindings)) {
      std::move(callback).Run(false, "", "invalid_argument", "Invalid Aux shortcut bindings");
      return;
    }
    std::move(callback).Run(true, "true", "", "");
#else
    std::move(callback).Run(false, "", "not_supported", "Native shortcuts require macOS");
#endif
    return;
  }
  if (method == "showRunAttention") {
    if (list->size() != 1 || !(*list)[0].is_dict()) {
      std::move(callback).Run(false, "", "invalid_argument", "Expected one attention payload");
      return;
    }
    const auto& payload = (*list)[0].GetDict();
    const std::string* kind = payload.FindString("kind");
    const std::string* run_id = payload.FindString("runId");
    const std::string* identity = payload.FindString("identity");
    const std::string* window_id = payload.FindString("windowId");
    if (!kind || !run_id || !identity || !window_id ||
        *window_id != base::NumberToString(browser_->GetSessionID().id())) {
      std::move(callback).Run(false, "", "invalid_argument", "Invalid attention identity");
      return;
    }
    const bool queued = aux::ShowRunAttention(browser_->GetProfile(), *kind, *run_id,
                                         *identity, *window_id);
    std::move(callback).Run(true, queued ? "{\"queued\":true}" : "{\"queued\":false}", "", "");
    return;
  }
  if (method == "focusShell") {
    if (!list->empty()) {
      std::move(callback).Run(false, "", "invalid_argument",
                              "Focus request takes no arguments");
      return;
    }
    web_ui()->GetWebContents()->Focus();
    std::move(callback).Run(true, "null", "", "");
    return;
  }
  if (method == "openFile") {
    if (!list->empty()) {
      std::move(callback).Run(false, "", "invalid_argument",
                              "Open File takes no arguments");
      return;
    }
    if (open_file_dialog_) {
      std::move(callback).Run(false, "", "conflict",
                              "A file dialog is already open");
      return;
    }
    auto* active = browser_->GetTabStripModel()->GetActiveWebContents();
    open_file_dialog_ = ui::SelectFileDialog::Create(
        this, std::make_unique<ChromeSelectFilePolicy>(active));
    if (!open_file_dialog_) {
      std::move(callback).Run(false, "", "not_supported",
                              "The system file dialog is unavailable");
      return;
    }
    file_dialog_purpose_ = FileDialogPurpose::kOpenFile;
    file_dialog_callback_ = std::move(callback);
    ui::SelectFileDialog::FileTypeInfo file_types;
    file_types.allowed_paths =
        ui::SelectFileDialog::FileTypeInfo::ANY_PATH_OR_URL;
    open_file_dialog_->SelectFile(
        ui::SelectFileDialog::SELECT_OPEN_FILE, std::u16string(),
        browser_->GetProfile()->last_selected_directory(), &file_types, 0,
        base::FilePath::StringType(), browser_->GetWindow()->GetNativeWindow());
    return;
  }
  if (method == "saveFile" || method == "openPluginDirectory" ||
      method == "pickEvidenceImage" || method == "pickEvidenceDocument") {
    const bool saving = method == "saveFile";
    if ((saving && (list->size() != 2 || !(*list)[0].is_string() ||
                    !(*list)[1].is_string())) ||
        (!saving && !list->empty())) {
      std::move(callback).Run(false, "", "invalid_argument",
                              "Invalid file dialog arguments");
      return;
    }
    base::FilePath default_path =
        browser_->GetProfile()->last_selected_directory();
    if (saving) {
      const std::string& filename = (*list)[0].GetString();
      const std::string& content = (*list)[1].GetString();
      if (filename.empty() || filename.size() > 255 ||
          !base::IsStringUTF8(filename) ||
          filename.find_first_of("/\\:\n\r") != std::string::npos ||
          filename.find('\0') != std::string::npos ||
          filename == "." || filename == ".." ||
          content.size() > 16 * 1024 * 1024) {
        std::move(callback).Run(false, "", "invalid_argument",
                                "Invalid filename or oversized file content");
        return;
      }
      default_path = default_path.Append(base::FilePath::FromUTF8Unsafe(filename));
    }
    if (open_file_dialog_) {
      std::move(callback).Run(false, "", "conflict",
                              "A file dialog is already open");
      return;
    }
    auto* active = browser_->GetTabStripModel()->GetActiveWebContents();
    open_file_dialog_ = ui::SelectFileDialog::Create(
        this, std::make_unique<ChromeSelectFilePolicy>(active));
    if (!open_file_dialog_) {
      std::move(callback).Run(false, "", "not_supported",
                              "The system file dialog is unavailable");
      return;
    }
    if (saving) {
      file_dialog_purpose_ = FileDialogPurpose::kSaveFile;
      save_file_content_ = (*list)[1].GetString();
    } else if (method == "openPluginDirectory") {
      file_dialog_purpose_ = FileDialogPurpose::kPluginDirectory;
    } else {
      file_dialog_purpose_ = method == "pickEvidenceImage"
                                 ? FileDialogPurpose::kEvidenceImage
                                 : FileDialogPurpose::kEvidenceDocument;
    }
    file_dialog_callback_ = std::move(callback);
    const auto dialog_type =
        saving ? ui::SelectFileDialog::SELECT_SAVEAS_FILE
               : method == "openPluginDirectory"
                     ? ui::SelectFileDialog::SELECT_FOLDER
                     : ui::SelectFileDialog::SELECT_OPEN_FILE;
    open_file_dialog_->SelectFile(
        dialog_type, std::u16string(), default_path, nullptr, 0,
        base::FilePath::StringType(), browser_->GetWindow()->GetNativeWindow());
    return;
  }
  if (method == "saveWorkbook" || method == "saveStoredArtifact") {
    const bool workbook = method == "saveWorkbook";
    if ((workbook && (list->empty() || list->size() > 2 ||
                     !(*list)[0].is_string() ||
                     (list->size() == 2 && !(*list)[1].is_string()))) ||
        (!workbook && (list->size() != 2 || !(*list)[0].is_string() ||
                      !(*list)[1].is_string()))) {
      std::move(callback).Run(false, "", "invalid_argument",
                              "Invalid document export arguments");
      return;
    }
    if (open_file_dialog_) {
      std::move(callback).Run(false, "", "conflict",
                              "A file dialog is already open");
      return;
    }
    auto* runtime = AuxRuntimeHost::ForProfile(browser_->GetProfile());
    if (!runtime) {
      std::move(callback).Run(false, "", "backend_unavailable",
                              "Aux Runtime is unavailable");
      return;
    }
    base::DictValue request;
    std::string filename;
    if (workbook) {
      const std::string& content = (*list)[0].GetString();
      const std::string format = list->size() == 2 ? (*list)[1].GetString()
                                                    : "snapshot";
      if (content.size() > 2 * 1024 * 1024 ||
          (format != "snapshot" && format != "csv")) {
        std::move(callback).Run(false, "", "invalid_argument",
                                "Invalid or oversized workbook source");
        return;
      }
      request.Set("content", content);
      request.Set("format", format);
    } else {
      const std::string& artifact_id = (*list)[0].GetString();
      filename = (*list)[1].GetString();
      if (artifact_id.empty() || artifact_id.size() > 128 ||
          filename.empty() || filename.size() > 255 ||
          !base::IsStringUTF8(filename) ||
          filename.find_first_of("/\\:\n\r") != std::string::npos ||
          filename.find('\0') != std::string::npos ||
          filename == "." || filename == "..") {
        std::move(callback).Run(false, "", "invalid_argument",
                                "Invalid artifact identity or filename");
        return;
      }
      request.Set("artifactId", artifact_id);
    }
    const auto json = base::WriteJson(base::Value(std::move(request)));
    if (!json) {
      std::move(callback).Run(false, "", "invalid_argument",
                              "Invalid document export request");
      return;
    }
    runtime->CallInternal(
        workbook ? "workbook.renderExport" : "artifact.exportDescriptor",
        *json,
        base::BindOnce(
            [](base::WeakPtr<WebUIBrowserUI> self, bool workbook,
               std::string filename, RequestCallback callback,
               AuxRuntimeHost::Response response) {
              if (!self) return;
              if (!self->IsAuthorizedAuxDocument()) {
                std::move(callback).Run(false, "", "forbidden",
                                        "Aux shell is no longer active");
                return;
              }
              if (!response.ok) {
                std::move(callback).Run(false, "", response.error_code,
                                        response.error_message);
                return;
              }
              auto value = base::JSONReader::Read(response.result_json,
                                                  base::JSON_PARSE_RFC);
              if (!value || !value->is_dict()) {
                std::move(callback).Run(false, "", "internal",
                                        "Invalid runtime export descriptor");
                return;
              }
              const auto& data = value->GetDict();
              const auto size = data.FindInt("size");
              if (!size || *size < 0) {
                std::move(callback).Run(false, "", "internal",
                                        "Invalid export size");
                return;
              }
              if (workbook) {
                const auto* name = data.FindString("filename");
                const auto* encoded = data.FindString("dataBase64");
                std::string bytes;
                if (!name || (*name != "workbook.xlsx" &&
                              *name != "results.xlsx") ||
                    !encoded || encoded->size() > 14 * 1024 * 1024 ||
                    !base::Base64Decode(*encoded, &bytes) ||
                    bytes.size() != static_cast<size_t>(*size) ||
                    bytes.size() > 10 * 1024 * 1024) {
                  std::move(callback).Run(false, "", "internal",
                                          "Invalid workbook export");
                  return;
                }
                self->BeginAuxGeneratedSave(*name, std::move(bytes),
                                            base::FilePath(), 0,
                                            std::move(callback));
              } else {
                const auto* path = data.FindString("path");
                if (!path || path->empty()) {
                  std::move(callback).Run(false, "", "internal",
                                          "Invalid artifact path");
                  return;
                }
                self->BeginAuxGeneratedSave(
                    std::move(filename), std::string(),
                    base::FilePath::FromUTF8Unsafe(*path), *size,
                    std::move(callback));
              }
            },
            weak_factory_.GetWeakPtr(), workbook, std::move(filename),
            std::move(callback)));
    return;
  }
  if (method == "agentConfig" || method == "agentConnections" ||
      method == "agentClients" || method == "revokeAgentConnection") {
    const bool has_argument = method == "agentConfig" ||
                              method == "revokeAgentConnection";
    if ((has_argument && list->size() != 1) ||
        (!has_argument && !list->empty()) ||
        (method == "agentConfig" && !(*list)[0].is_dict()) ||
        (method == "revokeAgentConnection" &&
         (!(*list)[0].is_string() || (*list)[0].GetString().size() > 128))) {
      std::move(callback).Run(false, "", "invalid_argument",
                              "Invalid agent connection arguments");
      return;
    }
    auto* runtime = AuxRuntimeHost::ForProfile(browser_->GetProfile());
    if (!runtime) {
      std::move(callback).Run(false, "", "backend_unavailable",
                              "Aux Runtime is unavailable");
      return;
    }
    std::string internal_method;
    base::Value request{base::DictValue()};
    if (method == "agentConfig") {
      internal_method = "agent.config";
      request = (*list)[0].Clone();
    } else if (method == "agentConnections") {
      internal_method = "agent.connections";
    } else if (method == "agentClients") {
      internal_method = "agent.clients";
    } else {
      internal_method = "agent.revoke";
      request.GetDict().Set("connectionId", (*list)[0].GetString());
    }
    const auto json = base::WriteJson(request);
    if (!json) {
      std::move(callback).Run(false, "", "invalid_argument",
                              "Invalid agent connection request");
      return;
    }
    runtime->CallInternal(
        internal_method, *json,
        base::BindOnce(
            [](base::WeakPtr<WebUIBrowserUI> self, RequestCallback callback,
               AuxRuntimeHost::Response response) {
              if (!self) return;
              if (!self->IsAuthorizedAuxDocument()) {
                std::move(callback).Run(false, "", "forbidden",
                                        "Aux shell is no longer active");
                return;
              }
              std::move(callback).Run(response.ok, response.result_json,
                                      response.error_code,
                                      response.error_message);
            },
            weak_factory_.GetWeakPtr(), std::move(callback)));
    return;
  }
  if (method == "closeWindow") {
    if (!list->empty()) {
      std::move(callback).Run(false, "", "invalid_argument",
                              "Close Window takes no arguments");
      return;
    }
    std::move(callback).Run(true, "true", "", "");
    chrome::CloseWindow(browser_);
    return;
  }
  std::move(callback).Run(false, "", "not_found",
                          "Unsupported Aux shell method: " + method);
}
#endif

#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
base::WeakPtr<BrowserWindowInterface> WebUIBrowserUI::NativeLittleCleanupWindowForTesting() const {
  return little_presentation_fixture_ ? little_presentation_fixture_->CleanupWindowForMailbox() :
      base::WeakPtr<BrowserWindowInterface>();
}
#endif
