// Copyright 2025 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "chrome/browser/ui/webui_browser/webui_browser_ui.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include "chrome/browser/ui/aux/native_command_presentation_session.h"
#include "chrome/browser/ui/aux/native_guest_presentation_fixture.h"
#include "chrome/browser/ui/aux/native_little_presentation_fixture.h"
#include "chrome/browser/ui/aux/native_performance_mailbox.h"
#include "chrome/browser/ui/aux/native_organization_work_fixture.h"
#include "chrome/browser/ui/aux/native_shell_memory.h"
#include "chrome/browser/ui/aux/native_process_memory_sampler.h"
#include "chrome/browser/ui/aux/native_startup_presentation_session.h"
#include "chrome/browser/ui/aux/native_aux_warm_fixture.h"
#include "chrome/browser/ui/aux/native_private_fixture_methods.h"
#if BUILDFLAG(ENABLE_AUX_SHELL)
#include "chrome/browser/ui/aux/journey_fixture_path.h"
#include "chrome/browser/ui/aux/native_cdp_measurement_producer.h"
#include "chrome/browser/ui/aux/native_pip_presentation_fixture.h"
#include "chrome/browser/ui/aux/native_stop_input_endpoint.h"
#include "chrome/browser/ui/aux/native_performance_observer.h"
#include "content/public/browser/native_platform_input_admission.h"
#endif
#include "chrome/browser/ui/aux/native_appearance_file_channel.h"
#include <iostream>
#endif
#include "chrome/browser/ui/toolbar/back_forward_menu_model.h"
#include "ui/views/controls/menu/menu_model_adapter.h"
#include "ui/views/controls/menu/menu_runner.h"

#include <cmath>
#include <utility>
#include <variant>

#include "base/files/file_util.h"
#include "base/base64.h"
#include "base/functional/bind.h"
#include "base/memory/ref_counted_memory.h"
#include "base/task/thread_pool.h"
#include "base/timer/timer.h"
#include "chrome/browser/shell_integration.h"
#include "printing/buildflags/buildflags.h"
#include "content/public/browser/host_zoom_map.h"
#include "third_party/blink/public/common/page/page_zoom.h"
#include "base/json/json_reader.h"
#include "base/json/json_writer.h"
#include "base/notimplemented.h"
#include "base/strings/string_number_conversions.h"
#include "base/strings/string_util.h"
#include "base/strings/utf_string_conversions.h"
#include "chrome/browser/bookmarks/bookmark_model_factory.h"
#include "chrome/browser/buildflags.h"
#if BUILDFLAG(ENABLE_AUX_SHELL)
#include "components/device_reauth/device_authenticator.h"
#include "chrome/browser/download/download_prefs.h"
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
#include "chrome/browser/ui/aux/content_blocking_controller.h"
#include "chrome/browser/ui/aux/method_registry.h"
#include "chrome/browser/ui/aux/health_recorder.h"
#include "chrome/browser/ui/aux/dictation_mac.h"
#include "chrome/browser/ui/aux/extension_bridge.h"
#include "chrome/browser/ui/aux/migration_import.h"
#include "chrome/browser/ui/aux/runtime_host.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include "chrome/browser/ui/aux/native_aux_warm_creation_ticket.h"
#endif
#include "chrome/browser/ui/aux/organization_store.h"
#include "chrome/browser/ui/aux/profile_search_engine.h"
#include "chrome/browser/ui/aux/quick_ask_controller.h"
#include "chrome/browser/ui/aux/little_window_controller.h"
#include "chrome/browser/ui/aux/result_preview.h"
#include "chrome/browser/ui/aux/shell_events.h"
#include "chrome/browser/ui/aux/methods/extensions_ui_methods.h"
#include "chrome/browser/ui/aux/tab_catalog.h"
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

namespace {

#if BUILDFLAG(ENABLE_AUX_SHELL)
constexpr size_t kMaxAuxEvidenceImageBytes = 8 * 1024 * 1024;
constexpr size_t kMaxAuxEvidenceDocumentBytes = 2 * 1024 * 1024;

bool WriteAuxText(const base::FilePath& destination, std::string content) {
  base::FilePath temporary;
  if (!base::CreateTemporaryFileInDir(destination.DirName(), &temporary))
    return false;
  if (base::WriteFile(temporary, content) &&
      base::ReplaceFile(temporary, destination, nullptr))
    return true;
  base::DeleteFile(temporary);
  return false;
}

bool CopyAuxArtifact(const base::FilePath& root,
                     const base::FilePath& source,
                     int64_t expected_size,
                     const base::FilePath& destination) {
  const base::FilePath real_root = base::MakeAbsoluteFilePath(root);
  const base::FilePath real_source = base::MakeAbsoluteFilePath(source);
  const auto size = base::GetFileSize(real_source);
  if (real_root.empty() || real_source.empty() ||
      !real_root.IsParent(real_source) ||
      !size || *size != expected_size)
    return false;
  base::FilePath temporary;
  if (!base::CreateTemporaryFileInDir(destination.DirName(), &temporary))
    return false;
  std::optional<int64_t> copied_size;
  if (base::CopyFile(real_source, temporary) &&
      (copied_size = base::GetFileSize(temporary)) &&
      *copied_size == expected_size &&
      base::ReplaceFile(temporary, destination, nullptr))
    return true;
  base::DeleteFile(temporary);
  return false;
}

std::optional<std::string> ReadAuxEvidence(const base::FilePath& path,
                                           bool image) {
  std::string content;
  if (!base::ReadFileToStringWithMaxSize(
          path, &content,
          image ? kMaxAuxEvidenceImageBytes : kMaxAuxEvidenceDocumentBytes))
    return std::nullopt;
  base::DictValue result;
  result.Set("filename", path.BaseName().AsUTF8Unsafe());
  if (image) {
    std::string_view bytes(content);
    std::string_view mime;
    if (bytes.starts_with("\x89PNG\r\n\x1a\n"))
      mime = "image/png";
    else if (bytes.starts_with("\xff\xd8\xff"))
      mime = "image/jpeg";
    else if (bytes.starts_with("GIF87a") || bytes.starts_with("GIF89a"))
      mime = "image/gif";
    else if (bytes.size() >= 12 && bytes.starts_with("RIFF") &&
             bytes.substr(8, 4) == "WEBP")
      mime = "image/webp";
    if (mime.empty())
      return std::nullopt;
    result.Set("dataUrl", "data:" + std::string(mime) + ";base64," +
                              base::Base64Encode(content));
  } else {
    if (!base::IsStringUTF8(content) || content.find('\0') != std::string::npos)
      return std::nullopt;
    result.Set("content", std::move(content));
  }
  return base::WriteJson(base::Value(std::move(result)));
}
#endif

#if BUILDFLAG(ENABLE_AUX_SHELL) && BUILDFLAG(ENABLE_PRINTING)
#if BUILDFLAG(ENABLE_PRINT_PREVIEW)
using AuxPrintManager = printing::PrintViewManager;
#else
using AuxPrintManager = printing::PrintViewManagerBasic;
#endif

bool WriteAuxPdf(const base::FilePath& destination,
                 scoped_refptr<base::RefCountedMemory> data) {
  base::FilePath temporary;
  if (!base::CreateTemporaryFileInDir(destination.DirName(), &temporary))
    return false;
  if (base::WriteFile(temporary, base::span(*data)) &&
      base::ReplaceFile(temporary, destination, nullptr))
    return true;
  base::DeleteFile(temporary);
  return false;
}
#endif

std::string SidePanelEntryIdToTitle(SidePanelEntryId id) {
  // TODO(webium): Ideally, the titles should be added to SIDE_PANEL_ENTRY_IDS
  // macros in chrome/browser/ui/side_panel/side_panel_entry_id.h, and
  // then this conversion function would be written in that same file,
  // analogously to the other functions it contains. But it appears that some
  // of the entry  ids there are stale and no longer have a matching generated
  // IDS_*_TITLE string that we can include.
  //
  // Since we are currently only explicitly supporting three side panel types,
  // we do the id to title conversion here manually to minimize modification to
  // existing code.
  switch (id) {
    case SidePanelEntryId::kCustomizeChrome:
      return l10n_util::GetStringUTF8(IDS_SIDE_PANEL_CUSTOMIZE_CHROME_TITLE);
    case SidePanelEntryId::kReadingList:
      return l10n_util::GetStringUTF8(IDS_READ_LATER_TITLE);
    case SidePanelEntryId::kBookmarks:
      return l10n_util::GetStringUTF8(IDS_BOOKMARK_MANAGER_TITLE);
    default:
      NOTREACHED();
  }
}

}  // namespace

