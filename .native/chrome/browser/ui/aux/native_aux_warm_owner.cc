// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_aux_warm_owner.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(ENABLE_AUX_SHELL) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include <unistd.h>
#include <utility>
#include "base/command_line.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/aux/quick_ask_controller.h"
#include "chrome/browser/ui/aux/little_window_controller.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface_iterator.h"
#include "chrome/browser/ui/webui_browser/webui_browser_ui.h"
#include "chrome/browser/ui/webui_browser/webui_browser_window.h"
#include "content/public/browser/browser_thread.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/web_ui.h"
#include "ui/views/widget/widget.h"
namespace aux {
NativeAuxWarmOwner::NativeAuxWarmOwner(NativeStartupLaunchReceipt receipt,
    base::WeakPtr<WebUIBrowserUI> ui, NativeGuestStageOwnedSnapshot shell,
    NativeProcessFootprint process)
    : receipt_(std::move(receipt)), shell_(std::move(shell)),
      process_(std::move(process)), ui_(ui), original_(ui->browser()->GetWeakPtr()),
      document_(ui->web_ui()->GetWebContents()->GetPrimaryMainFrame()->GetWeakDocumentPtr()) {}
NativeAuxWarmOwner::~NativeAuxWarmOwner() = default;
std::unique_ptr<NativeAuxWarmOwner> NativeAuxWarmOwner::RetainOriginal(
    NativeStartupLaunchReceipt receipt, base::WeakPtr<WebUIBrowserUI> ui) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (!NativeStartupObservationEnabled() || !receipt.lease || !receipt.lease->Validate() ||
      receipt.browser_pid != getpid() || !ui || !ui->browser() || !ui->web_ui()) return nullptr;
  auto* browser = ui->browser();
  auto* profile = browser->GetProfile();
  if (!profile || profile->IsOffTheRecord() || IsQuickAskWindow(browser) || IsLittleWindow(browser) || browser->GetType() != BrowserWindowInterface::TYPE_NORMAL)
    return nullptr;
  auto browser_weak = browser->GetWeakPtr();
  auto shell = ReadNativeGuestStageShellOwner(ui);
  auto* contents = ui ? ui->web_ui()->GetWebContents() : nullptr;
  auto* frame = contents ? contents->GetPrimaryMainFrame() : nullptr;
  if (!shell || !frame || !frame->IsRenderFrameLive()) return nullptr;
  const auto document = frame->GetWeakDocumentPtr();
  auto process = ReadNativeProcessFootprint(getpid());
  if (!process || process->pid != getpid() || !ui || !browser_weak ||
      !document.AsRenderFrameHostIfValid() || ui->browser() != browser_weak.get() ||
      ui->web_ui()->GetWebContents()->GetPrimaryMainFrame() != document.AsRenderFrameHostIfValid() ||
      ReadNativeGuestStageShellOwner(ui) != shell || !ui || !receipt.lease->Validate()) return nullptr;
  auto result = std::unique_ptr<NativeAuxWarmOwner>(new NativeAuxWarmOwner(
      std::move(receipt), ui, std::move(*shell), std::move(*process)));
  return result->BeforeCreation() ? std::move(result) : nullptr;
}
bool NativeAuxWarmOwner::Lifetime() const {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (!NativeStartupObservationEnabled() || !receipt_.lease || !receipt_.lease->Validate() ||
      receipt_.browser_pid != getpid() || !ui_ || !original_ || !ui_->web_ui() ||
      ui_->browser() != original_.get()) return false;
  auto* profile = original_->GetProfile();
  auto* frame = document_.AsRenderFrameHostIfValid();
  if (!profile || profile->IsOffTheRecord() || IsQuickAskWindow(original_.get()) || IsLittleWindow(original_.get()) || original_->GetType() != BrowserWindowInterface::TYPE_NORMAL ||
      profile->GetPath().DirName() != base::FilePath(
          base::CommandLine::ForCurrentProcess()->GetSwitchValueASCII("user-data-dir")) ||
      !frame || !frame->IsRenderFrameLive() || ui_->web_ui()->GetWebContents()->GetPrimaryMainFrame() != frame)
    return false;
  const auto current = ReadNativeProcessFootprint(getpid());
  if (!current || current->pid != process_.pid || current->process_uuid != process_.process_uuid ||
      current->process_start_absolute != process_.process_start_absolute || !ui_ || !original_ ||
      document_.AsRenderFrameHostIfValid() != frame || !receipt_.lease->Validate()) return false;
  return ReadNativeGuestStageShellOwner(ui_) == shell_ && ui_ && original_ &&
      document_.AsRenderFrameHostIfValid() == frame;
}
bool NativeAuxWarmOwner::Inventory(bool with_created) const {
  if (!original_ || (with_created && !created_)) return false;
  bool valid = true, original_seen = false, created_seen = false;
  size_t count = 0;
  ForEachCurrentBrowserWindowInterfaceOrderedByActivation(
      [&](BrowserWindowInterface* actual) {
        ++count;
        if (actual == original_.get()) original_seen = true;
        else if (with_created && actual == created_.get()) created_seen = true;
        else valid = false;
        return true;
      });
  return valid && original_seen && count == (with_created ? 2u : 1u) &&
      (!with_created || (created_seen && created_ && original_ &&
        created_->GetProfile() == original_->GetProfile() &&
        created_->GetType() == BrowserWindowInterface::TYPE_NORMAL &&
        !IsQuickAskWindow(created_.get()) && !IsLittleWindow(created_.get()) &&
        WebUIBrowserWindow::FromBrowser(created_.get())));
}
bool NativeAuxWarmOwner::BeforeCreation() const {
  return !creation_attempted_ && !created_ && Lifetime() && Inventory(false) && Lifetime();
}
bool NativeAuxWarmOwner::MatchesOriginalDocument(base::WeakPtr<WebUIBrowserUI> actual) const {
  return actual && ui_ && actual.get() == ui_.get() && Lifetime() &&
      actual && ui_ && actual.get() == ui_.get();
}
bool NativeAuxWarmOwner::MatchesOriginalRequest(base::WeakPtr<WebUIBrowserUI> actual) const {
  return actual && ui_ && actual.get() == ui_.get() && BeforeCreation() &&
      actual && ui_ && actual.get() == ui_.get();
}
bool NativeAuxWarmOwner::BindCreated(BrowserWindowInterface* actual, views::Widget* actual_widget) {
  if (std::exchange(creation_attempted_, true) || !Lifetime() || !actual || !original_ ||
      actual == original_.get() || actual->GetProfile() != original_->GetProfile() ||
      actual->GetType() != BrowserWindowInterface::TYPE_NORMAL || IsQuickAskWindow(actual) || IsLittleWindow(actual) || !actual_widget) return false;
  // Browser::Create publishes the BWI only AFTER its window constructor.
  // Resolve the exact already-installed native widget property here; the
  // browser's GetWindow() is not assigned until the constructor returns.
  auto* window = WebUIBrowserWindow::FromNativeWindow(actual_widget->GetNativeWindow());
  if (!window || window->browser() != actual || window->widget() != actual_widget) return false;
  created_widget_ = actual_widget->GetWeakPtr();
  created_ = actual->GetWeakPtr();
  if (!DuringCreation()) { created_.reset(); created_widget_.reset(); return false; }
  return true;
}
bool NativeAuxWarmOwner::DuringCreation() const {
  if (!created_widget_ || created_widget_->IsClosed()) return false;
  auto* actual = WebUIBrowserWindow::FromNativeWindow(created_widget_->GetNativeWindow());
  return actual && created_widget_ && actual->widget() == created_widget_.get() &&
      actual->browser() == created_.get() && created_ && original_ && Lifetime() &&
      created_->GetProfile() == original_->GetProfile() &&
      created_->GetType() == BrowserWindowInterface::TYPE_NORMAL &&
      !IsQuickAskWindow(created_.get()) && !IsLittleWindow(created_.get()) &&
      (Inventory(false) || Inventory(true)) && Lifetime();
}
bool NativeAuxWarmOwner::WithCreated() const {
  return DuringCreation() && created_ && created_widget_ &&
      WebUIBrowserWindow::FromBrowser(created_.get()) && Inventory(true) && Lifetime();
}
bool NativeAuxWarmOwner::MatchesChild(base::WeakPtr<WebUIBrowserUI> actual) const {
  if (!actual || !created_ || actual->browser() != created_.get() || !WithCreated()) return false;
  const auto child = ReadNativeGuestStageShellOwner(actual);
  return child && actual && created_ && ui_ && actual->browser() == created_.get() &&
      actual->web_ui() && ui_->web_ui() &&
      Profile::FromWebUI(actual->web_ui()) == Profile::FromWebUI(ui_->web_ui()) && WithCreated();
}
base::WeakPtr<BrowserWindowInterface> NativeAuxWarmOwner::original_browser() const { return original_; }
base::WeakPtr<BrowserWindowInterface> NativeAuxWarmOwner::created_browser() const { return created_; }
const NativeStartupLaunchReceipt& NativeAuxWarmOwner::original_launch() const { return receipt_; }
const NativeProcessFootprint& NativeAuxWarmOwner::original_process() const { return process_; }
const NativeGuestStageOwnedSnapshot& NativeAuxWarmOwner::original_shell() const { return shell_; }
}  // namespace aux
#endif
