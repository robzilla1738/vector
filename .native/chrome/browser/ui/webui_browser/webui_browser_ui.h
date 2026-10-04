// Copyright 2025 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef CHROME_BROWSER_UI_WEBUI_BROWSER_WEBUI_BROWSER_UI_H_
#define CHROME_BROWSER_UI_WEBUI_BROWSER_WEBUI_BROWSER_UI_H_

#include <memory>
#include <optional>
#include "base/unguessable_token.h"
#include <cstdint>
#include <map>
#include <string>

#include "base/callback_list.h"
#include "base/files/file_path.h"
#include "chrome/browser/buildflags.h"
#if BUILDFLAG(ENABLE_AUX_SHELL)
#include "chrome/browser/ui/webui_browser/shell_host.mojom.h"
#include "ui/shell_dialogs/select_file_dialog.h"
#include "ui/menus/simple_menu_model.h"
#endif
#include "chrome/browser/ui/side_panel/side_panel_entry_key.h"
#include "chrome/browser/ui/webui/metrics_reporter/metrics_reporter.h"
#include "chrome/browser/ui/webui_browser/bookmark_bar.mojom.h"
#include "chrome/browser/ui/webui_browser/browser.mojom.h"
#include "chrome/browser/ui/webui_browser/webui_browser_window.h"
#include "components/browser_apis/bookmarks/bookmarks_service.h"
#include "components/browser_apis/tab_drag/tab_drag_api.mojom.h"
#include "components/browser_apis/tab_strip/tab_strip_api.mojom.h"
#include "components/browser_apis/tab_strip/tab_strip_experiment_api.mojom.h"
#include "components/browser_apis/tab_strip/tab_strip_ui_controller.mojom.h"
#include "components/browser_apis/ui_controllers/toolbar/extensions_bar.mojom.h"
#include "components/guest_contents/common/guest_contents.mojom.h"
#include "components/omnibox/browser/searchbox.mojom.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/web_ui_controller.h"
#include "content/public/browser/webui_config.h"
#include "mojo/public/cpp/bindings/receiver.h"
#include "mojo/public/cpp/bindings/remote.h"
#include "ui/webui/mojo_web_ui_controller.h"
#include "ui/webui/resources/js/tracked_element/tracked_element.mojom.h"

class BrowserWindowInterface;
class BackForwardMenuModel;
namespace views {
class MenuModelAdapter;
class MenuRunner;
}

namespace content {
class BrowserContext;
}  // namespace content

namespace contextual_search {
class ContextualSearchSessionHandle;
}  // namespace contextual_search

namespace ui {
class TrackedElementHandler;
}  // namespace ui

class RealboxHandler;
namespace content { class NativePlatformInputAdmission; }
class WebUIBrowserUI;
namespace password_manager {
class PasswordImporter;
struct ImportResults;
}
namespace device_reauth {
class DeviceAuthenticator;
}
#if BUILDFLAG(ENABLE_AUX_SHELL)
class AuxShellEdgeMonitor;
class PrefChangeRegistrar;
namespace aux {
class DictationMac;
class NativeCommandPresentationSession;
class NativeGuestPresentationFixture;
class NativeLittlePresentationFixture;
#if BUILDFLAG(ENABLE_AUX_SHELL)
class NativePipPresentationFixture;
#endif
class NativeOrganizationWorkFixture;
class NativePerformanceMailbox;
class NativeShellMemorySampler;
class NativeProcessMemorySampler;
class NativeCdpMeasurementProducer;
class NativeStopInputEndpoint;
#if BUILDFLAG(ENABLE_AUX_SHELL)
class NativeStartupPresentationSession;
class NativeAuxWarmFixture;
#endif
}
#endif
class WebUIBrowserBookmarkBarPageHandler;

class WebUIBrowserUIConfig
    : public content::DefaultWebUIConfig<WebUIBrowserUI> {
 public:
  WebUIBrowserUIConfig();

  // content::DefaultWebUIConfig:
  bool IsWebUIEnabled(content::BrowserContext* browser_context) override;
};

// The WebUI for chrome://webui-browser
class WebUIBrowserUI : public ui::MojoWebUIController,
                       public webui_browser::mojom::PageHandlerFactory,
#if BUILDFLAG(ENABLE_AUX_SHELL)
                       public aux::mojom::ShellHostFactory,
                       public aux::mojom::ShellHost,
                       public ui::SelectFileDialog::Listener,
                       public ui::SimpleMenuModel::Delegate,