#if BUILDFLAG(ENABLE_AUX_SHELL)
// Embedded page surfaces do not deliver mouse moves to the shell or the
// native window event monitor. Sample only this window's active cursor state.
class AuxShellEdgeMonitor {
 public:
  AuxShellEdgeMonitor(WebUIBrowserWindow* window,
                      base::RepeatingCallback<void(bool, bool)> on_edges)
      : window_(window), on_edges_(std::move(on_edges)) {
    timer_.Start(FROM_HERE, base::Milliseconds(16), this,
                 &AuxShellEdgeMonitor::CheckEdges);
  }

  void CheckEdges() {
#if BUILDFLAG(IS_MAC)
    window_->UpdateAuxWindowControlsForCursor();
#endif
    const gfx::Rect bounds = window_->widget()->GetWindowBoundsInScreen();
    const gfx::Point cursor =
        display::Screen::Get()->GetCursorScreenPoint();
    const bool inside = window_->widget()->IsActive() &&
                        bounds.Contains(cursor);
    // The shell enters at 6 px and keeps an 8 px exit leeway. Preserve that
    // hysteresis while a SurfaceEmbed guest owns pointer movement.
    const int sidebar_distance = cursor.x() - bounds.x();
    const int toolbar_distance = cursor.y() - bounds.y();
    const bool sidebar = inside && sidebar_distance <= (sidebar_ ? 14 : 6);
    const bool toolbar = inside && toolbar_distance <= (toolbar_ ? 16 : 8);
    if (sidebar == sidebar_ && toolbar == toolbar_) {
      return;
    }
    sidebar_ = sidebar;
    toolbar_ = toolbar;
    on_edges_.Run(sidebar, toolbar);
  }

 private:
  raw_ptr<WebUIBrowserWindow> window_;
  base::RepeatingCallback<void(bool, bool)> on_edges_;
  base::RepeatingTimer timer_;
  bool sidebar_ = false;
  bool toolbar_ = false;
};
#endif

WebUIBrowserUIConfig::WebUIBrowserUIConfig()
    : DefaultWebUIConfig(content::kChromeUIScheme,
#if BUILDFLAG(ENABLE_AUX_SHELL)
                         chrome::kChromeUIAuxHost) {
}
#else
                         chrome::kChromeUIWebuiBrowserHost) {
}
#endif

bool WebUIBrowserUIConfig::IsWebUIEnabled(
    content::BrowserContext* browser_context) {
  return webui_browser::IsWebUIBrowserEnabled();
}

// realbox uses ui/webui/resources/js/metrics_reporter, which in turn uses
// chrome.timeTicks.nowInMicroseconds(). In order to provide it we pass
// enable_chrome_send to MojoWebUIController constructor, since they're
// a package deal via BindingsPolicyValue::kWebUi.
WebUIBrowserUI::WebUIBrowserUI(content::WebUI* web_ui)
    : ui::MojoWebUIController(web_ui,
                              /*enable_chrome_send=*/true,
                              /*enable_chrome_histograms=*/true) {
  WebUIBrowserWindow* webui_browser_window =
      WebUIBrowserWindow::FromWebShellWebContents(web_ui->GetWebContents());
  Profile* profile = Profile::FromWebUI(web_ui);
#if BUILDFLAG(ENABLE_AUX_SHELL)
  aux::ProfileSearchEngine::InitializeSuggestions(profile);
  aux::StartHealthRecorder(profile);
  aux::InitializeQuickAsk();
#endif
  browser_ = webui_browser_window->browser();
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS) && BUILDFLAG(ENABLE_AUX_SHELL)
  if (aux::NativeStartupObservationEnabled()) {
    auto warm_ticket = aux::NativeAuxWarmCreationTicket::ForCreatedChild(browser_.get());
    if (warm_ticket) {
      startup_presentation_session_ = std::make_unique<aux::NativeStartupPresentationSession>(GetWeakPtr(), warm_ticket);
      startup_presentation_session_->Start(base::BindOnce(
          [](base::WeakPtr<WebUIBrowserUI> child,
             base::WeakPtr<aux::NativeAuxWarmCreationTicket> ticket, base::DictValue record) {
            if (ticket) ticket->Delivered(child, std::move(record));
          }, GetWeakPtr(), warm_ticket));
    } else {
      startup_presentation_session_ = std::make_unique<aux::NativeStartupPresentationSession>(GetWeakPtr());
      startup_presentation_session_->Start(base::BindOnce([](base::DictValue record) {
        const auto json = base::WriteJson(record);
        if (json && json->size() <= 16384) std::cerr << "AUX_NATIVE_STARTUP_V1 " << *json << std::endl;
      }));
    }
  }
#endif

  webui::SetBrowserWindowInterface(web_ui->GetWebContents(), browser_);

  // The Aux build replaces Webium's top chrome with the packaged Aux shell.
  content::WebUIDataSource* source = content::WebUIDataSource::CreateAndAdd(
      web_ui->GetWebContents()->GetBrowserContext(),
#if BUILDFLAG(ENABLE_AUX_SHELL)
      chrome::kChromeUIAuxHost);
#else
      chrome::kChromeUIWebuiBrowserHost);
