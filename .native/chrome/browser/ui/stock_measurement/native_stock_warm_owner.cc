// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/stock_measurement/native_stock_warm_owner.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS) && !BUILDFLAG(ENABLE_AUX_SHELL)
#include <unistd.h>
#include <utility>
#include "base/command_line.h"
#include "base/files/file_path.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface_iterator.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "components/sessions/core/session_id.h"
#include "content/public/browser/browser_thread.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/web_contents.h"
namespace aux {
NativeStockWarmOwner::NativeStockWarmOwner(NativeStartupLaunchReceipt original,
    BrowserWindowInterface* browser, NativeProcessFootprint process)
    : receipt_(std::move(original)), process_(std::move(process)),
      original_browser_window_id_(browser->GetSessionID().id()),
      original_(browser->GetWeakPtr()),
      original_document_(browser->GetTabStripModel()->GetActiveWebContents()
                             ->GetPrimaryMainFrame()->GetWeakDocumentPtr()) {}
NativeStockWarmOwner::~NativeStockWarmOwner() = default;
std::unique_ptr<NativeStockWarmOwner> NativeStockWarmOwner::RetainOriginal(
    NativeStartupLaunchReceipt original, BrowserWindowInterface* browser) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (!NativeStartupObservationEnabled() || !original.lease || !original.lease->Validate() ||
      original.browser_pid != getpid() || !browser || !browser->GetProfile() ||
      browser->GetProfile()->IsOffTheRecord() || !browser->GetTabStripModel()) return nullptr;
  auto* contents = browser->GetTabStripModel()->GetActiveWebContents();
  auto* frame = contents ? contents->GetPrimaryMainFrame() : nullptr;
  if (!frame || !frame->IsRenderFrameLive()) return nullptr;
  const auto browser_weak = browser->GetWeakPtr();
  const auto document = frame->GetWeakDocumentPtr();
  auto process = ReadNativeProcessFootprint(getpid());
  if (!process || process->pid != getpid() || !browser_weak || !document.AsRenderFrameHostIfValid() ||
      browser_weak->GetTabStripModel()->GetActiveWebContents() != contents ||
      contents->GetPrimaryMainFrame() != document.AsRenderFrameHostIfValid() ||
      !original.lease->Validate()) return nullptr;
  auto owner = std::unique_ptr<NativeStockWarmOwner>(new NativeStockWarmOwner(
      std::move(original), browser_weak.get(), std::move(*process)));
  return owner->BeforeCreation() ? std::move(owner) : nullptr;
}
bool NativeStockWarmOwner::Lifetime() const {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (!NativeStartupObservationEnabled() || !receipt_.lease || !receipt_.lease->Validate() ||
      !original_ || !original_->GetProfile() || original_->GetProfile()->IsOffTheRecord() ||
      original_->GetType() != BrowserWindowInterface::TYPE_NORMAL || !original_->GetTabStripModel() ||
      original_->GetProfile()->GetPath().DirName() != base::FilePath(
          base::CommandLine::ForCurrentProcess()->GetSwitchValueASCII("user-data-dir"))) return false;
  auto* contents = original_->GetTabStripModel()->GetActiveWebContents();
  auto* frame = original_document_.AsRenderFrameHostIfValid();
  if (!contents || !frame || !frame->IsRenderFrameLive() ||
      contents->GetPrimaryMainFrame() != frame) return false;
  const auto now = ReadNativeProcessFootprint(getpid());
  return now && now->pid == process_.pid && now->process_uuid == process_.process_uuid &&
      now->process_start_absolute == process_.process_start_absolute && original_ &&
      original_document_.AsRenderFrameHostIfValid() == frame && receipt_.lease->Validate();
}
bool NativeStockWarmOwner::Inventory(bool with_created) const {
  if (!original_ || (with_created && !created_)) return false;
  size_t count = 0; bool valid = true, original_seen = false, created_seen = false;
  ForEachCurrentBrowserWindowInterfaceOrderedByActivation(
      [&](BrowserWindowInterface* actual) {
        ++count;
        if (actual == original_.get()) original_seen = true;
        else if (with_created && actual == created_.get()) created_seen = true;
        else valid = false;
        return true;
      });
  return valid && original_seen && count == (with_created ? 2u : 1u) &&
      (!with_created || (created_seen && created_ && created_->GetProfile() == original_->GetProfile() &&
       created_->GetType() == BrowserWindowInterface::TYPE_NORMAL));
}
bool NativeStockWarmOwner::BeforeCreation() const { return !created_attempted_ && Lifetime() && !created_ && Inventory(false) && Lifetime(); }
bool NativeStockWarmOwner::BindCreated(BrowserWindowInterface* actual_returned) {
  if (std::exchange(created_attempted_, true) || !Lifetime() || !actual_returned ||
      actual_returned == original_.get() || actual_returned->GetType() != BrowserWindowInterface::TYPE_NORMAL ||
      actual_returned->GetProfile() != original_->GetProfile()) return false;
  created_ = actual_returned->GetWeakPtr();
  if (!DuringCreation()) { created_.reset(); return false; }
  return true;
}
bool NativeStockWarmOwner::DuringCreation() const {
  return created_ && original_ && Lifetime() &&
      created_->GetProfile() == original_->GetProfile() &&
      created_->GetType() == BrowserWindowInterface::TYPE_NORMAL &&
      (Inventory(false) || Inventory(true)) && Lifetime();
}
bool NativeStockWarmOwner::WithCreated() const { return Lifetime() && Inventory(true) && Lifetime(); }
base::WeakPtr<BrowserWindowInterface> NativeStockWarmOwner::original_browser() const { return original_; }
base::WeakPtr<BrowserWindowInterface> NativeStockWarmOwner::created_browser() const { return created_; }
const NativeStartupLaunchReceipt& NativeStockWarmOwner::original_launch() const { return receipt_; }
const NativeProcessFootprint& NativeStockWarmOwner::original_process() const { return process_; }
int NativeStockWarmOwner::original_browser_window_id() const { return original_browser_window_id_; }
}  // namespace aux
#endif