#endif
                       public bookmark_bar::mojom::PageHandlerFactory,
                       public extensions_bar::mojom::PageHandlerFactory,
                       public searchbox::mojom::PageHandlerFactory {
 public:
  explicit WebUIBrowserUI(content::WebUI* web_ui);
  ~WebUIBrowserUI() override;

  void BindInterface(
      mojo::PendingReceiver<webui_browser::mojom::PageHandlerFactory> receiver);
#if BUILDFLAG(ENABLE_AUX_SHELL)
  void BindInterface(
      mojo::PendingReceiver<aux::mojom::ShellHostFactory> receiver);
#endif
  void BindInterface(
      mojo::PendingReceiver<bookmark_bar::mojom::PageHandlerFactory> receiver);
  void BindInterface(
      mojo::PendingReceiver<bookmarks_api::mojom::BookmarksService> receiver);
  void BindInterface(
      mojo::PendingReceiver<extensions_bar::mojom::PageHandlerFactory>
          receiver);
  void BindInterface(
      mojo::PendingReceiver<searchbox::mojom::PageHandlerFactory> receiver);
  void BindInterface(
      mojo::PendingReceiver<guest_contents::mojom::GuestContentsHost> receiver);
  void BindInterface(
      mojo::PendingReceiver<tabs_api::mojom::TabStripService> receiver);
  void BindInterface(
      mojo::PendingReceiver<tabs_api::mojom::TabStripExperimentService>
          receiver);
  void BindInterface(
      mojo::PendingReceiver<tabs_api::mojom::TabDragService> receiver);
  void BindInterface(
      mojo::PendingReceiver<tabs_api::mojom::TabStripUIController> receiver);

  void BookmarkBarStateChanged(BookmarkBar::AnimateChangeType change_type);
  void ShowSidePanel(SidePanelEntryKey side_panel_entry_key);
  void CloseSidePanel();

  BrowserWindowInterface* browser() { return browser_; }
  WebUIBrowserWindow* browser_window() {
    return WebUIBrowserWindow::FromBrowser(browser_);
  }

  webui_browser::mojom::Page* page() {
    // get() should only be called if bound, so check first.
    return page_.is_bound() ? page_.get() : nullptr;
  }

  RealboxHandler* realbox_handler_for_testing() {
    return realbox_handler_.get();
  }

  base::WeakPtr<WebUIBrowserUI> GetWeakPtr();
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
  base::WeakPtr<BrowserWindowInterface> NativeLittleCleanupWindowForTesting() const;
#if BUILDFLAG(ENABLE_AUX_SHELL)
  base::WeakPtr<BrowserWindowInterface> NativeWarmCleanupWindowForTesting() const;
#endif
  void ObserveAuxPerformanceInput(const gfx::NativeEvent& event);
#if BUILDFLAG(ENABLE_AUX_SHELL)
  bool AdmitAuxNativeStopMeasurement(const content::NativePlatformInputAdmission& admission);
#endif
  bool DeferAuxGuestTabSwitchForTesting(const gfx::NativeEvent& event,
      base::OnceClosure registered_effect);
#endif
#if BUILDFLAG(ENABLE_AUX_SHELL)
  bool DispatchAuxShortcut(const std::string& command_id, bool focus_shell = false,
                           std::optional<bool> website_pass_through = std::nullopt,
                           std::optional<base::UnguessableToken> warm_input_receipt = std::nullopt);
  bool IsCommandIdEnabled(int command_id) const override;
  void ExecuteCommand(int command_id, int event_flags) override;
#endif

 private:
  WEB_UI_CONTROLLER_TYPE_DECL();

#if BUILDFLAG(ENABLE_AUX_SHELL)
  // aux::mojom::ShellHostFactory and aux::mojom::ShellHost.
  void CreateShellHost(
      mojo::PendingReceiver<aux::mojom::ShellHost> host,
      mojo::PendingRemote<aux::mojom::ShellHostClient> client) override;
  void GetIdentity(GetIdentityCallback callback) override;
  void Request(const std::string& method,
               const std::string& args_json,
               RequestCallback callback) override;
  void HandleAuxContentRequest(
      const std::string& method, const base::ListValue& args,
      RequestCallback callback);
  void HandleAuxCredentialsRequest(
      const std::string& method, const base::ListValue& args,
      RequestCallback callback);
  void FinishPasswordExport(const base::FilePath& path,
                            std::string passphrase,
                            RequestCallback callback);
  void OnPasswordExportAuthenticated(base::FilePath path,
                                     std::string passphrase,
                                     RequestCallback callback,
                                     bool authenticated);
  void ExportPasswordFile(const base::FilePath& path,
                          std::string passphrase,
                          RequestCallback callback);
  void FinishPasswordImport(const base::FilePath& path,
                            std::string passphrase,
                            RequestCallback callback);
  void OnPasswordImportFinished(
      RequestCallback callback,
      size_t total,
      std::unique_ptr<password_manager::PasswordImporter> importer,
      const password_manager::ImportResults& results);
  void HandleAuxDictationRequest(
      const std::string& method, const base::ListValue& args,
      RequestCallback callback);
  void HandleAuxBlockingRequest(
      const std::string& method, const base::ListValue& args,
      RequestCallback callback);
  void HandleAuxMigrationRequest(
      const std::string& method, const base::ListValue& args,
      RequestCallback callback);
  void HandleAuxProfilesRequest(
      const std::string& method, const base::ListValue& args,
      RequestCallback callback);
  void HandleAuxPageControlsRequest(
      const std::string& method, const base::ListValue& args,
      RequestCallback callback);
  void HandleAuxExtensionsRequest(
      const std::string& method, const base::ListValue& args,
      RequestCallback callback);
  void HandleAuxLibraryRequest(
      const std::string& method, const base::ListValue& args,
      RequestCallback callback);
  void HandleAuxSurfacesRequest(
      const std::string& method, const base::ListValue& args,
      RequestCallback callback);
  void HandleAuxTabsRequest(
      const std::string& method, const base::ListValue& args,
      RequestCallback callback);
  void HandleAuxHealthRequest(
      const std::string& method, const base::ListValue& args,
      RequestCallback callback);
  void HandleAuxWindowRequest(
      const std::string& method, const base::ListValue& args,
      RequestCallback callback);
  void FileSelected(const ui::SelectedFileInfo& file, int index) override;
  void FileSelectionCanceled() override;
  void BeginAuxGeneratedSave(std::string filename,
                             std::string content,
                             base::FilePath source,
                             int64_t source_size,
                             RequestCallback callback);
  bool IsAuthorizedAuxDocument() const;
#endif

  // webui_browser::mojom::PageHandlerFactory:
  void CreatePageHandler(
      mojo::PendingRemote<webui_browser::mojom::Page> page,
      mojo::PendingReceiver<webui_browser::mojom::PageHandler> receiver)
      override;

  // bookmark_bar::mojom::PageHandlerFactory:
  void CreatePageHandler(mojo::PendingRemote<bookmark_bar::mojom::Page> page,
                         mojo::PendingReceiver<bookmark_bar::mojom::PageHandler>
                             receiver) override;

  // extensions_bar::mojom::PageHandlerFactory:
  void CreatePageHandler(
      mojo::PendingRemote<extensions_bar::mojom::Page> page,
      mojo::PendingReceiver<extensions_bar::mojom::PageHandler> receiver)
      override;

  // searchbox::mojom::PageHandlerFactory:
  void CreatePageHandler(
      mojo::PendingRemote<searchbox::mojom::Page> page,
      mojo::PendingReceiver<searchbox::mojom::PageHandler> receiver) override;

  // Returns the list of known element identifiers. These elements are HTML
  // elements tracked by ui/webui/tracked_element. Used for anchoring secondary
  // UIs.
  const std::vector<ui::ElementIdentifier>& GetKnownElementIdentifiers() const;

  // Lazily creates and returns a reference to the owned contextual search
  // session handle for `realbox_handler_`.
  contextual_search::ContextualSearchSessionHandle*
  GetOrCreateContextualSessionHandle();

  // Must outlive `realbox_handler_`.
  std::unique_ptr<contextual_search::ContextualSearchSessionHandle>
      session_handle_;
  std::unique_ptr<RealboxHandler> realbox_handler_;
  std::unique_ptr<WebUIBrowserBookmarkBarPageHandler>
      bookmark_bar_page_handler_;
  std::unique_ptr<ui::TrackedElementHandler> tracked_element_handler_;

  mojo::Remote<webui_browser::mojom::Page> page_;
  mojo::Receiver<webui_browser::mojom::PageHandlerFactory>
      page_factory_receiver_{this};

#if BUILDFLAG(ENABLE_AUX_SHELL)
  std::map<std::string, int> space_binding_versions_;
  std::unique_ptr<aux::DictationMac> dictation_;
  mojo::Receiver<aux::mojom::ShellHostFactory> shell_host_factory_receiver_{
      this};
  mojo::Receiver<aux::mojom::ShellHost> shell_host_receiver_{this};
  mojo::Remote<aux::mojom::ShellHostClient> shell_host_client_;
  base::CallbackListSubscription tab_catalog_subscription_;
  base::CallbackListSubscription runtime_event_subscription_;
  base::CallbackListSubscription shell_events_subscription_;
  std::unique_ptr<PrefChangeRegistrar> organization_pref_registrar_;
  std::unique_ptr<AuxShellEdgeMonitor> edge_monitor_;
  std::unique_ptr<BackForwardMenuModel> aux_navigation_menu_model_;
  std::unique_ptr<views::MenuModelAdapter> aux_navigation_menu_adapter_;
  std::unique_ptr<views::MenuRunner> aux_navigation_menu_runner_;
  std::unique_ptr<ui::SimpleMenuModel> aux_context_menu_model_;
  std::unique_ptr<views::MenuModelAdapter> aux_context_menu_adapter_;
  std::unique_ptr<views::MenuRunner> aux_context_menu_runner_;
  std::string aux_context_page_id_;
  enum class FileDialogPurpose {
    kNone,
    kOpenFile,
    kSaveFile,
    kSavePdf,
    kDownloadFolder,
    kPluginDirectory,
    kEvidenceImage,
    kEvidenceDocument,
    kUnpackedExtension,
    kRuntimeRestore,
    kPasswordExport,
    kPasswordImport
  };
  FileDialogPurpose file_dialog_purpose_ = FileDialogPurpose::kNone;
  scoped_refptr<ui::SelectFileDialog> open_file_dialog_;
  RequestCallback file_dialog_callback_;
  std::string password_transfer_passphrase_;
  std::unique_ptr<device_reauth::DeviceAuthenticator>
      password_export_authenticator_;
  bool password_export_auth_pending_ = false;
  std::string save_file_content_;
  base::FilePath save_file_source_;
  int64_t save_file_source_size_ = 0;
  std::string save_pdf_page_id_;
#endif

  mojo::Receiver<bookmark_bar::mojom::PageHandlerFactory>
      bookmark_bar_page_factory_receiver_{this};
  mojo::Receiver<extensions_bar::mojom::PageHandlerFactory>
      extensions_bar_page_factory_receiver_{this};

  mojo::Receiver<searchbox::mojom::PageHandlerFactory>
      searchbox_page_factory_receiver_{this};

  raw_ptr<BrowserWindowInterface> browser_;

#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
  std::unique_ptr<aux::NativeCommandPresentationSession> command_presentation_session_;
  std::unique_ptr<aux::NativeGuestPresentationFixture> guest_presentation_fixture_;
  std::unique_ptr<aux::NativeLittlePresentationFixture> little_presentation_fixture_;
#if BUILDFLAG(ENABLE_AUX_SHELL)
  std::unique_ptr<aux::NativePipPresentationFixture> pip_presentation_fixture_;
#endif
  std::unique_ptr<aux::NativePerformanceMailbox> performance_mailbox_;
  std::unique_ptr<aux::NativeOrganizationWorkFixture> organization_work_fixture_;
  std::unique_ptr<aux::NativeShellMemorySampler> shell_memory_sampler_;
  std::unique_ptr<aux::NativeProcessMemorySampler> process_memory_sampler_;
#if BUILDFLAG(ENABLE_AUX_SHELL)
  std::unique_ptr<aux::NativeCdpMeasurementProducer> cdp_measurement_producer_;
  std::unique_ptr<aux::NativeStopInputEndpoint> stop_input_endpoint_;
  std::unique_ptr<aux::NativeStartupPresentationSession> startup_presentation_session_;
  std::unique_ptr<aux::NativeAuxWarmFixture> warm_window_fixture_;
#endif
#endif
  base::WeakPtrFactory<WebUIBrowserUI> weak_factory_{this};
};

#endif  // CHROME_BROWSER_UI_WEBUI_BROWSER_WEBUI_BROWSER_UI_H_