#endif

  // Add required resources.
#if BUILDFLAG(ENABLE_AUX_SHELL)
  webui::SetupWebUIDataSource(source, kAuxResources, IDR_AUX_INDEX_HTML);
  source->OverrideContentSecurityPolicy(
      network::mojom::CSPDirectiveName::TrustedTypes,
      "trusted-types aux-reader-distiller;");
  // The packaged shell's sandboxed result previews use only the fixed private
  // preview scheme. The WebUI header and renderer meta policies must agree.
  source->OverrideContentSecurityPolicy(
      network::mojom::CSPDirectiveName::FrameSrc, "frame-src aux-result:;");
  source->AddResourcePaths(kAuxHostResources);
#else
  webui::SetupWebUIDataSource(source, kWebuiBrowserResources,
                              IDR_WEBUI_BROWSER_WEBUI_BROWSER_HTML);
#endif
  source->AddResourcePaths(kTabStripApiResources);
  source->AddResourcePaths(kWebuiToolbarSharedResources);

  static constexpr webui::LocalizedString kStrings[] = {
      // Localized strings (alphabetical order).
      {"appMenuTooltip", IDS_APPMENU_TOOLTIP},
      {"tooltipExtensionsButton", IDS_TOOLTIP_EXTENSIONS_BUTTON},
      {"tooltipNewTab", IDS_TOOLTIP_NEW_TAB},
      {"tooltipReload", IDS_TOOLTIP_RELOAD},
      {"tooltipStop", IDS_TOOLTIP_STOP},
  };
  source->AddLocalizedStrings(kStrings);

  source->AddLocalizedStrings(
      SearchboxHandler::GetWebUIDataSourceDict(profile));

  source->AddInteger("tabStripInset",
                     WebUIBrowserPageHandler::GetTabStripInsetWidth());

  source->AddBoolean(
      "enableSurfaceEmbed",
      base::FeatureList::IsEnabled(surface_embed::features::kSurfaceEmbed));
  if (base::FeatureList::IsEnabled(surface_embed::features::kSurfaceEmbed)) {
    // Allow <embed> elements for the surface embed plugin. Using 'self'
    // is the most restrictive policy that works since the embed has no src.
    source->OverrideContentSecurityPolicy(
        network::mojom::CSPDirectiveName::ObjectSrc, "object-src 'self';");
  }

  // TODO(crbug.com/445510209): Uncomment after installing WebUIOmniboxHandler.
  // source->AddBoolean("reportMetrics", true);
  // source->AddString("charTypedToPaintMetricName",
  //                   "Omnibox.WebUI.CharTypedToRepaintLatency.ToPaint");
  // source->AddString(
  //     "resultChangedToPaintMetricName",
  //     "Omnibox.Popup.WebUI.ResultChangedToRepaintLatency.ToPaint");

  content::URLDataSource::Add(
      profile, std::make_unique<FaviconSource>(
                   profile, chrome::FaviconUrlFormat::kFavicon2));

  if (browser_) {
    // This use of unretained is safe because the
    // TrackedElementHandlerDocumentSingleton only stores the callback for at
    // most the lifetime of the WebContents, which is always shorter than the
    // Browser.
    ui::TrackedElementHandlerDocumentSingleton::Register(
        this, GetKnownElementIdentifiers(),
        base::BindRepeating(
            [](BrowserWindowInterface* browser) {
              return BrowserElements::From(browser)->GetContext();
            },
            base::Unretained(browser_)));
  }
}

#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS) && BUILDFLAG(ENABLE_AUX_SHELL)
bool WebUIBrowserUI::AdmitAuxNativeStopMeasurement(
    const content::NativePlatformInputAdmission& admission) {
  if (!aux::NativePerformanceObservationEnabled() || !cdp_measurement_producer_ ||
      !stop_input_endpoint_ || !IsAuthorizedAuxDocument() || !web_ui() ||
      !web_ui()->GetWebContents() ||
      web_ui()->GetWebContents() != admission.contents() ||
      web_ui()->GetRenderFrameHost() != admission.document().AsRenderFrameHostIfValid())
    return false;
  return cdp_measurement_producer_->AdmitStopInput(admission);
}
#endif

WebUIBrowserUI::~WebUIBrowserUI() {
#if BUILDFLAG(ENABLE_AUX_SHELL)
  if (open_file_dialog_)
    open_file_dialog_->ListenerDestroyed();
#endif
}

void WebUIBrowserUI::BindInterface(
    mojo::PendingReceiver<webui_browser::mojom::PageHandlerFactory> receiver) {
  page_factory_receiver_.reset();
  page_factory_receiver_.Bind(std::move(receiver));
}

#if BUILDFLAG(ENABLE_AUX_SHELL)
void WebUIBrowserUI::BindInterface(
    mojo::PendingReceiver<aux::mojom::ShellHostFactory> receiver) {
  shell_host_factory_receiver_.reset();
  shell_host_factory_receiver_.Bind(std::move(receiver));
}

bool WebUIBrowserUI::DispatchAuxShortcut(const std::string& command_id, bool focus_shell,
                                           std::optional<bool> website_pass_through,
                                           std::optional<base::UnguessableToken> warm_input_receipt) {
  if (!IsAuthorizedAuxDocument() || !shell_host_client_.is_bound())
    return false;
  if (focus_shell) web_ui()->GetWebContents()->Focus();
  base::DictValue shortcut;
  shortcut.Set("commandId", command_id);
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
  if (command_id == "new-window" && warm_input_receipt && !warm_input_receipt->is_empty())
    shortcut.Set("warmInputReceipt", warm_input_receipt->ToString());
#endif
  if (website_pass_through.has_value()) shortcut.Set("websitePassThrough", *website_pass_through);
  shortcut.Set("key", "");
  shortcut.Set("meta", false);
  shortcut.Set("shift", false);
  shortcut.Set("alt", false);
  shell_host_client_->OnEvent("onShortcut", *base::WriteJson(shortcut));
  return true;
}

void WebUIBrowserUI::BeginAuxGeneratedSave(std::string filename,
                                           std::string content,
                                           base::FilePath source,
                                           int64_t source_size,
                                           RequestCallback callback) {
  if (open_file_dialog_) {
    std::move(callback).Run(false, "", "conflict", "A file dialog is already open");
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
  file_dialog_purpose_ = FileDialogPurpose::kSaveFile;
  file_dialog_callback_ = std::move(callback);
  save_file_content_ = std::move(content);
  save_file_source_ = std::move(source);
  save_file_source_size_ = source_size;
  open_file_dialog_->SelectFile(
      ui::SelectFileDialog::SELECT_SAVEAS_FILE, std::u16string(),
      browser_->GetProfile()->last_selected_directory().Append(
          base::FilePath::FromUTF8Unsafe(filename)),
      nullptr, 0, base::FilePath::StringType(),
      browser_->GetWindow()->GetNativeWindow());
}

void WebUIBrowserUI::FileSelected(const ui::SelectedFileInfo& file,
                                  int index) {
  scoped_refptr<ui::SelectFileDialog> dialog = std::move(open_file_dialog_);
  auto callback = std::move(file_dialog_callback_);
  const auto purpose =
      std::exchange(file_dialog_purpose_, FileDialogPurpose::kNone);
  std::string save_content = std::move(save_file_content_);
  std::string transfer_passphrase = std::move(password_transfer_passphrase_);
  base::FilePath save_source = std::move(save_file_source_);
  int64_t save_source_size = std::exchange(save_file_source_size_, 0);
  const base::FilePath& selected_path =
      file.local_path.empty() ? file.file_path : file.local_path;
  if (selected_path.empty()) {
    std::move(callback).Run(false, "", "invalid_argument",
                            "Invalid selected file path");
    return;
  }
  browser_->GetProfile()->set_last_selected_directory(
      purpose == FileDialogPurpose::kDownloadFolder ||
              purpose == FileDialogPurpose::kPluginDirectory ||
              purpose == FileDialogPurpose::kUnpackedExtension ||
              purpose == FileDialogPurpose::kRuntimeRestore ? selected_path
                                                    : selected_path.DirName());
  if (purpose == FileDialogPurpose::kDownloadFolder) {
    auto* prefs = DownloadPrefs::FromBrowserContext(browser_->GetProfile());
    if (!prefs || prefs->IsDownloadPathManaged()) {
      std::move(callback).Run(false, "", "forbidden",
                              "Download location is managed by policy");
      return;
    }
    prefs->SetDownloadPath(selected_path);
    base::DictValue result;
    result.Set("path", prefs->DownloadPath().AsUTF8Unsafe());
    result.Set("custom", prefs->DownloadPath() !=
                             DownloadPrefs::GetDefaultDownloadDirectory());
    std::move(callback).Run(true, *base::WriteJson(base::Value(std::move(result))),
                            "", "");
    return;
  }
  if (purpose == FileDialogPurpose::kOpenFile ||
      purpose == FileDialogPurpose::kPluginDirectory) {
    const auto result =
        base::WriteJson(base::Value(selected_path.AsUTF8Unsafe()));
    std::move(callback)
        .Run(result.has_value(), result.value_or(""),
             result.has_value() ? "" : "invalid_argument",
             result.has_value() ? "" : "Invalid selected file path");
    return;
  }
  if (purpose == FileDialogPurpose::kUnpackedExtension) {
    if (!IsAuthorizedAuxDocument()) {
      std::move(callback).Run(false, "", "forbidden",
                              "Aux shell is no longer active");
      return;
    }
    aux::ExtensionBridge::InstallUnpacked(browser_->GetProfile(),
        selected_path,
        base::BindOnce(
            [](RequestCallback callback, bool ok, std::string result,
               std::string code, std::string message) {
              std::move(callback).Run(ok, result, code, message);
            },
            std::move(callback)));
    return;
  }
  if (purpose == FileDialogPurpose::kRuntimeRestore) {
    if (!IsAuthorizedAuxDocument() || browser_->GetProfile()->IsOffTheRecord()) {
      std::move(callback).Run(false, "", "forbidden",
                              "Aux restore is no longer available");
      return;
    }
    auto* host = AuxRuntimeHost::ForProfile(browser_->GetProfile());
    if (!host) {
      std::move(callback).Run(false, "", "backend_unavailable",
                              "Aux runtime is unavailable");
      return;
    }
    base::DictValue params;
    params.Set("path", selected_path.AsUTF8Unsafe());
    host->CallApi("installation.stageRestore",
        *base::WriteJson(base::Value(std::move(params))),
        base::BindOnce(
            [](RequestCallback callback, AuxRuntimeHost::Response response) {
              std::move(callback).Run(response.ok, response.result_json,
                                      response.error_code,
                                      response.error_message);
            }, std::move(callback)));
    return;
  }
  if (purpose == FileDialogPurpose::kPasswordExport ||
      purpose == FileDialogPurpose::kPasswordImport) {
    if (!IsAuthorizedAuxDocument() || browser_->GetProfile()->IsOffTheRecord()) {
      std::move(callback).Run(false, "", "forbidden",
                              "Password transfer is no longer available");
      return;
    }
    if (purpose == FileDialogPurpose::kPasswordExport)
      FinishPasswordExport(selected_path, std::move(transfer_passphrase),
                           std::move(callback));
    else
      FinishPasswordImport(selected_path, std::move(transfer_passphrase),
                           std::move(callback));
    return;
  }
  if (purpose == FileDialogPurpose::kSaveFile) {
    const base::FilePath artifact_root = browser_->GetProfile()->GetPath()
        .Append("Aux Runtime Data").Append("artifacts");
    base::ThreadPool::PostTaskAndReplyWithResult(
        FROM_HERE, {base::MayBlock(), base::TaskPriority::USER_VISIBLE},
        save_source.empty()
            ? base::BindOnce(&WriteAuxText, selected_path,
                             std::move(save_content))
            : base::BindOnce(&CopyAuxArtifact, artifact_root,
                             std::move(save_source), save_source_size,
                             selected_path),
        base::BindOnce(
            [](RequestCallback callback, base::FilePath destination, bool saved) {
              if (!saved) {
                std::move(callback).Run(false, "", "io_error", "The file could not be saved");
                return;
              }
              const auto json = base::WriteJson(base::Value(destination.AsUTF8Unsafe()));
              std::move(callback).Run(json.has_value(), json.value_or(""),
                                      json ? "" : "io_error",
                                      json ? "" : "The file path could not be returned");
            },
            std::move(callback), selected_path));
    return;
  }
  if (purpose == FileDialogPurpose::kEvidenceImage ||
      purpose == FileDialogPurpose::kEvidenceDocument) {
    base::ThreadPool::PostTaskAndReplyWithResult(
        FROM_HERE, {base::MayBlock(), base::TaskPriority::USER_VISIBLE},
        base::BindOnce(&ReadAuxEvidence, selected_path,
                       purpose == FileDialogPurpose::kEvidenceImage),
        base::BindOnce(
            [](RequestCallback callback, std::optional<std::string> result) {
              std::move(callback).Run(result.has_value(), result.value_or(""),
                                      result ? "" : "invalid_argument",
                                      result ? "" : "Unsupported or oversized evidence file");
            },
            std::move(callback)));
    return;
  }
#if BUILDFLAG(ENABLE_PRINTING)
  BrowserWindowInterface* owner = nullptr;
  auto* catalog = aux::TabCatalog::GetForProfile(browser_->GetProfile());
  auto* contents = catalog->FindPage(save_pdf_page_id_, &owner);
  save_pdf_page_id_.clear();
  if (purpose != FileDialogPurpose::kSavePdf || !contents || owner != browser_ ||
      browser_->GetTabStripModel()->GetActiveWebContents() != contents ||
      !chrome::CanPrint(browser_)) {
    std::move(callback).Run(false, "", "conflict",
                            "The page changed before PDF export");
    return;
  }
  auto parameters = print_to_pdf::GetPrintPagesParams(
      contents->GetLastCommittedURL(), {}, {}, {}, {}, {}, {}, {}, {}, {},
      {}, {}, {}, {}, {}, {});
  auto* manager = AuxPrintManager::FromWebContents(contents);
  if (!manager || std::holds_alternative<std::string>(parameters)) {
    std::move(callback).Run(false, "", "not_supported",
                            "PDF rendering is unavailable for this page");
    return;
  }
  manager->PrintToPdf(
      contents->GetPrimaryMainFrame(), "",
      std::move(std::get<printing::mojom::PrintPagesParamsPtr>(parameters)),
      base::BindOnce(
          [](RequestCallback callback, base::FilePath destination,
             print_to_pdf::PdfPrintResult result,
             scoped_refptr<base::RefCountedMemory> pdf) {
            if (result != print_to_pdf::PdfPrintResult::kPrintSuccess || !pdf ||
                pdf->size() == 0) {
              std::move(callback).Run(false, "", "internal",
                                      "The page could not be rendered as PDF");
              return;
            }
            base::ThreadPool::PostTaskAndReplyWithResult(
                FROM_HERE, {base::MayBlock(), base::TaskPriority::USER_VISIBLE},
                base::BindOnce(&WriteAuxPdf, destination, std::move(pdf)),
                base::BindOnce(
                    [](RequestCallback callback, base::FilePath destination,
                       bool saved) {
                      const auto json = base::WriteJson(
                          base::Value(destination.AsUTF8Unsafe()));
                      if (!saved || !json) {
                        std::move(callback).Run(
                            false, "", "io_error", "The PDF could not be saved");
                        return;
                      }
                      std::move(callback).Run(true, *json, "", "");
                    },
                    std::move(callback), destination));
          },
          std::move(callback), selected_path));
#else
  std::move(callback).Run(false, "", "not_supported",
                          "PDF rendering is unavailable");
#endif
}

void WebUIBrowserUI::FileSelectionCanceled() {
  scoped_refptr<ui::SelectFileDialog> dialog = std::move(open_file_dialog_);
  const auto purpose = file_dialog_purpose_;
  file_dialog_purpose_ = FileDialogPurpose::kNone;
  save_file_content_.clear();
  password_transfer_passphrase_.clear();
  save_file_source_.clear();
  save_file_source_size_ = 0;
  save_pdf_page_id_.clear();
  if (purpose == FileDialogPurpose::kDownloadFolder) {
    auto* prefs = DownloadPrefs::FromBrowserContext(browser_->GetProfile());
    base::DictValue result;
    result.Set("path", prefs->DownloadPath().AsUTF8Unsafe());
    result.Set("custom", prefs->DownloadPath() !=
                             DownloadPrefs::GetDefaultDownloadDirectory());
    std::move(file_dialog_callback_)
        .Run(true, *base::WriteJson(base::Value(std::move(result))), "", "");
    return;
  }
  std::move(file_dialog_callback_).Run(true, "null", "", "");
}

void WebUIBrowserUI::CreateShellHost(
    mojo::PendingReceiver<aux::mojom::ShellHost> host,
    mojo::PendingRemote<aux::mojom::ShellHostClient> client) {
  if (dictation_) {
    dictation_->CancelAll();
  }
  shell_host_receiver_.reset();
  shell_host_client_.reset();
  tab_catalog_subscription_ = {};
  runtime_event_subscription_ = {};
  shell_events_subscription_ = {};
  organization_pref_registrar_.reset();
  edge_monitor_.reset();
  if (IsAuthorizedAuxDocument()) {
    shell_host_receiver_.Bind(std::move(host));
    shell_host_client_.Bind(std::move(client));
    shell_host_client_.set_disconnect_handler(base::BindOnce(
        [](base::WeakPtr<WebUIBrowserUI> ui) {
          if (ui && ui->dictation_) {
            ui->dictation_->CancelAll();
          }
          if (ui) {
            ui->shell_host_receiver_.reset();
            ui->shell_host_client_.reset();
          }
        },
        weak_factory_.GetWeakPtr()));
    if (!browser_->GetProfile()->IsOffTheRecord()) {
      organization_pref_registrar_ = std::make_unique<PrefChangeRegistrar>();
      organization_pref_registrar_->Init(browser_->GetProfile()->GetPrefs());
      organization_pref_registrar_->Add(
          aux::kOrganizationPref,
          base::BindRepeating([](base::WeakPtr<WebUIBrowserUI> ui) {
            if (!ui || !ui->IsAuthorizedAuxDocument() ||
                !ui->shell_host_client_.is_bound()) {
              return;
            }
            const int revision =
                ui->browser_->GetProfile()->GetPrefs()
                    ->GetDict(aux::kOrganizationPref)
                    .FindInt("revision")
                    .value_or(0);
            ui->shell_host_client_->OnEvent(
                "onOrganizationChanged", base::NumberToString(revision));
          }, weak_factory_.GetWeakPtr()));
    }
    edge_monitor_ = std::make_unique<AuxShellEdgeMonitor>(
        browser_window(),
        base::BindRepeating(
            [](base::WeakPtr<WebUIBrowserUI> ui, bool sidebar,
               bool toolbar) {
              if (!ui || !ui->IsAuthorizedAuxDocument() ||
                  !ui->shell_host_client_.is_bound()) {
                return;
              }
              ui->shell_host_client_->OnEvent("onSidebarEdge",
                                               sidebar ? "true" : "false");
              ui->shell_host_client_->OnEvent("onToolbarEdge",
                                               toolbar ? "true" : "false");
            },
            weak_factory_.GetWeakPtr()));
    if (auto* catalog = aux::TabCatalog::GetForProfile(browser_->GetProfile())) {
      tab_catalog_subscription_ = catalog->ObserveChanges(base::BindRepeating(
          [](base::WeakPtr<WebUIBrowserUI> ui, const std::string& patch) {
            if (ui && ui->IsAuthorizedAuxDocument() &&
                ui->shell_host_client_.is_bound()) {
              ui->shell_host_client_->OnEvent("onTabsPatch", patch);
            }
          },
          weak_factory_.GetWeakPtr()));
    }
    if (auto* runtime = AuxRuntimeHost::ForProfile(browser_->GetProfile())) {
      runtime_event_subscription_ = runtime->ObserveEvents(
          base::BindRepeating([](base::WeakPtr<WebUIBrowserUI> ui,
                                 const std::string& event_name,
                                 const std::string& payload_json) {
            if (ui && ui->IsAuthorizedAuxDocument() &&
                ui->shell_host_client_.is_bound()) {
              ui->shell_host_client_->OnEvent(event_name, payload_json);
            }
          }, weak_factory_.GetWeakPtr()));
    }
    shell_events_subscription_ = aux::ObserveShellEvents(
        browser_->GetProfile(),
        base::BindRepeating([](base::WeakPtr<WebUIBrowserUI> ui,
                               const std::string& event_name,
                               const std::string& payload_json) {
          if (ui && ui->IsAuthorizedAuxDocument() &&
              ui->shell_host_client_.is_bound()) {
            if (event_name == "onVaultOffer" ||
                event_name == "onLinkStatus") {
              auto payload = base::JSONReader::Read(payload_json,
                                                    base::JSON_PARSE_RFC);
              const std::string* page_id = payload && payload->is_dict()
                  ? payload->GetDict().FindString("pageId") : nullptr;
              BrowserWindowInterface* owner = nullptr;
              auto* catalog = aux::TabCatalog::GetForProfile(
                  ui->browser_->GetProfile());
              if (!page_id || !catalog ||
                  !catalog->FindPage(*page_id, &owner) ||
                  owner != ui->browser_) {
                return;
              }
            }
            ui->shell_host_client_->OnEvent(event_name, payload_json);
          }
        },
        weak_factory_.GetWeakPtr()));
  }
}

bool WebUIBrowserUI::IsAuthorizedAuxDocument() const {
  const content::RenderFrameHost* frame = web_ui()->GetRenderFrameHost();
  content::WebContents* contents = web_ui()->GetWebContents();
  WebUIBrowserWindow* window =
      WebUIBrowserWindow::FromWebShellWebContents(contents);
  return frame &&
         frame->GetLastCommittedURL().SchemeIs(content::kChromeUIScheme) &&
         frame->GetLastCommittedURL().host() ==
             chrome::kChromeUIAuxHost &&
         window && browser_ && window->browser() == browser_ &&
         Profile::FromWebUI(web_ui()) == browser_->GetProfile();
}

void WebUIBrowserUI::GetIdentity(GetIdentityCallback callback) {
  if (!IsAuthorizedAuxDocument()) {
    std::move(callback).Run("", "", true, aux::mojom::WindowKind::kPrivate);
    return;
  }
  const Profile* profile = browser_->GetProfile();
  std::move(callback).Run(base::NumberToString(browser_->GetSessionID().id()),
                          profile->GetPath().BaseName().AsUTF8Unsafe(),
                          profile->IsOffTheRecord(),
                          profile->IsOffTheRecord() ? aux::mojom::WindowKind::kPrivate :
                          aux::IsQuickAskWindow(browser_) ? aux::mojom::WindowKind::kQuickAsk :
                          aux::IsLittleWindow(browser_) ? aux::mojom::WindowKind::kLittle :
                          aux::mojom::WindowKind::kNormal);
}

void WebUIBrowserUI::Request(const std::string& method,
                             const std::string& args_json,
                             RequestCallback callback) {
  if (!IsAuthorizedAuxDocument()) {
    std::move(callback).Run(false, "", "forbidden",
                            "This Aux shell document is not authorized.");
    return;
  }
  if (args_json.size() > 1024 * 1024) {
    std::move(callback).Run(false, "", "invalid_argument",
                            "Aux shell arguments are too large");
    return;
  }
  const auto args = base::JSONReader::Read(args_json, base::JSON_PARSE_RFC);
  const base::ListValue* list = args ? args->GetIfList() : nullptr;
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
  std::optional<base::UnguessableToken> warm_input_receipt;
  if (const auto* envelope = args ? args->GetIfDict() : nullptr) {
    const auto* receipt = envelope->FindString("warmInputReceipt");
    const auto* original_args = envelope->FindList("args");
    if (method != "dispatchCommand" || envelope->size() != 2 || !receipt ||
        !original_args || original_args->size() != 1 ||
        !(*original_args)[0].is_string() || (*original_args)[0].GetString() != "new-window" ||
        base::WriteJson(*args) != std::optional(args_json)) {
      std::move(callback).Run(false, "", "invalid_argument", "Invalid private warm invocation");
      return;
    }
    warm_input_receipt = base::UnguessableToken::DeserializeFromString(*receipt);
    if (!warm_input_receipt || warm_input_receipt->is_empty() ||
        warm_input_receipt->ToString() != *receipt) {
      std::move(callback).Run(false, "", "invalid_argument", "Invalid private warm receipt");
      return;
    }
    list = original_args;
  }
#endif
  if (!list) {
    std::move(callback).Run(false, "", "invalid_argument",
                            "Aux shell arguments must be an array");
    return;
  }
  const auto& registry = aux::AuxMethodRegistry::Get();
  if (method == "capabilities") {
    if (!list->empty()) {
      std::move(callback).Run(false, "", "invalid_argument",
                              "Capabilities take no arguments");
      return;
    }
    auto capabilities = registry.Capabilities();
#if BUILDFLAG(IS_MAC) && BUILDFLAG(ENABLE_AUX_SHELL) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
    // A secondary measurement window must not open a second mailbox consumer.
    // Its startup session is already bound by the original native creation ticket.
    if (aux::IsLittleWindow(browser_) || aux::IsQuickAskWindow(browser_) ||
        (startup_presentation_session_ && startup_presentation_session_->IsWarmObservation())) {
      auto* methods = capabilities.FindList("methods");
      if (methods) methods->EraseIf([](const base::Value& value) {
        if (!value.is_string()) return false;
        for (const auto& fixture : aux::kNativePrivateFixtureMethods) {
          if (fixture.name == value.GetString() &&
              fixture.gate != aux::NativePrivateFixtureGate::kAppearance) return true;
        }
        return false;
      });
    }
#endif
#if BUILDFLAG(IS_MAC) && BUILDFLAG(ENABLE_AUX_SHELL) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
    if (browser_ && aux::NativeAppearanceObservationEnabled() &&
        IsAuthorizedAuxDocument() && !aux::IsQuickAskWindow(browser_)) {
      const auto original_ui = GetWeakPtr();
      auto* contents = web_ui()->GetWebContents();
      auto* frame = contents->GetPrimaryMainFrame();
      const auto original_contents = contents->GetWeakPtr();
      const auto original_browser = browser_->GetWeakPtr();
      if (frame && frame == web_ui()->GetRenderFrameHost()) {
        const auto document = frame->GetWeakDocumentPtr();
        auto receipt = aux::NativeAppearanceFileChannelReceipt(browser_->GetProfile());
        if (receipt && original_ui && original_contents && original_browser &&
            original_ui->browser_ == original_browser.get() &&
            original_ui->web_ui()->GetWebContents() == original_contents.get() &&
            document.AsRenderFrameHostIfValid() &&
            document.AsRenderFrameHostIfValid() == original_contents->GetPrimaryMainFrame() &&
            document.AsRenderFrameHostIfValid() == original_ui->web_ui()->GetRenderFrameHost() &&
            original_ui->IsAuthorizedAuxDocument()) {
          capabilities.Set("nativeAppearanceFileChannel", std::move(*receipt));
        }
      }
    }
#endif
    std::move(callback).Run(true, *base::WriteJson(capabilities), "", "");
    return;
  }
  std::string validation_error;
  if (method != "invoke" &&
      !registry.Validate(method, base::Value(list->Clone()),
                         &validation_error)) {
    std::move(callback).Run(false, "", "invalid_argument", validation_error);
    return;
  }
  const auto group = registry.ShellGroup(method);
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
  base::ScopedClosureRunner finish_warm_dispatch;
  if (warm_input_receipt) {
    auto ticket = aux::NativeAuxWarmCreationTicket::PreparedTicket();
    if (group != aux::AuxShellMethodGroup::kWindow || !ticket ||
        !ticket->BeginActualCommand(GetWeakPtr(), *warm_input_receipt)) {
      std::move(callback).Run(false, "", "forbidden", "Unmatched private warm invocation");
      return;
    }
    finish_warm_dispatch.ReplaceClosure(base::BindOnce(
        [](base::WeakPtr<aux::NativeAuxWarmCreationTicket> current) {
          if (current) current->EndActualCommand();
        }, ticket));
  }
#endif
  switch (group) {
    case aux::AuxShellMethodGroup::kContent:
      HandleAuxContentRequest(method, *list, std::move(callback));
      return;
    case aux::AuxShellMethodGroup::kCredentials:
      HandleAuxCredentialsRequest(method, *list, std::move(callback));
      return;
    case aux::AuxShellMethodGroup::kDictation:
      HandleAuxDictationRequest(method, *list, std::move(callback));
      return;
    case aux::AuxShellMethodGroup::kBlocking:
      HandleAuxBlockingRequest(method, *list, std::move(callback));
      return;
    case aux::AuxShellMethodGroup::kMigration:
      HandleAuxMigrationRequest(method, *list, std::move(callback));
      return;
    case aux::AuxShellMethodGroup::kProfiles:
      HandleAuxProfilesRequest(method, *list, std::move(callback));
      return;
    case aux::AuxShellMethodGroup::kPageControls:
      HandleAuxPageControlsRequest(method, *list, std::move(callback));
      return;
    case aux::AuxShellMethodGroup::kExtensions:
      HandleAuxExtensionsRequest(method, *list, std::move(callback));
      return;
    case aux::AuxShellMethodGroup::kLibrary:
      HandleAuxLibraryRequest(method, *list, std::move(callback));
      return;
    case aux::AuxShellMethodGroup::kSurfaces:
      HandleAuxSurfacesRequest(method, *list, std::move(callback));
      return;
    case aux::AuxShellMethodGroup::kTabs:
      HandleAuxTabsRequest(method, *list, std::move(callback));
      return;
    case aux::AuxShellMethodGroup::kHealth:
      HandleAuxHealthRequest(method, *list, std::move(callback));
      return;
    case aux::AuxShellMethodGroup::kWindow:
      HandleAuxWindowRequest(method, *list, std::move(callback));
      return;
    case aux::AuxShellMethodGroup::kNone:
      break;
  }
  if (method != "invoke") {
    std::move(callback).Run(false, "", "not_found",
                            "Unsupported Aux shell method: " + method);
    return;
  }
  if (browser_->GetProfile()->IsOffTheRecord()) {
    std::move(callback).Run(false, "", "forbidden",
                            "Private windows have no Aux runtime");
    return;
  }
  if (!list || list->size() < 1 || list->size() > 2 ||
      !(*list)[0].is_string() || (*list)[0].GetString().empty() ||
      (*list)[0].GetString().size() > 128) {
    std::move(callback).Run(false, "", "invalid_argument",
                            "Invalid Aux shell invocation");
    return;
  }
  const base::Value params =
      list->size() == 2 ? (*list)[1].Clone() : base::Value();
  const auto params_json = base::WriteJson(params);
  if (!params_json) {
    std::move(callback).Run(false, "", "invalid_argument",
                            "Invalid Aux API arguments");
    return;
  }
  AuxRuntimeHost* host = AuxRuntimeHost::ForProfile(browser_->GetProfile());
  if (!host) {
    std::move(callback).Run(false, "", "forbidden",
                            "Private windows have no Aux runtime");
    return;
  }
  host->CallApi(
      (*list)[0].GetString(), *params_json,
      base::BindOnce(
          [](RequestCallback callback, AuxRuntimeHost::Response response) {
            std::move(callback).Run(response.ok, response.result_json,
                                    response.error_code,
                                    response.error_message);
          },
          std::move(callback)));
}
#endif

void WebUIBrowserUI::BindInterface(
    mojo::PendingReceiver<bookmark_bar::mojom::PageHandlerFactory> receiver) {
  bookmark_bar_page_factory_receiver_.reset();
  bookmark_bar_page_factory_receiver_.Bind(std::move(receiver));
}

void WebUIBrowserUI::BindInterface(
    mojo::PendingReceiver<extensions_bar::mojom::PageHandlerFactory> receiver) {
  extensions_bar_page_factory_receiver_.reset();
  extensions_bar_page_factory_receiver_.Bind(std::move(receiver));
}

void WebUIBrowserUI::BindInterface(
    mojo::PendingReceiver<searchbox::mojom::PageHandlerFactory> receiver) {
  searchbox_page_factory_receiver_.reset();
  searchbox_page_factory_receiver_.Bind(std::move(receiver));
}

void WebUIBrowserUI::CreatePageHandler(
    mojo::PendingRemote<searchbox::mojom::Page> page,
    mojo::PendingReceiver<searchbox::mojom::PageHandler> pending_page_handler) {
  content::WebContents* web_contents = web_ui()->GetWebContents();
  // TODO(crbug.com/445510209): Pass `metrics_reporter_` after installing a
  // WebUIOmniboxHandler.
  realbox_handler_ = std::make_unique<RealboxHandler>(
      std::move(pending_page_handler), std::move(page),
      Profile::FromWebUI(web_ui()), web_contents,
      base::BindRepeating(&WebUIBrowserUI::GetOrCreateContextualSessionHandle,
                          base::Unretained(this)));
}

void WebUIBrowserUI::BindInterface(
    mojo::PendingReceiver<bookmarks_api::mojom::BookmarksService> receiver) {
  WebUIBrowserWindow* window =
      WebUIBrowserWindow::FromWebShellWebContents(web_ui()->GetWebContents());
  if (window) {
    BrowserWindowInterface* browser_window = window->browser();
    if (browser_window) {
      auto* feature = BookmarksServiceFeature::From(browser_window);
      if (feature) {
        feature->Accept(std::move(receiver));
      }
    }
  }
}

void WebUIBrowserUI::BindInterface(
    mojo::PendingReceiver<guest_contents::mojom::GuestContentsHost> receiver) {
  guest_contents::GuestContentsHostImpl::Create(web_ui()->GetWebContents(),
                                                std::move(receiver));
}

void WebUIBrowserUI::BindInterface(
    mojo::PendingReceiver<tabs_api::mojom::TabStripService> receiver) {
  auto* tab_strip_service_feature = TabStripServiceFeature::From(browser_);
  CHECK(tab_strip_service_feature) << "Browser missing TabStripService";
  tab_strip_service_feature->Accept(std::move(receiver));
}

void WebUIBrowserUI::BindInterface(
    mojo::PendingReceiver<tabs_api::mojom::TabStripExperimentService>
        receiver) {
  auto* tab_strip_service_feature = TabStripServiceFeature::From(browser_);
  CHECK(tab_strip_service_feature) << "Browser missing TabStripService";
  tab_strip_service_feature->AcceptExperimental(std::move(receiver));
}

void WebUIBrowserUI::BindInterface(
    mojo::PendingReceiver<tabs_api::mojom::TabDragService> receiver) {
  auto* tab_drag_service_feature = TabDragServiceFeature::From(browser_);
  CHECK(tab_drag_service_feature) << "Browser missing TabDragService";
  tab_drag_service_feature->AcceptDragService(
      std::move(receiver), web_ui()->GetWebContents()->GetNativeView());
}

void WebUIBrowserUI::BindInterface(
    mojo::PendingReceiver<tabs_api::mojom::TabStripUIController> receiver) {
  auto* ui_controller = tabs_api::TabStripUIControllerImpl::From(browser_);
  CHECK(ui_controller) << "Browser missing TabStripUIController";
  ui_controller->Bind(std::move(receiver));
}

base::WeakPtr<WebUIBrowserUI> WebUIBrowserUI::GetWeakPtr() {
  return weak_factory_.GetWeakPtr();
}

void WebUIBrowserUI::CreatePageHandler(
    mojo::PendingRemote<webui_browser::mojom::Page> page,
    mojo::PendingReceiver<webui_browser::mojom::PageHandler> receiver) {
  page_.reset();
  page_.Bind(std::move(page));
  auto* render_frame_host = web_ui()->GetRenderFrameHost();
  WebUIBrowserPageHandler::CreateForRenderFrameHost(*render_frame_host,
                                                    std::move(receiver), this);
  page_->OnPaintAsActiveChanged(
      browser_window()->widget()->ShouldPaintAsActive());
}

void WebUIBrowserUI::CreatePageHandler(
    mojo::PendingRemote<bookmark_bar::mojom::Page> page,
    mojo::PendingReceiver<bookmark_bar::mojom::PageHandler> receiver) {
  bookmark_bar_page_handler_ =
      std::make_unique<WebUIBrowserBookmarkBarPageHandler>(
          std::move(receiver), std::move(page), web_ui(), browser_);
}

void WebUIBrowserUI::CreatePageHandler(
    mojo::PendingRemote<extensions_bar::mojom::Page> page,
    mojo::PendingReceiver<extensions_bar::mojom::PageHandler> receiver) {
  static_cast<WebUIToolbarExtensionsContainer*>(
      ExtensionsContainer::From(*browser()))
      ->Bind(std::move(page), std::move(receiver));
}

const std::vector<ui::ElementIdentifier>&
WebUIBrowserUI::GetKnownElementIdentifiers() const {
  static const std::vector<ui::ElementIdentifier> kKnownElementIdentifiers{
      kContentsContainerViewElementId, kExtensionsMenuButtonElementId,
      kToolbarActionViewElementId,     kLocationBarElementId,
      kLocationIconElementId,          kToolbarAppMenuButtonElementId,
      kToolbarAvatarButtonElementId,   kToolbarBackButtonElementId,
      kToolbarForwardButtonElementId};
  return kKnownElementIdentifiers;
}

void WebUIBrowserUI::BookmarkBarStateChanged(
    BookmarkBar::AnimateChangeType change_type) {
  if (bookmark_bar_page_handler_) {
    bookmark_bar_page_handler_->SetBookmarkBarState(
        BookmarkBarController::From(browser_)->bookmark_bar_state(),
        change_type);
  }
}

void WebUIBrowserUI::ShowSidePanel(SidePanelEntryKey side_panel_entry_key) {
  // Create guest contents.
  WebUIBrowserSidePanelUI* side_panel_ui =
      browser_window()->GetWebUIBrowserSidePanelUI();
  content::WebContents* web_contents =
      side_panel_ui->GetWebContentsForId(side_panel_entry_key.id());
  if (!web_contents) {
    return;
  }
  web_contents->SetColorProviderSource(browser_window());
  auto* guest_handle =
      guest_contents::GuestContentsHandle::CreateForWebContents(web_contents);

#if BUILDFLAG(ENABLE_AUX_SHELL)
  if (web_ui()->GetWebContents()->GetLastCommittedURL().host() == "aux") {
    aux::PublishExtensionSidePanel(browser_, true);
    return;
  }
#endif
  // Notify JS.
  page_->ShowSidePanel(guest_handle->id(),
                       SidePanelEntryIdToTitle(side_panel_entry_key.id()));
}

void WebUIBrowserUI::CloseSidePanel() {
#if BUILDFLAG(ENABLE_AUX_SHELL)
  if (web_ui()->GetWebContents()->GetLastCommittedURL().host() == "aux") {
    aux::PublishExtensionSidePanel(browser_, false);
    browser_window()->GetWebUIBrowserSidePanelUI()->OnSidePanelClosed();
    return;
  }
#endif
  page_->CloseSidePanel();
}

contextual_search::ContextualSearchSessionHandle*
WebUIBrowserUI::GetOrCreateContextualSessionHandle() {
  if (!session_handle_) {
    auto* service = ContextualSearchServiceFactory::GetForProfile(
        Profile::FromWebUI(web_ui()));
    if (service) {
      // TODO(crbug.com/445510209): Use appropriate config and source
      session_handle_ = service->CreateSession(
          omnibox::CreateQueryControllerConfigParams(),
          contextual_search::ContextualSearchSource::kOmnibox,
          lens::LensOverlayInvocationSource::kOmniboxContextualQuery);
      // TODO(crbug.com/469877646): Determine what to do with the return value
      // of this call, or move this call to a different location.
      session_handle_->CheckSearchContentSharingSettings(
          Profile::FromWebUI(web_ui())->GetPrefs());
    }
  }
  return session_handle_.get();
}

WEB_UI_CONTROLLER_TYPE_IMPL(WebUIBrowserUI)

#if BUILDFLAG(IS_MAC) && BUILDFLAG(ENABLE_AUX_SHELL) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
base::WeakPtr<BrowserWindowInterface> WebUIBrowserUI::NativeWarmCleanupWindowForTesting() const {
  return warm_window_fixture_ ? warm_window_fixture_->CleanupWindow(weak_factory_.GetMutableWeakPtr()) :
      base::WeakPtr<BrowserWindowInterface>();
}
#endif
